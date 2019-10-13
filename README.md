# reaction-file-collections-sa-s3

An AWS S3 adapter for reaction-file-collections, brought to you by out:grow.

[Read the reaction-file-collections docs](https://github.com/reactioncommerce/reaction-file-collections)

## Installation

Get this package from NPM using the following command:

```bash
npm install reaction-file-collections-sa-s3
```

## Configuration

Set up your AWS S3 credentials using environment variables:

```bash
# The AWS region your S3 bucket is in
AWS_S3_REGION=us-east-1

# Name of the S3 bucket you want to store your media in
AWS_S3_BUCKET=reaction-media

# An AWS access key with the appropriate S3 permissions
AWS_ACCESS_KEY_ID=QWERTYUIOPASDFGH

# The secret access key that goes with the access key
AWS_SECRET_ACCESS_KEY=<secret_key>
```

## Usage

In your Reaction Commerce back-end code, open `/imports/plugins/core/files/server/no-meteor/setUpFileCollections.js`.

Replace usages of `GridFSStore` with `S3Store`, starting from the import: `import S3Store from "@reactioncommerce/file-collections-sa-s3";`.

When replacing the `GridFSStore` constructor with the `S3Store` one, make sure to pass the following options:

```javascript
new S3Store({
  name, // Should be provided within buildGFS
  isPublic: true,
  objectACL: "public-read",
  async transformWrite(fileRecord) {
    // Either write your custom transformation code here, or re-use the one from the GridFSStore constructor
  }
})
```

## Help

Need help integrating this plugin into your Reaction Commerce project? Simply looking for expert [Reaction Commerce consultants](https://outgrow.io/reaction-commerce-help)? Want someone to train your team to use Reaction at its fullest?

Whether it is just a one-hour consultation to get you set up or helping your team ship a whole project from start to finish, you can't go wrong by reaching out to us:

* +1 (281) OUT-GROW
* contact@outgrow.io

## Contributing

Pull Requests, Issues and Feature Requests are welcome!

