
import mail from "nodemailer";
module.exports = (app) => {
    app.AWS = require("aws-sdk");
    app.s3 = require("s3-upload-stream");
    app.AWS.config.update(app.awsKey);
    app.s3.client(new app.AWS.S3());

    app.emailTransport = mail.createTransport(app.emailTransport);
};
