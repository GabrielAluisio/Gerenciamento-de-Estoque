import app

pergunta = input('''
_________________________________        
[1] Um adicionar um produto
[2] Atualizar dados de um produto
[3] Fazer movimentação de um produto
[3] Excluir produto
[4] Sair  
_________________________________
                 
Escolha uma opção: ''')

if pergunta == '1':
    nome = input('Nome: ')
    total_no_estoque = input('Total no estoque: ')
    valor = input('Valor (unidade): ')
    
    print('-----------')
    app.mostrar_tabela("Categorias")
    print('-----------')
    categoria= input('Escolha uma opção:')


    app.adicionar_dados('Produtos', (nome, total_no_estoque, valor, categoria))

    app.mostrar_tabela('Produtos')

if pergunta == '2':



