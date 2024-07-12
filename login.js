import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link, useNavigate } from 'react-router-dom';
import Ramanasoft from './Ramanasoft_logo.jpeg';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8081/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (data.success){
        navigate('/ChatbotUI');
      } else {
        setError('Invalid email or password');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <>
      <div className='pb-3'>
        <div className="chat-header text-center mb-4">
          <img src={Ramanasoft} alt='logo' className='logo'/>
          <h3>QTBot</h3>
        </div>
        <div className='container'>
          <div className='row justify-content-center align-items-center vh-50'>
            <div className='col-md-6 d-none d-md-block'>
              <img src='https://cdnl.iconscout.com/lottie/premium/thumb/student-going-to-school-5578706-4652282.gif' alt='walk' className='img-fluid'/>
            </div>
            <div className='col-md-4'>
              <div className='p-4 bg-white border border-secondary rounded'>
                <form onSubmit={handleSubmit}>
                  <div className='mb-3'>
                    <input
                      type='email'
                      placeholder='Enter email'
                      className='form-control'
                      value={email}
                      required
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className='mb-3'>
                    <input
                      type='password'
                      placeholder='Enter password'
                      className='form-control'
                      value={password}
                      required
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  {error && <div className="alert alert-danger">{error}</div>}
                  <button type='submit' className='btn btn-success w-100'>
                    Login
                  </button>
                  <div className='mt-3 text-center'>
                    <p>
                      Don't have an account? <Link to='/register'>Register</Link>
                    </p>
                    <Link to='/'>Forgot Password ?</Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;


