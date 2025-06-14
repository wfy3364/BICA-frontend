<template>
  <div class="p-4 space-y-6">
    <!-- 查询控制 -->
    <el-card>
      <div class="flex items-center gap-4">
        <el-input-number v-model="limit" :min="10" :max="1000" label="查询条数" />
        <el-button type="primary" @click="fetchLogs">刷新</el-button>
      </div>
    </el-card>

    <!-- 平均耗时柱状图 -->
    <el-card>
      <template #header>各接口平均查询耗时</template>
      <div class="chart-container">
        <v-chart
          v-show="chartOption"
          class="v-chart"
          :option="chartOption"
          autoresize
        />
      </div>
    </el-card>


    <!-- 查询日志明细 -->
    <el-card>
      <template #header>查询日志明细</template>
      <el-table :data="paginatedLogs" stripe highlight-current-row style="width: 100%">
        <el-table-column
          prop="created_at"
          label="时间"
          width="200"
          :formatter="formatTime"
        />
        <el-table-column prop="endpoint" label="接口路径" width="250" />
        <el-table-column prop="duration" label="耗时 (秒)" width="120" />
        <el-table-column prop="query" label="SQL语句" show-overflow-tooltip />
      </el-table>

      <div class="flex justify-end mt-4">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="filteredLogs.length"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { TooltipComponent, GridComponent, TitleComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

use([BarChart, TooltipComponent, GridComponent, TitleComponent, CanvasRenderer])

const logs = ref([])
const limit = ref(100)
const pageSize = 10
const currentPage = ref(1)

const fetchLogs = async () => {
  try {
    const res = await axios.get('http://127.0.0.1:5000/api/logs', {
      params: { limit: limit.value },
    })
    logs.value = res.data
    currentPage.value = 1
  } catch (err) {
    ElMessage.error('日志查询失败')
  } finally{
    console.log('chartOption', chartOption.value)
  }
}

onMounted(() => {
  fetchLogs()
  console.log('chartOption', chartOption.value)
})

const filteredLogs = computed(() =>
  logs.value.filter((log) => log.endpoint && log.endpoint !== 'unknown')
)

const handlePageChange = (val) => {
  currentPage.value = val
}

const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredLogs.value.slice(start, start + pageSize)
})

// 图表配置
const chartOption = computed(() => {
  if (!filteredLogs.value.length) return null

  const durationMap = {}
  const countMap = {}

  filteredLogs.value.forEach((log) => {
    const key = log.endpoint
    durationMap[key] = (durationMap[key] || 0) + log.duration
    countMap[key] = (countMap[key] || 0) + 1
  })

  const endpoints = Object.keys(durationMap)
  const avgDurations = endpoints.map((e) => parseFloat((durationMap[e] / countMap[e]).toFixed(4)))

  return {
    tooltip: {
      trigger: 'axis',
      formatter: (params) =>
        params.map((p) => `${p.name}: ${p.value} 秒`).join('<br/>'),
    },
    grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: endpoints,
      axisLabel: { rotate: 30, interval: 0 },
    },
    yAxis: {
      type: 'value',
      name: '平均耗时（秒）',
    },
    series: [
      {
        type: 'bar',
        data: avgDurations,
        label: { show: true, position: 'top' },
      },
    ],
  }
})

const formatTime = (row) => {
  const date = new Date(row.created_at)
  if (isNaN(date.getTime())) return row.created_at // fallback
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const mi = String(date.getMinutes()).padStart(2, '0')
  const ss = String(date.getSeconds()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`
}


</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 400px;  /* ✅ 与折线图保持一致 */
  min-height: 300px;
}

.v-chart {
  width: 100%;
  height: 100%;
}
</style>
