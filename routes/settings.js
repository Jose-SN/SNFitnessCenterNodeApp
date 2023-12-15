const express = require("express");
const settingsRouter = express.Router();
const path = require("path");
const fs = require("fs");
const admin = require("firebase-admin");
var db = admin.database();
var userRef = db.ref("settings");

settingsRouter.get("/get", (req, res) => {
  getSettingsData()
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

settingsRouter.put("/update", (req, res) => {
  const bodyData = req.body;
  userRef.update(bodyData).then(() => {
    // Data saved successfully!
    res.status(200).json({
      success: true,
      message: "successfully updated"
    });
  })
  .catch((error) => {
    // The write failed...
    res.status(400).send(err);
  });;
  // userRef
  //   .then(function (snapshot) {
  //     snapshot.forEach((childSnapshot) => {
  //       //remove each child
  //       let val = childSnapshot.val();
  //       if (val.settingsid == bodyData.settingsid) {
  //         userRef.child(childSnapshot.key).remove();
  //         userRef.push(bodyData, (err) => {
  //           if (err) {
  //             res.status(400).send(err);
  //           } else {
  //             res.status(200).json({
  //               success: true,
  //               message: "successfully updated"
  //             });
  //           }
  //         });
  //       }
  //     });
  //   });
});


const getSettingsData = function () {
  return new Promise((resolve, reject) => {
    try {
      userRef.once("value", function (snap) {
        let data = {};
        data = snap.val();
        // if (Array.isArray(snap.val())) {
        // } else if (snap.val() &&
        //   typeof snap.val() == "object" &&
        //   Object.values(snap.val()).length
        // ) {
        //   data = Object.values(snap.val());
        // }
        resolve(data);
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { settingsRouter, getSettingsData };
