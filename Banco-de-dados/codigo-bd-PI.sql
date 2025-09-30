CREATE DATABASE PI;

USE PI;


CREATE TABLE Categorias (
	id int AUTO_INCREMENT PRIMARY KEY NOT NULL,
    nome varchar(100) NOT NULL UNIQUE
);

CREATE TABLE Produtos (
	id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    nome VARCHAR(100) NOT NULL UNIQUE,
    total_estoque INT NOT NULL DEFAULT 1,
    valor DECIMAL(10,2),
    categoria_id INT,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY(categoria_id) REFERENCES Categorias(id) ON DELETE SET NULL
);

CREATE TABLE Tipo_movimentacao (
	id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    nome varchar(50) NOT NULL UNIQUE
);

CREATE TABLE Movimentacao (
	id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    tipo_movimentacao_id INT,
    produto_id INT NOT NULL,
    quantidade INT NOT NULL DEFAULT 1,
    data_movimentacao DATETIME,
    FOREIGN KEY(tipo_movimentacao_id) REFERENCES Tipo_movimentacao(id) ON DELETE SET NULL,
    FOREIGN KEY(produto_id) REFERENCES Produtos(id) ON DELETE CASCADE
);


INSERT INTO Categorias (nome) VALUES ('Comida'), ('Bebida'), ('Sobremesa');

INSERT INTO Tipo_movimentacao (nome) VALUES ('Entrada'), ('Saida');

INSERT INTO Movimentacao (tipo_movimentacao_id, produto_id, quantidade, data_movimentacao) values (1, 2, 10, '2025-09-23');

