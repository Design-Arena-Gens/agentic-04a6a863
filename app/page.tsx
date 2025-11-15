"use client";

import { useMemo, useState } from 'react';
import VideoCreator from '../components/VideoCreator';

const defaultResolutions = [
  'Contribute to 3 open-source projects',
  'Automate weekly tasks with scripts',
  'Master TypeScript generics and tooling',
  'Ship 2 side projects to production',
  'Learn one new cloud service deeply'
].join('\n');

export default function Page() {
  const [resolutionsText, setResolutionsText] = useState(defaultResolutions);
  const [title, setTitle] = useState('My Tech Resolutions');
  const [primary, setPrimary] = useState('#0ea5e9');
  const [accent, setAccent] = useState('#8b5cf6');
  const [fps, setFps] = useState(30);
  const [width, setWidth] = useState(1280);
  const [height, setHeight] = useState(720);
  const [secondsPerSlide, setSecondsPerSlide] = useState(3);
  const [titleSeconds, setTitleSeconds] = useState(2);
  const [outroSeconds, setOutroSeconds] = useState(2);

  const resolutions = useMemo(() => (
    resolutionsText
      .split(/\r?\n/)
      .map(s => s.trim())
      .filter(Boolean)
  ), [resolutionsText]);

  return (
    <main style={{ minHeight: '100vh', background: '#0b1020', color: 'white' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>Tech Resolutions Video</h1>
        <p style={{ opacity: 0.8, marginBottom: 24 }}>Create a shareable animated video of your goals.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <section style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'grid', gap: 12 }}>
              <label>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Title</div>
                <input value={title} onChange={e => setTitle(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
              </label>
              <label>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Resolutions (one per line)</div>
                <textarea value={resolutionsText} onChange={e => setResolutionsText(e.target.value)} rows={10} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.2)', color: 'white', fontFamily: 'monospace' }} />
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>Primary color</div>
                  <input type="color" value={primary} onChange={e => setPrimary(e.target.value)} style={{ width: '100%', height: 42, borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)' }} />
                </label>
                <label>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>Accent color</div>
                  <input type="color" value={accent} onChange={e => setAccent(e.target.value)} style={{ width: '100%', height: 42, borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)' }} />
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>FPS</div>
                  <input type="number" min={10} max={60} value={fps} onChange={e => setFps(Number(e.target.value))} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                </label>
                <label>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>Size</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input type="number" min={640} max={1920} value={width} onChange={e => setWidth(Number(e.target.value))} style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                    <span style={{ alignSelf: 'center' }}>?</span>
                    <input type="number" min={360} max={1080} value={height} onChange={e => setHeight(Number(e.target.value))} style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                  </div>
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <label>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>Title seconds</div>
                  <input type="number" min={0} max={10} value={titleSeconds} onChange={e => setTitleSeconds(Number(e.target.value))} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                </label>
                <label>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>Seconds/slide</div>
                  <input type="number" min={1} max={10} value={secondsPerSlide} onChange={e => setSecondsPerSlide(Number(e.target.value))} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                </label>
                <label>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>Outro seconds</div>
                  <input type="number" min={0} max={10} value={outroSeconds} onChange={e => setOutroSeconds(Number(e.target.value))} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                </label>
              </div>
            </div>
          </section>

          <section style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 16 }}>
            <VideoCreator
              title={title}
              items={resolutions}
              primary={primary}
              accent={accent}
              fps={fps}
              width={width}
              height={height}
              secondsPerSlide={secondsPerSlide}
              titleSeconds={titleSeconds}
              outroSeconds={outroSeconds}
            />
          </section>
        </div>
      </div>
    </main>
  );
}
