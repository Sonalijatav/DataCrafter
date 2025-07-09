import * as XLSX from 'xlsx';
import React, { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import DataTable from './components/DataTable';
import SheetCreator from './components/SheetCreator';
import AuthComponent from './components/AuthComponent';
import UserProfile from './components/UserProfile';
import AdminPanel from './components/AdminPanel';
import DSAAlgorithms from './utils/DSAAlgorithms';
import { Download, FileText, Shield, Users, Upload, Database, User } from 'lucide-react';

const App = () => {
  const [user, setUser] = useState(null);
  const [currentData, setCurrentData] = useState([]);
  const [fileName, setFileName] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSorted, setIsSorted] = useState(false);
  const [sheetData, setSheetData] = useState([]);
  const [sheetName, setSheetName] = useState('');
  const [activeTab, setActiveTab] = useState('upload');
  const [isAdminMode, setIsAdminMode] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_URL;

  // Check for existing token on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
  
    const verifyToken = async () => {
      try {
        // const res = await fetch('http://localhost:5000/api/auth/verify', {
        const res = await fetch(`${BASE_URL}/api/auth/verify`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
          if (data.user.email === 'sonalijatav100@gmail.com') {
            setIsAdminMode(true);
          }
        } else {
          localStorage.removeItem('token');
        }
      } catch (err) {
        console.error('Token verification failed:', err);
        localStorage.removeItem('token');
      }
    };
  
    verifyToken();
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    setUser(userData);
    
    // Check if user is admin
    if (userData.email === 'sonalijatav100@gmail.com') {
      setIsAdminMode(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setCurrentData([]);
    setFileName('');
    setSearchResults([]);
    setIsSorted(false);
    setSheetData([]);
    setSheetName('');
    setIsAdminMode(false);
    setActiveTab('upload');
  };

  const handleFileLoad = (data, name) => {
    setCurrentData(data);
    setFileName(name);
    setSearchResults([]);
    setIsSorted(false);
    setActiveTab('table');
  };

  const handleSearch = (key, query) => {
    const algorithm = DSAAlgorithms.getBestSearchAlgorithm(currentData.length, isSorted);
    const result =
      algorithm === 'binarySearch'
        ? DSAAlgorithms.binarySearch(currentData, key, query)
        : DSAAlgorithms.linearSearch(currentData, key, query);
    setSearchResults(result);
  };

  const handleSort = (key, order = 'asc') => {
    const algorithm = DSAAlgorithms.getBestSortAlgorithm(currentData.length);
    const sorted = DSAAlgorithms[algorithm]([...currentData], key, order);
    setCurrentData(sorted);
    setIsSorted(true);
    setSearchResults([]);
  };

  const handleDownload = () => {
    if (!currentData.length) return;
    const ws = XLSX.utils.json_to_sheet(currentData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `${fileName.split('.')[0]}_processed.xlsx`);
  };

  const handleSheetCreate = async (data, name) => {
    setSheetData(data);
    setSheetName(name);
    setCurrentData(data);
    setFileName(name);
    setActiveTab('table');
  };

  const toggleAdminMode = () => {
    setIsAdminMode(!isAdminMode);
    setActiveTab(isAdminMode ? 'upload' : 'admin');
  };

  if (!user) return <AuthComponent onLogin={handleLogin} />;

  // Show admin panel if in admin mode
  if (isAdminMode && user.email === 'sonalijatav100@gmail.com') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50 pt-32">
        
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-lg">
  <div className="w-full px-0"> 
    <div className="flex justify-between items-center h-16">
      
      {/* LEFT: Admin Panel title */}
      <div className="flex items-center ml-4">
        <div className="p-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg mr-2">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-cyan-600 bg-clip-text text-transparent">
          Admin Panel
        </h1>
      </div>

      {/* RIGHT: Buttons */}
      <div className="flex items-center space-x-4 mr-4">
        <div className="">
                <span className="text-slate-600 font-medium">Welcome, {user.email}</span>
        </div>
        <button
          onClick={toggleAdminMode}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-4 py-2 rounded-lg flex items-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <FileText className="w-4 h-4 mr-2" />
          Switch to User Mode
        </button>

        <button
          onClick={handleLogout}
          className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          Logout
        </button>
      </div>
    </div>
  </div>
</header>

        <AdminPanel user={user} />
      </div>
    );
  }

  const tabIcons = {
    upload: Upload,
    table: Database,
    create: FileText,
    profile: User
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50">

      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-lg">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg">
                <Database className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-cyan-600 bg-clip-text text-transparent">
                DataCrafter
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="">
                <span className="text-slate-600 font-medium">Welcome, {user.email}</span>
              </div>
              {user.email === 'sonalijatav100@gmail.com' && (
                <button
                  onClick={toggleAdminMode}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-4 py-2 rounded-lg flex items-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Switch to Admin Panel
                </button>
              )}
              
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
        
        <nav className="bg-gradient-to-r from-white/90 to-cyan-50/90 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              {['upload', 'table', 'create', 'profile'].map(tab => {
                const Icon = tabIcons[tab];
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-3 border-b-2 font-medium text-sm transition-all duration-200 flex items-center space-x-2 ${
                      activeTab === tab
                        ? 'border-cyan-500 text-cyan-600 bg-gradient-to-t from-cyan-100/60 to-transparent'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 hover:bg-gradient-to-t hover:from-slate-50/60 hover:to-transparent'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      </header>

      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-8">


        {activeTab === 'upload' && (
          <div className="space-y-6">
            <FileUpload onFileLoad={handleFileLoad} />
            {currentData.length > 0 && (
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-cyan-200">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-slate-100 to-cyan-100 rounded-lg">
                      <FileText className="w-5 h-5 text-cyan-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700">File Loaded: {fileName}</h3>
                  </div>
                  <button
                    onClick={handleDownload}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-2 rounded-lg flex items-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </button>
                </div>
                <div className="bg-gradient-to-r from-slate-50 to-cyan-50 p-4 rounded-lg border border-slate-200">
                  <p className="text-slate-600">
                    {currentData.length} rows loaded. Switch to Table tab to view and edit.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'table' && (
          <div className="space-y-6">
            {currentData.length > 0 ? (
              <>
                <div className="flex justify-between items-center bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-cyan-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-slate-100 to-cyan-100 rounded-lg">
                      <Database className="w-5 h-5 text-cyan-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-700">Data Table - {fileName}</h2>
                  </div>
                  <button
                    onClick={handleDownload}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-2 rounded-lg flex items-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </button>
                </div>
                <DataTable
                  data={searchResults.length ? searchResults : currentData}
                  onDataChange={setCurrentData}
                  onSearch={handleSearch}
                  onSort={handleSort}
                  fileName={fileName}
                />
              </>
            ) : (
              <div className="text-center py-12 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-cyan-200">
                <div className="p-4 bg-gradient-to-r from-slate-100 to-cyan-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-cyan-600" />
                </div>
                <p className="text-slate-600 text-lg">No data loaded. Upload a file or create a new sheet first.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'create' && (
          <div className="space-y-6">
            <SheetCreator onCreateSheet={handleSheetCreate} />
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6">
            <UserProfile
              userEmail={user.email}
              onOpenSheet={({ title, rows }) => {
                setCurrentData(rows);
                setFileName(title);
                setSearchResults([]);
                setIsSorted(false);
                setActiveTab('table');
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;


