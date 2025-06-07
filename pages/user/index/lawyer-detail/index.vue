<template>
  <view class="lawyer-detail-container">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="navbar-content">
        <view class="navbar-left" @click="goBack">
          <uv-icon name="arrow-left" color="#FFFFFF" size="30"></uv-icon>
          <text class="back-text">返回</text>
        </view>
        <view class="navbar-title">
          <text>律师详情</text>
        </view>
      </view>
    </view>

    <!-- 页面内容 -->
    <view class="page-content">
      <!-- 律师简介卡片 -->
      <view class="lawyer-profile-card">
        <!-- 头像与基本信息区域 -->
        <view class="profile-header">
          <!-- 头像 -->
          <view class="avatar-section">
            <view class="avatar-placeholder"></view>
          </view>
          
          <!-- 基本信息 -->
          <view class="basic-info">
            <!-- 姓名与在线状态 -->
            <view class="name-status">
              <text class="lawyer-name">{{ lawyerInfo.name }}</text>
              <view class="online-indicator">
                <view class="online-dot"></view>
                <text class="online-text">在线中</text>
              </view>
            </view>
            
            <!-- 专长标签 -->
            <view class="specialty-tag">
              <text>{{ lawyerInfo.specialty }}</text>
            </view>
            
            <!-- 执业经验与胜诉率 -->
            <view class="experience-info">
              <text>{{ lawyerInfo.experience }} · 胜诉率{{ lawyerInfo.successRate }}</text>
            </view>
          </view>
        </view>
        
        <!-- 近期案例展示 -->
        <view class="recent-case">
          <text class="case-title">近期案例展示:</text>
          <text class="case-content">{{ lawyerInfo.recentCase }}</text>
        </view>
      </view>

      <!-- 律师详细信息卡片 -->
      <view class="lawyer-details-card">
        <!-- 执业背景 -->
        <view class="detail-section">
          <view class="section-header">
            <image class="section-icon" src="http://localhost:3000/static/icons/zhiye.png" mode="aspectFit"></image>
            <text class="section-title">执业背景</text>
          </view>
          <text class="section-content">{{ lawyerInfo.background }}</text>
        </view>

        <!-- 服务优势 -->
        <view class="detail-section">
          <view class="section-header">
            <image class="section-icon" src="http://localhost:3000/static/icons/fuwu.png" mode="aspectFit"></image>
            <text class="section-title">服务优势</text>
          </view>
          <view class="list-content">
            <view v-for="(item, index) in lawyerInfo.advantages" :key="index" class="list-item">
              <view class="list-dot"></view>
              <text class="list-text">{{ item }}</text>
            </view>
          </view>
        </view>

        <!-- 成功案例 -->
        <view class="detail-section">
          <view class="section-header">
            <image class="section-icon" src="http://localhost:3000/static/icons/chenggong.png" mode="aspectFit"></image>
            <text class="section-title">成功案例</text>
          </view>
          <view class="list-content">
            <view v-for="(item, index) in lawyerInfo.cases" :key="index" class="list-item">
              <view class="list-dot"></view>
              <text class="list-text">{{ item }}</text>
            </view>
          </view>
        </view>

        <!-- 咨询范围 -->
        <view class="detail-section">
          <view class="section-header">
            <image class="section-icon" src="http://localhost:3000/static/icons/zixun.png" mode="aspectFit"></image>
            <text class="section-title">咨询范围</text>
          </view>
          <view class="list-content">
            <view v-for="(item, index) in lawyerInfo.consultationScope" :key="index" class="list-item">
              <view class="list-dot"></view>
              <text class="list-text">{{ item }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部固定按钮 -->
    <view class="bottom-button" :style="{ paddingBottom: safeAreaBottom + 'px' }">
      <view class="consult-button" @click="startConsultation">
        <text class="button-text">立即咨询</text>
      </view>
    </view>
  </view>
</template>

<script>
import config from '@/config/index.js'
import { getLawyerDetail } from '@/api/modules/legal-service.js'

export default {
  data() {
    return {
      statusBarHeight: 0,
      safeAreaBottom: 0,
      lawyerInfo: {
        id: 1,
        name: "李律师",
        avatar: "",
        isOnline: true,
        specialty: "劳动法专长",
        experience: "8年执业经验",
        successRate: "91%",
        recentCase: "4月5号，成功协助当事人追回劳动仲裁欠薪5000元。",
        background: "李律师专注于劳动法领域，拥有扎实的理论功底与丰富的实务经验，多次为企业及个人客户提供优质法律服务。",
        advantages: [
          "响应迅速，24小时内答复",
          "高效处理复杂劳动争议案件",
          "丰富的劳动仲裁、劳动合同管理实务经验"
        ],
        cases: [
          "助力企业成功规避集体劳动诉讼风险",
          "协助个人客户追回拖欠薪资50万元以上",
          "为多家中小企业设计规范的劳动用工体系"
        ],
        consultationScope: [
          "劳动合同起草与审查",
          "工伤认定与赔偿争议处理",
          "裁员补偿、离职谈判",
          "社保、加班费、薪资结算争议"
        ]
      },
      config
    }
  },
  onLoad(options) {
    this.getSystemInfo()
    // 接收传入的律师ID参数
    if (options.lawyerId) {
      console.log('接收到律师ID:', options.lawyerId)
      this.lawyerInfo.id = parseInt(options.lawyerId)
      // 根据律师ID加载具体的律师信息
      this.loadLawyerDetail(options.lawyerId)
    }
  },
  methods: {
    // 获取系统信息
    getSystemInfo() {
      const systemInfo = uni.getSystemInfoSync()
      this.statusBarHeight = systemInfo.statusBarHeight || 0
      this.safeAreaBottom = systemInfo.safeAreaInsets?.bottom || 0
    },
    
    // 加载律师详细信息
    async loadLawyerDetail(lawyerId) {
      console.log('加载律师详细信息:', lawyerId);
      
      try {
        uni.showLoading({
          title: '加载中...'
        })
        
        const response = await getLawyerDetail(lawyerId)
        console.log('律师详情:', response)
        
        if (response) {
          // 将API响应数据映射到页面所需的数据结构
          const lawyerData = response
          this.lawyerInfo = {
            id: lawyerData.id,
            name: lawyerData.name,
            avatar: lawyerData.avatar || "",
            isOnline: lawyerData.isOnline,
            specialty: Array.isArray(lawyerData.specialties) ? lawyerData.specialties.join('、') : lawyerData.specialties || "专业领域",
            experience: `${lawyerData.experienceYears}年执业经验`,
            successRate: `${lawyerData.successRate}%`,
            recentCase: lawyerData.recentCases || "暂无近期案例",
            background: lawyerData.introduction || "暂无介绍",
            advantages: lawyerData.serviceAdvantages ? lawyerData.serviceAdvantages.split('、') : [
              "经验丰富",
              "专业可靠",
              "服务优质"
            ],
            cases: [
              `成功代理案件${lawyerData.caseCount || 0}起`,
              `胜诉率${lawyerData.successRate || 0}%`,
              "为众多当事人成功维权"
            ],
            consultationScope: lawyerData.consultationScope ? lawyerData.consultationScope.split('、') : [
              "法律咨询",
              "案件代理",
              "法律顾问"
            ]
          }
        }
        
        uni.hideLoading()
      } catch (error) {
        console.error('获取律师详情失败:', error)
        uni.hideLoading()
        uni.showToast({
          title: '获取律师信息失败',
          icon: 'none'
        })
      }
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack({
        fail: () => {
          // 如果没有上一页，跳转到首页
          uni.switchTab({
            url: '/pages/user/index/index'
          })
        }
      })
    },
    
    // 开始咨询
    startConsultation() {
      // 跳转到咨询订单页面，传递律师ID参数
      uni.navigateTo({
        url: `/pages/user/index/consultation-order/index?lawyerId=${this.lawyerInfo.id}`,
        success: () => {
          console.log('跳转到咨询订单页面成功')
        },
        fail: (err) => {
          console.error('跳转到咨询订单页面失败：', err)
          uni.showToast({
            title: '页面跳转失败',
            icon: 'none'
          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.lawyer-detail-container {
  height: 100vh;
  position: relative;
  overflow-y: auto;
  background-image: url('http://localhost:3000/static/bg8.png');
  background-size: cover;
  background-position: unset;
  background-repeat: no-repeat;
}

/* 自定义导航栏 */
.custom-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  
  .navbar-content {
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 30rpx;
    position: relative;
  }
  
  .navbar-left {
    display: flex;
    align-items: center;
    
    .back-icon {
      font-size: 36rpx;
      color: #FFFFFF;
      margin-right: 8rpx;
    }
    
    .back-text {
      font-size: 32rpx;
      color: #FFFFFF;
    }
  }
  
  .navbar-title {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    
    text {
      font-size: 36rpx;
      color: #FFFFFF;
    }
  }
}

/* 页面内容 */
.page-content {
  padding-top: 120rpx; /* 为导航栏预留空间 */
  padding-bottom: 140rpx; /* 为底部按钮预留空间 */
  padding-left: 30rpx;
  padding-right: 30rpx;
}

/* 律师简介卡片 */
.lawyer-profile-card {
  background: #FFFFFF;
  border-radius: 32rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
  
  .profile-header {
    display: flex;
    margin-bottom: 30rpx;
  }
  
  .avatar-section {
    margin-right: 30rpx;
    
    .avatar-placeholder {
      width: 160rpx;
      height: 160rpx;
      border-radius: 50%;
      background-color: #D9D9D9;
    }
  }
  
  .basic-info {
    flex: 1;
    
    .name-status {
      display: flex;
      align-items: center;
      margin-bottom: 20rpx;
      
      .lawyer-name {
        font-size: 44rpx;
        color: #333333;
        font-weight: bold;
        margin-right: 20rpx;
      }
      
      .online-indicator {
        display: flex;
        align-items: center;
        
        .online-dot {
          width: 12rpx;
          height: 12rpx;
          border-radius: 50%;
          background-color: #52C41A;
          margin-right: 8rpx;
        }
        
        .online-text {
          font-size: 24rpx;
          color: #666666;
        }
      }
    }
    
    .specialty-tag {
      margin-bottom: 20rpx;
      
      text {
        background-color: #3572f2;
        color: #FFFFFF;
        font-size: 28rpx;
        padding: 8rpx 16rpx;
        border-radius: 15rpx;
      }
    }
    
    .experience-info {
      text {
        font-size: 26rpx;
        color: #999999;
      }
    }
  }
  
  .recent-case {
    .case-title {
      font-size: 26rpx;
      color: #666666;
      display: block;
      margin-bottom: 10rpx;
    }
    
    .case-content {
      font-size: 26rpx;
      color: #888888;
      line-height: 1.5;
    }
  }
}

/* 律师详细信息卡片 */
.lawyer-details-card {
  background: #FFFFFF;
  border-radius: 32rpx;
  padding: 40rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
  
  .detail-section {
    margin-bottom: 40rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .section-header {
      display: flex;
      align-items: center;
      margin-bottom: 20rpx;
      
      .section-icon {
        width: 36rpx;
        height: 36rpx;
        margin-right: 16rpx;
        border-radius: 4rpx;
      }
      
      .background-icon {
        background-color: #4A90E2;
        position: relative;
        
        &::after {
          content: '📄';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 20rpx;
        }
      }
      
      .advantage-icon {
        background-color: #4A90E2;
        position: relative;
        
        &::after {
          content: '💝';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 20rpx;
        }
      }
      
      .case-icon {
        background-color: #4A90E2;
        position: relative;
        
        &::after {
          content: '🤝';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 20rpx;
        }
      }
      
      .consultation-icon {
        background-color: #4A90E2;
        position: relative;
        
        &::after {
          content: '💬';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 20rpx;
        }
      }
      
      .section-title {
        font-size: 34rpx;
        color: #333333;
        font-weight: bold;
      }
    }
    
    .section-content {
      font-size: 28rpx;
      color: #666666;
      line-height: 1.6;
    }
    
    .list-content {
      .list-item {
        display: flex;
        align-items: flex-start;
        margin-bottom: 16rpx;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .list-dot {
          width: 8rpx;
          height: 8rpx;
          border-radius: 50%;
          background-color: #333333;
          margin-top: 12rpx;
          margin-right: 16rpx;
          flex-shrink: 0;
        }
        
        .list-text {
          font-size: 28rpx;
          color: #666666;
          line-height: 1.6;
          flex: 1;
        }
      }
    }
  }
}

/* 底部固定按钮 */
.bottom-button {
  position: fixed;
  bottom: 12rpx;
  left: 0;
  right: 0;
  padding: 20rpx 80rpx;
  // background: rgba(255, 255, 255, 0.95);
  // backdrop-filter: blur(10rpx);
  // 添加字间距
  letter-spacing: 20rpx;
  
  .consult-button {
    width: 100%;
    height: 88rpx;
    background: linear-gradient(135deg, #4285F4 0%, #3A7BFF 100%);
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8rpx 24rpx rgba(58, 123, 255, 0.3);
    
    &:active {
      transform: scale(0.98);
      transition: transform 0.1s;
    }
    
    .button-text {
      font-size: 36rpx;
      color: #FFFFFF;
      font-weight: bold;
    }
  }
}
</style>