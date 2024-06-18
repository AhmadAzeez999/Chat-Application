import React, { useContext, useEffect, useRef, useState } from 'react';
import './VoiceChatModal.css';
import avatar from "../../assets/avatar.svg";
import { FcEndCall } from "react-icons/fc";
import { BsFillMicMuteFill } from "react-icons/bs";
import { IoCall } from "react-icons/io5";
import { CallContext } from '../../context/CallContext';
import { AuthContext } from '../../context/AuthContext';
import { ChatContext } from '../../context/ChatContext';
import { FaMicrophone } from "react-icons/fa";

const VoiceChatModal = ({ onClose, isSender, recipientName }) => 
{
    const { user } = useContext(AuthContext);
    const { callUser, answerCall, receivingCall, callAccepted, callEnded, declineCall, leaveCall, senderName } = useContext(CallContext);
    const { currentChat, sendTextMessage } = useContext(ChatContext);
    const [stream, setStream] = useState(null);
    const [streamIsReady, setStreamIsReady] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    const receiverAudioRef = useRef(null);
    const senderAudioRef = useRef(null);

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
            callUser(recipientId, stream, "voice", receiverAudioRef);
            sendTextMessage("Voice called", user, currentChat._id);
        }
    }, [stream, user, currentChat]);

    useEffect(() => 
    {
        if (callEnded) 
        {
            if (stream) 
            {
                stream.getTracks().forEach(track => track.stop());
            }
            onClose();
        }
    }, [callEnded, onClose, stream]);

    const handleStreamRender = async () => 
    {
        await navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => 
        {
            setStream(stream);

            if (senderAudioRef.current) 
            {
                senderAudioRef.current.srcObject = stream;
            }
        });
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

    const handleDeclineCall = () => 
    {
        declineCall();
        sendTextMessage("Call declined", user, currentChat._id);
    }

    const handleEndCall = () => 
    {
        leaveCall();
        sendTextMessage("Ended call", user, currentChat._id);
    };

    return (
        <div className="voice-chat-modal-overlay">
        <div className="voice-chat-modal">
            <div className="modal-header">
                <h3>Voice call</h3>
            </div>
            <div className="modal-body">
                <img src={avatar} alt="Avatar" height="100px" />
                <p>{isSender && !callAccepted ? `Calling ${recipientName}...` : `${recipientName}`}</p>
                <p>{callAccepted ? 'Connected' : ''}</p>
            </div>
            <div className="modal-footer">
            {receivingCall && !callAccepted ? (
                <div className='incoming-call'>
                    <p>Incoming call...</p>
                    <div className='incoming-call-buttons'>
                        <button
                            className="control-button answer-call"
                            onClick={() => answerCall(stream, receiverAudioRef)}
                            >
                            <IoCall />
                        </button>
                        <button className="control-button end-call" onClick={handleDeclineCall}>
                            <FcEndCall />
                        </button>
                    </div>
                </div>
            ) : (
                <div className='call-buttons'>
                    <button className="control-button" onClick={handleMute}>
                        {isMuted ? <FaMicrophone/> : <BsFillMicMuteFill />}
                    </button>
                    <button className="control-button end-call" onClick={handleEndCall}>
                        <FcEndCall />
                    </button>
                </div>
            )}
            </div>
            <audio ref={receiverAudioRef} autoPlay />
            <audio ref={senderAudioRef} autoPlay muted />
        </div>
        </div>
    );
};

export default VoiceChatModal;