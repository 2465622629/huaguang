<template>
  <view class="lawyer-consultation-page">
    <!-- 状态栏占位 -->
    <view class="status-bar"></view>
    
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="navbar-content">
        <view class="back-button" @click="goBack">
          <uv-icon name="arrow-left" color="#FFFFFF" size="32"></uv-icon>
          <text class="back-text">返回</text>
        </view>
      </view>
    </view>
    
    <!-- 页面标题区域 -->
    <view class="page-header">
      <text class="main-title">法律帮助</text>
      <text class="sub-title">一对一咨询</text>
      <text class="description">专业律师为您排忧解难</text>
    </view>
    
    <!-- 内容区域 -->
    <view class="content-container" :style="{ height: scrollHeight }">
      <!-- 固定的筛选标签栏 -->
      <view class="fixed-tabs-area">
        <scroll-view class="filter-tabs" scroll-x="true" show-scrollbar="false">
          <view class="tabs-container">
            <view 
              v-for="(tab, index) in filterTabs" 
              :key="index"
              class="tab-item"
              :class="{ 'tab-active': tab.active }"
              @click="selectTab(index)"
            >
              <text class="tab-text">{{ tab.name }}</text>
            </view>
            
          </view>
        </scroll-view>
      </view>
      
      <!-- 可滚动的律师列表区域 -->
      <view class="scrollable-list-area">
        <scroll-view class="list-scroll" scroll-y="true" style="height: 100%;">
          <!-- 律师卡片列表 -->
          <view class="lawyer-list">
            <view 
              v-for="(lawyer, index) in lawyerList" 
              :key="lawyer.id"
              class="lawyer-card"
            >
              <view class="card-content">
                <!-- 律师基本信息区域 -->
                <view class="lawyer-basic-info">
                  <!-- 律师头像 -->
                  <view class="lawyer-avatar"></view>
                  
                  <!-- 律师文本信息 -->
                  <view class="lawyer-text-info">
                    <text class="lawyer-name">{{ lawyer.name }}</text>
                    <text class="lawyer-tags">{{ lawyer.specialty }} | {{ lawyer.experience }} | {{ lawyer.successRate }}</text>
                    <text class="consult-count">{{ lawyer.consultCount }}</text>
                  </view>
                </view>
                
                <!-- 服务项目区域 -->
                <view class="services-section">
                  <view class="services">
                    <view 
                      v-for="(service, sIndex) in lawyer.services" 
                      :key="sIndex"
                      class="service-item"
                    >
                      <image :src="`http://localhost:3000/static/icons/${service.icon}.png`" style="width: 12px; height: 12px;" mode="aspectFit"></image>
                      <text class="service-name">{{ service.type }}</text>
                      <view class="service-price-container">
                        <text class="service-price">¥{{ service.price }}</text>
                        <text class="service-unit">/{{ service.unit }}</text>
                      </view>
                    </view>
                  </view>
                  
                  <!-- 立即咨询按钮 -->
                  <view class="consult-button" @click="consultLawyer(lawyer)">
                    <text class="consult-text">立即咨询</text>
                  </view>
                </view>
                
                <!-- 成功案例 -->
                <text class="achievement">{{ lawyer.achievement }}</text>
              </view>
              
              <!-- 分割线 -->
              <view v-if="index < lawyerList.length - 1" class="divider"></view>
            </view>
          </view>
          
          <!-- 底部安全区域 -->
          <view class="bottom-safe-area"></view>
        </scroll-view>
      </view>
    </view>
    
    <!-- 底部导航栏 -->
    <user-tabbar></user-tabbar>
  </view>
</template>

<script>
import UserTabbar from '@/components/tabbar/user-tabbar/user-tabbar.vue'
import { getHotLawyers } from '@/api/modules/home.js'

