const express = require("express");
const axios = require("axios");
require("dotenv").config();
const stripe = require("stripe")(process.env.SECRET_KEY);
const price_id = process.env.PRICE_ID;
const payrouter = express.Router();

const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Role = db.role;

const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

const getPaymentStatusAndExpirationDate = async (subscriptionId) => {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const paymentStatus = subscription.status;
    const expireDate = new Date(subscription.current_period_end * 1000); // Convert timestamp to Date object

    return {
      paymentStatus,
      expireDate
    };
  } catch (error) {
    throw error;
  }
};

exports.allAccess = (req, res) => {
  res.status(200).send("Public Content.");
};

exports.check = async (req, res) => {
  const subscriptionID = req.body.subscriptionID;
  const id = req.params.id;
  getPaymentStatusAndExpirationDate(subscriptionID)
    .then((result) => {
      updateData = {
        expireDate: result.expireDate
      };
      User.update(updatedata, {
        where: { id: id }
      })
        .then((num) => {
          if (num == 1) {
            User.findOne({
              where: {
                id: id
              }
            })
              .then((user) => {
                if (user) {
                  var token = jwt.sign({ id: user.id }, config.secret, {
                    expiresIn: 86400 // 24 hours
                  });
                  var authorities = [];
                  // const expireday = data.expiredate - Date.now()
                  user.getRoles().then((roles) => {
                    for (let i = 0; i < roles.length; i++) {
                      authorities.push("ROLE_" + roles[i].name.toUpperCase());
                    }
                    var expiredays =
                      (user.expiredate - Date.now()) / (3600 * 24 * 1000);
                    res.status(200).send({
                      id: user.id,
                      username: user.username,
                      email: user.email,
                      expiredays: expiredays,
                      roles: authorities,
                      subscriptionId: user.subscriptionId,
                      subscriptionStatus: user.subscriptionStatus,
                      expireDate: user.expireDate,
                      accessToken: token
                    });
                  });
                } else {
                  res.status(404).send({
                    message: `Cannot find user with id=${id}.`
                  });
                }
              })
              .catch((err) => {
                res.status(500).send({
                  message: "Error retrieving user with id=" + id
                });
              });
          } else {
            res.send({
              message: `Cannot update user with id=${id}. Maybe user was not found or req.body is empty!`
            });
          }
        })
        .catch((err) => {
          res.status(500).send({
            message: "Error updating user with id=" + id
          });
        });
    })
    .catch((error) => {
      console.log(error.raw.message);
      res.status(500).send({
        message: error.raw.message
      });
    });
};

exports.cancel = async (req, res) => {
  const id = req.params.id;
  const SUBSCRIPTION_ID = req.body.SUBSCRIPTION_ID;
  stripe.subscriptions
    .cancel(SUBSCRIPTION_ID)
    .then((cancelledSubscription) => {
      // Handle success
      const updateData = {
        subscriptionStatus: cancelledSubscription.status
      };
      User.update(updateData, {
        where: { id: id }
      })
        .then((num) => {
          if (num == 1) {
            User.findOne({
              where: {
                id: id
              }
            })
              .then((user) => {
                console.log(user);
                if (user) {
                  var token = jwt.sign({ id: user.id }, config.secret, {
                    expiresIn: 86400 // 24 hours
                  });
                  var authorities = [];
                  // const expireday = data.expiredate - Date.now()
                  user.getRoles().then((roles) => {
                    for (let i = 0; i < roles.length; i++) {
                      authorities.push("ROLE_" + roles[i].name.toUpperCase());
                    }
                    var expiredays =
                      (user.expiredate - Date.now()) / (3600 * 24 * 1000);
                    res.status(200).send({
                      id: user.id,
                      username: user.username,
                      email: user.email,
                      expiredays: expiredays,
                      roles: authorities,
                      subscriptionId: user.subscriptionId,
                      subscriptionStatus: user.subscriptionStatus,
                      expireDate: user.expireDate,
                      accessToken: token
                    });
                  });
                } else {
                  res.status(404).send({
                    message: `Cannot find user with id=${id}.`
                  });
                }
              })
              .catch((err) => {
                res.status(500).send({
                  message: "Error retrieving user with id=" + id
                });
              });
          } else {
            res.send({
              message: `Cannot update user with id=${id}. Maybe user was not found or req.body is empty!`
            });
          }
        })
        .catch((err) => {
          res.status(500).send({
            message: "Error updating user with id=" + id
          });
        });
    })
    .catch((error) => {
      // Handle error
      res.status(404).send({
        message: error.type
      });
    });
};
