// src/services/cryptoService.ts
export const cryptoService = {
  encrypt: (data: string) => {
    // Mock AES-256 encryption
    return `encrypted_${btoa(data)}`;
  },
  
  decrypt: (encryptedData: any) => {
    // Mock decryption
    if (typeof encryptedData !== 'string') return '';
    if (!encryptedData.startsWith('encrypted_')) return encryptedData;
    return atob(encryptedData.replace('encrypted_', ''));
  }
};
