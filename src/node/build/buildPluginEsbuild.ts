import fs from 'fs-extra'
import { Plugin } from 'rollup'
import {
  tjsxRE,
  transform,
  resolveJsxOptions,
  vueJsxPublicPath,
  vueJsxFilePath
} from '../esbuildService'
import { SharedConfig } from '../config'

export const createEsbuildPlugin = async (
  jsx: SharedConfig['jsx']
): Promise<Plugin> => {
  const jsxConfig = resolveJsxOptions(jsx)

  return {
    name: 'vite:esbuild',

    resolveId(id) {
      if (id === vueJsxPublicPath) {
        return vueJsxPublicPath
      }
    },

    load(id) {
      if (id === vueJsxPublicPath) {
        return fs.readFileSync(vueJsxFilePath, 'utf-8')
      }
    },

    async transform(code, id) {
      const isVueTs = /\.vue\?/.test(id) && id.endsWith('lang.ts')
      if (tjsxRE.test(id) || isVueTs) {
        return transform(
          code,
          id,
          {
            ...jsxConfig,
            ...(isVueTs ? { loader: 'ts' } : null)
          },
          jsx
        )
      }
    }
  }
}

export const esbuildMinifyPlugin: Plugin = {
  name: 'vite:esbuild-minify',
  async renderChunk(code, chunk) {
    return transform(code, chunk.fileName, {
      minify: true
    })
  }
}
