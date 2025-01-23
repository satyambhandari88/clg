import React, { useState } from 'react';
import axios from 'axios';
import '../styles//AdminRegister.css'; 

const AdminRegister = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
  
    try {
      console.log('Sending Data:', { name, email, password }); // Log data before sending
      const response = await axios.post('/admin/register', {
        name,
        email,
        password,
      });
  
      console.log('Response Data:', response.data); // Log the response
      setMessage(`Admin Registered Successfully: ${response.data.name}`);
    } catch (error) {
      console.error('Registration Error:', error.response || error.message); // Log the error
      setMessage(
        error.response?.data?.message || 'Error occurred during registration'
      );
    }
  };
  

  return (
    <div className="admin-register-container">
      <h2>Admin Registration</h2>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn-register">
          Register
        </button>
      </form>
    </div>
  );
};

export default AdminRegister;
