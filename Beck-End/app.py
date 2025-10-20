import mysql.connector
from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime

# Pegar a senha do BD no .env
from dotenv import load_dotenv
import os


app = Flask(__name__)
CORS(app)

load_dotenv()


def conectar():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),      
        user=os.getenv("DB_USER"),      
        password=os.getenv("DB_PASS"),  
        database=os.getenv("DB_NAME"),
        port=3306 
    )


@app.route("/<nome_tabela>", methods=["GET"])
def pegar_coluna(nome_tabela):

    apagados = request.args.get("apagados", "true").lower() == "true"

    letras = request.args.get("letras") 

    coluna_pesquisa = request.args.get("pesquisa", "nome")

    filtros_get = request.args.to_dict()

    


    conn = conectar()
    cursor = conn.cursor()

    
    filtros = []
    query_base = f"SELECT * FROM {nome_tabela} "

    if nome_tabela.lower() == "produtos":

        preco_min = filtros_get.get("preco_min")
        preco_max = filtros_get.get("preco_max")
        estoque_min = filtros_get.get("estoque_min")
        estoque_max = filtros_get.get("estoque_max")
        categoria = filtros_get.get("categorias")

        if apagados:      
            filtros.append("ativo = 0")
        else:
            query_base = f"SELECT id, nome, total_estoque, valor, categoria_id FROM {nome_tabela}"
            filtros.append("ativo = 1")
    
        print(filtros_get)

        if preco_min:
            filtros.append(f"valor >= {float(preco_min)}")
        if preco_max:
            filtros.append(f"valor <= {float(preco_max)}")
        if estoque_min:
            filtros.append(f"total_estoque >= {int(estoque_min)}")
        if estoque_max:
            filtros.append(f"total_estoque <= {int(estoque_max)}")
        if categoria:
            filtros.append(f"categoria_id = {categoria}")
                
        

    elif nome_tabela.lower() == "movimentacoes":

        tipo = filtros_get.get("tipos_movimentacoes")
        quantidade_min = filtros_get.get("quantidade_min")
        quantidade_max = filtros_get.get("quantidade_max")
        data_min = filtros_get.get("data_inicio")
        data_max = filtros_get.get("data_fim")

        # Tipo (1=entrada, 2=saída)
        if tipo:
            filtros.append(f"tipo_movimentacao_id = {int(tipo)}")

        # Quantidades
        if quantidade_min:
            filtros.append(f"quantidade >= {int(quantidade_min)}")
        if quantidade_max:
            filtros.append(f"quantidade <= {int(quantidade_max)}")

        # Datas
        if data_min and data_max:
            filtros.append(f"data_movimentacao BETWEEN '{data_min}' AND '{data_max}'")
        elif data_min:
            filtros.append(f"data_movimentacao >= '{data_min}'")
        elif data_max:
            filtros.append(f"data_movimentacao <= '{data_max}'")

    if letras:
        filtros.append(f"{coluna_pesquisa} LIKE '%{letras}%'") 

    if filtros:
        query_base += " WHERE " + " AND ".join(filtros)

    query_base += " ORDER BY id"

    cursor.execute(query_base)
    result = cursor.fetchall()
    print(query_base)
    print('----------')
    print(result)

    novo_result = []
    for linha in result:
        nova_linha = []
        for valor in linha:

            if isinstance(valor, datetime):
                valor = valor.strftime("%d/%m/%Y %H:%M:%S")

            nova_linha.append(valor)

        novo_result.append(nova_linha)

    cursor.close()
    conn.close()
    return jsonify(novo_result), 200


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





@app.route('/<nome_tabela>/desativar/<int:id>', methods=['PATCH'])
def desativarProduto(nome_tabela, id):

    if nome_tabela == 'produtos':
        query = f" UPDATE {nome_tabela} set ativo = 0 WHERE id = {'%s'}; "

    conn = conectar()
    cursor = conn.cursor()

    cursor.execute(query, (id, ))
    conn.commit()

    return jsonify({"sucesso": f"{nome_tabela} {id} desativado"}), 200



@app.route('/<nome_tabela>/atualizar', methods=['PUT'])
def atualizar_dados(nome_tabela):

    dados = request.get_json()
    atributo = dados['atributo']
    valor_novo = dados['valor_novo']
    id = dados['id']
    
    try:
        conn = conectar()
        cursor = conn.cursor()

        print("Tabela:", nome_tabela)
        print("Atributo:", atributo)
        print("Valor:", valor_novo)
        print("ID:", id)
        query = f"UPDATE {nome_tabela} SET {atributo} = %s WHERE id = %s"
        print("Query:", query)
        cursor.execute(query, (valor_novo, id))
        conn.commit()
        print("Linhas afetadas:", cursor.rowcount)


        return jsonify({"sucesso": True, 'mensagem': f"{nome_tabela} {id} atualizado"}), 200  

    except Exception as e:
        return jsonify({"erro": str(e)}), 500  
    

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))