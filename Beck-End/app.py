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


def mostrar_tabela(nome_table):

    comando.execute(f"SELECT * FROM {nome_table};", )
    result = comando.fetchall()

    for i in result:
        
        for r in range(len(i)):
            if r >= len(i) - 1:
                print(i[r], end="")
            else:
                print(i[r], end=" - ")

        print(end="\n")


def pegar_atributos(nome_tabela, id=True):

    comando.execute(f"SHOW COLUMNS FROM {nome_tabela}")
    atributos = comando.fetchall()

    lista = []
    for i in atributos:
        if id or i[0] != 'id':
            lista.append(i[0])

    return lista

def adicionar_dados(nome_tabela, valores):
    colunas = pegar_atributos('Produtos')

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