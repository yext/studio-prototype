import { Plugin } from 'vite'
import parseComponentMetadata from './ts-morph/parseComponentMetadata'
import parseSiteSettingsFile from './ts-morph/parseSiteSettingsFile'
import parsePageFile from './ts-morph/parsePageFile'
import configureServer from './configureServer'
import { StudioProps } from '../client/components/Studio'
import getRootPath from './getRootPath'
import { getSourceFile } from './common'
import { moduleNameToComponentMetadata } from './componentMetadata'
import getPagePath from './getPagePath'
import openBrowser from 'react-dev-utils/openBrowser.js'
import { ComponentMetadata } from '../shared/models'

/**
 * Handles server-client communication.
 *
 * This inclues providing a vite virtual module so that server side data can be passed to the front end
 * for the initial load, and messaging using the vite HMR API.
 */
export default function createStudioPlugin(args): Plugin {
  const virtualModuleId = 'virtual:yext-studio'
  const resolvedVirtualModuleId = '\0' + virtualModuleId

  const siteSettingsMetadata: ComponentMetadata = parseComponentMetadata(
    getSourceFile(getRootPath('src/siteSettings.ts')),
    getRootPath('src/siteSettings.ts'),
    'SiteSettings'
  )

  const ctx: StudioProps = {
    siteSettings: {
      componentMetadata: siteSettingsMetadata,
      propState: parseSiteSettingsFile('src/siteSettings.ts', 'SiteSettings', siteSettingsMetadata.propShape ?? {})
    },
    moduleNameToComponentMetadata,
    componentsOnPage: {
      index: parsePageFile(getPagePath('index.tsx'))
    }
  }

  return {
    name: 'yext-studio-vite-plugin',
    async buildStart() {
      if (args.mode === 'development' && args.command === 'serve') {
        openBrowser('http://localhost:3000/studio/client/')
      }
    },
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
