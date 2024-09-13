'use client'; // This line marks the file as a Client Component

import { useState, useRef } from 'react';
import { FaFile, FaDownload, FaTrash, FaPaperclip } from 'react-icons/fa'; // For file icon, download, trash, and attachment icons

interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
}

const AttachmentComponent = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [showFiles, setShowFiles] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files).map(file => ({
        id: URL.createObjectURL(file),
        name: file.name,
        type: file.type,
        size: file.size,
      }));
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
    }
  };

  const handleDelete = (id: string) => {
    setFiles(prevFiles => prevFiles.filter(file => file.id !== id));
  };

  const handleDownload = (file: FileItem) => {
    const a = document.createElement('a');
    a.href = file.id;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleAttachmentClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const toggleFileList = () => {
    setShowFiles(prev => !prev);
  };

  return (
    <div className="p-4 relative">
      <button
        onClick={handleAttachmentClick}
        className="flex items-center gap-2 p-2 border rounded bg-gray-100 hover:bg-gray-200"
      >
        <FaPaperclip className="text-xl" />
        <span>Attach Files</span>
      </button>
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        className="hidden"
        ref={fileInputRef}
      />
      <div className="mt-2 relative">
        {files.length > 0 && (
          <button
            onClick={toggleFileList}
            className="flex items-center gap-2 p-2 border rounded bg-gray-100 hover:bg-gray-200"
          >
            <FaPaperclip className="text-xl" />
            <span className="font-bold">{files.length}</span>
          </button>
        )}
        {showFiles && (
          <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-300 shadow-lg p-4 z-10">
            <div className="flex flex-col gap-2">
              {files.map(file => (
                <div key={file.id} className="flex items-center justify-between p-2 border-b">
                  <div className="flex items-center gap-2">
                    <FaFile />
                    <span>{file.name}</span>
                    <span className="text-xs text-gray-500">
                      {file.size} bytes
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownload(file)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <FaDownload />
                    </button>
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttachmentComponent;
