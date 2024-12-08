import { createContext, useCallback, useEffect, useState } from "react";
import { baseUrl, getRequest, postFileRequest, postRequest } from "../utils/services";
import { io } from "socket.io-client";

export const ChatContext = createContext();

export const ChatContextProvider = ({ children, user }) =>
{
    const [userChats, setUserChats] = useState(null);
    const [isUserChatsLoading, setIsUserChatsLoading] = useState(false);
    const [userChatsError, setUserChatsError] = useState(null);
    const [potentialChats, setPotentialChats] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState(null);
    const [isMessagesLoading, setIsMessagesLoading] = useState(false);
    const [messagesError, setMessagesError] = useState(null);
    const [sendTextMessageError, setSendTextMessageError] = useState(null);
    const [newMessage, setNewMessage] = useState(null);

    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [allUsers, setAllUsers] = useState([]);

    const [tempSenderId, setTempSenderId] = useState(null);
    const [tempUser, setTempUser] = useState(null);


    // Initial socket
    useEffect(() =>
    {
        const newSocket = io("http://localhost:3000");
        setSocket(newSocket);

        // Disconnect socket if no longer in use
        // or on reconnection attempt
        return () =>
        {
            newSocket.disconnect();
        }
    }, [user]);

    // Add online users
    useEffect(() =>
    {
        if (socket === null)
            return;

        socket.emit("addNewUser", user?._id);
        socket.on("getOnlineUsers", (onUsers) =>
        {
            setOnlineUsers(onUsers);
        });

        return () =>
        {
            socket.off("getOnlineUsers");
        }
    }, [socket]);

    // Send message
    useEffect(() =>
    {
        if (socket === null)
            return;

        const recipientId = currentChat?.members?.find((id) => id !== user?._id);

        socket.emit("sendMessage", { ...newMessage, recipientId });
    }, [newMessage]);

    // Receive message and notification
    useEffect(() =>
    {
        if (socket === null)
            return;

        socket.on("getMessage", (message) =>
        {
            if (currentChat?._id !== message.chatId)
                return;

            setMessages((prev) => [...prev, message]);
        });

        socket.on("getNotification", (res) => 
        {
            const isChatOpen = currentChat?.members.some((id) => id === res.senderId);

            if (isChatOpen)
            {
                setNotifications(prev => [{...res, isRead: true}, ...prev]);
            }
            else
            {
                setNotifications(prev => [res, ...prev]);
            }
        });

        return () =>
        {
            socket.off("getMessage");
            socket.off("getNotification");
        }
    }, [socket, currentChat]);


    useEffect(() =>
    {
        const getUsers = async () =>
        {
            const response = await getRequest(`${baseUrl}/users/all`);

            if (response.error)
            {
                return console.log("Error fetching users", response);
            }

            const pChats = response.filter((u) => 
            {
                let isChatCreated = false;

                if (!user)
                    return false;

                if (user._id === u._id)
                    return false;

                if (userChats)
                {
                    isChatCreated = userChats?.some((chat) =>
                    {
                        return chat.members[0] === u._id || chat.members[1] === u._id
                    });
                }

                return !isChatCreated;
            });

            setPotentialChats(pChats);
            setAllUsers(response);
        };

        getUsers();
    }, [userChats]);

    useEffect(() =>
    {
        const getUserChats = async () =>
        {
            if (user?._id)
            {
                setIsUserChatsLoading(true);
                setUserChatsError(null);

                const response = await getRequest(`${baseUrl}/chats/${user?._id}`);

                setIsUserChatsLoading(false);

                if (response.error)
                {
                    return setUserChatsError(response);
                }

                setUserChats(response);
                console.log("User chats: ", response);
            }
        }

        getUserChats();
    }, [user, notifications]);

    useEffect(() =>
    {
        const getMessages = async () =>
        {
            setIsMessagesLoading(true);
            setMessagesError(null);

            const response = await getRequest(`${baseUrl}/messages/${currentChat?._id}`);

            setIsMessagesLoading(false);

            if (response.error)
            {
                return setMessagesError(response);
            }

            setMessages(response);
        }

        getMessages();
    }, [currentChat]);

    const sendTextMessage = useCallback( async (textMessage, sender, currentChatId, setTextMessage) =>
    {
        if (!textMessage)
            return console.log("You must type something...");

        const response = await postRequest(`${baseUrl}/messages`,
        JSON.stringify(
        {
            chatId: currentChatId,
            senderId: sender._id,
            text: textMessage
        }
        ));

        if (response.error)
        {
            return setSendTextMessageError(response);
        }
        
        setNewMessage(response);
        setMessages((prev) => [...prev, response]);

        if (setTextMessage)
            setTextMessage(""); // Clearing input
    }, []);

    // For sending voice recordings
    const sendVoiceMessage = useCallback(async (audioBlob, sender, currentChatId) => 
    {
        const formData = new FormData();

        console.log("Audio blob: ", audioBlob);

        formData.append('chatId', currentChatId);
        formData.append('senderId', sender._id);
        formData.append('voiceNote', audioBlob);

        console.log("Form data: ", formData);

        const response = await postFileRequest(`${baseUrl}/messages/upload-voice`, formData);

        if (response.error)
        {
            return console.log("Error sending voice message:", response);
        }

        setNewMessage(response);
        setMessages((prev) => [...prev, response]);
    }, []);

    const updateCurrentChat = useCallback((chat) =>
    {
        setCurrentChat(chat);
    }, []);

    const createChat = useCallback( async (firstId, secondId) =>
    {
        const response = await postRequest(`${baseUrl}/chats/`, JSON.stringify(
        {
            firstId,
            secondId,
        }));

        if (response.error)
        {
            return console.log("Error creating chat", response);
        }

        setUserChats((prev) => [...prev, response]);
    }, []);

    const markAllNotificationsAsRead = useCallback((notifications) =>
    {
        const mNotifications = notifications.map((n) => 
        {
            return {...n, isRead: true};
        });

        setNotifications(mNotifications);
    }, []);

    const markNotificationAsRead = useCallback((n, userChats, user, notifications) => 
    {
        // Find chat to open
        const desiredChat = userChats.find((chat) => 
        {
            const chatMembers = [user._id, n.senderId];
            const isDesiredChat = chat?.members.every((member) =>
            {
                return chatMembers.includes(member);
            });

            return isDesiredChat;
        });

        // Mark notification as read
        const mNotifications = notifications.map((element) =>
        {
            if (n.senderId === element.senderId)
            {
                // Return the notification we clicked on
                return {...n, isRead: true};
            }
            else
            {
                // Return the notification that isn't modified
                return element;
            }
        });

        updateCurrentChat(desiredChat);
        setNotifications(mNotifications);
    }, []);

    const markThisUserNotificationsAsRead = useCallback((thisUserNotifications, notifications) =>
    {
        // Mark notifications as read
        const mNotifications = notifications.map((element) =>
        {
            let notification;

            thisUserNotifications.forEach((n) => 
            {
                if (n.senderId === element.senderId)
                {
                    notification = {...n, isRead: true}
                }
                else
                {
                    notification = element;
                }
            });

            return notification;
        });

        setNotifications(mNotifications);
    });

    const goToDesiredChat = useCallback((senderId, user) => 
    {
        console.log("Here");

        setTempSenderId(senderId);
        setTempUser(user);

        console.log(userChats)
        
        if (!userChats)
            return;

        console.log("And here?");


        // Find chat to open
        const desiredChat = userChats.find((chat) => 
        {
            const chatMembers = [user._id, senderId];
            const isDesiredChat = chat?.members.every((member) =>
            {
                return chatMembers.includes(member);
            });

            return isDesiredChat;
        });

        updateCurrentChat(desiredChat);
    }, [userChats]);

    useEffect(() =>
    {
        if (userChats && tempSenderId && tempUser)
        {
            goToDesiredChat(tempSenderId, tempUser);
            setTempSenderId(null);
            setTempUser(null);
        }
    }, [userChats]);

    return(
        <ChatContext.Provider value=
        {{
            userChats,
            isUserChatsLoading,
            userChatsError,
            potentialChats,
            currentChat,
            createChat,
            updateCurrentChat,
            messages,
            isMessagesLoading,
            messagesError,
            sendTextMessage,
            onlineUsers,
            notifications,
            allUsers,
            markAllNotificationsAsRead,
            markNotificationAsRead,
            markThisUserNotificationsAsRead,
            sendVoiceMessage,
            socket,
            goToDesiredChat,
        }}
        >
            {children}
        </ChatContext.Provider>
    );
}