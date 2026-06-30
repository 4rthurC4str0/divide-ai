<?php
header('Content-Type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");

// Requer o arquivo de conexão com o banco de dados
require_once 'conexao.php';

// Recebe o corpo bruto da requisição HTTP (em formato JSON)
$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data) {
    echo json_encode([
        'sucesso' => false,
        'erro' => 'Nenhum dado válido de pedido foi recebido.'
    ]);
    exit;
}

// Mapeamento e validação dos campos do pedido
$idPedido = isset($data['id']) ? $data['id'] : null;
$idMesa = isset($data['idMesa']) ? intval($data['idMesa']) : null;
$subtotal = isset($data['subtotal']) ? floatval($data['subtotal']) : 0.0;
$porcentagemServico = isset($data['porcentagemServico']) ? floatval($data['porcentagemServico']) : 10.0;
$couvertArtistico = isset($data['couvertArtistico']) ? floatval($data['couvertArtistico']) : 0.0;
$total = isset($data['total']) ? floatval($data['total']) : 0.0;
$status = isset($data['status']) ? $data['status'] : 'pending';
$notes = isset($data['notes']) ? $data['notes'] : '';

// Se o ID do pedido não estiver definido, criamos um timestamp em milissegundos
if (!$idPedido) {
    $idPedido = round(microtime(true) * 1000);
}

if (!$idMesa) {
    echo json_encode([
        'sucesso' => false,
        'erro' => 'O ID da mesa é obrigatório.'
    ]);
    exit;
}

try {
    // Inicia uma transação no MySQL para garantir a integridade dos dados
    $pdo->beginTransaction();

    // 1. Inserir ou Atualizar o Pedido principal (mantendo data de criação original no caso de atualização)
    $sqlPedido = "INSERT INTO pedidos (id, id_mesa, subtotal, porcentagem_servico, couvert_artistico, total, criado, status, notes) 
                  VALUES (:id, :id_mesa, :subtotal, :porcentagem_servico, :couvert_artistico, :total, NOW(), :status, :notes)
                  ON DUPLICATE KEY UPDATE 
                      subtotal = VALUES(subtotal),
                      porcentagem_servico = VALUES(porcentagem_servico),
                      couvert_artistico = VALUES(couvert_artistico),
                      total = VALUES(total),
                      status = VALUES(status),
                      notes = VALUES(notes)";
    
    $stmtPedido = $pdo->prepare($sqlPedido);
    $stmtPedido->execute([
        ':id' => $idPedido,
        ':id_mesa' => $idMesa,
        ':subtotal' => $subtotal,
        ':porcentagem_servico' => $porcentagemServico,
        ':couvert_artistico' => $couvertArtistico,
        ':total' => $total,
        ':status' => $status,
        ':notes' => $notes
    ]);

    // Limpar itens antigos se for uma atualização
    $stmtClean = $pdo->prepare("DELETE FROM pedido_itens WHERE id_pedido = :id_pedido");
    $stmtClean->execute([':id_pedido' => $idPedido]);

    // 2. Inserir os itens do pedido
    if (isset($data['items']) && is_array($data['items'])) {
        $sqlItem = "INSERT INTO pedido_itens (id, id_pedido, id_item, nome, quantidade, preco_unitario, preco_total, done) 
                    VALUES (:id, :id_pedido, :id_item, :nome, :quantidade, :preco_unitario, :preco_total, :done)";
        $stmtItem = $pdo->prepare($sqlItem);

        foreach ($data['items'] as $item) {
            $itemId = isset($item['id']) ? $item['id'] : uniqid();
            $idItemCardapio = isset($item['idItem']) ? $item['idItem'] : '';
            $nome = isset($item['nome']) ? $item['nome'] : '';
            $quantidade = isset($item['quantidade']) ? intval($item['quantidade']) : 1;
            $precoUnitario = isset($item['precoUnitario']) ? floatval($item['precoUnitario']) : 0.0;
            $precoTotal = isset($item['precoTotal']) ? floatval($item['precoTotal']) : 0.0;
            $done = isset($item['done']) && $item['done'] ? 1 : 0;

            $stmtItem->execute([
                ':id' => $itemId,
                ':id_pedido' => $idPedido,
                ':id_item' => $idItemCardapio,
                ':nome' => $nome,
                ':quantidade' => $quantidade,
                ':preco_unitario' => $precoUnitario,
                ':preco_total' => $precoTotal,
                ':done' => $done
            ]);
        }
    }

    // 3. Atualizar o status da mesa correspondente para 'ocupada'
    $sqlMesa = "UPDATE mesas SET status = 'ocupada' WHERE id = :id_mesa";
    $stmtMesa = $pdo->prepare($sqlMesa);
    $stmtMesa->execute([
        ':id_mesa' => $idMesa
    ]);

    // Confirma todas as queries se nenhuma falhou
    $pdo->commit();

    // Retorna resposta de sucesso
    echo json_encode([
        'sucesso' => true,
        'mensagem' => 'Pedido e itens gravados no MySQL com sucesso!',
        'id_pedido' => $idPedido
    ]);

} catch (Exception $e) {
    // Caso ocorra qualquer erro, desfaz as alterações
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    echo json_encode([
        'sucesso' => false,
        'erro' => 'Erro ao salvar pedido: ' . $e->getMessage()
    ]);
}
?>
