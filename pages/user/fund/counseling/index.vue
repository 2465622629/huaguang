<template>
  <view class="counseling-page">
    <!-- 顶部导航栏 -->
    <view class="navbar">
      <view class="navbar-left" @click="goBack">
        <uv-icon name="arrow-left" color="#FFFFFF" size="20"></uv-icon>
        <text class="navbar-text">返回</text>
      </view>
    </view>
    
    <!-- Banner区域 -->
    <view class="banner">
      <view class="banner-content">
        <view class="banner-title">Hi, 这是你的专属导师</view>
        <view class="banner-subtitle">无需预约，专属你的心理倾听老师</view>
      </view>
      <view class="banner-shapes">
        <view class="shape shape-1"></view>
        <view class="shape shape-2"></view>
        <view class="shape shape-3"></view>
      </view>
    </view>
    
    <!-- 筛选/排序区域 -->
    <view class="filter-section">
      <view class="filter-row">
        <view class="filter-item" @click="showSortOptions">
          <text>{{ currentSort }}</text>
          <uv-icon name="arrow-down" size="12" color="#333333"></uv-icon>
        </view>
        
        <scroll-view scroll-x class="filter-tags" :show-scrollbar="false">
          <view class="filter-tags-content">
            <view 
              v-for="(tag, index) in filterTags" 
              :key="index"
              :class="['filter-tag', tag.active ? 'filter-tag-active' : '']"
              @click="toggleTag(index)"
            >
              <text>{{ tag.name }}</text>
            </view>
          </view>
        </scroll-view>
        
        <view class="filter-item" @click="showSpecialtyOptions">
          <text>擅长领域</text>
          <uv-icon name="arrow-down" size="12" color="#333333"></uv-icon>
        </view>
        
        <view class="filter-item" @click="showGenderOptions">
          <text>性别</text>
          <uv-icon name="arrow-down" size="12" color="#333333"></uv-icon>
        </view>
      </view>
    </view>
    
    <!-- 内容列表区域 -->
    <scroll-view scroll-y class="counselor-list-scroll" @scrolltolower="onReachBottom">
      <view class="counselor-list">
        <view class="counselor-item" v-for="(item, index) in counselorList" :key="index" @click="consultCounselor(item)">
          <view class="counselor-avatar">
            <view class="avatar-placeholder"></view>
          </view>
          <view class="counselor-info">
            <view class="counselor-header">
              <text class="counselor-name">{{ item.name }}</text>
              <view class="service-tag">
                <text>{{ item.serviceType }}</text>
              </view>
            </view>
            
            <view class="counselor-desc">
              <text>{{ item.age }}岁 | {{ item.certificates }}</text>
            </view>
            
            <view class="counselor-tags">
              <view class="specialty-tag" v-for="(tag, tagIndex) in item.specialties" :key="tagIndex">
                <text>{{ tag }}</text>
              </view>
            </view>
            
            <view class="counselor-stats">
              <text class="consultation-count">{{ item.consultationCount }}+人已咨询</text>
              <view class="return-client-tag" v-if="item.returnClientCount > 0">
                <text>[{{ item.returnClientCount }}回头客]</text>
              </view>
            </view>
            
            <view class="counselor-motto">
              <text class="motto-prefix">倾听</text>
              <text class="motto-content">{{ item.motto }}</text>
            </view>
            
            <view class="counselor-price-action">
              <view class="price-info">
                <text class="price-value">¥{{ item.price }}</text>
                <text class="price-unit">/30分钟</text>
              </view>
              <view class="consult-btn" @click.stop="consultCounselor(item)">
                <text>立即咨询</text>
              </view>
            </view>
          </view>
        </view>
        
        <view class="empty-state" v-if="counselorList.length === 0 && !isLoading">
          <view class="empty-placeholder"></view>
          <text>暂无符合条件的咨询师</text>
        </view>
        
        <view class="loading-more" v-if="isLoadingMore">
          <uv-loading-icon></uv-loading-icon>
          <text>加载中...</text>
        </view>
      </view>
    </scroll-view>
    
    <!-- 排序选项弹窗 -->
    <uv-popup :show="sortOptionsVisible" mode="bottom" @close="sortOptionsVisible = false">
      <view class="popup-content">
        <view class="popup-header">
          <text>排序方式</text>
          <uv-icon name="close" @click="sortOptionsVisible = false"></uv-icon>
        </view>
        <view class="popup-list">
          <view 
            class="popup-item" 
            v-for="(option, index) in sortOptions" 
            :key="index"
            @click="selectSortOption(option)"
          >
            <text :class="{ 'selected': currentSort === option.name }">{{ option.name }}</text>
            <uv-icon v-if="currentSort === option.name" name="checkmark" color="#FF6B6B" size="16"></uv-icon>
          </view>
        </view>
      </view>
    </uv-popup>
    
    <!-- 擅长领域弹窗 -->
    <uv-popup :show="specialtyOptionsVisible" mode="bottom" @close="specialtyOptionsVisible = false">
      <view class="popup-content">
        <view class="popup-header">
          <text>擅长领域</text>
          <uv-icon name="close" @click="specialtyOptionsVisible = false"></uv-icon>
        </view>
        <view class="popup-grid">
          <view 
            v-for="(specialty, index) in specialtyOptions" 
            :key="index"
            :class="['popup-grid-item', selectedSpecialties.includes(specialty) ? 'selected-grid-item' : '']"
            @click="toggleSpecialty(specialty)"
          >
            <text>{{ specialty }}</text>
          </view>
        </view>
        <view class="popup-footer">
          <view class="popup-btn reset-btn" @click="resetSpecialties">重置</view>
          <view class="popup-btn confirm-btn" @click="confirmSpecialties">确认</view>
        </view>
      </view>
    </uv-popup>
    
    <!-- 性别选项弹窗 -->
    <uv-popup :show="genderOptionsVisible" mode="bottom" @close="genderOptionsVisible = false">
      <view class="popup-content">
        <view class="popup-header">
          <text>性别</text>
          <uv-icon name="close" @click="genderOptionsVisible = false"></uv-icon>
        </view>
        <view class="popup-list">
          <view 
            class="popup-item" 
            v-for="(option, index) in genderOptions" 
            :key="index"
            @click="selectGenderOption(option)"
          >
            <text :class="{ 'selected': selectedGender === option }">{{ option }}</text>
            <uv-icon v-if="selectedGender === option" name="checkmark" color="#FF6B6B" size="16"></uv-icon>
          </view>
        </view>
      </view>
    </uv-popup>
  </view>
