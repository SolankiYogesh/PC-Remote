# Mac Remote Control - React Native App

A beautiful, production-ready React Native mobile app for remotely controlling your Mac system. Features real-time system monitoring, volume/brightness controls, and system actions with a modern dark theme design.

## Features

- **Real-time System Monitoring**: Battery, CPU, and memory usage with live graphs
- **Volume & Brightness Controls**: Slider-based controls with debounced API calls
- **System Actions**: Sleep, restart, and shutdown with confirmation dialogs
- **IP Scanner**: QR code scanning for automatic server IP detection
- **Dark Theme**: Modern glassmorphism design with smooth animations
- **Offline Support**: Automatic reconnection and error handling
- **Cross-platform**: Works on both iOS and Android

## IP Scanner Feature

The app includes an automatic IP scanner that helps you connect to your Mac server:

### How it works:

1. **Automatic Detection**: On first launch, the app automatically opens the scanner
2. **QR Code Scanning**: Scan a QR code containing your Mac's IP address
3. **Manual Entry**: Option to manually enter the IP address
4. **Persistent Storage**: IP addresses are stored locally and automatically used on app restart
5. **Error Recovery**: If server connection fails, the scanner reopens automatically

### QR Code Format

The scanner expects QR codes containing IP addresses in the format:

- Plain IP address: `192.168.1.100`
- Or full URL: `http://192.168.1.100:5001`

### Server QR Code Generation

To generate a QR code for your Mac server, you can use the included server script or any QR code generator with your Mac's IP address.

## Installation & Setup

### Prerequisites

- Node.js 16+ and bun package manager
- React Native development environment
- iOS Simulator (for iOS) or Android Studio (for Android)
- Mac server running on port 5001

### Quick Start

1. **Install dependencies:**

   ```bash
   cd MacRemoteReactNative
   bun install
   ```

2. **Start the development server:**

   ```bash
   bun start
   ```

3. **Run on device/simulator:**

   ```bash
   # Android
   bun android

   # iOS
   bun ios
   ```

### Server Setup

Make sure your Mac server is running on port 5001. The app will automatically detect the server IP via QR code scanning or manual entry.

## Project Structure

```
src/
├── components/          # React components
│   ├── StatusBadge.tsx     # Connection status indicator
│   ├── SystemOverview.tsx  # System info display
│   ├── ControlsPanel.tsx   # Volume/brightness/actions
│   ├── OfflineState.tsx    # Offline/error state
│   ├── ServerSettings.tsx  # Server configuration
│   └── IpScanner.tsx       # QR code IP scanner
├── hooks/               # Custom React hooks
│   └── useApi.ts           # API data fetching hooks
├── services/            # API and utility services
│   └── api.ts              # HTTP client and API calls
├── types/               # TypeScript type definitions
│   └── api.ts              # API response types
└── theme/               # Design system
    └── colors.ts           # Color palette and typography
```

## API Integration

The app connects to a local Mac server with the following endpoints:

- `GET /status` - Server health check
- `GET /info` - System information (battery, CPU, memory)
- `GET /volume` - Current volume level
- `POST /volume` - Set volume level
- `GET /brightness` - Current brightness level
- `POST /brightness` - Set brightness level
- `POST /action` - System actions (sleep, restart, shutdown)

## Memory Graph Implementation

The real-time memory graph:

- Polls `/info` endpoint every 2 seconds
- Maintains a circular buffer of 60 samples (2 minutes of data)
- Uses `react-native-svg` for rendering
- Shows memory usage percentage and raw bytes
- Pauses polling when app goes to background

## Development

### Key Technologies

- **React Native** with TypeScript
- **React Query** for data fetching and caching
- **React Native SVG** for charts and graphics
- **React Native Scanner** for QR code scanning
- **AsyncStorage** for local data persistence
- **React Native Safe Area Context** for device-safe layouts

### Code Quality

- TypeScript for type safety
- ESLint and Prettier for code formatting
- React Query for efficient data management
- Custom hooks for reusable logic
- Component-based architecture

## Troubleshooting

### Common Issues

1. **Server Connection Failed**

   - Ensure Mac server is running on port 5001
   - Check if IP address is correct
   - Verify both devices are on same network

2. **QR Scanner Not Working**

   - Grant camera permissions
   - Ensure QR code contains valid IP address
   - Try manual IP entry as fallback

3. **Build Errors**
   - Clear cache: `bun start --reset-cache`
   - Reinstall dependencies: `bun install`
   - Check React Native version compatibility

## License

MIT License - see LICENSE file for details
