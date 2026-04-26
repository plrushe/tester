const iconButtons = document.querySelectorAll('.desktop-icon');
const closeButtons = document.querySelectorAll('.close');
const taskbarItems = document.getElementById('taskbar-items');
const clock = document.getElementById('clock');

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
  document.querySelectorAll('.window').forEach((win, i) => {
    win.style.zIndex = String(i + 1);
  });
  active.style.zIndex = '999';
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

document.querySelectorAll('.window').forEach((win) => {
  win.addEventListener('mousedown', () => bringToFront(win));
});

refreshClock();
setInterval(refreshClock, 1000);
