<?php

// Router script for PHP built-in server
// This ensures all requests go through index.php

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

// If the file exists and is not index.php, serve it directly
if ($uri !== '/' && file_exists(__DIR__ . $uri)) {
    return false;
}

// Otherwise, pass to index.php
require __DIR__ . '/index.php';
