import React, { useEffect, useState } from "react";
import { Calendar, FileSpreadsheet, RefreshCcw, Moon, Sun, ChevronLeft, ChevronRight } from "lucide-react";

const S3CsvViewer = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filesPerPage] = useState(10);
  const [nextOffset, setNextOffset] = useState(null);

  useEffect(() => {
    document.body.style.backgroundColor = darkMode ? '#1a1a1a' : '#ffffff';
    return () => {
      document.body.style.backgroundColor = '#ffffff';
    };
  }, [darkMode]);

  const fetchFiles = async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const offset = (page - 1) * filesPerPage;
      const response = await fetch(
        `https://succ1j1n40.execute-api.us-east-2.amazonaws.com/test?offset=${offset}&limit=${filesPerPage}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          }
        }
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch CSV files. Please try again later.");
      }
  
      const data = await response.json();
      console.log("API response:", data);
      
      if (data.body && typeof data.body === 'string') {
        const parsedBody = JSON.parse(data.body);
        setFiles(parsedBody.items || []);
        setNextOffset(parsedBody.next_offset);
      } else {
        setFiles(data.items || []);
        setNextOffset(data.next_offset);
      }
      
      setLastUpdated(new Date().toLocaleString());
    } catch (err) {
      console.error("Error fetching files:", err);
      setError("Failed to fetch CSV files. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles(currentPage);
  }, [currentPage]);

  const formatDate = (fileName) => {
    const date = new Date(fileName);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDownload = (fileName, content) => {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const PaginationButton = ({ onClick, disabled, children }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-2 rounded-md ${
        darkMode
          ? disabled ? 'bg-gray-800 text-gray-600' : 'bg-gray-700 text-white hover:bg-gray-600'
          : disabled ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      } transition-colors disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors`}>
      <div className="w-full max-w-4xl mx-auto pt-8 px-4 pb-8">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden transition-colors`}>
          <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  StreetEasy Delisted Sales Report
                </h1>
                <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Daily report of properties removed from the active sales market on StreetEasy
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`p-2 rounded-md ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-600'} hover:opacity-80 transition-colors`}
                >
                  {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => fetchFiles(currentPage)}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  <RefreshCcw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-md">
                {error}
              </div>
            )}
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
              </div>
            ) : (
              <>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-4 flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Last updated: {lastUpdated}
                  </div>
                  <div className="flex items-center gap-2">
                    Updates daily at 12:00 AM
                  </div>
                </div>
                
                <div className="space-y-2">
                  {files.map((file) => (
                    <button
                      key={file.key}
                      onClick={() => handleDownload(file.filename, file.content)}
                      className={`flex items-center gap-3 p-3 ${
                        darkMode 
                          ? 'hover:bg-gray-700 border-gray-700' 
                          : 'hover:bg-gray-50 border-gray-200'
                      } rounded-lg border transition-colors inline-flex w-full justify-start`}
                    >
                      <FileSpreadsheet className="w-5 h-5 text-blue-500" />
                      <div className="flex-1">
                        <div className={`font-medium text-left ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          Report for {formatDate(file.filename)}
                        </div>
                        <div className={`text-sm text-left ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Last modified: {new Date(file.last_modified).toLocaleString()}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                
                {files.length === 0 && !loading && (
                  <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    No reports available at this time
                  </div>
                )}

                <div className="mt-6 flex items-center justify-end gap-2">
                  <PaginationButton
                    onClick={() => setCurrentPage(p => p - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </PaginationButton>
                  
                  <PaginationButton
                    onClick={() => setCurrentPage(p => p + 1)}
                    disabled={!nextOffset}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </PaginationButton>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default S3CsvViewer;