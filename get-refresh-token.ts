import { createInterface } from "readline";
import { appendFileSync, readFileSync, existsSync } from "fs";

// Función auxiliar para leer variables del archivo .env.submit
function getEnvValue(key: string): string {
  if (!existsSync('.env.submit')) {
    console.error("Error: No se encuentra el archivo .env.submit");
    process.exit(1);
  }
  const content = readFileSync('.env.submit', 'utf-8');
  const match = content.match(new RegExp(`^${key}=(.*)$`, 'm'));
  if (!match) {
    console.error(`Error: No se encuentra la variable ${key} en .env.submit`);
    process.exit(1);
  }
  return match[1].trim();
}

const CLIENT_ID = getEnvValue('CHROME_CLIENT_ID');
const CLIENT_SECRET = getEnvValue('CHROME_CLIENT_SECRET');
const REDIRECT_URI = "urn:ietf:wg:oauth:2.0:oob";
const AUTH_URL = `https://accounts.google.com/o/oauth2/auth?response_type=code&scope=https://www.googleapis.com/auth/chromewebstore&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}`;

console.log("\n=== Generador de Token de Refresco para Chrome Web Store ===\n");
console.log("1. Abre la siguiente URL en tu navegador:");
console.log(`\n${AUTH_URL}\n`);
console.log("2. Inicia sesión con tu cuenta de Google y autoriza la aplicación.");
console.log("3. Copia el código que aparece en la pantalla.");

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("\nPegue el código aquí: ", async (code) => {
  try {
    console.log("\nIntercambiando código por token...");
    
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: code.trim(),
        grant_type: "authorization_code",
        redirect_uri: REDIRECT_URI,
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error("Error obteniendo el token:", data);
    } else if (data.refresh_token) {
      console.log("\n¡Éxito! Token de refresco obtenido.");
      
      const envFile = ".env.submit";
      const envContent = `\nCHROME_REFRESH_TOKEN=${data.refresh_token}\n`;
      
      appendFileSync(envFile, envContent);
      console.log(`Se ha añadido CHROME_REFRESH_TOKEN a ${envFile}`);
    } else {
      console.error("No se recibió refresh_token. Respuesta:", data);
    }
  } catch (error) {
    console.error("Error de red:", error);
  } finally {
    rl.close();
  }
});
