/* Funções */ 


async function desativar(id) {
    return fetch(`http://localhost:5000/produtos/desativar/${id}`, {
        method: 'PATCH'
    })
    .then(async response => {
        if (response.ok) {
            await atualizar_tabela('produtos');
        } else {
            console.error("Erro ao desativar o produto");
        }
    })
    .catch(error => console.error(error));
}

async function deletar(nome_tabela, id) {
    return fetch(`http://localhost:5000/${nome_tabela}/excluir/${id}`, {
        method: 'DELETE'
    })
    .then(async response => {
        if (response.ok) {
            await atualizar_tabela(nome_tabela);
        } else {
            console.error("Erro ao excluir o item");
        }
    })
    .catch(error => console.error(error));
}


async function atualizar(nome_tabela, atributo, valor_novo, id){
    try {
        const response = await fetch(`http://localhost:5000/${nome_tabela}/atualizar`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, nome_tabela, atributo, valor_novo })
        });

        const data = await response.json();

        if(data.sucesso){ // ⚠️ mudou de success para sucesso
            console.log(data.mensagem)
        } else {
            Swal.fire('Erro', 'Não foi possível atualizar o registro', 'error');
        }

    } catch (erro) {
        console.error('Erro na requisição:', erro);
        Swal.fire('Erro', 'Erro ao atualizar o registro', 'error');
    }
}



async function adicionar_dados(nome_tabela, dados){
    const res = await fetch(`http://localhost:5000/${nome_tabela}/adicionar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    });

    if (!res.ok) throw new Error('Erro na requisição');

    return await res.json(); // retorna o JSON do back-end
}

async function pegar_dados(nome_tabela, atributo=false, mostrar_desativados=false, letras='', filtros='', colunaPesquisa='nome', id=false) { 
    try { 
        let response;
        let dados;

        if (atributo) { 
            response = await fetch(`http://localhost:5000/${nome_tabela}/atributos`);
        } else { 
            response = await fetch(`http://localhost:5000/${nome_tabela}?${filtros}&apagados=${mostrar_desativados}&letras=${letras}&pesquisa=${colunaPesquisa}&id=${id}`);
        }

        // Verifica se o servidor respondeu corretamente
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        dados = await response.json(); 
        return dados; 

    } catch (erro) { 
        console.error("Servidor offline ou erro de conexão:", erro);

        Swal.fire({
            icon: 'error',
            title: 'Servidor Offline',
            text: 'Não foi possível conectar ao servidor. Servidor offline ou erro de conexão',
            confirmButtonText: 'Ok'
        });

        // Retorna um array vazio pra evitar erro nas funções que usam esses dados
        return [];
    } 
}

async function dados_geral() {
    try {
        const response = await fetch(`http://localhost:5000/visao_geral/dados/resumo`);
        const dados = await response.json();

        const produtos = dados.produtos;
        const saidasMes = dados.saidas_mes;
        const entradasMes = dados.entradas_mes;
        const valorEstoque = Number(dados.valor_estoque)
        const valorFormatado = valorEstoque.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });

        const h3produtos = document.getElementById('dado_produtos')
        const h3saidasMes = document.getElementById('dado_saidas')
        const h3entradasMes = document.getElementById('dado_entradas')
        const h3valorEstoque = document.getElementById('dado_total')

        h3produtos.innerText = produtos
        h3saidasMes.innerText = saidasMes
        h3entradasMes.innerText = entradasMes
        h3valorEstoque.innerText = valorFormatado;

        const h4_mes = document.querySelectorAll('.h4_mes');

        const dataAtual = new Date(); 
        const nomeMes = dataAtual.toLocaleString('pt-BR', { month: 'long' });
        const mesFormatado = nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);

        h4_mes.forEach(elemento => {
            if (elemento.innerText.includes(mesFormatado)) {
                return;
            } else {
                elemento.innerText += ` (${mesFormatado})`;
            }
        });



    } catch (erro) {
        console.error('Erro ao carregar gráfico:', erro);
    }
}


let graficos = {}; // objeto global para armazenar os gráficos

