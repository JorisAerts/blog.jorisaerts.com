import { defineComponent, withModifiers } from 'vue'
import './Chip.scss'

export const Chip = defineComponent({

  emits: ['close'],

  props: {
    link: { type: String },
    closeable: { type: Boolean, default: false }
  },

  setup(props, { slots, emit }) {
    return () => <a class="chip" href={props.link}>{slots.default?.()} {
      props.closeable && <a class="chip--close" onClick={withModifiers((e) => {
        emit('close', e)
      }, ['self', 'stop', 'prevent'])
      }>&times;</a>}</a>
  }

})
