const express = require("express");
const userController = require("../controller/user");
const { protect } = require("../middleware/authMiddleware");
const routes = express.Router();

routes
  .get("/", userController.getUsers)
  .get("/search", protect, userController.searchUsers);

exports.routes = routes;
