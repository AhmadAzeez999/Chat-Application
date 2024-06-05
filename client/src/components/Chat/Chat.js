import React, { useEffect, useRef, useState } from 'react';
import './Chat.css';

const Chat = ({socket, username, room }) => 
{
    const [currentMessage, setCurrentMessage] = useState("");
    const [messageList, setMessageList] = useState([]);
    const [typingStatus, setTypingStatus] = useState("");

    const chatBodyRef = useRef(null);
    const prevMessageListLength = useRef(0);


    const sendMessage = async () =>
    {
        handleStopTyping();

        if (currentMessage !== "")
        {
            const messageData =
            {
                currentRoom: room,
                author: username,
                message: currentMessage,
                time: new Date(Date.now()).getHours() + 
                ":" + new Date(Date.now()).getMinutes()
            };

            await socket.emit("send_message", messageData);
            setMessageList((list) => [...list, messageData]);
            setCurrentMessage("");
        }
    };

    const leaveRoom = () => 
    {
        socket.emit("leave_room", room);
        window.location.reload();
    };

    useEffect(() =>
    {
        socket.off("receive_message").on("receive_message", (data) =>
        {
            setMessageList((list) => [...list, data]);
            scrollToBottom();
        });

        socket.off("user_joined").on("user_joined", (data) => 
        {
            setMessageList((list) => [...list, data]);
            scrollToBottom();
        });

        socket.off("user_left").on("user_left", (data) => 
        {
            setMessageList((list) => [...list, data]);
            scrollToBottom();
        });

        socket.off("typing").on("typing", (id) =>
        {
            setTypingStatus(`${id} is typing...`);
        });

        socket.off("stop_typing").on("stop_typing", (id) =>
        {
            setTypingStatus("");
        });

    }, [socket, messageList]);

    const scrollToBottom = () =>
    {
        chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    };

    const handleTyping = () =>
    {
        socket.emit("typing", room);
    };

    const handleStopTyping = () =>
    {
        socket.emit("stop_typing", room);
    };

    useEffect(() => 
    {
        if (messageList.length > prevMessageListLength.current) 
        {
            scrollToBottom();
        }
        prevMessageListLength.current = messageList.length;
        }, [messageList, chatBodyRef]);

    return (
        <div className='chat'>
            <div className='chat-header'>
                <p>Chatella</p>
                <button onClick={leaveRoom}>Leave Room</button>
            </div>
            <div className='chat-body' ref={chatBodyRef}>
                {messageList.map((messageContent) =>
                {
                    let messageId = "";
                    if (username === messageContent.author)
                    {
                        messageId = "you";
                    }
                    else if (messageContent.author === "")
                    {
                        messageId = "system";
                    }
                    else
                    {
                        messageId = "other";
                    }

                    return (
                        <div className='message' 
                        id={messageId}>
                            <div className='message-content'>
                                <p>{messageContent.message}</p>
                            </div>
                            <div className='message-meta'>
                                <p>{messageContent.time}</p>
                                <p>{messageContent.author}</p>
                            </div>
                        </div>
                    )
                })}
            </div>
            <div className='typing-status'>
                <p>{typingStatus}</p>
            </div>
            <div className='chat-footer'>
                <input type="text" placeholder='Type here...' value={currentMessage} 
                onChange={(event) => 
                {
                    setCurrentMessage(event.target.value)
                    handleTyping();
                }}
                onKeyDown={(event) =>
                {
                    event.key === "Enter" && sendMessage();
                }}
                onBlur={handleStopTyping}/>
                <button onClick={sendMessage}>&#9658;</button>
            </div>
        </div>
    );

}

export default Chat