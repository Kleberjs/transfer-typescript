/*
  Warnings:

  - You are about to drop the column `bank_code` on the `Wallet` table. All the data in the column will be lost.
  - You are about to drop the column `can_receive` on the `Wallet` table. All the data in the column will be lost.
  - You are about to drop the column `can_transfer` on the `Wallet` table. All the data in the column will be lost.
  - You are about to drop the column `account_source` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `account_target` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `banck_code_target` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `bank_code_source` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `branch_source` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `branch_target` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `user_source` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `user_target` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `bankCode` to the `Wallet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accountSource` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accountTarget` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bankCodeSource` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bankCodeTarget` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `branchSource` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `branchTarget` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userSource` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userTarget` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Wallet" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "amount" REAL NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'commons',
    "canTransfer" BOOLEAN NOT NULL DEFAULT true,
    "canReceive" BOOLEAN NOT NULL DEFAULT true,
    "bankCode" INTEGER NOT NULL,
    "branch" INTEGER NOT NULL,
    "account" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Wallet" ("account", "amount", "branch", "created_at", "id", "type", "updated_at", "userId") SELECT "account", "amount", "branch", "created_at", "id", "type", "updated_at", "userId" FROM "Wallet";
DROP TABLE "Wallet";
ALTER TABLE "new_Wallet" RENAME TO "Wallet";
CREATE UNIQUE INDEX "Wallet_userId_key" ON "Wallet"("userId");
CREATE TABLE "new_Transaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userSource" TEXT NOT NULL,
    "userTarget" TEXT NOT NULL,
    "bankCodeSource" INTEGER NOT NULL,
    "bankCodeTarget" INTEGER NOT NULL,
    "branchSource" INTEGER NOT NULL,
    "branchTarget" INTEGER NOT NULL,
    "accountSource" INTEGER NOT NULL,
    "accountTarget" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_Transaction" ("created_at", "id", "updated_at") SELECT "created_at", "id", "updated_at" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
