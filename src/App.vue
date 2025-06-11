<template>
  <el-container class="app-container">
    <el-header class="app-top-header">
      新闻动态分析系统
    </el-header>
    <div style="display: flex;">
      <el-aside width="200px">
        <Sidebar />
      </el-aside>
      <el-container>
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </div>
  </el-container>
</template>

<script setup>
import Sidebar from './components/Sidebar.vue';
</script>

<style>
.app-container {
  width: 100%;
  height: 100%;
}
.app-top-header {
  background-color: #409EFF;
  color: white;
  font-size: 20px;
  font-weight: bold;
  line-height: 60px;
  padding-left: 20px;
}
</style>