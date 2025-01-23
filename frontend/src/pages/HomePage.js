import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="home-container">
      <h1>Welcome to the KNIT Attendance Management System</h1>
      <div className="cards-container">
        <div className="card" onClick={() => handleNavigation('/student/login')}>
          <h2>Student</h2>
          <p>Manage assignments, view schedules, and track progress.</p>
        </div>
        <div className="card" onClick={() => handleNavigation('/teacher/login')}>
          <h2>Teacher</h2>
          <p>Track attendance, manage classes, and plan lessons efficiently.</p>
        </div>
        <div className="card" onClick={() => handleNavigation('/admin/login')}>
          <h2>Admin</h2>
          <p>Oversee operations, manage staff, and monitor student performance.</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
