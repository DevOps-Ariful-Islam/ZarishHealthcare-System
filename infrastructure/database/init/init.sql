-- ZarishHealthcare System Database Initialization
-- Production Database Setup Script

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "hstore";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS clinical;
CREATE SCHEMA IF NOT EXISTS laboratory;
CREATE SCHEMA IF NOT EXISTS operations;
CREATE SCHEMA IF NOT EXISTS analytics;
CREATE SCHEMA IF NOT EXISTS sync;

-- Enable Row Level Security
ALTER DATABASE zarishhealthcare SET row_security = on;

-- Create basic tables for each service
-- Auth Service Tables
CREATE TABLE IF NOT EXISTS auth.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS auth.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clinical Service Tables
CREATE TABLE IF NOT EXISTS clinical.patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(20),
    contact_info JSONB,
    medical_history JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clinical.encounters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES clinical.patients(id) ON DELETE CASCADE,
    encounter_type VARCHAR(100) NOT NULL,
    provider_id UUID,
    encounter_data JSONB,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Laboratory Service Tables
CREATE TABLE IF NOT EXISTS laboratory.lab_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID,
    encounter_id UUID,
    test_type VARCHAR(100) NOT NULL,
    order_data JSONB,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS laboratory.lab_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES laboratory.lab_orders(id) ON DELETE CASCADE,
    result_data JSONB NOT NULL,
    verified_by UUID,
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Operations Service Tables
CREATE TABLE IF NOT EXISTS operations.facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_name VARCHAR(200) NOT NULL,
    facility_type VARCHAR(100),
    location JSONB,
    capacity_info JSONB,
    contact_info JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS operations.resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID REFERENCES operations.facilities(id) ON DELETE CASCADE,
    resource_type VARCHAR(100) NOT NULL,
    resource_data JSONB,
    quantity INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analytics Service Tables
CREATE TABLE IF NOT EXISTS analytics.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_type VARCHAR(100) NOT NULL,
    report_data JSONB NOT NULL,
    generated_by UUID,
    date_range JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analytics.metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_type VARCHAR(100) NOT NULL,
    metric_value DECIMAL,
    metadata JSONB,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sync Service Tables
CREATE TABLE IF NOT EXISTS sync.sync_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sync_type VARCHAR(100) NOT NULL,
    source_system VARCHAR(100),
    target_system VARCHAR(100),
    sync_data JSONB,
    status VARCHAR(50) DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON auth.users(email);
CREATE INDEX IF NOT EXISTS idx_patients_patient_id ON clinical.patients(patient_id);
CREATE INDEX IF NOT EXISTS idx_encounters_patient_id ON clinical.encounters(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_orders_patient_id ON laboratory.lab_orders(patient_id);
CREATE INDEX IF NOT EXISTS idx_facilities_name ON operations.facilities(facility_name);
CREATE INDEX IF NOT EXISTS idx_reports_type ON analytics.reports(report_type);
CREATE INDEX IF NOT EXISTS idx_sync_logs_status ON sync.sync_logs(status);

-- Insert default admin user (password: admin123)
INSERT INTO auth.users (email, password_hash, role) VALUES 
('admin@zarish.org', '$2b$10$K1h4U2b0t9K.CjY8u7gzMe6tX3H5p5U6oBfJ.DMRQ7bIw8QS0w7tG', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert default facility
INSERT INTO operations.facilities (facility_name, facility_type, location, capacity_info) VALUES 
('ZarishHealthcare Main Facility', 'Hospital', '{"country": "Generic", "region": "Central"}', '{"beds": 100, "icu_beds": 20}')
ON CONFLICT DO NOTHING;

COMMIT;