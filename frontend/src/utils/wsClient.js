import { host } from './axiosConfig';

let socket = null;
let refCount = 0;
let closeTimer = null;
let pendingSends = [];
const listeners = new Set();
let lastRegisterObj = null;

const ensureSocket = () => {
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return socket;
  }

  socket = new WebSocket(host);

  socket.onopen = () => {
    // Re-send last register on reconnect so backend can target this user
    if (lastRegisterObj) {
      try {
        socket.send(JSON.stringify(lastRegisterObj));
      } catch {
        // ignore
      }
    }
    // Flush queued sends
    if (pendingSends.length) {
      const queue = pendingSends;
      pendingSends = [];
      queue.forEach((payload) => {
        try {
          socket.send(payload);
        } catch {
          // ignore
        }
      });
    }
  };

  socket.onmessage = (event) => {
    let msg;
    try {
      msg = JSON.parse(event.data);
    } catch {
      return;
    }
    listeners.forEach((fn) => {
      try {
        fn(msg);
      } catch {
        // ignore listener errors
      }
    });
  };

  socket.onclose = () => {
    // allow reconnection on next ensureSocket()
    socket = null;
  };

  socket.onerror = () => {
    // errors are handled by onclose / reconnect attempts via ensureSocket
  };

  return socket;
};

export const wsClient = {
  /** Register a listener; keeps socket alive while subscribed. */
  subscribe(listener) {
    refCount += 1;
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
    listeners.add(listener);
    ensureSocket();

    return () => {
      listeners.delete(listener);
      refCount = Math.max(0, refCount - 1);

      // Debounced close: helps avoid React StrictMode dev mount/unmount churn
      if (refCount === 0) {
        closeTimer = setTimeout(() => {
          if (refCount === 0 && socket) {
            try {
              socket.close();
            } catch {
              // ignore
            }
            socket = null;
          }
        }, 750);
      }
    };
  },

  send(obj) {
    if (obj?.type === 'register') {
      lastRegisterObj = obj;
    }
    const payload = JSON.stringify(obj);
    const s = ensureSocket();
    if (s.readyState === WebSocket.OPEN) {
      s.send(payload);
      return;
    }
    pendingSends.push(payload);
  },
};

