<template>
    <el-card>
      <template #header>
        <div class="card-header">📊 组合统计查询</div>
      </template>
  
      <div class="form-section">
        <div class="form-attribute">
          <span class="form-label">时间范围</span>
          <el-date-picker v-model="timeRange" type="datetimerange" start-placeholder="开始时间" end-placeholder="结束时间" />
        </div>

        <div class="form-attribute">
          <span class="form-label">主题</span>
          <el-select v-model="topics" multiple placeholder="请选择主题" style="min-width: 200px;">
            <el-option v-for="item in topicOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </div>

        <div class="form-attribute">
          <span class="form-label">标题长度</span>
          <el-input-number v-model="titleMin" :min="0" placeholder="最小值" />
          <el-input-number v-model="titleMax" :min="0" placeholder="最大值" />
        </div>

        <div class="form-attribute">
          <span class="form-label">内容长度</span>
          <el-input-number v-model="contentMin" :min="0" placeholder="最小值" />
          <el-input-number v-model="contentMax" :min="0" placeholder="最大值" />
        </div>

        <div class="form-attribute">
          <span class="form-label">用户ID</span>
          <el-input v-model="userIds" placeholder="请输入用户ID（用逗号分隔）" style="min-width: 200px;" />
        </div>

        <el-button type="primary" @click="handleQuery">查询</el-button>
      </div>

    <el-table :data="paginatedResults" stripe style="margin-bottom: 20px;">
        <el-table-column prop="news_id" label="新闻ID" />
        <el-table-column show-overflow-tooltip prop="title" label="新闻标题" />
        <el-table-column prop="category" label="主题" />
        <el-table-column prop="content_length" label="内容长度" />
        <el-table-column prop="click_count" label="点击数" />
        <el-table-column prop="first_click" label="首次点击时间" />
        <el-table-column prop="last_click" label="最后点击时间" />
    </el-table>

    <el-pagination
        background
        layout="prev, pager, next, sizes, total"
        :total="results.length"
        :page-size="pageSize"
        :current-page="currentPage"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
    />

    </el-card>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'

const timeRange = ref([])
const topics = ref([])
const topicOptions = ref([])
const titleMin = ref(0)
const titleMax = ref()
const contentMin = ref(0)
const contentMax = ref()
const userIds = ref('')
const results = ref([])
const currentPage = ref(1)
const pageSize = ref(10)


onMounted(fetchTopicOptions)

async function fetchTopicOptions() {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/analytics/topics`)
    topicOptions.value = await res.json()
  } catch (e) {
    ElMessage.error('加载主题失败')
  }
}

const paginatedResults = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return results.value.slice(start, start + pageSize.value)
})

function handlePageChange(page) {
  currentPage.value = page
}

function handleSizeChange(size) {
  pageSize.value = size
  currentPage.value = 1
}


async function handleQuery() {
  const [start, end] = timeRange.value || []
  const payload = {
    start_time: start ? new Date(start).toISOString().slice(0, 19).replace('T', ' ') : null,
    end_time: end ? new Date(end).toISOString().slice(0, 19).replace('T', ' ') : null,
    topics: topics.value || [],
    title_length_min: titleMin.value,
    title_length_max: titleMax.value,
    content_length_min: contentMin.value,
    content_length_max: contentMax.value,
    users: userIds.value ? userIds.value.split(',').map(u => u.trim()) : []
  }

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/analytics/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const data = await res.json()
    results.value = data
  } catch (e) {
    ElMessage.error('查询失败')
  }
}
</script>

<style scoped>
.card-header {
  font-size: 18px;
  font-weight: bold;
}
.form-section {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
}
.form-attribute {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.form-label {
  width: 100px;
  font-weight: 500;
}
</style>
