-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('SOP', 'Policy', 'Template', 'ICHGuideline');

-- CreateEnum
CREATE TYPE "Criticality" AS ENUM ('Critical', 'High', 'Medium', 'Low');

-- CreateEnum
CREATE TYPE "RequirementCategory" AS ENUM ('Safety', 'Efficacy', 'Quality', 'Labeling', 'Administrative', 'Other');

-- CreateEnum
CREATE TYPE "CoverageStatus" AS ENUM ('Covered', 'Partial', 'Gap', 'Unmapped');

-- CreateEnum
CREATE TYPE "GapType" AS ENUM ('Missing', 'Contradictory', 'Partial', 'Outdated');

-- CreateEnum
CREATE TYPE "GapSeverity" AS ENUM ('Critical', 'High', 'Medium', 'Low');

-- CreateEnum
CREATE TYPE "GapItemStatus" AS ENUM ('Open', 'InProgress', 'Resolved');

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "category" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "content" TEXT NOT NULL,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_chunks" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "document_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requirement_sets" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "rawText" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "importDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "requirement_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requirements" (
    "id" TEXT NOT NULL,
    "setId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "category" "RequirementCategory" NOT NULL DEFAULT 'Other',
    "criticality" "Criticality" NOT NULL DEFAULT 'Medium',
    "status" "CoverageStatus" NOT NULL DEFAULT 'Unmapped',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mappings" (
    "id" TEXT NOT NULL,
    "requirementId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "chunkId" TEXT,
    "coverageStatus" "CoverageStatus" NOT NULL,
    "matchScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "aiRationale" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gap_reports" (
    "id" TEXT NOT NULL,
    "requirementSetId" TEXT NOT NULL,
    "executiveSummary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gap_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gap_items" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "requirementId" TEXT NOT NULL,
    "gapType" "GapType" NOT NULL,
    "severity" "GapSeverity" NOT NULL,
    "recommendation" TEXT,
    "draftResponseText" TEXT,
    "status" "GapItemStatus" NOT NULL DEFAULT 'Open',

    CONSTRAINT "gap_items_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "document_chunks" ADD CONSTRAINT "document_chunks_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requirements" ADD CONSTRAINT "requirements_setId_fkey" FOREIGN KEY ("setId") REFERENCES "requirement_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mappings" ADD CONSTRAINT "mappings_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "requirements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mappings" ADD CONSTRAINT "mappings_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mappings" ADD CONSTRAINT "mappings_chunkId_fkey" FOREIGN KEY ("chunkId") REFERENCES "document_chunks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gap_reports" ADD CONSTRAINT "gap_reports_requirementSetId_fkey" FOREIGN KEY ("requirementSetId") REFERENCES "requirement_sets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gap_items" ADD CONSTRAINT "gap_items_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "gap_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gap_items" ADD CONSTRAINT "gap_items_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "requirements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
