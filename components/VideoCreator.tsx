"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ');
  let line = '';
  let yy = y;
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, yy);
      line = words[n] + ' ';
      yy += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line !== '') ctx.fillText(line.trim(), x, yy);
}

function getSupportedMimeType(): string {
  const types = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm'
  ];
  for (const t of types) {
    if (MediaRecorder.isTypeSupported(t)) return t;
  }
  return '';
}

type Props = {
  title: string;
  items: string[];
  primary: string;
  accent: string;
  fps: number;
  width: number;
  height: number;
  secondsPerSlide: number;
  titleSeconds: number;
  outroSeconds: number;
};

export default function VideoCreator(props: Props) {
  const { title, items, primary, accent, fps, width, height, secondsPerSlide, titleSeconds, outroSeconds } = props;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const totalDurationMs = useMemo(() => {
    const slidesMs = items.length * secondsPerSlide * 1000;
    return (titleSeconds * 1000) + slidesMs + (outroSeconds * 1000);
  }, [items.length, secondsPerSlide, titleSeconds, outroSeconds]);

  const startRecording = useCallback(async () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const stream = (canvas as HTMLCanvasElement).captureStream(fps);

    const mimeType = getSupportedMimeType();
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    const donePromise = new Promise<Blob>((resolve) => {
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType || 'video/webm' });
        resolve(blob);
      };
    });

    recorder.start(200);
    setIsRecording(true);

    const tStart = performance.now();
    let rafId = 0;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Animation loop
    const render = () => {
      const now = performance.now();
      const elapsed = now - tStart;
      const t = clamp(elapsed / totalDurationMs, 0, 1);
      setProgress(t);

      // Draw background gradient with animated angle
      const angle = (now / 5000) % (2 * Math.PI);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const r = Math.sqrt(cx * cx + cy * cy);
      const x0 = cx + Math.cos(angle) * r;
      const y0 = cy + Math.sin(angle) * r;
      const x1 = cx - Math.cos(angle) * r;
      const y1 = cy - Math.sin(angle) * r;
      const grad = ctx.createLinearGradient(x0, y0, x1, y1);
      grad.addColorStop(0, primary);
      grad.addColorStop(1, accent);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle overlay grid
      ctx.save();
      ctx.globalAlpha = 0.07;
      ctx.strokeStyle = 'white';
      const grid = 40;
      for (let x = 0; x < canvas.width; x += grid) {
        ctx.beginPath();
        ctx.moveTo(x + (now * 0.01 % grid), 0);
        ctx.lineTo(x + (now * 0.01 % grid), canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += grid) {
        ctx.beginPath();
        ctx.moveTo(0, y + (now * 0.01 % grid));
        ctx.lineTo(canvas.width, y + (now * 0.01 % grid));
        ctx.stroke();
      }
      ctx.restore();

      // Determine which scene based on elapsed
      const titleEnd = titleSeconds * 1000;
      const slidesEnd = titleEnd + items.length * secondsPerSlide * 1000;

      ctx.fillStyle = 'white';

      if (elapsed <= titleEnd) {
        // Title scene
        const localT = easeInOutCubic(clamp(elapsed / titleEnd, 0, 1));
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        ctx.shadowBlur = 24;

        ctx.font = `700 ${Math.floor(canvas.width * 0.06)}px Inter, system-ui, sans-serif`;
        ctx.globalAlpha = 0.95;
        ctx.fillText(title, canvas.width / 2, canvas.height * (0.45 + (1 - localT) * 0.05));

        ctx.font = `500 ${Math.floor(canvas.width * 0.025)}px Inter, system-ui, sans-serif`;
        ctx.globalAlpha = 0.9 * localT;
        ctx.fillText('Tech Resolutions', canvas.width / 2, canvas.height * 0.58);
      } else if (elapsed <= slidesEnd) {
        const index = Math.floor((elapsed - titleEnd) / (secondsPerSlide * 1000));
        const slideElapsed = (elapsed - titleEnd) - index * secondsPerSlide * 1000;
        const appearT = clamp(slideElapsed / 400, 0, 1);
        const disappearT = clamp((secondsPerSlide * 1000 - slideElapsed) / 400, 0, 1);
        const alpha = Math.min(appearT, disappearT);

        const text = items[index] ?? '';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        ctx.shadowBlur = 20;

        const margin = Math.floor(canvas.width * 0.08);
        const top = Math.floor(canvas.height * 0.34);
        const availableWidth = canvas.width - margin * 2;

        ctx.globalAlpha = 0.95 * alpha;
        ctx.fillStyle = 'white';
        ctx.font = `800 ${Math.floor(canvas.width * 0.05)}px Inter, system-ui, sans-serif`;
        wrapText(ctx, text, margin, top, availableWidth, Math.floor(canvas.height * 0.08));

        // Badge indicator
        ctx.globalAlpha = 0.9 * alpha;
        ctx.font = `700 ${Math.floor(canvas.width * 0.025)}px Inter, system-ui, sans-serif`;
        ctx.fillText(`Resolution ${index + 1} / ${items.length}`, margin, top - Math.floor(canvas.height * 0.06));
      } else {
        // Outro scene
        const outroElapsed = elapsed - slidesEnd;
        const outroT = easeInOutCubic(clamp(outroElapsed / (outroSeconds * 1000 || 1), 0, 1));
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        ctx.shadowBlur = 24;

        ctx.globalAlpha = 0.95 * outroT;
        ctx.font = `800 ${Math.floor(canvas.width * 0.06)}px Inter, system-ui, sans-serif`;
        ctx.fillText('Let\'s build it. ??', canvas.width / 2, canvas.height * 0.5);
      }

      // Progress bar
      ctx.save();
      ctx.globalAlpha = 0.35;
      const barMargin = Math.floor(canvas.width * 0.08);
      const barWidth = canvas.width - barMargin * 2;
      const barHeight = Math.max(6, Math.floor(canvas.height * 0.01));
      const barY = canvas.height - barMargin;
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fillRect(barMargin, barY, barWidth, barHeight);
      ctx.fillStyle = 'white';
      ctx.globalAlpha = 0.85;
      ctx.fillRect(barMargin, barY, barWidth * t, barHeight);
      ctx.restore();

      if (elapsed < totalDurationMs) {
        rafId = requestAnimationFrame(render);
      } else {
        cancelAnimationFrame(rafId);
        recorder.stop();
      }
    };

    // Ensure correct size
    canvas.width = width;
    canvas.height = height;

    rafId = requestAnimationFrame(render);

    const blob = await donePromise;
    setIsRecording(false);
    const url = URL.createObjectURL(blob);
    setBlobUrl(url);

    // Autoplay in preview
    if (videoRef.current) {
      videoRef.current.src = url;
      videoRef.current.play().catch(() => {});
    }
  }, [fps, width, height, items, secondsPerSlide, title, titleSeconds, outroSeconds, primary, accent, totalDurationMs]);

  const stopAndReset = useCallback(() => {
    setIsRecording(false);
    setBlobUrl(null);
    setProgress(0);
  }, []);

  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  const totalSeconds = Math.round(totalDurationMs / 1000);

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ opacity: 0.9 }}>Total duration: <strong>{totalSeconds}s</strong></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={startRecording} disabled={isRecording}>
            {isRecording ? 'Rendering?' : 'Generate Video'}
          </button>
          <button onClick={stopAndReset} disabled={isRecording && !blobUrl}>Reset</button>
          {blobUrl && (
            <a href={blobUrl} download={`tech-resolutions-${Date.now()}.webm`} style={{ textDecoration: 'none' }}>
              <button>Download .webm</button>
            </a>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        <canvas ref={canvasRef} style={{ width: '100%', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }} />
        <video ref={videoRef} controls style={{ width: '100%', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'black' }} />
        <div style={{ height: 8, background: 'rgba(255,255,255,0.15)', borderRadius: 999 }}>
          <div style={{ width: `${Math.round(progress * 100)}%`, height: '100%', background: 'linear-gradient(90deg, ' + primary + ', ' + accent + ')', borderRadius: 999 }} />
        </div>
      </div>
    </div>
  );
}
