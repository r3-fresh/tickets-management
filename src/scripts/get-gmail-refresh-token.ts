import { config } from 'dotenv';
import { google } from 'googleapis';
import * as readline from 'readline';
import * as path from 'path';

// Load .env.local explicitly
config({ path: path.resolve(process.cwd(), '.env.local') });

// Verify environment variables
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error('❌ Error: Faltan variables de entorno');
    console.error('');
    console.error('Variables encontradas:');
    console.error(`GOOGLE_CLIENT_ID: ${process.env.GOOGLE_CLIENT_ID ? '✓' : '✗'}`);
    console.error(`GOOGLE_CLIENT_SECRET: ${process.env.GOOGLE_CLIENT_SECRET ? '✓' : '✗'}`);
    console.error('');
    console.error('Asegúrate de tener estas variables en .env.local');
    process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.BETTER_AUTH_URL || 'http://localhost:3000'}/api/auth/callback/google`
);

const SCOPES = [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.readonly' // Needed for threading (messages.get)
];

console.log('='.repeat(60));
console.log('📧 Gmail API - Obtener Refresh Token');
console.log('='.repeat(60));
console.log();

// Generate auth URL
const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent', // Force to get refresh token
});

console.log('1️⃣  Abre esta URL en tu navegador:');
console.log();
console.log(authUrl);
console.log();
console.log('2️⃣  Inicia sesión con: cendoc@continental.edu.pe');
console.log();
console.log('3️⃣  Acepta los permisos');
console.log();
console.log('4️⃣  Serás redirigido a una página (puede dar error, no importa)');
console.log();
console.log('5️⃣  Copia el CÓDIGO de la URL (parámetro "code=...")');
console.log('    Ejemplo: http://localhost:3000?code=4/0AY0e-g7...');
console.log('    El código es: 4/0AY0e-g7...');
console.log();
console.log('='.repeat(60));
console.log();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.question('Pega el código aquí: ', async (code) => {
    try {
        console.log();
        console.log('⏳ Obteniendo tokens...');
        console.log();

        const { tokens } = await oauth2Client.getToken(code);

        console.log('✅ ¡Éxito! Refresh Token obtenido:');
        console.log();
        console.log('─'.repeat(60));
        console.log(tokens.refresh_token);
        console.log('─'.repeat(60));
        console.log();
        console.log('📝 Agrega esto a tu .env.local:');
        console.log();
        console.log(`GMAIL_REFRESH_TOKEN="${tokens.refresh_token}"`);
        console.log();
        console.log('⚠️  IMPORTANTE: Este token es sensible, no lo compartas.');
        console.log();
    } catch (error: any) {
        console.error('❌ Error al obtener el token:');
        console.error(error.message);
        console.log();
        console.log('💡 Asegúrate de:');
        console.log('   1. Haber copiado el código completo');
        console.log('   2. Haber iniciado sesión con cendoc@continental.edu.pe');
        console.log('   3. Haber agregado el scope gmail.send en Google Cloud Console');
    }
    rl.close();
});
