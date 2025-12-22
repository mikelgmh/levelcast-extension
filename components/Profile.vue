<script setup lang="ts">
import { authClient } from '@/utils/auth';
import { LayoutDashboard, HelpCircle, LogOut } from 'lucide-vue-next';

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
