
import { useContext } from 'react';
import './css/Register.css';
import { AuthContext } from '../context/AuthContext';

const Register = () => 
{
    const { registerInfo, updateRegisterInfo, registerUser, registerError, isRegisterLoading } = useContext(AuthContext);

    return (
        <div className='register'>
            <h2>Register</h2>

            <form className='register-form' onSubmit={registerUser}>
                <div className='form-group'>
                    <label htmlFor='username'>Name</label>
                    <input type='text' id='name' name='name' 
                        onChange={(e) => updateRegisterInfo({...registerInfo, name: e.target.value})} 
                        required 
                    />
                </div>
                <div className='form-group'>
                    <label htmlFor='email'>Email</label>
                    <input type='email' id='email' name='email' 
                         onChange={(e) => updateRegisterInfo({...registerInfo, email: e.target.value})} 
                         required 
                    />
                </div>
                <div className='form-group'>
                    <label htmlFor='password'>Password</label>
                    <input type='password' id='password' name='password'  
                         onChange={(e) => updateRegisterInfo({...registerInfo, password: e.target.value})} 
                         required 
                    />
                </div>
                <div className='form-group'>
                    <label htmlFor='confirm-password'>Confirm Password</label>
                    <input type='password' id='confirm-password' name='confirm-password' required />
                </div>
                <button type='submit' className='register-button'>
                    {isRegisterLoading ? "Creating account" : "Register"}
                </button>
            </form>

            {registerError?.error && 
                <div className='error-message'>
                    <p>{registerError?.message}</p>
                </div>
            }
        </div>
    );
}

export default Register;
