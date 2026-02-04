<?php
// Script to generate JWT keys (without passphrase for simplicity)

$privateKeyPath = __DIR__ . '/config/jwt/private.pem';
$publicKeyPath = __DIR__ . '/config/jwt/public.pem';

echo "Generating RSA key pair...\n";

// Set OpenSSL configuration path for Windows/WAMP
putenv('OPENSSL_CONF=C:\\wamp64\\bin\\php\\php8.3.14\\extras\\ssl\\openssl.cnf');

// Configuration for key generation
$config = [
    "config" => "C:\\wamp64\\bin\\php\\php8.3.14\\extras\\ssl\\openssl.cnf",
    "digest_alg" => "sha256",
    "private_key_bits" => 4096,
    "private_key_type" => OPENSSL_KEYTYPE_RSA,
];

// Generate private key
$privateKey = openssl_pkey_new($config);
if ($privateKey === false) {
    $errors = [];
    while ($msg = openssl_error_string()) {
        $errors[] = $msg;
    }
    die("Error generating private key:\n" . implode("\n", $errors) . "\n");
}

// Export private key WITHOUT passphrase
$exported = openssl_pkey_export($privateKey, $privateKeyPEM);
if ($exported === false) {
    $errors = [];
    while ($msg = openssl_error_string()) {
        $errors[] = $msg;
    }
    die("Error exporting private key:\n" . implode("\n", $errors) . "\n");
}

// Save private key
file_put_contents($privateKeyPath, $privateKeyPEM);
echo "✓ Private key saved to: $privateKeyPath\n";

// Extract public key
$publicKeyDetails = openssl_pkey_get_details($privateKey);
if ($publicKeyDetails === false) {
    $errors = [];
    while ($msg = openssl_error_string()) {
        $errors[] = $msg;
    }
    die("Error extracting public key:\n" . implode("\n", $errors) . "\n");
}

// Save public key
file_put_contents($publicKeyPath, $publicKeyDetails['key']);
echo "✓ Public key saved to: $publicKeyPath\n";

// Set permissions (Windows compatible)
@chmod($privateKeyPath, 0600);
@chmod($publicKeyPath, 0644);

echo "\n✓ JWT keys generated successfully!\n";
echo "\nNOTE: Keys generated WITHOUT passphrase.\n";
echo "Update your .env file to remove the JWT_PASSPHRASE or set it to empty.\n";


// Export private key with passphrase
$exported = openssl_pkey_export($privateKey, $privateKeyPEM, $passphrase);
if ($exported === false) {
    die("Error exporting private key: " . openssl_error_string() . "\n");
}

// Save private key
file_put_contents($privateKeyPath, $privateKeyPEM);
echo "Private key saved to: $privateKeyPath\n";

// Extract public key
$publicKeyDetails = openssl_pkey_get_details($privateKey);
if ($publicKeyDetails === false) {
    die("Error extracting public key: " . openssl_error_string() . "\n");
}

// Save public key
file_put_contents($publicKeyPath, $publicKeyDetails['key']);
echo "Public key saved to: $publicKeyPath\n";

// Set permissions (Windows compatible)
chmod($privateKeyPath, 0600);
chmod($publicKeyPath, 0644);

echo "\nJWT keys generated successfully!\n";
echo "Private key: $privateKeyPath\n";
echo "Public key: $publicKeyPath\n";
