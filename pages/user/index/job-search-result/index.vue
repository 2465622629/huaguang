<template>
  <view class="job-search-container">
    <!-- 状态栏占位 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
    
    <!-- 搜索区域 -->
    <view class="search-section">
      <uv-search 
        v-model="searchKeyword"
        shape="round"
        :bgColor="'#FFFFFF'"
        placeholder="新媒体"
        actionText="取消"
        :searchIconColor="'#A0D2EB'"
        :placeholderColor="'#333333'"
        :height="38"
        :showAction="true"
        :animation="true"
        @search="onSearch"
        @custom="onCancel"
        @change="onSearchChange"
        :customStyle="searchCustomStyle"
      ></uv-search>
    </view>
    
    <!-- 搜索结果数量提示 -->
    <view class="result-count-section">
      <text class="result-count-text">共找到{{ resultCount }}个相关职位</text>
    </view>
    
    <!-- 职位列表区域 -->
    <scroll-view class="job-list-container" scroll-y="true">
      <!-- 加载状态 -->
      <view v-if="loading" class="loading-container">
        <uv-loading-icon mode="circle" color="#20B2AA" size="40"></uv-loading-icon>
        <text class="loading-text">正在搜索职位...</text>
      </view>
      
      <!-- 错误提示 -->
      <view v-else-if="error" class="error-container">
        <uv-icon name="error-circle" size="60" color="#FF6B6B"></uv-icon>
        <text class="error-text">{{ error }}</text>
      </view>
      
      <!-- 职位列表 -->
      <view 
        v-else
        v-for="(job, index) in jobList" 
        :key="job.id"
        class="job-card"
        @click="onJobCardClick(job)"
      >
        <!-- 第一行：职位名称与薪资 -->
        <view class="job-card-header">
          <text class="job-title">{{ job.title }}</text>
          <text class="job-salary">{{ job.salary }}</text>
        </view>
        
        <!-- 第二行：地点与学历 -->
        <view class="job-card-info">
          <view class="info-item">
            <uv-icon name="http://localhost:3000/static/icons/location.png" :size="24" color="#888888"></uv-icon>
            <text class="info-text">{{ job.location }}</text>
          </view>
          <view class="info-item">
            <uv-icon name="http://localhost:3000/static/icons/graduation.png" :size="24" color="#888888"></uv-icon>
            <text class="info-text">{{ job.education }}</text>
          </view>
        </view>
        
        <!-- 右侧箭头图标 -->
        <view class="arrow-icon">
          <uv-icon name="arrow-right" :size="32" color="#CCCCCC"></uv-icon>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { searchJobs } from '@/api/modules/enterprise.js'

