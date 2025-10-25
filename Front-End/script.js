/* Funções */ 


async function desativar(nome_tabela, id){
    fetch(`http://127.0.0.1:5000/${nome_tabela}/desativar/${id}`, {
        method: 'PATCH'
    })

    .then(async response => {
        if (response.ok) {  // checa se deu sucesso (status 200)
            await atualizar_tabela(nome_tabela);
        } else {
            console.error("Erro ao desativar o produto");
        }
    })

    .catch(error => console.error(error));
}

async function atualizar(nome_tabela, atributo, valor_novo, id){
    try {
        const response = await fetch(`http://127.0.0.1:5000/${nome_tabela}/atualizar`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, nome_tabela, atributo, valor_novo })
        });

        const data = await response.json();

        if(data.sucesso){ // ⚠️ mudou de success para sucesso
            Swal.fire('Sucesso', data.mensagem, 'success');
        } else {
            Swal.fire('Erro', 'Não foi possível atualizar o registro', 'error');
        }

    } catch (erro) {
        console.error('Erro na requisição:', erro);
        Swal.fire('Erro', 'Erro ao atualizar o registro', 'error');
    }
}



async function adicionar_dados(nome_tabela, dados){
    const res = await fetch(`http://127.0.0.1:5000/${nome_tabela}/adicionar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    });

    if (!res.ok) throw new Error('Erro na requisição');

    return await res.json(); // retorna o JSON do back-end
}

async function pegar_dados(nome_tabela, atributo=false, mostrar_desativados=false, letras='', filtros='', colunaPesquisa='nome') { 
    try { 
        let response;
        let dados;

        if (atributo) { 
            response = await fetch(`http://127.0.0.1:5000/${nome_tabela}/atributos`);
        } else { 
            response = await fetch(`http://127.0.0.1:5000/${nome_tabela}?${filtros}&apagados=${mostrar_desativados}&letras=${letras}&pesquisa=${colunaPesquisa}`);
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
    tr.appendChild(th); // adiciona o th à tr

    dados_atributos.forEach(atributo => {
        if (atributo == 'ativo'){
            return;
        }
        const th = document.createElement('th');
        th.textContent = atributo; // Aqui vai adicionar o atributo no th

        tr.appendChild(th); // adiciona o th à tr
    })
        

    const tbody = document.createElement('tbody');
    tabela.appendChild(tbody);

    dados.forEach(linha => {
        const tr = document.createElement('tr');
        tbody.appendChild(tr);

        // coluna dos botões
        const div = document.createElement('div');
        const editar = document.createElement('button');
        editar.innerHTML = '<span class="material-symbols-outlined">edit</span>';
        editar.classList.add('editar');

        const excluir = document.createElement('button');
        excluir.innerHTML = '<span class="material-symbols-outlined">delete</span>';
        excluir.classList.add('excluir');
        excluir.setAttribute('aria-label', 'Excluir registro');

        div.appendChild(editar);
        div.appendChild(excluir);
        tr.appendChild(div);

        excluir.addEventListener('click', () => {
            Swal.fire({
                title: 'Tem certeza?',
                text: 'Você vai desativar este registro!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#dc3545',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Sim, desativar!',
                cancelButtonText: 'Cancelar'
            }).then(result => {
                if(result.isConfirmed){
                    desativar(nome_tabela, linha[0]);
                }
            });
        });

        linha.forEach((valor, index) => {
            const td = document.createElement('td');
            td.textContent = valor;
            tr.appendChild(td);
        });

        editar.addEventListener('click', () => {
            const tds = tr.querySelectorAll('td');
            const ths = Array.from(document.querySelectorAll(`#${nome_tabela} #tabela thead tr th`)).slice(1);

            // transforma todos em input e guarda valor original e atributo
            tds.forEach((td, i) => {
                const atributo = ths[i] ? ths[i].textContent : `coluna${i}`;
                td.dataset.valorOriginal = td.textContent;
                td.dataset.atributo = atributo;

                if (atributo.toLowerCase().includes('data')) {
                    // Converte o valor original para o formato YYYY-MM-DDTHH:MM
                    const valor = new Date(td.textContent).toISOString().slice(0,16);
                    td.innerHTML = `<input type="datetime-local" value="${valor}">`;
                } else {
                    td.innerHTML = `<input type="text" value="${td.textContent}">`;
                }
            });

            div.innerHTML = '';

            

            const confirmar = document.createElement('button');
            confirmar.innerHTML = '<span class="material-symbols-outlined">check</span>';
            confirmar.className = 'confirmar';
            div.appendChild(confirmar);

            confirmar.addEventListener('click', async () => {
                const id = linha[0];

                // pede a confirmação apenas uma vez
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
                    for (const td of tds) {
                        const input = td.querySelector('input');
                        const novoValor = input.value.trim();
                        const valorOriginal = td.dataset.valorOriginal;
                        const atributo = td.dataset.atributo;

                        if (novoValor === '') {
                            Swal.fire('Erro', 'O valor não pode ficar vazio!', 'error');
                            return;
                        }

                        if (novoValor !== valorOriginal) {
                            await atualizar(nome_tabela, atributo, novoValor, id);
                        }
                    }

                    // Só aqui, depois de atualizar todos os campos, atualiza a tabela
                    await atualizar_tabela(nome_tabela);
}
            });
            

            const voltar = document.createElement('button');
            voltar.innerHTML = '<span class="material-symbols-outlined">close</span>'
            voltar.className = 'voltar'
            div.appendChild(voltar)


            voltar.addEventListener('click', () => {
                Swal.fire({
                    title: 'Cancelar edição?',
                    text: 'As alterações não serão salvas.',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#dc3545', // vermelho
                    cancelButtonColor: '#6c757d',
                    confirmButtonText: 'Sim, cancelar',
                    cancelButtonText: 'Voltar',
                }).then(async (result) => {
                        if (result.isConfirmed) {
                            await atualizar_tabela(nome_tabela);
                    }else{
                        return
                    }
                })  
            });
        })
    })
};

