if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js').then(registration => {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array('BFlrbUA60pAHIjPxCpP2lae1oqJEAY-XgKUZxlkEu95XYNZD6yT-MLtiYJj1ydxcih_bARnLI_KVbkA06iZGHQQ')
          }).then(subscription => {
            fetch('https://localhost/subscribe', {
              method: 'POST',
              body: JSON.stringify(subscription),
              headers: {'Content-Type': 'application/json'}
            });
          });
        }
      });
    });
  }
  
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
  