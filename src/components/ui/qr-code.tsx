'use client';

import { useEffect, useState } from 'react';
import QRCodeLib from 'qrcode';
import { cn } from '@/lib/utils';

interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
}

export function QRCode({ value, size = 256, className }: QRCodeProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    QRCodeLib.toDataURL(value, {
      width: size,
      margin: 2,
      color: {
        dark: '#1e40af',
        light: '#ffffff'
      }
    }).then(setQrDataUrl);
  }, [value, size]);

  if (!qrDataUrl) {
    return (
      <div
        className={cn('animate-pulse rounded-xl bg-gray-200', className)}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div className={cn('relative', className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={qrDataUrl}
        alt="QR Code"
        className="rounded-2xl shadow-lg"
        style={{ width: size, height: size }}
      />
      <div className="ring-blue-500/20 absolute inset-0 rounded-2xl ring-4" />
    </div>
  );
}
