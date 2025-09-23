/* =================================================================
 * ARQUIVO PRINCIPAL DA LÓGICA (script.js)
 * -----------------------------------------------------------------
 * Este arquivo controla toda a interatividade da aplicação.
 *
 * ESTRUTURA:
 * 1. UTILS: Funções pequenas e úteis (seletores, formatação, etc).
 * 2. STORE: Gerenciador do localStorage, nosso "banco de dados" no navegador.
 * 3. ROUTER: Controla a navegação entre as telas (SPA).
 * 4. COMPONENTS: Funções que criam partes reutilizáveis da UI (tabelas, formulários).
 * 5. VIEWS: Funções que renderizam cada tela principal da aplicação.
 * 6. INIT: Função que inicializa tudo quando a página carrega.
 * =================================================================*/

// ===== 1. UTILS (Funções Utilitárias) =====

/**
 * Atalho para querySelectorAll, retorna um Array.
 * Ex: $$('.btn') -> retorna todos os elementos com a classe 'btn'.
 */
const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));

/**
 * Atalho para querySelector, retorna um único elemento.
 * Ex: $('#nav') -> retorna o elemento com id 'nav'.
 */
const $ = (sel, el = document) => el.querySelector(sel);

/**
 * Formata números para o padrão de moeda brasileiro (R$).
 * Ex: currency.format(123.45) -> "R$ 123,45"
 */
const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/**
 * Gera um ID único universal (UUID). Essencial para identificar
 * cada item (produto, cliente, etc.) de forma única.
 */
const uuid = () => (crypto && crypto.randomUUID) ? crypto.randomUUID() : 'id-' + Math.random().toString(36).slice(2, 9);

/**
 * Exibe uma mensagem temporária (toast) no canto da tela.
 * É melhor que um 'alert()' porque não interrompe o usuário.
 */
function toast(msg, ms = 2200) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.style.display = 'block';
    setTimeout(() => t.style.display = 'none', ms);
}


// ===== 2. STORE (Gerenciador de Dados com localStorage) =====

const store = {
    key: 'gestao-tintas@v0.4', // Chave única para o localStorage. Mudar a versão pode ajudar em atualizações futuras.
    // Estrutura de dados padrão. Adicionamos clientes e fornecedores.
    data: { produtos: [], clientes: [], fornecedores: [], vendas: [], pedidos: [], formulas: [], pigmentos: [], producaoHistorico: [], categoriasProdutos: [] },

    // Carrega os dados. Se for a primeira vez, usa dados de exemplo.
    load() {
        try {
            const raw = localStorage.getItem(this.key);
            if (raw) {
                const loadedData = JSON.parse(raw);
                // Em vez de substituir, nós mesclamos os dados.
                // Isso garante que 'this.data' mantenha todas as chaves padrão (como producaoHistorico)
                // e apenas atualize os valores com os dados que foram carregados.
                this.data = { ...this.data, ...loadedData };
            }
        } catch (e) { console.error('Erro ao ler localStorage', e); }
        this.seedOnFirstRun();
        this.updateBadges();
    },

    // Salva os dados no localStorage e atualiza os contadores na UI.
    save() {
        localStorage.setItem(this.key, JSON.stringify(this.data));
        this.updateBadges();
    },

    // Limpa todos os dados (útil para testes).
    clear() {
        localStorage.removeItem(this.key);
        // Reseta para a estrutura padrão para evitar erros.
        this.data = { produtos: [], clientes: [], fornecedores: [], vendas: [], pedidos: [], formulas: [], pigmentos: [], producaoHistorico: [], formasPagamento: [] };
        this.save();
    },

    // Insere dados de exemplo se a aplicação for aberta pela primeira vez.
    seedOnFirstRun() {
        if ((this.data.produtos || []).length === 0) {
            this.data.produtos = [
                { id: uuid(), nome: 'Tinta PU Automotiva Branca', codigo: 'PU-BR-9000', cor: 'Branco', categoria: 'PU', preco: 189.9, custo: 120, estoqueAtual: 14, estoqueMin: 6, unidade: 'Lata 900ml', fornecedor: 'MaxiTintas' },
                { id: uuid(), nome: 'Verniz HS Alto Sólidos', codigo: 'VR-HS-500', cor: 'Transparente', categoria: 'Verniz', preco: 249.9, custo: 170, estoqueAtual: 5, estoqueMin: 4, unidade: 'Lata 1L', fornecedor: 'ClearCoat' },
            ];
        }
        if ((this.data.clientes || []).length === 0) {
            this.data.clientes = [{ id: uuid(), nome: 'Oficina TurboCar', telefone: '(11) 99999-0000', email: 'contato@turbocar.com', obs: 'Cliente antigo' }];
        }
        if ((this.data.fornecedores || []).length === 0) {
            this.data.fornecedores = [{ id: uuid(), nome: 'MaxiTintas', contato: 'Carlos', telefone: '(41) 3333-4444' }];
        }
        if ((this.data.pigmentos || []).length === 0) {
            this.data.pigmentos = [
                { id: uuid(), nome: "Pigmento Vermelho Intenso", codigo: "P-VML-01", quantidade: 5000, preco: 150.00 },
                { id: uuid(), nome: "Pigmento Branco PW6", codigo: "P-BRC-06", quantidade: 10000, preco: 95.00 },
            ];
        }
        if ((this.data.formasPagamento || []).length === 0) {
            this.data.formasPagamento = [
                { id: uuid(), nome: 'Dinheiro' },
                { id: uuid(), nome: 'PIX' },
                { id: uuid(), nome: 'Cartão de Crédito' },
                { id: uuid(), nome: 'Cartão de Débito' }
            ];
        }
        if ((this.data.categoriasProdutos || []).length === 0) {
            this.data.categoriasProdutos = [
                { id: uuid(), nome: 'Tinta PU' },
                { id: uuid(), nome: 'Tinta Poliéster' },
                { id: uuid(), nome: 'Verniz' },
                { id: uuid(), nome: 'Primer' }
            ];
        }
        this.save();
    },

    // Atualiza os números nos "badges" da barra de navegação.
    updateBadges() {
        $('#badge-produtos').textContent = (this.data.produtos || []).length;
        $('#badge-clientes').textContent = (this.data.clientes || []).length;
        $('#badge-fornecedores').textContent = (this.data.fornecedores || []).length;
    },

    // Lógica para importar produtos de um arquivo CSV (mantida do seu código).
    importProdutosArray(arr) {
        const stats = { added: 0, skipped: [] };
        arr.forEach(obj => {
            const codigo = (obj.codigo || '').toString().trim();
            if (codigo && this.data.produtos.some(p => (p.codigo || '').toString().trim().toLowerCase() === codigo.toLowerCase())) {
                stats.skipped.push(`Produto ${obj.nome || '(sem nome)'}: código repetido (${codigo})`);
                return;
            }
            const novo = { id: uuid(), nome: obj.nome || '(sem nome)', codigo, categoria: obj.categoria || '', cor: obj.cor || '', preco: Number(obj.preco) || 0, custo: Number(obj.custo) || 0, estoqueAtual: Number(obj.estoqueAtual) || 0, estoqueMin: Number(obj.estoqueMin) || 0, unidade: obj.unidade || '', fornecedor: obj.fornecedor || '' };
            this.data.produtos.push(novo);
            stats.added++;
        });
        this.save();
        return stats;
    }
};

