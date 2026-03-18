import React, { useState } from 'react';
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Church, MapPin, Globe, Loader2, Check } from 'lucide-react';
import styles from './CreateChurch.module.css';

export const CreateChurch: React.FC = () => {
  const createChurch = useMutation(api.churches.createChurch);
  const generateUploadUrl = useMutation(api.users.generateUploadUrl);
  
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [address, setAddress] = useState('');
  const [logoStorageId, setLogoStorageId] = useState<string | undefined>();
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      setLogoStorageId(storageId);
    } catch (error) {
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createChurch({ name, slug, address, logoStorageId: logoStorageId as any });
      window.location.href = '/';
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.iconBox}>
            <Church size={32} />
          </div>
          <h1>Create your church</h1>
          <p>Set up your ServeSync tenant in seconds.</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Church Name</label>
            <input 
              type="text" 
              placeholder="e.g. City Light Church" 
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
              }}
              required
            />
          </div>

          <div className={styles.field}>
            <label>Church URL</label>
            <div className={styles.slugInput}>
              <span>servesync.app/</span>
              <input 
                type="text" 
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label>Church Address</label>
            <div className={styles.inputWithIcon}>
              <MapPin size={18} />
              <input 
                type="text" 
                placeholder="123 Faith St, City, Country" 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label>Church Logo</label>
            <label className={styles.uploadBtn}>
              {isUploading ? <Loader2 className={styles.spinner} /> : (
                logoStorageId ? <><Check size={18} /> Logo Uploaded</> : "Upload Logo"
              )}
              <input type="file" hidden onChange={handleLogoUpload} disabled={isUploading} />
            </label>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className={styles.spinner} /> : "Create Church"}
          </button>
        </form>
      </div>
    </div>
  );
};
