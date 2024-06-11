import { useContext } from 'react';
import './css/Login.css';
import { AuthContext } from '../context/AuthContext';

const Login = () => 
{
    const { loginUser, loginError, loginInfo, updateLoginInfo, isLoginLoading} = useContext(AuthContext);

    return (
        <div className='login'>
            <h2>Login</h2>
            <form className='login-form' onSubmit={loginUser}>
                <div className='form-group'>
                    <label htmlFor='email'>Email</label>
                    <input 
                        type='email' 
                        id='email' 
                        name='email' 
                        onChange={(e) => updateLoginInfo({...loginInfo, email: e.target.value})} 
                        required 
                    />
                </div>
                <div className='form-group'>
                    <label htmlFor='password'>Password</label>
                    <input 
                        type='password' 
                        id='password' 
                        name='password' 
                        onChange={(e) => updateLoginInfo({...loginInfo, password: e.target.value})} 
                        required 
                    />
                </div>
                <button type='submit' className='login-button'>{isLoginLoading ? "Logging in..." : "Login"}</button>
            </form>

            {loginError?.error && 
                <div className='error-message'>
                    <p>{loginError?.message}</p>
                </div>
            }
        </div>
    );
}

export default Login;
