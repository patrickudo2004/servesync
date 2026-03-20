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
  const [isCameraEnabled, setIsCameraEnabled] = useState<boolean>(true);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const locationRef = useRef<GeolocationPosition | null>(null);

  // Update locationRef whenever location changes
  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  useEffect(() => {
    if (!isCameraEnabled) {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
      return;
    }

    // Initialize scanner only if it doesn't exist
    if (!scannerRef.current) {
      try {
        scannerRef.current = new Html5QrcodeScanner(
          "qr-reader",
          { fps: 10, qrbox: { width: 250, height: 250 } },
          /* verbose= */ false
        );

        scannerRef.current.render(
          async (decodedText) => {
            if (isProcessing) return;
            if (!locationRef.current) {
              setError("GPS Location is required before you can scan.");
              return;
            }
            
            try {
              setError(null);
              await onScan(decodedText, locationRef.current);
              setSuccess(true);
              setIsCameraEnabled(false); // Turn off camera on success
              scannerRef.current?.clear();
              scannerRef.current = null;
            } catch (err: any) {
              setError(err.message || "Failed to mark attendance");
            }
          },
          () => {}
        );
      } catch (err) {
        console.error("Scanner failed to init", err);
      }
    }

    return () => {
      // Don't clear here to avoid flickering on prop changes
    };
  }, [onScan, isProcessing, isCameraEnabled]);

  useEffect(() => {
    // Single effect for location tracking
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => setLocation(pos),
        (err) => setError("Location access is required for attendance verification."),
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  }, []);

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

      <div className={styles.controls}>
        <button 
          onClick={() => setIsCameraEnabled(!isCameraEnabled)}
          className={isCameraEnabled ? styles.stopBtn : styles.startBtn}
        >
          {isCameraEnabled ? "Stop Camera" : "Start Camera"}
        </button>
      </div>

      <div className={styles.footer}>
        <p>Ensure you are within the church premises to check in.</p>
      </div>
    </div>
  );
};
