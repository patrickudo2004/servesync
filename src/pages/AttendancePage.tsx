import React, { useState } from 'react';
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { AttendanceScanner } from '../components/AttendanceScanner';
import styles from './AttendancePage.module.css';

export const AttendancePage: React.FC = () => {
  const markAttendance = useMutation(api.attendance.markAttendance);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleScan = async (data: string, location: GeolocationPosition) => {
    setIsProcessing(true);
    try {
      let qrData;
      try {
        qrData = JSON.parse(data);
      } catch (e) {
        // Fallback for simple demo IDs if needed, but PRD expects secret
        qrData = { serviceId: data, secret: "DEMO_SECRET" };
      }

      await markAttendance({
        serviceId: qrData.serviceId as any,
        qrSecret: qrData.secret,
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        accuracy: location.coords.accuracy,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={styles.container}>
      <AttendanceScanner onScan={handleScan} isProcessing={isProcessing} />
    </div>
  );
};
