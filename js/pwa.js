'use strict';
(() => {
  const status = document.querySelector('#offline-status');
  const card = document.querySelector('#install-card');
  const button = document.querySelector('#install-app');
  const help = document.querySelector('#install-help');
  let promptEvent;
  const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  function connectivity(){status.hidden = navigator.onLine;}
  window.addEventListener('online', connectivity);
  window.addEventListener('offline', connectivity);
  connectivity();
  if (window.isSecureContext && 'serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(error => console.warn('Offline support unavailable:', error));
    card.hidden = standalone();
  }
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault(); promptEvent = event; card.hidden = standalone();
  });
  button.addEventListener('click', async () => {
    if (promptEvent) {
      const pending = promptEvent; promptEvent = undefined;
      try { await pending.prompt(); const result = await pending.userChoice; if(result.outcome==='accepted')card.hidden=true; }
      catch { help.hidden=false; help.textContent='يمكنك التثبيت من قائمة المتصفح إذا كان مدعومًا.'; }
    } else {
      help.hidden = false;
      help.textContent = /iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform==='MacIntel' && navigator.maxTouchPoints>1) ? 'من Safari: اضغط مشاركة، ثم إضافة إلى الشاشة الرئيسية.' : 'افتح قائمة المتصفح واختر تثبيت التطبيق أو إضافة إلى الشاشة الرئيسية، إذا كان الخيار متاحًا.';
    }
  });
  window.addEventListener('appinstalled', () => {promptEvent=undefined;card.hidden=true;});
})();
