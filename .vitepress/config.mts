import { mergeConfig } from 'vitepress'
import { defineBlog } from '../src/config'
import vueJsx from '@vitejs/plugin-vue-jsx' // https://vitejs.dev/config/

const blogConfig = defineBlog({

  // the root of the website; must be known to generate meta-info
  baseUrl: 'https://blog.jorisaerts.com'

})

// https://vitepress.dev/reference/site-config
export default mergeConfig(blogConfig, {

  title: "Joris Aerts' Blog",
  description: 'A journey into coding',

  srcDir: './docs',

  ignoreDeadLinks: [
    /^https?:\/\/localhost/,
  ],

  // JSX support
  vite: { plugins: [vueJsx()] },

  themeConfig: {

    siteTitle: 'Joris Aerts',

    sidebar: false,
    aside: false,

    search: {
      provider: 'local'
    },

    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Articles', link: '/overview' }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/jorisaerts/blog.jorisaerts.com' },
      { icon: 'linkedin', link: 'https://www.linkedin.com/in/whyjoris/' },
    ]
  }

})
