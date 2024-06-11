const multer = require("multer");
const path = require("path");
const messageModel = require("../models/messageModel.js");

const createMessage = async (req, res) =>
{
    try
    {
        const { chatId, senderId, text } = req.body;

        const message = new messageModel(
        {
            chatId, senderId, text
        });

        const response = await message.save();

        res.status(200).json(response);
    }
    catch (error)
    {
        console.log(error);
        res.status(500).json(error);
    }
};

const getMessages = async (req, res) =>
{
    try
    {
        const { chatId } = req.params;

        const messages = await messageModel.find({ chatId });

        res.status(200).json(messages);
    }
    catch (error)
    {
        console.log(error);
        res.status(500).json(error);
    }
};

module.exports =
{
    createMessage,
    getMessages,
    //uploadVoiceNote,
}