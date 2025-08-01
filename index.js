const Firebird = require('node-firebird');
const fs = require('fs');
const dotenv = require('dotenv');
const camelcase = require('camelcase');

// Load environment variables
dotenv.config();

const options = {
  host: process.env.FIREBIRD_HOST,
  database: process.env.FIREBIRD_DATABASE,
  user: process.env.FIREBIRD_USER,
  password: process.env.FIREBIRD_PASSWORD,
  lowercase_keys: true,
  role: null,
  pageSize: 4096
};

// Transforma as chaves do resultado para camelCase
function toCamel(row) {
  const result = {};
  Object.keys(row).forEach(key => {
    result[camelcase(key)] = row[key];
  });
  return result;
}

// Executa query com Promessa
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    Firebird.attach(options, (err, db) => {
      if (err) return reject(err);
      db.query(sql, params, (err, result) => {
        db.detach();
        if (err) return reject(err);
        try {
          if (Array.isArray(result)) {
            resolve(result.map(toCamel));
          } else if (result) {
            resolve([toCamel(result)]);
          } else {
            resolve([]);
          }
        } catch (err) {
          reject(err);
        }
      });
    });
  });
}

// Consulta os pedidos da TABMOVTRA
async function getPedidos() {
  const sql = `
    SELECT 
      nomovtra,
      placacav,
      data,
      data_hora,
      noterm_col,
      noterm_dest,
      nocli,
      processo,
      notipcont,
      container,
      nomot,
      placacar,
      placacar2,
      noemp,
      notipfre,
      notipcarga
    FROM TABMOVTRA
  `;
  return await query(sql);
}

// Consulta as notas fiscais do pedido
async function getNotasFiscais(noMovTra) {
  const sql = `SELECT * FROM TABMOVTRA_NF WHERE NOMOVTRA = ?`;
  return await query(sql, [noMovTra]);
}

// Consulta os dados fiscais
async function getDocFiscal(noMovTra) {
  const sql = `EXECUTE PROCEDURE DOCFISCAL_PEDIDO(?)`;
  return await query(sql, [noMovTra]);
}

// Constrói o JSON com todos os dados
async function buildJson() {
  console.log('🚀 Iniciando coleta de dados...');
  const pedidos = await getPedidos();
  const result = { pedidos: [] };

  for (const pedido of pedidos) {
    const noMovTra = pedido.nomovtra;

    if (!noMovTra) {
      console.warn('⚠️ Pedido sem número de ordem. Pulando...');
      continue;
    }

    try {
      console.log(`🔍 Processando pedido ${noMovTra}...`);

      const notas = await getNotasFiscais(noMovTra);
      const docs = await getDocFiscal(noMovTra);
      const mdfe = null; // futuramente você ativa esse bichão aqui

      result.pedidos.push({
        nomovtra: pedido.nomovtra,
        placaCavalo: pedido.placacav,
        dataOperacao: pedido.data,
        horaOperacao: pedido.data_hora,
        localColeta: pedido.notermCol,
        localEntrega: pedido.noterm_dest,
        clienteFaturamento: pedido.nocli,
        processoCliente: pedido.processo,
        tipoContainer: pedido.notipcont,
        numeroContainer: pedido.container,
        cpfMotorista: pedido.nomot,
        placaCarreta1: pedido.placacar,
        placaCarreta2: pedido.placacar2,
        empresa: pedido.noemp,
        tipoFrete: pedido.notipfre,
        tipoCarga: pedido.notipcarga,
        notasFiscais: notas,
        docFiscal: docs,
        mdfe: mdfe
      });

    } catch (err) {
      console.error(`❌ Erro ao processar pedido ${noMovTra}:`, err.message);
    }
  }

  return result;
}

// Executa o script principal
async function main() {
  if (process.argv.includes('--dry-run')) {
    console.log('🧪 Modo dry-run ativado. Nada será salvo.');
    return;
  }

  try {
    const data = await buildJson();
    const jsonPath = 'dados_para_envio_dnfleet.json';
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
    console.log('✅ Arquivo JSON gerado com sucesso em:', jsonPath);
  } catch (err) {
    console.error('🔥 Falha geral ao gerar JSON:', err.message);
  }
}

main();
