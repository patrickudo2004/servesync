import React from 'react';
import QRCode from 'react-qr-code';
import { format } from 'date-fns';
import styles from './AttendanceTicket.module.css';
import { Building2, Calendar, Clock, MapPin } from 'lucide-react';

interface AttendanceTicketProps {
  churchName: string;
  services: Array<{
    name: string;
    startTime: number;
    endTime: number;
  }>;
  qrCodeValue: string;
  date: Date;
  onClose: () => void;
}

export const AttendanceTicket: React.FC<AttendanceTicketProps> = ({
  churchName,
  services,
  qrCodeValue,
  date,
  onClose
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.noPrint}>
          <div className={styles.modalHeader}>
            <h3>Print Attendance Pass</h3>
            <button onClick={onClose} className={styles.closeBtn}>&times;</button>
          </div>
          <p className={styles.hint}>This layout is optimized for printing on A4 or Label paper.</p>
        </div>

        {/* The Actual Ticket Area */}
        <div className={styles.ticketContainer}>
          <div className={styles.ticket}>
            <div className={styles.leftPortion}>
              <div className={styles.qrWrapper}>
                <QRCode 
                  value={qrCodeValue} 
                  size={180}
                  level="H"
                />
              </div>
              <p className={styles.scanInst}>Scan to mark attendance</p>
            </div>

            <div className={styles.rightPortion}>
              <div className={styles.churchBrand}>
                <Building2 size={24} className={styles.brandIcon} />
                <h2>{churchName}</h2>
              </div>

              <div className={styles.passTitle}>
                <h1>Daily Attendance Pass</h1>
                <div className={styles.dateBadge}>
                  <Calendar size={16} />
                  <span>{format(date, 'EEEE, do MMMM yyyy')}</span>
                </div>
              </div>

              <div className={styles.servicesList}>
                <h4 className={styles.listHeader}>Scheduled Services:</h4>
                {services.map((s, idx) => (
                  <div key={idx} className={styles.serviceItem}>
                    <div className={styles.serviceName}>{s.name}</div>
                    <div className={styles.serviceTimes}>
                      <Clock size={12} />
                      <span>{format(s.startTime, 'h:mm a')} - {format(s.endTime, 'h:mm a')}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.footer}>
                <div className={styles.location}>
                  <MapPin size={14} />
                  <span>Main Sanctuary / Designated Point</span>
                </div>
                <div className={styles.validity}>
                  Valid for today only
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.noPrint}>
          <div className={styles.actions}>
            <button onClick={onClose} className={styles.cancelBtn}>Cancel</button>
            <button onClick={handlePrint} className={styles.printBtn}>Confirm & Print</button>
          </div>
        </div>
      </div>
    </div>
  );
};
