import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function AuthVisual3D({ isDesktop = false }) {
  const containerRef = useRef(null);
  const glCanvasRef = useRef(null);

  useEffect(() => {
    // --- 1. WebGL Shader Canvas ---
    const canvas = glCanvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    let animationFrameId;

    if (gl) {
      const vertexShaderSource = `
        attribute vec2 position;
        varying vec2 v_texCoord;
        void main() {
            gl_Position = vec4(position, 0.0, 1.0);
            v_texCoord = position * 0.5 + 0.5;
        }
      `;

      const fragmentShaderSource = `
        precision highp float;
        varying vec2 v_texCoord;
        uniform float u_time;
        uniform vec2 u_resolution;
        uniform vec2 u_mouse;

        float grid(vec2 uv, float size) {
            vec2 grid = fract(uv * size);
            return step(0.98, grid.x) + step(0.98, grid.y);
        }

        void main() {
            vec2 uv = v_texCoord;
            vec2 mouse = u_mouse / u_resolution;
            
            vec2 pan = vec2(u_time * 0.02, u_time * 0.015);
            float g = grid(uv + pan, 15.0);
            
            vec3 bg = vec3(0.96, 0.94, 0.91); 
            vec3 gridCol = vec3(0.05, 0.05, 0.05);
            
            float dist = distance(uv, mouse);
            float glow = 1.0 - smoothstep(0.0, 0.8, dist);
            
            vec3 finalCol = mix(bg, gridCol, g * 0.05);
            finalCol += vec3(1.0, 0.82, 0.0) * glow * 0.05;
            
            gl_FragColor = vec4(finalCol, 1.0);
        }
      `;

      function compileShader(glCtx, source, type) {
        const shader = glCtx.createShader(type);
        glCtx.shaderSource(shader, source);
        glCtx.compileShader(shader);
        if (!glCtx.getShaderParameter(shader, glCtx.COMPILE_STATUS)) {
          glCtx.deleteShader(shader);
          return null;
        }
        return shader;
      }

      const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
      const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
      if (vertexShader && fragmentShader) {
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        gl.useProgram(program);

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        const positions = new Float32Array([
          -1.0, -1.0,
           1.0, -1.0,
          -1.0,  1.0,
          -1.0,  1.0,
           1.0, -1.0,
           1.0,  1.0,
        ]);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

        const positionLocation = gl.getAttribLocation(program, 'position');
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        const uTimeLocation = gl.getUniformLocation(program, 'u_time');
        const uResLocation = gl.getUniformLocation(program, 'u_resolution');
        const uMouseLocation = gl.getUniformLocation(program, 'u_mouse');

        let mousePos = { x: 0.5, y: 0.5 };
        const handleMouseMove = (e) => {
          const rect = canvas.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            mousePos.x = (e.clientX - rect.left) / rect.width;
            mousePos.y = 1.0 - (e.clientY - rect.top) / rect.height;
          }
        };
        window.addEventListener('mousemove', handleMouseMove);

        const renderShader = (time) => {
          if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
          }
          if (canvas.width > 0 && canvas.height > 0) {
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.uniform1f(uTimeLocation, time * 0.001);
            gl.uniform2f(uResLocation, canvas.width, canvas.height);
            gl.uniform2f(uMouseLocation, mousePos.x * canvas.width, mousePos.y * canvas.height);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
          }
          animationFrameId = requestAnimationFrame(renderShader);
        };
        animationFrameId = requestAnimationFrame(renderShader);

        return () => {
          cancelAnimationFrame(animationFrameId);
          window.removeEventListener('mousemove', handleMouseMove);
          const ext = gl.getExtension('WEBGL_lose_context');
          if (ext) ext.loseContext();
        };
      }
    }
  }, []);

  useEffect(() => {
    // --- 2. Three.js Floating 3D Monolith Lock ---
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || (isDesktop ? window.innerWidth / 2 : window.innerWidth);
    const height = container.clientHeight || (isDesktop ? 400 : 180);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    const threeRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    threeRenderer.setSize(width, height);
    threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(threeRenderer.domElement);

    const colors = {
      yellow: 0xFFD000,
      black: 0x0D0D0D,
    };

    const group = new THREE.Group();
    scene.add(group);

    // Stylized 3D Lock/Monolith
    const geometry = new THREE.BoxGeometry(2, 3, 0.8);
    const material = new THREE.MeshPhongMaterial({
      color: colors.yellow,
      flatShading: true,
      shininess: 100,
    });
    const monolith = new THREE.Mesh(geometry, material);

    // Wireframe Edges
    const edges = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({ color: colors.black, linewidth: 2 });
    const wireframe = new THREE.LineSegments(edges, lineMaterial);
    monolith.add(wireframe);

    group.add(monolith);

    // Floating Torus Ring
    const ringGeom = new THREE.TorusGeometry(2, 0.05, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: colors.black });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.rotation.x = Math.PI / 2;
    group.add(ring);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    camera.position.z = 8;

    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handlePointerMove = (e) => {
      mouseX = (e.clientX / window.innerWidth) - 0.5;
      mouseY = (e.clientY / window.innerHeight) - 0.5;
    };
    window.addEventListener('mousemove', handlePointerMove);

    let threeReqId;
    const animate3D = () => {
      threeReqId = requestAnimationFrame(animate3D);
      const time = Date.now() * 0.001;

      group.position.y = Math.sin(time) * 0.2;
      group.rotation.y += 0.005;

      targetX = mouseX * 0.5;
      targetY = -mouseY * 0.5;

      group.rotation.x += (targetY - group.rotation.x) * 0.1;
      group.rotation.y += (targetX - group.rotation.y) * 0.1;

      threeRenderer.render(scene, camera);
    };

    const handleResize = () => {
      const w = container.clientWidth || (isDesktop ? window.innerWidth / 2 : window.innerWidth);
      const h = container.clientHeight || (isDesktop ? 400 : 180);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      threeRenderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    animate3D();

    return () => {
      cancelAnimationFrame(threeReqId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handlePointerMove);

      geometry.dispose();
      material.dispose();
      edges.dispose();
      lineMaterial.dispose();
      ringGeom.dispose();
      ringMat.dispose();

      threeRenderer.dispose();
      threeRenderer.forceContextLoss();
      if (threeRenderer.domElement && threeRenderer.domElement.parentNode) {
        threeRenderer.domElement.parentNode.removeChild(threeRenderer.domElement);
      }
    };
  }, [isDesktop]);

  if (isDesktop) {
    return (
      <div className="w-full h-full relative flex flex-col items-center justify-center overflow-hidden">
        <canvas ref={glCanvasRef} className="absolute inset-0 w-full h-full z-0" />
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent to-surface-container-high/40 pointer-events-none" />
        <div className="relative z-10 text-center flex flex-col items-center w-full">
          <h1 className="font-display font-black text-4xl lg:text-5xl text-neu-black mb-8 tracking-tighter uppercase drop-shadow-[4px_4px_0px_rgba(255,208,0,1)]">
            WELCOME TO SYNECTRA
          </h1>
          <div ref={containerRef} className="relative z-10 w-full h-[400px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[180px] relative flex items-center justify-center shrink-0 border-b-3 border-neu-black overflow-hidden">
      <canvas ref={glCanvasRef} className="absolute inset-0 w-full h-full z-0" />
      <div ref={containerRef} className="absolute inset-0 w-full h-full z-10 pointer-events-none" />
    </div>
  );
}
