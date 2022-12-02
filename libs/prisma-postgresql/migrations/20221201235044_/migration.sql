-- DropForeignKey
ALTER TABLE "Movie" DROP CONSTRAINT "Movie_movieRatingId_fkey";

-- AlterTable
ALTER TABLE "Movie" ALTER COLUMN "movieRatingId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Movie" ADD CONSTRAINT "Movie_movieRatingId_fkey" FOREIGN KEY ("movieRatingId") REFERENCES "MovieRating"("id") ON DELETE SET NULL ON UPDATE CASCADE;
