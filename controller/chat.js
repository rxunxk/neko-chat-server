const asyncHandler = require("express-async-handler");
const Chat = require("../model/chat");
const User = require("../model/user").User;

//getting All Chats form the backend
const getAllChats = async (req, res) => {
  try {
    const chats = await Chat.find()
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage");

    if (chats) {
      res.status(200).send(chats);
    }
  } catch (err) {
    res.status(400).send(err.message);
  }
};

//getting a single chat
const getChat = async (req, res) => {
  try {
    await Chat.find({ _id: req.params.id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name pic email",
        });

        res.status(200).send(results);
      });
  } catch (err) {
    res.status(400).send(err.message);
  }
};

//Getting a user's chat
const getUsersChats = async (req, res) => {
  console.log(req);
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 }) //will sort from new to old
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name pic email",
        });

        res.status(200).send(results);
      });
  } catch (err) {
    return res.status(400).json(err.message);
  }
};

//Creating 1 to 1 chat or fetching 1 to 1 chat
const openChat = async (req, res) => {
  //user Id of the user who current user wants to have a chat with
  const { userId } = req.body;

  //we will check If the currentUser has an existing convo with this userId or not
  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      {
        users: { $elemMatch: { $eq: userId } },
      },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    let chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);

      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).send(FullChat);
    } catch (err) {
      res.status(400).send(err.message);
    }
  }
};

//Create Group Chat
const createGC = async (req, res) => {
  //Input -> GC name & userIds.
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Need users & group name" });
  }

  //We are going to send the user list as a Stringified array than in the backend we will parse it
  let users = JSON.parse(req.body.users);

  if (users.length < 2) {
    return res.status(400).send("Group should have atleast 2 members");
  }

  //using req.user would mean Current user, benefit of JWT
  users.push(req.user);
  try {
    const GC = await Chat.create({
      //group chat name
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      //current user
      groupAdmin: req.user,
    });

    const dbResponse = await Chat.findOne({ _id: GC._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(201).json(dbResponse);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

//Rename Group name
const renameGC = async (req, res) => {
  //INPUT -> 1. Chat_ID, bascially the chat in the db 2. the new name for the GC
  const { chatId, chatName } = req.body;

  const updatedChat = await Chat.findOneAndUpdate(
    { _id: chatId },
    { chatName },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    res.status(400).send("Chat Not Found");
  } else {
    res.send(updatedChat);
  }
};

//Add to a Grooup
const addToGC = async (req, res) => {
  /**
   *Input: 

   1.chatId: The Chat Id (Group is also considered as chat in the backend)
   2.users: An Array of Users who want to get added to this group. could be single & multiple
   
   */

  try {
    const { chatId, users } = req.body;
    const updatedChat = await Chat.findOneAndUpdate(
      {
        _id: chatId,
      },
      { $push: { users: { $each: users } } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedChat) {
      res.status(400).send("Chat not found");
    } else {
      res.status(200).send(updatedChat);
    }
  } catch (err) {
    res.status(400).send(err.message);
  }
};

//Remove a user from a group
const removeFromGC = async (req, res) => {
  /**
   *Input: 

   1.chatId: The Chat Id (Group is also considered as chat in the backend)
   2.userId: userId of the person who should be removed from the group
   
   */
  try {
    const { chatId, userId } = req.body;

    const updatedChat = await Chat.findOneAndUpdate(
      {
        _id: chatId,
      },
      { $pull: { users: userId } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedChat) {
      res.status(400).send("Chat not found");
    } else {
      res.status(200).send(updatedChat);
    }
  } catch (err) {
    res.status(400).send(err.message);
  }
};

//Delete Chat
const deleteChat = async (req, res) => {
  let chatId = req.body.chatId;
  try {
    const deletedChat = await Chat.findOneAndDelete({ _id: chatId });
    res.status(200).send(deletedChat);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

exports.getUsersChats = getUsersChats;
exports.openChat = openChat;
exports.createGC = createGC;
exports.renameGC = renameGC;
exports.addToGC = addToGC;
exports.removeFromGC = removeFromGC;
exports.getAllChats = getAllChats;
exports.deleteChat = deleteChat;
exports.getChat = getChat;
