import React, { useState, useEffect } from 'react';
import { Search, Filter, SortAsc, SortDesc, Trash2, RefreshCcw, Download, Database, Clock, Sparkles, BarChart3, Zap } from 'lucide-react';
import DSAAlgorithms from '../utils/DSAAlgorithms';
import * as XLSX from 'xlsx';

const DataTable = ({ data, onDataChange, fileName }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchColumn, setSearchColumn] = useState('');
  const [sortColumn, setSortColumn] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filteredData, setFilteredData] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isDataSorted, setIsDataSorted] = useState(false);
  const [lastSearchAlgorithm, setLastSearchAlgorithm] = useState('');
  const [lastSortAlgorithm, setLastSortAlgorithm] = useState('');
  const [cacheInfo, setCacheInfo] = useState({ size: 0, keys: [] });
  const [originalData, setOriginalData] = useState([]);

  useEffect(() => {
    setOriginalData([...data]);
    setFilteredData([]);
    setSearchResults([]);
    setIsDataSorted(false);
    if (fileName) DSAAlgorithms.invalidateFileCache(fileName);
  }, [data, fileName]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCacheInfo(DSAAlgorithms.getCacheInfo());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const columns = data.length > 0 ? Object.keys(data[0]) : [];
  const tableData = filteredData.length ? filteredData : data;

  const handleSearch = () => {
    if (!searchTerm || !searchColumn) return;
    const results = DSAAlgorithms.intelligentSearch(originalData, searchColumn, searchTerm, fileName);
    setSearchResults(results);
    setFilteredData(results.map(r => r.item));
    setLastSearchAlgorithm(DSAAlgorithms.getBestSearchAlgorithm(originalData.length));
  };

  const handleSort = () => {
    if (!sortColumn) return;
    const source = filteredData.length ? filteredData : [...originalData];
    const sorted = DSAAlgorithms.intelligentSort(source, sortColumn, sortOrder, fileName);
    setFilteredData(sorted);
    setIsDataSorted(true);
    setLastSortAlgorithm(DSAAlgorithms.getBestSortAlgorithm(source.length));
  };

  const handleReset = () => {
    setFilteredData([]);
    setSearchResults([]);
    setSearchTerm('');
    setSearchColumn('');
    setSortColumn('');
    setSortOrder('asc');
    setIsDataSorted(false);
    setLastSearchAlgorithm('');
    setLastSortAlgorithm('');
    onDataChange([...originalData]);
  };

  const handleDeleteRow = (index) => {
    const updated = [...tableData];
    updated.splice(index, 1);
    if (filteredData.length) setFilteredData(updated);
    onDataChange(updated);
    if (fileName) DSAAlgorithms.invalidateFileCache(fileName);
  };

  const handleCellEdit = (rowIndex, colKey, newValue) => {
    const updated = [...tableData];
    updated[rowIndex][colKey] = newValue;
    if (filteredData.length) setFilteredData(updated);
    onDataChange(updated);
    if (fileName) DSAAlgorithms.invalidateFileCache(fileName);
  };

  // const handleDownload = () => {
  //   const exportData = tableData.map(row => {
  //     const completeRow = {};
  //     columns.forEach(col => completeRow[col] = row[col] || '');
  //     return completeRow;
  //   });
  //   const worksheet = XLSX.utils.json_to_sheet(exportData);
  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  //   XLSX.writeFile(workbook, fileName || 'output.xlsx');
  // };

  const handleClearCache = () => {
    DSAAlgorithms.clearCache();
    setCacheInfo(DSAAlgorithms.getCacheInfo());
    alert('Cache cleared!\n\nIf your data was showing outdated values or was not updating properly, it is now refreshed.');
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-cyan-50 rounded-xl shadow-lg p-6 border border-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="bg-gradient-to-r from-cyan-400 to-blue-500 p-3 rounded-lg">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div className="ml-4">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-cyan-600 bg-clip-text text-transparent">
              Data Management
            </h2>
            <p className="text-slate-500 text-sm">
              {tableData.length} rows • {columns.length} columns
            </p>
          </div>
        </div>
        <Sparkles className="w-6 h-6 text-cyan-500" />
      </div>

      {/* //Algorithm Recommendations
      <div className="bg-white rounded-lg p-4 mb-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-cyan-400 to-blue-500 p-2 rounded-lg">
                <Search className="w-4 h-4 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-slate-700">Recommended Search</p>
                <p className="text-xs text-slate-500">{DSAAlgorithms.getBestSearchAlgorithm(originalData.length)}</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-cyan-400 to-blue-500 p-2 rounded-lg">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-slate-700">Recommended Sort</p>
                <p className="text-xs text-slate-500">{DSAAlgorithms.getBestSortAlgorithm(originalData.length)}</p>
              </div>
            </div>
          </div>
          <button 
            onClick={handleClearCache} 
            className="flex items-center px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
          >
            <Zap className="w-4 h-4 mr-2" />
            Clear Cache
          </button>
        </div>
      </div> */}

      {/* Search and Sort Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Search Section */}
        <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="bg-gradient-to-r from-cyan-400 to-blue-500 p-2 rounded-lg">
              <Search className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 ml-3">Search Data</h3>
          </div>
          <div className="space-y-3">
            <select 
              value={searchColumn} 
              onChange={e => setSearchColumn(e.target.value)} 
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-slate-50"
            >
              <option value="">Select Column to Search</option>
              {columns.map(col => <option key={col} value={col}>{col}</option>)}
            </select>
            <div className="flex gap-2">
              <input 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                placeholder="Enter search term..." 
                className="flex-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-slate-50"
              />
              <button 
                onClick={handleSearch} 
                className="flex items-center justify-center px-3 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Sort Section */}
        <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="bg-gradient-to-r from-cyan-400 to-blue-500 p-2 rounded-lg">
              <SortAsc className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 ml-3">Sort Data</h3>
          </div>
          <div className="space-y-3">
            <select 
              value={sortColumn} 
              onChange={e => setSortColumn(e.target.value)} 
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-slate-50"
            >
              <option value="">Select Column to Sort</option>
              {columns.map(col => <option key={col} value={col}>{col}</option>)}
            </select>
            <div className="flex gap-2">
              <select 
                value={sortOrder} 
                onChange={e => setSortOrder(e.target.value)} 
                className="flex-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-slate-50"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
              <button 
                onClick={handleSort} 
                className="flex items-center justify-center px-3 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
              >
                {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
<div className="flex flex-wrap gap-3 mb-6 items-center">
  <button 
    onClick={handleReset} 
    className="flex items-center px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
  >
    <RefreshCcw className="w-4 h-4 mr-2" />
    Reset
  </button>

  <div className="flex items-center gap-2">
    <button 
      onClick={handleClearCache} 
      className="flex items-center px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
    >
      <Zap className="w-4 h-4 mr-2" />
      Clear Cache
    </button>
    <p className="text-slate-400 text-sm">
      Not seeing your recent edits? Clear cache to reload data.
    </p>
  </div>
</div>

      {/* Data Table */}
      <div className="bg-white shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-100 to-cyan-100 border-b border-slate-200">
              <tr>
                {columns.map(col => (
                  <th key={col} className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    {col}
                  </th>
                ))}
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {tableData.map((row, i) => (
                <tr key={i} className="hover:bg-gradient-to-r hover:from-slate-50 hover:to-cyan-50 transition-all duration-150">
                  {columns.map(col => (
                    <td key={col} className="px-6 py-4 border-r border-slate-200">
                      <input 
                        value={row[col] || ''} 
                        onChange={e => handleCellEdit(i, col, e.target.value)} 
                        className="w-full p-2 border border-slate-300 bg-slate-50 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      />
                    </td>
                  ))}
                  <td className="px-6 py-4 text-center border-r border-slate-200">
                    <button 
                      onClick={() => handleDeleteRow(i)} 
                      className="flex items-center justify-center p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-150"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {tableData.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-gradient-to-r from-slate-100 to-cyan-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Database className="w-8 h-8 text-slate-500" />
          </div>
          <p className="text-slate-500 text-lg">No data to display</p>
          <p className="text-slate-400 text-sm">Upload a file to get started</p>
        </div>
      )}
    </div>
  );
};

export default DataTable;


