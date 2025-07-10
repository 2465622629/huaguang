<template>
  <view class="container" :style="{ backgroundImage: `url('${config.staticBaseUrl}/bg9.png')` }">
    <!-- 状态栏占位 -->
    <view class="status-bar"></view>
    
    <!-- 重构后的导航栏 -->
    <view class="nav-bar">
      <!-- 返回按钮 -->
      <view class="nav-back" @click="goBack">
        <uv-icon name="arrow-left" size="32" color="#333333"></uv-icon>
        <text class="back-text">返回</text>
      </view>
      
      <!-- 排序选项和搜索图标 - 位于同一行 -->
      <view class="nav-controls">
        <view class="sort-option" @click="showSortMenu">
          <text class="sort-text">{{ currentSort.label }}</text>
          <view class="sort-arrow">▼</view>
        </view>
        
        <view class="search-icon" @click="handleSearch">
          <uv-icon name="search" size="32" color="#46D7FF"></uv-icon>
        </view>
      </view>
    </view>
    
    <!-- 简化后的筛选标签栏 -->
    <view class="filter-bar">
      <scroll-view class="filter-tags" scroll-x="true" show-scrollbar="false">
        <view class="tags-wrapper">
          <view 
            v-for="(tag, index) in filterTags" 
            :key="index"
            class="filter-tag"
            :class="{ 'active': tag.active }"
            @click="toggleTag(index)"
          >
            <text class="tag-text" :class="{ 'active': tag.active }">{{ tag.label }}</text>
          </view>
        </view>
      </scroll-view>
    </view>
    
    <!-- 职位列表 - 带渐变背景 -->
    <scroll-view class="job-list" scroll-y="true" @scrolltolower="loadMore">
      <view 
        v-for="(job, index) in jobList" 
        :key="index"
        class="job-card"
        @click="goToJobDetail(job)"
      >
        <!-- 第一行：职位名称与薪资 -->
        <view class="job-card-header">
          <text class="job-title">{{ job.title }}</text>
          <text class="job-salary">{{ job.salary }}</text>
        </view>
        
        <!-- 第二行：地点与学历 -->
         <view class="job-card-info">
           <view class="info-item">
             <uv-icon :name="config.staticBaseUrl + '/icons/location.png'" :size="24" color="#888888"></uv-icon>
             <text class="info-text">{{ job.location }}</text>
           </view>
           <view class="info-item">
             <uv-icon :name="config.staticBaseUrl + '/icons/graduation.png'" :size="24" color="#888888"></uv-icon>
             <text class="info-text">{{ job.education }}</text>
           </view>
         </view>
        
        <!-- 箭头图标 -->
        <view class="arrow-icon">
          <uv-icon name="arrow-right" :size="32" color="#CCCCCC"></uv-icon>
        </view>
      </view>
      
      <!-- 加载更多提示 -->
      <view v-if="loading" class="loading-tip">
        <text class="loading-text">加载中...</text>
      </view>
      
      <view v-if="noMore" class="no-more-tip">
        <text class="no-more-text">没有更多数据了</text>
      </view>
    </scroll-view>
    
    <!-- 排序菜单弹窗 -->
    <uv-popup 
      v-model="showSort" 
      mode="bottom" 
      border-radius="20"
      :safe-area-inset-bottom="true"
    >
      <view class="sort-popup">
        <view class="popup-header">
          <text class="popup-title">排序方式</text>
          <view class="close-btn" @click="showSort = false">
            <uv-icon name="close" size="18" color="#666666"></uv-icon>
          </view>
        </view>
        <view class="sort-options">
          <view 
            v-for="(option, index) in sortOptions" 
            :key="index"
            class="sort-item"
            :class="{ 'selected': currentSort.value === option.value }"
            @click="selectSort(option)"
          >
            <text class="sort-item-text" :class="{ 'selected': currentSort.value === option.value }">
              {{ option.label }}
            </text>
            <uv-icon 
              v-if="currentSort.value === option.value"
              name="checkmark" 
              size="16" 
              color="#007AFF"
            ></uv-icon>
          </view>
        </view>
      </view>
    </uv-popup>
  </view>
</template>

<script>
// 导入企业API
import { enterpriseApi } from '@/api/index.js'
import config from '@/config/index.js'

