import { useState, useEffect, useRef, useCallback } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Thermometer,
  Droplets,
  Gauge,
  Eye,
  Wind,
  Users,
  AlertCircle,
  Goal,
  Loader2,
  RefreshCw,
  Home,
} from "lucide-react";
import {
  cn,
  formatValue,
  getAQIStatus,
  reliabilityIndicator,
} from "./lib/utils";
import { StatCard } from "./components/stat-card";
import { Link } from "react-router-dom";
import { getReliabilityMessage } from "./components/reliability-message";

const Dashboard = () => {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [currentData, setCurrentData] = useState<any>(null);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [selectedSensor, setSelectedSensor] = useState("all");
  const websocketRef = useRef<WebSocket | null>(null);

  const connectWebSocket = useCallback(() => {
    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      console.log("WebSocket already connected");
      return;
    }

    setConnecting(true);
    const wsUrl = import.meta.env.VITE_WEBSOCKET_URL;
    console.log("wsUrl", wsUrl);
    websocketRef.current = new WebSocket(wsUrl);

    websocketRef.current.onopen = () => {
      console.log("WebSocket Connected");
      setConnected(true);
      setConnecting(false);
      subscribeToSensor(selectedSensor);
    };

    websocketRef.current.onclose = () => {
      console.log("WebSocket Disconnected");
      setConnected(false);
      setConnecting(false);
    };

    websocketRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      setConnected(false);
      setConnecting(false);
    };

    websocketRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const timestamp = new Date(data.created_at);
        const formattedData = {
          ...data,
          time: timestamp.toLocaleTimeString(),
          formattedTime: `${timestamp.getHours()}:${String(
            timestamp.getMinutes()
          ).padStart(2, "0")}`,
        };
        console.log("formattedData", formattedData);
        setCurrentData(formattedData);
        setHistoricalData((prevData) => {
          const newData = [...prevData, formattedData];
          return newData.length > 10
            ? newData.slice(newData.length - 10)
            : newData;
        });
      } catch (error) {
        console.error("Error parsing WebSocket data:", error);
      }
    };
  }, [selectedSensor]);

  const disconnectWebSocket = useCallback(() => {
    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      websocketRef.current.send(
        JSON.stringify({
          type: "unsubscribe",
          sensor_id: selectedSensor === "all" ? "" : selectedSensor,
        })
      );
      websocketRef.current.close();
    }
  }, [selectedSensor]);

  const handleReconnect = useCallback(() => {
    disconnectWebSocket();
    connectWebSocket();
  }, [disconnectWebSocket, connectWebSocket]);

  const subscribeToSensor = useCallback((sensorId: string) => {
    if (
      !websocketRef.current ||
      websocketRef.current.readyState !== WebSocket.OPEN
    ) {
      console.error("WebSocket not connected, can't subscribe");
      return;
    }

    websocketRef.current.send(
      JSON.stringify({
        type: "subscribe",
        sensor_id: sensorId === "all" ? "" : sensorId,
      })
    );
  }, []);

  const changeSensor = useCallback(
    (sensorId: string) => {
      if (sensorId === selectedSensor) return;

      if (websocketRef.current?.readyState === WebSocket.OPEN) {
        websocketRef.current.send(
          JSON.stringify({
            type: "unsubscribe",
            sensor_id: selectedSensor === "all" ? "" : selectedSensor,
          })
        );

        subscribeToSensor(sensorId);
      }

      setSelectedSensor(sensorId);
      setHistoricalData([]);
    },
    [selectedSensor, subscribeToSensor]
  );

  useEffect(() => {
    connectWebSocket();

    return () => {
      disconnectWebSocket();
    };
  }, [connectWebSocket, disconnectWebSocket]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <select
                  className="bg-white border border-gray-300 rounded-md pl-2 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                  value={selectedSensor}
                  onChange={(e) => changeSensor(e.target.value)}
                >
                  <option value="all">All Sensors</option>
                  <option value="sensor-1">Sensor 1</option>
                  <option value="sensor-2">Sensor 2</option>
                  <option value="sensor-3">Sensor 3</option>
                </select>
              </div>
              <Link to="/">
                <button className="flex items-center gap-2 border px-3 py-1 rounded text-sm">
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </button>
              </Link>
              <div className="flex items-center space-x-2">
                <div
                  className={cn(
                    "h-2 w-2 rounded-full",
                    connected ? "bg-green-500" : "bg-red-500"
                  )}
                />
                <span className="text-sm text-gray-600">
                  {connected ? "Connected" : "Disconnected"}
                </span>
              </div>
              <button
                onClick={handleReconnect}
                disabled={connecting}
                className={cn(
                  "flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium",
                  connecting
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                )}
              >
                <RefreshCw
                  className={cn("w-4 h-4", connecting && "animate-spin")}
                />
                <span>{connecting ? "Connecting..." : "Reconnect"}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentData ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <StatCard
                title="Temperature"
                value={formatValue(currentData.temperature, "temperature")}
                icon={Thermometer}
                color="orange"
                trend={2.5}
              />
              <StatCard
                title="Humidity"
                value={formatValue(currentData.humidity, "humidity")}
                icon={Droplets}
                color="blue"
                trend={-1.2}
              />
              <StatCard
                title="Pressure"
                value={formatValue(currentData.pressure, "pressure")}
                icon={Gauge}
                color="indigo"
                trend={0.8}
              />
              <StatCard
                title="Visibility"
                value={formatValue(currentData.visibility, "visibility")}
                icon={Eye}
                color="purple"
              />
              <StatCard
                title="Air Quality"
                value={currentData.aqi}
                icon={Wind}
                color={
                  getAQIStatus(currentData.aqi).status === "Good"
                    ? "green"
                    : "yellow"
                }
              />
              <StatCard
                title="Occupancy"
                value={`${currentData.occupancy} people`}
                icon={Users}
                color="pink"
              />
              <StatCard
                title={`Reliability Score: ${currentData.sensor_id}`}
                value={
                  currentData.reliability_score > 1 ||
                  currentData.reliability_score < 0
                    ? getReliabilityMessage(currentData)
                    : formatValue(
                        currentData.reliability_score,
                        "reliability_score"
                      )
                }
                icon={Goal}
                color={
                  currentData.reliability_score > 1 ||
                  currentData.reliability_score < 0
                    ? "purple"
                    : reliabilityIndicator(currentData.reliability_score)
                        .status === "Good"
                    ? "green"
                    : "yellow"
                }
              />
            </div>

            {historicalData.length <= 1 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Temperature & Humidity
                  </h2>
                  <div className="h-80 flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="w-10 h-10 text-blue-500 mx-auto mb-4 animate-spin" />
                      <p className="text-sm text-gray-500">
                        Loading historical data...
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Air Quality Index
                  </h2>
                  <div className="h-80 flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="w-10 h-10 text-green-500 mx-auto mb-4 animate-spin" />
                      <p className="text-sm text-gray-500">
                        Loading historical data...
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Pressure Trends
                  </h2>
                  <div className="h-80 flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="w-10 h-10 text-indigo-500 mx-auto mb-4 animate-spin" />
                      <p className="text-sm text-gray-500">
                        Loading historical data...
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Occupancy
                  </h2>
                  <div className="h-80 flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="w-10 h-10 text-pink-500 mx-auto mb-4 animate-spin" />
                      <p className="text-sm text-gray-500">
                        Loading historical data...
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Your existing historical data chart components */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Temperature & Humidity
                  </h2>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={historicalData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                          dataKey="formattedTime"
                          stroke="#64748b"
                          fontSize={12}
                        />
                        <YAxis
                          yAxisId="left"
                          orientation="left"
                          domain={[0, 50]}
                          stroke="#64748b"
                          fontSize={12}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          domain={[0, 100]}
                          stroke="#64748b"
                          fontSize={12}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e2e8f0",
                            borderRadius: "0.5rem",
                          }}
                        />
                        <Legend />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="temperature"
                          stroke="#f97316"
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 8 }}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="humidity"
                          stroke="#0ea5e9"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Air Quality Index
                  </h2>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={historicalData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                          dataKey="formattedTime"
                          stroke="#64748b"
                          fontSize={12}
                        />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e2e8f0",
                            borderRadius: "0.5rem",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="aqi"
                          stroke="#10b981"
                          fill="#10b981"
                          fillOpacity={0.2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Pressure Trends
                  </h2>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={historicalData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                          dataKey="formattedTime"
                          stroke="#64748b"
                          fontSize={12}
                        />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e2e8f0",
                            borderRadius: "0.5rem",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="pressure"
                          stroke="#6366f1"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Occupancy
                  </h2>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={historicalData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                          dataKey="formattedTime"
                          stroke="#64748b"
                          fontSize={12}
                        />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e2e8f0",
                            borderRadius: "0.5rem",
                          }}
                        />
                        <Bar
                          dataKey="occupancy"
                          fill="#ec4899"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-64 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">
                Waiting for data...
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Please ensure the sensor is connected and transmitting data.
              </p>
              <button
                onClick={handleReconnect}
                disabled={connecting}
                className={cn(
                  "flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium mt-4 mx-auto",
                  connecting
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                )}
              >
                <RefreshCw
                  className={cn("w-4 h-4", connecting && "animate-spin")}
                />
                <span>{connecting ? "Connecting..." : "Reconnect"}</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
