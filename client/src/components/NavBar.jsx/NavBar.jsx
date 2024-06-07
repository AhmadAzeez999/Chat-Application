import { Link } from 'react-router-dom';
import './NavBar.css';

const NavBar = () => 
{
    return ( 
    <div className="navbar">
        <h2>
            <Link to="/" className='logo'>ChatApp</Link>
        </h2>
        <div className="navlist">
            <ul>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/register">Register</Link></li>
            </ul>
        </div>
    </div>
 );
}
 
export default NavBar;