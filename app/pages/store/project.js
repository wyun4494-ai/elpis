import { defineStore } from 'pinia'
import { ref }  from 'vue'

export const useProjectStore = defineStore('project', () => {
  const projectList = ref([])
  const projectName = ref('')
  const projectKey = ref('')

  // 设置项目列表
  const setProjectList = (list) => {
    projectList.value = list;
  }

  // 设置当前项目名称
  const setProjectName = (name) => {
    projectName.value = name;
  }

  // 设置当前项目 key
  const setProjectKey = (key) => {
    projectKey.value = key;
  }

  return {
    projectList,
    projectName,
    projectKey,
    setProjectList,
    setProjectName,
    setProjectKey
  }
})