<template>
  <view class="order-detail-page" :style="{ backgroundImage: `url('${config.staticBaseUrl}/bg8.png')` }">
    <!-- 自定义导航栏 -->
    <uv-navbar 
      title="订单详情" 
      :autoBack="true"
      leftText="返回"
      bgColor="transparent"
      leftIconColor="#FFFFFF"
      :titleStyle="{ color: '#FFFFFF' }"
    ></uv-navbar>
    
    <!-- 主内容区域 -->
    <view class="main-content">
      
      <!-- 律师信息卡片 -->
      <view class="lawyer-card">
        <view class="lawyer-avatar">
          <view class="avatar-placeholder"></view>
        </view>
        <view class="lawyer-info">
          <text class="lawyer-name">{{ expertInfo.name }}</text>
          <text class="lawyer-service">{{ expertInfo.service }}</text>
          <view class="expert-type-badge" :class="expertInfo.type">
            <text class="badge-text">
              {{ expertInfo.type === 'lawyer' ? '律师' : expertInfo.type === 'teacher' ? '讲师' : '心理师' }}
            </text>
          </view>
        </view>
      </view>
      
      <!-- 问题输入提示卡片 -->
      <view class="question-input-card">
        <text class="question-placeholder">请输入您的问题，包括时间，背景，关键点等等 (20-300字)</text>
      </view>
      
      <!-- 订单信息卡片 -->
      <view class="order-info-card">
        <text class="card-title">订单信息</text>
        <view class="info-list">
          <view class="info-item">
            <text class="info-label">订单号</text>
            <text class="info-value">{{ orderData.orderNo || '生成中...' }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">订单状态</text>
            <text class="info-value status-text" :class="orderData.status">{{ getOrderStatusText() }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">支付状态</text>
            <text class="info-value payment-text" :class="orderData.paymentStatus">{{ getPaymentStatusText() }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">服务类型</text>
            <text class="info-value">{{ orderInfo.serviceType }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">价格</text>
            <text class="info-value price-text">{{ orderInfo.price }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">服务时长</text>
            <text class="info-value">{{ orderInfo.duration }}</text>
          </view>
          <view class="info-item" v-if="orderInfo.createTime">
            <text class="info-label">创建时间</text>
            <text class="info-value">{{ orderInfo.createTime }}</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 底部操作按钮区域 -->
    <view class="action-button-area">
      <uv-button
        :text="getButtonText()"
        type="primary"
        :loading="loading"
        :disabled="loading"
        :customStyle="getButtonStyle()"
        @click="handlePayment"
      ></uv-button>
    </view>
  </view>
</template>

<script>
import config from '@/config/index.js'
import { getLegalOrderDetail } from '@/api/modules/legal.js'
import { getCourseOrderDetail } from '@/api/modules/skill-training.js'
import { getPsychologyOrderDetail } from '@/api/modules/order.js'
import { createWechatPayOrder, queryWechatPayOrder, closeWechatPayOrder } from '@/api/modules/payment.js'

export default {
  name: 'OrderDetail',
  data() {
    return {
      config,
      loading: false,
      retryCount: 0,
      maxRetries: 3,
      // 企业级缓存配置
      cacheConfig: {
        orderDetailCacheTime: 5 * 60 * 1000, // 订单详情缓存5分钟
        paymentStatusCacheTime: 2 * 60 * 1000, // 支付状态缓存2分钟
        maxCacheSize: 50 // 最大缓存条目数
      },
      // 数据保护层级
      dataProtection: {
        useCache: true,
        useLocalStorage: true,
        enableFallback: true
      },
      // 支付相关状态
      paymentLoading: false,
      paymentOrderNo: '',
      paymentPollingTimer: null,
      paymentRetryCount: 0,
      maxPaymentRetries: 5,
      // 订单基本信息
      orderData: {
        orderNo: '',
        orderId: '',
        orderType: 'legal', // legal, course, psychology
        status: 'pending', // pending, paid, processing, completed, cancelled
        paymentStatus: 'unpaid' // unpaid, paid, refunded
      },
      // 专家/讲师信息
      expertInfo: {
        name: '专家',
        service: '服务信息',
        type: 'lawyer', // lawyer, teacher, psychologist
        avatar: '',
        specialty: ''
      },
      // 订单详细信息
      orderInfo: {
        serviceType: '咨询服务',
        price: '0元',
        duration: '30分钟',
        paymentMethod: '支付宝',
        createTime: '',
        description: '',
        amount: 0
      },
      // 订单状态映射
      statusMap: {
        pending: '待支付',
        paid: '已支付',
        processing: '进行中',
        completed: '已完成',
        cancelled: '已取消'
      },
      paymentStatusMap: {
        unpaid: '未支付',
        paid: '已支付',
        refunded: '已退款'
      }
    }
  },
  onLoad(options) {
    console.log('订单详情页面参数:', options)
    this.loadOrderInfo(options)
  },
  onUnload() {
    // 页面销毁时清理定时器
    this.stopPaymentStatusPolling()
  },
  methods: {
    // 加载订单信息
    async loadOrderInfo(options) {
      try {
        this.loading = true
        
        // 解析URL参数
        this.parseOrderParams(options)
        
        // 根据订单类型加载详情
        await this.loadOrderDetailWithRetry()
        
      } catch (error) {
        console.error('加载订单详情失败:', error)
        this.handleLoadError(error)
      } finally {
        this.loading = false
      }
    },
    
    // ==================== 企业级缓存系统 ====================
    
    // 智能缓存管理
    getCacheKey(type, key) {
      return `order_detail_${type}_${key}_${this.orderData.orderType || 'default'}`
    },
    
    // 获取缓存数据
    getCachedData(type, key) {
      if (!this.dataProtection.useCache) return null
      
      try {
        const cacheKey = this.getCacheKey(type, key)
        const cached = uni.getStorageSync(cacheKey)
        
        if (cached && cached.timestamp) {
          const cacheTime = type === 'orderDetail' ? this.cacheConfig.orderDetailCacheTime : this.cacheConfig.paymentStatusCacheTime
          const isExpired = Date.now() - cached.timestamp > cacheTime
          
          if (!isExpired) {
            console.log(`缓存命中: ${type}`, cached.data)
            return cached.data
          } else {
            // 清理过期缓存
            uni.removeStorageSync(cacheKey)
          }
        }
      } catch (error) {
        console.warn('获取缓存失败:', error)
      }
      
      return null
    },
    
    // 设置缓存数据
    setCachedData(type, key, data) {
      if (!this.dataProtection.useCache) return
      
      try {
        const cacheKey = this.getCacheKey(type, key)
        const cacheData = {
          data: data,
          timestamp: Date.now()
        }
        
        uni.setStorageSync(cacheKey, cacheData)
        console.log(`缓存设置: ${type}`, data)
      } catch (error) {
        console.warn('设置缓存失败:', error)
      }
    },
    
    // 清理所有相关缓存
    clearOrderCache() {
      try {
        const keys = ['orderDetail', 'paymentStatus']
        keys.forEach(type => {
          const cacheKey = this.getCacheKey(type, this.orderData.orderNo || 'default')
          uni.removeStorageSync(cacheKey)
        })
        console.log('订单缓存已清理')
      } catch (error) {
        console.warn('清理缓存失败:', error)
      }
    },
    
    // 本地存储备份
    saveToLocalStorage(key, data) {
      if (!this.dataProtection.useLocalStorage) return
      
      try {
        const storageKey = `order_backup_${key}`
        uni.setStorageSync(storageKey, {
          data: data,
          timestamp: Date.now()
        })
      } catch (error) {
        console.warn('本地存储备份失败:', error)
      }
    },
    
    // 从本地存储恢复
    getFromLocalStorage(key) {
      if (!this.dataProtection.useLocalStorage) return null
      
      try {
        const storageKey = `order_backup_${key}`
        const backup = uni.getStorageSync(storageKey)
        
        if (backup && backup.data) {
          console.log('从本地存储恢复数据:', backup.data)
          return backup.data
        }
      } catch (error) {
        console.warn('从本地存储恢复失败:', error)
      }
      
      return null
    },
    
    // ==================== 数据加载优化 ====================
    
    // 解析订单参数
    parseOrderParams(options) {
      try {
        // 基本订单信息
        this.orderData.orderNo = options.orderNo || ''
        this.orderData.orderId = options.orderId || ''
        this.orderData.orderType = options.orderType || 'legal'
        
        // 专家信息
        if (options.expertName) {
          this.expertInfo.name = decodeURIComponent(options.expertName)
        }
        if (options.expertSpecialty) {
          this.expertInfo.specialty = decodeURIComponent(options.expertSpecialty)
        }
        if (options.expertType) {
          this.expertInfo.type = options.expertType
        }
        
        // 服务信息
        if (options.serviceTitle) {
          this.orderInfo.serviceType = decodeURIComponent(options.serviceTitle)
        }
        if (options.servicePrice) {
          this.orderInfo.amount = parseFloat(options.servicePrice) || 0
          this.orderInfo.price = `${this.orderInfo.amount}元`
        }
        if (options.serviceUnit) {
          this.orderInfo.duration = decodeURIComponent(options.serviceUnit)
        }
        
        // 更新专家服务信息
        this.updateExpertService()
        
        console.log('解析后的订单信息:', {
          orderData: this.orderData,
          expertInfo: this.expertInfo,
          orderInfo: this.orderInfo
        })
        
      } catch (error) {
        console.error('解析订单参数失败:', error)
        this.setDefaultOrderInfo()
      }
    },
    
    // 更新专家服务信息
    updateExpertService() {
      const serviceText = `已选${this.orderInfo.serviceType} ${this.orderInfo.price}/${this.orderInfo.duration}`
      this.expertInfo.service = serviceText
    },
    
    // 设置默认订单信息
    setDefaultOrderInfo() {
      this.orderData = {
        orderNo: 'DEFAULT_ORDER',
        orderId: 'default_order_id',
        orderType: 'legal',
        status: 'pending',
        paymentStatus: 'unpaid'
      }
      this.expertInfo = {
        name: '专业律师',
        service: '已选图文咨询 60元/次',
        type: 'lawyer',
        specialty: '法律咨询'
      }
      this.orderInfo = {
        serviceType: '图文咨询',
        price: '60元',
        duration: '次',
        paymentMethod: '支付宝',
        amount: 60
      }
    },
    
    // 带重试机制的订单详情加载（企业级优化版）
    async loadOrderDetailWithRetry() {
      const cacheKey = this.orderData.orderNo || 'default'
      
      // 1. 尝试从缓存获取
      const cachedData = this.getCachedData('orderDetail', cacheKey)
      if (cachedData) {
        this.updateOrderFromAPI(cachedData)
        console.log('使用缓存数据')
        return
      }
      
      // 2. 尝试从本地存储恢复
      const backupData = this.getFromLocalStorage(cacheKey)
      if (backupData && this.dataProtection.enableFallback) {
        this.updateOrderFromAPI(backupData)
        console.log('使用本地存储备份数据')
      }
      
      // 3. API加载（带指数退避重试）
      for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
        try {
          console.log(`订单详情加载尝试 ${attempt + 1}/${this.maxRetries + 1}`)
          
          let apiData = null
          
          if (this.orderData.orderType === 'legal') {
            apiData = await this.loadLegalOrderDetail()
          } else if (this.orderData.orderType === 'course') {
            apiData = await this.loadCourseOrderDetail()
          } else if (this.orderData.orderType === 'psychology') {
            apiData = await this.loadPsychologyOrderDetail()
          } else {
            console.log('未知订单类型，使用当前数据')
            return
          }
          
          // 4. 成功后缓存和备份数据
          if (apiData) {
            this.setCachedData('orderDetail', cacheKey, apiData)
            this.saveToLocalStorage(cacheKey, apiData)
          }
          
          console.log('订单详情加载成功')
          return
          
        } catch (error) {
          console.error(`第 ${attempt + 1} 次尝试失败:`, error)
          
          if (attempt === this.maxRetries) {
            // 最后一次失败，尝试使用备份数据
            if (backupData && this.dataProtection.enableFallback) {
              console.log('API失败，使用备份数据')
              this.updateOrderFromAPI(backupData)
              return
            }
            throw error
          }
          
          // 指数退避重试，添加随机抖动（1s-8s）
          const baseDelay = Math.min(1000 * Math.pow(2, attempt), 8000)
          const jitter = Math.random() * 1000
          const delay = baseDelay + jitter
          console.log(`等待 ${delay.toFixed(0)}ms 后重试...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    },
    
    // 加载法律咨询订单详情
    async loadLegalOrderDetail() {
      if (!this.orderData.orderNo) {
        console.log('无订单号，使用当前数据')
        return
      }
      
      try {
        console.log('加载法律咨询订单详情:', this.orderData.orderNo)
        const response = await getLegalOrderDetail(this.orderData.orderNo)
        
        if (response) {
          this.updateOrderFromAPI(response)
          console.log('法律咨询订单详情加载成功:', response)
        }
        
      } catch (error) {
        console.warn('法律咨询订单API失败，使用当前数据:', error)
        // 不抛出错误，使用当前数据
      }
    },
    
    // 加载课程订单详情
    async loadCourseOrderDetail() {
      if (!this.orderData.orderId) {
        console.log('无课程订单ID，使用当前数据')
        return
      }
      
      try {
        console.log('加载课程订单详情:', this.orderData.orderId)
        const response = await getCourseOrderDetail(this.orderData.orderId)
        
        if (response) {
          this.updateCourseOrderFromAPI(response)
          console.log('课程订单详情加载成功:', response)
        }
        
      } catch (error) {
        console.warn('课程订单API失败，使用当前数据:', error)
        // 不抛出错误，使用当前数据
      }
    },
    
    // 加载心理咨询订单详情
    async loadPsychologyOrderDetail() {
      if (!this.orderData.orderNo) {
        console.log('无心理咨询订单号，使用当前数据')
        return null
      }
      
      try {
        console.log('加载心理咨询订单详情:', this.orderData.orderNo)
        const response = await getPsychologyOrderDetail(this.orderData.orderNo)
        
        if (response) {
          this.updatePsychologyOrderFromAPI(response)
          console.log('心理咨询订单详情加载成功:', response)
          return response
        }
        
        return null
        
      } catch (error) {
        console.warn('心理咨询订单API失败，使用当前数据:', error)
        // 不抛出错误，使用当前数据
        return null
      }
    },
    
    // 从API响应更新订单信息
    updateOrderFromAPI(apiData) {
      try {
        // 更新订单状态
        if (apiData.status) {
          this.orderData.status = apiData.status
        }
        if (apiData.paymentStatus) {
          this.orderData.paymentStatus = apiData.paymentStatus
        }
        
        // 更新专家信息
        if (apiData.lawyer || apiData.expert) {
          const expert = apiData.lawyer || apiData.expert
          this.expertInfo.name = expert.name || this.expertInfo.name
          this.expertInfo.specialty = expert.specialty || this.expertInfo.specialty
          this.expertInfo.avatar = expert.avatar || ''
        }
        
        // 更新订单详情
        if (apiData.amount) {
          this.orderInfo.amount = apiData.amount
          this.orderInfo.price = `${apiData.amount}元`
        }
        if (apiData.serviceType) {
          this.orderInfo.serviceType = apiData.serviceType
        }
        if (apiData.createTime) {
          this.orderInfo.createTime = this.formatTime(apiData.createTime)
        }
        if (apiData.description) {
          this.orderInfo.description = apiData.description
        }
        
        // 更新专家服务信息
        this.updateExpertService()
        
      } catch (error) {
        console.error('更新订单信息失败:', error)
      }
    },
    
    // 从课程API响应更新订单信息
    updateCourseOrderFromAPI(apiData) {
      try {
        // 更新订单状态
        if (apiData.status) {
          this.orderData.status = apiData.status
        }
        if (apiData.paymentStatus) {
          this.orderData.paymentStatus = apiData.paymentStatus
        }
        
        // 更新课程信息
        if (apiData.course) {
          this.expertInfo.name = apiData.course.instructor || '讲师'
          this.expertInfo.type = 'teacher'
          this.expertInfo.specialty = apiData.course.category || '技能培训'
          this.orderInfo.serviceType = apiData.course.title || '课程学习'
        }
        
        // 更新订单详情
        if (apiData.amount) {
          this.orderInfo.amount = apiData.amount
          this.orderInfo.price = `${apiData.amount}元`
        }
        if (apiData.createTime) {
          this.orderInfo.createTime = this.formatTime(apiData.createTime)
        }
        
        // 更新专家服务信息
        this.updateExpertService()
        
      } catch (error) {
        console.error('更新课程订单信息失败:', error)
      }
    },
    
    // 从心理咨询API响应更新订单信息
    updatePsychologyOrderFromAPI(apiData) {
      try {
        // 更新订单状态
        if (apiData.status) {
          this.orderData.status = apiData.status
        }
        if (apiData.paymentStatus) {
          this.orderData.paymentStatus = apiData.paymentStatus
        }
        
        // 更新心理师信息
        if (apiData.psychologist) {
          this.expertInfo.name = apiData.psychologist.name || '心理师'
          this.expertInfo.type = 'psychologist'
          this.expertInfo.specialty = apiData.psychologist.specialty || '心理咨询'
          this.expertInfo.avatar = apiData.psychologist.avatar || ''
          this.orderInfo.serviceType = apiData.serviceType || '心理咨询'
        }
        
        // 更新订单详情
        if (apiData.amount) {
          this.orderInfo.amount = apiData.amount
          this.orderInfo.price = `${apiData.amount}元`
        }
        if (apiData.createTime) {
          this.orderInfo.createTime = this.formatTime(apiData.createTime)
        }
        if (apiData.description) {
          this.orderInfo.description = apiData.description
        }
        
        // 更新专家服务信息
        this.updateExpertService()
        
      } catch (error) {
        console.error('更新心理咨询订单信息失败:', error)
      }
    },
    
    // 格式化时间
    formatTime(timeString) {
      try {
        const date = new Date(timeString)
        return date.toLocaleString('zh-CN')
      } catch (error) {
        return timeString
      }
    },
    
    // 获取订单状态文本
    getOrderStatusText() {
      return this.statusMap[this.orderData.status] || '未知状态'
    },
    
    // 获取支付状态文本
    getPaymentStatusText() {
      return this.paymentStatusMap[this.orderData.paymentStatus] || '未知状态'
    },
    
    // 错误处理
    handleLoadError(error) {
      console.error('订单详情加载失败:', error)
      
      // 使用默认数据
      this.setDefaultOrderInfo()
      
      // 显示用户友好的错误提示
      let errorMessage = '订单信息加载失败，显示默认数据'
      
      if (error.message && error.message.includes('timeout')) {
        errorMessage = '网络超时，请检查网络连接'
      } else if (error.message && error.message.includes('404')) {
        errorMessage = '订单不存在或已删除'
      } else if (error.message && error.message.includes('401')) {
        errorMessage = '请先登录后查看订单'
      }
      
      uni.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 3000
      })
    },
    
    // 处理支付按钮点击
    handlePayment() {
      if (this.orderData.paymentStatus === 'paid') {
        // 已支付，跳转到对应的服务页面
        this.navigateToService()
      } else {
        // 未支付，处理支付逻辑
        this.processPayment()
      }
    },
    
    // 处理支付逻辑（企业级版本）
    async processPayment() {
      if (this.paymentLoading) return
      
      try {
        this.paymentLoading = true
        console.log('开始处理支付:', this.orderData)
        
        // 1. 创建支付订单
        const paymentData = await this.createPaymentOrderWithRetry()
        if (!paymentData) {
          throw new Error('创建支付订单失败')
        }
        
        this.paymentOrderNo = paymentData.paymentOrderNo
        
        // 2. 选择支付方式并发起支付
        const paymentResult = await this.initiatePayment(paymentData)
        if (!paymentResult) {
          throw new Error('发起支付失败')
        }
        
        // 3. 开始支付状态轮询
        this.startPaymentStatusPolling()
        
      } catch (error) {
        console.error('支付处理失败:', error)
        this.handlePaymentError(error)
      } finally {
        this.paymentLoading = false
      }
    },
    
    // 创建微信支付订单（带重试）
    async createPaymentOrderWithRetry() {
      for (let attempt = 0; attempt <= this.maxPaymentRetries; attempt++) {
        try {
          console.log(`创建微信支付订单尝试 ${attempt + 1}/${this.maxPaymentRetries + 1}`)
          
          // 订单类型映射：前端 -> 后端API
          const orderTypeMap = {
            'legal': 'consultation',      // 法律咨询
            'course': 'course',           // 课程学习
            'psychology': 'consultation'  // 心理咨询（也归为咨询类型）
          }
          
          const paymentData = {
            relatedOrderId: this.orderData.orderNo,
            relatedOrderType: orderTypeMap[this.orderData.orderType] || 'consultation',
            amount: this.orderInfo.amount,
            description: `${this.orderInfo.serviceType} - ${this.expertInfo.name}`,
            payType: 'NATIVE' // 微信小程序支付类型
          }
          
          console.log('微信支付订单数据:', paymentData)
          const response = await createWechatPayOrder(paymentData)
          
          console.log('微信支付订单响应:', response)
          
          // 检查响应格式：统一 API 响应格式为 { code, data, message }
          if (response && response.code === 200 && response.data) {
            const orderData = response.data
            console.log('微信支付订单创建成功:', orderData)
            
            // 返回包含支付所需信息的数据
            return {
              paymentOrderNo: orderData.outTradeNo,
              prepayId: orderData.prepayId,
              paySign: orderData.paySign,
              timeStamp: orderData.timeStamp,
              nonceStr: orderData.nonceStr,
              signType: orderData.signType || 'RSA',
              package: orderData.package
            }
          } else if (response && response.outTradeNo) {
            // 兼容直接返回订单数据的情况
            console.log('微信支付订单创建成功（直接格式）:', response)
            return {
              paymentOrderNo: response.outTradeNo,
              prepayId: response.prepayId,
              paySign: response.paySign,
              timeStamp: response.timeStamp,
              nonceStr: response.nonceStr,
              signType: response.signType || 'RSA',
              package: response.package
            }
          } else {
            throw new Error('微信支付订单响应格式无效')
          }
          
        } catch (error) {
          console.error(`创建微信支付订单第 ${attempt + 1} 次尝试失败:`, error)
          
          if (attempt === this.maxPaymentRetries) {
            throw error
          }
          
          // 指数退避重试
          const delay = Math.min(1000 * Math.pow(2, attempt), 5000) + Math.random() * 500
          console.log(`等待 ${delay.toFixed(0)}ms 后重试创建微信支付订单...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    },
    
    // 发起微信支付
    async initiatePayment(paymentData) {
      try {
        uni.showLoading({
          title: '正在调起微信支付...'
        })
        
        console.log('调起微信支付，参数:', paymentData)
        
        // 调用微信支付
        const wxPayResult = await new Promise((resolve, reject) => {
          uni.requestPayment({
            provider: 'wxpay',
            timeStamp: paymentData.timeStamp,
            nonceStr: paymentData.nonceStr,
            package: paymentData.package,
            signType: paymentData.signType,
            paySign: paymentData.paySign,
            success: (res) => {
              console.log('微信支付成功:', res)
              resolve(res)
            },
            fail: (err) => {
              console.error('微信支付失败:', err)
              if (err.errMsg && err.errMsg.includes('cancel')) {
                reject(new Error('用户取消支付'))
              } else {
                reject(new Error(err.errMsg || '微信支付失败'))
              }
            }
          })
        })
        
        uni.hideLoading()
        
        if (wxPayResult) {
          console.log('微信支付调起成功:', wxPayResult)
          return wxPayResult
        } else {
          throw new Error('微信支付调起失败')
        }
        
      } catch (error) {
        uni.hideLoading()
        console.error('微信支付调起错误:', error)
        throw error
      }
    },
    
    // 开始支付状态轮询
    startPaymentStatusPolling() {
      if (this.paymentPollingTimer) {
        clearInterval(this.paymentPollingTimer)
      }
      
      console.log('开始支付状态轮询')
      let pollCount = 0
      const maxPollCount = 60 // 最多轮询60次（5分钟）
      
      this.paymentPollingTimer = setInterval(async () => {
        pollCount++
        
        try {
          const response = await queryWechatPayOrder(this.paymentOrderNo)
          console.log(`微信支付状态轮询 ${pollCount}/${maxPollCount}:`, response)
          
          let status = null
          
          // 检查响应格式：统一 API 响应格式为 { code, data, message }
          if (response && response.code === 200 && response.data) {
            status = response.data
          } else if (response && response.tradeState) {
            // 兼容直接返回状态数据的情况
            status = response
          }
          
          if (status) {
            // 微信支付状态映射：SUCCESS-支付成功，REFUND-转入退款，NOTPAY-未支付，CLOSED-已关闭，REVOKED-已撤销，USERPAYING-用户支付中，PAYERROR-支付失败
            if (status.tradeState === 'SUCCESS') {
              // 支付成功
              this.handlePaymentSuccess(status)
              this.stopPaymentStatusPolling()
            } else if (status.tradeState === 'PAYERROR' || status.tradeState === 'CLOSED' || status.tradeState === 'REVOKED') {
              // 支付失败
              this.handlePaymentFailure(status)
              this.stopPaymentStatusPolling()
            } else if (status.tradeState === 'NOTPAY' || status.tradeState === 'USERPAYING') {
              // 继续轮询
              console.log('支付中，继续轮询...')
            } else if (pollCount >= maxPollCount) {
              // 轮询超时
              this.handlePaymentTimeout()
              this.stopPaymentStatusPolling()
            }
          } else if (pollCount >= maxPollCount) {
            // 轮询超时
            this.handlePaymentTimeout()
            this.stopPaymentStatusPolling()
          }
          
        } catch (error) {
          console.error('微信支付状态查询失败:', error)
          
          if (pollCount >= maxPollCount) {
            this.handlePaymentTimeout()
            this.stopPaymentStatusPolling()
          }
        }
      }, 5000) // 每5秒轮询一次
    },
    
    // 停止支付状态轮询
    stopPaymentStatusPolling() {
      if (this.paymentPollingTimer) {
        clearInterval(this.paymentPollingTimer)
        this.paymentPollingTimer = null
        console.log('微信支付状态轮询已停止')
      }
    },
    
    // 处理支付成功
    handlePaymentSuccess(paymentStatus) {
      console.log('支付成功:', paymentStatus)
      
      // 更新订单状态
      this.orderData.paymentStatus = 'paid'
      this.orderData.status = 'processing'
      
      // 清理缓存，强制下次重新加载
      this.clearOrderCache()
      
      uni.showToast({
        title: '支付成功',
        icon: 'success',
        duration: 2000
      })
      
      // 延迟跳转到服务页面
      setTimeout(() => {
        this.navigateToService()
      }, 2000)
    },
    
    // 处理支付失败
    handlePaymentFailure(paymentStatus) {
      console.log('支付失败:', paymentStatus)
      
      uni.showToast({
        title: paymentStatus.failureReason || '支付失败，请重试',
        icon: 'none',
        duration: 3000
      })
    },
    
    // 处理支付超时
    handlePaymentTimeout() {
      console.log('支付状态查询超时')
      
      uni.showModal({
        title: '支付状态确认',
        content: '支付状态查询超时，请手动确认支付是否成功',
        confirmText: '已支付',
        cancelText: '未支付',
        success: (res) => {
          if (res.confirm) {
            // 用户确认已支付
            this.handlePaymentSuccess({ status: 'paid' })
          } else {
            // 用户确认未支付
            uni.showToast({
              title: '请重新发起支付',
              icon: 'none',
              duration: 2000
            })
          }
        }
      })
    },
    
    // 处理支付错误
    handlePaymentError(error) {
      console.error('微信支付错误:', error)
      
      let errorMessage = '微信支付失败，请重试'
      
      if (error.message && error.message.includes('timeout')) {
        errorMessage = '网络超时，请检查网络连接后重试'
      } else if (error.message && error.message.includes('用户取消支付')) {
        errorMessage = '用户取消支付'
      } else if (error.message && error.message.includes('cancel')) {
        errorMessage = '支付已取消'
      } else if (error.message && error.message.includes('微信支付')) {
        errorMessage = error.message
      } else if (error.message && error.message.includes('订单')) {
        errorMessage = '订单创建失败，请重试'
      }
      
      uni.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 3000
      })
    },
    
    // 跳转到对应的服务页面
    navigateToService() {
      if (this.orderData.orderType === 'legal') {
        // 法律咨询，跳转到律师聊天页面
        uni.navigateTo({
          url: `/pages/lawyer/chat/index?orderNo=${this.orderData.orderNo}&lawyerId=${this.expertInfo.id || 'default'}`
        })
      } else if (this.orderData.orderType === 'course') {
        // 课程订单，跳转到课程详情页面
        uni.navigateTo({
          url: `/pages/user/index/skill-training/detail/index?courseId=${this.orderData.orderId}`
        })
      } else if (this.orderData.orderType === 'psychology') {
        // 心理咨询，跳转到心理师聊天页面
        uni.navigateTo({
          url: `/pages/psychologist/consultation/consultation?orderNo=${this.orderData.orderNo}&psychologistId=${this.expertInfo.id || 'default'}`
        })
      }
    },
    
    // 获取按钮文本
    getButtonText() {
      if (this.loading) {
        return '加载中...'
      }
      
      if (this.orderData.paymentStatus === 'paid') {
        if (this.orderData.orderType === 'course') {
          return '开始学习'
        } else {
          return '开始咨询'
        }
      } else {
        return '微信支付并提交咨询'
      }
    },
    
    // 获取按钮样式
    getButtonStyle() {
      const baseStyle = {
        borderRadius: '20rpx',
        height: '97rpx',
        fontSize: '36rpx',
        width: '85%',
        letterSpacing: '13rpx'
      }
      
      if (this.loading) {
        return { ...baseStyle, backgroundColor: '#CCCCCC' }
      }
      
      if (this.orderData.paymentStatus === 'paid') {
        return { ...baseStyle, backgroundColor: '#28A745' }
      } else {
        return { ...baseStyle, backgroundColor: '#4285F4' }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.order-detail-page {
  min-height: 100vh;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
}

.main-content {
  padding: 200rpx 40rpx 200rpx;
}

/* 卡片通用样式 */
.lawyer-card,
.question-input-card,
.order-info-card {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

/* 律师信息卡片样式 */
.lawyer-card {
  display: flex;
  align-items: center;
}

.lawyer-avatar {
  margin-right: 24rpx;
}

.avatar-placeholder {
  width: 120rpx;
  height: 120rpx;
  background: #D8D8D8;
  border-radius: 50%;
}

.lawyer-info {
  flex: 1;
}

.lawyer-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
  display: block;
  margin-bottom: 12rpx;
}

.lawyer-service {
  font-size: 28rpx;
  color: #666666;
  display: block;
  margin-bottom: 8rpx;
}

.expert-type-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2rpx 8rpx;
  border-radius: 6rpx;
  background: #F0F0F0;
  
  &.lawyer {
    background: #E3F2FD;
    
    .badge-text {
      color: #1976D2;
    }
  }
  
  &.teacher {
    background: #E8F5E8;
    
    .badge-text {
      color: #388E3C;
    }
  }
  
  &.psychologist {
    background: #FCE4EC;
    
    .badge-text {
      color: #C2185B;
    }
  }
  
  .badge-text {
    font-size: 20rpx;
    color: #666666;
  }
}

/* 问题输入提示卡片样式 */
.question-input-card {
  min-height: 160rpx;
  display: flex;
  align-items: flex-start;
}

.question-placeholder {
  font-size: 30rpx;
  color: #AAAAAA;
  line-height: 1.5;
}

/* 订单信息卡片样式 */
.card-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
  display: block;
  margin-bottom: 30rpx;
}

.info-list {
  display: flex;
  flex-direction: column;
}

.info-item {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 20rpx;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  font-size: 28rpx;
  color: #666666;
  width: 160rpx;
  flex-shrink: 0;
}

.info-value {
  font-size: 28rpx;
  color: #333333;
  margin-left: 40rpx;
  
  &.status-text {
    &.pending {
      color: #FF9800;
    }
    
    &.paid, &.processing {
      color: #4CAF50;
    }
    
    &.completed {
      color: #2196F3;
    }
    
    &.cancelled {
      color: #F44336;
    }
  }
  
  &.payment-text {
    &.unpaid {
      color: #FF9800;
    }
    
    &.paid {
      color: #4CAF50;
    }
    
    &.refunded {
      color: #9E9E9E;
    }
  }
  
  &.price-text {
    color: #FF5722;
    font-weight: bold;
  }
}

/* 底部操作按钮区域样式 */
.action-button-area {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  // background: #FFFFFF;
  padding: 30rpx 40rpx;
  padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>