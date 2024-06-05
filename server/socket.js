const { Server } = require("socket.io");

function initializeSocket(server) 
{
    const io = new Server(server, 
    {
        cors: 
        {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => 
    {
        console.log(`User connected: ${socket.id}`);

        socket.on("join_room", (room) => 
        {
            socket.join(room);
            console.log(`User with ID: ${socket.id} joined room: ${room}`);

            socket.to(room).emit("user_joined",
            {
                message: `User with ID: ${socket.id} has joined the room.`,
                time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes(),
                author: ""
            });
        });

        socket.on("send_message", (data) => 
        {
            socket.to(data.currentRoom).emit("receive_message", data);
        });

        socket.on("leave_room", (room) =>
        {
            socket.leave(room);
            console.log(`User with ID: ${socket.id} left room: ${room}`);
            
            socket.to(room).emit("user_left",
            {
                message: `User with ID: ${socket.id} has left the room.`,
                time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes(),
                author: ""
            });
        });

        socket.on("typing", (room) =>
        {
            console.log("Typing");
            socket.to(room).emit("typing", socket.id);
        });

        socket.on("stop_typing", (room) =>
        {
            console.log("Stopped typing");
            socket.to(room).emit("stop_typing", socket.id);
        });

        socket.on("disconnect", () => 
        {
            console.log(`User disconnected: ${socket.id}`);
        });
    });
}

module.exports = initializeSocket;
