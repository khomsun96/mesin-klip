import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, staticFile, delayRender, continueRender} from 'remotion';
import ep from './ep.json';
import {Scene3D, SETS} from './Scene3D';

const KUNING = '#FFC531', GELAP = '#12163A';
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const pop = (t: number, d = 0.32) => { // 0..1 dengan pantulan
  const p = clamp(t / d); if (p <= 0) return 0;
  return 1 + Math.sin(p * Math.PI) * 0.22 * (1 - p) - Math.pow(1 - p, 3);
};
const fonts: [string, string, string][] = [
  ['Poppins', '500', 'poppins-latin-500-normal.woff2'], ['Poppins', '600', 'poppins-latin-600-normal.woff2'],
  ['Poppins', '700', 'poppins-latin-700-normal.woff2'], ['Poppins', '800', 'poppins-latin-800-normal.woff2'],
  ['Amiri', '700', 'amiri-arabic-700-normal.woff2'],
];
let loaded = false;
const useFonts = () => {
  const [h] = React.useState(() => (loaded ? null : delayRender('font')));
  React.useEffect(() => {
    if (loaded || h === null) return;
    Promise.all(fonts.map(([f, w, file]) => new FontFace(f, `url(${staticFile('fonts/' + file)})`, {weight: w}).load().then((ff) => (document as any).fonts.add(ff))))
      .then(() => { loaded = true; continueRender(h); });
  }, [h]);
};

