<template>
  <view class="lawyer-detail-container" :style="{ backgroundImage: `url('${config.staticBaseUrl}/bg8.png')` }">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="navbar-content">
        <view class="navbar-left" @click="goBack">
          <uv-icon name="arrow-left" color="#FFFFFF" size="30"></uv-icon>
          <text class="back-text">返回</text>
        </view>
        <view class="navbar-title">
          <text>律师详情</text>
        </view>
      </view>
    </view>

    <!-- 页面内容 -->
    <view class="page-content">
      <!-- 律师简介卡片 -->
      <view class="lawyer-profile-card">
        <!-- 头像与基本信息区域 -->
        <view class="profile-header">
          <!-- 头像 -->
          <view class="avatar-section">
            <view class="avatar-placeholder"></view>
          </view>
          
          <!-- 基本信息 -->
          <view class="basic-info">
            <!-- 姓名与在线状态 -->
            <view class="name-status">
              <text class="lawyer-name">{{ lawyerInfo.name }}</text>
              <view class="online-indicator">
                <view class="online-dot"></view>
                <text class="online-text">在线中</text>
              </view>
            </view>
            
            <!-- 专长标签 -->
            <view class="specialty-tag">
              <text>{{ lawyerInfo.specialty }}</text>
            </view>
            
            <!-- 执业经验与胜诉率 -->
            <view class="experience-info">
              <text>{{ lawyerInfo.experience }} · 胜诉率{{ lawyerInfo.successRate }}</text>
            </view>
          </view>
        </view>
        
        <!-- 近期案例展示 -->
        <view class="recent-case">
          <text class="case-title">近期案例展示:</text>
          <text class="case-content">{{ lawyerInfo.recentCase }}</text>
        </view>
      </view>

      <!-- 律师详细信息卡片 -->
      <view class="lawyer-details-card">
        <!-- 执业背景 -->
        <view class="detail-section">
          <view class="section-header">
            <image class="section-icon" :src="config.staticBaseUrl + '/icons/zhiye.png'" mode="aspectFit"></image>
            <text class="section-title">执业背景</text>
          </view>
          <text class="section-content">{{ lawyerInfo.background }}</text>
        </view>

        <!-- 服务优势 -->
        <view class="detail-section">
          <view class="section-header">
            <image class="section-icon" :src="config.staticBaseUrl + '/icons/fuwu.png'" mode="aspectFit"></image>
            <text class="section-title">服务优势</text>
          </view>
          <view class="list-content">
            <view v-for="(item, index) in lawyerInfo.advantages" :key="index" class="list-item">
              <view class="list-dot"></view>
              <text class="list-text">{{ item }}</text>
            </view>
          </view>
        </view>

        <!-- 成功案例 -->
        <view class="detail-section">
          <view class="section-header">
            <image class="section-icon" :src="config.staticBaseUrl + '/icons/chenggong.png'" mode="aspectFit"></image>
            <text class="section-title">成功案例</text>
          </view>
          <view class="list-content">
            <view v-for="(item, index) in lawyerInfo.cases" :key="index" class="list-item">
              <view class="list-dot"></view>
              <text class="list-text">{{ item }}</text>
            </view>
          </view>
        </view>

        <!-- 咨询范围 -->
        <view class="detail-section">
          <view class="section-header">
            <image class="section-icon" :src="config.staticBaseUrl + '/icons/zixun.png'" mode="aspectFit"></image>
            <text class="section-title">咨询范围</text>
          </view>
          <view class="list-content">
            <view v-for="(item, index) in lawyerInfo.consultationScope" :key="index" class="list-item">
              <view class="list-dot"></view>
              <text class="list-text">{{ item }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部固定按钮 -->
    <view class="bottom-button" :style="{ paddingBottom: safeAreaBottom + 'px' }">
      <view class="consult-button" @click="startConsultation">
        <text class="button-text">立即咨询</text>
      </view>
    </view>
  </view>
</template>

<script>
import config from '@/config/index.js'
import { getLawyerDetail, getLawyerReviews, createLegalConsultationOrder } from '@/api/modules/legal.js'

export default {
  data() {
    return {
      statusBarHeight: 0,
      safeAreaBottom: 0,
      config,
      
      // 企业级数据管理
      loading: false,
      retryCount: 0,
      maxRetries: 3,
      cacheKey: '',
      cacheExpiry: 15 * 60 * 1000, // 15分钟缓存
      lastUpdateTime: 0,
      
      // 律师信息
      lawyerInfo: {
        id: 1,
        name: "加载中...",
        avatar: "",
        isOnline: false,
        specialty: "专业领域",
        experience: "执业经验",
        successRate: "0%",
        recentCase: "暂无案例信息",
        background: "暂无介绍",
        advantages: [],
        cases: [],
        consultationScope: [],
        rating: 0,
        reviewCount: 0,
        consultationPrice: 0,
        responseTime: '24小时内',
        phone: '',
        email: '',
        office: '',
        education: [],
        certificates: []
      },
      
      // 律师评价数据
      reviews: [],
      reviewsLoading: false,
      reviewsPage: 1,
      reviewsPageSize: 10,
      reviewsTotal: 0,
      
      // 收藏状态
      isFavorite: false,
      
      // 咨询历史
      consultationHistory: []
    }
  },
  onLoad(options) {
    this.getSystemInfo()
    // 接收传入的律师ID参数
    if (options.lawyerId) {
      console.log('接收到律师ID:', options.lawyerId)
      this.lawyerInfo.id = parseInt(options.lawyerId)
      this.cacheKey = `lawyer_detail_${options.lawyerId}`
      // 根据律师ID加载具体的律师信息
      this.loadLawyerDetailWithCache(options.lawyerId)
    } else {
      console.error('未接收到律师ID参数')
      uni.showToast({
        title: '参数错误',
        icon: 'none'
      })
    }
  },
  onShow() {
    // 页面显示时检查收藏状态
    this.loadFavoriteStatus()
    this.loadConsultationHistory()
  },
  onPullDownRefresh() {
    // 下拉刷新时清除缓存并重新加载
    if (this.cacheKey) {
      uni.removeStorageSync(this.cacheKey)
      const lawyerId = this.lawyerInfo.id
      this.loadLawyerDetailWithCache(lawyerId)
    }
    setTimeout(() => {
      uni.stopPullDownRefresh()
    }, 1000)
  },
  methods: {
    // 获取系统信息
    getSystemInfo() {
      const systemInfo = uni.getSystemInfoSync()
      this.statusBarHeight = systemInfo.statusBarHeight || 0
      this.safeAreaBottom = systemInfo.safeAreaInsets?.bottom || 0
    },
    
    // 智能缓存加载律师详情
    async loadLawyerDetailWithCache(lawyerId) {
      try {
        // 检查缓存
        const cachedData = this.getCachedData()
        if (cachedData && this.isCacheValid()) {
          console.log('使用缓存数据加载律师详情')
          this.lawyerInfo = cachedData.lawyerInfo
          this.reviews = cachedData.reviews || []
          this.lastUpdateTime = cachedData.timestamp
          return
        }
        
        // 缓存无效或不存在，从API加载
        await this.loadLawyerDetailFromApi(lawyerId)
        
      } catch (error) {
        console.error('加载律师详情失败:', error)
        // 尝试使用过期缓存作为降级方案
        const expiredCache = this.getExpiredCache()
        if (expiredCache) {
          console.log('使用过期缓存作为降级方案')
          this.lawyerInfo = expiredCache.lawyerInfo
          this.reviews = expiredCache.reviews || []
          uni.showToast({
            title: '数据可能不是最新的',
            icon: 'none'
          })
        } else {
          this.handleApiError(error)
        }
      }
    },
    
    // 从API加载律师详情（带重试机制）
    async loadLawyerDetailFromApi(lawyerId) {
      this.loading = true
      this.retryCount = 0
      
      while (this.retryCount < this.maxRetries) {
        try {
          if (this.retryCount === 0) {
            uni.showLoading({ title: '加载中...' })
          } else {
            uni.showLoading({ title: `重试中(${this.retryCount}/${this.maxRetries})...` })
          }
          
          // 并行加载律师详情和评价数据
          const [lawyerResponse, reviewsResponse] = await Promise.allSettled([
            this.callApiWithRetry(() => getLawyerDetail(lawyerId)),
            this.callApiWithRetry(() => getLawyerReviews(lawyerId, { page: 1, pageSize: 10 }))
          ])
          
          // 处理律师详情数据
          if (lawyerResponse.status === 'fulfilled' && lawyerResponse.value) {
            const processedLawyerInfo = this.processLawyerData(lawyerResponse.value)
            this.lawyerInfo = processedLawyerInfo
          } else {
            throw new Error('律师详情API返回数据格式错误')
          }
          
          // 处理评价数据
          if (reviewsResponse.status === 'fulfilled' && reviewsResponse.value) {
            this.reviews = this.processReviewsData(reviewsResponse.value)
          }
          
          // 保存到缓存
          this.saveToCache({
            lawyerInfo: this.lawyerInfo,
            reviews: this.reviews,
            timestamp: Date.now()
          })
          this.lastUpdateTime = Date.now()
          
          uni.hideLoading()
          this.loading = false
          return
          
        } catch (error) {
          this.retryCount++
          console.error(`获取律师详情失败 (尝试 ${this.retryCount}/${this.maxRetries}):`, error)
          
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
    
    // 智能重试API调用
    async callApiWithRetry(apiCall, maxRetries = 3) {
      let retryCount = 0
      while (retryCount < maxRetries) {
        try {
          const response = await this.callApiWithTimeout(apiCall)
          return response
        } catch (error) {
          retryCount++
          if (retryCount >= maxRetries) {
            throw error
          }
          // 指数退避 + 随机抖动
          const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 8000) + Math.random() * 1000
          await this.delay(delay)
        }
      }
    },
    
    // 带超时的API调用
    async callApiWithTimeout(apiCall, timeout = 10000) {
      return Promise.race([
        apiCall(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('请求超时')), timeout)
        )
      ])
    },
    
    // 处理律师数据
    processLawyerData(response) {
      const lawyerData = response.data || response
      return {
        id: lawyerData.id,
        name: this.validateString(lawyerData.name || lawyerData.lawyerName, '律师'),
        avatar: lawyerData.avatar || lawyerData.headImg || "",
        isOnline: Boolean(lawyerData.isOnline || lawyerData.onlineStatus),
        specialty: this.processSpecialties(lawyerData.specialties || lawyerData.specialty),
        experience: `${lawyerData.experienceYears || lawyerData.practiceYears || 0}年执业经验`,
        successRate: `${lawyerData.successRate || lawyerData.winRate || 0}%`,
        recentCase: this.validateString(lawyerData.recentCases || lawyerData.recentCase, "暂无近期案例"),
        background: this.validateString(lawyerData.introduction || lawyerData.background || lawyerData.description, "暂无介绍"),
        advantages: this.processAdvantages(lawyerData.serviceAdvantages || lawyerData.advantages),
        cases: this.processCases(lawyerData),
        consultationScope: this.processConsultationScope(lawyerData.consultationScope || lawyerData.businessScope),
        rating: lawyerData.rating || lawyerData.score || 0,
        reviewCount: lawyerData.reviewCount || lawyerData.commentCount || 0,
        consultationPrice: lawyerData.consultationPrice || lawyerData.price || 0,
        responseTime: lawyerData.responseTime || '24小时内',
        phone: lawyerData.phone || lawyerData.mobile,
        email: lawyerData.email,
        office: lawyerData.office || lawyerData.lawFirm,
        education: lawyerData.education || [],
        certificates: lawyerData.certificates || []
      }
    },
    
    // 处理专业领域
    processSpecialties(specialties) {
      if (Array.isArray(specialties)) {
        return specialties.join('、')
      }
      return this.validateString(specialties, '专业领域')
    },
    
    // 处理服务优势
    processAdvantages(advantages) {
      if (Array.isArray(advantages)) {
        return advantages
      }
      if (typeof advantages === 'string' && advantages.trim()) {
        return advantages.split('、').filter(item => item.trim())
      }
      return [
        "经验丰富，专业可靠",
        "响应迅速，24小时内答复",
        "成功案例众多，胜诉率高"
      ]
    },
    
    // 处理成功案例
    processCases(lawyerData) {
      const cases = []
      if (lawyerData.caseCount) {
        cases.push(`成功代理案件${lawyerData.caseCount}起`)
      }
      if (lawyerData.successRate) {
        cases.push(`胜诉率${lawyerData.successRate}%`)
      }
      if (lawyerData.majorCases && Array.isArray(lawyerData.majorCases)) {
        cases.push(...lawyerData.majorCases)
      } else if (lawyerData.cases && Array.isArray(lawyerData.cases)) {
        cases.push(...lawyerData.cases.map(c => c.title || c.description))
      } else {
        cases.push("为众多当事人成功维权")
      }
      return cases.length > 0 ? cases : ["暂无案例信息"]
    },
    
    // 处理咨询范围
    processConsultationScope(scope) {
      if (Array.isArray(scope)) {
        return scope
      }
      if (typeof scope === 'string' && scope.trim()) {
        return scope.split('、').filter(item => item.trim())
      }
      return [
        "法律咨询服务",
        "案件代理服务",
        "法律顾问服务"
      ]
    },
    
    // 处理评价数据
    processReviewsData(response) {
      const data = response.data || response
      const records = data.list || data.records || data
      
      if (!Array.isArray(records)) {
        return []
      }
      
      return records.map(review => ({
        id: review.id,
        userName: this.maskUserName(review.userName || review.clientName || '匿名用户'),
        rating: review.rating || review.score || 5,
        content: this.validateString(review.content || review.comment || review.feedback, '用户评价'),
        createTime: this.formatDate(review.createTime || review.commentTime),
        consultationType: review.consultationType || review.serviceType || '法律咨询',
        avatar: review.avatar || review.userAvatar
      }))
    },
    
    // 开始咨询
    async startConsultation() {
      try {
        // 记录咨询历史
        this.recordConsultation()
        
        // 跳转到咨询订单页面，传递律师信息
        uni.navigateTo({
          url: `/pages/user/index/consultation-order/index?expertType=lawyer&expertId=${this.lawyerInfo.id}&expertName=${encodeURIComponent(this.lawyerInfo.name)}&price=${this.lawyerInfo.consultationPrice}`
        })
      } catch (error) {
        console.error('开始咨询失败:', error)
        uni.showToast({
          title: '操作失败，请重试',
          icon: 'none'
        })
      }
    },
    
    // 收藏功能
    loadFavoriteStatus() {
      try {
        const favorites = uni.getStorageSync('favorite_lawyers') || []
        this.isFavorite = favorites.includes(this.lawyerInfo.id)
      } catch (error) {
        console.error('加载收藏状态失败:', error)
      }
    },
    
    toggleFavorite() {
      try {
        const favorites = uni.getStorageSync('favorite_lawyers') || []
        const lawyerId = this.lawyerInfo.id
        
        if (this.isFavorite) {
          const index = favorites.indexOf(lawyerId)
          if (index > -1) {
            favorites.splice(index, 1)
          }
          this.isFavorite = false
          uni.showToast({ title: '已取消收藏', icon: 'none' })
        } else {
          favorites.push(lawyerId)
          this.isFavorite = true
          uni.showToast({ title: '已收藏', icon: 'success' })
        }
        
        uni.setStorageSync('favorite_lawyers', favorites)
      } catch (error) {
        console.error('收藏操作失败:', error)
        uni.showToast({ title: '操作失败', icon: 'none' })
      }
    },
    
    // 咨询历史管理
    loadConsultationHistory() {
      try {
        const history = uni.getStorageSync('consultation_history') || []
        this.consultationHistory = history.filter(item => item.lawyerId === this.lawyerInfo.id)
      } catch (error) {
        console.error('加载咨询历史失败:', error)
      }
    },
    
    recordConsultation() {
      try {
        const history = uni.getStorageSync('consultation_history') || []
        const newRecord = {
          lawyerId: this.lawyerInfo.id,
          lawyerName: this.lawyerInfo.name,
          consultationTime: new Date().toISOString(),
          type: '在线咨询'
        }
        
        history.unshift(newRecord)
        
        // 只保留最近50条记录
        if (history.length > 50) {
          history.splice(50)
        }
        
        uni.setStorageSync('consultation_history', history)
      } catch (error) {
        console.error('记录咨询历史失败:', error)
      }
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
    
    getExpiredCache() {
      try {
        return this.getCachedData()
      } catch (error) {
        return null
      }
    },
    
    isCacheValid() {
      const cached = this.getCachedData()
      if (!cached) return false
      return (Date.now() - cached.timestamp) < this.cacheExpiry
    },
    
    saveToCache(data) {
      try {
        uni.setStorageSync(this.cacheKey, JSON.stringify(data))
      } catch (error) {
        console.error('保存缓存失败:', error)
      }
    },
    
    // 工具方法
    validateString(value, defaultValue = '') {
      return (typeof value === 'string' && value.trim()) ? value.trim() : defaultValue
    },
    
    maskUserName(name) {
      if (!name || name.length <= 2) return name
      return name.charAt(0) + '*'.repeat(name.length - 2) + name.charAt(name.length - 1)
    },
    
    formatDate(dateString) {
      if (!dateString) return ''
      try {
        const date = new Date(dateString)
        const now = new Date()
        const diff = now - date
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        
        if (days === 0) {
          return '今天'
        } else if (days < 7) {
          return `${days}天前`
        } else {
          return date.toLocaleDateString()
        }
      } catch (error) {
        return ''
      }
    },
    
    delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    },
    
    // 错误处理
    handleApiError(error) {
      console.error('API错误:', error)
      let message = '加载失败，请重试'
      
      if (error.message) {
        if (error.message.includes('timeout') || error.message.includes('超时')) {
          message = '网络超时，请检查网络连接'
        } else if (error.message.includes('Network Error') || error.message.includes('网络错误')) {
          message = '网络连接失败，请检查网络'
        } else if (error.code === 401 || error.statusCode === 401) {
          message = '登录已过期，请重新登录'
          // 可以跳转到登录页
        } else if (error.code === 403 || error.statusCode === 403) {
          message = '权限不足'
        } else if (error.code === 404 || error.statusCode === 404) {
          message = '律师信息不存在'
        } else if (error.code >= 500 || error.statusCode >= 500) {
          message = '服务器错误，请稍后重试'
        }
      }
      
      uni.showToast({
        title: message,
        icon: 'none',
        duration: 3000
      })
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack({
        delta: 1,
        fail: () => {
          // 如果没有上一页，跳转到首页
          uni.reLaunch({
            url: '/pages/index/index'
          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.lawyer-detail-container {
  height: 100vh;
  position: relative;
  overflow-y: auto;
  background-size: cover;
  background-position: unset;
  background-repeat: no-repeat;
}

/* 自定义导航栏 */
.custom-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  
  .navbar-content {
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 30rpx;
    position: relative;
  }
  
  .navbar-left {
    display: flex;
    align-items: center;
    
    .back-icon {
      font-size: 36rpx;
      color: #FFFFFF;
      margin-right: 8rpx;
    }
    
    .back-text {
      font-size: 32rpx;
      color: #FFFFFF;
    }
  }
  
  .navbar-title {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    
    text {
      font-size: 36rpx;
      color: #FFFFFF;
    }
  }
}

/* 页面内容 */
.page-content {
  padding-top: 120rpx; /* 为导航栏预留空间 */
  padding-bottom: 140rpx; /* 为底部按钮预留空间 */
  padding-left: 30rpx;
  padding-right: 30rpx;
}

/* 律师简介卡片 */
.lawyer-profile-card {
  background: #FFFFFF;
  border-radius: 32rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
  
  .profile-header {
    display: flex;
    margin-bottom: 30rpx;
  }
  
  .avatar-section {
    margin-right: 30rpx;
    
    .avatar-placeholder {
      width: 160rpx;
      height: 160rpx;
      border-radius: 50%;
      background-color: #D9D9D9;
    }
  }
  
  .basic-info {
    flex: 1;
    
    .name-status {
      display: flex;
      align-items: center;
      margin-bottom: 20rpx;
      
      .lawyer-name {
        font-size: 44rpx;
        color: #333333;
        font-weight: bold;
        margin-right: 20rpx;
      }
      
      .online-indicator {
        display: flex;
        align-items: center;
        
        .online-dot {
          width: 12rpx;
          height: 12rpx;
          border-radius: 50%;
          background-color: #52C41A;
          margin-right: 8rpx;
        }
        
        .online-text {
          font-size: 24rpx;
          color: #666666;
        }
      }
    }
    
    .specialty-tag {
      margin-bottom: 20rpx;
      
      text {
        background-color: #3572f2;
        color: #FFFFFF;
        font-size: 28rpx;
        padding: 8rpx 16rpx;
        border-radius: 15rpx;
      }
    }
    
    .experience-info {
      text {
        font-size: 26rpx;
        color: #999999;
      }
    }
  }
  
  .recent-case {
    .case-title {
      font-size: 26rpx;
      color: #666666;
      display: block;
      margin-bottom: 10rpx;
    }
    
    .case-content {
      font-size: 26rpx;
      color: #888888;
      line-height: 1.5;
    }
  }
}

/* 律师详细信息卡片 */
.lawyer-details-card {
  background: #FFFFFF;
  border-radius: 32rpx;
  padding: 40rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
  
  .detail-section {
    margin-bottom: 40rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .section-header {
      display: flex;
      align-items: center;
      margin-bottom: 20rpx;
      
      .section-icon {
        width: 36rpx;
        height: 36rpx;
        margin-right: 16rpx;
        border-radius: 4rpx;
      }
      
      .background-icon {
        background-color: #4A90E2;
        position: relative;
        
        &::after {
          content: '📄';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 20rpx;
        }
      }
      
      .advantage-icon {
        background-color: #4A90E2;
        position: relative;
        
        &::after {
          content: '💝';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 20rpx;
        }
      }
      
      .case-icon {
        background-color: #4A90E2;
        position: relative;
        
        &::after {
          content: '🤝';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 20rpx;
        }
      }
      
      .consultation-icon {
        background-color: #4A90E2;
        position: relative;
        
        &::after {
          content: '💬';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 20rpx;
        }
      }
      
      .section-title {
        font-size: 34rpx;
        color: #333333;
        font-weight: bold;
      }
    }
    
    .section-content {
      font-size: 28rpx;
      color: #666666;
      line-height: 1.6;
    }
    
    .list-content {
      .list-item {
        display: flex;
        align-items: flex-start;
        margin-bottom: 16rpx;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .list-dot {
          width: 8rpx;
          height: 8rpx;
          border-radius: 50%;
          background-color: #333333;
          margin-top: 12rpx;
          margin-right: 16rpx;
          flex-shrink: 0;
        }
        
        .list-text {
          font-size: 28rpx;
          color: #666666;
          line-height: 1.6;
          flex: 1;
        }
      }
    }
  }
}

/* 底部固定按钮 */
.bottom-button {
  position: fixed;
  bottom: 12rpx;
  left: 0;
  right: 0;
  padding: 20rpx 80rpx;
  // background: rgba(255, 255, 255, 0.95);
  // backdrop-filter: blur(10rpx);
  // 添加字间距
  letter-spacing: 20rpx;
  
  .consult-button {
    width: 100%;
    height: 88rpx;
    background: linear-gradient(135deg, #4285F4 0%, #3A7BFF 100%);
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8rpx 24rpx rgba(58, 123, 255, 0.3);
    
    &:active {
      transform: scale(0.98);
      transition: transform 0.1s;
    }
    
    .button-text {
      font-size: 36rpx;
      color: #FFFFFF;
      font-weight: bold;
    }
  }
}
</style>