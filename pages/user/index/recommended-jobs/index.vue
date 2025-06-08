<template>
  <view class="container">
    <!-- 状态栏占位 -->
    <view class="status-bar"></view>
    
    <!-- 重构后的导航栏 -->
    <view class="nav-bar">
      <!-- 返回按钮 -->
      <view class="nav-back" @click="goBack">
        <uv-icon name="arrow-left" size="32" color="#333333"></uv-icon>
        <text class="back-text">返回</text>
      </view>
      
      <!-- 排序选项和搜索图标 - 位于同一行 -->
      <view class="nav-controls">
        <view class="sort-option" @click="showSortMenu">
          <text class="sort-text">{{ currentSort.label }}</text>
          <view class="sort-arrow">▼</view>
        </view>
        
        <view class="search-icon" @click="handleSearch">
          <uv-icon name="search" size="32" color="#46D7FF"></uv-icon>
        </view>
      </view>
    </view>
    
    <!-- 简化后的筛选标签栏 -->
    <view class="filter-bar">
      <scroll-view class="filter-tags" scroll-x="true" show-scrollbar="false">
        <view class="tags-wrapper">
          <view 
            v-for="(tag, index) in filterTags" 
            :key="index"
            class="filter-tag"
            :class="{ 'active': tag.active }"
            @click="toggleTag(index)"
          >
            <text class="tag-text" :class="{ 'active': tag.active }">{{ tag.label }}</text>
          </view>
        </view>
      </scroll-view>
    </view>
    
    <!-- 职位列表 - 带渐变背景 -->
    <scroll-view class="job-list" scroll-y="true" @scrolltolower="loadMore">
      <view 
        v-for="(job, index) in jobList" 
        :key="index"
        class="job-card"
        @click="goToJobDetail(job)"
      >
        <!-- 第一行：职位名称与薪资 -->
        <view class="job-card-header">
          <text class="job-title">{{ job.title }}</text>
          <text class="job-salary">{{ job.salary }}</text>
        </view>
        
        <!-- 第二行：地点与学历 -->
         <view class="job-card-info">
           <view class="info-item">
             <uv-icon :name="`${config.staticBaseUrl}/icons/location.png`" :size="24" color="#888888"></uv-icon>
             <text class="info-text">{{ job.location }}</text>
           </view>
           <view class="info-item">
             <uv-icon :name="`${config.staticBaseUrl}/icons/graduation.png`" :size="24" color="#888888"></uv-icon>
             <text class="info-text">{{ job.education }}</text>
           </view>
         </view>
        
        <!-- 箭头图标 -->
        <view class="arrow-icon">
          <uv-icon name="arrow-right" :size="32" color="#CCCCCC"></uv-icon>
        </view>
      </view>
      
      <!-- 加载更多提示 -->
      <view v-if="loading" class="loading-tip">
        <text class="loading-text">加载中...</text>
      </view>
      
      <view v-if="noMore" class="no-more-tip">
        <text class="no-more-text">没有更多数据了</text>
      </view>
    </scroll-view>
    
    <!-- 排序菜单弹窗 -->
    <uv-popup 
      v-model="showSort" 
      mode="bottom" 
      border-radius="20"
      :safe-area-inset-bottom="true"
    >
      <view class="sort-popup">
        <view class="popup-header">
          <text class="popup-title">排序方式</text>
          <view class="close-btn" @click="showSort = false">
            <uv-icon name="close" size="18" color="#666666"></uv-icon>
          </view>
        </view>
        <view class="sort-options">
          <view 
            v-for="(option, index) in sortOptions" 
            :key="index"
            class="sort-item"
            :class="{ 'selected': currentSort.value === option.value }"
            @click="selectSort(option)"
          >
            <text class="sort-item-text" :class="{ 'selected': currentSort.value === option.value }">
              {{ option.label }}
            </text>
            <uv-icon 
              v-if="currentSort.value === option.value"
              name="checkmark" 
              size="16" 
              color="#007AFF"
            ></uv-icon>
          </view>
        </view>
      </view>
    </uv-popup>
  </view>
