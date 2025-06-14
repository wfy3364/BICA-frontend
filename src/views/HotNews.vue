<template>
  <div>
    <el-card>
      <template #header>
        <div class="card-header">
          <span>模拟数据输入</span>
        </div>
      </template>
      <div class="controls">
        <el-input-number
            v-model="speed"
            :min="1"
            :max="300"
            :step="1"
            size="large"
            style="width: 120px; margin-right: 16px;"
        />
        <el-button
            type="success"
            :disabled="playing"
            @click="handlePlay"
            size="large"
            style="margin-right: 8px;"
        >
          模拟
        </el-button>
        <el-button
            type="danger"
            :disabled="!playing"
            @click="handleStop"
            size="large"
        >
          停止
        </el-button>
      </div>
      <el-divider/>
      <div class="time-row">
        <el-button @click="fetchTime" size="default" icon="el-icon-refresh" style="margin-right: 12px;">
          刷新
        </el-button>
        <span>当前模拟时间: {{ exposureTime }}</span>
      </div>
    </el-card>

    <el-card style="margin-top: 20px;">
      <template #header>
        <div style="display: flex; justify-content: space-between;">
          <span>新闻热度趋势</span>
          <el-radio-group v-model="mode" size="small" style="margin-left: 16px;">
            <el-radio-button label="minute">按分钟</el-radio-button>
            <el-radio-button label="hour">按小时</el-radio-button>
            <el-radio-button label="day">按天</el-radio-button>
            <el-button type="primary" size="small" @click="fetchAndRenderCharts" style="margin-left: 10px;">刷新图表</el-button>
          </el-radio-group>
          
        </div>
      </template>
      <div ref="newsHotChartRef" class="chart-container"></div>
    </el-card>

    <el-card style="margin-top: 20px;">
      <template #header>
        <span>新闻类别热度趋势</span>
      </template>
      <div ref="categoryClickChartRef" class="chart-container"></div>
    </el-card>
  </div>
</template>

<script setup>
import {ref, onMounted, computed, watch} from 'vue'
import {useStore} from 'vuex'
import {ElMessage} from 'element-plus'
import * as echarts from 'echarts'

const speed = ref(1)
const exposureTime = ref('尚无数据')
const store = useStore()
const playing = computed(() => store.state.playing)

const newsHotChartRef = ref(null)
const categoryClickChartRef = ref(null)
const mode = ref('minute')

async function handlePlay() {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/exposure/start_exposure?speed=${speed.value}`)
    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || '启动失败')
    }
    ElMessage.success('已开始播放')
    store.dispatch('startPlaying')
  } catch (e) {
    ElMessage.error(e?.message || '启动失败')
  }
}

async function handleStop() {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/exposure/stop_exposure`)
    if (!res.ok) {
      throw new Error('停止失败')
    }
    ElMessage.success('已停止')
    store.dispatch('stopPlaying')
  } catch (e) {
    ElMessage.error('停止失败')
  }
}

async function fetchTime() {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/exposure/get_exposure_time`)
    if (!res.ok) {
      exposureTime.value = '尚无数据'
      return
    }
    const text = await res.text()
    exposureTime.value = text || '尚无数据'
  } catch {
    exposureTime.value = '尚无数据'
  }
}

function transformGroupedData(groupedData) {
  const allTimes = new Set()
  for (const group in groupedData) {
    Object.keys(groupedData[group]).forEach(time => allTimes.add(time))
  }
  const sortedTimes = Array.from(allTimes).sort()

  const series = Object.entries(groupedData).map(([name, timeMap]) => ({
    name,
    type: 'line',
    data: sortedTimes.map(t => timeMap[t] || 0),
    smooth: false
  }))

  return { times: sortedTimes, series }
}

async function fetchAndRenderCharts() {
  const [hotRes, catRes] = await Promise.all([
    fetch(`${import.meta.env.VITE_API_URL}/chart/news_hot?granularity=${mode.value}`),
    fetch(`${import.meta.env.VITE_API_URL}/chart/category_click?granularity=${mode.value}`)
  ])

  const hotGrouped = await hotRes.json()
  const catGrouped = await catRes.json()

  const hotData = transformGroupedData(hotGrouped)
  const catData = transformGroupedData(catGrouped)

  renderChart(newsHotChartRef.value, ' ', hotData.times, hotData.series)
  renderChart(categoryClickChartRef.value, ' ', catData.times, catData.series)
}

function renderChart(container, title, xData, series) {
  const existingInstance = echarts.getInstanceByDom(container)
  if (existingInstance) {
    existingInstance.dispose()
  }
  const chart = echarts.init(container)
  chart.setOption({
    title: { text: title },
    tooltip: { trigger: 'axis' },
    legend: {},
    xAxis: { type: 'category', data: xData },
    yAxis: { type: 'value' },
    series
  })
}

onMounted(() => {
  fetchTime()
  fetchAndRenderCharts()
})

watch(mode, fetchAndRenderCharts)
</script>

<style scoped>
.card-header {
  font-size: 18px;
  font-weight: bold;
}
.controls {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}
.time-row {
  display: flex;
  align-items: center;
  font-size: 16px;
  min-height: 40px;
}
.chart-container {
  width: 100%;
  height: 400px;
}
</style>