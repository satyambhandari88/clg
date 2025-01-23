import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/AdminDashboard.css'; // Import the CSS file

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard-container">
      <div className="admin-dashboard-box">
        <h1 className="admin-dashboard-title">Admin Dashboard</h1>
        <p className="admin-dashboard-welcome">Welcome, Admin! Manage students, teachers, and attendance here.</p>
        <div className="admin-dashboard-links">
          <Link to="/admin/add-student" className="dashboard-link">Add Student</Link>
          <Link to="/admin/add-teacher" className="dashboard-link">Add Teacher</Link>
          <Link to="/admin/add-class" className="dashboard-link">Add Class</Link>
          <Link to="/admin/reports" className="dashboard-link">Generate Reports</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
