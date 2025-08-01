const express = require('express');
const router = express.Router();
const { query } = require('../services/firebirdService');

router.get('/', async (req, res) => {
  try {
    console.log('🚀 Iniciando busca rápida de pedidos com MDF-e HOMOLOGADO...');

    const mdfeItemSql = `
      SELECT FIRST 500000
        i.nomovtra,
        i.noemp
      FROM TABMDFE_ITEM i
      JOIN TABMDFE m ON m.nomdfe = i.nomdfe
      WHERE m.status CONTAINING 'Homologado'
      ORDER BY i.nomovtra DESC
    `;

    console.log('🔍 Buscando MDF-es HOMOLOGADOS...');
    const itensComMdfe = await query(mdfeItemSql);
    console.log(`✅ Encontrados ${itensComMdfe.length} itens com MDF-e homologado.`);

    const result = [];

    for (const [index, item] of itensComMdfe.entries()) {
      const { nomovtra, noemp } = item;

      console.log(`\n🔄 Processando pedido #${index + 1} | NOMOVTRA: ${nomovtra} da EMPRESA: ${noemp}`);

      // Dados do pedido
      const pedidoSql = `
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
        WHERE nomovtra = ?
      `;
      const [pedido] = await query(pedidoSql, [nomovtra]);

      if (!pedido) {
        console.log('❌ Pedido não encontrado. Pulando...');
        continue;
      }

      // Notas fiscais vinculadas
      const notas = await query('SELECT * FROM TABMOVTRA_NF WHERE NOMOVTRA = ?', [nomovtra]);

      // Procedure fiscal
      const docs = await query('EXECUTE PROCEDURE DOCFISCAL_PEDIDO(?)', [nomovtra]);

      // MDF-e vinculado (refeito corretamente)
      const mdfeSql = `
        SELECT FIRST 1 m.numero, m.status
        FROM TABMDFE m
        JOIN TABMDFE_ITEM i ON i.nomdfe = m.nomdfe
        WHERE i.nomovtra = ? AND i.noemp = ?
        ORDER BY m.numero DESC
      `;
      const mdfe = await query(mdfeSql, [nomovtra, noemp]);
      console.log(`🚚 MDF-e vinculado: ${mdfe[0]?.numero || 'N/A'} | STATUS: ${mdfe[0]?.status || 'N/A'}`);

      result.push({
        numeroOrdem: pedido.nomovtra,
        placaCavalo: pedido.placacav,
        dataOperacao: pedido.data,
        horaOperacao: pedido.dataHora,
        localColeta: pedido.notermCol,
        localEntrega: pedido.notermDest,
        clienteFaturamento: pedido.nocli,
        processo: pedido.processo,
        tipoContainer: pedido.notipcont,
        container: pedido.container,
        motorista: pedido.nomot,
        placaCarreta1: pedido.placacar,
        placaCarreta2: pedido.placacar2,
        empresa: pedido.noemp,
        tipoFrete: pedido.notipfre,
        tipoCarga: pedido.notipcarga,
        notasFiscais: notas,
        documentosFiscais: docs,
        numeroMdfe: mdfe[0]?.numero || null,
        statusMdfe: mdfe[0]?.status || null
      });

      console.log(`✅ Pedido #${index + 1} processado com sucesso.`);
    }

    console.log('🏁 Finalizado. Retornando resultados...');
    res.json({ pedidos: result });
  } catch (err) {
    console.error('🔥 Erro ao buscar pedidos homologados:\n', err.stack);
    res.status(500).json({ error: 'Erro ao buscar pedidos homologados' });
  }
});

module.exports = router;