export default {
  name: 'LawyerConsultationPage',
  components: {
    UserTabbar
  },
  data() {
    return {
      scrollHeight: '100vh',
      loading: false,
      // 筛选标签数据
      filterTabs: [
        { name: '劳动纠纷', active: true },
        { name: '合同纠纷', active: false },
        { name: '婚姻家庭', active: false },
        { name: '消费维权', active: false },
        { name: '知识产权', active: false },
      ],
      // 律师信息数据
      lawyerList: []
    }
  },
  mounted() {
    this.calculateScrollHeight()
    this.loadHotLawyers()
  },
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack()
    },
    // 选择筛选标签
    selectTab(index) {
      this.filterTabs.forEach((tab, i) => {
        tab.active = i === index
      })
    },
    // 咨询律师
    consultLawyer(lawyer) {
      uni.showToast({
        title: `咨询${lawyer.name}`,
        icon: 'none'
      })
      uni.navigateTo({
        url: '/pages/user/index/lawyer-detail/index'
      })
    },
    // 加载热门律师数据
    async loadHotLawyers() {
      try {
        this.loading = true
        console.log('开始加载热门律师数据...')
        const response = await getHotLawyers({ limit: 10 })
        console.log('API响应数据:', response)
        
        // 处理API响应数据，适配页面显示格式
        if (response && Array.isArray(response)) {
          console.log('处理API数据，律师数量:', response.length)
          this.lawyerList = response.map(lawyer => ({
            id: lawyer.id,
            name: lawyer.name || '未知律师',
            specialty: lawyer.specialties ? lawyer.specialties.join('、') : '专业领域',
            experience: lawyer.experienceYears ? `${lawyer.experienceYears}年经验` : '经验年限',
            successRate: lawyer.successRate ? `胜诉率${lawyer.successRate}%` : '胜诉率',
            consultCount: lawyer.consultationCount ? `${lawyer.consultationCount}+人已咨询` : '咨询次数',
            services: [
              { type: '图文咨询', price: Math.floor(lawyer.consultationFee * 0.6) || 60, unit: '次', icon: 'img' },
              { type: '语音咨询', price: lawyer.consultationFee || 120, unit: '30分钟', icon: 'call' }
            ],
            achievement: `专业${lawyer.specialties ? lawyer.specialties[0] : '法律'}服务，成功率${lawyer.successRate || 95}%`
          }))
          console.log('处理后的律师列表:', this.lawyerList)
        } else {
          console.log('API响应数据格式不正确，使用默认数据')
          this.setDefaultLawyerData()
        }
      } catch (error) {
        console.error('获取热门律师数据失败:', error)
        uni.showToast({
          title: '获取律师数据失败，显示默认数据',
          icon: 'none'
        })
        // 使用默认数据作为备选
        this.setDefaultLawyerData()
      } finally {
        this.loading = false
        console.log('最终律师列表长度:', this.lawyerList.length)
      }
    },
    // 设置默认律师数据
    setDefaultLawyerData() {
      this.lawyerList = [
        {
          id: 1,
          name: '李晓明',
          specialty: '劳动法专长',
          experience: '8年经验',
          successRate: '胜诉率91%',
          consultCount: '400+人已咨询',
          services: [
            { type: '图文咨询', price: 60, unit: '次', icon: 'img' },
            { type: '语音咨询', price: 120, unit: '30分钟', icon: 'call' }
          ],
          achievement: '成功帮助某员工追回工资5万元'
        },
        {
          id: 2,
          name: '王律师',
          specialty: '合同纠纷、债务纠纷',
          experience: '12年经验',
          successRate: '胜诉率95%',
          consultCount: '300+人已咨询',
          services: [
            { type: '图文咨询', price: 80, unit: '次', icon: 'img' },
            { type: '语音咨询', price: 150, unit: '30分钟', icon: 'call' }
          ],
          achievement: '专业合同服务，成功率95%'
        }
      ]
      console.log('设置默认律师数据完成:', this.lawyerList)
    },
    calculateScrollHeight() {
      // 获取系统信息
      const systemInfo = uni.getSystemInfoSync()
      const tabBarHeight = 50 // 底部导航栏高度
      const safeAreaBottom = systemInfo.safeAreaInsets?.bottom || 0
      
      // 计算content-container占满底部的高度 (100vh - 底部导航栏 - 安全区域)
      const availableHeight = systemInfo.windowHeight - tabBarHeight - safeAreaBottom
      this.scrollHeight = availableHeight + 'px'
    }
  }
}
</script>

<style lang="scss" scoped>
.lawyer-consultation-page {
  background-image: url('http://localhost:3000/static/bg7.png');
  background-size: cover;
  background-position: unset;
  background-repeat: no-repeat;
  min-height: 100vh;
  position: relative;
}

// 状态栏占位
.status-bar {
  height: var(--status-bar-height);
  background: transparent;
}

// 自定义导航栏
.custom-navbar {
  position: absolute;
  top: var(--status-bar-height);
  left: 0;
  right: 0;
  z-index: 10;
  
  .navbar-content {
    padding: 15px 20px;
    
    .back-button {
      display: flex;
      align-items: center;
      
      .back-text {
        color: #FFFFFF;
        font-size: 16px;
        margin-left: 5px;
      }
    }
  }
}

