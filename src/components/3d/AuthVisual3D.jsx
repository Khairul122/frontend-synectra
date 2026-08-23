import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function AuthVisual3D({ isDesktop = false }) {
  const containerRef = useRef(null);
  const glCanvasRef = useRef(null);

  useEffect(() => {
    // --- 1. WebGL Subtle Ambient Grid Shader ---
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
            
            vec2 pan = vec2(u_time * 0.015, u_time * 0.01);
            float g = grid(uv + pan, 16.0);
            
            vec3 bg = vec3(0.96, 0.94, 0.91); 
            vec3 gridCol = vec3(0.08, 0.08, 0.08);
            
            float dist = distance(uv, mouse);
            float glow = 1.0 - smoothstep(0.0, 0.7, dist);
            
            vec3 finalCol = mix(bg, gridCol, g * 0.04);
            finalCol += vec3(1.0, 0.82, 0.0) * glow * 0.06;
            
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
    // --- 2. Sleek & Professional 3D Floating Geometry (Three.js) ---
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || (isDesktop ? window.innerWidth / 2 : window.innerWidth);
    const height = container.clientHeight || (isDesktop ? 380 : 180);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    const threeRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    threeRenderer.setSize(width, height);
    threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(threeRenderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // --- Main Object: Sleek Chamfered Monolith ---
    const cubeGeom = new THREE.BoxGeometry(2.2, 2.8, 1.2);
    const cubeMat = new THREE.MeshPhongMaterial({
      color: 0xFFD000,
      specular: 0xFFFFFF,
      shininess: 80,
      flatShading: true,
    });
    const cubeMesh = new THREE.Mesh(cubeGeom, cubeMat);

    // Crisp Neubrutalist Outline
    const edges = new THREE.EdgesGeometry(cubeGeom);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x0D0D0D, linewidth: 2.5 });
    const wireframe = new THREE.LineSegments(edges, lineMat);
    cubeMesh.add(wireframe);

    group.add(cubeMesh);

    // --- Elegant Orbiting Ring ---
    const ringGeom = new THREE.TorusGeometry(2.5, 0.06, 16, 100);
    const ringMat = new THREE.MeshPhongMaterial({ color: 0x0D0D0D });
    const ringMesh = new THREE.Mesh(ringGeom, ringMat);
    ringMesh.rotation.x = Math.PI / 2.5;
    ringMesh.rotation.y = Math.PI / 6;
    group.add(ringMesh);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight1.position.set(5, 8, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xFFD000, 0.5);
    dirLight2.position.set(-5, -5, -2);
    scene.add(dirLight2);

    camera.position.z = isDesktop ? 8 : 7.5;

    // --- Smooth Mouse Parallax ---
    let mouseX = 0;
    let mouseY = 0;

    const handlePointerMove = (e) => {
      mouseX = (e.clientX / window.innerWidth) - 0.5;
      mouseY = (e.clientY / window.innerHeight) - 0.5;
    };
    window.addEventListener('mousemove', handlePointerMove);

    let threeReqId;
    const animate3D = () => {
      threeReqId = requestAnimationFrame(animate3D);
      const time = Date.now() * 0.001;

      // Smooth floating oscillation
      group.position.y = Math.sin(time * 1.2) * 0.18;
      
      // Smooth continuous rotation
      cubeMesh.rotation.y += 0.006;
      cubeMesh.rotation.x = Math.sin(time * 0.6) * 0.1;

      ringMesh.rotation.z += 0.008;

      // Mouse tilt responsiveness
      const targetX = mouseX * 0.4;
      const targetY = -mouseY * 0.4;

      group.rotation.y += (targetX - group.rotation.y) * 0.06;
      group.rotation.x += (targetY - group.rotation.x) * 0.06;

      threeRenderer.render(scene, camera);
    };

    const handleResize = () => {
      const w = container.clientWidth || (isDesktop ? window.innerWidth / 2 : window.innerWidth);
      const h = container.clientHeight || (isDesktop ? 380 : 180);
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

      cubeGeom.dispose();
      cubeMat.dispose();
      edges.dispose();
      lineMat.dispose();

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
      <div className="w-full h-full relative flex flex-col items-center justify-center overflow-hidden p-6 select-none">
        <canvas ref={glCanvasRef} className="absolute inset-0 w-full h-full z-0" />
        
        {/* Simple & Clean Header */}
        <div className="relative z-10 text-center flex flex-col items-center w-full max-w-xl mb-2">
          <h1 className="font-display font-black text-5xl lg:text-6xl xl:text-7xl text-neu-black tracking-tighter uppercase leading-[1.05] drop-shadow-[6px_6px_0px_rgba(255,208,0,1)]">
            WELCOME TO SYNECTRA
          </h1>
          <p className="font-body text-sm lg:text-base text-on-surface-variant font-medium mt-3">
            Enter the next generation digital workspace.
          </p>
        </div>

        {/* Sleek 3D Canvas Area */}
        <div ref={containerRef} className="relative z-10 w-full h-[380px] max-w-md my-2" />
      </div>
    );
  }

  return (
    <div className="w-full h-[180px] relative flex items-center justify-center shrink-0 border-b-3 border-neu-black overflow-hidden select-none">
      <canvas ref={glCanvasRef} className="absolute inset-0 w-full h-full z-0" />
      <div ref={containerRef} className="absolute inset-0 w-full h-full z-10 pointer-events-none" />
    </div>
  );
}
