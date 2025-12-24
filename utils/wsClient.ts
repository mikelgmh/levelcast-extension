import { authClient } from './auth';
import { browser } from 'wxt/browser';

const WS_URL = import.meta.env.DEV ? 'http://localhost:3000' : 'https://api.levelcast.org';
let socket: WebSocket | null = null;
let reconnectTimeout: number | null = null;

function wsUrl() {
  return `${WS_URL.replace(/^http/, 'ws')}/public-channel`;
}

export async function connectWS() {
  if (socket) return;

  try {
    const url = wsUrl();
    socket = new WebSocket(url, 'protocolOne');

    socket.onopen = async () => {
      try {
        const response = await authClient.oneTimeToken.generate();
        socket?.send(JSON.stringify({ type: 'subscribe', token: response.data.token }));
      } catch (e) {
        console.error('Failed to generate one-time token for WS subscribe:', e);
      }

      if (reconnectTimeout !== null) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }
    };

    socket.onmessage = (ev) => {
      try {
        if (!ev.data) return;
        const data = typeof ev.data === 'string' ? JSON.parse(ev.data) : ev.data;
        const action = data.action;

        // Forward relevant events to extension contexts via runtime message
        if (action === 'libreLinkAccount_login' || action === 'libreLinkAccount_error' || action === 'libreLinkAccount_delete' || action === 'libreLinkAccount_replaced') {
          void browser.runtime.sendMessage({ type: 'libreLinkAccount_event', action });
        }

        if (action === 'webhook_log_added') {
          void browser.runtime.sendMessage({ type: 'webhook_log_added', webhookId: data.webhookId, logData: data.logData });
        }

        if (action === 'webhook_log_deleted') {
          void browser.runtime.sendMessage({ type: 'webhook_log_deleted', webhookId: data.webhookId, allLogs: data.allLogs, logId: data.logId });
        }
      } catch (err) {
        console.error('Error handling WS message in extension:', err);
      }
    };

    socket.onclose = () => {
      socket = null;
      if (reconnectTimeout === null) {
        reconnectTimeout = window.setTimeout(() => {
          reconnectTimeout = null;
          connectWS();
        }, 3000);
      }
    };

    socket.onerror = (err) => {
      console.error('WebSocket error in extension:', err);
    };
  } catch (error) {
    console.error('Failed to connect WS from extension:', error);
    if (reconnectTimeout === null) {
      reconnectTimeout = window.setTimeout(() => {
        reconnectTimeout = null;
        connectWS();
      }, 3000);
    }
  }
}

export function disconnectWS() {
  if (socket) {
    socket.close();
    socket = null;
  }
  if (reconnectTimeout !== null) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
}

export default {
  connect: connectWS,
  disconnect: disconnectWS,
};
