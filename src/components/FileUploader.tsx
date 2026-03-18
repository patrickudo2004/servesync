import React, { useRef, useState } from 'react';
import { Paperclip, Loader2, X } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import styles from './Chat.module.css';

interface FileUploaderProps {
  onUploadComplete: (fileId: any) => void;
  onUploadStart?: () => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onUploadComplete, onUploadStart }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState('');

  const generateUploadUrl = useMutation(api.chat.generateUploadUrl);
  const saveFileMetadata = useMutation(api.chat.saveFileMetadata);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      alert('File size exceeds 50MB limit');
      return;
    }

    setIsUploading(true);
    setFileName(file.name);
    onUploadStart?.();

    try {
      const postUrl = await generateUploadUrl();
      
      // Use XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();
      xhr.open('POST', postUrl, true);
      xhr.setRequestHeader('Content-Type', file.type);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setProgress(percent);
        }
      };

      const uploadPromise = new Promise<string>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const { storageId } = JSON.parse(xhr.responseText);
            resolve(storageId);
          } else {
            reject(new Error('Upload failed'));
          }
        };
        xhr.onerror = () => reject(new Error('Upload failed'));
      });

      xhr.send(file);
      const storageId = await uploadPromise;

      const fileId = await saveFileMetadata({
        storageId: storageId as any,
        mimeType: file.type,
        name: file.name,
        size: file.size,
      });

      onUploadComplete(fileId);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file');
    } finally {
      setIsUploading(false);
      setProgress(0);
      setFileName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <button 
        className={styles.iconBtn} 
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
      >
        <Paperclip size={20} />
      </button>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        style={{ display: 'none' }} 
      />

      {isUploading && (
        <div className={styles.uploadProgress}>
          <Loader2 className="animate-spin" size={20} />
          <div className={styles.fileInfo}>
            <div className={styles.fileName}>{fileName}</div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>
          </div>
          <button className={styles.iconBtn} onClick={() => setIsUploading(false)}>
            <X size={16} />
          </button>
        </div>
      )}
    </>
  );
};
