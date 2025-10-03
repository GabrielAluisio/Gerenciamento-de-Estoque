import app

pergunta = input('''
_________________________________        
[1] Um adicionar um produto
[2] Atualizar dado no banco de dados
[3] Fazer movimentação de um produto
[4] Excluir dados
_________________________________
                 
Escolha uma opção: ''')

if pergunta == '1':
    nome = input('Nome: ').strip()
    total_no_estoque = input('Total no estoque: ').strip()
    valor = input('Valor (unidade): ').strip()
    
    print('-----------')
    print('-----------')
    categoria= input('Escolha uma opção:').strip()
    ativo = True


    app.adicionar_dados('Produtos', (nome, total_no_estoque, valor, categoria, ativo))

    app.mostrar_tabela_print('Produtos')

elif pergunta == '2':

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

elif pergunta == '3':
    app.mostrar_tabela_print('Produtos', 2, 1)

    p = input('O produto já existe? [sim/não]: ').lower().split()



    if p[0] == 'n':

        # Se o produto não existir adiciona direto na entidade "Produtos" 
        nome = input('Nome: ').strip()
        total_no_estoque = input('Total no estoque: ').strip()
        valor = input('Valor (unidade): ').strip()
        
        print('-----------')
        app.mostrar_tabela_print("Categorias")
        print('-----------')
        categoria= input('Escolha uma opção:').strip()


        app.adicionar_dados('Produtos', (nome, total_no_estoque, valor, categoria))

        app.mostrar_tabela_print('Produtos')
    
    elif p[0] == 's':

        print('-----------')
        app.mostrar_tabela_print("Tipo_movimentacao")
        print('-----------')

        tipo = int(input('Qual tipo de movimentação? (Escolha uma opção com base no seu número): '))


        print('-----------')
        app.mostrar_tabela_print('Produtos', 2)
        print('-----------')

        produto_id = int(input('Escolha um produto com base no seu número: '))

        quantidade_atual = app.mostrar_tabela('Produtos', produto_id)[0][2]

        if tipo == 1:

            quantidade_nova = int(input('Digite a quantidade que você deseja adicionar: ')) 

            quantidade = quantidade_atual + quantidade_nova

            
            
        elif tipo == 2:

            quantidade_nova = int(input('Digite a quantidade que você deseja tirar: ')) 

            quantidade = quantidade_atual - quantidade_nova

        app.atualizar_dados('Produtos', 'total_estoque', quantidade, produto_id)

        data = input("Digite a data da movimentação. ( Ex: 2025-09-30 19:45:12 ): ").strip()
        app.adicionar_dados("Movimentacao", (tipo, produto_id, quantidade_nova, data))



    app.mostrar_tabela_print("Produtos")

    app.mostrar_tabela_print("Movimentacao")
    
elif pergunta == '4':
    
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

    app.mostrar_tabela_print(tabela, 2, 0)
    
    id = input("Digite o id do item que dejesa excluir: ").strip()

    app.excluir_dados(tabela, id)

