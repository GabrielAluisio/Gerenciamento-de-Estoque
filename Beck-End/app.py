import mysql.connector

# Pegar a senha do BD no .env
from dotenv import load_dotenv
import os

load_dotenv()
senha = os.getenv("senha_do_bd") 

#Executar a conexão com o MYSQL
conn = mysql.connector.connect(
    host='localhost',
    user='root',
    password=senha,
    database='PI'
)


comando = conn.cursor()


def mostrar_tabela_print(nome_table, todas_as_colunas=True, onde_comecar_as_colunas=0):

    comando.execute(f"SELECT * FROM {nome_table};", )
    result = comando.fetchall()

    for i in result:

        if todas_as_colunas == True:
        
            for r in range(onde_comecar_as_colunas, len(i)):
                if r >= len(i) - 1:
                    print(i[r], end="")
                else:
                    print(i[r], end=" - ")

            print(end="\n")

        # Define o números de colunas
        else:

            for r in range(onde_comecar_as_colunas, todas_as_colunas):
                if r >= todas_as_colunas - 1:
                    print(i[r], end="")
                else:
                    print(i[r], end=" - ")

            print(end="\n")


def mostrar_tabela(nome_table, mostrar_item_pelo_id=False):

    if mostrar_item_pelo_id == False:
        comando.execute(f"SELECT * FROM {nome_table}; ", )

    else:
        comando.execute(f"SELECT * FROM {nome_table} where id = {mostrar_item_pelo_id}; ", ) 

    result = comando.fetchall()

    return result




def pegar_atributos(nome_tabela, id=True):

    comando.execute(f"SHOW COLUMNS FROM {nome_tabela}")
    atributos = comando.fetchall()

    lista = []
    for i in atributos:
        if id or i[0] != 'id':
            lista.append(i[0])

    return lista

def adicionar_dados(nome_tabela, valores):
    colunas = pegar_atributos(nome_tabela, id=False)

    colunas_str = ', '.join(colunas)

    query = f'''
        INSERT INTO {nome_tabela} ({colunas_str})
        VALUES ({', '.join(['%s'] * len(colunas))})'''

        
    comando.execute(query, valores)
    conn.commit()

def atualizar_dados(nome_tabela, atributo, valor_novo, id):

    query = f" UPDATE {nome_tabela} set {atributo} = '{valor_novo}' WHERE id = {id}; "

    comando.execute(query)


    conn.commit()

print(mostrar_tabela('Produtos', 5)[0][2])