import React from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const mix = (c1: string, c2: string, t: number) => {
  const p = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const a = p(c1), b = p(c2);
  return '#' + a.map((v, i) => Math.round(lerp(v, b[i], t)).toString(16).padStart(2, '0')).join('');
};
const PI = Math.PI;

// ---------- TOKOH (karakter orisinal) ----------
export const LOOKS: Record<string, any> = {
  utama: {koko: '#ffc531', trim: '#fff3c4', topi: '#ffffff', pita: '#1f2a5c', celana: '#1f2a5c', kulit: '#f6cfa6', ph: 0, ikon: true, tanpaTopi: true, rambut: '#1b1d2b', sorban: '#1f9d6b', gaya: 'jambul'},  // PAK ITHAJI, tokoh ikon
  teman: {koko: '#b9a2ff', trim: '#ebe3ff', topi: '#232a55', pita: '#ffc531', celana: '#3a3f6b', kulit: '#f3c79b', ph: 1.3},
  murid: {koko: '#f4f6ff', trim: '#cfd6ff', topi: '#232a55', pita: '#ffc531', celana: '#27304f', kulit: '#ffd9b3', ph: 0.7, scale: 0.8},
  murid2: {koko: '#ff9f7a', trim: '#ffe1d4', topi: '#ffffff', pita: '#27304f', celana: '#3a3f6b', kulit: '#f3c79b', ph: 2.6, scale: 0.8},
  teman2: {koko: '#63d2be', trim: '#d6fbf3', topi: '#8a2b3a', pita: '#ffe7a3', celana: '#27304f', kulit: '#ffd0a6', ph: 2.1},
};
const DEF = {x: 0, z: 0, yaw: 0, sit: 0, lie: 0, anger: 0, wave: 0, hot: 0, nod: 0, walk: 0, shrink: 0, jump: 0, spin: 0, clap: 0, point: 0, raise: 0, cover: 0, dance: 0, big: 0, tilt: 0, up: 0, cheer: 0};
export const pose = (keys: any[], t: number) => {
  const cur: any = {...DEF};
  for (const k of keys) {
    const d = k.d ?? 0.45;
    const p = k.t <= 0.0001 ? 1 : ease(clamp((t - k.t) / d));
    if (p <= 0) continue;
    for (const key of Object.keys(DEF)) if (k[key] !== undefined) cur[key] = lerp(cur[key], k[key], p);
  }
  return cur;
};
const M = ({c, e = 0, r = 0.8}: {c: string; e?: number; r?: number}) => (
  <meshLambertMaterial color={c} emissive={c} emissiveIntensity={e} />
);

