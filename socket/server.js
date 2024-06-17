const { Server } = require("socket.io");

const io = new Server(
{ 
    cors: "http://localhost:5173"
});

let onlineUsers = [];

io.on("connection", (socket) =>
{
    console.log(`User with ID: ${socket.id} is connected`);

    // Listen to a connection
    socket.on("addNewUser", (userId) =>
    {
        !onlineUsers.some((user) => user.userId === userId) &&
        onlineUsers.push(
        {
            userId,
            socketId: socket.id,
        });

        console.log("onlineUsers", onlineUsers);

        io.emit("getOnlineUsers", onlineUsers);
    });

    // Add message
    socket.on("sendMessage", (message) =>
    {
        const user = onlineUsers.find((user) => user.userId === message.recipientId);

        if (user)
        {
            io.to(user.socketId).emit("getMessage", message);
            io.to(user.socketId).emit("getNotification", 
            {
                senderId: message.senderId,
                isRead: false,
                type: "message",
                date: new Date(),
            });
        }
    });

    // Video call
    socket.emit("me", socket.id);

    socket.on("callUser", (data) => 
    {
        console.log("User to call: ", data.userToCall);
        console.log("From: ", data.from);
        console.log("Sender name: ", data.name);
        console.log("Call type: ", data.callType);

        const user = onlineUsers.find((user) => user.userId === data.userToCall);
        if (user) 
        {
            io.to(user.socketId).emit("callUser",
            {
                signal: data.signalData,
                from: data.from,
                name: data.name,
                callType: data.callType,
            });

            io.to(user.socketId).emit("getNotification", 
            {
                senderId: data.from,
                isRead: false,
                type: "call",
                date: new Date(),
            });
        }
    });

    socket.on("answerCall", (data) => 
    {
        const user = onlineUsers.find((user) => user.userId === data.to);
        if (user) 
        {
            io.to(user.socketId).emit("callAccepted", data.signal);
        }
    });

    socket.on("endCall", (data) => 
    {
        const receiver = onlineUsers.find((user) => user.userId === data.to);
        if (receiver)
        {
            console.log("Receiver: ", receiver);

            io.to(receiver.socketId).emit("callEnded");
        }

        const sender = onlineUsers.find((user) => user.userId === data.from);
        if (sender)
        {
            console.log("Sender: ", sender);
            io.to(sender.socketId).emit("callEnded");
        }
    });

    socket.on("declineCall", (data) =>
    {
        const receiver = onlineUsers.find((user) => user.userId === data.to);
        if (receiver)
        {
            io.to(receiver.socketId).emit("callDeclined");
        }

        const sender = onlineUsers.find((user) => user.userId === data.from);
        if (sender)
        {
            io.to(sender.socketId).emit("callDeclined");
        }
    });

    socket.on("disconnect", () =>
    {
        // Getting the user that are actually still online
        onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);

        io.emit("getOnlineUsers", onlineUsers);
    });
});

io.listen(3000);