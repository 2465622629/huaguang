<template>
  <view class="container" :style="{ backgroundImage: 'url(' + config.staticBaseUrl + '/bg11.png)' }">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="navbar-content">
        <view class="back-button" @click="goBack">
          <uv-icon name="arrow-left" color="#FF4646" size="20"></uv-icon>
          <text class="back-text">返回</text>
        </view>
      </view>
    </view>

    <!-- 总览金额区域 -->
    <view class="overview-section">
      <text class="total-amount">¥{{ totalIncome }}</text>
      <text class="amount-label">累计收入</text>
    </view>

    <!-- 本日收入卡片 -->
    <view class="today-income-card">
      <text class="card-title">本日收入</text>
      <text class="today-amount">¥{{ todayIncome }}</text>
      <view class="withdraw-button" @click="handleWithdraw">
        <text class="withdraw-text">一键提现</text>
      </view>
    </view>

    <!-- 收入记录列表 -->
    <view class="income-records-section">
      <scroll-view 
        class="records-scroll-view" 
        scroll-y="true"
        :style="{ height: 770 + 'rpx' }"
        @scrolltolower="onScrollToLower"
      >
        <view 
          v-for="(record, index) in incomeRecords" 
          :key="index" 
          class="record-item"
        >
          <view class="record-left">
            <text class="record-date">{{ record.date }}</text>
            <text class="record-description">{{ record.description }}</text>
          </view>
          <text class="record-amount">¥{{ record.amount }}</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
import config from '@/config/index.js'

export default {
  name: 'IncomeManagement',
  data() {
    return {
      config,
      totalIncome: '8,550',
      todayIncome: '256.00',
      scrollViewHeight: 400,
      incomeRecords: [
        {
          date: '2025年4月12日 15:20',
          description: '劳动争议咨询',
          amount: '120'
        },
        {
          date: '2025年4月12日 14:35',
          description: '合同纠纷咨询',
          amount: '150'
        },
        {
          date: '2025年4月12日 13:45',
          description: '婚姻法律咨询',
          amount: '100'
        },
        {
          date: '2025年4月12日 11:20',
          description: '房产纠纷咨询',
          amount: '200'
        },
        {
          date: '2025年4月11日 16:30',
          description: '交通事故咨询',
          amount: '180'
        },
        {
          date: '2025年4月11日 15:15',
          description: '劳动仲裁咨询',
          amount: '160'
        },
        {
          date: '2025年4月11日 14:00',
          description: '债务纠纷咨询',
          amount: '140'
        },
        {
          date: '2025年4月11日 10:45',
          description: '知识产权咨询',
          amount: '220'
        }
      ]
    }
  },
  mounted() {
    this.calculateScrollViewHeight()
  },
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack()
    },
    
    // 一键提现
    handleWithdraw() {
      uni.showToast({
        title: '提现功能开发中',
        icon: 'none'
      })
    },
    
    // 计算滚动视图高度
    calculateScrollViewHeight() {
      const systemInfo = uni.getSystemInfoSync()
      const windowHeight = systemInfo.windowHeight
      // 减去状态栏、导航栏、总览区域、本日收入卡片的高度
      const usedHeight = 44 + 120 + 180 + 60 // 预估高度
      this.scrollViewHeight = windowHeight - usedHeight
    },
    
    // 滚动到底部
    onScrollToLower() {
      console.log('滚动到底部')
      // 这里可以实现加载更多数据的逻辑
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center center;
}

/* 自定义导航栏 */
.custom-navbar {
  padding-top: var(--status-bar-height);
  background: transparent;
}

.navbar-content {
  height: 44px;
  display: flex;
  align-items: center;
  padding: 0 16px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 6px;
}

.back-text {
  font-size: 16px;
  color: #FF4646;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

/* 总览金额区域 */
.overview-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 0;
  /* margin-top: 20px; */
}

.total-amount {
  font-size: 48px;
  font-weight: bold;
  color: #000000;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  margin-bottom: 8px;
}

.amount-label {
  font-size: 32rpx;
  color: #666666;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

/* 本日收入卡片 */
.today-income-card {
  margin: 0 20px 30px;
  background: radial-gradient(circle, #ff7878, #ffafaf);
  border-radius: 20px;
  padding: 25px 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card-title {
  font-size: 16px;
  color: #FFFFFF;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  margin-bottom: 12px;
}

.today-amount {
  font-size: 36px;
  font-weight: bold;
  color: #FFFFFF;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  margin-bottom: 25px;
}

.withdraw-button {
  background-color: #FFFFFF;
  border-radius: 22px;
  padding: 12px 30px;
  min-width: 120px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.withdraw-text {
  font-size: 16px;
  color: #000;
  font-weight: 600;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

/* 收入记录列表 */
.income-records-section {
  padding: 0 20px;
  flex: 1;
}

.records-scroll-view {
  width: 100%;

}

.record-item {
  background-color: #FFFFFF;
  border-radius: 12px;
  padding: 15px 20px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.record-left {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.record-date {
  font-size: 12px;
  color: #999999;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  margin-bottom: 6px;
}

.record-description {
  font-size: 15px;
  color: #333333;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

.record-amount {
  font-size: 15px;
  color: #333333;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-weight: 500;
}
</style> 