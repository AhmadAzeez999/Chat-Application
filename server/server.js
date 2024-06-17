const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const port = process.env.PORT || 5000;
const path = require("path");

const app = express();
require("dotenv").config();

const userRoute = require("./routes/userRoute.js");
const chatRoute = require("./routes/chatRoute.js");
const messageRoute = require("./routes/messageRoute.js");

app.use(express.json()); // Receive and send json data
app.use(cors(
{
    origin: "http://localhost:5173",
    credentials: true,
}));

app.get("/", (req, res) =>
{
    res.send("APIs working");
});

app.use("/api/users", userRoute);
app.use("/api/chats", chatRoute);
app.use("/api/messages", messageRoute);

// Creating upload endpoint for voice notes
app.use('/vn', express.static('uploads/vn'));

mongoose.connect(process.env.DB_URI).then(() =>
{
    console.log("MongoDB connection established");
}).catch((error) =>
{
    console.log("MongoDB connection failed: ", error.message);
});

app.listen(port, (req, res) =>
{
    console.log(`Server running on port ${port}`);
});