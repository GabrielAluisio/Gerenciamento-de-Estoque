/* Funções */ 


async function desativar(nome_tabela, id){
    fetch(`http://127.0.0.1:5000/${nome_tabela}/Desativar/${id}`, {
        method: 'PATCH'
    })

    .then(async response => {
        if (response.ok) {  // checa se deu sucesso (status 200)
            await atualizar_tabela('Produtos');
        } else {
            console.error("Erro ao desativar o produto");
        }
    })

    .catch(error => console.error(error));
}

async function atualizar(nome_tabela, atributo, valor_novo, id){
    try {
        const response = await fetch(`http://127.0.0.1:5000/${nome_tabela}/Atualizar`, {
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

async function pegar_dados(nome_tabela, atributo=false, mostrar_desativados=false, letras='') { 
    try { 
        if(atributo){ 
            const response = await fetch(`http://127.0.0.1:5000/${nome_tabela}/atributos`)
            const dados = await response.json(); 
            console.log(dados); 
            return dados; 
        } 
        const response = await fetch(`http://127.0.0.1:5000/${nome_tabela}?apagados=${mostrar_desativados}&letras=${letras}`) 
        const dados = await response.json(); 
        console.log(dados); 
        return dados; 
    } catch (erro) { 
        console.error('Erro ao pegar dados:', erro); 
    } 
}




/* Tabela */ 


async function atualizar_tabela(nome_tabela, dados = null, mostrar_desativados = false) {

    if (dados == null){
        dados = await pegar_dados(nome_tabela, false, mostrar_desativados);
    }

    dados_atributos = await pegar_dados(nome_tabela, true);
    

    const tabela = document.getElementById('tabela');
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
            const ths = Array.from(document.querySelectorAll('#tabela thead tr th')).slice(1);

            // transforma todos em input e guarda valor original e atributo
            tds.forEach((td, i) => {
                td.dataset.valorOriginal = td.textContent;
                td.dataset.atributo = ths[i] ? ths[i].textContent : `coluna${i}`;
                td.innerHTML = `<input type="text" value="${td.textContent}">`;
            });

            div.innerHTML = '';

            

            const confirmar = document.createElement('button');
            confirmar.innerHTML = '<span class="material-symbols-outlined">check</span>';
            confirmar.className = 'confirmar';
            div.appendChild(confirmar);

            confirmar.addEventListener('click', async () => {
                const id = linha[0];

                tds.forEach(td => {
                    const input = td.querySelector('input');
                    const novoValor = input.value.trim();
                    const valorOriginal = td.dataset.valorOriginal;
                    const atributo = td.dataset.atributo;

                    if(novoValor === '') {
                        Swal.fire('Erro', 'O valor não pode ficar vazio!', 'error');
                        return;
                    }

                    Swal.fire({
                        title: 'Confirmar atualização?',
                        text: 'Deseja realmente salvar as alterações?',
                        icon: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Sim, confirmar',
                        confirmButtonColor: '#28a745', 
                        cancelButtonColor: '#8e9499ff', 
                        cancelButtonText: 'Voltar'           
                    }).then(async (result) => {
                        if (result.isConfirmed) {

                            if (novoValor !== valorOriginal) {
                                atualizar(nome_tabela, atributo, novoValor, id)
                            }

                            td.textContent = novoValor;
                            await atualizar_tabela('Produtos');
                        }
                    });
                });
            })

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
                            await atualizar_tabela('Produtos');
                    }else{
                        return
                    }
                })  
            });
        })
    })
};

                                            


const botao_estoque = document.getElementById('botao_estoque');
const sub_menu_estoque = document.getElementById('sub_menu_estoque');

botao_estoque.addEventListener('click', () => {
    if (sub_menu_estoque.style.display === 'none'){
        sub_menu_estoque.style.display = 'block';
        botao_estoque.style.borderLeft = '3px solid var(--ciano)';
    }
    else{
        sub_menu_estoque.style.display ='none';
        botao_estoque.style.border = 'none';
    }

    
})


function enviarFiltros() {
    const filtros = {
        preco_min:  document.getElementById('preco_min').value,
        preco_max: document.getElementById('preco_max').value,
        Estoque_min: document.getElementById('Estoque_min').value,
        Estoque_max: document.getElementById('Estoque_max').value,
        categorias_filtro: document.getElementById('categorias_filtro').value
    };

    fetch('http://127.0.0.1:5000/produtos/filtro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filtros)
    })
    .then(res => res.json())
    .then(dados => {
        atualizarTabela(dados);
    });
}


