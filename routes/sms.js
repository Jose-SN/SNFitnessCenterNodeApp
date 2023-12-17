const express = require("express");
const smsRouter = express.Router();
const axios = require('axios');
// const fast2sms = require('fast-two-sms')
var unirest = require("unirest");
var req = unirest("POST", "https://www.fast2sms.com/dev/bulkV2");
const API_KEY_FAST2SMS = process.env.API_KEY_FAST2SMS;

smsRouter.post("/send", async (req, res) => {
  const bodyData = req.body;
  sendSMS(bodyData)
    .then((data) => {
      res.status(200).json({
        success: true,
        message: "successfully send sms",
        data: data,
      });
    })
    .catch((err) => {
      res.status(400).send(err);
    });
  

});

const sendSMS = function (bodyData) {
  return new Promise(async (resolve, reject) => {
    try {
      req.headers({
        "authorization": API_KEY_FAST2SMS
      });
      
      req.form({
        "message": bodyData.text,
        "language": "english",
        "route": "q",
        "numbers": bodyData.phoneNumber,
      });
      
      req.end(function (res) {
        if (res.error) {
          console.log(res.body.message);
          reject(res.body);
        } else {
          resolve(res.body);
        }
      });
      // var options = {
      //   authorization : API_KEY_FAST2SMS, 
      //   message : bodyData.text,  
      //   route: "q",
      //   numbers : [bodyData.phoneNumber]
      // } 

      // await fast2sms.sendMessage(options).then(response=>{
      //   console.log(response)
      //   resolve(response.data);
      // }).catch((error)=>{
      //   console.error(error);
      //   reject(error);
      // });
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
};

module.exports = { smsRouter, sendSMS };
