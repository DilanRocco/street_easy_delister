import React, { useEffect, useState } from "react";
import AWS from "aws-sdk";


const S3CsvViewer = () => {
  const [csvFiles, setCsvFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCsvFiles = async () => {
      setLoading(true);
      setError("");
      console.log(process.env.REACT_APP_AWS_KEY)
      console.log(process.env.REACT_APP_AWS_SECRET_KEY)
      try {
        AWS.config.update({
          region: "us-east-2", 
          credentials: new AWS.Credentials(process.env.REACT_APP_AWS_KEY, process.env.REACT_APP_AWS_SECRET_KEY),
        });

        const s3 = new AWS.S3();
        const bucketName = "sales-list";

        const data = await s3.listObjectsV2({ Bucket: bucketName }).promise();

        const files = data.Contents.map((file) => ({
          fileName: file.Key,
          downloadLink: s3.getSignedUrl("getObject", {
            Bucket: bucketName,
            Key: file.Key,
            Expires: 3600,
          }),
        }));

        setCsvFiles(files);
      } catch (err) {
        console.error("Error fetching files:", err);
        setError("Failed to fetch CSV files");
      } finally {
        setLoading(false);
      }
    };

    fetchCsvFiles();
  }, []);

  return (
    <div>
      <h1>S3 CSV Files</h1>
      {loading && <p>Loading files...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {csvFiles.map((file) => (
          <li key={file.fileName}>
            <a href={file.downloadLink} target="_blank" rel="noopener noreferrer">
              {file.fileName}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default S3CsvViewer;