document.addEventListener('DOMContentLoaded', async () => {
    await atualizar_tabela('Produtos');
});

const inputpesquisa = document.getElementById('pesquisa');

inputpesquisa.addEventListener('keydown', async (e) => { 
    if (e.key === 'Enter') {
        const atributo = await pegar_dados('Produtos', true);

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

        // Busca dados filtrados
        const dados = await pegar_dados('Produtos', false, false, inputpesquisa.value);

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

        
        await atualizar_tabela('Produtos', dados);
    }
});

// Usa o evento 'input' para disparar a cada mudança no campo
inputpesquisa.addEventListener('input', async () => {
    const valorPesquisa = inputpesquisa.value.trim();

    if (valorPesquisa === "") {
        // Opcional: atualizar tabela com todos os produtos ou limpar
        const todosProdutos = await pegar_dados('Produtos', false);
        await atualizar_tabela('Produtos', todosProdutos);
        return;
    }

    // Busca dados filtrados
    const dados = await pegar_dados('Produtos', false, false, valorPesquisa);

    // Atualiza tabela com os resultados
    await atualizar_tabela('Produtos', dados);
});







/* Filtro*/ 

const botao_filtros = document.querySelector('.botao_filtros')
const cortina_filtros = document.querySelector('.cortina_filtros')
const botao_fechar_filtro = document.querySelector('.botao_fechar')

botao_filtros.addEventListener('click', () => {
    cortina_filtros.style.display = 'grid';
    botao_filtros.style.display = 'none';
    
})

botao_fechar_filtro.addEventListener('click', () => { 
    cortina_filtros.style.display = 'none';
    botao_filtros.style.display = 'flex';

})


const preco_min = document.getElementById('preco_min')
const preco_max = document.getElementById('preco_max')
const Estoque_min = document.getElementById('Estoque_min')
const categorEstoque_maxias_filtro = document.getElementById('Estoque_max')

const categorias_filtro = document.getElementById('categorias_filtro')

pegar_dados('categorias')
    .then(dados => {
        dados.forEach(linha => {
            const option = document.createElement('option');
            option.value = linha[0]
            option.textContent = linha[1]; 
            categorias_filtro.appendChild(option);
    });
})

const filtro_aplicar = document.getElementById('filtro_aplicar')





/* Cadastrar Produto */


const exibir_cadastro = document.querySelector('.exibir_cadastro')

const aba_cadastrar = document.querySelector('.aba_cadastrar')

const botao_fechar_cadastro = document.querySelector('.fechar_cadastro')
const botao_voltar_cadastro = document.querySelector('.botao_voltar')

exibir_cadastro.addEventListener('click', () => {
    aba_cadastrar.style.display = 'flex';

})

botao_fechar_cadastro.addEventListener('click', () => {
    aba_cadastrar.style.display = 'none';
})

botao_voltar_cadastro.addEventListener('click', () => {
    aba_cadastrar.style.display = 'none';
})


const categoria = document.getElementById('categorias')

pegar_dados('categorias')
    .then(dados => {
        dados.forEach(linha => {
            const option = document.createElement('option');
            option.value = linha[0]
            option.textContent = linha[1]; 
            categoria.appendChild(option);
    });
})






/* Salvar Cadastro */ 

const botao_salvar = document.getElementById('cadastrar_salvar');

botao_salvar.addEventListener('click', async () => {
    const nome = document.getElementById('nome_produto').value;
    const total_estoque = document.getElementById('total_estoque').value;
    const valor = document.getElementById('valor').value;
    const categoria_selecionada = categoria.value;

    // Validação simples
    if (!nome || !total_estoque || !valor || !categoria_selecionada) {
        Swal.fire('Erro', 'Por favor, preencha todos os campos!', 'error');
        return;
    }

    try {
        // Alerta de confirmação antes de cadastrar
        const result = await Swal.fire({
            title: 'Cadastrar produto',
            text: 'Tem certeza que deseja cadastrar este produto?',
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
            const resposta = await adicionar_dados('Produtos', {
                nome,
                total_estoque,
                valor,
                categoria_selecionada
            });

            if (resposta.sucesso) {
                Swal.fire('Sucesso', 'Produto cadastrado com sucesso!', 'success');
                aba_cadastrar.style.display = 'none';
                await atualizar_tabela('Produtos');
            } else {
                Swal.fire('Erro', resposta.mensagem, 'error');
            }
        }

    } catch (erro) {
        console.error(erro);
        Swal.fire('Erro', 'Não foi possível conectar ao servidor!', 'error');
    }
});


