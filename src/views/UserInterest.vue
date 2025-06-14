<template>
  <div class="p-4 space-y-6">
    <!-- 筛选区域 -->
    <el-card>
      <div class="flex flex-wrap gap-4 items-center">
        <!-- 视角切换 -->
        <el-radio-group v-model="viewMode" size="small">
          <el-radio-button label="user">单用户</el-radio-button>
          <el-radio-button label="all">全用户</el-radio-button>
        </el-radio-group>

        <!-- 仅单用户显示 user_id 输入 -->
        <el-input
          v-if="viewMode === 'user'"
          v-model="queryParams.user_id"
          placeholder="用户ID (可选)"
          clearable
          style="width: 200px"
        />

        <el-select v-model="queryParams.granularity" placeholder="时间粒度" style="width: 150px">
          <el-option label="1小时" value="1h" />
          <el-option label="1天" value="1d" />
          <el-option label="5天" value="5d" />
        </el-select>

        <el-select v-model="queryParams.range" placeholder="回溯范围" style="width: 150px">
          <el-option
            v-for="item in rangeOptions"
            :key="item"
            :label="formatRangeLabel(item)"
            :value="item"
          />
        </el-select>

        <el-select v-model="queryParams.by" placeholder="兴趣类别字段" style="width: 150px">
          <el-option label="Topic" value="topic" />
          <el-option label="Category" value="category" />
        </el-select>

        <el-button type="primary" @click="fetchTrendData">查询</el-button>
      </div>
    </el-card>

    <!-- 折线图 -->
    <el-card>
      <template #header>兴趣变化趋势图（点击数）</template>
      <div class="chart-container">
        <v-chart
          v-if="rawData.length > 0"
          class="v-chart"
          :option="lineChartOption"
          autoresize
        />
      </div>
    </el-card>

    <!-- 柱状图 -->
    <el-card>
      <template #header>最新时间窗口兴趣分布图</template>
      <el-select v-model="selectedTime" placeholder="选择时间窗口" style="margin-bottom: 1rem; width: 200px;">
        <el-option
          v-for="time in timeWindows"
          :key="time"
          :label="time"
          :value="time"
        />
      </el-select>
      <div class="chart-container">
        <v-chart
          v-if="rawData.length > 0"
          class="v-chart h-96"
          :option="barChartOption"
          autoresize
        />
      </div>
    </el-card>
  </div>
</template>


<script setup>
import { ref, reactive, computed, watch } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { LineChart, BarChart } from 'echarts/charts'
import { TooltipComponent, GridComponent, LegendComponent, TitleComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

use([LineChart, BarChart, TooltipComponent, GridComponent, LegendComponent, TitleComponent, CanvasRenderer])

// 用户视角切换
const viewMode = ref('user')  // user 或 all

// 参数配置
const queryParams = reactive({
  user_id: '',
  granularity: '5d',
  by: 'topic',
  range: '90d', // 前端用于过滤，不传给后端
})

// 前端过滤时间范围选项
const rangeOptionsMap = {
  '5d': ['30d', '60d', '90d'],
  '1d': ['7d', '14d', '30d'],
  '1h': ['6h', '12h', '24h'],
}
const rangeOptions = ref(rangeOptionsMap[queryParams.granularity])
const formatRangeLabel = (val) => {
  if (val.endsWith('d')) return `最近${parseInt(val)}天`
  if (val.endsWith('h')) return `最近${parseInt(val)}小时`
  return val
}

watch(() => queryParams.granularity, (newVal) => {
  rangeOptions.value = rangeOptionsMap[newVal] || []
  queryParams.range = rangeOptions.value[rangeOptions.value.length - 1]
})

// 原始数据与时间窗口
const rawData = ref([])
const timeWindows = ref([])
const selectedTime = ref('')
const maxTime = ref(new Date())

// 将 60d / 12h 转换为实际起始时间
const parseTimeOffset = (offsetStr) => {
  const now = new Date(maxTime.value)
  const amount = parseInt(offsetStr)
  const threshold = new Date(now)

  if (offsetStr.endsWith('d')) threshold.setDate(now.getDate() - amount)
  else if (offsetStr.endsWith('h')) threshold.setHours(now.getHours() - amount)

  return threshold
}

// 查询函数（按视角切换 API）
const fetchTrendData = async () => {
  try {
    rawData.value = []

    const url =
      viewMode.value === 'user'
        ? 'http://127.0.0.1:5000/api/interest/trend'
        : 'http://127.0.0.1:5000/api/interest/trend_all'

    const params = {
      granularity: queryParams.granularity,
      by: queryParams.by,
    }

    if (viewMode.value === 'user' && queryParams.user_id.trim()) {
      params.user_id = queryParams.user_id.trim()
    }

    const res = await axios.get(url, { params })

    const allData = res.data
    if (!allData.length) {
      ElMessage.info('无查询结果')
      return
    }

    maxTime.value = new Date(Math.max(...allData.map(d => new Date(d.time_window).getTime())))
    const threshold = parseTimeOffset(queryParams.range)

    const filtered = allData.filter(d => new Date(d.time_window) >= threshold)
    rawData.value = filtered

    const times = Array.from(new Set(filtered.map(item => item.time_window))).sort()
    timeWindows.value = times
    selectedTime.value = times[times.length - 1]
  } catch (e) {
    ElMessage.error('查询失败')
  }
}


// 折线图配置
const lineChartOption = computed(() => {
  const grouped = {}
  const totalClicks = {}
  const dates = new Set()

  rawData.value.forEach(item => {
    const { interest, time_window, click_count } = item
    dates.add(time_window)
    if (!grouped[interest]) grouped[interest] = {}
    grouped[interest][time_window] = click_count
    totalClicks[interest] = (totalClicks[interest] || 0) + click_count
  })

  const sortedDates = Array.from(dates).sort()

  const topInterests = Object.entries(totalClicks)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([interest]) => interest)

  const series = topInterests.map(interest => ({
    name: interest,
    type: 'line',
    data: sortedDates.map(date => grouped[interest][date] || 0),
  }))

  return {
    tooltip: { trigger: 'axis' },
    legend: { top: 'bottom' },
    xAxis: { type: 'category', data: sortedDates },
    yAxis: { type: 'value', name: '点击次数' },
    series,
  }
})

// 柱状图配置（仅展示点击次数前10的兴趣）
const barChartOption = computed(() => {
  if (!selectedTime.value) return {}

  const latestData = rawData.value
    .filter(r => r.time_window === selectedTime.value)
    .sort((a, b) => b.click_count - a.click_count)
    .slice(0, 10) // 取前10个点击最多的

  return {
    tooltip: {},
    xAxis: {
      type: 'category',
      data: latestData.map(i => i.interest),
      axisLabel: {
        rotate: 30, // 如果兴趣名较长可加这个旋转
        overflow: 'truncate',
      },
    },
    yAxis: {
      type: 'value',
      name: '点击次数',
    },
    series: [
      {
        type: 'bar',
        data: latestData.map(i => i.click_count),
        label: {
          show: true,
          position: 'top',
        },
        itemStyle: {
          color: '#409EFF', // 可自定义颜色
        },
      },
    ],
  }
})

</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 400px;
}
</style>
