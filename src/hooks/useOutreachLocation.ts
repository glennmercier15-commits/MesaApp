import { useState } from 'react';
import { locationService } from '../services/locationService';

export function useOutreachLocation() {
  const [location, setLocation] = useState<any>(null);
  const [isPatrolling, setIsPatrolling] = useState(false);

  const captureSnapshot = async () => {
    const pos = await locationService.getCurrentPosition();
    setLocation(pos);
    return pos;
  };

  return {
    location,
    isPatrolling,
    setIsPatrolling,
    captureSnapshot
  };
}
