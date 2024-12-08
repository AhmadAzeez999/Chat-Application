import { useContext, useState } from "react";
import { FaBell } from "react-icons/fa";
import { ChatContext } from "../../../context/ChatContext";
import { AuthContext } from "../../../context/AuthContext";
import { unreadNotifications } from "../../../utils/unreadNotifications";
import moment from "moment";
import './Notification.css';

const Notification = () => 
{
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useContext(AuthContext);
    const 
    { 
        notifications, 
        userChats, 
        allUsers,
        markAllNotificationsAsRead, 
        markNotificationAsRead 
    } = useContext(ChatContext);

    const unread = unreadNotifications(notifications);
    const modifiedNotifications = notifications.map((n) =>
    {
        const sender = allUsers.find((user) => user._id === n.senderId);

        return {
            ...n,
            senderName: sender?.name
        }
    });

    const renderNotificationMessage = (notification) =>
    {
        if (notification.type === "message")
        {
            return <span>{`${notification.senderName} sent you a new message.`}</span>
        }
        else if (notification.type === "call")
        {
            return <span>{`${notification.senderName} called you.`}</span>
        }
    }

    return ( 
        <div className="notifications" onClick={() => setIsOpen(!isOpen)}>
            <FaBell 
                width={20}
                height={20}
            />
            {unread?.length === 0 ? null : (
                <span className="notification-count">
                    <span>{unread?.length}</span>
                </span>
            )}
            <div className={`notifications-box ${isOpen ? 'open' : 'closed'}`}>
                <div className="notifications-header">
                    <h3>Notifications</h3>
                    <div 
                        className="mark-as-read" 
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent closing the notifications box
                            markAllNotificationsAsRead(notifications);
                        }}
                    >
                        Mark all as read
                    </div>
                </div>
                {modifiedNotifications?.length === 0 
                    ? <span>No notifications</span>
                    : null
                }
                {modifiedNotifications && modifiedNotifications.map((n, index) =>
                {
                    return (
                        <div 
                            key={index} 
                            className={`notification ${n.isRead ? '' : 'not-read'}`}
                            onClick={() => 
                            {
                                markNotificationAsRead(n, userChats, user, notifications);
                            }}
                        >
                            {renderNotificationMessage(n)}
                            <span className="notification-time">{moment(n.date).calendar()}</span>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}
 
export default Notification;
