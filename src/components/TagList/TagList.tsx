import type { PropType } from 'vue'
import { computed } from 'vue'
import { defineComponent } from 'vue'
import { useData } from 'vitepress'

export const TagList = defineComponent({

  name: 'tag-cloud',

  props: {
    tags: { type: Array as PropType<string[]> }
  },

  setup(props) {
    const data = useData()

    const tags = computed(() =>
      props.tags
        ? props.tags
        : data.frontmatter.value.tags
    )

    return () => <div>{
      (tags.value ?? []).map((tag: string) =>
        <a href={`/overview.html?tag=${tag}`}>{tag}</a>
      )
    }</div>
  }


})
