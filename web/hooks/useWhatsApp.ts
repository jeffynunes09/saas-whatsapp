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
      console.log(result)
      setQrCode(result.qrCode || null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let stopped = false;

    const init = async () => {
      const s = await fetchStatus();
      if (stopped) return;

      if (s === 'connected') {
        setLoading(false);
        return; // já conectado — não inicia polling nem busca QR
      }

      // Não conectado: busca QR uma vez e inicia polling de status
      fetchQRCode();

      pollingRef.current = setInterval(async () => {
        const current = await fetchStatus();
        if (current === 'connected' && pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
          setQrCode(null);
        }
      }, 5000);
    };

    init();

    return () => {
      stopped = true;
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, []);

  return { qrCode, status, loading, refresh: fetchQRCode };
}
