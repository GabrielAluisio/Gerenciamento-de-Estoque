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




mostrar_tabela('Produtos')