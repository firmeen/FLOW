// AUTO-GENERATED DATABASE TYPE CONTRACT.
// Source of truth: PostgreSQL migrations under /supabase.
// Regenerate with the project db:generate script; do not edit manually.

import type { ColumnType, Generated } from "kysely";

type Timestamp = ColumnType<Date, Date | string, Date | string>;
type Int8 = ColumnType<string, string | number | bigint, string | number | bigint>;

export interface AppOrganizations {
  id: Generated<string>;
  slug: string;
  name: string;
  legal_name: string | null;
  status: string;
  default_currency: string;
  timezone: string;
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
}

export interface AppRestaurants {
  id: Generated<string>;
  tenant_id: string;
  name: string;
  legal_name: string | null;
  slug: string;
  logo_url: string | null;
  currency: string;
  timezone: string;
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
}

export interface FoodflowMenuItems {
  id: Generated<string>;
  tenant_id: string;
  restaurant_id: string;
  category_id: string;
  availability_id: string;
  name: string;
  thai_name: string | null;
  description: string;
  thai_description: string | null;
  image_url: string | null;
  image_key: string | null;
  base_price_minor: Int8;
  currency: string;
  preparation_station: string;
  estimated_preparation_minutes: number;
  status: string;
  vegetarian: boolean;
  display_order: number;
  published_at: Timestamp | null;
  archived_at: Timestamp | null;
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
}

export interface Database {
  "app.organizations": AppOrganizations;
  "app.restaurants": AppRestaurants;
  "foodflow.menu_items": FoodflowMenuItems;
}
