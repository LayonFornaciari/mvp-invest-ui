// URL base da sua API (lembre-se de que o servidor do back-end precisa estar rodando)
const API_URL = 'http://127.0.0.1:5000';

/**
 * Função para carregar os tipos de investimento (categorias) da API
 * e preencher o menu dropdown no formulário.
 */
function carregarTiposInvestimento() {
    fetch(`${API_URL}/tipos_investimento`)
        .then(response => response.json())
        .then(data => {
            const selectTipo = document.getElementById('tipo_investimento');
            selectTipo.innerHTML = '<option value="">Selecione um tipo</option>'; // Opção padrão
            data.tipos_investimento.forEach(tipo => {
                const option = document.createElement('option');
                option.value = tipo.id;
                option.textContent = tipo.nome;
                selectTipo.appendChild(option);
            });
        })
        .catch(error => console.error('Erro ao carregar tipos de investimento:', error));
}

/**
 * Função para carregar e exibir a lista de investimentos da API.
 */
function listarInvestimentos() {
    fetch(`${API_URL}/investimentos`)
        .then(response => response.json())
        .then(data => {
            const listaContainer = document.getElementById('lista-investimentos');
            listaContainer.innerHTML = ''; // Limpa a lista antes de recarregar

            if (data.investimentos && data.investimentos.length > 0) {
                data.investimentos.forEach(investimento => {
                    // Cria um card para cada investimento usando as classes do Bootstrap
                    const cardHtml = `
                        <div class="col-md-6">
                            <div class="card card-investimento shadow-sm">
                                <div class="card-body">
                                    <button type="button" class="btn-close" aria-label="Close" onclick="deletarInvestimento(${investimento.id})"></button>
                                    <h5 class="card-title">${investimento.nome_ativo}</h5>
                                    <p class="card-text mb-1">
                                        <strong>Quantidade:</strong> ${investimento.quantidade}
                                    </p>
                                    <p class="card-text mb-2">
                                        <strong>Valor Investido:</strong> R$ ${investimento.valor_investido.toFixed(2)}
                                    </p>
                                    <span class="badge bg-secondary">${investimento.tipo.nome}</span>
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
 * Função para lidar com o envio do formulário e adicionar um novo investimento.
 * @param {Event} event - O evento de submissão do formulário.
 */
function adicionarInvestimento(event) {
    event.preventDefault(); // Impede o recarregamento padrão da página

    const nomeAtivoInput = document.getElementById('nome_ativo');
    const tipoIdInput = document.getElementById('tipo_investimento');
    const quantidadeInput = document.getElementById('quantidade');
    const valorInvestidoInput = document.getElementById('valor_investido');
    const errorDiv = document.getElementById('error-message');

    // Validação personalizada campo a campo
    if (!nomeAtivoInput.value) {
        errorDiv.textContent = 'Por favor, preencha o nome do ativo.';
        errorDiv.style.display = 'block';
        return;
    }
    if (!tipoIdInput.value) {
        errorDiv.textContent = 'Por favor, selecione um tipo de investimento.';
        errorDiv.style.display = 'block';
        return;
    }
    if (!quantidadeInput.value || parseFloat(quantidadeInput.value) <= 0) {
        errorDiv.textContent = 'Por favor, insira uma quantidade válida.';
        errorDiv.style.display = 'block';
        return;
    }
    if (!valorInvestidoInput.value || parseFloat(valorInvestidoInput.value) <= 0) {
        errorDiv.textContent = 'Por favor, insira um valor investido válido.';
        errorDiv.style.display = 'block';
        return;
    }

    // Se todos os campos são válidos, esconde a mensagem de erro
    errorDiv.style.display = 'none';

    const novoInvestimento = {
        nome_ativo: nomeAtivoInput.value,
        quantidade: parseFloat(quantidadeInput.value),
        valor_investido: parseFloat(valorInvestidoInput.value),
        tipo_id: parseInt(tipoIdInput.value)
    };

    fetch(`${API_URL}/investimento`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(novoInvestimento),
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.message || 'Erro ao adicionar investimento') });
            }
            return response.json();
        })
        .then(() => {
            document.getElementById('form-adicionar-investimento').reset();
            listarInvestimentos();
        })
        .catch(error => {
            console.error('Erro:', error);
            errorDiv.textContent = `Não foi possível adicionar o investimento: ${error.message}`;
            errorDiv.style.display = 'block';
        });
}

/**
 * Função para deletar um investimento.
 * @param {number} id - O ID do investimento a ser deletado.
 */
function deletarInvestimento(id) {
    if (!confirm('Tem certeza de que deseja remover este investimento?')) {
        return;
    }

    fetch(`${API_URL}/investimento?id=${id}`, {
        method: 'DELETE',
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.message || 'Erro ao deletar') });
            }
            return response.json();
        })
        .then(() => {
            listarInvestimentos();
        })
        .catch(error => {
            console.error('Erro ao deletar:', error);
            alert(`Não foi possível remover o investimento: ${error.message}`);
        });
}


// Função principal que é executada quando a página carrega
function inicializar() {
    const form = document.getElementById('form-adicionar-investimento');
    form.addEventListener('submit', adicionarInvestimento);

    carregarTiposInvestimento();
    listarInvestimentos();
}

document.addEventListener('DOMContentLoaded', inicializar);
