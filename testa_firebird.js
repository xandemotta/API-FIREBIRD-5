const { query } = require('./services/firebirdService');

(async () => {
  try {
    console.log('🔌 Testando conexão com Firebird...');
    const resultado = await query('SELECT 1 FROM RDB$DATABASE');
    console.log('✅ Conexão bem-sucedida!');
    console.log('📥 Resultado:', resultado);
  } catch (error) {
    console.error('❌ Erro ao conectar ou consultar o banco:', error.message);
  }
})();
