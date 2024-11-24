const { generateToken } = require("../middleware/jwt");
const User = require("../models/userModel");

const signUp = async (req, res) => {
  try {
    const data = req.body;

    const adminUser = await User.findOne({ role: "admin" });
    if (data.role === "admin" && adminUser) {
      return res.status(400).json({ error: "Admin user already exists" });
    }

    if (!/^\d{5}-\d{6}-\d{1}$/.test(data.CNIC)) {
      return res.status(400).json({
        error:
          "CNIC Card Number must be 13 digits and in the format XXXXX-XXXXXX-X",
      });
    }

    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(data.email)) {
      return res.status(400).json({
        error: `${data.email} is not a valid email address!`,
      });
    }

    const existingUser = await User.findOne({
      CNIC: data.CNIC,
    });
    if (existingUser) {
      return res.status(400).json({
        error: `User   with  ${data.CNIC} CNIC Card Number already exists`,
      });
    }

    const newUser = new User(data);

    const response = await newUser.save();

    const payload = {
      id: response.id,
    };
    const token = generateToken(payload);

    res.status(200).json({ response: response, token: token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const Login = async (req, res) => {
  try {
    const { CNIC, password } = req.body;

    if (!CNIC || !password) {
      return res
        .status(400)
        .json({ error: "CNIC Card Number and password are required" });
    }

    const user = await User.findOne({ CNIC });

    if (!user || !(await user.comparePassword(password))) {
      return res
        .status(401)
        .json({ error: "Invalid CNIC Card Number or Password" });
    }

    const payload = {
      id: user.id,
    };
    const token = generateToken(payload);

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const profile = async (req, res) => {
  try {
    const userData = req.user;
    const userId = userData.id;
    const user = await User.findById(userId);
    res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const profilePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Both currentPassword and newPassword are required" });
    }

    const user = await User.findById(userId);

    if (!user || !(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ error: "Invalid current password" });
    }

    user.password = newPassword;
    await user.save();

    console.log("password updated");
    res.status(200).json({ message: "Password updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  signUp,
  Login,
  profile,
  profilePassword,
};