// Helper para parse de CSV (mantido do seu código).
function parseCsv(text) {
    const lines = text.split(/\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (!lines.length) return [];
    const header = lines[0].split(',').map(h => h.trim().toLowerCase());
    const rows = lines.slice(1).map(line => {
        const cols = line.split(',').map(c => c.trim());
        const obj = {};
        header.forEach((h, i) => obj[h] = cols[i] || '');
        return obj;
    });
    return rows;
}


// ===== 3. ROUTER (Gerenciador de Navegação) =====

const routes = new Map(); // Usamos um Map para guardar a associação "nome da rota -> função que renderiza".

// Adiciona uma nova rota. Ex: addRoute('dashboard', renderDashboardView)
function addRoute(name, renderFn) {
    routes.set(name, renderFn);
}

// Função principal de navegação. É chamada quando o hash da URL muda.
function navigate() {
    const hash = location.hash || '#/dashboard';
    const name = hash.replace('#/', '').split('/')[0]; // Pega a parte principal da rota, ex: 'produtos' de '#/produtos/novo'

    // Atualiza o item de menu ativo
    $$('#nav a').forEach(a => a.classList.toggle('active', a.getAttribute('data-view') === name));

    const view = document.getElementById('view');
    const render = routes.get(name) || routes.get('dashboard'); // Se a rota não existir, vai para o dashboard.

    view.innerHTML = ''; // Limpa a tela anterior
    view.appendChild(render()); // Renderiza e anexa a nova tela.
}


// ===== 4. COMPONENTS (Partes Reutilizáveis da UI) =====

// Cria um card de KPI (Key Performance Indicator) para o dashboard.
function kpiCard(title, value, trend) {
    const el = document.createElement('div');
    el.className = 'card';
    el.innerHTML = `<h3>${title}</h3><div class="value">${value}</div>${trend ? `<div class="trend">${trend}</div>` : ''}`;
    return el;
}

// Cria uma tabela a partir de cabeçalhos e linhas de dados.
function table(headers, rows) {
    const wrap = document.createElement('div');
    wrap.className = 'table-wrap card';
    const tbl = document.createElement('table');
    const thead = document.createElement('thead');
    const thr = document.createElement('tr');
    headers.forEach(h => {
        const th = document.createElement('th');
        th.textContent = h;
        thr.appendChild(th);
    });
    thead.appendChild(thr);
    const tbody = document.createElement('tbody');
    rows.forEach(r => {
        const tr = document.createElement('tr');
        r.forEach(c => {
            const td = document.createElement('td');
            td.innerHTML = c; // Usamos innerHTML para permitir HTML dentro das células (ex: botões).
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    tbl.append(thead, tbody);
    wrap.appendChild(tbl);
    return wrap;
}

// Cria um formulário genérico para CRUD (Criar, Ler, Atualizar, Excluir).
// `config` define o título, os campos e os dados iniciais.
function genericForm(config) {
    const { title, fields, data, onSave, onCancel } = config;
    const item = data ? { ...data } : { id: uuid() };

    const el = document.createElement('div');
    el.className = 'card';

    // Gera o HTML dos campos do formulário a partir da configuração.
    const fieldsHtml = fields.map(f => {
    item[f.key] = item[f.key] ?? '';
    // SE o campo tiver a propriedade 'html', usa ela. SENÃO, cria o input padrão.
    const fieldContent = f.html 
        ? f.html 
        : `<input type="${f.type || 'text'}" value="${item[f.key]}" data-key="${f.key}" placeholder="${f.placeholder || ''}" />`;

    return `
      <div class="field" style="grid-column: span ${f.span || 6}">
        <label>${f.label}</label>
        ${fieldContent}
      </div>`;
    }).join('');


    el.innerHTML = `
    <div class="toolbar" style="justify-content:space-between; margin-bottom:10px">
      <h2 style="margin:0">${title}</h2>
      <div style="display:flex; gap:8px">
        <button class="btn secondary" data-action="cancelar">Cancelar</button>
        <button class="btn" data-action="salvar">Salvar</button>
      </div>
    </div>
    <div class="form">${fieldsHtml}</div>
  `;

    // Adiciona os listeners para os botões de salvar e cancelar.
    el.addEventListener('click', (e) => {
        const action = e.target?.dataset?.action;
        if (!action) return;

        if (action === 'cancelar') {
            onCancel(); // Executa a função de cancelamento passada na configuração.
        }
        if (action === 'salvar') {
            // Coleta os valores de todos os inputs.
            $$('[data-key]', el).forEach(input => {
                item[input.dataset.key] = input.value;
            });
            onSave(item); // Executa a função de salvamento com o item preenchido.
        }
    });

    return el;
}

// ===== 5. VIEWS (Renderizadores de cada tela) =====


// --- TELA: Dashboard ---
addRoute('dashboard', () => {
    const root = document.createElement('div');
    
    root.innerHTML = `<h1>Dashboard</h1>`;
    const cards = document.createElement('div');
    cards.className = 'grid cards dashboard'; // A classe 'cards' responsiva
    // Cálculos específicos para o dashboard
    const totalEstoqueProdutos = store.data.produtos.reduce((acc, p) => acc + (Number(p.estoqueAtual) || 0), 0);
    const baixoEstoqueProdutos = store.data.produtos.filter(p => Number(p.estoqueAtual) <= Number(p.estoqueMin)).length;

    // --- Montagem dos Cards ---
    cards.append(
        kpiCard('Produtos Cadastrados', (store.data.produtos || []).length),
        kpiCard('Itens em Estoque (Produtos)', totalEstoqueProdutos),
        kpiCard('Produtos com Baixo Estoque', baixoEstoqueProdutos, baixoEstoqueProdutos ? `<span class="badge-warn">Atenção</span>` : '<span class="badge-soft">OK</span>'),
        kpiCard('Total de Vendas', (store.data.vendas || []).length),
        kpiCard('Clientes Cadastrados', (store.data.clientes || []).length),
        kpiCard('Fornecedores Cadastrados', (store.data.fornecedores || []).length),
        kpiCard('Tintas Produzidas', (store.data.producaoHistorico || []).length),
        kpiCard('Fórmulas Cadastradas', (store.data.formulas || []).length),
        kpiCard('Pigmentos Cadastrados', (store.data.pigmentos || []).length),
        kpiCard('Total de Pedidos', (store.data.pedidos || []).length)
    );
    
    root.appendChild(cards);
    return root;
});


// --- TELA: Vendas (Container com Abas) ---
addRoute('vendas', () => {
    const root = document.createElement('div');
    const hashParts = location.hash.split('/'); // Ex: ['#', 'vendas', 'editar', 'ID_DA_VENDA']
    const subView = hashParts[2] || 'registrar'; // A sub-view é 'registrar', 'historico' ou 'editar'

    // Deixamos a aba "Registrar Venda" ativa tanto para criar uma nova quanto para editar.
    const isRegisterActive = subView === 'registrar' || subView === 'editar';

    root.innerHTML = `
        <div class="tabs">
            <a href="#/vendas/registrar" data-subview="registrar" class="tab ${isRegisterActive ? 'active' : ''}">Registrar Venda</a>
            <a href="#/vendas/historico" data-subview="historico" class="tab ${subView === 'historico' ? 'active' : ''}">Histórico de Vendas</a>
        </div>
        <div id="vendas-content"></div>
    `;

    const content = root.querySelector('#vendas-content');

    // Se a sub-view for 'editar', encontramos a venda e passamos para o formulário.
    if (subView === 'editar') {
        const saleId = hashParts[3]; // O ID da venda é a 4ª parte da URL
        const saleToEdit = store.data.vendas.find(v => v.id === saleId);
        content.appendChild(renderRegistrarVendas(saleToEdit)); // Passamos a venda para a função de renderização
    } else if (subView === 'registrar') {
        content.appendChild(renderRegistrarVendas()); // Chamamos sem argumentos para um formulário limpo
    } else if (subView === 'historico') {
        content.appendChild(renderHistoricoVendas());
    }

    return root;
});

/**
 * Renderiza a tela de "Registrar Venda".
 * Agora ela permite adicionar múltiplos formulários de venda na mesma tela.
 */

/**
 * Renderiza a tela de "Registrar Venda".
 * @param {object} saleToEdit - (Opcional) A venda a ser editada.
 */
function renderRegistrarVendas(saleToEdit) {
    const root = document.createElement('div');

    // Se estamos editando, não mostramos o botão "Adicionar Outra Venda"
    // para manter a interface focada na edição de um único item.
    const addButtonHtml = !saleToEdit
        ? `<div class="toolbar" style="margin-top: 24px; padding-top: 16px; border-top: 1px dashed var(--border); justify-content: center;">
               <button class="btn secondary" id="add-sale-btn">Adicionar Venda</button>
           </div>`
        : '';

    root.innerHTML = `
        <div id="sales-container" style="display: flex; flex-direction: column; gap: 24px;"></div>
        ${addButtonHtml}
    `;

    const salesContainer = root.querySelector('#sales-container');
    // Passamos a venda a ser editada para o componente do formulário
    salesContainer.appendChild(createSaleComponent(saleToEdit));

    // O botão de adicionar só existe se não estivermos editando
    const addButton = root.querySelector('#add-sale-btn');
    if (addButton) {
        addButton.addEventListener('click', () => {
            salesContainer.appendChild(createSaleComponent());
        });
    }

    return root;
}


/**
 * Cria um componente de venda, seja para uma nova venda ou para editar uma existente.
 * @param {object} saleToEdit - (Opcional) A venda a ser editada.
 */
function createSaleComponent(saleToEdit) {
    // 1. VERIFICAÇÃO DO MODO: Esta variável controla se o formulário é para 'editar' ou 'criar'.
    const isEditing = !!saleToEdit; // !! transforma o objeto em booleano (true se existir, false se não)
    const componentRoot = document.createElement('div');
    componentRoot.className = 'vendas-grid';

    // 2. CARREGAMENTO DE ITENS: Se 'isEditing' for true, a lista de itens já começa
    // com os produtos da venda que estamos editando. Senão, começa vazia.
    let itens = isEditing ? JSON.parse(JSON.stringify(saleToEdit.itens)) : [];

    // Guardamos o ID do cliente selecionado.
    let selectedClientId = isEditing ? saleToEdit.clientId : null;

    // Buscamos as formas de pagamento do store.
    const formasDePagamento = store.data.formasPagamento || [];

    // Criamos o HTML das <options> dinamicamente.
    const paymentOptionsHtml = formasDePagamento.map(f => 
        `<option value="${f.nome}">${f.nome}</option>`
    ).join('');


    // 3. PRÉ-PREENCHIMENTO DO FORMULÁRIO: Os atributos 'value' dos inputs agora
    // tentam pegar os dados de 'saleToEdit'. Se não existir, usam um valor padrão.
    // A sintaxe 'saleToEdit?.cliente' (optional chaining) previne erros se 'saleToEdit' for nulo.
    componentRoot.innerHTML = `
        <div class="card">
            <div class="toolbar" style="justify-content:space-between; margin-bottom:10px">
                <h2 style="margin:0">${isEditing ? 'Editar Venda' : 'Registrar Venda'}</h2>
            </div>
            <div class="form">
                <div class="field" style="grid-column: span 3"><label>Nº Pedido</label><input data-field="numeroPedido" value="${saleToEdit?.numeroPedido || ''}" placeholder="Opcional" /></div>
                
                <div class="field autocomplete-container" style="grid-column: span 6">
                    <label>Cliente</label>
                    <input data-field="cliente" value="${saleToEdit?.cliente || ''}" placeholder="Digite para buscar ou deixe em branco" autocomplete="off" />
                    <div class="autocomplete-results"></div>
                </div>

                <div class="field" style="grid-column: span 3"><label>Data</label><input data-field="data" type="date" value="${saleToEdit?.data || new Date().toISOString().slice(0, 10)}"/></div>
                
                <div class="field full"><label>Itens</label>
                    <div data-container="lista-itens" class="grid" style="gap:8px; margin-top:8px; border:1px dashed var(--border); padding:10px; border-radius:10px; min-height:80px;"></div>
                </div>

                <div class="field" style="grid-column: span 3"><label>Pagamento</label><select data-field="pagamento" value="${saleToEdit?.pagamento || formasDePagamento[0]?.nome || ''}">${paymentOptionsHtml}</select></div>
                <div class="field" style="grid-column: span 3"><label>Desconto (R$)</label><input data-field="desconto" type="number" step="0.01" value="${saleToEdit?.desconto || 0}" /></div>
                <div class="field" style="grid-column: span 3"><label>Subtotal</label><input data-field="subtotal" disabled /></div>
                <div class="field" style="grid-column: span 3"><label>Total</label><input data-field="total" disabled /></div>

                <button class="btn" data-action="finalizar" style="grid-column: 1 / -1; margin-top:12px;">${isEditing ? 'Salvar Alterações' : 'Finalizar'}</button>
            </div>
        </div>
        <div class="card vendas-right">
             <div><label>Pesquisar Produtos</label><input data-action="search-product" placeholder="Digite nome ou código e pressione Enter" style="width:100%; margin-top:8px;" /></div>
             <div data-container="search-results" class="prod-search-results"></div>
        </div>
    `;

    const listaItensEl = componentRoot.querySelector('[data-container="lista-itens"]');

    const calcTotais = () => {
        const sub = itens.reduce((a, i) => a + (Number(i.preco) || 0) * (Number(i.qtd) || 0), 0);
        componentRoot.querySelector('[data-field="subtotal"]').value = currency.format(sub);
        const desc = Number(componentRoot.querySelector('[data-field="desconto"]').value || 0);
        componentRoot.querySelector('[data-field="total"]').value = currency.format(Math.max(0, sub - desc));
    };

    // A renderização da lista de itens foi restaurada para a versão mais detalhada.
    const renderItens = () => {
        listaItensEl.innerHTML = '';
        if (!itens.length) {
            listaItensEl.innerHTML = `<div class="muted" style="text-align:center;width:100%;">Pesquise e adicione produtos...</div>`;
            calcTotais();
            return;
        }
        itens.forEach((it, idx) => {
            const row = document.createElement('div');
            row.className = 'toolbar';
            row.style.border = '1px solid var(--border)';
            row.style.borderRadius = '10px';
            row.style.padding = '8px 10px';
            row.innerHTML = `
                <div style="flex:1">${it.nome} <small style="color:var(--muted)">(${it.codigo || '—'})</small></div>
                <div>Qtd <input type="number" min="1" value="${it.qtd}" data-i="${idx}" data-f="qtd" style="width:72px; margin-left:6px" /></div>
                <div>Preço <input type="number" step="0.01" value="${it.preco}" data-i="${idx}" data-f="preco" style="width:100px; margin-left:6px" /></div>
                <button class="btn ghost" data-i="${idx}" data-act="rm">Remover</button>
            `;
            listaItensEl.appendChild(row);
        });
        calcTotais();
    };

    // Função interna para adicionar produto, garantindo que o código seja salvo no item.
    function addProductToSale(prod, quantidade = 1) {
        const existing = itens.find(i => i.id === prod.id);
        if (existing) {
            existing.qtd = Number(existing.qtd) + Number(quantidade);
        } else {
            itens.push({ id: prod.id, nome: prod.nome, codigo: prod.codigo, preco: Number(prod.preco) || 0, qtd: Number(quantidade) || 1 });
        }
        renderItens();
    }

    const clienteInput = componentRoot.querySelector('[data-field="cliente"]');
    const resultsContainer = componentRoot.querySelector('.autocomplete-results');

    clienteInput.addEventListener('input', () => {
        const query = clienteInput.value.toLowerCase().trim();
        resultsContainer.innerHTML = ''; // Limpa resultados anteriores

        // Se o campo estiver vazio, não selecionamos nenhum cliente
        if (!query) {
            selectedClientId = null;
            return;
        }

        // Filtra os clientes que correspondem à busca
        const results = store.data.clientes.filter(c => c.nome.toLowerCase().includes(query));

        results.forEach(cliente => {
            const itemEl = document.createElement('div');
            itemEl.className = 'autocomplete-item';
            itemEl.textContent = cliente.nome;
            itemEl.dataset.id = cliente.id; // Guarda o ID no elemento
            resultsContainer.appendChild(itemEl);
        });
    });

    // Listener para o clique em um dos resultados
    resultsContainer.addEventListener('click', e => {
        if (e.target.classList.contains('autocomplete-item')) {
            const clienteId = e.target.dataset.id;
            const cliente = store.data.clientes.find(c => c.id === clienteId);
            if (cliente) {
                clienteInput.value = cliente.nome; // Preenche o input com o nome
                selectedClientId = cliente.id;   // Guarda o ID do cliente selecionado
                resultsContainer.innerHTML = ''; // Limpa e esconde a lista
            }
        }
    });

    // Listener de pesquisa de produto
    componentRoot.querySelector('[data-action="search-product"]').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const q = e.target.value.toLowerCase().trim();
            const results = store.data.produtos.filter(p => (p.nome || '').toLowerCase().includes(q) || (p.codigo || '').toLowerCase().includes(q));
            const wrap = componentRoot.querySelector('[data-container="search-results"]');
            wrap.innerHTML = '';
            if (!results.length) {
                wrap.innerHTML = '<div class="empty">Nenhum produto encontrado</div>';
                return;
            }
            // A renderização dos resultados da pesquisa foi restaurada para a versão mais detalhada.
            results.forEach(p => {
                const row = document.createElement('div');
                row.className = 'prod-row search-result';
                row.innerHTML = `
                    <div>
                        <strong>${p.nome}</strong>
                        <div style="font-size:12px;color:var(--muted)">${p.codigo || '—'} • ${p.unidade || ''} • ${currency.format(Number(p.preco || 0))}</div>
                    </div>
                    <div style="display:flex; gap:8px; align-items-center; justify-content: flex-end;">
                        <input type="number" min="1" value="1" class="qtd-add" style="width:64px" />
                        <button class="btn" data-id="${p.id}">Adicionar</button>
                    </div>
                `;
                wrap.appendChild(row);
                row.querySelector('button').addEventListener('click', () => {
                    const qEl = row.querySelector('.qtd-add');
                    const qtd = Number(qEl.value || 1);
                    addProductToSale(p, qtd);
                });
            });
        }
    });


    // Lógica de eventos (finalizar, remover, alterar campos)
    componentRoot.addEventListener('click', (e) => {
        const target = e.target;
        const action = target.dataset.action; // Para o botão 'finalizar'
        const act = target.dataset.act;       // Para o botão 'remover'

        // Lógica para finalizar a venda
        if (action === 'finalizar') {
            const updatedSaleData = {
                id: saleToEdit?.id || uuid(),
                numeroPedido: componentRoot.querySelector('[data-field="numeroPedido"]').value || `P-${Date.now().toString().slice(-6)}`,
                data: componentRoot.querySelector('[data-field="data"]').value,
                cliente: componentRoot.querySelector('[data-field="cliente"]').value || 'Consumidor Final',
                pagamento: componentRoot.querySelector('[data-field="pagamento"]').value,
                itens: itens,
                subtotal: itens.reduce((a, i) => a + (i.preco * i.qtd), 0),
                desconto: Number(componentRoot.querySelector('[data-field="desconto"]').value || 0),
                total: 0,
                clientId: selectedClientId
            };
            updatedSaleData.total = Math.max(0, updatedSaleData.subtotal - updatedSaleData.desconto);

            if (isEditing) {
                const index = store.data.vendas.findIndex(v => v.id === updatedSaleData.id);
                if (index !== -1) {
                    store.data.vendas[index] = updatedSaleData;
                    toast('Venda atualizada com sucesso!');
                }
            } else {
                if (selectedClientId) {
                    const cliente = store.data.clientes.find(c => c.id === selectedClientId);
                    if (cliente) {
                        cliente.quantidadePedidos = (cliente.quantidadePedidos || 0) + 1;
                    }
                }
                store.data.vendas.push(updatedSaleData);
                toast(`Venda ${updatedSaleData.numeroPedido} registrada.`);
            }

            store.save();
            location.hash = '#/vendas/historico';
        }

        // Lógica para remover um item da lista
        if (act === 'rm') {
            itens.splice(Number(target.dataset.i), 1);
            renderItens();
        }
    });

    // Listener para qualquer input (alteração de quantidade, preço, etc.)
    componentRoot.addEventListener('input', (e) => {
        const el = e.target;
        // Verifica se o input alterado é de um item da lista (qtd ou preço)
        if (el.dataset.i && el.dataset.f) {
            itens[Number(el.dataset.i)][el.dataset.f] = el.value;
        }
        calcTotais();
    });
    renderItens();

    return componentRoot;
}

/**
 * Renderiza a tela de "Histórico de Vendas".
 * Inclui listagem, exclusão e pesquisa.
 */
function renderHistoricoVendas() {
    const root = document.createElement('div');
    root.innerHTML = `
        <div class="toolbar card" style="padding: 12px; margin-bottom: 16px;">
            <input id="search-historico" type="text" placeholder="Pesquisar por cliente, pedido ou data (AAAA-MM-DD)..." style="flex: 1;">
        </div>
        <div id="historico-table-container"></div>
    `;

    const container = root.querySelector('#historico-table-container');

    const renderTable = (vendas) => {
        container.innerHTML = ''; // Limpa antes de renderizar

        if (!vendas.length) {
            container.innerHTML = `<div class="empty card">Nenhuma venda encontrada.</div>`;
            return;
        }

        const headers = ['Nº Pedido', 'Data', 'Cliente', 'Total', 'Itens', ''];
        const rows = vendas.map(v => [
            v.numeroPedido,
            new Date(v.data + 'T03:00:00Z').toLocaleDateString('pt-BR'), // Ajuste de fuso
            v.cliente,
            currency.format(v.total),
            v.itens.length,
            `<div class="actions">
                <button class="btn secondary" data-act="edit" data-id="${v.id}">Editar</button>
                <button class="btn danger" data-act="del" data-id="${v.id}">Excluir</button>
            </div>`
        ]);

        const tbl = table(headers, rows);
        container.appendChild(tbl);

        // Adiciona listeners para os botões da tabela
        tbl.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-act]');
            if (!btn) return;
            const id = btn.dataset.id;

            if (btn.dataset.act === 'del') {
                if (confirm('Deseja mesmo excluir esta venda? Esta ação não pode ser desfeita.')) {
                    store.data.vendas = store.data.vendas.filter(venda => venda.id !== id);
                    store.save();
                    toast('Venda excluída.');
                    // Re-renderiza a tabela com os dados atualizados
                    filterAndRender();
                }
            }

            if (btn.dataset.act === 'edit') {
                // Agora, ao clicar em "Editar", nós mudamos a URL (hash) para a rota de edição,
                // passando o ID único da venda no final.
                // Exemplo: #/vendas/editar/id-a1b2c3d4
                location.hash = `#/vendas/editar/${id}`;
            }
        });
    };

    const filterAndRender = () => {
        const query = root.querySelector('#search-historico').value.toLowerCase().trim();
        const todasVendas = store.data.vendas;

        if (!query) {
            renderTable(todasVendas);
            return;
        }

        const vendasFiltradas = todasVendas.filter(v =>
            v.cliente.toLowerCase().includes(query) ||
            v.data.includes(query) ||
            v.numeroPedido.toLowerCase().includes(query)
        );

        renderTable(vendasFiltradas);
    };

    // Listener para o campo de busca
    root.querySelector('#search-historico').addEventListener('input', filterAndRender);

    // Renderização inicial
    filterAndRender();

    return root;
}

