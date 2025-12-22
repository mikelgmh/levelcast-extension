<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import Login from '@/components/Login.vue';
import Profile from '@/components/Profile.vue';
import { authClient } from '@/utils/auth';

const session = ref(null);
const isPending = ref(true);

onMounted(async () => {
  const sess = await authClient.getSession();
  session.value = sess.data;
  console.log('Initial session:', session.value);
  isPending.value = false;
});

const handleLoginSuccess = async () => {
  console.log('Login success event received, refreshing session...');
  const sess = await authClient.getSession();
  console.log('Session data after login:', sess);
  session.value = sess.data;
};

const handleSignOut = async () => {
  console.log('Sign out event received, clearing session...');
  session.value = null;
};
</script>

<template>
  <div v-if="isPending">
    Loading...
  </div>
  <div v-else-if="session?.user">
    <Profile :user="session.user" @sign-out="handleSignOut" />
  </div>
  <div v-else>
    <div class="header">
      <a href="https://wxt.dev" target="_blank">
        <img src="/wxt.svg" class="logo" alt="WXT logo" />
      </a>
      <a href="https://vuejs.org/" target="_blank">
        <img src="@/assets/vue.svg" class="logo vue" alt="Vue logo" />
      </a>
    </div>
    <Login @login-success="handleLoginSuccess" />
  </div>
</template>

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
