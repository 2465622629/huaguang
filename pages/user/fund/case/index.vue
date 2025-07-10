<template>
  <view class="case-page" :style="{ backgroundImage: 'url(' + backgroundImage + ')' }">
    <!-- iOS 状态栏 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
    
    <!-- 导航栏 -->
    <view class="navigation-bar">
      <view class="back-button" @click="goBack">
        <uv-icon name="arrow-left" color="#4A90E2" size="16"></uv-icon>
        <text class="back-text">返回</text>
      </view>
    </view>
    
    <!-- 筛选标签栏 -->
    <view class="filter-tabs">
      <view 
        class="filter-tab" 
        :class="{ active: currentFilter === item.value }"
        v-for="(item, index) in filterOptions" 
        :key="index"
        @click="handleFilterChange(item.value)"
      >
        {{ item.label }}
      </view>
    </view>
    
    <!-- 案例列表 -->
    <scroll-view 
      class="case-list" 
      scroll-y 
      :style="{ height: scrollHeight + 'px' }"
      @scrolltolower="loadMore"
    >
      <view class="case-item" v-for="(item, index) in filteredCaseList" :key="index" @click="handleCaseClick(item)">
        <!-- 圆形头像占位符 -->
        <view class="avatar-placeholder"></view>
        
        <!-- 案例信息 -->
        <view class="case-info">
          <text class="case-title">{{ item.name }}</text>
          <text class="case-description">{{ item.location }} {{ item.helpType }} {{ item.description }}</text>
          <text class="case-date">{{ item.dateRange }}</text>
        </view>
      </view>
      
      <!-- 加载状态 -->
      <view class="loading-status" v-if="loading">
        <text>加载中...</text>
      </view>
      <view class="loading-status" v-if="noMore && filteredCaseList.length > 0">
        <text>没有更多数据了</text>
      </view>
      <view class="empty-status" v-if="filteredCaseList.length === 0 && !loading">
        <text>暂无案例数据</text>
      </view>
    </scroll-view>
    
    <!-- iOS Home Indicator -->
    <!-- <view class="home-indicator"></view> -->
  </view>
</template>

<script>
import request from '@/utils/request.js'
import { staticBaseUrl } from '@/config/index.js'

