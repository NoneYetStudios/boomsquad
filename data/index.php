<?php
// Prevent directory browsing if .htaccess is not active
http_response_code(403);
exit('403 Forbidden - Direct access to persistent data directory is not permitted.');