</template>

<script>
// 导入企业API
import { enterpriseApi } from '@/api/index.js'
import config from '@/config/index.js'

export default {
  data() {
    return {
      config,
      // 排序相关
      showSort: false,
      currentSort: {
        label: '默认排序',
        value: 'default'
      },
      sortOptions: [
        { label: '默认排序', value: 'default' },
        { label: '最新发布', value: 'newest' },
        { label: '薪资最高', value: 'salary_high' },
        { label: '规模最大', value: 'scale_large' }
      ],
      
      // 筛选标签
      filterTags: [
        { label: '推荐', active: true },
        { label: '附近', active: false },
        { label: '无学历限制', active: false },
        { label: '推荐', active: false },
        { label: '附近', active: false },
        { label: '无学历限制', active: false }
      ],
      
      // 职位列表数据
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
        },
        {
          id: 6,
          title: '律师助理',
          salary: '5k-8k',
          location: '成都市 · 高新区',
          education: '本科'
        }
      ],
      
      // 加载状态
      loading: false,
      noMore: false,
      page: 1,
      pageSize: 10
    }
  },
  
  onLoad() {
    this.loadJobList()
  },
  
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack()
    },
    
    // 显示排序菜单
    showSortMenu() {
      console.log('点击排序按钮')
      this.showSort = true
      console.log('showSort状态:', this.showSort)
    },
    
    // 选择排序方式
    selectSort(option) {
      this.currentSort = option
      this.showSort = false
      this.refreshList()
    },
    
    // 切换筛选标签
    toggleTag(index) {
      this.filterTags[index].active = !this.filterTags[index].active
      this.refreshList()
    },
    
    // 搜索
    handleSearch() {
      uni.navigateTo({
        url: '/pages/user/index/search/index'
      })
    },
    
    // 跳转到职位详情
    goToJobDetail(job) {
      console.log('点击职位卡片', job)
      uni.navigateTo({
        url: `/pages/user/index/job-detail/index?id=${job.id}`
      })
    },
    
    // 加载职位列表
    async loadJobList() {
      if (this.loading || this.noMore) return
      
      this.loading = true
      
      try {
        // 调用真实API
        const params = {
          page: this.page,
          size: this.pageSize
        }
        
        // 添加排序参数
        if (this.currentSort.value !== 'default') {
          params.sort = this.currentSort.value
        }
        
        // 添加筛选参数
        const activeFilters = this.filterTags.filter(tag => tag.active).map(tag => tag.label)
        if (activeFilters.length > 0) {
          params.filters = activeFilters.join(',')
        }
        
        // 暂时使用模拟数据，后续可替换为真实的职位API
        // const response = await jobApi.getJobList(params)
        console.log('职位列表数据加载中...');
        
        // 模拟API延迟
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // 处理API返回数据 - 使用模拟数据
        let newData = [
          {
            id: this.page * 10 + 1,
            title: '法务专员',
            salary: '6k-9k',
            location: '上海市 · 浦东新区',
            education: '本科'
          },
          {
            id: this.page * 10 + 2,
            title: '法务助理',
            salary: '4k-6k',
            location: '北京市 · 朝阳区',
            education: '大专'
          },
          {
            id: this.page * 10 + 3,
            title: '法务经理',
            salary: '10k-15k',
            location: '深圳市 · 南山区',
            education: '本科'
          }
        ]
        
        if (this.page === 1) {
          this.jobList = newData
        } else {
          this.jobList.push(...newData)
        }
        
        // 检查是否还有更多数据
        if (newData.length < this.pageSize) {
          this.noMore = true
        } else {
          this.page++
        }
        
      } catch (error) {
        console.error('加载职位列表失败:', error)
        uni.showToast({
          title: error.message || '加载失败，请稍后重试',
          icon: 'none',
          duration: 2000
        })
      } finally {
        this.loading = false
      }
    },
    
    // 刷新列表
    refreshList() {
      this.page = 1
      this.noMore = false
      this.jobList = []
      this.loading = false // 重置加载状态
      this.loadJobList()
    },
    
    // 加载更多
    loadMore() {
      this.loadJobList()
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-image: url('http://localhost:3000/static/bg9.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  overflow: hidden;
}

// 状态栏占位
.status-bar {
  height: var(--status-bar-height);
  background-color: #F0F8FF;
  flex-shrink: 0;
}

// 重构后的导航栏
.nav-bar {
  height: 80px;
  // background-color: rgba(240, 248, 255, 0.9);
  position: relative;
  padding: 0 16px;
  flex-shrink: 0;
  
  .nav-back {
    position: absolute;
    top: 20px;
    left: 16px;
    display: flex;
    align-items: center;
    gap: 2px;
    
    .back-text {
      font-size: 17px;
      color: #333333;
      font-weight: 500;
    }
  }
  
  .nav-controls {
    position: absolute;
    top: 50px;
    left: 10px;
    right: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    .sort-option {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 5px 10px;
      min-width: 80px;
      min-height: 30px;
      cursor: pointer;
      
      .sort-text {
        font-size: 13px;
        color: #666666;
        font-weight: 400;
      }
      
      .sort-arrow {
        font-size: 10px;
        color: #666666;
        transform: scale(0.8);
      }
    }
    
    .search-icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

// 简化后的筛选栏
.filter-bar {
  height: 50px;
  // background-color: rgba(240, 248, 255, 0.9);
  padding: 0 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
  overflow: hidden;
  
  .filter-tags {
    height: 100%;
    width: 100%;
    
    .tags-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
      height: 100%;
      padding-right: 20px;
      
      .filter-tag {
        height: 40rpx; 
        padding: 0 12px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        background-color: #e2f6ff;
        white-space: nowrap;
        flex-shrink: 0;
        
        &.active {
          background-color: #D3E9FE;
        }
        
        .tag-text {
          font-size: 13px;
          color: #666666;
          font-weight: 400;
          
          &.active {
            color: #3A8DDE;
            font-weight: 500;
          }
        }
      }
    }
  }
}

// 职位列表 - 带渐变背景
.job-list {
  flex: 1;
  width: 100%;
  padding: 0 16px;
  overflow: hidden;
  box-sizing: border-box;
  
  .job-card {
    position: relative;
    width: calc(100% - 0px);
    max-width: 100%;
    box-sizing: border-box;
    background-color: #FFFFFF;
    border-radius: 10px;
    padding: 12px 16px;
    margin: 12px 0;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    overflow: hidden;
    
    &:active {
      transform: scale(0.98);
      transition: transform 0.1s ease;
    }
    
    .job-card-header {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      
      .job-title {
        font-size: 16px;
        color: #333333;
        font-weight: 600;
        line-height: 1.2;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-right: 12px;
      }
      
      .job-salary {
        font-size: 16px;
        color: #9ADBDA;
        font-weight: 600;
        white-space: nowrap;
      }
    }
    
    .job-card-info {
      display: flex;
      gap: 16px;
      margin-bottom: 8px;
      
      .info-item {
        display: flex;
        align-items: center;
        gap: 4px;
        
        .info-text {
          font-size: 12px;
          color: #666666;
          line-height: 1.2;
        }
      }
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
  }
  
  .loading-tip, .no-more-tip {
    text-align: center;
    padding: 20px 0;
    
    .loading-text, .no-more-text {
      font-size: 14px;
      color: #999999;
    }
  }
}

// 排序弹窗
.sort-popup {
  background-color: #FFFFFF;
  
  .popup-header {
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    border-bottom: 1px solid #F0F0F0;
    
    .popup-title {
      font-size: 16px;
      color: #333333;
      font-weight: 600;
    }
    
    .close-btn {
      padding: 5px;
    }
  }
  
  .sort-options {
    padding: 10px 0;
    
    .sort-item {
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      
      &.selected {
        background-color: #F8F9FA;
      }
      
      .sort-item-text {
        font-size: 15px;
        color: #333333;
        
        &.selected {
          color: #007AFF;
          font-weight: 500;
        }
      }
    }
  }
}
</style>