"use strict";Object.defineProperty(exports, "__esModule", { value: true });var _promise = require("babel-runtime/core-js/promise");var _promise2 = _interopRequireDefault(_promise);var _extends2 = require("babel-runtime/helpers/extends");var _extends3 = _interopRequireDefault(_extends2);var _regenerator = require("babel-runtime/regenerator");var _regenerator2 = _interopRequireDefault(_regenerator);var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);var _createClass2 = require("babel-runtime/helpers/createClass");var _createClass3 = _interopRequireDefault(_createClass2);var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);var _inherits2 = require("babel-runtime/helpers/inherits");var _inherits3 = _interopRequireDefault(_inherits2);var _stream = require("stream");
var _s = require("aws-sdk/clients/s3");var _s2 = _interopRequireDefault(_s);
var _fileCollectionsSaBase = require("@reactioncommerce/file-collections-sa-base");var _fileCollectionsSaBase2 = _interopRequireDefault(_fileCollectionsSaBase);
var _debug = require("./debug");var _debug2 = _interopRequireDefault(_debug);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}var

S3Store = function (_StorageAdapter) {(0, _inherits3.default)(S3Store, _StorageAdapter);
  function S3Store()






  {var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},_ref$collectionPrefix = _ref.collectionPrefix,collectionPrefix = _ref$collectionPrefix === undefined ? "fc_sa_s3." : _ref$collectionPrefix,fileKeyMaker = _ref.fileKeyMaker,name = _ref.name,objectACL = _ref.objectACL,transformRead = _ref.transformRead,transformWrite = _ref.transformWrite;(0, _classCallCheck3.default)(this, S3Store);var _this = (0, _possibleConstructorReturn3.default)(this, (S3Store.__proto__ || (0, _getPrototypeOf2.default)(S3Store)).call(this,
    {
      fileKeyMaker: fileKeyMaker,
      name: name,
      transformRead: transformRead,
      transformWrite: transformWrite }));_this.















































































































































































    typeName = "s3";_this.s3 = new _s2.default({ apiVersion: "2006-03-01", region: process.env.AWS_S3_REGION });_this.collectionName = ("" + collectionPrefix + name).trim();_this.objectACL = objectACL;return _this;}(0, _createClass3.default)(S3Store, [{ key: "_fileKeyMaker", value: function _fileKeyMaker(fileRecord) {var info = fileRecord.infoForCopy(this.name);(0, _debug2.default)("S3Store _fileKeyMaker fileRecord info:", info);(0, _debug2.default)("S3Store _fileKeyMaker fileRecord size:", fileRecord.size());var result = { _id: info.key || fileRecord._id, filename: info.name || fileRecord.name() || fileRecord.collectionName + "-" + fileRecord._id, size: info.size || fileRecord.size() };(0, _debug2.default)("S3Store _fileKeyMaker result:", result);return result;} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       * This retrieves objects from S3 and sends them to reaction-file-collections as a readable stream.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       * The whole point of using S3 being hitting your content's URLs, either directly or through a CDN,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       * this might not be what you're looking for. It's there to preserve reaction-file-collection's default
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       * behavior.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       */ }, { key: "_getReadStream", value: function () {var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(fileKey) {var _ref3 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},startPos = _ref3.start,endPos = _ref3.end;var opts, object, totalTransferredData, stream;return _regenerator2.default.wrap(function _callee$(_context) {while (1) {switch (_context.prev = _context.next) {case 0:(0, _debug2.default)("S3Store _getReadStream");opts = { Bucket: process.env.AWS_S3_BUCKET, Key: fileKey._id }; // Add range if this should be a partial read
                if (typeof startPos === "number" && typeof endPos === "number") {opts.Range = "bytes=" + startPos + "-" + endPos;}(0, _debug2.default)("S3Store _getReadStream opts:", opts);_context.next = 6;return this.s3.getObject(opts).promise();case 6:object = _context.sent;(0, _debug2.default)("S3Store _getReadStream got object:", object);totalTransferredData = 0;stream = new _stream.Readable({ read: function read(size) {(0, _debug2.default)("S3Store read body from " + totalTransferredData + " to " + (totalTransferredData + size));var body = object.Body.slice(totalTransferredData, totalTransferredData + size);totalTransferredData += size;(0, _debug2.default)("S3Store _getReadStream transferred " + totalTransferredData);stream.push(body);if (typeof endPos === "number" && totalTransferredData >= endPos || totalTransferredData >= fileKey.size) {(0, _debug2.default)("S3Store _getReadStream ending stream");stream.push(null);}} });return _context.abrupt("return", stream);case 11:case "end":return _context.stop();}}}, _callee, this);}));function _getReadStream(_x2) {return _ref2.apply(this, arguments);}return _getReadStream;}() }, { key: "_getWriteStream", value: function () {var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(fileKey) {var _this2 = this;var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};var opts, uploadId, uploadData, partNumber, totalFileSize, parts, writeStream;return _regenerator2.default.wrap(function _callee4$(_context4) {while (1) {switch (_context4.prev = _context4.next) {case 0:opts = { Bucket: process.env.AWS_S3_BUCKET, Key: Date.now() + "-" + fileKey.filename };(0, _debug2.default)("S3Store _getWriteStream opts:", opts);(0, _debug2.default)("S3Store _getWriteStream options:", options);(0, _debug2.default)("S3Store _getWriteStream fileKey:", fileKey);(0, _debug2.default)("S3Store _getWriteStream objectACL", this.objectACL);uploadId = "";_context4.next = 8;return this.s3.createMultipartUpload((0, _extends3.default)({}, opts, { ACL: this.objectACL })).promise();case 8:uploadData = _context4.sent;(0, _debug2.default)("s3.createMultipartUpload data:", uploadData);if (!(uploadData.UploadId === undefined)) {_context4.next = 12;break;}throw new Error("Couldn't get upload ID from S3");case 12:uploadId = uploadData.UploadId;partNumber = 1;totalFileSize = 0;parts = [];writeStream = new _stream.Writable({ write: function () {var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(chunk, encoding, callback) {var partData;return _regenerator2.default.wrap(function _callee2$(_context2) {while (1) {switch (_context2.prev = _context2.next) {case 0:_context2.next = 2;return _this2.s3.uploadPart((0, _extends3.default)({}, opts, { Body: chunk, UploadId: uploadId, PartNumber: partNumber })).promise();case 2:partData = _context2.sent;parts.push({ ETag: partData.ETag, PartNumber: partNumber });(0, _debug2.default)("Part " + partNumber + " successfully uploaded", parts);partNumber += 1;totalFileSize += chunk.length;callback();case 8:case "end":return _context2.stop();}}}, _callee2, _this2);}));return function write(_x6, _x7, _x8) {return _ref5.apply(this, arguments);};}() });writeStream.on("finish", (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {var uploadedFile;return _regenerator2.default.wrap(function _callee3$(_context3) {while (1) {switch (_context3.prev = _context3.next) {case 0:(0, _debug2.default)("S3Store writeStream finish");(0, _debug2.default)("S3Store writeStream totalFileSize:", totalFileSize);_context3.next = 4;return _this2.s3.completeMultipartUpload((0, _extends3.default)({}, opts, { UploadId: uploadId, MultipartUpload: { Parts: parts } })).promise();case 4:uploadedFile = _context3.sent;(0, _debug2.default)("S3 multipart upload completed", uploadedFile); // Emit end and return the fileKey, size, and updated date
                          writeStream.emit("stored", { // Set the generated _id so that we know it for future reads and writes.
                            // We store the _id as a string and only convert to ObjectID right before
                            // reading, writing, or deleting.
                            fileKey: uploadedFile.Key, storedAt: new Date(), size: totalFileSize });case 7:case "end":return _context3.stop();}}}, _callee3, _this2);})));return _context4.abrupt("return", writeStream);case 19:case "end":return _context4.stop();}}}, _callee4, this);}));function _getWriteStream(_x4) {return _ref4.apply(this, arguments);}return _getWriteStream;}() }, { key: "_removeFile", value: function _removeFile(fileKey) {var _this3 = this;(0, _debug2.default)("S3Store _removeFile called for fileKey", fileKey);if (!fileKey._id) return _promise2.default.resolve();return new _promise2.default(function (resolve, reject) {_this3.s3.deleteObject({ Bucket: process.env.AWS_S3_BUCKET, Key: fileKey._id }, function (error, result) {if (error) {reject(error);} else {resolve(result);}});});} }]);return S3Store;}(_fileCollectionsSaBase2.default);exports.default = S3Store;