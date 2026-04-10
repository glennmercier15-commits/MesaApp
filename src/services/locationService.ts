// src/services/locationService.ts
export const locationService = {
  getCurrentPosition: async () => {
    // Mock GPS capture for Renfrew County
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          latitude: 45.4808,
          longitude: -76.6853,
          timestamp: Date.now(),
        });
      }, 1500);
    });
  },
  
  startBackgroundPatrol: () => {
    console.log("Patrol Mode: Background tracking active (5min pings)");
  },
  
  stopBackgroundPatrol: () => {
    console.log("Patrol Mode: Background tracking disabled");
  }
};
