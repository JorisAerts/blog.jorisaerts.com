import { useData } from 'vitepress'
import { computed, getCurrentInstance, onMounted, ref, watch } from 'vue'

export const useBlog = () => {
  const data = useData()
  const frontmatter = data.frontmatter

  const tags = computed(() => {
    const result = frontmatter.value.tags
    result.sort()
    return result
  })

  const permalink = computed(() => frontmatter.value.permalink)

  // doesn't seem to update on SSR?
  const isDark = ref(false)

  // the problem with isDark from vitepress is that it's not working in production
  onMounted(() => isDark.value = getCurrentInstance()
    ?.vnode?.el?.ownerDocument
    .documentElement?.classList?.contains('dark')
  )
  // if dark mode is toggled by the user, isDark does get triggered
  watch(data.isDark, () => isDark.value = data.isDark.value)

  return {
    tags,
    permalink,
    isDark,
  }
}
