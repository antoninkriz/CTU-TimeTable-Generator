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
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAty7DRyR3p5PoboPflG+n
CRCPv8kVunTI6G/wWF40eHWMOm3bnH2q+H2YcaaEnYA7A5bRuAwVoT46OR8c09I8
kiv24B07nt0KCkmzoy6or7qoOy7IuYDJRIg4m7ljYXYCeiFhEVcSOjT132o41FZP
SL89uESanPEwKyLnI1nYx5l9utKdDaO2TI5K891xv4okrskYdM05oaiQXE4mQpJX
Hr91WwbTNLzWykEVTBQbe1czC7tvVEapGlWdObjGsCXGCGahgggfwUVyIYyix1Ff
jlMMnHCk3ZC132S5d4Qjzwq6ILehDMA5O967JxWWVBdrCJXKwtRbMBlBO6ywa9HI
jQIDAQAB
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
