import { glucoseMonitor } from '@/utils/glucoseMonitor';
import wsClient from '@/utils/wsClient';
import { browser } from 'wxt/browser';

export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });

  // Start glucose monitoring
  glucoseMonitor.start();

  // Connect to server websockets to receive account/webhook events
  void wsClient.connect();
});
