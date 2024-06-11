import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { ChatContext } from "../../../context/ChatContext";
import { useFetchRecipient } from "../../../hooks/useFetchRecipient";
import moment from "moment";
import './ChatBox.css';
import InputEmoji from "react-input-emoji";
import { IoMdSend } from "react-icons/io";
import { FaArrowCircleDown } from "react-icons/fa";
import { IoCall } from "react-icons/io5";
import { FaVideo } from "react-icons/fa";
import { MdKeyboardVoice } from "react-icons/md";
import { IoSearch } from "react-icons/io5";
import avatar from "../../../assets/avatar.svg";
// import { ReactAudioRecorder } from "react-audio-voice-recorder";


const ChatBox = () => 
{
    const { user } = useContext(AuthContext);
    const { currentChat, messages, isMessagesLoading, sendTextMessage } = useContext(ChatContext);
    const { recipientUser } = useFetchRecipient(currentChat, user);
    const [textMessage, setTextMessage] = useState("");
    const scroll = useRef();
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [showScrollDownButton, setShowScrollDownButton] = useState(false);

    const handleScroll = () =>
    {
        if (scroll.current)
        {
            const { scrollTop, scrollHeight, clientHeight } = scroll.current;
            const atBottom = scrollTop + clientHeight >= scrollHeight - 100;
            setIsAtBottom(atBottom);
            setShowScrollDownButton(!atBottom);
        }
    }

    useEffect(() =>
    {
        if (isAtBottom && scroll.current)
        {
            scroll.current.scrollTop = scroll.current.scrollHeight;
        }
    }, [messages, isAtBottom]);

    const scrollToBottm = () =>
    {
        scroll.current.scrollTop = scroll.current.scrollHeight;
        setIsAtBottom(true);
    };

    const handleKeyPress = (event) =>
    {
        if (event.key === 'Enter')
        {
            event.preventDefault();
            sendTextMessage(textMessage, user, currentChat._id, setTextMessage);
        }
    };

    if (!recipientUser)
    {
        return (
            <div className="no-convo">
                <p>No conversation selected</p>
            </div>
        );
    }

    if (isMessagesLoading)
    {
        return (
            <p>Loading chat...</p>
        )
    }

    return ( 
        <div className="chatbox-main">
            <div className="chat-header">
                <div className="header-info">
                    <img src={avatar} alt="Avater" height="35px"/>
                    <strong>{recipientUser?.name}</strong>
                </div>

                <div className="header-buttons">
                    <button onClick={() => console.log("Video call button clicked")}>
                        <FaVideo/>
                    </button>
                    <button onClick={() => console.log("Voice call button clicked")}>
                        <IoCall/>
                    </button>
                    <button onClick={() => console.log("Search button clicked")}>
                        <IoSearch/>
                    </button>
                </div>
            </div>
            <div className="messages-container" ref={scroll} onScroll={handleScroll}>
                {messages && messages.map((message, index) =>
                    <div className={`message-box ${message?.senderId === user?._id ? "you" : "other"}`} key={index}>
                        <span>{message.text}</span>
                        <span className="message-footer">
                            {moment(message.createdAt).calendar()}
                        </span>
                    </div>
                )}

            <button
                className={`scroll-down-button ${showScrollDownButton && !isAtBottom ? '' : 'hidden'}`}
                onClick={scrollToBottm}
            >
                <FaArrowCircleDown size={30}/>
            </button>
            </div>
            <div className="chat-input">
                <InputEmoji 
                    value={textMessage} 
                    onChange={setTextMessage}
                    onKeyDown={handleKeyPress}
                    background="inherit"
                    color="white"
                />
                {textMessage
                    ? <button 
                        className="send-btn" 
                        onClick={() => sendTextMessage(textMessage, user, currentChat._id, setTextMessage)}
                    >
                        <IoMdSend/>
                    </button> 
                    : <button 
                        className="send-btn" 
                        onClick={() => console.log("Voice note button clicked")}
                    >
                        <MdKeyboardVoice/>
                    </button>
                }
            </div>
        </div>
    );
}

export default ChatBox;
