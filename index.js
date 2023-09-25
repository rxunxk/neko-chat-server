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
server.use(morgan("default"));
server.use(helment());
server.use("/api/users", userRoutes.routes);
server.use("/api/auth", authRouter.routes);
server.use("/api/chats", chatRouter.routes);
server.use("/api/message", messageRouter.routes);
//Server
server.listen(process.env.PORT, () => {
  console.log("server started");
});
