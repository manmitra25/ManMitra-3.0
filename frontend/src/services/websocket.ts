import { io, Socket } from 'socket.io-client';

interface SocketEvents {
  // Chat events
  'bestie-response': (data: {
    response: string;
    agent: string;
    crisisDetected: boolean;
    sessionId: string;
  }) => void;
  
  'crisis-alert': (data: {
    severity: 'low' | 'medium' | 'high';
    resources: string[];
    counselorAvailable: boolean;
  }) => void;
  
  'request-login': (data: {
    message: string;
    anonymousMessagesLeft: number;
  }) => void;
  
  // Booking events
  'booking-created': (data: {
    bookingId: string;
    counselorId: string;
    startTime: string;
  }) => void;
  
  'booking-cancelled': (data: {
    bookingId: string;
    reason: string;
  }) => void;
  
  'slot-locked': (data: {
    counselorId: string;
    timeSlot: string;
    lockedUntil: string;
  }) => void;
  
  'slot-released': (data: {
    counselorId: string;
    timeSlot: string;
  }) => void;
  
  // Notification events
  'new-notification': (data: {
    id: string;
    type: string;
    title: string;
    message: string;
    priority: 'low' | 'medium' | 'high';
    actionUrl?: string;
  }) => void;
  
  // Forum events
  'new-post': (data: {
    postId: string;
    title: string;
    category: string;
  }) => void;
  
  // General events
  'connected': () => void;
  'disconnected': () => void;
  'error': (error: any) => void;
}

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Function[]> = new Map();

  private getWebSocketUrl(): string {
    return import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:3001';
  }

  connect(userId?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const token = localStorage.getItem('token');
        
        this.socket = io(this.getWebSocketUrl(), {
          auth: {
            token,
            userId
          },
          transports: ['websocket', 'polling'],
          timeout: 15000,
          autoConnect: true,
          reconnection: true,
          reconnectionAttempts: 3,
          reconnectionDelay: 1000,
        });

        this.socket.on('connect', () => {
          console.log('✅ WebSocket connected');
          this.reconnectAttempts = 0;
          
          if (userId) {
            this.emit('join-room', { userId });
          }
          
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          console.warn('⚠️ WebSocket connection failed, will use HTTP fallback:', error.message);
          // Don't reject immediately, let the chat use HTTP fallback
          if (this.reconnectAttempts === 0) {
            // Resolve on first error to not block the chat initialization
            resolve();
          }
          this.handleReconnect();
        });

        this.socket.on('disconnect', (reason) => {
          console.log('⚡ WebSocket disconnected:', reason);
          if (reason === 'io server disconnect') {
            // Server initiated disconnect, try to reconnect
            this.handleReconnect();
          }
        });

        // Setup event forwarding
        this.setupEventForwarding();
        
        // Give WebSocket a chance to connect, then resolve anyway
        setTimeout(() => {
          if (!this.socket?.connected) {
            console.log('🔄 WebSocket not connected after timeout, using HTTP fallback');
            resolve();
          }
        }, 3000);

      } catch (error) {
        console.error('WebSocket setup error, using HTTP fallback:', error);
        resolve(); // Don't reject, allow HTTP fallback
      }
    });
  }

  private setupEventForwarding() {
    if (!this.socket) return;

    // Forward all events to registered listeners
    const events: (keyof SocketEvents)[] = [
      'bestie-response',
      'crisis-alert',
      'request-login',
      'booking-created',
      'booking-cancelled',
      'slot-locked',
      'slot-released',
      'new-notification',
      'new-post',
      'connected',
      'disconnected',
      'error'
    ];

    events.forEach(event => {
      this.socket?.on(event as string, (data: any) => {
        const listeners = this.listeners.get(event) || [];
        listeners.forEach(listener => {
          try {
            listener(data);
          } catch (error) {
            console.error(`Error in ${event} listener:`, error);
          }
        });
      });
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`🔄 Reconnecting... Attempt ${this.reconnectAttempts}`);
    
    setTimeout(() => {
      if (this.socket) {
        this.socket.connect();
      }
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
      console.log('🔌 WebSocket disconnected');
    }
  }

  emit<T = any>(event: string, data: T) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('⚠️ Cannot emit event - WebSocket not connected:', event);
    }
  }

  // Type-safe event listeners
  on<K extends keyof SocketEvents>(event: K, listener: SocketEvents[K]) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  off<K extends keyof SocketEvents>(event: K, listener: SocketEvents[K]) {
    const listeners = this.listeners.get(event) || [];
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  // Chat specific methods
  sendChatMessage(sessionId: string, message: string, language: string = 'en') {
    this.emit('chat-message', {
      sessionId,
      message,
      language,
      timestamp: new Date().toISOString()
    });
  }

  // Booking specific methods
  holdBookingSlot(counselorId: string, timeSlot: string) {
    this.emit('hold-slot', {
      counselorId,
      timeSlot,
      holdDuration: 300000 // 5 minutes
    });
  }

  releaseBookingSlot(counselorId: string, timeSlot: string) {
    this.emit('release-slot', {
      counselorId,
      timeSlot
    });
  }

  // Utility methods
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getConnectionState(): string {
    if (!this.socket) return 'disconnected';
    return this.socket.connected ? 'connected' : 'connecting';
  }
}

// Create singleton instance
const webSocketService = new WebSocketService();

export default webSocketService;
export type { SocketEvents };
