-- Synthetic local development fixtures only. No real customer data or secrets.

insert into app.organizations (id, slug, name, legal_name, status, default_currency, timezone)
values
  ('00000000-0000-0000-0000-0000000000a1', 'tenant-a', 'Tenant A', 'Tenant A Co., Ltd.', 'ACTIVE', 'THB', 'Asia/Bangkok'),
  ('00000000-0000-0000-0000-0000000000b1', 'tenant-b', 'Tenant B', 'Tenant B Co., Ltd.', 'ACTIVE', 'THB', 'Asia/Bangkok');

insert into app.restaurants (id, tenant_id, name, legal_name, slug, currency, timezone)
values
  ('00000000-0000-0000-0000-0000000000a2', '00000000-0000-0000-0000-0000000000a1', 'Restaurant A', 'Tenant A Co., Ltd.', 'restaurant-a', 'THB', 'Asia/Bangkok'),
  ('00000000-0000-0000-0000-0000000000b2', '00000000-0000-0000-0000-0000000000b1', 'Restaurant B', 'Tenant B Co., Ltd.', 'restaurant-b', 'THB', 'Asia/Bangkok');

insert into app.branches (id, tenant_id, restaurant_id, name, code, city, country_code)
values
  ('00000000-0000-0000-0000-0000000000a3', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a2', 'Branch A', 'A1', 'Bangkok', 'TH'),
  ('00000000-0000-0000-0000-0000000000b3', '00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000b2', 'Branch B', 'B1', 'Bangkok', 'TH');

insert into app.branch_settings (id, tenant_id, restaurant_id, branch_id, currency, timezone, service_charge_enabled, service_charge_bps, vat_enabled, vat_bps, default_preparation_minutes)
values
  ('00000000-0000-0000-0000-0000000000a4', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a2', '00000000-0000-0000-0000-0000000000a3', 'THB', 'Asia/Bangkok', true, 1000, true, 700, 12),
  ('00000000-0000-0000-0000-0000000000b4', '00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000b2', '00000000-0000-0000-0000-0000000000b3', 'THB', 'Asia/Bangkok', false, 0, true, 700, 10);

insert into foodflow.restaurant_tables (id, tenant_id, branch_id, code, label, seats, qr_code, display_order)
values
  ('00000000-0000-0000-0000-0000000000a5', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3', 'T-A1', 'Table A1', 4, 'local://tenant-a/table-a1', 1),
  ('00000000-0000-0000-0000-0000000000b5', '00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000b3', 'T-B1', 'Table B1', 4, 'local://tenant-b/table-b1', 1);

insert into foodflow.menu_categories (id, tenant_id, restaurant_id, name, display_order)
values
  ('00000000-0000-0000-0000-0000000000a6', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a2', 'Seed Category A', 1),
  ('00000000-0000-0000-0000-0000000000b6', '00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000b2', 'Seed Category B', 1);

insert into foodflow.menu_availabilities (id, tenant_id, restaurant_id, name, type, timezone, active)
values
  ('00000000-0000-0000-0000-0000000000a7', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a2', 'Always A', 'ALWAYS', 'Asia/Bangkok', true),
  ('00000000-0000-0000-0000-0000000000b7', '00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000b2', 'Always B', 'ALWAYS', 'Asia/Bangkok', true);

insert into foodflow.modifier_groups (id, tenant_id, restaurant_id, name, kind, required, minimum_selections, maximum_selections, display_order)
values
  ('00000000-0000-0000-0000-0000000000a8', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a2', 'Milk', 'MODIFIER', true, 1, 1, 1),
  ('00000000-0000-0000-0000-0000000000b8', '00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000b2', 'Size', 'MODIFIER', false, 0, 1, 1);

insert into foodflow.modifier_choices (id, tenant_id, restaurant_id, modifier_group_id, name, price_delta_minor, display_order)
values
  ('00000000-0000-0000-0000-0000000000a9', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a2', '00000000-0000-0000-0000-0000000000a8', 'Oat Milk', 2500, 1),
  ('00000000-0000-0000-0000-0000000000b9', '00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000b2', '00000000-0000-0000-0000-0000000000b8', 'Large', 3000, 1);

insert into foodflow.menu_items (id, tenant_id, restaurant_id, category_id, availability_id, name, description, base_price_minor, currency, preparation_station, estimated_preparation_minutes, status, display_order)
values
  ('00000000-0000-0000-0000-0000000000aa', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a2', '00000000-0000-0000-0000-0000000000a6', '00000000-0000-0000-0000-0000000000a7', 'Seed Item A', 'Synthetic item A', 10000, 'THB', 'BAR', 5, 'ACTIVE', 1),
  ('00000000-0000-0000-0000-0000000000ba', '00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000b2', '00000000-0000-0000-0000-0000000000b6', '00000000-0000-0000-0000-0000000000b7', 'Seed Item B', 'Synthetic item B', 12000, 'THB', 'MAIN_KITCHEN', 8, 'ACTIVE', 1);

insert into foodflow.menu_item_modifier_groups (tenant_id, restaurant_id, menu_item_id, modifier_group_id)
values ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a2', '00000000-0000-0000-0000-0000000000aa', '00000000-0000-0000-0000-0000000000a8');
