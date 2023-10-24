/*
  Warnings:

  - A unique constraint covering the columns `[document_number]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "User_document_number_key" ON "User"("document_number");
