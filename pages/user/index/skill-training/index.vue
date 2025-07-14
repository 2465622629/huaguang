<template>
  <view class="skill-training-container" :style="{ backgroundImage: 'url(' + backgroundImage + ')' }">
    <!-- 自定义导航栏 -->
    <uv-navbar 
      :safeAreaInsetTop="true"
      placeholder
      bgColor="#A0D8FF"
      :border="false"
    >
      <template #left>
        <uv-icon 
          name="arrow-left" 
          size="42" 
          color="#50A0E0"
          :bold="true"
          @click="goBack"
        ></uv-icon>
      </template>
      <template #right>
        <uv-icon 
          name="search" 
          size="42" 
          color="#50A0E0"
          @click="handleSearch"
        ></uv-icon>
      </template>
    </uv-navbar>

    <!-- 页面内容 -->
    <view class="content">
      <!-- Banner区域 -->
              <view class="banner-section" :style="{ backgroundImage: 'url(' + skillBannerImage + ')' }">
        <!-- 技能培训标题 -->
      </view>

      <!-- 标签导航栏 -->
      <view class="tabs-section">
        <view class="custom-tabs">
          <view 
            v-for="(tab, index) in tabsList" 
            :key="index"
            class="tab-item"
            :class="{ 'tab-item--active': currentTab === index }"
            @click="handleTabChange(index)"
          >
            {{ tab.name }}
            <text v-if="tab.courseCount > 0" class="course-count">({{ tab.courseCount }})</text>
          </view>
        </view>
      </view>

      <!-- 可滚动的课程列表容器 -->
      <scroll-view 
        class="scroll-container" 
        scroll-y="true" 
        :style="{ height: scrollViewHeight + 'px' }"
        enable-back-to-top="true"
        show-scrollbar="false"
        refresher-enabled="true"
        :refresher-triggered="isRefreshing"
        @refresherrefresh="onRefresh"
        @scrolltolower="onLoadMore"
      >
        <!-- 加载状态 -->
        <view v-if="isLoading && coursesList.length === 0" class="loading-container">
          <uv-loading-icon mode="flower" size="60"></uv-loading-icon>
          <text class="loading-text">正在加载课程数据...</text>
        </view>

        <!-- 错误状态 -->
        <view v-else-if="errorState.hasError && coursesList.length === 0" class="error-container">
          <uv-icon name="wifi-off" size="120" color="#cccccc"></uv-icon>
          <text class="error-text">{{ errorState.errorMessage }}</text>
          <uv-button 
            v-if="errorState.canRetry"
            text="重试" 
            type="primary" 
            size="small"
            @click="retryLoad"
            :loading="isLoading"
            class="retry-button"
          />
        </view>

        <!-- 课程卡片列表 -->
        <view v-else class="courses-section">
          <!-- 空状态 -->
          <view v-if="coursesList.length === 0" class="empty-container">
            <uv-icon name="folder-open" size="120" color="#cccccc"></uv-icon>
            <text class="empty-text">该分类暂无课程</text>
            <text class="empty-subtitle">试试其他分类或稍后再来看看</text>
          </view>
          
          <!-- 课程网格 -->
          <uv-grid v-else :col="2" :border="false">
            <uv-grid-item v-for="(course, index) in coursesList" :key="course.id">
              <view class="course-card" @click="handleCourseClick(course)">
                <!-- 课程缩略图 -->
                <view class="course-thumbnail">
                  <image 
                    v-if="course.thumbnail"
                    :src="course.thumbnail"
                    class="course-image"
                    mode="aspectFill"
                    @error="onImageError"
                  />
                  <view v-else class="placeholder-image">
                    <uv-icon name="play-circle" size="60" color="#ffffff"></uv-icon>
                  </view>
                  
                  <!-- 爱心收藏图标 -->
                  <view class="favorite-icon" @click.stop="toggleFavorite(index)">
                    <uv-icon 
                      :name="course.isFavorite ? 'heart-fill' : 'heart'" 
                      :color="course.isFavorite ? '#FF4D4F' : '#FFFFFF'"
                      size="32"
                    ></uv-icon>
                  </view>
                  
                  <!-- 视频时长 -->
                  <view class="duration">{{ course.duration }}</view>
                  
                  <!-- 价格标签 -->
                  <view v-if="course.price > 0" class="price-tag">
                    <text class="price">¥{{ course.price }}</text>
                    <text v-if="course.originalPrice > course.price" class="original-price">¥{{ course.originalPrice }}</text>
                  </view>
                  <view v-else class="free-tag">免费</view>
                </view>
                
                <!-- 课程标题 -->
                <view class="course-title">{{ course.title }}</view>
                
                <!-- 讲师信息 -->
                <view class="instructor-info">
                  <text class="instructor-name">{{ course.instructor }}</text>
                  <view v-if="course.rating > 0" class="rating">
                    <uv-icon name="star-fill" size="24" color="#FFB020"></uv-icon>
                    <text class="rating-text">{{ course.rating.toFixed(1) }}</text>
                  </view>
                </view>
                
                <!-- 底部信息 -->
                <view class="course-info">
                  <text class="play-count">{{ course.playCount }}</text>
                  <view class="share-icon" @click.stop="handleShare(course)">
                    <uv-icon name="share-fill" size="28" color="#888888"></uv-icon>
                  </view>
                </view>
              </view>
            </uv-grid-item>
          </uv-grid>
          
          <!-- 加载更多状态 -->
          <view v-if="isLoadingMore" class="loading-more">
            <uv-loading-icon mode="circle" size="40"></uv-loading-icon>
            <text class="loading-more-text">加载更多课程...</text>
          </view>
          
          <!-- 没有更多数据 -->
          <view v-else-if="!hasMore && coursesList.length > 0" class="no-more">
            <text class="no-more-text">已显示全部课程</text>
          </view>
        </view>
      </scroll-view>
    </view>
    
    <!-- 浮动操作按钮 -->
    <view class="fab-container">
      <view class="fab-button" @click="scrollToTop">
        <uv-icon name="arrow-up" size="32" color="#ffffff"></uv-icon>
      </view>
    </view>
  </view>
