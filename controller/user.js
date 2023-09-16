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

module.exports = {
  getUsers,
};
