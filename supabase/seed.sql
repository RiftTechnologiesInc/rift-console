-- Seed data for Rift Console

-- Insert sample tenant
INSERT INTO tenants (id, name) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Demo Financial Advisors')
ON CONFLICT (id) DO NOTHING;

-- Insert sample integrations
INSERT INTO integrations (id, tenant_id, type, status, last_sync_at) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'salesforce', 'active', NOW() - INTERVAL '2 hours'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'hubspot', 'inactive', NOW() - INTERVAL '5 days')
ON CONFLICT (id) DO NOTHING;

-- Insert sample advisors
INSERT INTO advisors (id, tenant_id, external_id, first_name, last_name, email, phone, status) VALUES
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'SF001', 'John', 'Smith', 'john.smith@example.com', '555-0101', 'active'),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'SF002', 'Sarah', 'Johnson', 'sarah.j@example.com', '555-0102', 'active'),
  ('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'SF003', 'Michael', 'Williams', 'mwilliams@example.com', '555-0103', 'active')
ON CONFLICT (id) DO NOTHING;

-- Insert sample clients
INSERT INTO clients (id, tenant_id, advisor_id, external_id, first_name, last_name, email, phone, status) VALUES
  ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'CL001', 'Alice', 'Brown', 'alice.b@email.com', '555-1001', 'active'),
  ('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'CL002', 'Bob', 'Davis', 'bob.davis@email.com', '555-1002', 'active'),
  ('30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'CL003', 'Carol', 'Miller', 'carol.m@email.com', '555-1003', 'active'),
  ('30000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'CL004', 'David', 'Wilson', 'dwilson@email.com', '555-1004', 'active'),
  ('30000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', 'CL005', 'Emma', 'Moore', 'emma.moore@email.com', '555-1005', 'active')
ON CONFLICT (id) DO NOTHING;

-- Insert sample activity log entries
INSERT INTO activity_log (tenant_id, entity_type, entity_id, action, description) VALUES
  ('00000000-0000-0000-0000-000000000001', 'integration', '10000000-0000-0000-0000-000000000001', 'synced', 'Successfully synced Salesforce data'),
  ('00000000-0000-0000-0000-000000000001', 'client', '30000000-0000-0000-0000-000000000001', 'created', 'New client Alice Brown added'),
  ('00000000-0000-0000-0000-000000000001', 'advisor', '20000000-0000-0000-0000-000000000001', 'updated', 'Advisor profile updated'),
  ('00000000-0000-0000-0000-000000000001', 'client', '30000000-0000-0000-0000-000000000002', 'created', 'New client Bob Davis added'),
  ('00000000-0000-0000-0000-000000000001', 'integration', '10000000-0000-0000-0000-000000000001', 'synced', 'Successfully synced Salesforce data');
