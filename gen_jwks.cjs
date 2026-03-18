const { createPrivateKey, createPublicKey } = require('crypto');
const fs = require('fs');

const privateKeyPem = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDs8laRJP388ONl
m/W86ZsmdnzOwFNwK5SRkB66QqEngkANeUT2cvx3AXpEBvrpB6UUSZxtn5q8/zNW
hH7qRQsLweDleiMD+fZLjd1pF1DSNc+Q7BqvNgM/86xDd60nldEueXdukac/99CF
tJF1tZ0FRTLY/WEPSI6gbwP1oBe2SUFyKffA5HvQwQ/nsDRVlTDEyDE36Lw4p4Vb
iSL7d/g0ArfPK0AkgLQDc2JhaGYCQ4ziHdOqJMp9Ee13gReoaXgdqE5WJ4Kj6wSx
c6dwgHFaGx3blGyz0x9XVfPGGSyYkExnKhaL5VtK0/PAJwRkdkDZ9LhHsNQrW8yI
lwnTDO5HAgMBAAECggEADlmyVCcSj5ECogLwk/OYAcaCUj6ZWb1MnwZEqNDj6Wcn
kZ6rG7v6E2EOXR6zxTeWernnP0e/0OYp308LUA1Ew9OxrGREc6IIwH8D47Cq+e2S
t9Bni1NbngdtgvE1a6TUtEUHWTXOvyk3QqnIIiy7fk1jF3uSYcu/Vkhy9nDZjsts
0JB14qj7qVUZqwB16MtS15vSZVEahUcBPyLwW7iL1BHbyjFVcsb81K1li/gpsWGr
NzuhEsSt0kTzjlAK5NE1KeildwKci440dPUfZETqNPj51iN7vLJjJVYv8xwv+0pw
mXOJil92qFjJupk9mT7wU6Jb7Xvl4WlBR2FIZupk9mT7wU6Jb7Xvl4WlBR2FIZrh
fjQKBgQD/rch9PaHdPuJYKLmsE4F96IVhBhfz8SxeL1MR+r0CZ5WD02zF+iZLdCE
y8GhN5UXt13WqcIZYfOrW2XJKAImkFrCYvSUsXoq3z9n9JS57uzYw4E5j4BQucUi
0XVLzrsPOOuuSCQrVe8bS3Cd4ja/SPiWt3EeQRhRJRgPHGQOtMwKBgQDtPogKVWl
GhYX9usMtPzaategmxeluRTYV9B5zNgLZjVNWh2/bWEH9QheuxHe52QfF9hTfbOj
/jb/W89JrsZBY8sgQmpWaGbpLaKm2loELPsgbmEg0AdIxXB/j8aDiH3ysiCTTp6u
kXEV2PQndI3W4TXyIudRZmbkRucBTdqlynQKBgQCGbz66s1xXc4gZqJgv5TWyGT+
AS27uwgF9KE76ZidZi1NvNAy+cBAQnmgSW5vMUWAada6VxoKtJkloXH8eb/fvQkr
qlJFmKfOwQGazFwjA4CfXPSmalCioXsJGq8dA/8ROvGY+q+h5ZZKeLknGtmEbH7g
6GVe7gU2LVXgJCJsJRwKBgFAsGIb9dBUb3DrxWTG6Mfa4UFqB+S+FfhCPLZcbgn0
IUEhmfntuaOZv5lbuF9ObLxBL56PVRyvNOC4ouUwhdjlI2ikaREIOPbFsDiYg2Dz
3m2IP5R6GGwUJL9G0/vxLTbN0UpWgDNX/RI3/dIzhhc+hh9sgiU06MJt33TGXYQ3
VAoGAQANnxhZAXyN5AmZ+BlROa5W2IAMhB+Q/fYUlwsoOQGLT9ujpCOnEEP+1gI3
RJG3ByNADPGKYbeShy+rlwllqMLs7mtE4BUIp0ZwFPuFPsK+qxBQhY10UeT5M1M
dQahtC48NyG2SwQaB768mU7c9H2SZ070Lf5PUKVeLpwhfo+Cc=
-----END PRIVATE KEY-----`;

try {
  const privateKey = createPrivateKey(privateKeyPem);
  const publicKey = createPublicKey(privateKey);
  const jwk = publicKey.export({ format: 'jwk' });
  const jwks = JSON.stringify({ 
    keys: [{ ...jwk, kid: 'convex-auth', alg: 'RS256', use: 'sig' }] 
  }, null, 2);
  fs.writeFileSync('output_jwks.json', jwks);
  console.log("Success: JWKS written to output_jwks.json");
} catch (err) {
  console.error("Error:", err.message);
  process.exit(1);
}
