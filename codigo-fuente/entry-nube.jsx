import React from 'react';
import { createRoot } from 'react-dom/client';
import { crearNube } from './nube.js';

/* Datos públicos del proyecto Supabase (la seguridad la dan las políticas de acceso por fila) */
window.__NUBE__ = crearNube(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// La app se importa después de registrar la nube para que la detecte al cargar.
import('./App.jsx').then(({ default: App }) => {
  createRoot(document.getElementById('root')).render(<App />);
});
