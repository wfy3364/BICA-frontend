import { createRouter, createWebHistory } from 'vue-router'
import NewsLifecycle from '../views/NewsLifecycle.vue';
import CategoryTrend from '../views/CategoryTrend.vue';
import UserInterest from '../views/UserInterest.vue';
import UserCompare from '../views/UserCompare.vue';
import HotNews from '../views/HotNews.vue';
import ComplexQuery from '../views/ComplexQuery.vue';
import QueryLog from '../views/QueryLog.vue';
import UserRecommend from '@/views/UserRecommend.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { 
      path: '/', 
      name: 'HotNews', 
      component: HotNews 
    },
    { 
      path: '/recommend', 
      name: 'Recommend', 
      component: UserRecommend
    },
    { 
      path: '/lifecycle', 
      name: 'NewsLifecycle', 
      component: NewsLifecycle 
    },
    { 
      path: '/trend', 
      name: 'CategoryTrend', 
      component: CategoryTrend 
    },
    { 
      path: '/interest', 
      name: 'UserInterest', 
      component: UserInterest 
    },
    { 
      path: '/compare', 
      name: 'UserCompare', 
      component: UserCompare 
    },
    { 
      path: '/query', 
      name: 'ComplexQuery', 
      component: ComplexQuery 
    },
    { 
      path: '/logs', 
      name: 'QueryLog', 
      component: QueryLog 
    }
  ],
})

export default router
