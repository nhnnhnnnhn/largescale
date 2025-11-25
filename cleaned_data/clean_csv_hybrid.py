#!/usr/bin/env python3
"""
Script làm sạch dữ liệu CSV CarSales_Dataset.csv
Thiết kế MongoDB theo Hybrid Pattern với 4 collections riêng biệt
"""

import pandas as pd
import numpy as np
from datetime import datetime
import json

def clean_car_sales_data_hybrid(input_file, output_dir='./cleaned_data'):
    """
    Làm sạch dữ liệu và xuất theo Hybrid Pattern
    Collections: cars, dealers, services, accidents
    """
    print(f"Đọc file {input_file}...")
    df = pd.read_csv(input_file)
    
    print(f"Số dòng ban đầu: {len(df)}")
    print(f"Số cột: {len(df.columns)}")
    
    # ========== 1. XỬ LÝ FEATURES ==========
    print("\n1. Gộp features...")
    car_features = df.groupby('CarID')['Features'].apply(lambda x: list(x.unique())).reset_index()
    car_features.columns = ['CarID', 'Features_List']
    
    # Tạo DataFrame cho Cars
    cars_df = df.drop_duplicates(subset='CarID')[
        ['CarID', 'Manufacturer', 'Model', 'Engine size', 'Fuel_Type', 
         'Year_of_Manufacturing', 'Mileage', 'Price', 
         'DealerName', 'DealerCity', 'Latitude', 'Longitude']
    ].copy()
    
    cars_df = cars_df.merge(car_features, on='CarID', how='left')
    print(f"Số xe unique: {len(cars_df)}")
    
    # ========== 2. XỬ LÝ DEALERS ==========
    print("\n2. Tạo Dealers collection...")
    dealers_df = cars_df[['DealerName', 'DealerCity', 'Latitude', 'Longitude']].drop_duplicates()
    dealers_df = dealers_df.reset_index(drop=True)
    dealers_df['DealerID'] = 'D' + (dealers_df.index + 1).astype(str).str.zfill(5)
    
    # Add DealerID vào cars_df
    cars_df = cars_df.merge(
        dealers_df[['DealerName', 'DealerCity', 'DealerID']], 
        on=['DealerName', 'DealerCity'], 
        how='left'
    )
    
    print(f"Số dealers unique: {len(dealers_df)}")
    
    # ========== 3. XỬ LÝ SERVICES ==========
    print("\n3. Làm sạch Services...")
    services_df = df[df['ServiceID'].notna()][
        ['ServiceID', 'CarID', 'Date_of_Service', 'ServiceType', 'Cost_of_Service']
    ].drop_duplicates()
    
    services_df['Date_of_Service'] = pd.to_datetime(
        services_df['Date_of_Service'], 
        format='%d/%m/%Y',
        errors='coerce'
    )
    services_df = services_df[services_df['Date_of_Service'].notna()]
    services_df['Cost_of_Service'] = pd.to_numeric(services_df['Cost_of_Service'], errors='coerce')
    services_df = services_df.drop_duplicates()
    
    print(f"Số services unique: {len(services_df)}")
    
    # ========== 4. XỬ LÝ ACCIDENTS ==========
    print("\n4. Làm sạch Accidents...")
    accidents_df = df[df['AccidentID'].notna()][
        ['AccidentID', 'CarID', 'Date_of_Accident', 'Description', 'Cost_of_Repair', 'Severity']
    ].drop_duplicates()
    
    accidents_df['Date_of_Accident'] = pd.to_datetime(
        accidents_df['Date_of_Accident'], 
        format='%d/%m/%Y',
        errors='coerce'
    )
    accidents_df = accidents_df[accidents_df['Date_of_Accident'].notna()]
    accidents_df['Cost_of_Repair'] = pd.to_numeric(accidents_df['Cost_of_Repair'], errors='coerce')
    accidents_df = accidents_df.drop_duplicates()
    
    print(f"Số accidents unique: {len(accidents_df)}")
    
    # ========== 5. TẠO MONGODB COLLECTIONS (HYBRID PATTERN) ==========
    print("\n5. Tạo MongoDB Collections theo Hybrid Pattern...")
    
    import os
    os.makedirs(output_dir, exist_ok=True)
    
    # ===== COLLECTION 1: CARS (Main Collection với Summary Data) =====
    cars_collection = []
    
    for _, car in cars_df.iterrows():
        # Tính service summary
        car_services = services_df[services_df['CarID'] == car['CarID']]
        if len(car_services) > 0:
            service_summary = {
                'total_services': int(len(car_services)),
                'last_service_date': car_services['Date_of_Service'].max().strftime('%Y-%m-%d'),
                'total_cost': float(car_services['Cost_of_Service'].sum()),
                'last_service_type': car_services.loc[car_services['Date_of_Service'].idxmax(), 'ServiceType']
            }
        else:
            service_summary = {
                'total_services': 0,
                'last_service_date': None,
                'total_cost': 0,
                'last_service_type': None
            }
        
        # Tính accident summary
        car_accidents = accidents_df[accidents_df['CarID'] == car['CarID']]
        if len(car_accidents) > 0:
            accident_summary = {
                'total_accidents': int(len(car_accidents)),
                'last_accident_date': car_accidents['Date_of_Accident'].max().strftime('%Y-%m-%d'),
                'total_repair_cost': float(car_accidents['Cost_of_Repair'].sum()),
                'highest_severity': car_accidents.loc[car_accidents['Cost_of_Repair'].idxmax(), 'Severity']
            }
        else:
            accident_summary = {
                'total_accidents': 0,
                'last_accident_date': None,
                'total_repair_cost': 0,
                'highest_severity': None
            }
        
        car_doc = {
            'car_id': car['CarID'],
            'manufacturer': car['Manufacturer'],
            'model': car['Model'],
            'specifications': {
                'engine_size': float(car['Engine size']) if pd.notna(car['Engine size']) else None,
                'fuel_type': car['Fuel_Type'],
                'year_of_manufacturing': int(car['Year_of_Manufacturing']) if pd.notna(car['Year_of_Manufacturing']) else None,
                'mileage': int(car['Mileage']) if pd.notna(car['Mileage']) else None
            },
            'price': float(car['Price']) if pd.notna(car['Price']) else None,
            'features': sorted(car['Features_List']) if isinstance(car['Features_List'], list) else [],
            'dealer_id': car['DealerID'],  # REFERENCE - không embed
            'service_summary': service_summary,
            'accident_summary': accident_summary,
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
        
        cars_collection.append(car_doc)
    
    # ===== COLLECTION 2: DEALERS (Separate Collection với GeoJSON) =====
    dealers_collection = []
    
    for _, dealer in dealers_df.iterrows():
        # Tính statistics
        dealer_cars = cars_df[cars_df['DealerID'] == dealer['DealerID']]
        
        dealer_doc = {
            'dealer_id': dealer['DealerID'],
            'name': dealer['DealerName'],
            'city': dealer['DealerCity'],
            'location': {
                'type': 'Point',
                'coordinates': [
                    float(dealer['Longitude']) if pd.notna(dealer['Longitude']) else 0.0,
                    float(dealer['Latitude']) if pd.notna(dealer['Latitude']) else 0.0
                ]
            },
            'contact': {
                'phone': None,  # Không có trong dữ liệu gốc
                'email': None
            },
            'statistics': {
                'total_cars': int(len(dealer_cars)),
                'average_price': float(dealer_cars['Price'].mean()) if len(dealer_cars) > 0 else 0
            },
            'created_at': datetime.now().isoformat()
        }
        
        dealers_collection.append(dealer_doc)
    
    # ===== COLLECTION 3: SERVICES (Separate Collection với Details) =====
    services_collection = []
    
    for _, service in services_df.iterrows():
        service_doc = {
            'service_id': service['ServiceID'],
            'car_id': service['CarID'],
            'date': service['Date_of_Service'].strftime('%Y-%m-%d'),
            'type': service['ServiceType'],
            'cost': float(service['Cost_of_Service']) if pd.notna(service['Cost_of_Service']) else 0,
            'details': {
                'mileage_at_service': None,  # Không có trong dữ liệu gốc
                'technician': None,
                'items_replaced': [],
                'next_service_due': None
            },
            'created_at': service['Date_of_Service'].isoformat()
        }
        
        services_collection.append(service_doc)
    
    # ===== COLLECTION 4: ACCIDENTS (Separate Collection với Details) =====
    accidents_collection = []
    
    for _, accident in accidents_df.iterrows():
        accident_doc = {
            'accident_id': accident['AccidentID'],
            'car_id': accident['CarID'],
            'date': accident['Date_of_Accident'].strftime('%Y-%m-%d'),
            'description': accident['Description'],
            'severity': accident['Severity'],
            'cost_of_repair': float(accident['Cost_of_Repair']) if pd.notna(accident['Cost_of_Repair']) else 0,
            'details': {
                'location': None,  # Không có trong dữ liệu gốc
                'insurance_claim': None,
                'claim_number': None,
                'repaired': None,
                'repair_completion_date': None
            },
            'created_at': accident['Date_of_Accident'].isoformat()
        }
        
        accidents_collection.append(accident_doc)
    
    # ========== 6. XUẤT DỮ LIỆU ==========
    print(f"\n6. Xuất dữ liệu MongoDB...")
    
    with open(f'{output_dir}/mongodb_cars.json', 'w', encoding='utf-8') as f:
        json.dump(cars_collection, f, indent=2, ensure_ascii=False)
    
    with open(f'{output_dir}/mongodb_dealers.json', 'w', encoding='utf-8') as f:
        json.dump(dealers_collection, f, indent=2, ensure_ascii=False)
    
    with open(f'{output_dir}/mongodb_services.json', 'w', encoding='utf-8') as f:
        json.dump(services_collection, f, indent=2, ensure_ascii=False)
    
    with open(f'{output_dir}/mongodb_accidents.json', 'w', encoding='utf-8') as f:
        json.dump(accidents_collection, f, indent=2, ensure_ascii=False)
    
    print(f"✓ Đã xuất 4 collections cho MongoDB (Hybrid Pattern)")
    
    # ========== 7. TẠO IMPORT SCRIPT ==========
    import_script = """#!/bin/bash
# MongoDB Import Script - Hybrid Pattern

echo "Importing MongoDB Collections (Hybrid Pattern)..."

# Import collections
mongoimport --db carsales --collection cars --file mongodb_cars.json --jsonArray --drop
mongoimport --db carsales --collection dealers --file mongodb_dealers.json --jsonArray --drop
mongoimport --db carsales --collection services --file mongodb_services.json --jsonArray --drop
mongoimport --db carsales --collection accidents --file mongodb_accidents.json --jsonArray --drop

echo ""
echo "Creating indexes..."

# Cars collection indexes
mongo carsales --eval '
db.cars.createIndex({ "car_id": 1 }, { unique: true });
db.cars.createIndex({ "manufacturer": 1, "model": 1 });
db.cars.createIndex({ "dealer_id": 1 });
db.cars.createIndex({ "price": 1 });
db.cars.createIndex({ "specifications.year_of_manufacturing": 1 });
'

# Dealers collection indexes
mongo carsales --eval '
db.dealers.createIndex({ "dealer_id": 1 }, { unique: true });
db.dealers.createIndex({ "location": "2dsphere" });
db.dealers.createIndex({ "city": 1 });
'

# Services collection indexes
mongo carsales --eval '
db.services.createIndex({ "service_id": 1 }, { unique: true });
db.services.createIndex({ "car_id": 1, "date": -1 });
db.services.createIndex({ "date": -1 });
db.services.createIndex({ "type": 1 });
'

# Accidents collection indexes
mongo carsales --eval '
db.accidents.createIndex({ "accident_id": 1 }, { unique: true });
db.accidents.createIndex({ "car_id": 1, "date": -1 });
db.accidents.createIndex({ "severity": 1 });
db.accidents.createIndex({ "date": -1 });
'

echo ""
echo "✅ Import complete!"
echo ""
echo "Database: carsales"
echo "Collections:"
echo "  - cars (with embedded summary data)"
echo "  - dealers (with GeoJSON location)"
echo "  - services (detailed records)"
echo "  - accidents (detailed records)"
"""
    
    with open(f'{output_dir}/import_mongodb.sh', 'w', encoding='utf-8') as f:
        f.write(import_script)
    
    print(f"✓ Đã tạo script import: {output_dir}/import_mongodb.sh")
    
    # ========== 8. BÁO CÁO THỐNG KÊ ==========
    print("\n" + "="*70)
    print("THỐNG KÊ DỮ LIỆU - HYBRID PATTERN")
    print("="*70)
    
    print(f"\n📊 COLLECTIONS:")
    print(f"  • cars:      {len(cars_collection):,} documents")
    print(f"  • dealers:   {len(dealers_collection):,} documents")
    print(f"  • services:  {len(services_collection):,} documents")
    print(f"  • accidents: {len(accidents_collection):,} documents")
    
    print(f"\n🚗 XE THEO HÃNG:")
    manufacturer_counts = cars_df['Manufacturer'].value_counts()
    for mfr, count in manufacturer_counts.head(5).items():
        print(f"  • {mfr:15s}: {count:,}")
    
    print(f"\n💰 GIÁ XE:")
    print(f"  • Giá thấp nhất:  ${cars_df['Price'].min():,.0f}")
    print(f"  • Giá cao nhất:   ${cars_df['Price'].max():,.0f}")
    print(f"  • Giá trung bình: ${cars_df['Price'].mean():,.0f}")
    
    # Summary report
    summary = {
        'design_pattern': 'Hybrid Pattern',
        'collections': {
            'cars': {
                'count': len(cars_collection),
                'description': 'Main collection with embedded summary data and dealer reference'
            },
            'dealers': {
                'count': len(dealers_collection),
                'description': 'Separate collection with GeoJSON location'
            },
            'services': {
                'count': len(services_collection),
                'description': 'Detailed service records'
            },
            'accidents': {
                'count': len(accidents_collection),
                'description': 'Detailed accident records'
            }
        },
        'files_created': [
            'mongodb_cars.json',
            'mongodb_dealers.json',
            'mongodb_services.json',
            'mongodb_accidents.json',
            'import_mongodb.sh'
        ]
    }
    
    with open(f'{output_dir}/mongodb_summary.json', 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)
    
    print("\n" + "="*70)
    print("✅ HOÀN TẤT TẠO DỮ LIỆU MONGODB (HYBRID PATTERN)!")
    print("="*70)
    print(f"\n📝 Để import vào MongoDB, chạy:")
    print(f"   cd {output_dir}")
    print(f"   bash import_mongodb.sh")
    
    return summary


if __name__ == '__main__':
    input_file = 'CarSales_Dataset.csv'
    output_dir = './cleaned_data'
    
    try:
        summary = clean_car_sales_data_hybrid(input_file, output_dir)
        print(f"\n✅ Thành công!")
    except Exception as e:
        print(f"\n❌ Lỗi: {str(e)}")
        import traceback
        traceback.print_exc()
