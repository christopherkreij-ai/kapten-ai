import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Route, RouteAlert } from '../lib/types';

export function useActiveRoute(userId: string | null) {
  const [activeRoute, setActiveRoute] = useState<Route | null>(null);
  const [alerts, setAlerts] = useState<RouteAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    // Fetch active route
    const fetchRoute = async () => {
      const { data } = await supabase
        .from('routes')
        .select('*, waypoints(*)')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      setActiveRoute(data ?? null);
      setLoading(false);
    };

    fetchRoute();

    // Realtime subscription for new alerts
    const alertSub = supabase
      .channel('route-alerts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'route_alerts' },
        (payload) => {
          const newAlert = payload.new as RouteAlert;
          setAlerts(prev => [newAlert, ...prev]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(alertSub); };
  }, [userId]);

  const acknowledgeAlert = async (alertId: string) => {
    await supabase
      .from('route_alerts')
      .update({ acknowledged: true, acknowledged_at: new Date().toISOString() })
      .eq('id', alertId);
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  const cancelRoute = async () => {
    if (!activeRoute) return;
    await supabase
      .from('routes')
      .update({ status: 'cancelled' })
      .eq('id', activeRoute.id);
    setActiveRoute(null);
    setAlerts([]);
  };

  return { activeRoute, alerts, loading, acknowledgeAlert, cancelRoute };
}
