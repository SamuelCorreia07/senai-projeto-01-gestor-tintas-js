# Gestor Tintas
Um sistema integrado para gestão de lojas de tintas, com foco em pequenos negócios. O projeto visa unificar o controle de vendas, estoque e o processo de produção de tintas personalizadas, utilizando conceitos de IoT para garantir precisão e eficiência.

## Visão Geral do Projeto
O objetivo principal do "Gestor Tintas" é desenvolver uma solução de baixo custo para pequenas lojas de tintas automotivas, resolvendo problemas comuns como erros na pesagem manual de pigmentos e a falta de integração entre a produção e o controle de estoque e vendas.

A ideia central é conectar o sistema de gestão a uma balança de pesagem via IoT (usando um ESP32 e MQTT), permitindo a leitura em tempo real do peso dos pigmentos durante a formulação da tinta. Isso reduz desperdícios e garante a consistência do produto final, ao mesmo tempo em que automatiza a entrada de novas tintas no sistema de vendas.

## Andamento e Funcionalidades Atuais
O projeto está na fase de desenvolvimento do front-end, com a interface e todas as lógicas de negócio sendo construídas em JavaScript puro (Vanilla JS), utilizando o localStorage do navegador como banco de dados temporário.

### Módulos Implementados:
#### Dashboard
Painel principal com KPIs (Indicadores Chave de Performance) que exibem um resumo do negócio em tempo real, incluindo:

Quantidade de Produtos, Clientes, Fornecedores e Pigmentos cadastrados.

Total de Fórmulas, Vendas, Pedidos e Produções realizadas.

Alertas de produtos com baixo estoque.

#### Vendas
Registro de Vendas:

Interface de duas colunas para registrar novas vendas.

Busca de clientes com autocomplete, conectada ao cadastro de clientes.

Busca de produtos do estoque para adicionar ao carrinho da venda.

Cálculo de totais em tempo real.

Histórico de Vendas:

Lista todas as vendas realizadas.

Barra de pesquisa para filtrar vendas por cliente, data ou número do pedido.

Funcionalidade de Editar e Remover vendas do histórico.

#### Produção (Módulo Central)
##### Pigmentos:
CRUD completo para gerenciar o estoque de pigmentos.

Atributos: Nome, código, quantidade em estoque (ml) e preço (por 900ml).

A listagem exibe o estoque em Litros para melhor visualização.

##### Fórmulas:
CRUD completo para criar, visualizar, editar e excluir fórmulas de tintas.

Ao criar uma fórmula, o usuário busca e adiciona pigmentos já cadastrados no estoque.

O sistema calcula e exibe o custo total da fórmula em tempo real, com base nos pigmentos e quantidades selecionadas.

##### Produção (Simulador IoT):
Tela que simula o processo de pesagem de uma fórmula.

Controles de Iniciar, Pausar, Retomar e Finalizar Produção.

A pesagem é simulada pigmento por pigmento, com um botão "Próximo" para avançar.

Ao finalizar, o sistema abate automaticamente do estoque a quantidade exata de cada pigmento utilizado.

##### Histórico de Produção:
Lista interativa e expansível de todas as produções.

Exibe o estado ("Finalizada" ou "Não Finalizada") e o custo final.

Permite expandir cada registro para ver os detalhes dos pigmentos utilizados.

Possui a função "Retomar" para produções não finalizadas, que recarrega o processo do ponto onde parou.

#### Cadastros Gerais
Produtos: CRUD completo com lista expansível para exibir todos os detalhes (categoria, custo, fornecedor, etc.).

Clientes: CRUD completo com busca e um atributo que conta a quantidade de pedidos de cada cliente.

Fornecedores: CRUD completo com busca por múltiplos campos.

#### Pedidos
Módulo completo para registrar pedidos de compra a fornecedores.

Ao registrar um novo pedido, o sistema aumenta automaticamente o estoque dos produtos recebidos.

Possui uma tela de listagem com busca por ID, fornecedor ou data.

#### Configurações
Gerenciamento Dinâmico: Telas de CRUD para gerenciar de forma centralizada:

Formas de Pagamento: As opções criadas aqui aparecem dinamicamente na tela de Vendas.

Categorias de Produtos: As opções criadas aqui aparecem dinamicamente no formulário de Produtos.

Exportação de Dados: Funcionalidade para exportar todos os dados do sistema (produtos, clientes, fórmulas, etc.) para um arquivo JSON como forma de backup.

## Tecnologias Utilizadas
Front-End: HTML5, CSS3, JavaScript (Vanilla JS).

Arquitetura: Single Page Application (SPA) com um roteador baseado em Hash (location.hash).

Armazenamento de Dados: localStorage do navegador.

## Integração Futura Planejada
IoT com ESP32 e protocolo MQTT para comunicação com a balança.

## Cronograma do Projeto
Início Previsto: 19/08/2023

Término Previsto: 26/06/2024

Fase Atual: Desenvolvimento do Front-End e lógicas de negócio.

## Como Executar o Projeto (via servidor)
Este projeto deve ser executado em um servidor HTTP (abrir o arquivo index.html diretamente via file:// não é suportado).

Pré-requisitos (qualquer uma das opções abaixo):
- VS Code + extensão Live Server
- Node.js (npx http-server)
- Python 3 (http.server)
- PHP (servidor embutido)

Passos:
1. Clone ou faça o download deste repositório.
2. Abra a pasta do projeto em seu computador.
3. Inicie um servidor HTTP na raiz do projeto. Exemplos:
    - VS Code: clique em "Go Live" (Live Server).
    - Node.js: npx http-server . -p 5500
    - Python 3: python -m http.server 5500
    - PHP: php -S localhost:5500
4. Acesse http://localhost:5500 no navegador (Chrome, Firefox etc.).

Observação: O uso de servidor garante funcionamento correto de rotas, requisições e módulos do navegador.