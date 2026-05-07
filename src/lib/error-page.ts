export function renderErrorPage(): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Curso de Massoterapia</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0a0a0a;
      color: #e5e5e5;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .container { max-width: 400px; text-align: center; }
    .icon {
      width: 64px; height: 64px; margin: 0 auto 1.5rem;
      border-radius: 50%;
      background: rgba(220, 38, 38, 0.1);
      display: flex; align-items: center; justify-content: center;
    }
    .icon svg { width: 32px; height: 32px; color: #dc2626; }
    h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem; }
    p { font-size: 0.875rem; color: #a3a3a3; margin-bottom: 1.5rem; }
    .actions { display: flex; gap: 0.75rem; justify-content: center; }
    a, button {
      display: inline-flex; align-items: center; justify-content: center;
      padding: 0.5rem 1rem; border-radius: 0.375rem;
      font-size: 0.875rem; font-weight: 500;
      text-decoration: none; cursor: pointer; border: none;
    }
    .btn-primary { background: #2d8a4e; color: #fff; }
    .btn-secondary { background: transparent; border: 1px solid #333; color: #e5e5e5; }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
      </svg>
    </div>
    <h1>Algo deu errado</h1>
    <p>Ocorreu um erro inesperado. Tente novamente.</p>
    <div class="actions">
      <button class="btn-primary" onclick="location.reload()">Tentar novamente</button>
      <a class="btn-secondary" href="/">Ir para início</a>
    </div>
  </div>
</body>
</html>`;
}
