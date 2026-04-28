const iconButtons = document.querySelectorAll('.desktop-icon');
const closeButtons = document.querySelectorAll('.close');
const windows = document.querySelectorAll('.window');
const taskbarItems = document.getElementById('taskbar-items');
const clock = document.getElementById('clock');
const contactForm = document.getElementById('contact-form');
const contactSubmit = document.getElementById('contact-submit');
const contactStatus = document.getElementById('contact-status');
const recaptchaTokenInput = document.getElementById('contact-recaptcha-token');
const sentState = document.getElementById('sent-state');
let zCounter = 10;

const openWindow = (windowId) => {
  const win = document.getElementById(windowId);
  if (!win) return;

  win.classList.remove('hidden');
  bringToFront(win);
  ensureTaskbarButton(windowId);
};

const closeWindow = (windowId) => {
  const win = document.getElementById(windowId);
  if (!win) return;

  win.classList.add('hidden');
  const taskBtn = document.querySelector(`[data-task="${windowId}"]`);
  if (taskBtn) taskBtn.remove();
};

const ensureTaskbarButton = (windowId) => {
  if (document.querySelector(`[data-task="${windowId}"]`)) return;

  const win = document.getElementById(windowId);
  const title = win?.querySelector('h2')?.textContent ?? windowId;

  const item = document.createElement('li');
  const button = document.createElement('button');
  button.dataset.task = windowId;
  button.textContent = title;

  button.addEventListener('click', () => {
    const isHidden = win.classList.contains('hidden');
    win.classList.toggle('hidden', !isHidden);
    if (!win.classList.contains('hidden')) bringToFront(win);
  });

  item.append(button);
  taskbarItems.append(item);
};

const bringToFront = (active) => {
  zCounter += 1;
  active.style.zIndex = String(zCounter);
};

const refreshClock = () => {
  const now = new Date();
  clock.textContent = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
};

iconButtons.forEach((button) => {
  button.addEventListener('dblclick', () => openWindow(button.dataset.window));
  button.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') openWindow(button.dataset.window);
  });
});

closeButtons.forEach((button) => {
  button.addEventListener('click', () => closeWindow(button.dataset.close));
});

windows.forEach((win) => {
  win.addEventListener('mousedown', () => bringToFront(win));
});

windows.forEach((win) => {
  const titleBar = win.querySelector('.title-bar');
  if (!titleBar) return;

  titleBar.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || event.target.closest('.close')) return;

    bringToFront(win);
    const bounds = win.getBoundingClientRect();
    const desktopBounds = document.querySelector('.desktop').getBoundingClientRect();

    const offsetX = event.clientX - bounds.left;
    const offsetY = event.clientY - bounds.top;

    win.style.left = `${bounds.left - desktopBounds.left}px`;
    win.style.top = `${bounds.top - desktopBounds.top}px`;
    titleBar.setPointerCapture(event.pointerId);

    const onMove = (moveEvent) => {
      const maxLeft = desktopBounds.width - bounds.width;
      const maxTop = desktopBounds.height - bounds.height - 42;
      const nextLeft = Math.min(
        Math.max(moveEvent.clientX - desktopBounds.left - offsetX, 0),
        maxLeft
      );
      const nextTop = Math.min(
        Math.max(moveEvent.clientY - desktopBounds.top - offsetY, 0),
        maxTop
      );

      win.style.left = `${nextLeft}px`;
      win.style.top = `${nextTop}px`;
    };

    const onUp = () => {
      titleBar.removeEventListener('pointermove', onMove);
      titleBar.removeEventListener('pointerup', onUp);
      titleBar.removeEventListener('pointercancel', onUp);
    };

    titleBar.addEventListener('pointermove', onMove);
    titleBar.addEventListener('pointerup', onUp);
    titleBar.addEventListener('pointercancel', onUp);
  });
});

refreshClock();
setInterval(refreshClock, 1000);
openWindow('pet-window');

if (contactForm && sentState && contactSubmit && contactStatus && recaptchaTokenInput) {
  const recaptchaSiteKey = contactForm.dataset.recaptchaSiteKey?.trim();

  const setStatus = (message = '') => {
    contactStatus.textContent = message;
    contactStatus.classList.toggle('hidden', !message);
  };

  const loadRecaptcha = (siteKey) => {
    if (window.grecaptcha?.execute) return Promise.resolve(window.grecaptcha);

    return new Promise((resolve, reject) => {
      const existingScript = document.querySelector('script[data-recaptcha="v3"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(window.grecaptcha));
        existingScript.addEventListener('error', () => reject(new Error('Could not load reCAPTCHA.')));
        return;
      }

      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
      script.async = true;
      script.defer = true;
      script.dataset.recaptcha = 'v3';
      script.addEventListener('load', () => resolve(window.grecaptcha));
      script.addEventListener('error', () => reject(new Error('Could not load reCAPTCHA.')));
      document.head.append(script);
    });
  };

  const markSent = () => {
    contactForm.classList.add('hidden');
    setStatus('');
    sentState.classList.remove('hidden');
  };

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;
    if (!recaptchaSiteKey || recaptchaSiteKey === 'YOUR_RECAPTCHA_V3_SITE_KEY') {
      setStatus('Add your reCAPTCHA v3 site key to enable sending.');
      return;
    }

    contactSubmit.disabled = true;
    setStatus('Verifying with reCAPTCHA...');

    try {
      const grecaptcha = await loadRecaptcha(recaptchaSiteKey);
      await new Promise((resolve) => grecaptcha.ready(resolve));
      const token = await grecaptcha.execute(recaptchaSiteKey, {
        action: 'contact_submit'
      });
      recaptchaTokenInput.value = token;

      setStatus('Sending message...');
      await new Promise((resolve) => setTimeout(resolve, 350));
      markSent();
      contactForm.reset();
    } catch (error) {
      setStatus('Verification failed. Please try again.');
    } finally {
      contactSubmit.disabled = false;
    }
  });
}