// --- TELA: Produção (Container com Abas) ---
addRoute('producao', () => {
    const root = document.createElement('div');
    const subView = location.hash.split('/')[2] || 'em-producao';

    root.innerHTML = `
        <div class="tabs">
            <a href="#/producao/em-producao" class="tab ${subView === 'em-producao' ? 'active' : ''}">Produção</a>
            <a href="#/producao/historico" class="tab ${subView === 'historico' ? 'active' : ''}">Histórico de Produção</a>
            <a href="#/producao/formulas" class="tab ${subView === 'formulas' ? 'active' : ''}">Fórmulas</a>
            <a href="#/producao/criar" class="tab ${['criar', 'editar-formula'].includes(subView) ? 'active' : ''}">Criar/Editar Fórmula</a>
            <a href="#/producao/pigmentos" class="tab ${['pigmentos', 'criar-pigmento', 'editar-pigmento'].includes(subView) ? 'active' : ''}">Pigmentos</a>
        </div>
        <div id="producao-content"></div>
    `;

    const content = root.querySelector('#producao-content');

    // Roteador interno da seção "Produção"
    if (subView === 'pigmentos') {
        content.appendChild(renderPigmentosListView());
    } else if (subView === 'criar-pigmento' || subView === 'editar-pigmento') {
        const pigmentoId = location.hash.split('/')[3];
        const pigmentoToEdit = store.data.pigmentos.find(p => p.id === pigmentoId);
        content.appendChild(renderCriarPigmentoView(pigmentoToEdit));
    } else if (subView === 'criar' || subView === 'editar-formula') {
        const formulaId = location.hash.split('/')[3];
        const formulaToEdit = store.data.formulas.find(f => f.id === formulaId);
        content.appendChild(renderCriarFormulaView(formulaToEdit));
    } else if (subView === 'formulas') {
        content.appendChild(renderFormulasListView());
    } else if (subView === 'historico') {
        content.appendChild(renderHistoricoProducaoView());
    } else { // 'em-producao' é o padrão
        content.appendChild(renderEmProducaoView());
    }

    return root;
});


/**
 * Aba "Pigmentos" (Listagem)
 */
function renderPigmentosListView() {
    const root = document.createElement('div');
    root.innerHTML = `
        <div class="toolbar" style="margin-bottom:16px;">
            <h2 style="margin:0;">Estoque de Pigmentos</h2>
            <div class="spacer"></div>
            <button class="btn" onclick="location.hash='#/producao/criar-pigmento'">Novo Pigmento</button>
        </div>
        <div class="card" style="padding: 12px; margin-bottom: 16px;">
            <input id="search-pigmentos" type="text" placeholder="Pesquisar por nome ou código do pigmento...">
        </div>
        <div id="pigmentos-list-container"></div>
    `;

    const container = root.querySelector('#pigmentos-list-container');
    const searchInput = root.querySelector('#search-pigmentos');

    const renderTable = (pigmentos) => {
        container.innerHTML = '';
        if (!pigmentos.length) {
            container.innerHTML = `<div class="empty card">Nenhum pigmento encontrado.</div>`;
            return;
        }
        const headers = ['Nome', 'Código', 'Estoque (Litros)', 'Preço (por 900ml)', ''];
        const rows = pigmentos.map(p => [
            p.nome,
            p.codigo,
            `${(p.quantidade / 1000).toFixed(2)} L`,
            currency.format(p.preco),
            `<div class="actions">
                <button class="btn secondary" data-act="editar" data-id="${p.id}">Editar</button>
                <button class="btn danger" data-act="excluir" data-id="${p.id}">Excluir</button>
            </div>`
        ]);
        const tbl = table(headers, rows);
        container.appendChild(tbl);

        tbl.addEventListener('click', e => {
            const btn = e.target.closest('button[data-act]');
            if (!btn) return;
            const id = btn.dataset.id;
            if (btn.dataset.act === 'excluir') {
                if (confirm('Deseja realmente excluir este pigmento?')) {
                    store.data.pigmentos = store.data.pigmentos.filter(p => p.id !== id);
                    store.save();
                    filterAndRender();
                }
            }
            if (btn.dataset.act === 'editar') {
                location.hash = `#/producao/editar-pigmento/${id}`;
            }
        });
    };

    const filterAndRender = () => {
        const query = searchInput.value.toLowerCase().trim();
        const todosPigmentos = store.data.pigmentos || [];

        const pigmentosFiltrados = query
            ? todosPigmentos.filter(p =>
                p.nome.toLowerCase().includes(query) ||
                (p.codigo || '').toLowerCase().includes(query)
            )
            : todosPigmentos;

        renderTable(pigmentosFiltrados);
    };

    searchInput.addEventListener('input', filterAndRender);
    filterAndRender();
    return root;
}


/**
 * Aba "Criar/Editar Pigmento"
 */
function renderCriarPigmentoView(pigmentoToEdit) {
    const isEditing = !!pigmentoToEdit;

    // Usamos nosso formulário genérico para simplificar
    const config = {
        title: isEditing ? 'Editar Pigmento' : 'Novo Pigmento',
        data: pigmentoToEdit,
        fields: [
            { key: 'nome', label: 'Nome do Pigmento', span: 6 },
            { key: 'codigo', label: 'Código', span: 6 },
            { key: 'quantidade', label: 'Quantidade em Estoque (ml)', type: 'number', span: 6, placeholder: 'Ex: 5000 para 5L' },
            { key: 'preco', label: 'Preço (por 900ml)', type: 'number', span: 6, placeholder: 'Custo para uma lata base' },
        ],
        onSave: (item) => {
            // Converte os valores para número para garantir consistência
            item.quantidade = Number(item.quantidade);
            item.preco = Number(item.preco);

            if (isEditing) {
                const index = store.data.pigmentos.findIndex(p => p.id === item.id);
                store.data.pigmentos[index] = item;
            } else {
                store.data.pigmentos.push(item);
            }
            store.save();
            toast('Pigmento salvo com sucesso!');
            location.hash = '#/producao/pigmentos';
        },
        onCancel: () => location.hash = '#/producao/pigmentos'
    };

    return genericForm(config);
}

/**
 * Aba "Criar/Editar Fórmula"
 * @param {object} formulaToEdit - A fórmula a ser editada (opcional).
 */
