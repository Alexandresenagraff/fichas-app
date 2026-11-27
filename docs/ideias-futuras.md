# Ideias futuras — FICHAS

## Acesso individual por senha

Ideia para implementar futuramente, ainda sem alterar os acessos atuais:

- Cada vendedor terá uma senha para acessar sua própria área.
- Cada designer terá uma senha para acessar sua própria área.
- Cada costureiro terá uma senha para acessar sua própria área.
- A área de Administração também terá acesso protegido por senha.
- Ao selecionar seu próprio nome no menu, a pessoa deverá informar sua senha pessoal antes de entrar; por exemplo, ao clicar em PALOMA, será solicitada a senha da Paloma.
- Por enquanto, solicitar senha somente para esses acessos mencionados; não ampliar a exigência para outras áreas sem definição posterior.
- Objetivo: evitar que uma pessoa consulte a área individual de outra sem autorização.
- Antes de implementar, definir com o usuário as permissões da Administração, o acesso aos pedidos compartilhados no fluxo de produção e como criar ou recuperar senhas.
- A proteção deve ser aplicada aos dados, não apenas escondendo opções no menu.

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
