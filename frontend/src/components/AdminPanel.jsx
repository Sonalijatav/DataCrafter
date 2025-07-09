import React, { useState, useEffect } from 'react';
import { Users, FileText, Database, Activity, Trash2, Eye, Calendar, Mail, AlertCircle, RefreshCw, Menu, X } from 'lucide-react';

const AdminPanel = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [operations, setOperations] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (user?.email === 'sonalijatav100@gmail.com') {
      fetchAdminData();
    }
  }, [user]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      console.log('Fetching admin data...');

      const fetchPromises = [
        fetch('http://localhost:5000/api/admin/users', { headers }).then(res => {
          if (!res.ok) throw new Error(`Users fetch failed: ${res.status}`);
          return res.json();
        }).catch(err => {
          console.error('Users fetch error:', err);
          return { users: [] };
        }),
        
        fetch('http://localhost:5000/api/admin/operations', { headers }).then(res => {
          if (!res.ok) throw new Error(`Operations fetch failed: ${res.status}`);
          return res.json();
        }).catch(err => {
          console.error('Operations fetch error:', err);
          return { operations: [] };
        }),
        
        fetch('http://localhost:5000/api/admin/stats', { headers }).then(res => {
          if (!res.ok) throw new Error(`Stats fetch failed: ${res.status}`);
          return res.json();
        }).catch(err => {
          console.error('Stats fetch error:', err);
          return { stats: {} };
        })
      ];

      const [usersData, operationsData, statsData] = await Promise.all(fetchPromises);

      console.log('Fetched data:', { usersData, operationsData, statsData });

      setUsers(usersData.users || []);
      setOperations(operationsData.operations || []);
      setStats(statsData.stats || {});

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setUsers(users.filter(u => u._id !== userId));
        setSelectedUser(null);
        fetchAdminData();
      } else {
        const errorData = await response.json();
        alert(`Failed to delete user: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user');
    }
  };

  const deleteFile = async (userId, fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/files/${fileId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchAdminData();
        if (selectedUser && selectedUser._id === userId) {
          const updatedUser = users.find(u => u._id === userId);
          if (updatedUser) {
            updatedUser.files = updatedUser.files.filter(f => f._id !== fileId);
            setSelectedUser(updatedUser);
          }
        }
      } else {
        const errorData = await response.json();
        alert(`Failed to delete file: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
      alert('Failed to delete file');
    }
  };

  const deleteSheet = async (userId, sheetTitle) => {
    if (!window.confirm('Are you sure you want to delete this sheet?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/sheets/${encodeURIComponent(sheetTitle)}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchAdminData();
        if (selectedUser && selectedUser._id === userId) {
          const updatedUser = users.find(u => u._id === userId);
          if (updatedUser) {
            updatedUser.sheets = updatedUser.sheets.filter(s => s.title !== sheetTitle);
            setSelectedUser(updatedUser);
          }
        }
      } else {
        const errorData = await response.json();
        alert(`Failed to delete sheet: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to delete sheet:', error);
      alert('Failed to delete sheet');
    }
  };

  if (user?.email !== 'sonalijatav100@gmail.com') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg border border-slate-200">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Access Denied</h2>
          <p className="text-slate-600">You don't have admin privileges.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-cyan-500 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg border border-red-200 max-w-md w-full">
          <div className="flex items-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-500 mr-3" />
            <h2 className="text-2xl font-bold text-red-500">Error</h2>
          </div>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={fetchAdminData}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-4 py-2 rounded-lg flex items-center transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const tabItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'operations', label: 'Activities', icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-white p-2 rounded-lg shadow-lg border border-slate-200"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          <div className="p-6  border-slate-200">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-cyan-600 bg-clip-text text-transparent">
              Admin Panelll
            </h1>
            {/* <p className="text-sm text-slate-500 mt-1">{user.email}</p> */}
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            {tabItems.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-cyan-50 to-blue-50 text-cyan-700 border border-cyan-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
          
          <div className="p-4 border-t border-slate-200">
            <button
              onClick={fetchAdminData}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        <main className="p-6 lg:p-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
          
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-lg border border-slate-200">
                  <div className="flex items-center">
                    <div className="p-3 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-lg">
                      <Users className="w-8 h-8 text-cyan-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-2xl font-bold text-slate-800">{stats.totalUsers || users.length}</h3>
                      <p className="text-slate-600">Total Users</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-lg border border-slate-200">
                  <div className="flex items-center">
                    <div className="p-3 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-lg">
                      <FileText className="w-8 h-8 text-cyan-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-2xl font-bold text-slate-800">{stats.totalFiles || 0}</h3>
                      <p className="text-slate-600">Total Files</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-lg border border-slate-200">
                  <div className="flex items-center">
                    <div className="p-3 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-lg">
                      <Database className="w-8 h-8 text-cyan-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-2xl font-bold text-slate-800">{stats.totalSheets || 0}</h3>
                      <p className="text-slate-600">Total Sheets</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-lg border border-slate-200">
                  <div className="flex items-center">
                    <div className="p-3 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-lg">
                      <Activity className="w-8 h-8 text-cyan-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-2xl font-bold text-slate-800">{stats.totalOperations || operations.length}</h3>
                      <p className="text-slate-600">Total Operations</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activities */}
              <div className="bg-white rounded-lg shadow-lg border border-slate-200">
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-xl font-semibold text-slate-800">Recent Activities</h3>
                </div>
                <div className="p-6">
                  {stats.recentOperations && stats.recentOperations.length > 0 ? (
                    <div className="space-y-4">
                      {stats.recentOperations.slice(0, 5).map((op, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-cyan-50 rounded-lg border border-slate-200">
                          <div>
                            <p className="font-medium text-slate-800">{op.type}</p>
                            <p className="text-sm text-slate-600">{op.fileName}</p>
                            <p className="text-xs text-slate-500">by {op.user}</p>
                          </div>
                          <span className="text-xs text-slate-500">
                            {new Date(op.timestamp).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : operations.length > 0 ? (
                    <div className="space-y-4">
                      {operations.slice(0, 5).map((op, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-cyan-50 rounded-lg border border-slate-200">
                          <div>
                            <p className="font-medium text-slate-800">{op.type}</p>
                            <p className="text-sm text-slate-600">{op.fileName}</p>
                            <p className="text-xs text-slate-500">by {op.user}</p>
                          </div>
                          <span className="text-xs text-slate-500">
                            {new Date(op.timestamp).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-500">No recent activities</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-slate-800">Users Management</h2>
                {selectedUser && (
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-200"
                  >
                    Back to List
                  </button>
                )}
              </div>

              {!selectedUser ? (
                <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden">
                  {users.length === 0 ? (
                    <div className="p-8 text-center">
                      <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-500 mb-4">No users found</p>
                      <button
                        onClick={fetchAdminData}
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-200"
                      >
                        Refresh Data
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-gradient-to-r from-slate-50 to-cyan-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                              User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                              Files
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                              Sheets
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                              Joined
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                          {users.map((user) => (
                            <tr key={user._id} className="hover:bg-slate-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="p-2 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-lg mr-3">
                                    <Mail className="w-5 h-5 text-cyan-600" />
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-slate-900">{user.email}</div>
                                    <div className="text-sm text-slate-500">ID: {user._id}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 py-1 text-xs font-medium bg-cyan-100 text-cyan-800 rounded-full">
                                  {user.files?.length || 0}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                  {user.sheets?.length || 0}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => setSelectedUser(user)}
                                    className="p-2 text-cyan-600 hover:text-cyan-900 hover:bg-cyan-50 rounded-lg transition-colors"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => deleteUser(user._id)}
                                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-6">
                  <h3 className="text-xl font-semibold mb-6 text-slate-800">User Details: {selectedUser.email}</h3>
                  
                  {/* Files Section */}
                  <div className="mb-8">
                    <h4 className="text-lg font-medium mb-4 flex items-center text-slate-700">
                      <FileText className="w-5 h-5 mr-2" />
                      Files ({selectedUser.files?.length || 0})
                    </h4>
                    {selectedUser.files && selectedUser.files.length > 0 ? (
                      <div className="space-y-4">
                        {selectedUser.files.map((file) => (
                          <div key={file._id} className="border border-slate-200 rounded-lg p-4 flex justify-between items-center hover:bg-slate-50">
                            <div>
                              <h5 className="font-medium text-slate-800">{file.name}</h5>
                              <p className="text-sm text-slate-600">Type: {file.type}</p>
                              <p className="text-sm text-slate-500">
                                Uploaded: {new Date(file.timestamp).toLocaleString()}
                              </p>
                            </div>
                            <button
                              onClick={() => deleteFile(selectedUser._id, file._id)}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-500">No files uploaded</p>
                      </div>
                    )}
                  </div>

                  {/* Sheets Section */}
                  <div>
                    <h4 className="text-lg font-medium mb-4 flex items-center text-slate-700">
                      <Database className="w-5 h-5 mr-2" />
                      Sheets ({selectedUser.sheets?.length || 0})
                    </h4>
                    {selectedUser.sheets && selectedUser.sheets.length > 0 ? (
                      <div className="space-y-4">
                        {selectedUser.sheets.map((sheet) => (
                          <div key={sheet._id} className="border border-slate-200 rounded-lg p-4 flex justify-between items-center hover:bg-slate-50">
                            <div>
                              <h5 className="font-medium text-slate-800">{sheet.title}</h5>
                              <p className="text-sm text-slate-600">Rows: {sheet.rows?.length || 0}</p>
                              <p className="text-sm text-slate-500">
                                Created: {new Date(sheet.createdAt).toLocaleString()}
                              </p>
                            </div>
                            <button
                              onClick={() => deleteSheet(selectedUser._id, sheet.title)}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Database className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-500">No sheets created</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'operations' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-slate-800">User Activities</h2>
              
              <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden">
                {operations.length === 0 ? (
                  <div className="p-8 text-center">
                    <Activity className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500 mb-4">No operations found</p>
                    <button
                      onClick={fetchAdminData}
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-200"
                    >
                      Refresh Data
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-gradient-to-r from-slate-50 to-cyan-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                            Operation
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                            File/Sheet
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                            Timestamp
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {operations.map((op) => (
                          <tr key={op._id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{op.user}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                op.type === 'upload' ? 'bg-cyan-100 text-cyan-800' :
                                op.type === 'sheet-created' ? 'bg-blue-100 text-blue-800' :
                                op.type.includes('deleted') ? 'bg-red-100 text-red-800' :
                                'bg-slate-100 text-slate-800'
                              }`}>
                                {op.type}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{op.fileName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                              {new Date(op.timestamp).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminPanel;






