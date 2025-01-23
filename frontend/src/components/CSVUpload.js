import React, { useState } from 'react';

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

export default CSVUpload;