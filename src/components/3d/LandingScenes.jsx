import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Torus, MeshWobbleMaterial } from '@react-three/drei';

/* ─── About section — octahedron wireframe + ring ─────────────────────── */
function AboutSceneInner() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[3, 3, 3]} intensity={2} color="#FFD000" />
      <Float speed={3} floatIntensity={2}>
        <mesh rotation={[0.5, 0.5, 0]}>
          <octahedronGeometry args={[1.2, 0]} />
          <meshStandardMaterial color="#FAFAFA" wireframe />
        </mesh>
      </Float>
      <Float speed={2} floatIntensity={1}>
        <Torus args={[2, 0.05, 8, 64]}>
          <meshBasicMaterial color="#FFD000" />
        </Torus>
      </Float>
    </>
  );
}

export function AboutCanvas({ active = true }) {
  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 0, 4], fov: 60 }}
      style={{ background: '#0D0D0D' }}
      dpr={[1, 1.5]}
    >
      <AboutSceneInner />
    </Canvas>
  );
}

/* ─── CTA section — wobbling torus knot ───────────────────────────────── */
function CtaSceneInner() {
  const mesh = useRef(null);
  useFrame(({ clock }) => {
    if (!mesh.current) return;
    mesh.current.rotation.x = clock.elapsedTime * 0.4;
    mesh.current.rotation.y = clock.elapsedTime * 0.6;
  });
  return (
    <>
      <ambientLight intensity={0.8} />
      <pointLight position={[3, 3, 3]} intensity={2} color="#ffffff" />
      <pointLight position={[-2, -2, 2]} intensity={1} color="#FF5C5C" />
      <Float speed={2} rotationIntensity={1} floatIntensity={1.5}>
        <mesh ref={mesh}>
          <torusKnotGeometry args={[0.8, 0.25, 128, 32]} />
          <MeshWobbleMaterial color="#FFD000" factor={0.3} speed={2} roughness={0} metalness={0.8} />
        </mesh>
      </Float>
      <Float speed={1.5}>
        <Torus args={[1.8, 0.03, 8, 80]}>
          <meshBasicMaterial color="#0D0D0D" opacity={0.5} transparent />
        </Torus>
      </Float>
    </>
  );
}

export function CtaCanvas({ active = true }) {
  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 0, 4], fov: 55 }}
      style={{ background: '#FFD000' }}
      dpr={[1, 1.5]}
    >
      <CtaSceneInner />
    </Canvas>
  );
}
