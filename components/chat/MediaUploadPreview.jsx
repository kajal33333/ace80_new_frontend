"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Image, Video, Music, File } from 'lucide-react';
import { formatFileSize } from '@/lib/chatUtils';

const MediaUploadPreview = ({ files, onRemove }) => {
  if (!files || files.length === 0) return null;

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (file.type.startsWith('video/')) return <Video className="w-4 h-4" />;
    if (file.type.startsWith('audio/')) return <Music className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const getFileType = (file) => {
    if (file.type.startsWith('image/')) return 'Image';
    if (file.type.startsWith('video/')) return 'Video';
    if (file.type.startsWith('audio/')) return 'Audio';
    return 'File';
  };

  const createPreview = (file, index) => {
    const fileType = file.type.split('/')[0];
    
    return (
      <Card key={index} className="p-3 relative group">
        <div className="flex items-center space-x-3">
          {/* File Icon/Preview */}
          <div className="flex-shrink-0">
            {fileType === 'image' ? (
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="w-12 h-12 object-cover rounded"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                {getFileIcon(file)}
              </div>
            )}
          </div>

          {/* File Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {file.name}
            </p>
            <p className="text-xs text-gray-500">
              {getFileType(file)} • {formatFileSize(file.size)}
            </p>
          </div>

          {/* Remove Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(index)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-2">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Selected files ({files.length}):
      </div>
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {files.map((file, index) => createPreview(file, index))}
      </div>
    </div>
  );
};

export default MediaUploadPreview;
