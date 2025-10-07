/* Funções */ 

/* Tabela */ 


async  function mostrar_atributos(nome_tabela){
    const response = await fetch(`http://127.0.0.1:5000/${nome_tabela}/atributos`);
    const dados = await response.json();

    const tabela = document.getElementById('tabela');
    tabela.innerHTML = ''; 

    const thead = document.createElement('thead'); 
    tabela.appendChild(thead);

    const tr = document.createElement('tr');
    thead.appendChild(tr);

    const th = document.createElement('th');
    th.textContent = '';
    tr.appendChild(th); // adiciona o th à tr

    dados.forEach(atributo => {
        if (atributo == 'ativo'){
            return;
        }
        const th = document.createElement('th');
        th.textContent = atributo; // Aqui vai adicionar o atributo no th

        tr.appendChild(th); // adiciona o th à tr
         })
        }


        
async function mostrar_colunas(nome_tabela, mostrar_coluna_ativos = true, mostrar_itens_apagados = false){
    const response = await fetch(`http://127.0.0.1:5000/${nome_tabela}?ativos=${mostrar_coluna_ativos}&apagados=${mostrar_itens_apagados}`)
    const dados = await response.json();


    const tabela = document.getElementById('tabela');

    const tbody = document.createElement('tbody'); 
    tabela.appendChild(tbody);


    dados.forEach(linha => {
        const tr = document.createElement('tr');
        tbody.appendChild(tr);

        // botão Editar



        const editar = document.createElement('button');
        editar.classList.add('editar');
        editar.setAttribute('aria-label', 'Editar tarefa');
        // icone
        editar.innerHTML = '<span class="material-symbols-outlined">edit</span>';

        // botão Delete

        const excluir = document.createElement('button')
        excluir.classList.add('excluir')
        excluir.setAttribute('aria-label', 'Excluir tarefa')
        // icone
        excluir.innerHTML = '<span class="material-symbols-outlined">delete</span>'

        const div = document.createElement('div');
        div.appendChild(editar)
        div.appendChild(excluir)

        tr.appendChild(div); 

        linha.forEach(valor => {
            

            const td = document.createElement('td');
            td.textContent = valor; 

            tr.appendChild(td); 
        })

    })
}

async function criar_tabela(nome_tabela) {
    await mostrar_atributos(nome_tabela);
    await mostrar_colunas(nome_tabela, false); 
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

function pegar_dados(nome_tabela){
    return fetch(`http://127.0.0.1:5000/${nome_tabela}`)
        .then(response => response.json());
}


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


document.addEventListener('DOMContentLoaded', () => {
    criar_tabela('Produtos'); // chama automaticamente ao carregar
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
    const nome = document.getElementById('nome_produto').value
    const total_estoque = document.getElementById('total_estoque').value
    const valor = document.getElementById('valor').value
    const categoria_selecionada = categoria.value

    if (!nome || !total_estoque || !valor || !categoria_selecionada) {
        alert('Preencha todos os campos!');
        return; 
    }

     try {
        const resposta = await adicionar_dados('Produtos', { nome, total_estoque, valor, categoria_selecionada });

        if (resposta.sucesso) {
            aba_cadastrar.style.display = 'none';
            criar_tabela('Produtos');
        } else {
            alert('Erro: ' + resposta.mensagem);
        }

    } catch (erro) {
        console.error('Erro:', erro);
        alert('Erro ao conectar com o servidor!');
    }
});












