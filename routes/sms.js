const express = require("express");
const smsRouter = express.Router();
const axios = require('axios');
const fast2sms = require('fast-two-sms')
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
      var options = {
        authorization : API_KEY_FAST2SMS, 
        message : bodyData.text,  
        numbers : [bodyData.phoneNumber]
      } 

      await fast2sms.sendMessage(options).then(response=>{
        console.log(response)
        resolve(response.data);
      }).catch((error)=>{
        console.error(error);
        reject(error);
      });
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
};

module.exports = { smsRouter, sendSMS };
