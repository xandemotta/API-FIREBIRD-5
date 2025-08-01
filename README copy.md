# API-MM

Este projeto demonstra a integracao entre o sistema Elite X (Firebird 2.5) e o sistema DNFleet utilizando Node.js. O script `api_rest.js` conecta ao banco Firebird, coleta dados de diversas tabelas e expõe num `ENDPOINT HTTP` pronto para envio ao DNFleet.

# Documentação da API

Este projeto integra o sistema **Elite X** ao **DNFleet** por meio de scripts em Node.js.
A aplicação possibilita gerar um arquivo JSON com pedidos e disponibilizar essas
informações via uma API REST simples.

## Configuração
1. Instale as dependências:
```bash
npm install
```
2. Crie um arquivo `.env` baseado em `.env.example` com as credenciais de acesso
   ao banco Firebird.

```bash
node api_rest.js
```
Para testar sem gravar, utilize o modo dry-run:
```bash
node api_rest.js --dry-run
```
O processo exibirá logs no console indicando cada etapa.

## Servidor de API
O servidor HTTP está definido em `api_rest.js`. Para iniciá-lo execute:
```bash
node api_rest.js
```
Por padrão a aplicação escuta na porta `3000` (ou definida pela variável
`PORT`).

## Endpoints
### `GET /api/health`
Retorna um JSON confirmando que a API está no ar.

### `GET /api/pedidos`
Consulta os pedidos mais recentes no banco, reunindo notas fiscais e outras
informações relacionadas. A resposta possui o formato:
```json
{
  "pedidos": [
    {
      "numeroOrdem": "...",
      "placaCavalo": "...",
      "dataOperacao": "...",
      "horaOperacao": "...",
      "localColeta": "...",
      "localEntrega": "...",
      "clienteFaturamento": "...",
      "processo": "...",
      "tipoContainer": "...",
      "container": "...",
      "motorista": "...",
      "placaCarreta1": "...",
      "placaCarreta2": "...",
      "empresa": "...",
      "tipoFrete": "...",
      "tipoCarga": "...",
      "notasFiscais": [ /* itens retornados de TABMOVTRA_NF */ ],
      "documentosFiscais": [ /* resultado da procedure DOCFISCAL_PEDIDO */ ],
      "numeroMdfe": "numero do MDF-e ou null",
      "statusMdfe": "status do MDF-e ou null"
    }
    /* ... */
  ]
}
```

### `GET /api/pedidos/homologados`
Retorna apenas os pedidos que possuem MDF-e homologado, no mesmo formato do endpoint `/api/pedidos`.

### `GET /api/pedidos_homologados`
Alias para `/api/pedidos/homologados`.

## Observações
- O projeto requer Node.js 16 ou superior e Firebird 2.5.
- O script `api_rest.js` pode ser executado para expor os dados via HTTP.
