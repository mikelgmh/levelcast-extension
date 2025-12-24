import { storage } from 'wxt/utils/storage';
import { browser } from 'wxt/browser';
import { LibreLinkClient } from 'librelinkup-api-client';
import { fetchCredentialsMap } from './libreLinkAccounts';

export const readingsStorage = storage.defineItem<Record<string, any>>('local:readings', {
    defaultValue: {},
});

export const badgeSettings = storage.defineItem<{
    enabled: boolean;
    selectedAccountId: string | null;
}>('local:badgeSettings', {
    defaultValue: {
        enabled: true,
        selectedAccountId: null
    },
});

class GlucoseMonitor {
    private clients: Map<string, LibreLinkClient> = new Map();
    private isRunning = false;
    private queue: string[] = [];
    private processing = false;
    private timer: any = null;

    async start() {
        if (this.isRunning) return;
        this.isRunning = true;
        console.log('Starting GlucoseMonitor...');

        await this.initializeClients();

        this.processNext();
    }

    async stop() {
        this.isRunning = false;
        if (this.timer) clearTimeout(this.timer);
    }

    async initializeClients() {
        const credentials = await fetchCredentialsMap();
        for (const [accountId, creds] of credentials) {
            if (!this.clients.has(accountId)) {
                try {
                    const client = new LibreLinkClient({
                        email: creds.email,
                        password: creds.password,
                        lluVersion: '4.16.0'
                    });
                    this.clients.set(accountId, client);
                } catch (e) {
                    console.error(`Failed to initialize client for ${accountId}`, e);
                }
            }
        }
        // Initial fill of queue
        this.refillQueue();
    }

    refillQueue() {
        const accountIds = Array.from(this.clients.keys());
        // Add accounts that are not already in queue
        for (const id of accountIds) {
            if (!this.queue.includes(id)) {
                this.queue.push(id);
            }
        }
    }

    async processNext() {
        if (!this.isRunning) return;

        if (this.queue.length === 0) {
            this.refillQueue();
        }

        if (this.queue.length === 0) {
            // No clients? Wait and retry initialization or just wait
            console.log("No clients to monitor. Retrying in 20s...");
            this.timer = setTimeout(() => {
                this.initializeClients().then(() => this.processNext());
            }, 20000);
            return;
        }

        const accountId = this.queue.shift();
        if (accountId) {
            await this.fetchReading(accountId);
        }

        // Schedule next reading in 20s
        this.timer = setTimeout(() => {
            this.processNext();
        }, 20000);
    }

    async fetchReading(accountId: string) {
        const client = this.clients.get(accountId);
        if (!client) return;

        console.log(`Fetching reading for ${accountId}...`);

        try {
            try {
                // Try to read directly. 
                // Note: The library might throw if not logged in, or might auto-login if we provided creds?
                // Looking at the library usage in backend, it seems we might need to login first or handle errors.
                // But let's try read() first.

                // We need to check if we have a token. The client instance is new, so it probably doesn't have a token yet.
                // So we should probably login first if it's the first time.
                // But let's rely on error handling to login.

                // Actually, for the first time, we definitely need to login.
                // Let's check if we have a token (accessing private prop or just try/catch).
                // The backend does `client.login()` then `client.read()`.

                // Let's try to read.
                const reading = await client.read();
                await this.saveReading(accountId, reading);
            } catch (e: any) {
                const msg = e.message || String(e);
                if (msg.includes('jwt') || msg.includes('unauthorized') || msg.includes('token') || msg.includes('401')) {
                    console.log(`Authenticating ${accountId}...`);
                    await client.login();
                    const reading = await client.read();
                    await this.saveReading(accountId, reading);
                } else {
                    throw e;
                }
            }

        } catch (e: any) {
            console.error(`Error fetching reading for ${accountId}:`, e);
            await this.saveError(accountId, e.message || String(e));
        }
    }

    async saveReading(accountId: string, reading: any) {
        const currentReadings = await readingsStorage.getValue();
        currentReadings[accountId] = {
            reading,
            timestamp: Date.now(),
            error: null
        };
        await readingsStorage.setValue(currentReadings);
        console.log(`Saved reading for ${accountId}`, reading);

        await this.updateBadge(accountId, reading);
    }

    async updateBadge(accountId: string, reading: any) {
        const settings = await badgeSettings.getValue();

        if (!settings.enabled) {
            await browser.action.setBadgeText({ text: '' });
            return;
        }

        // If a specific account is selected, only update if it matches.
        // If no account is selected (null), update for any account (last one wins, or maybe we should pick the first one?)
        // Let's say if null, we pick the first one we encounter or just update.
        // Better logic: if selectedAccountId is set, check match. If not set, maybe set it to this one?

        if (settings.selectedAccountId && settings.selectedAccountId !== accountId) {
            return;
        }

        // If not selected, auto-select the first one we get data for?
        if (!settings.selectedAccountId) {
            // Optional: auto-select this account
            // await badgeSettings.setValue({ ...settings, selectedAccountId: accountId });
        }

        const val = reading.Value || reading.value;
        if (val) {
            await browser.action.setBadgeText({ text: String(val) });

            // Color based on high/low/normal?
            // Green for normal, Red for low/high?
            // Let's use a generic color for now or try to parse isHigh/isLow
            let color = '#10B981'; // Green
            if (reading.isHigh || reading.isLow) {
                color = '#EF4444'; // Red
            } else if (val > 180 || val < 70) { // Fallback check
                color = '#EF4444';
            }

            await browser.action.setBadgeBackgroundColor({ color });
        }
    }

    async saveError(accountId: string, error: string) {
        const currentReadings = await readingsStorage.getValue();
        // Keep previous reading if exists, but update error
        const prev = currentReadings[accountId] || {};
        currentReadings[accountId] = {
            ...prev,
            error,
            timestamp: Date.now() // Update timestamp to show when error occurred? Or maybe not.
        };
        await readingsStorage.setValue(currentReadings);
    }
}

export const glucoseMonitor = new GlucoseMonitor();
