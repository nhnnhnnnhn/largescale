# PostgreSQL Import Guide

## Step 1: Create Database

```sql
CREATE DATABASE carsales;
\c carsales
```

## Step 2: Run Schema

```sql
\i /root/largescale/cleaned_data/postgresql_schema.sql
```

## Step 3: Import Data

```sql
\COPY dealers FROM '/root/largescale/cleaned_data/dealers_cleaned.csv' WITH CSV HEADER;
\COPY cars FROM '/root/largescale/cleaned_data/cars_cleaned.csv' WITH CSV HEADER;
\COPY services FROM '/root/largescale/cleaned_data/services_cleaned.csv' WITH CSV HEADER;
\COPY accidents FROM '/root/largescale/cleaned_data/accidents_cleaned.csv' WITH CSV HEADER;
```

## Step 4: Verify

```sql
SELECT 'dealers', COUNT(*) FROM dealers
UNION ALL SELECT 'cars', COUNT(*) FROM cars
UNION ALL SELECT 'services', COUNT(*) FROM services
UNION ALL SELECT 'accidents', COUNT(*) FROM accidents;
```

Expected: dealers=50, cars=15000, services=17977, accidents=22707
