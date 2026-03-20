'use client';

import { useState, useEffect, useRef } from 'react';
import { whatsappService } from '@/services/whatsappService';

export function useWhatsApp() {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const [loading, setLoading] = useState(true);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStatus = async () => {
    const result = await whatsappService.getStatus();
    setStatus(result.status);
    return result.status;
  };

  const fetchQRCode = async () => {
    setLoading(true);
    try {
      const result = await whatsappService.getQRCode();
      setQrCode(result.qrCode || null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus().then((s) => {
      if (s !== 'connected') fetchQRCode();
      else setLoading(false);
    });

    pollingRef.current = setInterval(async () => {
      const s = await fetchStatus();
      if (s === 'connected' && pollingRef.current) {
        clearInterval(pollingRef.current);
        setQrCode(null);
      }
    }, 5000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  return { qrCode, status, loading, refresh: fetchQRCode };
}
