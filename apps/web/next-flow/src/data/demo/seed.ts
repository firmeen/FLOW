import type {
  AuditEvent,
  Category,
  FoodFlowState,
  KitchenTicket,
  MenuAvailability,
  MenuBadge,
  MenuImageKey,
  MenuItem,
  MenuItemStatus,
  ModifierGroup,
  OpeningHours,
  Order,
  OrderItem,
  Payment,
  ServiceRequest,
  StaffUser,
  Table,
  TableSession,
} from "@/domain";

const RESTAURANT_ID = "restaurant-melbourne-house";
const BRANCH_ID = "branch-melbourne-house-bkk";
const CREATED_AT = "2026-08-10T02:00:00.000Z";
const DEMO_REFERENCE_TIME = new Date("2026-08-10T04:30:00.000Z").getTime();

const at = (minutesAgo: number) =>
  new Date(DEMO_REFERENCE_TIME - minutesAgo * 60_000).toISOString();

const openingHours: OpeningHours[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
].map((day) => ({
  day: day as OpeningHours["day"],
  isClosed: false,
  ranges: [{ opensAt: "08:00", closesAt: day === "SATURDAY" || day === "SUNDAY" ? "22:30" : "22:00" }],
}));

const categories: Category[] = [
  ["cat-drinks", "Signature / Drinks", "\u0e40\u0e04\u0e23\u0e37\u0e48\u0e2d\u0e07\u0e14\u0e37\u0e48\u0e21\u0e0b\u0e34\u0e01\u0e40\u0e19\u0e40\u0e08\u0e2d\u0e23\u0e4c", 1],
  ["cat-salads", "Fresh Organic Salad", "\u0e2a\u0e25\u0e31\u0e14\u0e2d\u0e2d\u0e23\u0e4c\u0e41\u0e01\u0e19\u0e34\u0e01", 2],
  ["cat-snacks", "Snack Menu", "\u0e40\u0e21\u0e19\u0e39\u0e17\u0e32\u0e19\u0e40\u0e25\u0e48\u0e19", 3],
  ["cat-signatures", "Signature Dishes", "\u0e08\u0e32\u0e19\u0e0b\u0e34\u0e01\u0e40\u0e19\u0e40\u0e08\u0e2d\u0e23\u0e4c", 4],
  ["cat-rice", "Rice Bowl", "\u0e02\u0e49\u0e32\u0e27\u0e2b\u0e19\u0e49\u0e32\u0e15\u0e48\u0e32\u0e07 \u0e46", 5],
  ["cat-sushi", "Sushi", "\u0e0b\u0e39\u0e0a\u0e34", 6],
  ["cat-weekend", "Weekend Special", "\u0e40\u0e21\u0e19\u0e39\u0e1e\u0e34\u0e40\u0e28\u0e29\u0e2a\u0e38\u0e14\u0e2a\u0e31\u0e1b\u0e14\u0e32\u0e2b\u0e4c", 7],
].map(([id, name, thaiName, displayOrder]) => ({
  id: String(id),
  restaurantId: RESTAURANT_ID,
  name: String(name),
  thaiName: String(thaiName),
  description: `A curated selection from ${name}.`,
  displayOrder: Number(displayOrder),
  active: true,
  createdAt: CREATED_AT,
  updatedAt: CREATED_AT,
}));

const menuBadges: MenuBadge[] = [
  ["badge-best-selling", "Best Selling", "#B66B3D", "flame"],
  ["badge-must-try", "Must Try", "#315D4A", "sparkles"],
  ["badge-owner-favorite", "Owner's Favorite", "#6F4E37", "heart"],
  ["badge-barista-favorite", "Barista's Favorite", "#855F3B", "coffee"],
  ["badge-new", "New", "#3E6E61", "star"],
  ["badge-chef", "Chef Recommended", "#8B593C", "chef-hat"],
  ["badge-vegetarian", "Vegetarian", "#4F7D57", "leaf"],
].map(([id, name, color, icon]) => ({
  id,
  restaurantId: RESTAURANT_ID,
  name,
  color,
  icon,
  active: true,
  createdAt: CREATED_AT,
  updatedAt: CREATED_AT,
}));

const menuAvailabilities: MenuAvailability[] = [
  {
    id: "availability-always",
    name: "Always available",
    type: "ALWAYS",
    daysOfWeek: [],
    timezone: "Asia/Bangkok",
    active: true,
  },
  {
    id: "availability-weekend",
    name: "Weekend only",
    type: "SCHEDULED",
    daysOfWeek: ["SATURDAY", "SUNDAY"],
    startTime: "08:00",
    endTime: "22:30",
    timezone: "Asia/Bangkok",
    active: true,
  },
];

