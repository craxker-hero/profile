export default function handler(req, res) {
  const ua = req.headers['user-agent'] || '';
  const accept = req.headers['accept'] || '';

  // Navegadores siempre envían text/html en Accept
  const isBrowser = accept.includes('text/html');

  if (!isBrowser) {
    return res.status(403).json({
      message: '¿Acaso quieres ver mi código? 😂',
      hint: 'No hay nada aquí para ti',
      status: 403
    });
  }

  // Si es navegador, redirigir al index normal
  res.redirect(302, '/index.html');
}
