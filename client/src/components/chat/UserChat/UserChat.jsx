import { useFetchRecipient } from "../../../hooks/useFetchRecipient";
import './UserChat.css'
import avatar from "../../../assets/avatar.svg";
import { ChatContext } from "../../../context/ChatContext";
import { useContext } from "react";
import { unreadNotifications } from "../../../utils/unreadNotifications";
import { useFetchLatestMessage } from "../../../hooks/useFetchLatestMessage";
import moment from "moment";

const UserChat = ({ chat, user }) => 
{
    const { recipientUser } = useFetchRecipient(chat, user);
    const { onlineUsers,  notifications, markThisUserNotificationAsRead } = useContext(ChatContext);
    const { latestMessage } = useFetchLatestMessage(chat);

    const unread = unreadNotifications(notifications);
    const thisUserNotifications = unread?.filter((n) =>
        n.senderId === recipientUser?._id);
    const isOnline = onlineUsers?.some((user) => user?.userId === recipientUser?._id);

    const truncateText = (text) =>
    {
        let shortText = text.substring(0, 10);

        if (text.length > 12)
        {
            shortText = shortText + "...";
        }

        return shortText;
    }

    return ( 
    <div className="userchat" onClick={() =>
        {
            if (thisUserNotifications?.length !== 0)
            {
                markThisUserNotificationAsRead(thisUserNotifications, notifications);
            }
        }
    }>
        <div>
            <img src={avatar} alt="Avater" height="35px"/>
        </div>
        <div className="text-content">
            <div className="name">{recipientUser?.name}</div>
            <div className="text">{latestMessage?.text && truncateText(latestMessage?.text)}</div>
        </div>
        <div>
            <span className={isOnline ? "user-online" : ""}></span>
            <div className="date">
                {moment(latestMessage?.createdAt).calendar()}
            </div>
            <div className={thisUserNotifications?.length > 0 ? "this-user-notifications" : ""}>
                {thisUserNotifications?.length > 0 ? thisUserNotifications?.length : ""}
            </div>
        </div>
    </div>
 );
}
 
export default UserChat;