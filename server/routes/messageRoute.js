const express = require("express");
const messageController = require("../controllers/messageController.js");
const upload = require("../middlewares/multerConfig.js");

const router = express.Router();

router.post("/", messageController.createMessage);

router.get("/:chatId", messageController.getMessages);

router.post("/upload-voice", upload.single("voiceNote"), messageController.uploadVoiceNote);

module.exports = router;