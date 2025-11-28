
'use client';

import { useState } from 'react';
import { FolderOpen, SortDesc, ArrowUp, ArrowDown, Type, Calendar, Grid3X3, List } from 'lucide-react';
import FileCard from './file-card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function FileGrid({ files, onDelete, onDownload }) {
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewType, setViewType] = useState('grid');

  const sortedFiles = [...files].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'date':
        comparison = a.uploadDate - b.uploadDate;
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No files uploaded yet</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <p className="text-sm text-gray-600">
          {files.length} file{files.length !== 1 ? 's' : ''}
        </p>
        
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="whitespace-nowrap">
                <SortDesc className="w-4 h-4 mr-2" />
                Sort by {sortBy}
                {sortOrder === 'asc' ? (
                  <ArrowUp className="w-4 h-4 ml-2" />
                ) : (
                  <ArrowDown className="w-4 h-4 ml-2" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleSort('name')}>
                <Type className="w-4 h-4 mr-2" />
                Name
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort('date')}>
                <Calendar className="w-4 h-4 mr-2" />
                Date
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="flex rounded-md border">
            <Button
              variant={viewType === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewType('grid')}
              className="whitespace-nowrap rounded-r-none"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewType === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewType('list')}
              className="whitespace-nowrap rounded-l-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {viewType === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {sortedFiles.map((file) => (
            <FileCard
              key={file.id}
              file={file}
              onDelete={onDelete}
              onDownload={onDownload}
              viewType={viewType}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {sortedFiles.map((file) => (
            <FileCard
              key={file.id}
              file={file}
              onDelete={onDelete}
              onDownload={onDownload}
              viewType={viewType}
            />
          ))}
        </div>
      )}
    </div>
  );
}
