import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import styles from './AttendanceScanner.module.css';
import { MapPin, Camera, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AttendanceScannerProps {
  onScan: (data: string, location: GeolocationPosition) => Promise<void>;
  isProcessing: boolean;
}

export const AttendanceScanner: React.FC<AttendanceScannerProps> = ({ onScan, isProcessing }) => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // 1. Initialize Scanner IMMEDIATELY
    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scannerRef.current.render(
      async (decodedText) => {
        // Block scanning logic if processing or no location, 
        // but feed remains visible
        if (isProcessing) return;
        if (!location) {
          setError("GPS Location is required before you can scan.");
          return;
        }
        
        try {
          setError(null);
          await onScan(decodedText, location);
          setSuccess(true);
          scannerRef.current?.clear();
        } catch (err: any) {
          setError(err.message || "Failed to mark attendance");
        }
      },
      (errorMessage) => {
        // quiet error
      }
    );

    // 2. Request Location in parallel
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation(pos),
        (err) => setError("Location access is required for attendance verification.")
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }

    return () => {
      scannerRef.current?.clear().catch(console.error);
    };
  }, [onScan, isProcessing, location]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Camera className={styles.icon} />
        <h2>Scan Service QR Code</h2>
      </div>

      {!location && !error && (
        <div className={styles.status}>
          <MapPin className={styles.spinning} />
          <p>Acquiring GPS location...</p>
        </div>
      )}

      {error && (
        <div className={styles.error}>
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className={styles.success}>
          <CheckCircle2 size={40} />
          <h3>Attendance Marked!</h3>
          <p>You have been successfully checked in.</p>
        </div>
      )}

      <div id="qr-reader" className={styles.reader}></div>

      <div className={styles.footer}>
        <p>Ensure you are within the church premises to check in.</p>
      </div>
    </div>
  );
};
