import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const secretKey = process.env.ENCRYPTION_SECRET || 'x69fT3w7nKqPdLdA7VeMjX890BHuYg5R';
const key = crypto.scryptSync(secretKey, 'salt', 32);

export const encryptPassword = (password: string): string => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  
  let encrypted = cipher.update(password, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Combine IV and encrypted data
  return iv.toString('hex') + ':' + encrypted;
};

export const decryptPassword = (encryptedPassword: string): string => {
  const parts = encryptedPassword.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};

export const comparePassword = (plainPassword: string, encryptedPassword: string): boolean => {
  try {
    const decrypted = decryptPassword(encryptedPassword);
    return plainPassword === decrypted;
  } catch (error) {
    return false;
  }
}; 