export default {
  name: 'CasePage',
  data() {
    return {
      statusBarHeight: 0,
      backgroundImage: staticBaseUrl + '/bg12.png',
      scrollHeight: 0,
      currentFilter: 'all',
      filterOptions: [
        { label: '全部类型', value: 'all' },
        { label: '法律援助', value: 'legal' },
        { label: '就业帮扶', value: 'employment' }
      ],
      caseList: [],
      loading: false,
      noMore: false,
      page: 1,
      pageSize: 10
    }
  },
  computed: {
    filteredCaseList() {
      if (this.currentFilter === 'all') {
        return this.caseList
      }
      return this.caseList.filter(item => item.type === this.currentFilter)
    }
  },
  onLoad() {
    this.initPage()
    this.loadCaseData()
  },
  methods: {
    // 初始化页面
    initPage() {
      const systemInfo = uni.getSystemInfoSync()
      this.statusBarHeight = systemInfo.statusBarHeight || 0
      
      // 计算滚动区域高度：屏幕高度 - 状态栏 - 导航栏 - 筛选栏 - Home Indicator
      const navHeight = 44 // 导航栏高度
      const filterHeight = 50 // 筛选栏高度
      const homeIndicatorHeight = 34 // Home Indicator高度
      this.scrollHeight = systemInfo.windowHeight - this.statusBarHeight - navHeight - filterHeight - homeIndicatorHeight
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack({
        delta: 1,
        fail: () => {
          uni.navigateTo({
            url: '/pages/user/fund/index'
          })
        }
      })
    },
    
    // 处理筛选变化
    handleFilterChange(value) {
      this.currentFilter = value
    },
    
    // 处理案例点击
    handleCaseClick(caseItem) {
      console.log('点击案例:', caseItem)
      // 可以跳转到案例详情页面
      // uni.navigateTo({
      //   url: `/pages/user/fund/case/detail?id=${caseItem.id}`
      // })
    },
    
    // 加载案例数据
    async loadCaseData() {
      if (this.loading || this.noMore) return
      
      this.loading = true
      
      try {
        // 导入统计API模块
        const statisticsApi = (await import('@/api/modules/statistics.js')).default
        
        // 使用帮扶案例统计接口
        const res = await statisticsApi.getAssistanceCases({
          page: this.page,
          size: this.pageSize,
          serviceType: this.currentFilter === 'all' ? undefined : this.currentFilter
        })
        
        if (res && res.data && res.data.length > 0) {
          // 转换API数据格式为页面需要的格式
          const formattedData = res.data.map(item => ({
            id: item.id,
            name: item.applicantName || item.userName || '匿名用户',
            location: item.location || item.city || '未知地区',
            helpType: item.serviceType || item.assistanceType || '帮扶服务',
            description: item.description || item.summary || '帮助脱贫',
            dateRange: `${item.startDate || item.createdAt} - ${item.endDate || item.updatedAt}`,
            type: this.mapServiceTypeToFilter(item.serviceType)
          }))
          
          this.caseList = [...this.caseList, ...formattedData]
          this.page++
          
          if (res.data.length < this.pageSize) {
            this.noMore = true
          }
        } else {
          this.noMore = true
        }
      } catch (error) {
        console.error('获取案例数据失败：', error)
        // API调用失败时使用模拟数据
        this.loadMockData()
      }
      
      this.loading = false
    },
    
    // 加载模拟数据
    loadMockData() {
      const mockData = [
        {
          id: 1,
          name: '李老师',
          location: '济南',
          helpType: '贫困补助',
          description: '帮助脱贫',
          dateRange: '2025.01.15 - 2025.01.28',
          type: 'employment'
        },
        {
          id: 2,
          name: '王先生',
          location: '青岛',
          helpType: '法律援助',
          description: '劳动纠纷解决',
          dateRange: '2025.01.10 - 2025.01.25',
          type: 'legal'
        },
        {
          id: 3,
          name: '张女士',
          location: '烟台',
          helpType: '就业指导',
          description: '职业技能培训',
          dateRange: '2025.01.08 - 2025.01.22',
          type: 'employment'
        },
        {
          id: 4,
          name: '刘老师',
          location: '威海',
          helpType: '心理咨询',
          description: '心理健康支持',
          dateRange: '2025.01.05 - 2025.01.20',
          type: 'legal'
        },
        {
          id: 5,
          name: '陈先生',
          location: '淄博',
          helpType: '创业扶持',
          description: '小微企业支持',
          dateRange: '2025.01.01 - 2025.01.15',
          type: 'employment'
        },
        {
          id: 6,
          name: '赵女士',
          location: '潍坊',
          helpType: '教育资助',
          description: '子女教育支持',
          dateRange: '2024.12.28 - 2025.01.12',
          type: 'legal'
        },
        {
          id: 7,
          name: '孙先生',
          location: '东营',
          helpType: '医疗救助',
          description: '重大疾病医疗费用支持',
          dateRange: '2024.12.25 - 2025.01.10',
          type: 'legal'
        },
        {
          id: 8,
          name: '周女士',
          location: '泰安',
          helpType: '技能培训',
          description: '电商运营技能提升',
          dateRange: '2024.12.20 - 2025.01.05',
          type: 'employment'
        },
        {
          id: 9,
          name: '吴老师',
          location: '临沂',
          helpType: '法律咨询',
          description: '房产纠纷法律援助',
          dateRange: '2024.12.18 - 2025.01.02',
          type: 'legal'
        },
        {
          id: 10,
          name: '郑先生',
          location: '德州',
          helpType: '创业指导',
          description: '农业合作社创建指导',
          dateRange: '2024.12.15 - 2024.12.30',
          type: 'employment'
        },
        {
          id: 11,
          name: '马女士',
          location: '聊城',
          helpType: '心理疏导',
          description: '家庭关系心理咨询',
          dateRange: '2024.12.12 - 2024.12.27',
          type: 'legal'
        },
        {
          id: 12,
          name: '朱老师',
          location: '滨州',
          helpType: '职业规划',
          description: '退伍军人就业指导',
          dateRange: '2024.12.10 - 2024.12.25',
          type: 'employment'
        },
        {
          id: 13,
          name: '胡先生',
          location: '菏泽',
          helpType: '债务咨询',
          description: '个人债务重组法律援助',
          dateRange: '2024.12.08 - 2024.12.23',
          type: 'legal'
        },
        {
          id: 14,
          name: '林女士',
          location: '济宁',
          helpType: '技能认证',
          description: '护理技能资格认证培训',
          dateRange: '2024.12.05 - 2024.12.20',
          type: 'employment'
        },
        {
          id: 15,
          name: '高老师',
          location: '枣庄',
          helpType: '维权援助',
          description: '消费者权益保护',
          dateRange: '2024.12.01 - 2024.12.16',
          type: 'legal'
        },
        {
          id: 16,
          name: '梁先生',
          location: '日照',
          helpType: '就业推荐',
          description: '残疾人就业岗位推荐',
          dateRange: '2024.11.28 - 2024.12.13',
          type: 'employment'
        },
        {
          id: 17,
          name: '韩女士',
          location: '莱芜',
          helpType: '法律代理',
          description: '工伤赔偿法律代理',
          dateRange: '2024.11.25 - 2024.12.10',
          type: 'legal'
        },
        {
          id: 18,
          name: '冯老师',
          location: '济南',
          helpType: '创业贷款',
          description: '小额创业贷款申请指导',
          dateRange: '2024.11.22 - 2024.12.07',
          type: 'employment'
        },
        {
          id: 19,
          name: '邓先生',
          location: '青岛',
          helpType: '合同纠纷',
          description: '劳动合同争议调解',
          dateRange: '2024.11.20 - 2024.12.05',
          type: 'legal'
        },
        {
          id: 20,
          name: '曹女士',
          location: '烟台',
          helpType: '职业转型',
          description: '传统行业向数字化转型培训',
          dateRange: '2024.11.18 - 2024.12.03',
          type: 'employment'
        },
        {
          id: 21,
          name: '彭老师',
          location: '潍坊',
          helpType: '权益维护',
          description: '老年人权益保护法律援助',
          dateRange: '2024.11.15 - 2024.11.30',
          type: 'legal'
        },
        {
          id: 22,
          name: '董先生',
          location: '淄博',
          helpType: '技能提升',
          description: '工业自动化技术培训',
          dateRange: '2024.11.12 - 2024.11.27',
          type: 'employment'
        },
        {
          id: 23,
          name: '袁女士',
          location: '泰安',
          helpType: '婚姻咨询',
          description: '婚姻家庭法律咨询',
          dateRange: '2024.11.10 - 2024.11.25',
          type: 'legal'
        },
        {
          id: 24,
          name: '蒋老师',
          location: '威海',
          helpType: '再就业',
          description: '下岗职工再就业培训',
          dateRange: '2024.11.08 - 2024.11.23',
          type: 'employment'
        },
        {
          id: 25,
          name: '韦先生',
          location: '东营',
          helpType: '行政复议',
          description: '行政处罚复议申请援助',
          dateRange: '2024.11.05 - 2024.11.20',
          type: 'legal'
        }
      ]
      
      this.caseList = [...this.caseList, ...mockData]
      this.noMore = true
    },
    
    // 加载更多
    loadMore() {
      this.loadCaseData()
    }
  }
}
</script>

