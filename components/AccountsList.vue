<script setup lang="ts">
import { ref } from 'vue';
import { ArrowRight, AlertTriangle } from 'lucide-vue-next';

// Mock data matching the provided design
const accounts = ref([
    { name: 'John Doe', val: 118, trend: 'stable' },
    { name: 'Little Timmy', val: 92, trend: 'falling' }
]);

// Mock error account
const errorAccount = { name: 'Maria Garcia', error: 'Error de conexión' };
</script>

<template>
    <div class="p-4 space-y-3">
        <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Cuentas Activas</p>
        
        <div 
            v-for="(acc, i) in accounts" 
            :key="i" 
            class="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center hover:bg-slate-50 cursor-pointer transition-colors"
        >
            <div>
                <p class="text-sm font-bold text-slate-900">{{ acc.name }}</p>
                <p class="text-xs text-slate-500">Hace 3 min</p>
            </div>
            <div class="text-right">
                <div class="flex items-center gap-1 justify-end">
                    <span class="text-xl font-bold text-slate-900">{{ acc.val }}</span>
                    <ArrowRight 
                        :size="16" 
                        class="text-teal-500" 
                        :class="{ 'rotate-45': acc.trend !== 'stable' }"
                    />
                </div>
                <p class="text-[10px] text-slate-400">mg/dL</p>
            </div>
        </div>

        <div class="bg-red-50 p-3 rounded-xl border border-red-100 flex items-center gap-3">
            <AlertTriangle :size="16" class="text-red-500"/>
            <div>
                <p class="text-xs font-bold text-red-700">{{ errorAccount.name }}</p>
                <p class="text-[10px] text-red-500">{{ errorAccount.error }}</p>
            </div>
        </div>
    </div>
</template>