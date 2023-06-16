const { authJwt } = require("../middlewares");
const controller = require("../controllers/pay.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.put("/api/payment/cancel/:id", controller.cancel);
  app.put("/api/payment/check/:id", controller.check);
};
