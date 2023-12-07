require("dotenv").config();
var express = require("express");
var nodemailer = require("nodemailer");
var router = express.Router();
var hogan = require("hogan.js");
var fs = require("fs");
const logger = require("../config/logger");

// var smtpTransport = nodemailer.createTransport({
//   host: process.env.smtp_host,
//   port: process.env.smtp_port,
//   secure: false,
//   tls: {
//     rejectUnauthorized: false,
//   },
//   auth: {
//     user: process.env.smtp_user,
//     pass: process.env.smtp_pass,
//   },
// });

var smtpTransport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "kidsnodeoffice@gmail.com",
    pass: "rvciekpadttcvbwt",
  },
});

router.post("/sendMail", function (req, res) {
  var confirmTemplate = fs.readFileSync(
    "./providers/mail_server/templates/" + req.body.template,
    "utf-8"
  );
  var compiledTemplate = hogan.compile(confirmTemplate);
  var mailOptions = {
    from: '"OfficeNode"' + process.env.smtp_user,
    to: req.body.email,
    subject: req.body.subject,
    html: compiledTemplate.render(req.body),
  };

  smtpTransport.sendMail(mailOptions, function (error, response) {
    if (error) {
      logger.log("error", `${req.body.email}: ${error}`);
      res.send(false);
    } else {
      res.send(true);
      logger.log(
        "info",
        `Sent mail to: ${
          req.body.fields["email"] ? req.body.fields["email"] : req.body.email
        }`
      );
    }
  });
});

module.exports = router;