const Tokoh: React.FC<{p: any; look: string; time: number}> = ({p, look, time}) => {
  const L = LOOKS[look];
  const sitE = p.sit * (1 - p.lie);
  const shake = p.anger > 0.5 ? Math.sin(time * 46) * 0.02 * p.anger : 0;
  const bob = Math.sin(time * 2.2 + L.ph) * 0.018 + Math.abs(Math.sin(time * 7)) * 0.07 * p.walk;
  const y = -0.33 * sitE - 0.05 * p.lie + bob + p.up + p.jump * Math.abs(Math.sin(time * 7.5)) * 0.55 + p.dance * Math.abs(Math.sin(time * 6)) * 0.12;
  const spinY = p.spin * time * 7;
  const dsway = p.dance * Math.sin(time * 6) * 0.18;
  const sw = p.walk * Math.sin(time * 7) * 0.6;
  const blink = (time + L.ph) % 3.4 < 0.12 ? 0.12 : 1;
  const kulit = mix(L.kulit, '#ff8f78', p.anger * 0.55);
  const wv = p.wave * (1.75 + Math.sin(time * 11 + L.ph) * 0.4);
  const armX = -sitE * 0.55 * (1 - p.wave) + p.wave * Math.sin(time * 9) * 0.3;
  const armRot = (sd: number): [number, number, number] => {
    let rx = armX, rz = sd * (0.24 + wv);
    const dz = sd * (0.5 + Math.sin(time * 6 + (sd > 0 ? 0 : PI)) * 1.0);
    rz = lerp(rz, dz, p.dance);
    const cz = sd * (2.6 + Math.sin(time * 10 + sd) * 0.25);
    rz = lerp(rz, cz, p.cheer);
    rx = lerp(rx, -1.4, p.clap); rz = lerp(rz, sd * (0.12 + Math.abs(Math.sin(time * 13)) * 0.35), p.clap);
    rx = lerp(rx, -2.55, p.cover); rz = lerp(rz, -sd * 0.45, p.cover);
    if (sd > 0) {
      rz = lerp(rz, 2.95 + Math.sin(time * 9) * 0.12, p.raise);
      rx = lerp(rx, -1.55, p.point); rz = lerp(rz, 0.15, p.point);
    }
    return [rx, 0, rz];
  };
  return (
    <group position={[p.x + dsway * 0.6, 0, p.z]} rotation={[0, p.yaw + spinY, 0]} scale={(L.scale || 1) * (1 + p.big)}>
      <mesh rotation={[-PI / 2, 0, 0]} position={[-p.lie * 0.7, 0.012, 0]} scale={[1 + p.lie * 0.9, 1, 1]}>
        <circleGeometry args={[0.66, 28]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.2} />
      </mesh>
      <group position={[shake, y, 0]}>
        <group position={[0, 0.45, 0]} rotation={[-p.shrink * 0.2, 0, p.lie * PI / 2 + dsway]} scale={1 - p.shrink * 0.05}>
          <group position={[0, -0.45, 0]}>
            {/* kaki */}
            {[-1, 1].map((s) => (
              <group key={s} position={[s * 0.17, 0.47, 0]} rotation={[0, s * 0.5 * sitE, 0]}><group rotation={[-sitE * PI / 2 + s * sw, 0, 0]}>
                <mesh position={[0, -0.22, 0]}><cylinderGeometry args={[0.14, 0.13, 0.44, 14]} /><M c={L.celana} /></mesh>
                <mesh position={[0, -0.43, 0.07]}><boxGeometry args={[0.24, 0.12, 0.38]} /><M c="#2b2b36" /></mesh>
              </group></group>
            ))}
            {/* badan */}
            <mesh position={[0, 1.07, 0]}><capsuleGeometry args={[0.41, 0.46, 8, 22]} /><M c={L.koko} /></mesh>
            <mesh position={[0, 1.12, 0.395]}><boxGeometry args={[0.07, 0.56, 0.04]} /><M c={L.trim} /></mesh>
            {L.ikon ? (
              <group>
                <mesh position={[0, 1.53, 0.02]} rotation={[PI / 2 - 0.12, 0, 0]}><torusGeometry args={[0.31, 0.105, 10, 26]} /><M c={L.sorban} /></mesh>
                <group position={[-0.2, 1.22, 0.4]} rotation={[0.1, 0, 0.1 + Math.sin(time * 2.4) * 0.04]}>
                  <mesh><boxGeometry args={[0.2, 0.5, 0.06]} /><M c={L.sorban} /></mesh>
                  <mesh position={[0, -0.13, 0.032]}><boxGeometry args={[0.2, 0.045, 0.01]} /><M c="#ffc531" /></mesh>
                  <mesh position={[0, -0.2, 0.032]}><boxGeometry args={[0.2, 0.02, 0.01]} /><M c="#ffffff" /></mesh>
                </group>
              </group>
            ) : (
              <mesh position={[0, 1.52, 0]} rotation={[PI / 2, 0, 0]}><torusGeometry args={[0.27, 0.06, 8, 22]} /><M c={L.trim} /></mesh>
            )}
            {[0, 1, 2].map((i) => (
              <mesh key={i} position={[0, 1.3 - i * 0.16, 0.425]}><sphereGeometry args={[0.022, 8, 8]} /><M c={L.pita} /></mesh>
            ))}
            {p.hot > 0.02 && (
              <mesh position={[0, 1.15, 0.2]} scale={p.hot * (1 + Math.sin(time * 9) * 0.12)}>
                <sphereGeometry args={[0.5, 18, 18]} />
                <meshBasicMaterial color="#ff3d1f" transparent opacity={0.55} />
              </mesh>
            )}
            {/* lengan */}
            {[-1, 1].map((s) => (
              <group key={s} position={[s * 0.47, 1.34, 0]} rotation={armRot(s)}>
                <mesh position={[0, -0.27, 0]}><capsuleGeometry args={[0.115, 0.34, 6, 14]} /><M c={L.koko} /></mesh>
                <mesh position={[0, -0.55, 0]}><sphereGeometry args={[0.115, 14, 14]} /><M c={kulit} /></mesh>
              </group>
            ))}
            {/* kepala */}
            <group position={[0, 1.95, 0]} rotation={[Math.sin(time * 3 + L.ph) * 0.08 * p.nod + p.anger * 0.06 + p.cover * 0.12, 0, p.tilt * 0.38]}>
              <mesh><sphereGeometry args={[0.48, 30, 26]} /><M c={kulit} r={0.7} /></mesh>
              {L.ikon && (
                <group>
                  <mesh position={[0, 0.075, -0.07]}><sphereGeometry args={[0.5, 30, 24]} /><M c={L.rambut} /></mesh>
                  {[-1, 1].map((s) => (<mesh key={s} position={[s * 0.445, 0.02, 0.15]} scale={[0.3, 1, 0.55]}><sphereGeometry args={[0.1, 12, 12]} /><M c={L.rambut} /></mesh>))}
                  
                  <mesh position={[0, -0.045, 0.478]} scale={[0.8, 1, 0.8]}><sphereGeometry args={[0.04, 10, 10]} /><M c={mix(kulit, '#c98a5e', 0.45)} /></mesh>
                  {[-1, 1].map((s) => (<mesh key={s} position={[s * 0.062, -0.088, 0.462]} rotation={[0, 0, -s * 0.22]} scale={[0.075, 0.022, 0.02]}><sphereGeometry args={[1, 10, 8]} /><M c={L.rambut} /></mesh>))}
                  <mesh position={[0, -0.335, 0.335]} scale={[0.15, 0.095, 0.07]}><sphereGeometry args={[1, 12, 10]} /><M c={L.rambut} /></mesh>
                </group>
              )}
              {!L.tanpaTopi && (
                <group>
                  <mesh position={[0, 0.4, 0]}><cylinderGeometry args={[0.36, 0.4, 0.27, 28]} /><M c={L.topi} /></mesh>
                  <mesh position={[0, 0.31, 0]}><cylinderGeometry args={[0.405, 0.408, 0.075, 28]} /><M c={L.pita} /></mesh>
                </group>
              )}
              {L.gaya === 'belakang' && (
                <group>
                  {/* sisir ke belakang + jambul gulung, satu garis kuning dari depan ke belakang */}
                  <mesh position={[0, 0.33, 0.24]} rotation={[-0.5, 0, 0]} scale={[0.4, 0.2, 0.25]}><sphereGeometry args={[1, 24, 18]} /><M c={L.rambut} /></mesh>
                  <mesh position={[0, 0.36, -0.02]} scale={[0.37, 0.15, 0.3]}><sphereGeometry args={[1, 24, 18]} /><M c={L.rambut} /></mesh>
                  <mesh position={[0.12, 0.33, 0.24]} rotation={[-0.5, 0, 0]} scale={[0.045, 0.2, 0.25]}><sphereGeometry args={[1, 14, 16]} /><M c="#ffc531" /></mesh>
                  <mesh position={[0.12, 0.36, -0.02]} scale={[0.045, 0.152, 0.294]}><sphereGeometry args={[1, 14, 16]} /><M c="#ffc531" /></mesh>
                </group>
              )}
              {L.gaya === 'jambul' && (
                <group>
                  {/* jambul ombak: naik lalu menggulung ke depan, ujung kuning */}
                  <mesh position={[0, 0.42, 0.14]} rotation={[0.3, 0, 0]} scale={[0.31, 0.25, 0.3]}><sphereGeometry args={[1, 24, 18]} /><M c={L.rambut} /></mesh>
                  <mesh position={[0, 0.6, 0.3]} rotation={[0.8, 0, 0]} scale={[0.21, 0.17, 0.2]}><sphereGeometry args={[1, 20, 16]} /><M c={L.rambut} /></mesh>
                  <mesh position={[0, 0.555, 0.47]} rotation={[1.25, 0, 0]} scale={[0.15, 0.13, 0.1]}><sphereGeometry args={[1, 16, 12]} /><M c="#ffc531" /></mesh>
                </group>
              )}
              {L.gaya === 'cepol' && (
                <group>
                  {/* rambut ditarik ke belakang, cepol di atas dengan ikat kuning, dua helai di dahi */}
                  <mesh position={[0, 0.34, 0.0]} scale={[0.4, 0.17, 0.4]}><sphereGeometry args={[1, 24, 18]} /><M c={L.rambut} /></mesh>
                  <mesh position={[0, 0.6, -0.2]}><sphereGeometry args={[0.185, 20, 16]} /><M c={L.rambut} /></mesh>
                  <mesh position={[0, 0.465, -0.17]} rotation={[PI / 2 - 0.3, 0, 0]}><torusGeometry args={[0.15, 0.042, 8, 22]} /><M c="#ffc531" /></mesh>
                  {[-1, 1].map((s) => (<mesh key={s} position={[s * 0.3, 0.2, 0.36]} rotation={[0, 0, -s * 1.0]} scale={[0.13, 0.04, 0.045]}><sphereGeometry args={[1, 12, 10]} /><M c={L.rambut} /></mesh>))}
                </group>
              )}
              {[-1, 1].map((s) => (
                <group key={s}>
                  {L.ikon && <mesh position={[s * 0.165, 0.02, 0.432]} scale={[1.55, 1.05 * blink, 0.5]}><sphereGeometry args={[0.06, 14, 12]} /><meshBasicMaterial color="#ffffff" /></mesh>}
                  <mesh position={[s * 0.165, 0.02, 0.445]} scale={[1, (L.ikon ? 1.05 : 1.3) * blink, 0.6]}><sphereGeometry args={[0.052, 12, 12]} /><meshBasicMaterial color={L.ikon ? '#2a2018' : '#20202c'} /></mesh>
                  {L.ikon && <mesh position={[s * 0.165 + 0.02, 0.04, 0.48]}><sphereGeometry args={[0.014, 8, 8]} /><meshBasicMaterial color="#ffffff" /></mesh>}
                  {L.ikon && <mesh position={[s * 0.168, 0.077, 0.452]} rotation={[0, 0, -s * 0.1]}><boxGeometry args={[0.19, 0.024, 0.02]} /><meshBasicMaterial color="#20202c" /></mesh>}
                  <mesh position={[s * 0.3, -0.1, 0.385]} scale={[1, 0.7, 0.3]}><sphereGeometry args={[0.075, 12, 12]} /><meshBasicMaterial color="#ff8fa0" transparent opacity={0.75} /></mesh>
                  {(p.anger > 0.15 || L.ikon) && (
                    <mesh position={[s * 0.17, L.ikon ? 0.155 : 0.17, 0.455]} rotation={[0, 0, s * ((L.ikon ? 0.13 : 0) + 0.45 * p.anger)]}><boxGeometry args={[L.ikon ? 0.2 : 0.17, L.ikon ? 0.05 : 0.04, 0.03]} /><meshBasicMaterial color="#20202c" /></mesh>
                  )}
                </group>
              ))}
              {p.anger > 0.45 ? (
                <mesh position={[0, -0.17, 0.455]}><boxGeometry args={[0.15, 0.045 + 0.05 * p.wave * Math.abs(Math.sin(time * 12)), 0.03]} /><meshBasicMaterial color="#5a1420" /></mesh>
              ) : (
                <mesh position={[0, -0.13, 0.455]} rotation={[0, 0, PI]}><torusGeometry args={[0.065, 0.016, 8, 16, PI]} /><meshBasicMaterial color="#5a1420" /></mesh>
              )}
            </group>
          </group>
        </group>
        {/* uap & percikan marah */}
        {p.anger > 0.4 && [0, 1, 2].map((i) => {
          const ph = (time * 0.9 + i / 3) % 1;
          return (
            <mesh key={i} position={[(i - 1) * 0.3, 2.75 + ph * 0.7, 0]} scale={0.1 + ph * 0.12}>
              <sphereGeometry args={[1, 12, 12]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={(1 - ph) * p.anger * 0.9} />
            </mesh>
          );
        })}
        {p.anger > 0.6 && [0, 1, 2, 3, 4, 5].map((i) => {
          const a = (i / 6) * 2 * PI + time * 1.6;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.95, 1.7 + Math.sin(i * 2 + time * 3) * 0.55, Math.sin(a) * 0.5 + 0.3]} rotation={[time * 3, time * 2, i]} scale={0.085 * p.anger}>
              <octahedronGeometry args={[1, 0]} />
              <meshBasicMaterial color={i % 2 ? '#ff4d3a' : '#ff9a2e'} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
};

// ---------- SET ----------
const Box = ({p, s, c, e = 0, r}: any) => (<mesh position={p} rotation={r}><boxGeometry args={s} /><M c={c} e={e} /></mesh>);
const Rumah = () => (
  <group>
    <mesh rotation={[-PI / 2, 0, 0]}><planeGeometry args={[60, 60]} /><M c="#c98f58" /></mesh>
    <mesh rotation={[-PI / 2, 0, 0]} position={[0, 0.006, 0.2]}><circleGeometry args={[2.7, 40]} /><M c="#2d8a8a" /></mesh>
    <mesh rotation={[-PI / 2, 0, 0]} position={[0, 0.008, 0.2]}><ringGeometry args={[2.25, 2.4, 40]} /><M c="#ffe7a3" /></mesh>
    <Box p={[0, 4.5, -3.4]} s={[40, 9, 0.2]} c="#24507a" />
    <Box p={[0, 0.6, -3.28]} s={[40, 1.2, 0.1]} c="#f0e3c8" />
    <Box p={[0, 1.24, -3.26]} s={[40, 0.1, 0.14]} c="#ffc531" />
    {/* jendela */}
    <Box p={[-3.3, 3.5, -3.26]} s={[2.5, 2.8, 0.1]} c="#ffffff" />
    <Box p={[-3.3, 3.5, -3.2]} s={[2.2, 2.5, 0.06]} c="#9fd8ff" e={0.55} />
    <Box p={[-3.3, 3.5, -3.16]} s={[0.09, 2.5, 0.06]} c="#ffffff" />
    <Box p={[-3.3, 3.5, -3.16]} s={[2.2, 0.09, 0.06]} c="#ffffff" />
    {/* sofa */}
    <Box p={[3.3, 0.42, -2.3]} s={[3.0, 0.6, 1.2]} c="#f1e6cf" />
    <Box p={[3.3, 1.0, -2.8]} s={[3.0, 1.1, 0.35]} c="#e9dcc0" />
    <Box p={[1.75, 0.7, -2.3]} s={[0.3, 0.95, 1.2]} c="#e9dcc0" />
    <Box p={[4.85, 0.7, -2.3]} s={[0.3, 0.95, 1.2]} c="#e9dcc0" />
    <Box p={[2.7, 0.9, -2.35]} s={[0.7, 0.55, 0.3]} c="#ff7b54" r={[0.25, 0, 0.1]} />
    {/* bingkai */}
    <Box p={[3.3, 3.5, -3.26]} s={[1.5, 1.1, 0.08]} c="#f0e3c8" />
    <Box p={[3.3, 3.5, -3.2]} s={[1.2, 0.8, 0.06]} c="#ff7b54" />
    {/* tanaman */}
    <mesh position={[-5.3, 0.4, -2.4]}><cylinderGeometry args={[0.42, 0.32, 0.8, 16]} /><M c="#d86b45" /></mesh>
    {[[-5.3, 1.5, -2.4, 0.6], [-5.75, 1.15, -2.3, 0.42], [-4.9, 1.2, -2.5, 0.45]].map((v, i) => (
      <mesh key={i} position={[v[0], v[1], v[2]]} scale={[1, 1.5, 1]}><sphereGeometry args={[v[3], 14, 12]} /><M c="#3fae6a" /></mesh>
    ))}
    {/* lampu */}
    <mesh position={[5.8, 1.6, -2.6]}><cylinderGeometry args={[0.04, 0.04, 3.2, 8]} /><M c="#333a55" /></mesh>
    <mesh position={[5.8, 3.3, -2.6]}><cylinderGeometry args={[0.3, 0.55, 0.7, 18]} /><M c="#ffe7a3" e={0.7} /></mesh>
  </group>
);
const rnd = (i: number) => { const x = Math.sin(i * 127.1) * 43758.5453; return x - Math.floor(x); };
const Malam: React.FC<{time: number}> = ({time}) => (
  <group>
    <mesh rotation={[-PI / 2, 0, 0]}><planeGeometry args={[80, 80]} /><M c="#1b2150" /></mesh>
    <Box p={[-0.35, 0.02, 0]} s={[3.9, 0.04, 1.9]} c="#8a2b3a" />
    <Box p={[-0.35, 0.03, 0]} s={[3.5, 0.04, 1.5]} c="#b23a48" />
    <Box p={[-0.35, 0.035, 0.83]} s={[3.5, 0.04, 0.06]} c="#ffc531" />
    <Box p={[-0.35, 0.035, -0.83]} s={[3.5, 0.04, 0.06]} c="#ffc531" />
    <group position={[1.9, 0, -8.5]} scale={0.55}><group position={[0, 0, 11]}>
    <Box p={[0, 1.7, -11]} s={[9, 3.4, 3]} c="#0f1438" />
    <mesh position={[0, 3.4, -11]}><sphereGeometry args={[2.1, 26, 16, 0, PI * 2, 0, PI / 2]} /><M c="#141a48" /></mesh>
    <mesh position={[0, 5.75, -11]} rotation={[0, 0, -0.6]}><torusGeometry args={[0.28, 0.07, 8, 18, PI * 1.25]} /><meshBasicMaterial color="#ffd66b" /></mesh>
    {[-5.6, 5.6].map((x) => (
      <group key={x}>
        <mesh position={[x, 3.2, -11]}><cylinderGeometry args={[0.45, 0.55, 6.4, 14]} /><M c="#0f1438" /></mesh>
        <mesh position={[x, 7.1, -11]}><coneGeometry args={[0.6, 1.5, 14]} /><M c="#141a48" /></mesh>
        <Box p={[x, 5.4, -10.5]} s={[0.24, 0.45, 0.1]} c="#f2b95e" e={0.5} />
      </group>
    ))}
    {[-3, -1.5, 0, 1.5, 3].map((x) => (<Box key={x} p={[x, 1.5, -9.45]} s={[0.42, 0.95, 0.1]} c="#f2b95e" e={0.5} />))}
    </group></group>
    <mesh position={[5.5, 10.5, -22]}><sphereGeometry args={[1.1, 20, 20]} /><meshBasicMaterial color="#fff2c9" /></mesh>
    {Array.from({length: 46}).map((_, i) => (
      <mesh key={i} position={[(rnd(i) - 0.5) * 34, 5 + rnd(i + 50) * 13, -22]} scale={0.05 + rnd(i + 9) * 0.07 + Math.sin(time * 2 + i) * 0.015}>
        <sphereGeometry args={[1, 6, 6]} /><meshBasicMaterial color="#ffffff" />
      </mesh>
    ))}
    {/* lentera */}
    {[-3.6, 3.6].map((x) => (
      <group key={x}>
        <mesh position={[x, 1.1, -1.9]}><cylinderGeometry args={[0.06, 0.08, 2.2, 8]} /><M c="#0f1438" /></mesh>
        <mesh position={[x, 2.4, -1.9]}><sphereGeometry args={[0.26, 14, 14]} /><meshBasicMaterial color="#ffd98a" /></mesh>
        <pointLight position={[x, 2.4, -1.5]} color="#ffbf70" intensity={14} distance={9} />
      </group>
    ))}
    {[-7, -5, 5, 7].map((x, i) => (<mesh key={x} position={[x, 0.55, -4 - (i % 2)]} scale={[1.3, 0.9, 1]}><sphereGeometry args={[0.9, 14, 12]} /><M c="#17305a" /></mesh>))}
    {Array.from({length: 13}).map((_, i) => (<Box key={i} p={[-9 + i * 1.5, 0.45, -6.2]} s={[0.12, 0.9, 0.12]} c="#27306a" />))}
    <Box p={[0, 0.7, -6.2]} s={[19, 0.1, 0.1]} c="#27306a" />
  </group>
);
const Kantor = () => (
  <group>
    <mesh rotation={[-PI / 2, 0, 0]}><planeGeometry args={[60, 60]} /><M c="#aebbd8" /></mesh>
    <Box p={[0, 4.5, -3.4]} s={[40, 9, 0.2]} c="#2b3770" />
    <Box p={[0, 0.25, -3.28]} s={[40, 0.5, 0.1]} c="#1d2552" />
    <Box p={[3.6, 3.6, -3.26]} s={[4.2, 2.4, 0.08]} c="#ffffff" />
    <Box p={[3.6, 3.6, -3.2]} s={[3.9, 2.1, 0.06]} c="#a9dcff" e={0.5} />
    <Box p={[3.6, 3.6, -3.16]} s={[0.08, 2.1, 0.06]} c="#ffffff" />
    {/* papan tulis */}
    <Box p={[-3.2, 3.4, -3.26]} s={[3.4, 2.1, 0.08]} c="#d9dfef" />
    <Box p={[-3.2, 3.4, -3.2]} s={[3.1, 1.8, 0.06]} c="#ffffff" />
    {[[0.55, 2.2, '#ffc531'], [0.15, 1.6, '#2b3770'], [-0.25, 2.0, '#2b3770'], [-0.6, 1.1, '#ff6b4a']].map((v: any, i) => (
      <Box key={i} p={[-3.2 - (2.4 - v[1]) / 2, 3.4 + v[0], -3.15]} s={[v[1], 0.11, 0.04]} c={v[2]} />
    ))}
    {/* meja */}
    <Box p={[0.05, 1.0, -1.9]} s={[3.6, 0.12, 1.3]} c="#d79a5b" />
    {[[-1.6, -2.4], [1.7, -2.4], [-1.6, -1.4], [1.7, -1.4]].map((v, i) => (<Box key={i} p={[v[0], 0.47, v[1]]} s={[0.12, 0.94, 0.12]} c="#8a5a33" />))}
    <Box p={[0.3, 1.09, -1.9]} s={[0.9, 0.05, 0.6]} c="#3b4160" />
    <Box p={[0.3, 1.42, -2.2]} s={[0.9, 0.62, 0.05]} c="#3b4160" r={[-0.2, 0, 0]} />
    <Box p={[0.3, 1.42, -2.17]} s={[0.8, 0.52, 0.02]} c="#8fd0ff" e={0.8} r={[-0.2, 0, 0]} />
    <mesh position={[-1.1, 1.2, -1.8]}><cylinderGeometry args={[0.13, 0.11, 0.28, 14]} /><M c="#ff6b4a" /></mesh>
    <mesh position={[5.6, 0.4, -2.5]}><cylinderGeometry args={[0.42, 0.32, 0.8, 16]} /><M c="#f0e3c8" /></mesh>
    <mesh position={[5.6, 1.5, -2.5]} scale={[1, 1.6, 1]}><sphereGeometry args={[0.6, 14, 12]} /><M c="#3fae6a" /></mesh>
  </group>
);
const Kelas = () => (
  <group>
    <mesh rotation={[-PI / 2, 0, 0]}><planeGeometry args={[60, 60]} /><M c="#d9b382" /></mesh>
    <Box p={[0, 4.5, -3.4]} s={[40, 9, 0.2]} c="#2a6f8f" />
    <Box p={[0, 0.5, -3.28]} s={[40, 1.0, 0.1]} c="#f0e3c8" />
    <Box p={[0.3, 3.3, -3.26]} s={[5.4, 2.6, 0.1]} c="#a9713f" />
    <Box p={[0.3, 3.3, -3.2]} s={[5.0, 2.2, 0.06]} c="#1f5a45" />
    {[[0.6, 2.6], [0.2, 3.4], [-0.2, 2.1], [-0.6, 3.0]].map((v, i) => (<Box key={i} p={[0.3 - (4.2 - v[1]) / 2, 3.3 + v[0], -3.15]} s={[v[1], 0.07, 0.03]} c="#eaf5ee" />))}
    <Box p={[0.3, 2.05, -3.1]} s={[5.0, 0.08, 0.2]} c="#a9713f" />
    <Box p={[-4.6, 3.5, -3.26]} s={[2.2, 2.6, 0.1]} c="#ffffff" />
    <Box p={[-4.6, 3.5, -3.2]} s={[1.9, 2.3, 0.06]} c="#9fd8ff" e={0.55} />
    <mesh position={[4.3, 4.6, -3.25]} rotation={[PI / 2, 0, 0]}><cylinderGeometry args={[0.45, 0.45, 0.08, 24]} /><M c="#ffffff" /></mesh>
    {[-2.9, 2.9].map((x) => (
      <group key={x} position={[x, 0, -1.9]}>
        <Box p={[0, 0.78, 0]} s={[1.5, 0.1, 0.8]} c="#e2a968" />
        <Box p={[-0.65, 0.39, 0]} s={[0.1, 0.78, 0.7]} c="#8a5a33" />
        <Box p={[0.65, 0.39, 0]} s={[0.1, 0.78, 0.7]} c="#8a5a33" />
        <Box p={[0.15, 0.87, 0.05]} s={[0.5, 0.06, 0.36]} c={x < 0 ? '#ff6b4a' : '#ffc531'} />
      </group>
    ))}
  </group>
);
export const SETS: Record<string, any> = {
  rumah: {bg: 'linear-gradient(#24507a,#24507a)', hemi: ['#fff6e6', '#b98a5e', 2.0], dir: ['#ffffff', 2.6], amb: 0.5},
  malam: {bg: 'linear-gradient(180deg,#120f33 0%,#33266b 42%,#7a4a8f 68%,#c0668a 80%,#1b2150 81%)', hemi: ['#8f9bff', '#2a2550', 1.5], dir: ['#cfd6ff', 1.7], amb: 0.55},
  kelas: {bg: 'linear-gradient(#2a6f8f,#2a6f8f)', hemi: ['#fff6e6', '#b98a5e', 2.0], dir: ['#ffffff', 2.5], amb: 0.5},
  dapur: {bg: 'linear-gradient(#7cc4a4,#7cc4a4)', hemi: ['#fffaf0', '#c9a777', 2.0], dir: ['#ffffff', 2.5], amb: 0.52},
  panggung: {bg: 'linear-gradient(#0d0b26,#2c1a5c)', hemi: ['#d8ccff', '#3a2a6a', 1.7], dir: ['#fff0d0', 2.6], amb: 0.45},
  kamar: {bg: 'linear-gradient(#3a2f7a,#3a2f7a)', hemi: ['#ffe9f5', '#7a5ab0', 1.8], dir: ['#fff2dc', 2.3], amb: 0.5},
  lapangan: {bg: 'linear-gradient(180deg,#5fc6ff 0%,#b8ecff 70%,#5ab65f 71%)', hemi: ['#ffffff', '#6aa05a', 2.1], dir: ['#fff6e0', 2.7], amb: 0.5},
  masjid: {bg: 'linear-gradient(#f3e7cf,#f3e7cf)', hemi: ['#fff6e0', '#2f8a5e', 1.9], dir: ['#ffe9c0', 2.3], amb: 0.5},
  gerbang: {bg: 'linear-gradient(180deg,#ffb36b 0%,#ffd9a0 60%,#9aa3b5 61%)', hemi: ['#fff1dc', '#8a8fa0', 2.0], dir: ['#ffe2b0', 2.6], amb: 0.5},
  kantor: {bg: 'linear-gradient(#2b3770,#2b3770)', hemi: ['#ffffff', '#8f9cc0', 2.0], dir: ['#ffffff', 2.4], amb: 0.5},
};

const Dapur = () => (
  <group>
    <mesh rotation={[-PI / 2, 0, 0]}><planeGeometry args={[60, 60]} /><M c="#e8d3a8" /></mesh>
    {Array.from({length: 14}).map((_, i) => (<Box key={'g'+i} p={[-13 + i * 2, 0.004, 0]} s={[0.04, 0.01, 30]} c="#cdb487" />))}
    <Box p={[0, 4.5, -3.4]} s={[40, 9, 0.2]} c="#7cc4a4" />
    {Array.from({length: 9}).map((_, i) => (<Box key={'t'+i} p={[-6 + i * 1.5, 2.6, -3.27]} s={[1.4, 1.4, 0.05]} c={i % 2 ? '#ffffff' : '#e7f6ee'} />))}
    {/* kabinet dapur */}
    <Box p={[-4.2, 0.75, -2.8]} s={[4.2, 1.5, 1.0]} c="#f7f0e1" />
    <Box p={[-4.2, 1.55, -2.8]} s={[4.4, 0.12, 1.1]} c="#ff8a5c" />
    <Box p={[-4.2, 4.0, -3.05]} s={[4.2, 1.2, 0.6]} c="#f7f0e1" />
    <mesh position={[-3.2, 1.85, -2.8]}><cylinderGeometry args={[0.35, 0.3, 0.5, 18]} /><M c="#3a3f63" /></mesh>
    <mesh position={[-5.0, 1.75, -2.75]}><sphereGeometry args={[0.28, 14, 12]} /><M c="#ff5a4e" /></mesh>
    <mesh position={[-4.5, 1.72, -2.6]}><sphereGeometry args={[0.24, 14, 12]} /><M c="#ffc531" /></mesh>
    {/* meja makan bundar */}
    <mesh position={[2.9, 1.05, -1.4]}><cylinderGeometry args={[1.25, 1.25, 0.12, 30]} /><M c="#c27a43" /></mesh>
    <mesh position={[2.9, 0.5, -1.4]}><cylinderGeometry args={[0.12, 0.3, 1.0, 12]} /><M c="#8d5530" /></mesh>
    {[[2.4, -1.2], [3.4, -1.7]].map((v, i) => (
      <group key={'pl'+i}><mesh position={[v[0], 1.13, v[1]]}><cylinderGeometry args={[0.32, 0.26, 0.05, 20]} /><M c="#ffffff" /></mesh>
      <mesh position={[v[0], 1.17, v[1]]}><sphereGeometry args={[0.16, 12, 10]} /><M c="#ffe08a" /></mesh></group>
    ))}
    <mesh position={[2.9, 1.3, -1.6]}><cylinderGeometry args={[0.13, 0.11, 0.4, 14]} /><M c="#9fd8ff" e={0.3} /></mesh>
    {/* lampu gantung */}
    <mesh position={[2.9, 6.2, -1.4]}><cylinderGeometry args={[0.02, 0.02, 3, 6]} /><M c="#333a55" /></mesh>
    <mesh position={[2.9, 4.6, -1.4]}><coneGeometry args={[0.6, 0.5, 20, 1, true]} /><M c="#ffc531" e={0.5} /></mesh>
  </group>
);

const Cyl = ({p, a, c, e = 0, r}: any) => (<mesh position={p} rotation={r}><cylinderGeometry args={a} /><M c={c} e={e} /></mesh>);
const Panggung: React.FC<{time: number}> = ({time}) => (
  <group>
    <mesh rotation={[-PI / 2, 0, 0]}><planeGeometry args={[60, 60]} /><M c="#1a1440" /></mesh>
    <Cyl p={[0, 0.1, 0]} a={[3.4, 3.6, 0.2, 48]} c="#2c2470" />
    <mesh rotation={[-PI / 2, 0, 0]} position={[0, 0.21, 0]}><ringGeometry args={[3.0, 3.35, 48]} /><meshBasicMaterial color={`hsl(${(time * 60) % 360},90%,60%)`} /></mesh>
    {Array.from({length: 12}).map((_, i) => {
      const a = (i / 12) * 2 * PI; const on = Math.sin(time * 8 + i) > 0;
      return <mesh key={i} position={[Math.cos(a) * 3.2, 0.24, Math.sin(a) * 3.2]}><sphereGeometry args={[0.09, 8, 8]} /><meshBasicMaterial color={on ? '#ffe36b' : '#6a5a2a'} /></mesh>;
    })}
    {/* tirai */}
    {Array.from({length: 16}).map((_, i) => (<Cyl key={'c'+i} p={[-7.5 + i, 4.5, -3.6]} a={[0.55, 0.55, 9, 10]} c={i % 2 ? '#b8203f' : '#d42c4d'} />))}
    {/* layar LED bintang */}
    <Box p={[0, 4.6, -3.0]} s={[6.5, 3.4, 0.2]} c="#0d0b26" />
    {Array.from({length: 40}).map((_, i) => {
      const x = -3 + (i % 10) * 0.66, yy = 3.2 + Math.floor(i / 10) * 0.8; const on = Math.sin(time * 5 + i * 1.7) > 0.2;
      return <mesh key={'l'+i} position={[x, yy, -2.88]}><circleGeometry args={[0.13, 10]} /><meshBasicMaterial color={on ? (i % 3 ? '#ffc531' : '#ff5ab0') : '#2a2350'} /></mesh>;
    })}
    {/* lampu sorot berayun */}
    {[-1, 1].map((sd) => (
      <group key={'s'+sd} position={[sd * 3.4, 7.5, 1]} rotation={[0.25, 0, sd * (0.42 + Math.sin(time * 1.5 + sd) * 0.18)]}>
        <mesh position={[0, -3.6, 0]}><coneGeometry args={[1.5, 7.2, 24, 1, true]} /><meshBasicMaterial color="#fff2b0" transparent opacity={0.13} depthWrite={false} /></mesh>
      </group>
    ))}
  </group>
);
const Podium = ({x, c}: any) => (<group position={[x, 0, 0.9]}><Box p={[0, 0.5, 0]} s={[0.9, 1.0, 0.6]} c={c} /><Box p={[0, 1.02, 0]} s={[1.0, 0.08, 0.7]} c="#ffffff" /><Cyl p={[0, 1.12, 0.05]} a={[0.13, 0.15, 0.1, 16]} c="#ff3b3b" e={0.4} /></group>);
const Kamar: React.FC<{time: number; malam?: boolean}> = ({time}) => (
  <group>
    <mesh rotation={[-PI / 2, 0, 0]}><planeGeometry args={[60, 60]} /><M c="#8a6ac9" /></mesh>
    <mesh rotation={[-PI / 2, 0, 0]} position={[0.3, 0.006, 0.4]}><circleGeometry args={[2.4, 6]} /><M c="#ffb3c7" /></mesh>
    <Box p={[0, 4.5, -3.4]} s={[40, 9, 0.2]} c="#3a2f7a" />
    {Array.from({length: 22}).map((_, i) => (<mesh key={i} position={[-7 + (i * 1.9) % 14, 1.6 + ((i * 2.3) % 5), -3.25]} rotation={[0, 0, i]}><circleGeometry args={[0.09 + (i % 3) * 0.04, 5]} /><meshBasicMaterial color="#ffe36b" /></mesh>))}
    {/* ranjang */}
    <Box p={[-3.3, 0.45, -1.9]} s={[2.6, 0.5, 2.2]} c="#f4efe6" />
    <Box p={[-3.3, 0.74, -1.6]} s={[2.5, 0.12, 1.7]} c="#4fc3a1" />
    <Box p={[-3.3, 0.85, -2.65]} s={[1.2, 0.3, 0.5]} c="#ffffff" />
    <Box p={[-3.3, 1.2, -3.0]} s={[2.7, 1.6, 0.18]} c="#ffb84d" />
    {/* lemari mainan + bola */}
    <Box p={[3.6, 1.2, -2.8]} s={[1.6, 2.4, 0.8]} c="#ff8a5c" />
    {[0.6, 1.4, 2.1].map((yy, i) => (<Box key={'r'+i} p={[3.6, yy, -2.38]} s={[1.4, 0.06, 0.06]} c="#ffffff" />))}
    <mesh position={[2.4, 0.3, -1.4]}><sphereGeometry args={[0.3, 16, 12]} /><M c="#4aa8ff" /></mesh>
    {/* jendela bulan */}
    <mesh position={[0.4, 4.2, -3.25]}><circleGeometry args={[1.0, 32]} /><meshBasicMaterial color="#1b1550" /></mesh>
    <mesh position={[0.6, 4.35, -3.2]}><circleGeometry args={[0.38, 24]} /><meshBasicMaterial color="#fff4c2" /></mesh>
  </group>
);
const Lapangan: React.FC<{time: number}> = ({time}) => (
  <group>
    <mesh rotation={[-PI / 2, 0, 0]}><planeGeometry args={[60, 60]} /><M c="#5ab65f" /></mesh>
    <mesh rotation={[-PI / 2, 0, 0]} position={[0, 0.006, 0.2]}><planeGeometry args={[7, 5]} /><M c="#e2734b" /></mesh>
    {/* meja pingpong */}
    <Box p={[0, 0.95, 0.2]} s={[2.4, 0.08, 1.4]} c="#1e6bd1" />
    <Box p={[0, 0.96, 0.2]} s={[0.04, 0.09, 1.42]} c="#ffffff" />
    <Box p={[0, 1.1, 0.2]} s={[0.03, 0.22, 1.45]} c="#eeeeee" />
    {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map((v, i) => (<Box key={i} p={[v[0] * 1.05, 0.46, 0.2 + v[1] * 0.55]} s={[0.08, 0.9, 0.08]} c="#333a55" />))}
    {/* pagar & pohon */}
    {Array.from({length: 20}).map((_, i) => (<Box key={'f'+i} p={[-9.5 + i, 0.6, -3.2]} s={[0.12, 1.2, 0.12]} c="#ffffff" />))}
    <Box p={[0, 1.0, -3.2]} s={[20, 0.1, 0.1]} c="#ffffff" />
    {[-4.8, -2.6, 3.0, 5.2].map((x, i) => (<group key={'t'+i}><Cyl p={[x, 1.0, -4.2]} a={[0.15, 0.2, 2, 8]} c="#8d5530" /><mesh position={[x, 2.6, -4.2]}><sphereGeometry args={[1.0 + (i % 2) * 0.3, 14, 12]} /><M c={i % 2 ? '#2f9a55' : '#45b86a'} /></mesh></group>))}
    {[[-3, 6.2], [2.5, 6.8]].map((v, i) => (<group key={'a'+i} position={[v[0] + Math.sin(time * 0.3 + i) * 0.3, v[1], -6]}>{[0, 0.6, 1.1].map((dx, j) => (<mesh key={j} position={[dx, j === 1 ? 0.2 : 0, 0]}><sphereGeometry args={[0.55, 12, 10]} /><meshBasicMaterial color="#ffffff" /></mesh>))}</group>))}
  </group>
);
const Masjid: React.FC<{time: number}> = ({time}) => (
  <group>
    <mesh rotation={[-PI / 2, 0, 0]}><planeGeometry args={[60, 60]} /><M c="#1c7a55" /></mesh>
    {Array.from({length: 10}).map((_, i) => (<Box key={'k'+i} p={[0, 0.005, -3 + i * 0.9]} s={[30, 0.01, 0.08]} c="#e8c766" />))}
    <Box p={[0, 4.5, -3.4]} s={[40, 9, 0.2]} c="#f3e7cf" />
    {[-4.2, -1.4, 1.4, 4.2].map((x, i) => (
      <group key={'ar'+i} position={[x, 0, -3.25]}>
        <Box p={[0, 1.6, 0]} s={[2.0, 3.2, 0.06]} c={i === 1 || i === 2 ? '#2a6f8f' : '#d9c39c'} />
        <mesh position={[0, 3.2, 0.01]}><circleGeometry args={[1.0, 24, 0, PI]} /><M c={i === 1 || i === 2 ? '#2a6f8f' : '#d9c39c'} /></mesh>
      </group>
    ))}
    {/* lampu gantung */}
    {[-3, 0, 3].map((x, i) => (<group key={'lp'+i}><Cyl p={[x, 6.5, -1.5]} a={[0.01, 0.01, 2.4, 4]} c="#7a5a2a" /><mesh position={[x, 5.2, -1.5]}><sphereGeometry args={[0.3, 14, 12]} /><M c="#ffd56b" e={0.7 + Math.sin(time * 2 + i) * 0.1} /></mesh></group>))}
    {/* rak Al-Qur'an */}
    <Box p={[5.6, 0.7, -2.6]} s={[1.4, 1.4, 0.6]} c="#8d5530" />
    {[0, 1, 2, 3].map((i) => (<Box key={'q'+i} p={[5.1 + i * 0.3, 1.0, -2.3]} s={[0.22, 0.5, 0.35]} c={['#1f9d6b', '#c0392b', '#1f4f9d', '#d4a017'][i]} />))}
  </group>
);
const Gerbang: React.FC<{time: number}> = ({time}) => (
  <group>
    <mesh rotation={[-PI / 2, 0, 0]}><planeGeometry args={[60, 60]} /><M c="#9aa3b5" /></mesh>
    <mesh rotation={[-PI / 2, 0, 0]} position={[0, 0.006, 1]}><planeGeometry args={[3.2, 30]} /><M c="#c9ccd6" /></mesh>
    {/* gedung sekolah */}
    <Box p={[0, 3.0, -7]} s={[14, 6, 1]} c="#f2c14e" />
    {Array.from({length: 12}).map((_, i) => (<Box key={'w'+i} p={[-5.5 + (i % 6) * 2.2, 2.0 + Math.floor(i / 6) * 2.2, -6.45]} s={[1.0, 1.0, 0.1]} c="#7fd0ff" e={0.25} />))}
    <Box p={[0, 6.4, -7]} s={[15, 0.6, 1.4]} c="#c0392b" />
    {/* gerbang */}
    {[-1.8, 1.8].map((x, i) => (<group key={'g'+i}><Box p={[x, 1.5, -2.2]} s={[0.5, 3.0, 0.5]} c="#7a8296" /><mesh position={[x, 3.15, -2.2]}><sphereGeometry args={[0.32, 14, 12]} /><M c="#ffc531" /></mesh></group>))}
    <Box p={[0, 3.25, -2.2]} s={[4.1, 0.45, 0.25]} c="#1f2a5c" />
    {Array.from({length: 7}).map((_, i) => (<Box key={'b'+i} p={[-1.3 + i * 0.43, 1.2, -2.2]} s={[0.07, 2.2, 0.07]} c="#2b3245" />))}
    {[-1, 1].map((sd) => Array.from({length: 7}).map((_, i) => (<Box key={'p'+sd+i} p={[sd * (2.5 + i * 0.8), 0.7, -2.2]} s={[0.1, 1.4, 0.1]} c="#2b3245" />)))}
    <Box p={[-6, 1.4, -2.2]} s={[7.2, 0.08, 0.08]} c="#2b3245" /><Box p={[6, 1.4, -2.2]} s={[7.2, 0.08, 0.08]} c="#2b3245" />
    <Box p={[-6, 0.4, -2.2]} s={[7.2, 0.08, 0.08]} c="#2b3245" /><Box p={[6, 0.4, -2.2]} s={[7.2, 0.08, 0.08]} c="#2b3245" />
  </group>
);
// ---- properti beranimasi ----
const Konfeti: React.FC<{t0: number; time: number; pos: number[]}> = ({t0, time, pos}) => {
  const dt = time - t0; if (dt < 0 || dt > 3.5) return null;
  const cols = ['#ffc531', '#ff5ab0', '#4aa8ff', '#5be37a', '#ff7a3d'];
  return (<group position={pos as any}>{Array.from({length: 36}).map((_, i) => {
    const a = rnd(i) * 2 * PI, sp = 1.5 + rnd(i + 9) * 2.2, up = 3 + rnd(i + 3) * 2.5;
    return <mesh key={i} position={[Math.cos(a) * sp * dt, up * dt - 2.6 * dt * dt, Math.sin(a) * sp * dt * 0.5]} rotation={[time * 6 + i, time * 4, i]}><planeGeometry args={[0.13, 0.08]} /><meshBasicMaterial color={cols[i % 5]} side={2} /></mesh>;
  })}</group>);
};
const Gelembung: React.FC<{pr: any; time: number}> = ({pr, time}) => {
  const dt = time - pr.t; if (dt < 0) return null;
  const n = pr.n || 6;
  return (<group>{Array.from({length: n}).map((_, i) => {
    const ph = ((dt * 0.9 + i / n) % 1);
    const x = lerp(pr.a[0], pr.b[0], ph), y = lerp(pr.a[1], pr.b[1], ph) + Math.sin(ph * PI) * 0.5, z = lerp(pr.a[2], pr.b[2], ph);
    const k = Math.min(1, dt * 3) * (0.9 + 0.2 * Math.sin(ph * PI));
    return <group key={i} position={[x, y, z]} scale={k}><mesh><boxGeometry args={[0.46, 0.3, 0.08]} /><M c={i % 3 === 0 ? '#ff5a4e' : i % 3 === 1 ? '#ffffff' : '#ffc531'} /></mesh><mesh position={[-0.12, -0.19, 0]} rotation={[0, 0, 0.6]}><boxGeometry args={[0.1, 0.12, 0.08]} /><M c={i % 3 === 0 ? '#ff5a4e' : i % 3 === 1 ? '#ffffff' : '#ffc531'} /></mesh></group>;
  })}</group>);
};
const Pingpong: React.FC<{pr: any; time: number}> = ({pr, time}) => {
  const dt = time - pr.t; if (dt < 0) return null;
  const per = 0.8, ph = (dt % per) / per, dir = Math.floor(dt / per) % 2;
  const u = dir ? 1 - ph : ph;
  const x = lerp(pr.a[0], pr.b[0], u), z = lerp(pr.a[2], pr.b[2], u);
  const hop = Math.abs(Math.sin(ph * PI * 2)) * 0.55;
  return (<group>
    <mesh position={[x, 1.05 + hop, z]}><sphereGeometry args={[0.1, 12, 10]} /><meshBasicMaterial color="#ffffff" /></mesh>
    {[pr.a, pr.b].map((v: number[], i: number) => (<group key={i} position={[v[0] + (i ? 0.25 : -0.25), 1.35, v[2] + 0.15]} rotation={[0, 0, (i ? -1 : 1) * (0.5 + Math.sin(time * 8 + i * PI) * 0.4)]}><Cyl p={[0, 0, 0]} a={[0.22, 0.22, 0.04, 18]} r={[PI / 2, 0, 0]} c={i ? '#2f6bff' : '#e8342f'} /><Box p={[0, -0.28, 0]} s={[0.06, 0.25, 0.05]} c="#8d5530" /></group>))}
  </group>);
};
const JamPasir: React.FC<{pr: any; time: number}> = ({pr, time}) => {
  const dt = time - pr.t; if (dt < 0) return null;
  const k = Math.min(1, dt * 4); const fill = clamp(dt / 2.5);
  return (<group position={pr.pos} scale={k} rotation={[0, time * 0.8, dt < 0.4 ? (1 - dt / 0.4) * PI : 0]}>
    <Cyl p={[0, 0.62, 0]} a={[0.42, 0.42, 0.08, 18]} c="#8d5530" /><Cyl p={[0, -0.62, 0]} a={[0.42, 0.42, 0.08, 18]} c="#8d5530" />
    <mesh position={[0, 0.3, 0]} rotation={[PI, 0, 0]}><coneGeometry args={[0.34, 0.55, 18, 1, true]} /><meshLambertMaterial color="#bfe8ff" transparent opacity={0.45} /></mesh>
    <mesh position={[0, -0.3, 0]}><coneGeometry args={[0.34, 0.55, 18, 1, true]} /><meshLambertMaterial color="#bfe8ff" transparent opacity={0.45} /></mesh>
    <mesh position={[0, 0.3 + fill * 0.12, 0]} rotation={[PI, 0, 0]} scale={[1 - fill, 1 - fill, 1 - fill]}><coneGeometry args={[0.28, 0.42, 16]} /><M c="#ffc531" /></mesh>
    <mesh position={[0, -0.45 + fill * 0.08, 0]} scale={[fill, fill, fill]}><coneGeometry args={[0.3, 0.3, 16]} /><M c="#ffc531" /></mesh>
    {[-1, 1].map((sd) => (<Cyl key={sd} p={[sd * 0.38, 0, 0]} a={[0.03, 0.03, 1.2, 6]} c="#8d5530" />))}
  </group>);
};
const Telinga: React.FC<{pr: any; time: number}> = ({pr, time}) => {
  const dt = time - pr.t; if (dt < 0) return null;
  const k = Math.min(1, dt * 3.5) * (1 + Math.sin(time * 5) * 0.05);
  return (<group position={pr.pos} scale={k * 1.1} rotation={[0, -0.3, Math.sin(time * 2) * 0.08]}>
    <mesh scale={[0.55, 0.85, 0.25]}><sphereGeometry args={[1, 22, 18]} /><M c="#f6cfa6" /></mesh>
    <mesh position={[0.05, 0.05, 0.18]} scale={[0.35, 0.6, 0.12]}><sphereGeometry args={[1, 18, 14]} /><M c="#e9a98a" /></mesh>
    {[0, 1, 2].map((i) => { const ph = (time * 0.8 + i / 3) % 1; return <mesh key={i} position={[-0.9 - ph * 0.8, 0.1, 0.1]} rotation={[0, PI / 2, 0]} scale={0.3 + ph * 0.6}><torusGeometry args={[0.5, 0.04, 6, 20, PI * 0.8]} /><meshBasicMaterial color="#ffc531" transparent opacity={1 - ph} /></mesh>; })}
  </group>);
};
const Tanya: React.FC<{pos: number[]; k: number; time: number}> = ({pos, k, time}) => (
  <group position={[pos[0], pos[1] + Math.sin(time * 2.2) * 0.07, pos[2]]} rotation={[0, 0, Math.sin(time * 1.7) * 0.12]} scale={k * 0.9}>
    <mesh position={[0, 0.32, 0]} rotation={[0, 0, -0.5]}><torusGeometry args={[0.26, 0.08, 10, 24, PI * 1.45]} /><M c="#ffc531" e={0.35} /></mesh>
    <mesh position={[0.02, -0.08, 0]}><cylinderGeometry args={[0.08, 0.08, 0.26, 10]} /><M c="#ffc531" e={0.35} /></mesh>
    <mesh position={[0.02, -0.38, 0]}><sphereGeometry args={[0.1, 12, 10]} /><M c="#ffc531" e={0.35} /></mesh>
  </group>
);
const Mik: React.FC<{pos: number[]; k: number; time: number}> = ({pos, k, time}) => (
  <group position={[pos[0], pos[1] + Math.sin(time * 2.6) * 0.04, pos[2]]} rotation={[0, 0, 0.35]} scale={k}>
    <mesh position={[0, 0.22, 0]}><sphereGeometry args={[0.15, 14, 12]} /><M c="#c9cfe8" /></mesh>
    <mesh position={[0, -0.08, 0]}><cylinderGeometry args={[0.06, 0.045, 0.5, 12]} /><M c="#ff5a4e" /></mesh>
  </group>
);
const Cam: React.FC<{pos: number[]; look: number[]; fov: number}> = ({pos, look, fov}) => {
  const camera: any = useThree((s) => s.camera);
  camera.position.set(pos[0], pos[1], pos[2]);
  camera.fov = fov;
  camera.near = 0.1; camera.far = 100;
  camera.lookAt(look[0], look[1], look[2]);
  camera.updateProjectionMatrix();
  return null;
};
const Hp: React.FC<{pos: number[]; k: number; time: number}> = ({pos, k, time}) => (
  <group position={[pos[0], pos[1] + Math.sin(time * 2.4) * 0.05, pos[2]]} rotation={[0, -0.35, 0.18 + Math.sin(time * 30) * 0.05 * (k < 1 ? 1 : 0.4)]} scale={k}>
    <mesh><boxGeometry args={[0.42, 0.76, 0.06]} /><M c="#20243f" /></mesh>
    <mesh position={[0, 0, 0.035]}><planeGeometry args={[0.35, 0.66]} /><meshBasicMaterial color="#8fd6ff" /></mesh>
    <mesh position={[0, 0.12, 0.04]}><planeGeometry args={[0.26, 0.12]} /><meshBasicMaterial color="#ffffff" /></mesh>
    <mesh position={[0.03, -0.06, 0.04]}><planeGeometry args={[0.2, 0.1]} /><meshBasicMaterial color="#ffc531" /></mesh>
  </group>
);

export const Scene3D: React.FC<{scene: any; time: number; width: number; height: number}> = ({scene, time, width, height}) => {
  const S = SETS[scene.set];
  const u = clamp((time - scene.start) / Math.max(0.01, scene.end - scene.start));
  const k = 1 - Math.pow(1 - u, 2.2);
  const c = scene.cam;
  let pos = c.orbit ? (() => { const o = c.orbit; const a = lerp(o.a0, o.a1, k); const r = lerp(o.r0, o.r1 ?? o.r0, k); return [c.look[0] + Math.sin(a) * r, lerp(o.h0, o.h1 ?? o.h0, k), c.look[2] + Math.cos(a) * r]; })() : [0, 1, 2].map((i) => lerp(c.from[i], c.to[i], k));
  if (c.punch) { const pk = clamp((time - c.punch) / 0.35); const z = Math.sin(pk * PI) * 1.4; pos = [pos[0], pos[1], pos[2] - z]; }
  pos[0] += Math.sin(time * 0.7) * 0.05; pos[1] += Math.sin(time * 0.9) * 0.03;
  return (
    <ThreeCanvas width={width} height={height} gl={{antialias: true, alpha: true}} dpr={0.62} flat>
      <Cam pos={pos} look={c.look} fov={c.fov} />
      <hemisphereLight args={[S.hemi[0], S.hemi[1], S.hemi[2]]} />
      <ambientLight intensity={S.amb} />
      <directionalLight position={[3.5, 7, 6]} color={S.dir[0]} intensity={S.dir[1]} />
      {scene.set === 'rumah' && <Rumah />}
      {scene.set === 'malam' && <Malam time={time} />}
      {scene.set === 'kantor' && <Kantor />}
      {scene.set === 'kelas' && <Kelas />}
      {scene.set === 'dapur' && <Dapur />}
      {scene.set === 'panggung' && <Panggung time={time} />}
      {scene.set === 'kamar' && <Kamar time={time} />}
      {scene.set === 'lapangan' && <Lapangan time={time} />}
      {scene.set === 'masjid' && <Masjid time={time} />}
      {scene.set === 'gerbang' && <Gerbang time={time} />}
      {(scene.podium || []).map((x: number, i: number) => <Podium key={'pd'+i} x={x} c={['#ff5ab0', '#4aa8ff', '#5be37a'][i % 3]} />)}
      {(scene.props || []).map((pr: any, i: number) => {
        const kk = clamp((time - pr.t) / 0.25);
        const KK = 1 + Math.sin(kk * PI) * 0.25 - (1 - kk);
        if (pr.end && time > pr.end) return null;
        if (pr.kind === 'konfeti') return <Konfeti key={i} t0={pr.t} time={time} pos={pr.pos} />;
        if (pr.kind === 'gelembung') return <Gelembung key={i} pr={pr} time={time} />;
        if (pr.kind === 'pingpong') return <Pingpong key={i} pr={pr} time={time} />;
        if (pr.kind === 'jam') return <JamPasir key={i} pr={pr} time={time} />;
        if (pr.kind === 'telinga') return <Telinga key={i} pr={pr} time={time} />;
        if (kk > 0 && pr.kind === 'tanya') return <Tanya key={i} pos={pr.pos} k={KK} time={time} />;
        if (kk > 0 && pr.kind === 'mik') return <Mik key={i} pos={pr.pos} k={KK} time={time} />;
        return kk > 0 ? <Hp key={i} pos={pr.pos} k={1 + Math.sin(kk * PI) * 0.25 - (1 - kk)} time={time} /> : null;
      })}
      {scene.actors.map((a: any, i: number) => (<Tokoh key={i} look={a.look} time={time} p={pose(a.keys, time)} />))}
    </ThreeCanvas>
  );
};
