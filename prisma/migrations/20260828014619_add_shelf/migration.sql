-- CreateTable
CREATE TABLE "Shelf" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Book" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "coverUrl" TEXT,
    "genre" TEXT,
    "status" TEXT NOT NULL DEFAULT 'wishlist',
    "rating" INTEGER,
    "notes" TEXT,
    "nickname" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "shelfId" INTEGER NOT NULL DEFAULT 1,
    "startedAt" DATETIME,
    "finishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Book" ("author", "coverUrl", "createdAt", "finishedAt", "genre", "id", "nickname", "notes", "order", "rating", "startedAt", "status", "title") SELECT "author", "coverUrl", "createdAt", "finishedAt", "genre", "id", "nickname", "notes", "order", "rating", "startedAt", "status", "title" FROM "Book";
DROP TABLE "Book";
ALTER TABLE "new_Book" RENAME TO "Book";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
