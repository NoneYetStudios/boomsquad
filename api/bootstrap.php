<?php
/**
 * BOOM SQUAD - Server-Side API Bootstrap
 * Centralizes JSON headers, input sanitization, and protected storage access.
 */

if (basename($_SERVER['PHP_SELF']) === 'bootstrap.php') {
    http_response_code(403);
    exit('Forbidden');
}

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Cache-Control: no-store, no-cache, must-revalidate');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

define('BOOM_DATA_DIR', dirname(__DIR__) . DIRECTORY_SEPARATOR . 'data');
define('BOOM_LEADERBOARD_FILE', BOOM_DATA_DIR . DIRECTORY_SEPARATOR . 'leaderboard_data.json');

function getDefaultLeaderboardSeed(): array {
    return [
        [
            'playerName' => 'BRENDA_HR',
            'score' => 64200,
            'rank' => 'Director of Boom Mitigation',
            'missionsCompleted' => 22,
            'longestStreak' => 9,
            'date' => '2026-10-18'
        ],
        [
            'playerName' => 'GARY_NIGHTSHIFT',
            'score' => 41850,
            'rank' => 'Principal Boom Engineer',
            'missionsCompleted' => 16,
            'longestStreak' => 7,
            'date' => '2026-10-24'
        ],
        [
            'playerName' => 'BASSLIFT_CHAMP99',
            'score' => 28900,
            'rank' => 'Boom Analyst',
            'missionsCompleted' => 11,
            'longestStreak' => 6,
            'date' => '2026-11-01'
        ],
        [
            'playerName' => 'KEVIN_ACCOUNTING',
            'score' => 14500,
            'rank' => 'Senior Boom Technician',
            'missionsCompleted' => 6,
            'longestStreak' => 4,
            'date' => '2026-11-03'
        ],
        [
            'playerName' => 'INTERN_TIMMY',
            'score' => 4200,
            'rank' => 'Boom Technician',
            'missionsCompleted' => 3,
            'longestStreak' => 2,
            'date' => '2026-11-08'
        ]
    ];
}

function loadLeaderboardEntries(): array {
    if (!is_dir(BOOM_DATA_DIR)) {
        @mkdir(BOOM_DATA_DIR, 0750, true);
    }

    if (!file_exists(BOOM_LEADERBOARD_FILE)) {
        $seed = getDefaultLeaderboardSeed();
        @file_put_contents(BOOM_LEADERBOARD_FILE, json_encode($seed, JSON_PRETTY_PRINT), LOCK_EX);
        return $seed;
    }

    $raw = @file_get_contents(BOOM_LEADERBOARD_FILE);
    $decoded = json_decode((string)$raw, true);
    if (!is_array($decoded) || count($decoded) === 0) {
        return getDefaultLeaderboardSeed();
    }

    return $decoded;
}

function saveLeaderboardEntries(array $entries): bool {
    if (!is_dir(BOOM_DATA_DIR)) {
        @mkdir(BOOM_DATA_DIR, 0750, true);
    }

    usort($entries, function ($a, $b) {
        return ((int)($b['score'] ?? 0)) <=> ((int)($a['score'] ?? 0));
    });

    $trimmed = array_slice($entries, 0, 100);
    return @file_put_contents(BOOM_LEADERBOARD_FILE, json_encode($trimmed, JSON_PRETTY_PRINT), LOCK_EX) !== false;
}