function renderCriarFormulaView(formulaToEdit) {
    const isEditing = !!formulaToEdit;
    const root = document.createElement('div');
    root.className = 'formula-grid';

    // A variável que guarda os pigmentos da fórmula.
    let pigmentosDaFormula = isEditing ? JSON.parse(JSON.stringify(formulaToEdit.pigmentos)) : [];

    // Função central para calcular e exibir o custo total da fórmula.
    function calcularEExibirCustoTotal() {
        const totalEl = root.querySelector('#formula-valor-total');
        if (!totalEl) return;

        // Usamos .reduce() para somar o custo de cada pigmento na fórmula.
        const valorTotal = pigmentosDaFormula.reduce((acc, p) => {
            const pigmentoBase = store.data.pigmentos.find(base => base.id === p.id);
            if (!pigmentoBase || !pigmentoBase.preco) {
                return acc; // Se o pigmento não for encontrado ou não tiver preço, não soma nada.
            }
            // Calcula o custo para a quantidade de ml usada na fórmula.
            const custoDoPigmento = (pigmentoBase.preco / 900) * p.ml;
            return acc + custoDoPigmento;
        }, 0); // O '0' é o valor inicial da soma.

        totalEl.textContent = currency.format(valorTotal);
    }

    // Função interna que desenha a lista de pigmentos na tela.
    function renderPigmentosNaFormula() {
        const container = root.querySelector('#pigmentos-formula-container');
        container.innerHTML = '';

        // O 'if' e o 'forEach' agora usam a variável correta: 'pigmentosDaFormula'
        if (!pigmentosDaFormula.length) {
            container.innerHTML = '<div class="muted" style="text-align:center;">Busque e adicione pigmentos à fórmula.</div>';
        } else {
            pigmentosDaFormula.forEach((p, index) => {
                const row = document.createElement('div');
                // Usamos a classe base e a modificadora para o layout correto de 5 colunas
                row.className = 'pigmento-row pigmento-row--formula';

                const pigmentoBase = store.data.pigmentos.find(base => base.id === p.id);
                let custoDoPigmentoHtml = 'Preço indisponível';
                if (pigmentoBase && pigmentoBase.preco) {
                    const custo = (pigmentoBase.preco / 900) * p.ml;
                    custoDoPigmentoHtml = currency.format(custo);
                }

                // O HTML da linha agora está completo, com 5 colunas de conteúdo
                row.innerHTML = `
                    <div class="pigmento-nome">${p.nome} <small>(${p.codigo})</small></div>
                    <div class="pigmento-valor">
                        <input type="number" min="0.01" step="0.01" data-index="${index}" data-key="ml" value="${p.ml || 0}" style="width: 80px; text-align: right;" />
                    </div>
                    <div class="pigmento-total">ml</div>
                    <div class="pigmento-preco" style="font-weight: 500;">${custoDoPigmentoHtml}</div>
                    <div class="pigmento-acao">
                        <button class="btn danger" data-action="remove-pigmento" data-index="${index}">Remover</button>
                    </div>
                `;
                container.appendChild(row);
            });
        }

        // A chamada para calcular o custo total é feita aqui, após a lista ser redesenhada
        calcularEExibirCustoTotal();
    }

    // HTML principal da tela.
    // Dividimos o conteúdo em duas colunas: 'leftColumnHtml' e 'rightColumnHtml'.

    // Coluna da esquerda: Formulário da fórmula e lista de pigmentos na fórmula.
    const leftColumnHtml = `
        <div class="card">
            <div class="toolbar" style="justify-content:space-between; margin-bottom:10px;">
                <h2 style="margin:0">${isEditing ? 'Editar Fórmula' : 'Criar Nova Fórmula'}</h2>
                <button class="btn" data-action="salvar-formula">Salvar Fórmula</button>
            </div>
            <div class="form">
                <div class="field" style="grid-column: span 5"><label>Nome da Fórmula</label><input id="f-nome" value="${formulaToEdit?.nome || ''}"></div>
                <div class="field" style="grid-column: span 3"><label>Código</label><input id="f-codigo" value="${formulaToEdit?.codigo || ''}"></div>
                <div class="field" style="grid-column: span 2"><label>Base (ml)</label><input id="f-base" type="number" value="${formulaToEdit?.base || 900}"></div>
                <div class="field" style="grid-column: span 2; text-align: right;">
                    <label>Valor Total da Fórmula</label>
                    <div id="formula-valor-total" style="font-size: 1.5em; font-weight: 600; color: var(--primary);">${currency.format(0)}</div>
                </div>
            </div>

            <div class="toolbar" style="margin-top:20px; border-top:1px solid var(--border); padding-top:10px;">
                <h3>Pigmentos na Fórmula</h3>
            </div>
            <div id="pigmentos-formula-container" style="display:flex; flex-direction:column; gap:8px; margin-top:10px;">
                </div>
        </div>
    `;

    // Coluna da direita: Busca e adição de pigmentos.
    const rightColumnHtml = `
        <div class="card">
            <label>Adicionar Pigmento à Fórmula</label>
            <input id="pigmento-search" placeholder="Digite o nome ou código do pigmento..." style="width:100%; margin-top:8px;">
            <div id="pigmento-search-results" style="margin-top:8px;"></div>
        </div>
    `;

    // Juntamos as duas colunas dentro do elemento raiz 'root'.
    root.innerHTML = `
        <div>${leftColumnHtml}</div>
        <div>${rightColumnHtml}</div>
    `;

    // Chamada inicial para desenhar a lista (importante para o modo de edição).
    renderPigmentosNaFormula();

    // Listener para o campo de busca de pigmentos.
    root.querySelector('#pigmento-search').addEventListener('input', e => {
        const query = e.target.value.toLowerCase().trim();
        const resultsContainer = root.querySelector('#pigmento-search-results');
        resultsContainer.innerHTML = '';
        if (query.length < 2) return;

        const results = store.data.pigmentos.filter(p => p.nome.toLowerCase().includes(query) || p.codigo.toLowerCase().includes(query));
        results.forEach(p => {
            const row = document.createElement('div');
            row.className = 'prod-row search-result';
            row.innerHTML = `<div><strong>${p.nome}</strong> <small>(${p.codigo})</small></div><button class="btn secondary" data-id="${p.id}">Adicionar</button>`;
            row.querySelector('button').addEventListener('click', () => {
                if (pigmentosDaFormula.some(pf => pf.id === p.id)) {
                    toast('Este pigmento já está na fórmula.');
                    return;
                }
                // Adiciona o pigmento selecionado à lista da fórmula.
                pigmentosDaFormula.push({ id: p.id, nome: p.nome, codigo: p.codigo, ml: 0 });
                // E o mais importante: chama a função para redesenhar a lista na tela.
                renderPigmentosNaFormula();
                resultsContainer.innerHTML = ''; // Limpa os resultados
                e.target.value = ''; // Limpa o campo de busca
            });
            resultsContainer.appendChild(row);
        });
    });

    // Listener para as ações de salvar, remover, etc.
    root.addEventListener('click', e => {
        const action = e.target.dataset.action;
        if (action === 'remove-pigmento') {
            pigmentosDaFormula.splice(e.target.dataset.index, 1);
            renderPigmentosNaFormula();
        }
        if (action === 'salvar-formula') {
            const valorTotalCalculado = pigmentosDaFormula.reduce((acc, p) => {
                const pigmentoBase = store.data.pigmentos.find(base => base.id === p.id);
                return acc + (pigmentoBase ? (pigmentoBase.preco / 900) * p.ml : 0);
            }, 0);

            const formula = {
                id: formulaToEdit?.id || uuid(),
                nome: root.querySelector('#f-nome').value,
                codigo: root.querySelector('#f-codigo').value,
                base: Number(root.querySelector('#f-base').value) || 900,
                unidade: "ml",
                pigmentos: pigmentosDaFormula,
                valorTotal: valorTotalCalculado
            };
            if (!formula.nome || !formula.pigmentos.length) {
                alert('O nome da fórmula e ao menos um pigmento são obrigatórios.');
                return;
            }
            if (isEditing) {
                const index = store.data.formulas.findIndex(f => f.id === formula.id);
                store.data.formulas[index] = formula;
            } else {
                store.data.formulas.push(formula);
            }
            store.save();
            toast('Fórmula salva com sucesso!');
            location.hash = '#/producao/formulas';
        }
    });

    // Listener para atualizar a quantidade de 'ml' e os preços em tempo real.
    root.addEventListener('input', e => {
        const { key, index } = e.target.dataset;
        // Verifica se o input alterado foi um campo de 'ml'
        if (key === 'ml' && index !== undefined) {
            // 1. Atualiza o dado na memória, como antes.
            pigmentosDaFormula[index].ml = Number(e.target.value) || 0;

            // 2. Encontra a linha específica (o elemento <div> pai) que está sendo editada.
            const row = e.target.closest('.pigmento-row');
            if (!row) return; // Se não encontrar a linha, não faz nada.

            // 3. Encontra o elemento do preço APENAS nessa linha.
            const precoEl = row.querySelector('.pigmento-preco');
            const pigmentoBase = store.data.pigmentos.find(base => base.id === pigmentosDaFormula[index].id);

            // 4. Recalcula e atualiza o preço APENAS daquela linha.
            if (precoEl && pigmentoBase && pigmentoBase.preco) {
                const custo = (pigmentoBase.preco / 900) * pigmentosDaFormula[index].ml;
                precoEl.textContent = currency.format(custo);
            }

            // 5. Recalcula e atualiza o total geral (esta função já existe e só atualiza o total).
            calcularEExibirCustoTotal();
        }
    });

    return root;
}


/**
 * Aba "Fórmulas" (Listagem)
 */
function renderFormulasListView() {
    const root = document.createElement('div');
    root.innerHTML = `
        <div class="toolbar" style="margin-bottom:16px;">
            <h2 style="margin:0;">Fórmulas Cadastradas</h2>
            <div class="spacer"></div>
            <button class="btn" onclick="location.hash='#/producao/criar'">Nova Fórmula</button>
        </div>
        <div class="card" style="padding: 12px; margin-bottom: 16px;">
            <input id="search-formulas" type="text" placeholder="Pesquisar por nome ou código da fórmula...">
        </div>
        <div id="formulas-list-container"></div>
    `;

    const formulasContainer = root.querySelector('#formulas-list-container');
    const searchInput = root.querySelector('#search-formulas');
    formulasContainer.className = 'card';

    const renderList = (formulas) => {
        formulasContainer.innerHTML = '';
        if (!formulas.length) {
            formulasContainer.innerHTML = `<div class="empty card">Nenhuma fórmula encontrada.</div>`;
            return;
        }
        // 1. Cria o cabeçalho da lista.
        const headerRow = document.createElement('div');
        headerRow.className = 'formula-row header'; // Adiciona a classe 'header' para o estilo
        headerRow.innerHTML = `
            <div>Nome</div>
            <div>Código</div>
            <div>Base</div>
            <div>Nº Pigmentos</div>
            <div class="actions">Ações</div>
        `;
        formulasContainer.appendChild(headerRow);

        // 2. Cria as linhas de dados, também usando a nova classe.
        formulas.forEach(item => {
            const row = document.createElement('div');
            row.className = 'formula-row';
            row.innerHTML = `
                <div>${item.nome}</div>
                <div>${item.codigo || '—'}</div>
                <div>${item.base} ${item.unidade}</div>
                <div>${item.pigmentos.length}</div>
                <div class="actions">
                    <button class="btn" data-act="produzir" data-id="${item.id}">Produzir</button>
                    <button class="btn secondary" data-act="editar" data-id="${item.id}">Editar</button>
                    <button class="btn danger" data-act="excluir" data-id="${item.id}">Excluir</button>
                </div>
            `;
            formulasContainer.appendChild(row);
        });

        // 3. Lógica de eventos para os botões
        formulasContainer.addEventListener('click', e => {
            const btn = e.target.closest('button[data-act]');
            if (!btn) return;
            const id = btn.dataset.id;
            if (btn.dataset.act === 'excluir') {
                if (confirm('Deseja realmente excluir esta fórmula?')) {
                    store.data.formulas = store.data.formulas.filter(f => f.id !== id);
                    store.save();
                    navigate();
                }
            }
            if (btn.dataset.act === 'editar') {
                location.hash = `#/producao/editar-formula/${id}`;
            }
            if (btn.dataset.act === 'produzir') {
                sessionStorage.setItem('formulaEmProducaoId', id);
                location.hash = '#/producao/em-producao';
            }
        });
    };

    const filterAndRender = () => {
        const query = searchInput.value.toLowerCase().trim();
        const todasFormulas = store.data.formulas || [];

        const formulasFiltradas = query
            ? todasFormulas.filter(f =>
                f.nome.toLowerCase().includes(query) ||
                (f.codigo || '').toLowerCase().includes(query)
            )
            : todasFormulas;

        renderList(formulasFiltradas);
    };


    searchInput.addEventListener('input', filterAndRender);
    filterAndRender();
    return root;
}

/**
 * Aba "Produção" (Simulador IoT)
 */
