/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `MovieNameItem` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "MovieNameItem_name_key" ON "MovieNameItem"("name");
