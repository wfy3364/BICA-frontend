<template>
    <div>
        <el-card class="box-card">
            <template #header>
                <div class="card-header">
                <span>新闻的用户个性化推荐</span>
                </div>
            </template>

            <el-input v-model="userId" placeholder="请输入用户ID" class="id-input" />
            <el-button type="primary" @click="userRecommend">获取推荐新闻</el-button>

            <el-divider></el-divider>

            <el-table v-if="recommendations.length" :data="recommendations" style="width: 100%">
                <el-table-column prop="title" label="推荐标题" />
                <el-table-column prop="category" label="类别" />
                <el-table-column prop="score" label="推荐分数" />
            </el-table>
        </el-card>
    </div>
</template>
  
<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';

const userId = ref('');
const recommendations = ref([]);

function userRecommend() {
    if(userId.value.length==0){
        ElMessage.error('用户id不能为空');
        return;
    }
    // 添加新闻推荐逻辑
    recommendations.value = [
        { title: 'AI will change the world', category: 'Tech', score: 222 },
        { title: 'Elections in Europe', category: 'Politics', score: 111 }
    ];
};
</script>


<style scoped>
.card-header {
    font-size: 18px;
    font-weight: bold;
}

.id-input {
    width: 300px;
    margin-right: 10px;
}
</style>