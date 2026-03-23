// ── Layout wrapper for all pages ──────────
export function layout(title: string, bodyContent: string, extraHead: string = ''): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${title} | Reuse Canada</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            rc: {
              green: '#1B5E20',
              'green-light': '#2E7D32',
              'green-dark': '#0D3B0F',
              lime: '#7CB342',
              orange: '#F57C00',
              'orange-light': '#FF9800',
              gray: '#37474F',
              'gray-light': '#546E7A',
              white: '#FAFAFA',
            }
          }
        }
      }
    }
  </script>
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.0/css/all.min.css" rel="stylesheet">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    body { font-family: 'Inter', sans-serif; }
    .rc-gradient { background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #7CB342 100%); }
    .rc-gradient-dark { background: linear-gradient(135deg, #0D3B0F 0%, #1B5E20 100%); }
    .glass { background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); }
    .card-hover { transition: all 0.3s ease; }
    .card-hover:hover { transform: translateY(-2px); box-shadow: 0 12px 24px rgba(0,0,0,0.15); }
    .pulse-green { animation: pulseGreen 2s infinite; }
    @keyframes pulseGreen {
      0%, 100% { box-shadow: 0 0 0 0 rgba(27, 94, 32, 0.4); }
      50% { box-shadow: 0 0 0 10px rgba(27, 94, 32, 0); }
    }
    /* Signature pad */
    .sig-canvas { touch-action: none; }
    /* Custom scrollbar */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: #f1f1f1; }
    ::-webkit-scrollbar-thumb { background: #1B5E20; border-radius: 3px; }
  </style>
  ${extraHead}
</head>
<body class="bg-gray-50 min-h-screen">
  ${bodyContent}
  <script src="https://cdn.jsdelivr.net/npm/axios@1.7.0/dist/axios.min.js"></script>
</body>
</html>`
}
