import React, { useEffect, useRef } from 'react';
import api from '../../api';

// Google OAuth client IDs are public identifiers. Keeping this fallback avoids a stale
// frontend build using an incorrectly entered hosting environment variable.
const GOOGLE_CLIENT_ID = '555757441096-0gldl5g39cvjeeuda1hjh1hkm3oeojd9.apps.googleusercontent.com';

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
