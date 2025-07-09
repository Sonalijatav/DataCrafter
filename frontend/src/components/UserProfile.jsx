// import React, { useEffect, useState } from 'react';
// import { User, Trash2, FileText, Eye, Clock, AlertCircle, Sparkles, FolderOpen, Grid, Calendar } from 'lucide-react';

// const UserProfile = ({ userEmail, onOpenSheet }) => {
//   const [files, setFiles] = useState([]);
//   const [sheets, setSheets] = useState([]);
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [deletingItems, setDeletingItems] = useState(new Set());

//   // const BASE_API ="http://localhost:5000";
//   const BASE_API = import.meta.env.VITE_API_URL;


//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (!token) {
//       setError('Not authenticated');
//       setLoading(false);
//       return;
//     }

//     const fetchData = async () => {
//       try {
//         const res = await fetch(
//           `${BASE_API}/api/files/user/${encodeURIComponent(userEmail)}`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );
        
//         if (!res.ok) {
//           throw new Error('Failed to fetch data');
//         }
        
//         const data = await res.json();
//         setFiles(data.files || []);
//         setSheets(data.sheets || []);
//         setError('');
//       } catch (err) {
//         console.error('Fetch error:', err);
//         setError('Failed to load profile data.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (userEmail) fetchData();
//   }, [userEmail]);

//   const handleDeleteFile = async (fileId) => {
//     setDeletingItems(prev => new Set([...prev, `file-${fileId}`]));
//     const token = localStorage.getItem('token');
//     try {
//       const res = await fetch(`${BASE_API}/api/users/files/${fileId}`, {
//         method: 'DELETE',
//         headers: { Authorization: `Bearer ${token}` },
//       });
      
//       if (!res.ok) {
//         throw new Error('Delete failed');
//       }
      
//       setFiles(files.filter(file => file._id !== fileId));
//     } catch (err) {
//       console.error('Delete failed', err);
//       setError('Failed to delete file.');
//     } finally {
//       setDeletingItems(prev => {
//         const newSet = new Set(prev);
//         newSet.delete(`file-${fileId}`);
//         return newSet;
//       });
//     }
//   };

//   const handleDeleteSheet = async (title) => {
//     setDeletingItems(prev => new Set([...prev, `sheet-${title}`]));
//     const token = localStorage.getItem('token');
//     try {
//       const res = await fetch(`${BASE_API}/api/users/sheets/${userEmail}/${title}`, {
//         method: 'DELETE',
//         headers: { Authorization: `Bearer ${token}` },
//       });
      
//       if (!res.ok) {
//         throw new Error('Delete sheet failed');
//       }
      
