if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('../sw.js').then(reg => console.log('Service Worker is registered')).catch(err => console.log('Error', err));
}
