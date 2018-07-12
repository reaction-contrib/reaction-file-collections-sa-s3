import S3 from "aws-sdk/clients/s3";
import { Readable, Writable } from "stream";
import StorageAdapter from "@reactioncommerce/file-collections-sa-base";
import debug from "./debug";

export default class S3Store extends StorageAdapter {
  constructor({
    collectionPrefix = "fc_sa_s3.",
    db,
    fileKeyMaker,
    mongodb,
    name,
    transformRead,
    transformWrite
  } = {}) {
    super({
      fileKeyMaker,
      name,
      transformRead,
      transformWrite
    });
    
    this.s3 = new S3({
      apiVersion: "2006-03-01",
      region: process.env.AWS_S3_REGION
    });

    this.collectionName = `${collectionPrefix}${name}`.trim();
  }

  _fileKeyMaker(fileRecord) {
    const info = fileRecord.infoForCopy(this.name);
    const result = {
      _id: info.key || null,
      filename: info.name || fileRecord.name() || `${fileRecord.collectionName}-${fileRecord._id}`,
      size: info.size
    };

    debug("S3Store _fileKeyMaker result:", result);

    return result;
  }

  /**
   * This retrieves objects from S3 and sends them to reaction-file-collections as a readable stream.
   * The whole point of using S3 being hitting your content's URLs, either directly or through a CDN,
   * this might not be what you're looking for. It's there to preserve reaction-file-collection's default
   * behavior.
   */
  async _getReadStream(fileKey, { start: startPos, end: endPos } = {}) {
    debug("S3Store _getReadStream");

    const opts = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileKey._id
    };

    // Add range if this should be a partial read
    if (typeof startPos === "number" && typeof endPos === "number") {
      opts.Range = `bytes=${startPos}-${endPos}`;
    }

    debug("S3Store _getReadStream opts:", opts);

    const object = await this.s3.getObject(opts).promise();

    debug("S3Store _getReadStream got object:", object);

    let totalTransferredData = 0;

    const stream = new Readable({
      read: (size) => {
        const body = object.Body.slice(startPos || 0, endPos || fileKey.size);

        totalTransferredData += size;

        debug(`S3Store _getReadStream transferred ${totalTransferredData}`);

        stream.push(body);

        if ((typeof endPos && totalTransferredData >= endPos) || totalTransferredData >= fileKey.size) {
          debug("S3Store _getReadStream ending stream");
          stream.push(null);
        }
      }
    });

    return stream;
  }

  async _getWriteStream(fileKey, options = {}) {
    const opts = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `${Date.now()}-${fileKey.filename}`
    };

    debug("S3Store _getWriteStream opts:", opts);
    debug("S3Store _getWriteStream options:", options);
    debug("S3Store _getWriteStream fileKey:", fileKey);

    let uploadId = "";

    const uploadData = await this.s3.createMultipartUpload(opts).promise();

    debug("s3.createMultipartUpload data:", uploadData);

    if (uploadData.UploadId === undefined) {
      debug(`Couldn't get upload ID from S3`);
      return;
    }
    
    uploadId = uploadData.UploadId;

    let partNumber = 1;
    let totalFileSize = 0;
    const parts = [];

    const writeStream = new Writable({
      write: async (chunk, encoding, callback) => {
        const partData = await this.s3.uploadPart({
          ...opts,
          Body: chunk,
          UploadId: uploadId,
          PartNumber: partNumber
        }).promise();
        
        parts.push({
          ETag: partData.ETag,
          PartNumber: partNumber
        });

        debug(`Part ${partNumber} successfully uploaded`, parts);
        
        partNumber += 1;
        totalFileSize += chunk.length;

        callback();
      }
    }); 
    
    writeStream.on("finish", async () => {
      debug("S3Store writeStream finish");

      const uploadedFile = await this.s3.completeMultipartUpload({
        ...opts,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: parts
        }
      }).promise();

      debug("S3 mutipart upload completed", uploadedFile);

      // Emit end and return the fileKey, size, and updated date
      writeStream.emit("stored", {
        // Set the generated _id so that we know it for future reads and writes.
        // We store the _id as a string and only convert to ObjectID right before
        // reading, writing, or deleting.
        fileKey: uploadedFile.Key,
        storedAt: new Date(),
        size: totalFileSize
      });
    });

    return writeStream;
  }

  _removeFile(fileKey) {
    debug("S3Store _removeFile called for fileKey", fileKey);
    if (!fileKey._id) return Promise.resolve();

    return new Promise((resolve, reject) => {
      this.s3.deleteObject({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: fileKey._id
      }, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  typeName = "s3";
}
