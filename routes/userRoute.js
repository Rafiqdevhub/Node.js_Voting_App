const express = require("express");
const {
  signUp,
  Login,
  profile,
  profilePassword,
} = require("../controllers/userController");
const { jwtAuthMiddleware } = require("../middleware/jwt");

const router = express.Router();

router.post("/signup", signUp);
router.post("/login", Login);
router.get("/profile", jwtAuthMiddleware, profile);
router.put("/profile/password", jwtAuthMiddleware, profilePassword);

module.exports = router;
