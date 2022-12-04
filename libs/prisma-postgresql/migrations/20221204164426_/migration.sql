/*
  Warnings:

  - You are about to drop the column `movieId` on the `MovieNameItem` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "MovieNameItem" DROP CONSTRAINT "MovieNameItem_movieId_fkey";

-- AlterTable
ALTER TABLE "MovieNameItem" DROP COLUMN "movieId";

-- CreateTable
CREATE TABLE "_MovieToMovieNameItem" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_MovieToMovieNameItem_AB_unique" ON "_MovieToMovieNameItem"("A", "B");

-- CreateIndex
CREATE INDEX "_MovieToMovieNameItem_B_index" ON "_MovieToMovieNameItem"("B");

-- AddForeignKey
ALTER TABLE "_MovieToMovieNameItem" ADD CONSTRAINT "_MovieToMovieNameItem_A_fkey" FOREIGN KEY ("A") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MovieToMovieNameItem" ADD CONSTRAINT "_MovieToMovieNameItem_B_fkey" FOREIGN KEY ("B") REFERENCES "MovieNameItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
