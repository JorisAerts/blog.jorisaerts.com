import { fetchPageData } from '../src/utils/fetchPageData'

export default {
  watch: ['./**/*.md'],
  async load(watchedFiles: string[]) {
    return await fetchPageData(watchedFiles, { render: false })
  }
}
