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
                emit('login-success');
            },
            onError: (ctx) => {
                console.error("Login error context:", ctx);
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
        error.value = e.message || JSON.stringify(e) || 'An unexpected error occurred.';
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div class="p-6 flex flex-col justify-center h-full">
        <h2 class="text-xl font-bold text-slate-900 mb-1">Bienvenido</h2>
        <p class="text-xs text-slate-500 mb-6">Inicia sesión para ver tus datos rápidos.</p>
        <form @submit.prevent="handleLogin" class="space-y-3">
            <input 
                type="email" 
                placeholder="Email" 
                v-model="email" 
                required
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 outline-none" 
            />
            <input 
                type="password" 
                placeholder="Contraseña" 
                v-model="password" 
                required
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 outline-none" 
            />
            <button 
                type="submit" 
                :disabled="loading"
                class="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 rounded-lg text-sm transition-colors mt-2 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
            >
                <span v-if="loading" class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                Iniciar Sesión
            </button>
            <div v-if="error" class="text-xs text-red-500 mt-2">
                {{ error }}
            </div>
        </form>
    </div>
</template>
