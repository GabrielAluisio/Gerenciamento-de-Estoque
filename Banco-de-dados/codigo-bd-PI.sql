CREATE DATABASE PI;

USE PI;


CREATE TABLE Categorias (
	id int AUTO_INCREMENT PRIMARY KEY NOT NULL,
    nome varchar(100) NOT NULL
);

CREATE TABLE Produtos (
	id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    nome VARCHAR(100) NOT NULL,
    total_estoque INT NOT NULL DEFAULT 1,
    valor DECIMAL(10,2),
    categoria_id INT,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY(categoria_id) REFERENCES Categorias(id) ON DELETE SET NULL
);

CREATE TABLE Tipos_movimentacoes (
	id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    nome varchar(50) NOT NULL
);

CREATE TABLE Movimentacoes (
	id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    tipo_movimentacao_id INT, 
    produto_id INT NOT NULL,
    quantidade INT NOT NULL DEFAULT 1,
    data_movimentacao DATETIME,
    FOREIGN KEY(tipo_movimentacao_id) REFERENCES Tipos_movimentacoes(id) ON DELETE SET NULL,
    FOREIGN KEY(produto_id) REFERENCES Produtos(id) ON DELETE CASCADE
);

INSERT INTO Categorias (nome) VALUES ('Comida');
INSERT INTO Categorias (nome) VALUES ('Bebida');
INSERT INTO Categorias (nome) VALUES ('Sobremesa');

INSERT INTO Tipos_movimentacoes (nome) VALUES ('Entrada'), ('Saida');