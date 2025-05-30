let ws = null;
let reconnectTimeout = null;
const subscribers = new Set();

export function connectWebSocket(workspaceId, accessToken) {
  if (ws) {
    ws.close();
  }

  ws = new WebSocket(`ws://localhost:8080/ws?token=${accessToken}&workspaceId=${workspaceId}`);

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      subscribers.forEach(callback => callback(data));
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  };

  ws.onclose = () => {
    reconnectTimeout = setTimeout(() => {
      connectWebSocket(workspaceId, accessToken);
    }, 5000);
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    ws.close();
  };

  return () => {
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
    }
    if (ws) {
      ws.close();
    }
  };
}

export function subscribeToTaskUpdates(callback) {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

export function closeWebSocket() {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
  }
  if (ws) {
    ws.close();
  }
}