// 页面标题区域
.page-header {
  padding: 132rpx 40rpx 80rpx;
  
  .main-title {
    color: #FFFFFF;
    font-size: 72rpx;
    font-weight: bold;
    display: block;
    margin-bottom: 5px;
    text-shadow: -7px 6px 12px rgba(0, 0, 0, 0.5);
  }
  
  .sub-title {
    color: #FFFFFF;
    font-size: 42px;
    font-weight: bold;
    display: block;
    margin-bottom: 15px;
    text-shadow: -7px 6px 12px rgba(0, 0, 0, 0.5);
  }
  
  .description {
    color: #FFFFFF;
    font-size: 15px;
    display: block;
    letter-spacing: 3rpx;
  }
}

// 内容容器
.content-container {
  background-color: #FFFFFF;
  border-top-left-radius: 25px;
  border-top-right-radius: 25px;
  margin-top: -25px;
  position: relative;
  z-index: 5;
  overflow: hidden;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

// 固定的标签区域
.fixed-tabs-area {
  padding: 20px 20px 0 20px;
  flex-shrink: 0;
}

// 可滚动的列表区域
.scrollable-list-area {
  flex: 1;
  overflow: hidden;
}

// 列表滚动容器
.list-scroll {
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
}

// 筛选标签栏
.filter-tabs {
  
  .tabs-container {
    display: flex;
    white-space: nowrap;
  }
  
  .tab-item {
    background-color: #E8EAF6;
    border-radius: 8px;
    padding: 6px 14px;
    margin-right: 10px;
    flex-shrink: 0;
    
    &.tab-active {
      background-color: #4A7DFF;
      
      .tab-text {
        color: #FFFFFF;
      }
    }
    
    .tab-text {
      color: #606C9A;
      font-size: 13px;
    }
  }
  
  .more-tab {
    background-color: #E8EAF6;
    border-radius: 8px;
    padding: 8px 12px;
    flex-shrink: 0;
    
    .more-text {
      color: #606C9A;
      font-size: 13px;
    }
  }
}

// 律师卡片列表
.lawyer-list {
  .lawyer-card {
    background-color: #FFFFFF;
    border-radius: 15px;
    padding: 20px;
    margin-bottom: 15px;
    display: flex;
    position: relative;
    
    .card-content {
      flex: 1;
      
      .lawyer-basic-info {
        display: flex;
        align-items: center;
        margin-bottom: 15px;
        
        .lawyer-avatar {
          width: 65px;
          height: 65px;
          background-color: #D8D8D8;
          border-radius: 50%;
          margin-right: 15px;
        }
        
        .lawyer-text-info {
          flex: 1;
          
          .lawyer-name {
            color: #333333;
            font-size: 20px;
            font-weight: bold;
            display: block;
            margin-bottom: 5px;
          }
          
          .lawyer-tags {
            color: #666666;
            font-size: 12px;
            display: block;
            margin-bottom: 5px;
          }
          
          .consult-count {
            color: #999999;
            font-size: 11px;
            display: block;
            margin-bottom: 15px;
          }
        }
      }
      
      .services-section {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        margin-bottom: 10px;
        
        .services {
          flex: 1;
          
          .service-item {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
            
            .service-name {
              color: #333333;
              font-size: 14px;
              margin-left: 8rpx;
              margin-right: 16rpx;
              // flex: 1;
            }
            
            .service-price-container {
              display: flex;
              align-items: baseline;
              
              .service-price {
                color: #333333;
                font-size: 17px;
                font-weight: bold;
              }
              
              .service-unit {
                color: #7A6FF0;
                font-size: 14px;
              }
            }
          }
        }
        
        .consult-button {
          background: linear-gradient(90deg, #7A8AFF 0%, #A19DFF 100%);
          border-radius: 20px;
          padding: 8px 20px;
          margin-left: 15px;
          align-self: center;
          
          .consult-text {
            color: #FFFFFF;
            font-size: 14px;
          }
        }
      }
      
      .achievement {
        color: #AAAAAA;
        font-size: 10px;
        display: block;
      }
    }
    
    .divider {
      height: 1px;
      background-color: #E8EAF6;
      margin: 15px 0;
    }
  }
}



// 底部安全区域
.bottom-safe-area {
  height: 20px;
}
</style>