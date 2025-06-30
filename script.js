// URL base da sua API
const API_URL = 'http://127.0.0.1:5000';
let editModalInstance = null;
let addTipoModalInstance = null;

/**
 * Função para carregar os tipos de investimento e preencher os menus dropdown.
 */
async function carregarTiposInvestimento() {
    try {
        const response = await fetch(`${API_URL}/tipos_investimento`);
        const data = await response.json();

        const selectTipoAdicionar = document.getElementById('tipo_investimento');
        const selectTipoEditar = document.getElementById('edit_tipo_investimento');

        const currentSelectedAdd = selectTipoAdicionar.value;
        const currentSelectedEdit = selectTipoEditar.value;

        selectTipoAdicionar.innerHTML = '<option value="">Selecione um tipo</option>';
        selectTipoEditar.innerHTML = '';

        data.tipos_investimento.forEach(tipo => {
            const option = document.createElement('option');
            option.value = tipo.id;
            option.textContent = tipo.nome;
            selectTipoAdicionar.appendChild(option.cloneNode(true));
            selectTipoEditar.appendChild(option);
        });

        selectTipoAdicionar.value = currentSelectedAdd;
        selectTipoEditar.value = currentSelectedEdit;

    } catch (error) {
        console.error('Erro ao carregar tipos de investimento:', error);
    }
}

/**
 * Função para adicionar um novo tipo de investimento.
 */
function adicionarTipoInvestimento() {
    const nomeTipoInput = document.getElementById('novo_nome_tipo');
    const nomeTipo = nomeTipoInput.value;

    if (!nomeTipo) {
        alert('Por favor, insira o nome do tipo de investimento.');
        return;
    }

    fetch(`${API_URL}/tipo_investimento`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: nomeTipo }),
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.message || 'Erro ao adicionar tipo') });
            }
            return response.json();
        })
        .then(() => {
            nomeTipoInput.value = '';
            addTipoModalInstance.hide(); // Fecha o modal
            carregarTiposInvestimento(); // Atualiza a lista de tipos
        })
        .catch(error => {
            console.error('Erro:', error);
            alert(`Não foi possível adicionar o tipo: ${error.message}`);
        });
}


/**
 * Função para carregar e exibir a lista de investimentos.
 */
function listarInvestimentos() {
    fetch(`${API_URL}/investimentos`)
        .then(response => response.json())
        .then(data => {
            const listaContainer = document.getElementById('lista-investimentos');
            listaContainer.innerHTML = '';

            if (data.investimentos && data.investimentos.length > 0) {
                data.investimentos.forEach(investimento => {
                    const cardHtml = `
                        <div class="col-md-6">
                            <div class="card card-investimento shadow-sm">
                                <div class="card-body">
                                    <button type="button" class="btn-close" aria-label="Close" onclick="deletarInvestimento(${investimento.id})"></button>
                                    <h5 class="card-title">${investimento.nome_ativo}</h5>
                                    <p class="card-text mb-1"><strong>Quantidade:</strong> ${investimento.quantidade}</p>
                                    <p class="card-text mb-2"><strong>Valor Investido:</strong> R$ ${investimento.valor_investido.toFixed(2)}</p>
                                    <span class="badge bg-secondary me-2">${investimento.tipo.nome}</span>
                                    <button class="btn btn-sm btn-outline-primary" onclick="abrirModalEdicao(${investimento.id})">Editar</button>
                                </div>
                            </div>
                        </div>
                    `;
                    listaContainer.innerHTML += cardHtml;
                });
            } else {
                listaContainer.innerHTML = '<p class="text-center text-muted">Nenhum investimento cadastrado ainda.</p>';
            }
        })
        .catch(error => console.error('Erro ao listar investimentos:', error));
}

/**
 * Função para lidar com a submissão do formulário de adição.
 */
