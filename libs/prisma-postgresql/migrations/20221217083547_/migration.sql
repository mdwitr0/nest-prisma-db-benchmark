-- CreateEnum
CREATE TYPE "MovieType" AS ENUM ('ANIMATED_SERIES', 'ANIME', 'CARTOON', 'MINI_SERIES', 'MOVIE', 'TV_SERIES', 'TV_SHOW', 'VIDEO');

-- CreateEnum
CREATE TYPE "ProfessionType" AS ENUM ('ACTOR', 'NOT_LISTED_IN_THE_CREDITS', 'BAND_CHRONICLE', 'BAND_PLAYING_THEMSELVES', 'DIRECTOR', 'COMPOSER', 'EDITOR', 'VOICE_DIRECTOR', 'OPERATOR', 'TRANSLATOR', 'PRODUCER', 'WRITER', 'PRODUCTION_DESIGNER', 'PRODUCER_USSR');

-- CreateEnum
CREATE TYPE "PersonSex" AS ENUM ('MALE', 'FEMALE');

-- CreateTable
CREATE TABLE "MovieNameItem" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "MovieNameItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovieExternalId" (
    "id" SERIAL NOT NULL,
    "imdb" TEXT,
    "tmdb" INTEGER,
    "kpHD" TEXT,
    "movieId" INTEGER,

    CONSTRAINT "MovieExternalId_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovieRating" (
    "id" SERIAL NOT NULL,
    "kp" DOUBLE PRECISION,
    "imdb" DOUBLE PRECISION,
    "await" DOUBLE PRECISION,
    "filmCritics" DOUBLE PRECISION,
    "russianFilmCritics" DOUBLE PRECISION,
    "tmdb" DOUBLE PRECISION,
    "movieId" INTEGER,

    CONSTRAINT "MovieRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Person" (
    "id" SERIAL NOT NULL,
    "kpId" INTEGER NOT NULL,
    "enName" TEXT,
    "name" TEXT,
    "sex" "PersonSex",
    "age" INTEGER,
    "countAwards" INTEGER,
    "growth" INTEGER,
    "profession" "ProfessionType"[],
    "birthday" DATE,
    "death" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovieOnPerson" (
    "id" SERIAL NOT NULL,
    "kpId" INTEGER NOT NULL,
    "movieKpId" INTEGER NOT NULL,
    "profession" "ProfessionType"[],
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "personId" INTEGER,
    "movieId" INTEGER,

    CONSTRAINT "MovieOnPerson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Movie" (
    "id" SERIAL NOT NULL,
    "kpId" INTEGER NOT NULL,
    "name" TEXT,
    "names" TEXT[],
    "enName" TEXT,
    "description" TEXT,
    "year" INTEGER,
    "type" "MovieType",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Movie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MovieToMovieNameItem" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "MovieNameItem_name_key" ON "MovieNameItem"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MovieExternalId_movieId_key" ON "MovieExternalId"("movieId");

-- CreateIndex
CREATE UNIQUE INDEX "MovieRating_movieId_key" ON "MovieRating"("movieId");

-- CreateIndex
CREATE UNIQUE INDEX "Person_kpId_key" ON "Person"("kpId");

-- CreateIndex
CREATE UNIQUE INDEX "MovieOnPerson_kpId_key" ON "MovieOnPerson"("kpId");

-- CreateIndex
CREATE UNIQUE INDEX "Movie_kpId_key" ON "Movie"("kpId");

-- CreateIndex
CREATE UNIQUE INDEX "_MovieToMovieNameItem_AB_unique" ON "_MovieToMovieNameItem"("A", "B");

-- CreateIndex
CREATE INDEX "_MovieToMovieNameItem_B_index" ON "_MovieToMovieNameItem"("B");

-- AddForeignKey
ALTER TABLE "MovieExternalId" ADD CONSTRAINT "MovieExternalId_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieRating" ADD CONSTRAINT "MovieRating_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieOnPerson" ADD CONSTRAINT "MovieOnPerson_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieOnPerson" ADD CONSTRAINT "MovieOnPerson_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MovieToMovieNameItem" ADD CONSTRAINT "_MovieToMovieNameItem_A_fkey" FOREIGN KEY ("A") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MovieToMovieNameItem" ADD CONSTRAINT "_MovieToMovieNameItem_B_fkey" FOREIGN KEY ("B") REFERENCES "MovieNameItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
