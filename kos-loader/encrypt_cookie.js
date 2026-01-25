/**
 * Cookie encryption from KOS frontend
 * 
 * How to use:
 * 1. Open kos.cvut.cz in browser
 * 2. Login
 * 3. Open developer console (F12)
 * 4. Open Application tab -> Cookies -> https://kos.cvut.cz
 * 5. Open Console
 * 6. Paste this code in console
 * 7. Run `await encryptCookie('<YOUR_COOKIE_VALUE>')` with copy-pasted cookie values for cookies:
 *  - JSESSIONID
 *  - XSRF-TOKEN
 * 8. Copy the output values and use them as encrypted cookies in kos-loader
 */

/**
 * RSA Public Key in PEM format
 */
const PUB_KEY_PEM = `
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2BGOAQqMQ0Uda3jweNM0
uMiWVHDy0vipzSyvYiScmv0eU5bLVMClH532r2AeCk8rDfk6t3mUrtsL89P8TVqF
gB6a8xnojybOeVuMjKCHgXB+pTwfEzgROK35oXgXD158ClZ9aEtEtoUXrTSYa2Z6
iqXh/pzhNC16z+Z2O4mZffBt5X6Fhd+uF/NDQJijh8mnLLBaT20E/MNxkehzL6QO
ycQUEEemP1FG0v7Ipn9z1V0zz82Mqjdm5UEfaDKm3PbIB9Y+em2abnwmOqcvAl82
fmW18zjW9882EwFcSpj9auT5GC4fdnEITJjc+8lo702EPrZcKXytNR/lDmFHOvN5
5wIDAQAB
-----END PUBLIC KEY-----
`

/**
 * Encrypt plaintext with an RSA public key (PEM) using RSA-OAEP SHA-256.
 *
 * @param {string} plaintext - String to encrypt
 * @returns {Promise<string>} Base64-encoded ciphertext
 */
async function encryptCookie(plaintext) {
  const pemBody = PUB_KEY_PEM
    .trim()
    .replace(/-----BEGIN PUBLIC KEY-----/, "")
    .replace(/-----END PUBLIC KEY-----/, "")
    .replace(/\s+/g, "")

  const keyDer = Uint8Array.fromBase64(pemBody)

  const publicKey = await crypto.subtle.importKey(
    "spki",
    keyDer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    false,
    ["encrypt"],
  )

  const encoded = new TextEncoder().encode(plaintext)

  const ciphertext = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    encoded,
  )

  return new Uint8Array(ciphertext).toBase64()
}
