<template>
  <div class="category-trend-container">
    <el-card class="category-trend-card">
      <div class="input-section">
        <el-select
            v-model="category"
            placeholder="请选择分类"
            class="select-box"
            clearable
            @change="onCategoryChange"
        >
          <el-option
              v-for="item in categoryOptions"
              :key="item"
              :label="item"
              :value="item"
          />
        </el-select>
        <el-select
            v-model="topic"
            placeholder="请选择主题（可选）"
            class="select-box"
            clearable
            :disabled="!category"
        >
          <el-option
              v-for="item in topicOptions"
              :key="item"
              :label="item"
              :value="item"
          />
        </el-select>
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
import {ElMessage} from 'element-plus'

// category-topic 映射
const categoryTopicMap = {
  adexperience: ['buick'],
  autos: [
    'ads-carconnections', 'ads-conquest-1', 'autosbdc', 'autosbuyersguide', 'autosbuying', 'autoscartech', 'autoschicago', 'autosclassics', 'autoscompact', 'autosconvertibles', 'autosdecisionguide', 'autosdetroit', 'autosenthusiasts', 'autosfueleconomy', 'autosgeneva', 'autoshows', 'autoshybrids', 'autoslarge', 'autoslosangeles', 'autosluxury', 'autosmidsize', 'autosmotorcycles', 'autosmypreview', 'autosnews', 'autosnewyork', 'autosownership', 'autosparis', 'autospassenger', 'autosracing', 'autosresearch', 'autosresearchguides', 'autosreview', 'autossema', 'autossports', 'autossuvs', 'autostrucks', 'autosusedcars', 'autosvans', 'autosvideonew', 'autos-videos', 'autosvideos', 'connected-car', 'more-autos-video', 'rvs-trailers'
  ],
  entertainment: [
    'awards', 'celebrity', 'celebrity gossip', 'celebritynews', 'entertainment-books', 'entertainment-celebrity', 'entertainment-gallery', 'entertainmentmovies', 'entertainmentmusic', 'entertainmenttv', 'gaming', 'humor', 'movies', 'movies-oscars', 'music', 'news', 'onlinegames', 'television', 'thenandnow', 'tv', 'tvvideos', 'video', 'windowsstore'
  ],
  europe: ['europe-top-stories'],
  finance: [
    'ads-aol-50s60s', 'ads-aol-moving', 'ads-aol-retirementlife', 'ads-tax-proof', 'career-news', 'finance-30sand40s', 'finance-auto-insurance', 'finance-billstopay', 'finance-business', 'finance-career', 'finance-career-education', 'finance-companies', 'finance-credit', 'finance-education', 'finance-everydaymoney', 'finance-healthcare', 'finance-home-loans', 'finance-homesandpropertysection', 'finance-insidetheticker', 'finance-insurance', 'finance-investing', 'finance-mutual-funds', 'financenews', 'finance-real-estate', 'finance-retirement', 'finance-savemoney', 'finance-saving-investing', 'finance-savingsrates', 'finance-small-business', 'finance-smart-spending', 'finance-spending-borrowing', 'finance-startinvesting', 'finance-taxes', 'finance-tax-proof-portfolio', 'finance-technology', 'finance-top-stocks', 'finance-top-stories', 'finance-video', 'generalmoney', 'jobs', 'markets', 'personalfinance', 'retirement', 'smallbusiness1', 'spendingandborrowing', 'technologyinvesting', 'yourlifeyourmoney'
  ],
  foodanddrink: [
    'ads-hellofresh', 'ads-hellofresh-2', 'ads-hellofresh-3', 'beerandcider', 'beverages', 'casual', 'causes-food-insecurity', 'cocktails', 'cooking', 'cookingschool', 'finedining', 'fish', 'foodculture', 'food-hangontosummer', 'foodnews', 'foodrecipes', 'foodtips', 'foodvideos', 'grillingguide', 'healthyeating', 'newstrends', 'partiesandentertaining', 'partytips', 'quickandeasy', 'recipes', 'restaurantsandnews', 'reviewsandreservations', 'seasonal', 'tipsandtricks', 'videos', 'wine', 'wines'
  ],
  health: [
    'ads-aol-lungcancer', 'ads-lung-health', 'ads-shape-up', 'ads-skin-health', 'autism', 'cardio', 'causes-cancer-awareness', 'fitness', 'health21days', 'healthagingwell', 'health-cancer', 'health-diabetes', 'health-flu', 'health-news', 'healthnews', 'health-osteoporosis', 'health-pain', 'healthtrending', 'healthvideos', 'healthy-heart', 'healthyliving', 'medical', 'mentalhealth', 'nutrition', 'pregnancyparenting', 'recipes', 'sexualhealth', 'strength', 'superfoods', 'video', 'voices', 'weight-loss', 'weightloss', 'wellness', 'windowsstore'
  ],
  kids: [
    'animals', 'fun', 'grab-bag', 'people-places', 'science', 'sports', 'video'
  ],
  lifestyle: [
    'ads-aol-makeyourmark', 'advice', 'chrome-extension', 'foodandrink', 'kids', 'launcher', 'lifestyleanimals', 'lifestylebeauty', 'lifestylebuzz', 'lifestylecareer', 'lifestylecelebstyle', 'lifestylecleaningandorganizing', 'lifestyledailyroundup', 'lifestyledeathday', 'lifestyledecor', 'lifestyledesign', 'lifestyledidyouknow', 'lifestylediy', 'lifestylefamily', 'lifestylefamilyandrelationships', 'lifestylefamilyfun', 'lifestylefamilylife', 'lifestylefamilyrelationships', 'lifestylefashion', 'lifestylefood', 'lifestylehomeandgarden', 'lifestylehoroscope', 'lifestylehoroscopefish', 'lifestylelife', 'lifestylelovesex', 'lifestylemarchbasketballpartyplanner', 'lifestylemarriage', 'lifestylemensfashion', 'lifestylemindandsoul', 'lifestylemoneytips', 'lifestyle-news-feature', 'lifestyleparenting', 'lifestylepets', 'lifestylepetsanimals', 'lifestylequizzes', 'lifestylerelationships', 'lifestyleroommakeoverskitchen', 'lifestyleroyals', 'lifestyleshopping', 'lifestyleshoppingapparel', 'lifestyleshoppinghomegarden', 'lifestylesmartliving', 'lifestylestyle', 'lifestyleteenagers', 'lifestyletravel', 'lifestyletrending', 'lifestylevideo', 'lifestyle-wedding', 'lifestyleweddings', 'lifestylewhatshot', 'lifestylewhatstrending', 'lifetsylepets', 'pets-search', 'shop-all', 'shop-apparel', 'shop-automotive', 'shop-books-movies-tv', 'shop-computers-electronics', 'shop-holidays', 'shop-home-goods', 'shopping', 'shop-toys', 'tipsandtricksstyle', 'voices'
  ],
  movies: [
    'entertainment', 'humor', 'movienews', 'movies-awards', 'movies-celebrity', 'movies-gallery', 'movies-golden-globes', 'movies-oscars', 'movievideo', 'reviews'
  ],
  music: [
    'acmawards', 'awards-video', 'cma-awards', 'entertainment', 'humor', 'latin-billboard', 'music-awards', 'music-celebrity', 'music-gallery', 'music-grammys', 'musicnews', 'music-reviews', 'musicvideos'
  ],
  news: [
    'breakingnews', 'brexit', 'causes', 'causes-disaster-relief', 'causes-environment', 'causes-gender-equality', 'causes-homelessness', 'causes-human-rights', 'causes-military-appreciation', 'causes-missingchildren', 'causes-plastic-free-july', 'causes-poverty', 'causes-sustainability', 'columnists', 'indepth', 'localnews', 'microsoftnews', 'narendramodi_opinion', 'newsbing', 'newsbusiness', 'news-causes-lgbt', 'newscrime', 'newsfactcheck', 'newsgoodnews', 'newslocal', 'newsmicrosoft', 'newsnational', 'newsoffbeat', 'newsopinion', 'newsphotos', 'newspolitics', 'newsrealestate', 'newsscience', 'newsscienceandtechnology', 'news-techgiftguide', 'newsuk', 'newsus', 'newsvideo', 'newsvideos', 'newsweather', 'newsweathermap', 'newsworld', 'photos', 'politicsvideo', 'royals', 'spotlight', 'technology', 'videos', 'yearinoffbeatanimals'
  ],
  northamerica: [
    'northamerica-video'
  ],
  sports: [
    'adventure-sports', 'baseball_mlb', 'baseball_mlb_videos', 'basketball', 'basketball_nba', 'basketball_nba_videos', 'basketball_ncaa', 'basketball_ncaa_videos', 'boxing', 'boxing-mma', 'esports', 'fifa-provider', 'football_ncaa', 'football_ncaa_videos', 'football_nfl', 'football_nfl_videos', 'golf', 'golfvideos', 'icehockey_nhl', 'icehockey_nhl_videos', 'mma', 'more sports', 'more_sports', 'outdoors', 'racing', 'soccer', 'soccer_bund', 'soccer_epl', 'soccer_fifa_wc', 'soccer_fifa_wwc', 'soccer_liga', 'soccer_mls', 'soccernews', 'soccer_videos', 'sports_news', 'sports-search', 'superbowl', 'table_tennis', 'tennis', 'tennis_intl', 'tourdefrance', 'video', 'wnbafinals'
  ],
  travel: [
    'beaches', 'budget', 'cruises', 'holiday-travel-en-in', 'newstrends', 'outdoor', 'travel-accessible', 'travel-ads-traveltrend-o-southeastasia', 'travel-adventure-travel', 'travelarticle', 'travelnews', 'travel-points-rewards', 'travel-search', 'traveltips', 'traveltripideas', 'video'
  ],
  tv: [
    'emmys-video', 'humor', 'seasonalvideos', 'topnews', 'tv-awards', 'tv-celebrity', 'tv-emmys', 'tv-gallery', 'tv-golden-globes', 'tvnews', 'tv-recaps', 'tv-reviews', 'tvvideos'
  ],
  video: [
    'animals', 'binge', 'comedy', 'downtime', 'entertainment', 'foodanddrink', 'lifestyle', 'nerdcore', 'news', 'peopleandplaces', 'popculture', 'science', 'sports', 'topvideos', 'travel', 'tunedin', 'video-be-prepared', 'videohomechannel', 'viral', 'watch', 'wonder'
  ],
  weather: [
    'photos', 'weathertopstories'
  ]
}

