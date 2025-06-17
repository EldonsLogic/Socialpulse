import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface UseRealTimeDataOptions {
  clientId: number;
  enabled?: boolean;
  interval?: number; // in milliseconds
}

export function useRealTimeData({
  clientId,
  enabled = true,
  interval = 0, // Disabled by default
}: UseRealTimeDataOptions) {
  const queryClient = useQueryClient();
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!enabled || !clientId || interval === 0) {
      return;
    }

    // Function to refresh data
    const refreshData = () => {
      // Invalidate dashboard data
      queryClient.invalidateQueries({
        queryKey: ['/api/clients', clientId, 'dashboard'],
      });

      // Invalidate chart data
      queryClient.invalidateQueries({
        queryKey: ['/api/clients', clientId, 'metrics/chart'],
      });

      // Invalidate alerts
      queryClient.invalidateQueries({
        queryKey: ['/api/clients', clientId, 'alerts'],
      });

      console.log('🔄 Real-time data refresh for client', clientId);
    };

    // Set up interval for real-time updates
    intervalRef.current = setInterval(refreshData, interval);

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [clientId, enabled, interval, queryClient]);

  // Manual refresh function
  const refreshNow = () => {
    if (clientId) {
      queryClient.invalidateQueries({
        queryKey: ['/api/clients', clientId],
      });
    }
  };

  return { refreshNow };
}

export default useRealTimeData;
