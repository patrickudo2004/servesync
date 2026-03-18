const { generateKeyPairSync, createPublicKey } = require('crypto');
const fs = require('fs');

try {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });

  const pubKeyObj = createPublicKey(publicKey);
  const jwk = pubKeyObj.export({ format: 'jwk' });

  // DEFINITELY NO KID
  const jwks = JSON.stringify({ 
    keys: [{ ...jwk, alg: 'RS256', use: 'sig' }] 
  });

  fs.writeFileSync('pk_new.txt', privateKey);
  fs.writeFileSync('jwks_new.json', jwks);
  console.log("Success: Written to pk_new.txt and jwks_new.json");
} catch (err) {
  console.error("Error:", err.message);
  process.exit(1);
}
