import React, { useState } from 'react';
import { Upload, FileText, FileSpreadsheet, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

const FileUpload = ({ onFileLoad }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);


  const handleFile = async (file) => {
    if (!file) return;
    
    setIsUploading(true);
    setUploadStatus('');
    
    try {
      const name = file.name;
      const ext = name.split('.').pop().toLowerCase();
      let jsonData = null;

      if (ext === 'csv') {
        const text = await file.text();
        const result = Papa.parse(text, { header: true });
        jsonData = result.data;
      } else if (ext === 'xlsx' || ext === 'xls') {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        jsonData = XLSX.utils.sheet_to_json(worksheet);
      } else {
        setUploadStatus('error');
        setIsUploading(false);
        return;
      }

      // Call parent handler to set state and switch tab
      if (onFileLoad) {
        onFileLoad(jsonData, name);
      }

      // Optional: upload to backend
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setUploadStatus('no-auth');
          setIsUploading(false);
          return;
        }

        const res = await fetch('http://localhost:5000/api/users/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fileName: name,
            data: jsonData,
            type: ext,
          }),
        });

        const response = await res.json();
        if (response.success) {
          setUploadStatus('success');
        } else {
          setUploadStatus('error');
        }
      } catch (error) {
        console.error('Upload error:', error);
        setUploadStatus('error');
      }
    } catch (error) {
      console.error('File processing error:', error);
      setUploadStatus('error');
    }
    
    setIsUploading(false);
  };

  const MAX_FILE_SIZE_MB = 10;

  const handleFileInput = (e) => {
    const file = e.target.files[0];
  if (file && file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    alert('🚫 File too large. Please upload a file smaller than 10MB.');
    return;
  }
    handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      alert('🚫 File too large. Please upload a file smaller than 10MB.');
      return;
    }
    handleFile(file);
  };

  const getStatusMessage = () => {
    switch (uploadStatus) {
      case 'success':
        return (
          <div className="flex items-center text-emerald-700 bg-gradient-to-r from-emerald-50 to-cyan-50 p-3 rounded-lg border border-emerald-200">
            <CheckCircle className="w-5 h-5 mr-2" />
            File uploaded and processed successfully!
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center text-red-800 bg-gradient-to-r from-red-50 to-pink-50 p-3 rounded-lg border border-red-200">
            <AlertCircle className="w-5 h-5 mr-2" />
            Upload failed. Please try again or check file format.
          </div>
        );
      case 'no-auth':
        return (
          <div className="flex items-center text-red-800 bg-gradient-to-r from-red-50 to-pink-50 p-3 rounded-lg border border-red-200">
            <AlertCircle className="w-5 h-5 mr-2" />
            Please login to save files to your account.
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-cyan-50 rounded-xl shadow-lg p-8 border border-slate-200">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-gradient-to-r from-cyan-400 to-blue-500 p-3 rounded-full">
            <Upload className="w-8 h-8 text-white" />
          </div>
          <Sparkles className="w-6 h-6 text-cyan-500 ml-2" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-cyan-600 bg-clip-text text-transparent mb-2">
          Upload Your Data
        </h2>
        <p className="text-slate-500">
          Drag and drop your files or click to browse
        </p>
      </div>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
          isDragging
            ? 'border-cyan-400 bg-gradient-to-r from-cyan-50 to-blue-50 scale-105'
            : 'border-slate-300 bg-white hover:border-cyan-300 hover:bg-gradient-to-r hover:from-slate-50 hover:to-cyan-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isUploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mb-4"></div>
            <p className="text-slate-600">Processing your file...</p>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-6">
              <div className={`bg-gradient-to-r p-4 rounded-full transition-all duration-300 ${
                isDragging 
                  ? 'from-cyan-400 to-blue-500 scale-110' 
                  : 'from-slate-400 to-cyan-500 hover:from-cyan-400 hover:to-blue-500'
              }`}>
                <Upload className="w-12 h-12 text-white" />
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-lg text-slate-700 mb-2">
                Drop your files here or{' '}
                <label className="text-cyan-600 hover:text-cyan-700 cursor-pointer font-semibold underline decoration-cyan-300">
                  browse
                  <input
                    type="file"
                    onChange={handleFileInput}
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                  />
                </label>
              </p>
              <p className="text-slate-500 text-sm">
                Supports CSV, Excel (.xlsx, .xls) files
              </p>
            </div>

            {/* File Type Icons */}
            <div className="flex justify-center space-x-6 mb-6">
              <div className="flex flex-col items-center">
                <div className="bg-gradient-to-r from-slate-100 to-cyan-100 p-3 rounded-lg">
                  <FileText className="w-8 h-8 text-slate-600" />
                </div>
                <span className="text-sm text-slate-500 mt-2">CSV</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-gradient-to-r from-slate-100 to-cyan-100 p-3 rounded-lg">
                  <FileSpreadsheet className="w-8 h-8 text-slate-600" />
                </div>
                <span className="text-sm text-slate-500 mt-2">Excel</span>
              </div>
            </div>

            {/* Upload Button */}
            <label className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-lg cursor-pointer transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg">
              <Upload className="w-5 h-5 mr-2" />
              Choose File
              <input
                type="file"
                onChange={handleFileInput}
                accept=".csv,.xlsx,.xls"
                className="hidden"
              />
            </label>
          </>
        )}
      </div>

      {/* Status Message */}
      {uploadStatus && (
        <div className="mt-6">
          {getStatusMessage()}
        </div>
      )}

      {/* Tips Section */}
      <div className="mt-8 p-4 bg-gradient-to-r from-slate-50 to-cyan-50 rounded-lg border border-slate-200">
        <div className="flex items-center mb-3">
          <div className="bg-gradient-to-r from-cyan-400 to-blue-500 p-2 rounded-lg">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-sm font-semibold text-slate-700 ml-3">Pro Tips</h3>
        </div>
        <ul className="text-sm text-slate-600 space-y-1">
          <li>• Ensure your CSV files have headers in the first row</li>
          <li>• Excel files should have data in the first worksheet</li>
          <li>• Files are automatically saved to your profile when logged in</li>
          <li>• Maximum file size: 10MB</li>
        </ul>
      </div>
    </div>
  );
};

export default FileUpload;



