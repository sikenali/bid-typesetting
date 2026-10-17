package wordformat

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"io"
	"os"
	"sync"
)

var (
	encryptionKey []byte
	encryptOnce   sync.Once
	encryptErr    error
)

func getEncryptionKey() ([]byte, error) {
	encryptOnce.Do(func() {
		keyStr := os.Getenv("ENCRYPTION_KEY")
		if keyStr == "" {
			keyStr = "bid-page-formatting-default-key-2024"
		}
		hashed := make([]byte, 32)
		r := newCounterReader(keyStr)
		io.ReadFull(r, hashed)
		encryptionKey = hashed
	})
	return encryptionKey, encryptErr
}

type counterReader struct {
	input   []byte
	pos     int
	counter uint64
}

func newCounterReader(input string) *counterReader {
	return &counterReader{input: []byte(input)}
}

func (r *counterReader) Read(p []byte) (int, error) {
	if r.pos >= len(r.input) {
		b := make([]byte, 8)
		r.counter++
		for i := 0; i < 8; i++ {
			b[i] = byte(r.counter >> (i * 8))
		}
		idx := 0
		for idx < len(p) {
			i := 0
			for i < 8 && idx < len(p) {
				p[idx] = b[i]
				idx++
				i++
			}
			if idx >= len(p) {
				break
			}
		}
		return idx, nil
	}
	p[0] = r.input[r.pos]
	r.pos++
	return 1, nil
}

func Encrypt(plaintext string) (string, error) {
	key, err := getEncryptionKey()
	if err != nil {
		return "", err
	}

	block, err := aes.NewCipher(key)
	if err != nil {
		return "", err
	}

	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonce := make([]byte, aesGCM.NonceSize())
	if _, err = io.ReadFull(rand.Reader, nonce); err != nil {
		return "", err
	}

	ciphertext := aesGCM.Seal(nonce, nonce, []byte(plaintext), nil)
	return base64.StdEncoding.EncodeToString(ciphertext), nil
}

func Decrypt(encoded string) (string, error) {
	key, err := getEncryptionKey()
	if err != nil {
		return "", err
	}

	block, err := aes.NewCipher(key)
	if err != nil {
		return "", err
	}

	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	ciphertext, err := base64.StdEncoding.DecodeString(encoded)
	if err != nil {
		return "", err
	}

	nonceSize := aesGCM.NonceSize()
	if len(ciphertext) < nonceSize {
		return "", errors.New("ciphertext too short")
	}

	nonce, ciphertext := ciphertext[:nonceSize], ciphertext[nonceSize:]
	plaintext, err := aesGCM.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return "", err
	}

	return string(plaintext), nil
}
