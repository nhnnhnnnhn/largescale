#!/usr/bin/env python3
"""
Export cleaned CSV files to MongoDB JSON format
Simple flat documents matching CSV structure
"""

import pandas as pd
import json

def export_mongodb(input_dir='./', output_dir='./'):
    print("Exporting to MongoDB JSON...")
    
    #DEALERS
    dealers = pd.read_csv(f'{input_dir}/dealers_cleaned.csv')
    dealers_json = dealers.to_dict(orient='records')
    with open(f'{output_dir}/mongodb_dealers.json', 'w') as f:
        json.dump(dealers_json, f, indent=2)
    print(f"✓ mongodb_dealers.json ({len(dealers_json)} docs)")
    
    # CARS
    cars = pd.read_csv(f'{input_dir}/cars_cleaned.csv')
    cars_json = cars.to_dict(orient='records')
    with open(f'{output_dir}/mongodb_cars.json', 'w') as f:
        json.dump(cars_json, f, indent=2)
    print(f"✓ mongodb_cars.json ({len(cars_json)} docs)")
    
    # SERVICES
    services = pd.read_csv(f'{input_dir}/services_cleaned.csv')
    services_json = services.to_dict(orient='records')
    with open(f'{output_dir}/mongodb_services.json', 'w') as f:
        json.dump(services_json, f, indent=2)
    print(f"✓ mongodb_services.json ({len(services_json)} docs)")
    
    #ACCIDENTS=========
    accidents = pd.read_csv(f'{input_dir}/accidents_cleaned.csv')
    accidents_json = accidents.to_dict(orient='records')
    with open(f'{output_dir}/mongodb_accidents.json', 'w') as f:
        json.dump(accidents_json, f, indent=2)
    print(f"✓ mongodb_accidents.json ({len(accidents_json)} docs)")
    
    print("\n✓ MongoDB export complete!")


if __name__ == '__main__':
    export_mongodb('./', './')
