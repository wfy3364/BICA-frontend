<template>
    <div>
        <el-card class="box-card">
            <template #header>
                <div class="card-header">
                <span>新闻的用户个性化推荐</span>
                </div>
            </template>
            <el-tabs v-model="activeTab">
                <el-tab-pane label="作为已有用户" name="existing">
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        <div>查看为已有用户推荐的新闻</div>
                        <div style="display: flex; align-items: center;">
                            <span style="margin-right: 10px;">用户id：</span>
                            <el-input v-model="userId" placeholder="用户id" class="id-input" />
                            <el-button type="primary" @click="userRecommend">GO！</el-button>
                        </div>
                        <div v-if="showLists" style="display: flex; gap: 20px; margin-top: 20px;">
                            <!-- 左侧：历史记录 -->
                            <div style="flex: 1;">
                                <div style="font-weight: bold; margin-bottom: 8px;">历史记录</div>
                                <el-table v-if="userHistory && userHistory.length > 0" :data="userHistory" size="small" style="width: 100%;">
                                    <el-table-column prop="news_id" label="id" width="100" />
                                    <el-table-column prop="title" label="标题" width="400"/>
                                    <el-table-column prop="category" label="类别" width="150"/>
                                    <el-table-column prop="dwell" label="停留时长" width="180"/>
                                </el-table>
                                <div v-else style="color: #aaa;">暂无历史记录</div>
                            </div>
                            <!-- 右侧：推荐列表 -->
                            <div style="flex: 1; display: flex; flex-direction: column; height: 100%;">
                                <div style="font-weight: bold; margin-bottom: 8px;">推荐新闻</div>
                                <el-table v-if="recommendations && recommendations.length > 0" :data="recommendations" size="small" style="width: 100%;">
                                    <el-table-column prop="title" label="标题" />
                                    <el-table-column prop="nearest_history" label="可能的推荐依据" width="150"/>
                                    <el-table-column label="近期热度" width="150">
                                        <template #default="scope">
                                            <span v-if="typeof scope.row.temperature_48h === 'number'">
                                                <template v-if="scope.row.temperature_48h > 200">🔥🔥🔥</template>
                                                <template v-else-if="scope.row.temperature_48h > 50">🔥🔥</template>
                                                <template v-else-if="scope.row.temperature_48h > 10">🔥</template>
                                                <template v-else>-</template>
                                            </span>
                                            <span v-else>-</span>
                                        </template>
                                    </el-table-column>

                                </el-table>
                                <div v-else style="color: #aaa;">暂无推荐</div>
                            </div>
                        </div>
                    </div>
                </el-tab-pane>
                <el-tab-pane label="作为新用户模拟浏览" name="browse">
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        <div>新用户模拟浏览</div>
                        <el-button type="primary" style="width: 120px; margin-bottom: 10px;" @click="newUserRecommend">以Utest身份获取推荐</el-button>
                        <div v-if="showNewUserLists" style="display: flex; gap: 20px; margin-top: 20px;">
                            <!-- 左侧：历史记录 -->
                            <div style="flex: 1;">
                                <div style="font-weight: bold; margin-bottom: 8px; display: flex; align-items: center;">
                                    历史记录
                                    <el-button size="small" type="danger" style="margin-left: 10px;" @click="clearNewUserHistory">清空</el-button>
                                </div>
                                <el-table v-if="newUserHistory && newUserHistory.length > 0" :data="newUserHistory" size="small" style="width: 100%;">
                                    <el-table-column prop="title" label="标题" />
                                </el-table>
                                <div v-else style="color: #aaa;">暂无历史记录</div>
                            </div>
                            <!-- 右侧：推荐列表 -->
                            <div style="flex: 1;">
                                <div style="font-weight: bold; margin-bottom: 8px;">推荐新闻</div>
                                <el-table v-if="newUserRecommendations && newUserRecommendations.length > 0" :data="newUserRecommendations" size="small" style="width: 100%;">
                                    <el-table-column prop="title" label="标题" />
                                    <el-table-column label="近期热度" width="150">
                                        <template #default="scope">
                                            <span v-if="typeof scope.row.temperature_48h === 'number'">
                                                <template v-if="scope.row.temperature_48h > 200">🔥🔥🔥</template>
                                                <template v-else-if="scope.row.temperature_48h > 50">🔥🔥</template>
                                                <template v-else-if="scope.row.temperature_48h > 10">🔥</template>
                                                <template v-else>-</template>
                                            </span>
                                            <span v-else>-</span>
                                        </template>
                                    </el-table-column>
                                    <el-table-column label="喜欢吗？">
                                        <template #default="scope">
                                            <el-button size="small" type="primary" :disabled="scope.row.liked" @click="handleNewUserRecommendClick(scope.row)">
                                                {{ scope.row.liked ? '喜欢就好 UwU ' : '喜欢这个！' }}
                                            </el-button>
                                        </template>
                                    </el-table-column>
                                </el-table>
                                <div v-else style="color: #aaa;">暂无推荐</div>

                                <!-- 随机新闻区域 -->
                                <div style="margin-top: 30px;">
                                    <div style="font-weight: bold; margin-bottom: 8px; display: flex; align-items: center;">
                                        随机新闻
                                        <el-button size="small" type="success" style="margin-left: 10px;" @click="fetchNewUserRandomNews">刷新</el-button>
                                    </div>
                                    <el-table v-if="newUserRandomNews && newUserRandomNews.length > 0" :data="newUserRandomNews" size="small" style="width: 100%;">
                                        <el-table-column prop="title" label="标题" />
                                        <el-table-column label="近期热度" width="150">
                                            <template #default="scope">
                                                <span v-if="typeof scope.row.temperature_48h === 'number'">
                                                    <template v-if="scope.row.temperature_48h > 200">🔥🔥🔥</template>
                                                    <template v-else-if="scope.row.temperature_48h > 50">🔥🔥</template>
                                                    <template v-else-if="scope.row.temperature_48h > 10">🔥</template>
                                                    <template v-else>-</template>
                                                </span>
                                                <span v-else>-</span>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="喜欢吗？">
                                            <template #default="scope">
                                                <el-button size="small" type="primary" :disabled="scope.row.liked" @click="handleNewUserRecommendClick(scope.row)">
                                                    {{ scope.row.liked ? '喜欢就好 UwU ' : '喜欢这个！' }}
                                                </el-button>
                                            </template>
                                        </el-table-column>
                                    </el-table>
                                    <div v-else style="color: #aaa;">暂无随机新闻</div>
                                </div>
                                <!-- 随机新闻区域结束 -->
                            </div>
                        </div>
                    </div>
                </el-tab-pane>
                <el-tab-pane label="向量语义搜索" name="search">
                    <div style="display: flex; align-items: center;">
                        <span style="margin-right: 10px;">你想看什么新闻？</span>
                        <el-input v-model="searchQuery" placeholder="请输入搜索内容" class="id-input" />
                        <el-button type="primary" @click="smartSearch">搜索</el-button>
                    </div>
                    <el-table v-if="searchResults.length > 0" :data="searchResults" style="width: 100%; margin-top: 20px;">
                        <el-table-column prop="news_id" label="id" width="80" />
                        <el-table-column prop="title" label="标题" />
                        <el-table-column prop="cosine_distance" label="相似度" />
                        <el-table-column prop="temperature_48h" label="近期热度" />
                    </el-table>
                    <div v-else-if="searchLoading" style="color: #aaa; margin-top: 20px;">搜索中...</div>
                    <div v-else-if="searchNoResult" style="color: #aaa; margin-top: 20px;">暂无结果</div>
                </el-tab-pane>
            </el-tabs>

            <el-divider></el-divider>

            
        </el-card>
    </div>
