const db = require("../models");
const User = db.user;
const Op = db.Sequelize.Op;

exports.updatePaymentStatus = (req, res) => {
  const email = req.email;

  const updatedata = {
    subscriptionStatus: "deactive"
  };
  User.update(updatedata, {
    where: { email: email }
  }).then((num) => {
    if (num == 1) {
      res.send({
        message: ""
      });
    }
  });
};
