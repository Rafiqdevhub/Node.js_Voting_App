const { generateToken } = require("../midddleware/jwt");
const User = require("../models/userModel");

const signUp = async (req, res) => {
  try {
    const data = req.body;

    const adminUser = await User.findOne({ role: "admin" });
    if (data.role === "admin" && adminUser) {
      return res.status(400).json({ error: "Admin user already exists" });
    }

    if (!/^\d{13}$/.test(data.CNIC)) {
      return res
        .status(400)
        .json({ error: "CNIC Card Number must be exactly 13 digits" });
    }

    const existingUser = await User.findOne({
      CNIC: data.CNIC,
    });
    if (existingUser) {
      return res.status(400).json({
        error: "User with the same CNIC Card Number already exists",
      });
    }

    const newUser = new User(data);

    const response = await newUser.save();
    console.log("data saved");

    const payload = {
      id: response.id,
    };
    console.log(JSON.stringify(payload));
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

    const user = await User.findOne({ CNIC: CNIC });

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