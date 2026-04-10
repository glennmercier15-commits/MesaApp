// src/services/cryptoService.ts
export const cryptoService = {
  encrypt: (data: string) => {
    // Mock AES-256 encryption
    return `encrypted_${btoa(data)}`;
  },
  
  decrypt: (encryptedData: string) => {
    // Mock decryption
    return atob(encryptedData.replace('encrypted_', ''));
  }
};
