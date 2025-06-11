<template>
    <div>
      <el-card>
        <template #header>
          <div class="card-header">
            <span>爆款新闻分析</span>
          </div>
        </template>
  
        <el-button type="success" @click="addNews">模拟新增一天新闻</el-button>
        <el-divider></el-divider>
        <div v-if="addNewsMessage.length">{{ addNewsMessage }}</div>
        <el-divider></el-divider>
        <el-table :data="hotNews" v-if="hotNews.length" style="width: 100%">
          <el-table-column prop="title" label="标题" />
          <el-table-column prop="popularity" label="热度得分" />
          <el-table-column prop="category" label="类别" />
        </el-table>
      </el-card>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { ElMessage } from 'element-plus';
  
  const addNewsMessage = ref('');
  const hotNews = ref([
    { title: 'New AI Model Shocks Industry', popularity: 95, score: 100 },
    { title: 'Elections Results Change Landscape', popularity: 90, score: 99 }
  ]);
  
  function addNews() {
    // 添加一天新闻到数据库中
    ElMessage.success('已模拟新增一天新闻');
    addNewsMessage.value = "当前日期：2025-6-17，今日新增2条新闻"
  };  

  </script>
  
  <style scoped>
  .card-header {
    font-size: 18px;
    font-weight: bold;
  }
  </style>