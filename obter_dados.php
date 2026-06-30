<?php
header('Content-Type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: *");

// Requer o arquivo de conexão
require_once 'conexao.php';

try {
    // 1. Buscar todas as mesas registradas no banco
    $stmtMesas = $pdo->query("SELECT * FROM mesas ORDER BY numero ASC");
    $mesasResult = $stmtMesas->fetchAll();
    
    $mesas = [];
    foreach ($mesasResult as $row) {
        $mesas[] = [
            'id' => intval($row['id']),
            'numero' => intval($row['numero']),
            'capacidade' => intval($row['capacidade']),
            'status' => $row['status'],
            'criado' => $row['criado']
        ];
    }

    // 2. Buscar todos os pedidos com as informações da mesa associada
    $stmtPedidos = $pdo->query("SELECT p.*, m.numero as numero_mesa FROM pedidos p LEFT JOIN mesas m ON p.id_mesa = m.id ORDER BY p.criado DESC");
    $pedidosResult = $stmtPedidos->fetchAll();

    $pedidos = [];
    foreach ($pedidosResult as $rowPedido) {
        $idPedido = $rowPedido['id'];
        
        // Buscar os itens deste pedido
        $stmtItens = $pdo->prepare("SELECT * FROM pedido_itens WHERE id_pedido = :id_pedido");
        $stmtItens->execute([':id_pedido' => $idPedido]);
        $itensResult = $stmtItens->fetchAll();

        $items = [];
        foreach ($itensResult as $rowItem) {
            $items[] = [
                'id' => $rowItem['id'],
                'idItem' => $rowItem['id_item'],
                'nome' => $rowItem['nome'],
                'quantidade' => intval($rowItem['quantidade']),
                'precoUnitario' => floatval($rowItem['preco_unitario']),
                'precoTotal' => floatval($rowItem['preco_total']),
                'done' => intval($rowItem['done']) === 1
            ];
        }

        // Formata o pedido conforme esperado pela lógica do JavaScript
        $pedidos[] = [
            'id' => floatval($rowPedido['id']), // Mapeia BIGINT para float/number
            'idMesa' => intval($rowPedido['id_mesa']),
            'numeroMesa' => $rowPedido['numero_mesa'] ? intval($rowPedido['numero_mesa']) : '?',
            'items' => $items,
            'subtotal' => floatval($rowPedido['subtotal']),
            'porcentagemServico' => floatval($rowPedido['porcentagem_servico']),
            'couvertArtistico' => floatval($rowPedido['couvert_artistico']),
            'total' => floatval($rowPedido['total']),
            'criado' => $rowPedido['criado'],
            'status' => $rowPedido['status'],
            'notes' => $rowPedido['notes']
        ];
    }

    // Retorna a resposta com sucesso e os arrays populados
    echo json_encode([
        'sucesso' => true,
        'mesas' => $mesas,
        'pedidos' => $pedidos
    ]);

} catch (Exception $e) {
    // Retorna erro amigável em caso de falhas nas queries do banco
    echo json_encode([
        'sucesso' => false,
        'erro' => 'Erro ao carregar dados do banco: ' . $e->getMessage()
    ]);
}
?>
