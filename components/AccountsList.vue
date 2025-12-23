<script setup lang="ts">
import { onMounted } from 'vue';
import { AlertTriangle, Loader2 } from 'lucide-vue-next';
import { useLibreLinkAccounts } from '../utils/libreLinkAccounts';

const { accounts, loading, error, fetchAccounts } = useLibreLinkAccounts();

onMounted(() => {
    fetchAccounts();
});
</script>

<template>
    <div class="p-4 space-y-3">
        <div class="flex justify-between items-center mb-2">
            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Cuentas Activas</p>
            <button 
                @click="fetchAccounts" 
                class="text-xs text-teal-600 hover:text-teal-700 font-medium"
                :disabled="loading"
            >
                {{ loading ? 'Actualizando...' : 'Actualizar' }}
            </button>
        </div>
        
        <div v-if="loading && accounts.length === 0" class="flex justify-center py-8">
            <Loader2 class="animate-spin text-slate-400" :size="24" />
        </div>

        <div v-else-if="error" class="bg-red-50 p-3 rounded-xl border border-red-100 flex items-center gap-3">
            <AlertTriangle :size="16" class="text-red-500"/>
            <div>
                <p class="text-xs font-bold text-red-700">Error al cargar cuentas</p>
                <p class="text-[10px] text-red-500">{{ error }}</p>
            </div>
        </div>

        <div v-else-if="accounts.length === 0" class="text-center py-8 text-slate-500 text-sm">
            No hay cuentas conectadas.
        </div>
        
        <template v-else>
            <div 
                v-for="account in accounts" 
                :key="account.id" 
                class="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center hover:bg-slate-50 cursor-pointer transition-colors"
            >
                <div>
                    <p class="text-sm font-bold text-slate-900">
                        {{ account.firstName ? `${account.firstName} ${account.lastName || ''}` : account.email }}
                    </p>
                    <p class="text-xs text-slate-500">
                        {{ account.firstName ? account.email : 'Sincronizando...' }}
                    </p>
                </div>
                <div class="text-right">
                    <div v-if="account.error" class="flex items-center gap-1 justify-end text-red-500">
                        <AlertTriangle :size="14" />
                        <span class="text-xs font-bold">Error</span>
                    </div>
                    <div v-else-if="account.firstName" class="flex items-center gap-1 justify-end text-green-600">
                        <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span class="text-xs font-bold">Conectado</span>
                    </div>
                    <div v-else class="flex items-center gap-1 justify-end text-yellow-600">
                        <Loader2 :size="14" class="animate-spin" />
                        <span class="text-xs">Cargando</span>
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>