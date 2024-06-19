import { relative, resolve, normalize } from 'path'
import { createContentLoader } from 'vitepress'
import { statSync } from 'fs'

const TITLE_BEGIN = '\n# '
const TITLE_END = '\n'
const DOCS_ROOT = normalize(resolve(__dirname, '../../docs'))

const SKIP_LIST = [
  /\/index.md$/,
  /\/overview.md$/
]

const extractTitle = (src: string) => {
  const index1 = src.indexOf(TITLE_BEGIN) + TITLE_BEGIN.length
  const index2 = src.indexOf(TITLE_END, index1)
  return src.substring(index1, index2)
}

export const fetchPageData = async (files: string[]) => {
  const mds = files.filter(file => !SKIP_LIST.some(rx => rx.test(file)))
  const mdRel = mds.map(f => relative(DOCS_ROOT, f))
  const content = await createContentLoader(mdRel, {
    /*render: true,*/
    includeSrc: true,
    globOptions: { absolute: true, cwd: '/' },
  }).load()

  const posts = content.map((c, i) =>
    ({
      source: resolve(DOCS_ROOT, mdRel[i]),
      stats: statSync(resolve(DOCS_ROOT, mdRel[i])),
      title: c.frontmatter.title ?? extractTitle(c.src),
      link: c.url,
      cats: c.frontmatter.categories ?? [],
      description: c.frontmatter.description
    })
  )

  posts.sort((a, b) => a.stats.birthtimeMs - b.stats.birthtimeMs)
  return posts
}
