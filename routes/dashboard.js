const express = require("express");
const dashboardRouter = express.Router();
const path = require("path");
const fs = require("fs");
const member = require("./member");
const { getMemberData } = require("./member");
const { getPaymentData } = require("./payment");

dashboardRouter.get("/card", (req, res) => {
  Promise.all([getMemberData(), getPaymentData()])
    .then((values) => {
      const [members, payments] = values;
      const totalrevenue = payments.reduce(
        (total, item) => item.feeamount + total,
        0
      );
      const monthlyrevenue = payments.reduce((total, item) => {
        if (
          new Date().getMonth() == new Date(item.dateofpayment).getMonth() &&
          new Date().getFullYear() == new Date(item.dateofpayment).getFullYear()
        ) {
          total += item.feeamount;
        }
        return total;
      }, 0);
      const filteredMemberList = getDueMembers(members, payments);
      let duemembers = filteredMemberList.filter(item=> item.due);
      let paidmembers = filteredMemberList.length - duemembers.length;
      const data = {
        totalmembers: members.length,
        totalrevenue: totalrevenue,
        monthlyrevenue: monthlyrevenue,
        duemembers: duemembers.length,
        paidmembers: paidmembers,
      };

      res.header("Content-Type", "application/json");
      res.send(JSON.stringify(data));
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

dashboardRouter.get("/memberpayments", (req, res) => {
  Promise.all([getMemberData(), getPaymentData()])
    .then((values) => {
      const [members, payments] = values;
      const filteredMemberList = getDueMembers(members, payments);

      res.header("Content-Type", "application/json");
      res.send(JSON.stringify(filteredMemberList));
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

const getDueMembers = function (members = [], payments = []) {
  const filteredItems = members.reduce((acc, item) => {
    let membPayment = payments
      .filter((pay) => item.memberid == pay.memberid)
      .sort(function (a, b) {
        return a.dateofpayment < b.dateofpayment ? -1 : a.dateofpayment > b.dateofpayment ? 1 : 0;
      });
      if (membPayment.length > 0) {
        let lastItem = membPayment.at(-1);
        let lastpaymentfor = +lastItem.paymentFor || 30;
        let nextpaymentdate = lastItem.nextpaymentdate || addDays(lastItem.dateofpayment, lastpaymentfor).toISOString()
        item.due = new Date().toISOString() >= nextpaymentdate;
      } else {
        item.due = false;
      }
    item.payments = membPayment;
    acc.push(item);
    return acc;
  }, []);

  return filteredItems;
};

const addDays = function(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
module.exports = { dashboardRouter, getDueMembers };
