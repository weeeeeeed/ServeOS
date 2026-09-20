/* ==============================================================================
   SERVEOS PUSH NOTIFICATION SERVICE WORKER
   Handles marketing push notifications, tab focusing, and customer deep-linking.
   ============================================================================== */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// 1. PUSH EVENT - Listen for incoming marketing broadcasts from web-push
self.addEventListener('push', (event) => {
  if (!event.data) {
    console.warn('[SW] Push event received with no payload');
    return;
  }

  let payload = {
    title: 'ServeOS Announcement',
    body: 'New update from your favorite restaurant!',
    icon: '/favicon.ico',
    image: null,
    data: { url: '/' },
  };

  try {
    const json = event.data.json();
    payload = {
      title: json.title || payload.title,
      body: json.body || json.message || payload.body,
      icon: json.icon || '/images/serveos-icon.png',
      image: json.image || json.image_url || null,
      data: {
        url: json.data?.url || json.cta_url || json.url || '/',
        restaurantId: json.data?.restaurantId || json.restaurant_id || null,
        campaignId: json.data?.campaignId || json.campaign_id || null,
      },
    };
  } catch (err) {
    // If text payload was sent instead of JSON
    payload.body = event.data.text() || payload.body;
  }

  const notificationOptions = {
    body: payload.body,
    icon: payload.icon || '/images/serveos-icon.png',
    badge: '/favicon.ico',
    image: payload.image || undefined,
    vibrate: [100, 50, 100],
    data: payload.data,
    tag: payload.data.campaignId ? `serveos-campaign-${payload.data.campaignId}` : `serveos-push-${Date.now()}`,
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, notificationOptions)
  );
});

// 2. NOTIFICATION CLICK - Focus existing restaurant tab or open new tab
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url)
    ? event.notification.data.url
    : '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Look for an existing tab that matches the URL or domain
      for (const client of clientList) {
        if (client.url && client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }

      // If open tab with same origin exists, focus and navigate it
      for (const client of clientList) {
        if ('focus' in client && 'navigate' in client) {
          client.focus();
          return client.navigate(targetUrl);
        }
      }

      // Otherwise, open a new window/tab
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// 3. NOTIFICATION CLOSE - Clean-up and analytics hook
self.addEventListener('notificationclose', (event) => {
  const dismissedData = event.notification.data;
  console.log('[SW] Notification closed by user:', dismissedData);
});
