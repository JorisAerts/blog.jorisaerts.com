import { defineConfig } from 'vitepress'
import type { OpenGraphConfig } from './open-graph'
import { defineOpenGraph } from './open-graph'
import type { BaseBlogConfig } from './config.ts'

type BlogConfig = BaseBlogConfig & OpenGraphConfig

export const defineBlog = (config: BlogConfig) => defineConfig({

  ...defineOpenGraph(config),


  /*
  // Reading time: todo: parse HTML and get innerText
  transformPageData(pageData, context) {
    const file = `${context.siteConfig.srcDir}/${pageData.relativePath}`
    fetchPageData(file, { render: true }).then(([meta]) => {
      //pageData.frontmatter.readTime = rt(span.ownerDocument.documentElement.innerText)
    })
  }
  */

})
