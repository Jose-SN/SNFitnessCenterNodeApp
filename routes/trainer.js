const express = require("express");
const trainerRouter = express.Router();
const path = require("path");
const fs = require("fs");
const admin = require("firebase-admin");
var db = admin.database();
var userRef = db.ref("trainers");

trainerRouter.get("/get", (req, res) => {
  getTrainerData()
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

trainerRouter.post("/save", (req, res) => {
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

trainerRouter.put("/update", (req, res) => {
  const bodyData = req.body;
  userRef
    .orderByChild("trainerid")
    .equalTo(bodyData.trainerid)
    .once("value")
    .then(function (snapshot) {
      snapshot.forEach((childSnapshot) => {
        //remove each child
        let val = childSnapshot.val();
        if (val.trainerid == bodyData.trainerid) {
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

trainerRouter.delete("/delete", (req, res) => {
  let trainerId = req.query.id;
  trainerId = typeof trainerId === "string" ? +trainerId : trainerId;
  userRef
    .orderByChild("trainerid")
    .equalTo(trainerId)
    .once("value")
    .then(function (snapshot) {
      if (snapshot.val() == null) {
        res.status(400).json({
          success: true,
          message: "something went wrong. please contact admin",
        });
      }
      snapshot.forEach((childSnapshot) => {
        //remove each child
        let val = childSnapshot.val();
        if (val.trainerid == trainerId) {
          userRef.child(childSnapshot.key).remove();
          res.status(200).json({
            success: true,
            message: "successfully deleted",
          });
        }
      });
    });
});

const getTrainerData = function () {
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

module.exports = { trainerRouter, getTrainerData };
