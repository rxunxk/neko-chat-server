const Chat = require("../model/chat");
const Message = require("../model/message");
const { User } = require("../model/user");

//Sending a single message
const sendMessage = async (req, res) => {
  try {
    const { content, chatId } = req.body;

    if (!content || !chatId) {
      throw new Error("Content or ChatId is empty");
    }

    let newMessage = {
      sender: req.user._id,
      content: content,
      chat: chatId,
    };

    let message = await Message.create(newMessage);
    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: message,
    });

    res.status(201).send(message);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

//get all messages
const getMessagesForThisChat = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");

    res.status(200).send(messages);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

module.exports = {
  sendMessage,
  getMessagesForThisChat,
};
