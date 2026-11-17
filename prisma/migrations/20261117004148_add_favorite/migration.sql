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
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "quote" TEXT,
    "nickname" TEXT,
    "currentPage" INTEGER,
    "totalPages" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    "shelfId" INTEGER NOT NULL DEFAULT 1,
    "startedAt" DATETIME,
    "finishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Book" ("author", "coverUrl", "createdAt", "currentPage", "finishedAt", "genre", "id", "nickname", "notes", "order", "quote", "rating", "shelfId", "startedAt", "status", "title", "totalPages") SELECT "author", "coverUrl", "createdAt", "currentPage", "finishedAt", "genre", "id", "nickname", "notes", "order", "quote", "rating", "shelfId", "startedAt", "status", "title", "totalPages" FROM "Book";
DROP TABLE "Book";
ALTER TABLE "new_Book" RENAME TO "Book";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
