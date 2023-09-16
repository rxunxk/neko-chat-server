const express = require("express");
const authController = require("../controller/auth");
const routes = express.Router();

routes.get("/", authController.createUser);

module.exports = {
  routes,
};
