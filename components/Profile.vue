<script setup lang="ts">
import { authClient } from '@/utils/auth';

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
    // Emit event to parent to clear session
    emit('sign-out');
};
</script>

<template>
    <div class="profile-container">
        <h2>Welcome back!</h2>
        
        <div class="user-info">
            <img v-if="user.image" :src="user.image" alt="User Avatar" class="avatar" />
            <div class="details">
                <p class="name">{{ user.name || 'User' }}</p>
                <p class="email">{{ user.email }}</p>
            </div>
        </div>

        <button @click="handleSignOut" class="sign-out-btn">
            Sign Out
        </button>
    </div>
</template>

<style scoped>
.profile-container {
    padding: 20px;
    text-align: center;
    min-width: 300px;
}

.user-info {
    margin: 20px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
}

.avatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #42b883;
}

.details {
    text-align: center;
}

.name {
    font-weight: bold;
    font-size: 1.1em;
    margin: 0;
}

.email {
    color: #666;
    font-size: 0.9em;
    margin: 0;
}

.sign-out-btn {
    background-color: #ff4444;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    width: 100%;
    margin-top: 10px;
    transition: background-color 0.2s;
}

.sign-out-btn:hover {
    background-color: #cc0000;
}
</style>
