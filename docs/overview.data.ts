import { fetchPageData } from '../src/utils/fetchPageData'

export default {
  watch: ['./**/*.md'],
  async load(watchedFiles) {
    return await fetchPageData(watchedFiles)
  }
}
