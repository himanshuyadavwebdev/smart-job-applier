import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

export default function ResumeUploader({ onFileSelect, isLoading }) {
  const [selectedFile, setSelectedFile] = useState(null);

  const onDrop = useCallback((accepted) => {
    if (accepted.length > 0) {
      setSelectedFile(accepted[0]);
      onFileSelect(accepted[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
    disabled: isLoading,
  });

  const rejectionMessage = fileRejections[0]?.errors[0]?.message;

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer
          transition-all duration-200 group
          ${isDragActive
            ? 'border-blue-500 bg-blue-500/10'
            : selectedFile
            ? 'border-emerald-600/60 bg-emerald-900/10'
            : 'border-slate-700 hover:border-slate-600 bg-slate-800/30 hover:bg-slate-800/50'
          }
          ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />

        {selectedFile ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-400">{selectedFile.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {(selectedFile.size / 1024).toFixed(0)} KB — Click to replace
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-700/60 flex items-center justify-center group-hover:bg-slate-700 transition-colors">
              <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-300">
                {isDragActive ? 'Drop your resume here' : 'Drag and drop your resume'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                PDF or DOCX, up to 5MB
              </p>
            </div>
            <span className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded-lg transition-colors">
              Browse files
            </span>
          </div>
        )}
      </div>

      {rejectionMessage && (
        <p className="text-xs text-red-400 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {rejectionMessage}
        </p>
      )}
    </div>
  );
}
