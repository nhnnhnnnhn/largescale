#!/usr/bin/env python3
"""
Script làm sạch dữ liệu CSV CarSales_Dataset.csv
Output: 4 file CSV đã chuẩn hóa
"""

import pandas as pd

def clean_data(input_file, output_dir='./'):
    print(f"Reading {input_file}...")
    df = pd.read_csv(input_file)
    print(f"Total rows: {len(df)}")
    
    #1. AGGREGATE FEATURES
    print("\n1. Aggregating features")
    car_features = df.groupby('CarID')['Features'].apply(
        lambda x: ', '.join(sorted(x.unique()))
    ).reset_index()
    car_features.columns = ['CarID', 'Features_Agg']
    
    #2. CREATE CARS
    print("2. Creating cars")
    cars_df = df.drop_duplicates(subset='CarID')[
        ['CarID', 'Manufacturer', 'Model', 'Engine size', 'Fuel_Type', 
         'Year_of_Manufacturing', 'Mileage', 'Price', 
         'DealerName', 'DealerCity', 'Latitude', 'Longitude']
    ].copy()
    cars_df = cars_df.merge(car_features, on='CarID', how='left')
    print(f"   Unique cars: {len(cars_df)}")
    
    #3. CREATE DEALERS
    print("3. Creating dealers")
    dealers_df = cars_df[['DealerName', 'DealerCity', 'Latitude', 'Longitude']].drop_duplicates()
    dealers_df = dealers_df.reset_index(drop=True)
    dealers_df['DealerID'] = 'D' + (dealers_df.index + 1).astype(str).str.zfill(5)
    print(f"   Unique dealers: {len(dealers_df)}")
    
    # Link dealers to cars
    cars_df = cars_df.merge(
        dealers_df[['DealerName', 'DealerCity', 'DealerID']], 
        on=['DealerName', 'DealerCity'], 
        how='left'
    )
    
    #4. CREATE SERVICES
    print("4. Creating services...")
    services_df = df[df['ServiceID'].notna()][
        ['ServiceID', 'CarID', 'Date_of_Service', 'ServiceType', 'Cost_of_Service']
    ].drop_duplicates()
    
    # Convert date format
    services_df['Date_of_Service'] = pd.to_datetime(
        services_df['Date_of_Service'], format='%d/%m/%Y', errors='coerce'
    ).dt.strftime('%Y-%m-%d')
    services_df = services_df[services_df['Date_of_Service'].notna()]
    print(f"   Unique services: {len(services_df)}")
    
    #5. CREATE ACCIDENTS
    print("5. Creating accidents...")
    accidents_df = df[df['AccidentID'].notna()][
        ['AccidentID', 'CarID', 'Date_of_Accident', 'Description', 'Cost_of_Repair', 'Severity']
    ].drop_duplicates()
    
    # Convert date format
    accidents_df['Date_of_Accident'] = pd.to_datetime(
        accidents_df['Date_of_Accident'], format='%d/%m/%Y', errors='coerce'
    ).dt.strftime('%Y-%m-%d')
    accidents_df = accidents_df[accidents_df['Date_of_Accident'].notna()]
    print(f"   Unique accidents: {len(accidents_df)}")
    
    #6. EXPORT CSVs
    print("\n6. Exporting CSV files...")
    
    # Dealers
    dealers_out = dealers_df[['DealerID', 'DealerName', 'DealerCity', 'Latitude', 'Longitude']]
    dealers_out.columns = ['dealer_id', 'dealer_name', 'dealer_city', 'latitude', 'longitude']
    dealers_out.to_csv(f'{output_dir}/dealers_cleaned.csv', index=False)
    
    # Cars
    cars_out = cars_df[['CarID', 'Manufacturer', 'Model', 'Engine size', 'Fuel_Type', 
                        'Year_of_Manufacturing', 'Mileage', 'Price', 'Features_Agg', 'DealerID']]
    cars_out.columns = ['car_id', 'manufacturer', 'model', 'engine_size', 'fuel_type',
                        'year_of_manufacturing', 'mileage', 'price', 'features', 'dealer_id']
    cars_out.to_csv(f'{output_dir}/cars_cleaned.csv', index=False)
    
    # Services
    services_out = services_df.copy()
    services_out.columns = ['service_id', 'car_id', 'date_of_service', 'service_type', 'cost_of_service']
    services_out.to_csv(f'{output_dir}/services_cleaned.csv', index=False)
    
    # Accidents
    accidents_out = accidents_df.copy()
    accidents_out.columns = ['accident_id', 'car_id', 'date_of_accident', 'description', 'cost_of_repair', 'severity']
    accidents_out.to_csv(f'{output_dir}/accidents_cleaned.csv', index=False)
    
    print("\n✓ Export complete!")
    print(f"  - dealers_cleaned.csv ({len(dealers_out)} rows)")
    print(f"  - cars_cleaned.csv ({len(cars_out)} rows)")
    print(f"  - services_cleaned.csv ({len(services_out)} rows)")
    print(f"  - accidents_cleaned.csv ({len(accidents_out)} rows)")


if __name__ == '__main__':
    clean_data('CarSales_Dataset.csv', './')
