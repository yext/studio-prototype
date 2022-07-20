import { Plugin } from 'vite'
import parsePropInterface from './ts-morph/parsePropInterface'
import parseSiteSettingsFile from './ts-morph/parseSiteSettingsFile'
import parsePageFile from './ts-morph/parsePageFile'
import configureServer from './configureServer'
import { StudioProps } from '../client/components/Studio'
import studioConfig from '../../src/studio'
import getRootPath from './getRootPath'
import parseNpmComponents from './ts-morph/parseNpmComponents'
import { ModuleMetadata } from '../shared/models'

/**
 * Handles server-client communication.
 *
 * This inclues providing a vite virtual module so that server side data can be passed to the front end
 * for the initial load, and messaging using the vite HMR API.
 */
export default function createStudioPlugin(): Plugin {
  const virtualModuleId = 'virtual:yext-studio'
  const resolvedVirtualModuleId = '\0' + virtualModuleId

  const npmComponentProps =
    Object.keys(studioConfig['npmComponents']).reduce((shapes, moduleName) => {
      const matchers = studioConfig.npmComponents[moduleName]
      shapes[moduleName] = parseNpmComponents(moduleName, matchers)
      return shapes
    }, {} as Record<keyof typeof studioConfig['npmComponents'], ModuleMetadata>)

  const ctx: StudioProps = {
    siteSettings: {
      componentMetadata: parsePropInterface(getRootPath('src/siteSettings.ts'), 'SiteSettings'),
      propState: parseSiteSettingsFile('src/siteSettings.ts', 'SiteSettings')
    },
    moduleNameToComponentMetadata: {
      localComponents: {
        Banner: parsePropInterface(getRootPath('src/components/Banner.tsx'), 'BannerProps')
      },
      ...npmComponentProps
    },
    componentsOnPage: {
      index: parsePageFile('src/pages/index.tsx')
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