<style lang="scss" scoped>
.case-page {
  width: 100%;
  min-height: 100vh;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
}

.status-bar {
  width: 100%;
  background: transparent;
}

.navigation-bar {
  width: 100%;
  height: 44px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  background: transparent;
  
  .back-button {
    display: flex;
    align-items: center;
    gap: 4px;
    
    .back-text {
      font-size: 16px;
      color: #4A90E2;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
  }
}

.filter-tabs {
  width: 100%;
  height: 50px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 8px;
  background: transparent;
  
  .filter-tab {
    height: 32px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12rpx;
    font-size: 14px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    transition: all 0.3s ease;
    
    &.active {
      background-color: #007AFF;
      color: #FFFFFF;
    }
    
    &:not(.active) {
      background-color: #E0EAFC;
      color: #4A90E2;
    }
  }
}

.case-list {
  width: 100%;
  padding: 0 16px;
  box-sizing: border-box;
  
  .case-item {
    width: 100%;
    background-color: #FFFFFF;
    border-radius: 12px;
    padding: 12px;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.05);
    box-sizing: border-box;
    
    .avatar-placeholder {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background-color: #E0E0E0;
      flex-shrink: 0;
    }
    
    .case-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
      
      .case-title {
        font-size: 16px;
        color: #333333;
        font-weight: bold;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .case-description {
        font-size: 12px;
        color: #666666;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .case-date {
        font-size: 10px;
        color: #999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}

.loading-status, .empty-status {
  width: 100%;
  padding: 30px 0;
  text-align: center;
  
  text {
    font-size: 14px;
    color: #999999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
}

.home-indicator {
  position: fixed;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 134px;
  height: 5px;
  background-color: #000000;
  border-radius: 2.5px;
}
</style>
