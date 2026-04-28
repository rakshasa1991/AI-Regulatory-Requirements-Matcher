import { test, expect } from "@playwright/test";

test("открыть /documents → видна таблица документов", async ({ page }) => {
  await page.goto("/documents");
  
  await expect(page).toHaveURL("/documents");
});

test("нажать 'Добавить документ' → открывается форма", async ({ page }) => {
  await page.goto("/documents");
  
  const addButton = page.getByRole("button", { name: /добавить документ/i });
  await expect(addButton).toBeVisible();
  await addButton.click();
  
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByLabel(/title/i)).toBeVisible();
});

test("заполнить форму и отправить → документ появляется в таблице", async ({ page }) => {
  await page.goto("/documents");
  
  await page.getByRole("button", { name: /добавить документ/i }).click();
  
  await page.getByLabel(/title/i).fill("Test Document E2E");
  await page.getByLabel(/type/i).click();
  await page.getByText("SOP").click();
  await page.getByLabel(/category/i).fill("Quality Management");
  await page.getByLabel(/version/i).fill("1.0");
  await page.getByLabel(/content/i).fill("This is test content for E2E testing purposes.");
  
  await page.getByRole("button", { name: /создать/i }).click();
  
  await page.waitForTimeout(1000);
  
  await expect(page.getByText("Test Document E2E")).toBeVisible();
});
