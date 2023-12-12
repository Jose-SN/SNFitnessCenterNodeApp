const express = require("express");
const categoryRouter = express.Router();
const path = require("path");
const fs = require("fs");
const admin = require("firebase-admin");
var db = admin.database();
var userRef = db.ref("categories");

categoryRouter.get("/get", (req, res) => {
  getCategoryData()
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

categoryRouter.post("/save", (req, res) => {
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

categoryRouter.put("/update", (req, res) => {
  const bodyData = req.body;
  userRef
    .orderByChild("categoryid")
    .equalTo(bodyData.categoryid)
    .once("value")
    .then(function (snapshot) {
      snapshot.forEach((childSnapshot) => {
        //remove each child
        let val = childSnapshot.val();
        if (val.categoryid == bodyData.categoryid) {
          userRef.child(childSnapshot.key).remove();
          userRef.push(bodyData, (err) => {
            if (err) {
              res.status(400).send(err);
            } else {
              res.status(200).json({
                success: true,
                message: "successfully updated"
              });
            }
          });
        }
      });
    });
});

categoryRouter.delete("/delete", (req, res) => {
  let categoryid = req.query.id;
  categoryid = typeof(categoryid) === 'string' ? +categoryid : categoryid;
  userRef
    .orderByChild("categoryid")
    .equalTo(categoryid)
    .once("value")
    .then(function (snapshot) {
      snapshot.forEach((childSnapshot) => {
        //remove each child
        let val = childSnapshot.val();
        if (val.categoryid == categoryid) {
          userRef.child(childSnapshot.key).remove();
          res.status(200).json({
            success: true,
            message: "successfully deleted"
          });
        }
      });
    });
});

const getCategoryData = function () {
  return new Promise((resolve, reject) => {
    try {
      userRef.once("value", function (snap) {
        let data = [];
        if (Array.isArray(snap.val())) {
          data = snap.val();
        } else if (snap.val() &&
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

module.exports = { categoryRouter, getCategoryData };
