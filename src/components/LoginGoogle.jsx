import { loginConGoogle } from '../firebase';

export default function LoginGoogle({ onLogin }) {
  async function handleLogin() {
    try {
      const usuario = await loginConGoogle();
      onLogin(usuario);
    } catch (e) {
      console.warn('Login cancelado:', e.code || e.message);
    }
  }

  return (
    <div className="login-pantalla">
      {/* Panel izquierdo — hero */}
      <div className="login-hero" aria-hidden="true">
        <div className="login-hero__deco">
          <span className="deco deco--a" />
          <span className="deco deco--b" />
          <span className="deco deco--c" />
        </div>
        <div className="login-hero__content">
          <p className="login-eyebrow">Tu espacio de estudio</p>
          <h2 className="login-hero__titulo">Study<br/>Planner</h2>
          <ul className="login-features">
            <li><span className="feature-dot" />Organizá materias y exámenes</li>
            <li><span className="feature-dot" />Seguí tu progreso tema a tema</li>
            <li><span className="feature-dot" />Pomodoro integrado</li>
            <li><span className="feature-dot" />Metas y notas en un solo lugar</li>
          </ul>
        </div>
      </div>

      {/* Panel derecho — card de login */}
      <div className="login-side">
        <div className="login-card">
          <div className="login-logo">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
              <rect width="36" height="36" rx="10" fill="#6D4AFF"/>
              <path d="M10 18h16M18 10v16" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="18" cy="18" r="4" fill="#fff" opacity=".25"/>
            </svg>
            <span className="login-logo__texto">Study Planner</span>
          </div>

          <div className="login-card__copy">
            <h1>Bienvenido</h1>
            <p>Iniciá sesión para acceder a tu plan de estudio sincronizado.</p>
          </div>

          <button className="btn--google" onClick={handleLogin}>
            <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.8 2.5 30.3 0 24 0 14.6 0 6.6 5.4 2.6 13.3l7.8 6C12.4 13 17.8 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8C43.6 37.3 46.5 31.3 46.5 24.5z"/>
              <path fill="#FBBC05" d="M10.4 28.7A14.6 14.6 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.8-6A23.9 23.9 0 0 0 0 24c0 3.9.9 7.6 2.6 10.8l7.8-6.1z"/>
              <path fill="#34A853" d="M24 48c6.3 0 11.6-2.1 15.5-5.7l-7.5-5.8c-2.1 1.4-4.8 2.3-8 2.3-6.2 0-11.5-4.2-13.4-9.9l-7.8 6.1C6.6 42.6 14.6 48 24 48z"/>
            </svg>
            Continuar con Google
          </button>

          <p className="login-legal">
            Al continuar aceptás que tus datos se almacenen de forma segura en Firebase.
          </p>
        </div>
      </div>
    </div>
  );
}
