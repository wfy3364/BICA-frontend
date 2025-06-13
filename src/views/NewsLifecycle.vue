<template>
  <div class="news-lifecycle-container">
    <el-card class="news-lifecycle-card">
      <div class="input-section">
        <el-input
            v-model="query"
            placeholder="请输入新闻编号"
            class="input-box"
            clearable
        />
        <el-button
            type="primary"
            class="search-btn"
            :loading="loading"
            @click="handleSearch"
        >
          查询
        </el-button>
      </div>
      <div class="chart-section">
        <div ref="chartRef" class="line-chart"></div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import {ref, onMounted, watch} from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'

const query = ref('')
const chartRef = ref(null)
let chartInstance = null

const chartData = ref({
  times: [],
  clicks: []
})

const loading = ref(false)

const renderChart = () => {
  if (!chartInstance && chartRef.value) {
    chartInstance = echarts.init(chartRef.value)
  }
  if (chartInstance) {
    chartInstance.setOption({
      tooltip: {trigger: 'axis'},
      xAxis: {
        type: 'category',
        data: chartData.value.times,
        boundaryGap: false,
        axisLabel: {color: '#666'}
      },
      yAxis: {
        type: 'value',
        name: '点击量',
        axisLabel: {color: '#666'}
      },
      series: [
        {
          data: chartData.value.clicks,
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: {width: 3, color: '#409EFF'},
          itemStyle: {color: '#409EFF'},
          areaStyle: {color: 'rgba(64,158,255,0.1)'}
        }
      ],
      grid: {left: 40, right: 20, top: 40, bottom: 40}
    })
  }
}

const handleSearch = async () => {
  if (!query.value) {
    ElMessage.warning('请输入新闻编号')
    return
  }
  loading.value = true
  try {
    const resp = await fetch(`${import.meta.env.VITE_API_URL}/news/lifecycle/${encodeURIComponent(query.value)}`)
    if (!resp.ok) {
      throw new Error('未找到该新闻或服务器错误')
    }
    const data = await resp.json()
    chartData.value = {
      times: data.times || [],
      clicks: data.clicks || []
    }
    if (!data.times || data.times.length === 0) {
      ElMessage.info('该新闻暂无点击量数据')
    }
  } catch (e) {
    ElMessage.error(e.message || '请求失败')
    chartData.value = { times: [], clicks: [] }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  renderChart()
})

watch(chartData, () => {
  renderChart()
})
</script>

<style scoped>
.news-lifecycle-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
}

.news-lifecycle-card {
  width: 100%;
  height: 100%;
  padding: 32px 32px 24px 32px;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  background: #fff;
}

.input-section {
  display: flex;
  align-items: center;
  margin-bottom: 32px;
  gap: 16px;
}

.input-box {
  flex: 1;
}

.search-btn {
  min-width: 90px;
  height: 40px;
}

.chart-section {
  width: 100%;
  height: 320px;
}

.line-chart {
  width: 100%;
  height: 100%;
}
</style>