import React, { useContext, useEffect, useRef, useState } from 'react';
import './VideoChatModal.css';
import VideoCall from '../VideoCall/VideoCall';
import { FcEndCall } from "react-icons/fc";
import { LuCameraOff } from "react-icons/lu";
import { BsFillMicMuteFill } from "react-icons/bs";
import { ChatContext } from '../../context/ChatContext';
import { IoCall } from "react-icons/io5";
import { CallContext } from '../../context/CallContext';
import { AuthContext } from '../../context/AuthContext';
import { TbScreenShare } from "react-icons/tb";
import { TbScreenShareOff } from "react-icons/tb";


const VideoChatModal = ({ onClose, isSender }) => 
{
    const { user } = useContext(AuthContext);
    const { callUser, answerCall, receivingCall, callAccepted, callEnded, declineCall, leaveCall, name, setCallEnded } = useContext(CallContext);
    const { currentChat, sendTextMessage } = useContext(ChatContext);
    const [textMessage, setTextMessage] = useState("");

    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [stream, setStream] = useState();
    const [streamIsReady, setStreamIsReady] = useState(false);

    const senderVideoRef = useRef(null);
    const receiverVideoRef = useRef(null);
    const senders = useRef([]);

    useEffect(() =>
    {
        if (streamIsReady)
            return;
        
        handleStreamRender();

        if (isSender)
        {
            const recipientId = currentChat?.members?.find((id) => id !== user?._id);

            if (!stream)
                return;

            setStreamIsReady(true);
            
            callUser(recipientId, stream, "video", receiverVideoRef);
            sendTextMessage("Video called", user, currentChat._id, setTextMessage);
        }

    }, [stream]);
    
    useEffect(() =>
    {
        console.log("Call ended? ", callEnded);
        if (callEnded)
        {
            setCallEnded(false);
            if (stream) 
            {
                stream.getTracks().forEach(track => track.stop());
            }
            onClose();
        }
    }, [callEnded]);

    const handleStreamRender = async () =>
    {
        await navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => 
        {
            setStream(stream);

            if (senderVideoRef.current) 
                senderVideoRef.current.srcObject = stream;
        });

        if (!isSender)
            setStreamIsReady(true);
    }

    const handleMute = () => 
    {
        setIsMuted(!isMuted);
        if (stream)
        {
            stream.getAudioTracks().forEach(track =>
            {
                track.enabled = !track.enabled;
            });
        }
    };

    const handleCamera = () => 
    {
        setIsCameraOn(!isCameraOn);
        if (senderVideoRef.current) {
            senderVideoRef.current.srcObject.getTracks().forEach(track => 
            {
                if (track.kind === 'video') 
                {
                    track.enabled = !track.enabled;
                }
            });
        }
    };

    const handleDeclineCall = () =>
    {
        declineCall();
        sendTextMessage("Call declined", user, currentChat._id, setTextMessage);
    }

    const handleEndCall = () =>
    {
        leaveCall();
        sendTextMessage("Ended call", user, currentChat._id, setTextMessage);
    };

    return (
        <div className="video-chat-modal-overlay">
            <div className="video-chat-modal">
                <div className="video-chat-modal-header ">
                    <h3>{name && !isSender ? name : "Video calling..."}</h3>
                </div>
                <div className="video-chat-modal-body">
                    <div className="receiver-video">
                        <VideoCall videoRef={receiverVideoRef} />
                    </div>
                    <div className="sender-video">
                        <VideoCall videoRef={senderVideoRef} />
                    </div>
                    <div className="sender-controls">
                        <button onClick={handleMute}>
                            {isMuted ? 'unmute' : <BsFillMicMuteFill/>}
                        </button>
                        <button onClick={handleCamera}>
                            {isCameraOn ? <LuCameraOff/> : 'Show Camera'}
                        </button>
                    </div>

                    <div className="video-chat-modal-footer">
                        {receivingCall && !callAccepted ? (
                            <div className='incoming-call'>
                                <p>Incoming call...</p>
                                <div className='incoming-call-buttons'>
                                    <button 
                                        className="control-button answer-call" 
                                        onClick={() => answerCall(stream, receiverVideoRef)}>
                                        <IoCall />
                                    </button> 
                                    <button className="control-button end-call" onClick={handleDeclineCall}>
                                        <FcEndCall />
                                    </button>
                                </div>
                            </div>

                        ) : <div className='call-buttons'>
                                <button className="control-button">
                                    <TbScreenShare />
                                </button>
                                <button className="control-button end-call" onClick={handleEndCall}>
                                    <FcEndCall />
                                </button>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoChatModal;