const modifierGroups: ModifierGroup[] = [
  {
    id: "modifier-milk",
    restaurantId: RESTAURANT_ID,
    name: "Milk Option",
    thaiName: "\u0e15\u0e31\u0e27\u0e40\u0e25\u0e37\u0e2d\u0e01\u0e19\u0e21",
    kind: "MODIFIER",
    required: true,
    minimumSelections: 1,
    maximumSelections: 1,
    active: true,
    displayOrder: 1,
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
    choices: [
      ["choice-milk-regular", "Regular Milk", 0],
      ["choice-milk-low-fat", "Low Fat / Lactose Free", 0],
      ["choice-milk-oat", "Australian Oat Milk", 25],
      ["choice-milk-soya", "Soya Milk", 25],
      ["choice-milk-almond", "Almond Milk", 25],
    ].map(([id, name, priceDelta], index) => ({
      id: String(id),
      name: String(name),
      priceDelta: Number(priceDelta),
      active: true,
      displayOrder: index + 1,
    })),
  },
  {
    id: "modifier-pair-drink",
    restaurantId: RESTAURANT_ID,
    name: "Pair With A Drink",
    thaiName: "\u0e40\u0e1e\u0e34\u0e48\u0e21\u0e40\u0e04\u0e23\u0e37\u0e48\u0e2d\u0e07\u0e14\u0e37\u0e48\u0e21",
    kind: "ADD_ON",
    required: false,
    minimumSelections: 0,
    maximumSelections: 1,
    active: true,
    displayOrder: 2,
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
    choices: [
      ["choice-addon-yuzu", "Premium Yuzu Soda", 79],
      ["choice-addon-lychee", "Lychee Soda", 79],
      ["choice-addon-long-black", "Aussie Long Black Coco", 69],
    ].map(([id, name, priceDelta], index) => ({
      id: String(id),
      name: String(name),
      priceDelta: Number(priceDelta),
      active: true,
      displayOrder: index + 1,
    })),
  },
  {
    id: "modifier-steak-doneness",
    restaurantId: RESTAURANT_ID,
    name: "Steak Doneness",
    thaiName: "\u0e23\u0e30\u0e14\u0e31\u0e1a\u0e04\u0e27\u0e32\u0e21\u0e2a\u0e38\u0e01",
    kind: "MODIFIER",
    required: true,
    minimumSelections: 1,
    maximumSelections: 1,
    active: true,
    displayOrder: 3,
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
    choices: ["Medium Rare", "Medium", "Medium Well", "Well Done"].map((name, index) => ({
      id: `choice-doneness-${index + 1}`,
      name,
      priceDelta: 0,
      active: true,
      displayOrder: index + 1,
    })),
  },
];

interface MenuSeed {
  id: string;
  categoryId: string;
  name: string;
  thaiName?: string;
  description: string;
  price: number;
  imageKey: MenuImageKey;
  status?: MenuItemStatus;
  badgeIds?: string[];
  modifierGroupIds?: string[];
  availabilityId?: string;
  vegetarian?: boolean;
  preparationStation?: string;
  prep?: number;
  displayOrder: number;
}

const makeMenuItem = ({
  id,
  categoryId,
  name,
  thaiName,
  description,
  price,
  imageKey,
  status = "ACTIVE",
  badgeIds = [],
  modifierGroupIds = [],
  availabilityId = "availability-always",
  vegetarian = false,
  preparationStation = "MAIN_KITCHEN",
  prep = 12,
  displayOrder,
}: MenuSeed): MenuItem => ({
  id,
  restaurantId: RESTAURANT_ID,
  categoryId,
  name,
  thaiName,
  description,
  imageKey,
  basePrice: price,
  currency: "THB",
  preparationStation,
  estimatedPreparationMinutes: prep,
  status,
  vegetarian,
  badgeIds: vegetarian
    ? Array.from(new Set([...badgeIds, "badge-vegetarian"]))
    : badgeIds,
  modifierGroupIds,
  availabilityId,
  displayOrder,
  createdAt: CREATED_AT,
  updatedAt: CREATED_AT,
  publishedAt: status === "ACTIVE" || status === "SOLD_OUT" ? CREATED_AT : undefined,
});

