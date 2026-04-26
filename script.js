const iconButtons = document.querySelectorAll('.desktop-icon');
const closeButtons = document.querySelectorAll('.close');
const taskItems = document.getElementById('taskItems');
const clock = document.getElementById('clock');

function addTaskItem(id, label) {
  if (taskItems.querySelector(`[data-task="${id}"]`)) return;
  const chip = document.createElement('button');
  chip.className = 'task-item';
  chip.dataset.task = id;
  chip.textContent = label;
  chip.type = 'button';
  chip.addEventListener('click', () => toggleWindow(id));
  taskItems.appendChild(chip);
}

function removeTaskItem(id) {
  const chip = taskItems.querySelector(`[data-task="${id}"]`);
  if (chip) chip.remove();
}

function toggleWindow(id, forceOpen) {
  const windowEl = document.getElementById(id);
  if (!windowEl) return;

  const shouldOpen = forceOpen ?? windowEl.hidden;
  windowEl.hidden = !shouldOpen;

  if (shouldOpen) {
    const label = windowEl.querySelector('h2')?.textContent || id;
    addTaskItem(id, label);
  } else {
    removeTaskItem(id);
  }
}

iconButtons.forEach((button) => {
  button.addEventListener('dblclick', () => {
    toggleWindow(button.dataset.window, true);
  });

  button.addEventListener('click', () => {
    iconButtons.forEach((item) => item.classList.remove('selected'));
    button.classList.add('selected');
  });
});

closeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    toggleWindow(button.dataset.close, false);
  });
});

function updateClock() {
  clock.textContent = new Date().toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

updateClock();
setInterval(updateClock, 1000);
