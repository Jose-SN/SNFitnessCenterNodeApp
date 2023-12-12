const express = require("express");
const smsRouter = express.Router();
const axios = require('axios');

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
      const options = {
        method: 'POST',
        url: 'https://telesign-telesign-send-sms-verification-code-v1.p.rapidapi.com/sms-verification-code',
        params: {
          phoneNumber: bodyData.phoneNumber,
          text: bodyData.text
        },
        headers: {
          'X-RapidAPI-Key': 'SIGN-UP-FOR-KEY',
          'X-RapidAPI-Host': 'telesign-telesign-send-sms-verification-code-v1.p.rapidapi.com'
        }
      };
      const response = await axios.request(options);
      console.log(response.data);
      resolve(response.data);
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
};

module.exports = { smsRouter, sendSMS };
