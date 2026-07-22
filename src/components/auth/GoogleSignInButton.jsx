import React, { useEffect, useRef } from 'react';
import api from '../../api';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

export default function GoogleSignInButton({ onSuccess, onError }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !containerRef.current) return undefined;
    const render = () => {
      window.google?.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async ({ credential }) => {
          try {
            const response = await api.post('/auth/google', { credential });
            onSuccess(response.data);
          } catch (error) { onError(error); }
        },
      });
      window.google?.accounts.id.renderButton(containerRef.current, { theme: 'outline', size: 'large', width: 320, text: 'continue_with', locale: 'ru' });
    };
    const script = document.querySelector('script[data-google-identity]');
    if (window.google) render();
    else if (!script) {
      const next = document.createElement('script');
      next.src = 'https://accounts.google.com/gsi/client'; next.async = true; next.dataset.googleIdentity = 'true'; next.onload = render;
      document.head.appendChild(next);
    } else script.addEventListener('load', render, { once: true });
    return undefined;
  }, [onSuccess, onError]);

  if (!GOOGLE_CLIENT_ID) return null;
  return <div ref={containerRef} style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }} />;
}