const menuItems: MenuItem[] = [
  makeMenuItem({ id: "menu-uji-matcha", categoryId: "cat-drinks", name: "Uji Signature Matcha", thaiName: "\u0e2d\u0e39\u0e08\u0e34 \u0e0b\u0e34\u0e01\u0e40\u0e19\u0e40\u0e08\u0e2d\u0e23\u0e4c \u0e21\u0e31\u0e17\u0e09\u0e30", description: "Ceremonial Uji matcha with a deep, smooth finish.", price: 170, imageKey: "matcha", badgeIds: ["badge-barista-favorite"], modifierGroupIds: ["modifier-milk"], preparationStation: "BAR", prep: 5, displayOrder: 1 }),
  makeMenuItem({ id: "menu-kyoto-matcha", categoryId: "cat-drinks", name: "Kyoto Matcha Latte", thaiName: "\u0e40\u0e01\u0e35\u0e22\u0e27\u0e42\u0e15 \u0e21\u0e31\u0e17\u0e09\u0e30 \u0e25\u0e32\u0e40\u0e15\u0e49", description: "Balanced matcha latte, whisked to order.", price: 140, imageKey: "matcha", modifierGroupIds: ["modifier-milk"], preparationStation: "BAR", prep: 5, displayOrder: 2 }),
  makeMenuItem({ id: "menu-cinnamon-latte", categoryId: "cat-drinks", name: "Hot Cross Cinnamon Latte", description: "Espresso, warm spice and velvety steamed milk.", price: 135, imageKey: "drink", badgeIds: ["badge-new"], modifierGroupIds: ["modifier-milk"], preparationStation: "BAR", prep: 5, displayOrder: 3 }),
  makeMenuItem({ id: "menu-mandarin-coffee", categoryId: "cat-drinks", name: "Melbourne Mandarin Coffee", description: "Bright mandarin over a refreshing coffee tonic.", price: 120, imageKey: "drink", preparationStation: "BAR", prep: 4, displayOrder: 4 }),
  makeMenuItem({ id: "menu-long-black", categoryId: "cat-drinks", name: "Aussie Long Black Coco", description: "A bold long black lifted with coconut.", price: 110, imageKey: "drink", preparationStation: "BAR", prep: 4, displayOrder: 5 }),
  makeMenuItem({ id: "menu-ceylon-scotch", categoryId: "cat-drinks", name: "Ceylon Scotch", description: "Ceylon tea, caramel and citrus served cold.", price: 110, imageKey: "drink", preparationStation: "BAR", prep: 4, displayOrder: 6 }),
  makeMenuItem({ id: "menu-yuzu", categoryId: "cat-drinks", name: "Premium Yuzu Soda", thaiName: "\u0e22\u0e39\u0e0b\u0e38\u0e42\u0e0b\u0e14\u0e32", description: "Japanese yuzu, sparkling water and fresh citrus.", price: 119, imageKey: "yuzu", badgeIds: ["badge-must-try"], preparationStation: "BAR", prep: 3, displayOrder: 7 }),
  makeMenuItem({ id: "menu-lychee", categoryId: "cat-drinks", name: "Lychee Soda", thaiName: "\u0e25\u0e34\u0e49\u0e19\u0e08\u0e35\u0e48\u0e42\u0e0b\u0e14\u0e32", description: "Floral lychee soda with a crisp finish.", price: 119, imageKey: "drink", status: "SOLD_OUT", preparationStation: "BAR", prep: 3, displayOrder: 8 }),

  makeMenuItem({ id: "menu-salmon-salad", categoryId: "cat-salads", name: "Grilled Salmon Salad", thaiName: "\u0e2a\u0e25\u0e31\u0e14\u0e41\u0e0b\u0e25\u0e21\u0e2d\u0e19\u0e22\u0e48\u0e32\u0e07", description: "Flame-grilled salmon, organic leaves and sesame dressing.", price: 199, imageKey: "salmon", badgeIds: ["badge-best-selling"], prep: 12, displayOrder: 1 }),
  makeMenuItem({ id: "menu-tempura-salad", categoryId: "cat-salads", name: "Tempura Salad", description: "Crisp tempura over seasonal organic leaves.", price: 189, imageKey: "salad", prep: 11, displayOrder: 2 }),
  makeMenuItem({ id: "menu-avocado-salad", categoryId: "cat-salads", name: "Goma Avocado Salad", thaiName: "\u0e2a\u0e25\u0e31\u0e14\u0e2d\u0e42\u0e27\u0e04\u0e32\u0e42\u0e14\u0e42\u0e01\u0e21\u0e30", description: "Creamy avocado, greens and roasted sesame dressing.", price: 189, imageKey: "salad", vegetarian: true, preparationStation: "COLD", prep: 7, displayOrder: 3 }),

  makeMenuItem({ id: "menu-tempura-shrimp", categoryId: "cat-snacks", name: "Tempura Shrimp", thaiName: "\u0e01\u0e38\u0e49\u0e07\u0e40\u0e17\u0e21\u0e1b\u0e38\u0e23\u0e30", description: "Light, crisp tiger prawns with house tentsuyu.", price: 149, imageKey: "tempura", badgeIds: ["badge-best-selling"], prep: 10, displayOrder: 1 }),
  makeMenuItem({ id: "menu-karaage", categoryId: "cat-snacks", name: "Chicken Karaage", thaiName: "\u0e44\u0e01\u0e48\u0e04\u0e32\u0e23\u0e32\u0e2d\u0e32\u0e40\u0e01\u0e30", description: "Juicy marinated chicken with a shattering crust.", price: 139, imageKey: "karaage", badgeIds: ["badge-best-selling"], prep: 10, displayOrder: 2 }),
  makeMenuItem({ id: "menu-takoyaki", categoryId: "cat-snacks", name: "Takoyaki - 8 Pieces", description: "Osaka-style octopus bites with bonito and nori.", price: 139, imageKey: "tempura", prep: 9, displayOrder: 3 }),
  makeMenuItem({ id: "menu-edamame", categoryId: "cat-snacks", name: "Edamame", description: "Steamed young soybeans with sea salt.", price: 89, imageKey: "salad", vegetarian: true, prep: 5, displayOrder: 4 }),
  makeMenuItem({ id: "menu-jellyfish", categoryId: "cat-snacks", name: "Sesame Jellyfish", description: "Chilled jellyfish with nutty sesame dressing.", price: 70, imageKey: "salad", preparationStation: "COLD", prep: 5, displayOrder: 5 }),
  makeMenuItem({ id: "menu-tako-wasabi", categoryId: "cat-snacks", name: "Tako Wasabi", description: "Seasoned octopus with sharp fresh wasabi.", price: 70, imageKey: "sushi", preparationStation: "COLD", prep: 4, displayOrder: 6 }),
  makeMenuItem({ id: "menu-seaweed", categoryId: "cat-snacks", name: "Seaweed", description: "Seasoned wakame salad.", price: 50, imageKey: "salad", vegetarian: true, preparationStation: "COLD", prep: 3, displayOrder: 7 }),
  makeMenuItem({ id: "menu-kimchi", categoryId: "cat-snacks", name: "Kimchi", description: "House fermented napa cabbage.", price: 50, imageKey: "salad", vegetarian: true, preparationStation: "COLD", prep: 3, displayOrder: 8 }),

  makeMenuItem({ id: "menu-steak-jaew", categoryId: "cat-signatures", name: "Aussie Steak with Spicy Jaew Sauce", thaiName: "\u0e2a\u0e40\u0e15\u0e4a\u0e01\u0e2d\u0e2d\u0e2a\u0e0b\u0e35\u0e48\u0e0b\u0e2d\u0e2a\u0e41\u0e08\u0e48\u0e27", description: "Australian beef grilled over high heat with bright jaew sauce.", price: 349, imageKey: "gyudon", badgeIds: ["badge-best-selling"], modifierGroupIds: ["modifier-steak-doneness", "modifier-pair-drink"], prep: 18, displayOrder: 1 }),
  makeMenuItem({ id: "menu-gyudon", categoryId: "cat-signatures", name: "Melbourne Gyudon Rice", thaiName: "\u0e02\u0e49\u0e32\u0e27\u0e2b\u0e19\u0e49\u0e32\u0e40\u0e19\u0e37\u0e49\u0e2d\u0e2d\u0e2d\u0e2a\u0e40\u0e15\u0e23\u0e40\u0e25\u0e35\u0e22", description: "Slow-cooked Australian tender beef, sweet onions and warm rice.", price: 169, imageKey: "gyudon", badgeIds: ["badge-best-selling"], modifierGroupIds: ["modifier-pair-drink"], prep: 12, displayOrder: 2 }),
  makeMenuItem({ id: "menu-engawa", categoryId: "cat-signatures", name: "Engawa Indulgence", description: "Torched engawa over seasoned rice with house glaze.", price: 269, imageKey: "sushi", badgeIds: ["badge-owner-favorite"], prep: 14, displayOrder: 3 }),
  makeMenuItem({ id: "menu-unagi-kabayaki", categoryId: "cat-signatures", name: "Unagi Kabayaki", description: "Glazed grilled eel with sansho and Japanese rice.", price: 269, imageKey: "rice", badgeIds: ["badge-must-try"], prep: 14, displayOrder: 4 }),

  makeMenuItem({ id: "menu-tuna-don", categoryId: "cat-rice", name: "Tuna Donburi", description: "Fresh tuna, seasoned rice and house shoyu.", price: 269, imageKey: "rice", preparationStation: "COLD", prep: 10, displayOrder: 1 }),
  makeMenuItem({ id: "menu-salmon-bliss", categoryId: "cat-rice", name: "Grilled Salmon Bliss", description: "Grilled salmon, onsen egg and sesame rice.", price: 219, imageKey: "salmon", prep: 13, displayOrder: 2 }),
  makeMenuItem({ id: "menu-saba", categoryId: "cat-rice", name: "Grilled Saba Teriyaki", description: "Norwegian mackerel with glossy teriyaki sauce.", price: 179, imageKey: "rice", prep: 13, displayOrder: 3 }),
  makeMenuItem({ id: "menu-tempura-don", categoryId: "cat-rice", name: "Tempura Donburi", description: "Prawn and vegetable tempura over Japanese rice.", price: 159, imageKey: "tempura", prep: 12, displayOrder: 4 }),
  makeMenuItem({ id: "menu-karaage-don", categoryId: "cat-rice", name: "Crispy Chicken Karaage Don", description: "Crispy karaage, cabbage and spicy mayo over rice.", price: 149, imageKey: "karaage", prep: 11, displayOrder: 5 }),
  makeMenuItem({ id: "menu-tofu-don", categoryId: "cat-rice", name: "Tofu Teriyaki Don", thaiName: "\u0e02\u0e49\u0e32\u0e27\u0e2b\u0e19\u0e49\u0e32\u0e40\u0e15\u0e49\u0e32\u0e2b\u0e39\u0e49\u0e40\u0e17\u0e2d\u0e23\u0e34\u0e22\u0e32\u0e01\u0e34", description: "Crisp tofu and seasonal vegetables with teriyaki.", price: 129, imageKey: "rice", vegetarian: true, prep: 10, displayOrder: 6 }),

  makeMenuItem({ id: "menu-nori-platter", categoryId: "cat-sushi", name: "Nori Nomad Signature Platter", description: "A premium chef selection for sharing.", price: 489, imageKey: "sushi", badgeIds: ["badge-chef"], preparationStation: "SUSHI", prep: 18, displayOrder: 1 }),
  makeMenuItem({ id: "menu-harbour-platter", categoryId: "cat-sushi", name: "Harbour Lane Platter", description: "A balanced selection of rolls and nigiri.", price: 219, imageKey: "sushi", preparationStation: "SUSHI", prep: 14, displayOrder: 2 }),
  makeMenuItem({ id: "menu-unagi-avocado", categoryId: "cat-sushi", name: "Unagi Avocado", description: "Glazed eel and creamy avocado roll.", price: 179, imageKey: "sushi", preparationStation: "SUSHI", prep: 12, displayOrder: 3 }),
  makeMenuItem({ id: "menu-tempura-maki", categoryId: "cat-sushi", name: "Tempura Maki", description: "Crunchy prawn maki with house sauce.", price: 169, imageKey: "sushi", preparationStation: "SUSHI", prep: 12, displayOrder: 4 }),
  makeMenuItem({ id: "menu-california", categoryId: "cat-sushi", name: "California Roll", description: "Crab stick, avocado and tobiko roll.", price: 129, imageKey: "sushi", preparationStation: "SUSHI", prep: 10, displayOrder: 5 }),
  makeMenuItem({ id: "menu-uni", categoryId: "cat-sushi", name: "Uni Sushi", description: "Premium sea urchin over hand-shaped rice.", price: 229, imageKey: "sushi", preparationStation: "SUSHI", prep: 8, displayOrder: 6 }),

  makeMenuItem({ id: "menu-beef-ramen", categoryId: "cat-weekend", name: "Tokyo Beef Ramen", description: "Rich beef broth, springy noodles and slow-cooked beef.", price: 199, imageKey: "gyudon", badgeIds: ["badge-new"], availabilityId: "availability-weekend", prep: 15, displayOrder: 1 }),
  makeMenuItem({ id: "menu-ebi-udon", categoryId: "cat-weekend", name: "Ebi Tempura Udon", description: "Dashi udon with crisp prawn tempura.", price: 189, imageKey: "tempura", availabilityId: "availability-weekend", prep: 14, displayOrder: 2 }),
  makeMenuItem({ id: "menu-karaage-udon", categoryId: "cat-weekend", name: "Osaka Karaage Udon", description: "Comforting dashi udon topped with karaage.", price: 179, imageKey: "karaage", availabilityId: "availability-weekend", prep: 14, displayOrder: 3 }),
];

