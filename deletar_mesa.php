<?php
header('Content-Type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");

// Requer o arquivo de conexão
require_once 'conexao.php';

// Recebe o corpo da requisição JSON
$json = file_get_contents('php://input');
$data = json_decode($json, true);

$id = isset($data['id']) ? intval($data['id']) : null;

if (!$id) {
    echo json_encode([
        'sucesso' => false,
        'erro' => 'ID da mesa inválido ou não informado.'
    ]);
    exit;
}

try {
    // Exclui a mesa. Devido ao ON DELETE CASCADE na FK, 
    // os pedidos vinculados a esta mesa também serão excluídos automaticamente.
    $stmt = $pdo->prepare("DELETE FROM mesas WHERE id = :id");
    $stmt->execute([':id' => $id]);

    echo json_encode([
        'sucesso' => true,
        'mensagem' => 'Mesa excluída no MySQL com sucesso!',
        'id_mesa' => $id
    ]);

} catch (Exception $e) {
    echo json_encode([
        'sucesso' => false,
        'erro' => 'Erro ao excluir mesa no MySQL: ' . $e->getMessage()
    ]);
}
?>
