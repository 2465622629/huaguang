<template>
  <view class="credit-score-page" :style="pageBackgroundStyle">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="navbar-content">
        <view class="navbar-left" @click="goBack">
          <uv-icon name="arrow-left" color="#333333" bold="true" size="32"></uv-icon>
          <text class="back-text">返回</text>
        </view>
        <text class="navbar-title">信用评分</text>
      </view>
    </view>

    <!-- 主视觉区域 -->
    <view class="hero-section">
      <view class="diamond-container">
        <view class="diamond-shape" :style="diamondBackgroundStyle">
          <view class="diamond-content">
            <text class="amount-number">{{ remainingDebt.toLocaleString() }}元</text>
            <!-- <text class="amount-unit">元</text> -->
            <text class="amount-desc">剩余欠款</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 内容区域 -->
    <view class="content-section">
      <!-- 还款提醒卡片 -->
      <view class="card payment-reminder-card">
        <view class="card-content">
          <view class="card-left">
            <view class="icon-container credit-card-icon">
              <image :src="config.staticBaseUrl + (isReminderSet ? '/icons/huan.png' : '/icons/card.png')" style="width: 60rpx; height: 60rpx;"></image>
            </view>
            <view class="text-content">
              <text class="main-text">按时完成信用卡还款</text>
              <text class="sub-text">{{ isReminderSet ? '下次还款日期' + paymentDayText + '号' : '点击设置提醒' }}</text>
            </view>
          </view>
          <view class="card-right">
            <uv-button type="primary" size="small" shape="circle" @click="handleSetReminder">{{ isReminderSet ? '去还款' : '去设置' }}</uv-button>
          </view>
        </view>
      </view>

      <!-- 信用基础认知卡片 -->
      <view class="card knowledge-card">
        <text class="card-title">信用基础认知</text>
        
        <!-- 问题1 -->
        <view class="question-block">
          <view class="question-header">
            <view class="question-icon">
              <uv-icon name="question-circle-fill" color="#FFFFFF" size="32"></uv-icon>
            </view>
            <text class="question-text">什么是<text style="color: #0049FF;">信用</text>？</text>
          </view>
          <text class="answer-text">{{ creditKnowledge.question1.answer }}</text>
        </view>

        <!-- 问题2 -->
        <view class="question-block">
          <view class="question-header">
            <view class="question-icon">
              <uv-icon name="question-circle-fill" color="#FFFFFF" size="32"></uv-icon>
            </view>
            <text class="question-text">为什么<text style="color: #0049FF;">信用</text>重要?</text>
          </view>
          <view class="points-list">
            <view v-for="(point, index) in creditKnowledge.question2.points" :key="index" class="point-item">
              <view class="point-icon" :class="point.type">
                <uv-icon :name="point.type === 'success' ? 'checkmark' : 'close'" color="#FFFFFF" size="10"></uv-icon>
              </view>
              <text class="point-text">{{ point.text }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 信用记录管理与维护卡片 -->
      <view class="card maintenance-card">
        <text class="card-title">信用记录的管理与维护</text>
        <view class="maintenance-list">
          <view v-for="(item, index) in maintenancePoints" :key="index" class="maintenance-item">
            <text class="maintenance-title">
              <template v-if="index === 0">
                按时<text style="color: #0049FF;">还款</text>
              </template>
              <template v-else-if="index === 1">
                控制<text style="color: #0049FF;">负债率</text>
              </template>
              <template v-else-if="index === 2">
                <text style="color: #0049FF;">减少</text>硬查询
              </template>
              <template v-else-if="index === 3">
                长期保持<text style="color: #0049FF;">活跃</text>
              </template>
              <template v-else>
                {{ item.title }}
              </template>
            </text>
            <text class="maintenance-desc">{{ item.desc }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部TabBar -->
    <user-tabbar></user-tabbar>

    <!-- 日历组件 -->
    <uv-calendar 
      ref="calendar" 
      mode="single" 
      :show="false"
      :closeOnClickOverlay="true"
      :closeOnClickConfirm="true"
      title="选择还款日期"
      confirmText="确定"
      @confirm="onCalendarConfirm"
    ></uv-calendar>
  </view>
</template>

<script>
import UserTabbar from '@/components/tabbar/user-tabbar/user-tabbar.vue'
import config from '@/config/index.js'

export default {
  name: 'CreditScorePage',
  components: {
    UserTabbar
  },
  data() {
    return {
      remainingDebt: 0,
      selectedDate: null,
      isReminderSet: false,
      loading: true,
      creditKnowledge: {
        question1: {
          question: "什么是信用?",
          answer: "信用是你的\"经济身份证\"，记录了你借钱、还款、消费的历史。它决定了银行、网贷平台、甚至房东是否信任你。"
        },
        question2: {
          question: "为什么信用重要?",
          points: [
            { type: 'success', text: '贷款/信用卡审批：信用分高=更低利率、更高额度' },
            { type: 'success', text: '租房/求职：部分房东/雇主会查征信' },
            { type: 'success', text: '生活便利：免押金租车、酒店入住等' },
            { type: 'warning', text: '失信代价：被列入黑名单后，高铁/飞机出行受限' }
          ]
        }
      },
      maintenancePoints: [
        { title: '按时还款', desc: '· 设置自动还款，避免1次逾期影响5年' },
        { title: '控制负债率', desc: '· 信用卡使用额≤70%（如额度1万，账单最好不超7千）' },
        { title: '减少硬查询', desc: '· 3个月内贷款/申卡不超过2次' },
        { title: '长期保持活跃', desc: '· 保留1-2张最老的信用卡，不用也每年刷1次' }
      ],
      config: config
    }
  },
  computed: {
    pageBackgroundStyle() {
      return {
        background: `url('${this.config.staticBaseUrl}/apply-bg.png') no-repeat center center`,
        backgroundSize: 'cover'
      }
    },
    diamondBackgroundStyle() {
      return {
        background: `url('${this.config.staticBaseUrl}/score_bg.png') no-repeat center center`
      }
    },
    paymentDayText() {
      if (!this.selectedDate) return ''
      const date = new Date(this.selectedDate)
      return date.getDate()
    }
  },
  async onLoad() {
    await this.loadCreditData()
  },
  methods: {
    // 加载信用数据
    async loadCreditData() {
      try {
        // 导入青年帮扶API模块
        const youthAssistanceApi = (await import('@/api/modules/youth-assistance.js')).default
        
        // 调用getCreditRecord方法获取信用记录信息
        const creditRes = await youthAssistanceApi.getCreditRecord()
        
        if (creditRes && creditRes.success) {
          // 从信用记录中提取剩余债务信息
          this.remainingDebt = creditRes.data.remainingDebt || creditRes.data.totalDebt || 0
          
          // 如果有还款提醒设置，加载提醒信息
          if (creditRes.data.paymentReminder) {
            this.selectedDate = creditRes.data.paymentReminder.date
            this.isReminderSet = true
          }
          
          // 如果有信用分数，可以在这里处理
          if (creditRes.data.creditScore) {
            console.log('用户信用分数：', creditRes.data.creditScore)
          }
        } else {
          // API调用失败时使用默认值
          console.warn('获取信用记录失败，使用默认值')
          this.remainingDebt = 85166
        }
      } catch (error) {
        console.error('加载信用记录失败：', error)
        // 使用默认值
        this.remainingDebt = 85166
      } finally {
        this.loading = false
      }
    },
    
    goBack() {
      uni.navigateBack()
    },
    handleSetReminder() {
      this.$refs.calendar.open()
    },
    onCalendarConfirm(result) {
      if (result && result.length > 0) {
        this.selectedDate = result[0]
        this.isReminderSet = true
        uni.showToast({
          icon: 'success',
          title: `已设置${this.paymentDayText}号提醒`
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.credit-score-page {
  height: 100vh;
  min-height: 100vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 100rpx; /* 为TabBar预留空间 */
}

/* 自定义导航栏 */
.custom-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: transparent;
  
  .navbar-content {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 88rpx;
    padding: 0 30rpx;
    padding-top: var(--status-bar-height, 44rpx);
    position: relative;
    
    .navbar-left {
      position: absolute;
      left: 30rpx;
      display: flex;
      align-items: center;
      gap: 8rpx;
      
      .back-text {
        font-size: 32rpx;
        color: #333333;
      }
    }
    
    .navbar-title {
      font-size: 30rpx;
      color: #333333;
    }
  }
}

/* 主视觉区域 */
.hero-section {
  padding-top: 140rpx; /* 导航栏高度 + 间距 */
  padding-bottom: 60rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  
  .diamond-container {
    position: relative;
    
    .diamond-shape {
      width: 900rpx;
      height: 500rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .diamond-content {
        text-align: center;
        color: #FFFFFF;
        margin-top: 42rpx;
        
        .amount-number {
          display: block;
          font-size: 45rpx;
          font-weight: bold;
          line-height: 1;
        }
        
        .amount-unit {
          font-size: 32rpx;
          margin-left: 8rpx;
        }
        
        .amount-desc {
          display: block;
          font-size: 24rpx;
          margin-top: 8rpx;
          opacity: 0.9;
        }
      }
    }
  }
}

/* 内容区域 */
.content-section {
  padding: 0 30rpx;
  
  .card {
    background: #FFFFFF;
    border-radius: 16rpx;
    margin-bottom: 40rpx;
    padding: 30rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
    
    .card-title {
      font-size: 32rpx;
      color: #000000;
      font-weight: bold;
      display: block;
      margin-bottom: 30rpx;
    }
  }
}

/* 还款提醒卡片 */
.payment-reminder-card {
  .card-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    .card-left {
      display: flex;
      align-items: center;
      gap: 20rpx;
      flex: 1;
      
      .icon-container {
        width: 80rpx;
        height: 60rpx;
        border-radius: 12rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        
        // &.credit-card-icon {
        //   background: #007AFF;
        // }
      }
      
      .text-content {
        display: flex;
        flex-direction: column;
        gap: 8rpx;
        
        .main-text {
          font-size: 30rpx;
          color: #333333;
        }
        
        .sub-text {
          font-size: 24rpx;
          color: #888888;
        }
      }
    }
  }
}

/* 信用基础认知卡片 */
.knowledge-card {
  .question-block {
    margin-bottom: 30rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .question-header {
      display: flex;
      align-items: center;
      gap: 12rpx;
      margin-bottom: 16rpx;
      
      .question-icon {
        width: 32rpx;
        height: 32rpx;
        background: #555555;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .question-text {
        font-size: 30rpx;
        color: #666;
        font-weight: 500;
      }
    }
    
    .answer-text {
      font-size: 26rpx;
      color: #666666;
      line-height: 1.5;
      margin-left: 44rpx;
    }
    
    .points-list {
      margin-left: 44rpx;
      
      .point-item {
        display: flex;
        align-items: flex-start;
        gap: 12rpx;
        margin-bottom: 12rpx;
        
        .point-icon {
          width: 28rpx;
          height: 28rpx;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 4rpx;
          flex-shrink: 0;
          
          &.success {
            background: #007AFF;
          }
          
          &.warning {
            background: #FF6347;
          }
        }
        
        .point-text {
          font-size: 26rpx;
          color: #666666;
          line-height: 1.5;
          flex: 1;
        }
      }
    }
  }
}

/* 信用记录管理与维护卡片 */
.maintenance-card {
  .maintenance-list {
    .maintenance-item {
      margin-bottom: 24rpx;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .maintenance-title {
        font-size: 30rpx;
        color: #666;
        font-weight: 500;
        display: block;
        margin-bottom: 8rpx;
      }
      
      .maintenance-desc {
        font-size: 26rpx;
        color: #666666;
        line-height: 1.5;
      }
    }
  }
}
</style>