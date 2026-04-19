import pandas as pd
import numpy as np
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from statsmodels.tsa.statespace.sarimax import SARIMAX
import warnings


def generate_dynamic_restaurant_data(
    total_days=1095, 
    base_revenue=3500.00, 
    yoy_growth_rate=0.25, 
    noise_std=350.00
):
    """
    Generates synthetic daily revenue data using YoY compound growth.
    The end date is projected 14 days into the future to establish expected actuals 
    for forecast validation.
    """
    
    end_date = pd.Timestamp.today().normalize() + pd.Timedelta(days=14)
    dates = pd.date_range(end=end_date, periods=total_days).date
    
    days_elapsed = np.arange(total_days)
    growth_multiplier = (1 + yoy_growth_rate) ** (days_elapsed / 365.25)
    trended_revenue = base_revenue * growth_multiplier
    
    demand_multipliers = {
        0: 0.65, 
        1: 0.70, 
        2: 0.85, 
        3: 1.00, 
        4: 1.60, 
        5: 1.90, 
        6: 1.70  
    }
    seasonality_vector = np.array([demand_multipliers[d.weekday()] for d in dates])
    
    random_noise = np.random.normal(0, noise_std, total_days)
    calculated_revenue = (trended_revenue * seasonality_vector) + random_noise
    calculated_revenue = np.maximum(calculated_revenue, 0)
    calculated_revenue = np.round(calculated_revenue, 2)
    
    years = [d.year for d in dates]
    months = [d.strftime('%B') for d in dates] 
    day_names = [d.strftime('%A') for d in dates]
    
    dataset = pd.DataFrame({
        'Date': dates, 
        'Year': years,
        'Month': months,
        'Day': day_names,
        'Revenue': calculated_revenue
    })
    
    return dataset


def apply_dynamic_ewma(df, start_date=None, end_date=None, span=1, alpha=0.3):
    """
    Filters date ranges, aggregates revenue into dynamic day-based intervals, 
    and calculates the Exponentially Weighted Moving Average (EWMA).
    """
    filtered_df = df.copy()
    
    if start_date:
        start_date_obj = pd.to_datetime(start_date).date()
        filtered_df = filtered_df[filtered_df['date'] >= start_date_obj]
        
    if end_date:
        end_date_obj = pd.to_datetime(end_date).date()
        filtered_df = filtered_df[filtered_df['date'] <= end_date_obj]
        
    if filtered_df.empty:
        return filtered_df
        
    filtered_df['date'] = pd.to_datetime(filtered_df['date'])
    filtered_df.set_index('date', inplace=True)
    
    resample_rule = f'{span}D'
    
    aggregated_df = filtered_df.resample(resample_rule).agg(
        Revenue=('Revenue', 'sum'),
        Day_Count=('Revenue', 'count')
    )
    
    aggregated_df = aggregated_df[aggregated_df['Day_Count'] == span]
    aggregated_df.drop(columns=['Day_Count'], inplace=True)
    aggregated_df.dropna(subset=['Revenue'], inplace=True)
    
    aggregated_df['EWMA'] = aggregated_df['Revenue'].ewm(alpha=alpha, adjust=False).mean()
    
    aggregated_df = aggregated_df.round(2)
    aggregated_df.reset_index(inplace=True)
    aggregated_df['date'] = aggregated_df['date'].dt.date
    
    return aggregated_df


def generate_holt_winters_forecast(df, forecast_days=14, seasonal_periods=7):
    """
    Fits a Holt-Winters Triple Exponential Smoothing model to historical daily revenue
    and generates a structured forward-looking forecast DataFrame.
    """
    validation_df = df.copy()
    
    if 'Date' in validation_df.columns:
        validation_df['Date'] = pd.to_datetime(validation_df['Date'])
        validation_df.set_index('Date', inplace=True)
        
    validation_df = validation_df.asfreq('D')
    
    hw_model = ExponentialSmoothing(
        validation_df['Revenue'],
        trend='add',
        seasonal='add',
        seasonal_periods=seasonal_periods,
        initialization_method="estimated"
    )
    
    fitted_hw = hw_model.fit(optimized=True)
    forecast_series = fitted_hw.forecast(forecast_days).round(2)
    
    forecast_df = forecast_series.to_frame(name='HW_Forecast')
    forecast_df.reset_index(inplace=True)
    forecast_df.rename(columns={'index': 'Date'}, inplace=True)
    forecast_df['Date'] = forecast_df['Date'].dt.date
    forecast_df['Day'] = pd.to_datetime(forecast_df['Date']).dt.strftime('%A')
    
    return forecast_df[['Date', 'Day', 'HW_Forecast']]


def generate_sarima_forecast(df, forecast_days=14, seasonal_periods=7):
    """
    Fits a Seasonal Autoregressive Integrated Moving Average (SARIMA) model 
    to historical daily revenue to generate a structured forward-looking forecast DataFrame.
    """
    validation_df = df.copy()
    
    if 'Date' in validation_df.columns:
        validation_df['Date'] = pd.to_datetime(validation_df['Date'])
        validation_df.set_index('Date', inplace=True)
        
    validation_df = validation_df.asfreq('D')
    
    warnings.filterwarnings("ignore")
    
    sarima_model = SARIMAX(
        validation_df['Revenue'],
        order=(1, 1, 1),
        seasonal_order=(1, 1, 1, seasonal_periods),
        enforce_stationarity=False,
        enforce_invertibility=False
    )
    
    fitted_sarima = sarima_model.fit(disp=False)
    forecast_series = fitted_sarima.forecast(steps=forecast_days).round(2)
    
    warnings.filterwarnings("default")
    
    forecast_df = forecast_series.to_frame(name='SARIMA_Forecast')
    forecast_df.reset_index(inplace=True)
    forecast_df.rename(columns={'index': 'Date'}, inplace=True)
    forecast_df['Date'] = forecast_df['Date'].dt.date
    forecast_df['Day'] = pd.to_datetime(forecast_df['Date']).dt.strftime('%A')
    
    return forecast_df[['Date', 'Day', 'SARIMA_Forecast']]


if __name__ == "__main__":
    forecast_horizon = 14
    synthetic_data = generate_dynamic_restaurant_data()
    
    # Isolate training data (historical) and holdout data (future expected actuals)
    train_data = synthetic_data.iloc[:-forecast_horizon].copy()
    
    expected_actuals = synthetic_data.iloc[-forecast_horizon:].copy()
    expected_actuals.rename(columns={'Revenue': 'Expected_Actual'}, inplace=True)
    expected_actuals = expected_actuals[['Date', 'Day', 'Expected_Actual']]
    
    # Execute forecasting models against the training segment
    holt_wint_df = generate_holt_winters_forecast(train_data, forecast_days=forecast_horizon)
    sarima_df = generate_sarima_forecast(train_data, forecast_days=forecast_horizon)
    
    # Consolidate disparate dataframes into a unified analytical view
    forecasts_merged = pd.merge(holt_wint_df, sarima_df, on=['Date', 'Day'], how='inner')
    comparative_table = pd.merge(expected_actuals, forecasts_merged, on=['Date', 'Day'], how='inner')
    
    print("Comparative Data Table (Future Expected Actuals vs. Forecasts):")
    print("-" * 85)
    print(comparative_table.to_string(index=False))