// ManMitra Service Worker - Offline-First Mental Health Platform
// Version 1.0.0

const CACHE_NAME = 'manmitra-v1.0.0';
const STATIC_CACHE = 'manmitra-static-v1.0.0';
const DYNAMIC_CACHE = 'manmitra-dynamic-v1.0.0';

// Critical resources to cache for offline functionality
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  // Core fonts for multilingual support
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@300;400;500;600;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@300;400;500;600;700&display=swap'
];

// Offline responses for different content types
const OFFLINE_RESPONSES = {
  chat: {
    type: 'bestie',
    message: "I'm here with you even offline. Let's try a breathing exercise: breathe in for 4 counts, hold for 4, breathe out for 4. 🌿 Your mental health matters, and I'll be back online soon.",
    agent: 'offline-companion',
    suggestions: [
      'Practice deep breathing',
      'Try progressive muscle relaxation', 
      'Write in your journal',
      'Listen to calming music'
    ]
  },
  resources: [
    {
      title: 'Emergency Breathing Exercise',
      type: 'technique',
      content: 'Box breathing: Inhale for 4 counts, hold for 4, exhale for 4, hold for 4. Repeat 5 times.',
      language: 'en'
    },
    {
      title: 'आपातकालीन श्वास व्यायाम',
      type: 'technique', 
      content: '4 की गिनती में सांस लें, 4 तक रोकें, 4 में छोड़ें, 4 तक रुकें। 5 बार दोहराएं।',
      language: 'hi'
    },
    {
      title: 'ہنگامی سانس کی مشق',
      type: 'technique',
      content: '4 گنتی میں سانس لیں، 4 تک روکیں، 4 میں چھوڑیں، 4 تک رکیں۔ 5 بار دہرائیں۔',
      language: 'ur'
    }
  ],
  crisis: {
    message: 'If you are in crisis, please contact emergency services immediately:',
    helplines: [
      {
        name: 'Tele-MANAS National Helpline',
        number: '14416',
        description: '24/7 mental health support'
      },
      {
        name: 'Emergency Services',
        number: '112',
        description: 'General emergency helpline'
      },
      {
        name: 'KIRAN Mental Health Helpline',
        number: '1800-599-0019',
        description: '24/7 toll-free mental health support'
      }
    ]
  }
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing ManMitra Service Worker v1.0.0');
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      caches.open(DYNAMIC_CACHE).then(cache => {
        console.log('[SW] Preparing dynamic cache');
        // Pre-cache offline responses
        cache.put('/offline/chat', new Response(JSON.stringify(OFFLINE_RESPONSES.chat)));
        cache.put('/offline/resources', new Response(JSON.stringify(OFFLINE_RESPONSES.resources)));
        cache.put('/offline/crisis', new Response(JSON.stringify(OFFLINE_RESPONSES.crisis)));
      })
    ]).then(() => {
      console.log('[SW] Installation complete - taking control');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating ManMitra Service Worker');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Activation complete - claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - implement offline-first strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests and extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

  // Handle different types of requests
  if (url.pathname.includes('/api/')) {
    // API requests - network first, then offline fallback
    event.respondWith(handleApiRequest(request));
  } else if (request.destination === 'document') {
    // HTML pages - cache first for performance
    event.respondWith(handlePageRequest(request));
  } else {
    // Static assets - cache first
    event.respondWith(handleStaticRequest(request));
  }
});

// Handle API requests with offline fallbacks
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache successful responses for later offline use
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, checking offline cache:', url.pathname);
    
    // Check cache for previous response
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Provide offline fallbacks for critical endpoints
    if (url.pathname.includes('/chat/')) {
      return new Response(JSON.stringify({
        message: OFFLINE_RESPONSES.chat.message,
        type: 'offline',
        offline: true,
        suggestions: OFFLINE_RESPONSES.chat.suggestions
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      });
    }
    
    if (url.pathname.includes('/counselors')) {
      return new Response(JSON.stringify({
        counselors: [],
        message: 'Counselor information unavailable offline. Please try again when connected.',
        offline: true
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      });
    }
    
    if (url.pathname.includes('/crisis') || url.pathname.includes('/alert')) {
      return new Response(JSON.stringify(OFFLINE_RESPONSES.crisis), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      });
    }
    
    // Generic offline response
    return new Response(JSON.stringify({
      error: 'This feature requires an internet connection',
      offline: true,
      retry: true
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 503
    });
  }
}

// Handle page requests
async function handlePageRequest(request) {
  try {
    // Try cache first for performance
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback to network
    const networkResponse = await fetch(request);
    
    // Cache the page for next time
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Offline page fallback
    return caches.match('/') || new Response('ManMitra is temporarily offline', {
      headers: { 'Content-Type': 'text/html' },
      status: 503
    });
  }
}

// Handle static asset requests
async function handleStaticRequest(request) {
  try {
    // Cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Network fallback
    const networkResponse = await fetch(request);
    
    // Cache static assets
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // For missing assets, return a minimal response
    return new Response('', { status: 404 });
  }
}

// Background sync for queued actions when offline
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'mood-assessment-sync') {
    event.waitUntil(syncMoodAssessments());
  } else if (event.tag === 'chat-message-sync') {
    event.waitUntil(syncChatMessages());
  } else if (event.tag === 'appointment-booking-sync') {
    event.waitUntil(syncAppointmentBookings());
  }
});

// Sync mood assessments when back online
async function syncMoodAssessments() {
  try {
    // Get queued assessments from IndexedDB (would need to implement)
    console.log('[SW] Syncing queued mood assessments');
    // Implementation would sync with backend when online
  } catch (error) {
    console.error('[SW] Failed to sync mood assessments:', error);
  }
}

// Sync chat messages when back online  
async function syncChatMessages() {
  try {
    console.log('[SW] Syncing queued chat messages');
    // Implementation would sync with backend when online
  } catch (error) {
    console.error('[SW] Failed to sync chat messages:', error);
  }
}

// Sync appointment bookings when back online
async function syncAppointmentBookings() {
  try {
    console.log('[SW] Syncing queued appointment bookings');
    // Implementation would sync with backend when online
  } catch (error) {
    console.error('[SW] Failed to sync appointment bookings:', error);
  }
}

// Push notification handling for crisis alerts
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: 'A student needs immediate assistance',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'crisis-alert',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View Alert',
        icon: '/icon-192.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icon-192.png'
      }
    ],
    data: {
      type: 'crisis',
      url: '/?alert=true'
    }
  };
  
  if (event.data) {
    const data = event.data.json();
    options.body = data.message || options.body;
    options.data = { ...options.data, ...data };
  }
  
  event.waitUntil(
    self.registration.showNotification('ManMitra Crisis Alert', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.tag);
  
  event.notification.close();
  
  if (event.action === 'view' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(clientList => {
        // Try to focus existing window
        for (const client of clientList) {
          if (client.url.includes(self.location.origin)) {
            return client.focus();
          }
        }
        // Open new window if none exists
        return clients.openWindow(event.notification.data?.url || '/');
      })
    );
  }
});

// Message handling for client communication
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data?.type === 'GET_OFFLINE_STATUS') {
    event.ports[0].postMessage({
      offline: !navigator.onLine,
      cacheStatus: 'ready'
    });
  }
});

console.log('[SW] ManMitra Service Worker v1.0.0 loaded successfully');