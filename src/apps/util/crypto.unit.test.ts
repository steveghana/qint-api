import { strict as assert } from 'assert';
import cryptoUtil from './crypto';

describe('cryptoUtil', () => {
    describe('compare', () => {
        it('Trivial', async () => {
            const unhashed = 'plaintext';
            const hashed = await cryptoUtil.hash(unhashed, 10);
            assert.ok(await cryptoUtil.compare(unhashed, hashed));
        });
    });

    describe('Encrypt & Decrypt', () => {
        it('Trivial', () => {
            const plainText = 'plaintext';
            const key = 'Some 32 bytes long string ......';
            const iv = cryptoUtil.createIv();
            const cipherText = cryptoUtil.encrypt(plainText, key, iv);
            const decipheredText = cryptoUtil.decrypt(cipherText, key, iv);
            assert.notEqual(plainText, cipherText);
            assert.strictEqual(plainText, decipheredText);
        });
    });
});