async function carregarGrafico(nome_coluna, idCanvas) {
    try {
        const response = await fetch(`http://localhost:5000/visao_geral/grafico/${nome_coluna}`);
        const dados = await response.json();

        const nomesProdutos = dados.map(item => item[0]);
        const valores = dados.map(item => item[1]);

        const coresPadrao = ['#0387a5ff', '#8cc3cfff', '#3aa154ff', '#bd5935ff', '#c72727ff'];
        const cores = nomesProdutos.map((_, index) => coresPadrao[index % coresPadrao.length]);

        const ctx = document.getElementById(idCanvas).getContext('2d');
        
        const h5 = document.getElementById("h5_saida_mes")
        
        const dataAtual = new Date(); 
        const nomeMes = dataAtual.toLocaleString('pt-BR', { month: 'long' });
        const mesFormatado = nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);

        h5.innerText = `(${mesFormatado})`

        // 🔥 se já existir um gráfico nesse canvas, destrói antes de criar outro
        if (graficos[idCanvas]) {
            graficos[idCanvas].destroy();
        }

        graficos[idCanvas] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: nomesProdutos,
                datasets: [{
                    data: valores,
                    backgroundColor: cores,
                    borderColor: '#fff',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, 
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label?.nome || context.label || '';
                                const valor = context.parsed?.y ?? context.parsed ?? '';
                                return `${label}: ${valor}`;
                            }
                        }
                    },
                    datalabels: {
                        color: '#fff',
                        font: { weight: 'bold' },
                        formatter: (value) => value
                    }
                }
            },
            plugins: [ChartDataLabels]
        });

    } catch (erro) {
        console.error('Erro ao carregar gráfico:', erro);
    }
}


const loading = document.getElementById("loading-screen");

window.addEventListener("load", () => {
    // Dá um pequeno delay só pra deixar mais suave (opcional)
        dados_geral()
        carregarGrafico("saida_mes", "grafico_saida_mes");
        carregarGrafico("saida_ano", "grafico_saida_ano");

    setTimeout(() => {
        loading.classList.add("hidden"); // esconde a tela de carregamento
    }, 1000);
});

/* Tabela */ 


