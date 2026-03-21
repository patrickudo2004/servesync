import React, { useState } from 'react';
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { AttendanceScanner } from '../components/AttendanceScanner';
import styles from './AttendancePage.module.css';

export const AttendancePage: React.FC = () => {
  const markAttendance = useMutation(api.attendance.markAttendance);
  const markDailyAttendance = useMutation(api.attendance.markDailyAttendance);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleScan = async (data: string, location: GeolocationPosition) => {
    setIsProcessing(true);
    try {
      let qrData: any;
      try {
        qrData = JSON.parse(data);
      } catch (e) {
        // Fallback for raw IDs if they exist
        qrData = { serviceId: data, secret: "LEGACY" };
      }

      const commonArgs = {
        qrSecret: qrData.secret,
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        accuracy: location.coords.accuracy,
      };

      if (qrData.type === 'daily' && qrData.churchId) {
        await markDailyAttendance({
          churchId: qrData.churchId,
          ...commonArgs
        });
      } else if (qrData.serviceId) {
        await markAttendance({
          serviceId: qrData.serviceId,
          ...commonArgs
        });
      } else {
        throw new Error("Invalid QR Code format");
      }
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
