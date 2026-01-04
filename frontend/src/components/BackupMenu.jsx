import { useState } from 'react';
import { Cloud, CloudOff, Download, Upload, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { authApi, backupApi } from '@/lib/api';
import { toast } from 'sonner';

const BackupMenu = ({ user, onUserChange, onDataChange }) => {
  const [syncing, setSyncing] = useState(false);

  const handleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    window.location.href = authApi.getLoginUrl();
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
      onUserChange(null);
      toast.success('Abgemeldet');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleBackupToCloud = async () => {
    if (!user) {
      toast.error('Bitte erst anmelden');
      return;
    }

    setSyncing(true);
    try {
      await backupApi.saveToCloud();
      toast.success('Backup erfolgreich in die Cloud gespeichert!');
    } catch (error) {
      toast.error('Backup fehlgeschlagen');
      console.error(error);
    } finally {
      setSyncing(false);
    }
  };

  const handleRestoreFromCloud = async () => {
    if (!user) {
      toast.error('Bitte erst anmelden');
      return;
    }

    setSyncing(true);
    try {
      const data = await backupApi.loadFromCloud();
      if (data.goals?.length || data.habits?.length) {
        backupApi.importData(data);
        onDataChange();
        toast.success(`Backup wiederhergestellt (${data.backup_date ? new Date(data.backup_date).toLocaleDateString('de-DE') : 'unbekannt'})`);
      } else {
        toast.info('Kein Cloud-Backup gefunden');
      }
    } catch (error) {
      toast.error('Wiederherstellung fehlgeschlagen');
      console.error(error);
    } finally {
      setSyncing(false);
    }
  };

  const handleExportFile = () => {
    const data = backupApi.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jahresziele-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Backup heruntergeladen');
  };

  const handleImportFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);
        backupApi.importData(data);
        onDataChange();
        toast.success('Backup importiert');
      } catch (error) {
        toast.error('Ungültige Backup-Datei');
      }
    };
    input.click();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          data-testid="backup-menu-trigger"
        >
          {user ? (
            <Cloud className="h-5 w-5 text-primary" />
          ) : (
            <CloudOff className="h-5 w-5 text-muted-foreground" />
          )}
          {syncing && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {user ? (
          <>
            <div className="px-2 py-1.5 text-sm">
              <div className="flex items-center gap-2">
                {user.picture ? (
                  <img src={user.picture} alt="" className="w-6 h-6 rounded-full" />
                ) : (
                  <User className="w-6 h-6 text-muted-foreground" />
                )}
                <div className="truncate">
                  <p className="font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleBackupToCloud} disabled={syncing} data-testid="backup-to-cloud">
              <Upload className="mr-2 h-4 w-4" />
              In Cloud sichern
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleRestoreFromCloud} disabled={syncing} data-testid="restore-from-cloud">
              <Download className="mr-2 h-4 w-4" />
              Aus Cloud laden
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        ) : (
          <>
            <DropdownMenuItem onClick={handleLogin} data-testid="login-btn">
              <User className="mr-2 h-4 w-4" />
              Mit Google anmelden
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={handleExportFile} data-testid="export-file">
          <Download className="mr-2 h-4 w-4" />
          Als Datei exportieren
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleImportFile} data-testid="import-file">
          <Upload className="mr-2 h-4 w-4" />
          Datei importieren
        </DropdownMenuItem>
        {user && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive" data-testid="logout-btn">
              <LogOut className="mr-2 h-4 w-4" />
              Abmelden
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default BackupMenu;
