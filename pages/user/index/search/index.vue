<template>
  <view class="search-container" :style="{ background: `url('${config.staticBaseUrl}/bg9.png') no-repeat center center/cover fixed` }">
    <!-- 状态栏占位 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
    
    <!-- 搜索区域 -->
    <view class="search-section">
      <uv-search 
        v-model="searchKeyword"
        shape="round"
        :bgColor="'#FFFFFF'"
        placeholder="搜索职位、企业、技能培训"
        actionText="搜索"
        :searchIconColor="'#5B8DEF'"
        :placeholderColor="'#BDBDBD'"
        :height="36"
        :showAction="true"
        :searchIconSize="36"
        :animation="true"
        :focus="autoFocus"
        :disabled="isLoading"
        @search="handleSearch"
        @custom="handleSearchAction"
        @change="handleSearchChange"
        @focus="handleSearchFocus"
        @blur="handleSearchBlur"
        :customStyle="searchCustomStyle"
      ></uv-search>
    </view>

    <!-- 搜索类型选择 -->
    <view class="search-type-section">
      <scroll-view class="type-scroll" scroll-x="true" show-scrollbar="false">
        <view 
          v-for="(type, index) in searchTypes" 
          :key="index"
          class="type-item"
          :class="{ 'active': currentSearchType === type.key }"
          @click="switchSearchType(type.key)"
        >
          <uv-icon :name="type.icon" size="32" :color="currentSearchType === type.key ? '#FFFFFF' : '#666666'"></uv-icon>
          <text class="type-text">{{ type.name }}</text>
        </view>
      </scroll-view>
    </view>

    <!-- 搜索建议 -->
    <view v-if="showSuggestions && searchSuggestions.length > 0" class="suggestions-section">
      <view class="suggestions-title">搜索建议</view>
      <view class="suggestions-list">
        <view 
          v-for="(suggestion, index) in searchSuggestions" 
          :key="index"
          class="suggestion-item"
          @click="selectSuggestion(suggestion)"
        >
          <uv-icon name="search" size="28" color="#999999"></uv-icon>
          <text class="suggestion-text">{{ suggestion.keyword || suggestion }}</text>
          <text v-if="suggestion.count" class="suggestion-count">{{ suggestion.count }}个结果</text>
        </view>
      </view>
    </view>

    <!-- 搜索历史 -->
    <view v-if="!showSuggestions && searchHistory.length > 0" class="history-section">
      <view class="history-header">
        <text class="history-title">搜索历史</text>
        <view class="clear-history" @click="clearSearchHistory">
          <uv-icon name="trash" size="32" color="#999999"></uv-icon>
          <text class="clear-text">清空</text>
        </view>
      </view>
      <view class="history-list">
        <view 
          v-for="(item, index) in searchHistory" 
          :key="index"
          class="history-item"
          @click="selectHistoryItem(item)"
        >
          <uv-icon name="clock" size="28" color="#CCCCCC"></uv-icon>
          <text class="history-text">{{ item.keyword }}</text>
          <text class="history-type">{{ getSearchTypeName(item.type) }}</text>
          <view class="remove-item" @click.stop="removeHistoryItem(index)">
            <uv-icon name="close" size="24" color="#CCCCCC"></uv-icon>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 热门搜索区域 -->
    <view v-if="!showSuggestions" class="hot-search-section">
      <view class="section-header">
        <text class="section-title">{{ getHotSearchTitle() }}</text>
        <view class="refresh-hot" @click="refreshHotSearch">
          <uv-icon name="refresh" size="28" color="#5B8DEF"></uv-icon>
        </view>
      </view>
      <view v-if="isLoadingHot" class="loading-hot">
        <uv-loading-icon mode="circle" size="40"></uv-loading-icon>
        <text class="loading-text">加载中...</text>
      </view>
      <view v-else class="hot-tags-container">
        <view 
          v-for="(tag, index) in currentHotList" 
          :key="index"
          class="hot-tag"
          :class="{ 'trending': tag.isTrending }"
          @click="selectHotTag(tag)"
        >
          <text class="tag-text">{{ tag.keyword || tag }}</text>
          <text v-if="tag.searchCount" class="tag-count">{{ formatSearchCount(tag.searchCount) }}</text>
          <view v-if="tag.isTrending" class="trending-icon">
            <uv-icon name="fire" size="20" color="#FF4500"></uv-icon>
          </view>
        </view>
      </view>
    </view>

    <!-- 快捷搜索区域 -->
    <view v-if="!showSuggestions && quickSearchItems.length > 0" class="quick-search-section">
      <text class="section-title">快捷搜索</text>
      <view class="quick-search-grid">
        <view 
          v-for="(item, index) in quickSearchItems" 
          :key="index"
          class="quick-item"
          @click="handleQuickSearch(item)"
        >
          <view class="quick-icon">
            <uv-icon :name="item.icon" size="48" :color="item.color"></uv-icon>
          </view>
          <text class="quick-text">{{ item.name }}</text>
          <text class="quick-desc">{{ item.description }}</text>
        </view>
      </view>
    </view>

    <!-- 加载状态遮罩 -->
    <view v-if="isLoading" class="loading-overlay">
      <view class="loading-content">
        <uv-loading-icon mode="flower" size="60"></uv-loading-icon>
        <text class="loading-title">正在搜索...</text>
      </view>
    </view>
  </view>