let producaoInterval = null; // Variável global para controlar o intervalo da simulação
function renderEmProducaoView() {
    const root = document.createElement('div');
    // Verifica se há um estado de produção para ser retomado
    const resumeStateRaw = sessionStorage.getItem('resumeProductionState');
    sessionStorage.removeItem('resumeProductionState'); // Limpa para não recarregar de novo
    const resumeState = resumeStateRaw ? JSON.parse(resumeStateRaw) : null;

    // Guardamos o ID do histórico que está sendo retomado (se houver).
    const historicoEntryId = resumeState?.historicoEntryId; // <<<< ADICIONADO

    // Se estivermos retomando, usamos o formulaId do estado salvo. Senão, pegamos o novo.
    const formulaId = resumeState?.formulaId || sessionStorage.getItem('formulaEmProducaoId');
    const formula = store.data.formulas.find(f => f.id === formulaId);


    // Estado 1: Nenhuma fórmula em produção
    if (!formula) {
        root.innerHTML = `
            <div class="empty card">
                <h3>Nenhuma produção em andamento</h3>
                <p>Selecione uma fórmula para iniciar a pesagem.</p>
                <button class="btn" onclick="location.hash='#/producao/formulas'">Selecionar Fórmula</button>
            </div>
        `;
        return root;
    }

    // Estado 2: Fórmula carregada, aguardando início
    // Se estivermos retomando, 'pigmentosEmProducao' começa com o estado salvo.
    // Senão, começa do zero.
    let pigmentosEmProducao = resumeState?.pigmentosEmProducao || JSON.parse(JSON.stringify(formula.pigmentos)).map(p => ({ ...p, restante: p.ml, status: 'pendente' }));
    // Encontra o índice do primeiro pigmento que ainda não foi concluído.
    let pigmentoAtualIndex = pigmentosEmProducao.findIndex(p => p.restante > 0 && p.status === 'pendente');
    if (pigmentoAtualIndex === -1) pigmentoAtualIndex = 0; // Caso de segurança
    let isPaused = false;

    root.innerHTML = `
        <div class="card">
            <div class="toolbar" style="justify-content:space-between; margin-bottom:10px;">
                <div>
                    <h2 style="margin:0">Produzindo: ${formula.nome}</h2>
                    <small>${formula.codigo}</small>
                </div>
                <div id="production-controls">
                    </div>
            </div>
            <div id="pigmentos-producao" style="display:flex; flex-direction:column; gap:8px;">
                </div>
        </div>
    `;

    /**
     * Função centralizada para finalizar a produção.
     * @param {boolean} tipoFinalizacao - Define se a produção foi concluída com sucesso ou cancelada.
     */
    function finalizarProducao(tipoFinalizacao) {
        // MENSAGEM DE DEPURAÇÃO 1: Ver se a função é chamada.
        console.log(`1. Função finalizarProducao chamada com o tipo: "${tipoFinalizacao}"`);

        // A primeira coisa a fazer é parar a simulação de pesagem.
        clearInterval(producaoInterval);

        // 1. Determina a lista de pigmentos e quantidades a serem abatidas.
        let pigmentosParaAbater = [];
        let mensagemDeSucesso = '';

        // Define o estado e calcula o preço com base no tipo de finalização.
        let estadoFinal = '';
        let precoFinal = 0;

        if (tipoFinalizacao === 'completa') {
            // Se a produção foi completa, usamos a receita inteira da fórmula.
            pigmentosParaAbater = formula.pigmentos;
            mensagemDeSucesso = 'Produção finalizada com sucesso e estoque atualizado!';
            estadoFinal = 'Finalizada';
            // Se foi completa, o preço é o valor total já calculado da fórmula.
            precoFinal = formula.valorTotal || 0;

        } else if (tipoFinalizacao === 'manual') {
            // Se foi manual, calculamos o que foi usado até agora.
            pigmentosEmProducao.forEach(p => {
                const quantidadeUsada = p.ml - p.restante;
                // Só adicionamos à lista de abate se algo foi realmente usado.
                if (quantidadeUsada > 0.01) { // Usamos 0.01 para evitar imprecisões de ponto flutuante
                    pigmentosParaAbater.push({
                        id: p.id,
                        ml: quantidadeUsada,
                        nome: p.nome,
                        codigo: p.codigo,
                        mlTotal: p.ml
                    });
                }
            });
            mensagemDeSucesso = 'Produção finalizada manualmente. Estoque dos itens utilizados foi atualizado.';
            estadoFinal = 'Não Finalizada';
            // Se foi manual, recalculamos o preço com base apenas no que foi usado.
            precoFinal = pigmentosParaAbater.reduce((acc, p) => {
                const pigmentoBase = store.data.pigmentos.find(base => base.id === p.id);
                return acc + (pigmentoBase ? (pigmentoBase.preco / 900) * p.ml : 0);
            }, 0);
        }

        // MENSAGEM DE DEPURAÇÃO 2: Ver o que será abatido do estoque.
        console.log('2. Pigmentos calculados para abater do estoque:', pigmentosParaAbater);

        // 2. Abate o estoque e salva o histórico (APENAS se tiver algo para abater)
        if (pigmentosParaAbater.length > 0) {
            // MENSAGEM DE DEPURAÇÃO 3: Confirma que a lógica de salvar vai começar.
            console.log('3. Entrando no bloco para abater o estoque e salvar o histórico.');
            pigmentosParaAbater.forEach(pigmentoUsado => {
                const pigmentoNoEstoque = store.data.pigmentos.find(p => p.id === pigmentoUsado.id); // Encontra o pigmento no estoque
                if (pigmentoNoEstoque) {
                    pigmentoNoEstoque.quantidade = Math.max(0, pigmentoNoEstoque.quantidade - pigmentoUsado.ml); // Abate a quantidade usada
                }
            });

            // Se existe um historicoEntryId, estamos atualizando um registro.
            if (historicoEntryId) {
                const originalEntry = store.data.producaoHistorico.find(h => h.id === historicoEntryId);
                if (originalEntry) {
                    // Atualiza o registro existente
                    originalEntry.data = new Date().toISOString();
                    originalEntry.pigmentosUtilizados = pigmentosParaAbater;
                    originalEntry.estado = estadoFinal;
                    originalEntry.preco = precoFinal;
                }
            } else {
                // Se não, estamos criando um registro novo.
                const historicoEntry = {
                    id: uuid(),
                    data: new Date().toISOString(),
                    formulaId: formula.id,
                    nomeFormula: formula.nome,
                    codigoFormula: formula.codigo,
                    pigmentosUtilizados: pigmentosParaAbater,
                    estado: estadoFinal,
                    preco: precoFinal
                };
                store.data.producaoHistorico.push(historicoEntry);
            }

            store.save();
            toast(mensagemDeSucesso, 3000);
        } else {
            // MENSAGEM DE DEPURAÇÃO 4: Informa se nada foi usado.
            console.log('4. Nenhuma quantidade de pigmento foi usada, nada a salvar.');
            toast('Produção finalizada sem uso de material.', 3000);
        }

        // 3. Ações de limpeza que sempre acontecem.
        sessionStorage.removeItem('formulaEmProducaoId');
        navigate();
    }

    function renderProducao() {
        const container = root.querySelector('#pigmentos-producao');
        if (!container) return;

        const pigmentosHtml = pigmentosEmProducao.map((p, index) => {
            const isAtual = index === pigmentoAtualIndex;
            const isCompleto = p.status === 'completo';
            return `
                <div class="pigmento-row ${isAtual && !isCompleto ? 'ativo' : ''}" style="border: 1px solid ${isAtual && !isCompleto ? 'var(--primary)' : 'var(--border)'}; padding: 8px; border-radius: 10px;">
                    <div class="pigmento-nome">${p.nome}</div>
                    <div class="pigmento-valor">${p.restante.toFixed(2)} ml</div>
                    <div class="pigmento-total">de ${p.ml.toFixed(2)} ml</div>
                    <div class="pigmento-acao">
                        ${isCompleto ? '<span class="status-completo">✔ Concluído</span>' : ''}
                        ${isAtual && p.status === 'pesado' ? '<button class="btn btn-proximo" data-act="proximo">Próximo</button>' : ''}
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = pigmentosHtml;
    }

    function updateControls(state) {
        const controls = root.querySelector('#production-controls');
        if (!controls) return;
        if (state === 'produzindo') {
            controls.innerHTML = `<button class="btn secondary" data-act="pausar">Pausar Produção</button>
            <button class="btn danger" data-act="finalizar">Finalizar Produção</button>`;
        } else if (state === 'pausado') {
            controls.innerHTML = `<button class="btn" data-act="retomar">Retomar Produção</button>
            <button class="btn danger" data-act="finalizar">Finalizar Produção</button>`;
        } else { // 'ocioso' ou 'retomado'
            controls.innerHTML = `<button class="btn" data-act="iniciar">Iniciar Produção</button>`;
        }
    }

    function simularPesagem() {
        if (isPaused) return;
        const pigmento = pigmentosEmProducao[pigmentoAtualIndex];
        if (pigmento && pigmento.restante > 0) {
            pigmento.restante -= Math.random() * 2.5; // simula a pesagem
            if (pigmento.restante < 0) pigmento.restante = 0;
        }
        if (pigmento && pigmento.restante === 0) {
            pigmento.status = 'pesado';
            clearInterval(producaoInterval);
        }
        // A simulação só chama a função que renderiza a lista.
        renderProducao();
    }

    root.addEventListener('click', e => {
        const action = e.target.dataset.act;
        if (!action) return;

        if (action === 'iniciar' || action === 'retomar') {
            isPaused = false;
            producaoInterval = setInterval(simularPesagem, 100);
            updateControls('produzindo');
        }
        if (action === 'pausar') {
            isPaused = true;
            clearInterval(producaoInterval);
            updateControls('pausado');
        }
        if (action === 'finalizar') {
            if (confirm('Deseja realmente finalizar esta produção?')) {
                // Chamamos a função com 'false', indicando que foi um cancelamento manual
                // e que não deve salvar o histórico nem abater o estoque.
                finalizarProducao('manual');
            }
        }
        if (action === 'proximo') {
            // Só marcamos como completo e avançamos se o pigmento existir.
            if (pigmentosEmProducao[pigmentoAtualIndex]) {
                pigmentosEmProducao[pigmentoAtualIndex].status = 'completo';
                pigmentoAtualIndex++;
            }

            // A verificação agora acontece após a tentativa de avanço.
            if (pigmentoAtualIndex >= pigmentosEmProducao.length) {
                finalizarProducao('completa');
            } else {
                producaoInterval = setInterval(simularPesagem, 100);
            }
        }
    });

    renderProducao();
    updateControls(resumeState ? 'pausado' : 'ocioso');
    return root;
}

// Aba "Histórico de Produção" (Listagem)
function renderHistoricoProducaoView() {
    const root = document.createElement('div');
    root.innerHTML = `
        <div class="toolbar" style="margin-bottom:16px;">
            <h2 style="margin:0;">Histórico de Produção</h2>
        </div>
        <div class="card" style="padding: 12px; margin-bottom: 16px;">
            <input id="search-hist-prod" type="text" placeholder="Pesquisar por nome da fórmula ou data (DD/MM/AAAA)...">
        </div>
        <div id="hist-prod-container"></div>
    `;

    const historicoContainer = root.querySelector('#hist-prod-container');
    historicoContainer.className = 'card';

    const headerRow = document.createElement('div');
    headerRow.className = 'hist-row header';
    headerRow.style.fontWeight = '600';
    headerRow.innerHTML = `
        <div class="toggle-details"></div>
        <div>Data</div>
        <div>Nome da Fórmula</div>
        <div>Preço</div>
        <div>Estado</div>
        <div class="actions">Ações</div>
    `;
    historicoContainer.appendChild(headerRow);

    // Wrapper apenas para as linhas dinâmicas
    const rowsWrapper = document.createElement('div');
    rowsWrapper.id = 'hist-prod-rows';
    historicoContainer.appendChild(rowsWrapper);

    const searchInput = root.querySelector('#search-hist-prod');


    const renderList = (historico) => {
        rowsWrapper.innerHTML = '';
        if (!historico.length) {
            rowsWrapper.innerHTML = `<div class="empty card">Nenhum registro encontrado.</div>`;
            return;
        }
        // Cria as linhas do histórico
        historico.sort((a, b) => new Date(b.data) - new Date(a.data)).forEach(item => {
            const row = document.createElement('div');
            row.className = 'hist-row';
            row.dataset.histId = item.id; // ID para referência no clique

            const estadoBadge = item.estado === 'Finalizada'
                ? `<span class="badge-soft">${item.estado}</span>`
                : `<span class="badge-danger">${item.estado}</span>`;

            const acoesHtml = item.estado === 'Não Finalizada'
                ? `<button class="btn secondary" data-act="retomar" data-id="${item.id}">Retomar</button>`
                : '';

            row.innerHTML = `
                <div class="toggle-details">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <div>${new Date(item.data).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</div>
                <div>${item.nomeFormula}</div>
                <div>${currency.format(item.preco || 0)}</div>
                <div>${estadoBadge}</div>
                <div class="actions">${acoesHtml}</div>
            `;

            const details = document.createElement('div');
            details.className = 'hist-details';
            details.dataset.detailsFor = item.id;

            // 1. Buscamos a fórmula original correspondente a ESTE item do histórico.
            const formulaOriginal = store.data.formulas.find(f => f.id === item.formulaId);

            // Cria a tabela de detalhes dos pigmentos
            const pigmentosHeaders = ['Pigmento', 'Qtd. Usada', 'Qtd. Faltante', 'Total Necessário', 'Preço (Uso)'];
            const pigmentosRows = item.pigmentosUtilizados.map(p => {
                // 2. Usamos a 'formulaOriginal' que acabamos de encontrar.
                // Adicionamos uma verificação (ternário) para o caso de a fórmula original ter sido deletada.
                const pigmentoNaFormula = formulaOriginal ? formulaOriginal.pigmentos.find(orig => orig.id === p.id) : null;
                const totalNecessario = pigmentoNaFormula ? pigmentoNaFormula.ml : p.ml; // se não encontrar, usa o ml do próprio item

                const faltante = Math.max(0, totalNecessario - p.ml);
                const precoBase = store.data.pigmentos.find(base => base.id === p.id)?.preco || 0;
                const precoUso = (precoBase / 900) * p.ml;

                return [
                    `${p.nome} (${p.codigo})`,
                    `${p.ml.toFixed(2)} ml`,
                    `${faltante.toFixed(2)} ml`,
                    `${totalNecessario.toFixed(2)} ml`,
                    currency.format(precoUso)
                ];
            });
            details.appendChild(table(pigmentosHeaders, pigmentosRows));

            historicoContainer.appendChild(row);
            historicoContainer.appendChild(details);
        });

        // Delegação de eventos (uma vez só)
        historicoContainer.addEventListener('click', e => {
            const target = e.target;
            // Expandir/recolher
            const rowHeader = target.closest('.hist-row');
            if (rowHeader && rowHeader.dataset.histId && !target.closest('button')) {
                const id = rowHeader.dataset.histId;
                const detailsEl = historicoContainer.querySelector(`.hist-details[data-details-for="${id}"]`);
                const toggleEl = rowHeader.querySelector('.toggle-details');
                if (detailsEl) {
                    const isVisible = detailsEl.style.display === 'block';
                    detailsEl.style.display = isVisible ? 'none' : 'block';
                    toggleEl?.classList.toggle('expanded', !isVisible);
                }
            }

            // Lógica para o botão "Retomar"
            if (target.dataset.act === 'retomar') {
                e.stopPropagation(); // Impede que o evento de expandir seja acionado
                const id = target.dataset.id;
                const itemHistorico = store.data.producaoHistorico.find(h => h.id === id);
                const formulaParaRetomar = store.data.formulas.find(f => f.id === itemHistorico.formulaId);

                if (itemHistorico && formulaParaRetomar) {
                    const resumeState = {
                        historicoEntryId: itemHistorico.id, // <<<< ADICIONADO
                        formulaId: itemHistorico.formulaId,
                        pigmentosEmProducao: formulaParaRetomar.pigmentos.map(pigmentoOriginal => {
                            const pigmentoUsado = itemHistorico.pigmentosUtilizados.find(p => p.id === pigmentoOriginal.id);
                            const mlUsado = pigmentoUsado ? (pigmentoUsado.ml || pigmentoUsado.mlUsado || 0) : 0;
                            return {
                                ...pigmentoOriginal,
                                restante: Math.max(0, pigmentoOriginal.ml - mlUsado),
                                status: (pigmentoOriginal.ml - mlUsado < 0.01) ? 'completo' : 'pendente'
                            };
                        })
                    };
                    sessionStorage.setItem('resumeProductionState', JSON.stringify(resumeState));
                    location.hash = '#/producao/em-producao';
                } else {
                    alert('Não foi possível retomar a produção. A fórmula original pode ter sido excluída.');
                }
            }
        });
    };

    // Função que filtra e renderiza a lista com base na busca
    const filterAndRender = () => {
        const query = searchInput.value.toLowerCase().trim();
        const todosRegistros = store.data.producaoHistorico || [];

        if (!query) {
            renderList(todosRegistros); // Se a busca estiver vazia, mostra tudo
            return;
        }

        const registrosFiltrados = todosRegistros.filter(item => {
            const dataFormatada = new Date(item.data).toLocaleString('pt-BR');
            return item.nomeFormula.toLowerCase().includes(query) || dataFormatada.includes(query);
        });

        renderList(registrosFiltrados);
    };

    // Adiciona o listener para o evento de 'input' (a cada letra digitada)
    searchInput.addEventListener('input', filterAndRender);

    // Renderiza a lista completa pela primeira vez
    filterAndRender();
    return root;
}


// --- TELA: Produtos (CRUD) ---
addRoute('produtos', () => {
    // Esta função cria uma "sub-rota". Se a URL for #/produtos/novo, ela mostra o formulário.
    // Se for #/produtos, mostra a lista.
    if (location.hash === '#/produtos/novo' || location.hash.startsWith('#/produtos/edit')) {
        const id = location.hash.split('/')[3];
        const produto = store.data.produtos.find(p => p.id === id);
        return renderFormProduto(produto);
    }
    return renderListaProdutos();
});

// Lista de produtos
function renderListaProdutos() {
    const root = document.createElement('div');
    root.innerHTML = `
        <div class="toolbar" style="margin:6px 0 12px">
            <h2 style="margin:0">Produtos</h2>
            <div class="spacer"></div>
            <button class="btn" onclick="location.hash='#/produtos/novo'">Novo produto</button>
        </div>
        <div class="card" style="padding: 12px; margin-bottom: 16px;">
            <input id="search-produtos" type="text" placeholder="Pesquisar por nome ou código do produto...">
        </div>
        <div id="produtos-list-container"></div>
    `;

    const container = root.querySelector('#produtos-list-container');
    const searchInput = root.querySelector('#search-produtos');

    // Função que renderiza a tabela de produtos
    const renderList = (produtos) => {
        container.innerHTML = ''; // Limpa a lista antes de redesenhar
        if (!produtos.length) {
            container.innerHTML = `<div class="empty card">Nenhum produto encontrado.</div>`;
            return;
        }

        const listWrapper = document.createElement('div');
        listWrapper.className = 'card';

        // 1. Cria o cabeçalho da lista.
        const headerRow = document.createElement('div');
        headerRow.className = 'prod-row header';
        headerRow.innerHTML = `
            <div class="toggle-details"></div>
            <div>Nome</div>
            <div>Código</div>
            <div>Preço</div>
            <div>Estoque</div>
            <div class="actions">Ações</div>
        `;
        listWrapper.appendChild(headerRow);

        // 2. Cria as linhas de dados (visível e oculta) para cada produto.
        produtos.forEach(p => {
            const row = document.createElement('div');
            row.className = 'prod-row';
            row.dataset.prodId = p.id;

            const estoqueStatusClass = Number(p.estoqueAtual) <= Number(p.estoqueMin) ? 'badge-warn' : 'badge-soft';

            // Conteúdo da linha principal (visível)
            row.innerHTML = `
                <div class="toggle-details">
                    <svg width="16" height="16" viewBox="0 0 24 24"><path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </div>
                <div>${p.nome}</div>
                <div>${p.codigo || '—'}</div>
                <div>${currency.format(p.preco || 0)}</div>
                <div>${p.estoqueAtual} <span class="${estoqueStatusClass}" style="margin-left:6px">min ${p.estoqueMin}</span></div>
                <div class="actions">
                    <button class="btn secondary" data-act="edit" data-id="${p.id}">Editar</button>
                    <button class="btn danger" data-act="del" data-id="${p.id}">Excluir</button>
                </div>
            `;

            // Conteúdo do painel de detalhes (oculto)
            const details = document.createElement('div');
            details.className = 'prod-details';
            details.dataset.detailsFor = p.id;
            details.innerHTML = `
                <div class="prod-details-grid">
                    <div class="detail-item"><label>Categoria</label><span>${p.categoria || 'Não definida'}</span></div>
                    <div class="detail-item"><label>Cor</label><span>${p.cor || 'Não definida'}</span></div>
                    <div class="detail-item"><label>Unidade</label><span>${p.unidade || 'Não definida'}</span></div>
                    <div class="detail-item"><label>Custo</label><span>${currency.format(p.custo || 0)}</span></div>
                    <div class="detail-item"><label>Fornecedor</label><span>${p.fornecedor || 'Não definido'}</span></div>
                </div>
            `;

            listWrapper.appendChild(row);
            listWrapper.appendChild(details);
        });

        // 3. Adiciona o listener de eventos para a interatividade.
        listWrapper.addEventListener('click', (e) => {
            const target = e.target;

            // Lógica de expandir/recolher
            const rowHeader = target.closest('.prod-row');
            if (rowHeader && rowHeader.dataset.prodId && !target.closest('button')) {
                const id = rowHeader.dataset.prodId;
                const detailsEl = listWrapper.querySelector(`.prod-details[data-details-for="${id}"]`);
                const toggleEl = rowHeader.querySelector('.toggle-details');
                if (detailsEl && toggleEl) {
                    const isVisible = detailsEl.style.display === 'block';
                    detailsEl.style.display = isVisible ? 'none' : 'block';
                    toggleEl.classList.toggle('expanded', !isVisible);
                }
            }
            
            // Lógica dos botões de ação (editar/excluir)
            if (target.closest('button[data-act="edit"]')) {
                location.hash = `#/produtos/edit/${target.closest('button').dataset.id}`;
            }
            if (target.closest('button[data-act="del"]')) {
                if (confirm('Excluir este produto?')) {
                    store.data.produtos = store.data.produtos.filter(x => x.id !== target.closest('button').dataset.id);
                    store.save();
                    filterAndRender(); // Redesenha a lista
                    toast('Produto excluído.');
                }
            }
        });

        container.appendChild(listWrapper);
    }; 

    // Função que filtra e renderiza a lista com base na busca
    const filterAndRender = () => {
        const query = searchInput.value.toLowerCase().trim();
        const todosProdutos = store.data.produtos || [];
        const produtosFiltrados = query
            ? todosProdutos.filter(p =>
                p.nome.toLowerCase().includes(query) ||
                (p.codigo || '').toLowerCase().includes(query)
              )
            : todosProdutos;
        renderList(produtosFiltrados);
    };

    searchInput.addEventListener('input', filterAndRender);
    filterAndRender();
    return root;
}

