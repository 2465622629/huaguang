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
          <text class="lawyer-name">{{ lawyerInfo.name }}</text>
          <text class="lawyer-service">{{ lawyerInfo.service }}</text>
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
            <text class="info-label">服务类型</text>
            <text class="info-value">{{ orderInfo.serviceType }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">价格</text>
            <text class="info-value">{{ orderInfo.price }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">服务时长</text>
            <text class="info-value">{{ orderInfo.duration }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">支付方式</text>
            <text class="info-value">{{ orderInfo.paymentMethod }}</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 底部操作按钮区域 -->
    <view class="action-button-area">
      <uv-button 
        text="立即支付并提交咨询"
        type="primary"
        :customStyle="{
          backgroundColor: '#4285F4',
          borderRadius: '20rpx',
          height: '97rpx',
          fontSize: '36rpx',
          width: '85%',
          letterSpacing: '13rpx'
        }"
        @click="handlePayment"
      ></uv-button>
    </view>
  </view>
</template>

<script>
import config from '@/config/index.js'

export default {
  name: 'OrderDetail',
  data() {
    return {
      config,
      lawyerInfo: {
        name: '李律师',
        service: '已选语音咨询120元/30分钟'
      },
      orderInfo: {
        serviceType: '语音咨询',
        price: '120元',
        duration: '30分钟',
        paymentMethod: '支付宝'
      }
    }
  },
  onLoad(options) {
    // 接收传递的参数
    if (options.consultationType) {
      this.updateOrderInfo(options)
    }
  },
  methods: {
    // 根据传递的参数更新页面数据
    updateOrderInfo(params) {
      const { consultationType, lawyerName, lawyerSpecialty } = params
      
      // 更新律师信息
      this.lawyerInfo.name = lawyerName || '李律师'
      
      // 根据咨询类型更新服务信息
      if (consultationType === 'text') {
        this.lawyerInfo.service = '已选图文咨询80元/次'
        this.orderInfo.serviceType = '图文咨询'
        this.orderInfo.price = '80元'
        this.orderInfo.duration = '不限时'
      } else {
        this.lawyerInfo.service = '已选语音咨询120元/30分钟'
        this.orderInfo.serviceType = '语音咨询'
        this.orderInfo.price = '120元'
        this.orderInfo.duration = '30分钟'
      }
    },
    
    // 处理支付按钮点击
    handlePayment() {
      uni.navigateTo({
        url: '/pages/lawyer/chat/index'
      })
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