</template>

<script>
import config from '@/config/index.js'
import { 
  searchJobs, 
  getHotSearchKeywords, 
  getSearchSuggestions,
  searchCompanies,
  recordSearchHistory 
} from '@/api/modules/enterprise.js'
import { 
  searchSkillTrainingCourses,
  getHotTrainingKeywords 
} from '@/api/modules/skill-training.js'

export default {
  data() {
    return {
      config,
      
      // 搜索状态
      searchKeyword: '',
      currentSearchType: 'job', // job, company, course
      autoFocus: false,
      isLoading: false,
      isLoadingHot: false,
      showSuggestions: false,
      
      // 系统信息
      statusBarHeight: 0,
      
      // 搜索类型配置
      searchTypes: [
        { key: 'job', name: '职位', icon: 'briefcase' },
        { key: 'company', name: '企业', icon: 'home' },
        { key: 'course', name: '课程', icon: 'book' }
      ],
      
      // 搜索数据
      searchSuggestions: [],
      searchHistory: [],
      hotSearchData: {
        job: [],
        company: [],
        course: []
      },
      
      // 快捷搜索
      quickSearchItems: [
        {
          key: 'nearby_jobs',
          name: '附近职位',
          description: '基于位置推荐',
          icon: 'map-pin',
          color: '#52C41A'
        },
        {
          key: 'high_salary',
          name: '高薪职位',
          description: '薪资15K+',
          icon: 'wallet',
          color: '#FA8C16'
        },
        {
          key: 'remote_jobs',
          name: '远程工作',
          description: '在家办公',
          icon: 'wifi',
          color: '#1890FF'
        },
        {
          key: 'fresh_graduate',
          name: '应届生',
          description: '校招职位',
          icon: 'graduation-cap',
          color: '#722ED1'
        }
      ],
      
      // 样式配置
      searchCustomStyle: {
        margin: '0 30rpx'
      },
      
      // 防抖控制
      searchTimer: null,
      suggestionTimer: null,
      
      // 缓存配置
      cacheKeys: {
        searchHistory: 'user_search_history',
        hotSearch: 'hot_search_cache'
      },
      cacheExpiry: {
        hotSearch: 30 * 60 * 1000, // 30分钟
        suggestions: 5 * 60 * 1000 // 5分钟
      }
    }
  },
  
  computed: {
    currentHotList() {
      return this.hotSearchData[this.currentSearchType] || []
    }
  },
  
  async onLoad(options) {
    // 获取系统信息
    this.initializeSystemInfo()
    
    // 解析页面参数
    this.parsePageOptions(options)
    
    // 初始化搜索数据
    await this.initializeSearchData()
  },
  
  onShow() {
    // 页面显示时重新加载搜索历史
    this.loadSearchHistory()
  },
  
  onHide() {
    // 页面隐藏时清除定时器
    this.clearTimers()
  },
  
  onUnload() {
    // 页面销毁时清除定时器
    this.clearTimers()
  },
  
  methods: {
    /**
     * 初始化系统信息
     */
    initializeSystemInfo() {
      const systemInfo = uni.getSystemInfoSync()
      this.statusBarHeight = systemInfo.statusBarHeight || 0
    },
    
    /**
     * 解析页面参数
     */
    parsePageOptions(options) {
      if (options.keyword) {
        this.searchKeyword = decodeURIComponent(options.keyword)
        this.autoFocus = false
      } else {
        this.autoFocus = true
      }
      
      if (options.type && this.searchTypes.find(t => t.key === options.type)) {
        this.currentSearchType = options.type
      }
    },

    /**
     * 初始化搜索数据
     */
    async initializeSearchData() {
      try {
        // 并行加载多个数据源
        await Promise.allSettled([
          this.loadSearchHistory(),
          this.loadHotSearchKeywords(),
          this.preloadQuickSearchData()
        ])
      } catch (error) {
        console.error('初始化搜索数据失败:', error)
      }
    },

    /**
     * 加载搜索历史
     */
    loadSearchHistory() {
      try {
        const history = uni.getStorageSync(this.cacheKeys.searchHistory) || []
        this.searchHistory = history.slice(0, 10) // 最多显示10条历史记录
      } catch (error) {
        console.error('加载搜索历史失败:', error)
        this.searchHistory = []
      }
    },

    /**
     * 保存搜索历史
     */
    saveSearchHistory(keyword, type = this.currentSearchType) {
      try {
        // 移除重复项
        this.searchHistory = this.searchHistory.filter(item => 
          !(item.keyword === keyword && item.type === type)
        )
        
        // 添加到头部
        this.searchHistory.unshift({
          keyword,
          type,
          timestamp: Date.now()
        })
        
        // 限制历史记录数量
        this.searchHistory = this.searchHistory.slice(0, 20)
        
        // 保存到本地存储
        uni.setStorageSync(this.cacheKeys.searchHistory, this.searchHistory)
      } catch (error) {
        console.error('保存搜索历史失败:', error)
      }
    },

    /**
     * 加载热门搜索关键词
     */
    async loadHotSearchKeywords() {
      if (this.isLoadingHot) return
      
      this.isLoadingHot = true
      
      try {
        // 检查缓存
        const cachedData = this.getHotSearchCache()
        if (cachedData) {
          this.hotSearchData = cachedData
          this.isLoadingHot = false
          
          // 后台刷新数据
          this.refreshHotSearchData()
          return
        }
        
        // 并行加载不同类型的热门搜索
        const [jobHotRes, companyHotRes, courseHotRes] = await Promise.allSettled([
          this.executeWithRetry(() => getHotSearchKeywords({ type: 'job', limit: 12 })),
          this.executeWithRetry(() => getHotSearchKeywords({ type: 'company', limit: 10 })),
          this.executeWithRetry(() => getHotTrainingKeywords({ limit: 10 }))
        ])

        // 处理职位热门搜索
        if (jobHotRes.status === 'fulfilled' && jobHotRes.value?.data) {
          this.hotSearchData.job = this.formatHotSearchData(jobHotRes.value.data)
        }

        // 处理企业热门搜索
        if (companyHotRes.status === 'fulfilled' && companyHotRes.value?.data) {
          this.hotSearchData.company = this.formatHotSearchData(companyHotRes.value.data)
        }

        // 处理课程热门搜索
        if (courseHotRes.status === 'fulfilled' && courseHotRes.value?.data) {
          this.hotSearchData.course = this.formatHotSearchData(courseHotRes.value.data)
        }

        // 缓存数据
        this.saveHotSearchCache(this.hotSearchData)
        
      } catch (error) {
        console.error('加载热门搜索关键词失败:', error)
        this.setDefaultHotSearch()
      } finally {
        this.isLoadingHot = false
      }
    },

    /**
     * 后台刷新热门搜索数据
     */
    async refreshHotSearchData() {
      try {
        await this.loadHotSearchKeywords()
      } catch (error) {
        console.warn('后台刷新热门搜索失败:', error)
      }
    },

    /**
     * 格式化热门搜索数据
     */
    formatHotSearchData(data) {
      return data.map((item, index) => ({
        keyword: item.keyword || item,
        searchCount: item.searchCount || item.count,
        isTrending: index < 3, // 前3个标记为热门
        rank: index + 1
      }))
    },

    /**
     * 设置默认热门搜索
     */
    setDefaultHotSearch() {
      this.hotSearchData = {
        job: [
          { keyword: '新媒体运营', isTrending: true },
          { keyword: '前端开发', isTrending: true },
          { keyword: '产品经理', isTrending: true },
          { keyword: '软件测试', isTrending: false },
          { keyword: '数据分析', isTrending: false },
          { keyword: 'UI设计', isTrending: false }
        ],
        company: [
          { keyword: '阿里巴巴', isTrending: true },
          { keyword: '腾讯', isTrending: true },
          { keyword: '字节跳动', isTrending: true },
          { keyword: '美团', isTrending: false },
          { keyword: '小米', isTrending: false }
        ],
        course: [
          { keyword: '短视频剪辑', isTrending: true },
          { keyword: '思维导图', isTrending: true },
          { keyword: '自媒体运营', isTrending: true },
          { keyword: 'Excel技巧', isTrending: false },
          { keyword: 'PPT制作', isTrending: false }
        ]
      }
    },

    /**
     * 缓存管理 - 获取热门搜索缓存
     */
    getHotSearchCache() {
      try {
        const cached = uni.getStorageSync(this.cacheKeys.hotSearch)
        if (cached && cached.timestamp) {
          const isExpired = Date.now() - cached.timestamp > this.cacheExpiry.hotSearch
          if (!isExpired) {
            return cached.data
          }
        }
      } catch (error) {
        console.error('获取热门搜索缓存失败:', error)
      }
      return null
    },

    /**
     * 缓存管理 - 保存热门搜索缓存
     */
    saveHotSearchCache(data) {
      try {
        uni.setStorageSync(this.cacheKeys.hotSearch, {
          data,
          timestamp: Date.now()
        })
      } catch (error) {
        console.error('保存热门搜索缓存失败:', error)
      }
    },

    /**
     * 预加载快捷搜索数据
     */
    async preloadQuickSearchData() {
      // 快捷搜索数据预处理
      this.quickSearchItems = this.quickSearchItems.filter(item => {
        // 根据当前搜索类型过滤快捷搜索项
        if (this.currentSearchType === 'job') {
          return ['nearby_jobs', 'high_salary', 'remote_jobs', 'fresh_graduate'].includes(item.key)
        } else if (this.currentSearchType === 'company') {
          return ['nearby_companies', 'startup', 'large_enterprise'].includes(item.key)
        } else {
          return ['free_courses', 'video_courses', 'certification'].includes(item.key)
        }
      })
    },

    /**
     * 指数退避重试机制
     */
    async executeWithRetry(apiCall, maxRetries = 3) {
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          return await apiCall()
        } catch (error) {
          if (attempt === maxRetries) {
            throw error
          }
          
          const delay = Math.min(1000 * Math.pow(2, attempt), 8000) + Math.random() * 500
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    },

    /**
     * 搜索输入变化处理 - 防抖搜索建议
     */
    handleSearchChange(value) {
      this.searchKeyword = value
      
      // 清除之前的定时器
      if (this.suggestionTimer) {
        clearTimeout(this.suggestionTimer)
      }
      
      if (value.trim()) {
        // 延迟500ms获取搜索建议
        this.suggestionTimer = setTimeout(() => {
          this.getSearchSuggestions(value.trim())
        }, 500)
      } else {
        this.searchSuggestions = []
        this.showSuggestions = false
      }
    },

    /**
     * 获取搜索建议
     */
    async getSearchSuggestions(keyword) {
      if (!keyword || keyword.length < 2) {
        this.searchSuggestions = []
        this.showSuggestions = false
        return
      }

      try {
        const response = await this.executeWithRetry(() => 
          getSearchSuggestions({
            keyword,
            type: this.currentSearchType,
            limit: 8
          })
        )

        if (response?.data) {
          this.searchSuggestions = response.data.map(item => ({
            keyword: item.keyword || item,
            count: item.count || item.resultCount,
            type: this.currentSearchType
          }))
          this.showSuggestions = this.searchSuggestions.length > 0
        }
      } catch (error) {
        console.error('获取搜索建议失败:', error)
        this.searchSuggestions = []
        this.showSuggestions = false
      }
    },

    /**
     * 搜索框聚焦处理
     */
    handleSearchFocus() {
      // 如果有输入内容且有建议，显示建议
      if (this.searchKeyword.trim() && this.searchSuggestions.length > 0) {
        this.showSuggestions = true
      }
    },

    /**
     * 搜索框失焦处理
     */
    handleSearchBlur() {
      // 延迟隐藏建议，让用户有时间点击
      setTimeout(() => {
        this.showSuggestions = false
      }, 200)
    },

    /**
     * 执行搜索
     */
    async handleSearch() {
      const keyword = this.searchKeyword.trim()
      if (!keyword) {
        uni.showToast({
          title: '请输入搜索关键词',
          icon: 'none'
        })
        return
      }

      await this.performSearch(keyword, this.currentSearchType)
    },

    /**
     * 搜索操作按钮处理
     */
    handleSearchAction() {
      if (this.searchKeyword.trim()) {
        this.handleSearch()
      } else {
        this.handleCancel()
      }
    },

    /**
     * 执行具体搜索逻辑
     */
    async performSearch(keyword, type) {
      if (this.isLoading) return

      try {
        this.isLoading = true
        this.showSuggestions = false

        // 保存搜索历史
        this.saveSearchHistory(keyword, type)

        // 记录搜索行为（异步执行）
        this.recordSearchBehavior(keyword, type)

        // 根据搜索类型跳转到不同页面
        let targetUrl = ''
        switch (type) {
          case 'job':
            targetUrl = `/pages/user/index/job-search-result/index?keyword=${encodeURIComponent(keyword)}`
            break
          case 'company':
            targetUrl = `/pages/user/index/company-search-result/index?keyword=${encodeURIComponent(keyword)}`
            break
          case 'course':
            targetUrl = `/pages/user/index/course-search-result/index?keyword=${encodeURIComponent(keyword)}`
            break
          default:
            targetUrl = `/pages/user/index/job-search-result/index?keyword=${encodeURIComponent(keyword)}`
        }

        // 页面跳转
        uni.navigateTo({
          url: targetUrl,
          success: () => {
            console.log(`跳转${type}搜索结果页成功`)
          },
          fail: (error) => {
            console.error(`跳转${type}搜索结果页失败:`, error)
            uni.showToast({
              title: '页面跳转失败',
              icon: 'none'
            })
          }
        })

      } catch (error) {
        console.error('搜索处理异常:', error)
        uni.showToast({
          title: '搜索失败，请稍后重试',
          icon: 'none'
        })
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 记录搜索行为
     */
    async recordSearchBehavior(keyword, type) {
      try {
        await recordSearchHistory({
          keyword,
          type,
          timestamp: Date.now()
        })
      } catch (error) {
        console.warn('记录搜索行为失败:', error)
      }
    },

    /**
     * 选择搜索建议
     */
    selectSuggestion(suggestion) {
      this.searchKeyword = suggestion.keyword
      this.performSearch(suggestion.keyword, this.currentSearchType)
    },

    /**
     * 选择搜索历史
     */
    selectHistoryItem(item) {
      this.currentSearchType = item.type
      this.searchKeyword = item.keyword
      this.performSearch(item.keyword, item.type)
    },

    /**
     * 选择热门标签
     */
    selectHotTag(tag) {
      const keyword = tag.keyword || tag
      this.searchKeyword = keyword
      this.performSearch(keyword, this.currentSearchType)
    },

    /**
     * 快捷搜索处理
     */
    handleQuickSearch(item) {
      let keyword = ''
      switch (item.key) {
        case 'nearby_jobs':
          keyword = '附近职位'
          break
        case 'high_salary':
          keyword = '高薪'
          break
        case 'remote_jobs':
          keyword = '远程'
          break
        case 'fresh_graduate':
          keyword = '应届生'
          break
        default:
          keyword = item.name
      }
      
      this.searchKeyword = keyword
      this.performSearch(keyword, this.currentSearchType)
    },

    /**
     * 切换搜索类型
     */
    switchSearchType(type) {
      if (this.currentSearchType === type) return
      
      this.currentSearchType = type
      this.searchSuggestions = []
      this.showSuggestions = false
      
      // 如果有搜索内容，重新获取建议
      if (this.searchKeyword.trim()) {
        this.handleSearchChange(this.searchKeyword)
      }
      
      // 预加载快捷搜索数据
      this.preloadQuickSearchData()
    },

    /**
     * 刷新热门搜索
     */
    async refreshHotSearch() {
      // 清除缓存
      try {
        uni.removeStorageSync(this.cacheKeys.hotSearch)
      } catch (error) {
        console.warn('清除热门搜索缓存失败:', error)
      }
      
      // 重新加载
      await this.loadHotSearchKeywords()
      
      uni.showToast({
        title: '已刷新',
        icon: 'success',
        duration: 1000
      })
    },

    /**
     * 清空搜索历史
     */
    clearSearchHistory() {
      uni.showModal({
        title: '提示',
        content: '确定要清空所有搜索历史吗？',
        success: (res) => {
          if (res.confirm) {
            try {
              uni.removeStorageSync(this.cacheKeys.searchHistory)
              this.searchHistory = []
              uni.showToast({
                title: '已清空',
                icon: 'success'
              })
            } catch (error) {
              console.error('清空搜索历史失败:', error)
              uni.showToast({
                title: '清空失败',
                icon: 'none'
              })
            }
          }
        }
      })
    },

    /**
     * 移除单个搜索历史
     */
    removeHistoryItem(index) {
      this.searchHistory.splice(index, 1)
      try {
        uni.setStorageSync(this.cacheKeys.searchHistory, this.searchHistory)
      } catch (error) {
        console.error('更新搜索历史失败:', error)
      }
    },

    /**
     * 取消搜索
     */
    handleCancel() {
      uni.navigateBack({
        fail: () => {
          uni.switchTab({
            url: '/pages/user/index/index'
          })
        }
      })
    },
    
    /**
     * 清除定时器
     */
    clearTimers() {
      if (this.searchTimer) {
        clearTimeout(this.searchTimer)
        this.searchTimer = null
      }
      if (this.suggestionTimer) {
        clearTimeout(this.suggestionTimer)
        this.suggestionTimer = null
      }
    },

    /**
     * 工具函数 - 获取热门搜索标题
     */
    getHotSearchTitle() {
      const titles = {
        job: '热门职位',
        company: '热门企业',
        course: '热门课程'
      }
      return titles[this.currentSearchType] || '热门搜索'
    },

    /**
     * 工具函数 - 获取搜索类型名称
     */
    getSearchTypeName(type) {
      const typeObj = this.searchTypes.find(t => t.key === type)
      return typeObj ? typeObj.name : '职位'
    },

    /**
     * 工具函数 - 格式化搜索次数
     */
    formatSearchCount(count) {
      if (!count) return ''
      if (count < 1000) return count.toString()
      if (count < 10000) return (count / 1000).toFixed(1) + 'k'
      return (count / 10000).toFixed(1) + 'w'
    }
  }
}
</script>

<style lang="scss" scoped>
.search-container {
  height: 100vh;
}

.status-bar {
  width: 100%;
}

.search-section {
  padding: 80rpx 0 0 0 ;
}

.search-type-section {
  padding: 0 30rpx;
  margin-top: 20rpx;
  background-color: #F5F5F5;
  border-radius: 10rpx;
  overflow-x: auto;
  white-space: nowrap;
}

.type-scroll {
  height: 80rpx;
}

.type-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 20rpx;
  margin-right: 20rpx;
  border-radius: 40rpx;
  background-color: #E0E0E0;
  color: #666666;
  font-size: 28rpx;
  font-weight: 500;
  white-space: nowrap;
}

.type-item.active {
  background-color: #5B8DEF;
  color: #FFFFFF;
}

.suggestions-section {
  padding: 0 30rpx;
  margin-top: 20rpx;
  background-color: #F5F5F5;
  border-radius: 10rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.suggestions-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #E0E0E0;
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  padding: 10rpx 0;
}

.suggestion-item {
  display: flex;
  align-items: center;
  padding: 15rpx 0;
  border-bottom: 1rpx solid #E0E0E0;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-text {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
  margin-left: 10rpx;
}

.suggestion-count {
  font-size: 24rpx;
  color: #999999;
  margin-left: 10rpx;
}

.history-section {
  padding: 0 30rpx;
  margin-top: 20rpx;
  background-color: #F5F5F5;
  border-radius: 10rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #E0E0E0;
}

.history-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
}

