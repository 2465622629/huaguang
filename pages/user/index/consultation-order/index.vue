<template>
  <view class="consultation-order-page" :style="{ backgroundImage: `url('${config.staticBaseUrl}/bg8.png')` }">
    <!-- 自定义导航栏 -->
    <uv-navbar 
      title="咨询订单" 
      :autoBack="true"
      leftText="返回"
      bgColor="rgba(255,255,255,0)"
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
          <view class="lawyer-tag" :class="expertInfo.type">
            <text class="tag-text">{{ expertInfo.specialty }}</text>
          </view>
          <view class="expert-type-badge">
            <text class="badge-text">{{ expertInfo.type === 'lawyer' ? '律师' : '心理师' }}</text>
          </view>
        </view>
      </view>
      
      <!-- 咨询类型选择卡片 -->
      <view class="consultation-type-card">
        <view
          v-for="(typeOption, index) in consultationTypes"
          :key="index"
          class="type-option"
          :class="{ 'option-selected': selectedConsultationType === typeOption.type }"
          @click="selectConsultationType(typeOption.type)"
        >
          <view class="option-icon">
            <image :src="config.staticBaseUrl + '/icons/' + typeOption.icon + '.png'" class="icon-image"></image>
          </view>
          <view class="option-text">
            <text class="option-title">{{ typeOption.title }}</text>
            <text class="option-desc">{{ typeOption.desc }}</text>
            <view class="price-info">
              <text class="price">¥{{ typeOption.price }}</text>
              <text class="unit">/{{ typeOption.unit }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 底部行动按钮 -->
    <view class="action-button-area">
      <uv-button
        :text="loading ? '创建订单中...' : '立刻咨询'"
        type="primary"
        :loading="loading"
        :disabled="loading"
        :customStyle="{
          backgroundColor: loading ? '#CCCCCC' : '#2979FF',
          borderRadius: '12rpx',
          height: '97rpx',
          fontSize: '36rpx',
          fontWeight: 'bold',
          letterSpacing: '12rpx'
        }"
        @click="handleConsultation"
      ></uv-button>
    </view>
  </view>
</template>

<script>
import config from '@/config/index.js'
import { createLegalConsultationOrder } from '@/api/modules/legal.js'
import { bookPsychologistConsultation } from '@/api/modules/psychologist.js'

