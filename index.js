const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const CronJob = require('cron').CronJob;
const port = 3000;
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Pass to next layer of middleware
  next();
});

const admin = require("firebase-admin");
var serviceAccount = require("./sn-fitness-firebase-key.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://sn-fitness-default-rtdb.firebaseio.com",
  authDomain: "sn-fitness.firebaseapp.com",
});

const { memberRouter } = require("./routes/member");
const { trainerRouter } = require("./routes/trainer");
const { smsRouter } = require("./routes/sms");
const { paymentRouter } = require("./routes/payment");
const { dashboardRouter } = require("./routes/dashboard");
const { categoryRouter } = require("./routes/category");
const { settingsRouter } = require("./routes/settings");
const { findDueMembers } = require("./routes/cronjob");
const { fileRouter } = require("./routes/file");

app.use("/member", memberRouter);
app.use("/trainer", trainerRouter);
app.use("/payment", paymentRouter);
app.use("/category", categoryRouter);
app.use("/dashboard", dashboardRouter);
app.use("/file", fileRouter);
app.use("/sms", smsRouter);
app.use("/settings", settingsRouter);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

new CronJob('00 00 00 * * *', function() {
  /*
   * Runs every day
   * at 00:00:00 AM. 
   */
   // DO SOMETHING
   findDueMembers();
  }, function () {
    /* This function is executed when the job stops */
  },
  true /* Start the job right now */
);

// YOUR_BASE_DIRECTORY/netlify/functions/api.ts

import serverless from "serverless-http";

const router = Router();
router.get("/hello", (req, res) => res.send("Hello World!"));

app.use("/api/", router);

export const handler = serverless(app);
