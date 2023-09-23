const expressAsyncHandler = require("express-async-handler");
const model = require("../model/user");
const User = model.User;

const getUsers = async (req, res) => {
  try {
    const data = await User.find();
    res.status(200).json(data);
  } catch (err) {
    res.status(400).json(err);
  }
};

// /api/user/search?search=raunak
const searchUsers = expressAsyncHandler(async (req, res) => {
  const keyword = req.query.search;
  const users = await User.find({
    $or: [
      { name: { $regex: new RegExp(keyword, "i") } }, // 'i' flag for case-insensitive search
      { email: { $regex: new RegExp(keyword, "i") } },
    ],
  }).find({ _id: { $ne: req.user._id } });
  res.status(200).send(users);
});

module.exports = {
  getUsers,
  searchUsers,
};
