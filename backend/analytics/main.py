from utils import generate_dynamic_restaurant_data, apply_dynamic_ewma, render_ewma_visualization


def main():
    # Generate the restaurant data
    df = generate_dynamic_restaurant_data()
    print("Generated restaurant data:")
    print(df.head())
    print()
    
    # Apply EWMA with 7-day span
    yearly_data = apply_dynamic_ewma(
        df, 
        # start_date="2024-01-01", 
        # end_date="2024-12-31", 
        span=7,
        alpha=0.3
    )
    print("Applied EWMA:")
    print(yearly_data.tail())
    print()
    
    # Render the visualization
    render_ewma_visualization(yearly_data)


if __name__ == "__main__":
    main()
