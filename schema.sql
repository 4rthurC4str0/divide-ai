-- Script de criação do Banco de Dados para o Divide-AI

-- Criação do banco de dados 
CREATE DATABASE IF NOT EXISTS `divide_ai` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `divide_ai`;


CREATE TABLE IF NOT EXISTS `mesas` (
    `id` INT PRIMARY KEY,
    `numero` INT NOT NULL,
    `capacidade` INT NOT NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'disponivel',
    `criado` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `pedidos` (
    `id` BIGINT PRIMARY KEY,
    `id_mesa` INT NOT NULL,
    `subtotal` DECIMAL(10,2) NOT NULL,
    `porcentagem_servico` DECIMAL(5,2) NOT NULL DEFAULT 10.00,
    `couvert_artistico` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `total` DECIMAL(10,2) NOT NULL,
    `criado` DATETIME NOT NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'pending',
    `notes` TEXT,
    FOREIGN KEY (`id_mesa`) REFERENCES `mesas`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `pedido_itens` (
    `id` VARCHAR(50) PRIMARY KEY,
    `id_pedido` BIGINT NOT NULL,
    `id_item` VARCHAR(50) NOT NULL,
    `nome` VARCHAR(255) NOT NULL,
    `quantidade` INT NOT NULL,
    `preco_unitario` DECIMAL(10,2) NOT NULL,
    `preco_total` DECIMAL(10,2) NOT NULL,
    `done` TINYINT(1) NOT NULL DEFAULT 0,
    FOREIGN KEY (`id_pedido`) REFERENCES `pedidos`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT INTO `mesas` (`id`, `numero`, `capacidade`, `status`) VALUES 
(1, 1, 6, 'reservada'),
(2, 2, 2, 'ocupada'),
(3, 3, 4, 'disponivel')
ON DUPLICATE KEY UPDATE 
    `numero` = VALUES(`numero`), 
    `capacidade` = VALUES(`capacidade`), 
    `status` = VALUES(`status`);
