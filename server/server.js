const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const port = process.env.PORT || 5000;

const app = express();
require("dotenv").config();

const userRoute = require("./routes/userRoute.js");

app.use(express.json()); // Receive and send json data
app.use(cors());

app.get("/", (req, res) =>
{
    res.send("APIs working");
});

app.use("/api/users", userRoute);

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