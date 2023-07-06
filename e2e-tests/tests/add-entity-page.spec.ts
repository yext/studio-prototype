import { expect } from "@playwright/test";
import { studioTest } from "./infra/studioTest.js";
import { StreamScopeForm } from "./infra/StudioPlaywrightPage.js";
import fs from "fs";

const expectedPage = fs.readFileSync(
  "./tests/__fixtures__/add-entity-page-expected-page.tsx",
  "utf-8"
);

studioTest.only(
  "can add an entity page and then remove it",
  async ({ page, studioPage }) => {
    const pageInTree = page.getByText("EntityPage");
    await expect(pageInTree).toHaveCount(0);

    const streamScopeForm: Required<StreamScopeForm> = {
      entityIds: "",
      entityTypes: "entity1",
      savedFilterIds: "entity2,entity3",
    };
    await studioPage.addEntityPage(
      "EntityPage",
      streamScopeForm,
      "entity-page"
    );
    await expect(pageInTree).toHaveCount(1);
    await expect(page).toHaveScreenshot();
    await studioPage.saveButton.click();
    const expectedPagePath = "./src/templates/EntityPage.tsx";
    await expect(expectedPagePath).toHaveContents(expectedPage);
    await expect(page).toHaveScreenshot();
  }
);
