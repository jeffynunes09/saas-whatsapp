'use client';

import { useState } from 'react';
import { useWhatsApp } from '@/hooks/useWhatsApp';
import { whatsappService } from '@/services/whatsappService';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

const statusConfig = {
  connected: { label: 'Conectado', variant: 'green' as const },
  connecting: { label: 'Conectando...', variant: 'yellow' as const },
  disconnected: { label: 'Desconectado', variant: 'red' as const },
};

export default function WhatsAppPage() {
  const { qrCode, status, loading, refresh } = useWhatsApp();
  const config = statusConfig[status];

  const [disconnecting, setDisconnecting] = useState(false);
  const [mode, setMode] = useState<'qr' | 'pairing'>('qr');
  const [phone, setPhone] = useState('');
  const [pairingCode, setPairingCode] = useState('');
  const [pairingLoading, setPairingLoading] = useState(false);
  const [pairingError, setPairingError] = useState('');

  const handleGetPairingCode = async () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      setPairingError('Digite um número válido com DDD');
      return;
    }
    setPairingLoading(true);
    setPairingError('');
    setPairingCode('');
    try {
      const { pairingCode: code } = await whatsappService.getPairingCode(`55${digits}`);
      setPairingCode(code);
    } catch {
      setPairingError('Erro ao gerar código. Tente novamente.');
    } finally {
      setPairingLoading(false);
    }
  };

  return (
    <div>
      <Header title="WhatsApp" subtitle="Conexão do seu número" />
      <div className="px-4 flex flex-col gap-4 pb-6">

        <Card className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700">Status da conexão</p>
          <Badge label={config.label} variant={config.variant} />
        </Card>

        {status !== 'connected' && (
          <>
            {/* Toggle */}
            <div className="flex rounded-xl overflow-hidden border border-gray-200">
              <button
                onClick={() => setMode('qr')}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  mode === 'qr' ? 'bg-primary text-white' : 'bg-white text-gray-600'
                }`}
              >
                QR Code
              </button>
              <button
                onClick={() => setMode('pairing')}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  mode === 'pairing' ? 'bg-primary text-white' : 'bg-white text-gray-600'
                }`}
              >
                Código de 8 dígitos
              </button>
            </div>

            {mode === 'qr' ? (
              <Card className="flex flex-col items-center gap-4">
                <p className="text-sm text-gray-600 text-center">
                  Abra o WhatsApp {'>'} Dispositivos vinculados {'>'} Vincular dispositivo e escaneie
                </p>
                {loading ? (
                  <div className="w-48 h-48 bg-gray-100 rounded-xl animate-pulse" />
                ) : qrCode ? (
                  <img src={qrCode} alt="QR Code WhatsApp" className="w-48 h-48 rounded-xl" />
                ) : (
                  <p className="text-sm text-gray-400">QR Code indisponível</p>
                )}
                <Button variant="ghost" onClick={refresh} loading={loading} className="w-auto px-8">
                  Atualizar QR Code
                </Button>
              </Card>
            ) : (
              <Card className="flex flex-col gap-4">
                <p className="text-sm text-gray-600">
                  No WhatsApp, vá em <strong>Dispositivos vinculados {'>'} Vincular com número de telefone</strong> e insira o código abaixo.
                </p>
                <Input
                  label="Seu número do WhatsApp (com DDD)"
                  placeholder="11999998888"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  error={pairingError}
                />
                <Button onClick={handleGetPairingCode} loading={pairingLoading}>
                  Gerar código
                </Button>
                {pairingCode && (
                  <div className="mt-2 text-center">
                    <p className="text-xs text-gray-500 mb-1">Digite este código no WhatsApp:</p>
                    <p className="text-3xl font-bold tracking-widest text-primary font-mono">
                      {pairingCode}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">O código expira em 60 segundos</p>
                  </div>
                )}
              </Card>
            )}
          </>
        )}

        {status === 'connected' && (
          <Card className="text-center py-8 flex flex-col items-center gap-4">
            <p className="text-5xl">✅</p>
            <p className="font-semibold text-gray-800">WhatsApp conectado!</p>
            <p className="text-sm text-gray-500">Seu agente está pronto para atender</p>
            <Button
              variant="danger"
              loading={disconnecting}
              className="w-auto px-8 mt-2"
              onClick={async () => {
                setDisconnecting(true);
                try {
                  await whatsappService.disconnect();
                  window.location.reload();
                } finally {
                  setDisconnecting(false);
                }
              }}
            >
              Desconectar WhatsApp
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
