const express = require("express");
const userController = require("../controller/user");
const routes = express.Router();

routes.get("/", userController.getUsers);

exports.routes = routes;