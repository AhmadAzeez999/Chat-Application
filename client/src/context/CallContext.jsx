import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
import { ChatContext } from "./ChatContext";

export const CallContext = createContext();

export const CallContextProvider = ({ children, user }) =>
{
    const { socket, goToDesiredChat } = useContext(ChatContext);

    const [callerSignal, setCallerSignal] = useState();
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [receivingCall, setReceivingCall] = useState(false);
    const [caller, setCaller] = useState("");
    const [receiver, setReceiver] = useState("");
    const [senderName, setSenderName] = useState("");
    const [me, setMe] = useState("");
    const [callType, setCallType] = useState("");
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [originalVideoTrack, setOriginalVideoTrack] = useState(null);

    const connectionRef = useRef();
    const streamRef = useRef();
    const screenStreamRef = useRef();

    useEffect(() =>
    {
        setMe(user?._id);
        setSenderName(user?.name);

        if (socket === null)
            return;

        socket.on("callUser", (data) => 
        {
            console.log("GETTING CALLED");
            goToDesiredChat(data.from, user);
            
            setReceivingCall(true);
            setCaller(data.from);
            setSenderName(data.name);
            setCallerSignal(data.signal);
            setCallType(data.callType);
        });

        socket.on("callDeclined", () => 
        {
            console.log("Call declined");
            resetCallState();
        });

        socket.on("callEnded", () => 
        {
            console.log("Call ended");
            resetCallState();
        });

        return () => {
            socket.off("callUser");
            socket.off("callDeclined");
            socket.off("callEnded");
        }
    }, [user, socket]);

    useEffect(() => 
    {
        setCallEnded(false);
    }, [callEnded]);

    const resetCallState = () =>
    {
        setReceivingCall(false);
        setCallAccepted(false);
        setCallEnded(true);
        setCaller("");
        setCallerSignal(null);
        if (connectionRef.current) 
        {
            //connectionRef.current.destroy();
        }
        if (streamRef.current) 
        {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (screenStreamRef.current)
        {
            screenStreamRef.current.getTracks().forEach(track => track.stop());
            screenStreamRef.current = null;
        }
    };

    const callUser = useCallback((receiverId, stream, callType, receiverVideoRef, senderVideoRef) => 
    {
        if (socket === null)
            return;

        const peer = new Peer(
        {
            initiator: true,
            trickle: false,
            stream: stream,
        });

        peer.on("signal", (data) => 
        {
            console.log("Signal data: " + data);
            
            socket.emit("callUser", 
            {
                userToCall: receiverId,
                signalData: data,
                from: me,
                name: senderName,
                callType: callType,
            });
        });

        peer.on("stream", (stream) => 
        {
            if (receiverVideoRef)
                receiverVideoRef.current.srcObject = stream;
        });

        socket.on("callAccepted", (signal) =>
        {
            console.log("Call accepted");
            streamRef.current = stream;
            setCallAccepted(true);
            peer.signal(signal);

            peer.on("stream", (stream) => 
            {
                receiverVideoRef.current.srcObject = stream;
            });

            if (senderVideoRef && senderVideoRef.current)
                senderVideoRef.current.srcObject = stream;
        });

        connectionRef.current = peer;

        setReceiver(receiverId);
    }, [socket]);

    const answerCall = useCallback((stream, receiverVideoRef) => 
    {
        setCallAccepted(true);

        const peer = new Peer(
        {
            initiator: false,
            trickle: false,
            stream: stream,
        });

        peer.on("signal", (data) => 
        {
            socket.emit("answerCall", { signal: data, to: caller });
        });

        peer.on("stream", (stream) => 
        {
            receiverVideoRef.current.srcObject = stream;
        });

        peer.signal(callerSignal);

        connectionRef.current = peer;
    }, [callerSignal]);

    const declineCall = useCallback(() =>
    {
        console.log("Caller: ", caller);
        socket.emit("declineCall", { from: me, to: caller });
        resetCallState();
    }, [caller, me, socket]);

    const leaveCall = useCallback(() => 
    {
        if (caller)
            socket.emit("endCall", { from: me, to: caller });
        else
            socket.emit("endCall", { from: me, to: receiver });
        resetCallState();
    }, [caller, me, receiver, socket]);

    const handleScreenSharing = async () => 
    {
        console.log("Here with: ", isScreenSharing);
        await handleStreamRender();
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setOriginalVideoTrack(mediaStream.getVideoTracks()[0]);

        if (!isScreenSharing) 
        {
            try 
            {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                screenStreamRef.current = screenStream;
                setIsScreenSharing(true);

                if (connectionRef.current) 
                {
                    const sender = connectionRef.current._pc.getSenders().find(s => s.track.kind === 'video');
                    if (sender) 
                    {
                        await sender.replaceTrack(screenStream.getVideoTracks()[0]);
                        console.log("Replaced video track with screen track");
                    }
                }

                if (streamRef.current) 
                {
                    streamRef.current.getTracks().forEach(track => track.stop());
                    streamRef.current = null;
                }
            } 
            catch (error) 
            {
                console.error("Error sharing screen:", error);
                setIsScreenSharing(false);
            }
        } 
        else 
        {
            resetScreenSharing();
        }
    };

    const resetScreenSharing = async () => 
    {
        if (isScreenSharing && connectionRef.current && originalVideoTrack) 
        {
            if (connectionRef.current) 
            {
                console.log("Here");
                const sender = connectionRef.current._pc.getSenders().find(s => s.track.kind === 'video');
                if (sender) 
                {
                console.log("Hfrsiofreoiere");

                    await sender.replaceTrack(originalVideoTrack);
                    console.log("Reverted back to original video track");
                }
            }

            if (screenStreamRef.current) 
            {
                screenStreamRef.current.getTracks().forEach(track => track.stop());
                screenStreamRef.current = null;
            }

            setIsScreenSharing(false);
            await handleStreamRender();
        }
    };

    const handleStreamRender = async () => 
    {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setOriginalVideoTrack(mediaStream.getVideoTracks()[0]);
        streamRef.current = mediaStream;
    };


    return(
        <CallContext.Provider value=
        {{
            callUser,
            answerCall,
            declineCall,
            leaveCall,
            receivingCall,
            callAccepted,
            callEnded,
            senderName,
            setCallEnded,
            callType,
            handleScreenSharing,
            isScreenSharing,
        }}
        >
            {children}
        </CallContext.Provider>
    );
}