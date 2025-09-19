import { defineStore } from 'pinia'
import { ref }  from 'vue'

export const useProjectStore = defineStore('project', () => {
  const projectList = ref([])

  // 设置项目列表
  const setProjectList = (list) => {
    projectList.value = list;
  }

  return { projectList, setProjectList }  
})