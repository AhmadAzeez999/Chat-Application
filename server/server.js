const express = require('express');
const app = express();
const http = require("http");
const cors = require("cors");
const initializeSocket = require('./socket')

app.use(cors());

const server = http.createServer(app);

initializeSocket(server);

server.listen(5000, () =>
{
    console.log("Server runnnig");
});