.clear-history {
  display: flex;
  align-items: center;
  font-size: 28rpx;
  color: #5B8DEF;
}

.history-list {
  display: flex;
  flex-direction: column;
  padding: 10rpx 0;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 15rpx 0;
  border-bottom: 1rpx solid #E0E0E0;
}

.history-item:last-child {
  border-bottom: none;
}

.history-text {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
  margin-left: 10rpx;
}

.history-type {
  font-size: 24rpx;
  color: #999999;
  margin-left: 10rpx;
}

.remove-item {
  margin-left: 10rpx;
}

.hot-search-section {
  padding: 0 30rpx;
  margin-top: 20rpx;
  background-color: #F5F5F5;
  border-radius: 10rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #E0E0E0;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
}

.refresh-hot {
  display: flex;
  align-items: center;
  font-size: 28rpx;
  color: #5B8DEF;
}

.loading-hot {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 0;
}

.loading-text {
  margin-top: 10rpx;
  font-size: 28rpx;
  color: #999999;
}

.hot-tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  padding: 10rpx 0;
}

.hot-tag {
  display: flex;
  align-items: center;
  background-color: #D2E6FF;
  color: #162F73;
  font-size: 28rpx;
  padding: 1rpx 24rpx;
  border-radius: 50rpx;
  white-space: nowrap;
}

.hot-tag.trending {
  background-color: #FFE6D8;
  color: #FF4500;
}

.tag-text {
  flex: 1;
}

.tag-count {
  font-size: 24rpx;
  color: #999999;
  margin-left: 10rpx;
}

.trending-icon {
  margin-left: 10rpx;
}

.quick-search-section {
  padding: 0 30rpx;
  margin-top: 20rpx;
  background-color: #F5F5F5;
  border-radius: 10rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.quick-search-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200rpx, 1fr));
  gap: 20rpx;
  padding: 10rpx 0;
}

.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15rpx 0;
  border-radius: 10rpx;
  background-color: #FFFFFF;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.quick-icon {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 40rpx;
  background-color: #E0E0E0;
  margin-bottom: 10rpx;
}

.quick-text {
  font-size: 28rpx;
  font-weight: 500;
  color: #333333;
  text-align: center;
  margin-bottom: 5rpx;
}

.quick-desc {
  font-size: 24rpx;
  color: #999999;
  text-align: center;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 0;
  background-color: #FFFFFF;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.2);
}

.loading-title {
  margin-top: 10rpx;
  font-size: 28rpx;
  color: #999999;
}
</style> 