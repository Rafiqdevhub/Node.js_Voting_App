const User = require("../models/userModel");

const checkAdminRole = async (userID) => {
  try {
    const user = await User.findById(userID);
    if (user.role === "admin" || user.role === "govtEmployee") {
      return true;
    }
  } catch (err) {
    return false;
  }
};

module.exports = checkAdminRole;
