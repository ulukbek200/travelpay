import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, useGLTF } from '@react-three/drei';

const Earth = () => {
  const earth = useGLTF(
    'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Avocado/glTF-Binary/Avocado.glb'
  );
  const ref = useRef();
  useFrame(() => ref.current && (ref.current.rotation.y += 0.002));
  return <primitive ref={ref} object={earth.scene} scale={3} />;
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
        <Canvas camera={{ position: [3, 2, 3], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[2, 2, 2]} />
          <Stars radius={300} depth={60} count={20000} factor={7} saturation={0} fade />
          <Suspense fallback={null}>
            <OrbitControls enableZoom={false} enablePan={false} />
            <Earth />
          </Suspense>
        </Canvas>
      </div>
      <button style={styles.button} onClick={handleScrollToAbout}>
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
  },
  title: {
    fontSize: '36px',
    marginBottom: '40px',
  },
  canvasWrapper: {
    width: '100%',
    maxWidth: '600px',
    margin: '0 auto 30px',
    height: '400px',
    borderRadius: '20px',
    overflow: 'hidden',
  },
  button: {
    backgroundColor: '#fca311',
    border: 'none',
    padding: '15px 40px',
    fontSize: '18px',
    borderRadius: '30px',
    cursor: 'pointer',
    color: '#1d3557',
    fontWeight: 'bold',
    transition: 'background-color 0.3s',
  },
};

export default JoinTravelPay;
