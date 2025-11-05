<template>
  <el-sub-menu :index="menuItem.key">
    <template #title>
      <el-icon v-if="menuItem.icon">
        <component :is="ElementPlusIconsVue[menuItem.icon]" />
      </el-icon>
      <el-icon v-else>
        <Folder />
      </el-icon>
      <span>{{ menuItem.name }}</span>
    </template>
    <div
      v-for="item in menuItem.subMenu"
      :key="item.key"
    >
      <sub-menu
        v-if="item.subMenu && item.subMenu.length > 0"
        :menu-item="item"
      />
      <el-menu-item
        v-else
        :index="item.key"
      >
        <el-icon v-if="item.icon">
          <component :is="ElementPlusIconsVue[item.icon]" />
        </el-icon>
        <el-icon v-else>
          <Document />
        </el-icon>
        <template #title>
          <span>{{ item.name }}</span>
        </template>
      </el-menu-item>
    </div>
  </el-sub-menu>
</template>

<script setup>
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import { Document, Folder } from '@element-plus/icons-vue';

const { menuItem } = defineProps({
  menuItem: {
    type: Object,
    required: true
  }
})
</script>

<style lang="less" scoped>

</style>