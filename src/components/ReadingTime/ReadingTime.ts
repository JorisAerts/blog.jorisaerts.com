import { computed, defineComponent, h, ref } from 'vue'
import { useData } from 'vitepress'

import rt from 'reading-time/lib/reading-time'

export const ReadingTime = defineComponent({

  props: {
    minutes: { type: String, default: 'min' }
  },

  setup(props) {
    const data = useData()
    const el = ref()
    const readingTime = computed(() => {
      if (data.frontmatter.value.readingTime) return data.frontmatter.value.readingTime
      const span: HTMLSpanElement | undefined = el.value
      if (!span) return '?'
      const analysis = rt(span.ownerDocument.documentElement.textContent)
      return analysis.minutes * 60
    })

    return () => {
      return h('span', { ref: el }, (Math.round(readingTime.value / 6) / 10) + props.minutes)
    }

  }

})