//       setSheets(sheets.filter(sheet => sheet.title !== title));
//     } catch (err) {
//       console.error('Delete sheet failed', err);
//       setError('Failed to delete sheet.');
//     } finally {
//       setDeletingItems(prev => {
//         const newSet = new Set(prev);
//         newSet.delete(`sheet-${title}`);
//         return newSet;
//       });
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'Unknown';
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   if (loading) {
//     return (
//       <div className="bg-gradient-to-br from-slate-50 to-cyan-50 rounded-xl shadow-lg p-8 border border-slate-200">
//         <div className="flex items-center justify-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
//           <p className="ml-4 text-slate-600">Loading profile...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-gradient-to-br from-slate-50 to-cyan-50 rounded-xl shadow-lg p-6 border border-slate-200">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-6">
//         <div className="flex items-center">
//           <div className="bg-gradient-to-r from-cyan-400 to-blue-500 p-3 rounded-lg">
//             <User className="w-6 h-6 text-white" />
//           </div>
//           <div className="ml-4">
//             <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-cyan-600 bg-clip-text text-transparent">
//               User Profile
//             </h2>
//             <p className="text-slate-500 text-sm">
//               {userEmail}
//             </p>
//           </div>
//         </div>
//         <Sparkles className="w-6 h-6 text-cyan-500" />
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
//         <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
//           <div className="flex items-center">
//             <div className="bg-gradient-to-r from-blue-400 to-cyan-500 p-2 rounded-lg">
//               <FolderOpen className="w-5 h-5 text-white" />
//             </div>
//             <div className="ml-3">
//               <p className="text-2xl font-bold text-slate-700">{files.length}</p>
//               <p className="text-sm text-slate-500">Files Uploaded</p>
//             </div>
//           </div>
//         </div>
//         <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
//           <div className="flex items-center">
//             <div className="bg-gradient-to-r from-blue-400 to-cyan-500 p-2 rounded-lg">
//               <Grid className="w-5 h-5 text-white" />
//             </div>
//             <div className="ml-3">
//               <p className="text-2xl font-bold text-slate-700">{sheets.length}</p>
//               <p className="text-sm text-slate-500">Sheets Created</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Error Message */}
//       {error && (
//         <div className="flex items-center p-4 mb-6 text-red-800 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200">
//           <AlertCircle className="w-5 h-5 mr-2" />
//           {error}
//         </div>
//       )}

//       {/* File History Section */}
//       <div className="bg-white rounded-lg p-5 mb-6 border border-slate-200 shadow-sm">
//         <div className="flex items-center mb-4">
//           <div className="bg-gradient-to-r from-blue-400 to-cyan-500 p-2 rounded-lg">
//             <FolderOpen className="w-5 h-5 text-white" />
//           </div>
//           <h3 className="text-lg font-semibold text-slate-700 ml-3">File History</h3>
//         </div>
        
//         {files.length === 0 ? (
//           <div className="text-center py-8">
//             <div className="bg-gradient-to-r from-slate-100 to-cyan-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
//               <FolderOpen className="w-8 h-8 text-slate-500" />
//             </div>
//             <p className="text-slate-500 text-lg">No files uploaded yet</p>
//             <p className="text-slate-400 text-sm">Upload your first file to get started</p>
//           </div>
//         ) : (
//           <div className="space-y-3">
//             {files.map(file => (
//               <div key={file._id} className="p-4 bg-gradient-to-r from-slate-50 to-cyan-50 rounded-lg border border-slate-200 hover:shadow-md transition-all duration-200">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center flex-1">
//                     <div className="bg-gradient-to-r from-slate-100 to-cyan-100 p-2 rounded-lg">
//                       <FileText className="w-5 h-5 text-slate-600" />
//                     </div>
//                     <div className="ml-3 flex-1">
//                       <p className="font-semibold text-slate-700">{file.name}</p>
//                       <div className="flex items-center text-sm text-slate-500">
//                         <Calendar className="w-4 h-4 mr-1" />
//                         {formatDate(file.timestamp)}
//                       </div>
//                     </div>
//                   </div>
//                   <div className="flex items-center space-x-2">
//                     <button 
//                       onClick={() => onOpenSheet({ title: file.name, rows: file.data })} 
//                       className="flex items-center px-3 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
//                     >
//                       <Eye className="w-4 h-4 mr-1" />
//                       Open
//                     </button>
//                     <button 
//                       onClick={() => handleDeleteFile(file._id)} 
//                       disabled={deletingItems.has(`file-${file._id}`)}
//                       className="flex items-center px-3 py-2 bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:transform-none"
//                     >
//                       {deletingItems.has(`file-${file._id}`) ? (
//                         <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
//                       ) : (
//                         <Trash2 className="w-4 h-4 mr-1" />
//                       )}
//                       Delete
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Sheet History Section */}
//       <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm">
//         <div className="flex items-center mb-4">
//           <div className="bg-gradient-to-r from-blue-400 to-cyan-500 p-2 rounded-lg">
//             <Grid className="w-5 h-5 text-white" />
//           </div>
//           <h3 className="text-lg font-semibold text-slate-700 ml-3">Sheet History</h3>
//         </div>
        
