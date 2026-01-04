// Auto-Backup Hook - sichert automatisch in die Cloud wenn eingeloggt
import { useEffect, useRef, useCallback } from 'react';
import { backupApi } from '@/lib/api';

const LAST_BACKUP_KEY = 'jahresziele_last_backup';
const BACKUP_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 Stunden

export const useAutoBackup = (user, dependencies = []) => {
  const backupInProgress = useRef(false);

  const checkAndBackup = useCallback(async () => {
    // Nur wenn User eingeloggt ist
    if (!user || backupInProgress.current) return;

    const lastBackup = localStorage.getItem(LAST_BACKUP_KEY);
    const lastBackupTime = lastBackup ? new Date(lastBackup).getTime() : 0;
    const now = Date.now();

    // Backup wenn mehr als 24h vergangen oder noch nie gemacht
    if (now - lastBackupTime > BACKUP_INTERVAL_MS) {
      backupInProgress.current = true;
      try {
        await backupApi.saveToCloud();
        localStorage.setItem(LAST_BACKUP_KEY, new Date().toISOString());
        console.log('Auto-Backup erfolgreich');
      } catch (error) {
        console.error('Auto-Backup fehlgeschlagen:', error);
      } finally {
        backupInProgress.current = false;
      }
    }
  }, [user]);

  // Check on mount and when dependencies change
  useEffect(() => {
    checkAndBackup();
  }, [checkAndBackup, ...dependencies]);

  // Force backup function (für manuelle Trigger nach Änderungen)
  const triggerBackup = useCallback(async () => {
    if (!user || backupInProgress.current) return;
    
    backupInProgress.current = true;
    try {
      await backupApi.saveToCloud();
      localStorage.setItem(LAST_BACKUP_KEY, new Date().toISOString());
      console.log('Backup nach Änderung erfolgreich');
    } catch (error) {
      console.error('Backup fehlgeschlagen:', error);
    } finally {
      backupInProgress.current = false;
    }
  }, [user]);

  return { triggerBackup };
};

export default useAutoBackup;
