const { generateKeyPairSync } = require('crypto');
const fs = require('fs');

try {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });

  const { createPublicKey } = require('crypto');
  const pubKeyObj = createPublicKey(publicKey);
  const jwk = pubKeyObj.export({ format: 'jwk' });

  const result = {
    PRIVATE_KEY: privateKey,
    JWKS: JSON.stringify({ 
      keys: [{ ...jwk, kid: 'convex-auth', alg: 'RS256', use: 'sig' }] 
    })
  };

  fs.writeFileSync('final_keys.json', JSON.stringify(result, null, 2));
  console.log("Success: Keys written to final_keys.json");
} catch (err) {
  console.error("Error:", err.message);
  process.exit(1);
}
