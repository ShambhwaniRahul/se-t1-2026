from utils import (
    generate_dynamic_restaurant_data,
    apply_dynamic_ewma,
    render_ewma_visualization,
    generate_holt_winters_forecast,
    generate_sarima_forecast
)


def main():
    print("=" * 80)
    print("RESTAURANT REVENUE ANALYTICS - TESTING SUITE")
    print("=" * 80)
    print()
    
    # ============================================================================
    # SECTION 1: DATA GENERATION
    # ============================================================================
    print("1. DATA GENERATION")
    print("-" * 80)
    df = generate_dynamic_restaurant_data(total_days=1095)
    print(f"✓ Generated {len(df)} days of restaurant revenue data")
    print(f"  Date range: {df['Date'].min()} to {df['Date'].max()}")
    print(f"  Revenue range: ${df['Revenue'].min():,.2f} to ${df['Revenue'].max():,.2f}")
    print(f"\nFirst 5 records:")
    print(df.head())
    print()
    
    # ============================================================================
    # SECTION 2: EWMA ANALYSIS
    # ============================================================================
    print("2. EXPONENTIALLY WEIGHTED MOVING AVERAGE (EWMA) ANALYSIS")
    print("-" * 80)
    ewma_data = apply_dynamic_ewma(
        df,
        span=7,
        alpha=0.3
    )
    print(f"✓ Applied EWMA with 7-day span and alpha=0.3")
    print(f"  Aggregated periods: {len(ewma_data)}")
    print(f"\nLast 5 EWMA records:")
    print(ewma_data.tail())
    print()
    
    # ============================================================================
    # SECTION 3: HOLT-WINTERS FORECASTING
    # ============================================================================
    print("3. HOLT-WINTERS TRIPLE EXPONENTIAL SMOOTHING FORECAST")
    print("-" * 80)
    forecast_days = 14
    hw_forecast = generate_holt_winters_forecast(
        df,
        forecast_days=forecast_days,
        seasonal_periods=7
    )
    print(f"✓ Generated Holt-Winters forecast for next {forecast_days} days")
    print(f"  Forecast range: ${hw_forecast.min():,.2f} to ${hw_forecast.max():,.2f}")
    print(f"  Mean forecast: ${hw_forecast.mean():,.2f}")
    print(f"\nHolt-Winters forecast:")
    print(hw_forecast)
    print()
    
    # ============================================================================
    # SECTION 4: SARIMA FORECASTING
    # ============================================================================
    print("4. SEASONAL ARIMA (SARIMA) FORECAST")
    print("-" * 80)
    sarima_forecast = generate_sarima_forecast(
        df,
        forecast_days=forecast_days,
        seasonal_periods=7
    )
    print(f"✓ Generated SARIMA forecast for next {forecast_days} days")
    print(f"  Forecast range: ${sarima_forecast.min():,.2f} to ${sarima_forecast.max():,.2f}")
    print(f"  Mean forecast: ${sarima_forecast.mean():,.2f}")
    print(f"\nSARIMA forecast:")
    print(sarima_forecast)
    print()
    
    # ============================================================================
    # SECTION 5: FORECAST COMPARISON
    # ============================================================================
    print("5. FORECAST MODEL COMPARISON")
    print("-" * 80)
    print(f"Holt-Winters Total: ${hw_forecast.sum():,.2f}")
    print(f"SARIMA Total:       ${sarima_forecast.sum():,.2f}")
    print(f"Difference:         ${abs(hw_forecast.sum() - sarima_forecast.sum()):,.2f}")
    print()
    
    # ============================================================================
    # SECTION 6: VISUALIZATION
    # ============================================================================
    print("6. VISUALIZATION")
    print("-" * 80)
    print("✓ Rendering EWMA visualization...")
    render_ewma_visualization(ewma_data)
    print()
    
    print("=" * 80)
    print("TESTING COMPLETE")
    print("=" * 80)


if __name__ == "__main__":
    main()
