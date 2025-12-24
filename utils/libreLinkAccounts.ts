import { ref } from 'vue';

const API_URL = import.meta.env.DEV ? "http://localhost:3000" : "https://api.levelcast.org";

export interface Account {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    error?: string;
    available: boolean;
}

async function generateKeyPair() {
    return crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
    );
}

async function exportPublicKey(key: CryptoKey) {
    const exported = await crypto.subtle.exportKey("spki", key);
    const exportedAsString = String.fromCharCode(...new Uint8Array(exported));
    const exportedAsBase64 = btoa(exportedAsString);
    const pemExported = `-----BEGIN PUBLIC KEY-----\n${exportedAsBase64}\n-----END PUBLIC KEY-----`;
    return pemExported;
}

async function decryptMessage(key: CryptoKey, ciphertext: string) {
    const binaryString = atob(ciphertext);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    const decrypted = await crypto.subtle.decrypt(
        {
            name: "RSA-OAEP",
        },
        key,
        bytes
    );

    const dec = new TextDecoder();
    return dec.decode(decrypted);
}

export async function fetchCredentialsMap() {
    const credentialsMap = new Map<string, any>();
    try {
        const keyPair = await generateKeyPair();
        const publicKey = await exportPublicKey(keyPair.publicKey);

        const response = await fetch(`${API_URL}/api/v1/libreLinkAccounts/credentials`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ publicKey })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch credentials');
        }

        const encryptedData = await response.json();

        for (const item of encryptedData) {
            try {
                const decrypted = await decryptMessage(keyPair.privateKey, item.data);
                credentialsMap.set(item.accountId, JSON.parse(decrypted));
            } catch (e) {
                console.error(`Failed to decrypt credentials for ${item.accountId}`, e);
            }
        }

    } catch (err) {
        console.error("Error fetching credentials:", err);
    }
    return credentialsMap;
}

export function useLibreLinkAccounts() {
    const accounts = ref<Account[]>([]);
    const loading = ref(false);
    const error = ref('');

    async function fetchAccounts() {
        loading.value = true;
        error.value = '';
        try {
            const response = await fetch(`${API_URL}/api/v1/libreLinkAccounts`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch accounts');
            }

            accounts.value = await response.json();

            // Fetch credentials and log them (keeping existing behavior for now, but using the new function)
            const creds = await fetchCredentialsMap();
            console.log("Fetched credentials:", creds);

        } catch (err: any) {
            console.error(err);
            error.value = err.message || 'An error occurred';
        } finally {
            loading.value = false;
        }
    }

    return {
        accounts,
        loading,
        error,
        fetchAccounts
    };
}
