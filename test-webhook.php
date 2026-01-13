<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Get POST data
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Log the request
$logData = [
    'timestamp' => date('Y-m-d H:i:s'),
    'method' => $_SERVER['REQUEST_METHOD'],
    'headers' => getallheaders(),
    'body' => $data,
    'raw_input' => $input
];

file_put_contents('/tmp/webhook-test.log', json_encode($logData, JSON_PRETTY_PRINT) . "\n", FILE_APPEND);

// Validate email
if (!isset($data['email']) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Email invalide ou manquant',
        'received_data' => $data
    ]);
    exit();
}

// Success response
echo json_encode([
    'success' => true,
    'message' => 'Test webhook fonctionnel!',
    'email' => $data['email'],
    'source' => $data['source'] ?? 'website',
    'timestamp' => date('Y-m-d H:i:s')
]);
?>