const makeOrderItem = (
  id: string,
  menuItemId: string,
  menuItemName: string,
  quantity: number,
  unitPrice: number,
  specialRequest?: string,
): OrderItem => ({
  id,
  menuItemId,
  menuItemName,
  quantity,
  unitPrice,
  modifiers: [],
  specialRequest,
  lineTotal: quantity * unitPrice,
});

const orders: Order[] = [
  {
    id: "order-1039",
    number: "FF-1039",
    restaurantId: RESTAURANT_ID,
    branchId: BRANCH_ID,
    tableId: "table-t01",
    tableSessionId: "session-paid-001",
    status: "PAID",
    customerStatus: "SERVED",
    items: [
      makeOrderItem("oi-1039-1", "menu-steak-jaew", "Aussie Steak with Spicy Jaew Sauce", 2, 349),
      makeOrderItem("oi-1039-2", "menu-yuzu", "Premium Yuzu Soda", 2, 119),
    ],
    subtotal: 936,
    currency: "THB",
    submissionKey: "seed-1039",
    submittedAt: at(145),
    acceptedAt: at(143),
    preparingAt: at(140),
    readyAt: at(125),
    servedAt: at(122),
    paidAt: at(72),
    modifiedByStaff: false,
  },
  {
    id: "order-1040",
    number: "FF-1040",
    restaurantId: RESTAURANT_ID,
    branchId: BRANCH_ID,
    tableId: "table-t02",
    tableSessionId: "session-t02",
    status: "SERVED",
    customerStatus: "SERVED",
    items: [
      makeOrderItem("oi-1040-1", "menu-salmon-salad", "Grilled Salmon Salad", 1, 199),
      makeOrderItem("oi-1040-2", "menu-yuzu", "Premium Yuzu Soda", 1, 119),
    ],
    subtotal: 318,
    currency: "THB",
    submissionKey: "seed-1040",
    submittedAt: at(52),
    acceptedAt: at(50),
    preparingAt: at(48),
    readyAt: at(36),
    servedAt: at(34),
    modifiedByStaff: false,
  },
  {
    id: "order-1041",
    number: "FF-1041",
    restaurantId: RESTAURANT_ID,
    branchId: BRANCH_ID,
    tableId: "table-t02",
    tableSessionId: "session-t02",
    status: "PENDING_CONFIRMATION",
    customerStatus: "SENT",
    items: [
      makeOrderItem("oi-1041-1", "menu-tempura-shrimp", "Tempura Shrimp", 2, 149, "No mayonnaise"),
      makeOrderItem("oi-1041-2", "menu-long-black", "Aussie Long Black Coco", 1, 110),
    ],
    subtotal: 408,
    currency: "THB",
    customerNote: "Please bring an extra sharing plate.",
    submissionKey: "seed-1041",
    submittedAt: at(4),
    modifiedByStaff: false,
  },
  {
    id: "order-1042",
    number: "FF-1042",
    restaurantId: RESTAURANT_ID,
    branchId: BRANCH_ID,
    tableId: "table-t03",
    tableSessionId: "session-t03",
    status: "PREPARING",
    customerStatus: "PREPARING",
    items: [
      makeOrderItem("oi-1042-1", "menu-gyudon", "Melbourne Gyudon Rice", 2, 169, "One bowl with no onion"),
      makeOrderItem("oi-1042-2", "menu-yuzu", "Premium Yuzu Soda", 1, 119),
    ],
    subtotal: 457,
    currency: "THB",
    submissionKey: "seed-1042",
    submittedAt: at(15),
    acceptedAt: at(13),
    preparingAt: at(10),
    modifiedByStaff: false,
  },
  {
    id: "order-1043",
    number: "FF-1043",
    restaurantId: RESTAURANT_ID,
    branchId: BRANCH_ID,
    tableId: "table-t04",
    tableSessionId: "session-t04",
    status: "PAYMENT_PENDING",
    customerStatus: "SERVED",
    items: [
      makeOrderItem("oi-1043-1", "menu-unagi-kabayaki", "Unagi Kabayaki", 1, 269),
      makeOrderItem("oi-1043-2", "menu-kyoto-matcha", "Kyoto Matcha Latte", 2, 140),
    ],
    subtotal: 549,
    currency: "THB",
    submissionKey: "seed-1043",
    submittedAt: at(65),
    acceptedAt: at(63),
    preparingAt: at(61),
    readyAt: at(47),
    servedAt: at(44),
    modifiedByStaff: false,
  },
  {
    id: "order-1044",
    number: "FF-1044",
    restaurantId: RESTAURANT_ID,
    branchId: BRANCH_ID,
    tableId: "table-t05",
    tableSessionId: "session-t05",
    status: "READY",
    customerStatus: "COMING_TO_TABLE",
    items: [
      makeOrderItem("oi-1044-1", "menu-karaage", "Chicken Karaage", 1, 139, "Sauce on the side"),
      makeOrderItem("oi-1044-2", "menu-tofu-don", "Tofu Teriyaki Don", 1, 129),
    ],
    subtotal: 268,
    currency: "THB",
    submissionKey: "seed-1044",
    submittedAt: at(19),
    acceptedAt: at(18),
    preparingAt: at(16),
    readyAt: at(2),
    modifiedByStaff: false,
  },
];

