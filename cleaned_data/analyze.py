#!/usr/bin/env python3
"""
Data Analysis Script - CarSales_Dataset.csv
Note: First time looking at this dataset
"""

import pandas as pd
import numpy as np

# 1. LOAD AND PREVIEW DATA
df = pd.read_csv('CarSales_Dataset.csv')

print("1. BASIC INFO")
print(f"Shape: {df.shape}")
print(f"Columns: {list(df.columns)}")
print(df.head())

print("\n2. DATA TYPES")
print(df.dtypes)

# NOTE: Date_of_Service and Date_of_Accident are object (string), not datetime

print("\n3. NULL VALUES")
print(df.isnull().sum())

# NOTE: ServiceID, Date_of_Service, ServiceType, Cost_of_Service have ~20k NULL
# NOTE: AccidentID, Date_of_Accident, Description, Cost_of_Repair, Severity have ~14k NULL
# => Not every car has service/accident records



print("\n4. CATEGORICAL STATISTICS")
print(df.describe(include=['object']))

print("\n4. UNIQUE VALUE COUNTS")
for col in df.columns:
    print(f"{col}: {df[col].nunique()}")

print("\n5. REDUNDANCY ANALYSIS")

# Look at a specific car
sample_car = df[df['CarID'] == 'C33554']
print(f"\nCar C33554 has {len(sample_car)} rows:")
print(sample_car[['CarID', 'Features', 'ServiceID', 'AccidentID']].to_string())


print("\n--- Features per car ---")
features_per_car = df.groupby('CarID')['Features'].nunique()
print(features_per_car.describe())

print("\n--- Services per car ---")
services_per_car = df.groupby('CarID')['ServiceID'].apply(lambda x: x.dropna().nunique())
print(services_per_car.describe())

print("\n--- Accidents per car ---") 
accidents_per_car = df.groupby('CarID')['AccidentID'].apply(lambda x: x.dropna().nunique())
print(accidents_per_car.describe())

print("\n6. DATA DISTRIBUTION")

# 6.1 Manufacturer
print("\n--- Manufacturer ---")
print(df.drop_duplicates('CarID')['Manufacturer'].value_counts())

# 6.2 Fuel Type
print("\n--- Fuel Type ---")
print(df.drop_duplicates('CarID')['Fuel_Type'].value_counts())

# 6.3 Features (unique values)
print("\n--- Features (unique values) ---")
print(df['Features'].unique())

# 6.4 Service Types
print("\n--- Service Types ---")
print(df['ServiceType'].value_counts())

# 6.5 Accident Severity
print("\n--- Accident Severity ---")
print(df['Severity'].value_counts())

# =============================================================================
# 8. CHECK DATE FORMAT
# =============================================================================

print("\n8. DATE FORMAT")
print(f"Date_of_Service sample: {df['Date_of_Service'].dropna().iloc[0]}")
print(f"Date_of_Accident sample: {df['Date_of_Accident'].dropna().iloc[0]}")

# NOTE: Format is DD/MM/YYYY, not ISO 8601 standard (YYYY-MM-DD)

# =============================================================================
# 9. CHECK DEALER INFO
# =============================================================================

print("\n9. DEALER INFO")

dealers = df[['DealerName', 'DealerCity', 'Latitude', 'Longitude']].drop_duplicates()
print(f"Unique dealers: {len(dealers)}")
print(dealers.head(10))

# NOTE: There are 50 unique dealers, but dealer info is repeated in every car row
# => This is a transitive dependency, needs to be separated into its own table

# =============================================================================
# 10. SUMMARY OF FINDINGS
# =============================================================================

print("\n" + "="*70)
print("SUMMARY OF FINDINGS")
print("="*70)

print("""
1. REDUNDANCY (Data duplication):
   - 99,817 rows but only 15,000 unique cars
   - Each car repeats due to: multiple features, services, accidents
   - Redundancy factor: 6.65x

2. DENORMALIZED STRUCTURE:
   - All data (car, dealer, service, accident) in 1 flat table
   - Dealer info repeated for every car
   - Service/accident info repeated for every feature

3. DATE FORMAT:
   - Format is DD/MM/YYYY (string)
   - Should be YYYY-MM-DD (ISO 8601)

4. NULL VALUES:
   - ~21% rows have no service info
   - ~14% rows have no accident info
   - Car/dealer columns have no NULL

5. MULTI-VALUED ATTRIBUTE:
   - Features stored as 1 value/row instead of array
   - Causes row multiplication

6. TRANSITIVE DEPENDENCY:
   - CarID -> DealerName -> (DealerCity, Lat, Long)
   - Need to separate Dealer into its own table
""")
