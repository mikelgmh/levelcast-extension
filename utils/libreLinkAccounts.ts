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
