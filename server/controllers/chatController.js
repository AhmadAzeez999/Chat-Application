const chatModel = require("../models/chatModel.js");

const createChat = async (req, res) =>
{
    try
    {
        const { firstId, secondId } = req.body;
        
        // Checking if there's a chat between these 2 members
        const chat = await chatModel.findOne(
        {
            members: {$all: [firstId, secondId]}
        });

        if (chat)
            return res.status(200).json(chat);

        const newChat = new chatModel(
        {
            members: [firstId, secondId],
        });

        const response = await newChat.save();

        res.status(200).json(response);
    }
    catch (error)
    {
        console.log(error);
        res.status(500).json(error);
    }
};

const findUserChats = async (req, res) =>
{
    try
    {
        const userId = req.params.userId;

        const chats = await chatModel.find(
        {
            members: {$in: userId}
        });

        res.status(200).json(chats);
    }
    catch (error)
    {
        console.log(error);
        res.status(500).json(error);
    }
};

const findChat = async (req, res) =>
{
    try
    {
        const { firstId, secondId } = req.body;

        const chat = await chatModel.findOne(
        {
            members: {$all: [firstId, secondId]}
        });

        res.status(200).json(chat);
    }
    catch (error)
    {
        console.log(error);
        res.status(500).json(error);
    }
};

module.exports = 
{
    createChat,
    findUserChats,
    findChat,
}