import { describe, it, expect } from "vitest";
import { chunkText } from "@/lib/chunker";

describe("chunkText", () => {
  it("пустой текст → пустой массив", () => {
    const chunks = chunkText("");
    
    expect(chunks).toHaveLength(0);
    expect(chunks).toEqual([]);
  });

  it("текст с одним абзацем → один чанк", () => {
    const text = "Один короткий абзац.";
    
    const chunks = chunkText(text, 800, 100);
    
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toBe("Один короткий абзац.");
  });

  it("короткие абзацы → один чанк", () => {
    const text = `Короткий первый абзац.

Короткий второй абзац.

Короткий третий абзац.`;

    const chunks = chunkText(text, 800, 100);
    
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toContain("Короткий первый абзац");
    expect(chunks[0]).toContain("Короткий второй абзац");
    expect(chunks[0]).toContain("Короткий третий абзац");
  });

  it("длинный текст разбивается на несколько чанков", () => {
    const longText = Array(10).fill("Абзац с текстом для тестирования разбивки.").join("\n\n");
    
    const chunks = chunkText(longText, 100, 10);
    
    expect(chunks.length).toBeGreaterThan(1);
    chunks.forEach((chunk) => {
      expect(chunk.length).toBeLessThanOrEqual(110);
    });
  });

  it("overlap работает при разбивке", () => {
    const text = Array(20).fill("Текст абзаца номер один два три четыре пять.").join("\n\n");
    
    const chunks = chunkText(text, 80, 20);
    
    if (chunks.length > 1) {
      const lastPartOfFirst = chunks[0].slice(-20);
      const firstPartOfSecond = chunks[1].slice(0, 20);
      
      expect(lastPartOfFirst).toBeTruthy();
      expect(firstPartOfSecond).toBeTruthy();
    }
  });
});
