const PDFDocument = require('pdfkit');
const moment = require('moment');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');

const generateAttendanceReport = async (req, res) => {
  try {
    const { year, branch, reportType, startDate, endDate } = req.query;

    // Validate input parameters
    if (!year || !branch || !reportType) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }

    // Calculate date range
    const dateRange = calculateDateRange(reportType, startDate, endDate);
    if (!dateRange) {
      return res.status(400).json({ message: 'Invalid date range' });
    }

    // Fetch data
    const students = await Student.find({
      year: parseInt(year),
      department: branch
    }).sort('rollNumber');

    if (students.length === 0) {
      return res.status(404).json({ message: 'No students found for given criteria' });
    }

    const attendanceRecords = await Attendance.find({
      rollNumber: { $in: students.map(s => s.rollNumber) },
      time: {
        $gte: dateRange.start.toDate(),
        $lt: dateRange.end.toDate()
      }
    });

    // Create PDF document
    const doc = new PDFDocument({
      margin: 50,
      size: 'A4'
    });

    // Buffer to store PDF data
    let buffers = [];

    // Collect PDF data
    doc.on('data', buffer => buffers.push(buffer));

    // Handle PDF completion
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      
      res.writeHead(200, {
        'Content-Length': Buffer.byteLength(pdfData),
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=attendance_report_${moment().format('YYYY-MM-DD')}.pdf`
      });
      
      res.end(pdfData);
    });

    // Generate PDF content
    generatePDFContent(doc, {
      students,
      attendanceRecords,
      year,
      branch,
      dateRange
    });

    // Finalize the PDF
    doc.end();

  } catch (error) {
    console.error('Error generating report:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error generating report', error: error.message });
    }
  }
};

const calculateDateRange = (reportType, startDate, endDate) => {
  const now = moment();
  
  switch (reportType) {
    case 'daily':
      return {
        start: now.startOf('day'),
        end: now.endOf('day')
      };
    case 'weekly':
      return {
        start: now.startOf('week'),
        end: now.endOf('week')
      };
    case 'monthly':
      return {
        start: now.startOf('month'),
        end: now.endOf('month')
      };
    case 'custom':
      if (!startDate || !endDate) return null;
      return {
        start: moment(startDate),
        end: moment(endDate)
      };
    default:
      return null;
  }
};

const generatePDFContent = (doc, { students, attendanceRecords, year, branch, dateRange }) => {
  // Header
  doc.fontSize(16)
     .text('Student Attendance Report', { align: 'center' })
     .moveDown();

  doc.fontSize(12)
     .text(`Year: ${year} | Branch: ${branch}`)
     .text(`Period: ${dateRange.start.format('YYYY-MM-DD')} to ${dateRange.end.format('YYYY-MM-DD')}`)
     .moveDown();

  // Get unique subjects
  const subjects = [...new Set(attendanceRecords.map(r => r.subject))].sort();

  // Table settings
  const startY = 180;
  const rowHeight = 30;
  const fontSize = 10;
  doc.fontSize(fontSize);

  // Calculate column widths
  const rollNoWidth = 80;
  const nameWidth = 120;
  const subjectWidth = Math.floor((doc.page.width - doc.page.margins.left - doc.page.margins.right - rollNoWidth - nameWidth) / subjects.length);

  // Draw table headers
  let currentX = doc.page.margins.left;
  let currentY = startY;

  // Header background
  doc.rect(currentX, currentY - 5, doc.page.width - doc.page.margins.left - doc.page.margins.right, rowHeight)
     .fill('#f0f0f0');

  // Header text
  doc.fillColor('black')
     .text('Roll No.', currentX, currentY, { width: rollNoWidth });
  currentX += rollNoWidth;

  doc.text('Name', currentX, currentY, { width: nameWidth });
  currentX += nameWidth;

  subjects.forEach(subject => {
    doc.text(subject, currentX, currentY, { width: subjectWidth, align: 'center' });
    currentX += subjectWidth;
  });

  // Draw student data
  students.forEach((student, index) => {
    currentY = startY + (index + 1) * rowHeight;
    currentX = doc.page.margins.left;

    // Add new page if needed
    if (currentY + rowHeight > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
      currentY = doc.page.margins.top + rowHeight;
      
      // Repeat headers on new page
      let headerX = doc.page.margins.left;
      doc.rect(headerX, currentY - rowHeight - 5, doc.page.width - doc.page.margins.left - doc.page.margins.right, rowHeight)
         .fill('#f0f0f0');
      
      doc.fillColor('black')
         .text('Roll No.', headerX, currentY - rowHeight, { width: rollNoWidth });
      headerX += rollNoWidth;
      
      doc.text('Name', headerX, currentY - rowHeight, { width: nameWidth });
      headerX += nameWidth;
      
      subjects.forEach(subject => {
        doc.text(subject, headerX, currentY - rowHeight, { width: subjectWidth, align: 'center' });
        headerX += subjectWidth;
      });
    }

    // Row background (alternate)
    if (index % 2 === 0) {
      doc.rect(currentX, currentY - 5, doc.page.width - doc.page.margins.left - doc.page.margins.right, rowHeight)
         .fill('#f9f9f9');
    }

    // Student data
    doc.fillColor('black')
       .text(student.rollNumber, currentX, currentY, { width: rollNoWidth });
    currentX += rollNoWidth;

    doc.text(student.name, currentX, currentY, { width: nameWidth });
    currentX += nameWidth;

    subjects.forEach(subject => {
      const subjectRecords = attendanceRecords.filter(
        record => record.rollNumber === student.rollNumber && record.subject === subject
      );

      const present = subjectRecords.filter(record => record.status === 'Present').length;
      const total = subjectRecords.length;
      const percentage = total ? ((present / total) * 100).toFixed(1) : 'N/A';

      doc.text(`${percentage}%`, currentX, currentY, { width: subjectWidth, align: 'center' });
      currentX += subjectWidth;
    });
  });
};

module.exports = {
  generateAttendanceReport
};