const tables: Table[] = Array.from({ length: 12 }, (_, index) => {
  const number = index + 1;
  const code = `T${String(number).padStart(2, "0")}`;
  const id = `table-${code.toLowerCase()}`;
  const active: Record<string, Pick<Table, "status" | "currentSessionId">> = {
    "table-t02": { status: "WAITING", currentSessionId: "session-t02" },
    "table-t03": { status: "PREPARING", currentSessionId: "session-t03" },
    "table-t04": { status: "BILL_REQUESTED", currentSessionId: "session-t04" },
    "table-t05": { status: "READY", currentSessionId: "session-t05" },
  };
  return {
    id,
    branchId: BRANCH_ID,
    code,
    label: `Table ${String(number).padStart(2, "0")}`,
    seats: number % 3 === 0 ? 6 : number % 2 === 0 ? 4 : 2,
    status: active[id]?.status ?? "AVAILABLE",
    currentSessionId: active[id]?.currentSessionId,
    qrCode: `/r/demo/table/${code}`,
    displayOrder: number,
    active: true,
  };
});

const tableSessions: TableSession[] = [
  {
    id: "session-paid-001",
    branchId: BRANCH_ID,
    tableId: "table-t01",
    sessionNumber: "S-20260810-001",
    status: "CLOSED",
    guestCount: 2,
    openedAt: at(150),
    closedAt: at(72),
    orderIds: ["order-1039"],
    paymentIds: ["payment-001"],
    customerToken: "closed-t01",
  },
  {
    id: "session-t02",
    branchId: BRANCH_ID,
    tableId: "table-t02",
    sessionNumber: "S-20260810-002",
    status: "ACTIVE",
    guestCount: 3,
    openedAt: at(58),
    orderIds: ["order-1040", "order-1041"],
    paymentIds: [],
    customerToken: "demo-t02",
  },
  {
    id: "session-t03",
    branchId: BRANCH_ID,
    tableId: "table-t03",
    sessionNumber: "S-20260810-003",
    status: "ACTIVE",
    guestCount: 2,
    openedAt: at(22),
    orderIds: ["order-1042"],
    paymentIds: [],
    customerToken: "demo-t03",
  },
  {
    id: "session-t04",
    branchId: BRANCH_ID,
    tableId: "table-t04",
    sessionNumber: "S-20260810-004",
    status: "BILL_REQUESTED",
    guestCount: 2,
    openedAt: at(72),
    orderIds: ["order-1043"],
    paymentIds: [],
    customerToken: "demo-t04",
  },
  {
    id: "session-t05",
    branchId: BRANCH_ID,
    tableId: "table-t05",
    sessionNumber: "S-20260810-005",
    status: "ACTIVE",
    guestCount: 2,
    openedAt: at(25),
    orderIds: ["order-1044"],
    paymentIds: [],
    customerToken: "demo-t05",
  },
];

