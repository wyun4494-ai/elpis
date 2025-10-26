import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    isDark: false,  // 是否深色模式
    theme: 'light'  // 当前主题：light / dark
  }),
  
  getters: {
    currentTheme: (state) => state.theme
  },
  
  actions: {
    // 切换主题
    toggleTheme() {
      this.isDark = !this.isDark
      this.theme = this.isDark ? 'dark' : 'light'
      
      // 保存到 localStorage
      localStorage.setItem('theme', this.theme)
      
      // 应用主题
      this.applyTheme()
    },
    
    // 应用主题样式
    applyTheme() {
      const html = document.documentElement
      
      if (this.isDark) {
        html.classList.add('dark')
        html.setAttribute('data-theme', 'dark')
      } else {
        html.classList.remove('dark')
        html.setAttribute('data-theme', 'light')
      }
      
      // 同步到 Element Plus
      if (this.isDark) {
        html.classList.add('dark')
      } else {
        html.classList.remove('dark')
      }
    },
    
    // 初始化主题
    initTheme() {
      // 从 localStorage 读取用户保存的主题
      const savedTheme = localStorage.getItem('theme')
      
      if (savedTheme) {
        this.isDark = savedTheme === 'dark'
        this.theme = savedTheme
      } else {
        // 如果没有保存的主题，检测系统偏好
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        this.isDark = prefersDark
        this.theme = prefersDark ? 'dark' : 'light'
      }
      
      this.applyTheme()
    }
  }
})

