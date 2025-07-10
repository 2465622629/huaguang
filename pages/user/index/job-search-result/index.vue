<template>
  <view class="job-search-container">
    <!-- 状态栏占位 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
    
    <!-- 搜索区域 -->
    <view class="search-section">
      <uv-search 
        v-model="searchKeyword"
        shape="round"
        :bgColor="'#FFFFFF'"
        placeholder="新媒体"
        actionText="取消"
        :searchIconColor="'#A0D2EB'"
        :placeholderColor="'#333333'"
        :height="38"
        :showAction="true"
        :animation="true"
        @search="onSearch"
        @custom="onCancel"
        @change="onSearchChange"
        :customStyle="searchCustomStyle"
      ></uv-search>
    </view>
    
    <!-- 搜索结果数量提示 -->
    <view class="result-count-section">
      <text class="result-count-text">共找到{{ resultCount }}个相关职位</text>
    </view>
    
    <!-- 职位列表区域 -->
    <scroll-view class="job-list-container" scroll-y="true">
      <!-- 加载状态 -->
      <view v-if="loading" class="loading-container">
        <uv-loading-icon mode="circle" color="#20B2AA" size="40"></uv-loading-icon>
        <text class="loading-text">正在搜索职位...</text>
      </view>
      
      <!-- 错误提示 -->
      <view v-else-if="error" class="error-container">
        <uv-icon name="error-circle" size="60" color="#FF6B6B"></uv-icon>
        <text class="error-text">{{ error }}</text>
      </view>
      
      <!-- 职位列表 -->
      <view 
        v-else
        v-for="(job, index) in jobList" 
        :key="job.id"
        class="job-card"
        @click="onJobCardClick(job)"
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
        
        <!-- 右侧箭头图标 -->
        <view class="arrow-icon">
          <uv-icon name="arrow-right" :size="32" color="#CCCCCC"></uv-icon>
        </view>
      </view>
    </scroll-view>
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
      cacheKey: 'job_search_cache',
      cacheExpiry: 5 * 60 * 1000, // 5分钟缓存
      lastUpdateTime: 0,
      searchDebounceTimer: null,
      
      // 搜索相关
      searchKeyword: '新媒体',
      originalKeyword: '', // 保存原始搜索词
      searchHistory: [], // 搜索历史
      hotKeywords: [], // 热门搜索词
      
      // 筛选和排序
      filters: {
        salaryRange: '', // 薪资范围
        experience: '', // 工作经验
        education: '', // 学历要求
        location: '', // 工作地点
        jobType: '', // 工作类型
        companySize: '', // 公司规模
        industry: '' // 行业
      },
      sortType: 'relevance', // 排序类型：relevance, salary_high, salary_low, publish_time
      
      // 筛选选项
      filterOptions: {
        salaryRanges: [
          { label: '不限', value: '' },
          { label: '3k以下', value: '0-3000' },
          { label: '3k-5k', value: '3000-5000' },
          { label: '5k-8k', value: '5000-8000' },
          { label: '8k-12k', value: '8000-12000' },
          { label: '12k-20k', value: '12000-20000' },
          { label: '20k以上', value: '20000-999999' }
        ],
        experiences: [
          { label: '不限', value: '' },
          { label: '应届生', value: 'fresh' },
          { label: '1-3年', value: '1-3' },
          { label: '3-5年', value: '3-5' },
          { label: '5-10年', value: '5-10' },
          { label: '10年以上', value: '10+' }
        ],
        educations: [
          { label: '不限', value: '' },
          { label: '初中及以下', value: 'junior' },
          { label: '高中/中专', value: 'high_school' },
          { label: '大专', value: 'college' },
          { label: '本科', value: 'bachelor' },
          { label: '硕士', value: 'master' },
          { label: '博士', value: 'doctor' }
        ]
      },
      
      // 页面状态
      statusBarHeight: 0,
      resultCount: 0,
      loading: false,
      error: null,
      noMore: false,
      currentPage: 1,
      pageSize: 20,
      
      // 数据列表
      jobList: [],
      originalList: [], // 保存原始数据用于本地筛选
      selectedJobs: new Set(), // 选中的职位（批量操作）
      
      // UI状态
      showFilters: false,
      showSort: false,
      showBatchActions: false,
      
      // 搜索建议
      searchSuggestions: [],
      showSuggestions: false,
      
      searchCustomStyle: {
        margin: '0 30rpx'
      }
    }
  },
  async onLoad(options) {
    // 获取状态栏高度
    this.getStatusBarHeight()
    
    // 获取传入的搜索关键词
    if (options && options.keyword) {
      this.searchKeyword = decodeURIComponent(options.keyword)
      this.originalKeyword = this.searchKeyword
    }
    
    // 加载搜索历史和热门关键词
    await this.loadSearchData()
    
    // 执行初始搜索
    await this.performEnterpriseSearch(this.searchKeyword)
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
     * 企业级职位搜索 - 智能搜索实现
     */
    async performEnterpriseSearch(keyword) {
      try {
        this.loading = true
        this.retryCount = 0
        
        // 检查缓存
        const cacheKey = this.generateCacheKey(keyword)
        const cachedData = this.getCachedData(cacheKey)
        if (cachedData && this.isCacheValid(cachedData)) {
          console.log('📦 使用缓存数据加载搜索结果')
          this.processSearchData(cachedData)
          return
        }
        
        // 并行加载数据
        const [searchResult, filtersResult, hotKeywordsResult] = await Promise.allSettled([
          this.fetchJobSearchWithRetry(keyword),
          this.loadFilterOptions(),
          this.loadHotKeywords()
        ])
        
        // 处理搜索结果
        if (searchResult.status === 'fulfilled') {
          const searchData = searchResult.value
          this.processSearchData(searchData)
          this.setCacheData(cacheKey, searchData)
          
          // 保存搜索历史
          this.saveSearchHistory(keyword)
        } else {
          throw new Error('搜索职位失败')
        }
        
        // 处理筛选选项
        if (filtersResult.status === 'fulfilled') {
          this.updateFilterOptions(filtersResult.value)
        }
        
        // 处理热门关键词
        if (hotKeywordsResult.status === 'fulfilled') {
          this.hotKeywords = hotKeywordsResult.value || []
        }
        
      } catch (error) {
        console.error('❌ 搜索职位失败:', error)
        await this.handleSearchError(error)
      } finally {
        this.loading = false
      }
    },
    
    /**
     * 带重试机制的职位搜索
     */
    async fetchJobSearchWithRetry(keyword) {
      for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
        try {
          const params = {
            keyword: keyword.trim(),
            page: this.currentPage,
            pageSize: this.pageSize,
            sortType: this.sortType,
            filters: this.getActiveFilters()
          }
          
          const response = await enterpriseApi.searchJobs(params)
          
          if (response && response.code === 200) {
            return response.data
          } else {
            throw new Error(response?.message || '搜索失败')
          }
          
        } catch (error) {
          console.warn(`⚠️ 第${attempt + 1}次搜索尝试失败:`, error.message)
          
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
     * 加载筛选选项
     */
    async loadFilterOptions() {
      try {
        const response = await enterpriseApi.getJobFilters()
        if (response && response.code === 200) {
          return response.data
        }
      } catch (error) {
        console.warn('⚠️ 加载筛选选项失败:', error)
        return null
      }
    },
    
    /**
     * 加载热门关键词
     */
    async loadHotKeywords() {
      try {
        const response = await enterpriseApi.getHotSearchKeywords()
        if (response && response.code === 200) {
          return response.data.keywords || []
        }
      } catch (error) {
        console.warn('⚠️ 加载热门关键词失败:', error)
        return []
      }
    },
    
    // ==================== 数据处理方法 ====================
    
    /**
     * 处理搜索数据
     */
    processSearchData(data) {
      if (!data) return
      
      const { list = [], total = 0, suggestions = [], statistics = {} } = data
      
      // 数据验证和清洗
      const validJobs = list.filter(job => job && job.id && job.title)
      const formattedJobs = this.formatJobData(validJobs)
      
      if (this.currentPage === 1) {
        this.jobList = formattedJobs
        this.originalList = [...formattedJobs]
      } else {
        this.jobList = [...this.jobList, ...formattedJobs]
        this.originalList = [...this.originalList, ...formattedJobs]
      }
      
      this.resultCount = total
      this.noMore = this.jobList.length >= total
      this.searchSuggestions = suggestions
      
      this.lastUpdateTime = Date.now()
    },
    
    /**
     * 格式化职位数据
     */
    formatJobData(apiDataList) {
      if (!Array.isArray(apiDataList)) {
        return []
      }
      
      return apiDataList.map(item => {
        // 处理薪资格式转换
        let salary = '面议'
        if (item.salaryMin && item.salaryMax) {
          const minK = Math.floor(item.salaryMin / 1000)
          const maxK = Math.floor(item.salaryMax / 1000)
          salary = `${minK}k-${maxK}k`
        } else if (item.salary) {
          salary = item.salary
        }
        
        return {
          id: item.id,
          title: item.title || '职位名称',
          salary: salary,
          location: item.location || '工作地点',
          education: item.educationRequirement || item.education || '学历要求',
          companyName: item.companyName || '公司名称',
          experience: item.experienceRequirement || '经验要求',
          publishTime: item.publishTime || '',
          jobType: item.jobType || '',
          welfare: item.welfare || [],
          matchScore: item.matchScore || 0,
          isUrgent: item.isUrgent || false,
          companySize: item.companySize || '',
          industry: item.industry || ''
        }
      })
    },
    
    /**
     * 获取激活的筛选条件
     */
    getActiveFilters() {
      const activeFilters = {}
      
      Object.keys(this.filters).forEach(key => {
        if (this.filters[key]) {
          activeFilters[key] = this.filters[key]
        }
      })
      
      return activeFilters
    },
    
    /**
     * 更新筛选选项
     */
    updateFilterOptions(filterData) {
      if (!filterData) return
      
      // 更新动态筛选选项
      if (filterData.locations) {
        this.filterOptions.locations = filterData.locations
      }
      if (filterData.industries) {
        this.filterOptions.industries = filterData.industries
      }
      if (filterData.companySizes) {
        this.filterOptions.companySizes = filterData.companySizes
      }
    },
    
    // ==================== 缓存管理方法 ====================
    
    /**
     * 生成缓存键
     */
    generateCacheKey(keyword) {
      const filterKey = JSON.stringify(this.getActiveFilters())
      return `${this.cacheKey}_${keyword}_${this.sortType}_${filterKey}_${this.currentPage}`
    },
    
    /**
     * 获取缓存数据
     */
    getCachedData(cacheKey) {
      try {
        const cached = uni.getStorageSync(cacheKey)
        return cached ? JSON.parse(cached) : null
      } catch (error) {
        console.warn('⚠️ 读取搜索缓存失败:', error)
        return null
      }
    },
    
    /**
     * 设置缓存数据
     */
    setCacheData(cacheKey, data) {
      try {
        const cacheData = {
          data,
          timestamp: Date.now()
        }
        uni.setStorageSync(cacheKey, JSON.stringify(cacheData))
      } catch (error) {
        console.warn('⚠️ 设置搜索缓存失败:', error)
      }
    },
    
    /**
     * 检查缓存是否有效
     */
    isCacheValid(cachedData) {
      if (!cachedData) return false
      
      const now = Date.now()
      const isExpired = (now - cachedData.timestamp) > this.cacheExpiry
      
      return !isExpired
    },
    
    // ==================== 搜索功能方法 ====================
    
    /**
     * 获取状态栏高度
     */
    getStatusBarHeight() {
      const systemInfo = uni.getSystemInfoSync()
      this.statusBarHeight = systemInfo.statusBarHeight || 0
    },
    
    /**
     * 搜索提交处理
     */
    async onSearch(value) {
      const keyword = value || this.searchKeyword
      console.log('搜索内容:', keyword)
      
      // 重置分页
      this.currentPage = 1
      this.noMore = false
      this.jobList = []
      this.originalList = []
      
      await this.performEnterpriseSearch(keyword)
    },
    
    /**
     * 搜索内容变化处理 - 防抖优化
     */
    onSearchChange(value) {
      console.log('搜索内容变化:', value)
      
      // 清除之前的定时器
      if (this.searchDebounceTimer) {
        clearTimeout(this.searchDebounceTimer)
      }
      
      // 设置防抖延迟
      this.searchDebounceTimer = setTimeout(() => {
        this.loadSearchSuggestions(value)
      }, 300)
    },
    
    /**
     * 加载搜索建议
     */
    async loadSearchSuggestions(keyword) {
      if (!keyword || keyword.length < 2) {
        this.searchSuggestions = []
        this.showSuggestions = false
        return
      }
      
      try {
        const response = await enterpriseApi.getSearchSuggestions({ keyword })
        if (response && response.code === 200) {
          this.searchSuggestions = response.data.suggestions || []
          this.showSuggestions = this.searchSuggestions.length > 0
        }
      } catch (error) {
        console.warn('⚠️ 加载搜索建议失败:', error)
      }
    },
    
    /**
     * 取消搜索处理
     */
    onCancel() {
      console.log('取消搜索')
      uni.navigateBack()
    },
    
    // ==================== 筛选和排序方法 ====================
    
    /**
     * 应用筛选条件
     */
    async applyFilters(newFilters) {
      this.filters = { ...this.filters, ...newFilters }
      
      // 重置分页
      this.currentPage = 1
      this.noMore = false
      this.jobList = []
      this.originalList = []
      
      await this.performEnterpriseSearch(this.searchKeyword)
    },
    
    /**
     * 应用排序
     */
    async applySorting(sortType) {
      this.sortType = sortType
      
      // 重置分页
      this.currentPage = 1
      this.noMore = false
      this.jobList = []
      this.originalList = []
      
      await this.performEnterpriseSearch(this.searchKeyword)
    },
    
    /**
     * 本地排序（用于快速响应）
     */
    sortJobsLocally(sortType) {
      let sortedList = [...this.originalList]
      
      switch(sortType) {
        case 'salary_high':
          sortedList.sort((a, b) => this.parseSalary(b.salary) - this.parseSalary(a.salary))
          break
        case 'salary_low':
          sortedList.sort((a, b) => this.parseSalary(a.salary) - this.parseSalary(b.salary))
          break
        case 'publish_time':
          sortedList.sort((a, b) => new Date(b.publishTime) - new Date(a.publishTime))
          break
        case 'relevance':
        default:
          sortedList.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
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
    
    // ==================== 用户交互方法 ====================
    
    /**
     * 职位卡片点击处理
     */
    onJobCardClick(job) {
      console.log('点击职位卡片:', job)
      
      // 记录点击行为
      this.recordJobClick(job.id)
      
      // 跳转到职位详情页
      uni.navigateTo({
        url: `/pages/user/index/job-detail/index?id=${job.id}`
      })
    },
    
    /**
     * 记录职位点击行为
     */
    async recordJobClick(jobId) {
      try {
        await enterpriseApi.recordJobClick({
          jobId,
          searchKeyword: this.searchKeyword,
          timestamp: Date.now()
        })
      } catch (error) {
        console.warn('⚠️ 记录点击行为失败:', error)
      }
    },
    
    /**
     * 批量申请职位
     */
    async batchApplyJobs() {
      if (this.selectedJobs.size === 0) {
        uni.showToast({
          title: '请先选择职位',
          icon: 'none'
        })
        return
      }
      
      try {
        const result = await uni.showModal({
          title: '批量申请',
          content: `确定要申请选中的${this.selectedJobs.size}个职位吗？`,
          confirmText: '确认申请',
          cancelText: '取消'
        })
        
        if (!result.confirm) return
        
        uni.showLoading({ title: '申请中...' })
        
        const jobIds = Array.from(this.selectedJobs)
        const response = await enterpriseApi.batchApplyJobs({ jobIds })
        
        if (response && response.code === 200) {
          uni.showToast({
            title: '批量申请成功',
            icon: 'success'
          })
          
          // 清空选择
          this.selectedJobs.clear()
          this.showBatchActions = false
        } else {
          throw new Error(response?.message || '批量申请失败')
        }
        
      } catch (error) {
        console.error('❌ 批量申请失败:', error)
        uni.showToast({
          title: error.message || '申请失败',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    },
    
    // ==================== 搜索历史管理 ====================
    
    /**
     * 加载搜索数据
     */
    async loadSearchData() {
      // 加载搜索历史
      try {
        const history = uni.getStorageSync('job_search_history')
        this.searchHistory = history ? JSON.parse(history) : []
      } catch (error) {
        console.warn('⚠️ 加载搜索历史失败:', error)
        this.searchHistory = []
      }
    },
    
    /**
     * 保存搜索历史
     */
    saveSearchHistory(keyword) {
      if (!keyword || keyword.trim() === '') return
      
      try {
        // 移除重复项
        this.searchHistory = this.searchHistory.filter(item => item !== keyword)
        
        // 添加到开头
        this.searchHistory.unshift(keyword)
        
        // 限制历史记录数量
        if (this.searchHistory.length > 10) {
          this.searchHistory = this.searchHistory.slice(0, 10)
        }
        
        // 保存到本地存储
        uni.setStorageSync('job_search_history', JSON.stringify(this.searchHistory))
      } catch (error) {
        console.warn('⚠️ 保存搜索历史失败:', error)
      }
    },
    
    // ==================== 生命周期方法 ====================
    
    /**
     * 加载更多
     */
    async loadMore() {
      if (this.loading || this.noMore) return
      
      this.currentPage++
      await this.performEnterpriseSearch(this.searchKeyword)
    },
    
    /**
     * 下拉刷新
     */
    async onRefresh() {
      this.currentPage = 1
      this.noMore = false
      this.jobList = []
      this.originalList = []
      
      // 清除缓存
      const cacheKey = this.generateCacheKey(this.searchKeyword)
      uni.removeStorageSync(cacheKey)
      
      await this.performEnterpriseSearch(this.searchKeyword)
    },
    
    // ==================== 错误处理方法 ====================
    
    /**
     * 处理搜索错误
     */
    async handleSearchError(error) {
      // 尝试使用过期缓存
      const cacheKey = this.generateCacheKey(this.searchKeyword)
      const expiredCache = this.getCachedData(cacheKey)
      if (expiredCache && expiredCache.data) {
        console.log('📦 使用过期缓存数据')
        this.processSearchData(expiredCache.data)
        
        uni.showToast({
          title: '数据可能不是最新的',
          icon: 'none',
          duration: 2000
        })
        return
      }
      
      // 显示错误信息
      if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
        this.error = '网络连接失败，请检查网络设置'
      } else if (error.message) {
        this.error = error.message
      } else {
        this.error = '搜索失败，请稍后重试'
      }
      
      this.jobList = []
      this.resultCount = 0
    }
  }
}
</script>

<style lang="scss" scoped>
.job-search-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #EBF5FF 0%, #F8FCFF 100%);
}

.status-bar {
  width: 100%;
}

.search-section {
  padding: 40rpx 0 30rpx 0;
}

.result-count-section {
  padding: 0 30rpx;
  margin-bottom: 20rpx;
}

.result-count-text {
  font-size: 26rpx;
  color: #666666;
}

.job-list-container {
  flex: 1;
  padding: 0 30rpx;
  width: 100%;
  box-sizing: border-box;
}

.job-card {
  position: relative;
  width: calc(100% - 0px);
  max-width: 100%;
  box-sizing: border-box;
  background-color: #FFFFFF;
  border-radius: 10px;
  padding: 12px 16px;
  margin: 12px 0;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  
  &:active {
    transform: scale(0.98);
    transition: transform 0.1s ease;
  }
}

.job-card-header {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
  padding-right: 40rpx;
}

.job-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #222222;
  margin-right: 20rpx;
}

.job-salary {
  font-size: 32rpx;
  color: #20B2AA;
  font-weight: 500;
}

.job-card-info {
  display: flex;
  align-items: center;
  gap: 30rpx;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.info-text {
  font-size: 24rpx;
  color: #888888;
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

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  gap: 20rpx;
}

.loading-text {
  font-size: 28rpx;
  color: #666666;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  gap: 20rpx;
}

.error-text {
  font-size: 28rpx;
  color: #FF6B6B;
  text-align: center;
  padding: 0 40rpx;
}
</style>