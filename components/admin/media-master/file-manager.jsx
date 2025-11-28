'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import FileUpload from './file-upload';
import FileGrid from './file-grid';
import axiosInstance from '@/lib/axiosInstance';
import { showError, showSuccess } from '@/lib/toastUtils';

export default function FileManager() {
  const instance = axiosInstance();
  const [files, setFiles] = useState({
    images: [],
    audio: [],
    videos: [],
    documents: [],
  });
  const [pagination, setPagination] = useState({
    images: { currentPage: 1, totalPages: 1, limit: 10 },
    audio: { currentPage: 1, totalPages: 1, limit: 10 },
    videos: { currentPage: 1, totalPages: 1, limit: 10 },
    documents: { currentPage: 1, totalPages: 1, limit: 10 },
  });
  const [activeTab, setActiveTab] = useState('images');
  const [isLoading, setIsLoading] = useState(false);

  const tabs = [
    { id: 'images', label: 'Images', icon: 'ri-image-line', acceptedTypes: 'image/*', apiType: 'image' },
    { id: 'audio', label: 'Audio', icon: 'ri-music-line', acceptedTypes: 'audio/*', apiType: 'audio' },
    { id: 'videos', label: 'Videos', icon: 'ri-video-line', acceptedTypes: 'video/*', apiType: 'video' },
    // {
    //   id: 'documents',
    //   label: 'Documents',
    //   icon: 'ri-file-text-line',
    //   acceptedTypes: '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt',
    //   apiType: 'documents',
    // },
  ];

  const fetchFiles = async (tabId, page = 1, limit = 10) => {
    setIsLoading(true);
    try {
      const tab = tabs.find((t) => t.id === tabId);
      const query = `/media-master?page=${page}&limit=${limit}&type=${tab.apiType}`;
      const response = await instance.get(query);
      
      if (response?.status === 200) {
        const { data, pagination: pag } = response.data;
        setFiles((prev) => ({
          ...prev,
          [tabId]: data || [],
        }));
        setPagination((prev) => ({
          ...prev,
          [tabId]: {
            currentPage: pag?.currentPage || 1,
            totalPages: pag?.totalPages || 1,
            limit: pag?.limit || limit,
          },
        }));
      }
    } catch (error) {
      showError('Error fetching files: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles(activeTab, pagination[activeTab].currentPage, pagination[activeTab].limit);
  }, [activeTab]);

  const handleFileUpload = async (tabType, newFiles) => {
    setIsLoading(true);
    try {
      const tab = tabs.find((t) => t.id === tabType);
      const formData = new FormData();
      newFiles.forEach((file) => formData.append('media', file));
      formData.append('type', tab.apiType);

      const response = await instance.post('/media-master', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }); 

      if (response?.status === 200) {
        showSuccess('Files uploaded successfully');
        await fetchFiles(tabType, pagination[tabType].currentPage, pagination[tabType].limit); 
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileDelete = async (tabType, fileId) => {
    try {
      const response = await instance.delete(`/media-master/${fileId}`);
      if (response?.status === 200) {
        showSuccess('File deleted successfully');
        await fetchFiles(tabType, pagination[tabType].currentPage, pagination[tabType].limit);
      }
    } catch (error) {
      showError('Error deleting file: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleFileDownload = async (file) => {
    try {
      const response = await instance.get(file.url, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      link.click();
      window.URL.revokeObjectURL(url);
      showSuccess(`Downloading ${file.name}`);
    } catch (error) {
      showError('Error downloading file: ' + (error.response?.data?.message || error.message));
    }
  };

  const handlePageChange = (tabId, page) => {
    if (page >= 1 && page <= pagination[tabId].totalPages) {
      fetchFiles(tabId, page, pagination[tabId].limit);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">File Manager</h1>
        <p className="text-gray-600">Upload, organize, and manage your files</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">    
        <TabsList className="grid w-full grid-cols-3 mb-8"> 
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center space-x-2 cursor-pointer">
              <i className={`${tab.icon} w-4 h-4 flex items-center justify-center`}></i>
              <span>{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="space-y-6">
            <FileUpload
              onFileUpload={(newFiles) => handleFileUpload(tab.id, newFiles)}
              acceptedTypes={tab.acceptedTypes}
              maxFiles={10}
              disabled={isLoading}
            />
            {isLoading ? (
              <div className="text-center py-12">
                <i className="ri-loader-4-line w-12 h-12 flex items-center justify-center text-gray-400 animate-spin"></i>
                <p className="text-gray-500">Loading files...</p>
              </div>
            ) : (
              <>
                <FileGrid
                  files={files[tab.id]}
                  onDelete={(fileId) => handleFileDelete(tab.id, fileId)}
                  onDownload={handleFileDownload}
                />
                {pagination[tab.id].totalPages > 1 && (
                  <Pagination className="mt-6">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => handlePageChange(tab.id, pagination[tab.id].currentPage - 1)}
                          disabled={pagination[tab.id].currentPage === 1}
                        />
                      </PaginationItem>
                      {[...Array(pagination[tab.id].totalPages)].map((_, index) => (
                        <PaginationItem key={index}>
                          <PaginationLink
                            onClick={() => handlePageChange(tab.id, index + 1)}
                            isActive={pagination[tab.id].currentPage === index + 1}
                          >
                            {index + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => handlePageChange(tab.id, pagination[tab.id].currentPage + 1)}
                          disabled={pagination[tab.id].currentPage === pagination[tab.id].totalPages}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}