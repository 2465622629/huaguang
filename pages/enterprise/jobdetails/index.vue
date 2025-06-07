<template>
  <view class="job-detail-container">
    <!-- iOS状态栏占位 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
    
    <!-- 自定义导航栏 -->
    <view class="navbar">
      <view class="navbar-content">
        <view class="back-btn" @click="goBack">
          <uv-icon name="arrow-left" color="#333333" size="16"></uv-icon>
          <text class="back-text">返回</text>
        </view>
        <text class="navbar-title">职位详情</text>
      </view>
    </view>
    
    <!-- 主内容滚动区域 -->
    <scroll-view class="main-content" scroll-y="true">
      <!-- 职位标题 -->
      <view class="job-title-section">
        <text class="job-title">{{ jobInfo.title || '法务专员' }}</text>
      </view>
      
      <!-- 职位关键信息 -->
      <view class="job-key-info">
        <view class="info-row">
          <text class="info-label">工作地点</text>
          <view class="info-placeholder">
            <text class="placeholder-text">{{ jobInfo.location || '' }}</text>
          </view>
        </view>
        <view class="info-row">
          <text class="info-label">工作经验</text>
          <view class="info-placeholder">
            <text class="placeholder-text">{{ jobInfo.experience || '' }}</text>
          </view>
        </view>
        <view class="info-row">
          <text class="info-label">学历要求</text>
          <view class="info-placeholder">
            <text class="placeholder-text">{{ jobInfo.education || '' }}</text>
          </view>
        </view>
      </view>
      
      <!-- 职位详情卡片 -->
      <view class="job-detail-card">
        <!-- 职位详情标题 -->
        <text class="section-title">职位详情</text>
        
        <!-- 职位描述 -->
        <text class="sub-title">职位描述</text>
        <text class="description-text">
          {{ jobInfo.description || '本岗位主要负责公司合同审核、法律咨询支持、风险防控管理及法律文书处理等相关事务，确保公司经营活动合法合规。' }}
        </text>
        
        <!-- 职位职责 -->
        <view class="responsibility-list">
          <view class="list-item" v-for="(item, index) in responsibilities" :key="index">
            <text class="bullet-point">・</text>
            <text class="list-text">{{ item }}</text>
          </view>
        </view>
        
        <!-- 职业要求 -->
        <text class="sub-title">职业要求</text>
        <view class="requirement-item">
          <text class="requirement-text">
            <text class="requirement-label">学历要求: </text>
            <text class="requirement-value">{{ jobInfo.educationRequirement || '本科及以上 (法律相关专业优先)' }}</text>
          </text>
        </view>
        <view class="requirement-item">
          <text class="requirement-text">
            <text class="requirement-label">工作经验: </text>
            <text class="requirement-value">{{ jobInfo.experienceRequirement || '1-3年相关工作经验' }}</text>
          </text>
        </view>
        
        <!-- 专业技能 -->
        <text class="sub-title">专业技能:</text>
        <view class="skill-list">
          <view class="list-item" v-for="(skill, index) in professionalSkills" :key="index">
            <text class="bullet-point">・</text>
            <text class="list-text">{{ skill }}</text>
          </view>
        </view>
        
        <!-- 其他要求 -->
        <text class="sub-title">其他要求:</text>
        <view class="other-requirements-list">
          <view class="list-item" v-for="(requirement, index) in otherRequirements" :key="index">
            <text class="bullet-point">・</text>
            <text class="list-text">{{ requirement }}</text>
          </view>
        </view>
        
        <!-- 操作按钮 -->
        <view class="action-button-container">
          <uv-button 
            class="save-button"
            text="点击保存"
            color="#82C0F9"
            shape="circle"
            :customStyle="buttonCustomStyle"
            @click="handleSave"
          ></uv-button>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { enterpriseApi } from '@/api/index.js'