export default {
  data() {
    return {
      config,
      
      // 企业级数据管理
      retryCount: 0,
      maxRetries: 3,
      cacheKey: 'recommended_jobs_cache',
      cacheExpiry: 8 * 60 * 1000, // 8分钟缓存
      lastUpdateTime: 0,
      
      // 用户偏好数据
      userPreferences: {
        preferredSalaryRange: '',
        preferredLocation: '',
        preferredIndustry: '',
        preferredJobType: '',
        experienceLevel: ''
      },
      
      // 排序相关
      showSort: false,
      currentSort: {
        label: '智能推荐',
        value: 'recommended'
      },
      sortOptions: [
        { label: '智能推荐', value: 'recommended' },
        { label: '最新发布', value: 'newest' },
        { label: '薪资最高', value: 'salary_high' },
        { label: '匹配度高', value: 'match_high' },
        { label: '距离最近', value: 'distance' }
      ],
      
      // 智能筛选标签
      filterTags: [
        { label: '为你推荐', active: true, value: 'recommended' },
        { label: '附近职位', active: false, value: 'nearby' },
        { label: '无学历限制', active: false, value: 'no_education_limit' },
        { label: '高薪职位', active: false, value: 'high_salary' },
        { label: '急招职位', active: false, value: 'urgent' },
        { label: '大厂职位', active: false, value: 'big_company' }
      ],
      
      // 职位列表数据
      jobList: [],
      hotJobs: [], // 热门职位
      originalList: [], // 保存原始数据用于本地筛选
      
      // 加载状态
      loading: false,
      noMore: false,
      page: 1,
      pageSize: 20,
      totalCount: 0,
      
      // 推荐算法相关
      recommendationReasons: new Map(), // 推荐理由
      userBehaviorData: {
        viewedJobs: new Set(),
        appliedJobs: new Set(),
        favoriteJobs: new Set()
      }
    }
  },
  
  async onLoad() {
    await this.loadRecommendedJobs()
  },
  
  onPullDownRefresh() {
    this.onRefresh().finally(() => {
      uni.stopPullDownRefresh()
    })
  },
  
  onReachBottom() {
    this.loadMore()
  },
  
  methods: {
    // ==================== 企业级数据加载方法 ====================
    
    /**
     * 智能推荐职位加载 - 企业级实现
     */
    async loadRecommendedJobs() {
      try {
        this.loading = true
        this.retryCount = 0
        
        // 检查缓存
        const cachedData = this.getCachedData()
        if (cachedData && this.isCacheValid()) {
          console.log('📦 使用缓存数据加载推荐职位')
          this.processJobData(cachedData)
          return
        }
        
        // 并行加载数据
        const [jobsResult, preferencesResult] = await Promise.allSettled([
          this.fetchRecommendedJobsWithRetry(),
          this.loadUserPreferences()
        ])
        
        // 处理职位数据
        if (jobsResult.status === 'fulfilled') {
          const jobData = jobsResult.value
          this.processJobData(jobData)
          this.setCacheData(jobData)
        } else {
          throw new Error('获取推荐职位失败')
        }
        
        // 处理用户偏好数据
        if (preferencesResult.status === 'fulfilled') {
          this.userPreferences = { ...this.userPreferences, ...preferencesResult.value }
        }
        
      } catch (error) {
        console.error('❌ 加载推荐职位失败:', error)
        await this.handleLoadError(error)
      } finally {
        this.loading = false
      }
    },
    
    /**
     * 带重试机制的职位数据获取
     */
    async fetchRecommendedJobsWithRetry() {
      for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
        try {
          const params = {
            page: this.page,
            pageSize: this.pageSize,
            sortType: this.currentSort.value,
            filters: this.getActiveFilters(),
            userPreferences: this.userPreferences
          }
          
          const response = await enterpriseApi.getRecommendedJobs(params)
          
          if (response && response.code === 200) {
            return response.data
          } else {
            throw new Error(response?.message || '获取数据失败')
          }
          
        } catch (error) {
          console.warn(`⚠️ 第${attempt + 1}次尝试失败:`, error.message)
          
          if (attempt === this.maxRetries) {
            throw error
          }
          
          // 指数退避延迟
          const delay = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 1000, 10000)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    },
    
    /**
     * 加载用户偏好设置
     */
    async loadUserPreferences() {
      try {
        const response = await enterpriseApi.getUserJobPreferences()
        if (response && response.code === 200) {
          return response.data
        }
      } catch (error) {
        console.warn('⚠️ 加载用户偏好失败:', error)
        return {}
      }
    },
    
    // ==================== 数据处理方法 ====================
    
    /**
     * 处理职位数据
     */
    processJobData(data) {
      if (!data) return
      
      const { list = [], total = 0, hotJobs = [], recommendations = {} } = data
      
      // 数据验证和清洗
      const validJobs = list.filter(job => job && job.id && job.title)
      
      if (this.page === 1) {
        this.jobList = validJobs
        this.originalList = [...validJobs]
      } else {
        this.jobList = [...this.jobList, ...validJobs]
        this.originalList = [...this.originalList, ...validJobs]
      }
      
      this.hotJobs = hotJobs
      this.totalCount = total
      this.noMore = this.jobList.length >= total
      
      // 处理推荐理由
      if (recommendations) {
        Object.entries(recommendations).forEach(([jobId, reason]) => {
          this.recommendationReasons.set(parseInt(jobId), reason)
        })
      }
      
      this.lastUpdateTime = Date.now()
    },
    
    /**
     * 获取激活的筛选条件
     */
    getActiveFilters() {
      return this.filterTags
        .filter(tag => tag.active)
        .map(tag => tag.value)
    },
    
    // ==================== 缓存管理方法 ====================
    
    /**
     * 获取缓存数据
     */
    getCachedData() {
      try {
        const cached = uni.getStorageSync(this.cacheKey)
        return cached ? JSON.parse(cached) : null
      } catch (error) {
        console.warn('⚠️ 读取缓存失败:', error)
        return null
      }
    },
    
    /**
     * 设置缓存数据
     */
    setCacheData(data) {
      try {
        const cacheData = {
          data,
          timestamp: Date.now(),
          page: this.page,
          filters: this.getActiveFilters(),
          sortType: this.currentSort.value
        }
        uni.setStorageSync(this.cacheKey, JSON.stringify(cacheData))
      } catch (error) {
        console.warn('⚠️ 设置缓存失败:', error)
      }
    },
    
    /**
     * 检查缓存是否有效
     */
    isCacheValid() {
      const cached = this.getCachedData()
      if (!cached) return false
      
      const now = Date.now()
      const isExpired = (now - cached.timestamp) > this.cacheExpiry
      const isSameFilter = JSON.stringify(cached.filters) === JSON.stringify(this.getActiveFilters())
      const isSameSort = cached.sortType === this.currentSort.value
      const isSamePage = cached.page === this.page
      
      return !isExpired && isSameFilter && isSameSort && isSamePage
    },
    
    // ==================== 用户交互方法 ====================
    
    /**
     * 返回上一页
     */
    goBack() {
      uni.navigateBack()
    },
    
    /**
     * 显示排序菜单
     */
    showSortMenu() {
      console.log('点击排序按钮')
      this.showSort = true
      console.log('showSort状态:', this.showSort)
    },
    
    /**
     * 选择排序方式
     */
    async selectSort(option) {
      this.currentSort = option
      this.showSort = false
      
      // 重置分页
      this.page = 1
      this.noMore = false
      
      // 重新加载数据
      await this.loadRecommendedJobs()
    },
    
    /**
     * 智能排序职位列表
     */
    sortJobList(sortType) {
      let sortedList = [...this.originalList]
      
      switch(sortType) {
        case 'recommended':
          // 按推荐算法排序（已由后端处理）
          break
        case 'newest':
          sortedList.sort((a, b) => new Date(b.publishTime) - new Date(a.publishTime))
          break
        case 'salary_high':
          sortedList.sort((a, b) => this.parseSalary(b.salary) - this.parseSalary(a.salary))
          break
        case 'match_high':
          sortedList.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
          break
        case 'distance':
          sortedList.sort((a, b) => (a.distance || 999) - (b.distance || 999))
          break
      }
      
      this.jobList = sortedList
    },
    
    /**
     * 解析薪资字符串为数字
     */
    parseSalary(salaryStr) {
      if (!salaryStr) return 0
      const matches = salaryStr.match(/(\d+)k?-?(\d+)?k?/i)
      if (matches) {
        const min = parseInt(matches[1]) * (matches[1].includes('k') ? 1000 : 1)
        const max = matches[2] ? parseInt(matches[2]) * (matches[2].includes('k') ? 1000 : 1) : min
        return (min + max) / 2
      }
      return 0
    },
    
    /**
     * 切换筛选标签
     */
    async toggleTag(index) {
      this.filterTags[index].active = !this.filterTags[index].active
      
      // 重置分页
      this.page = 1
      this.noMore = false
      
      // 重新加载数据
      await this.loadRecommendedJobs()
    },
    
    /**
     * 搜索
     */
    handleSearch() {
      uni.navigateTo({
        url: '/pages/user/index/search/index'
      })
    },
    
    /**
     * 记录职位浏览行为
     */
    recordJobView(jobId) {
      this.userBehaviorData.viewedJobs.add(jobId)
      
      // 异步上报用户行为
      this.reportUserBehavior('view', jobId)
    },
    
    /**
     * 上报用户行为数据
     */
    async reportUserBehavior(action, jobId, extra = {}) {
      try {
        await enterpriseApi.reportUserBehavior({
          action,
          jobId,
          timestamp: Date.now(),
          ...extra
        })
      } catch (error) {
        console.warn('⚠️ 上报用户行为失败:', error)
      }
    },
    
    /**
     * 跳转到职位详情
     */
    goToJobDetail(job) {
      // 记录浏览行为
      this.recordJobView(job.id)
      
      console.log('点击职位卡片', job)
      uni.navigateTo({
        url: `/pages/user/index/job-detail/index?id=${job.id}`
      })
    },
    
    /**
     * 快速申请职位
     */
    async quickApply(job) {
      try {
        const result = await uni.showModal({
          title: '确认申请',
          content: `确定要申请「${job.title}」职位吗？`,
          confirmText: '确认申请',
          cancelText: '取消'
        })
        
        if (!result.confirm) return
        
        uni.showLoading({ title: '申请中...' })
        
        const response = await enterpriseApi.applyJob({
          jobId: job.id,
          companyId: job.companyId
        })
        
        if (response && response.code === 200) {
          this.userBehaviorData.appliedJobs.add(job.id)
          this.reportUserBehavior('apply', job.id)
          
          uni.showToast({
            title: '申请成功',
            icon: 'success'
          })
        } else {
          throw new Error(response?.message || '申请失败')
        }
        
      } catch (error) {
        console.error('❌ 申请职位失败:', error)
        uni.showToast({
          title: error.message || '申请失败',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    },
    
    // ==================== 生命周期方法 ====================
    
    /**
     * 加载更多
     */
    async loadMore() {
      if (this.loading || this.noMore) return
      
      this.page++
      await this.loadRecommendedJobs()
    },
    
    /**
     * 下拉刷新
     */
    async onRefresh() {
      this.page = 1
      this.noMore = false
      this.jobList = []
      this.originalList = []
      
      // 清除缓存
      uni.removeStorageSync(this.cacheKey)
      
      await this.loadRecommendedJobs()
    },
    
    // ==================== 错误处理方法 ====================
    
    /**
     * 处理加载错误
     */
    async handleLoadError(error) {
      // 尝试使用过期缓存
      const expiredCache = this.getCachedData()
      if (expiredCache && expiredCache.data) {
        console.log('📦 使用过期缓存数据')
        this.processJobData(expiredCache.data)
        
        uni.showToast({
          title: '数据可能不是最新的',
          icon: 'none',
          duration: 2000
        })
        return
      }
      
      // 显示默认数据
      this.showDefaultData()
      
      uni.showToast({
        title: '加载失败，请稍后重试',
        icon: 'none'
      })
    },
    
    /**
     * 显示默认数据
     */
    showDefaultData() {
      this.jobList = [
        {
          id: 'default_1',
          title: '法务专员',
          salary: '6k-9k',
          location: '上海市 · 浦东新区',
          education: '本科',
          companyName: '示例企业',
          isDefault: true
        },
        {
          id: 'default_2',
          title: '法务助理',
          salary: '4k-6k',
          location: '北京市 · 朝阳区',
          education: '大专',
          companyName: '示例企业',
          isDefault: true
        }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  overflow: hidden;
}

// 状态栏占位
.status-bar {
  height: var(--status-bar-height);
  background-color: #F0F8FF;
  flex-shrink: 0;
}

// 重构后的导航栏
.nav-bar {
  height: 80px;
  // background-color: rgba(240, 248, 255, 0.9);
  position: relative;
  padding: 0 16px;
  flex-shrink: 0;
  
  .nav-back {
    position: absolute;
    top: 20px;
    left: 16px;
    display: flex;
    align-items: center;
    gap: 2px;
    
    .back-text {
      font-size: 17px;
      color: #333333;
      font-weight: 500;
    }
  }
  
  .nav-controls {
    position: absolute;
    top: 50px;
    left: 10px;
    right: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    .sort-option {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 5px 10px;
      min-width: 80px;
      min-height: 30px;
      cursor: pointer;
      
      .sort-text {
        font-size: 13px;
        color: #666666;
        font-weight: 400;
      }
      
      .sort-arrow {
        font-size: 10px;
        color: #666666;
        transform: scale(0.8);
      }
    }
    
    .search-icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

// 简化后的筛选栏
.filter-bar {
  height: 50px;
  // background-color: rgba(240, 248, 255, 0.9);
  padding: 0 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
  overflow: hidden;
  
  .filter-tags {
    height: 100%;
    width: 100%;
    
    .tags-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
      height: 100%;
      padding-right: 20px;
      
      .filter-tag {
        height: 40rpx; 
        padding: 0 12px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        background-color: #e2f6ff;
        white-space: nowrap;
        flex-shrink: 0;
        
        &.active {
          background-color: #D3E9FE;
        }
        
        .tag-text {
          font-size: 13px;
          color: #666666;
          font-weight: 400;
          
          &.active {
            color: #3A8DDE;
            font-weight: 500;
          }
        }
      }
    }
  }
}

// 职位列表 - 带渐变背景
.job-list {
  flex: 1;
  width: 100%;
  padding: 0 16px;
  overflow: hidden;
  box-sizing: border-box;
  
  .job-card {
    position: relative;
    width: calc(100% - 0px);
    max-width: 100%;
    box-sizing: border-box;
    background-color: #FFFFFF;
    border-radius: 10px;
    padding: 12px 16px;
    margin: 12px 0;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    overflow: hidden;
    
    &:active {
      transform: scale(0.98);
      transition: transform 0.1s ease;
    }
    
    .job-card-header {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      
      .job-title {
        font-size: 16px;
        color: #333333;
        font-weight: 600;
        line-height: 1.2;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-right: 12px;
      }
      
      .job-salary {
        font-size: 16px;
        color: #9ADBDA;
        font-weight: 600;
        white-space: nowrap;
      }
    }
    
    .job-card-info {
      display: flex;
      gap: 16px;
      margin-bottom: 8px;
      
      .info-item {
        display: flex;
        align-items: center;
        gap: 4px;
        
        .info-text {
          font-size: 12px;
          color: #666666;
          line-height: 1.2;
        }
      }
    }
    
    .arrow-icon {
      position: absolute;
      right: 16px;
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  
  .loading-tip, .no-more-tip {
    text-align: center;
    padding: 20px 0;
    
    .loading-text, .no-more-text {
      font-size: 14px;
      color: #999999;
    }
  }
}

// 排序弹窗
.sort-popup {
  background-color: #FFFFFF;
  
  .popup-header {
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    border-bottom: 1px solid #F0F0F0;
    
    .popup-title {
      font-size: 16px;
      color: #333333;
      font-weight: 600;
    }
    
    .close-btn {
      padding: 5px;
    }
  }
  
  .sort-options {
    padding: 10px 0;
    
    .sort-item {
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      
      &.selected {
        background-color: #F8F9FA;
      }
      
      .sort-item-text {
        font-size: 15px;
        color: #333333;
        
        &.selected {
          color: #007AFF;
          font-weight: 500;
        }
      }
    }
  }
}
</style>