<script setup lang="ts">
import { ref, defineEmits } from 'vue';
import { authClient } from '@/utils/auth';

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

const emit = defineEmits<{
  'login-success': [];
}>();

const handleLogin = async () => {
    loading.value = true;
    error.value = '';
    try {
        const res = await authClient.signIn.email({
            email: email.value,
            password: password.value,
        }, {
            onSuccess: async () => {
                console.log("Login successful");
                // Emit event to parent to refresh session
                emit('login-success');
            },
            onError: (ctx) => {
                console.error("Login error context:", ctx);
                // Intenta mostrar más detalles si 'message' es genérico
                const detail = ctx.error.status ? ` (${ctx.error.status})` : '';
                error.value = (ctx.error.message || 'Login failed') + detail;
            }
        });
        
        if (res.error) {
             console.error("Login response error:", res.error);
             error.value = res.error.message || 'Login failed';
        }
    } catch (e: any) {
        console.error("Unexpected login error:", e);
        // Mostrar el error completo si es posible
        error.value = e.message || JSON.stringify(e) || 'An unexpected error occurred.';
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div class="login-container">
        <h2>Login to Levelcast</h2>
        <form @submit.prevent="handleLogin">
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" v-model="email" required />
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" v-model="password" required />
            </div>
            <button type="submit" :disabled="loading" class="login-btn">
                <span v-if="loading" class="loader"></span>
                <span v-else>Login</span>
            </button>
            <div v-if="error" class="error-alert">
                {{ error }}
            </div>
        </form>
    </div>
</template>

<style scoped>
.login-container {
    padding: 20px;
    max-width: 300px;
    margin: 0 auto;
}

.form-group {
    margin-bottom: 15px;
}

label {
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
}

input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 6px;
    box-sizing: border-box; /* Ensure padding doesn't affect width */
}

.login-btn {
    width: 100%;
    padding: 12px;
    background-color: #42b883;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: bold;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    transition: background-color 0.2s;
}

.login-btn:hover:not(:disabled) {
    background-color: #3aa876;
}

.login-btn:disabled {
    background-color: #a8dcc5;
    cursor: not-allowed;
}

.error-alert {
    background-color: #ffebee;
    color: #c62828;
    padding: 10px;
    border-radius: 6px;
    margin-top: 15px;
    font-size: 0.9em;
    border: 1px solid #ef9a9a;
}

.loader {
    width: 16px;
    height: 16px;
    border: 2px solid #ffffff;
    border-bottom-color: transparent;
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
}

@keyframes rotation {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
    background-color: #ccc;
}

.error {
    color: red;
    margin-top: 10px;
}
</style>
