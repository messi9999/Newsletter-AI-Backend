const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Role = db.role;

const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = (req, res) => {
  const currentDate = new Date();
  const expireDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  const isPayment = false;
  const cardemail = req.body.email;
  const cardnumber = "1234 1234 1234 1234";
  const exp = new Date();
  const cvc = "Null";
  const country = "Null";

  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");

  const formattedDate = `${year}-${month}-${day}`;

  User.create({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
    isPayment: isPayment,
    expiredate: expireDate,
    cardemail: cardemail,
    cardnumber: cardnumber,
    exp: formattedDate,
    cvc: cvc,
    country: country
  })
    .then((user) => {
      if (req.body.roles) {
        Role.findAll({
          where: {
            name: {
              [Op.or]: req.body.roles
            }
          }
        }).then((roles) => {
          user.setRoles(roles).then(() => {
            res.send({ message: "User was registered successfully!" });
          });
        });
      } else {
        // user role = 1
        user.setRoles([1]).then(() => {
          res.send({ message: "User was registered successfully!" });
        });
      }
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.signin = (req, res) => {
  User.findOne({
    where: {
      username: req.body.username
    }
  })
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!"
        });
      }

      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400 // 24 hours
      });

      var authorities = [];
      user.getRoles().then((roles) => {
        for (let i = 0; i < roles.length; i++) {
          authorities.push("ROLE_" + roles[i].name.toUpperCase());
        }
        var expiredays = (user.expiredate - Date.now()) / (1000 * 3600 * 24);
        if (expiredays < 0) {
          expiredays = 0;
        }
        res.status(200).send({
          id: user.id,
          username: user.username,
          email: user.email,
          expiredays: Math.ceil(expiredays),
          roles: authorities,
          isPayment: user.isPayment,
          cardemail: user.cardemail,
          cardnumber: user.cardnumber,
          exp: user.exp,
          cvs: user.cvc,
          coutry: user.country,
          accessToken: token,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          expiredate: user.expiredate
        });
      });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};
