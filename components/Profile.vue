<script setup lang="ts">
import { authClient } from '@/utils/auth';
import { LayoutDashboard, HelpCircle, LogOut, Activity } from 'lucide-vue-next';
import { ref, onMounted, watch } from 'vue';
import { badgeSettings } from '../utils/glucoseMonitor';
import { useLibreLinkAccounts } from '../utils/libreLinkAccounts';
import { browser } from 'wxt/browser';

defineProps<{
    user: {
        name?: string;
        email?: string;
        image?: string;
    }
}>();

const emit = defineEmits<{
  'sign-out': [];
}>();

const { accounts, fetchAccounts } = useLibreLinkAccounts();
const settings = ref({
    enabled: false,
    selectedAccountId: null as string | null
});

onMounted(async () => {
    const stored = await badgeSettings.getValue();
    settings.value = stored;
    await fetchAccounts();
});

watch(settings, async (newSettings) => {
    await badgeSettings.setValue(newSettings);
    
    // If disabled, clear badge immediately
    if (!newSettings.enabled) {
        await browser.action.setBadgeText({ text: '' });
    }
}, { deep: true });

const handleSignOut = async () => {
    await authClient.signOut();
    emit('sign-out');
};
</script>

<template>
    <div class="p-6">
        <div class="flex items-center gap-3 mb-6">
            <div v-if="user.image" class="w-12 h-12 rounded-full overflow-hidden">
                <img :src="user.image" alt="User Avatar" class="w-full h-full object-cover" />
            </div>
            <div v-else class="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl">
                {{ user.name ? user.name.substring(0, 2).toUpperCase() : 'JD' }}
            </div>
            <div>
                <p class="font-bold text-slate-900">{{ user.name || 'User' }}</p>
                <p class="text-xs text-slate-500">{{ user.email }}</p>
            </div>
        </div>
        
        <div class="space-y-2">
            <!-- Badge Settings -->
            <div class="p-3 rounded-lg border border-slate-200 bg-slate-50 mb-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <Activity :size="16" class="text-slate-500"/>
                        <span class="text-sm text-slate-700 font-medium">Mostrar glucosa en icono</span>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" v-model="settings.enabled" class="sr-only peer">
                        <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                </div>

                <div v-if="settings.enabled && accounts.length > 1" class="mt-3 pt-3 border-t border-slate-200">
                    <label class="block text-xs text-slate-500 mb-1">Cuenta a mostrar</label>
                    <select v-model="settings.selectedAccountId" class="w-full text-xs p-2 rounded border border-slate-300 bg-white text-slate-700 focus:outline-none focus:border-indigo-500">
                        <option :value="null">Automático (Cualquiera)</option>
                        <option v-for="acc in accounts" :key="acc.id" :value="acc.id">
                            {{ acc.firstName }} {{ acc.lastName }}
                        </option>
                    </select>
                </div>
            </div>

            <a href="#" class="flex items-center gap-3 p-3 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all text-sm text-slate-700">
                <LayoutDashboard :size="16"/> Ir al Dashboard
            </a>
            <a href="#" class="flex items-center gap-3 p-3 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all text-sm text-slate-700">
                <HelpCircle :size="16"/> Soporte y Ayuda
            </a>
            <button @click="handleSignOut" class="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 hover:text-red-600 border border-transparent transition-all text-sm text-slate-700 text-left cursor-pointer">
                <LogOut :size="16"/> Cerrar Sesión
            </button>
        </div>
    </div>
</template>
