import { useEffect, useState } from 'react';
import { initializeS3, listS3Objects } from './services/s3';
import { processS3Keys, type FileNode } from './utils/fileSystem';
import FileExplorer from './components/FileExplorer';
import './App.css';

function App() {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      const config = {
        region: import.meta.env.VITE_AWS_REGION,
        accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
        secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
        bucketName: import.meta.env.VITE_BUCKET_NAME,
      };

      if (!config.accessKeyId || !config.secretAccessKey || !config.bucketName) {
        setError("AWS Credentials missing in .env file");
        return;
      }

      setLoading(true);
      try {
        initializeS3(config);
        const objects = await listS3Objects(config.bucketName);
        const tree = processS3Keys(objects);
        setFiles(tree);
      } catch (err: any) {
        setError(err.message || "Failed to fetch files");
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Header Bar */}
      <div className="bg-gray-100 border-b border-gray-300 px-4 py-2 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-sm font-semibold text-gray-700">S3 File Browser</h1>
        <div className="text-xs text-gray-500">Bucket: {import.meta.env.VITE_BUCKET_NAME}</div>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-12 gap-4 px-4 py-1 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 sticky top-[37px] z-10">
        <div className="col-span-6 pl-2">Name</div>
        <div className="col-span-3">Date Modified</div>
        <div className="col-span-1 text-right">Size</div>
        <div className="col-span-2 pl-4">Kind</div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {loading && <div className="text-center py-8 text-gray-500 text-sm">Loading files...</div>}
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 text-sm border-b border-red-200">
            Error: {error}
          </div>
        )}

        {!loading && !error && files.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-sm">No files found or bucket is empty.</div>
        )}

        <div className="divide-y divide-gray-100">
          {files.map((node) => (
            <FileExplorer key={node.path} node={node} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
