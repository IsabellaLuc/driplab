UPDATE Produto
SET categoria = 'Moletom';

ALTER TABLE Produto
    MODIFY COLUMN categoria ENUM('Moletom') NOT NULL DEFAULT 'Moletom',
    ADD COLUMN imagens JSON NULL;