// Formulário de produto (novo/edição)
function renderFormProduto(produto) {
    // Buscamos as categorias para popular o dropdown
    const categorias = store.data.categoriasProdutos || [];
    const categoriasOptionsHtml = categorias.map(c => 
        // Marca a opção como 'selected' se o nome dela corresponder à categoria do produto
        `<option value="${c.nome}" ${produto?.categoria === c.nome ? 'selected' : ''}>${c.nome}</option>`
    ).join('');
    // Reutiliza o componente genericForm para o formulário de produtos.
    const config = {
        title: produto ? 'Editar Produto' : 'Novo Produto',
        data: produto,
        fields: [
            { key: 'nome', label: 'Nome', span: 6 }, { key: 'codigo', label: 'Código', span: 3 },
            { key: 'categoria', label: 'Categoria', span: 3, 
                // Usamos uma propriedade customizada 'html' para injetar nosso dropdown
                html: `
                    <select data-key="categoria">
                        <option value="">Nenhuma</option>
                        ${categoriasOptionsHtml}
                    </select>
                `
            },
            { key: 'unidade', label: 'Unidade', span: 3, placeholder: 'Ex: Lata 900ml' },
            { key: 'preco', label: 'Preço de venda', span: 3, type: 'number' }, { key: 'custo', label: 'Custo', span: 3, type: 'number' },
            { key: 'estoqueAtual', label: 'Estoque atual', span: 3, type: 'number' }, { key: 'estoqueMin', label: 'Estoque mínimo', span: 3, type: 'number' },
            { key: 'fornecedor', label: 'Fornecedor', span: 6 },
        ],
        onSave: (item) => {
            if (produto) { // Se está editando, substitui o item existente.
                const index = store.data.produtos.findIndex(p => p.id === item.id);
                if (index > -1) store.data.produtos[index] = item;
            } else { // Se é novo, adiciona ao final do array.
                store.data.produtos.push(item);
            }
            store.save();
            toast('Produto salvo.');
            location.hash = '#/produtos';
        },
        onCancel: () => location.hash = '#/produtos'
    };
    return genericForm(config);
}

// --- TELA: Clientes (NOVA) ---
addRoute('clientes', () => {
    if (location.hash === '#/clientes/novo' || location.hash.startsWith('#/clientes/edit')) {
        const id = location.hash.split('/')[3];
        const cliente = store.data.clientes.find(c => c.id === id);
        return renderFormCliente(cliente);
    }
    return renderListaClientes();
});

function renderListaClientes() {
    const root = document.createElement('div');
    root.innerHTML = `
        <div class="toolbar" style="margin:6px 0 12px">
            <h2 style="margin:0">Clientes</h2>
            <div class="spacer"></div>
            <button class="btn" onclick="location.hash='#/clientes/novo'">Novo Cliente</button>
        </div>
        <div class="card" style="padding: 12px; margin-bottom: 16px;">
            <input id="search-clientes" type="text" placeholder="Pesquisar por nome, telefone ou email...">
        </div>
        <div id="clientes-list-container"></div>
    `;

    const container = root.querySelector('#clientes-list-container');
    const searchInput = root.querySelector('#search-clientes');

    const renderTable = (clientes) => {
        container.innerHTML = '';
        if (!clientes.length) {
            container.innerHTML = `<div class="empty card">Nenhum cliente encontrado.</div>`;
            return;
        }
        // 1. Adicionamos a nova coluna 'Nº de Pedidos'
        const headers = ['Nome', 'Telefone', 'Email', 'Nº de Pedidos', ''];
        const rows = clientes.map(c => [
            c.nome,
            c.telefone || '—',
            c.email || '—',
            // 2. Exibimos a quantidade de pedidos. Se não houver, mostra 0.
            c.quantidadePedidos || 0,
            `<div class="actions"><button class="btn secondary" data-act="edit" data-id="${c.id}">Editar</button><button class="btn danger" data-act="del" data-id="${c.id}">Excluir</button></div>`
        ]);
        const tbl = table(headers, rows);
        container.appendChild(tbl);

        tbl.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-act]');
            if (!btn) return;
            const id = btn.dataset.id;
            if (btn.dataset.act === 'edit') location.hash = `#/clientes/edit/${id}`;
            if (btn.dataset.act === 'del') {
                if (confirm('Excluir este cliente?')) {
                    store.data.clientes = store.data.clientes.filter(x => x.id !== id);
                    store.save();
                    toast('Cliente excluído.');
                    filterAndRender();
                }
            }
        });
    };

    const filterAndRender = () => {
        const query = searchInput.value.toLowerCase().trim();
        const todosClientes = store.data.clientes || [];

        const clientesFiltrados = query
            ? todosClientes.filter(c => 
                c.nome.toLowerCase().includes(query) ||
                (c.telefone || '').toLowerCase().includes(query) ||
                (c.email || '').toLowerCase().includes(query)
              )
            : todosClientes;
        renderTable(clientesFiltrados);
    };

    searchInput.addEventListener('input', filterAndRender);
    filterAndRender();
    return root;
}

