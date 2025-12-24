import { glucoseMonitor } from '@/utils/glucoseMonitor';

export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });

  // Start glucose monitoring
  glucoseMonitor.start();
});
