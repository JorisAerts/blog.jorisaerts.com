import type { PropType } from 'vue'
import { computed } from 'vue'
import { defineComponent } from 'vue'
import { useData } from 'vitepress'
import './TagList.scss'

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

    return () => <div class="tag-list">{
      (tags.value ?? []).map((tag: string) =>
        <a class="tag" href={`/overview.html?tag=${tag}`}>{tag}</a>
      )
    }</div>
  }


})
