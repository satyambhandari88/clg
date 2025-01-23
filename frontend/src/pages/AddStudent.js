
import React, { useState, useEffect } from 'react';
import '../styles/AddStudent.css';

const CSVUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type !== 'text/csv') {
      setError('Please upload a CSV file');
      setFile(null);
      return;
    }
    setError('');
    setFile(selectedFile);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/api/admin/upload-csv', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error uploading file');
      }

      if (data.success) {
        setFile(null);
        if (onUploadSuccess) {
          onUploadSuccess();
        }
        alert('Students uploaded successfully!');
      }
    } catch (error) {
      setError(error.message || 'Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="csv-upload-section p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Upload Students via CSV</h2>
      <form onSubmit={handleUpload} className="space-y-4">
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium">
            Choose CSV File:
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </label>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {file && (
            <p className="text-sm text-gray-600">
              Selected file: {file.name}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={!file || uploading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md
            hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed
            transition-colors duration-200"
        >
          {uploading ? 'Uploading...' : 'Upload CSV'}
        </button>
      </form>
    </div>
  );
};

const AddStudent = () => {
  const [formData, setFormData] = useState({
    rollNumber: '',
    name: '',
    email: '',
    password: '',
    department: '',
    year: '',
    faceData: '',
  });

  const [students, setStudents] = useState([]);
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/students');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch students');
      }
      setStudents(data.students);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/admin/add-student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      alert(data.message);
      fetchStudents();
      setFormData({
        rollNumber: '',
        name: '',
        email: '',
        password: '',
        department: '',
        year: '',
        faceData: '',
      });
    } catch (error) {
      alert('Error adding student');
    }
  };

  return (
    <div className="add-student-container">
      <div className="form-box">
        <CSVUpload onUploadSuccess={fetchStudents} />
        <h1 className="form-title">Add Student</h1>
        <form onSubmit={handleSubmit} className="student-form">
          <input
            type="text"
            name="rollNumber"
            placeholder="Roll Number"
            onChange={handleChange}
            className="form-input"
            value={formData.rollNumber}
            required
          />
          <input
            type="text"
            name="name"
            placeholder="Name"
            onChange={handleChange}
            className="form-input"
            value={formData.name}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="form-input"
            value={formData.email}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="form-input"
            value={formData.password}
            required
          />
          <select
            name="department"
            value={formData.department}
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
          <input
            type="text"
            name="faceData"
            placeholder="Facial Recognition Data"
            onChange={handleChange}
            className="form-input"
            value={formData.faceData}
          />
          <button type="submit" className="submit-button">Add Student</button>
        </form>
      </div>

      <div className="table-box">
        <h2 className="table-title">Students List</h2>
        <table className="students-table">
          <thead>
            <tr>
              <th>Roll Number</th>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Year</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', color: 'black' }}>No students found</td>
              </tr>
            ) : (
              students.map((student, index) => (
                <tr key={index}>
                  <td style={{ textAlign: 'center', color: 'black' }}>{student.rollNumber}</td>
                  <td style={{ textAlign: 'center', color: 'black' }}>{student.name}</td>
                  <td style={{ textAlign: 'center', color: 'black' }}>{student.email}</td>
                  <td style={{ textAlign: 'center', color: 'black' }}>{student.department}</td>
                  <td style={{ textAlign: 'center', color: 'black' }}>{student.year}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AddStudent;