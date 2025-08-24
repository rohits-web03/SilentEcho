import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import axios from "axios"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const goapi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_GOSERVER_BASE_URL,
  withCredentials: true,
});

/**
 * Encodes a Uint8Array to a Base64 string.
 * Standard btoa doesn't work directly with Uint8Arrays.
 */
function uint8ArrayToBase64(buffer: Uint8Array): string {
  let binary = '';
  const len = buffer.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return window.btoa(binary);
}

/**
 * Encrypts content using a password with AES-GCM and PBKDF2.
 * Runs entirely client-side in the browser.
 *
 * @param password The user-provided password.
 * @param content The plaintext string content to encrypt.
 * @returns A Promise resolving to a Base64 encoded string containing salt, IV, and ciphertext.
 * Format: base64(salt + iv + ciphertext)
 * @throws Throws an error if crypto operations fail.
 */
export async function encryptNote(password: string, content: string): Promise<string> {
  try {
    // --- 1. Configuration ---
    const saltSizeBytes = 16; // Size of the salt (128 bits)
    const ivSizeBytes = 12;   // Size of the IV (96 bits) - Recommended for GCM
    const keyLengthBits = 256; // AES key size (128, 192, or 256 bits)
    const pbkdf2Iterations = 100000; // Number of iterations for PBKDF2 (higher is slower but more secure)
    const hashAlgorithm = 'SHA-256'; // Hash algorithm for PBKDF2

    // --- 2. Generate Salt and IV ---
    const salt = window.crypto.getRandomValues(new Uint8Array(saltSizeBytes));
    const iv = window.crypto.getRandomValues(new Uint8Array(ivSizeBytes));

    // --- 3. Derive Key using PBKDF2 ---
    // Import the password as a base key material for PBKDF2
    const passwordKeyMaterial = await window.crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password), // Encode password to Uint8Array
      { name: 'PBKDF2' },
      false, // not extractable
      ['deriveKey']
    );

    // Derive the actual encryption key
    const derivedEncryptionKey = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: pbkdf2Iterations,
        hash: hashAlgorithm,
      },
      passwordKeyMaterial,
      { name: 'AES-GCM', length: keyLengthBits }, // Specify the algorithm and key length for the derived key
      true, // Allow key to be exportable (usually false, but needed for use in encrypt)
      ['encrypt'] // Key usage
    );

    // --- 4. Encrypt Content using AES-GCM ---
    const contentBytes = new TextEncoder().encode(content); // Encode plaintext to Uint8Array

    const encryptedContentBuffer = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv, // Pass the generated IV
        // Optional: additionalAuthenticatedData: new Uint8Array([...]), // For associating non-secret data
        // Optional: tagLength: 128, // Size of the authentication tag (default is 128)
      },
      derivedEncryptionKey, // The key derived via PBKDF2
      contentBytes // The data to encrypt
    );

    // encryptedContentBuffer is an ArrayBuffer. Convert it to Uint8Array.
    const encryptedContentBytes = new Uint8Array(encryptedContentBuffer);

    // --- 5. Combine Salt, IV, and Ciphertext ---
    const combinedBytes = new Uint8Array(salt.length + iv.length + encryptedContentBytes.length);
    combinedBytes.set(salt, 0); // Start with salt
    combinedBytes.set(iv, salt.length); // Append IV
    combinedBytes.set(encryptedContentBytes, salt.length + iv.length); // Append ciphertext

    // --- 6. Encode to Base64 ---
    const base64Ciphertext = uint8ArrayToBase64(combinedBytes);

    return base64Ciphertext;

  } catch (error) {
    console.error("Encryption failed:", error);
    // Rethrow or handle the error appropriately in your application
    throw new Error("Failed to encrypt note. Please try again.");
  }
}

/**
 * Decodes a Base64 string to a Uint8Array.
 */
function base64ToUint8Array(base64: string): Uint8Array {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes;
}

/**
 * Decrypts content using a password with AES-GCM and PBKDF2.
 * Assumes the input base64 string contains salt + iv + ciphertext.
 * Runs entirely client-side in the browser.
 *
 * @param password The user-provided password.
 * @param base64Ciphertext The Base64 encoded string from encryptNote.
 * @returns A Promise resolving to the original plaintext string.
 * @throws Throws an error if decryption fails (e.g., wrong password, tampered data).
 */
export async function decryptNote(password: string, base64Ciphertext: string): Promise<string> {
  try {
    // --- 1. Configuration (MUST match encryption) ---
    const saltSizeBytes = 16;
    const ivSizeBytes = 12;
    const keyLengthBits = 256;
    const pbkdf2Iterations = 100000;
    const hashAlgorithm = 'SHA-256';

    // --- 2. Decode Base64 and Extract Components ---
    const combinedBytes = base64ToUint8Array(base64Ciphertext);

    if (combinedBytes.length < saltSizeBytes + ivSizeBytes) {
      throw new Error("Invalid ciphertext format: too short.");
    }

    const salt = combinedBytes.slice(0, saltSizeBytes);
    const iv = combinedBytes.slice(saltSizeBytes, saltSizeBytes + ivSizeBytes);
    const encryptedContentBytes = combinedBytes.slice(saltSizeBytes + ivSizeBytes);

    // --- 3. Derive Key using PBKDF2 (same process as encryption) ---
    const passwordKeyMaterial = await window.crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    const derivedDecryptionKey = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt, // Use the extracted salt
        iterations: pbkdf2Iterations,
        hash: hashAlgorithm,
      },
      passwordKeyMaterial,
      { name: 'AES-GCM', length: keyLengthBits },
      true,
      ['decrypt'] // Key usage for decryption
    );

    // --- 4. Decrypt Content using AES-GCM ---
    const decryptedContentBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv, // Use the extracted IV
        // Optional: additionalAuthenticatedData: new Uint8Array([...]), // Must match encryption if used
        // Optional: tagLength: 128,
      },
      derivedDecryptionKey,
      encryptedContentBytes // The ciphertext part
    );

    // --- 5. Decode Plaintext ---
    const decryptedContent = new TextDecoder().decode(decryptedContentBuffer);
    return decryptedContent;

  } catch (error) {
    console.error("Decryption failed:", error);
    // Decryption often fails with a generic error if the password is wrong
    // or the data is corrupted/tampered. Provide a user-friendly message.
    throw new Error("Failed to decrypt note. Check the password or the note data may be corrupted.");
  }
}