//         {sheets.length === 0 ? (
//           <div className="text-center py-8">
//             <div className="bg-gradient-to-r from-slate-100 to-cyan-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
//               <Grid className="w-8 h-8 text-slate-500" />
//             </div>
//             <p className="text-slate-500 text-lg">No sheets created yet</p>
//             <p className="text-slate-400 text-sm">Create your first custom sheet</p>
//           </div>
//         ) : (
//           <div className="space-y-3">
//             {sheets.map((sheet, idx) => (
//               <div key={idx} className="p-4 bg-gradient-to-r from-slate-50 to-cyan-50 rounded-lg border border-slate-200 hover:shadow-md transition-all duration-200">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center flex-1">
//                     <div className="bg-gradient-to-r from-slate-100 to-cyan-100 p-2 rounded-lg">
//                       <Grid className="w-5 h-5 text-slate-600" />
//                     </div>
//                     <div className="ml-3 flex-1">
//                       <p className="font-semibold text-slate-700">{sheet.title}</p>
//                       <div className="flex items-center text-sm text-slate-500">
//                         <Calendar className="w-4 h-4 mr-1" />
//                         {formatDate(sheet.createdAt)}
//                       </div>
//                     </div>
//                   </div>
//                   <div className="flex items-center space-x-2">
//                     <button
//                       onClick={() => onOpenSheet(sheet)}
//                       className="flex items-center px-3 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
//                     >
//                       <FileText className="w-4 h-4 mr-1" />
//                       Open
//                     </button>
//                     <button
//                       onClick={() => handleDeleteSheet(sheet.title)}
//                       disabled={deletingItems.has(`sheet-${sheet.title}`)}
//                       className="flex items-center px-3 py-2 bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:transform-none"
//                     >
//                       {deletingItems.has(`sheet-${sheet.title}`) ? (
//                         <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
//                       ) : (
//                         <Trash2 className="w-4 h-4 mr-1" />
//                       )}
//                       Delete
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default UserProfile;

import React, { useEffect, useState } from 'react';
import { User, Trash2, FileText, Eye, Clock, AlertCircle, Sparkles, FolderOpen, Grid, Calendar } from 'lucide-react';

