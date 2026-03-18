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
      // The QR code data should contain the serviceId
      // For demo, we'll assume the data is the serviceId
      await markAttendance({
        serviceId: data as any,
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        verificationCode: "DEMO_CODE" // In real app, this would be part of the QR
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
