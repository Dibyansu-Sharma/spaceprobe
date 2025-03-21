import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatValue(value: number, metric: string): string {
  switch (metric) {
    case 'temperature':
      return `${value.toFixed(1)}°C`;
    case 'humidity':
      return `${value.toFixed(1)}%`;
    case 'pressure':
      return `${value.toFixed(1)} hPa`;
    case 'visibility':
      return `${value.toFixed(1)} km`;
    case 'aqi':
      return value.toString();
    case 'occupancy':
      return value.toString();
    case 'reliability_score':
      const reliability_percent = 100 * value;
      return `${reliability_percent.toFixed(1)}%`;
    default:
      return value.toString();
  }
}

export function getAQIStatus(aqi: number) {
  if (aqi <= 50) return { status: 'Good', color: '#22c55e', bgColor: '#dcfce7' };
  if (aqi <= 100) return { status: 'Moderate', color: '#eab308', bgColor: '#fef9c3' };
  if (aqi <= 150) return { status: 'Unhealthy for Sensitive Groups', color: '#f97316', bgColor: '#ffedd5' };
  if (aqi <= 200) return { status: 'Unhealthy', color: '#ef4444', bgColor: '#fee2e2' };
  if (aqi <= 300) return { status: 'Very Unhealthy', color: '#8b5cf6', bgColor: '#f3e8ff' };
  return { status: 'Hazardous', color: '#7e22ce', bgColor: '#fae8ff' };
}

export function reliabilityIndicator(reliability: number) {
  reliability = reliability * 100
  if (reliability <= 39) return { status: 'Inconsistent', color: '#f97316', bgColor: '#ffedd5'};
  if (reliability <= 79) return { status: 'Moderate', color: '#eab308', bgColor: '#fef9c3' };
  if (reliability <= 100) return { status: 'Good',  color: '#22c55e', bgColor: '#dcfce7' };
  return { status: 'Cannot Be Determined', color: '#7e22ce', bgColor: '#fae8ff' };
}
export interface SensorData {
  sensor_id: string;
  temperature: number;
  humidity: number;
  pressure: number;
  visibility: number;
  aqi: number;
  occupancy: number;
  reliability_score: number;
  created_at: string;
  time?: string;
  formattedTime?: string;
}

export function generateMockSensorData(): SensorData {
  const sensor_id = Math.floor(Math.random() * 3) + 1;
  return {
    sensor_id: `sensor-${sensor_id}`,
    temperature: parseFloat((Math.random() * 15 + 20).toFixed(2)),
    humidity: Math.floor(Math.random() * 50) + 30,
    pressure: Math.floor(Math.random() * 30) + 1000,
    visibility: Math.floor(Math.random() * 10) + 1,
    aqi: Math.floor(Math.random() * 150),
    occupancy: Math.floor(Math.random() * 10),
    reliability_score: parseFloat((Math.random() * 0.5 + 0.5).toFixed(2)),
    created_at: new Date().toISOString()
  };
}