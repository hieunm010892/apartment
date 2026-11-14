'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Copy, Check, Download, QrCode } from 'lucide-react';

interface VietQrCanvasProps {
  payload: string;
  bankName: string;
  accountNo: string;
  accountName: string;
  amount: number;
  content: string;
}

export default function VietQrCanvas({
  payload,
  bankName,
  accountNo,
  accountName,
  amount,
  content,
}: VietQrCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (canvasRef.current && payload) {
      QRCode.toCanvas(canvasRef.current, payload, {
        width: 180,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });
    }
  }, [payload]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `VietQR_${accountNo}_${amount}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="flex flex-col items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
      <div className="flex items-center gap-1.5 text-xs font-bold text-[#1E3A8A] mb-2 uppercase tracking-wide">
        <QrCode className="h-4 w-4" />
        <span>VietQR Chuyển Khoản</span>
      </div>

      <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
        <canvas ref={canvasRef} className="rounded" />
      </div>

      <div className="mt-3 w-full space-y-1 text-xs text-slate-700 text-left bg-slate-50 p-2.5 rounded-lg border border-slate-200">
        <div className="flex justify-between">
          <span className="text-slate-500">Ngân hàng:</span>
          <span className="font-semibold text-slate-800">{bankName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Số tài khoản:</span>
          <span className="font-bold text-[#1E3A8A]">{accountNo}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Chủ tài khoản:</span>
          <span className="font-semibold text-slate-800">{accountName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Số tiền:</span>
          <span className="font-bold text-rose-600">{amount.toLocaleString('vi-VN')} đ</span>
        </div>
        <div className="flex justify-between items-center pt-1 border-t border-slate-200">
          <span className="text-slate-500">Nội dung:</span>
          <span className="font-bold text-slate-900">{content}</span>
        </div>
      </div>

      <div className="mt-3 flex w-full gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold transition-colors"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
          <span>{copied ? 'Đã copy' : 'Copy cú pháp'}</span>
        </button>

        <button
          type="button"
          onClick={handleDownload}
          className="inline-flex items-center justify-center gap-1.5 py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-[#1E3A8A] rounded-md text-xs font-semibold transition-colors"
          title="Tải ảnh QR"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Tải QR</span>
        </button>
      </div>
    </div>
  );
}

