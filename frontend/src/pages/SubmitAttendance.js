import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SubmitAttendance = ({ className, studentRollNumber }) => {
  const [location, setLocation] = useState({ latitude: 0, longitude: 0 });
  const [faceData, setFaceData] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    // Get the current location of the student
    navigator.geolocation.getCurrentPosition((position) => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    });
  }, []);

  const handleSubmitAttendance = async () => {
    try {
      const res = await axios.post('/api/students/attendance', {
        rollNumber: studentRollNumber,
        className,
        latitude: location.latitude,
        longitude: location.longitude,
        faceData, // Assuming the student has uploaded their facial recognition data
      });

      setStatus(res.data.message); // Show success or failure message
    } catch (error) {
      console.error('Error submitting attendance:', error);
      setStatus('Error submitting attendance.');
    }
  };

  return (
    <div className="attendance-form">
      <h2>Submit Attendance for {className}</h2>
      <div>
        <p>Status: {status}</p>
        <button onClick={handleSubmitAttendance}>Submit Attendance</button>
      </div>
    </div>
  );
};

export default SubmitAttendance;
