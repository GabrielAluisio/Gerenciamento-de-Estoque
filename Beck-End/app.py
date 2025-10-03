import mysql.connector
from flask import Flask, jsonify, request
from flask_cors import CORS

# Pegar a senha do BD no .env
from dotenv import load_dotenv
import os


app = Flask(__name__)
CORS(app)

load_dotenv()
senha = os.getenv("senha_do_bd") 

def conectar():
    return mysql.connector.connect(
        host='localhost',
        user='root',
        password=senha,
        database='PI'
    )


'''
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

'''
@app.route("/<nome_tabela>", methods=["GET"])
def mostrar_tabela(nome_tabela):
    apenas_ativos = request.args.get("ativos", "true").lower() == "true" #  /produtos?ativos=false

    conn = conectar()
    cursor = conn.cursor()

    if apenas_ativos:
        query = f"SELECT id, nome, total_estoque, valor, categoria_id FROM {nome_tabela} WHERE ativo = 1"

    else:   
        query = f"SELECT * FROM {nome_tabela}"


    cursor.execute(query)
    result = cursor.fetchall()

    cursor.close()
    conn.close()
    return jsonify(result), 200


@app.route("/<nome_tabela>/atributos", methods=["GET"])
def pegar_atributos(nome_tabela):

    conn = conectar()
    cursor = conn.cursor()

    cursor.execute(f"SHOW COLUMNS FROM {nome_tabela}")
    atributos = cursor.fetchall()

    cursor.close()
    conn.close()

    lista = []
    for i in atributos:
        lista.append(i[0])
    

    return jsonify(lista), 200
    
@app.route('/<nome_tabela>/adicionar', methods=['POST'])
def adicionar_dados(nome_tabela):

    dados = request.get_json()

    conn = conectar()
    cursor = conn.cursor()

    colunas = pegar_atributos(nome_tabela)

    colunas_str = ', '.join(colunas)

    query = f'''
        INSERT INTO {nome_tabela} ({colunas_str})
        VALUES ({', '.join(['%s'] * len(colunas))})'''

     
    cursor.execute(query, dados)
    conn.commit()

    cursor.close()
    conn.close()

'''
def atualizar_dados(nome_tabela, atributo, valor_novo, id):

    query = f" UPDATE {nome_tabela} set {atributo} = '{valor_novo}' WHERE id = {id}; "

    comando.execute(query)


    conn.commit()

def excluir_dados(nome_tabela, id):

    if nome_tabela == 'Produtos':
        atualizar_dados('Produtos', 'ativo', 0, id)

    else:
        comando.execute(f"""DELETE FROM {nome_tabela} WHERE id = {id};"""),

    conn.commit()'''

if __name__ == "__main__":
    app.run(debug=True)