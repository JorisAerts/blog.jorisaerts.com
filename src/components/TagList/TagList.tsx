import type { PropType } from 'vue'
import { computed, defineComponent } from 'vue'
import { useData } from 'vitepress'
import './TagList.scss'
import { Chip } from '../Chip/Chip.tsx'

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
        <Chip link={`/overview.html?tag=${tag}`}>{tag}</Chip>
      )
    }</div>
  }


})
