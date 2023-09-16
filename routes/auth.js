const express = require("express");
const authController = require("../controller/auth");
const routes = express.Router();

routes
  .post("/register", authController.createUser)
  .post("/login", authController.login);

exports.routes = routes;