const kitchenTickets: KitchenTicket[] = [
  {
    id: "ticket-1042",
    orderId: "order-1042",
    branchId: BRANCH_ID,
    tableId: "table-t03",
    tableSessionId: "session-t03",
    orderNumber: "FF-1042",
    status: "PREPARING",
    station: "MAIN_KITCHEN",
    items: [
      { id: "kti-1042-1", orderItemId: "oi-1042-1", menuItemId: "menu-gyudon", menuItemName: "Melbourne Gyudon Rice", quantity: 2, modifiers: [], specialRequest: "One bowl with no onion" },
      { id: "kti-1042-2", orderItemId: "oi-1042-2", menuItemId: "menu-yuzu", menuItemName: "Premium Yuzu Soda", quantity: 1, modifiers: [] },
    ],
    createdAt: at(13),
    startedAt: at(10),
    remakeCount: 0,
  },
  {
    id: "ticket-1044",
    orderId: "order-1044",
    branchId: BRANCH_ID,
    tableId: "table-t05",
    tableSessionId: "session-t05",
    orderNumber: "FF-1044",
    status: "READY",
    station: "MAIN_KITCHEN",
    items: [
      { id: "kti-1044-1", orderItemId: "oi-1044-1", menuItemId: "menu-karaage", menuItemName: "Chicken Karaage", quantity: 1, modifiers: [], specialRequest: "Sauce on the side" },
      { id: "kti-1044-2", orderItemId: "oi-1044-2", menuItemId: "menu-tofu-don", menuItemName: "Tofu Teriyaki Don", quantity: 1, modifiers: [] },
    ],
    createdAt: at(18),
    startedAt: at(16),
    readyAt: at(2),
    remakeCount: 0,
  },
];

