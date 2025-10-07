/* Funções */ 


function desativar(nome_tabela, id){
    fetch(`http://127.0.0.1:5000/${nome_tabela}/Desativar/${id}`, {
        method: 'PATCH'
    })

    .then(response => {
        if (response.ok) {  // checa se deu sucesso (status 200)
            criar_tabela(nome_tabela);  // chama a função só se der certo
        } else {
            console.error("Erro ao desativar o produto");
        }
    })

    .catch(error => console.error(error));
}

function atualizar(nome_tabela, atributo, valor_novo, id){
    fetch(`http://127.0.0.1:5000/${nome_tabela}/Atualizar`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({
            'id': id,
            'nome_tabela': nome_tabela,
            'atributo': atributo,
            'valor_novo': valor_novo
        })
    })

        .then(response => {
            if (response.ok) {  // checa se deu sucesso (status 200)
                criar_tabela(nome_tabela);  // chama a função só se der certo
                return response.json();
            } else {
                console.error("Erro ao desativar o produto");
            }
        })
            .then(data => console.log('Item atualizado:', data))
            .catch(error => console.error(error));

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
        // icone
        editar.innerHTML = '<span class="material-symbols-outlined">edit</span>';

        // botão Delete

        const excluir = document.createElement('button')
        excluir.classList.add('excluir')
        excluir.setAttribute('aria-label', 'Excluir tarefa')

        excluir.addEventListener('click', () => {
            Swal.fire({
                title: 'Tem certeza?',
                text: "Você vai desativar este produto!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#dc3545', // vermelho
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Sim, desativar!',
                cancelButtonText: 'Cancelar'
                
            }).then((result) => {
                if (result.isConfirmed) {
                    desativar(nome_tabela, linha[0]);  // chama sua função
                    }
                })
            })
        // icone
        excluir.innerHTML = '<span class="material-symbols-outlined">delete</span>'

        
        

        const div = document.createElement('div');
        div.appendChild(editar)
        div.appendChild(excluir)

        tr.appendChild(div); 

        linha.forEach((valor, index) => {
            const td = document.createElement('td');
            td.textContent = valor; 

            tr.appendChild(td); 

            editar.addEventListener('click', () => {
                

                td.innerHTML = `<input type="text" value="${valor}">`;
                const inputEdit = td.querySelector('input');

                const confirmar = document.createElement('button');
                confirmar.innerHTML = '<span class="material-symbols-outlined">check</span>';
                confirmar.className = 'confirmar'
                div.replaceChild(confirmar, editar)



                const voltar = document.createElement('button');
                voltar.innerHTML = '<span class="material-symbols-outlined">close</span>'
                voltar.className = 'voltar'
                div.replaceChild(voltar, excluir)


                voltar.addEventListener('click', () => {
                    Swal.fire({
                        title: 'Cancelar edição?',
                        text: 'As alterações não serão salvas.',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#dc3545', // vermelho
                        cancelButtonColor: '#6c757d',
                        confirmButtonText: 'Sim, cancelar',
                        cancelButtonText: 'Voltar',})
                        .then((result) => {
                            if (result.isConfirmed) {
                                criar_tabela(nome_tabela)
                        }else{
                            return
                        }
                        })


                    
                })

                confirmar.addEventListener('click', () => {
                
    
                    const novoValor = inputEdit.value.trim();
                    if(novoValor === '') {
                        Swal.fire('Erro', 'O valor não pode ficar vazio!', 'error');
                        inputEdit.focus();
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
                    }).then((result) => {
                        if (result.isConfirmed) {
                            td.textContent = novoValor; // substitui de volta pelo texto
                                const ths = Array.from(document.querySelectorAll('#tabela thead tr th'));
                                const atributos = ths.slice(1).map(th => th.textContent);
                                const atributo = atributos[index]; // pega o atributo correto correspondente ao td
                                atualizar(nome_tabela, atributo, novoValor, linha[0])
                                Swal.fire('Sucesso', 'Registro atualizado com sucesso!', 'success');
                        }
                    })
                })
            })
        })
    })
};



                                            
                                        
                            



async function criar_tabela(nome_tabela) {
    await mostrar_atributos(nome_tabela);
    await mostrar_colunas(nome_tabela, false); 
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

const botao_aplicar_filtro = document.getElementById('filtro_aplicar')

botao_aplicar_filtro.addEventListener('click', () => {
    salvarEdicao()
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
                criar_tabela('Produtos');
            } else {
                Swal.fire('Erro', resposta.mensagem, 'error');
            }
        }

    } catch (erro) {
        console.error(erro);
        Swal.fire('Erro', 'Não foi possível conectar ao servidor!', 'error');
    }
});


