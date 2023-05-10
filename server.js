const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const http = require("http");
const { title } = require("process");
const artRouter = require("./routes/article");

const app = express();
app.use(cors());
//to not get any deprecation warning or error
//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));
//to get json data
// support parsing of application/json type post data
app.use(bodyParser.json());
app.use(cookieParser());

app.get("/", async (req, res) => {
  res.send({ result: "Hello" });
});

app.use("/api/article", artRouter);

app.listen(5000);
