import { Plugin } from 'vite'
import parsePropInterface from './ts-morph/parsePropInterface'
import parseSiteSettingsFile from './ts-morph/parseSiteSettingsFile'
import parsePageFile from './ts-morph/parsePageFile'
import configureServer from './configureServer'
import { StudioProps } from '../client/components/Studio'
import getRootPath from './getRootPath'
import { getSourceFile } from './ts-morph/common'
import { moduleNameToComponentMetadata } from './componentMetadata'
import getPagePath from './getPagePath'

/**
 * Handles server-client communication.
 *
 * This inclues providing a vite virtual module so that server side data can be passed to the front end
 * for the initial load, and messaging using the vite HMR API.
 */
export default function createStudioPlugin(): Plugin {
  const virtualModuleId = 'virtual:yext-studio'
  const resolvedVirtualModuleId = '\0' + virtualModuleId

  const ctx: StudioProps = {
    siteSettings: {
      componentMetadata: parsePropInterface(
        getSourceFile(getRootPath('src/siteSettings.ts')),
        getRootPath('src/siteSettings.ts'),
        'SiteSettings'
      ),
      propState: parseSiteSettingsFile('src/siteSettings.ts', 'SiteSettings')
    },
    moduleNameToComponentMetadata,
    componentsOnPage: {
      index: parsePageFile(getPagePath('index.tsx'))
    }
  }

  return {
    name: 'yext-studio-vite-plugin',
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        return `export default ${JSON.stringify(ctx)}`
      }
    },
    configureServer
  }
}
