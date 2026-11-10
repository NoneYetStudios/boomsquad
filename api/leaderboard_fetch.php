<?php
/**
 * BOOM SQUAD - Online Leaderboard Fetch Endpoint (GET)
 * Reads top leaderboard entries from protected ../data/leaderboard_data.json
 */

require_once __DIR__ . '/bootstrap.php';

$limit = isset($_GET['limit']) ? max(1, min(100, (int)$_GET['limit'])) : 25;
$entries = loadLeaderboardEntries();

usort($entries, function ($a, $b) {
    return ((int)($b['score'] ?? 0)) <=> ((int)($a['score'] ?? 0));
});

echo json_encode([
    'status' => 'ok',
    'entries' => array_slice($entries, 0, $limit)
]);
