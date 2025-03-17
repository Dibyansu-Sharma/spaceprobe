import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  Goal,
  Home,
  AlertCircle
} from "lucide-react";

import {
  formatValue,
  generateMockSensorData,
  getAQIStatus,
  reliabilityIndicator,
} from "./lib/utils";
import { StatCard } from "./components/stat-card";

const MockDashboard = () => {
  const [currentData, setCurrentData] = useState<any>(null);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [selectedSensor, setSelectedSensor] = useState("all");

  const generateNewData = () => {
    const rawData = generateMockSensorData()
    const timestamp = new Date(rawData.created_at)
    const formattedData = {
      ...rawData,
      time: timestamp.toLocaleTimeString(),
      formattedTime: `${timestamp.getHours()}:${String(timestamp.getMinutes()).padStart(2, "0")}`,
    }

    setCurrentData(formattedData)
    setHistoricalData((prevData) => {
      const newData = [...prevData, formattedData]
      return newData.length > 10 ? newData.slice(newData.length - 10) : newData
    })
  }
  const changeSensor = (sensorId: string) => {
    if (sensorId === selectedSensor) return
    setSelectedSensor(sensorId)

    if (sensorId === "all") {
    } else {
      setHistoricalData((prevData) => prevData.filter((data) => data.sensor_id === sensorId))
    }
  }

  useEffect(() => {
    generateNewData()

    const interval = setInterval(() => {
      generateNewData()
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold text-gray-900">Mock Dashboard</h1>
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
            </div>
          </div>
        </div>
      </header>
      <div className="flex items-center bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-3 rounded-md mt-4">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
            <p className="text-sm font-medium">
              Mock Dashboard does not use WebSocket. It generates random data on
              client-side.
            </p>
          </div>
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
                color={getAQIStatus(currentData.aqi).status === "Good" ? "green" : "yellow"}
              />
              <StatCard title="Occupancy" value={`${currentData.occupancy} people`} icon={Users} color="pink" />
              <StatCard
                title="Reliability Score"
                value={formatValue(currentData.reliability_score, "reliability_score")}
                icon={Goal}
                color={reliabilityIndicator(currentData.reliability_score).status === "Good" ? "green" : "yellow"}
              />
            </div>

            {historicalData.length > 1 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Temperature & Humidity</h2>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={historicalData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="formattedTime" stroke="#64748b" fontSize={12} />
                        <YAxis yAxisId="left" orientation="left" domain={[0, 50]} stroke="#64748b" fontSize={12} />
                        <YAxis yAxisId="right" orientation="right" domain={[0, 100]} stroke="#64748b" fontSize={12} />
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
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Air Quality Index</h2>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={historicalData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="formattedTime" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e2e8f0",
                            borderRadius: "0.5rem",
                          }}
                        />
                        <Area type="monotone" dataKey="aqi" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Pressure Trends</h2>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={historicalData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="formattedTime" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e2e8f0",
                            borderRadius: "0.5rem",
                          }}
                        />
                        <Line type="monotone" dataKey="pressure" stroke="#6366f1" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Occupancy</h2>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={historicalData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="formattedTime" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e2e8f0",
                            borderRadius: "0.5rem",
                          }}
                        />
                        <Bar dataKey="occupancy" fill="#ec4899" radius={[4, 4, 0, 0]} />
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
              <h3 className="text-lg font-medium text-gray-900">Loading mock data...</h3>
            </div>
          </div>
        )}
      </main>
    </div>
  )
};

export default MockDashboard;