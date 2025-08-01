const express = require('express');
const router = express.Router();
const { query } = require('../services/firebirdService');

router.get('/', async (req, res) => {
  try {
    console.log('🚀 Iniciando busca de pedidos...');

    const pedidosSql = `
    SELECT *
    FROM (
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
      ORDER BY nomovtra DESC
      ROWS 1 TO 50
    )
    ORDER BY nomovtra ASC
  `;

    console.log('📥 Executando consulta principal de pedidos...');
    
    const pedidos = await query(pedidosSql);
    console.log(`✅ ${pedidos.length} pedidos encontrados.`);

    const result = [];
    if (pedidos.length === 0) {
      console.log('❗ Nenhum pedido encontrado.');
      return res.json({ pedidos: [] });
    }
    for (const [index, pedido] of pedidos.entries()) {
      const noMovTra = pedido.nomovtra;
      console.log(`\n🔄 Processando pedido #${index + 1} | NOMOVTRA: ${noMovTra}`);

      // Notas fiscais vinculadas
      console.log('📦 Buscando notas fiscais vinculadas...');
      const notas = await query('SELECT * FROM TABMOVTRA_NF WHERE NOMOVTRA = ?', [noMovTra]);
      console.log(`🧾 ${notas.length} notas fiscais encontradas.`);

      // Procedure fiscal
      console.log('⚙️ Executando procedure DOCFISCAL_PEDIDO...');
      const docs = await query('EXECUTE PROCEDURE DOCFISCAL_PEDIDO(?)', [noMovTra]);
      console.log('📄 Resultado da procedure capturado.');

      // MDF-e vinculado
      const mdfeSql = `
        SELECT FIRST 1 m.numero, m.status
        FROM TABMDFE m
        JOIN TABMDFE_ITEM i ON i.nomdfe = m.nomdfe
        WHERE i.nomovtra = ? AND i.noemp = ?
        ORDER BY m.numero DESC
      `;
      console.log('🚚 Consultando MDF-e vinculado...');
      const mdfe = await query(mdfeSql, [noMovTra, pedido.noemp]);

      if (mdfe.length) {
        console.log(`✅ MDF-e encontrado: ${mdfe[0].numero} (Status: ${mdfe[0].status})`);
      } else {
        console.log('❌ Nenhum MDF-e vinculado.');
      }

      // Estrutura com nomes padronizados conforme escopo DNFleet
      result.push({
        numeroOrdem: pedido.nomovtra,
        placaCavalo: pedido.placacav,
        dataOperacao: pedido.data,
        horaOperacao: pedido.dataHora,
        localColeta: pedido.notermCol || null,
        localEntrega: pedido.notermDest || null,
        clienteFaturamento: pedido.nocli,
        processo: pedido.processo,
        tipoContainer: pedido.notipcont,
        container: pedido.container,
        motorista: pedido.nomot,
        placaCarreta1: pedido.placacar,
        placaCarreta2: pedido.placacar2 || null,
        empresa: pedido.noemp,
        tipoFrete: pedido.notipfre,
        tipoCarga: pedido.notipcarga,
        notasFiscais: notas,
        documentosFiscais: docs ,
        numeroMdfe: mdfe[0]?.numero || null,
        statusMdfe: mdfe[0]?.status || null
      });

      console.log(`✅ Pedido #${index + 1} processado com sucesso.`);
    }

    console.log('🏁 Finalizado. Retornando resultados...');
    res.json({ pedidos: result });
  } catch (err) {
    console.error('🔥 Erro ao buscar pedidos:\n', err.stack);
    res.status(500).json({ error: 'Erro ao buscar pedidos' });
  }
});

module.exports = router;
