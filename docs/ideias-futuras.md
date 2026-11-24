# Ideias futuras — FICHAS

## Resultados Comerciais

Criar uma segunda visão dentro de **Administração → Relatórios**, sem adicionar um novo item principal ao menu.

### Navegação proposta

```text
RELATÓRIOS

[ PRODUÇÃO ] [ COMERCIAL ]
```

- **Produção:** mantém a tela atual, seus filtros e cálculos: Vendedor, Designer, Função, Status/Prazo, distribuição do fluxo e detalhamento.
- **Comercial:** nova visão voltada ao desempenho de vendas, com filtros próprios: Mês, Ano, Vendedor e Linha.

### Dados a informar no novo pedido (implementação futura)

- Linha/categoria comercial, em uma seleção com as opções **Linha Padrão** e **Linha Ouro**;
- Valor total do pedido, exibido e salvo no formato monetário brasileiro.

### Ordem planejada no formulário de novo pedido

```text
Cliente
E-mail / telefone / código
Vendedor
Linha do pedido
Observação
Designer
Data do pedido
Data de entrega
Valor total do pedido
Salvar
```

O valor total ficará como o último campo antes de **Salvar**, conforme definido, para concluir as informações comerciais depois dos dados operacionais do pedido.
- Situação comercial, incluindo cancelamento.

### Exemplo de relatório comercial

```text
PALOMA — DEZEMBRO 2026

40 pedidos fechados
10 pedidos Linha Ouro
1 pedido cancelado

Valor total fechado: R$ 25.000,00
Ticket médio: R$ 625,00
```

### Regras para a futura implementação

- Reutilizar a ficha existente, sem criar um sistema paralelo;
- Não misturar filtros de produção com indicadores financeiros;
- Definir antes a regra para pedidos cancelados e alterações de valor;
- Manter os dados, fluxos e relatórios de produção atuais intactos.
