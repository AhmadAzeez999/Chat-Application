import { useContext } from 'react';
import './css/Chat.css';
import { ChatContext } from '../context/ChatContext';
import UserChat from '../components/chat/UserChat/UserChat';
import { AuthContext } from '../context/AuthContext';
import ChatBox from '../components/chat/ChatBox/ChatBox';

const Chat = () => {
    const { user } = useContext(AuthContext);
    const { userChats, isUserChatsLoading, updateCurrentChat } = useContext(ChatContext);

        return (
        <div className='chat'>
            {userChats && userChats.length > 0 ? (
                <div className='chat-area'>
                    <div className='list'>
                        {isUserChatsLoading && <p>Loading chats...</p>}
                        {userChats.map((chat, index) => (
                            <div key={index} onClick={() => updateCurrentChat(chat)}>
                                <UserChat chat={chat} user={user} />
                            </div>
                        ))}
                    </div>
                    <div className='chatbox'>
                        <ChatBox/>
                    </div>
                </div>
            ) : (
                <div className='nochat'>No chats available</div>
            )}
        </div>
    );
}

export default Chat;
