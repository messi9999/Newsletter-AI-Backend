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
    subscriptionId: {
      type: Sequelize.STRING
    },
    subscriptionStatus: {
      type: Sequelize.STRING
    },
    expireDate: {
      type: Sequelize.DATE
    }
  });

  return User;
};
