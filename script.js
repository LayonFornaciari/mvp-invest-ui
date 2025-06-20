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

    const nomeAtivo = document.getElementById('nome_ativo').value;
    const tipoId = document.getElementById('tipo_investimento').value;
    const quantidade = parseFloat(document.getElementById('quantidade').value);
    const valorInvestido = parseFloat(document.getElementById('valor_investido').value);

    // Validação simples
    if (!nomeAtivo || !tipoId || isNaN(quantidade) || isNaN(valorInvestido)) {
        alert('Por favor, preencha todos os campos corretamente.');
        return;
    }

    const novoInvestimento = {
        nome_ativo: nomeAtivo,
        quantidade: quantidade,
        valor_investido: valorInvestido,
        tipo_id: parseInt(tipoId)
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
            // Limpa o formulário e atualiza a lista
            document.getElementById('form-adicionar-investimento').reset();
            listarInvestimentos();
        })
        .catch(error => {
            console.error('Erro:', error);
            alert(`Não foi possível adicionar o investimento: ${error.message}`);
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
            // Apenas recarrega a lista para mostrar a remoção
            listarInvestimentos();
        })
        .catch(error => {
            console.error('Erro ao deletar:', error);
            alert(`Não foi possível remover o investimento: ${error.message}`);
        });
}


// Função principal que é executada quando a página carrega
function inicializar() {
    // Adiciona o listener de evento para o formulário
    const form = document.getElementById('form-adicionar-investimento');
    form.addEventListener('submit', adicionarInvestimento);

    // Carrega os dados iniciais da API
    carregarTiposInvestimento();
    listarInvestimentos();
}

// Inicia a aplicação quando o DOM estiver completamente carregado
document.addEventListener('DOMContentLoaded', inicializar);