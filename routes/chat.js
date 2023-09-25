const express = require("express");
const chatController = require("../controller/chat");
const { protect } = require("../middleware/authMiddleware");
const routes = express.Router();

routes
  .get("/", protect, chatController.getAllChats)
  .get("/:id", protect, chatController.getChat)
  .get("/users", protect, chatController.getUsersChats)
  .post("/", protect, chatController.openChat)
  .post("/gc", protect, chatController.createGC)
  .patch("/gc/rename", protect, chatController.renameGC)
  .patch("/gc/add", protect, chatController.addToGC)
  .patch("/gc/remove", protect, chatController.removeFromGC)
  .delete("/delete", protect, chatController.deleteChat);

exports.routes = routes;
