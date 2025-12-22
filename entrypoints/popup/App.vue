<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import Login from '@/components/Login.vue';
import Profile from '@/components/Profile.vue';
import AccountsList from '@/components/AccountsList.vue';
import { authClient } from '@/utils/auth';
import { Activity, X, Users, User } from 'lucide-vue-next';

const session = ref(null);
const isPending = ref(true);
const currentView = ref('accounts'); // Default view after login

onMounted(async () => {
  const sess = await authClient.getSession();
  session.value = sess.data;
  isPending.value = false;
});

const handleLoginSuccess = async () => {
  const sess = await authClient.getSession();
  session.value = sess.data;
  currentView.value = 'accounts';
};

const handleSignOut = async () => {
  session.value = null;
};

const closePopup = () => {
  window.close();
};
</script>

<template>
  <div class="fixed top-0 left-0 w-[360px] h-[500px] bg-white overflow-hidden flex flex-col font-sans text-slate-900">
    <!-- Header -->
    <div class="bg-slate-900 p-4 flex justify-between items-center shrink-0">
        <div class="flex items-center gap-2">
            <div class="w-6 h-6 bg-teal-500 rounded-md flex items-center justify-center text-white">
                <Activity :size="14"/>
            </div>
            <span class="font-bold text-white text-sm">LevelCast Extension</span>
        </div>
        <button @click="closePopup" class="text-slate-400 hover:text-white cursor-pointer">
            <X :size="18"/>
        </button>
    </div>

    <!-- Content Area -->
    <div class="flex-1 overflow-y-auto bg-slate-50 relative">
        <div v-if="isPending" class="flex justify-center items-center h-full">
            <div class="animate-spin h-8 w-8 border-2 border-teal-500 border-t-transparent rounded-full"></div>
        </div>

        <template v-else>
            <Login v-if="!session?.user" @login-success="handleLoginSuccess" />
            
            <template v-else>
                <AccountsList v-if="currentView === 'accounts'" />
                <Profile v-else-if="currentView === 'profile'" :user="session.user" @sign-out="handleSignOut" />
            </template>
        </template>
    </div>

    <!-- Bottom Navigation (only when logged in) -->
    <div v-if="session?.user" class="bg-white border-t border-slate-200 p-2 flex justify-around shrink-0">
        <button 
            @click="currentView = 'accounts'" 
            class="p-2 rounded-lg transition-colors cursor-pointer"
            :class="currentView === 'accounts' ? 'text-teal-600 bg-teal-50' : 'text-slate-400 hover:text-slate-600'"
        >
            <Users :size="20" />
        </button>
        <button 
            @click="currentView = 'profile'" 
            class="p-2 rounded-lg transition-colors cursor-pointer"
            :class="currentView === 'profile' ? 'text-teal-600 bg-teal-50' : 'text-slate-400 hover:text-slate-600'"
        >
            <User :size="20" />
        </button>
    </div>
  </div>
</template>

<style>
/* Global reset/base styles if needed, though Tailwind handles most */
body {
    margin: 0;
    padding: 0;
    width: 360px;
    height: 500px;
    overflow: hidden;
}
</style>

<style scoped>
.header {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #54bc4ae0);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
