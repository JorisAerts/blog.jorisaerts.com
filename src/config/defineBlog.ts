import { defineConfig } from 'vitepress'
import type { OpenGraphConfig } from './open-graph'
import { defineOpenGraph } from './open-graph'

type BlogConfig = OpenGraphConfig

export const defineBlog = (config: BlogConfig) => defineConfig({

  ...defineOpenGraph(config),
  

})
