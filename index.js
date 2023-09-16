const express = require("express");
const dotenv = require("dotenv");
const chats = require("./data/data");
const cors = require("cors");

dotenv.config();
const server = express();

server.use(cors());

server.get("/", (req, res) => {
  res.send("Welcome to the server");
});

server.get("/api/chats", (req, res) => {
  res.send(chats);
});

server.get("/api/chats/:id", (req, res) => {
  const chat = chats.find((c) => c._id === req.params.id);
  res.send(chat);
});

server.listen(process.env.PORT, () => {
  console.log("server started");
});
