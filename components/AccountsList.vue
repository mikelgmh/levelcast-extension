<script setup lang="ts">
import { onMounted, computed, ref, onUnmounted } from 'vue';
import { AlertTriangle, Loader2, XCircle, MoreHorizontal, ArrowRight, Plus } from 'lucide-vue-next';
import { useLibreLinkAccounts } from '../utils/libreLinkAccounts';
import { readingsStorage } from '../utils/glucoseMonitor';

const { accounts, loading, error, fetchAccounts } = useLibreLinkAccounts();
const readings = ref<Record<string, any>>({});
let unwatch: any;

onMounted(async () => {
    fetchAccounts();
    readings.value = await readingsStorage.getValue();
    unwatch = readingsStorage.watch((newValue) => {
        readings.value = newValue || {};
    });
});

onUnmounted(() => {
    if (unwatch) unwatch();
});

const getTrendClass = (trend: number) => {
    // 1: Falling quickly, 2: Falling, 3: Stable, 4: Rising, 5: Rising quickly
    switch (trend) {
        case 1: return 'rotate-90 text-red-500';
        case 2: return 'rotate-45 text-amber-500';
        case 3: return 'text-teal-500';
        case 4: return '-rotate-45 text-amber-500';
        case 5: return '-rotate-90 text-red-500';
        default: return 'text-slate-300';
    }
};

const getTimeAgo = (timestamp: string | number) => {
    if (!timestamp) return '';
    try {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        
        if (isNaN(diffMins)) return '';
        if (diffMins < 1) return 'ahora';
        return `${diffMins} min`;
    } catch (e) {
        return '';
    }
};

const displayAccounts = computed(() => {
    return accounts.value.map(acc => {
        let status = 'connected';
        if (acc.error) {
            status = 'error';
        } else if (!acc.firstName) {
            status = 'loading';
        }
        
        const readingData = readings.value[acc.id];
        const reading = readingData?.reading;
        const readingError = readingData?.error;
        
        let val = '--';
        let trend = 0;
        let last = '';
        let errorMsg = acc.error;

        if (readingError) {
            if (readingError.includes('RequiredHeaderMissing')) {
                status = 'loading';
                errorMsg = undefined;
            } else {
                status = 'error';
                errorMsg = readingError;
            }
        }
        
        if (reading) {
            // Handle different possible casing from API or raw reading object
            // Usually reading is an array of objects, or a single object
            const r = Array.isArray(reading) ? reading[0] : reading;
            
            if (r) {
                val = r.Value || r.value || '--';
                trend = r.TrendArrow || r.trendArrow || r.trend || 0;
                // Use the timestamp from when we saved it, or the factory timestamp
                const time = readingData.timestamp || r.FactoryTimestamp || r.factoryTimestamp || r.timestamp;
                if (time) {
                    last = getTimeAgo(time);
                }
            }
        }
        
        return {
            id: acc.id,
            name: acc.firstName ? `${acc.firstName} ${acc.lastName || ''}` : acc.email,
            status: status,
            errorMsg: errorMsg,
            val,
            trend,
            last
        };
    });
});
</script>

<template>
    <div class="p-4 space-y-3">
        <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Cuentas Activas</p>
        
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

        <template v-else>
            <div v-for="(acc, i) in displayAccounts" :key="i" class="bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors group">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <p class="text-sm font-bold text-slate-900">{{ acc.name }}</p>
                        <div class="flex items-center gap-1.5 mt-1">
                            <template v-if="acc.status === 'connected'">
                                <div class="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                <span class="text-[10px] text-green-600 font-medium">Conectado</span>
                            </template>
                            <template v-if="acc.status === 'loading'">
                                <Loader2 :size="10" class="animate-spin text-amber-500"/>
                                <span class="text-[10px] text-amber-600 font-medium">Sincronizando...</span>
                            </template>
                            <template v-if="acc.status === 'error'">
                                <XCircle :size="10" class="text-red-500"/>
                                <span class="text-[10px] text-red-600 font-medium">Error</span>
                            </template>
                        </div>
                    </div>
                    <button class="text-slate-300 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal :size="16"/>
                    </button>
                </div>
                
                <div v-if="acc.status === 'connected'" class="flex justify-between items-end mt-2 pt-2 border-t border-slate-50">
                    <span class="text-[10px] text-slate-400">Hace {{ acc.last }}</span>
                    <div class="flex items-center gap-1">
                        <span class="text-2xl font-bold text-slate-800">{{ acc.val }}</span>
                        <span class="text-xs text-slate-500 mb-1">mg/dL</span>
                        <ArrowRight :size="18" :class="getTrendClass(acc.trend)" />
                    </div>
                </div>

                <div v-if="acc.status === 'error'" class="mt-2 pt-2 border-t border-slate-50 text-[10px] text-red-500 flex items-center gap-1">
                    <AlertTriangle :size="10" /> {{ acc.errorMsg }}
                </div>
            </div>
        </template>

        <button class="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs font-bold hover:border-teal-500 hover:text-teal-600 transition-colors flex items-center justify-center gap-2">
            <Plus :size="14"/> Añadir Cuenta
        </button>
    </div>
</template>