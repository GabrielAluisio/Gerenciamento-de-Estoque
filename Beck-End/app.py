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
    mostrar_coluna_ativos = request.args.get("ativos", "true").lower() == "true" #  /produtos?ativos=false
    apagados = request.args.get("apagados", "true").lower() == "true" # 

    conn = conectar()
    cursor = conn.cursor()

    if nome_tabela == 'Produtos':

        if not mostrar_coluna_ativos:
            query = f"SELECT id, nome, total_estoque, valor, categoria_id FROM {nome_tabela} "

        else:   
            query = f"SELECT * FROM {nome_tabela} "

        if apagados:
            query += 'WHERE ativo = 0'

        else:
            query += 'WHERE ativo = 1'

    else:
        query = f"SELECT * FROM {nome_tabela} ORDER BY id ASC "


    cursor.execute(query)
    result = cursor.fetchall()

    cursor.close()
    conn.close()
    return jsonify(result), 200


@app.route("/<nome_tabela>/atributos", methods=["GET"])
def mostrar_atributos(nome_tabela, back=False, incluir_id=True, incluir_ativo=True):

    conn = conectar()
    cursor = conn.cursor()

    cursor.execute(f"SHOW COLUMNS FROM {nome_tabela}")
    atributos = cursor.fetchall()

    cursor.close()
    conn.close()

    lista = []
    for i in atributos:

        if (incluir_id or i[0] != 'id') and (incluir_ativo or i[0] != 'ativo'):
            lista.append(i[0])
    
    if back:
        return lista
    
    return jsonify(lista), 200



@app.route('/<nome_tabela>/adicionar', methods=['POST'])
def adicionar_produto(nome_tabela):
    dados = request.get_json()

    try:
    
        valores = list(dados.values())
        
        conn = conectar()
        cursor = conn.cursor()

        colunas = mostrar_atributos(nome_tabela, back=True, incluir_id=False, incluir_ativo=False)
        colunas_str = ', '.join(colunas)

        query = f'''
            INSERT INTO {nome_tabela} ({colunas_str})
            VALUES ({', '.join(['%s'] * len(colunas))})'''

            
        cursor.execute(query, valores)
        conn.commit()

        cursor.close()
        conn.close()
        
        return jsonify({'sucesso': True, 'mensagem': 'Produto adicionado com sucesso!'}), 200
    
    
    except Exception as e:
    
        try:
            cursor.close()
            conn.close()
        except:
            pass
        return jsonify({'sucesso': False, 'mensagem': str(e)}), 500





    





@app.route('/<nome_tabela>/Desativar/<int:id>', methods=['PATCH'])
def desativarProduto(nome_tabela, id):

    if nome_tabela == 'Produtos':
        query = f" UPDATE Produtos set ativo = 0 WHERE id = {'%s'}; "

    conn = conectar()
    cursor = conn.cursor()

    cursor.execute(query, (id, ))
    conn.commit()

    return jsonify({"sucesso": f"{nome_tabela} {id} desativado"}), 200



@app.route('/<nome_tabela>/Atualizar', methods=['PUT'])
def atualizar_dados(nome_tabela):

    dados = request.get_json()
    atributo = dados['atributo']
    valor_novo = dados['valor_novo']
    id = dados['id']
    
    try:
        conn = conectar()
        cursor = conn.cursor()

        query = f"UPDATE {nome_tabela} SET {atributo} = %s WHERE id = %s"
        cursor.execute(query, (valor_novo, id))
        conn.commit()

        return jsonify({"sucesso": f"{nome_tabela} {id} atualizado"}), 200  

    except Exception as e:
        return jsonify({"erro": str(e)}), 500  

'''
def excluir_dados(nome_tabela, id):

    if nome_tabela == 'Produtos':
        atualizar_dados('Produtos', 'ativo', 0, id)

    else:
        comando.execute(f"""DELETE FROM {nome_tabela} WHERE id = {id};"""),

    conn.commit(  '''

if __name__ == "__main__":
    app.run(debug=True)