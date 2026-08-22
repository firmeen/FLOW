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
  ('00000000-0000-0000-0000-0000000000a3', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a2', 'Branch A1', 'A1', 'Bangkok', 'TH'),
  ('00000000-0000-0000-0000-0000000000ac', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a2', 'Branch A2', 'A2', 'Bangkok', 'TH'),
  ('00000000-0000-0000-0000-0000000000b3', '00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000b2', 'Branch B1', 'B1', 'Bangkok', 'TH');

insert into app.branch_settings (id, tenant_id, restaurant_id, branch_id, currency, timezone, service_charge_enabled, service_charge_bps, vat_enabled, vat_bps, default_preparation_minutes)
values
  ('00000000-0000-0000-0000-0000000000a4', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a2', '00000000-0000-0000-0000-0000000000a3', 'THB', 'Asia/Bangkok', true, 1000, true, 700, 12),
  ('00000000-0000-0000-0000-0000000000ae', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a2', '00000000-0000-0000-0000-0000000000ac', 'THB', 'Asia/Bangkok', false, 0, true, 700, 10),
  ('00000000-0000-0000-0000-0000000000b4', '00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000b2', '00000000-0000-0000-0000-0000000000b3', 'THB', 'Asia/Bangkok', false, 0, true, 700, 10);

insert into foodflow.restaurant_tables (id, tenant_id, branch_id, code, label, seats, qr_code, display_order)
values
  ('00000000-0000-0000-0000-0000000000a5', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3', 'T-A1', 'Table A1', 4, 'local://tenant-a/table-a1', 1),
  ('00000000-0000-0000-0000-0000000000ad', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000ac', 'T-A2', 'Table A2', 4, 'local://tenant-a/table-a2', 1),
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

-- P02/R02 deterministic synthetic identity/RBAC fixtures.
-- These values are local/test-only and are intentionally stable for later rounds.
insert into app.users (id, email, display_name, status)
values
  ('30000000-0000-4000-8000-0000000000a1', 'owner.a@flow.test', 'Tenant A Manager', 'ACTIVE'),
  ('30000000-0000-4000-8000-0000000000a2', 'staff.a1@flow.test', 'Branch A1 Staff', 'ACTIVE'),
  ('30000000-0000-4000-8000-0000000000a3', 'staff.a2@flow.test', 'Branch A2 Staff', 'ACTIVE'),
  ('30000000-0000-4000-8000-0000000000a4', 'suspended.a1@flow.test', 'Suspended User', 'SUSPENDED'),
  ('30000000-0000-4000-8000-0000000000a5', 'invited.a1@flow.test', 'Invited Membership User', 'ACTIVE'),
  ('30000000-0000-4000-8000-0000000000a6', 'suspended-member.a1@flow.test', 'Suspended Membership User', 'ACTIVE'),
  ('30000000-0000-4000-8000-0000000000a7', 'revoked.a1@flow.test', 'Revoked Membership User', 'ACTIVE'),
  ('30000000-0000-4000-8000-0000000000a8', 'kitchen.a1@flow.test', 'Kitchen A1', 'ACTIVE'),
  ('30000000-0000-4000-8000-0000000000a9', 'cashier.a2@flow.test', 'Cashier A2', 'ACTIVE'),
  ('30000000-0000-4000-8000-0000000000aa', 'disabled.a1@flow.test', 'Disabled Credential User', 'ACTIVE'),
  ('30000000-0000-4000-8000-0000000000ab', 'nocredential.a1@flow.test', 'No Credential User', 'ACTIVE'),
  ('30000000-0000-4000-8000-0000000000ad', 'nomembership.a1@flow.test', 'No Membership User', 'ACTIVE'),
  ('30000000-0000-4000-8000-0000000000b1', 'staff.b1@flow.test', 'Tenant B Staff', 'ACTIVE');

insert into app.roles (id, tenant_id, code, name, system)
values
  ('50000000-0000-4000-8000-0000000000a1', '00000000-0000-0000-0000-0000000000a1', 'MANAGER', 'Manager', false),
  ('50000000-0000-4000-8000-0000000000a2', '00000000-0000-0000-0000-0000000000a1', 'STAFF', 'Staff', false),
  ('50000000-0000-4000-8000-0000000000a3', '00000000-0000-0000-0000-0000000000a1', 'KITCHEN', 'Kitchen', false),
  ('50000000-0000-4000-8000-0000000000a4', '00000000-0000-0000-0000-0000000000a1', 'CASHIER', 'Cashier', false),
  ('50000000-0000-4000-8000-0000000000b1', '00000000-0000-0000-0000-0000000000b1', 'STAFF', 'Staff', false);

insert into app.role_permissions (role_id, permission_id)
select fixture.role_id, permission.id
from (values
  ('50000000-0000-4000-8000-0000000000a1'::uuid, 'management.admin.access'),
  ('50000000-0000-4000-8000-0000000000a1'::uuid, 'order.view'),
  ('50000000-0000-4000-8000-0000000000a1'::uuid, 'member.view'),
  ('50000000-0000-4000-8000-0000000000a1'::uuid, 'member.invite'),
  ('50000000-0000-4000-8000-0000000000a1'::uuid, 'member.manage'),
  ('50000000-0000-4000-8000-0000000000a1'::uuid, 'role.view'),
  ('50000000-0000-4000-8000-0000000000a1'::uuid, 'role.manage'),
  ('50000000-0000-4000-8000-0000000000a2'::uuid, 'operations.staff.access'),
  ('50000000-0000-4000-8000-0000000000a2'::uuid, 'order.view'),
  ('50000000-0000-4000-8000-0000000000a3'::uuid, 'operations.kitchen.access'),
  ('50000000-0000-4000-8000-0000000000a3'::uuid, 'kitchen.view'),
  ('50000000-0000-4000-8000-0000000000a3'::uuid, 'kitchen.manage'),
  ('50000000-0000-4000-8000-0000000000a3'::uuid, 'order.view'),
  ('50000000-0000-4000-8000-0000000000a4'::uuid, 'operations.cashier.access'),
  ('50000000-0000-4000-8000-0000000000a4'::uuid, 'merchant_payment.view'),
  ('50000000-0000-4000-8000-0000000000a4'::uuid, 'merchant_payment.collect'),
  ('50000000-0000-4000-8000-0000000000a4'::uuid, 'order.view'),
  ('50000000-0000-4000-8000-0000000000b1'::uuid, 'operations.staff.access'),
  ('50000000-0000-4000-8000-0000000000b1'::uuid, 'order.view')
) as fixture(role_id, permission_code)
join app.permissions permission on permission.code = fixture.permission_code;

insert into app.memberships (id, tenant_id, user_id, role_id, branch_id, status)
values
  ('60000000-0000-4000-8000-0000000000a1', '00000000-0000-0000-0000-0000000000a1', '30000000-0000-4000-8000-0000000000a1', '50000000-0000-4000-8000-0000000000a1', null, 'ACTIVE'),
  ('60000000-0000-4000-8000-0000000000a2', '00000000-0000-0000-0000-0000000000a1', '30000000-0000-4000-8000-0000000000a2', '50000000-0000-4000-8000-0000000000a2', '00000000-0000-0000-0000-0000000000a3', 'ACTIVE'),
  ('60000000-0000-4000-8000-0000000000a3', '00000000-0000-0000-0000-0000000000a1', '30000000-0000-4000-8000-0000000000a3', '50000000-0000-4000-8000-0000000000a2', '00000000-0000-0000-0000-0000000000ac', 'ACTIVE'),
  ('60000000-0000-4000-8000-0000000000a4', '00000000-0000-0000-0000-0000000000a1', '30000000-0000-4000-8000-0000000000a4', '50000000-0000-4000-8000-0000000000a2', '00000000-0000-0000-0000-0000000000a3', 'ACTIVE'),
  ('60000000-0000-4000-8000-0000000000a5', '00000000-0000-0000-0000-0000000000a1', '30000000-0000-4000-8000-0000000000a5', '50000000-0000-4000-8000-0000000000a2', '00000000-0000-0000-0000-0000000000a3', 'INVITED'),
  ('60000000-0000-4000-8000-0000000000a6', '00000000-0000-0000-0000-0000000000a1', '30000000-0000-4000-8000-0000000000a6', '50000000-0000-4000-8000-0000000000a2', '00000000-0000-0000-0000-0000000000a3', 'SUSPENDED'),
  ('60000000-0000-4000-8000-0000000000a7', '00000000-0000-0000-0000-0000000000a1', '30000000-0000-4000-8000-0000000000a7', '50000000-0000-4000-8000-0000000000a2', '00000000-0000-0000-0000-0000000000a3', 'REVOKED'),
  ('60000000-0000-4000-8000-0000000000a8', '00000000-0000-0000-0000-0000000000a1', '30000000-0000-4000-8000-0000000000a8', '50000000-0000-4000-8000-0000000000a3', '00000000-0000-0000-0000-0000000000a3', 'ACTIVE'),
  ('60000000-0000-4000-8000-0000000000a9', '00000000-0000-0000-0000-0000000000a1', '30000000-0000-4000-8000-0000000000a9', '50000000-0000-4000-8000-0000000000a4', '00000000-0000-0000-0000-0000000000ac', 'ACTIVE'),
  ('60000000-0000-4000-8000-0000000000aa', '00000000-0000-0000-0000-0000000000a1', '30000000-0000-4000-8000-0000000000aa', '50000000-0000-4000-8000-0000000000a2', '00000000-0000-0000-0000-0000000000a3', 'ACTIVE'),
  ('60000000-0000-4000-8000-0000000000ab', '00000000-0000-0000-0000-0000000000a1', '30000000-0000-4000-8000-0000000000ab', '50000000-0000-4000-8000-0000000000a2', '00000000-0000-0000-0000-0000000000a3', 'ACTIVE'),
  ('60000000-0000-4000-8000-0000000000b1', '00000000-0000-0000-0000-0000000000b1', '30000000-0000-4000-8000-0000000000b1', '50000000-0000-4000-8000-0000000000b1', '00000000-0000-0000-0000-0000000000b3', 'ACTIVE');

-- Synthetic scrypt-v1 vectors only. Password inputs live in test-only fixture code.
insert into private.user_credentials (user_id, password_hash, algorithm, disabled_at)
values
  ('30000000-0000-4000-8000-0000000000a1', 'scrypt-v1$16384$8$1$Zmxvdy1yMDItMDEtc2FsdA==$CCg7szLWrWdPOSDyLiHdC2R0YvjvykbKg9T0LBFLQFA=', 'scrypt-v1', null),
  ('30000000-0000-4000-8000-0000000000a2', 'scrypt-v1$16384$8$1$Zmxvdy1yMDItMDItc2FsdA==$861GD6pNzVHWJkSmhLncchAmO5excSgnpS0fiRO4NVM=', 'scrypt-v1', null),
  ('30000000-0000-4000-8000-0000000000a3', 'scrypt-v1$16384$8$1$Zmxvdy1yMDItMDMtc2FsdA==$Im7ZphqsTSDwOZext7p14DTz69XGLMZ4dyU8tijLUyk=', 'scrypt-v1', null),
  ('30000000-0000-4000-8000-0000000000a4', 'scrypt-v1$16384$8$1$Zmxvdy1yMDItMDktc2FsdA==$fd5EV12NVyykmHTtdP4LSXa81KlpddPj5Smay6RgfE0=', 'scrypt-v1', null),
  ('30000000-0000-4000-8000-0000000000a5', 'scrypt-v1$16384$8$1$Zmxvdy1yMDItMTAtc2FsdA==$9uBG74GmtpjFeTKIJpWTMOWd7aybknPiq9wwsELhCOU=', 'scrypt-v1', null),
  ('30000000-0000-4000-8000-0000000000a6', 'scrypt-v1$16384$8$1$Zmxvdy1yMDItMTEtc2FsdA==$FpZxvnn5DSJ7Aga/Ek8ozyMQEaScpVtPMQwA4cxKkds=', 'scrypt-v1', null),
  ('30000000-0000-4000-8000-0000000000a7', 'scrypt-v1$16384$8$1$Zmxvdy1yMDItMTItc2FsdA==$rOZnGQHhj/XtL2YXMSKrRO3BCqjg9k8OpBWtCLTh0Xg=', 'scrypt-v1', null),
  ('30000000-0000-4000-8000-0000000000a8', 'scrypt-v1$16384$8$1$Zmxvdy1yMDItMDQtc2FsdA==$Gjt6+eYlFeV07WVuJevfkSkjEf3QmW/kOZXZdNKLnJ4=', 'scrypt-v1', null),
  ('30000000-0000-4000-8000-0000000000a9', 'scrypt-v1$16384$8$1$Zmxvdy1yMDItMDUtc2FsdA==$Z3/PtPGTLMsclmFBJLcMyTdQ4qYVAHT3nFWnWkDgeZ4=', 'scrypt-v1', null),
  ('30000000-0000-4000-8000-0000000000aa', 'scrypt-v1$16384$8$1$Zmxvdy1yMDItMDctc2FsdA==$il3nOfRl9XLWhQ7N5FLtrq75ynzU8c4aPN2lVZy18ag=', 'scrypt-v1', '2026-08-22T00:00:00Z'),
  ('30000000-0000-4000-8000-0000000000ad', 'scrypt-v1$16384$8$1$Zmxvdy1yMDItMDgtc2FsdA==$VVsxoU1PQDrdQgSxQVTBOeqU4hjsuzoWrDMERX8nqaY=', 'scrypt-v1', null),
  ('30000000-0000-4000-8000-0000000000b1', 'scrypt-v1$16384$8$1$Zmxvdy1yMDItMDYtc2FsdA==$oIr9j0s9k2SOEZQUE6gGLWJS3z2sphi1+2FTz8wVFq0=', 'scrypt-v1', null);
