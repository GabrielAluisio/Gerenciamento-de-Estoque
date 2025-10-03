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



/* Botão Cadastrar Produto */
const exibir_cadastro = document.getElementById('exibir_cadastro')

const aba_cadastrar = document.getElementById('aba_cadastrar')

const botao_fechar_cadastro = document.getElementById('fechar_cadastro')
const botao_voltar_cadastro = document.getElementById('botao_voltar')

exibir_cadastro.addEventListener('click', () => {
    aba_cadastrar.style.display = 'flex';

})

botao_fechar_cadastro.addEventListener('click', () => {
    aba_cadastrar.style.display = 'none';
})

botao_voltar_cadastro.addEventListener('click', () => {
    aba_cadastrar.style.display = 'none';
})


/* Botão Filtro*/ 

const botao_filtros = document.getElementById('botao_filtros')
const cortina_filtros = document.getElementById('cortina_filtros')
const botao_fechar_filtro = document.getElementById('botao_fechar')

botao_filtros.addEventListener('click', () => {
    cortina_filtros.style.display = 'grid';
    botao_filtros.style.display = 'none';


    
})

botao_fechar_filtro.addEventListener('click', () => {
    
    
    cortina_filtros.style.display = 'none';
    botao_filtros.style.display = 'flex';

    
})
/* Funções */ 

/* Tabela */ 


function mostrar_atributos(nome_tabela){
    fetch(`http://127.0.0.1:5000/${nome_tabela}/atributos`)
        .then(response => response.json())
        .then(dados => {
            const tabela = document.getElementById('tabela');

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
        })
        .catch(erro => console.error("Erro ao buscar atributos:", erro));
}

function mostrar_colunas(nome_tabela, ativos = false){
    fetch(`http://127.0.0.1:5000/${nome_tabela}?ativos=${ativos}`)
        .then(response => response.json())
        .then(dados => {
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
        })
}

function criar_tabela(nome_tabela){
    mostrar_atributos(nome_tabela)
    mostrar_colunas(nome_tabela, true)
}

/* Botão Adicionar */