const categoryOptions = ref(Object.keys(categoryTopicMap))
const topicOptions = ref([])

const category = ref('')
const topic = ref('')
const chartRef = ref(null)
let chartInstance = null

const chartData = ref({
  times: [],
  clicks: []
})

const loading = ref(false)

const onCategoryChange = (val) => {
  topic.value = ''
  topicOptions.value = val ? categoryTopicMap[val] : []
}

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
          lineStyle: {width: 3, color: '#67C23A'},
          itemStyle: {color: '#67C23A'},
          areaStyle: {color: 'rgba(103,194,58,0.1)'}
        }
      ],
      grid: {left: 40, right: 20, top: 40, bottom: 40}
    })
  }
}

const handleSearch = async () => {
  if (!category.value) {
    ElMessage.warning('分类不可为空')
    return
  }
  loading.value = true
  try {
    // 构造 query string
    const params = new URLSearchParams()
    params.append('category', category.value)
    if (topic.value) params.append('topic', topic.value)
    const url = `${import.meta.env.VITE_API_URL}/news/temperature?${params.toString()}`
    const resp = await fetch(url, {method: 'GET'})
    if (!resp.ok) {
      throw new Error('请求失败')
    }
    const data = await resp.json()
    chartData.value = {
      times: data.times || [],
      clicks: data.clicks || []
    }
    if (!data.times || data.times.length === 0) {
      ElMessage.info('暂无数据')
    }
  } catch (e) {
    ElMessage.error(e.message || '请求失败')
    chartData.value = {times: [], clicks: []}
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
.category-trend-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
}

.category-trend-card {
  width: 100%;
  height: 100%;
  padding: 32px 32px 24px 32px;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  background: #fff;
}

.input-section {
  display: flex;
  align-items: center;
  margin-bottom: 32px;
  gap: 16px;
}

.select-box {
  width: 180px;
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