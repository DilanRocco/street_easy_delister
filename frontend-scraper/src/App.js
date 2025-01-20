import React, { useEffect, useState } from "react";
import { Calendar, FileSpreadsheet, RefreshCcw } from "lucide-react";

const S3CsvViewer = () => {
  const [csvFiles, setCsvFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  const fetchCsvFiles = async () => {
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
      
      if (response.ok) {
        if (body && body.files) {
          const files = body.files
            .map((file) => ({
              fileName: file.fileName,
              content: file.content,
              date: new Date(file.fileName.split(" ")[0]),
            }))
            .sort((a, b) => b.date - a.date);
          setCsvFiles(files);
          setLastUpdated(new Date().toLocaleString());
        } else {
          setError("No files found in the response");
        }
      }
    } catch (err) {
      console.error("Error fetching files:", err);
      setError("Failed to fetch CSV files. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCsvFiles();
  }, []);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDownload = (fileName, content) => {
    // Create a blob from the CSV content
    const blob = new Blob([content], { type: 'text/csv' });
    
    // Create a temporary URL for the blob
    const url = window.URL.createObjectURL(blob);
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    
    // Append the link to the document, click it, and remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the temporary URL
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">StreetEasy Delisted Sales Report</h1>
            <p className="mt-2 text-gray-500">
              Daily report of properties removed from the active sales market on StreetEasy
            </p>
          </div>
          <button
            onClick={fetchCsvFiles}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            <RefreshCcw className="w-4 h-4" />
            Refresh
          </button>
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
        <div className="text-sm text-gray-500 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
              Last updated: {lastUpdated}
          </div>
          <div className="flex items-center gap-2">
              Updates daily at 12:00 AM
          </div>
        </div>
            
            <div className="space-y-2">
              {csvFiles.map((file) => (
                <button
                  
                  key={file.fileName}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleDownload(file.fileName, file.content)}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors inline-flex w-full justify-start"
                >
                  <FileSpreadsheet className="w-5 h-5 text-blue-500" />
                  <div className="flex-1">
                    <div className="font-medium text-left">Report for {formatDate(file.date)}</div>
                    <div className="text-sm text-gray-500 text-left">{file.fileName}</div>
                  </div>
                </button>
              ))}
            </div>
            
            {csvFiles.length === 0 && !loading && (
              <div className="text-center py-8 text-gray-500">
                No reports available at this time
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default S3CsvViewer;