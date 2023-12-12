const express = require("express");

const { getMemberData } = require("./member");
const { sendSMS } = require("./sms");
const { getSettingsData } = require("./settings");
const { getPaymentData } = require("./payment");
const { getDueMembers } = require("./dashboard");


function findDueMembers() {
  dueMembers = [];
  Promise.all([getMemberData(), getPaymentData()])
  .then((values) => {
    const [members, payments] = values;
    const filteredMemberList = getDueMembers(members, payments);
    if (Array.isArray(filteredMemberList) && filteredMemberList.length) {
      filteredMemberList.forEach(element => {
        const lastdata = element.payments.at(-1);
        if(lastdata) {
          element.lastpaymentdate = lastdata.dateofpayment;
          element.expectedpaymentdate = lastdata.nextpaymentdate;
          var diff = new Date(lastdata.nextpaymentdate).getTime() - new Date().getTime();
          var diffDays = diff / (1000 * 60 * 60 * 24);   
          if(diffDays == 0 && new Date().getDate() === new Date().getDate(lastdata.nextpaymentdate)) {
            element.status = 'Due';
            element.diffDays = Math.round(diffDays);
          }
        }
      });
    }
    dueMembers = filteredMemberList.filter(el=> ['Due'].includes(el.status));
    sendMsgToDueMembers(dueMembers);
  })
}

function sendMsgToDueMembers(dueMembers) {
  getSettingsData().then(data=>{
    dueMembers.forEach(member=>{
      sendSMS({phoneNumber: member.contact, text: data.smscontent}).then(data=>{
        console.log('successfully send sms')
      });
    })
  })
}

module.exports = { findDueMembers };
