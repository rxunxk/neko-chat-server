const model = require("../model/chat");
const Chat = model.Chat;

const getChats = async (req, res) => {
  try {
    await Chat.find().then((response) => {
      res.status(200).json(response);
    });
  } catch (err) {
    return res.status(400).json(err);
  }
};

module.exports = { getChats };
