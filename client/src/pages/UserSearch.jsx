import { useContext, useState } from "react";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";
import './css/UserSearch.css';
import { FaSearch } from "react-icons/fa";
import avatar from "../assets/avatar.svg";

const UserSearch = () => {
    const { user } = useContext(AuthContext);
    const { potentialChats, createChat, onlineUsers } = useContext(ChatContext);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredChats = potentialChats.filter((u) => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return ( 
        <div className="user-search-page">
            <div className="search-bar-container">
                <input 
                    type="text" 
                    className="search-bar" 
                    placeholder="Search users..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FaSearch className="search-icon" />
            </div>
            <div className="potential-chats">
                {filteredChats && filteredChats.map((u, index) => {
                    return (
                        <div 
                            className="single-user" 
                            key={index} 
                            onClick={() => 
                                {
                                    createChat(user._id, u._id);
                                    
                                }
                            }
                        >
                            <div className="user-info">
                                <img src={avatar} alt="Avater" height="35px"/>
                                <p>{u.name}</p>
                            </div>
                            <span 
                                className={
                                    onlineUsers?.some((user) => user?.userId === u?._id)
                                    ? "user-online" : ""
                                }
                            >
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}

export default UserSearch;