function renderFormCliente(cliente) {
    const config = {
        title: cliente ? 'Editar Cliente' : 'Novo Cliente',
        data: cliente,
        fields: [
            { key: 'nome', label: 'Nome Completo / Razão Social', span: 6 },
            { key: 'telefone', label: 'Telefone', span: 3 },
            { key: 'email', label: 'Email', span: 3 },
            { key: 'obs', label: 'Observações', span: 12 }
        ],
        onSave: (item) => {
            if (cliente) {
                const index = store.data.clientes.findIndex(c => c.id === item.id);
                if (index > -1) store.data.clientes[index] = item;
            } else {
                store.data.clientes.push(item);
            }
            store.save();
            toast('Cliente salvo.');
            location.hash = '#/clientes';
        },
        onCancel: () => location.hash = '#/clientes'
    };
    return genericForm(config);
}


// --- TELA: Fornecedores (NOVA) ---
addRoute('fornecedores', () => {
    if (location.hash === '#/fornecedores/novo' || location.hash.startsWith('#/fornecedores/edit')) {
        const id = location.hash.split('/')[3];
        const fornecedor = store.data.fornecedores.find(f => f.id === id);
        return renderFormFornecedor(fornecedor);
    }
    return renderListaFornecedores();
});

function renderListaFornecedores() {
    const root = document.createElement('div');
    root.innerHTML = `
        <div class="toolbar" style="margin:6px 0 12px">
            <h2 style="margin:0">Fornecedores</h2>
            <div class="spacer"></div>
            <button class="btn" onclick="location.hash='#/fornecedores/novo'">Novo Fornecedor</button>
        </div>
        <div class="card" style="padding: 12px; margin-bottom: 16px;">
            <input id="search-fornecedores" type="text" placeholder="Pesquisar por nome, contato ou telefone...">
        </div>
        <div id="fornecedores-list-container"></div>
    `;

    const container = root.querySelector('#fornecedores-list-container');
    const searchInput = root.querySelector('#search-fornecedores');

    const renderTable = (fornecedores) => {
        container.innerHTML = '';
        if (!fornecedores.length) {
            container.innerHTML = `<div class="empty card">Nenhum fornecedor encontrado.</div>`;
            return;
        }
        const headers = ['Nome', 'Contato', 'Telefone', ''];
        const rows = fornecedores.map(f => [
            f.nome, f.contato || '—', f.telefone || '—',
            `<div class="actions"><button class="btn secondary" data-act="edit" data-id="${f.id}">Editar</button><button class="btn danger" data-act="del" data-id="${f.id}">Excluir</button></div>`
        ]);
        const tbl = table(headers, rows);
        container.appendChild(tbl);

        tbl.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-act]');
            if (!btn) return;
            const id = btn.dataset.id;
            if (btn.dataset.act === 'edit') location.hash = `#/fornecedores/edit/${id}`;
            if (btn.dataset.act === 'del') {
                if (confirm('Excluir este fornecedor?')) {
                    store.data.fornecedores = store.data.fornecedores.filter(x => x.id !== id);
                    store.save();
                    toast('Fornecedor excluído.');
                    filterAndRender();
                }
            }
        });
    };
    
    const filterAndRender = () => {
        const query = searchInput.value.toLowerCase().trim();
        const todosFornecedores = store.data.fornecedores || [];

        const fornecedoresFiltrados = query
            ? todosFornecedores.filter(f => 
                f.nome.toLowerCase().includes(query) ||
                (f.contato || '').toLowerCase().includes(query) ||
                (f.telefone || '').toLowerCase().includes(query)
              )
            : todosFornecedores;

        renderTable(fornecedoresFiltrados);
    };

    searchInput.addEventListener('input', filterAndRender);
    filterAndRender();
    return root;
}

function renderFormFornecedor(fornecedor) {
    const config = {
        title: fornecedor ? 'Editar Fornecedor' : 'Novo Fornecedor',
        data: fornecedor,
        fields: [
            { key: 'nome', label: 'Nome do Fornecedor', span: 6 },
            { key: 'contato', label: 'Nome do Contato', span: 6 },
            { key: 'telefone', label: 'Telefone', span: 6 },
            { key: 'email', label: 'Email', span: 6 },
        ],
        onSave: (item) => {
            if (fornecedor) {
                const index = store.data.fornecedores.findIndex(f => f.id === item.id);
                if (index > -1) store.data.fornecedores[index] = item;
            } else {
                store.data.fornecedores.push(item);
            }
            store.save();
            toast('Fornecedor salvo.');
            location.hash = '#/fornecedores';
        },
        onCancel: () => location.hash = '#/fornecedores'
    };
    return genericForm(config);
}


/* --- TELA: Pedidos --- */
/**
 * Roteador Principal da Seção "Pedidos"
 * Cria as abas e direciona para a tela correta (Lista ou Registrar).
 */
addRoute('pedidos', () => {
    const root = document.createElement('div');
    const subView = location.hash.split('/')[2] || 'lista'; // 'lista' é a tela padrão

    root.innerHTML = `
        <div class="tabs">
            <a href="#/pedidos/lista" class="tab ${subView === 'lista' ? 'active' : ''}">Pedidos</a>
            <a href="#/pedidos/registrar" class="tab ${subView === 'registrar' ? 'active' : ''}">Registrar Pedido de Produtos</a>
        </div>
        <div id="pedidos-content"></div>
    `;

    const content = root.querySelector('#pedidos-content');
    if (subView === 'registrar') {
        content.appendChild(renderRegistrarPedidoView());
    } else { // 'lista'
        content.appendChild(renderPedidosListView());
    }
    return root;
});


/**
 * Tela "Pedidos": Exibe a lista de todos os pedidos registrados.
 * Inclui uma barra de pesquisa.
 */
function renderPedidosListView() {
    const root = document.createElement('div');
    root.innerHTML = `
        <div class="toolbar" style="margin-bottom:16px;">
            <h2 style="margin:0;">Pedidos</h2>
        </div>
        <div class="card" style="padding: 12px; margin-bottom: 16px;">
            <input id="search-pedidos" type="text" placeholder="Pesquisar por ID, fornecedor ou data (DD/MM/AAAA)...">
        </div>
        <div id="pedidos-list-container"></div>
    `;

    const container = root.querySelector('#pedidos-list-container');
    const searchInput = root.querySelector('#search-pedidos');

    const renderTable = (pedidos) => {
        container.innerHTML = '';
        if (!pedidos.length) {
            container.innerHTML = `<div class="empty card">Nenhum pedido encontrado.</div>`;
            return;
        }
        const headers = ['ID do Pedido', 'Data', 'Fornecedor', 'Valor Total', 'Ações'];
        const rows = pedidos.map(p => [
            p.id.slice(0, 8).toUpperCase(), // Mostra apenas os 8 primeiros caracteres do ID
            new Date(p.data + 'T03:00:00Z').toLocaleDateString('pt-BR'),
            p.fornecedor.nome,
            currency.format(p.valorTotal || 0),
            `<div class="actions">
                <button class="btn secondary" data-act="edit" data-id="${p.id}" disabled title="Em breve">Editar</button>
                <button class="btn ghost danger" data-act="del" data-id="${p.id}">Remover</button>
            </div>`
        ]);
        const tbl = table(headers, rows);
        container.appendChild(tbl);
    };

    const filterAndRender = () => {
        const query = searchInput.value.toLowerCase().trim();
        const todosPedidos = store.data.pedidos || [];
        const pedidosFiltrados = query
            ? todosPedidos.filter(p =>
                p.id.toLowerCase().includes(query) ||
                p.fornecedor.nome.toLowerCase().includes(query) ||
                new Date(p.data + 'T03:00:00Z').toLocaleDateString('pt-BR').includes(query)
              )
            : todosPedidos;
        renderTable(pedidosFiltrados.sort((a, b) => new Date(b.data) - new Date(a.data)));
    };

    container.addEventListener('click', e => {
        const btn = e.target.closest('button[data-act="del"]');
        if (btn) {
            if (confirm('Atenção: remover um pedido NÃO irá reverter a entrada de estoque. Deseja continuar?')) {
                store.data.pedidos = store.data.pedidos.filter(p => p.id !== btn.dataset.id);
                store.save();
                filterAndRender();
                toast('Pedido removido.');
            }
        }
    });

    searchInput.addEventListener('input', filterAndRender);
    filterAndRender();
    return root;
}


/**
 * Tela "Registrar Pedido de Produtos": Formulário para criar um novo pedido.
 */
function renderRegistrarPedidoView() {
    const root = document.createElement('div');
    root.className = 'pedidos-grid';

    // Estado local do formulário
    let itensDoPedido = [];
    let selectedFornecedor = null;

    root.innerHTML = `
        <div class="card">
            <div class="toolbar"><h2 style="margin:0">Registrar Pedido</h2></div>
            <div class="form">
                <div class="field" style="grid-column: span 3"><label>ID do Pedido</label><input value="${uuid().slice(0, 8).toUpperCase()}" disabled /></div>
                <div class="field autocomplete-container" style="grid-column: span 6">
                    <label>Fornecedor</label>
                    <input id="pedido-fornecedor" placeholder="Digite para buscar..." autocomplete="off" />
                    <div class="autocomplete-results"></div>
                </div>
                <div class="field" style="grid-column: span 3"><label>Data</label><input id="pedido-data" type="date" value="${new Date().toISOString().slice(0,10)}"/></div>
                <div class="field full"><label>Produtos no Pedido</label><div id="pedido-itens-lista" style="border:1px dashed var(--border); padding:10px; border-radius:10px; min-height:120px;"></div></div>
                <div class="field" style="grid-column: 8 / -1; text-align:right;">
                    <label>Valor Total do Pedido</label>
                    <div id="pedido-valor-total" style="font-size: 1.8em; font-weight: 600;">${currency.format(0)}</div>
                </div>
                <button id="finalizar-pedido" class="btn" style="grid-column: 1 / -1; margin-top:12px;">Finalizar e Adicionar ao Estoque</button>
            </div>
        </div>
        <div class="card">
            <label>Adicionar Produto ao Pedido</label>
            <input id="pedido-produto-search" placeholder="Digite nome ou código do produto..." style="width:100%; margin-top:8px;">
            <div id="pedido-produto-results" class="prod-search-results"></div>
        </div>
    `;

    // --- Lógica das funções internas ---
    const fornecedorInput = root.querySelector('#pedido-fornecedor');
    const fornecedorResults = fornecedorInput.nextElementSibling;
    const produtoSearchInput = root.querySelector('#pedido-produto-search');
    const produtoResults = root.querySelector('#pedido-produto-results');
    const itensListaContainer = root.querySelector('#pedido-itens-lista');
    const valorTotalEl = root.querySelector('#pedido-valor-total');

    // Desenha a lista de produtos adicionados
    const renderItens = () => {
        itensListaContainer.innerHTML = '';
        if(!itensDoPedido.length) return;
        itensDoPedido.forEach((item, idx) => {
            const row = document.createElement('div');
            row.className = 'toolbar'; row.style.padding = '8px 0';
            row.innerHTML = `
                <div style="flex:1;"><strong>${item.nome}</strong> <small>(${item.codigo})</small></div>
                Qtd: <input type="number" value="${item.quantidade}" min="1" data-idx="${idx}" data-key="quantidade" style="width:80px;">
                Preço UN: <input type="number" value="${item.precoUnitario}" step="0.01" data-idx="${idx}" data-key="precoUnitario" style="width:100px;">
                Total: <strong>${currency.format(item.precoTotal)}</strong>
                <button class="btn ghost danger" data-idx="${idx}" data-act="remover-item">X</button>
            `;
            itensListaContainer.appendChild(row);
        });
    };

    // Calcula todos os totais
    const calcularTotais = () => {
        let totalGeral = 0;
        itensDoPedido.forEach(item => {
            item.precoTotal = (item.quantidade || 0) * (item.precoUnitario || 0);
            totalGeral += item.precoTotal;
        });
        valorTotalEl.textContent = currency.format(totalGeral);
        renderItens();
    };

    // --- Lógica dos Event Listeners ---

    // Autocomplete do Fornecedor
    fornecedorInput.addEventListener('input', () => { /* ... (lógica de autocomplete igual a de Clientes) ... */ });
    fornecedorResults.addEventListener('click', e => { /* ... (lógica de clique igual a de Clientes) ... */ });

    // Busca de Produtos
    produtoSearchInput.addEventListener('keydown', e => {
        if (e.key !== 'Enter') return;
        const query = produtoSearchInput.value.toLowerCase().trim();
        produtoResults.innerHTML = '';
        store.data.produtos.filter(p => p.nome.toLowerCase().includes(query) || p.codigo.toLowerCase().includes(query))
            .forEach(p => {
                const row = document.createElement('div');
                row.className = 'prod-row search-result';
                row.innerHTML = `<div><strong>${p.nome}</strong> <small>(${p.codigo})</small></div> <button class="btn secondary">Adicionar</button>`;
                row.querySelector('button').addEventListener('click', () => {
                    if (itensDoPedido.some(item => item.id === p.id)) { toast('Produto já está no pedido.'); return; }
                    itensDoPedido.push({ id: p.id, nome: p.nome, codigo: p.codigo, quantidade: 1, precoUnitario: p.custo || 0, precoTotal: p.custo || 0 });
                    calcularTotais();
                    produtoSearchInput.value = '';
                    produtoResults.innerHTML = '';
                });
                produtoResults.appendChild(row);
            });
    });

    // Alterar quantidade ou preço de um item
    itensListaContainer.addEventListener('input', e => {
        const idx = e.target.dataset.idx;
        if(idx) {
            itensDoPedido[idx][e.target.dataset.key] = Number(e.target.value);
            calcularTotais();
        }
    });

    // Remover um item
    itensListaContainer.addEventListener('click', e => {
        const btn = e.target.closest('button[data-act="remover-item"]');
        if(btn) {
            itensDoPedido.splice(btn.dataset.idx, 1);
            calcularTotais();
        }
    });

    // Finalizar Pedido
    root.querySelector('#finalizar-pedido').addEventListener('click', () => {
        if (!selectedFornecedor) { alert('Por favor, selecione um fornecedor.'); return; }
        if (!itensDoPedido.length) { alert('Adicione ao menos um produto ao pedido.'); return; }

        // 1. Aumenta o estoque dos produtos
        itensDoPedido.forEach(itemPedido => {
            const produtoNoEstoque = store.data.produtos.find(p => p.id === itemPedido.id);
            if (produtoNoEstoque) {
                produtoNoEstoque.estoqueAtual = (produtoNoEstoque.estoqueAtual || 0) + itemPedido.quantidade;
            }
        });
        
        // 2. Cria o objeto do pedido
        const novoPedido = {
            id: uuid(),
            data: root.querySelector('#pedido-data').value,
            fornecedor: selectedFornecedor,
            produtos: itensDoPedido,
            valorTotal: itensDoPedido.reduce((acc, item) => acc + item.precoTotal, 0)
        };
        
        // 3. Salva no store
        store.data.pedidos.push(novoPedido);
        store.save();
        
        toast('Pedido registrado e estoque atualizado com sucesso!');
        location.hash = '#/pedidos/lista';
    });

    return root;
}


