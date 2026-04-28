import { describe, it, expect } from "vitest";
import { createDocumentSchema, RequirementSchema, RequirementSetSchema } from "@/lib/validators";

describe("createDocumentSchema", () => {
  it("валидный документ проходит валидацию", () => {
    const validDocument = {
      title: "Test SOP Title",
      type: "SOP" as const,
      category: "Quality Management",
      version: "1.0",
      content: "This is a valid document content with at least 10 characters.",
    };

    const result = createDocumentSchema.safeParse(validDocument);
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("Test SOP Title");
      expect(result.data.type).toBe("SOP");
    }
  });

  it("документ без title → ошибка валидации", () => {
    const invalidDocument = {
      type: "SOP" as const,
      category: "Quality Management",
      content: "This is a valid document content with at least 10 characters.",
    };

    const result = createDocumentSchema.safeParse(invalidDocument);
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors.length).toBeGreaterThan(0);
      expect(result.error.errors[0].path).toContain("title");
    }
  });

  it("content > 50000 символов → ошибка", () => {
    const invalidDocument = {
      title: "Test SOP Title",
      type: "SOP" as const,
      category: "Quality Management",
      content: "A".repeat(50001),
    };

    const result = createDocumentSchema.safeParse(invalidDocument);
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toContain("content");
    }
  });

  it("невалидный type → ошибка", () => {
    const invalidDocument = {
      title: "Test SOP Title",
      type: "InvalidType" as any,
      category: "Quality Management",
      content: "This is a valid document content with at least 10 characters.",
    };

    const result = createDocumentSchema.safeParse(invalidDocument);
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toContain("type");
    }
  });

  it("content < 10 символов → ошибка", () => {
    const invalidDocument = {
      title: "Test SOP Title",
      type: "SOP" as const,
      category: "Quality Management",
      content: "Short",
    };

    const result = createDocumentSchema.safeParse(invalidDocument);
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toContain("content");
    }
  });

  it("пустой title → ошибка", () => {
    const invalidDocument = {
      title: "",
      type: "SOP" as const,
      category: "Quality Management",
      content: "This is a valid document content with at least 10 characters.",
    };

    const result = createDocumentSchema.safeParse(invalidDocument);
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toContain("title");
    }
  });
});

describe("RequirementSchema", () => {
  it("валидное требование проходит валидацию", () => {
    const validRequirement = {
      title: "Test Requirement",
      text: "This is a test requirement text.",
      category: "Quality" as const,
      criticality: "High" as const,
    };

    const result = RequirementSchema.safeParse(validRequirement);
    
    expect(result.success).toBe(true);
  });

  it("требование без category использует default", () => {
    const requirement = {
      title: "Test Requirement",
      text: "This is a test requirement text.",
    };

    const result = RequirementSchema.safeParse(requirement);
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.category).toBe("Other");
    }
  });

  it("требование без criticality использует default", () => {
    const requirement = {
      title: "Test Requirement",
      text: "This is a test requirement text.",
    };

    const result = RequirementSchema.safeParse(requirement);
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.criticality).toBe("Medium");
    }
  });
});

describe("RequirementSetSchema", () => {
  it("валидный набор требований проходит валидацию", () => {
    const validRequirementSet = {
      title: "FDA Pre-Approval Inspection Checklist",
      source: "FDA Guidelines 2024",
      rawText: "This is the raw text of the requirements.",
    };

    const result = RequirementSetSchema.safeParse(validRequirementSet);
    
    expect(result.success).toBe(true);
  });

  it("набор требований без title → ошибка", () => {
    const invalidRequirementSet = {
      source: "FDA Guidelines 2024",
      rawText: "This is the raw text of the requirements.",
    };

    const result = RequirementSetSchema.safeParse(invalidRequirementSet);
    
    expect(result.success).toBe(false);
  });
});
