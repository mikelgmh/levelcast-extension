import { createAuthClient } from "better-auth/vue"

const isChromeExtension = typeof chrome !== 'undefined' && chrome.storage;

const chromeStorage = isChromeExtension ? {
    get: async (key: string) => {
        return new Promise((resolve) => {
            chrome.storage.local.get([key], (result) => {
                console.log('chromeStorage get', key, result);
                resolve(result[key] || null);
            });
        });
    },
    set: async (key: string, value: any) => {
        return new Promise((resolve) => {
            chrome.storage.local.set({ [key]: value }, () => {
                console.log('chromeStorage set', key, value);
                resolve();
            });
        });
    },
    remove: async (key: string) => {
        return new Promise((resolve) => {
            chrome.storage.local.remove([key], () => {
                console.log('chromeStorage remove', key);
                resolve();
            });
        });
    },
} : {
    get: async (key: string) => {
        const value = localStorage.getItem(key);
        console.log('localStorage get', key, value);
        return value ? JSON.parse(value) : null;
    },
    set: async (key: string, value: any) => {
        localStorage.setItem(key, JSON.stringify(value));
        console.log('localStorage set', key, value);
    },
    remove: async (key: string) => {
        localStorage.removeItem(key);
        console.log('localStorage remove', key);
    },
};

export const authClient = createAuthClient({
    baseURL: import.meta.env.DEV ? "http://localhost:3000" : "https://api.levelcast.org",
    storage: chromeStorage,
})
