# Mac Remote Control Server

> **The Brains Behind Your Laziness** 🧠

The Node.js server that powers your Mac remote control experience. This runs on your Mac and provides REST APIs to control everything from volume to system shutdown.

## Why This Exists

Because getting up from your comfortable spot to adjust volume or brightness is just too much effort. This server lets your phone do all the work while you stay put!

## Quick Start

```bash
# Install dependencies
npm install

# Start the server
npm start

# Or build a standalone executable
npm run build
```

The server will start on `http://localhost:5001` and be ready to accept commands from your mobile app.

## API Endpoints

### 🔍 System Information

- `GET /status` - Check if server is running
- `GET /info` - Get battery, CPU, and memory status

### 🔊 Volume Control

- `GET /volume` - Get current volume (0-100)
- `POST /volume` - Set volume level

### 💡 Brightness Control

- `GET /brightness` - Get current brightness (0.0-1.0)
- `POST /brightness` - Set brightness level

### ⚡ System Actions

- `POST /action` - Perform actions: `sleep`, `restart`, `shutdown`

## Example Usage

### Check if server is running:

```bash
curl http://localhost:5001/status
```

### Set volume to 75%:

```bash
curl -X POST http://localhost:5001/volume \
  -H "Content-Type: application/json" \
  -d '{"volume": 75}'
```

### Put Mac to sleep:

```bash
curl -X POST http://localhost:5001/action \
  -H "Content-Type: application/json" \
  -d '{"type": "sleep"}'
```

## Dependencies

- `express` - Web server framework
- `cors` - Cross-origin resource sharing
- `loudness` - System volume control
- `brightness` - Display brightness control
- `systeminformation` - System monitoring

## Security Notes

- The server runs on `localhost:5001` by default
- System actions (restart/shutdown) may require sudo privileges
- For production use, consider adding authentication

## Perfect For

- 🛋️ **Lazy movie nights** - Adjust volume without leaving the couch
- 🎵 **Music control** - Fine-tune volume from anywhere in the room
- 💤 **Quick sleep** - Put your Mac to sleep from bed
- 📊 **System monitoring** - Check battery and performance remotely

## Troubleshooting

### Port Already in Use

If port 5001 is busy, modify the `PORT` constant in `server.cjs`

### Permission Issues

For system actions, you might need to run with sudo privileges

### Network Access

By default, the server only accepts local connections. For network access, modify the listen address in `server.cjs`

---

_Stop getting up. Start being lazy._
