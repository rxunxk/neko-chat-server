const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const morgan = require("morgan");
const helment = require("helmet");
const userRoutes = require("./routes/user");
const authRouter = require("./routes/auth");
const chatRouter = require("./routes/chat");
const messageRouter = require("./routes/message");
dotenv.config();
const server = express();

//Database connection
async function dbCon() {
  await mongoose.connect(process.env.MONGO_URL);
  console.log("Database connected");
}
dbCon().catch((err) => {
  console.log(err);
});

//Middlewares
server.use(cors());
server.use(express.json());
// server.use(morgan("default"));
server.use(helment());
server.use("/api/users", userRoutes.routes);
server.use("/api/auth", authRouter.routes);
server.use("/api/chats", chatRouter.routes);
server.use("/api/message", messageRouter.routes);
server.use("/", (req, res) => {
  res.send("Welcome to the server");
});

//Server
const socketSrv = server.listen(process.env.PORT, () => {
  console.log("server started");
});

const io = require("socket.io")(socketSrv, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:5173",
  },
});

io.on("connection", (socket) => {
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
  });

  socket.on("new message", (newMessageReceived) => {
    let chat = newMessageReceived.chat;
    if (!chat.users) return console.log("chat.users not defined");
    chat.users.forEach((user) => {
      if (user._id == newMessageReceived.sender._id) return;

      socket.in(user._id).emit("message received", newMessageReceived);
    });
  });
});
