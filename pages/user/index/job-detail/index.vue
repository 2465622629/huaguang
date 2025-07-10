<template>
  <view class="job-detail-container" :style="{ backgroundImage: `url('${config.staticBaseUrl}/bg9.png')` }">
    <!-- 自定义导航栏 -->
    <uv-navbar title="职位详情" :autoBack="true" leftText="返回" leftIcon="arrow-left" :bgColor="navbarBgColor"
      :leftIconColor="navbarTextColor" :safeAreaInsetTop="true" :fixed="true" :placeholder="true"
      @leftClick="goBack"></uv-navbar>

    <!-- 可滚动的页面内容 -->
    <scroll-view class="scroll-container" scroll-y="true">
      <!-- 加载状态 -->
      <view v-if="loading" class="loading-container">
        <uv-loading-icon mode="circle" color="#20B2AA" size="40"></uv-loading-icon>
        <text class="loading-text">正在加载职位详情...</text>
      </view>
      
      <!-- 错误状态 -->
      <view v-else-if="error" class="error-container">
        <uv-icon name="error-circle" size="60" color="#FF6B6B"></uv-icon>
        <text class="error-text">{{ error }}</text>
        <view class="retry-btn" @click="loadJobDetail(jobId)">
          <text class="retry-text">重新加载</text>
        </view>
      </view>
      
      <!-- 正常内容 -->
      <view v-else class="page-content">
        <!-- 职位标题与薪资区域 -->
        <view class="job-header">
          <view class="job-title-salary">
            <text class="job-title">{{ jobInfo.title }}</text>
            <text class="job-salary">{{ jobInfo.salary }}</text>
          </view>
          <view class="job-tags">
            <view class="tag-item">
              <uv-icon :name="config.staticBaseUrl + '/icons/location.png'" size="24" color="#888888"></uv-icon>
              <text class="tag-text">{{ jobInfo.location }}</text>
            </view>
            <view class="tag-item">
              <uv-icon :name="config.staticBaseUrl + '/icons/experience.png'" size="24" color="#888888"></uv-icon>
              <text class="tag-text">{{ jobInfo.experience }}</text>
            </view>
            <view class="tag-item">
              <uv-icon :name="config.staticBaseUrl + '/icons/graduation.png'" size="24" color="#888888"></uv-icon>
              <text class="tag-text">{{ jobInfo.education }}</text>
            </view>
          </view>
        </view>

        <!-- 公司信息区域 -->
        <view class="company-info">
          <view class="company-content">
            <view class="company-logo">
              <!-- 公司Logo占位符 -->
            </view>
            <view class="company-details">
              <text class="company-name">{{ jobInfo.companyName }}</text>
              <text class="company-desc">{{ jobInfo.companyDesc }} </text>
              <text class="company-size">{{ jobInfo.companySize }}</text>
            </view>
            <view class="company-arrow">
              <uv-icon name="arrow-right" size="0" color="#AAAAAA"></uv-icon>
            </view>
          </view>
        </view>

        <!-- 职位详情区域 -->
        <view class="job-details">
          <text class="section-title">职位详情</text>
          <text class="subsection-title">职位描述</text>
          <text class="job-description">{{ jobInfo.description }}</text>
          <view class="job-responsibilities">
            <view v-for="(item, index) in jobInfo.responsibilities" :key="index" class="responsibility-item">
              <text class="bullet-point">·</text>
              <text class="responsibility-text">{{ item }}</text>
            </view>
          </view>
        </view>

        <!-- 职业要求区域 -->
        <view class="job-requirements">
          <text class="section-title">职业要求</text>

          <view class="requirement-item">
            <text class="requirement-label">学历要求: </text>
            <text class="requirement-value">{{ jobInfo.requirements.education }}</text>
          </view>

          <view class="requirement-item">
            <text class="requirement-label">工作经验: </text>
            <text class="requirement-value">{{ jobInfo.requirements.experience }}</text>
          </view>

          <view class="requirement-section">
            <text class="requirement-label">专业技能:</text>
            <view class="requirement-list">
              <view v-for="(skill, index) in jobInfo.requirements.skills" :key="index" class="requirement-list-item">
                <text class="bullet-point">·</text>
                <text class="requirement-text">{{ skill }}</text>
              </view>
            </view>
          </view>

          <view class="requirement-section">
            <text class="requirement-label">其他要求:</text>
            <view class="requirement-list">
              <view v-for="(other, index) in jobInfo.requirements.others" :key="index" class="requirement-list-item">
                <text class="bullet-point">·</text>
                <text class="requirement-text">{{ other }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部固定按钮 -->
    <view class="bottom-action" :style="{ paddingBottom: safeAreaBottom + 'px' }">
      <view class="custom-button" @click="submitResume">
        投递简历
      </view>
    </view>
  </view>
</template>

<script>
import config from '@/config/index.js'
import { getJobDetail, applyJob } from '@/api/modules/enterprise.js'

export default {
  data() {
    return {
      config,
      safeAreaBottom: 0,
      navbarBgColor: 'transparent',
      navbarTextColor: '#3F3F3F',
      loading: false,
      error: null,
      jobId: null,
      jobInfo: {
        title: '职位加载中...',
        salary: '薪资面议',
        location: '工作地点',
        experience: '经验要求',
        education: '学历要求',
        companyName: '企业名称',
        companyDesc: '企业描述',
        companySize: '企业规模',
        description: '职位描述加载中...',
        responsibilities: [],
        requirements: {
          education: '学历要求',
          experience: '经验要求',
          skills: [],
          others: []
        }
      }
    }
  },
  onLoad(options) {
    this.getSystemInfo()
    // 接收传递的职位ID参数
    if (options.id) {
      this.jobId = options.id
      this.loadJobDetail(options.id)
    } else {
      this.error = '职位ID参数缺失'
    }
  },
  methods: {
    // 获取系统信息
    getSystemInfo() {
      const systemInfo = uni.getSystemInfoSync()
      this.safeAreaBottom = systemInfo.safeAreaInsets?.bottom || 0
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

    // 投递简历
    async submitResume() {
      if (!this.jobId) {
        uni.showToast({
          title: '职位信息错误',
          icon: 'none'
        })
        return
      }

      try {
        uni.showLoading({
          title: '投递中...'
        })

        const response = await applyJob({
          jobId: this.jobId,
          coverLetter: '我对这个职位很感兴趣，希望能够加入贵公司。'
        })

        uni.hideLoading()
        
        if (response) {
          uni.showToast({
            title: '简历投递成功',
            icon: 'success'
          })
        } else {
          throw new Error('投递失败')
        }
      } catch (error) {
        uni.hideLoading()
        console.error('投递简历失败:', error)
        uni.showToast({
          title: error.message || '投递失败，请稍后重试',
          icon: 'none'
        })
      }
    },

    // 根据职位ID加载职位详情
    async loadJobDetail(jobId) {
      if (!jobId) {
        this.error = '职位ID无效'
        return
      }

      this.loading = true
      this.error = null

      try {
        const response = await getJobDetail(jobId)
        console.log('职位详情数据:', response)

        if (response && response.data && response.data.job) {
          const job = response.data.job
          const enterprise = response.data.enterprise || {}
          
          // 处理薪资格式
          let salary = '面议'
          if (job.salaryRange) {
            salary = job.salaryRange
          } else if (job.salaryMin && job.salaryMax) {
            const minK = Math.floor(job.salaryMin / 1000)
            const maxK = Math.floor(job.salaryMax / 1000)
            salary = `${minK}k-${maxK}k`
          } else if (job.salary) {
            salary = job.salary
          }

          // 处理职责列表 - 从requirements字段解析
          let responsibilities = []
          if (job.requirements) {
            if (typeof job.requirements === 'string') {
              responsibilities = job.requirements.split('\n').filter(item => item.trim())
            } else if (Array.isArray(job.requirements)) {
              responsibilities = job.requirements
            }
          }

          // 处理技能要求 - 从requirements字段解析技能相关的部分
          let skills = []
          if (job.requirements && typeof job.requirements === 'string') {
            // 将所有要求作为技能要求显示
            skills = job.requirements.split('\n').filter(item => item.trim())
          }

          // 处理其他要求 - 暂时为空，因为接口只有一个requirements字段
          let others = []

          this.jobInfo = {
            title: job.title || '职位名称',
            salary: salary,
            location: job.location || '工作地点',
            experience: job.workExperience || job.experienceRequirement || '经验要求',
            education: job.educationRequirement || '学历要求',
            companyName: enterprise.companyName || job.companyName || '企业名称',
            companyDesc: `${enterprise.industry || '行业'} · ${enterprise.companyType || '企业类型'}`,
            companySize: enterprise.companySize || enterprise.scale || '企业规模',
            description: job.description || '职位描述',
            responsibilities: responsibilities,
            requirements: {
              education: job.educationRequirement || '学历要求',
              experience: job.workExperience || job.experienceRequirement || '经验要求',
              skills: skills,
              others: others
            }
          }
        } else {
          throw new Error('职位信息不存在')
        }
      } catch (error) {
        console.error('加载职位详情失败:', error)
        this.error = error.message || '加载职位详情失败，请稍后重试'
        
        // 显示错误提示
        uni.showToast({
          title: this.error,
          icon: 'none',
          duration: 2000
        })
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.job-detail-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  // background-color: #F7F8FA;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.scroll-container {
  flex: 1;
  height: 0; // 重要：配合flex使用，确保滚动容器能够正确计算高度
}

.page-content {
  padding-bottom: 80px; // 为底部按钮留出空间
}

// 职位标题与薪资区域
.job-header {
  padding: 15px 20px;
  // background-color: #F7F8FA;

  .job-title-salary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;

    .job-title {
      font-size: 24px;
      font-weight: bold;
      color: #000000;
    }

    .job-salary {
      font-size: 18px;
      color: #9ADBDA;
      font-weight: 500;
      margin-right: 90rpx;
    }
  }

  .job-tags {
    display: flex;
    align-items: center;

    .tag-item {
      display: flex;
      align-items: center;
      margin-right: 70rpx;

      .tag-text {
        font-size: 12px;
        color: #888888;
        margin-left: 4px;
      }
    }
  }
}

// 公司信息区域
.company-info {
  // background-color: #F7F8FA;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);

  .company-content {
    display: flex;
    align-items: center;
    padding: 12px 20px;

    .company-logo {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background-color: #DCDCDC;
      margin-right: 12px;
    }

    .company-details {
      flex: 1;

      .company-name {
        display: block;
        font-size: 16px;
        font-weight: 600;
        color: #000000;
        margin-bottom: 4px;
      }

      .company-desc {
        font-size: 12px;
        color: #666666;
        background-color: #fbffff;

      }

      .company-size {
        font-size: 12px;
        color: #666666;
        background-color: #fbffff;
        margin-left: 10rpx;
      }
    }

    .company-arrow {
      margin-left: 10px;
    }
  }
}

// 职位详情区域
.job-details {
  padding: 10px 20px 20px 20px;
  // background-color: #F7F8FA;

  .section-title {
    display: block;
    font-size: 18px;
    font-weight: 600;
    color: #000000;
    margin-bottom: 15px;
  }

  .subsection-title {
    display: block;
    font-size: 15px;
    color: #333333;
    margin-bottom: 10px;
  }

  .job-description {
    display: block;
    font-size: 14px;
    color: #333333;
    line-height: 1.6;
    margin-bottom: 10px;
  }

  .job-responsibilities {
    .responsibility-item {
      display: flex;
      margin-bottom: 6px;

      .bullet-point {
        color: #333333;
        margin-right: 8px;
        font-size: 14px;
      }

      .responsibility-text {
        flex: 1;
        font-size: 14px;
        color: #333333;
        line-height: 1.6;
      }
    }
  }
}

// 职业要求区域
.job-requirements {
  padding: 0rpx 20rpx 20rpx 50rpx;
  // background-color: #F7F8FA;

  .section-title {
    display: block;
    font-size: 18px;
    font-weight: 600;
    color: #000000;
    margin-bottom: 15px;
  }

  .requirement-item {
    margin-bottom: 8px;

    .requirement-label {
      font-size: 14px;
      color: #333333;
    }

    .requirement-value {
      font-size: 14px;
      color: #333333;
    }
  }

  .requirement-section {
    margin-bottom: 8px;

    .requirement-label {
      display: block;
      font-size: 14px;
      color: #333333;
      margin-bottom: 6px;
    }

    .requirement-list {
      .requirement-list-item {
        display: flex;
        margin-bottom: 6px;

        .bullet-point {
          color: #333333;
          margin-right: 8px;
          font-size: 14px;
        }

        .requirement-text {
          flex: 1;
          font-size: 14px;
          color: #333333;
          line-height: 1.6;
        }
      }
    }
  }
}

// 底部固定按钮
.bottom-action {
  position: fixed;
  bottom: 0;
  left: 12rpx;
  right: 35rpx;
  padding: 10px 0;
  // border-top: 1px solid #EEEEEE;
  z-index: 10;

  .custom-button {
    background-color: #88c5ff;
    border-radius: 30rpx;
    height: 45px;
    color: #000000;
    font-size: 32rpx;
    letter-spacing: 12rpx;
    margin: 0 35rpx 52rpx 65rpx;
    border: 1px solid #88c5ff;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;

    &:active {
      background-color: #6bb3ff;
      transform: scale(0.98);
    }
  }
}

// 加载状态样式
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

// 错误状态样式
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

.retry-btn {
  background-color: #88c5ff;
  border-radius: 20rpx;
  padding: 10rpx 30rpx;
  margin-top: 20rpx;
}

.retry-text {
  font-size: 28rpx;
  color: #000000;
}
</style>