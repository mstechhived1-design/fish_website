import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, ContactShadows, useAnimations } from '@react-three/drei';

function Model({ url }) {
  const { scene, animations } = useGLTF(url);
  const { actions } = useAnimations(animations, scene);
  const ref = useRef();
  
  // Track scroll internally in the model
  const scrollRef = useRef(0);
  const prevScrollRef = useRef(0);

  useEffect(() => {
    const handleScroll = (e) => {
      scrollRef.current = e.detail;
    };
    window.addEventListener('fish-scroll', handleScroll);
    return () => window.removeEventListener('fish-scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Start the first animation paused
    if (actions) {
      const actionNames = Object.keys(actions);
      if (actionNames.length > 0) {
        const action = actions[actionNames[0]];
        action.play();
        action.paused = true;
      }
    }
  }, [actions]);

  useFrame((state, delta) => {
    if (ref.current) {
      const currentScroll = scrollRef.current;
      const scrollDelta = Math.abs(currentScroll - prevScrollRef.current);
      prevScrollRef.current = currentScroll;

      // Rotate based on scroll position (not time)
      // This maps scroll progress (0-1) to a full rotation (Math.PI * 2) or more.
      ref.current.rotation.y = currentScroll * Math.PI * 4;

      // If model has animations, advance animation time based on scroll delta
      if (actions) {
        const actionNames = Object.keys(actions);
        if (actionNames.length > 0) {
          const action = actions[actionNames[0]];
          // Advance animation frame based on the magnitude of the scroll
          // The multiplier makes the swimming look active
          if (scrollDelta > 0.0001) {
            action.time = (action.time + scrollDelta * 20) % action.getClip().duration;
          }
        }
      }
    }
  });

  // Reduced scale as requested
  return <primitive object={scene} ref={ref} scale={0.4} />;
}

export default function ModelViewer({ url, title }) {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h3 style={{ position: 'absolute', top: '10px', color: 'white', zIndex: 10, textShadow: '0 2px 4px rgba(0,0,0,0.5)', fontFamily: 'sans-serif' }}>{title}</h3>
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <Suspense fallback={null}>
          <Model url={url} />
          <Environment preset="city" />
          <ContactShadows position={[0, -2, 0]} opacity={0.5} scale={10} blur={2} far={4} />
        </Suspense>
        <OrbitControls enableZoom={true} autoRotate={false} />
      </Canvas>
    </div>
  );
}
