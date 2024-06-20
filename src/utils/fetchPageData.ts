import { normalize, relative, resolve } from 'path'
import { createContentLoader } from 'vitepress'
import type { Stats } from 'fs'
import { statSync } from 'fs'


const TITLE_BEGIN = '\n# '
const TITLE_END = '\n'
const DOCS_ROOT = normalize(resolve(__dirname, '../../docs'))

const SKIP_LIST = [
  /\/index.md$/,
  /\/overview.md$/
]

export type FetchedMeta = {
  source: string,
  stats: Stats
  title?: string,
  link: string,
  tags: string[],
  description: string,
  html?: string,
}

const extractTitle = (src: string | undefined) => {
  if (!src) return
  const index1 = src.indexOf(TITLE_BEGIN) + TITLE_BEGIN.length
  const index2 = src.indexOf(TITLE_END, index1)
  return src.substring(index1, index2)
}

export const fetchPageData = async (files: string | string[], { render = false } = {}): Promise<FetchedMeta[]> => {
  if (!Array.isArray(files)) {
    return fetchPageData([files], { render })
  }

  const mds = files.filter(file => !SKIP_LIST.some(rx => rx.test(file)))
  const mdRel = mds.map(f => relative(DOCS_ROOT, f))
  const content = await createContentLoader(mdRel, {
    render,
    includeSrc: true,
    globOptions: { absolute: true, cwd: '/' },
  }).load()

  const posts = content.map((c, i) =>
    ({
      html: c.html,
      source: resolve(DOCS_ROOT, mdRel[i]),
      stats: statSync(resolve(DOCS_ROOT, mdRel[i])),
      title: c.frontmatter.title ?? extractTitle(c.src),
      link: c.url,
      tags: c.frontmatter.tags ?? [],
      description: c.frontmatter.description
    })
  )

  posts.sort((a, b) => a.stats.birthtimeMs - b.stats.birthtimeMs)
  return posts
}
