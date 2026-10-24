"use client";

import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { type RefObject, useRef } from "react";
import * as THREE from "three";
import type { Product } from "@/lib/products";
import Jar from "./Jar";
import Spices from "./Spices";
import Steam from "./Steam";

// Key light follows the pointer; the ember rim light breathes like coals.
function Lights() {
  const key = useRef<THREE.SpotLight>(null);
  const rim = useRef<THREE.PointLight>(null);
  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    if (key.current) {
      key.current.position.x = THREE.MathUtils.damp(key.current.position.x, 3 + state.pointer.x * 4, 3, dt);
      key.current.position.y = THREE.MathUtils.damp(key.current.position.y, 5 + state.pointer.y * 3, 3, dt);
    }
    if (rim.current) rim.current.intensity = 26 + Math.sin(t * 2.3) * 4 + Math.sin(t * 5.7) * 2;
  });
  return (
    <>
      <ambientLight intensity={0.15} />
      <spotLight ref={key} position={[3, 5, 5]} angle={0.45} penumbra={1} intensity={60} color="#fff4e8" />
      <pointLight ref={rim} position={[-2.5, 0.5, -2.5]} intensity={26} color="#ff5a1f" distance={10} />
      <pointLight position={[2.8, -1, -2]} intensity={10} color="#ff8a3d" distance={8} />
    </>
  );
}

// Fits the jar to the viewport: full size on wide screens, smaller and raised
// on tall phone screens so it clears the copy below.
function Stage({ children }: { children: React.ReactNode }) {
  const aspect = useThree((s) => s.size.width / s.size.height);
  const scale = Math.min(0.8, 1.3 * aspect);
  const y = aspect < 1 ? 0.6 : -0.1;
  return (
    <group position={[0, y, 0]} scale={scale}>
      {children}
    </group>
  );
}

export default function JarScene({
  product,
  active,
  lite,
  eventSource,
}: {
  product: Product;
  active: boolean;
  lite: boolean;
  eventSource: RefObject<HTMLElement>;
}) {
  return (
    <Canvas
      eventSource={eventSource as React.MutableRefObject<HTMLElement>}
      eventPrefix="client"
      frameloop={active ? "always" : "never"}
      dpr={[1, lite ? 1.5 : 2]}
      camera={{ position: [0, 0.35, 7.4], fov: 30 }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
    >
      <Lights />
      <Stage>
        <Jar product={product} />
        <Steam />
        <Spices density={lite ? 0.5 : 1} />
        {/* Skipped on phones: the floating spices fill the narrow frame with shadow */}
        {!lite && <ContactShadows position={[0, -1.32, 0]} opacity={0.6} scale={2.8} blur={2.8} far={1.2} color="#000" />}
      </Stage>
      {/* Studio built from light panels, so no HDR file has to be fetched */}
      <Environment resolution={256} frames={1}>
        <color attach="background" args={["#0a0807"]} />
        <Lightformer form="rect" intensity={3} position={[0, 4, -6]} scale={[10, 3, 1]} />
        <Lightformer form="rect" intensity={6} position={[4, 1, 3]} rotation-y={-Math.PI / 3} scale={[0.6, 6, 1]} />
        <Lightformer form="rect" intensity={4} position={[-4, 1, 2]} rotation-y={Math.PI / 3} scale={[0.4, 6, 1]} />
        <Lightformer form="rect" intensity={5} color="#ff5a1f" position={[-5, 0, -2]} rotation-y={Math.PI / 2} scale={[8, 2, 1]} />
        <Lightformer form="ring" intensity={2} color="#ff8a3d" position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={3} />
      </Environment>
    </Canvas>
  );
}
