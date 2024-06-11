import { Link } from 'react-router-dom';
import './NavBar.css';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Notification from '../chat/Notification/Notification';
import AddContact from '../chat/AddContact/AddContact';

const NavBar = () => 
{
    const { user, logoutUser } = useContext(AuthContext);

    return ( 
    <div className="navbar">
        <h2>
            <Link to="/" className='logo'>Chatella</Link>
        </h2>
        <span className='text-warning'>{user && `Logged in as ${user?.name}`}</span>
        <div className="navlist">
            <ul>
                {
                    user && (
                        <div className='navbar-buttons'>
                        <AddContact/>
                        <Notification/>
                            <li><Link 
                                to="/login" 
                                onClick={() => logoutUser()}>
                                    Logout
                                </Link>
                            </li>
                        </div>
                    )}
                {
                    !user && (
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