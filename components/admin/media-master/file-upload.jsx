'use client';

import { useState, useRef, useCallback } from 'react';
import { showError } from '@/lib/toastUtils';
import { IconUpload } from '@tabler/icons-react';

export default function FileUpload({
  onFileUpload,
  acceptedTypes,
  maxFiles = 10,
  className = "",
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef();

  const resetError = () => setError(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
    resetError();
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragOver(false);
      resetError();
      const files = Array.from(e.dataTransfer.files);
      if (files.length > maxFiles) {
        setError(`Maximum ${maxFiles} files allowed`);
        showError(`Maximum ${maxFiles} files allowed`);
        return;
      }
      setIsUploading(true);
      onFileUpload(files).finally(() => setIsUploading(false));
    },
    [maxFiles, onFileUpload]
  );

  const handleFileSelect = useCallback(
    (e) => {
      resetError();
      const files = Array.from(e.target.files || []);
      if (files.length > maxFiles) {
        setError(`Maximum ${maxFiles} files allowed`);
        showError(`Maximum ${maxFiles} files allowed`);
        return;
      }
      setIsUploading(true);
      onFileUpload(files).finally(() => setIsUploading(false));
    },
    [maxFiles, onFileUpload]
  );

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`mb-8 ${className}`}>
      <div
        role="button"
        tabIndex={0}
        aria-label="Drop files here or click to upload"
        onClick={openFileDialog}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ' ? openFileDialog() : null)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl transition-colors p-10 flex flex-col items-center justify-center text-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400
          ${isDragOver ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-100' : 'border-gray-300 hover:border-blue-400 bg-gray-50/50'}`}
      >
        <IconUpload className={`w-12 h-12 mb-3 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
        <p className="text-lg font-semibold">
          {isUploading ? 'Uploading...' : (
            <>
              Drop files here or <span className="text-blue-600 underline">click to upload</span>
            </>
          )}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {acceptedTypes ? `Accepted: ${acceptedTypes} · ` : ''}Max {maxFiles} files
        </p>
        <input
          ref={fileInputRef}
          id="file-upload"
          type="file"
          multiple
          accept={acceptedTypes}
          onChange={handleFileSelect}
          className="hidden"
          aria-label="file-upload"
        />
      </div>

      {/* Error display */}
      {error && (
        <div className="mt-2 text-red-600 text-sm">{error}</div>
      )}
    </div>
  );
}
