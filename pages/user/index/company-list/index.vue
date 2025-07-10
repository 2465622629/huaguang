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
    
    <!-- 公司列表 - 带渐变背景 -->
    <scroll-view class="company-list" scroll-y="true" @scrolltolower="loadMore">
      <view 
        v-for="(company, index) in companyList" 
        :key="index"
        class="company-card"
        @click="goToCompanyDetail(company)"
      >
        <!-- 公司Logo占位符 -->
        <view class="company-logo">
          <uv-image 
            v-if="company.logo"
            :src="company.logo" 
            width="50px" 
            height="50px" 
            mode="aspectFill"
            radius="25px"
          ></uv-image>
          <view v-else class="logo-placeholder"></view>
        </view>
        
        <!-- 公司信息 -->
        <view class="company-info">
          <text class="company-name">{{ company.name }}</text>
          <text class="company-desc">{{ company.industry }} · {{ company.type }} {{ company.scale }}</text>
        </view>
        
        <!-- 箭头图标 -->
        <view class="arrow-icon">
          <text class="arrow-text">></text>
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
      searchDebounceTimer: null,
      cacheKey: 'company_list_cache',
      cacheExpiry: 5 * 60 * 1000, // 5分钟缓存
      lastUpdateTime: 0,
      
      // 排序相关
      showSort: false,
      currentSort: {
        label: '默认排序',
        value: 'default'
      },
      sortOptions: [
        { label: '默认排序', value: 'default' },
        { label: '最新发布', value: 'newest' },
        { label: '薪资最高', value: 'salary_high' },
        { label: '规模最大', value: 'scale_large' },
        { label: '距离最近', value: 'distance' },
        { label: '评分最高', value: 'rating' }
      ],
      
      // 智能筛选标签
      filterTags: [
        { label: '推荐', active: true, value: 'recommended' },
        { label: '附近', active: false, value: 'nearby' },
        { label: '无学历限制', active: false, value: 'no_education_limit' },
        { label: '高薪', active: false, value: 'high_salary' },
        { label: '大厂', active: false, value: 'big_company' },
        { label: '福利好', active: false, value: 'good_benefits' }
      ],
      
      // 搜索相关
      searchKeyword: '',
      searchHistory: [],
      
      // 公司列表数据
      companyList: [],
      originalList: [], // 保存原始数据用于本地筛选
      
      // 加载状态
      loading: false,
      noMore: false,
      page: 1,
      pageSize: 20,
      totalCount: 0,
      
      // 收藏功能
      favoriteCompanies: new Set()
    }
  },
  
  onLoad() {
    this.initializeData()
  },
  onShow() {
    // 页面显示时检查收藏状态
    this.loadFavoriteCompanies()
  },
  onPullDownRefresh() {
    this.refreshWithCache()
  },
  onReachBottom() {
    this.loadMore()
  },
  
  methods: {
    // 初始化数据
    async initializeData() {
      this.loadFavoriteCompanies()
      this.loadSearchHistory()
      await this.loadCompanyListWithCache()
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack()
    },
    
    // 显示排序菜单
    showSortMenu() {
      console.log('点击排序按钮')
      this.showSort = true
      console.log('showSort状态:', this.showSort)
    },
    
    // 选择排序方式
    selectSort(option) {
      this.currentSort = option
      this.showSort = false
      this.applyFiltersAndSort()
    },
    
    // 智能筛选标签切换
    toggleTag(index) {
      this.filterTags[index].active = !this.filterTags[index].active
      
      // 防抖处理，避免频繁请求
      if (this.searchDebounceTimer) {
        clearTimeout(this.searchDebounceTimer)
      }
      
      this.searchDebounceTimer = setTimeout(() => {
        this.applyFiltersAndSort()
      }, 300)
    },
    
    // 搜索功能增强
    handleSearch() {
      uni.navigateTo({
        url: '/pages/user/index/search/index'
      })
    },
    
    // 跳转到公司详情
    goToCompanyDetail(company) {
      console.log('点击公司卡片', company)
      // 记录浏览历史
      this.recordBrowseHistory(company)
      uni.navigateTo({
        url: `/pages/user/index/company-detail/index?id=${company.id}`
      })
    },
    
    // 智能缓存加载公司列表
    async loadCompanyListWithCache() {
      try {
        // 检查缓存
        const cachedData = this.getCachedData()
        if (cachedData && this.isCacheValid()) {
          console.log('使用缓存数据加载公司列表')
          this.companyList = cachedData.list
          this.originalList = [...cachedData.list]
          this.totalCount = cachedData.total
          this.lastUpdateTime = cachedData.timestamp
          return
        }
        
        // 缓存无效，从API加载
        await this.loadCompanyListFromApi()
        
      } catch (error) {
        console.error('加载公司列表失败:', error)
        // 尝试使用过期缓存
        const expiredCache = this.getExpiredCache()
        if (expiredCache) {
          console.log('使用过期缓存作为降级方案')
          this.companyList = expiredCache.list
          this.originalList = [...expiredCache.list]
          uni.showToast({
            title: '数据可能不是最新的',
            icon: 'none'
          })
        }
      }
    },
    
    // 从API加载公司列表（带重试机制）
    async loadCompanyListFromApi() {
      if (this.loading || this.noMore) return
      
      this.loading = true
      this.retryCount = 0
      
      while (this.retryCount < this.maxRetries) {
        try {
          if (this.retryCount === 0) {
            uni.showLoading({ title: '加载中...' })
          } else {
            uni.showLoading({ title: `重试中(${this.retryCount}/${this.maxRetries})...` })
          }
          
          const params = this.buildRequestParams()
          const response = await this.callApiWithTimeout(params)
          
          // 增强的数据结构验证
          console.log('API响应数据结构:', response)
          
          if (response && response.data && Array.isArray(response.data.records)) {
            const processedData = this.processCompanyData(response.data)
            console.log('处理后的企业数据:', processedData)
            
            if (this.page === 1) {
              this.companyList = processedData
              this.originalList = [...processedData]
              // 保存到缓存
              this.saveToCache({
                list: processedData,
                total: response.data.total || processedData.length,
                timestamp: Date.now()
              })
            } else {
              this.companyList.push(...processedData)
              this.originalList.push(...processedData)
            }
            
            this.totalCount = response.data.total || this.companyList.length
            
            // 检查是否还有更多数据
            if (processedData.length < this.pageSize) {
              this.noMore = true
            } else {
              this.page++
            }
            
            uni.hideLoading()
            this.loading = false
            return
            
          } else {
            console.error('API响应数据格式不正确:', {
              hasResponse: !!response,
              hasData: !!(response && response.data),
              hasRecords: !!(response && response.data && response.data.records),
              isRecordsArray: !!(response && response.data && Array.isArray(response.data.records))
            })
            throw new Error('API返回数据格式错误: 缺少必要的data.records字段或格式不正确')
          }
          
        } catch (error) {
          this.retryCount++
          console.error(`加载企业列表失败 (尝试 ${this.retryCount}/${this.maxRetries}):`, error)
          
          if (this.retryCount < this.maxRetries) {
            // 指数退避重试策略
            const delay = Math.min(1000 * Math.pow(2, this.retryCount - 1), 8000) + Math.random() * 1000
            await this.delay(delay)
          } else {
            // 最终失败处理
            uni.hideLoading()
            this.loading = false
            this.handleApiError(error)
            throw error
          }
        }
      }
    },
    
    // 构建请求参数
    buildRequestParams() {
      const params = {
        page: this.page,
        size: this.pageSize
      }
      
      // 添加排序参数
      if (this.currentSort.value !== 'default') {
        params.sort = this.currentSort.value
      }
      
      // 添加筛选参数
      const activeFilters = this.filterTags.filter(tag => tag.active)
      if (activeFilters.length > 0) {
        params.filters = activeFilters.map(tag => tag.value).join(',')
      }
      
      // 添加搜索关键词
      if (this.searchKeyword) {
        params.keyword = this.searchKeyword
      }
      
      return params
    },
    
    // 带超时的API调用
    async callApiWithTimeout(params, timeout = 10000) {
      return Promise.race([
        enterpriseApi.getEnterpriseList(params),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('请求超时')), timeout)
        )
      ])
    },
    
    // 处理公司数据
    processCompanyData(responseData) {
      const apiData = responseData.records || []
              return apiData.map(item => ({
          id: item.id || item.enterpriseId,
          name: this.validateString(item.companyName || item.name, '未知企业'),
          industry: this.validateString(item.industry, '未知行业'),
          type: this.validateString(item.companyType || item.type, ''),
          scale: this.validateString(item.companySize || item.scale, ''),
        logo: item.logo || item.logoUrl || '',
        rating: item.rating || 0,
        location: item.location || item.address || '',
        jobCount: item.activeJobCount || 0,
        isFavorite: this.favoriteCompanies.has(item.id || item.enterpriseId)
      }))
    },
    
    // 应用筛选和排序
    applyFiltersAndSort() {
      let filteredList = [...this.originalList]
      
      // 应用筛选
      const activeFilters = this.filterTags.filter(tag => tag.active)
      if (activeFilters.length > 0) {
        filteredList = this.applyLocalFilters(filteredList, activeFilters)
      }
      
      // 应用排序
      filteredList = this.applySorting(filteredList)
      
      this.companyList = filteredList
    },
    
    // 本地筛选逻辑
    applyLocalFilters(list, filters) {
      return list.filter(company => {
        return filters.every(filter => {
          switch (filter.value) {
            case 'recommended':
              return company.rating >= 4.0
            case 'nearby':
              return company.location && company.location.includes('上海')
            case 'no_education_limit':
              return true // 需要根据实际数据结构调整
            case 'high_salary':
              return company.jobCount > 5
            case 'big_company':
              return company.scale && (company.scale.includes('1000') || company.scale.includes('以上'))
            case 'good_benefits':
              return company.rating >= 4.5
            default:
              return true
          }
        })
      })
    },
    
    // 排序逻辑
    applySorting(list) {
      const sortedList = [...list]
      
      switch (this.currentSort.value) {
        case 'newest':
          return sortedList.sort((a, b) => (b.id || 0) - (a.id || 0))
        case 'salary_high':
          return sortedList.sort((a, b) => (b.jobCount || 0) - (a.jobCount || 0))
        case 'scale_large':
          return sortedList.sort((a, b) => this.compareScale(b.scale, a.scale))
        case 'rating':
          return sortedList.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        case 'distance':
          return sortedList.sort((a, b) => a.name.localeCompare(b.name))
        default:
          return sortedList
      }
    },
    
    // 比较公司规模
    compareScale(scaleA, scaleB) {
      const getScaleValue = (scale) => {
        if (!scale) return 0
        if (scale.includes('1000以上')) return 1000
        if (scale.includes('500-999')) return 750
        if (scale.includes('100-499')) return 300
        if (scale.includes('50-99')) return 75
        return 25
      }
      return getScaleValue(scaleA) - getScaleValue(scaleB)
    },
    
    // 下拉刷新（带缓存清理）
    async refreshWithCache() {
      try {
        // 清除缓存
        uni.removeStorageSync(this.cacheKey)
        
        // 重置状态
        this.page = 1
        this.noMore = false
        this.companyList = []
        this.originalList = []
        this.loading = false
        
        // 重新加载
        await this.loadCompanyListFromApi()
        
      } catch (error) {
        console.error('刷新失败:', error)
      } finally {
        uni.stopPullDownRefresh()
      }
    },
    
    // 加载更多
    loadMore() {
      this.loadCompanyListFromApi()
    },
    
    // 缓存管理方法
    getCachedData() {
      try {
        const cached = uni.getStorageSync(this.cacheKey)
        return cached ? JSON.parse(cached) : null
      } catch (error) {
        console.error('读取缓存失败:', error)
        return null
      }
    },
    
    isCacheValid() {
      try {
        const cacheTime = uni.getStorageSync(`${this.cacheKey}_time`)
        if (!cacheTime) return false
        return (Date.now() - cacheTime) < this.cacheExpiry
      } catch (error) {
        return false
      }
    },
    
    getExpiredCache() {
      try {
        const cached = uni.getStorageSync(this.cacheKey)
        return cached ? JSON.parse(cached) : null
      } catch (error) {
        return null
      }
    },
    
    saveToCache(data) {
      try {
        uni.setStorageSync(this.cacheKey, JSON.stringify(data))
        uni.setStorageSync(`${this.cacheKey}_time`, Date.now())
      } catch (error) {
        console.error('保存缓存失败:', error)
      }
    },
    
    // 收藏功能
    loadFavoriteCompanies() {
      try {
        const favorites = uni.getStorageSync('favorite_companies') || []
        this.favoriteCompanies = new Set(favorites)
      } catch (error) {
        console.error('加载收藏列表失败:', error)
      }
    },
    
    toggleFavorite(company) {
      const companyId = company.id
      if (this.favoriteCompanies.has(companyId)) {
        this.favoriteCompanies.delete(companyId)
        company.isFavorite = false
        uni.showToast({ title: '已取消收藏', icon: 'none' })
      } else {
        this.favoriteCompanies.add(companyId)
        company.isFavorite = true
        uni.showToast({ title: '已收藏', icon: 'success' })
      }
      
      // 保存到本地存储
      try {
        uni.setStorageSync('favorite_companies', Array.from(this.favoriteCompanies))
      } catch (error) {
        console.error('保存收藏状态失败:', error)
      }
    },
    
    // 搜索历史管理
    loadSearchHistory() {
      try {
        this.searchHistory = uni.getStorageSync('company_search_history') || []
      } catch (error) {
        console.error('加载搜索历史失败:', error)
      }
    },
    
    saveSearchHistory(keyword) {
      if (!keyword || keyword.trim() === '') return
      
      const trimmedKeyword = keyword.trim()
      // 移除重复项并添加到开头
      this.searchHistory = this.searchHistory.filter(item => item !== trimmedKeyword)
      this.searchHistory.unshift(trimmedKeyword)
      
      // 只保留最近10条
      if (this.searchHistory.length > 10) {
        this.searchHistory = this.searchHistory.slice(0, 10)
      }
      
      try {
        uni.setStorageSync('company_search_history', this.searchHistory)
      } catch (error) {
        console.error('保存搜索历史失败:', error)
      }
    },
    
    // 浏览历史记录
    recordBrowseHistory(company) {
      try {
        const history = uni.getStorageSync('company_browse_history') || []
        const newRecord = {
          ...company,
          browsedAt: new Date().toISOString()
        }
        
        // 移除重复项并添加到开头
        const filteredHistory = history.filter(item => item.id !== company.id)
        filteredHistory.unshift(newRecord)
        
        // 只保留最近20条
        if (filteredHistory.length > 20) {
          filteredHistory.splice(20)
        }
        
        uni.setStorageSync('company_browse_history', filteredHistory)
      } catch (error) {
        console.error('记录浏览历史失败:', error)
      }
    },
    
    // 工具方法
    validateString(value, defaultValue) {
      return (typeof value === 'string' && value.trim()) ? value.trim() : defaultValue
    },
    
    async delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    },
    
    handleApiError(error) {
      let message = '加载企业列表失败'
      
      if (error.message) {
        if (error.message.includes('timeout') || error.message.includes('超时')) {
          message = '网络请求超时，请检查网络连接'
        } else if (error.message.includes('Network Error') || error.message.includes('网络错误')) {
          message = '网络连接异常，请检查网络设置'
        } else if (error.message.includes('404')) {
          message = '服务暂时不可用'
        } else if (error.message.includes('500')) {
          message = '服务器内部错误，请稍后重试'
        }
      }
      
      uni.showToast({
        title: message,
        icon: 'none',
        duration: 3000
      })
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

// 公司列表 - 带渐变背景
.company-list {
  flex: 1;
  width: 100%;
  padding: 0 16px;
  overflow: hidden;
  box-sizing: border-box;
  
  .company-card {
    width: calc(100% - 0px);
    max-width: 100%;
    box-sizing: border-box;
    background-color: #FFFFFF;
    border-radius: 10px;
    padding: 12px 16px;
    margin: 12px 0;
    display: flex;
    align-items: center;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    overflow: hidden;
    
    .company-logo {
      width: 52px;
      height: 52px;
      margin-right: 10px;
      flex-shrink: 0;
      
      .logo-placeholder {
        width: 52px;
        height: 52px;
        border-radius: 26px;
        background-color: #D9D9D9;
      }
    }
    
    .company-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
      overflow: hidden;
      
      .company-name {
        font-size: 16px;
        color: #333333;
        font-weight: 600;
        line-height: 1.2;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 100%;
      }
      
      .company-desc {
        font-size: 12px;
        color: #888888;
        line-height: 1.2;
        font-weight: 400;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 100%;
      }
    }
    
    .arrow-icon {
      width: 20px;
      margin-left: 10px;
      flex-shrink: 0;
      text-align: center;
      
      .arrow-text {
        font-size: 14px;
        color: #AAAAAA;
        font-weight: 400;
      }
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