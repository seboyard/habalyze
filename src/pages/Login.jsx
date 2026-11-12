import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { db } from '@/api/base44Client';
import { DEMO_EMAIL } from '@/api/local/seed';
import { Button } from '@/components/ui/button';

export default function Login() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const enter = async (address) => {
    setBusy(true);
    setError('');
    try {
      await db.auth.loginLocal(address);
      const next = params.get('next') || '/dashboard';
      navigate(next.startsWith('/') ? next : '/dashboard');
    } catch (err) {
      setError(err.message || 'No se pudo entrar');
      setBusy(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <p className="pixel-label">Modo local</p>
        <h1>Entra a Habalyze</h1>
        <p className="login-copy">
          Esta copia no usa Base44 ni una contraseña. La cuenta de demostración vive solo en este navegador, con hábitos, monedas y un avatar ya vestido.
        </p>
        <label htmlFor="local-email">Correo de la cuenta local</label>
        <input
          id="local-email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="username"
        />
        {error && <p className="login-error">{error}</p>}
        <Button className="login-primary" disabled={busy} onClick={() => enter(email.trim())}>
          {busy ? 'Entrando…' : 'Entrar'}
        </Button>
        <button type="button" className="login-ghost" onClick={() => enter(DEMO_EMAIL)}>
          Usar la demo de Lina
        </button>
        <button
          type="button"
          className="login-ghost"
          onClick={async () => {
            await db.auth.resetDemo();
            setEmail(DEMO_EMAIL);
            setError('');
          }}
        >
          Restablecer datos de demostración
        </button>
      </div>
    </div>
  );
}
