const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
require('aws-sdk/lib/maintenance_mode_message').suppress = true;

const accessId = process.env.AWS_ACCESS_KEY;
const secretKey = process.env.AWS_SECRET_ACCESS_KEY;
const region = process.env.AWS_REGION;

aws.config.update({
  accessKeyId: accessId,
  secretAccessKey: secretKey,
  region: region,
});

const s3 = new aws.S3();

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET,
    metadata: function(request, file, cb) {
      cb(null, {fieldname: file.fieldname});
    },
    key: function(request, file, cb) {
      cb(null, Date.now().toString()+'-'+file.originalname);
      console.log('file uploaded successfully');
    },
  }),
});

module.exports = upload;
