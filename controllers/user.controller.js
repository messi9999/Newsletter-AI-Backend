const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Role = db.role;
const Op = db.Sequelize.Op;

exports.allAccess = (req, res) => {
  res.status(200).send("Public Content.");
};

exports.userBoard = (req, res) => {
  const id = req.params.id;
  console.log(id);

  User.findByPk(id)
    .then((data) => {
      if (data) {
        // const expireday = data.expiredate - Date.now()
        data.dataValues.expireday =
          (data.expiredate - Date.now()) / (3600 * 24 * 1000);
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Tutorial with id=${id}.`
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Tutorial with id=" + id
      });
    });
  // res.status(200).send("User Content.");
};

exports.updateExpireDay = (req, res) => {
  const id = req.params.id;
  console.log(id);
  var updatedata = { expiredate: Date.now() };
  User.findByPk(id).then((user) => {
    const remainday = user.expiredate - Date.now();
    if (remainday < 0) {
      updatedata.expiredate = Date.now() + 4 * 7 * 24 * 3600 * 1000;
    } else {
      updatedata.expiredate = remainday + Date.now() + 4 * 7 * 24 * 3600 * 1000;
    }
    User.update(updatedata, {
      where: { id: id }
    })
      .then((num) => {
        if (num == 1) {
          res.send({
            message: "success"
          });
        } else {
          res.send({
            message: `Cannot update Tutorial with id=${id}. Maybe Tutorial was not found or req.body is empty!`
          });
        }
      })
      .catch((err) => {
        res.status(500).send({
          message: "Error updating Tutorial with id=" + id
        });
      });
  });
};

exports.adminBoard = (req, res) => {
  res.status(200).send("Admin Content.");
};
