# Server-Monitoring

## Device fingerprint sign-in

The login screen uses WebAuthn passkeys. Supported browsers ask the device to verify with a fingerprint, face unlock, or the device screen lock. The website never reads biometric data. Passkeys require HTTPS (localhost is allowed while testing) and work on current desktop and mobile browsers with WebAuthn support.

1. Deploy the site to its final HTTPS hostname first. Open the login screen at that exact hostname on the device you want to authorize and choose **SET UP THIS DEVICE**. WebAuthn credentials are bound to the hostname, so a passkey created at localhost or a temporary host cannot be moved to a different domain.
2. Approve the browser's device verification prompt. The browser downloads a `user.json` containing the passkey credential ID and public key. Keep this file private because it configures who may sign in.
3. Replace `src/data/user.json` on your host with the downloaded file and reload the site. The fingerprint/passkey login button is now enabled. Keep an offline backup of your previous file.
4. For an additional device, use that device's password sign-in and repeat setup there; upload its newly downloaded file. The static setup creates one active passkey per configuration.

The generated file can retain the current password hash as a fallback. The existing password is a legacy MD5 hash, which is not suitable for protecting sensitive data. This project is a static client-side demo: a visitor who can modify the served JavaScript can bypass its login gate. Use server-side WebAuthn verification and real access controls for private or sensitive services. The passkey public key is not biometric data; the private key stays in the device's authenticator.
