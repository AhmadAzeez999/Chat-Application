import { Link } from 'react-router-dom';
import './NavBar.css';
import { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Notification from '../chat/Notification/Notification';
import AddContact from '../chat/AddContact/AddContact';
import avatar from "../../assets/avatar.svg";

const NavBar = () => {
    const { user, logoutUser } = useContext(AuthContext);
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div className="navbar">
            <h2>
                <Link to="/" className='logo'>Chatella</Link>
            </h2>
            <div className="navlist">
                <ul>
                    {user && (
                        <div className='navbar-buttons'>
                            <AddContact />
                            <Notification />
                            <div 
                                className="profile-container"
                                onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={() => setIsHovered(false)}
                            >
                                <img src={avatar} alt="Profile" className="profile-picture" />
                                {isHovered && (
                                    <div className="hover-box">
                                        <span>{user.name}</span>
                                        <Link to="/login" onClick={logoutUser}>Logout</Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {!user && (
                        <>
                            <li><Link to="/login">Login</Link></li>
                            <li><Link to="/register">Register</Link></li>
                        </>
                    )}
                </ul>
            </div>
        </div>
    );
}

export default NavBar;
