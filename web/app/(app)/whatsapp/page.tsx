'use client';

import { useWhatsApp } from '@/hooks/useWhatsApp';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { QRCodeSVG } from 'qrcode.react';

const statusConfig = {
  connected: { label: 'Conectado', variant: 'green' as const },
  connecting: { label: 'Conectando...', variant: 'yellow' as const },
  disconnected: { label: 'Desconectado', variant: 'red' as const },
};

export default function WhatsAppPage() {
  const { qrCode, status, loading, refresh } = useWhatsApp();
  const config = statusConfig[status];

  return (
    <div>
      <Header title="WhatsApp" subtitle="Conexão do seu número" />
      <div className="px-4 flex flex-col gap-4 pb-6">

        <Card className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700">Status da conexão</p>
          <Badge label={config.label} variant={config.variant} />
        </Card>

        {status !== 'connected' && (
          <Card className="flex flex-col items-center gap-4">
            <p className="text-sm text-gray-600 text-center">
              Escaneie o QR Code abaixo com o WhatsApp do seu celular
            </p>
            {loading ? (
              <div className="w-48 h-48 bg-gray-100 rounded-xl animate-pulse" />
            ) : qrCode ? (
              <div className="p-3 bg-white border border-gray-200 rounded-xl">
                <QRCodeSVG value={qrCode} size={192} />
              </div>
            ) : (
              <p className="text-sm text-gray-400">QR Code indisponível</p>
            )}
            <Button variant="ghost" onClick={refresh} loading={loading} className="w-auto px-8">
              Atualizar QR Code
            </Button>
            <p className="text-xs text-gray-400 text-center">
              O QR Code atualiza automaticamente a cada 5 segundos
            </p>
          </Card>
        )}

        {status === 'connected' && (
          <Card className="text-center py-8">
            <p className="text-5xl mb-3">✅</p>
            <p className="font-semibold text-gray-800">WhatsApp conectado!</p>
            <p className="text-sm text-gray-500 mt-1">Seu agente está pronto para atender</p>
          </Card>
        )}
      </div>
    </div>
  );
}