// --- TELA: Configurações (agora com a função de exportar) ---
addRoute('config', () => {
    // Verifica se a URL é para a sub-tela de pagamentos
    if (location.hash === '#/config/pagamentos') {
        return renderFormasPagamentoCRUD();
    }
    if (location.hash === '#/config/categorias') {
        return renderCategoriasCRUD();
    }

    // Senão, mostra a tela principal de Configurações
    const root = document.createElement('div');
    root.className = 'card';
    root.innerHTML = `
        <h2 style='margin:0 0 16px'>Configurações</h2>
        <div class="form">
            <div class="field full" style="padding: 16px; border: 1px solid var(--border); border-radius: 10px; margin-bottom: 16px;">
                <label style="font-size: 1.1em; color: var(--text);">Categorias de Produtos</label>
                <p style="color: var(--muted); margin: 4px 0 12px;">Gerencie as categorias utilizadas para classificar seus produtos.</p>
                <button class="btn" onclick="location.hash='#/config/categorias'">Alterar Categorias</button>
            </div>

            <div class="field full" style="padding: 16px; border: 1px solid var(--border); border-radius: 10px; margin-bottom: 16px;">
                <label style="font-size: 1.1em; color: var(--text);">Formas de Pagamento</label>
                <p style="color: var(--muted); margin: 4px 0 12px;">Adicione, edite ou remova as formas de pagamento aceitas em suas vendas.</p>
                <button class="btn" onclick="location.hash='#/config/pagamentos'">Alterar Formas de Pagamento</button>
            </div>

            <div class="field full" style="padding: 16px; border: 1px solid var(--border); border-radius: 10px;">
                <label style="font-size: 1.1em; color: var(--text);">Exportar Dados</label>
                <p style="color: var(--muted); margin: 4px 0 12px;">Faça o download de todos os dados da aplicação em um único arquivo JSON.</p>
                <button class="btn secondary" id="btn-exportar-config">Exportar Dados em JSON</button>
            </div>
        </div>
    `;

    // Adiciona o listener de evento DIRETAMENTE no botão que acabamos de criar
    root.querySelector('#btn-exportar-config').addEventListener('click', () => {
        const blob = new Blob([JSON.stringify(store.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'gestao-tintas-dados.json';
        a.click();
        URL.revokeObjectURL(url);
        toast('Dados exportados com sucesso!');
    });

    return root;
});

/**
 * Tela de CRUD para Formas de Pagamento.
 */
function renderFormasPagamentoCRUD() {
    const root = document.createElement('div');
    // Estado para saber se estamos editando um item
    let editingId = null;

    // Função para desenhar a tela inteira (lista e formulário)
    function render() {
        const formasPagamento = store.data.formasPagamento || [];
        const itemEmEdicao = formasPagamento.find(f => f.id === editingId);

        // Gera a lista de formas de pagamento
        const listHtml = formasPagamento.map(f => `
            <div class="toolbar" style="border-bottom: 1px solid var(--border); padding: 8px 0;">
                <div style="flex: 1;">${f.nome}</div>
                <div class="actions">
                    <button class="btn secondary" data-act="edit" data-id="${f.id}">Editar</button>
                    <button class="btn danger" data-act="del" data-id="${f.id}">Excluir</button>
                </div>
            </div>
        `).join('');

        // O formulário muda dependendo se estamos editando ou criando
        root.innerHTML = `
            <div class="toolbar" style="margin-bottom:16px;">
                <h2 style="margin:0;">Gerenciar Formas de Pagamento</h2>
                <div class="spacer"></div>
                <button class="btn ghost" onclick="location.hash='#/config'">Voltar para Configurações</button>
            </div>
            <div class="grid" style="grid-template-columns: 2fr 1fr; align-items: flex-start;">
                <div class="card">${listHtml || '<div class="muted">Nenhuma forma de pagamento cadastrada.</div>'}</div>
                <div class="card">
                    <h4>${itemEmEdicao ? 'Editar' : 'Adicionar Nova'}</h4>
                    <div class="form">
                        <div class="field full">
                            <label>Nome</label>
                            <input id="fp-nome" value="${itemEmEdicao?.nome || ''}" placeholder="Ex: Boleto Bancário">
                        </div>
                        <button class="btn" data-act="save">${itemEmEdicao ? 'Salvar Alterações' : 'Adicionar'}</button>
                        ${itemEmEdicao ? '<button class="btn ghost" data-act="cancel-edit">Cancelar Edição</button>' : ''}
                    </div>
                </div>
            </div>
        `;
    }

    // Listener de eventos para a página
    root.addEventListener('click', e => {
        const btn = e.target.closest('button[data-act]');
        if (!btn) return;

        const action = btn.dataset.act;
        const id = btn.dataset.id;
        const nomeInput = root.querySelector('#fp-nome');

        if (action === 'edit') {
            editingId = id;
            render(); // Redesenha a tela no modo de edição
        } else if (action === 'cancel-edit') {
            editingId = null;
            render(); // Redesenha a tela no modo de criação
        } else if (action === 'del') {
            if (confirm('Deseja realmente excluir esta forma de pagamento?')) {
                store.data.formasPagamento = store.data.formasPagamento.filter(f => f.id !== id);
                store.save();
                render(); // Redesenha a tela com o item removido
            }
        } else if (action === 'save') {
            const nome = nomeInput.value.trim();
            if (!nome) { alert('O nome é obrigatório.'); return; }

            if (editingId) {
                // Atualiza um item existente
                const item = store.data.formasPagamento.find(f => f.id === editingId);
                item.nome = nome;
            } else {
                // Cria um novo item
                store.data.formasPagamento.push({ id: uuid(), nome: nome });
            }
            store.save();
            editingId = null; // Reseta o modo de edição
            render(); // Redesenha tudo com os novos dados
        }
    });

    render(); // Primeira renderização da tela
    return root;
}

/**
 * Tela de CRUD para Categorias de Produtos.
 */
function renderCategoriasCRUD() {
    const root = document.createElement('div');
    let editingId = null;

    function render() {
        const categorias = store.data.categoriasProdutos || [];
        const itemEmEdicao = categorias.find(c => c.id === editingId);

        const listHtml = categorias.map(c => `
            <div class="toolbar" style="border-bottom: 1px solid var(--border); padding: 8px 0;">
                <div style="flex: 1;">${c.nome}</div>
                <div class="actions">
                    <button class="btn secondary" data-act="edit" data-id="${c.id}">Editar</button>
                    <button class="btn ghost danger" data-act="del" data-id="${c.id}">Excluir</button>
                </div>
            </div>
        `).join('');

        root.innerHTML = `
            <div class="toolbar" style="margin-bottom:16px;">
                <h2 style="margin:0;">Gerenciar Categorias de Produtos</h2>
                <div class="spacer"></div>
                <button class="btn ghost" onclick="location.hash='#/config'">Voltar para Configurações</button>
            </div>
            <div class="grid" style="grid-template-columns: 2fr 1fr; align-items: flex-start;">
                <div class="card">${listHtml || '<div class="muted">Nenhuma categoria cadastrada.</div>'}</div>
                <div class="card">
                    <h4>${itemEmEdicao ? 'Editar Categoria' : 'Adicionar Nova Categoria'}</h4>
                    <div class="form">
                        <div class="field full">
                            <label>Nome da Categoria</label>
                            <input id="cat-nome" value="${itemEmEdicao?.nome || ''}" placeholder="Ex: Massa Rápida">
                        </div>
                        <button class="btn" data-act="save">${itemEmEdicao ? 'Salvar Alterações' : 'Adicionar'}</button>
                        ${itemEmEdicao ? '<button class="btn ghost" data-act="cancel-edit">Cancelar Edição</button>' : ''}
                    </div>
                </div>
            </div>
        `;
    }

    root.addEventListener('click', e => {
        const btn = e.target.closest('button[data-act]');
        if (!btn) return;
        const action = btn.dataset.act;
        const id = btn.dataset.id;
        const nomeInput = root.querySelector('#cat-nome');

        if (action === 'edit') {
            editingId = id;
            render();
        } else if (action === 'cancel-edit') {
            editingId = null;
            render();
        } else if (action === 'del') {
            if (confirm('Deseja realmente excluir esta categoria?')) {
                store.data.categoriasProdutos = store.data.categoriasProdutos.filter(c => c.id !== id);
                store.save();
                render();
            }
        } else if (action === 'save') {
            const nome = nomeInput.value.trim();
            if (!nome) { alert('O nome é obrigatório.'); return; }
            if (editingId) {
                const item = store.data.categoriasProdutos.find(c => c.id === editingId);
                item.nome = nome;
            } else {
                store.data.categoriasProdutos.push({ id: uuid(), nome: nome });
            }
            store.save();
            editingId = null;
            render();
        }
    });

    render();
    return root;
}


// Mantenha as outras rotas placeholder que ainda não foram implementadas
['relatorios'].forEach(name =>
    addRoute(name, () => {
        const root = document.createElement('div');
        root.innerHTML = `<div class='card'><h2 style='margin:0 0 8px'>${name[0].toUpperCase() + name.slice(1)}</h2><div class='muted'>Esta tela está pronta para ser implementada...</div></div>`;
        return root;
    })
);

// ===== 6. INIT (Inicialização da Aplicação) =====

/**
 * Função de inicialização principal.
 * É a primeira coisa a ser executada.
 */
function init() {
    const themeBtn = $('#btn-theme-toggle');
    const iconSun = $('#icon-sun');
    const iconMoon = $('#icon-moon');
    const setTheme = (theme) => {
        document.body.classList.toggle('theme-light', theme === 'light');
        iconSun.style.display = theme === 'light' ? 'block' : 'none';
        iconMoon.style.display = theme === 'dark' ? 'block' : 'none';
        themeBtn.dataset.theme = theme;
        localStorage.setItem('gestao-tintas:theme', theme);
    };
    const savedTheme = localStorage.getItem('gestao-tintas:theme') || 'dark';
    setTheme(savedTheme);
    themeBtn.addEventListener('click', () => {
        const nextTheme = themeBtn.dataset.theme === 'dark' ? 'light' : 'dark';
        setTheme(nextTheme);
    });

    // Botão "Novo" global
    const btnNovo = document.getElementById('btn-novo');
    if (btnNovo) btnNovo.addEventListener('click', () => {
        const page = (location.hash || '').split('/')[1];
        if (page === 'produtos') location.hash = '#/produtos/novo';
        else if (page === 'producao') location.hash = '#/producao/criar-pigmento';
        else if (page === 'clientes') location.hash = '#/clientes/novo';
        else if (page === 'fornecedores') location.hash = '#/fornecedores/novo';
        else location.hash = '#/vendas/registrar';
    });

    // Configuração do menu lateral
    window.addEventListener('hashchange', navigate);
    store.load();
    navigate();
}

init();