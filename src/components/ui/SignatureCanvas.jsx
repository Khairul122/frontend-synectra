import { useEffect, useRef, useState } from 'react';
import { cn } from '../../utils/cn';
import { COMPANY_SIGNATURE_BUCKET } from '../../constants/api';
import supabase from '../../lib/supabase';
import { settingsService } from '../../services/settings.service';
import { useAlert } from '../../hooks/useAlert';

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 150;

async function uploadSignature(blob) {
  const filename = `${crypto.randomUUID()}.png`;
  const { error } = await supabase.storage
    .from(COMPANY_SIGNATURE_BUCKET)
    .upload(filename, blob, { cacheControl: '3600', upsert: false, contentType: 'image/png' });
  if (error) throw error;
  const { data } = supabase.storage.from(COMPANY_SIGNATURE_BUCKET).getPublicUrl(filename);
  return data.publicUrl;
}

export function SignatureCanvas() {
  const alert = useAlert();
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const [signatureUrl, setSignatureUrl] = useState(null);
  const [isRedrawing, setIsRedrawing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    settingsService.getSignature()
      .then(res => setSignatureUrl(res.data?.signatureUrl ?? null))
      .finally(() => setIsLoading(false));
  }, []);

  const getPos = (ev) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const point = ev.touches ? ev.touches[0] : ev;
    return {
      x: (point.clientX - rect.left) * (canvas.width / rect.width),
      y: (point.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const startDraw = (ev) => {
    ev.preventDefault();
    drawingRef.current = true;
    const ctx = canvasRef.current.getContext('2d');
    const { x, y } = getPos(ev);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (ev) => {
    if (!drawingRef.current) return;
    ev.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    const { x, y } = getPos(ev);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0D0D0D';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDraw = () => { drawingRef.current = false; };

  const handleClear = () => {
    const canvas = canvasRef.current;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const canvas = canvasRef.current;
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const url = await uploadSignature(blob);
      await settingsService.updateSignature(url);
      setSignatureUrl(url);
      setIsRedrawing(false);
      alert.success('Tanda tangan perusahaan berhasil disimpan.');
    } catch {
      alert.error('Gagal menyimpan tanda tangan.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return null;

  if (signatureUrl && !isRedrawing) {
    return (
      <div className="flex flex-col gap-3">
        <div className="bg-neu-white border-2 border-neu-black shadow-neu-sm p-4 flex items-center justify-center" style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
          <img src={signatureUrl} alt="Tanda tangan perusahaan" className="max-w-full max-h-full object-contain" />
        </div>
        <button
          onClick={() => setIsRedrawing(true)}
          className="self-start px-4 py-2 bg-neu-white border-2 border-neu-black shadow-neu-sm font-display font-bold text-xs uppercase hover:shadow-none"
        >
          Gambar Ulang
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="bg-neu-white border-2 border-neu-black shadow-neu-sm cursor-crosshair touch-none"
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={stopDraw}
        onMouseLeave={stopDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={stopDraw}
      />
      <div className="flex gap-2">
        <button
          onClick={handleClear}
          className="px-4 py-2 bg-neu-white border-2 border-neu-black shadow-neu-sm font-display font-bold text-xs uppercase hover:shadow-none"
        >
          Hapus
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={cn(
            'px-4 py-2 bg-neu-primary border-2 border-neu-black shadow-neu-sm font-display font-bold text-xs uppercase hover:shadow-none',
            isSaving && 'opacity-60 cursor-not-allowed',
          )}
        >
          {isSaving ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </div>
  );
}
