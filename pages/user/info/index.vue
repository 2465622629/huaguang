<template>
  <view class="info-page">
    <!-- 加载状态 -->
    <view v-if="loading" class="loading-container">
      <text class="loading-text">加载中...</text>
    </view>
    
    <!-- 用户信息内容 -->
    <scroll-view
      v-else
      class="content"
      scroll-y
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <!-- 用户基本信息卡片 -->
      <view class="info-card">
        <view class="card-header">
          <text class="card-title">基本信息</text>
        </view>
        
        <view class="info-list">
          <view class="info-item">
            <text class="info-label">昵称</text>
            <text class="info-value">{{ userInfo.nickname || '未设置' }}</text>
          </view>
          
          <view class="info-item">
            <text class="info-label">会员ID</text>
            <text class="info-value">{{ userInfo.memberId || '未分配' }}</text>
          </view>
          
          <view class="info-item">
            <text class="info-label">性别</text>
            <text class="info-value">{{ formatGender(userInfo.gender) }}</text>
          </view>
          
          <view class="info-item">
            <text class="info-label">生日</text>
            <text class="info-value">{{ userInfo.birthday || '未设置' }}</text>
          </view>
          
          <view class="info-item">
            <text class="info-label">所在地</text>
            <text class="info-value">{{ userInfo.location || '未设置' }}</text>
          </view>
        </view>
      </view>
      
      <!-- 联系信息卡片 -->
      <view class="info-card">
        <view class="card-header">
          <text class="card-title">联系信息</text>
        </view>
        
        <view class="info-list">
          <view class="info-item">
            <text class="info-label">手机号</text>
            <text class="info-value">{{ formatPhone(userInfo.phone) }}</text>
          </view>
          
          <view class="info-item">
            <text class="info-label">邮箱</text>
            <text class="info-value">{{ userInfo.email || '未绑定' }}</text>
          </view>
        </view>
      </view>
      
      <!-- 账户信息卡片 -->
      <view class="info-card">
        <view class="card-header">
          <text class="card-title">账户信息</text>
        </view>
        
        <view class="info-list">
          <view class="info-item">
            <text class="info-label">注册时间</text>
            <text class="info-value">{{ formatDateTime(userInfo.createTime) }}</text>
          </view>
          
          <view class="info-item">
            <text class="info-label">最后登录</text>
            <text class="info-value">{{ formatDateTime(userInfo.lastLoginTime) }}</text>
          </view>
          
          <view class="info-item">
            <text class="info-label">账户状态</text>
            <text class="info-value status-active">{{ userInfo.status === 'active' ? '正常' : '异常' }}</text>
          </view>
        </view>
      </view>
      
      <!-- 操作按钮 -->
      <view class="action-buttons">
        <view class="action-button" @click="editProfile">
          <text class="button-text">编辑资料</text>
        </view>
        
        <view class="action-button secondary" @click="refreshInfo">
          <text class="button-text">刷新信息</text>
        </view>
      </view>
    </scroll-view>
    
    <user-tabbar></user-tabbar>
  </view>
</template>

<script>
import UserTabbar from '@/components/tabbar/user-tabbar/user-tabbar.vue'
import { getCurrentUser, getUserSettings, getFavorites } from '@/api/modules/user.js'

