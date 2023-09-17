const model = require("../model/user");
const User = model.User;
const bcrypt = require("bcrypt");
const generateToken = require("../util/generateToken");

//Register - POST
const createUser = async (req, res) => {
  const { name, email, password, pic } = req.body;

  try {
    //empty values check
    if (!name || !email || !password) {
      res.status(400).json("Please enter all the fields");
    }

    //Unique email check
    const existingUser = await User.findOne({
      email: email,
    });

    if (existingUser) {
      return res
        .status(401)
        .send(
          "A User already exists with this email address. Please try again with a different email Id."
        );
    }

    //generating hashed password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //creating new user
    const user = new User({
      name: name,
      email: email,
      password: hashedPassword,
      pic: pic,
    });

    //saving new user to the database
    const response = await user.save();

    //sending the response back with a JWToken
    res
      .status(201)
      .json({ ...response._doc, token: generateToken(response._doc._id) });
  } catch (err) {
    res.status(400).json(err);
  }
};

//Login - POST
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    //validating user
    const user = await User.findOne({
      email: email,
    });

    if (!user) {
      return res.status(401).send("User not found");
    }
    //validating password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).send("wrong password");
    }

    res.status(200).json({ ...user._doc, token: generateToken(user._doc._id) });
  } catch (err) {
    console.log(err);
  }
};

exports.createUser = createUser;
exports.login = login;
