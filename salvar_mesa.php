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

if (!$data) {
    echo json_encode([
        'sucesso' => false,
        'erro' => 'Dados de mesa inválidos ou não recebidos.'
    ]);
    exit;
}

$id = isset($data['id']) ? intval($data['id']) : null;
$numero = isset($data['numero']) ? intval($data['numero']) : null;
$capacidade = isset($data['capacidade']) ? intval($data['capacidade']) : null;
$status = isset($data['status']) ? $data['status'] : 'disponivel';

if (!$id || !$numero || !$capacidade) {
    echo json_encode([
        'sucesso' => false,
        'erro' => 'Os campos ID, Número e Capacidade são obrigatórios.'
    ]);
    exit;
}

try {
    // Insere a mesa ou atualiza seus dados caso já exista (INSERT ON DUPLICATE KEY UPDATE)
    $sql = "INSERT INTO mesas (id, numero, capacidade, status, criado) 
            VALUES (:id, :numero, :capacidade, :status, NOW())
            ON DUPLICATE KEY UPDATE 
                numero = :numero, 
                capacidade = :capacidade, 
                status = :status";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':id' => $id,
        ':numero' => $numero,
        ':capacidade' => $capacidade,
        ':status' => $status
    ]);

    echo json_encode([
        'sucesso' => true,
        'mensagem' => 'Mesa salva no MySQL com sucesso!',
        'id_mesa' => $id
    ]);

} catch (Exception $e) {
    echo json_encode([
        'sucesso' => false,
        'erro' => 'Erro ao salvar mesa no MySQL: ' . $e->getMessage()
    ]);
}
?>