async function atualizar_tabela(nome_tabela, dados = null, mostrar_desativados = false) {
    

    if (dados == null){
        dados = await pegar_dados(nome_tabela, false, mostrar_desativados);
    }

    dados_atributos = await pegar_dados(nome_tabela, true);

    const tabela = document.querySelector(`#${nome_tabela} #tabela`);
    tabela.innerHTML = ''; 

    const thead = document.createElement('thead'); 
    tabela.appendChild(thead);

    const tr = document.createElement('tr');
    thead.appendChild(tr);

    const th = document.createElement('th');
    th.textContent = '';
    tr.appendChild(th);

    dados_atributos.forEach(atributo => {
        if (atributo == 'ativo') return;
        const th = document.createElement('th');
        th.textContent = atributo;
        tr.appendChild(th);
    });

    const tbody = document.createElement('tbody');
    tabela.appendChild(tbody);

    dados.forEach(linha => {
        const tr = document.createElement('tr');
        tbody.appendChild(tr);

        const tdAcoes = document.createElement('td'); // cria td
        const div = document.createElement('div');    // div dentro do td

        const editar = document.createElement('button');
        editar.innerHTML = '<span class="material-symbols-outlined">edit</span>';
        editar.classList.add('editar');

        const excluir = document.createElement('button');
        excluir.innerHTML = '<span class="material-symbols-outlined">delete</span>';
        excluir.classList.add('excluir');
        excluir.setAttribute('aria-label', 'Excluir registro');

        div.appendChild(editar);
        div.appendChild(excluir);
        tdAcoes.appendChild(div); // adiciona div no td
        tr.appendChild(tdAcoes);  // adiciona td na tr

        // listener do excluir
        excluir.addEventListener('click', async () => {
            const result = await Swal.fire({
                title: 'Tem certeza?',
                text: 'Você vai excluir este registro!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#dc3545',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Sim, excluir!',
                cancelButtonText: 'Cancelar'
            });

            if (result.isConfirmed) {
                loading.classList.remove("hidden");

                if (nome_tabela_atual == 'produtos') {
                    await desativar(linha[0]); // espera a função terminar
                } else {
                    await deletar(nome_tabela, linha[0]);
                }

                loading.classList.add("hidden");
            }

        });


        // adiciona os dados da linha
        linha.forEach((valor) => {
            const td = document.createElement('td');
            td.textContent = valor;
            tr.appendChild(td);
        });

        // listener do editar
        editar.addEventListener('click', () => {
            const tds = Array.from(tr.querySelectorAll(`#${nome_tabela} td`)).slice(1);
            const ths = Array.from(document.querySelectorAll(`#${nome_tabela} #tabela thead tr th`)).slice(1);

            tds.forEach((td, i) => {
                const atributo = ths[i] ? ths[i].textContent : `coluna${i}`;
                td.dataset.valorOriginal = td.textContent;
                td.dataset.atributo = atributo;

                
                if (atributo.includes('data')) {
                    let valor = td.textContent.trim();
                    const partes = valor.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/);
                    if (partes) {
                        const [_, dia, mes, ano, hora, minuto] = partes;
                        valor = `${ano}-${mes}-${dia}T${hora}:${minuto}`;
                    }
                    td.innerHTML = `<input type="datetime-local" value="${valor}">`;
                } else {
                    td.innerHTML = `<input type="text" value="${td.textContent}">`;
                }

            });

            div.innerHTML = ''; // limpa os botões antigos

            const confirmar = document.createElement('button');
            confirmar.innerHTML = '<span class="material-symbols-outlined">check</span>';
            confirmar.className = 'confirmar';
            div.appendChild(confirmar);

            const voltar = document.createElement('button');
            voltar.innerHTML = '<span class="material-symbols-outlined">close</span>';
            voltar.className = 'voltar';
            div.appendChild(voltar);

            confirmar.addEventListener('click', async () => {
                const id = linha[0];

                const result = await Swal.fire({
                    title: 'Confirmar atualização?',
                    text: 'Deseja realmente salvar as alterações?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Sim, confirmar',
                    confirmButtonColor: '#28a745',
                    cancelButtonColor: '#8e9499ff',
                    cancelButtonText: 'Voltar'
                });

                if (result.isConfirmed) {
                    loading.classList.remove("hidden");
                    for (const td of tds) {
                        const input = td.querySelector('input');
                        const novoValor = input.value.trim();
                        const valorOriginal = td.dataset.valorOriginal;
                        const atributo = td.dataset.atributo;

                        if (novoValor === '') {
                            Swal.fire('Erro', 'O valor não pode ficar vazio!', 'error');
                            await atualizar_tabela(nome_tabela);
                            return;
                        }

                        if (novoValor !== valorOriginal) {
                            await atualizar(nome_tabela, atributo, novoValor, id);
                            await atualizar_tabela(nome_tabela);
                            loading.classList.add("hidden");
                            Swal.fire('Sucesso', 'Item alterado com sucesso!', 'success');
                        }
                    }

                }
            });

            voltar.addEventListener('click', () => {
                Swal.fire({
                    title: 'Cancelar edição?',
                    text: 'As alterações não serão salvas.',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#dc3545',
                    cancelButtonColor: '#6c757d',
                    confirmButtonText: 'Sim, cancelar',
                    cancelButtonText: 'Voltar',
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        await atualizar_tabela(nome_tabela);
                    } else {
                        return;
                    }
                });
            });
        });
    });
}






let nome_tabela_atual = '';           



const botao_estoque = document.getElementById('botao_estoque');
const sub_menu_estoque = document.getElementById('sub_menu_estoque');

botao_estoque.addEventListener('click', () => {
    sub_menu_estoque.classList.toggle('ativa');
    botao_estoque.classList.toggle('ativo'); 
});

const abas = document.querySelectorAll('#sub_menu_estoque li, #menu_estoque li.sem_sub');


const telas = document.querySelectorAll('.tela');

atualizar_grafico = document.getElementById("atualizar_graficos") 


atualizar_grafico.addEventListener('click', async () => {
    loading.classList.remove("hidden");

    dados_geral()
    carregarGrafico("saida_mes", "grafico_saida_mes");
    carregarGrafico("saida_ano", "grafico_saida_ano");

    setTimeout(() => {
        loading.classList.add("hidden"); // esconde a tela de carregamento
    }, 1000);

})


