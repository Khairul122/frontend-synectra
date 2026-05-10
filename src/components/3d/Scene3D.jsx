import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshWobbleMaterial, Float, OrbitControls } from '@react-three/drei';

function NeuBox({ position, color, size = 1, speed = 1, rotationAxis = [1, 1, 0] }) {
  const mesh = useRef(null);

  useFrame((state) => {
    if (!mesh.current) return;
    mesh.current.rotation.x += 0.004 * speed * rotationAxis[0];
    mesh.current.rotation.y += 0.006 * speed * rotationAxis[1];
    mesh.current.rotation.z += 0.002 * speed * rotationAxis[2];
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
      <mesh ref={mesh} position={position}>
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial color={color} roughness={0.1} metalness={0.05} />
        {/* Wireframe overlay for neubrutalism border effect */}
        <mesh>
          <boxGeometry args={[size * 1.01, size * 1.01, size * 1.01]} />
          <meshBasicMaterial color="#0D0D0D" wireframe />
        </mesh>
      </mesh>
    </Float>
  );
}

function NeuSphere({ position, color, radius = 0.6, speed = 1 }) {
  const mesh = useRef(null);

  useFrame(() => {
    if (!mesh.current) return;
    mesh.current.rotation.y += 0.008 * speed;
    mesh.current.rotation.z += 0.003 * speed;
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={1}>
      <mesh ref={mesh} position={position}>
        <icosahedronGeometry args={[radius, 0]} />
        <meshStandardMaterial color={color} roughness={0.2} flatShading />
      </mesh>
    </Float>
  );
}

function NeuTorus({ position, color, speed = 1 }) {
  const mesh = useRef(null);

  useFrame(() => {
    if (!mesh.current) return;
    mesh.current.rotation.x += 0.007 * speed;
    mesh.current.rotation.y += 0.005 * speed;
  });

  return (
    <Float speed={1.2} floatIntensity={0.6}>
      <mesh ref={mesh} position={position}>
        <torusGeometry args={[0.5, 0.18, 4, 4]} />
        <meshStandardMaterial color={color} roughness={0.15} flatShading />
      </mesh>
    </Float>
  );
}

export function Scene3D() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} color="#ffffff" />
        <directionalLight position={[-4, -2, -4]} intensity={0.4} color="#FFD000" />

        {/* Yellow box — top left */}
        <NeuBox position={[-5, 3, -2]} color="#FFD000" size={1.2} speed={0.8} rotationAxis={[1, 1, 0]} />

        {/* Red box — bottom right */}
        <NeuBox position={[5, -3, -1]} color="#FF5C5C" size={0.9} speed={1.2} rotationAxis={[0, 1, 1]} />

        {/* Blue box — top right */}
        <NeuBox position={[4.5, 2.5, -3]} color="#4D61FF" size={0.7} speed={0.6} rotationAxis={[1, 0, 1]} />

        {/* Green icosahedron — bottom left */}
        <NeuSphere position={[-4.5, -2.5, -1]} color="#00C48C" radius={0.7} speed={0.9} />

        {/* Purple torus — mid left */}
        <NeuTorus position={[-3.5, 0.5, -2]} color="#A855F7" speed={1.1} />

        {/* Small yellow box — mid right */}
        <NeuBox position={[3, 0, -3]} color="#FFD000" size={0.5} speed={1.5} rotationAxis={[1, 1, 1]} />
      </Canvas>
    </div>
  );
}