export default {
  data() {
    return {
      searchKeyword: '新媒体',
      statusBarHeight: 0,
      resultCount: 0,
      loading: false,
      error: null,
      currentPage: 1,
      pageSize: 10,
      jobList: [
        {
          id: 1,
          title: '法务专员',
          salary: '6k-9k',
          location: '上海市 · 浦东新区',
          education: '本科'
        },
        {
          id: 2,
          title: '法务助理',
          salary: '4k-6k',
          location: '北京市 · 朝阳区',
          education: '大专'
        },
        {
          id: 3,
          title: '法务经理',
          salary: '10k-15k',
          location: '深圳市 · 南山区',
          education: '本科'
        },
        {
          id: 4,
          title: '合规专员',
          salary: '7k-10k',
          location: '广州市 · 天河区',
          education: '本科'
        },
        {
          id: 5,
          title: '法务顾问',
          salary: '8k-12k',
          location: '杭州市 · 西湖区',
          education: '硕士'
        }
      ],
      searchCustomStyle: {
        margin: '0 30rpx'
      }
    }
  },
  async onLoad() {
    // 获取状态栏高度
    this.getStatusBarHeight()
    // 执行初始搜索
    await this.performSearch(this.searchKeyword)
  },
  methods: {
    // 获取状态栏高度
    getStatusBarHeight() {
      const systemInfo = uni.getSystemInfoSync()
      this.statusBarHeight = systemInfo.statusBarHeight || 0
    },
    
    // 搜索提交处理
    async onSearch(value) {
      console.log('搜索内容:', value)
      await this.performSearch(value || this.searchKeyword)
    },
    
    // 执行搜索的核心逻辑
    async performSearch(keyword) {
      if (!keyword || keyword.trim() === '') {
        this.error = '请输入搜索关键词'
        return
      }
      
      this.loading = true
      this.error = null
      
      try {
        const params = {
          keyword: keyword.trim(),
          page: this.currentPage,
          size: this.pageSize
        }
        
        const response = await searchJobs(params)
      console.log('响应',response);
      
        
        if (response ) {
          this.jobList = this.formatJobData(response.jobs || [])
          this.resultCount = response.totalCount || 0
        } else {
          this.jobList = []
          this.resultCount = 0
        }
        
        if (this.jobList.length === 0) {
          this.error = '未找到相关职位，请尝试其他关键词'
        }
        
      } catch (error) {
        this.handleSearchError(error)
      } finally {
        this.loading = false
      }
    },
    
    // 转换API数据格式到UI需要的格式
    formatJobData(apiDataList) {
      if (!Array.isArray(apiDataList)) {
        return []
      }
      
      return apiDataList.map(item => {
        // 处理薪资格式转换
        let salary = '面议'
        if (item.salaryMin && item.salaryMax) {
          const minK = Math.floor(item.salaryMin / 1000)
          const maxK = Math.floor(item.salaryMax / 1000)
          salary = `${minK}k-${maxK}k`
        } else if (item.salary) {
          salary = item.salary
        }
        
        return {
          id: item.id,
          title: item.title || '职位名称',
          salary: salary,
          location: item.location || '工作地点',
          education: item.educationRequirement || item.education || '学历要求'
        }
      })
    },
    
    // 统一错误处理
    handleSearchError(error) {
      console.error('搜索职位失败:', error)
      
      if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
        this.error = '网络连接失败，请检查网络设置'
      } else if (error.message) {
        this.error = error.message
      } else {
        this.error = '搜索失败，请稍后重试'
      }
      
      this.jobList = []
      this.resultCount = 0
    },
    
    // 取消搜索处理
    onCancel() {
      console.log('取消搜索')
      // 可以选择清空搜索内容或返回上一页
      uni.navigateBack()
    },
    
    // 搜索内容变化处理
    onSearchChange(value) {
      console.log('搜索内容变化:', value)
      // TODO: 可以实现实时搜索建议
    },
    
    // 职位卡片点击处理
    onJobCardClick(job) {
      console.log('点击职位卡片:', job)
      // TODO: 跳转到职位详情页
    }
  }
}
</script>

<style lang="scss" scoped>
.job-search-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #EBF5FF 0%, #F8FCFF 100%);
}

.status-bar {
  width: 100%;
}

.search-section {
  padding: 40rpx 0 30rpx 0;
}

.result-count-section {
  padding: 0 30rpx;
  margin-bottom: 20rpx;
}

.result-count-text {
  font-size: 26rpx;
  color: #666666;
}

.job-list-container {
  flex: 1;
  padding: 0 30rpx;
  width: 100%;
  box-sizing: border-box;
}

.job-card {
  position: relative;
  width: calc(100% - 0px);
  max-width: 100%;
  box-sizing: border-box;
  background-color: #FFFFFF;
  border-radius: 10px;
  padding: 12px 16px;
  margin: 12px 0;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  
  &:active {
    transform: scale(0.98);
    transition: transform 0.1s ease;
  }
}

.job-card-header {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
  padding-right: 40rpx;
}

.job-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #222222;
  margin-right: 20rpx;
}

.job-salary {
  font-size: 32rpx;
  color: #20B2AA;
  font-weight: 500;
}

.job-card-info {
  display: flex;
  align-items: center;
  gap: 30rpx;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.info-text {
  font-size: 24rpx;
  color: #888888;
}

.arrow-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  gap: 20rpx;
}

.loading-text {
  font-size: 28rpx;
  color: #666666;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  gap: 20rpx;
}

.error-text {
  font-size: 28rpx;
  color: #FF6B6B;
  text-align: center;
  padding: 0 40rpx;
}
</style>