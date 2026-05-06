-- ISP Billing System - Database Schema (Enterprise FTTH)
-- Designed for Multi-tenant isolation with PostGIS support

CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Management & Tenancy
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'musi-cyber'
    status VARCHAR(20) DEFAULT 'active',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tenant_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id VARCHAR(128) NOT NULL, -- Firebase UID
    role VARCHAR(20) CHECK (role IN ('admin', 'tech', 'billing')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, user_id)
);

-- 2. FTTH Infrastructure Assets
CREATE TABLE olt_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    ip_address INET,
    sn VARCHAR(100) UNIQUE,
    model VARCHAR(100),
    brand VARCHAR(50), -- ZTE, Huawei, Fiberhome
    coordinate GEOMETRY(Point, 4326),
    status VARCHAR(20) DEFAULT 'online',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE odp_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    olt_id UUID REFERENCES olt_nodes(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL, -- ODP-PLG-01
    splitter_ratio VARCHAR(20), -- 1:8, 1:16
    total_ports INT DEFAULT 8,
    coordinate GEOMETRY(Point, 4326),
    status VARCHAR(20) DEFAULT 'idle',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Subscribers & Networking
CREATE TABLE sub_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),
    name VARCHAR(50) NOT NULL, -- "Home 20Mbps"
    bandwidth_mbps INT NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),
    plan_id UUID REFERENCES sub_plans(id),
    odp_id UUID REFERENCES odp_nodes(id),
    full_name VARCHAR(100) NOT NULL,
    pppoe_user VARCHAR(50) UNIQUE,
    pppoe_pass VARCHAR(50),
    static_ip INET,
    address TEXT,
    coordinate GEOMETRY(Point, 4326),
    status VARCHAR(20) DEFAULT 'active', -- active, isolated, terminated
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Billing & Financials
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscriber_id UUID REFERENCES subscribers(id),
    amount DECIMAL(12,2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'unpaid', -- unpaid, paid, overdue, canceled
    payment_method VARCHAR(50),
    payment_ref VARCHAR(100), -- Ref from PG (QRIS, VA)
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sub_location ON subscribers USING GIST (coordinate);
CREATE INDEX idx_odp_location ON odp_nodes USING GIST (coordinate);
