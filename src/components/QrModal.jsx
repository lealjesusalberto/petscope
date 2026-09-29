import React, { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download, Printer, Copy, Check, ExternalLink, ShieldCheck, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function QrModal({ pet, onClose, onOpenProfile }) {
  const [copied, setCopied] = useState(false);
  const tagRef = useRef(null);

  if (!pet) return null;

  // The actual public URL encoded into the QR code
  const profileUrl = `${window.location.origin}${window.location.pathname}?id=${pet.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(profileUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  const handlePrint = () => {
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    window.print();
  };

  // Convert SVG QR to canvas and download PNG
  const handleDownload = () => {
    const svgElement = tagRef.current?.querySelector('svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = 600;
    canvas.height = 600;

    img.onload = () => {
      // Draw background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 50, 50, 500, 500);

      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `placa-qr-${pet.name.toLowerCase()}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#FEF3C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#D97706'
            }}>
              <ShieldCheck size={18} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1C1917' }}>
              Placa QR de {pet.name}
            </h3>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#F5F5F4',
              border: 'none',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#78716C'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Physical Collar Tag Preview */}
        <div ref={tagRef} className="qr-collar-tag-preview" style={{ marginBottom: '20px' }}>
          <div className="qr-hole-punch" />

          {/* Tag Title */}
          <div style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: '#B45309', marginBottom: '8px' }}>
            Q-pet • ID Oficial
          </div>

          {/* QR Code Container */}
          <div style={{
            background: '#FFFFFF',
            padding: '16px',
            borderRadius: '20px',
            display: 'inline-block',
            boxShadow: '0 8px 16px rgba(0,0,0,0.06)',
            marginBottom: '12px'
          }}>
            <QRCodeSVG
              value={profileUrl}
              size={190}
              level="H"
              includeMargin={false}
              fgColor="#1C1917"
              bgColor="#FFFFFF"
              imageSettings={{
                src: "/favicon.svg",
                x: undefined,
                y: undefined,
                height: 38,
                width: 38,
                excavate: true,
              }}
            />
          </div>

          {/* Pet info on medal */}
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#1C1917', lineHeight: 1.2 }}>
            {pet.name}
          </div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#78350F', marginTop: '2px' }}>
            Escanéame si estoy perdido
          </div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#1C1917', marginTop: '6px', background: 'rgba(255, 255, 255, 0.75)', padding: '4px 12px', borderRadius: '12px', display: 'inline-block' }}>
            Tel: {pet.owner?.phoneFormatted || pet.owner?.phone}
          </div>
        </div>

        {/* Actions Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
          <button
            onClick={handleDownload}
            style={{
              background: '#FFA800',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '14px',
              padding: '12px',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(255,168,0,0.3)'
            }}
          >
            <Download size={16} />
            <span>Descargar PNG</span>
          </button>

          <button
            onClick={handlePrint}
            style={{
              background: '#FFFFFF',
              color: '#1C1917',
              border: '1.5px solid #E7E5E4',
              borderRadius: '14px',
              padding: '12px',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <Printer size={16} />
            <span>Imprimir Placa</span>
          </button>
        </div>

        {/* Copy link or direct view */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={handleCopy}
            style={{
              background: '#FDFBF7',
              border: '1px solid #F3E8D6',
              borderRadius: '14px',
              padding: '10px 14px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#57534E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer'
            }}
          >
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '260px' }}>
              {profileUrl}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: copied ? '#16A34A' : '#FFA800', fontWeight: 700 }}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
            </div>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenProfile(pet);
            }}
            className="btn-secondary"
            style={{ padding: '10px 16px', fontSize: '13px' }}
          >
            <ExternalLink size={16} />
            <span>Simular Escaneo (Ver Perfil Público)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
