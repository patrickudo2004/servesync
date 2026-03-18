import React from 'react';
import { FileText, Image as ImageIcon, Video, Download, Pin } from 'lucide-react';
import { RoleBadge } from './RoleBadge';
import styles from './Chat.module.css';

interface MessageBubbleProps {
  message: any;
  isOwn: boolean;
  onPin?: () => void;
  onDelete?: () => void;
  canModerate?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  isOwn, 
  onPin, 
  onDelete,
  canModerate 
}) => {
  const { author, text, file, createdAt, isPinned, isOversight } = message;

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderFilePreview = () => {
    if (!file) return null;

    const isImage = file.mimeType.startsWith('image/');
    const isVideo = file.mimeType.startsWith('video/');
    const isPdf = file.mimeType === 'application/pdf';

    if (isImage) {
      return (
        <div className={styles.filePreview}>
          <img 
            src={file.url} 
            alt={file.name} 
            className={styles.imagePreview} 
            onClick={() => window.open(file.url, '_blank')}
          />
        </div>
      );
    }

    return (
      <a 
        href={file.url} 
        target="_blank" 
        rel="noopener noreferrer" 
        className={styles.genericFile}
      >
        <div className={styles.fileIcon}>
          {isPdf ? <FileText size={24} /> : isVideo ? <Video size={24} /> : <Download size={24} />}
        </div>
        <div className={styles.fileInfo}>
          <div className={styles.fileName}>{file.name}</div>
          <div className={styles.fileSize}>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
        </div>
      </a>
    );
  };

  return (
    <div className={`${styles.bubbleWrapper} ${isOwn ? styles.own : ''} ${isOversight ? styles.oversight : ''}`}>
      {!isOwn && (
        <div className={styles.authorName}>
          {author.name}
          <RoleBadge role={author.role} className={styles.miniBadge} />
        </div>
      )}
      
      <div className={`${styles.bubble} ${isOversight ? styles.oversightBubble : ''}`}>
        {isPinned && (
          <div className={styles.pinnedIndicator}>
            <Pin size={10} /> Pinned
          </div>
        )}

        {isOversight && (
          <div className={styles.oversightLabel}>
            Pastoral Oversight Message
          </div>
        )}
        
        {text && <div className={styles.messageText}>{text}</div>}
        {renderFilePreview()}
        
        <div className={styles.messageTime}>
          {formatTime(createdAt)}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .${styles.miniBadge} {
          transform: scale(0.7);
          transform-origin: left center;
          margin-left: -4px;
        }
        .${styles.pinnedIndicator} {
          font-size: 0.625rem;
          color: #8b5cf6;
          display: flex;
          align-items: center;
          gap: 2px;
          margin-bottom: 2px;
          font-weight: 600;
        }
        .${styles.oversightLabel} {
          font-size: 0.625rem;
          color: #15803d;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 4px;
          border-bottom: 1px solid #dcfce7;
          padding-bottom: 2px;
        }
        .${styles.oversightBubble} {
          background: #f0fdf4 !important;
          border: 1px solid #bbf7d0 !important;
        }
      `}} />
    </div>
  );
};
