import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { db } from '@/api/base44Client';
import { DEMO_EMAIL } from '@/api/local/seed';
import { Button } from '@/components/ui/button';

export default function Login() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const supabaseMode = db.adapter === 'supabase';
  const [email, setEmail] = useState(supabaseMode ? '' : DEMO_EMAIL);
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [mode, setMode] = useState('enter');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  const next = params.get('next') || '/dashboard';

  useEffect(() => {
    db.auth.isAuthenticated().then((ok) => {
      if (ok) navigate(next.startsWith('/') ? next : '/dashboard');
    }).catch(() => {});
  }, [navigate, next]);

  const go = (path) => navigate(path.startsWith('/') ? path : '/dashboard');

  const enterLocal = async (address) => {
    setBusy(true);
    setError('');
    try {
      await db.auth.loginLocal(address);
      go(next);
    } catch (err) {
      setError(err.message || 'No se pudo entrar');
      setBusy(false);
    }
  };

  const enterPassword = async () => {
    setBusy(true);
    setError('');
    setInfo('');
    try {
      await db.auth.signInWithPassword({ email: email.trim(), password });
      go(next);
    } catch (err) {
      setError(err.message || 'Correo o contraseña incorrectos');
      setBusy(false);
    }
  };

  const register = async () => {
    setBusy(true);
    setError('');
    setInfo('');
    try {
      const result = await db.auth.signUp({ email: email.trim(), password, fullName: fullName.trim() });
      if (result.needsConfirmation) {
        setInfo('Te escribimos para confirmar el correo. Ábrelo y vuelve a entrar.');
        setBusy(false);
        return;
      }
      go('/onboarding');
    } catch (err) {
      setError(err.message || 'No se pudo crear la cuenta');
      setBusy(false);
    }
  };

  const sendLink = async () => {
    setBusy(true);
    setError('');
    setInfo('');
    try {
      await db.auth.signInWithOtp({ email: email.trim() });
      setInfo('Te enviamos un enlace mágico. Ábrelo en este mismo navegador.');
      setBusy(false);
    } catch (err) {
      setError(err.message || 'No se pudo enviar el enlace');
      setBusy(false);
    }
  };

  if (!supabaseMode) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <p className="pixel-label">Modo local</p>
          <h1>Entra a Habalyze</h1>
          <p className="login-copy">
            Esta copia no usa Base44 ni una contraseña. La cuenta de demostración vive solo en este navegador.
          </p>
          <label htmlFor="local-email">Correo de la cuenta local</label>
          <input id="local-email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" />
          {error && <p className="login-error">{error}</p>}
          <Button className="login-primary" disabled={busy} onClick={() => enterLocal(email.trim())}>
            {busy ? 'Entrando…' : 'Entrar'}
          </Button>
          <button type="button" className="login-ghost" onClick={() => enterLocal(DEMO_EMAIL)}>Usar la demo de Lina</button>
          <button type="button" className="login-ghost" onClick={async () => { await db.auth.resetDemo(); setEmail(DEMO_EMAIL); setError(''); }}>
            Restablecer datos de demostración
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <p className="pixel-label">Cuenta</p>
        <h1>{mode === 'register' ? 'Crear cuenta' : 'Entra a Habalyze'}</h1>
        <p className="login-copy">
          El correo y la contraseña los guarda Supabase Auth. La clave anónima del proyecto no es una contraseña de usuario.
        </p>
        {mode === 'register' && (
          <>
            <label htmlFor="full-name">Cómo te llamamos</label>
            <input id="full-name" value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" />
          </>
        )}
        <label htmlFor="auth-email">Correo</label>
        <input id="auth-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
        <label htmlFor="auth-password">Contraseña</label>
        <input id="auth-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} minLength={8} />
        {error && <p className="login-error">{error}</p>}
        {info && <p className="login-copy">{info}</p>}
        {mode === 'register' ? (
          <Button className="login-primary" disabled={busy || password.length < 8} onClick={register}>
            {busy ? 'Creando…' : 'Crear cuenta'}
          </Button>
        ) : (
          <Button className="login-primary" disabled={busy || !email || !password} onClick={enterPassword}>
            {busy ? 'Entrando…' : 'Entrar'}
          </Button>
        )}
        <button type="button" className="login-ghost" disabled={busy || !email} onClick={sendLink}>
          Enviarme un enlace mágico
        </button>
        <button type="button" className="login-ghost" onClick={() => { setMode(mode === 'register' ? 'enter' : 'register'); setError(''); setInfo(''); }}>
          {mode === 'register' ? 'Ya tengo cuenta' : 'Crear una cuenta nueva'}
        </button>
      </div>
    </div>
  );
}
