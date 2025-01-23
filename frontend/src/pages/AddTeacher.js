import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/AddTeacher.css'; // Import the CSS file

const AddTeacher = () => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    password: '',
    department: '',
  });
  const [teachers, setTeachers] = useState([]); // Initialize as an empty array

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const fetchTeachers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/teachers');
      setTeachers(response.data.teachers || []); // Default to an empty array if undefined
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setTeachers([]); // Set to an empty array on error
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/admin/add-teacher', formData);
      alert(response.data.message);
      fetchTeachers(); // Refresh the teacher list
      setFormData({
        id: '',
        name: '',
        email: '',
        password: '',
        department: '',
      });
    } catch (error) {
      alert('Error adding teacher');
    }
  };

  return (
    <div className="add-teacher-container">
      <h1>Add Teacher</h1>
      <form onSubmit={handleSubmit} className="add-teacher-form">
        <input
          type="text"
          name="id"
          placeholder="Teacher ID"
          value={formData.id}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
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
        <button type="submit">Add Teacher</button>
      </form>

      <h2>Added Teachers</h2>
      {teachers.length > 0 ? (
        <table className="teachers-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((teacher) => (
              <tr key={teacher.id}>
                <td>{teacher.id}</td>
                <td>{teacher.name}</td>
                <td>{teacher.email}</td>
                <td>{teacher.department}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No teachers added yet.</p>
      )}
    </div>
  );
};

export default AddTeacher;