</template>

<script>
import { staticBaseUrl } from '@/config/index.js'
import skillTrainingApi from '@/api/modules/skill-training.js'

export default {
  data() {
    return {
      currentTab: 0,
      scrollViewHeight: 400, // 滚动容器高度，单位px
                    backgroundImage: staticBaseUrl + '/bg3.png', // 背景图片
              skillBannerImage: staticBaseUrl + '/skill.png', // 技能培训banner图片
      
      // 企业级状态管理
      isLoading: false,
      isRefreshing: false,
      isLoadingMore: false,
      hasMore: true,
      currentPage: 1,
      pageSize: 20,
      
      // 智能缓存系统
      cacheKey: 'skill_training_home_cache',
      categoryCacheKey: 'skill_training_categories_cache',
      cacheExpiry: 10 * 60 * 1000, // 10分钟缓存
      lastLoadTime: 0,
      
      // 重试机制配置
      retryConfig: {
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 8000,
        backoffFactor: 2
      },
      
      // 错误处理状态
      errorState: {
        hasError: false,
        errorType: '',
        errorMessage: '',
        canRetry: false
      },
      
      // 数据状态
      tabsList: [],
      coursesList: [],
      originalCoursesList: [], // 保存原始课程数据用于分类筛选
      
      // 默认数据（降级方案）
      defaultTabsList: [
        { name: '全部', categoryId: 'all', courseCount: 0 },
        { name: '办公技能', categoryId: 'office', courseCount: 0 },
        { name: '软件开发', categoryId: 'development', courseCount: 0 },
        { name: '电商运营', categoryId: 'ecommerce', courseCount: 0 },
        { name: '摄影剪辑', categoryId: 'media', courseCount: 0 },
        { name: '职业规划', categoryId: 'career', courseCount: 0 }
      ],
      defaultCoursesList: [
        {
          id: 1,
          title: '新媒体营销策略精讲',
          duration: '28:45',
          playCount: '1.9万次播放',
          isFavorite: false,
          category: 'ecommerce',
          thumbnail: '',
          instructor: '张老师',
          rating: 4.8,
          price: 99,
          originalPrice: 199
        },
        {
          id: 2,
          title: 'Excel数据分析实战',
          duration: '45:30',
          playCount: '2.3万次播放',
          isFavorite: false,
          category: 'office',
          thumbnail: '',
          instructor: '李老师',
          rating: 4.9,
          price: 0,
          originalPrice: 0
        },
        {
          id: 3,
          title: 'Python编程入门到精通',
          duration: '52:15',
          playCount: '3.1万次播放',
          isFavorite: false,
          category: 'development',
          thumbnail: '',
          instructor: '王老师',
          rating: 4.7,
          price: 199,
          originalPrice: 299
        }
      ]
    }
  },
  
  async onLoad() {
    this.calculateScrollViewHeight()
    await this.initializePage()
  },
  
  onShow() {
    // 检查数据是否需要刷新（但不在初次加载时执行）
    if (this.lastLoadTime > 0) {
      const now = Date.now()
      if (now - this.lastLoadTime > this.cacheExpiry) {
        console.log('缓存过期，重新加载数据')
        this.loadSkillTrainingData()
      }
    }
  },
  
  onPullDownRefresh() {
    this.onRefresh()
  },
  
  methods: {
    /**
     * 页面初始化 - 企业级数据加载策略
     */
    async initializePage() {
      try {
        this.isLoading = true
        this.clearErrorState()
        
        console.log('技能培训页面初始化开始...')
        
        // 尝试从缓存加载数据
        const cachedData = this.loadCachedData()
        if (cachedData) {
          this.tabsList = cachedData.categories || this.defaultTabsList
          this.coursesList = cachedData.courses || this.defaultCoursesList
          this.originalCoursesList = [...this.coursesList]
          console.log('已加载缓存的技能培训数据')
        } else {
          // 使用默认数据作为初始显示
          this.tabsList = this.defaultTabsList
          this.coursesList = this.defaultCoursesList
          this.originalCoursesList = [...this.coursesList]
        }
        
        // 异步加载最新数据
        await this.loadSkillTrainingData()
        
      } catch (error) {
        console.error('技能培训页面初始化失败:', error)
        this.handleApiError(error)
      } finally {
        this.isLoading = false
        // 确保初次加载后设置lastLoadTime，避免onShow重复加载
        if (this.lastLoadTime === 0) {
          this.lastLoadTime = Date.now()
        }
      }
    },

    /**
     * 加载技能培训数据 - 企业级API集成
     */
    async loadSkillTrainingData() {
      try {
        console.log('开始加载技能培训数据...')
        
        // 先单独加载热门课程数据
        let homeResult, categoriesResult
        
        try {
          homeResult = await this.executeWithRetry(() => skillTrainingApi.getHotCourses({ limit: 20 }))
          console.log('热门课程API响应:', homeResult)
        } catch (error) {
          console.error('热门课程API调用失败:', error)
          homeResult = { status: 'rejected', reason: error }
        }
        
        try {
          categoriesResult = await this.executeWithRetry(() => skillTrainingApi.getAllCategories())
          console.log('分类API响应:', categoriesResult)
        } catch (error) {
          console.error('分类API调用失败:', error)
          categoriesResult = { status: 'rejected', reason: error }
        }

        // 处理分类数据
        if (categoriesResult && categoriesResult.data) {
          const categories = categoriesResult.data
          this.tabsList = [
            { name: '全部', categoryId: 'all', courseCount: 0 },
            ...categories.map(category => ({
              name: category.name || category.categoryName,
              categoryId: category.id || category.categoryId,
              courseCount: category.courseCount || 0
            }))
          ]
        } else {
          console.warn('使用默认分类数据')
          this.tabsList = this.defaultTabsList
        }

        // 处理课程数据
        if (homeResult && homeResult.data) {
          this.coursesList = this.formatCourseData(homeResult.data)
          this.originalCoursesList = [...this.coursesList]
          console.log('课程数据加载成功:', this.coursesList.length)
        } else {
          console.warn('使用默认课程数据')
          this.coursesList = this.defaultCoursesList
          this.originalCoursesList = [...this.coursesList]
        }

        // 更新统计信息
        this.updateCourseStatistics()

        // 缓存数据
        this.saveCachedData({
          categories: this.tabsList,
          courses: this.coursesList,
          timestamp: Date.now()
        })
        
        this.lastLoadTime = Date.now()
        console.log('技能培训数据加载完成')

      } catch (error) {
        console.error('加载技能培训数据失败:', error)
        this.handleApiError(error)
        
        // 如果API失败，继续使用默认数据，不影响用户体验
        if (this.coursesList.length === 0) {
          this.coursesList = this.defaultCoursesList
          this.originalCoursesList = [...this.coursesList]
        }
        if (this.tabsList.length === 0) {
          this.tabsList = this.defaultTabsList
        }
        
        // 即使失败也要设置lastLoadTime，避免重复请求
        this.lastLoadTime = Date.now()
      }
    },

    /**
     * 下拉刷新
     */
    async onRefresh() {
      this.isRefreshing = true
      this.currentPage = 1
      this.hasMore = true
      
      try {
        // 清除缓存
        this.clearCache()
        
        // 重新加载数据
        await this.loadSkillTrainingData()
        
        uni.showToast({
          title: '刷新成功',
          icon: 'success',
          duration: 1000
        })
        
      } catch (error) {
        console.error('刷新失败:', error)
        uni.showToast({
          title: '刷新失败',
          icon: 'none'
        })
      } finally {
        this.isRefreshing = false
        uni.stopPullDownRefresh()
      }
    },

    /**
     * 上拉加载更多
     */
    async onLoadMore() {
      if (this.isLoadingMore || !this.hasMore) return
      
      this.isLoadingMore = true
      this.currentPage++
      
      try {
        const selectedTab = this.tabsList[this.currentTab]
        let moreCoursesResult
        
        if (selectedTab.categoryId === 'all') {
          moreCoursesResult = await this.executeWithRetry(() => 
            skillTrainingApi.getHotCourses({ 
              limit: this.pageSize 
            })
          )
        } else {
          moreCoursesResult = await this.executeWithRetry(() => 
            skillTrainingApi.getCoursesByCategory(selectedTab.categoryId, {
              limit: this.pageSize
            })
          )
        }
        
        if (moreCoursesResult?.data) {
          const newCourses = this.formatCourseData(moreCoursesResult.data)
          this.coursesList.push(...newCourses)
          
          // 检查是否还有更多数据
          const courseList = moreCoursesResult.data.records || moreCoursesResult.data
          if (!courseList || courseList.length < this.pageSize) {
            this.hasMore = false
          }
        } else {
          this.hasMore = false
        }
        
      } catch (error) {
        console.error('加载更多课程失败:', error)
        this.currentPage-- // 回滚页码
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      } finally {
        this.isLoadingMore = false
      }
    },

    /**
     * 智能缓存管理 - 保存数据
     */
    saveCachedData(data) {
      try {
        uni.setStorageSync(this.cacheKey, data)
      } catch (error) {
        console.error('保存技能培训缓存失败:', error)
      }
    },

    /**
     * 智能缓存管理 - 加载数据
     */
    loadCachedData() {
      try {
        const cachedData = uni.getStorageSync(this.cacheKey)
        if (cachedData && cachedData.timestamp) {
          const isExpired = Date.now() - cachedData.timestamp > this.cacheExpiry
          if (!isExpired) {
            return cachedData
          } else {
            // 清理过期缓存
            this.clearCache()
          }
        }
      } catch (error) {
        console.error('加载技能培训缓存失败:', error)
      }
      return null
    },

    /**
     * 清除缓存
     */
    clearCache() {
      try {
        uni.removeStorageSync(this.cacheKey)
        uni.removeStorageSync(this.categoryCacheKey)
      } catch (error) {
        console.error('清除缓存失败:', error)
      }
    },

    /**
     * 指数退避重试机制
     */
    async executeWithRetry(apiCall, retryCount = 0) {
      try {
        return await apiCall()
      } catch (error) {
        if (retryCount < this.retryConfig.maxRetries) {
          // 计算延迟时间：基础延迟 * 退避因子^重试次数 + 随机抖动
          const baseDelay = this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffFactor, retryCount)
          const jitter = Math.random() * 0.3 * baseDelay // 30%随机抖动
          const delay = Math.min(baseDelay + jitter, this.retryConfig.maxDelay)
          
          console.log(`API调用失败，${delay.toFixed(0)}ms后进行第${retryCount + 1}次重试:`, error.message)
          
          await new Promise(resolve => setTimeout(resolve, delay))
          return this.executeWithRetry(apiCall, retryCount + 1)
        }
        throw error
      }
    },

    /**
     * 错误处理 - 企业级错误分类
     */
    handleApiError(error) {
      let errorMessage = '数据加载失败，请稍后重试'
      let canRetry = true

      // 网络错误
      if (error.code === 'NETWORK_ERROR' || error.message?.includes('network')) {
        errorMessage = '网络连接失败，请检查网络后重试'
      } 
      // 服务器错误
      else if (error.code === 'SERVER_ERROR' || error.status >= 500) {
        errorMessage = '服务器繁忙，请稍后重试'
      } 
      // 认证错误
      else if (error.status === 401 || error.code === 'AUTH_ERROR') {
        errorMessage = '登录已过期，请重新登录'
        canRetry = false
        setTimeout(() => {
          uni.reLaunch({ url: '/pages/login/login' })
        }, 2000)
      } 
      // 权限错误
      else if (error.status === 403) {
        errorMessage = '访问权限不足'
        canRetry = false
      } 
      // 数据格式错误
      else if (error.status === 422 || error.code === 'VALIDATION_ERROR') {
        errorMessage = '请求参数错误，请稍后重试'
      }
      // 其他客户端错误
      else if (error.status >= 400 && error.status < 500) {
        errorMessage = '请求失败，请检查网络或稍后重试'
      }

      this.setErrorState('api', errorMessage, canRetry)
      
      // 显示用户友好的错误提示
      uni.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 3000
      })
    },

    /**
     * 设置错误状态
     */
    setErrorState(type, message, canRetry = false) {
      this.errorState = {
        hasError: true,
        errorType: type,
        errorMessage: message,
        canRetry
      }
    },

    /**
     * 清理错误状态
     */
    clearErrorState() {
      this.errorState = {
        hasError: false,
        errorType: '',
        errorMessage: '',
        canRetry: false
      }
    },

    /**
     * 重试加载
     */
    async retryLoad() {
      this.clearErrorState()
      await this.initializePage()
    },

    /**
     * 格式化课程数据 - 适配API响应格式
     */
    formatCourseData(courses) {
      // 处理分页响应格式 data.records
      const courseList = courses.records || courses
      
      return courseList.map(course => ({
        id: course.id,
        title: course.title || course.courseName,
        duration: course.durationFormatted || this.formatDuration(course.durationMinutes || course.duration || course.videoDuration),
        playCount: course.viewCountFormatted || this.formatPlayCount(course.viewCount || course.playCount),
        isFavorite: course.isFavorited || course.isFavorite || false,
        category: course.categoryName || course.category || course.categoryId,
        thumbnail: course.coverImage || course.thumbnail || '',
        instructor: course.instructorName || course.instructor?.name || '未知讲师',
        rating: course.rating || course.score || 0,
        price: course.price || 0,
        originalPrice: course.originalPrice || 0
      }))
    },

    /**
     * 更新课程统计信息
     */
    updateCourseStatistics() {
      // 统计各分类的课程数量
      this.tabsList.forEach(tab => {
        if (tab.categoryId === 'all') {
          tab.courseCount = this.originalCoursesList.length
        } else {
          tab.courseCount = this.originalCoursesList.filter(course => 
            course.category === tab.categoryId
          ).length
        }
      })
    },

    /**
     * 格式化播放时长 - 支持秒数和分钟数
     */
    formatDuration(duration) {
      if (!duration) return '00:00'
      
      // 如果传入的是已格式化的字符串，直接返回
      if (typeof duration === 'string' && duration.includes(':')) {
        return duration
      }
      
      const durationNumber = parseInt(duration)
      
      // 如果数值较大（>100），可能是秒数；较小可能是分钟数
      if (durationNumber > 100) {
        // 按秒数处理
        const minutes = Math.floor(durationNumber / 60)
        const seconds = durationNumber % 60
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      } else {
        // 按分钟数处理（API返回的durationMinutes字段）
        const hours = Math.floor(durationNumber / 60)
        const minutes = durationNumber % 60
        if (hours > 0) {
          return `${hours}:${minutes.toString().padStart(2, '0')}`
        } else {
          return `${minutes}:00`
        }
      }
    },

    /**
     * 格式化播放次数
     */
    formatPlayCount(count) {
      if (!count) return '0次播放'
      
      // 如果传入的是已格式化的字符串，直接返回
      if (typeof count === 'string' && count.includes('次播放')) {
        return count
      }
      
      const num = parseInt(count)
      if (num >= 10000) {
        return `${(num / 10000).toFixed(1)}万次播放`
      }
      return `${num}次播放`
    },

    /**
     * 标签切换处理
     */
    async handleTabChange(index) {
      if (this.currentTab === index) return
      
      this.currentTab = index
      this.currentPage = 1
      this.hasMore = true
      
      const selectedTab = this.tabsList[index]
      console.log('切换到标签：', selectedTab.name)
      
      try {
        // 根据分类筛选课程
        if (selectedTab.categoryId === 'all') {
          this.coursesList = [...this.originalCoursesList]
        } else {
          // 先从本地数据筛选
          const localCourses = this.originalCoursesList.filter(course =>
            course.category === selectedTab.categoryId
          )
          
          if (localCourses.length > 0) {
            this.coursesList = localCourses
          } else {
            // 如果本地没有数据，从API加载
            this.isLoading = true
            const categoryResult = await this.executeWithRetry(() => 
              skillTrainingApi.getCoursesByCategory(selectedTab.categoryId, {
                limit: this.pageSize
              })
            )
            
            if (categoryResult?.data) {
              this.coursesList = this.formatCourseData(categoryResult.data)
              
              // 更新原始数据
              this.originalCoursesList.push(...this.coursesList.filter(newCourse => 
                !this.originalCoursesList.some(existingCourse => existingCourse.id === newCourse.id)
              ))
            } else {
              this.coursesList = []
            }
            this.isLoading = false
          }
        }
        
      } catch (error) {
        console.error('切换分类失败:', error)
        this.coursesList = []
        uni.showToast({
          title: '该分类暂无课程',
          icon: 'none'
        })
      }
    },
    
    /**
     * 收藏/取消收藏
     */
    async toggleFavorite(index) {
      const course = this.coursesList[index]
      const originalState = course.isFavorite
      
      // 乐观更新UI
      this.coursesList[index].isFavorite = !originalState
      
      try {
        // 调用收藏API
        await this.executeWithRetry(() => skillTrainingApi.toggleFavorite({
          itemId: course.id,
          itemType: 'course',
          action: originalState ? 'remove' : 'add'
        }))
        
        // 更新原始数据
        const originalIndex = this.originalCoursesList.findIndex(c => c.id === course.id)
        if (originalIndex !== -1) {
          this.originalCoursesList[originalIndex].isFavorite = !originalState
        }
        
        uni.showToast({
          title: originalState ? '已取消收藏' : '已收藏',
          icon: 'success',
          duration: 1500
        })
        
      } catch (error) {
        console.error('收藏操作失败:', error)
        // 回滚UI状态
        this.coursesList[index].isFavorite = originalState
        uni.showToast({
          title: '操作失败，请重试',
          icon: 'none'
        })
      }
    },
    
    /**
     * 课程点击处理
     */
    async handleCourseClick(course) {
      try {
        // 增加课程浏览次数（异步，不阻塞用户体验）
        this.executeWithRetry(() => skillTrainingApi.incrementCourseViewCount(course.id))
          .catch(error => console.error('更新浏览次数失败:', error))
        
        // 跳转到课程详情页面
        uni.navigateTo({
          url: `/pages/user/index/skill-training/detail/index?courseId=${course.id}&title=${encodeURIComponent(course.title)}`
        })
        
      } catch (error) {
        console.error('打开课程详情失败:', error)
        uni.showToast({
          title: '打开课程失败',
          icon: 'none'
        })
      }
    },

    /**
     * 分享课程
     */
    async handleShare(course) {
      try {
        // 调用分享API记录分享行为
        await this.executeWithRetry(() => skillTrainingApi.shareCourse(course.id))
        
        // 调用系统分享
        uni.share({
          provider: 'weixin',
          scene: 'WXSceneSession',
          type: 0,
          href: `https://app.huaguang.com/course/${course.id}`,
          title: course.title,
          summary: `推荐一个优质课程：${course.title}，讲师：${course.instructor}`,
          imageUrl: course.thumbnail || this.skillBannerImage,
          success: () => {
            uni.showToast({
              title: '分享成功',
              icon: 'success'
            })
          },
          fail: (error) => {
            console.error('分享失败:', error)
            uni.showToast({
              title: '分享失败',
              icon: 'none'
            })
          }
        })
        
      } catch (error) {
        console.error('分享课程失败:', error)
        // 即使API失败也继续分享
        uni.showModal({
          title: '分享课程',
          content: `${course.title}\n讲师：${course.instructor}`,
          showCancel: true,
          confirmText: '复制链接',
          success: (res) => {
            if (res.confirm) {
              uni.setClipboardData({
                data: `${course.title} - https://app.huaguang.com/course/${course.id}`,
                success: () => {
                  uni.showToast({
                    title: '链接已复制',
                    icon: 'success'
                  })
                }
              })
            }
          }
        })
      }
    },

    /**
     * 图片加载错误处理
     */
    onImageError(e) {
      console.log('课程图片加载失败:', e)
      // 可以在这里设置默认图片
    },

    /**
     * 回到顶部
     */
    scrollToTop() {
      // 这里可以通过ref获取scroll-view实例并调用scrollTop方法
      // 由于uni-app限制，这里使用页面级的方法
      uni.pageScrollTo({
        scrollTop: 0,
        duration: 300
      })
    },
    
    /**
     * 返回上一页
     */
    goBack() {
      uni.navigateBack({
        fail: () => {
          // 如果没有上一页，返回首页
          uni.reLaunch({
            url: '/pages/user/index/index'
          })
        }
      })
    },
    
    /**
     * 搜索功能
     */
    handleSearch() {
      uni.navigateTo({
        url: '/pages/user/index/search/index?type=course'
      })
    },

    /**
     * 计算滚动容器高度
     */
    calculateScrollViewHeight() {
      // 获取系统信息
      const systemInfo = uni.getSystemInfoSync()
      const windowHeight = systemInfo.windowHeight
      
      // 计算固定区域的高度（单位px）
      // 导航栏高度约44px + 状态栏高度
      const navbarHeight = 44 + (systemInfo.statusBarHeight || 0)
      // Banner区域高度：400rpx转换为px
      const bannerHeight = 400 * systemInfo.windowWidth / 750
      // Tabs区域高度：约80rpx转换为px
      const tabsHeight = 80 * systemInfo.windowWidth / 750
      
      // 计算可用的滚动区域高度
      this.scrollViewHeight = windowHeight - navbarHeight - bannerHeight - tabsHeight
      
      // 确保最小高度
      if (this.scrollViewHeight < 200) {
        this.scrollViewHeight = 200
      }
      
      console.log('滚动容器高度计算:', {
        windowHeight,
        navbarHeight,
        bannerHeight,
        tabsHeight,
        scrollViewHeight: this.scrollViewHeight
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.skill-training-container {
  height: 100vh;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  overflow: hidden;
}

.content {
  padding: 0;
}

.banner-section {
  height: 400rpx;
  position: relative;
  margin-bottom: 30rpx;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  // border-radius: 0 0 40rpx 40rpx;
  overflow: hidden;
  
  .banner-title {
    position: absolute;
    top: 80rpx;
    right: 80rpx;
    font-size: 72rpx;
    font-weight: bold;
    color: #FFFFFF;
    text-shadow: 3rpx 3rpx 6rpx rgba(74, 144, 226, 0.4);
    font-family: $font-family-youshe, 'PingFang SC', 'Microsoft YaHei', sans-serif;
    z-index: 10;
  }
}

.tabs-section {
  margin-bottom: 30rpx;
  padding: 0 20rpx;
  
  .custom-tabs {
    display: flex;
    flex-wrap: nowrap;
    gap: 16rpx;
    overflow-x: auto;
    padding-bottom: 10rpx;
    
    /* 隐藏滚动条但保持滚动功能 */
    &::-webkit-scrollbar {
      display: none;
    }
    -ms-overflow-style: none;
    scrollbar-width: none;
    
    .tab-item {
      background-color: #d7f0ff;
      color: #666;
      border-radius: 25rpx;
      padding: 12rpx 24rpx;
      font-size: 28rpx;
      font-weight: 500;
      transition: all 0.3s ease;
      cursor: pointer;
      flex-shrink: 0;
      white-space: nowrap;
      
      &.tab-item--active {
        background-color: #1871d7;
        color: #fff;
      }
      
      &:hover {
        opacity: 0.8;
      }
    }
  }
}

.scroll-container {
  width: 100%;
  background-color: transparent;
}

.courses-section {
  padding: 20rpx 20rpx 40rpx;
}

.course-card {
  // background-color: #FFFFFF;
  border-radius: 20rpx;
  margin: 15rpx;
  overflow: hidden;
  // box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease;
  
  &:active {
    transform: scale(0.98);
  }
  
  .course-thumbnail {
    width: 100%;
    height: 240rpx;
    position: relative;
    
    .course-image {
      width: 100%;
      height: 100%;
      border-radius: 20rpx;
      object-fit: cover;
    }
    
    .placeholder-image {
      width: 100%;
      height: 100%;
      border-radius: 20rpx;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .favorite-icon {
      position: absolute;
      top: 20rpx;
      right: 20rpx;
      width: 40rpx;
      height: 40rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      // background-color: rgba(0, 0, 0, 0.3);
      border-radius: 50%;
    }
    
    .duration {
      position: absolute;
      bottom: 20rpx;
      right: 20rpx;
      background-color: rgba(0, 0, 0, 0.7);
      color: #FFFFFF;
      font-size: 24rpx;
      padding: 6rpx 12rpx;
      border-radius: 8rpx;
      font-weight: 500;
    }
    
    .price-tag {
      position: absolute;
      top: 20rpx;
      left: 20rpx;
      background: linear-gradient(135deg, #ff6b6b, #ee5a24);
      border-radius: 8rpx;
      padding: 6rpx 12rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      
      .price {
        color: #FFFFFF;
        font-size: 24rpx;
        font-weight: bold;
      }
      
      .original-price {
        color: rgba(255, 255, 255, 0.8);
        font-size: 20rpx;
        text-decoration: line-through;
        margin-top: 2rpx;
      }
    }
    
    .free-tag {
      position: absolute;
      top: 20rpx;
      left: 20rpx;
      background: linear-gradient(135deg, #2ed573, #1e90ff);
      color: #FFFFFF;
      font-size: 24rpx;
      font-weight: bold;
      padding: 6rpx 12rpx;
      border-radius: 8rpx;
    }
  }
  
  .course-title {
    padding: 20rpx 20rpx 10rpx;
    font-size: 30rpx;
    color: #333333;
    font-weight: bold;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }
  
  .instructor-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20rpx 10rpx;
    
    .instructor-name {
      font-size: 26rpx;
      color: #666666;
      font-weight: 400;
    }
    
    .rating {
      display: flex;
      align-items: center;
      gap: 8rpx;
      
      .rating-text {
        font-size: 24rpx;
        color: #FFB020;
        font-weight: 500;
      }
    }
  }
  
  .course-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20rpx 20rpx;
    
    .play-count {
      font-size: 24rpx;
      color: #888888;
      font-weight: 400;
    }
    
    .share-icon {
      padding: 10rpx;
      border-radius: 50%;
      transition: background-color 0.2s ease;
      
      &:active {
        background-color: rgba(0, 0, 0, 0.1);
      }
    }
  }
}

/* 新增样式组件 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 40rpx;
  
  .loading-text {
    margin-top: 30rpx;
    font-size: 28rpx;
    color: #666666;
  }
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 40rpx;
  
  .error-text {
    margin: 30rpx 0;
    font-size: 28rpx;
    color: #999999;
    text-align: center;
  }
  
  .retry-button {
    margin-top: 20rpx;
  }
}

.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;
  
  .empty-text {
    margin-top: 30rpx;
    font-size: 32rpx;
    color: #666666;
    font-weight: 500;
  }
  
  .empty-subtitle {
    margin-top: 16rpx;
    font-size: 26rpx;
    color: #999999;
    text-align: center;
  }
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx 0;
  gap: 20rpx;
  
  .loading-more-text {
    font-size: 26rpx;
    color: #666666;
  }
}

.no-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx 0;
  
  .no-more-text {
    font-size: 26rpx;
    color: #999999;
    position: relative;
    
    &::before,
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      width: 60rpx;
      height: 2rpx;
      background-color: #e0e0e0;
    }
    
    &::before {
      left: -80rpx;
    }
    
    &::after {
      right: -80rpx;
    }
  }
}

.fab-container {
  position: fixed;
  bottom: 120rpx;
  right: 40rpx;
  z-index: 100;
}

.fab-button {
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 20rpx rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.95);
    box-shadow: 0 4rpx 10rpx rgba(102, 126, 234, 0.2);
  }
}

.course-count {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-left: 8rpx;
}

.tab-item--active .course-count {
  color: rgba(255, 255, 255, 0.9);
}

// 响应式优化
@media screen and (max-width: 750rpx) {
  .banner-section {
    .banner-title {
      font-size: 60rpx;
      right: 60rpx;
    }
  }
  
  .course-card {
    margin: 10rpx;
    
    .course-thumbnail {
      height: 200rpx;
    }
    
    .course-title {
      font-size: 28rpx;
      padding: 16rpx 16rpx 8rpx;
    }
    
    .instructor-info {
      padding: 0 16rpx 8rpx;
    }
    
    .course-info {
      padding: 0 16rpx 16rpx;
    }
  }
}
</style>