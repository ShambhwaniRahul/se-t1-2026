import type { ForecastPoint, ForecastDuration } from "./types";
import { HISTORICAL_REVENUE } from "./mockRevenueData";

/**
 * Simple forecasting using moving average + linear trend.
 * No ML required — purely frontend approximation.
 */
export function generateForecast(duration: ForecastDuration): ForecastPoint[] {
  const data = HISTORICAL_REVENUE;
  const n = data.length;

  // Calculate linear trend (slope) using last 30 days
  const recent = data.slice(-30);
  const avgX = (recent.length - 1) / 2;
  const avgY = recent.reduce((s, d) => s + d.revenue, 0) / recent.length;
  let num = 0, den = 0;
  recent.forEach((d, i) => {
    num += (i - avgX) * (d.revenue - avgY);
    den += (i - avgX) ** 2;
  });
  const slope = den !== 0 ? num / den : 0;

  // Moving average (last 7 days)
  const window = 7;
  const maBase = data.slice(-window).reduce((s, d) => s + d.revenue, 0) / window;

  // Historical points (last 30 days)
  const historical: ForecastPoint[] = data.slice(-30).map((d) => ({
    date: d.date,
    revenue: d.revenue,
    predictedRevenue: d.revenue,
  }));

  // Forecast points
  const lastDate = new Date(data[n - 1].date);
  const forecast: ForecastPoint[] = Array.from({ length: duration }, (_, i) => {
    const date = new Date(lastDate);
    date.setDate(date.getDate() + i + 1);
    const trend = slope * (i + 1);
    const seasonal = Math.sin((i + 1) * 0.9) * 600; // minor oscillation
    const predicted = Math.round(maBase + trend + seasonal);
    return {
      date: date.toISOString().split("T")[0],
      predictedRevenue: Math.max(predicted, 5000),
    };
  });

  return [...historical, ...forecast];
}
