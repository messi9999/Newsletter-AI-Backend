const express = require("express");
const axios = require("axios");
const db = require("../models");
const User = db.user;
const Op = db.Sequelize.Op;

require("dotenv").config();

const stripe = require("stripe")(process.env.SECRET_KEY);
const price_id = process.env.PRICE_ID;
const payrouter = express.Router();

payrouter.post("/cancel", async (req, res) => {
  const SUBSCRIPTION_ID = req.body.currentUser.subscriptionId;
  stripe.subscriptions
    .cancel(SUBSCRIPTION_ID)
    .then((cancelledSubscription) => {
      // Handle success
      res.status(201).send({
        result: cancelledSubscription.status
      });
    })
    .catch((error) => {
      // Handle error
      res.status(404).send({
        result: error
      });
    });

  const id = req.body.currentUser.id;
  updatedata = {
    subscriptionId: SUBSCRIPTION_ID,
    subscriptionStatus: "canceled"
  };
  User.update(updatedata, {
    where: { id: id }
  });
});

module.exports = payrouter;