let nome_tabela_atual = '';           



const botao_estoque = document.getElementById('botao_estoque');
const sub_menu_estoque = document.getElementById('sub_menu_estoque');

botao_estoque.addEventListener('click', () => {
    sub_menu_estoque.classList.toggle('ativa');
    botao_estoque.classList.toggle('ativo'); 
});

const abas = document.querySelectorAll('#sub_menu_estoque li');
const telas = document.querySelectorAll('.tela');

abas.forEach(aba => {
    aba.addEventListener('click', async () => {
        nome_tabela_atual = aba.getAttribute('data-tabela').toLowerCase();

        // esconde todas as telas
        telas.forEach(tela => tela.classList.remove('ativa'));

        // mostra só a selecionada
        document.getElementById(nome_tabela_atual).classList.add('ativa');

        await atualizar_tabela(nome_tabela_atual);



        const inputpesquisa = document.getElementById(`pesquisa_${nome_tabela_atual}`);

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


        /* Filtro*/ 

        const botao_filtros = document.querySelector(`#${nome_tabela_atual} .botao_filtros`)
        const cortina_filtros = document.querySelector(`#${nome_tabela_atual} .cortina_filtros`)
        const botao_fechar_filtro = document.querySelector(`#${nome_tabela_atual} .botao_fechar`)

        botao_filtros.addEventListener('click', () => {
            cortina_filtros.style.display = 'grid';
            botao_filtros.style.display = 'none';
            const valores_inputs = document.querySelectorAll(`#${nome_tabela_atual} .cortina_filtros input`);


            const filtros = {};
            valores_inputs.forEach(input => {
                if(input.value.trim() !== '') {
                    filtros[input.name] = input.value.trim();
                }
            });


            const selecionar = document.querySelectorAll(`#${nome_tabela_atual} .cortina_filtros select`)

            selecionar.forEach(campos => {
                campos.innerHTML = '<option value="" disabled selected>Selecione</option>';

                pegar_dados(campos.name)
                .then(dados => {
                    dados.forEach(linha => {
                        const option = document.createElement('option');
                        option.value = linha[0]
                        option.textContent = linha[1]; 
                        campos.appendChild(option);
                    });
                });

                if (campos.value) {
                    filtros[campos.name] = campos.value;
                }
            });

            const filtro_aplicar = document.getElementById(`filtro_aplicar_${nome_tabela_atual}`)


            filtro_aplicar.addEventListener('click', async () => {
                const filtros_atualizados = {};

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

                // Cria query string
                const params = new URLSearchParams(filtros_atualizados).toString();

                // Chama o backend
                const dados = await pegar_dados(nome_tabela_atual, false, false, '', params);

                await atualizar_tabela(nome_tabela_atual, dados);
            });
            
        })

        botao_fechar_filtro.addEventListener('click', () => { 
            cortina_filtros.style.display = 'none';
            botao_filtros.style.display = 'flex';

        })

        /* Cadastrar Produto */


        const exibir_cadastro = document.querySelector(`#${nome_tabela_atual} .exibir_cadastro`)

        const aba_cadastrar = document.querySelector(`#${nome_tabela_atual} .aba_cadastrar`)

        const botao_fechar_cadastro = document.querySelector(`#${nome_tabela_atual} .fechar_cadastro`)
        const botao_voltar_cadastro = document.querySelector(`#${nome_tabela_atual} .botao_voltar`)

        exibir_cadastro.addEventListener('click', () => {
            aba_cadastrar.style.display = 'flex';


            const selects = document.querySelectorAll(`#${nome_tabela_atual} .aba_cadastrar select`)

            selects.forEach(campos => {
                campos.innerHTML = '<option value="" disabled selected>Selecione</option>';

                pegar_dados(campos.name)
                .then(dados => {
                    dados.forEach(linha => {
                        
                        const option = document.createElement('option');
                        option.value = linha[0]
                        option.textContent = linha[1]; 
                        campos.appendChild(option);
                    });
                });
            });
        })

        /* Salvar Cadastro */ 

        const botao_salvar = document.querySelector(`#${nome_tabela_atual} .aba_cadastrar .botao_salvar`)

        botao_salvar.addEventListener('click', async () => {
            const cadastro_atualizado = {};

            const cadastrado_inputs = document.querySelectorAll(`#${nome_tabela_atual} .aba_cadastrar input`);

            cadastrado_inputs.forEach(input => {
                if(input.value.trim() !== '') {
                    cadastro_atualizado[input.id] = input.value.trim();
                } else {
                    Swal.fire('Erro', 'Por favor, preencha todos os campos!', 'error');
                    return;
                }
            });

            const selects = document.querySelectorAll(`#${nome_tabela_atual} .aba_cadastrar select`);

            // Captura selects
            selects.forEach(campos => {
                if (campos.value) {
                    cadastro_atualizado[campos.id] = campos.value;
                }
            });
            
            

            try {
                // Alerta de confirmação antes de cadastrar
                const result = await Swal.fire({
                    title: 'Cadastrar produto',
                    text: 'Tem certeza que deseja cadastrar este item?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonColor: '#28a745', // verde
                    cancelButtonColor: '#6c757d', // cinza
                    confirmButtonText: 'Sim, cadastrar',
                    cancelButtonText: 'Cancelar',
                    reverseButtons: true
                });

                // Se o usuário confirmar
                if (result.isConfirmed) {
                    const resposta = await adicionar_dados(nome_tabela_atual, cadastro_atualizado);

                    if (resposta.sucesso) {
                        Swal.fire('Sucesso', 'Item cadastrado com sucesso!', 'success');
                        aba_cadastrar.style.display = 'none';
                        await atualizar_tabela(nome_tabela_atual);
                    } else {
                        Swal.fire('Erro', resposta.mensagem, 'error');
                    }
                }

            } catch (erro) {
                console.error(erro);
                Swal.fire('Erro', 'Não foi possível conectar ao servidor!', 'error');
            }
        });

        botao_fechar_cadastro.addEventListener('click', () => {
            aba_cadastrar.style.display = 'none';
        })

        botao_voltar_cadastro.addEventListener('click', () => {
            aba_cadastrar.style.display = 'none';
        })

    });
}); 







    












