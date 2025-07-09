import React, { useState, useEffect } from 'react';
import { Grid, Plus, Edit3, Sparkles, FileText, Settings, Zap } from 'lucide-react';

const SheetCreator = ({ onCreateSheet }) => {
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(5);
  const [sheetName, setSheetName] = useState('');
  const [columnNames, setColumnNames] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [isCreating, setIsCreating] = useState(false);


  // const BASE_API ="http://localhost:5000";
  const BASE_API = import.meta.env.VITE_API_URL;


  // Update column names and table data when rows/cols change
  useEffect(() => {
    setColumnNames(Array.from({ length: cols }, (_, i) => `Column ${i + 1}`));
    setTableData(
      Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => '')
      )
    );
  }, [rows, cols]);

  const handleColumnNameChange = (index, value) => {
    const newColumnNames = [...columnNames];
    newColumnNames[index] = value;
    setColumnNames(newColumnNames);
  };

  const handleCellChange = (rowIdx, colIdx, value) => {
    const newData = [...tableData];
    newData[rowIdx][colIdx] = value;
    setTableData(newData);
  };

  const handleCreateSheet = async () => {
    if (!sheetName) {
      alert('Please enter a sheet name');
      return;
    }

    setIsCreating(true);

    const data = tableData.map(row => {
      const rowObj = {};
      columnNames.forEach((col, idx) => {
        rowObj[col] = row[idx];
      });
      return rowObj;
    });

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Login first');
      setIsCreating(false);
      return;
    }

    try {
      const res = await fetch(`${BASE_API}/api/users/create-sheet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: sheetName, rows: data }),
      });

      const result = await res.json();
      if (result.success) {
        alert('Sheet saved successfully!');
        onCreateSheet(data, sheetName);
        // Reset form
        setSheetName('');
        setRows(5);
        setCols(5);
      } else {
        alert('Sheet save failed: ' + result.error);
      }
    } catch (error) {
      alert('An error occurred: ' + error.message);
    }

    setIsCreating(false);
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-cyan-50 rounded-xl shadow-lg p-6 border border-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="bg-gradient-to-r from-cyan-400 to-blue-500 p-3 rounded-lg">
            <Grid className="w-6 h-6 text-white" />
          </div>
          <div className="ml-4">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-cyan-600 bg-clip-text text-transparent">
              Create Custom Sheet
            </h2>
            <p className="text-slate-500 text-sm">
              Design your own data structure
            </p>
          </div>
        </div>
        <Sparkles className="w-6 h-6 text-cyan-500" />
      </div>

      {/* Configuration Panel */}
      <div className="bg-white rounded-lg p-5 mb-6 border border-slate-200 shadow-sm">
        <div className="flex items-center mb-4">
          <div className="bg-gradient-to-r from-cyan-400 to-blue-500 p-2 rounded-lg">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 ml-3">Sheet Configuration</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Sheet Name</label>
            <input
              type="text"
              value={sheetName}
              onChange={(e) => setSheetName(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-slate-50"
              placeholder="Enter sheet name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Rows</label>
            <input
              type="number"
              value={rows}
              onChange={(e) => setRows(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-slate-50"
              min="1"
              max="50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Columns</label>
            <input
              type="number"
              value={cols}
              onChange={(e) => setCols(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-slate-50"
              min="1"
              max="20"
            />
          </div>
        </div>
      </div>

      {/* Column Names Editor */}
      <div className="bg-white rounded-lg p-5 mb-6 border border-slate-200 shadow-sm">
        <div className="flex items-center mb-4">
          <div className="bg-gradient-to-r from-cyan-400 to-blue-500 p-2 rounded-lg">
            <Edit3 className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 ml-3">Column Names</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {columnNames.map((name, index) => (
            <div key={index} className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => handleColumnNameChange(index, e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-gradient-to-r from-slate-50 to-cyan-50"
                placeholder={`Column ${index + 1}`}
              />
              <div className="absolute top-1 right-1 bg-cyan-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Entry Table */}
      <div className="bg-white shadow-sm border border-slate-200 overflow-hidden mb-6">
        <div className="flex items-center p-4 bg-gradient-to-r from-slate-100 to-cyan-100 border-b border-slate-200">
          <div className="bg-gradient-to-r from-cyan-400 to-blue-500 p-2 rounded-lg">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 ml-3">Data Entry</h3>
        </div>
        
        <div className="overflow-x-auto max-h-96">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-100 to-cyan-100 border-b border-slate-200 sticky top-0">
              <tr>
                {columnNames.map((name, index) => (
                  <th key={index} className="px-4 py-3 text-left text-sm font-semibold text-slate-700 min-w-32 border-r border-slate-200">
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {tableData.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gradient-to-r hover:from-slate-50 hover:to-cyan-50 transition-all duration-150">
                  {row.map((cell, colIndex) => (
                    <td key={colIndex} className="px-4 py-2 border-r border-slate-200">
                      <input
                        type="text"
                        value={cell}
                        onChange={(e) =>
                          handleCellChange(rowIndex, colIndex, e.target.value)
                        }
                        className="w-full p-2 border border-slate-300 bg-slate-50 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        placeholder={`Row ${rowIndex + 1}`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Button */}
      <div className="flex justify-center">
        <button
          onClick={handleCreateSheet}
          disabled={isCreating}
          className="flex items-center px-8 py-4 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none shadow-lg"
        >
          {isCreating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Creating...
            </>
          ) : (
            <>
              <Plus className="w-5 h-5 mr-3" />
              Create Sheet
            </>
          )}
        </button>
      </div>

      {/* Tips Section */}
      <div className="mt-6 p-4 bg-gradient-to-r from-slate-50 to-cyan-50 rounded-lg border border-slate-200">
        <div className="flex items-center mb-3">
          <div className="bg-gradient-to-r from-cyan-400 to-blue-500 p-2 rounded-lg">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-sm font-semibold text-slate-700 ml-3">Quick Tips</h3>
        </div>
        <ul className="text-sm text-slate-600 space-y-1">
          <li>• Use descriptive column names for better data organization</li>
          <li>• You can adjust rows and columns after creation</li>
          <li>• Empty cells will be saved as blank values</li>
          <li>• Sheet will be automatically saved to your profile</li>
        </ul>
      </div>
    </div>
  );
};

export default SheetCreator;



