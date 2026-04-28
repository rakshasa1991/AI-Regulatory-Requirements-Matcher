import { z } from "zod";
import { RequirementCategory, Criticality } from "@prisma/client";

export const createDocumentSchema = z.object({
  title: z.string().min(1).max(500),
  type: z.enum(['SOP', 'Policy', 'Template', 'ICHGuideline']),
  category: z.string().min(1).max(200),
  version: z.string().default('1.0'),
  content: z.string().min(10).max(50000),
});

export const updateDocumentSchema = createDocumentSchema.partial();

export const DocumentSchema = z.object({
  title: z.string().min(1).max(500),
  type: z.enum(["SOP", "Policy", "Template", "ICHGuideline"]),
  category: z.string().min(1).max(200),
  version: z.string().default("1.0"),
  content: z.string().min(1),
  summary: z.string().optional(),
});

export const RequirementSchema = z.object({
  title: z.string().min(1).max(500),
  text: z.string().min(1),
  category: z.enum(["Safety", "Efficacy", "Quality", "Labeling", "Administrative", "Other"]).default("Other"),
  criticality: z.enum(["Critical", "High", "Medium", "Low"]).default("Medium"),
});

export const RequirementSetSchema = z.object({
  title: z.string().min(1).max(500),
  source: z.string().min(1),
  rawText: z.string().min(1),
});

export const MappingRunSchema = z.object({
  requirementSetId: z.string().cuid(),
  documentIds: z.array(z.string().cuid()).optional(),
});

export const GapGenerationSchema = z.object({
  requirementSetId: z.string().cuid(),
});

export const createRequirementSetSchema = z.object({
  title: z.string().min(1).max(500),
  source: z.string().min(1).max(300),
  rawText: z.string().min(10).max(100000),
});

export const updateRequirementSchema = z.object({
  category: z.nativeEnum(RequirementCategory).optional(),
  criticality: z.nativeEnum(Criticality).optional(),
});

export const updateRequirementSetSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  source: z.string().min(1).max(300).optional(),
  status: z.string().optional(),
});

export const bulkUpdateRequirementsSchema = z.object({
  updates: z.array(
    z.object({
      id: z.string().cuid(),
      category: z.nativeEnum(RequirementCategory).optional(),
      criticality: z.nativeEnum(Criticality).optional(),
    })
  ),
});
