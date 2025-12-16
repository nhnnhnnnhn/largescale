
CREATE TABLE dealers (
    dealer_id VARCHAR(10) PRIMARY KEY,
    dealer_name VARCHAR(100),
    dealer_city VARCHAR(50),
    latitude DECIMAL(10,6),
    longitude DECIMAL(10,6)
);

CREATE TABLE cars (
    car_id VARCHAR(10) PRIMARY KEY,
    manufacturer VARCHAR(50),
    model VARCHAR(50),
    engine_size DECIMAL(3,1),
    fuel_type VARCHAR(20),
    year_of_manufacturing INT,
    mileage INT,
    price DECIMAL(10,2),
    features TEXT,
    dealer_id VARCHAR(10),
    CONSTRAINT fk_car_dealer
        FOREIGN KEY (dealer_id)
        REFERENCES dealers(dealer_id)
        ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE services (
    service_id VARCHAR(10) PRIMARY KEY,
    car_id VARCHAR(10) NOT NULL,
    date_of_service DATE NOT NULL,
    service_type VARCHAR(50),
    cost_of_service DECIMAL(10,2),
    CONSTRAINT fk_service_car
        FOREIGN KEY (car_id)
        REFERENCES cars(car_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE accidents (
    accident_id VARCHAR(10) PRIMARY KEY,
    car_id VARCHAR(10) NOT NULL,
    date_of_accident DATE NOT NULL,
    description VARCHAR(200),
    cost_of_repair DECIMAL(10,2),
    severity VARCHAR(20),
    CONSTRAINT fk_accident_car
        FOREIGN KEY (car_id)
        REFERENCES cars(car_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_cars_dealer ON cars(dealer_id);
CREATE INDEX idx_cars_manufacturer ON cars(manufacturer);
CREATE INDEX idx_services_car ON services(car_id);
CREATE INDEX idx_accidents_car ON accidents(car_id);
CREATE INDEX idx_accidents_severity ON accidents(severity);
