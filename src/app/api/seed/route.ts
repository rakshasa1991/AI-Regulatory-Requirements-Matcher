import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  try {
    // Import seed logic directly
    const { PrismaClient, DocumentType, RequirementCategory, Criticality } = await import("@prisma/client");
    const prisma = new PrismaClient();
    
    // Clear existing data
    await prisma.$transaction([
      prisma.gapItem.deleteMany(),
      prisma.gapReport.deleteMany(),
      prisma.mapping.deleteMany(),
      prisma.requirement.deleteMany(),
      prisma.requirementSet.deleteMany(),
      prisma.documentChunk.deleteMany(),
      prisma.document.deleteMany(),
    ]);
    
    // Run seed logic (simplified - just create requirement set)
    const requirementSet = await prisma.requirementSet.create({
      data: {
        title: "Список вопросов FDA Pre-Approval Inspection 2024",
        source: "FDA Pre-Approval Inspection Checklist 2024",
        rawText: "FDA requirements data",
        status: "Active",
      }
    });
    
    await prisma.$disconnect();
    
    return NextResponse.json({ 
      success: true, 
      message: "Seed completed successfully",
      requirementSetId: requirementSet.id
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed database", details: String(error) }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  return NextResponse.json({
    message: "POST to this endpoint to run the seed",
    environment: process.env.NODE_ENV,
  });
}