export default {
  name: 'JobDetails',
  data() {
    return {
      statusBarHeight: 0,
      jobId: '',
      loading: false,
      jobInfo: {
        title: '法务专员',
        location: '',
        experience: '',
        education: '',
        description: '本岗位主要负责公司合同审核、法律咨询支持、风险防控管理及法律文书处理等相关事务，确保公司经营活动合法合规。',
        educationRequirement: '本科及以上 (法律相关专业优先)',
        experienceRequirement: '1-3年相关工作经验'
      },
      responsibilities: [
        '负责各类合同、协议的起草与审核；',
        '提供日常法律咨询服务，出具法律意见书；',
        '参与处理劳动人事、商业合作等相关法律事务；',
        '协助进行公司合规体系建设，培训业务部门员工；',
        '配合处理公司重大突发法律事务。'
      ],
      professionalSkills: [
        '熟悉合同法、劳动法、公司法等相关法律法规',
        '能独立起草、审核法律文件'
      ],
      otherRequirements: [
        '具备较强的沟通协调能力与逻辑分析能力',
        '具备良好的职业道德，严谨细致',
        '有律师资格证者优先'
      ],
      buttonCustomStyle: {
        width: '90%',
        height: '50px',
        fontSize: '18px',
        fontWeight: 'normal'
      }
    }
  },
  
  onLoad(options) {
    // 获取路由参数
    if (options.jobId) {
      this.jobId = options.jobId
    }
    
    // 获取状态栏高度
    this.getStatusBarHeight()
    
    // 加载职位详情
    this.loadJobDetail()
  },
  
  methods: {
    /**
     * 获取系统状态栏高度
     */
    getStatusBarHeight() {
      const systemInfo = uni.getSystemInfoSync()
      this.statusBarHeight = systemInfo.statusBarHeight || 0
    },
    
    /**
     * 返回上一页
     */
    goBack() {
      uni.navigateBack({
        delta: 1
      })
    },
    
    /**
     * 加载职位详情数据
     */
    async loadJobDetail() {
      if (!this.jobId) {
        console.log('未提供职位ID，使用默认数据')
        return
      }
      
      try {
        this.loading = true
        const response = await enterpriseApi.getJobDetail(this.jobId)
        
        if (response && response.data) {
          this.jobInfo = {
            ...this.jobInfo,
            ...response.data
          }
        }
      } catch (error) {
        console.error('加载职位详情失败:', error)
        uni.showToast({
          title: '加载失败，请重试',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    /**
     * 处理保存按钮点击
     */
    handleSave() {
      uni.showToast({
        title: '保存成功',
        icon: 'success'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.job-detail-container {
  min-height: 100vh;
  background-color: #F0F4F7;
}

.status-bar {
  background-color: #F0F4F7;
}

.navbar {
  background-color: #F0F4F7;
  padding: 0 16px;
  
  .navbar-content {
    height: 44px;
    display: flex;
    align-items: center;
    position: relative;
  }
  
  .back-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    
    .back-text {
      font-size: 16px;
      color: #333333;
      font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
    }
  }
  
  .navbar-title {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    font-size: 18px;
    color: #333333;
    font-weight: normal;
    font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
  }
}

.main-content {
  flex: 1;
  height: calc(100vh - 44px);
}

.job-title-section {
  padding: 24px 16px 16px 16px;
  
  .job-title {
    font-size: 30px;
    color: #212121;
    font-weight: bold;
    font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
    line-height: 1.2;
  }
}

.job-key-info {
  padding: 0 16px 24px 16px;
  
  .info-row {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    
    .info-label {
      font-size: 16px;
      color: #333333;
      font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
      width: 80px;
      flex-shrink: 0;
    }
    
    .info-placeholder {
      flex: 1;
      height: 32px;
      background-color: #F0F4F7;
      border-radius: 4px;
      margin-left: 12px;
      display: flex;
      align-items: center;
      padding: 0 12px;
      
      .placeholder-text {
        font-size: 14px;
        color: #555555;
        font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
      }
    }
  }
}

.job-detail-card {
  background-color: #FFFFFF;
  border-radius: 8px 8px 0 0;
  padding: 16px;
  margin-top: 8px;
  
  .section-title {
    font-size: 20px;
    color: #333333;
    font-weight: bold;
    font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
    display: block;
    margin-bottom: 24px;
  }
  
  .sub-title {
    font-size: 15px;
    color: #666666;
    font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
    display: block;
    margin-bottom: 8px;
    margin-top: 20px;
  }
  
  .description-text {
    font-size: 14px;
    color: #555555;
    font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
    line-height: 1.5;
    display: block;
    margin-bottom: 16px;
  }
  
  .responsibility-list,
  .skill-list,
  .other-requirements-list {
    margin-bottom: 16px;
    
    .list-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 8px;
      padding-left: 12px;
      
      .bullet-point {
        font-size: 14px;
        color: #555555;
        margin-right: 8px;
        flex-shrink: 0;
        line-height: 1.5;
      }
      
      .list-text {
        font-size: 14px;
        color: #555555;
        font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
        line-height: 1.5;
        flex: 1;
      }
    }
  }
  
  .requirement-item {
    margin-bottom: 8px;
    
    .requirement-text {
      font-size: 14px;
      font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
      line-height: 1.5;
      
      .requirement-label {
        color: #666666;
      }
      
      .requirement-value {
        color: #555555;
      }
    }
  }
  
  .action-button-container {
    margin-top: 40px;
    display: flex;
    justify-content: center;
    padding-bottom: 20px;
    
    :deep(.uv-button) {
      background-color: #82C0F9 !important;
      border: none !important;
      
      .uv-button__text {
        color: #FFFFFF !important;
        font-size: 18px !important;
        font-weight: normal !important;
        font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif !important;
      }
    }
  }
}

/* iOS Home Indicator 适配 */
.job-detail-container {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>

