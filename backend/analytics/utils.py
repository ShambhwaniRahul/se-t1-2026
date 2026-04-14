import pandas as pd
import numpy as np
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from statsmodels.tsa.statespace.sarimax import SARIMAX
import warnings


def generate_dynamic_restaurant_data(
    total_days=1095, 
    base_revenue=3500.00, 
    yoy_growth_rate=0.15, 
    noise_std=350.00
):
    """
    Generates synthetic daily revenue data using YoY compound growth.
    Outputs a DataFrame with explicit Date, Year, Month, and Day columns formatted for SQL ingestion.
    """
    
    end_date = pd.Timestamp.today().normalize()
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
        6: 1.80  
    }
    seasonality_vector = np.array([demand_multipliers[d.weekday()] for d in dates])
    
    random_noise = np.random.normal(0, noise_std, total_days)
    calculated_revenue = (trended_revenue * seasonality_vector) + random_noise
    calculated_revenue = np.maximum(calculated_revenue, 0)
    calculated_revenue = np.round(calculated_revenue, 2)
    
    # Extract distinct temporal components for analytical querying
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
    
    Args:
        df (pd.DataFrame): Input dataset containing 'Date' and 'Revenue' columns.
        start_date (str): ISO formatted start date (YYYY-MM-DD).
        end_date (str): ISO formatted end date (YYYY-MM-DD).
        span (int): Aggregation window in days. Default is 1 (daily).
        alpha (float): EWMA smoothing factor between 0 and 1. Default is 0.3.
        
    Returns:
        pd.DataFrame: Aggregated dataset with computed EWMA trendline.
    """
    filtered_df = df.copy()
    
    if start_date:
        start_date_obj = pd.to_datetime(start_date).date()
        filtered_df = filtered_df[filtered_df['Date'] >= start_date_obj]
        
    if end_date:
        end_date_obj = pd.to_datetime(end_date).date()
        filtered_df = filtered_df[filtered_df['Date'] <= end_date_obj]
        
    if filtered_df.empty:
        return filtered_df
        
    filtered_df['Date'] = pd.to_datetime(filtered_df['Date'])
    filtered_df.set_index('Date', inplace=True)
    
    resample_rule = f'{span}D'
    
    # Apply named aggregation to calculate sum and day frequency simultaneously
    aggregated_df = filtered_df.resample(resample_rule).agg(
        Revenue=('Revenue', 'sum'),
        Day_Count=('Revenue', 'count')
    )
    
    # Enforce strict span parity to prevent partial period degradation
    aggregated_df = aggregated_df[aggregated_df['Day_Count'] == span]
    
    # Purge the temporary frequency column to maintain expected schema
    aggregated_df.drop(columns=['Day_Count'], inplace=True)

    aggregated_df.dropna(subset=['Revenue'], inplace=True)
    
    aggregated_df['EWMA'] = aggregated_df['Revenue'].ewm(alpha=alpha, adjust=False).mean()
    
    aggregated_df = aggregated_df.round(2)
    aggregated_df.reset_index(inplace=True)
    aggregated_df['Date'] = aggregated_df['Date'].dt.date
    
    return aggregated_df


def generate_holt_winters_forecast(df, forecast_days=14, seasonal_periods=7):
    """
    Fits a Holt-Winters Triple Exponential Smoothing model to historical daily revenue
    and generates a forward-looking forecast.
    
    Args:
        df (pd.DataFrame): Daily dataset requiring a 'Date' index and 'Revenue' column.
        forecast_days (int): Number of future days to predict.
        seasonal_periods (int): The frequency of the recurring cycle.
        
    Returns:
        pd.Series: Forecasted revenue values indexed by future dates.
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
    forecast = fitted_hw.forecast(forecast_days)
    
    return forecast.round(2)


def generate_sarima_forecast(df, forecast_days=14, seasonal_periods=7):
    """
    Fits a Seasonal Autoregressive Integrated Moving Average (SARIMA) model 
    to historical daily revenue to generate a forward-looking forecast.
    
    Args:
        df (pd.DataFrame): Daily dataset requiring a 'Date' index and 'Revenue' column.
        forecast_days (int): Number of future days to predict.
        seasonal_periods (int): The frequency of the recurring cycle.
        
    Returns:
        pd.Series: Forecasted revenue values indexed by future dates.
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
    forecast = fitted_sarima.forecast(steps=forecast_days)
    
    warnings.filterwarnings("default")
    
    return forecast.round(2)