-- Ajusta a tabela Produto para as categorias da loja.
USE driplab_db;

-- O MySQL Workbench bloqueia UPDATE sem chave no WHERE ("safe update mode").
-- Desligamos só durante este arquivo e ligamos de novo no final.
SET SQL_SAFE_UPDATES = 0;

-- Só mexe em produtos com categoria fora da lista
UPDATE Produto
SET categoria = 'Moletom'
WHERE categoria NOT IN ('Moletom', 'Camiseta', 'Tenis');

ALTER TABLE Produto
    MODIFY COLUMN categoria ENUM('Moletom', 'Camiseta', 'Tenis') NOT NULL DEFAULT 'Moletom',
    ADD COLUMN imagens JSON NULL;

SET SQL_SAFE_UPDATES = 1;
