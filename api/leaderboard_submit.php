<?php
/**
 * BOOM SQUAD - Online Leaderboard Submission Endpoint (POST)
 * Stores validated scores in protected ../data/leaderboard_data.json
 */

require_once __DIR__ . '/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method Not Allowed']);
    exit;
}

$rawInput = file_get_contents('php://input');
$payload = json_decode((string)$rawInput, true);

if (!is_array($payload)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid JSON payload']);
    exit;
}

// Support automatic operator call sign updates across existing leaderboard entries
if (isset($payload['action']) && $payload['action'] === 'rename') {
    $oldName = isset($payload['oldName']) ? trim(strip_tags((string)$payload['oldName'])) : '';
    $newName = isset($payload['newName']) ? trim(strip_tags((string)$payload['newName'])) : 'TECH-404';
    if ($newName === '') {
        $newName = 'TECH-404';
    }
    $newName = mb_substr($newName, 0, 24);

    $entries = loadLeaderboardEntries();
    $updatedCount = 0;
    if ($oldName !== '' && $oldName !== $newName) {
        foreach ($entries as &$entry) {
            if (isset($entry['playerName']) && $entry['playerName'] === $oldName) {
                $entry['playerName'] = $newName;
                $updatedCount++;
            }
        }
        unset($entry);
        if ($updatedCount > 0) {
            saveLeaderboardEntries($entries);
        }
    }

    echo json_encode([
        'status' => 'ok',
        'action' => 'rename',
        'updatedCount' => $updatedCount,
        'newName' => $newName
    ]);
    exit;
}

$playerName = isset($payload['playerName']) ? trim(strip_tags((string)$payload['playerName'])) : 'TECH-404';
if ($playerName === '') {
    $playerName = 'TECH-404';
}
$playerName = mb_substr($playerName, 0, 24);

$score = isset($payload['score']) ? max(0, min(9999999, (int)$payload['score'])) : 0;
$rank = isset($payload['rank']) ? trim(strip_tags((string)$payload['rank'])) : 'Junior Boom Technician';
$rank = mb_substr($rank, 0, 60);

$missionsCompleted = isset($payload['missionsCompleted']) ? max(0, (int)$payload['missionsCompleted']) : 0;
$longestStreak = isset($payload['longestStreak']) ? max(0, (int)$payload['longestStreak']) : 0;
$date = date('Y-m-d');

$newEntry = [
    'playerName' => $playerName,
    'score' => $score,
    'rank' => $rank,
    'missionsCompleted' => $missionsCompleted,
    'longestStreak' => $longestStreak,
    'date' => $date
];

$entries = loadLeaderboardEntries();
$entries[] = $newEntry;
saveLeaderboardEntries($entries);

echo json_encode([
    'status' => 'ok',
    'entry' => $newEntry,
    'totalStored' => min(100, count($entries))
]);
