import { pbkdf2, randomBytes, timingSafeEqual, createCipheriv, createDecipheriv } from 'crypto';
import { promisify } from 'util';

const saltLength = 64; // in bytes
const partsSeparator = '$';
const defaultIterations = Math.pow(2, 17);

async function hashWithSalt(srcData: string, salt: string, iterations = defaultIterations) {
    // https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
    const keyLength = 64; // in bytes
    const digestAlgorithm = 'sha512';
    const derivedKey = await promisify(pbkdf2)(srcData, salt, Number(iterations), keyLength, digestAlgorithm);
    const hashed = derivedKey.toString('hex');
    return hashed;
}

/**
 *
 * @param srcData
 * @param iterations The higher the better, but slower
 */
async function hash(srcData: string, iterations = defaultIterations): Promise<string> {
    const salt = randomBytes(saltLength).toString('hex');
    const hashed = await hashWithSalt(srcData, salt, iterations);
    return [iterations, salt, hashed].join(partsSeparator);
}

async function compare(unhashedLeft: string, hashedRight: string): Promise<boolean> {
    const rightParts = hashedRight.split(partsSeparator);
    const iterations = rightParts[0];
    const rightSalt = rightParts[1];
    const rightHash = rightParts.slice(2).join(partsSeparator);

    const leftHash = await hashWithSalt(unhashedLeft, rightSalt, Number(iterations));

    return timingSafeEqual(Buffer.from(leftHash), Buffer.from(rightHash));
}

type encryptionAlgorithm = 'aes-256-ctr';

/**
 * https://en.wikipedia.org/wiki/Initialization_vector
 * @returns
 */
function createIv(): string {
    return randomBytes(16).toString('hex');
}

/**
 *
 * @param plainText
 * @param key 32 bytes (256 bits) for aes-256
 * @param iv 16 bytes (128 bits) for aes-256
 * @param algorithm
 * @returns
 */
function encrypt(plainText: string, key: string, iv: string, algorithm: encryptionAlgorithm = 'aes-256-ctr'): string {
    const cipher = createCipheriv(algorithm, key, Buffer.from(iv, 'hex'));
    const encrypted = Buffer.concat([cipher.update(plainText), cipher.final()]);
    return encrypted.toString('hex');
}

/**
 *
 * @param cipherText
 * @param key 32 bytes (256 bits) for aes-256
 * @param iv 16 bytes (128 bits) for aes-256
 * @param algorithm
 * @returns
 */
function decrypt(cipherText: string, key: string, iv: string, algorithm: encryptionAlgorithm = 'aes-256-ctr'): string {
    const decipher = createDecipheriv(algorithm, key, Buffer.from(iv, 'hex'));
    const decrypted = Buffer.concat([decipher.update(Buffer.from(cipherText, 'hex')), decipher.final()]);
    return decrypted.toString();
}

export default {
    hash,
    compare,
    createIv,
    encrypt,
    decrypt,
};
