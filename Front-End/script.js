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

const botao_filtros = document.getElementById('botao_filtros')
const cortina_filtros = document.getElementById('cortina_filtros')
const botao_fechar = document.getElementById('botao_fechar')

botao_filtros.addEventListener('click', () => {
    cortina_filtros.style.display = 'grid';
    botao_filtros.style.display = 'none';


    
})

botao_fechar.addEventListener('click', () => {
    
    
    cortina_filtros.style.display = 'none';
    botao_filtros.style.display = 'flex';

    
})

function mostrar_atributos(nome_tabela){
    fetch(`http://127.0.0.1:5000/${nome_tabela}/atributos`)
        .then(response => response.json())
        .then(dados => {
            const tabela = document.getElementById('tabela');
            tabela.innerHTML = '';

            const thead = document.createElement('thead'); 
            tabela.appendChild(thead);

            const tr = document.createElement('tr');
            thead.appendChild(tr);

            const td = document.createElement('td');
            td.textContent = '';
            tr.appendChild(td); // adiciona o td à tr

            dados.forEach(atributo => {
                const td = document.createElement('td');
                td.textContent = atributo; // Aqui vai adicionar o atributo no td

                tr.appendChild(td); // adiciona o td à tr
            })
        })
        .catch(erro => console.error("Erro ao buscar atributos:", erro));
}




const teste = document.getElementById('cadastro')

teste.addEventListener('click', () => {
    mostrar_atributos('Produtos');
});

