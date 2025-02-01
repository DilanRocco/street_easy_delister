import React, { useEffect, useState } from "react";
import { Calendar, FileSpreadsheet, RefreshCcw, Moon, Sun, ChevronLeft, ChevronRight } from "lucide-react";

const S3CsvViewer = () => {
  const [currentBatch, setCurrentBatch] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [filesPerPage] = useState(10);
  const [totalFiles, setTotalFiles] = useState(0);
  const [allFiles, setAllFiles] = useState([]);
  const [loadedBatches, setLoadedBatches] = useState(new Set());

  useEffect(() => {
    document.body.style.backgroundColor = darkMode ? '#1a1a1a' : '#ffffff';
    return () => {
      document.body.style.backgroundColor = '#ffffff';
    };
  }, [darkMode]);

  const fetchAllFiles = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("https://succ1j1n40.execute-api.us-east-2.amazonaws.com/test", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch CSV files. Please try again later.");
      }
      
      const data = await response.json();
      const body = JSON.parse(data.body);
      
      if (body && body.files) {
        const files = body.files
          .map((file) => ({
            fileName: file.fileName,
            content: file.content,
            date: new Date(file.fileName),
          }))
          .sort((a, b) => b.date - a.date);
        setAllFiles(files);
        setTotalFiles(files.length);
        loadBatchForPage(1, files);
        setLastUpdated(new Date().toLocaleString());
      } else {
        setError("No files found in the response");
      }
    } catch (err) {
      console.error("Error fetching files:", err);
      setError("Failed to fetch CSV files. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const loadBatchForPage = (page, files = allFiles) => {
    const batchNumber = Math.ceil(page / 5); // 5 pages per batch
    if (loadedBatches.has(batchNumber)) {
      // Batch already loaded, just update current page
      const startIndex = (page - 1) * filesPerPage;
      const endIndex = startIndex + filesPerPage;
      setCurrentBatch(files.slice(startIndex, endIndex));
      return;
    }

    // Load new batch
    const batchStartIndex = (batchNumber - 1) * (filesPerPage * 5);
    const batchEndIndex = batchStartIndex + (filesPerPage * 5);
    const newBatch = files.slice(batchStartIndex, batchEndIndex);
    
    setLoadedBatches(prev => new Set([...prev, batchNumber]));
    const startIndex = (page - 1) * filesPerPage;
    const endIndex = startIndex + filesPerPage;
    setCurrentBatch(files.slice(startIndex, endIndex));
  };

  useEffect(() => {
    fetchAllFiles();
  }, []);

  useEffect(() => {
    if (allFiles.length > 0) {
      loadBatchForPage(currentPage);
    }
  }, [currentPage, allFiles]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
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

  const totalPages = Math.ceil(totalFiles / filesPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
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

  const startIndex = (currentPage - 1) * filesPerPage + 1;
  const endIndex = Math.min(startIndex + filesPerPage - 1, totalFiles);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors`}>
      <div className={`w-full max-w-4xl mx-auto pt-8 px-4 pb-8`}>
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
                  onClick={fetchAllFiles}
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
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
                  {currentBatch.map((file) => (
                    <button
                      key={file.fileName}
                      onClick={() => handleDownload(file.fileName, file.content)}
                      className={`flex items-center gap-3 p-3 ${
                        darkMode 
                          ? 'hover:bg-gray-700 border-gray-700' 
                          : 'hover:bg-gray-50 border-gray-200'
                      } rounded-lg border transition-colors inline-flex w-full justify-start`}
                    >
                      <FileSpreadsheet className="w-5 h-5 text-blue-500" />
                      <div className="flex-1">
                        <div className={`font-medium text-left ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          Report for {formatDate(file.date)}
                        </div>
                        <div className={`text-sm text-left ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {file.fileName}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                
                {currentBatch.length === 0 && !loading && (
                  <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    No reports available at this time
                  </div>
                )}

                {/* Pagination Controls */}
                {totalFiles > 0 && (
                  <div className="mt-6 flex items-center justify-between">
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Showing {startIndex}-{endIndex} of {totalFiles} reports
                    </div>
                    <div className="flex gap-2">
                      <PaginationButton
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </PaginationButton>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => {
                          const delta = 1; // Show 1 page before and after current page
                          return page === 1 || 
                                 page === totalPages || 
                                 (page >= currentPage - delta && page <= currentPage + delta);
                        })
                        .map((page, index, array) => {
                          if (index > 0 && array[index - 1] !== page - 1) {
                            return (
                              <React.Fragment key={`ellipsis-${page}`}>
                                <span className={`px-3 py-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>...</span>
                                <PaginationButton
                                  onClick={() => handlePageChange(page)}
                                  disabled={currentPage === page}
                                >
                                  {page}
                                </PaginationButton>
                              </React.Fragment>
                            );
                          }
                          return (
                            <PaginationButton
                              key={page}
                              onClick={() => handlePageChange(page)}
                              disabled={currentPage === page}
                            >
                              {page}
                            </PaginationButton>
                          );
                        })}
                      
                      <PaginationButton
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </PaginationButton>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default S3CsvViewer;