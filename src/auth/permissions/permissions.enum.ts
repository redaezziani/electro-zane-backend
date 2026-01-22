export enum Permission {
  // Product permissions
  PRODUCT_CREATE = 'product:create',
  PRODUCT_READ = 'product:read',
  PRODUCT_UPDATE = 'product:update',
  PRODUCT_DELETE = 'product:delete',

  // Category permissions
  CATEGORY_CREATE = 'category:create',
  CATEGORY_READ = 'category:read',
  CATEGORY_UPDATE = 'category:update',
  CATEGORY_DELETE = 'category:delete',

  // Order permissions
  ORDER_CREATE = 'order:create',
  ORDER_READ = 'order:read',
  ORDER_READ_ALL = 'order:read_all', // Read all orders vs own orders
  ORDER_UPDATE = 'order:update',
  ORDER_DELETE = 'order:delete',
  ORDER_CANCEL = 'order:cancel',
  ORDER_CONFIRM = 'order:confirm',

  // User management permissions
  USER_CREATE = 'user:create',
  USER_READ = 'user:read',
  USER_READ_ALL = 'user:read_all', // Read all users
  USER_UPDATE = 'user:update',
  USER_UPDATE_ROLE = 'user:update_role', // Special permission to update roles
  USER_DELETE = 'user:delete',
  USER_TOGGLE_STATUS = 'user:toggle_status',
  USER_MANAGE_FROM_USERS = 'user:manage_from_users', // Manage users from Users page

  // Payment permissions
  PAYMENT_CREATE = 'payment:create',
  PAYMENT_READ = 'payment:read',
  PAYMENT_PROCESS = 'payment:process',

  // Inventory permissions
  INVENTORY_READ = 'inventory:read',
  INVENTORY_UPDATE = 'inventory:update',
  INVENTORY_ADJUST = 'inventory:adjust',

  // Analytics permissions
  ANALYTICS_READ = 'analytics:read',
  ANALYTICS_EXPORT = 'analytics:export',

  // Settings permissions
  SETTINGS_READ = 'settings:read',
  SETTINGS_UPDATE = 'settings:update',

  // Review permissions
  REVIEW_CREATE = 'review:create',
  REVIEW_READ = 'review:read',
  REVIEW_APPROVE = 'review:approve',
  REVIEW_DELETE = 'review:delete',

  // Lot permissions
  LOT_CREATE = 'lot:create',
  LOT_READ = 'lot:read',
  LOT_UPDATE = 'lot:update',
  LOT_DELETE = 'lot:delete',

  // Lot Detail permissions
  LOT_DETAIL_CREATE = 'lot_detail:create',
  LOT_DETAIL_READ = 'lot_detail:read',
  LOT_DETAIL_UPDATE = 'lot_detail:update',
  LOT_DETAIL_DELETE = 'lot_detail:delete',

  // Lot Arrival permissions
  LOT_ARRIVAL_CREATE = 'lot_arrival:create',
  LOT_ARRIVAL_READ = 'lot_arrival:read',
  LOT_ARRIVAL_UPDATE = 'lot_arrival:update',
  LOT_ARRIVAL_VERIFY = 'lot_arrival:verify',
  LOT_ARRIVAL_DELETE = 'lot_arrival:delete',
}
