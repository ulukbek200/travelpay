import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, useTexture } from '@react-three/drei';
import * as THREE from 'three';

const Earth = () => {
  const ref = useRef();

  const [colorMap, normalMap, specularMap] = useTexture([
    'https://raw.githubusercontent.com/turban/webgl-earth/master/images/2_no_clouds_4k.jpg',
    'https://raw.githubusercontent.com/turban/webgl-earth/master/images/elev_bump_4k.jpg',
    'https://raw.githubusercontent.com/turban/webgl-earth/master/images/water_4k.png',
  ]);

  // Плавное вращение + покачивание
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y += 0.002;
      ref.current.rotation.x = Math.sin(clock.getElapsedTime() / 4) * 0.05;
    }
  });

  return (
    <mesh ref={ref} rotation={[0, 0, 0]}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshPhongMaterial
        map={colorMap}
        normalMap={normalMap}
        specularMap={specularMap}
        specular={new THREE.Color('grey')}
        shininess={15}
      />
    </mesh>
  );
};

const JoinTravelPay = () => {
  const handleScrollToAbout = () => {
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section style={styles.section}>
      <h2 style={styles.title}>Присоединяйся к TravelPay и познавай мир!</h2>
      <div style={styles.canvasWrapper}>
        <Canvas
          camera={{ position: [2.5, 2, 3], fov: 45 }}
          style={{ background: 'linear-gradient(180deg, #0a1f44 0%, #1d3557 100%)', borderRadius: 20 }}
          shadows
          fog={new THREE.FogExp2('#0a1f44', 0.15)}
        >
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
          <Suspense fallback={null}>
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate
              autoRotateSpeed={0.3}
              maxPolarAngle={Math.PI / 2}
              minPolarAngle={Math.PI / 3}
            />
            <Earth />
            <Stars
              radius={150}
              depth={50}
              count={1000}
              factor={4}
              saturation={0.6}
              fade
              speed={1}
            />
          </Suspense>
        </Canvas>
      </div>
      <button
        style={styles.button}
        onClick={handleScrollToAbout}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'linear-gradient(90deg, #fca311, #f4a261, #e76f51)';
          e.currentTarget.style.boxShadow = '0 0 15px #fca311';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#fca311';
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        Узнать больше
      </button>
    </section>
  );
};

const styles = {
  section: {
    backgroundColor: '#1d3557',
    color: 'white',
    textAlign: 'center',
    padding: '60px 20px',
    position: 'relative',
    overflow: 'hidden',
  },
  title: {
    fontSize: '38px',
    fontWeight: '700',
    marginBottom: '40px',
    fontFamily: "'Poppins', sans-serif",
    textShadow: '0 2px 8px rgba(0,0,0,0.6)',
  },
  canvasWrapper: {
    width: '100%',
    maxWidth: '600px',
    margin: '0 auto 40px',
    height: '420px',
    borderRadius: '20px',
    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5)',
    overflow: 'hidden',
    backgroundColor: '#0a1f44',
  },
  button: {
    backgroundColor: '#fca311',
    border: 'none',
    padding: '16px 48px',
    fontSize: '20px',
    borderRadius: '30px',
    cursor: 'pointer',
    color: '#1d3557',
    fontWeight: 'bold',
    fontFamily: "'Poppins', sans-serif",
    transition: 'all 0.3s ease',
    userSelect: 'none',
    boxShadow: '0 6px 12px rgba(252, 163, 17, 0.6)',
  },
};

export default JoinTravelPay;