</template>

<script>
import config from '@/config/index.js'
import request from '@/utils/request.js'

export default {
  name: 'CounselingPage',
  data() {
    return {
      config,
      isRefreshing: false,
      isLoading: true,
      isLoadingMore: false,
      currentPage: 1,
      totalPages: 1,
      
      // 排序相关
      sortOptionsVisible: false,
      currentSort: '默认排序',
      sortOptions: [
        { name: '默认排序', value: 'default' },
        { name: '评分最高', value: 'rating' },
        { name: '价格最低', value: 'price_asc' },
        { name: '价格最高', value: 'price_desc' },
        { name: '咨询人数最多', value: 'popularity' }
      ],
      
      // 筛选标签
      filterTags: [
        { name: '现在有空', active: false, value: 'available_now' },
        { name: '回头客多', active: false, value: 'high_return' },
        { name: '文字倾诉', active: false, value: 'text_service' },
        { name: '婚恋', active: false, value: 'marriage' },
        { name: '就业压力', active: false, value: 'career' },
        { name: '擅长倾听', active: true, value: 'good_listener' }
      ],
      
      // 擅长领域
      specialtyOptionsVisible: false,
      specialtyOptions: [
        '情绪管理', '焦虑抑郁', '人际关系', '婚恋情感', 
        '亲子教育', '职场压力', '自我成长', '性心理', 
        '青少年心理', '生命教育', '失眠', '精神障碍'
      ],
      selectedSpecialties: [],
      tempSelectedSpecialties: [],
      
      // 性别选项
      genderOptionsVisible: false,
      genderOptions: ['不限', '男', '女'],
      selectedGender: '不限',
      
      // 咨询师列表
      counselorList: []
    }
  },
  onLoad() {
    this.fetchCounselorList()
  },
  onPullDownRefresh() {
    this.fetchCounselorList(true).then(() => {
      uni.stopPullDownRefresh()
    })
  },
  onReachBottom() {
    if (this.currentPage < this.totalPages) {
      this.loadMoreCounselors()
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    async fetchCounselorList(refresh = false) {
      try {
        this.isLoading = true
        if (refresh) {
          this.currentPage = 1
          this.isRefreshing = true
        }
        
        // 构建请求参数
        const params = {
          page: this.currentPage,
          sort: this.getSortValue(),
          gender: this.selectedGender === '不限' ? '' : this.selectedGender,
          specialties: this.selectedSpecialties.join(',')
        }
        
        // 添加标签筛选
        const activeTags = this.filterTags.filter(tag => tag.active).map(tag => tag.value)
        if (activeTags.length > 0) {
          params.tags = activeTags.join(',')
        }
        
        // 模拟API响应
        await new Promise(resolve => setTimeout(resolve, 1000))
        const res = {
          code: 0,
          data: {
            list: this.getMockCounselors(),
            total: 30,
            totalPages: 3
          }
        }
        
        if (res.code === 0) {
          if (refresh) {
            this.counselorList = res.data.list
          } else {
            this.counselorList = [...this.counselorList, ...res.data.list]
          }
          this.totalPages = res.data.totalPages
        }
      } catch (error) {
        console.error('获取咨询师列表失败：', error)
        uni.showToast({
          icon: 'none',
          title: '获取咨询师列表失败'
        })
      } finally {
        this.isLoading = false
        this.isRefreshing = false
      }
    },
    async loadMoreCounselors() {
      if (this.isLoadingMore) return
      this.isLoadingMore = true
      this.currentPage++
      await this.fetchCounselorList()
      this.isLoadingMore = false
    },
    
    // 排序相关
    showSortOptions() {
      this.sortOptionsVisible = true
    },
    selectSortOption(option) {
      this.currentSort = option.name
      this.sortOptionsVisible = false
      this.fetchCounselorList(true)
    },
    getSortValue() {
      const selected = this.sortOptions.find(option => option.name === this.currentSort)
      return selected ? selected.value : 'default'
    },
    
    // 标签筛选
    toggleTag(index) {
      this.filterTags[index].active = !this.filterTags[index].active
      this.fetchCounselorList(true)
    },
    
    // 擅长领域筛选
    showSpecialtyOptions() {
      this.tempSelectedSpecialties = [...this.selectedSpecialties]
      this.specialtyOptionsVisible = true
    },
    toggleSpecialty(specialty) {
      const index = this.tempSelectedSpecialties.indexOf(specialty)
      if (index > -1) {
        this.tempSelectedSpecialties.splice(index, 1)
      } else {
        this.tempSelectedSpecialties.push(specialty)
      }
    },
    resetSpecialties() {
      this.tempSelectedSpecialties = []
    },
    confirmSpecialties() {
      this.selectedSpecialties = [...this.tempSelectedSpecialties]
      this.specialtyOptionsVisible = false
      this.fetchCounselorList(true)
    },
    
    // 性别筛选
    showGenderOptions() {
      this.genderOptionsVisible = true
    },
    selectGenderOption(option) {
      this.selectedGender = option
      this.genderOptionsVisible = false
      this.fetchCounselorList(true)
    },
    
    // 咨询操作
    consultCounselor(counselor) {
      // 跳转到咨询前测试页面
      uni.navigateTo({
        url: '/pages/user/fund/counseling/test',
        success: (res) => {
          // 传递咨询师信息到测试页面
          res.eventChannel.emit('counselorData', { counselor })
        }
      })
    },
    
    // 模拟数据生成
    getMockCounselors() {
      const mockNames = ['李晓明', '张雨', '王芳', '刘强', '赵敏', '陈静', '杨光', '周思', '吴慧', '郑伟']
      const mockSpecialties = ['自我探索', '压力管理', '人际关系', '情绪调节', '焦虑缓解', '职业规划', '家庭关系', '婚恋咨询', '失眠困扰', '自信提升']
      const mockServiceTypes = ['语音/视频', '文字咨询', '语音咨询', '视频咨询']
      const mockMottos = [
        '每个人都值得被倾听和理解，我在这里等你',
        '情绪不是敌人，而是内心的信号，让我们一起解读',
        '心理咨询是一段共同成长的旅程，而非单向的治疗',
        '倾听是疗愈的开始，表达是力量的来源',
        '每个困境都是成长的机会，让我陪你一起面对'
      ]
      
      return Array.from({ length: 30 }, (_, i) => {
        const randomSpecialties = []
        const specialtyCount = Math.floor(Math.random() * 3) + 1
        while (randomSpecialties.length < specialtyCount) {
          const specialty = mockSpecialties[Math.floor(Math.random() * mockSpecialties.length)]
          if (!randomSpecialties.includes(specialty)) {
            randomSpecialties.push(specialty)
          }
        }
        
        return {
          id: i + 1,
          name: mockNames[i % mockNames.length],
          serviceType: mockServiceTypes[i % mockServiceTypes.length],
          age: Math.floor(Math.random() * 20) + 30,
          certificates: '心理咨询师二级',
          specialties: randomSpecialties,
          consultationCount: Math.floor(Math.random() * 900) + 100,
          returnClientCount: Math.floor(Math.random() * 300),
          motto: mockMottos[i % mockMottos.length],
          price: (Math.floor(Math.random() * 10) + 10) * 10 - 0.1
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.counseling-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  position: relative;
  padding-bottom: 50rpx; /* 确保底部有足够的内边距 */
  box-sizing: border-box;
  
  .navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 90rpx;
    background-color: transparent;
    z-index: 100;
    display: flex;
    align-items: center;
    padding: 0 30rpx;
    padding-top: var(--status-bar-height);
    
    &-left {
      display: flex;
      align-items: center;
      
      .navbar-text {
        color: #FFFFFF;
        font-size: 32rpx;
        margin-left: 8rpx;
      }
    }
  }
  
  .banner {
    position: relative;
    height: 300rpx;
    background: linear-gradient(to right, #FFB6C1, #FFC0CB);
    padding: 140rpx 40rpx 40rpx;
    overflow: hidden;
    
    &-content {
      position: relative;
      z-index: 1;
    }
    
    &-title {
      font-size: 52rpx;
      color: #FFFFFF;
      font-weight: bold;
      margin-bottom: 10rpx;
    }
    
    &-subtitle {
      font-size: 28rpx;
      color: #FFFFFF;
      opacity: 0.9;
    }
    
    &-shapes {
      position: absolute;
      right: 0;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
      
      .shape {
        position: absolute;
        border-radius: 20rpx;
        
        &-1 {
          width: 300rpx;
          height: 300rpx;
          background-color: rgba(255, 255, 255, 0.2);
          right: -150rpx;
          top: -100rpx;
          transform: rotate(30deg);
        }
        
        &-2 {
          width: 250rpx;
          height: 250rpx;
          background-color: rgba(255, 255, 255, 0.15);
          right: -50rpx;
          top: 50rpx;
          transform: rotate(45deg);
        }
        
        &-3 {
          width: 200rpx;
          height: 200rpx;
          background-color: rgba(255, 255, 255, 0.1);
          right: 100rpx;
          top: 150rpx;
          transform: rotate(60deg);
        }
      }
    }
  }
  
  .filter-section {
    background-color: #FFFFFF;
    border-top-left-radius: 40rpx;
    border-top-right-radius: 40rpx;
    margin-top: -40rpx;
    position: relative;
    z-index: 1;
    padding: 30rpx 20rpx;
    
    .filter-row {
      display: flex;
      align-items: center;
      width: 100%;
      overflow: hidden;
    }
    
    .filter-item {
      display: flex;
      align-items: center;
      font-size: 28rpx;
      color: #333333;
      margin-right: 20rpx;
      white-space: nowrap;
      
      text {
        margin-right: 4rpx;
      }
    }
    
    .filter-tags {
      flex: 1;
      white-space: nowrap;
      margin: 0 20rpx;
      
      .filter-tags-content {
        display: flex;
        white-space: nowrap;
        padding: 5rpx 0;
      }
      
      .filter-tag {
        display: inline-block;
        padding: 3rpx 12rpx;
        background-color: #FFF0F0;
        border-radius: 10rpx;
        margin-right: 16rpx;
        transition: all 0.3s;
        
        
        text {
          font-size: 24rpx;
          color: #6B1C1C;
        }
        
        &-active {
          background-color: #FF6B6B;
          
          text {
            color: #FFFFFF;
          }
        }
      }
    }
  }
  
  .counselor-list-scroll {
    height: calc(100vh - 430rpx); /* 计算高度，减去顶部导航栏、banner和筛选区域的高度 */
    background-color: #FFFFFF;
  }
  
  .counselor-list {
    background-color: #FFFFFF;
    padding: 20rpx;
    
    .counselor-item {
      display: flex;
      padding: 30rpx 20rpx;
      border-bottom: 1px solid #EEEEEE;
      
      &:last-child {
        border-bottom: none;
      }
    }
    
    .counselor-avatar {
      width: 160rpx;
      height: 160rpx;
      border-radius: 16rpx;
      overflow: hidden;
      margin-right: 20rpx;
      flex-shrink: 0;
      
      .avatar-placeholder {
        width: 100%;
        height: 100%;
        background-color: #E0E0E0;
        border-radius: 16rpx;
      }
    }
    
    .counselor-info {
      flex: 1;
      overflow: hidden;
    }
    
    .counselor-header {
      display: flex;
      align-items: center;
      margin-bottom: 10rpx;
    }
    
    .counselor-name {
      font-size: 34rpx;
      font-weight: bold;
      color: #333333;
      margin-right: 16rpx;
    }
    
    .service-tag {
      background-color: #FFECED;
      padding: 4rpx 12rpx;
      border-radius: 6rpx;
      
      text {
        font-size: 20rpx;
        color: #D32F2F;
      }
    }
    
    .counselor-desc {
      font-size: 24rpx;
      color: #666666;
      margin-bottom: 16rpx;
    }
    
    .counselor-tags {
      display: flex;
      flex-wrap: wrap;
      margin-bottom: 16rpx;
      
      .specialty-tag {
        background-color: #F5EEF8;
        padding: 4rpx 12rpx;
        border-radius: 6rpx;
        margin-right: 16rpx;
        margin-bottom: 10rpx;
        
        text {
          font-size: 24rpx;
          color: #8E44AD;
        }
      }
    }
    
    .counselor-stats {
      display: flex;
      align-items: center;
      margin-bottom: 16rpx;
      
      .consultation-count {
        font-size: 22rpx;
        color: #999999;
        margin-right: 16rpx;
      }
      
      .return-client-tag {
        border: 1px solid #F44336;
        border-radius: 6rpx;
        padding: 2rpx 8rpx;
        
        text {
          font-size: 20rpx;
          color: #F44336;
        }
      }
    }
    
    .counselor-motto {
      background-color: #FFF5F5;
      padding: 16rpx;
      border-radius: 8rpx;
      margin-bottom: 20rpx;
      
      .motto-prefix {
        color: #FF8A80;
        font-weight: bold;
        font-size: 24rpx;
        margin-right: 8rpx;
      }
      
      .motto-content {
        font-size: 24rpx;
        color: #757575;
      }
    }
    
    .counselor-price-action {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .price-info {
        display: flex;
        align-items: baseline;
      }
      
      .price-value {
        font-size: 40rpx;
        color: #FF7043;
        font-weight: bold;
      }
      
      .price-unit {
        font-size: 24rpx;
        color: #757575;
        margin-left: 4rpx;
      }
      
      .consult-btn {
        background: linear-gradient(to right, #FF8A65, #FF7043);
        padding: 12rpx 30rpx;
        border-radius: 100rpx;
        
        text {
          font-size: 28rpx;
          color: #FFFFFF;
          font-weight: 500;
        }
      }
    }
  }
  
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100rpx 0;
    
    .empty-placeholder {
      width: 200rpx;
      height: 200rpx;
      background-color: #E0E0E0;
      border-radius: 10rpx;
      margin-bottom: 20rpx;
    }
    
    text {
      font-size: 28rpx;
      color: #999999;
    }
  }
  
  .loading-more {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 30rpx 0;
    
    text {
      font-size: 24rpx;
      color: #999999;
      margin-left: 10rpx;
    }
  }
  
  // 弹出层样式
  .popup-content {
    padding: 30rpx;
    
    .popup-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30rpx;
      
      text {
        font-size: 32rpx;
        font-weight: bold;
        color: #333333;
      }
    }
    
    .popup-list {
      .popup-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 30rpx 0;
        border-bottom: 1px solid #EEEEEE;
        
        text {
          font-size: 28rpx;
          color: #333333;
          
          &.selected {
            color: #FF6B6B;
          }
        }
      }
    }
    
    .popup-grid {
      display: flex;
      flex-wrap: wrap;
      
      .popup-grid-item {
        width: calc(33.33% - 20rpx);
        margin: 10rpx;
        padding: 20rpx 0;
        border-radius: 8rpx;
        background-color: #F5F5F5;
        display: flex;
        justify-content: center;
        align-items: center;
        
        text {
          font-size: 26rpx;
          color: #333333;
        }
        
        &.selected-grid-item {
          background-color: #FFE8E8;
          
          text {
            color: #FF6B6B;
          }
        }
      }
    }
    
    .popup-footer {
      display: flex;
      justify-content: space-between;
      margin-top: 40rpx;
      
      .popup-btn {
        width: 45%;
        height: 80rpx;
        border-radius: 8rpx;
        display: flex;
        justify-content: center;
        align-items: center;
        
        &.reset-btn {
          background-color: #F5F5F5;
          
          text {
            color: #666666;
          }
        }
        
        &.confirm-btn {
          background-color: #FF6B6B;
          
          text {
            color: #FFFFFF;
          }
        }
      }
    }
  }
}
</style> 