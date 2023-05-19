const express = require("express");
const axios = require("axios");

require("dotenv").config();

const payRouter = express.Router();

payRouter.post("/", async (req, res) => {
  const payment_method = req.body.payment_method;
  switch (payment_method) {
    case "stripe":
      const stripe = require("stripe")(process.env.STRIPE_API_KEY);
  }
});
