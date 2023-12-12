const express = require("express");
const paymentRouter = express.Router();
const path = require("path");
const fs = require("fs");
const admin = require("firebase-admin");
var db = admin.database();
var userRef = db.ref("payments");

paymentRouter.get("/get", (req, res) => {
  getPaymentData()
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

paymentRouter.post("/save", (req, res) => {
  const bodyData = req.body;
  userRef.push(bodyData, (err) => {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).json({
        success: true,
        message: "successfully added",
        data: bodyData,
      });
    }
  });
});

paymentRouter.put("/update", (req, res) => {
  const bodyData = req.body;
  userRef
    .orderByChild("paymentid")
    .equalTo(bodyData.paymentid)
    .once("value")
    .then(function (snapshot) {
      snapshot.forEach((childSnapshot) => {
        //remove each child
        let val = childSnapshot.val();
        if (val.paymentid == bodyData.paymentid) {
          userRef.child(childSnapshot.key).remove();
          userRef.push(bodyData, (err) => {
            if (err) {
              res.status(400).send(err);
            } else {
              res.status(200).json({
                success: true,
                message: "successfully updated",
                data: bodyData,
              });
            }
          });
        }
      });
    });
});

paymentRouter.delete("/delete", (req, res) => {
  let paymentId = req.query.id;
  paymentId = typeof paymentId === "string" ? +paymentId : paymentId;
  userRef
    .orderByChild("paymentid")
    .equalTo(paymentId)
    .once("value")
    .then(function (snapshot) {
      snapshot.forEach((childSnapshot) => {
        //remove each child
        let val = childSnapshot.val();
        if (val.paymentid == paymentId) {
          userRef.child(childSnapshot.key).remove();
          res.status(200).json({
            success: true,
            message: "successfully deleted",
          });
        }
      });
    });
});

const getPaymentData = function () {
  return new Promise((resolve, reject) => {
    try {
      userRef.once("value", function (snap) {
        let data = [];
        if (Array.isArray(snap.val())) {
          data = snap.val();
        } else if (
          typeof snap.val() == "object" &&
          Object.values(snap.val()).length
        ) {
          data = Object.values(snap.val());
        }
        resolve(data);
      });
    } catch (error) {
      reject(error);
    }
  });
};

const writeMemberData = function (filepath, fileData) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filepath, JSON.stringify(fileData), (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
};

module.exports = { paymentRouter, getPaymentData };
