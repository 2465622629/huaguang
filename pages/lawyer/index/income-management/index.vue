<template>
  <view class="income-page">
    <view class="status-bar"></view>
    
    <uv-navbar 
      background="linear-gradient(180deg, rgb(160, 196, 255) 0%, rgb(135, 175, 255) 100%)"
      left-icon="arrow-left"
      title="收入管理"
      title-color="#FFFFFF"
      @left-click="goBack"
    ></uv-navbar>

    <view class="today-card">
      <text class="title">本日收入</text>
      <text class="amount">¥{{ todayIncome }}</text>
      <view class="withdraw-btn" @click="handleWithdraw">
        <text class="btn-text">一键提现</text>
      </view>
    </view>

    <view class="records-section">
      <scroll-view
        class="scroll-view"
        scroll-y="true"
        style="height: 400px;"
        @scrolltolower="loadMore"
        :refresher-enabled="true"
        :refresher-triggered="refreshing"
        @refresherrefresh="onRefresh"
      >
        <view v-if="loading" class="loading">
          <text>加载中...</text>
        </view>
        
        <view
          v-for="(record, index) in records"
          :key="index"
          class="record-item"
        >
          <view class="record-info">
            <text class="date">{{ record.date }}</text>
            <text class="desc">{{ record.description }}</text>
          </view>
          <text class="record-amount">¥{{ record.amount }}</text>
        </view>
        
        <view v-if="!hasMore" class="no-more">
          <text>没有更多数据了</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'IncomeManagement',
  data() {
    return {
      todayIncome: '0.00',
      records: [],
      loading: false,
      refreshing: false,
      hasMore: true
    }
  },
  onLoad() {
    this.loadData()
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    
    loadData() {
      console.log('加载数据')
    },
    
    loadMore() {
      console.log('加载更多')
    },
    
    onRefresh() {
      this.refreshing = true
      setTimeout(() => {
        this.refreshing = false
      }, 1000)
    },
    
    handleWithdraw() {
      console.log('提现')
    }
  }
}
</script>

<style lang="scss" scoped>
.income-page {
  width: 100%;
  height: 100vh;
  background-color: #F5F5F5;
}

.status-bar {
  height: var(--status-bar-height);
  background: linear-gradient(180deg, rgb(160, 196, 255) 0%, rgb(135, 175, 255) 100%);
}

.today-card {
  background-color: #FFFFFF;
  margin: 20px;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  
  .title {
    font-size: 14px;
    color: #666666;
    display: block;
    margin-bottom: 10px;
  }
  
  .amount {
    font-size: 24px;
    font-weight: bold;
    color: #333333;
    display: block;
    margin-bottom: 15px;
  }
  
  .withdraw-btn {
    background-color: #007AFF;
    padding: 8px 20px;
    border-radius: 20px;
    display: inline-block;
    
    .btn-text {
      color: #FFFFFF;
      font-size: 14px;
    }
  }
}

.records-section {
  margin: 0 20px;
  
  .scroll-view {
    background-color: #FFFFFF;
    border-radius: 12px;
  }
  
  .loading {
    text-align: center;
    padding: 20px;
    color: #999999;
  }
  
  .record-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    border-bottom: 1px solid #F0F0F0;
    
    .record-info {
      flex: 1;
      
      .date {
        display: block;
        font-size: 14px;
        color: #333333;
        margin-bottom: 4px;
      }
      
      .desc {
        font-size: 12px;
        color: #666666;
      }
    }
    
    .record-amount {
      font-size: 16px;
      font-weight: bold;
      color: #007AFF;
    }
  }
  
  .no-more {
    text-align: center;
    padding: 20px;
    color: #999999;
    font-size: 12px;
  }
}
</style> 