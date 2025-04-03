import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './user.css'
import GoogalLogo from './img/glogo.png'
// You may need to install these icons: npm install react-icons
import { FaEnvelope, FaLock } from 'react-icons/fa';

function UserLogin() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Login attempt:', formData);
    try {
      const response = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('userID', data.id); // Save user ID in local storage
        alert('Login successful!');
        navigate('/allPost');
      } else if (response.status === 401) {
        alert('Invalid credentials!');
      } else {
        alert('Failed to login!');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="login-container-new">
      <div className="login-left-panel">
        <div className="brand-message">
          <h1>Welcome to Our Platform</h1>
          <p>Share your thoughts and connect with like-minded people.</p>
        </div>
      </div>
      
      <div className="login-right-panel">
        <div className="login-form-container">
          <div className="login-header-new">
            <h2>Welcome Back</h2>
            <p>Enter your credentials to continue</p>
          </div>
          
          <form onSubmit={handleSubmit} className="login-form-new">
            <div className="input-field">
              <FaEnvelope className="field-icon" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="input-field">
              <FaLock className="field-icon" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="login-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <a href="#" className="forgot-link">Forgot password?</a>
            </div>

            <button type="submit" className="signin-btn">
              Sign In
            </button>

            <div className="social-divider">
              <span>or continue with</span>
            </div>

            <button
              type="button"
              onClick={() => window.location.href = 'http://localhost:8080/oauth2/authorization/google'}
              className="google-btn"
            >
              <img src={GoogalLogo} alt='Google' className='provider-icon' />
              Google
            </button>

            <p className="register-prompt">
              Don't have an account?
              <span onClick={() => (window.location.href = '/register')} className="register-link">
                Create account
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UserLogin;
