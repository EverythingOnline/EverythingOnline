-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerPhone" TEXT NOT NULL,
    "customerFirstName" TEXT,
    "customerLastName" TEXT,
    "customerEmail" TEXT,
    "deliveryAddress" TEXT,
    "deliveryCity" TEXT,
    "deliveryCounty" TEXT,
    "deliveryNotes" TEXT,
    "shippingMethod" TEXT NOT NULL DEFAULT 'STANDARD',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentStatus" TEXT NOT NULL DEFAULT 'UNPAID',
    "paymentMethod" TEXT NOT NULL DEFAULT 'CASH',
    "paidAt" DATETIME,
    "confirmedBy" TEXT,
    "shippingAddressId" TEXT,
    "subtotal" REAL NOT NULL,
    "deliveryFee" REAL NOT NULL,
    "total" REAL NOT NULL,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_shippingAddressId_fkey" FOREIGN KEY ("shippingAddressId") REFERENCES "Address" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("confirmedBy", "createdAt", "customerPhone", "deliveryFee", "id", "paidAt", "paymentMethod", "paymentStatus", "shippingAddressId", "status", "subtotal", "total", "updatedAt", "userId") SELECT "confirmedBy", "createdAt", "customerPhone", "deliveryFee", "id", "paidAt", "paymentMethod", "paymentStatus", "shippingAddressId", "status", "subtotal", "total", "updatedAt", "userId" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
