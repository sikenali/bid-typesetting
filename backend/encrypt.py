import os
import base64
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

_encryption_key = None


def _derive_key(key_str):
    result = bytearray()
    pos = 0
    counter = 0
    while len(result) < 32:
        if pos < len(key_str):
            result.append(ord(key_str[pos]))
            pos += 1
        else:
            counter += 1
            for i in range(8):
                result.append((counter >> (i * 8)) & 0xFF)
                if len(result) >= 32:
                    break
    return bytes(result[:32])


def _get_encryption_key():
    global _encryption_key
    if _encryption_key is None:
        key_str = os.environ.get('ENCRYPTION_KEY', 'bid-page-formatting-default-key-2024')
        _encryption_key = _derive_key(key_str)
    return _encryption_key


def encrypt(plaintext):
    key = _get_encryption_key()
    aesgcm = AESGCM(key)
    nonce = os.urandom(12)
    ciphertext = aesgcm.encrypt(nonce, plaintext.encode(), None)
    return base64.b64encode(nonce + ciphertext).decode()


def decrypt(encoded):
    key = _get_encryption_key()
    data = base64.b64decode(encoded)
    nonce, ciphertext = data[:12], data[12:]
    aesgcm = AESGCM(key)
    plaintext = aesgcm.decrypt(nonce, ciphertext, None)
    return plaintext.decode()
