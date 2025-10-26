# Mac Remote Control - Mobile App

> **Your Laziness, Now Mobile** 📱

A beautiful React Native mobile app that turns your phone into the ultimate remote control for your Mac. Perfect for those moments when getting up feels like too much work.

## Why This Exists

Because reaching for your Mac to adjust volume, change brightness, or put it to sleep interrupts your comfortable Netflix, Jio Hotstar, or YouTube binge. This app lets you control everything from your phone while staying perfectly lazy.

## Features That Keep You Lazy

### 🎚️ One-Handed Volume Control

- Smooth sliders for precise volume adjustment
- Perfect for loud commercials or quiet scenes
- No need to pause your show

### 💡 Brightness at Your Fingertips

- Adjust screen brightness without leaving your spot
- Great for changing room lighting conditions
- Keep your viewing experience comfortable

### 📊 Real-Time System Monitoring

- Battery status so you know when to plug in
- CPU and memory usage for performance geeks
- All the info you need without interrupting your flow

### ⚡ Quick Actions

- **Sleep** - Put your Mac to bed from your bed
- **Restart** - Quick system refresh when needed
- **Shutdown** - Power down without moving

### 🎨 Beautiful Dark Theme

- Optimized for low-light viewing
- Easy on the eyes during movie nights
- Professional design that just works

## Perfect For

- 🛋️ **Couch potatoes** - Control everything without standing up
- 🎬 **Movie nights** - Be the remote master from your seat
- 🎵 **Music sessions** - Fine-tune volume from anywhere
- 💻 **Work from bed** - All the controls you need
- 🎮 **Gaming setups** - Quick adjustments between matches

## Quick Start

```bash
# Install dependencies
bun install

# Start development server
bun start

# Run on iOS
bun ios

# Run on Android
bun android
```

## How It Makes You Lazier

| Before This App               | With This App            |
| ----------------------------- | ------------------------ |
| Get up to adjust volume       | Adjust from your phone   |
| Walk to Mac to check battery  | Check from anywhere      |
| Physically press sleep button | Tap sleep on your phone  |
| Interrupt your viewing        | Stay immersed in content |

## Technical Features

- **React Native + TypeScript** - Production-ready code
- **Real-time polling** - Updates every 2 seconds
- **Error handling** - Automatic reconnection if server drops
- **Accessibility** - Works with screen readers
- **Responsive design** - Looks great on phones and tablets

## Platform Support

- **iOS**: Uses `http://localhost:5001`
- **Android**: Uses `http://10.0.2.2:5001` (emulator localhost)
- **Physical devices**: Use your computer's IP address

## Why You'll Love This

- 🕒 **Saves time** - No more getting up for small adjustments
- 😌 **More comfortable** - Stay in your perfect spot
- 🎯 **More precise** - Fine-tune controls with sliders
- 📱 **Always available** - Your phone is always with you

## Troubleshooting

### Can't Connect to Server

- Make sure the Node.js server is running
- Check if both devices are on the same network
- For Android emulator, use `10.0.2.2` instead of localhost

### App Not Updating

- Check if polling is active (green status badge)
- Verify API responses contain expected data

### Build Issues

- Clear cache: `bun start --reset-cache`
- Reinstall dependencies: `rm -rf node_modules && bun install`

---

_Stay comfortable. Stay lazy. Stay in control._
