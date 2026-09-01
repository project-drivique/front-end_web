import { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Pad de firma sobre <canvas>, sin librerías externas. Expone dos métodos
 * vía ref: estaVacio() y obtenerDataUrl(). El trazo se adapta al tema
 * (claro/oscuro) leyendo la variable CSS --texto-primary para el color de
 * la tinta, de modo que la firma siempre sea legible sobre el fondo blanco
 * del propio canvas (el canvas se mantiene blanco a propósito, como una
 * hoja física, incluso en modo oscuro).
 */
const FirmaCanvas = forwardRef(function FirmaCanvas({ onCambio }, ref) {
  const { t } = useTranslation();
  const canvasRef = useRef(null);
  const dibujando = useRef(false);
  const tieneTrazo = useRef(false);
  const ultimoPunto = useRef({ x: 0, y: 0 });
  const [vacio, setVacio] = useState(true);

  const obtenerContexto = () => canvasRef.current?.getContext('2d') || null;

  const ajustarTamano = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const ctx = obtenerContexto();
    if (ctx) {
      ctx.scale(ratio, ratio);
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#1f2937';
    }
  };

  useEffect(() => {
    ajustarTamano();
    window.addEventListener('resize', ajustarTamano);
    return () => window.removeEventListener('resize', ajustarTamano);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const obtenerPunto = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const origen = e.touches ? e.touches[0] : e;
    return { x: origen.clientX - rect.left, y: origen.clientY - rect.top };
  };

  const empezar = (e) => {
    e.preventDefault();
    dibujando.current = true;
    ultimoPunto.current = obtenerPunto(e);
  };

  const mover = (e) => {
    if (!dibujando.current) return;
    e.preventDefault();
    const ctx = obtenerContexto();
    const punto = obtenerPunto(e);
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(ultimoPunto.current.x, ultimoPunto.current.y);
      ctx.lineTo(punto.x, punto.y);
      ctx.stroke();
    }
    ultimoPunto.current = punto;
    if (!tieneTrazo.current) {
      tieneTrazo.current = true;
      setVacio(false);
      onCambio?.(false);
    }
  };

  const terminar = () => {
    dibujando.current = false;
  };

  const limpiar = () => {
    const canvas = canvasRef.current;
    const ctx = obtenerContexto();
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    tieneTrazo.current = false;
    setVacio(true);
    onCambio?.(true);
  };

  useImperativeHandle(ref, () => ({
    estaVacio: () => tieneTrazo.current === false,
    limpiar,
    obtenerDataUrl: () => canvasRef.current?.toDataURL('image/png') || null,
  }));

  return (
    <div>
      <canvas
        ref={canvasRef}
        onMouseDown={empezar}
        onMouseMove={mover}
        onMouseUp={terminar}
        onMouseLeave={terminar}
        onTouchStart={empezar}
        onTouchMove={mover}
        onTouchEnd={terminar}
        style={{
          width: '100%',
          height: 160,
          display: 'block',
          background: '#ffffff',
          borderRadius: 14,
          border: '2px dashed var(--brand-border)',
          touchAction: 'none',
          cursor: 'crosshair',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
        <span style={{ fontSize: 12, color: 'var(--texto-second)' }}>
          {t('contratoFirma.signHere')}
        </span>
        <button
          type="button"
          onClick={limpiar}
          disabled={vacio}
          style={{
            background: 'none',
            border: 'none',
            color: vacio ? 'var(--texto-second)' : '#dc2626',
            fontSize: 12,
            fontWeight: 700,
            cursor: vacio ? 'default' : 'pointer',
            opacity: vacio ? 0.5 : 1,
            padding: 0,
          }}
        >
          {t('contratoFirma.clearSignature')}
        </button>
      </div>
    </div>
  );
});

export default FirmaCanvas;
