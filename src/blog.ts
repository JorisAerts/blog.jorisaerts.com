import { defineConfig, mergeConfig } from 'vitepress'
import type { OpenGraphConfig } from './config'
import { defineOpenGraph } from './config'

type BlogConfig = OpenGraphConfig

export const defineBlog = (config: BlogConfig) => defineConfig(
  defineOpenGraph(config),
)