const ICON: Record<string, React.ReactNode> = {
  x: <path d="M7 7L25 25M25 7L7 25" stroke="#FF5A4A" strokeWidth="5" strokeLinecap="round" />,
  check: <path d="M6 17l7 7L26 9" stroke="#4ADE80" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
  boom: <path d="M16 2l3.5 8 8.5-2.5-5 7.5 7 5-8.5 1 .5 9-6-6.5-6 6.5.5-9-8.5-1 7-5-5-7.5L12.5 10z" fill="#FF5A4A" />,
  mute: <g stroke="#fff" strokeWidth="3.5" strokeLinecap="round" fill="none"><circle cx="16" cy="16" r="11" /><path d="M10 19h12" /></g>,
  walk: <g stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"><path d="M5 16h19" /><path d="M17 8l8 8-8 8" /></g>,
  sound: <g stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"><path d="M5 12v8h5l7 6V6l-7 6z" fill="#fff" /><path d="M22 11c2 3 2 7 0 10M26 7c4 5.5 4 12.500 0 18" /></g>,
  hand: <g fill="#fff"><rect x="8" y="12" width="16" height="15" rx="6" /><rect x="8.500" y="5" width="3.6" height="12" rx="1.8" /><rect x="12.800" y="3" width="3.6" height="13" rx="1.8" /><rect x="17.100" y="4" width="3.6" height="13" rx="1.8" /><rect x="21.300" y="7" width="3.400" height="11" rx="1.7" /></g>,
  chat: <path d="M5 6h22a2 2 0 012 2v12a2 2 0 01-2 2H15l-7 6v-6H5a2 2 0 01-2-2V8a2 2 0 012-2z" fill="#fff" />,
  fire: <path d="M16 2c1 6 8 8 8 16a8 8 0 01-16 0c0-3 1.500-5 3-6 0 3 1.500 4 2.500 4C13 11 13 6 16 2z" fill="#FF7A2E" />,
  down: <g stroke="#FFC531" strokeWidth="4.500" strokeLinecap="round" strokeLinejoin="round" fill="none"><path d="M16 5v20" /><path d="M7 17l9 9 9-9" /></g>,
};
const Tile: React.FC<{it: any; time: number}> = ({it, time}) => {
  const k = pop(time - it.t);
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, transform: `scale(${k})`, opacity: k > 0 ? 1 : 0}}>
      <div style={{width: 150, height: 150, borderRadius: 36, background: 'rgba(18,22,58,0.88)', border: '3px solid rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(0,0,0,.35)'}}>
        <svg width="90" height="90" viewBox="0 0 32 32">{ICON[it.icon] || ICON.check}</svg>
      </div>
      <div style={{font: '700 34px Poppins', color: '#fff', letterSpacing: 1.5, background: 'rgba(18,22,58,0.8)', padding: '6px 16px', borderRadius: 12, whiteSpace: 'nowrap'}}>{it.text}</div>
    </div>
  );
};
const Pill: React.FC<{it: any; time: number}> = ({it, time}) => {
  const k = pop(time - it.t);
  return <div style={{transform: `scale(${k})`, opacity: k > 0 ? 1 : 0, font: '700 34px Poppins', letterSpacing: 3, color: '#fff', background: 'rgba(18,22,58,0.88)', border: '3px solid rgba(255,255,255,0.25)', padding: '12px 30px', borderRadius: 999, whiteSpace: 'nowrap'}}>{it.text}</div>;
};
const Stamp: React.FC<{it: any; time: number}> = ({it, time}) => {
  const t = time - it.t; const p = clamp(t / 0.16);
  const s = t <= 0 ? 0 : 2.4 - 1.4 * p + Math.sin(clamp((t - 0.16) / 0.25) * Math.PI) * 0.08;
  return <div style={{transform: `rotate(-5deg) scale(${s})`, opacity: t > 0 ? 1 : 0, font: '800 60px Poppins', letterSpacing: 4, color: GELAP, background: KUNING, border: `6px solid ${GELAP}`, padding: '8px 34px', borderRadius: 18, boxShadow: '0 12px 0 rgba(0,0,0,.28)', whiteSpace: 'nowrap'}}>{it.text}</div>;
};
const Heading: React.FC<{h: any; time: number}> = ({h, time}) => {
  if (!h || time < h.t || (h.out && time > h.out + 0.2)) return null;
  const out = h.out ? clamp((time - h.out) / 0.2) : 0;
  const maxLen = Math.max(...h.lines.map((l: any) => l[0].length));
  const fs = Math.min(138, 860 / (maxLen * 0.66));
  return (
    <div style={{position: 'absolute', top: 285, left: 60, right: 100, textAlign: 'center', opacity: 1 - out, transform: `translateY(${-out * 40}px)`}}>
      {h.lines.map((l: any, i: number) => {
        const k = pop(time - h.t - i * 0.16, 0.3);
        return <div key={i} style={{font: `800 ${fs}px Poppins`, lineHeight: 1.06, letterSpacing: 1, color: l[1] ? KUNING : '#fff', transform: `scale(${k})`, opacity: k > 0 ? 1 : 0, textShadow: '0 6px 0 rgba(10,12,40,.55), 0 14px 34px rgba(0,0,0,.45)', whiteSpace: 'nowrap'}}>{l[0]}</div>;
      })}
    </div>
  );
};
const Arab: React.FC<{a: any; time: number}> = ({a, time}) => {
  if (!a || time < a.t) return null;
  const k = clamp((time - a.t) / 0.5);
  return (
    <div style={{position: 'absolute', top: 262, left: 70, right: 110, textAlign: 'center', opacity: k, transform: `translateY(${(1 - k) * 30}px)`}}>
      <div style={{font: '700 76px Amiri', direction: 'rtl', color: '#fff', lineHeight: 1.5, textShadow: '0 4px 24px rgba(0,0,0,.6)'}}>{a.text}</div>
      <div style={{font: 'italic 500 37px Poppins', color: '#F3ECFF', marginTop: 12, lineHeight: 1.35, textShadow: '0 3px 14px rgba(0,0,0,.7)'}}>{a.trans}</div>
      <div style={{display: 'inline-block', marginTop: 22, font: '700 29px Poppins', letterSpacing: 2.5, color: GELAP, background: KUNING, padding: '9px 24px', borderRadius: 999, transform: `scale(${pop(time - a.srcT)})`}}>{a.src}</div>
    </div>
  );
};

