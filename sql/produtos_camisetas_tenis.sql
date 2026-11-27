-- =========================================================
-- CAMISETAS E TÊNIS
-- Rode este arquivo DEPOIS do driplab_mysql.sql e do produto_moletom.sql.
-- 1) Libera as categorias Camiseta e Tenis na tabela Produto
-- 2) Cadastra os produtos (só se ainda não existirem)
-- =========================================================

SET NAMES utf8mb4;
USE driplab_db;

ALTER TABLE Produto
    MODIFY COLUMN categoria ENUM('Moletom', 'Camiseta', 'Tenis') NOT NULL DEFAULT 'Moletom';

INSERT INTO Produto (nome, descricao, preco, imagem, imagens, categoria, estoque, ativo, created_at, updated_at)
SELECT * FROM (
    SELECT 'Camiseta Thorn' AS nome, 'Camiseta preta de manga longa com arte de espinhos prateados e detalhes em vermelho.' AS descricao, 69.90 AS preco, '/img/produto8.png' AS imagem, JSON_OBJECT('frente', '/img/produto8.png') AS imagens, 'Camiseta' AS categoria, 10 AS estoque, 1 AS ativo, NOW() AS c, NOW() AS u
    UNION ALL SELECT 'Camiseta Star Patch', 'Camiseta vermelha com estrela grande, recortes xadrez e acabamento desfiado.', 64.90, '/img/produto10.png', JSON_OBJECT('frente', '/img/produto10.png'), 'Camiseta', 10, 1, NOW(), NOW()
    UNION ALL SELECT 'Camiseta Velocity', 'Camiseta preta de manga longa com recortes vermelhos e logo DRIPLAB no peito.', 72.90, '/img/produto11.png', JSON_OBJECT('frente', '/img/produto11.png'), 'Camiseta', 10, 1, NOW(), NOW()
    UNION ALL SELECT 'Camiseta Ruins', 'Camiseta verde-musgo com efeito destroyed e estrela vermelha bordada.', 59.90, '/img/produto6.png', JSON_OBJECT('frente', '/img/produto6.png'), 'Camiseta', 10, 1, NOW(), NOW()
    UNION ALL SELECT 'Tênis Drift', 'Tênis cano baixo vermelho, preto e off-white com solado robusto.', 189.90, '/img/produto2.png', JSON_OBJECT('frente', '/img/produto2.png'), 'Tenis', 10, 1, NOW(), NOW()
    UNION ALL SELECT 'Coturno Riot', 'Coturno preto com solado tratorado alto e cadarço reforçado.', 219.90, '/img/produto4.png', JSON_OBJECT('frente', '/img/produto4.png'), 'Tenis', 10, 1, NOW(), NOW()
) AS novos
WHERE NOT EXISTS (SELECT 1 FROM Produto p WHERE p.nome = novos.nome);

SELECT id, nome, categoria FROM Produto;
