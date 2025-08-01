// main.js
require('dotenv').config(); // 👈 ÚNICO local com dotenv.config()

const express = require('express');
const healthRouter = require('./routes/health');
const pedidosRouter = require('./routes/pedidos');
const homologadosRouter = require('./routes/homologados');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Rotas
app.use('/api/pedidos', pedidosRouter);
app.use('/api/health', healthRouter);
app.use('/', healthRouter);
app.use('/api/pedidos/homologados', homologadosRouter)
// Alias para manter compatibilidade com versões anteriores
app.use('/api/pedidos_homologados', homologadosRouter);

// Executa o script principal
async function main() {
  if (process.argv.includes('--dry-run')) {
    console.log('🧪 Modo dry-run ativado. Nada será salvo.');
    return;
  }

  
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  });
}

main();
