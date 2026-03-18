const { createPrivateKey, createPublicKey } = require('crypto');
const fs = require('fs');

const privateKeyPem = `-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC1lOJ2VE0z3RvZ
guYcSajldkunYAIMyuSXuleY1eghwUcKRNYXKPCXHQnkdjuxJy+7nZjcKlcKGJbC
go1jYmfvL5EG6JC+/MIzdNlittKVehe/1fTCpt2RAv3DTMD083D+9k0CgCULhTPH
OAjOMFUvtwkLef84ho8neV72zsyvuz7rGSfMUTjA3aCFIoONlyikl+CiYjY0JuON
YIUoIin1Z2DQtwul4v9p8MsCgCIWzV44ufMqEf7HmEQjcRU32J5O3n/BAEeEBx0c
4qYsBwgFVCdW/9bH4osaa0KYgxc7v5gYdS+j2RGW++15rySWStBwxm2WGDBjpwbJ
WU3s/vsfAgMBAAECggEAA4OAMaz7miDRsfmj9/EpnlhrKgUkFQOfZ8Y4fWHKQ6Od
+yIOMyrczk0cDLqITisayS/JWPKiy4m378dJ8siL3VIs0Bbo/MvJpZLsb/S8tMga
NIvwgrcVkNb0z8t+Ql8sP8AcCQvaFlPQsYQGkO2DgHsIvEWd6DCbuDZTiEVugDSq
2vDNad1J2LRanr6N9O1rGTrfdyOnj1dgHwHaAWhMngLA43+/zWa0srY9lek1Z600
ZOwveQgQc+vLR4gYm3e1MDQRovXxtSqdKsYtE8HLxacxQ3bdCyoPr3ZPWYyOwn3k
fIH1bMFRhEmeFQP1MN9VjH9Ms9o6CV+Uz4T5GC+URQKBgQDcLzrlQ3XGalcTQrhx
XxXPgAEaya45GnVyM5WQpmL8djl2+DSS4p4dtSQ24BIAhFxRIHWNRgooaPlT78b2
sRvVH6a0YAzryNOIxPYbdKNU9xtGTBFJaKAAsMLL9iBjAR0QMK4UqX3qS12hF7V6
pehgre2TghGOpWJKh2hTqOw5iwKBgQDTHi3KfdCSEOiX3wb7PWa682gaMMKEN4x5
pqRcySVZxwlC6zAmgWzl/uV7k8CY1LLpm6HiGHmGXcN4IGlTZwO121uf1kCSYYqm
qyh+FF/brLG/GPg04b7JONdM+jdOyALtKVP87IviCKwvqEASzyOJmbJsXexYJI6m
CC8Yg4ZvPQKBgHaSCIlFlrrOsS1yFJkYt0oSiIXAbc3abbyeAsDumQeTMsbaSpV+
697bmTDj4U3d+UjGzgbR3M5+GSYWTXKzVWWjscYYo1ylvSQ9zLpkSUCMAWgNtpFt
ghxdE8l6NV6bTudVD6mYzHHLPBRwDA6MIWNOxk1VEddbQF8aJBhJM0yZAoGATX8B
fhgrDMMqLj2POYBzimK5LwwBCzm81hcGtIydqlP2oVrl5OyTheXIZVF6XF+PgVNA
3FbxnRIkI596KkRhR0tLWePy9gjaNY4UohtmiKPe53AKBJdtSj4UQkyDKuces+H8
05YdTw6x7hiL1Ju2xtbleQQNMtnQhz/v0cbN/V0CgYBFEPeR0w98q0RmDQVjTdRF
KQf30u/SGqyEZAmCSe2WK/VegFZYM4CgjXM3wf9LWj2VBTtd9CxZzbUNLnYC09nh
ABmJy1IlgEj6PUQzbsr6sHjibiX46OtSVdka3OXfd5CoFY16u1Q4mnJS/axq+aLJ
mt/Rko1SGAQhmeaVSsAV1A==
-----END PRIVATE KEY-----`;

try {
  const privateKey = createPrivateKey(privateKeyPem);
  const publicKey = createPublicKey(privateKey);
  const jwk = publicKey.export({ format: 'jwk' });
  // NO KID
  const jwks = JSON.stringify({ 
    keys: [{ ...jwk, alg: 'RS256', use: 'sig' }] 
  }, null, 2);
  fs.writeFileSync('nokid_jwks.json', jwks);
  console.log("Success: JWKS written to nokid_jwks.json");
} catch (err) {
  // If crypto fails, try manual base64 extract from modulus (n) and exponent (e)
  console.error("Error:", err.message);
  process.exit(1);
}
