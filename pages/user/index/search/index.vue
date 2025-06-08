<template>
  <view class="search-container" :style="{ background: `url('${config.staticBaseUrl}/bg9.png') no-repeat center center/cover fixed` }">
    <!-- 状态栏占位 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
    
    <!-- 搜索区域 -->
    <view class="search-section">
      <uv-search 
        v-model="searchKeyword"
        shape="round"
        :bgColor="'#FFFFFF'"
        placeholder="搜索"
        actionText="取消"
        :searchIconColor="'#5B8DEF'"
        :placeholderColor="'#BDBDBD'"
        :height="36"
        :showAction="true"
        :searchIconSize="36"
        :animation="true"
        @search="onSearch"
        @custom="onCancel"
        @change="onSearchChange"
        :customStyle="searchCustomStyle"
      ></uv-search>
    </view>
    
    <!-- 热门搜索区域 -->
    <view class="hot-search-section">
      <view class="hot-search-title">大家都在搜</view>
      <view class="hot-tags-container">
        <view 
          v-for="(tag, index) in hotSearchList" 
          :key="index"
          class="hot-tag"
          @click="onHotTagClick(tag)"
        >
          {{ tag }}
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import config from '@/config/index.js'

export default {
  data() {
    return {
      config,
      searchKeyword: '',
      statusBarHeight: 0,
      hotSearchList: [
        '新媒体', 
        '电商', 
        '软件测试', 
        '思维导图',
        '短视频剪辑', 
        '自媒体运营'
      ],
      searchCustomStyle: {
        margin: '0 30rpx'
      }
    }
  },
  onLoad() {
    // 获取状态栏高度
    this.getStatusBarHeight()
  },
  methods: {
    // 获取状态栏高度
    getStatusBarHeight() {
      const systemInfo = uni.getSystemInfoSync()
      this.statusBarHeight = systemInfo.statusBarHeight || 0
    },
    
    // 搜索提交处理
    onSearch(value) {
      console.log('搜索内容:', value)
      // TODO: 实现搜索逻辑
    },
    
    // 取消搜索处理
    onCancel() {
      console.log('取消搜索')
      // 可以选择清空搜索内容或返回上一页
      this.searchKeyword = ''
    },
    
    // 搜索内容变化处理
    onSearchChange(value) {
      console.log('搜索内容变化:', value)
      // TODO: 可以实现实时搜索建议
    },
    
    // 热门标签点击处理
    onHotTagClick(tag) {
      console.log('点击热门标签:', tag)
      this.searchKeyword = tag
      // 可以选择自动触发搜索
      this.onSearch(tag)
    }
  }
}
</script>

<style lang="scss" scoped>
.search-container {
  height: 100vh;
}

.status-bar {
  width: 100%;
}

.search-section {
  padding: 80rpx 0 0 0 ;
}

.hot-search-section {
  padding: 0 30rpx;
  margin-top: 40rpx;
}

.hot-search-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 24rpx;
}

.hot-tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.hot-tag {
  background-color: #D2E6FF;
  color: #162F73;
  font-size: 28rpx;
  padding: 1rpx 24rpx;
  border-radius: 50rpx;
  white-space: nowrap;
}

.hot-tag:active {
  background-color: #D1E7FF;
  transform: scale(0.98);
}
</style> 