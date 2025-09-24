import app

pergunta = input('''
_________________________________        
[1] Um adicionar um produto
[2] Atualizar dados do banco de dados
[3] Fazer movimentação de uma
[3] Excluir dado
[4] Sair  
_________________________________
                 
Escolha uma opção: ''')

if pergunta == '1':
    nome = input('Nome: ').strip()
    total_no_estoque = input('Total no estoque: ').strip()
    valor = input('Valor (unidade): ').strip()
    
    print('-----------')
    app.mostrar_tabela("Categorias")
    print('-----------')
    categoria= input('Escolha uma opção:').strip()


    app.adicionar_dados('Produtos', (nome, total_no_estoque, valor, categoria))

    app.mostrar_tabela('Produtos')

if pergunta == '2':

    i = int(input('''
[1] Categorias
[2] Produtos
[3] Movimentação
[4] Tipo de Movimentação
        
Qual tabela você gostaria de alterar? '''))

    

    opcao = {
        1: "Categorias",
        2: "Produtos",
        3: "Movimentacao",
        4: "tipo_movimentacao"
    }

    tabela = opcao.get(i)

    app.mostrar_tabela(tabela)

    id = input("Digite o id do item que dejesa atualizar: ").strip()
    campo = input(f"Qual atributo você dejesa atualizar? {', '.join(app.pegar_atributos(tabela, id=False))}: ").lower().strip()
    valor_novo = input(f"Digite um novo valor: ").strip()

    app.atualizar_dados(tabela, campo, valor_novo, id)

    app.mostrar_tabela(tabela)

    
    