export default {
  name: 'InfoPage',
  components: {
    UserTabbar
  },
  data() {
    return {
      loading: false,
      refreshing: false,
      retryCount: 0,
      dataLoaded: false,
      lastLoadTime: 0,
      userInfo: {
        nickname: '',
        memberId: '',
        gender: '',
        birthday: '',
        location: '',
        phone: '',
        email: '',
        createTime: '',
        lastLoginTime: '',
        status: 'active'
      }
    }
  },
  onLoad() {
    console.log('用户信息页面加载')
    this.loadUserInfo()
  },
  onShow() {
    // 页面显示时检查是否需要刷新数据
    if (this.dataLoaded) {
      console.log('页面重新显示，检查数据新鲜度')
      const lastLoadTime = this.lastLoadTime || 0
      const now = Date.now()
      // 如果超过5分钟，自动刷新数据
      if (now - lastLoadTime > 5 * 60 * 1000) {
        console.log('数据过期，自动刷新')
        this.loadUserInfo(true)
      }
    }
  },
  methods: {
    // 加载用户信息（企业级性能优化版本）
    async loadUserInfo(isRefresh = false) {
      if (this.loading && !isRefresh) return
      
      if (isRefresh) {
        this.refreshing = true
        this.retryCount = 0
      } else {
        this.loading = true
      }
      
      try {
        console.log('开始加载用户信息...')
        
        // 使用多层数据保护策略获取用户信息
        const userData = await this.getUserInfoWithPerformanceOptimization(isRefresh)
        
        if (userData) {
          // 数据验证和映射
          this.userInfo = this.validateAndMapUserData(userData)
          
          // 缓存用户信息
          this.cacheUserInfo(this.userInfo)
          
          this.dataLoaded = true
          this.retryCount = 0
          this.lastLoadTime = Date.now()
          console.log('用户信息加载成功:', this.userInfo)
          
          if (isRefresh) {
            uni.showToast({
              title: '刷新成功',
              icon: 'success'
            })
          }
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        await this.handleUserInfoLoadError(error, isRefresh)
      } finally {
        this.loading = false
        this.refreshing = false
      }
    },

    // 性能优化的用户信息获取
    async getUserInfoWithPerformanceOptimization(isRefresh) {
      const cacheKey = 'user_info_performance_cache'
      
      try {
        // 第一层：智能缓存检查（非强制刷新时）
        if (!isRefresh) {
          const cachedData = this.getCachedData(cacheKey)
          if (cachedData && this.isCacheValid(cachedData)) {
            console.log('使用高性能缓存数据')
            return cachedData
          }
        }
        
        // 第二层：并行数据获取优化
        const userData = await this.getParallelUserData()
        
        // 缓存数据
        this.cacheData(cacheKey, userData)
        return userData
        
      } catch (error) {
        console.warn('主要数据获取失败，尝试备用策略:', error)
        
        try {
          // 第三层：备用数据源
          const backupData = await this.getBackupUserInfo()
          if (backupData) {
            console.log('使用备用数据源成功')
            return backupData
          }
        } catch (backupError) {
          console.warn('备用数据源失败:', backupError)
        }
        
        try {
          // 第四层：过期缓存数据
          const expiredCache = this.getExpiredCacheData(cacheKey)
          if (expiredCache) {
            console.log('使用过期缓存数据')
            return expiredCache
          }
        } catch (cacheError) {
          console.warn('过期缓存获取失败:', cacheError)
        }
        
        // 第五层：默认值
        console.log('使用默认用户信息')
        return this.getDefaultUserInfo()
      }
    },

    // 并行数据获取优化
    async getParallelUserData() {
      // 使用智能重试并行获取用户数据
      const [userResult, settingsResult, favoritesResult] = await Promise.allSettled([
        this.retryWithBackoff(() => getCurrentUser(), 3, 1000),
        this.retryWithBackoff(() => getUserSettings(), 2, 500),
        this.retryWithBackoff(() => getFavorites({ page: 1, pageSize: 1 }), 2, 500)
      ])
      
      // 主要用户数据
      let userData = {}
      if (userResult.status === 'fulfilled') {
        userData = userResult.value.data || userResult.value
      } else {
        throw userResult.reason
      }
      
      // 补充设置数据
      if (settingsResult.status === 'fulfilled') {
        const settingsData = settingsResult.value.data || settingsResult.value
        if (settingsData) {
          userData.language = settingsData.language || userData.language
          userData.theme = settingsData.theme || userData.theme
          userData.notifications = settingsData.notifications || userData.notifications
        }
      }
      
      // 补充收藏数据中的用户信息
      if (favoritesResult.status === 'fulfilled') {
        const favoritesData = favoritesResult.value.data || favoritesResult.value
        if (favoritesData && favoritesData.userInfo) {
          userData.avatar = userData.avatar || favoritesData.userInfo.avatar
          userData.nickname = userData.nickname || favoritesData.userInfo.nickname
        }
      }
      
      return userData
    },

    // 智能指数退避重试算法
    async retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          return await fn()
        } catch (error) {
          if (attempt === maxRetries - 1) throw error
          
          // 指数退避 + 随机抖动
          const exponentialDelay = baseDelay * Math.pow(2, attempt)
          const randomJitter = Math.random() * 500
          const delay = Math.min(exponentialDelay + randomJitter, 5000)
          
          console.log(`重试第 ${attempt + 1} 次，延迟 ${Math.round(delay)}ms`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    },

    // 数据验证和映射
    validateAndMapUserData(userData) {
      // 数据验证规则
      const validatedData = {
        nickname: this.validateNickname(userData.nickname || userData.name),
        memberId: this.validateMemberId(userData.memberId || userData.id || userData.userId),
        gender: this.validateGender(userData.gender || userData.sex),
        birthday: this.validateBirthday(userData.birthday || userData.birthDate),
        location: this.validateLocation(userData.location || userData.address || userData.city),
        phone: this.validatePhone(userData.phone || userData.mobile || userData.phoneNumber),
        email: this.validateEmail(userData.email || userData.emailAddress),
        createTime: this.validateDateTime(userData.createTime || userData.createdAt || userData.registerTime),
        lastLoginTime: this.validateDateTime(userData.lastLoginTime || userData.lastLogin || userData.lastActiveTime),
        status: this.validateStatus(userData.status || userData.accountStatus)
      }
      
      return validatedData
    },

    // 昵称验证
    validateNickname(nickname) {
      if (!nickname || typeof nickname !== 'string') return ''
      
      // 去除首尾空格
      const trimmed = nickname.trim()
      
      // 长度限制
      if (trimmed.length === 0) return ''
      if (trimmed.length > 20) return trimmed.substring(0, 20)
      
      // 过滤特殊字符
      const filtered = trimmed.replace(/[<>\"'&]/g, '')
      return filtered || ''
    },

    // 会员ID验证
    validateMemberId(memberId) {
      if (!memberId) return ''
      
      const memberIdStr = String(memberId)
      // 只保留数字和字母
      const filtered = memberIdStr.replace(/[^a-zA-Z0-9]/g, '')
      return filtered || ''
    },

    // 性别验证
    validateGender(gender) {
      if (!gender) return ''
      
      const genderStr = String(gender).toLowerCase()
      const genderMap = {
        'male': 'male',
        'female': 'female',
        'm': 'male',
        'f': 'female',
        '1': 'male',
        '2': 'female',
        '男': 'male',
        '女': 'female',
        'man': 'male',
        'woman': 'female'
      }
      
      return genderMap[genderStr] || ''
    },

    // 生日验证
    validateBirthday(birthday) {
      if (!birthday) return ''
      
      // 尝试解析日期
      const date = new Date(birthday)
      if (isNaN(date.getTime())) return ''
      
      // 检查日期范围（1900-当前年份）
      const year = date.getFullYear()
      const currentYear = new Date().getFullYear()
      
      if (year < 1900 || year > currentYear) return ''
      
      // 返回标准格式
      return date.toISOString().split('T')[0]
    },

    // 地址验证
    validateLocation(location) {
      if (!location || typeof location !== 'string') return ''
      
      const trimmed = location.trim()
      
      // 长度限制
      if (trimmed.length === 0) return ''
      if (trimmed.length > 100) return trimmed.substring(0, 100)
      
      return trimmed
    },

    // 手机号验证
    validatePhone(phone) {
      if (!phone || typeof phone !== 'string') return ''
      
      // 去除非数字字符
      const digits = phone.replace(/\D/g, '')
      
      // 中国手机号格式验证
      if (/^1[3-9]\d{9}$/.test(digits)) {
        return digits
      }
      
      return ''
    },

    // 邮箱验证
    validateEmail(email) {
      if (!email || typeof email !== 'string') return ''
      
      const trimmed = email.trim().toLowerCase()
      
      // 简单邮箱格式验证
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (emailRegex.test(trimmed)) {
        return trimmed
      }
      
      return ''
    },

    // 日期时间验证
    validateDateTime(dateTime) {
      if (!dateTime) return ''
      
      // 尝试解析日期
      const date = new Date(dateTime)
      if (isNaN(date.getTime())) return ''
      
      return dateTime
    },

    // 状态验证
    validateStatus(status) {
      if (!status) return 'active'
      
      const validStatuses = ['active', 'inactive', 'suspended', 'pending']
      return validStatuses.includes(status) ? status : 'active'
    },

    // 获取备用用户信息
    async getBackupUserInfo() {
      const errors = []
      
      // 备用数据源1：用户设置
      try {
        const settingsResponse = await getUserSettings()
        const settingsData = settingsResponse.data || settingsResponse
        
        if (settingsData && (settingsData.nickname || settingsData.userInfo)) {
          const userInfo = settingsData.userInfo || settingsData
          return this.getDefaultUserInfo(userInfo)
        }
      } catch (error) {
        errors.push({ source: 'settings', error })
      }
      
      // 备用数据源2：收藏信息
      try {
        const favoritesResponse = await getFavorites({ page: 1, pageSize: 1 })
        const favoritesData = favoritesResponse.data || favoritesResponse
        
        if (favoritesData && favoritesData.userInfo) {
          return this.getDefaultUserInfo(favoritesData.userInfo)
        }
      } catch (error) {
        errors.push({ source: 'favorites', error })
      }
      
      console.warn('所有备用数据源都失败:', errors)
      return null
    },

    // 获取默认用户信息
    getDefaultUserInfo(baseData = {}) {
      return {
        nickname: baseData.nickname || baseData.name || '',
        memberId: baseData.memberId || baseData.id || baseData.userId || '',
        gender: baseData.gender || baseData.sex || '',
        birthday: baseData.birthday || baseData.birthDate || '',
        location: baseData.location || baseData.address || baseData.city || '',
        phone: baseData.phone || baseData.mobile || baseData.phoneNumber || '',
        email: baseData.email || baseData.emailAddress || '',
        createTime: baseData.createTime || baseData.createdAt || baseData.registerTime || '',
        lastLoginTime: baseData.lastLoginTime || baseData.lastLogin || baseData.lastActiveTime || '',
        status: baseData.status || baseData.accountStatus || 'active'
      }
    },

    // 通用缓存数据方法
    cacheData(key, data) {
      try {
        const cacheItem = {
          data: data,
          timestamp: Date.now(),
          expiry: 10 * 60 * 1000 // 10分钟过期
        }
        uni.setStorageSync(key, JSON.stringify(cacheItem))
      } catch (error) {
        console.warn('缓存数据失败:', error)
      }
    },

    // 通用获取缓存数据方法
    getCachedData(key) {
      try {
        const cacheStr = uni.getStorageSync(key)
        if (!cacheStr) return null
        
        const cacheItem = JSON.parse(cacheStr)
        const now = Date.now()
        
        // 检查是否过期
        if (now - cacheItem.timestamp > cacheItem.expiry) {
          return null
        }
        
        return cacheItem.data
      } catch (error) {
        console.warn('获取缓存数据失败:', error)
        return null
      }
    },

    // 获取过期缓存数据（紧急情况下使用）
    getExpiredCacheData(key) {
      try {
        const cacheStr = uni.getStorageSync(key)
        if (!cacheStr) return null
        
        const cacheItem = JSON.parse(cacheStr)
        return cacheItem.data
      } catch (error) {
        console.warn('获取过期缓存数据失败:', error)
        return null
      }
    },

    // 检查缓存是否有效
    isCacheValid(cachedData) {
      // 检查数据完整性
      if (!cachedData || typeof cachedData !== 'object') return false
      
      // 检查必要字段
      const requiredFields = ['nickname', 'memberId']
      return requiredFields.some(field => cachedData.hasOwnProperty(field) && cachedData[field])
    },

    // 缓存用户信息
    cacheUserInfo(userInfo) {
      try {
        const cacheKey = 'user_info_cache'
        const cacheItem = {
          data: userInfo,
          timestamp: Date.now(),
          expiry: 10 * 60 * 1000 // 10分钟过期
        }
        uni.setStorageSync(cacheKey, JSON.stringify(cacheItem))
      } catch (error) {
        console.warn('缓存用户信息失败:', error)
      }
    },

    // 获取缓存的用户信息
    getCachedUserInfo() {
      try {
        const cacheKey = 'user_info_cache'
        const cacheStr = uni.getStorageSync(cacheKey)
        if (!cacheStr) return null
        
        const cacheItem = JSON.parse(cacheStr)
        const now = Date.now()
        
        // 检查是否过期
        if (now - cacheItem.timestamp > cacheItem.expiry) {
          return null
        }
        
        return cacheItem.data
      } catch (error) {
        console.warn('获取缓存用户信息失败:', error)
        return null
      }
    },

    // 处理用户信息加载错误
    async handleUserInfoLoadError(error, isRefresh) {
      // 错误分类处理
      const errorMessage = this.classifyError(error)
      
      // 尝试使用缓存数据
      const cachedData = this.getCachedUserInfo()
      if (cachedData) {
        this.userInfo = cachedData
        this.dataLoaded = true
        uni.showToast({
          title: '网络异常，显示缓存数据',
          icon: 'none',
          duration: 2000
        })
        return
      }
      
      // 处理特殊错误
      if (error.code === 401 || error.status === 401) {
        this.handleLoginExpired()
        return
      }
      
      // 显示错误信息
      uni.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 3000
      })
      
      // 使用默认值
      this.userInfo = this.getDefaultUserInfo()
      this.dataLoaded = true
      
      // 显示重试选项
      this.showRetryOption()
    },

    // 错误分类
    classifyError(error) {
      if (!error) return '未知错误'
      
      const errorMsg = error.message || error.msg || error.toString()
      const errorCode = error.code || error.status
      
      // 网络相关错误
      if (errorCode === 'NETWORK_ERROR' || errorMsg.includes('网络')) {
        return '网络连接异常，请检查网络设置'
      }
      
      // 超时错误
      if (errorCode === 'TIMEOUT' || errorMsg.includes('timeout') || errorMsg.includes('超时')) {
        return '请求超时，请稍后重试'
      }
      
      // 权限相关错误
      if (errorCode === 401 || errorMsg.includes('401') || errorMsg.includes('未授权')) {
        return '登录已过期，请重新登录'
      }
      
      if (errorCode === 403 || errorMsg.includes('403') || errorMsg.includes('权限')) {
        return '访问权限不足'
      }
      
      // 服务器错误
      if (errorCode >= 500 || errorMsg.includes('500') || errorMsg.includes('服务器')) {
        return '服务器内部错误，请稍后重试'
      }
      
      return '获取数据失败，请稍后重试'
    },

    // 处理登录过期
    handleLoginExpired() {
      uni.showModal({
        title: '提示',
        content: '登录已过期，请重新登录',
        showCancel: false,
        success: () => {
          // 清除本地存储
          uni.clearStorageSync()
          
          // 跳转到登录页
          uni.reLaunch({
            url: '/pages/login/index'
          })
        }
      })
    },

    // 显示重试选项
    showRetryOption() {
      uni.showModal({
        title: '加载失败',
        content: '获取用户信息失败，是否重试？',
        confirmText: '重试',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            this.loadUserInfo()
          }
        }
      })
    },
    
    // 获取用户友好的错误信息
    getErrorMessage(error) {
      if (!error) return '未知错误'
      
      const errorMsg = error.message || error.msg || error.toString()
      
      if (errorMsg.includes('网络')) {
        return '网络连接失败，请检查网络设置'
      } else if (errorMsg.includes('超时')) {
        return '请求超时，请稍后重试'
      } else if (errorMsg.includes('401') || errorMsg.includes('未授权')) {
        return '登录已过期，请重新登录'
      } else if (errorMsg.includes('403') || errorMsg.includes('权限')) {
        return '没有访问权限'
      } else if (errorMsg.includes('404')) {
        return '请求的资源不存在'
      } else if (errorMsg.includes('500')) {
        return '服务器内部错误'
      } else {
        return '获取用户信息失败'
      }
    },
    
    // 格式化性别显示（增强版）
    formatGender(gender) {
      if (!gender) return '未设置'
      
      const genderMap = {
        'male': '男',
        'female': '女',
        'M': '男',
        'F': '女',
        '1': '男',
        '2': '女',
        '男': '男',
        '女': '女',
        'man': '男',
        'woman': '女'
      }
      
      const normalizedGender = String(gender).toLowerCase()
      return genderMap[normalizedGender] || genderMap[gender] || '未设置'
    },
    
    // 格式化手机号显示（增强版）
    formatPhone(phone) {
      if (!phone) return '未绑定'
      
      // 移除所有非数字字符
      const cleanPhone = String(phone).replace(/\D/g, '')
      
      if (cleanPhone.length === 11) {
        // 中国大陆手机号格式化
        return cleanPhone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
      } else if (cleanPhone.length === 10) {
        // 其他格式手机号
        return cleanPhone.replace(/(\d{3})\d{3}(\d{4})/, '$1***$2')
      } else if (cleanPhone.length > 6) {
        // 通用格式化：显示前3位和后4位
        const start = cleanPhone.substring(0, 3)
        const end = cleanPhone.substring(cleanPhone.length - 4)
        const middle = '*'.repeat(cleanPhone.length - 7)
        return `${start}${middle}${end}`
      }
      
      return phone
    },
    
    // 格式化日期时间（增强版）
    formatDateTime(dateTime) {
      if (!dateTime) return '未知'
      
      try {
        let date
        
        // 处理多种日期格式
        if (typeof dateTime === 'string') {
          // 处理时间戳字符串
          if (/^\d+$/.test(dateTime)) {
            const timestamp = parseInt(dateTime)
            date = new Date(timestamp > 9999999999 ? timestamp : timestamp * 1000)
          } else {
            date = new Date(dateTime)
          }
        } else if (typeof dateTime === 'number') {
          // 处理时间戳数字
          date = new Date(dateTime > 9999999999 ? dateTime : dateTime * 1000)
        } else {
          date = new Date(dateTime)
        }
        
        // 验证日期有效性
        if (isNaN(date.getTime())) {
          return '日期格式错误'
        }
        
        const now = new Date()
        const diffTime = now.getTime() - date.getTime()
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
        
        // 相对时间显示
        if (diffDays === 0) {
          const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
          if (diffHours === 0) {
            const diffMinutes = Math.floor(diffTime / (1000 * 60))
            if (diffMinutes < 5) {
              return '刚刚'
            } else if (diffMinutes < 60) {
              return `${diffMinutes}分钟前`
            }
          }
          if (diffHours < 24) {
            return `${diffHours}小时前`
          }
        } else if (diffDays === 1) {
          return '昨天'
        } else if (diffDays === 2) {
          return '前天'
        } else if (diffDays < 7) {
          return `${diffDays}天前`
        }
        
        // 标准格式显示
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        
        // 如果是今年，不显示年份
        if (year === now.getFullYear()) {
          return `${month}-${day} ${hours}:${minutes}`
        }
        
        return `${year}-${month}-${day} ${hours}:${minutes}`
      } catch (error) {
        console.error('日期格式化错误:', error)
        return String(dateTime)
      }
    },
    
    // 编辑资料
    editProfile() {
      uni.navigateTo({
        url: '/pages/user/profile/edit/index'
      })
    },
    
    // 下拉刷新
    onRefresh() {
      console.log('触发下拉刷新')
      this.loadUserInfo(true)
    },
    
    // 刷新信息
    refreshInfo() {
      this.loadUserInfo(true)
    }
  }
}
</script>

<style lang="scss" scoped>
.info-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400rpx;
}

.loading-text {
  font-size: 28rpx;
  color: #666;
}

.content {
  padding: 20rpx;
  padding-bottom: 120rpx;
}

.info-card {
  background: #ffffff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.card-header {
  padding: 30rpx 30rpx 20rpx 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.info-list {
  padding: 20rpx 30rpx 30rpx 30rpx;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f8f8f8;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 28rpx;
  color: #666;
  width: 160rpx;
  flex-shrink: 0;
}

.info-value {
  font-size: 28rpx;
  color: #333;
  flex: 1;
  text-align: right;
}

.status-active {
  color: #4cd964;
}

.action-buttons {
  margin-top: 40rpx;
  display: flex;
  gap: 20rpx;
}

.action-button {
  flex: 1;
  height: 80rpx;
  background: #007AFF;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-button.secondary {
  background: #f0f0f0;
}

.button-text {
  font-size: 28rpx;
  color: #ffffff;
}

.action-button.secondary .button-text {
  color: #333;
}
</style>