export default {
  name: 'ConsultationOrder',
  data() {
    return {
      config,
      selectedConsultationType: 'text', // 默认选中图文咨询
      loading: false,
      retryCount: 0,
      maxRetries: 3,
      // 专家信息（律师或心理师）
      expertInfo: {
        id: null,
        name: '专家',
        specialty: '专业领域',
        type: 'lawyer', // lawyer 或 psychologist
        services: []
      },
      // 咨询类型选项
      consultationTypes: [
        {
          type: 'text',
          title: '图文咨询',
          desc: '文字形式咨询',
          icon: 'img_big',
          price: 60,
          unit: '次'
        },
        {
          type: 'voice',
          title: '语音咨询',
          desc: '语音通话咨询',
          icon: 'call_big',
          price: 120,
          unit: '30分钟'
        }
      ]
    }
  },
  onLoad(options) {
    console.log('咨询订单页面参数:', options)
    this.loadExpertInfo(options)
  },
  methods: {
    // 加载专家信息
    loadExpertInfo(options) {
      try {
        // 从URL参数获取专家信息
        if (options.expertId) {
          this.expertInfo.id = options.expertId
        }
        if (options.expertName) {
          this.expertInfo.name = decodeURIComponent(options.expertName)
        }
        if (options.expertSpecialty) {
          this.expertInfo.specialty = decodeURIComponent(options.expertSpecialty)
        }
        if (options.expertType) {
          this.expertInfo.type = options.expertType
        }
        
        // 解析服务信息
        if (options.services) {
          try {
            this.expertInfo.services = JSON.parse(decodeURIComponent(options.services))
            this.updateConsultationTypes()
          } catch (error) {
            console.warn('解析服务信息失败:', error)
            this.setDefaultServices()
          }
        } else {
          this.setDefaultServices()
        }
        
        console.log('加载的专家信息:', this.expertInfo)
      } catch (error) {
        console.error('加载专家信息失败:', error)
        this.setDefaultExpertInfo()
      }
    },
    
    // 设置默认专家信息
    setDefaultExpertInfo() {
      this.expertInfo = {
        id: 'default_expert',
        name: '专业律师',
        specialty: '法律咨询',
        type: 'lawyer',
        services: []
      }
      this.setDefaultServices()
    },
    
    // 设置默认服务信息
    setDefaultServices() {
      if (this.expertInfo.type === 'lawyer') {
        this.consultationTypes = [
          {
            type: 'text',
            title: '图文咨询',
            desc: '文字形式咨询',
            icon: 'img_big',
            price: 60,
            unit: '次'
          },
          {
            type: 'voice',
            title: '语音咨询',
            desc: '语音通话咨询',
            icon: 'call_big',
            price: 120,
            unit: '30分钟'
          }
        ]
      } else {
        this.consultationTypes = [
          {
            type: 'text',
            title: '文字咨询',
            desc: '文字形式咨询',
            icon: 'img_big',
            price: 80,
            unit: '次'
          },
          {
            type: 'voice',
            title: '语音咨询',
            desc: '语音通话咨询',
            icon: 'call_big',
            price: 150,
            unit: '30分钟'
          }
        ]
      }
    },
    
    // 根据专家服务更新咨询类型
    updateConsultationTypes() {
      if (this.expertInfo.services && this.expertInfo.services.length > 0) {
        this.consultationTypes = this.expertInfo.services.map(service => ({
          type: service.type === '图文咨询' || service.type === '文字咨询' ? 'text' : 'voice',
          title: service.type,
          desc: service.type === '图文咨询' || service.type === '文字咨询' ? '文字形式咨询' : '语音通话咨询',
          icon: service.type === '图文咨询' || service.type === '文字咨询' ? 'img_big' : 'call_big',
          price: service.price,
          unit: service.unit
        }))
      }
    },
    
    // 获取当前选择的咨询类型信息
    getCurrentConsultationType() {
      return this.consultationTypes.find(type => type.type === this.selectedConsultationType) || this.consultationTypes[0]
    },
    // 选择咨询类型
    selectConsultationType(type) {
      this.selectedConsultationType = type
    },
    
    // 处理立即咨询按钮点击
    async handleConsultation() {
      if (this.loading) {
        return
      }
      
      try {
        this.loading = true
        console.log('开始创建咨询订单...')
        console.log('专家信息:', this.expertInfo)
        console.log('选择的咨询类型:', this.selectedConsultationType)
        
        const currentType = this.getCurrentConsultationType()
        const orderData = await this.createConsultationOrderWithRetry(currentType)
        
        console.log('订单创建成功:', orderData)
        
        // 显示成功提示
        uni.showToast({
          title: '订单创建成功',
          icon: 'success',
          duration: 2000
        })
        
        // 延迟跳转到订单详情页面
        setTimeout(() => {
          this.navigateToOrderDetail(orderData, currentType)
        }, 2000)
        
      } catch (error) {
        console.error('创建咨询订单失败:', error)
        this.handleOrderError(error)
      } finally {
        this.loading = false
      }
    },
    
    // 带重试机制的订单创建
    async createConsultationOrderWithRetry(consultationType) {
      for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
        try {
          console.log(`订单创建尝试 ${attempt + 1}/${this.maxRetries + 1}`)
          
          if (this.expertInfo.type === 'lawyer') {
            return await this.createLegalOrder(consultationType)
          } else if (this.expertInfo.type === 'psychologist') {
            return await this.createPsychologistOrder(consultationType)
          } else {
            throw new Error('未知的专家类型')
          }
          
        } catch (error) {
          console.error(`第 ${attempt + 1} 次尝试失败:`, error)
          
          if (attempt === this.maxRetries) {
            throw error
          }
          
          // 指数退避重试，添加随机抖动
          const delay = Math.min(1000 * Math.pow(2, attempt), 5000) + Math.random() * 1000
          console.log(`等待 ${delay.toFixed(0)}ms 后重试...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    },
    
    // 创建法律咨询订单
    async createLegalOrder(consultationType) {
      const orderData = {
        lawyerId: this.expertInfo.id,
        serviceType: consultationType.type,
        consultationType: consultationType.type === 'text' ? 'text' : 'voice',
        description: `${consultationType.title} - ${this.expertInfo.specialty}咨询`,
        amount: consultationType.price,
        contactPhone: '', // 可以从用户信息获取
        expertName: this.expertInfo.name,
        expertSpecialty: this.expertInfo.specialty
      }
      
      console.log('创建法律咨询订单，数据:', orderData)
      const response = await createLegalConsultationOrder(orderData)
      
      if (response && (response.orderNo || response.id)) {
        return {
          orderNo: response.orderNo || response.id,
          orderId: response.id || response.orderNo,
          type: 'legal',
          ...response
        }
      }
      
      throw new Error('法律咨询订单创建失败')
    },
    
    // 创建心理咨询订单
    async createPsychologistOrder(consultationType) {
      const orderData = {
        psychologistId: this.expertInfo.id,
        serviceId: `service_${consultationType.type}`,
        appointmentTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 默认明天
        consultationType: consultationType.type === 'text' ? 'text' : 'voice',
        description: `${consultationType.title} - ${this.expertInfo.specialty}咨询`,
        contactPhone: '', // 可以从用户信息获取
        expertName: this.expertInfo.name,
        expertSpecialty: this.expertInfo.specialty,
        amount: consultationType.price
      }
      
      console.log('创建心理咨询订单，数据:', orderData)
      const response = await bookPsychologistConsultation(orderData)
      
      if (response && (response.appointmentId || response.id)) {
        return {
          orderNo: response.appointmentId || response.id,
          orderId: response.id || response.appointmentId,
          type: 'psychology',
          ...response
        }
      }
      
      throw new Error('心理咨询订单创建失败')
    },
    
    // 跳转到订单详情页面
    navigateToOrderDetail(orderData, consultationType) {
      const params = {
        orderNo: orderData.orderNo,
        orderId: orderData.orderId,
        orderType: orderData.type,
        consultationType: this.selectedConsultationType,
        expertName: this.expertInfo.name,
        expertSpecialty: this.expertInfo.specialty,
        expertType: this.expertInfo.type,
        serviceTitle: consultationType.title,
        servicePrice: consultationType.price,
        serviceUnit: consultationType.unit
      }
      
      const queryString = Object.keys(params)
        .map(key => `${key}=${encodeURIComponent(params[key])}`)
        .join('&')
      
      uni.navigateTo({
        url: `/pages/user/index/order-detail/index?${queryString}`
      })
    },
    
    // 处理订单创建错误
    handleOrderError(error) {
      let errorMessage = '订单创建失败，请重试'
      
      if (error.message) {
        if (error.message.includes('timeout')) {
          errorMessage = '网络超时，请检查网络连接'
        } else if (error.message.includes('400')) {
          errorMessage = '订单信息有误，请重新选择'
        } else if (error.message.includes('401')) {
          errorMessage = '请先登录后再创建订单'
        } else if (error.message.includes('500')) {
          errorMessage = '服务器繁忙，请稍后重试'
        }
      }
      
      uni.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 3000
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.consultation-order-page {
  min-height: 100vh;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
}

.main-content {
  margin-top: 12rpx;
  padding: 200rpx 40rpx 200rpx;
}

/* 律师信息卡片样式 */
.lawyer-card {
  background: #FFFFFF;
  border-radius: 32rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
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

.lawyer-tag {
  border-radius: 8rpx;
  padding: 4rpx 10rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: fit-content;
  min-height: 32rpx;
  width: fit-content;
  margin-bottom: 8rpx;
  
  &.lawyer {
    background: #2979FF;
  }
  
  &.psychologist {
    background: #FF6B9D;
  }
}

.expert-type-badge {
  background: #F0F0F0;
  border-radius: 6rpx;
  padding: 2rpx 8rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  .badge-text {
    color: #666666;
    font-size: 20rpx;
  }
}

.tag-text {
  color: #FFFFFF;
  font-size: 24rpx;
}

/* 咨询类型选择卡片样式 */
.consultation-type-card {
  background: #FFFFFF;
  border-radius: 32rpx;
  padding: 30rpx;
}

.type-option {
  background: #F8F9FA;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
}

.type-option:last-child {
  margin-bottom: 0;
}

.option-selected {
  border-color: #5D9BFF !important;
}

.option-icon {
  width: 80rpx;
  height: 80rpx;
  // background: #87B8FF;
  border-radius: 12rpx;
  margin-right: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* 图文咨询图标 */
.text-icon {
  flex-direction: column;
}

.icon-image {
  width: 72rpx;
  height: 72rpx;
}



.option-text {
  flex: 1;
}

.option-title {
  font-size: 32rpx;
  color: #3d3d3d;
  display: block;
  margin-bottom: 8rpx;
  font-weight: bold;
}

.option-desc {
  font-size: 24rpx;
  color: #3d3d3d;
  margin-bottom: 8rpx;
}

.price-info {
  display: flex;
  align-items: baseline;
  
  .price {
    color: #2979FF;
    font-size: 28rpx;
    font-weight: bold;
  }
  
  .unit {
    color: #666666;
    font-size: 20rpx;
    margin-left: 4rpx;
  }
}

/* 底部按钮区域 */
.action-button-area {
  position: fixed;
  bottom: 60rpx;
  left: 140rpx;
  right: 140rpx;
  z-index: 100;
}
</style>