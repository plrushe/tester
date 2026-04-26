# XP Desktop Website Starter

A lightweight starter for building a website that behaves like a Windows XP desktop.

## Why this stack

- **HTML** for desktop/window/taskbar layout.
- **CSS** for XP visual style (wallpaper, taskbar, title bars, icon states).
- **Vanilla JavaScript** for interactions (icon selection, open/close windows, taskbar buttons, live clock).

This approach keeps complexity low and is ideal for a portfolio or interactive landing page.

## Run locally

Because this is plain static frontend code, you can open `index.html` directly or serve it with:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Interaction model

- Single-click desktop icons to select.
- Double-click icons to open section windows.
- Click the red close button to hide a window.
- Use taskbar chips to re-open/toggle a window.
