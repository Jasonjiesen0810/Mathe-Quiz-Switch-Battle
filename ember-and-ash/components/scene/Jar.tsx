"use client";

import { MeshTransmissionMaterial } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { body, display } from "@/lib/fonts";
import { heroState } from "@/lib/heroState";
import type { Product } from "@/lib/products";
import { makeLabelTexture, paintLabel } from "./label";

const V = (x: number, y: number) => new THREE.Vector2(x, y);

// Jar silhouette, revolved around Y. Units: ~2.5 tall.
const GLASS_PROFILE = [
  V(0, -1.2), V(0.74, -1.2), V(0.85, -1.18), V(0.905, -1.12), V(0.92, -1.02),
  V(0.92, 0.72), V(0.905, 0.84), V(0.86, 0.92), V(0.8, 0.97), V(0.8, 1.1),
];
const SAUCE_PROFILE = [
  V(0, -1.15), V(0.72, -1.15), V(0.83, -1.12), V(0.872, -1.04),
  V(0.872, 0.5), V(0.86, 0.555), V(0.6, 0.575), V(0, 0.58),
];

function knurledLid() {
  const g = new THREE.CylinderGeometry(0.86, 0.86, 0.34, 180, 1, false);
  const pos = g.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const r = Math.hypot(v.x, v.z);
    if (r > 0.85) {
      const a = Math.atan2(v.z, v.x);
      const k = 1 + 0.012 * Math.sign(Math.sin(a * 90));
      pos.setXYZ(i, v.x * k, v.y, v.z * k);
    }
  }
  g.computeVertexNormals();
  return g;
}

export default function Jar({ product }: { product: Product }) {
  const group = useRef<THREE.Group>(null);
  const spin = useRef({ current: 0, target: 0 });
  const sauceMat = useRef<THREE.MeshPhysicalMaterial>(null);
  const targetColor = useMemo(() => new THREE.Color(product.sauce), [product.sauce]);

  const glassGeo = useMemo(() => new THREE.LatheGeometry(GLASS_PROFILE, 128), []);
  const sauceGeo = useMemo(() => new THREE.LatheGeometry(SAUCE_PROFILE, 96), []);
  const lidGeo = useMemo(knurledLid, []);
  const label = useMemo(makeLabelTexture, []);

  // Chili flakes and seeds suspended in the sauce, just inside the glass
  const flakes = useRef<THREE.InstancedMesh>(null);
  const seeds = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    const d = new THREE.Object3D();
    [flakes.current, seeds.current].forEach((m, k) => {
      if (!m) return;
      for (let i = 0; i < m.count; i++) {
        const a = Math.random() * Math.PI * 2;
        d.position.set(Math.cos(a) * 0.874, -1.08 + Math.random() * 1.6, Math.sin(a) * 0.874);
        d.rotation.set(Math.random() * 3, -a, Math.random() * 3);
        const s = k === 0 ? 0.7 + Math.random() * 0.8 : 0.8 + Math.random() * 0.4;
        d.scale.set(s, s * 0.25, s * 0.7);
        d.updateMatrix();
        m.setMatrixAt(i, d.matrix);
      }
      m.instanceMatrix.needsUpdate = true;
    });
  }, []);

  // Repaint label and spin the jar whenever the flavour changes
  const first = useRef(true);
  useEffect(() => {
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (cancelled) return;
      paintLabel(label.canvas, product, display.style.fontFamily, body.style.fontFamily);
      label.tex.needsUpdate = true;
    });
    if (!first.current) spin.current.target += Math.PI * 2;
    first.current = false;
    return () => {
      cancelled = true;
    };
  }, [product, label]);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const p = heroState.progress;
    const s = spin.current;
    s.current = THREE.MathUtils.damp(s.current, s.target, 3.2, dt);

    // Slow turntable + flavour spin + scroll-driven turn, with pointer tilt
    g.rotation.y = t * 0.28 + s.current + p * Math.PI * 1.2 + state.pointer.x * 0.25;
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -state.pointer.y * 0.12 + p * 0.25, 4, dt);
    g.rotation.z = THREE.MathUtils.damp(g.rotation.z, -state.pointer.x * 0.05, 4, dt);
    g.position.y = Math.sin(t * 0.9) * 0.06 - p * 0.6;

    sauceMat.current?.color.lerp(targetColor, 1 - Math.exp(-dt * 4));
  });

  return (
    <group ref={group}>
      {/* Sauce */}
      <mesh geometry={sauceGeo}>
        <meshPhysicalMaterial
          ref={sauceMat}
          color={product.sauce}
          roughness={0.32}
          clearcoat={1}
          clearcoatRoughness={0.3}
          sheen={0.25}
          sheenColor="#ffb27a"
          sheenRoughness={0.5}
        />
      </mesh>
      <instancedMesh ref={flakes} args={[undefined, undefined, 130]}>
        <icosahedronGeometry args={[0.028, 0]} />
        <meshStandardMaterial color="#5e0d05" roughness={0.6} />
      </instancedMesh>
      <instancedMesh ref={seeds} args={[undefined, undefined, 30]}>
        <sphereGeometry args={[0.022, 8, 6]} />
        <meshStandardMaterial color="#f1d7a8" roughness={0.6} />
      </instancedMesh>

      {/* Label, wrapped on the outside of the glass */}
      <mesh position={[0, -0.18, 0]}>
        <cylinderGeometry args={[0.93, 0.93, 1.12, 128, 1, true, -Math.PI * 0.85, Math.PI * 1.7]} />
        <meshStandardMaterial map={label.tex} roughness={0.55} metalness={0.05} side={THREE.FrontSide} />
      </mesh>

      {/* Glass */}
      <mesh geometry={glassGeo}>
        <MeshTransmissionMaterial
          backside
          backsideThickness={0.3}
          samples={6}
          resolution={768}
          thickness={0.22}
          roughness={0.04}
          ior={1.5}
          chromaticAberration={0.05}
          anisotropy={0.25}
          distortion={0.08}
          distortionScale={0.25}
          temporalDistortion={0.04}
          clearcoat={1}
          clearcoatRoughness={0.04}
          attenuationColor="#ffe3c4"
          attenuationDistance={2.5}
          color="#ffffff"
        />
      </mesh>

      {/* Lid */}
      <mesh geometry={lidGeo} position={[0, 1.18, 0]}>
        <meshPhysicalMaterial color="#121010" metalness={1} roughness={0.32} clearcoat={0.6} clearcoatRoughness={0.3} />
      </mesh>
      <mesh position={[0, 1.352, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.56, 96]} />
        <meshStandardMaterial color="#FF5A1F" emissive="#FF5A1F" emissiveIntensity={0.35} metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.351, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.85, 96]} />
        <meshPhysicalMaterial color="#1a1615" metalness={1} roughness={0.45} />
      </mesh>
    </group>
  );
}