abas.forEach(aba => {
    aba.addEventListener('click', async () => {
        loading.classList.remove("hidden");

        nome_tabela_atual = aba.getAttribute('data-tabela').toLowerCase();

        // esconde todas as telas
        telas.forEach(tela => tela.classList.remove('ativa'));

        // mostra só a selecionada
        document.getElementById(nome_tabela_atual).classList.add('ativa');
        if (nome_tabela_atual !== 'visao_geral') {
            await atualizar_tabela(nome_tabela_atual);
            
        }

        loading.classList.add("hidden");

        const inputpesquisa = document.getElementById(`pesquisa_${nome_tabela_atual}`);

        if (inputpesquisa) {

            inputpesquisa.onkeydown = async (e) => {
            if (e.key === 'Enter') {
                e.preventDefault(); // previne efeito do Enter
                inputpesquisa.blur();

                // Verifica campo vazio
                if (inputpesquisa.value.trim() === "") {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Campo vazio!',
                        text: 'Digite algo para pesquisar.',
                        confirmButtonColor: '#007bff',
                    });
                    return; // impede que continue a execução
                }

                let colunaPesquisa = 'nome'

                if (nome_tabela_atual === 'movimentacoes') {

                    colunaPesquisa = 'produto_id'; 
                }

                // Busca dados filtrados
                const dados = await pegar_dados(nome_tabela_atual, false, false, inputpesquisa.value, false, colunaPesquisa);

                // Nenhum dado encontrado
                if (!dados || dados.length === 0){
                    Swal.fire({
                        icon: 'info',
                        iconColor: '#ff934aff',
                        title: 'Nenhum dado encontrado',
                        text: `Não foram encontrados produtos com "${inputpesquisa.value}".`,
                        confirmButtonColor: '#007bff',
                    });
                    return; // para aqui, não atualiza a tabela
                }

                
                await atualizar_tabela(nome_tabela_atual, dados);
            }
            };

            inputpesquisa.oninput = async () => {
                const valorPesquisa = inputpesquisa.value.trim();

                if (valorPesquisa === "") {
                    // Opcional: atualizar tabela com todos os produtos ou limpar
                    const todosProdutos = await pegar_dados(nome_tabela_atual, false);
                    await atualizar_tabela(nome_tabela_atual, todosProdutos);
                    return;
                }

                let colunaPesquisa = 'nome'

                    if (nome_tabela_atual === 'movimentacoes') {

                        colunaPesquisa = 'produto_id'; 
                }

                const dados = await pegar_dados(nome_tabela_atual, false, false, valorPesquisa, false, colunaPesquisa);

                // Atualiza tabela com os resultados
                await atualizar_tabela(nome_tabela_atual, dados);
            };
        }

        

        /* Filtro */
        const botao_filtros = document.querySelector(`#${nome_tabela_atual} .botao_filtros`);
        const cortina_filtros = document.querySelector(`#${nome_tabela_atual} .cortina_filtros`);
        const botao_fechar_filtro = document.querySelector(`#${nome_tabela_atual} .botao_fechar`);
        const filtro_aplicar = document.getElementById(`filtro_aplicar_${nome_tabela_atual}`);

        if (botao_filtros && cortina_filtros && botao_fechar_filtro && filtro_aplicar) {

            // Abrir filtro e popular selects
            botao_filtros.addEventListener('click', async () => {
                cortina_filtros.style.display = 'grid';
                botao_filtros.style.display = 'none';
                loading.classList.remove("hidden");

                const selecionar = document.querySelectorAll(`#${nome_tabela_atual} .cortina_filtros select`);

                for (const campos of selecionar) {
                    const dados = await pegar_dados(campos.name);
                    campos.innerHTML = '<option value="" disabled selected>Selecione</option>';
                    dados.forEach(linha => {
                        const option = document.createElement('option');
                        option.value = linha[0];
                        option.textContent = linha[1];
                        campos.appendChild(option);
                    });
                }

                loading.classList.add("hidden");
            });


            // Aplicar filtro (adicionar listener apenas uma vez!)
            filtro_aplicar.addEventListener('click', async () => {
                const valores_inputs = document.querySelectorAll(`#${nome_tabela_atual} .cortina_filtros input`);
                const selecionar = document.querySelectorAll(`#${nome_tabela_atual} .cortina_filtros select`);
                const filtros_atualizados = {};
                loading.classList.remove("hidden");

                // Captura inputs
                valores_inputs.forEach(input => {
                    if (input.value.trim() !== '') {
                        filtros_atualizados[input.name] = input.value.trim();
                    }
                });

                // Captura selects
                selecionar.forEach(campos => {
                    if (campos.value) {
                        filtros_atualizados[campos.name] = campos.value;
                    }
                });

                const params = new URLSearchParams(filtros_atualizados).toString();
                const dados = await pegar_dados(nome_tabela_atual, false, false, '', params);
                await atualizar_tabela(nome_tabela_atual, dados);

                loading.classList.add("hidden");
            });

            // Fechar filtro
            botao_fechar_filtro.addEventListener('click', () => { 
                cortina_filtros.style.display = 'none';
                botao_filtros.style.display = 'flex';
            });
        }


        /* Cadastrar Produto */


        const exibir_cadastro = document.querySelector(`#${nome_tabela_atual} .exibir_cadastro`)

        const aba_cadastrar = document.querySelector(`#${nome_tabela_atual} .aba_cadastrar`)

        const botao_fechar_cadastro = document.querySelector(`#${nome_tabela_atual} .fechar_cadastro`)
        const botao_voltar_cadastro = document.querySelector(`#${nome_tabela_atual} .botao_voltar`)

        if (exibir_cadastro && aba_cadastrar) { 

            botao_fechar_cadastro.addEventListener('click', () => {
                aba_cadastrar.style.display = 'none';
            })

            botao_voltar_cadastro.addEventListener('click', () => {
                aba_cadastrar.style.display = 'none';
            })

            const cacheSelects = {};

            exibir_cadastro.addEventListener('click', () => {
                loading.classList.remove("hidden");

                aba_cadastrar.style.display = 'flex';

                const selects = document.querySelectorAll(`#${nome_tabela_atual} .aba_cadastrar select`);

                selects.forEach(async (campos) => {

                    // Se já tiver dados no cache, só usa
                    if (cacheSelects[campos.name]) {
                        campos.innerHTML = '<option value="" disabled selected>Selecione</option>';
                        cacheSelects[campos.name].forEach(linha => {
                            const option = document.createElement('option');
                            option.value = linha[0];
                            option.textContent = linha[1];
                            campos.appendChild(option);
    
                        });
                        loading.classList.add("hidden");
                    } else {
                        // Senão, busca do backend e guarda no cache
                        const dados = await pegar_dados(campos.name);
                        cacheSelects[campos.name] = dados; // salva no cache

                        campos.innerHTML = '<option value="" disabled selected>Selecione</option>';
                        dados.forEach(linha => {
                            const option = document.createElement('option');
                            option.value = linha[0];
                            option.textContent = linha[1];
                            campos.appendChild(option);
                        });
                        loading.classList.add("hidden");
                    }
                });
            });

            /* Salvar Cadastro */ 

            const botao_salvar = document.querySelector(`#${nome_tabela_atual} .aba_cadastrar .botao_salvar`);

            botao_salvar.addEventListener('click', async () => {
                loading.classList.add("hidden");
                const cadastro_atualizado = {};


                // Captura e valida inputs
                const cadastrado_inputs = document.querySelectorAll(`#${nome_tabela_atual} .aba_cadastrar input`);
                for (const input of cadastrado_inputs) {
                    if (input.value.trim() === '') {
                        Swal.fire('Erro', 'Por favor, preencha todos os campos!', 'error');
                        return; // interrompe o clique
                    }
                    cadastro_atualizado[input.id] = input.value.trim();
                }

                // Captura e valida selects
                const selects = document.querySelectorAll(`#${nome_tabela_atual} .aba_cadastrar select`);
                for (const select of selects) {
                    if (!select.value) {
                        Swal.fire('Erro', 'Por favor, selecione todos os campos!', 'error');
                        return; // interrompe o clique
                    }
                    cadastro_atualizado[select.id] = select.value;
                }

                try {
                    // Alerta de confirmação antes de cadastrar
                    const result = await Swal.fire({
                        title: 'Cadastrar produto',
                        text: 'Tem certeza que deseja cadastrar este item?',
                        icon: 'question',
                        showCancelButton: true,
                        confirmButtonColor: '#28a745',
                        cancelButtonColor: '#6c757d',
                        confirmButtonText: 'Sim, cadastrar',
                        cancelButtonText: 'Cancelar',
                        reverseButtons: true
                    });

                    loading.classList.remove("hidden");

                    // Se o usuário confirmar
                    if (result.isConfirmed) {
                    const resposta = await adicionar_dados(nome_tabela_atual, cadastro_atualizado);

                    if (resposta.sucesso) {
                    await atualizar_tabela(nome_tabela_atual);
                    aba_cadastrar.style.display = 'none';
                    loading.classList.add("hidden");
                    Swal.fire('Sucesso', 'Item cadastrado com sucesso!', 'success');

                    } else {
                        loading.classList.add("hidden");
                        Swal.fire('Erro', resposta.mensagem, 'error');            
                    }
                }

                } catch (erro) {
                    loading.classList.add("hidden");
                    console.error(erro);
                    Swal.fire('Erro', 'Não foi possível conectar ao servidor!', 'error');
                }
            });
            loading.classList.add("hidden");
        }
    })
}); 





