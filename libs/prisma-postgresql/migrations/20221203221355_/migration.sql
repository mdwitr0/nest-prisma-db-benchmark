/*
 Warnings:
 - You are about to drop the column `movieExternalIdId` on the `Movie` table. All the data in the column will be lost.
 - You are about to drop the column `movieRatingId` on the `Movie` table. All the data in the column will be lost.
 - A unique constraint covering the columns `[movieId]` on the table `MovieExternalId` will be added. If there are existing duplicate values, this will fail.
 - A unique constraint covering the columns `[movieId]` on the table `MovieRating` will be added. If there are existing duplicate values, this will fail.
 */

-- DropForeignKey

ALTER TABLE "Movie" DROP CONSTRAINT "Movie_movieExternalIdId_fkey";

-- DropForeignKey

ALTER TABLE "Movie" DROP CONSTRAINT "Movie_movieRatingId_fkey";

-- AlterTable

ALTER TABLE
    "Movie" DROP COLUMN "movieExternalIdId",
    DROP COLUMN "movieRatingId";

-- AlterTable

ALTER TABLE "MovieExternalId" ADD COLUMN "movieId" INTEGER;

-- AlterTable

ALTER TABLE "MovieRating"
ADD COLUMN "movieId" INTEGER,
ALTER COLUMN
    "kp" DROP NOT NULL,
ALTER COLUMN
    "imdb" DROP NOT NULL;

-- CreateIndex

CREATE UNIQUE INDEX "MovieExternalId_movieId_key" ON "MovieExternalId"("movieId");

-- CreateIndex

CREATE UNIQUE INDEX "MovieRating_movieId_key" ON "MovieRating"("movieId");

-- AddForeignKey

ALTER TABLE "MovieExternalId"
ADD
    CONSTRAINT "MovieExternalId_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE
SET NULL ON UPDATE CASCADE;

-- AddForeignKey

ALTER TABLE "MovieRating"
ADD
    CONSTRAINT "MovieRating_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE
SET NULL ON UPDATE CASCADE;
