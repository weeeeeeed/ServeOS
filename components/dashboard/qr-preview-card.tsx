'use client';

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Copy, Check, ExternalLink, Download, Sparkles, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Restaurant } from '@/lib/types';

interface QRPreviewCardProps {
  restaurant: Restaurant | null;
}

export function QRPreviewCard({ restaurant }: QRPreviewCardProps) {
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const slug = restaurant?.slug || '';
  const fullMenuUrl = `${origin}/r/${slug}`;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullMenuUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const svg = document.getElementById('resto-qr-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // 600x700 print-ready card
      canvas.width = 600;
      canvas.height = 700;

      if (ctx) {
        // Background card
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 600, 700);

        // Top banner background
        ctx.fillStyle = '#18181b';
        ctx.fillRect(0, 0, 600, 140);

        // Restaurant title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(restaurant?.name || 'Restaurant QR Menu', 300, 65);

        // Subtitle
        ctx.fillStyle = '#a1a1aa';
        ctx.font = '16px sans-serif';
        ctx.fillText('Scan with Camera to Browse Digital Menu', 300, 105);

        // Draw QR Code
        ctx.drawImage(img, 100, 180, 400, 400);

        // Footer URL text
        ctx.fillStyle = '#71717a';
        ctx.font = 'bold 16px monospace';
        ctx.fillText(fullMenuUrl, 300, 620);

        ctx.fillStyle = '#a1a1aa';
        ctx.font = '14px sans-serif';
        ctx.fillText('Powered by ServeOS Platform', 300, 660);

        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `${slug}-table-qr-card.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <Card className="overflow-hidden border-zinc-200/80 dark:border-zinc-800 shadow-card">
      <CardHeader className="bg-gradient-to-r from-zinc-900 to-zinc-800 text-white dark:from-zinc-900 dark:to-zinc-950 p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-brand-400" />
            <CardTitle className="text-white text-base sm:text-lg">Table QR Code Generator</CardTitle>
          </div>
          <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
            /r/{slug}
          </span>
        </div>
        <CardDescription className="text-zinc-300 text-xs mt-1">
          Scans directly into your mobile-first customer dining interface
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 flex flex-col items-center">
        {/* Printable Stand Preview Frame */}
        <div className="p-4 bg-white rounded-2xl border border-zinc-200 shadow-sm flex flex-col items-center justify-center relative">
          <QRCodeSVG
            id="resto-qr-svg"
            value={fullMenuUrl}
            size={180}
            level="H"
            includeMargin={false}
          />
          <div className="mt-2.5 text-center">
            <span className="text-xs font-bold text-zinc-900 block truncate max-w-[180px]">
              {restaurant?.name || 'RestoQR Menu'}
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">
              /r/{slug}
            </span>
          </div>
        </div>

        {/* Live URL Pill */}
        <div className="mt-4 w-full bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 rounded-lg p-2.5 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-300 font-mono">
          <span className="truncate mr-2">{fullMenuUrl}</span>
          <button
            onClick={handleCopy}
            className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors shrink-0"
            title="Copy URL"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 w-full mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="text-xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 mr-1.5" />
                Copy Link
              </>
            )}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleDownload}
            className="text-xs"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Download Card
          </Button>
        </div>

        <a
          href={fullMenuUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3.5 text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 font-medium"
        >
          <span>Open customer menu in new tab</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </CardContent>
    </Card>
  );
}
