import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/AddClass.css'; // Import the CSS file

const AddClass = () => {
  const [formData, setFormData] = useState({
    className: '',
    longitude: '',
    latitude: '',
    radius: '',
  });
  const [classes, setClasses] = useState([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const fetchClasses = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/classes');
      setClasses(response.data.classes);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/admin/add-class', formData);
      alert(response.data.message);
      fetchClasses(); // Refresh the class list
      setFormData({ className: '', longitude: '', latitude: '', radius: '' });
    } catch (error) {
      alert('Error adding class');
    }
  };

  return (
    <div className="add-class-container">
      <h1>Add Class</h1>
      <form onSubmit={handleSubmit} className="add-class-form">
        <input
          type="text"
          name="className"
          placeholder="Class Name"
          value={formData.className}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="longitude"
          placeholder="Longitude"
          value={formData.longitude}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="latitude"
          placeholder="Latitude"
          value={formData.latitude}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="radius"
          placeholder="Radius (meters)"
          value={formData.radius}
          onChange={handleChange}
          required
        />
        <button type="submit">Add Class</button>
      </form>

      <h2>Added Classes</h2>
      <table className="classes-table">
        <thead>
          <tr>
            <th>Class Name</th>
            <th>Longitude</th>
            <th>Latitude</th>
            <th>Radius</th>
          </tr>
        </thead>
        <tbody>
          {classes.map((cls) => (
            <tr key={cls.className}>
              <td>{cls.className}</td>
              <td>{cls.longitude}</td>
              <td>{cls.latitude}</td>
              <td>{cls.radius}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AddClass;
