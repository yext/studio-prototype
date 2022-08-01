import React, { FunctionComponent, useEffect } from 'react'
import { useState } from 'react'
import { ModuleNameToComponentMetadata, PageComponentsState } from '../../shared/models'
import { useStudioContext } from './useStudioContext'
import Layout from '../../../src/layouts/layout'

const componentNameToComponent = {}

export default function PagePreview() {
  const { pageComponentsState, moduleNameToComponentMetadata } = useStudioContext()
  const [
    loadedComponents
  ] = useComponents(pageComponentsState, moduleNameToComponentMetadata)

  return (
    <div className='w-full h-full'>
      <Layout>
        {loadedComponents.map((c, i) => {
          if (c.name === 'Layout') {
            return null
          }
          if (!componentNameToComponent[c.name]) {
            console.error(`Expected to find component loaded for ${c.name} but none found - possibly due to a race condition.`)
            return null
          }
          return React.createElement(componentNameToComponent[c.name], {
            ...c.props,
            verticalConfigMap: {},
            key: `${c.name}-${i}`
          })
        })}
      </Layout>
    </div>
  )
}

function useComponents(
  pageComponentsState: PageComponentsState,
  moduleNameToComponentMetadata: ModuleNameToComponentMetadata
): [PageComponentsState] {
  const [loadedComponents, setLoadedComponents] = useState<PageComponentsState>([])
  const modules = import.meta.glob<object>('../../../src/components/*.tsx')

  useEffect(() => {
    Promise.all(pageComponentsState.map(c => {
      const { name, moduleName } = c
      if (name in componentNameToComponent) {
        return null
      }
      if (name === 'Layout') {
        // console.error('TODO remove hardcoded layout support')
        return null
      }
      if (moduleName === 'localComponents') {
        return modules[`../../../src/components/${name}.tsx`]().then(module => {
          componentNameToComponent[name] = getFunctionComponent(module, name)
        })
      } else {
        const { importIdentifier } = moduleNameToComponentMetadata[moduleName][name]
        return import(importIdentifier).then(module => {
          componentNameToComponent[name] = getFunctionComponent(module, name)
        })
      }
    })).then(() => {
      // TODO(oshi): this probably runs into race conditions issues
      setLoadedComponents(pageComponentsState)
    })
  }, [moduleNameToComponentMetadata, modules, pageComponentsState])

  return [loadedComponents]
}

function getFunctionComponent(module: object, name: string): (FunctionComponent | undefined) {
  if (module[name]) {
    return module[name] as FunctionComponent
  } else if (typeof module['default'] === 'function') {
    return module['default'] as FunctionComponent
  } else {
    console.error(`Module ${name} is not a valid functional component.`)
  }
}