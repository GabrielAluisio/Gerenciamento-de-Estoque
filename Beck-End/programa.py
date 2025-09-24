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

    
    app.mostrar_tabela('Produtos')

