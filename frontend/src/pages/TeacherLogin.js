import React, { useState } from 'react';
import axios from 'axios';
import '../styles/TeacherLogin.css'; // Assuming you have a separate CSS file

const TeacherLogin = () => {
  const [email, setEmail] = useState('');
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('https://backend-9doo.onrender.com/api/auth/teacher/login', { email, id, password });
      localStorage.setItem('teacherToken', data.token);
      alert('Login Successful');
      window.location.href = '/teacher/dashboard'; // Redirect to Teacher Dashboard
    } catch (err) {
      setError('Invalid Credentials');
    }
  };

  return (
    <div className="teacher-login-container">
      <form className="teacher-login-form" onSubmit={handleLogin}>
        <h2>Teacher Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="ID"
          value={id}
          onChange={(e) => setId(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="error-message">{error}</p>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default TeacherLogin;
