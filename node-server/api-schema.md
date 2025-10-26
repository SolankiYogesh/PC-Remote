# Mac Remote Control API Schema

## Base Information

- **Base URL**: `http://localhost:5001`
- **Content-Type**: `application/json`

## Endpoints

### 1. GET /status

**Description**: Check if the server is running

**Request**:

- Method: GET
- Headers: None required
- Body: None

**Response**:

```json
{
  "ok": true,
  "message": "Mac Control Server is running"
}
```

**Error Response**: None (always returns 200 OK)

---

### 2. GET /info

**Description**: Get system information (battery, CPU, memory)

**Request**:

- Method: GET
- Headers: None required
- Body: None

**Response**:

```json
{
  "battery": {
    "hasBattery": boolean,
    "percent": number,
    "charging": boolean
  },
  "cpu": {
    "avgLoad": number,
    "currentLoad": number
  },
  "mem": {
    "total": number,
    "free": number,
    "used": number
  }
}
```

**Error Response**:

```json
{
  "error": "string"
}
```

- Status Code: 500

---

### 3. GET /volume

**Description**: Get current system volume level

**Request**:

- Method: GET
- Headers: None required
- Body: None

**Response**:

```json
{
  "volume": number
}
```

**Error Response**: None documented

---

### 4. POST /volume

**Description**: Set system volume level

**Request**:

- Method: POST
- Headers: `Content-Type: application/json`
- Body:

```json
{
  "volume": number
}
```

**Response**:

```json
{
  "success": true
}
```

**Error Response**: None documented

---

### 5. GET /brightness

**Description**: Get current display brightness level

**Request**:

- Method: GET
- Headers: None required
- Body: None

**Response**:

```json
{
  "brightness": number
}
```

**Error Response**: None documented

---

### 6. POST /brightness

**Description**: Set display brightness level

**Request**:

- Method: POST
- Headers: `Content-Type: application/json`
- Body:

```json
{
  "brightness": number
}
```

**Response**:

```json
{
  "success": true
}
```

**Error Response**: None documented

---

### 7. POST /action

**Description**: Perform system actions (sleep, restart, shutdown)

**Request**:

- Method: POST
- Headers: `Content-Type: application/json`
- Body:

```json
{
  "type": "sleep" | "restart" | "shutdown"
}
```

**Response**:

```json
{
  "success": true
}
```

**Error Response**:

```json
{
  "error": "Invalid action"
}
```

- Status Code: 400

---

## Data Types

### Volume

- **Type**: number
- **Range**: 0-100
- **Description**: System volume percentage

### Brightness

- **Type**: number
- **Range**: 0-1
- **Description**: Display brightness level (0.0 to 1.0)

### Action Types

- `"sleep"` - Put system to sleep
- `"restart"` - Restart system
- `"shutdown"` - Shutdown system

### Battery Information

```typescript
{
  hasBattery: boolean,
  percent: number,    // 0-100
  charging: boolean
}
```

### CPU Information

```typescript
{
  avgLoad: number,      // Average load
  currentLoad: number   // Current load percentage
}
```

### Memory Information

```typescript
{
  total: number,    // Total memory in bytes
  free: number,     // Free memory in bytes
  used: number      // Used memory in bytes
}
```

## Example Usage

### Get System Status

```bash
curl http://localhost:5001/status
```

### Get System Information

```bash
curl http://localhost:5001/info
```

### Set Volume to 75%

```bash
curl -X POST http://localhost:5001/volume \
  -H "Content-Type: application/json" \
  -d '{"volume": 75}'
```

### Set Brightness to 80%

```bash
curl -X POST http://localhost:5001/brightness \
  -H "Content-Type: application/json" \
  -d '{"brightness": 0.8}'
```

### Put System to Sleep

```bash
curl -X POST http://localhost:5001/action \
  -H "Content-Type: application/json" \
  -d '{"type": "sleep"}'
```

## Notes

- All endpoints return JSON responses
- POST endpoints require `Content-Type: application/json` header
- Volume range: 0-100 (percentage)
- Brightness range: 0.0-1.0 (decimal)
- System actions may require sudo privileges
- The server runs on port 5001 by default
