const express = require("express");
const userController = require("../controllers/userController.js");

const router = express.Router();

router.post("/register", userController.registerUser);

router.post("/login", userController.loginUser);

router.get("/find/:userId", userController.findUser);

router.get("/all", userController.getAllUsers);

module.exports = router;