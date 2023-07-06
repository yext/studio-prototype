import { expect } from "@playwright/test";
import { studioTest } from "./infra/studioTest.js";
import fs from "fs";

studioTest(
  "can remove a page and then add it back",
  async ({ page, studioPage }) => {
    const pageInTree = page.getByText("BasicPage");
    await expect(pageInTree).toHaveCount(1);
    await studioPage.removePage("BasicPage");
    await expect(pageInTree).toHaveCount(0);
    await studioPage.saveButton.click();
    expect(fs.existsSync("./src/pages/BasicPage.tsx")).toBeFalsy();
    await expect(page).toHaveScreenshot();

    // Ensure that the page is still deleted after a browser refresh.
    await page.reload();
    await expect(page).toHaveScreenshot();

    await expect(pageInTree).toHaveCount(0);
    await studioPage.addPage("BasicPage");
    await expect(pageInTree).toHaveCount(1);
    await expect(page).toHaveScreenshot();
    await studioPage.saveButton.click();
    const expectedPagePath = "./src/pages/BasicPage.tsx";
    const expectedPage = "export default function BasicPage() {}";
    await expect(expectedPagePath).toHaveContents(expectedPage);
    await expect(page).toHaveScreenshot();
  }
);