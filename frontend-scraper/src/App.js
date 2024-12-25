import React, { useEffect, useState } from "react";
import AWS from "aws-sdk";
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
      AWS.config.update({
        region: "us-east-2",
        credentials: new AWS.Credentials(
          process.env.REACT_APP_AWS_KEY,
          process.env.REACT_APP_AWS_SECRET_KEY
        ),
      });
      
      const s3 = new AWS.S3();
      const bucketName = "sales-list";
      const data = await s3.listObjectsV2({ Bucket: bucketName }).promise();
      
      const files = data.Contents
        .map((file) => ({
          fileName: file.Key,
          downloadLink: s3.getSignedUrl("getObject", {
            Bucket: bucketName,
            Key: file.Key,
            Expires: 3600,
          }),
          date: new Date(file.Key.split(" ")[0]),
        }))
        .sort((a, b) => b.date - a.date);  // Sort by date, newest first
      
      setCsvFiles(files);
      setLastUpdated(new Date().toLocaleString());
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

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">StreetEasy Delisted Rentals Report</h1>
            <p className="mt-2 text-gray-500">
              Daily report of properties removed from the rental market
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
                <a
                  key={file.fileName}
                  href={file.downloadLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
                >
                  <FileSpreadsheet className="w-5 h-5 text-blue-500" />
                  <div className="flex-1">
                    <div className="font-medium">Report for {formatDate(file.date)}</div>
                    <div className="text-sm text-gray-500">{file.fileName}</div>
                  </div>
                </a>
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