const serviceRequests: ServiceRequest[] = [
  {
    id: "service-bill-t04",
    branchId: BRANCH_ID,
    tableId: "table-t04",
    tableSessionId: "session-t04",
    type: "REQUEST_BILL",
    status: "OPEN",
    priority: "HIGH",
    requestedAt: at(3),
  },
  {
    id: "service-staff-t03",
    branchId: BRANCH_ID,
    tableId: "table-t03",
    tableSessionId: "session-t03",
    type: "CALL_STAFF",
    status: "OPEN",
    note: "Could we have two glasses of water?",
    priority: "NORMAL",
    requestedAt: at(1),
  },
];

const payments: Payment[] = [
  {
    id: "payment-001",
    reference: "PAY-0001",
    restaurantId: RESTAURANT_ID,
    branchId: BRANCH_ID,
    tableId: "table-t01",
    tableSessionId: "session-paid-001",
    orderIds: ["order-1039"],
    method: "THAI_QR",
    status: "RECORDED",
    currency: "THB",
    subtotal: 936,
    discount: { type: "NONE", value: 0, amount: 0 },
    serviceChargeEnabled: false,
    serviceChargePercent: 0,
    serviceChargeAmount: 0,
    vatEnabled: true,
    vatPercent: 7,
    vatAmount: 65.52,
    total: 1001.52,
    recordedAt: at(72),
    recordedBy: "staff-cashier",
  },
];

const staffUsers: StaffUser[] = [
  { id: "staff-owner", branchId: BRANCH_ID, name: "Maya Tan", initials: "MT", role: "OWNER", active: true, createdAt: CREATED_AT },
  { id: "staff-manager", branchId: BRANCH_ID, name: "Narin Chai", initials: "NC", role: "MANAGER", active: true, createdAt: CREATED_AT },
  { id: "staff-floor", branchId: BRANCH_ID, name: "Ploy S.", initials: "PS", role: "STAFF", active: true, createdAt: CREATED_AT },
  { id: "staff-kitchen", branchId: BRANCH_ID, name: "Chef Beam", initials: "CB", role: "KITCHEN", active: true, createdAt: CREATED_AT },
  { id: "staff-cashier", branchId: BRANCH_ID, name: "Fern K.", initials: "FK", role: "CASHIER", active: true, createdAt: CREATED_AT },
];

const auditEvents: AuditEvent[] = [
  { id: "audit-001", restaurantId: RESTAURANT_ID, branchId: BRANCH_ID, actorId: "staff-cashier", actorName: "Fern K.", action: "PAYMENT_RECORDED", entityType: "PAYMENT", entityId: "payment-001", summary: "Recorded THAI QR payment for Table 01", timestamp: at(72) },
  { id: "audit-002", restaurantId: RESTAURANT_ID, branchId: BRANCH_ID, actorId: "staff-cashier", actorName: "Fern K.", action: "TABLE_CLOSED", entityType: "TABLE_SESSION", entityId: "session-paid-001", summary: "Closed Table 01 session", timestamp: at(72) },
  { id: "audit-003", restaurantId: RESTAURANT_ID, branchId: BRANCH_ID, actorId: "customer", actorName: "Table 02 guest", action: "ORDER_CREATED", entityType: "ORDER", entityId: "order-1041", summary: "Order FF-1041 sent from Table 02", timestamp: at(4) },
  { id: "audit-004", restaurantId: RESTAURANT_ID, branchId: BRANCH_ID, actorId: "staff-kitchen", actorName: "Chef Beam", action: "KITCHEN_STARTED", entityType: "KITCHEN_TICKET", entityId: "ticket-1042", summary: "Kitchen started order FF-1042", timestamp: at(10) },
  { id: "audit-005", restaurantId: RESTAURANT_ID, branchId: BRANCH_ID, actorId: "staff-kitchen", actorName: "Chef Beam", action: "KITCHEN_READY", entityType: "KITCHEN_TICKET", entityId: "ticket-1044", summary: "Order FF-1044 is ready for Table 05", timestamp: at(2) },
  { id: "audit-006", restaurantId: RESTAURANT_ID, branchId: BRANCH_ID, actorId: "customer", actorName: "Table 04 guest", action: "BILL_REQUESTED", entityType: "SERVICE_REQUEST", entityId: "service-bill-t04", summary: "Table 04 requested the bill", timestamp: at(3) },
  { id: "audit-007", restaurantId: RESTAURANT_ID, branchId: BRANCH_ID, actorId: "customer", actorName: "Table 03 guest", action: "SERVICE_REQUESTED", entityType: "SERVICE_REQUEST", entityId: "service-staff-t03", summary: "Table 03 called staff", timestamp: at(1) },
  { id: "audit-008", restaurantId: RESTAURANT_ID, branchId: BRANCH_ID, actorId: "staff-manager", actorName: "Narin Chai", action: "MENU_SOLD_OUT", entityType: "MENU_ITEM", entityId: "menu-lychee", summary: "Lychee Soda marked sold out", reason: "Awaiting lychee delivery", timestamp: at(20) },
];

