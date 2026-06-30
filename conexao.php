<?php

// Função auxiliar para carregar variáveis de um arquivo .env local
function carregarEnv($caminho) {
    if (!file_exists($caminho)) {
        return;
    }
    $linhas = file($caminho, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($linhas as $linha) {
        // Ignora comentários
        if (strpos(trim($linha), '#') === 0) {
            continue;
        }
        // Divide a linha em chave = valor
        if (strpos($linha, '=') !== false) {
            list($nome, $valor) = explode('=', $linha, 2);
            $nome = trim($nome);
            $valor = trim($valor);
            
            // Remove aspas simples ou duplas do valor, se houver
            $valor = trim($valor, "\"'");
            
            if (!array_key_exists($nome, $_SERVER) && !array_key_exists($nome, $_ENV)) {
                putenv(sprintf('%s=%s', $nome, $valor));
                $_ENV[$nome] = $valor;
                $_SERVER[$nome] = $valor;
            }
        }
    }
}

// Carrega as configurações do arquivo .env
carregarEnv(__DIR__ . '/.env');

// Define as variáveis de conexão (usa o .env ou valores padrão)
$host = getenv('DB_HOST') ?: '127.0.0.1';
$dbname = getenv('DB_NAME') ?: 'divide_ai';
$username = getenv('DB_USER') ?: 'root';
$password = getenv('DB_PASS') !== false ? getenv('DB_PASS') : '';

try {
    // Conectando usando PDO para maior segurança e portabilidade
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    
    // Configura o PDO para lançar exceções em caso de erros SQL
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Configura o retorno padrão como array associativo
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    
} catch (PDOException $e) {
    // Retorna uma resposta JSON formatada caso a conexão com o banco falhe
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'sucesso' => false,
        'erro' => 'Falha de conexão com o banco de dados MySQL: ' . $e->getMessage()
    ]);
    exit;
}
?>
