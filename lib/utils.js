import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const JSONStringify = (data) => {
  return JSON.stringify(data)
}

export const JSONParse = (data) => {
  if(!data || data === undefined ||  data === "undefined") return null;
  console.log("Parsing data:", data, typeof data, data === "undefined");
  return JSON.parse(data)
}

export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function getFileIcon(fileName) {
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'pdf':
      return 'ri-file-pdf-line';
    case 'doc':
    case 'docx':
      return 'ri-file-word-line';
    case 'xls':
    case 'xlsx':
      return 'ri-file-excel-line';
    case 'ppt':
    case 'pptx':
      return 'ri-file-ppt-line';
    case 'txt':
      return 'ri-file-text-line';
    case 'zip':
    case 'rar':
      return 'ri-file-zip-line';
    default:
      return 'ri-file-line';
  }
}