</template>
  
<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';

const activeTab = ref('existing');
const userId = ref('');
const recommendations = ref([]);
const userHistory = ref([]);
const showLists = ref(false);

const newUserHistory = ref([]);
const newUserRecommendations = ref([]);
const showNewUserLists = ref(true);

const newUserRandomNews = ref([]);

const searchQuery = ref('');
const searchResults = ref([]);
const searchLoading = ref(false);
const searchNoResult = ref(false);

function userRecommend() {
    if(userId.value.length==0){
        ElMessage.error('用户id不能为空');
        return;
    }
    // 请求后端推荐接口（已有用户）
    fetch(`http://127.0.0.1:5000/api/recommend/user?user_id=${encodeURIComponent(userId.value)}&topk=20`)
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data)) {
                recommendations.value = data;
                showLists.value = true;
            } else {
                ElMessage.error(data.error || '获取推荐失败');
            }
        })
        .catch(() => {
            ElMessage.error('获取推荐失败');
        });
    // 请求用户历史
    fetch(`http://127.0.0.1:5000/api/recommend/user/history?user_id=${encodeURIComponent(userId.value)}`)
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data)) {
                userHistory.value = data;
            } else {
                userHistory.value = [];
            }
        })
        .catch(() => {
            userHistory.value = [];
        });
}

