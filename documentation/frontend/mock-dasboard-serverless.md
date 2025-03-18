**Previous:** [Homepage](homepage.md)
**Next:** [README](../../README.md)

# MockDashboard Component Technical Documentation

## Overview

The MockDashboard component is a React-based demonstration interface that simulates a real-time sensor monitoring dashboard. Unlike the standard Dashboard component which relies on WebSocket connections, this version generates random mock data on the client side at regular intervals to demonstrate the UI functionality without requiring a server connection.

## Features

- Client-side data generation that simulates real-time updates
- Sensor selection functionality
- Historical data visualization using various chart types (Line, Area, Bar)
- Status indicator cards for key metrics
- Warning banner indicating the mock nature of the data

## Dependencies

### External Libraries

- **React**: Core library with hooks (`useState`, `useEffect`)
- **Recharts**: Charting library for data visualization
  - Components: `LineChart`, `Line`, `AreaChart`, `Area`, `BarChart`, `Bar`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `Legend`, `ResponsiveContainer`
- **Lucide React**: Icon library
  - Icons: `Thermometer`, `Droplets`, `Gauge`, `Eye`, `Wind`, `Users`, `Goal`, `Home`, `AlertCircle`
- **React Router**: For navigation (`Link` component)

### Internal Components/Utils

- `StatCard`: Component for displaying individual metric cards
- Utility functions:
  - `formatValue`: Formats values based on metric type
  - `generateMockSensorData`: Creates random sensor data for demonstration
  - `getAQIStatus`: Evaluates Air Quality Index status
  - `reliabilityIndicator`: Provides status based on reliability score

## Component Structure

### State Management

```typescript
const [currentData, setCurrentData] = useState<any>(null);
const [historicalData, setHistoricalData] = useState<any[]>([]);
const [selectedSensor, setSelectedSensor] = useState("all");
```

- `currentData`: Stores the most recent generated sensor data
- `historicalData`: Maintains a collection of recent data points (limited to 10)
- `selectedSensor`: Currently selected sensor ID

### Data Generation

The component generates mock data through these key functions:

#### `generateNewData`

Creates new random sensor data:
- Calls `generateMockSensorData()` utility function
- Formats timestamps for display
- Updates current data state
- Appends to historical data (limiting to 10 most recent entries)

#### `changeSensor`

Changes the selected sensor:
- Updates selected sensor state
- Filters historical data to show only data for the selected sensor (if not "all")

### Data Flow

1. On component mount, `generateNewData` is called immediately
2. An interval is set to call `generateNewData` every 3 seconds
3. Mock data is processed and formatted with timestamps
4. Current data state is updated with the latest reading
5. Historical data array is appended (limited to 10 most recent entries)
6. UI components render based on available data
7. Interval is cleared on component unmount

### UI Components

The UI is structured as follows:

1. **Header**
   - Title ("Mock Dashboard")
   - Sensor selection dropdown
   - Home navigation link

2. **Warning Banner**
   - Notification that this is a mock dashboard generating random client-side data

3. **Main Content**
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

   - **Loading State**: Displayed when waiting for initial data generation

## Mock Data Structure

The `generateMockSensorData` function creates data with the following structure:

```typescript
interface MockSensorData {
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

Import and use the MockDashboard component in your application:

```jsx
import MockDashboard from './path/to/MockDashboard';

function App() {
  return (
    <MockDashboard />
  );
}
```

## Key Differences from Standard Dashboard

- **No WebSocket Connection**: Uses client-side data generation instead
- **Simpler State Management**: No connection states or WebSocket refs
- **Warning Banner**: Explicitly indicates mock nature of the dashboard
- **Data Source**: Random generation vs. real sensor data
- **Simplified Sensor Selection**: Changes only filter existing data rather than subscribing to new data streams
- **No Reconnection Logic**: Not needed since there's no actual connection

**Previous:** [Homepage](homepage.md)
**Next:** [README](../../README.md)
