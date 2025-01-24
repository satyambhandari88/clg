const AddClass = require('../models/AddClass');
const CreateClass = require('../models/CreateClass');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const haversine = require('haversine-distance');

// Fetch class notifications for a student

exports.fetchNotifications = async (req, res) => {
  try {
    const { rollNumber } = req.params;

    // Fetch student details
    const student = await Student.findOne({ rollNumber });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Use server time consistently
    const serverTime = new Date();
    const formattedDate = serverTime.toISOString().split('T')[0];

    // Fetch classes for student's year and department scheduled for today
    const classes = await CreateClass.find({
      year: student.year.toString(),
      branch: student.department,
      date: formattedDate
    }).sort({ startTime: 1 });

    // Process each class to determine its exact status
    const notifications = await Promise.all(classes.map(async (classInfo) => {
      // Create a new Date object for consistent time comparison
      const classDate = new Date(classInfo.date);
      const [startHour, startMinute] = classInfo.startTime.split(':');
      const [endHour, endMinute] = classInfo.endTime.split(':');
      
      const classStartTime = new Date(classDate.getFullYear(), classDate.getMonth(), classDate.getDate(), 
                                       parseInt(startHour), parseInt(startMinute), 0);
      const classEndTime = new Date(classDate.getFullYear(), classDate.getMonth(), classDate.getDate(), 
                                     parseInt(endHour), parseInt(endMinute), 0);
      
      // Check if attendance already exists
      const existingAttendance = await Attendance.findOne({
        rollNumber,
        className: classInfo.className,
        subject: classInfo.subject,
        time: {
          $gte: new Date(classInfo.date + 'T00:00:00'),
          $lt: new Date(classInfo.date + 'T23:59:59')
        }
      });

      // Calculate precise timing using server time
      const minutesUntilStart = (classStartTime - serverTime) / (1000 * 60);
      const minutesFromStart = (serverTime - classStartTime) / (1000 * 60);
      const isEnded = serverTime > classEndTime;

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
        minutesUntilStart: Math.max(0, Math.floor(minutesUntilStart)),
        minutesRemaining: status === 'active' ? Math.max(0, Math.floor(15 - minutesFromStart)) : 0,
        attendanceId: existingAttendance?._id
      };
    }));

    // Filter out expired classes
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


// Submit attendance
exports.submitAttendance = async (req, res) => {
  try {
    const { rollNumber, className, latitude, longitude, classCode } = req.body;

    console.log('Received attendance submission request:', req.body);

    // 1. Verify student exists
    const student = await Student.findOne({ rollNumber });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // 2. Get today's date
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // 3. Find the specific class for today
    const classDetails = await CreateClass.findOne({
      
      classCode: classCode,
      
    });

    if (!classDetails) {
      console.error('No matching class found for today:', { className, today });
      return res.status(404).json({ 
        message: 'No matching class found for today',
        details: { className, date: today, studentYear: student.year, studentBranch: student.department },
      });
    }

    // 4. Fetch geofencing data from AddClass model
    console.log('Searching for class location data with className:', className);
    const geoData = await AddClass.findOne({
      className: new RegExp(`^${className}$`, 'i'), // Case-insensitive match
    });

    if (!geoData) {
      console.error('Class location data not found for:', className);
      return res.status(404).json({ message: 'Class location data not found', requestedClassName: className });
    }

    console.log('Geofence data found:', geoData);

    // 5. Check if student is within geofence
    const userLocation = { latitude, longitude };
    const classLocation = { latitude: geoData.latitude, longitude: geoData.longitude };
    const distance = haversine(userLocation, classLocation);

    console.log('Distance from class location:', distance, 'Allowed radius:', geoData.radius);

    if (distance > geoData.radius) {
      return res.status(403).json({
        message: 'You are not within the class area',
        distance: Math.round(distance),
        allowedRadius: geoData.radius,
      });
    }

    // 6. Check timing
    const [startHour, startMinute] = classDetails.startTime.split(':').map(Number);
    const classStartTime = new Date();
    classStartTime.setHours(startHour, startMinute, 0, 0);

    const attendanceWindowEnd = new Date(classStartTime);
    attendanceWindowEnd.setMinutes(attendanceWindowEnd.getMinutes() + 15);

    if (now < classStartTime) {
      const minutesUntilStart = Math.ceil((classStartTime - now) / 60000);
      return res.status(403).json({
        message: 'Class has not started yet',
        minutesUntilStart,
      });
    }

    if (now > attendanceWindowEnd) {
      const minutesLate = Math.floor((now - classStartTime) / 60000 - 15);
      return res.status(403).json({
        message: 'Attendance window has expired',
        minutesLate,
      });
    }

    // 7. Check for existing attendance
    const existingAttendance = await Attendance.findOne({
      // rollNumber,
      // className,
      // time: {
      //   $gte: new Date(`${today}T00:00:00.000Z`),
      //   $lt: new Date(`${today}T23:59:59.999Z`),
      // },
      classCode,
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Attendance already submitted for this class' });
    }

    // 8. Save attendance
    const attendance = new Attendance({
      rollNumber,
      className,
      subject: classDetails.subject,
      status: 'Present',
      time: now,
    });

    await attendance.save();

    res.status(200).json({
      message: 'Attendance submitted successfully',
      details: {
        className: classDetails.className,
        subject: classDetails.subject,
        date: today,
        time: now.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error submitting attendance:', error);
    res.status(500).json({ message: 'Error submitting attendance', error: error.message });
  }
};


// Get student attendance history
exports.getAttendanceHistory = async (req, res) => {
  try {
    const { rollNumber } = req.params;
    
    // Verify student exists
    const student = await Student.findOne({ rollNumber });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Fetch attendance history with proper date handling
    const attendanceHistory = await Attendance.find({ rollNumber })
      .sort({ time: -1 })
      .lean(); // Use lean() for better performance

    // Format the response with proper date handling
    const formattedHistory = attendanceHistory.map(record => ({
      className: record.className,
      subject: record.subject,
      status: record.status,
      date: new Date(record.time).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      time: new Date(record.time).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }));

    res.status(200).json({ 
      success: true,
      history: formattedHistory 
    });
  } catch (error) {
    console.error('Error fetching attendance history:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching attendance history',
      error: error.message 
    });
  }
};