const UserProfile = ({ userEmail, onOpenSheet }) => {
  const [files, setFiles] = useState([]);
  const [sheets, setSheets] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingItems, setDeletingItems] = useState(new Set());

  // const BASE_API ="http://localhost:5000";
  const BASE_API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetch(
          `${BASE_API}/api/files/user/${encodeURIComponent(userEmail)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        
        if (!res.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const data = await res.json();
        setFiles(data.files || []);
        setSheets(data.sheets || []);
        setError('');
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };

    if (userEmail) fetchData();
  }, [userEmail]);

  const handleDeleteFile = async (fileId) => {
    setDeletingItems(prev => new Set([...prev, `file-${fileId}`]));
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${BASE_API}/api/users/files/${fileId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        throw new Error('Delete failed');
      }
      
      setFiles(files.filter(file => file._id !== fileId));
    } catch (err) {
      console.error('Delete failed', err);
      setError('Failed to delete file.');
    } finally {
      setDeletingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(`file-${fileId}`);
        return newSet;
      });
    }
  };

  const handleDeleteSheet = async (title) => {
    setDeletingItems(prev => new Set([...prev, `sheet-${title}`]));
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${BASE_API}/api/users/sheets/${userEmail}/${title}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        throw new Error('Delete sheet failed');
      }
      
      setSheets(sheets.filter(sheet => sheet.title !== title));
    } catch (err) {
      console.error('Delete sheet failed', err);
      setError('Failed to delete sheet.');
    } finally {
      setDeletingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(`sheet-${title}`);
        return newSet;
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-cyan-50 rounded-xl shadow-lg p-4 sm:p-8 border border-slate-200">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
          <p className="ml-4 text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 to-cyan-50 rounded-xl shadow-lg p-4 sm:p-6 border border-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
        <div className="flex items-center">
          <div className="bg-gradient-to-r from-cyan-400 to-blue-500 p-3 rounded-lg">
            <User className="w-6 h-6 text-white" />
          </div>
          <div className="ml-4">
            <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-700 to-cyan-600 bg-clip-text text-transparent">
              User Profile
            </h2>
            <p className="text-slate-500 text-sm break-all">
              {userEmail}
            </p>
          </div>
        </div>
        <Sparkles className="w-6 h-6 text-cyan-500 self-start sm:self-auto" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-blue-400 to-cyan-500 p-2 rounded-lg">
              <FolderOpen className="w-5 h-5 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-2xl font-bold text-slate-700">{files.length}</p>
              <p className="text-sm text-slate-500">Files Uploaded</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-blue-400 to-cyan-500 p-2 rounded-lg">
              <Grid className="w-5 h-5 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-2xl font-bold text-slate-700">{sheets.length}</p>
              <p className="text-sm text-slate-500">Sheets Created</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center p-4 mb-6 text-red-800 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span className="break-words">{error}</span>
        </div>
      )}

      {/* File History Section */}
      <div className="bg-white rounded-lg p-4 sm:p-5 mb-6 border border-slate-200 shadow-sm">
        <div className="flex items-center mb-4">
          <div className="bg-gradient-to-r from-blue-400 to-cyan-500 p-2 rounded-lg">
            <FolderOpen className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 ml-3">File History</h3>
        </div>
        
        {files.length === 0 ? (
          <div className="text-center py-8">
            <div className="bg-gradient-to-r from-slate-100 to-cyan-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <FolderOpen className="w-8 h-8 text-slate-500" />
            </div>
            <p className="text-slate-500 text-lg">No files uploaded yet</p>
            <p className="text-slate-400 text-sm">Upload your first file to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {files.map(file => (
              <div key={file._id} className="p-3 sm:p-4 bg-gradient-to-r from-slate-50 to-cyan-50 rounded-lg border border-slate-200 hover:shadow-md transition-all duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div className="flex items-center flex-1 min-w-0">
                    <div className="bg-gradient-to-r from-slate-100 to-cyan-100 p-2 rounded-lg flex-shrink-0">
                      <FileText className="w-5 h-5 text-slate-600" />
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <p className="font-semibold text-slate-700 truncate">{file.name}</p>
                      <div className="flex items-center text-sm text-slate-500">
                        <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span className="truncate">{formatDate(file.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <button 
                      onClick={() => onOpenSheet({ title: file.name, rows: file.data })} 
                      className="flex items-center px-3 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 text-sm"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      <span className="hidden xs:inline">Open</span>
                    </button>
                    <button 
                      onClick={() => handleDeleteFile(file._id)} 
                      disabled={deletingItems.has(`file-${file._id}`)}
                      className="flex items-center px-3 py-2 bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:transform-none text-sm"
                    >
                      {deletingItems.has(`file-${file._id}`) ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                      ) : (
                        <Trash2 className="w-4 h-4 mr-1" />
                      )}
                      <span className="hidden xs:inline">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sheet History Section */}
      <div className="bg-white rounded-lg p-4 sm:p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center mb-4">
          <div className="bg-gradient-to-r from-blue-400 to-cyan-500 p-2 rounded-lg">
            <Grid className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 ml-3">Sheet History</h3>
        </div>
        
        {sheets.length === 0 ? (
          <div className="text-center py-8">
            <div className="bg-gradient-to-r from-slate-100 to-cyan-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Grid className="w-8 h-8 text-slate-500" />
            </div>
            <p className="text-slate-500 text-lg">No sheets created yet</p>
            <p className="text-slate-400 text-sm">Create your first custom sheet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sheets.map((sheet, idx) => (
              <div key={idx} className="p-3 sm:p-4 bg-gradient-to-r from-slate-50 to-cyan-50 rounded-lg border border-slate-200 hover:shadow-md transition-all duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div className="flex items-center flex-1 min-w-0">
                    <div className="bg-gradient-to-r from-slate-100 to-cyan-100 p-2 rounded-lg flex-shrink-0">
                      <Grid className="w-5 h-5 text-slate-600" />
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <p className="font-semibold text-slate-700 truncate">{sheet.title}</p>
                      <div className="flex items-center text-sm text-slate-500">
                        <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span className="truncate">{formatDate(sheet.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <button
                      onClick={() => onOpenSheet(sheet)}
                      className="flex items-center px-3 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 text-sm"
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      <span className="hidden xs:inline">Open</span>
                    </button>
                    <button
                      onClick={() => handleDeleteSheet(sheet.title)}
                      disabled={deletingItems.has(`sheet-${sheet.title}`)}
                      className="flex items-center px-3 py-2 bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:transform-none text-sm"
                    >
                      {deletingItems.has(`sheet-${sheet.title}`) ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                      ) : (
                        <Trash2 className="w-4 h-4 mr-1" />
                      )}
                      <span className="hidden xs:inline">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;