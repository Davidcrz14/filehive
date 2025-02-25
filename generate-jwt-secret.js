/**
 * Script para generar una clave JWT segura
 * Ejecutar con: node generate-jwt-secret.js
 */

const crypto = require('crypto');

// Generar una clave aleatoria de 64 caracteres hexadecimales (32 bytes)
const jwtSecret = crypto.randomBytes(32).toString('hex');

console.log('='.repeat(60));
console.log('CLAVE JWT SECRETA GENERADA:');
console.log('='.repeat(60));
console.log(jwtSecret);
console.log('='.repeat(60));
console.log('Copia esta clave y úsala como valor para JWT_SECRET en tu archivo .env');
console.log('¡IMPORTANTE! Mantén esta clave en secreto y no la compartas.');
