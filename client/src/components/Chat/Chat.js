import React, { useEffect, useRef, useState } from 'react';
import './Chat.css';

const Chat = ({socket, username, room }) => 
{
const [currentMessage, setCurrentMessage] = useState("");
const [messageList, setMessageList] = useState([]);

const chatBodyRef = useRef(null);
const prevMessageListLength = useRef(0);


const sendMessage = async () =>
{
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

useEffect(() =>
{
    socket.off("receive_message").on("receive_message", (data) =>
    {
        setMessageList((list) => [...list, data]);
        scrollToBottom();
    });
}, [socket, messageList]);

const scrollToBottom = () =>
{
    chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
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
        </div>
        <div className='chat-body' ref={chatBodyRef}>
            {messageList.map((messageContent) =>
            {
                return (
                    <div className='message' id={username === messageContent.author ? "you" : "other"}>
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
        <div className='chat-footer'>
            <input type="text" placeholder='Type here...' value={currentMessage} onChange={(event) => {setCurrentMessage(event.target.value)}}
            onKeyPress={(event) =>
            {
                event.key === "Enter" && sendMessage();
            }}/>
            <button onClick={sendMessage}>&#9658;</button>
        </div>
    </div>
);

}

export default Chat