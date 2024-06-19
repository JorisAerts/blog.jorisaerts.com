import { mergeConfig } from 'vitepress'
import { defineBlog } from '../src'

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

  themeConfig: {

    siteTitle: "Joris Aerts' Blog",

    //outline: false,
    sidebar: false,
    aside: false,

    search: {
      provider: 'local'
    },

    // https://vitepress.dev/reference/default-theme-config
    nav: [
      // {text: 'Home', link: '/'},
      { text: 'Articles', link: '/overview' }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/jorisaerts/blog.jorisaerts.com' }
    ]
  }

})
