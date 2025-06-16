import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ChartData {
  id: string;
  name: string;
  value: number;
  color?: string;
}

interface ThreeDBarChartProps {
  data: ChartData[];
  width: number;
  height: number;
}

const ThreeDBarChart: React.FC<ThreeDBarChartProps> = ({
  data,
  width,
  height
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current || data.length === 0) return;
    
    // Set up scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1e293b);
    
    // Set up camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(5, 5, 10);
    camera.lookAt(0, 0, 0);
    
    // Set up renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    containerRef.current.appendChild(renderer.domElement);
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);
    
    // Create bars
    const maxValue = Math.max(...data.map(d => d.value));
    const barWidth = 1;
    const spacing = 0.5;
    const totalWidth = data.length * (barWidth + spacing) - spacing;
    const startX = -totalWidth / 2 + barWidth / 2;
    
    data.forEach((item, index) => {
      const barHeight = (item.value / maxValue) * 5;
      const geometry = new THREE.BoxGeometry(barWidth, barHeight, barWidth);
      
      // Use color from data or generate one
      const color = item.color || `hsl(${index * 360 / data.length}, 70%, 60%)`;
      const material = new THREE.MeshStandardMaterial({ 
        color: new THREE.Color(color),
        metalness: 0.3,
        roughness: 0.4
      });
      
      const bar = new THREE.Mesh(geometry, material);
      bar.position.x = startX + index * (barWidth + spacing);
      bar.position.y = barHeight / 2;
      
      scene.add(bar);
      
      // Add text label
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = 128;
        canvas.height = 64;
        context.fillStyle = '#ffffff';
        context.font = '24px Arial';
        context.textAlign = 'center';
        context.fillText(item.name, 64, 32);
        
        const texture = new THREE.CanvasTexture(canvas);
        const labelMaterial = new THREE.SpriteMaterial({ map: texture });
        const label = new THREE.Sprite(labelMaterial);
        label.position.set(bar.position.x, -0.5, 0);
        label.scale.set(2, 1, 1);
        scene.add(label);
      }
    });
    
    // Add grid helper
    const gridHelper = new THREE.GridHelper(10, 10, 0x444444, 0x222222);
    scene.add(gridHelper);
    
    // Animation
    let rotationSpeed = 0.005;
    let autoRotate = true;
    
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (autoRotate) {
        scene.rotation.y += rotationSpeed;
      }
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Add event listeners for interaction
    const handleMouseDown = () => {
      autoRotate = false;
    };
    
    const handleMouseUp = () => {
      setTimeout(() => {
        autoRotate = true;
      }, 2000);
    };
    
    const handleMouseMove = (event: MouseEvent) => {
      if (!autoRotate) {
        const movementX = event.movementX || 0;
        scene.rotation.y += movementX * 0.005;
      }
    };
    
    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    
    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;
      
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      
      renderer.setSize(newWidth, newHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      renderer.domElement.removeEventListener('mouseup', handleMouseUp);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, [data, width, height]);
  
  return <div ref={containerRef} style={{ width: '100%', height: '100%' }}></div>;
};

export default ThreeDBarChart;