if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js').then(registration => {
    console.log('Service Worker registered with scope:', registration.scope);
  }).catch(error => {
    console.log('Service Worker registration failed:', error);
  });
}

Notification.requestPermission().then(permission => {
  if (permission === "granted") {
    console.log("Notification permission granted.");
  } else {
    console.log("Notification permission denied.");
  }
});

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

navigator.serviceWorker.ready.then(registration => {
  const applicationServerKey = urlBase64ToUint8Array('BPS-8Z2AI_3OL-bBv0Grwbu9rSO67lI0aT6G5gybLtmW4ygsfUST7BBPCTk7d2FxwwvhOjzzAzkP4C8crq5Gj1A');
  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey
  });
}).then(subscription => {
  const subscriptionObject = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh')))),
      auth: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth'))))
    },
    message: 'subscribed!!!'
  };

  console.log('User is subscribed:', subscriptionObject); 

  // Send the subscription details and message to your server
  fetch('http://localhost:3000/subscribe', {
    method: 'POST',
    body: JSON.stringify(subscriptionObject),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}).catch(error => {
  console.log('Failed to subscribe the user:', error);
});
