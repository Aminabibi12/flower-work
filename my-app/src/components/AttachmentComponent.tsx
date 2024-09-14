
'use client';
import { useState, useRef } from 'react';
import { FaFile, FaDownload, FaTrash, FaPaperclip } from 'react-icons/fa';

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
    if (files.length === 1) setShowFiles(false); // Hide list when last file is deleted
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
    if (files.length > 0) {
      setShowFiles(prev => !prev); // Toggle file list visibility
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files).map(file => ({
      id: URL.createObjectURL(file),
      name: file.name,
      type: file.type,
      size: file.size,
    }));
    setFiles(prevFiles => [...prevFiles, ...droppedFiles]);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <div className="p-4 relative">
      {/* Hidden file input for manual file upload */}
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        className="hidden"
        ref={fileInputRef}
      />

      {/* Attachment icon and counter */}
      <div
        className="flex items-center gap-1"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {/* Small paperclip icon */}
        <FaPaperclip
          className="text-lg cursor-pointer"
          onClick={handleAttachmentClick} 
        />
        
        {/* Only show the counter if there are files */}
        {files.length > 0 && (
          <span
            className="text-sm cursor-pointer"
            onClick={toggleFileList}
          >
            {files.length}
          </span>
        )}
      </div>

      {/* Conditionally render file list only if there are files and list is toggled */}
      {showFiles && files.length > 0 && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-300 shadow-lg p-4 z-10">
          <div className="flex flex-col gap-2">
            {files.map(file => (
              <div key={file.id} className="flex items-center justify-between p-2 border-b">
                <div className="flex items-center gap-2 w-full">
                  <FaFile />
                  {/* Truncated file name */}
                  <span className="truncate w-40" title={file.name}>
                    {file.name}
                  </span>
                  <span className="text-xs text-gray-500">{file.size} bytes</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Download button */}
                  <button
                    onClick={() => handleDownload(file)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <FaDownload />
                  </button>
                  {/* Delete button */}
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
  );
};

export default AttachmentComponent;







// "use client";

// import { useState, useRef, useEffect } from 'react';
// import { FaFile, FaDownload, FaTrash, FaPaperclip } from 'react-icons/fa'; // Icons

// interface FileItem {
//   id: string;
//   name: string;
//   size: number;
// }

// const AttachmentComponent = () => {
//   const [files, setFiles] = useState<FileItem[]>([]);
//   const [showFiles, setShowFiles] = useState(false);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   // Fetch the list of files from the server when the component loads
//   useEffect(() => {
//     fetch('/api/files')
//       .then((response) => response.json())
//       .then((data) => setFiles(data))
//       .catch((error) => console.error('Error fetching files:', error));
//   }, []);

//   // Handle file uploads
//   const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
//     if (event.target.files) {
//       const formData = new FormData();
//       Array.from(event.target.files).forEach((file) => {
//         formData.append('files', file);
//       });

//       await fetch('/api/upload', {
//         method: 'POST',
//         body: formData,
//       });

//       // Refresh file list after upload
//       fetch('/api/files')
//         .then((response) => response.json())
//         .then((data) => setFiles(data));
//     }
//   };

//   // Handle file deletion
//   const handleDelete = async (id: string) => {
//     await fetch(`/api/files/${id}`, {
//       method: 'DELETE',
//     });

//     setFiles((prevFiles) => prevFiles.filter((file) => file.id !== id));
//   };

//   // Handle file download
//   const handleDownload = (file: FileItem) => {
//     window.open(`/api/files/${file.id}`, '_blank');
//   };

//   // Trigger file input click when attach button is clicked
//   const handleAttachmentClick = () => {
//     if (fileInputRef.current) {
//       fileInputRef.current.click();
//     }
//   };

//   // Toggle visibility of the file list
//   const toggleFileList = () => {
//     setShowFiles((prev) => !prev);
//   };

//   return (
//     <div className="p-4 relative">
//       <button
//         onClick={handleAttachmentClick}
//         className="flex items-center gap-2 p-2 border rounded bg-gray-100 hover:bg-gray-200"
//       >
//         <FaPaperclip className="text-xl" />
//         <span>Attach Files</span>
//       </button>
//       <input
//         type="file"
//         multiple
//         onChange={handleFileChange}
//         className="hidden"
//         ref={fileInputRef}
//       />
//       <div className="mt-2 relative">
//         {files.length > 0 && (
//           <button
//             onClick={toggleFileList}
//             className="flex items-center gap-2 p-2 border rounded bg-gray-100 hover:bg-gray-200"
//           >
//             <FaPaperclip className="text-xl" />
//             <span className="font-bold">{files.length}</span>
//           </button>
//         )}
//         {showFiles && (
//           <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-300 shadow-lg p-4 z-10">
//             <div className="flex flex-col gap-2">
//               {files.map((file) => (
//                 <div key={file.id} className="flex items-center justify-between p-2 border-b">
//                   <div className="flex items-center gap-2">
//                     <FaFile />
//                     <span>{file.name}</span>
//                     <span className="text-xs text-gray-500">{file.size} bytes</span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <button
//                       onClick={() => handleDownload(file)}
//                       className="text-blue-500 hover:text-blue-700"
//                     >
//                       <FaDownload />
//                     </button>
//                     <button
//                       onClick={() => handleDelete(file.id)}
//                       className="text-red-500 hover:text-red-700"
//                     >
//                       <FaTrash />
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AttachmentComponent;
