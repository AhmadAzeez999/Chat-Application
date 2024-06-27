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
import { IoSearch } from "react-icons/io5";
import avatar from "../../../assets/avatar.svg";
import { AudioRecorder } from 'react-audio-voice-recorder';
import VideoChatModal from "../../VideoChatModal/VideoChatModal";
import VoiceChatModal from "../../VoiceChatModal/VoiceChatModal";
import { CallContext } from "../../../context/CallContext";

const ChatBox = () => 
{
    const { user } = useContext(AuthContext);
    const { currentChat, messages, isMessagesLoading, sendTextMessage, sendVoiceMessage } = useContext(ChatContext);
    const { recipientUser } = useFetchRecipient(currentChat, user);
    const [textMessage, setTextMessage] = useState("");
    const scroll = useRef();
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [showScrollDownButton, setShowScrollDownButton] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState(null);
    const [videoCallReceived, setVideoCallReceived] = useState(false);
    const [voiceCallReceived, setVoiceCallReceived] = useState(false);

    const [isVideoCallModalOpen, setIsVideoCallModalOpen] = useState(false);
    const [isVoiceCallModalOpen, setIsVoiceCallModalOpen] = useState(false);
    const [isSearchBoxVisible, setIsSearchBoxVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);

    const { receivingCall, callType } = useContext(CallContext);

    useEffect(() =>
    {
        if (receivingCall)
        {
            if (callType === "video")
                setVideoCallReceived(true);
            else if (callType === "voice")
                setVoiceCallReceived(true);
        }
        else
        {
            setVoiceCallReceived(false);
            setVideoCallReceived(false);
        }
        
    }, [receivingCall])

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

    const handleAudioSubmit = async (audioData) => 
    {
        if (audioData instanceof Blob) 
        {
            console.log("Audio data: ", audioData);
            sendVoiceMessage(audioData, user, currentChat._id);
        }
    };

    const handleOpenVideoCallModal = () =>
    {
        setIsVideoCallModalOpen(true);
    };

    const handleCloseVideoCallModal = () =>
    {
        setIsVideoCallModalOpen(false);
    };

    const handleOpenVoiceCallModal = () =>
    {
        setIsVoiceCallModalOpen(true);
    };

    const handleCloseVoiceCallModal = () =>
    {
        setIsVoiceCallModalOpen(false);
    };

    const toggleSearchBox = () =>
    {
        setIsSearchBoxVisible(!isSearchBoxVisible);
        setSearchQuery("");
        setSearchResults([]);
    };

    const handleSearch = (event) =>
    {
        setSearchQuery(event.target.value);
        if (event.target.value === "")
        {
            setSearchResults([]);
            return;
        }
        const results = messages.filter(message =>
            message?.text?.toLowerCase().includes(event.target.value.toLowerCase())
        );
        setSearchResults(results);
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
                    <img src={avatar} alt="Avatar" height="35px"/>
                    <strong>{recipientUser?.name}</strong>
                </div>

                <div className="header-buttons">
                    <button onClick={handleOpenVideoCallModal}>
                        <FaVideo/>
                    </button>
                    {isVideoCallModalOpen && <VideoChatModal onClose={handleCloseVideoCallModal} isSender={true} recipientName={recipientUser?.name}/>}
                    {videoCallReceived && <VideoChatModal onClose={handleCloseVideoCallModal} isSender={false} recipientName={recipientUser?.name}/>}

                    <button onClick={handleOpenVoiceCallModal}>
                        <IoCall/>
                    </button>
                    {isVoiceCallModalOpen && <VoiceChatModal onClose={handleCloseVoiceCallModal} isSender={true} recipientName={recipientUser?.name}/>}
                    {voiceCallReceived && <VoiceChatModal onClose={handleCloseVoiceCallModal} isSender={false} recipientName={recipientUser?.name}/>}

                    <button onClick={toggleSearchBox}>
                        <IoSearch/>
                    </button>
                </div>
            </div>
                <div className={`search-box ${isSearchBoxVisible ? 'show' : 'hide'}`}>
                    <input
                        type="text"
                        placeholder="Search messages..."
                        value={searchQuery}
                        onChange={handleSearch}
                    />
                </div>
            <div className="messages-container" ref={scroll} onScroll={handleScroll}>
                {(searchQuery ? searchResults : messages).map((message, index) =>
                    <div className={`message-box ${message?.senderId === user?._id ? "you" : "other"}`} key={index}>
                        <span>{message.text}</span>
                        {message.voiceNoteUrl && <audio controls src={message.voiceNoteUrl} />}
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
                    :  <div>
                            <AudioRecorder
                                onRecordingComplete={handleAudioSubmit}
                                audioTrackConstraints=
                                {{
                                    noiseSuppression: true,
                                    echoCancellation: true,
                                }}
                            />
                            {downloadUrl && (
                            <div>
                                <a href={downloadUrl} download="recording.wav">Download Recording</a>
                                <audio controls src={downloadUrl} />
                        </div>
                    )}
                </div>
                }
            </div>
        </div>
    );
}

export default ChatBox;