const demoState: FoodFlowState = {
  schemaVersion: 1,
  lastUpdatedAt: at(0),
  activeRole: "CUSTOMER",
  restaurant: {
    id: RESTAURANT_ID,
    name: "Melbourne House",
    legalName: "Melbourne House Bangkok Co., Ltd.",
    slug: "demo",
    currency: "THB",
    timezone: "Asia/Bangkok",
    branchIds: [BRANCH_ID],
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
  },
  branches: [
    {
      id: BRANCH_ID,
      restaurantId: RESTAURANT_ID,
      name: "Melbourne House - Ari",
      code: "MH-ARI",
      address: {
        line1: "24 Soi Ari 4",
        district: "Phaya Thai",
        city: "Bangkok",
        postalCode: "10400",
        countryCode: "TH",
      },
      phone: "+66 2 555 0142",
      email: "hello@melbournehouse.demo",
      isOpen: true,
      openingHours,
      tableIds: tables.map((table) => table.id),
      createdAt: CREATED_AT,
      updatedAt: CREATED_AT,
    },
  ],
  tables,
  tableSessions,
  categories,
  menuItems,
  menuBadges,
  modifierGroups,
  menuAvailabilities,
  orders,
  kitchenTickets,
  serviceRequests,
  payments,
  staffUsers,
  auditEvents,
  settings: {
    id: "settings-melbourne-house",
    restaurantId: RESTAURANT_ID,
    branchId: BRANCH_ID,
    restaurantName: "Melbourne House",
    currency: "THB",
    timezone: "Asia/Bangkok",
    serviceChargeEnabled: false,
    serviceChargePercent: 10,
    vatEnabled: true,
    vatPercent: 7,
    defaultPreparationMinutes: 12,
    openingHours,
    updatedAt: CREATED_AT,
  },
  carts: {},
};

const shiftedTimestamp = (value: string, offsetMs: number) =>
  new Date(new Date(value).getTime() + offsetMs).toISOString();

const shiftedOptionalTimestamp = (
  value: string | undefined,
  offsetMs: number,
) => (value ? shiftedTimestamp(value, offsetMs) : undefined);

const bangkokDateKey = (value: string) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));
  const part = (type: "year" | "month" | "day") =>
    parts.find((candidate) => candidate.type === type)?.value ?? "";
  return `${part("year")}${part("month")}${part("day")}`;
};

const rebaseOperationalTimestamps = (
  state: FoodFlowState,
  referenceDate: Date,
): FoodFlowState => {
  const offsetMs = referenceDate.getTime() - DEMO_REFERENCE_TIME;
  return {
    ...state,
    lastUpdatedAt: shiftedTimestamp(state.lastUpdatedAt, offsetMs),
    orders: state.orders.map((order) => ({
      ...order,
      submittedAt: shiftedTimestamp(order.submittedAt, offsetMs),
      acceptedAt: shiftedOptionalTimestamp(order.acceptedAt, offsetMs),
      preparingAt: shiftedOptionalTimestamp(order.preparingAt, offsetMs),
      readyAt: shiftedOptionalTimestamp(order.readyAt, offsetMs),
      servedAt: shiftedOptionalTimestamp(order.servedAt, offsetMs),
      paidAt: shiftedOptionalTimestamp(order.paidAt, offsetMs),
      closedAt: shiftedOptionalTimestamp(order.closedAt, offsetMs),
      rejectedAt: shiftedOptionalTimestamp(order.rejectedAt, offsetMs),
    })),
    tableSessions: state.tableSessions.map((session) => {
      const openedAt = shiftedTimestamp(session.openedAt, offsetMs);
      return {
        ...session,
        sessionNumber: session.sessionNumber.replace(
          /^S-\d{8}-/,
          `S-${bangkokDateKey(openedAt)}-`,
        ),
        openedAt,
        closedAt: shiftedOptionalTimestamp(session.closedAt, offsetMs),
      };
    }),
    kitchenTickets: state.kitchenTickets.map((ticket) => ({
      ...ticket,
      createdAt: shiftedTimestamp(ticket.createdAt, offsetMs),
      startedAt: shiftedOptionalTimestamp(ticket.startedAt, offsetMs),
      readyAt: shiftedOptionalTimestamp(ticket.readyAt, offsetMs),
      servedAt: shiftedOptionalTimestamp(ticket.servedAt, offsetMs),
    })),
    serviceRequests: state.serviceRequests.map((request) => ({
      ...request,
      requestedAt: shiftedTimestamp(request.requestedAt, offsetMs),
      acknowledgedAt: shiftedOptionalTimestamp(
        request.acknowledgedAt,
        offsetMs,
      ),
      resolvedAt: shiftedOptionalTimestamp(request.resolvedAt, offsetMs),
    })),
    payments: state.payments.map((payment) => ({
      ...payment,
      recordedAt: shiftedTimestamp(payment.recordedAt, offsetMs),
      voidedAt: shiftedOptionalTimestamp(payment.voidedAt, offsetMs),
    })),
    auditEvents: state.auditEvents.map((event) => ({
      ...event,
      timestamp: shiftedTimestamp(event.timestamp, offsetMs),
    })),
  };
};

export const createDemoState = (
  referenceDate = new Date(),
): FoodFlowState => {
  const cloned = JSON.parse(JSON.stringify(demoState)) as FoodFlowState;
  return rebaseOperationalTimestamps(cloned, referenceDate);
};

export const demoIds = {
  restaurantId: RESTAURANT_ID,
  branchId: BRANCH_ID,
  customerTableId: "table-t05",
  customerTableCode: "T05",
} as const;