// caption per kata
const chunks = (() => {
  const out: number[][] = []; let cur: number[] = []; let len = 0;
  ep.words.forEach((w: any, i: number) => {
    cur.push(i); len += w.w.length + 1;
    const endS = /[.?!:]$/.test(w.w), comma = /,$/.test(w.w);
    const gap = i + 1 < ep.words.length ? ep.words[i + 1].s - w.e : 9;
    if (endS || cur.length >= 5 || len > 26 || (comma && cur.length >= 3) || gap > 0.3) { out.push(cur); cur = []; len = 0; }
  });
  if (cur.length) out.push(cur);
  return out;
})();
const Caption: React.FC<{time: number}> = ({time}) => {
  const ch = chunks.find((c) => time >= ep.words[c[0]].s - 0.12 && time < ep.words[c[c.length - 1]].e + 0.22);
  if (!ch) return null;
  return (
    <div style={{position: 'absolute', top: 1330, left: 70, right: 150, textAlign: 'center', font: '700 58px Poppins', lineHeight: 1.3}}>
      <span style={{background: 'rgba(12,14,40,0.62)', padding: '8px 22px', borderRadius: 18, boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone'} as any}>
        {ch.map((i) => {
          const w: any = ep.words[i]; const act = time >= w.s - 0.03 && time < w.e + 0.06; const done = time >= w.e + 0.06;
          return <span key={i} style={{color: act ? KUNING : '#fff', opacity: act || done ? 1 : 0.45, display: 'inline-block', transform: `scale(${act ? 1.08 : 1})`, margin: '0 11px'}}>{w.w}</span>;
        })}
      </span>
    </div>
  );
};

const Hook: React.FC<{time: number; end: number}> = ({time, end}) => {
  const {hits, lines} = ep.hook;
  const out = clamp((time - (end - 0.25)) / 0.25);
  return (
    <div style={{position: 'absolute', top: 300, left: 50, right: 90, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, opacity: 1 - out}}>
      {lines.map((l: string, i: number) => {
        const t = time - hits[i]; if (t < 0) return null;
        const s = 1 + 1.3 * Math.pow(1 - clamp(t / 0.14), 2);
        const last = i === lines.length - 1;
        const fs = Math.min(128, 880 / (l.length * 0.66));
        return <div key={i} style={{font: `800 ${fs}px Poppins`, lineHeight: 1.08, transform: `scale(${s}) rotate(${last ? -2 : 0}deg)`, color: last ? GELAP : '#fff', background: last ? KUNING : 'transparent', padding: last ? '6px 30px' : 0, borderRadius: 16, textShadow: last ? 'none' : '0 6px 0 rgba(10,12,40,.6), 0 14px 34px rgba(0,0,0,.5)', whiteSpace: 'nowrap'}}>{l}</div>;
      })}
    </div>
  );
};

const Poll: React.FC<{time: number}> = ({time}) => {
  const P: any = ep.poll; const t = time - P.start; if (t < 0) return null;
  const a = clamp(t / 0.35);
  const active = [...P.opts].reverse().find((o: any) => time >= o.t - 0.05);
  const cta = pop(time - P.ctaT);
  return (
    <AbsoluteFill style={{background: `rgba(10,12,38,${0.66 * a})`}}>
      <div style={{position: 'absolute', top: 300, left: 80, right: 130, textAlign: 'center'}}>
        <div style={{display: 'inline-block', font: '800 36px Poppins', letterSpacing: 6, color: GELAP, background: KUNING, padding: '8px 28px', borderRadius: 999, transform: `scale(${pop(t)})`}}>GILIRANMU</div>
        <div style={{font: '800 78px Poppins', color: '#fff', lineHeight: 1.14, marginTop: 30, opacity: clamp((t - 0.25) / 0.3), textShadow: '0 5px 0 rgba(0,0,0,.35)'}}>{P.q}</div>
      </div>
      <div style={{position: 'absolute', top: 760, left: 90, right: 150, display: 'flex', flexDirection: 'column', gap: 30}}>
        {P.opts.map((o: any, i: number) => {
          const k = clamp((t - 0.7 - i * 0.14) / 0.3); const on = active && active.k === o.k;
          const bump = on ? 1 + Math.sin(clamp((time - o.t) / 0.3) * Math.PI) * 0.06 : 1;
          return (
            <div key={o.k} style={{display: 'flex', alignItems: 'center', gap: 28, background: on ? KUNING : '#FBF3E0', borderRadius: 30, padding: '24px 30px', transform: `translateX(${(1 - k) * (i % 2 ? 700 : -700)}px) scale(${bump})`, boxShadow: on ? '0 0 0 8px rgba(255,197,49,.3), 0 14px 0 rgba(0,0,0,.3)' : '0 12px 0 rgba(0,0,0,.28)'}}>
              <div style={{width: 96, height: 96, borderRadius: 24, background: GELAP, color: on ? KUNING : '#fff', font: '800 62px Poppins', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{o.k}</div>
              <div style={{font: '800 68px Poppins', color: GELAP}}>{o.text}</div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', top: 1335, left: 70, right: 150, textAlign: 'center'}}>
        <div style={{display: 'inline-block', font: '700 42px Poppins', color: '#fff', background: '#E5383B', padding: '16px 34px', borderRadius: 999, transform: `scale(${cta * (1 + Math.sin(time * 6) * 0.03)})`}}>{P.cta}</div>
        <div style={{font: '600 34px Poppins', color: '#fff', opacity: 0.85 * clamp((time - P.ctaT - 1.6) / 0.4), marginTop: 22, letterSpacing: 2}}>Follow {ep.handle}</div>
      </div>
    </AbsoluteFill>
  );
};

export const Video: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame(); const {fps, width, height} = useVideoConfig();
  const time = frame / fps;
  const scenes: any[] = ep.scenes as any;
  const sc = [...scenes].reverse().find((s) => time >= s.start) || scenes[0];
  const isHook = sc.id === 'hook', isPoll = sc.id === 'poll';
  const ts = time - sc.start;
  // pukulan hook + transisi adegan
  let scale = 1 + (isHook ? 0 : Math.pow(1 - clamp(ts / 0.3), 3) * 0.09), flash = isHook ? 0 : Math.pow(1 - clamp(ts / 0.2), 2) * 0.5;
  let sx = 0, sy = 0, gray = 0;
  if (isHook) {
    const hits = ep.hook.hits; let n = 0;
    hits.forEach((h: number) => { const t = time - h; if (t >= 0) { n++; const d = Math.pow(1 - clamp(t / 0.22), 2); scale += 0.07 * d; flash = Math.max(flash, d * 0.55); sx += Math.sin(t * 90) * 16 * d; sy += Math.cos(t * 70) * 12 * d; } });
    scale += n * 0.045; gray = time < hits[2] ? 1 : 0;
  }
  const blur = isPoll ? clamp(ts / 0.35) * 7 : 0;
  return (
    <AbsoluteFill style={{background: SETS[sc.set].bg, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `translate(${sx}px,${sy}px) scale(${scale})`, filter: gray > 0 ? 'grayscale(1) contrast(1.25)' : blur > 0.05 ? `blur(${blur}px)` : 'none'}}>
        <Scene3D scene={sc} time={time} width={width} height={height} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(6,8,30,.42) 100%)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(8,10,34,.55) 0%, rgba(8,10,34,0) 26%, rgba(8,10,34,0) 62%, rgba(8,10,34,.5) 100%)'}} />
      {/* bar atas */}
      {!isHook && (
        <div style={{position: 'absolute', top: 150, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16}}>
          <div style={{width: 760, height: 6, borderRadius: 3, background: 'rgba(255,255,255,.22)'}}><div style={{width: `${(time / ep.dur) * 100}%`, height: 6, borderRadius: 3, background: KUNING}} /></div>
          <div style={{font: '700 25px Poppins', letterSpacing: 4, color: '#fff', background: 'rgba(18,22,58,.82)', border: '2px solid rgba(255,255,255,.25)', padding: '7px 22px', borderRadius: 999}}>{ep.tag} · {ep.seri}</div>
        </div>
      )}
      {isHook && <Hook time={time} end={sc.end} />}
      {!isHook && !isPoll && (
        <>
          <Heading h={sc.heading} time={time} />
          <Heading h={sc.heading2} time={time} />
          <Arab a={sc.arab} time={time} />
          {sc.items && (
            <div style={{position: 'absolute', top: sc.itemsY || (sc.heading ? 285 + Math.min(138, 860 / (Math.max(...sc.heading.lines.map((l: any) => l[0].length)) * 0.66)) * 2.12 + 36 : 620), left: 50, right: 100, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 30, flexWrap: 'wrap'}}>
              {sc.items.map((it: any, i: number) => it.kind === 'tile' ? <Tile key={i} it={it} time={time} /> : it.kind === 'pill' ? <Pill key={i} it={it} time={time} /> : <Stamp key={i} it={it} time={time} />)}
            </div>
          )}
          <Caption time={time} />
        </>
      )}
      {isPoll && <Poll time={time} />}
      <AbsoluteFill style={{background: '#fff', opacity: flash}} />
    </AbsoluteFill>
  );
};
