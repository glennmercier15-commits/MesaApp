// src/services/syncQueue.ts

interface SyncAction {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
}

const STORAGE_KEY = 'mindbridge_sync_queue';

export const syncQueue = {
  enqueue: (action: Omit<SyncAction, 'id' | 'timestamp'>) => {
    const newAction: SyncAction = {
      ...action,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };

    const queue = syncQueue.getPendingActions();
    queue.push(newAction);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    
    console.log("SyncQueue: Action enqueued for offline-first processing", newAction);
  },
  
  getPendingActions: (): SyncAction[] => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  },

  processQueue: async () => {
    console.log("SyncQueue: Processing pending actions...");
    const queue = syncQueue.getPendingActions();
    
    if (queue.length === 0) {
      console.log("SyncQueue: No actions to process.");
      return;
    }

    // Simulate sending to server
    try {
      console.log(`SyncQueue: Syncing ${queue.length} actions...`);
      // In real implementation, perform API calls here
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("SyncQueue: Sync complete. Clearing queue.");
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("SyncQueue: Sync failed.", error);
    }
  }
};
