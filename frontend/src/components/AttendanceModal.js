import React, { useState } from 'react';
import { Alert, AlertDescription } from '../components/ui/alert';

const AttendanceModal = ({ student, classDetails, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [classCode, setClassCode] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    try {
      // Get current location
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          (err) => reject(new Error("Failed to fetch location. Please enable location access.")),
          {
            enableHighAccuracy: true,
            timeout: 10000, // 10 seconds timeout
            maximumAge: 0,
          }
        );
      });
      
  
      const response = await fetch('http://localhost:5000/api/student/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${student.token}`,
        },
        body: JSON.stringify({
          rollNumber: student.rollNumber,
          className: classDetails.className,
          longitude: position.coords.longitude,
          latitude: position.coords.latitude,
          
          classCode: classCode,
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message);
      }
  
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to submit attendance');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Mark Attendance</h2>
        <h3 className="text-lg mb-4">{classDetails.className} - {classDetails.subject}</h3>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="classCode" className="block text-sm font-medium mb-1">
              Enter Class Code:
            </label>
            <input
              type="text"
              id="classCode"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value)}
              className="w-full p-2 border rounded"
              required
              placeholder="Enter the 5-digit class code"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-100"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Attendance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AttendanceModal;