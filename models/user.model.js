module.exports = (sequelize, Sequelize, DataTypes) => {
  const User = sequelize.define("users", {
    username: {
      type: Sequelize.STRING
    },
    email: {
      type: Sequelize.STRING
    },
    password: {
      type: Sequelize.STRING
    },
    isPayment: {
      type: Sequelize.BOOLEAN
    },
    expiredate: {
      type: Sequelize.DATE
    },
    cardemail: {
      type: Sequelize.STRING
    },
    cardnumber: {
      type: Sequelize.STRING
    },
    exp: {
      type: Sequelize.DataTypes.DATEONLY
    },
    cvc: {
      type: Sequelize.STRING
    },
    country: {
      type: Sequelize.STRING
    }
  });

  return User;
};
