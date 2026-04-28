const iconButtons = document.querySelectorAll('.desktop-icon');
const closeButtons = document.querySelectorAll('.close');
const windows = document.querySelectorAll('.window');
const taskbarItems = document.getElementById('taskbar-items');
const clock = document.getElementById('clock');
const taskbar = document.querySelector('.taskbar');
const coarsePointer = window.matchMedia('(hover: none), (pointer: coarse)').matches;
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
  if (coarsePointer) {
    button.addEventListener('click', () => openWindow(button.dataset.window));
  }
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
    if (window.innerWidth <= 768) return;
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
      const maxTop = desktopBounds.height - bounds.height - (taskbar?.offsetHeight ?? 42);
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