function adicionarInvestimento(event) {
    event.preventDefault();
    const nomeAtivoInput = document.getElementById('nome_ativo');
    const tipoIdInput = document.getElementById('tipo_investimento');
    const quantidadeInput = document.getElementById('quantidade');
    const valorInvestidoInput = document.getElementById('valor_investido');
    const errorDiv = document.getElementById('error-message');

    if (!nomeAtivoInput.value || !tipoIdInput.value || !quantidadeInput.value || !valorInvestidoInput.value) {
        errorDiv.textContent = 'Por favor, preencha todos os campos.';
        errorDiv.style.display = 'block';
        return;
    }
    errorDiv.style.display = 'none';

    const novoInvestimento = {
        nome_ativo: nomeAtivoInput.value,
        quantidade: parseFloat(quantidadeInput.value),
        valor_investido: parseFloat(valorInvestidoInput.value),
        tipo_id: parseInt(tipoIdInput.value)
    };

    fetch(`${API_URL}/investimento`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoInvestimento),
    })
        .then(response => {
            if (!response.ok) throw new Error('Erro ao adicionar investimento');
            return response.json();
        })
        .then(() => {
            document.getElementById('form-adicionar-investimento').reset();
            listarInvestimentos();
        })
        .catch(error => {
            errorDiv.textContent = error.message;
            errorDiv.style.display = 'block';
        });
}

/**
 * Função para abrir o modal de edição e preencher com os dados do investimento.
 */
function abrirModalEdicao(id) {
    fetch(`${API_URL}/investimento?id=${id}`)
        .then(response => response.json())
        .then(investimento => {
            document.getElementById('edit_investimento_id').value = investimento.id;
            document.getElementById('edit_nome_ativo').value = investimento.nome_ativo;
            document.getElementById('edit_tipo_investimento').value = investimento.tipo.id;
            document.getElementById('edit_quantidade').value = investimento.quantidade;
            document.getElementById('edit_valor_investido').value = investimento.valor_investido;

            editModalInstance.show();
        })
        .catch(error => console.error('Erro ao buscar dados para edição:', error));
}

/**
 * Função para salvar as alterações feitas no modal de edição.
 */
function salvarAlteracoes() {
    const id = document.getElementById('edit_investimento_id').value;
    const dadosAtualizados = {
        nome_ativo: document.getElementById('edit_nome_ativo').value,
        quantidade: parseFloat(document.getElementById('edit_quantidade').value),
        valor_investido: parseFloat(document.getElementById('edit_valor_investido').value),
        tipo_id: parseInt(document.getElementById('edit_tipo_investimento').value)
    };

    fetch(`${API_URL}/investimento?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosAtualizados),
    })
        .then(response => {
            if (!response.ok) throw new Error('Erro ao salvar alterações');
            return response.json();
        })
        .then(() => {
            editModalInstance.hide();
            listarInvestimentos();
        })
        .catch(error => console.error('Erro:', error));
}

/**
 * Função para deletar um investimento.
 */
function deletarInvestimento(id) {
    if (!confirm('Tem certeza de que deseja remover este investimento?')) return;

    fetch(`${API_URL}/investimento?id=${id}`, { method: 'DELETE' })
        .then(response => {
            if (!response.ok) throw new Error('Erro ao deletar');
            listarInvestimentos();
        })
        .catch(error => console.error('Erro:', error));
}

/**
 * Função principal de inicialização.
 */
function inicializar() {
    const formAdicionar = document.getElementById('form-adicionar-investimento');
    formAdicionar.addEventListener('submit', adicionarInvestimento);

    const btnAbrirModalTipo = document.getElementById('btn-abrir-modal-tipo');
    btnAbrirModalTipo.addEventListener('click', () => addTipoModalInstance.show());

    const btnSalvarNovoTipo = document.getElementById('btn-salvar-novo-tipo');
    btnSalvarNovoTipo.addEventListener('click', adicionarTipoInvestimento);

    const btnSalvarEdicao = document.getElementById('btn-salvar-edicao');
    btnSalvarEdicao.addEventListener('click', salvarAlteracoes);

    // Inicializa as instâncias dos modais do Bootstrap
    const editModalEl = document.getElementById('editModal');
    editModalInstance = new bootstrap.Modal(editModalEl);
    const addTipoModalEl = document.getElementById('addTipoModal');
    addTipoModalInstance = new bootstrap.Modal(addTipoModalEl);

    carregarTiposInvestimento();
    listarInvestimentos();
}

document.addEventListener('DOMContentLoaded', inicializar);