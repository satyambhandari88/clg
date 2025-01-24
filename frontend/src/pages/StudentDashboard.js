import React, { useState, useEffect, useMemo } from 'react';
import '../styles/StudentDashboard.css'; // Assuming the CSS file is named StudentDashboard.css
import { Alert, AlertDescription } from '../components/ui/alert';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import AttendanceModal from '../components/AttendanceModal';

const StudentDashboard = () => {
  const [notifications, setNotifications] = useState([]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [serverTimeDiff, setServerTimeDiff] = useState(0);

  const student = useMemo(() => JSON.parse(localStorage.getItem('studentInfo')), []);
  const token = student?.token;
  const API_BASE_URL = 'https://backend-9doo.onrender.com/api';

   const moment = require('moment-timezone');

exports.fetchNotifications = async (req, res) => {
  try {
    const { rollNumber } = req.params;

    // Use consistent timezone
    const serverTime = moment().tz('Asia/Kolkata');
    const formattedDate = serverTime.format('YYYY-MM-DD');

    // Fetch student details
    const student = await Student.findOne({ rollNumber });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Fetch classes for today
    const classes = await CreateClass.find({
      year: student.year.toString(),
      branch: student.department,
      date: formattedDate
    }).sort({ startTime: 1 });

    // Process notifications with precise time calculation
    const notifications = await Promise.all(classes.map(async (classInfo) => {
      // Create precise time objects
      const classDate = moment.tz(`${classInfo.date} ${classInfo.startTime}`, 'YYYY-MM-DD HH:mm', 'Asia/Kolkata');
      const classEndDate = moment.tz(`${classInfo.date} ${classInfo.endTime}`, 'YYYY-MM-DD HH:mm', 'Asia/Kolkata');

      // Check existing attendance
      const existingAttendance = await Attendance.findOne({
        rollNumber,
        className: classInfo.className,
        subject: classInfo.subject,
        time: {
          $gte: moment(classDate).startOf('day').toDate(),
          $lt: moment(classDate).endOf('day').toDate()
        }
      });

      // Calculate time differences
      const minutesUntilStart = classDate.diff(serverTime, 'minutes');
      const minutesFromStart = serverTime.diff(classDate, 'minutes');
      const isEnded = serverTime.isAfter(classEndDate);

      // Determine status
      let status;
      if (existingAttendance) {
        status = 'marked';
      } else if (isEnded) {
        status = 'expired';
      } else if (minutesFromStart >= 0 && minutesFromStart <= 15) {
        status = 'active';
      } else if (minutesUntilStart <= 5) {
        status = 'starting_soon';
      } else if (minutesUntilStart > 5) {
        status = 'upcoming';
      } else {
        status = 'expired';
      }

      return {
        className: classInfo.className,
        subject: classInfo.subject,
        teacherName: classInfo.teacherName,
        date: classInfo.date,
        startTime: classInfo.startTime,
        endTime: classInfo.endTime,
        day: classInfo.day,
        status,
        minutesUntilStart: Math.max(0, minutesUntilStart),
        minutesRemaining: status === 'active' ? Math.max(0, 15 - minutesFromStart) : 0,
        attendanceId: existingAttendance?._id
      };
    }));

    // Filter active notifications
    const activeNotifications = notifications.filter(n => n.status !== 'expired');

    res.status(200).json({ 
      notifications: activeNotifications,
      serverTime: serverTime.toISOString()
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};

  // Request notification permissions on component mount
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Initial data fetch and periodic refresh setup
  useEffect(() => {
    if (!student || !token) {
      setError('Authentication required. Please login again.');
      setLoading(false);
      return;
    }

    const fetchInitialData = async () => {
      try {
        await Promise.all([fetchNotifications(), fetchAttendanceHistory()]);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    // Check for updates more frequently (every 15 seconds)
    const intervalId = setInterval(fetchNotifications, 15000);

    return () => clearInterval(intervalId);
  }, [student, token]);

  const fetchAttendanceHistory = async () => {
    try {
      const response = await fetch(`https://backend-9doo.onrender.com/api/student/attendance-history/${student.rollNumber}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch attendance history');

      setAttendanceHistory(data.history || []);
    } catch (err) {
      setError('Failed to fetch attendance history. Please try again later.');
    }
  };

  if (!student) {
    return (
      <div className="studentdashboard-container">
        <Alert variant="destructive">
          <AlertDescription>Please login to access the dashboard</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="studentdashboard-container">
      <h1 className="studentdashboard-title">Student Dashboard</h1>
      
      {/* Student Info Card */}
      <Card className="info-card">
        <CardHeader className="card-header">
          <CardTitle className="card-title">Student Information</CardTitle>
        </CardHeader>
        <CardContent className="card-content">
          <div className="info-grid">
            <div>
              <p className="info-label">Name</p>
              <p className="info-value">{student.name}</p>
            </div>
            <div>
              <p className="info-label">Roll Number</p>
              <p className="info-value">{student.rollNumber}</p>
            </div>
            <div>
              <p className="info-label">Department</p>
              <p className="info-value">{student.department}</p>
            </div>
            <div>
              <p className="info-label">Year</p>
              <p className="info-value">{student.year}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Classes Card */}
      <Card className="classes-card">
        <CardHeader className="card-header">
          <CardTitle className="card-title">Today's Classes</CardTitle>
        </CardHeader>
        <CardContent className="card-content">
          {loading ? (
            <p className="loading-text">Loading classes...</p>
          ) : error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : notifications.length === 0 ? (
            <p className="no-data">No classes scheduled for today</p>
          ) : (
            <div className="notification-list">
              {notifications.map((notification, index) => (
                <div key={index} className="notification-card">
                  <div className="notification-header">
                    <div>
                      <h3 className="notification-title">{notification.className}</h3>
                      <p className="notification-subtitle">{notification.subject}</p>
                    </div>
                    <span className={`status-badge ${notification.status}`}>{notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}</span>
                  </div>
                  <div className="notification-details">
                    <p>Time: {notification.startTime} - {notification.endTime}</p>
                    <p>Teacher: {notification.teacherName}</p>
                  </div>
                  {notification.status === 'active' && (
                    <button
                      onClick={() => {
                        setSelectedClass(notification);
                        setShowCamera(true);
                      }}
                      className="attendance-button"
                    >
                      Mark Attendance
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attendance History Card */}
      <Card className=" history-card">
        <CardHeader className="card-header">
          <CardTitle className="card-title">Attendance History</CardTitle>
        </CardHeader>
        <CardContent className="card-content">
          {loading ? (
            <p className="loading-text">Loading attendance history...</p>
          ) : error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : attendanceHistory.length === 0 ? (
            <p className="no-data">No attendance history available</p>
          ) : (
            <div className="table-container">
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>Class</th>
                    <th>Subject</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceHistory.map((record, index) => (
                    <tr key={index}>
                      <td>{record.className}</td>
                      <td>{record.subject}</td>
                      <td>{record.date}</td>
                      <td>
                        <span  className={`status-badge ${record.status === 'Present' ? 'present' : 'absent'} status`}>{record.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attendance Modal */}
      {showCamera && selectedClass && (
        <AttendanceModal
          student={student}
          classDetails={selectedClass}
          onClose={() => {
            setShowCamera(false);
            setSelectedClass(null);
          }}
          onSuccess={() => {
            fetchAttendanceHistory();
            fetchNotifications();
            setShowCamera(false);
            setSelectedClass(null);
          }}
        />
      )}
    </div>
  );
};

export default StudentDashboard;
