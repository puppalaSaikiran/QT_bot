import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Ramanasoft from './Ramanasoft_logo.jpeg';
import 'bootstrap/dist/css/bootstrap.min.css';
import './register.css'; 

const RegisterButton = () => {
  const [username, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    try {
      const response = await fetch('http://localhost:8081/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await response.json();
      if (data.success) {
        alert("Registered Successfully");
        navigate('/');
      } else {
        setMessage(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('An error occurred during registration.');
    }
  };

  return (
    <>
      <div className="chat-header text-center mb-4">
        <img src={Ramanasoft} alt='logo' className='logo'/>
        <h3>QTBot</h3>
      </div>
      <div className='container'>
        <div className='row justify-content-center align-items-center vh-50'>
          {/* <img src='https://media2.giphy.com/media/j2dv7H2pgFyoICoD6E/200w.gif' alt='direction'/> */}
          <div className='col-md-4'>
            <div className='p-4 bg-white border border-secondary rounded custom-form'>
              <form onSubmit={handleSubmit}>
                <div className='mb-3'>
                  <input
                    type='email'
                    className='form-control'
                    placeholder='Enter email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className='mb-3'>
                  <input
                    type='text'
                    className='form-control'
                    placeholder='Enter username'
                    value={username}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                  />
                </div>
                <div className='mb-3'>
                  <input
                    type='password'
                    className='form-control'
                    placeholder='Enter password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className='mb-3'>
                  <input
                    type='password'
                    className='form-control'
                    placeholder='Confirm password'
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <button type='submit' className='btn btn-success'>Register</button>
                <div>{message}</div>
                <div className='mt-2'>
                  <p>
                    Already have an account <Link to='/'>Login</Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterButton;
