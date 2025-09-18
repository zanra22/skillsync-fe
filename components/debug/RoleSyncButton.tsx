"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export default function RoleSyncButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const syncRole = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/auth/sync-role', {
        method: 'POST',
        credentials: 'include'
      });
      
      const result = await response.json();
      
      if (result.success) {
        setMessage(`✅ Role synced! New role: ${result.user.role}`);
        // Refresh the page to apply new role
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setMessage(`❌ Failed: ${result.message}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button 
        onClick={syncRole} 
        disabled={isLoading}
        variant="outline"
        size="sm"
        className="flex items-center space-x-2"
      >
        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        <span>{isLoading ? 'Syncing...' : 'Sync Role from DB'}</span>
      </Button>
      {message && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  );
}