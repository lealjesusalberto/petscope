import React, { useEffect, useRef, useState } from 'react';
import { X, Camera, Image as ImageIcon, Sparkles, AlertCircle } from 'lucide-react';
import jsQR from 'jsqr';

export default function CameraScannerModal({ onScanSuccess, onClose, demoPets = [] }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('La cámara no está disponible o requiere HTTPS.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setCameraActive(true);
        requestAnimationFrame(tickScan);
      }
    } catch (err) {
      console.warn('Camera access issue:', err);
      setCameraError(err.message || 'No se pudo acceder a la cámara. Prueba subir una foto o usar los accesos de prueba.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const tickScan = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert'
        });

        if (code && code.data) {
          handleDetectedData(code.data);
          return;
        }
      }
    }
    animationFrameRef.current = requestAnimationFrame(tickScan);
  };

  const handleDetectedData = (dataStr) => {
    stopCamera();
    onScanSuccess(dataStr);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code && code.data) {
          handleDetectedData(code.data);
        } else {
          setCameraError('No se encontró ningún código QR legible en la imagen seleccionada.');
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ padding: 0 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '480px',
          height: '100%',
          maxHeight: '100vh',
          borderRadius: 0,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#1C1917',
          color: '#FFFFFF'
        }}
      >
        {/* Top Header */}
        <div style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(0, 0, 0, 0.6)',
          zIndex: 10
        }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFA800' }}>
              Escanear Placa QR
            </h3>
            <p style={{ fontSize: '12px', color: '#A8A29E' }}>
              Apunta la cámara a la medalla de la mascota
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Viewfinder Video Area */}
        <div style={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          backgroundColor: '#0C0A09'
        }}>
          <video
            ref={videoRef}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: cameraActive ? 'block' : 'none'
            }}
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {/* Scanner Viewfinder Target Frame */}
          <div style={{
            position: 'absolute',
            width: '240px',
            height: '240px',
            border: '2px solid rgba(255, 168, 0, 0.8)',
            borderRadius: '24px',
            boxShadow: '0 0 0 4000px rgba(0, 0, 0, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none'
          }}>
            {/* Viewfinder Corners */}
            <div style={{ position: 'absolute', top: -2, left: -2, width: 24, height: 24, borderTop: '4px solid #FFA800', borderLeft: '4px solid #FFA800', borderTopLeftRadius: '24px' }} />
            <div style={{ position: 'absolute', top: -2, right: -2, width: 24, height: 24, borderTop: '4px solid #FFA800', borderRight: '4px solid #FFA800', borderTopRightRadius: '24px' }} />
            <div style={{ position: 'absolute', bottom: -2, left: -2, width: 24, height: 24, borderBottom: '4px solid #FFA800', borderLeft: '4px solid #FFA800', borderBottomLeftRadius: '24px' }} />
            <div style={{ position: 'absolute', bottom: -2, right: -2, width: 24, height: 24, borderBottom: '4px solid #FFA800', borderRight: '4px solid #FFA800', borderBottomRightRadius: '24px' }} />

            {/* Scanning line animation */}
            <div style={{
              width: '90%',
              height: '2px',
              background: '#FFA800',
              boxShadow: '0 0 8px #FFA800',
              animation: 'float 2s ease-in-out infinite'
            }} />
          </div>

          {cameraError && (
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              right: '20px',
              background: 'rgba(239, 68, 68, 0.9)',
              padding: '12px',
              borderRadius: '12px',
              fontSize: '12px',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}>
              <AlertCircle size={16} />
              <span>{cameraError}</span>
            </div>
          )}
        </div>

        {/* Bottom Options & Simulator Bar */}
        <div style={{
          padding: '20px',
          backgroundColor: '#1C1917',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {/* File Upload Option */}
          <label style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px dashed rgba(255, 255, 255, 0.3)',
            borderRadius: '14px',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
            color: '#FFFFFF'
          }}>
            <ImageIcon size={16} color="#FFA800" />
            <span>Subir imagen con código QR</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </label>

          {/* Quick Demo Simulator buttons */}
          <div>
            <div style={{ fontSize: '11px', color: '#A8A29E', marginBottom: '6px', textAlign: 'center' }}>
              O simula escanear una placa directamente:
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {demoPets.slice(0, 3).map((pet) => (
                <button
                  key={pet.id}
                  onClick={() => handleDetectedData(`${window.location.origin}/?id=${pet.id}`)}
                  style={{
                    flex: 1,
                    background: '#292524',
                    border: '1px solid rgba(255, 168, 0, 0.3)',
                    borderRadius: '10px',
                    padding: '8px 4px',
                    color: '#FFA800',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Placa {pet.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
