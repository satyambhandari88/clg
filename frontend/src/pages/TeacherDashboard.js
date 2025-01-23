import React, { useState } from 'react';
import axios from 'axios';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Card, CardContent } from '../components/ui/card';
import '../styles/TeacherDashboard.css';

const TeacherDashboard = () => {
  const [formData, setFormData] = useState({
    year: '',
    branch: '',
    subject: '',
    className: '',
    teacherName: '',
    day: '',
    date: '',
    startTime: '',
    endTime: '',
  });
  const [createdClass, setCreatedClass] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('teacherToken');
      const response = await axios.post('http://localhost:5000/api/teacher/create-class', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setCreatedClass({
        className: response.data.className,
        classCode: response.data.classCode
      });
      
      setFormData({
        year: '',
        branch: '',
        subject: '',
        className: '',
        teacherName: '',
        day: '',
        date: '',
        startTime: '',
        endTime: '',
      });
    } catch (error) {
      alert('Error creating class');
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-box">
        <h1 className="dashboard-title">Teacher Dashboard</h1>
        
        {createdClass && (
          <Card className="mb-6 bg-green-50">
            <CardContent className="pt-6">
              <Alert>
                <AlertDescription>
                  <div className="text-center code">
                    <h3 className="font-bold text-lg mb-2">Class Created Successfully!</h3>
                    <p className="mb-1">Class: {createdClass.className}</p>
                    <p className="text-lg font-bold text-primary">Class Code: {createdClass.classCode}</p>
                    <p className="text-sm text-gray-600 mt-2">Share this code with your students for attendance</p>
                  </div>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="dashboard-form">
        <label htmlFor="year">Year:</label>
      <select
        name="year"
        value={formData.year}
        onChange={handleChange}
        required
        className="form-input"
      >
        <option value="">--Select Year--</option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
      </select>
      <select
        name="branch"
        value={formData.branch}
        onChange={handleChange}
        required
        className="form-input"
      >
        <option value="">--Select Branch--</option>
        <option value="Computer Science">Computer Science</option>
        <option value="Electrical Engineering">Electrical Engineering</option>
        <option value="Mechanical Engineering">Mechanical Engineering</option>
        <option value="Civil Engineering">Civil Engineering</option>
        <option value="Electronics Engineering">Electronics Engineering</option>
        <option value="Information Technology">Information Technology</option>
      </select>
          <input
            type="text"
            name="subject"
            placeholder="Subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className="form-input"
          />
          <input
            type="text"
            name="className"
            placeholder="Class Name"
            value={formData.className}
            onChange={handleChange}
            required
            className="form-input"
          />
          <input
            type="text"
            name="teacherName"
            placeholder="Teacher Name"
            value={formData.teacherName}
            onChange={handleChange}
            required
            className="form-input"
          />
           <label htmlFor="day">Day:</label>
      <select
        name="day"
        value={formData.day}
        onChange={handleChange}
        required
        className="form-input"
      >
        <option value="">--Select Day--</option>
        <option value="Monday">Monday</option>
        <option value="Tuesday">Tuesday</option>
        <option value="Wednesday">Wednesday</option>
        <option value="Thursday">Thursday</option>
        <option value="Friday">Friday</option>
        <option value="Saturday">Saturday</option>
        <option value="Sunday">Sunday</option>
      </select>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="form-input"
          />
          <input
            type="time"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            required
            className="form-input"
          />
          <input
            type="time"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            required
            className="form-input"
          />
          <button type="submit" className="form-button">Create Class</button>
        </form>
      </div>
    </div>
  );
};

export default TeacherDashboard;
