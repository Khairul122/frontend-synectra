import { useRef, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

// Kamera ikuti mouse — parallax halus
function CameraRig({ mouse }) {
  const { camera } = useThree();
  useFrame(() => {
    camera.position.x += (mouse.current[0] * 1.5 - camera.position.x) * 0.05;
    camera.position.y += (mouse.current[1] * 1.0 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function NeuBox({ position, color, size = 1, speed = 1, rotationAxis = [1, 1, 0], mouse }) {
  const mesh      = useRef(null);
  const wireframe = useRef(null);
  const [clicked, setClicked] = useState(false);
  const [hovered, setHovered] = useState(false);
  const scaleTarget = useRef(1);

  useFrame((_, delta) => {
    if (!mesh.current) return;

    mesh.current.rotation.x += 0.004 * speed * rotationAxis[0];
    mesh.current.rotation.y += 0.006 * speed * rotationAxis[1];
    mesh.current.rotation.z += 0.002 * speed * rotationAxis[2];

    // Skala target: 1.3 jika diklik, 1.15 jika hover, 1 normal
    scaleTarget.current = clicked ? 1.35 : hovered ? 1.15 : 1;
    mesh.current.scale.lerp(
      new THREE.Vector3(scaleTarget.current, scaleTarget.current, scaleTarget.current),
      0.12,
    );

    // Emissive berkilau saat diklik
    if (mesh.current.children[0]?.material) {
      mesh.current.children[0].material.emissiveIntensity +=
        (clicked ? 0.5 : hovered ? 0.2 : 0 - mesh.current.children[0].material.emissiveIntensity) * 0.1;
    }
  });

  const handleClick = useCallback(() => {
    setClicked(true);
    setTimeout(() => setClicked(false), 400);
  }, []);

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
      <mesh
        ref={mesh}
        position={position}
        onClick={handleClick}
        onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
      >
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial
          color={clicked ? '#ffffff' : color}
          roughness={0.1}
          metalness={0.05}
          emissive={color}
          emissiveIntensity={0}
        />
        {/* Wireframe neubrutalism */}
        <mesh>
          <boxGeometry args={[size * 1.02, size * 1.02, size * 1.02]} />
          <meshBasicMaterial color={clicked ? color : '#0D0D0D'} wireframe />
        </mesh>
      </mesh>
    </Float>
  );
}

function NeuSphere({ position, color, radius = 0.6, speed = 1 }) {
  const mesh = useRef(null);
  const [clicked, setClicked] = useState(false);
  const [hovered, setHovered] = useState(false);
  const scaleTarget = useRef(1);

  useFrame(() => {
    if (!mesh.current) return;
    mesh.current.rotation.y += 0.008 * speed;
    mesh.current.rotation.z += 0.003 * speed;

    scaleTarget.current = clicked ? 1.4 : hovered ? 1.15 : 1;
    mesh.current.scale.lerp(
      new THREE.Vector3(scaleTarget.current, scaleTarget.current, scaleTarget.current),
      0.12,
    );
  });

  const handleClick = useCallback(() => {
    setClicked(true);
    setTimeout(() => setClicked(false), 400);
  }, []);

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={1}>
      <mesh
        ref={mesh}
        position={position}
        onClick={handleClick}
        onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
      >
        <icosahedronGeometry args={[radius, 0]} />
        <meshStandardMaterial
          color={clicked ? '#ffffff' : color}
          roughness={0.2}
          flatShading
          emissive={color}
          emissiveIntensity={clicked ? 0.6 : hovered ? 0.2 : 0}
        />
      </mesh>
    </Float>
  );
}

function NeuTorus({ position, color, speed = 1 }) {
  const mesh = useRef(null);
  const [clicked, setClicked] = useState(false);
  const [hovered, setHovered] = useState(false);
  const scaleTarget = useRef(1);

  useFrame(() => {
    if (!mesh.current) return;
    mesh.current.rotation.x += 0.007 * speed;
    mesh.current.rotation.y += 0.005 * speed;

    scaleTarget.current = clicked ? 1.4 : hovered ? 1.15 : 1;
    mesh.current.scale.lerp(
      new THREE.Vector3(scaleTarget.current, scaleTarget.current, scaleTarget.current),
      0.12,
    );
  });

  const handleClick = useCallback(() => {
    setClicked(true);
    setTimeout(() => setClicked(false), 400);
  }, []);

  return (
    <Float speed={1.2} floatIntensity={0.6}>
      <mesh
        ref={mesh}
        position={position}
        onClick={handleClick}
        onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
      >
        <torusGeometry args={[0.5, 0.18, 4, 4]} />
        <meshStandardMaterial
          color={clicked ? '#ffffff' : color}
          roughness={0.15}
          flatShading
          emissive={color}
          emissiveIntensity={clicked ? 0.6 : hovered ? 0.2 : 0}
        />
      </mesh>
    </Float>
  );
}

export function Scene3D() {
  const mouse = useRef([0, 0]);

  const handleMouseMove = useCallback((e) => {
    // Normalisasi ke range -1..1
    mouse.current = [
      (e.clientX / window.innerWidth  - 0.5) * 2,
      -(e.clientY / window.innerHeight - 0.5) * 2,
    ];
  }, []);

  return (
    <div
      className="fixed inset-0 z-0"
      onMouseMove={handleMouseMove}
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
        frameloop="always"
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} color="#ffffff" />
        <directionalLight position={[-4, -2, -4]} intensity={0.4} color="#FFD000" />

        <CameraRig mouse={mouse} />

        <NeuBox position={[-5, 3, -2]}  color="#FFD000" size={1.2} speed={0.8} rotationAxis={[1, 1, 0]} mouse={mouse} />
        <NeuBox position={[5, -3, -1]}  color="#FF5C5C" size={0.9} speed={1.2} rotationAxis={[0, 1, 1]} mouse={mouse} />
        <NeuBox position={[4.5, 2.5, -3]} color="#4D61FF" size={0.7} speed={0.6} rotationAxis={[1, 0, 1]} mouse={mouse} />
        <NeuSphere position={[-4.5, -2.5, -1]} color="#00C48C" radius={0.7} speed={0.9} />
        <NeuTorus  position={[-3.5, 0.5, -2]}  color="#A855F7" speed={1.1} />
        <NeuBox position={[3, 0, -3]}   color="#FFD000" size={0.5} speed={1.5} rotationAxis={[1, 1, 1]} mouse={mouse} />
      </Canvas>
    </div>
  );
}
