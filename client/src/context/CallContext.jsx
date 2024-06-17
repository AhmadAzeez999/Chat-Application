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
    const [receiverName, setReceiverName] = useState("");
    const [me, setMe] = useState("");
    const [callType, setCallType] = useState("");

    const connectionRef = useRef();
    const streamRef = useRef();

    useEffect(() =>
    {
        setMe(user?._id);
        setSenderName(user?.name);

        if (socket === null)
            return;

        if (socket == null)
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
            connectionRef.current.destroy();
        }
        if (streamRef.current) 
        {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    const callUser = useCallback((receiverId, stream, callType, receiverVideoRef) => 
    {
        if (socket == null)
            return;

        streamRef.current = stream;

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
            setCallAccepted(true);
            peer.signal(signal);
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
        setReceivingCall(false);
        setCaller("");
        setCallerSignal(null);
        setCallEnded(true);
        connectionRef.current.destroy();
    }, [caller, me, socket]);

    const leaveCall = useCallback(() => 
    {
        if (caller)
            socket.emit("endCall", { from: me, to: caller });
        else
            socket.emit("endCall", { from: me, to: receiver });
        resetCallState();
    }, [caller, me, receiver, socket]);


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
        }}
        >
            {children}
        </CallContext.Provider>
    );
}