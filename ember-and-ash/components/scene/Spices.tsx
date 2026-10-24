"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type Kind = {
  count: number;
  geometry: THREE.BufferGeometry;
  color: string;
  roughness: number;
  scale: [number, number, number];
};

type Seed = { r: number; a: number; y: number; speed: number; bob: number; spin: THREE.Vector3; size: number };

function seeds(n: number): Seed[] {
  return Array.from({ length: n }, () => ({
    r: 1.35 + Math.random() * 2.1,
    a: Math.random() * Math.PI * 2,
    y: -1.6 + Math.random() * 3.6,
    speed: (0.04 + Math.random() * 0.08) * (Math.random() < 0.5 ? 1 : -1),
    bob: Math.random() * Math.PI * 2,
    spin: new THREE.Vector3(Math.random(), Math.random(), Math.random()).multiplyScalar(1.2),
    size: 0.5 + Math.random() * 0.6,
  }));
}

function Swarm({ kind }: { kind: Kind }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const data = useMemo(() => seeds(kind.count), [kind.count]);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    const m = ref.current;
    if (!m) return;
    const t = state.clock.elapsedTime;
    const px = state.pointer.x;
    const py = state.pointer.y;
    data.forEach((d, i) => {
      const a = d.a + t * d.speed;
      dummy.position.set(
        Math.cos(a) * d.r + px * 0.25 * (d.r - 1),
        d.y + Math.sin(t * 0.6 + d.bob) * 0.12 + py * 0.15 * (d.r - 1),
        Math.sin(a) * d.r * 0.7,
      );
      dummy.rotation.set(d.spin.x * t, d.spin.y * t, d.spin.z * t);
      dummy.scale.set(kind.scale[0] * d.size, kind.scale[1] * d.size, kind.scale[2] * d.size);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[kind.geometry, undefined, kind.count]} frustumCulled={false}>
      <meshStandardMaterial color={kind.color} roughness={kind.roughness} metalness={0.05} />
    </instancedMesh>
  );
}

// Peppercorns, chili flakes and sesame seeds drifting around the jar.
export default function Spices({ density = 1 }: { density?: number }) {
  const kinds = useMemo<Kind[]>(
    () => [
      { count: Math.round(34 * density), geometry: new THREE.IcosahedronGeometry(0.045, 2), color: "#1b1310", roughness: 0.75, scale: [1, 1, 1] },
      { count: Math.round(60 * density), geometry: new THREE.DodecahedronGeometry(0.07, 0), color: "#c2260c", roughness: 0.5, scale: [1, 0.16, 0.7] },
      { count: Math.round(36 * density), geometry: new THREE.SphereGeometry(0.03, 10, 8), color: "#ecd3a2", roughness: 0.55, scale: [1.6, 0.6, 0.8] },
    ],
    [density],
  );
  return (
    <group>
      {kinds.map((k, i) => (
        <Swarm key={i} kind={k} />
      ))}
    </group>
  );
}
