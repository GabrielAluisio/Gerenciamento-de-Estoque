import mysql.connector
from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
from datetime import datetime

# Pegar a senha do BD no .env
from dotenv import load_dotenv
import os

app = Flask(
    __name__,
    template_folder='../Front-End',   # pasta onde está o HTML
    static_folder='../Front-End'  
)

CORS(app)

@app.route('/')
def home():
    return render_template('index.html') 

@app.route('/favicon.ico')
def favicon():
    return '', 204 

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

    id = request.args.get("id")

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
            id_param = request.args.get("id", None)

            if id_param and id_param.lower() != 'false':
                try:
                    id_int = int(id_param)
                    query_base = f"SELECT id, nome, total_estoque, valor, categoria_id FROM {nome_tabela} WHERE id = {id_int}"
                except ValueError:
                    return jsonify({"erro": "ID inválido"}), 400
            else:
                # Se id não foi enviado ou é 'false', pega todos os produtos
                query_base = f"SELECT id, nome, total_estoque, valor, categoria_id FROM {nome_tabela}"
                filtros.append("ativo = 1")

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
def adicionar_valores(nome_tabela):
    dados = request.get_json()  # recebe JSON do front-end
    print("📥 Recebido:", dados)

    conn = conectar()
    cursor = conn.cursor()

    try:
        # Pega colunas do banco, exceto id e ativo
        colunas_banco = mostrar_atributos(nome_tabela, back=True, incluir_id=False, incluir_ativo=False)

        # Filtra apenas os campos que vieram do front-end
        colunas = [col for col in colunas_banco if col in dados]

        # Ordena os valores de acordo com a lista de colunas
        valores = [dados[col] for col in colunas]

        # --- Inserção padrão ---
        colunas_str = ', '.join(colunas)
        placeholders = ', '.join(['%s'] * len(colunas))
        print(placeholders) 
        print(colunas_str)
        query = f"INSERT INTO {nome_tabela} ({colunas_str}) VALUES ({placeholders})"
        print(query)
        cursor.execute(query, valores)


        # --- Lógica especial para movimentações ---
        if nome_tabela == "movimentacoes":
            tipo_mov = str(dados.get("tipo_movimentacao_id"))
            produto_id = int(dados.get("produto_id"))
            qtd = int(dados.get("quantidade", 0))

            if tipo_mov == "1":  # Entrada
                cursor.execute(
                    "UPDATE produtos SET total_estoque = total_estoque + %s WHERE id = %s",
                    (qtd, produto_id)
                )
                print(f"🟢 Entrada: +{qtd} unidades no produto {produto_id}")
            elif tipo_mov == "2":  # Saída
                cursor.execute(
                    "UPDATE produtos SET total_estoque = total_estoque - %s WHERE id = %s",
                    (qtd, produto_id)
                )
                print(f"🔴 Saída: -{qtd} unidades no produto {produto_id}")
            else:
                print("⚪ Nenhuma movimentação de estoque (somente registro)")

        conn.commit()
        return jsonify({'sucesso': True, 'mensagem': f'{nome_tabela} adicionado com sucesso!'}), 200

    except Exception as e:
        conn.rollback()
        print("❌ Erro ao adicionar:", e)
        return jsonify({"erro": str(e)}), 500

    finally:
        cursor.close()
        conn.close()








@app.route('/produtos/desativar/<int:id>', methods=['PATCH'])
def desativar_produto(id):
    conn = conectar()
    cursor = conn.cursor()

    query = "UPDATE produtos SET ativo = 0 WHERE id = %s;"
    cursor.execute(query, (id,))

    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"sucesso": f"Produto {id} desativado"}), 200


@app.route('/<nome_tabela>/excluir/<int:id>', methods=['DELETE'])
def excluir(nome_tabela, id):

    conn = conectar()
    cursor = conn.cursor()

    query = f"DELETE FROM {nome_tabela} WHERE id = %s;"
    cursor.execute(query, (id,))

    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"sucesso": f"{nome_tabela} {id} excluído"}), 200





@app.route('/<nome_tabela>/atualizar', methods=['PUT'])
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


        return jsonify({"sucesso": True, 'mensagem': f"{nome_tabela} {id} atualizado"}), 200  

    except Exception as e:
        return jsonify({"erro": str(e)}), 500  


@app.route('/visao_geral/grafico/pizza/<tipo>')
def grafico_pizza(tipo):
    conn = conectar()
    cursor = conn.cursor()

    if tipo == "quantidade":
        query = "SELECT nome, total_estoque FROM produtos WHERE ativo = 1 ORDER BY total_estoque DESC LIMIT 10"
    elif tipo == "preco":
        query = "SELECT nome, valor FROM produtos WHERE ativo = 1 ORDER BY valor DESC LIMIT 10"
    elif tipo == "saida":
        query = """ SELECT 
                        p.nome, 
                        COUNT(m.produto_id) AS `quantidade de saida`
                    FROM movimentacoes m
                    JOIN produtos p ON m.produto_id = p.id
                    WHERE m.tipo_movimentacao_id = 2
                    GROUP BY p.nome
                    ORDER BY `quantidade de saida` DESC"""
    else:
        return jsonify({"erro": "Tipo inválido"}), 400

    cursor.execute(query)
    dados = cursor.fetchall()
    cursor.close()
    conn.close()
    print(dados)
    return jsonify(dados)

    

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))