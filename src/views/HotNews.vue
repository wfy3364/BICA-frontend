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
  </div>
</template>

<script setup>
import {ref, computed} from 'vue'
import {useStore} from 'vuex'
import {ElMessage} from 'element-plus'

const speed = ref(1)
const exposureTime = ref('尚无数据')
const store = useStore()
const playing = computed(() => store.state.playing)

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

// 页面加载时自动获取一次时间
fetchTime()
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
</style>