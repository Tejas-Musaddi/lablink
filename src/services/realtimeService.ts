import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  Booking,
  BookingRequest,
  Equipment,
  MaintenanceRecord,
  ConflictCase,
  Notification,
} from '../types';
import {
  mapRowToBooking,
  mapRowToBookingRequest,
  mapRowToEquipment,
  mapRowToMaintenance,
  mapRowToConflict,
  mapRowToNotification,
} from './supabaseService';

export interface RealtimeHandlers {
  onBookingChange?: (eventType: 'INSERT' | 'UPDATE' | 'DELETE', booking: Booking) => void;
  onBookingRequestChange?: (eventType: 'INSERT' | 'UPDATE' | 'DELETE', req: BookingRequest) => void;
  onEquipmentChange?: (eventType: 'INSERT' | 'UPDATE' | 'DELETE', eq: Equipment) => void;
  onMaintenanceChange?: (eventType: 'INSERT' | 'UPDATE' | 'DELETE', maint: MaintenanceRecord) => void;
  onConflictChange?: (eventType: 'INSERT' | 'UPDATE' | 'DELETE', conflict: ConflictCase) => void;
  onNotificationChange?: (eventType: 'INSERT' | 'UPDATE' | 'DELETE', notif: Notification) => void;
  onStatusChange?: (status: 'CONNECTING' | 'SUBSCRIBED' | 'DISCONNECTED') => void;
}

let activeChannel: RealtimeChannel | null = null;
let currentStatus: 'CONNECTING' | 'SUBSCRIBED' | 'DISCONNECTED' = 'DISCONNECTED';

export const RealtimeService = {
  /**
   * Subscribe to live PostgreSQL database changes across all operational tables.
   */
  subscribe(handlers: RealtimeHandlers): () => void {
    if (!isSupabaseConfigured() || !supabase) {
      handlers.onStatusChange?.('DISCONNECTED');
      return () => {};
    }

    // Teardown existing channel if already active
    if (activeChannel) {
      this.unsubscribe();
    }

    handlers.onStatusChange?.('CONNECTING');
    currentStatus = 'CONNECTING';

    try {
      const channel = supabase.channel('lablink_live_sync');

      // 1. Bookings Realtime (Calendar & Dashboard live slots)
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        (payload) => {
          const row = payload.eventType === 'DELETE' ? payload.old : payload.new;
          if (row && handlers.onBookingChange) {
            const mapped = mapRowToBooking(row);
            handlers.onBookingChange(payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE', mapped);
          }
        }
      );

      // 2. Booking Requests Realtime (Faculty Queue & Student submission)
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'booking_requests' },
        (payload) => {
          const row = payload.eventType === 'DELETE' ? payload.old : payload.new;
          if (row && handlers.onBookingRequestChange) {
            const mapped = mapRowToBookingRequest(row);
            handlers.onBookingRequestChange(payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE', mapped);
          }
        }
      );

      // 3. Equipment Realtime (Lab Manager availability toggles & condition updates)
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'equipment' },
        (payload) => {
          const row = payload.eventType === 'DELETE' ? payload.old : payload.new;
          if (row && handlers.onEquipmentChange) {
            const mapped = mapRowToEquipment(row);
            handlers.onEquipmentChange(payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE', mapped);
          }
        }
      );

      // 4. Maintenance Records Realtime (Live maintenance locks on slots)
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'maintenance_records' },
        (payload) => {
          const row = payload.eventType === 'DELETE' ? payload.old : payload.new;
          if (row && handlers.onMaintenanceChange) {
            const mapped = mapRowToMaintenance(row);
            handlers.onMaintenanceChange(payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE', mapped);
          }
        }
      );

      // 5. Conflicts & Allocations Realtime (Faculty approvals live broadcast)
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conflicts' },
        (payload) => {
          const row = payload.eventType === 'DELETE' ? payload.old : payload.new;
          if (row && handlers.onConflictChange) {
            const mapped = mapRowToConflict(row);
            handlers.onConflictChange(payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE', mapped);
          }
        }
      );

      // 6. Notifications Realtime (Live alert toasts)
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        (payload) => {
          const row = payload.eventType === 'DELETE' ? payload.old : payload.new;
          if (row && handlers.onNotificationChange) {
            const mapped = mapRowToNotification(row);
            handlers.onNotificationChange(payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE', mapped);
          }
        }
      );

      channel.subscribe((status, err) => {
        if (err) {
          console.warn('Realtime subscription warning:', err);
        }
        if (status === 'SUBSCRIBED') {
          currentStatus = 'SUBSCRIBED';
          handlers.onStatusChange?.('SUBSCRIBED');
        } else if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
          currentStatus = 'DISCONNECTED';
          handlers.onStatusChange?.('DISCONNECTED');
        }
      });

      activeChannel = channel;
    } catch (err) {
      console.warn('Failed to initiate Realtime subscription:', err);
      handlers.onStatusChange?.('DISCONNECTED');
    }

    return () => this.unsubscribe();
  },

  /**
   * Disconnect and release the active Realtime channel.
   */
  unsubscribe(): void {
    if (activeChannel && supabase) {
      supabase.removeChannel(activeChannel).catch(() => {});
      activeChannel = null;
      currentStatus = 'DISCONNECTED';
    }
  },

  getStatus(): 'CONNECTING' | 'SUBSCRIBED' | 'DISCONNECTED' {
    return currentStatus;
  },
};
