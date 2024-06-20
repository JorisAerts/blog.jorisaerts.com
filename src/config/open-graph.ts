import type { HeadConfig, PageData, TransformContext, TransformPageContext } from 'vitepress'
import { defineConfig } from 'vitepress'
import { dirname, resolve } from 'path'
import { copyFileSync, existsSync, mkdirSync } from 'fs'
import type { BaseBlogConfig } from './config'

export type OpenGraphConfig = {

  og?: false | OpenGraphConfig

} & BaseBlogConfig

export type OpenGraphData = {
  title?: string
  type?: string
  description?: string
  image?: string
  url?: string
}

const getOpenGraph = (config: OpenGraphConfig, pageData: PageData, context: TransformPageContext) => {
  const { frontmatter, filePath } = pageData
  const title = pageData.title ?? context.siteConfig.userConfig.title
  const description = frontmatter.description ?? false
  const thumb = `${resolve(context.siteConfig.srcDir, filePath.replace(/\.md$/, ''))}.png`

  const baseUrl = config.baseUrl.endsWith('/') ? config.baseUrl : config.baseUrl + '/'
  const postUrl = filePath.replace(/\.md$/, '.html')

  const result: OpenGraphData = {
    type: 'website',
    url: `${baseUrl}${postUrl}`
  }
  if (title) result.title = title
  if (description) result.description = description
  if (existsSync(thumb)) {
    const thumbUrl = `${
      context.siteConfig.assetsDir
    }/${
      filePath
        .replace(/\.md$/, '')
        .replace(/\//, '_')
    }.png`
    const thumbTargetPath = `${context.siteConfig.outDir}/${thumbUrl}`

    // create the target-directory if it doesn't exist yet
    const targetDir = dirname(thumbTargetPath)
    mkdirSync(targetDir, { recursive: true })

    // copy over the thumbnail
    copyFileSync(thumb, thumbTargetPath)

    // assign the thumbnail
    result.image = `${baseUrl}${thumbUrl}`
  }
  return result
}

export const defineOpenGraph = (config: OpenGraphConfig) => {

  return config.og === false ? {} : defineConfig({

    transformHead(context: TransformContext) {
      const pageData = context.pageData
      const ogData = getOpenGraph(config, pageData, context)
      if (!Object.keys(ogData).length) return

      const head: HeadConfig[] = []
      for (const d in ogData) {
        if (ogData[d as keyof OpenGraphData]) {
          head.push([
            'meta',
            { name: `og:${d}`, content: ogData[d as keyof OpenGraphData] as string }
          ])
        }
      }

      return head
    },

  })

}