function newUserRecommend() {
    const newUserId = 'Utest';
    fetch(`http://127.0.0.1:5000/api/recommend/user?user_id=${encodeURIComponent(newUserId)}&topk=20`)
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data)) {
                newUserRecommendations.value = data;
                showNewUserLists.value = true;
            } else {
                ElMessage.error(data.error || '获取推荐失败');
            }
        })
        .catch(() => {
            ElMessage.error('获取推荐失败');
        });
    fetch(`http://127.0.0.1:5000/api/recommend/user/history?user_id=${encodeURIComponent(newUserId)}`)
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data)) {
                newUserHistory.value = data;
            } else {
                newUserHistory.value = [];
            }
        })
        .catch(() => {
            newUserHistory.value = [];
        });
}

function clearNewUserHistory() {
    // 调用后端接口清空新用户历史
    fetch('http://127.0.0.1:5000/api/recommend/clear?user_id=Utest', {
        method: 'DELETE'
    })
    .then(res => res.json())
    .then(data => {
            newUserHistory.value = [];
            ElMessage.success('历史记录已清空');
    })
}

async function handleNewUserRecommendClick(row) {
    try {
        const res = await fetch(`http://127.0.0.1:5000/api/recommend/click?news_id=${encodeURIComponent(row.news_id)}`);
        const data = await res.json();
        if (res.ok) {
            row.liked = true;
            ElMessage.success(`模拟用户已阅读：${row.title}`);
            // 可选：刷新历史记录
            newUserRecommend();
        } else {
            ElMessage.error(data.error || '点击失败');
        }
    } catch (e) {
        ElMessage.error('点击失败');
    }
}

async function fetchNewUserRandomNews() {
    try {
        const res = await fetch('http://127.0.0.1:5000/api/recommend/random');
        const data = await res.json();
        if (Array.isArray(data)) {
            newUserRandomNews.value = data.map(item => ({ ...item, liked: false }));
        } else {
            newUserRandomNews.value = [];
        }
    } catch (e) {
        newUserRandomNews.value = [];
        ElMessage.error('获取随机新闻失败');
    }
}

function handleNewUserRandomLike(row) {
    setTimeout(() => {
        row.liked = true;
        ElMessage.success(`喜欢了随机新闻：${row.title}`);
    }, 500);
}

async function smartSearch() {
    if (!searchQuery.value) {
        ElMessage.warning('请输入搜索内容');
        return;
    }
    searchLoading.value = true;
    searchNoResult.value = false;
    searchResults.value = [];
    try {
        // 实际后端API请求
        const res = await fetch(`http://127.0.0.1:5000/api/recommend/search?target_title=${encodeURIComponent(searchQuery.value)}`);
        if (!res.ok) throw new Error('搜索失败');
        const data = await res.json();
        searchResults.value = data;
        searchNoResult.value = data.length === 0;
    } catch (e) {
        searchNoResult.value = true;
        ElMessage.error('搜索失败');
    } finally {
        searchLoading.value = false;
    }
}
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

:deep(.el-table__body), :deep(.el-table__header) {
    font-size: 18px;
}
</style>