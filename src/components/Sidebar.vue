<template>
    <el-menu :default-active="$route.path" class="el-menu-vertical-demo" router>
      <el-menu-item index="/">新闻分析</el-menu-item>
      <el-menu-item index="/lifecycle">新闻生命周期分析</el-menu-item>
      <el-menu-item index="/trend">类别趋势分析</el-menu-item>
      <el-menu-item index="/query">组合统计查询</el-menu-item>
      <el-menu-item index="/interest">用户兴趣分析</el-menu-item>
      <el-menu-item index="/recommend">用户个性化推荐</el-menu-item>
      <el-menu-item index="/compare">多用户对比</el-menu-item>
      <el-menu-item index="/logs">查询日志</el-menu-item>
    </el-menu>
  </template>
  
<script setup>

</script>

<style scoped>
.el-menu-vertical-demo {
  width: 200px;
}
</style>
  