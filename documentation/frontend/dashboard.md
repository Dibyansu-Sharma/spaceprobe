**Previous:** [Application Router](application-router.md)  
**Next:** [Homepage](homepage.md)

# Dashboard Component Technical Documentation

## Overview

The Dashboard component is a React-based monitoring interface that displays real-time sensor data through various visualizations. It connects to a WebSocket service to receive live updates from sensors and presents the information through charts and status cards.

## Features

- Real-time data monitoring via WebSocket connection
- Sensor selection functionality
- Historical data visualization using various chart types (Line, Area, Bar)
- Status indicator cards for key metrics
- Connection status management with reconnect capability

## Dependencies

### External Libraries

- **React**: Core library with hooks (`useState`, `useEffect`, `useRef`, `useCallback`)
- **Recharts**: Charting library for data visualization
  - Components: `LineChart`, `Line`, `AreaChart`, `Area`, `BarChart`, `Bar`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `Legend`, `ResponsiveContainer`
- **Lucide React**: Icon library
  - Icons: `Thermometer`, `Droplets`, `Gauge`, `Eye`, `Wind`, `Users`, `AlertCircle`, `Goal`, `Loader2`, `RefreshCw`, `Home`
- **React Router**: For navigation (`Link` component)

### Internal Components/Utils

- `StatCard`: Component for displaying individual metric cards
- Utility functions:
  - `cn`: Class name utility (likely for conditional styling)
  - `formatValue`: Formats values based on metric type
  - `getAQIStatus`: Evaluates Air Quality Index status
  - `reliabilityIndicator`: Provides status based on reliability score
  - `getReliabilityMessage`: Generates messages related to reliability

## Component Structure

### State Management

```typescript
const [connected, setConnected] = useState(false);
const [connecting, setConnecting] = useState(false);
const [currentData, setCurrentData] = useState<any>(null);
const [historicalData, setHistoricalData] = useState<any[]>([]);
const [selectedSensor, setSelectedSensor] = useState("all");
const websocketRef = useRef<WebSocket | null>(null);
```

- `connected`: Tracks WebSocket connection status
- `connecting`: Indicates connection attempt in progress
- `currentData`: Stores the most recent sensor data
- `historicalData`: Maintains a collection of recent data points (limited to 10)
- `selectedSensor`: Currently selected sensor ID
- `websocketRef`: Reference to the WebSocket instance

### WebSocket Connection Management

The component handles WebSocket connections through these key functions:

#### `connectWebSocket`

Establishes a connection to the WebSocket server:
- Creates a new WebSocket instance using the URL from environment variables
- Sets up event handlers for connection events
- Updates connection state based on events
- Subscribes to the selected sensor on successful connection

#### `disconnectWebSocket`

Terminates the WebSocket connection:
- Unsubscribes from the current sensor
- Closes the connection

#### `handleReconnect`

Reconnects to the WebSocket server:
- Disconnects any existing connection
- Initiates a new connection

#### `subscribeToSensor`

Sends a subscription request for a specific sensor:
- Validates WebSocket connection state
- Sends subscription message with sensor ID

#### `changeSensor`

Changes the selected sensor:
- Unsubscribes from the current sensor
- Subscribes to the new sensor
- Updates state and clears historical data

### UI Components

The UI is structured as follows:

1. **Header**
   - Title
   - Sensor selection dropdown
   - Home navigation link
   - Connection status indicator
   - Reconnect button

2. **Main Content**
   - **Stat Cards**: Display current metrics
     - Temperature
     - Humidity
     - Pressure
     - Visibility
     - Air Quality
     - Occupancy
     - Reliability Score

   - **Charts** (when historical data is available)
     - Temperature & Humidity (Line Chart)
     - Air Quality Index (Area Chart)
     - Pressure Trends (Line Chart)
     - Occupancy (Bar Chart)

   - **Loading State**: Displayed when waiting for data

## Data Flow

1. The component establishes a WebSocket connection on mount
2. Incoming data is processed and formatted with timestamps
3. Current data state is updated with the latest reading
4. Historical data array is appended (limited to 10 most recent entries)
5. UI components render based on available data
6. User interactions (sensor selection, reconnect) trigger appropriate WebSocket actions

## WebSocket Message Format

### Subscribe Message
```json
{
  "type": "subscribe",
  "sensor_id": "sensor-id"  // Empty string for "all" sensors
}
```

### Unsubscribe Message
```json
{
  "type": "unsubscribe",
  "sensor_id": "sensor-id"  // Empty string for "all" sensors
}
```

### Incoming Data Structure
```typescript
interface SensorData {
  temperature: number;
  humidity: number;
  pressure: number;
  visibility: number;
  aqi: number;
  occupancy: number;
  sensor_id: string;
  reliability_score: number;
  created_at: string;
  // After processing:
  time: string;
  formattedTime: string;
}
```

## Usage

Import and use the Dashboard component in your application:

```jsx
import Dashboard from './path/to/Dashboard';

function App() {
  return (
    <Dashboard />
  );
}
```

## Configuration

The WebSocket URL is configured through the environment variable:
- `VITE_WEBSOCKET_URL`: WebSocket server endpoint

## Error Handling

- WebSocket connection errors are logged to the console
- Connection status is visually indicated to the user
- Reconnect functionality allows recovery from connection issues
- JSON parsing errors for incoming messages are caught and logged

**Previous:** [Application Router](application-router.md)  
**Next:** [Homepage](homepage.md)
