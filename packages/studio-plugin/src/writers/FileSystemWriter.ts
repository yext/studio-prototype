import ParsingOrchestrator from "../ParsingOrchestrator";
import {
  FileMetadata,
  FileMetadataKind,
  ModuleMetadata,
  PageState,
  SiteSettingsValues,
} from "../types";
import fs from "fs";
import { Project } from "ts-morph";
import lodash from "lodash";
import path from 'path'

/**
 * FileSystemWriter is a class for housing content modification logic
 * for Studio editable source files (e.g. SiteSettingsFile, ModuleFile and PageFile).
 */
export class FileSystemWriter {
  constructor(
    private orchestrator: ParsingOrchestrator,
    private isPagesJSRepo: boolean,
    private project: Project
  ) {}

  /**
   * Update the page file's content based on provided page state.
   *
   * @param pageName - Name of the page file to update
   * @param pageState - the updated state for the page file
   */
  writeToPageFile(pageName: string, pageState: PageState): void {
    const pageFile = this.orchestrator.getPageFile(pageName);
    pageFile.updatePageFile(pageState, {
      updateStreamConfig: this.isPagesJSRepo,
    });
  }

  /**
   * Update the module file's content based on provided module metadata.
   *
   * @param filepath - path of the module file to update
   * @param moduleMetadata - the updated metadata for the module file
   */
  writeToModuleFile(filepath: string, moduleMetadata: ModuleMetadata): void {
    const moduleFile = this.orchestrator.getModuleFile(filepath);
    moduleFile.updateModuleFile(moduleMetadata);
  }

  writeToSiteSettings(siteSettingsValues: SiteSettingsValues): void {
    this.orchestrator.updateSiteSettings(siteSettingsValues);
  }

  /**
   * Deletes all files corresponding to FileMetadata that exist in the previous UUIDToFileMetadata
   * but not the updated UUIDToFileMetadata (i.e. FileMetadata that have been removed).
   */
  syncFileMetadata(updatedUUIDToFileMetadata: Record<string, FileMetadata>) {
    const UUIDToFileMetadata = this.orchestrator.getUUIDToFileMetadata();
    Object.keys(UUIDToFileMetadata).forEach((moduleUUID) => {
      if (!updatedUUIDToFileMetadata.hasOwnProperty(moduleUUID)) {
        this.removeFile(UUIDToFileMetadata[moduleUUID].filepath);
      }
    });

    Object.keys(updatedUUIDToFileMetadata).forEach((moduleUUID) => {
      const updatedMetadata = updatedUUIDToFileMetadata[moduleUUID];
      if (updatedMetadata.kind !== FileMetadataKind.Module) {
        return;
      }
      const originalMetadata = UUIDToFileMetadata[moduleUUID];
      if (!lodash.isEqual(originalMetadata, updatedMetadata)) {
        const {filepath} = updatedMetadata;
        console.log('--- sync module file', updatedMetadata.filepath)

        FileSystemWriter.openFile(filepath);
        this.writeToModuleFile(filepath, updatedMetadata);
        // this.orchestrator.reloadFile(updatedMetadata.filepath);
        // this.orchestrator
        //   .getModuleFile(updatedMetadata.filepath)
        //   .updateModuleFile(updatedMetadata);
        this.orchestrator.reloadFile(updatedMetadata.filepath);
      }
    });
  }

  static openFile(filepath: string) {
    if (!fs.existsSync(filepath)) {
      const dirName = path.dirname(filepath);
      if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName, { recursive: true });
      }
      fs.openSync(filepath, "w");
    }
  }

  removeFile(filepath: string) {
    if (fs.existsSync(filepath)) {
      const sourceFile = this.project.getSourceFile(filepath);
      if (sourceFile) {
        this.project.removeSourceFile(sourceFile);
      }
      fs.rmSync(filepath);
    }
  }
}
