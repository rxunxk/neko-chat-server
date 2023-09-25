const express = require("express");
const routes = express.Router();
const {
  sendMessage,
  getMessagesForThisChat,
} = require("../controller/message");
const { protect } = require("../middleware/authMiddleware");

routes
  .post("/", protect, sendMessage)
  .get("/:chatId", protect, getMessagesForThisChat);

exports.routes = routes;
