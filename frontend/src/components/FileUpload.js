import React, { useState, useRef } from 'react';
import axios from 'axios';

const FileUpload = ({ onFileUploaded }) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (!file) return;
    
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      setError('Please select an Excel file (.xlsx or .xls)');
      return;
    }
    
    uploadFile(file);
  };

  const uploadFile = async (file) => {
    try {
      setUploading(true);
      setError(null);
      setUploadResult(null);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post('/upload-excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log('Upload progress:', percentCompleted + '%');
        },
      });
      
      setUploadResult(response.data);
      
      // Call the callback to refresh dashboard
      if (onFileUploaded) {
        setTimeout(() => {
          onFileUploaded();
        }, 1000);
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      setError(
        error.response?.data?.detail || 
        'Failed to upload file. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleInputChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const clearData = async () => {
    try {
      setUploading(true);
      await axios.delete('/clear-data');
      setUploadResult(null);
      setError(null);
      alert('All data cleared successfully!');
      if (onFileUploaded) {
        onFileUploaded();
      }
    } catch (error) {
      setError('Failed to clear data. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Upload SLA Data
        </h1>
        <p className="text-gray-600">
          Import your Excel file to analyze individual and team SLA performance
        </p>
      </div>

      {/* Upload Area */}
      <div className="max-w-2xl mx-auto">
        <div
          className={`file-upload-area ${
            dragOver ? 'dragover' : ''
          } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          data-testid="file-upload-area"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleInputChange}
            className="hidden"
            data-testid="file-input"
          />
          
          {uploading ? (
            <div className="space-y-4">
              <div className="loading-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <div className="text-lg font-medium text-gray-700">
                Processing your Excel file...
              </div>
              <div className="text-sm text-gray-500">
                This may take a few moments
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-6xl">📊</div>
              <div className="text-xl font-semibold text-gray-700">
                Drop your Excel file here
              </div>
              <div className="text-gray-500">
                or click to browse and select a file
              </div>
              <div className="text-sm text-gray-400">
                Supports .xlsx and .xls formats
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4" data-testid="error-message">
            <div className="flex items-center gap-3">
              <div className="text-red-500 text-xl">❌</div>
              <div>
                <div className="font-semibold text-red-800">Upload Failed</div>
                <div className="text-red-600 text-sm">{error}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {uploadResult && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6" data-testid="success-message">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-green-500 text-2xl">✅</div>
              <div>
                <div className="font-semibold text-green-800 text-lg">
                  File Uploaded Successfully!
                </div>
                <div className="text-green-600">
                  {uploadResult.file_name}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="text-2xl font-bold text-green-600">
                  {uploadResult.tickets_processed?.toLocaleString()}
                </div>
                <div className="text-sm text-green-700">Tickets Processed</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="text-2xl font-bold text-green-600">
                  {uploadResult.agents_created?.toLocaleString()}
                </div>
                <div className="text-sm text-green-700">Agents Created</div>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-green-600">
              You can now view the dashboard to see your SLA performance metrics.
            </div>
          </div>
        </div>
      )}

      {/* Data Management */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Data Management
          </h3>
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Upload multiple files to combine data or clear existing data to start fresh.
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="btn btn-primary"
                data-testid="browse-files-btn"
              >
                📁 Browse Files
              </button>
              <button
                onClick={clearData}
                disabled={uploading}
                className="btn btn-secondary text-red-600 hover:text-red-700"
                data-testid="clear-data-btn"
              >
                🗑️ Clear All Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            📋 Expected Excel File Format
          </h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>Your Excel file should contain the following columns:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <strong>Required Columns:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>SR Number</li>
                  <li>Resolved By</li>
                  <li>Updated Resolved By Team</li>
                  <li>Response SLA Status</li>
                  <li>Resolution SLA Status</li>
                </ul>
              </div>
              <div>
                <strong>Optional Columns:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Created</li>
                  <li>Area / Sub Area</li>
                  <li>Status</li>
                  <li>Response Time (hh:mm)</li>
                  <li>Resolution Time (hh:mm)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
