<template>
  <view class="job-detail-container" :style="{ backgroundImage: 'url(' + backgroundImageUrl + ')' }">
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
          <view class="info-input-container">
            <uv-input 
              v-model="jobInfo.location"
              placeholder=""
              :customStyle="inputCustomStyle"
              border="none"
            ></uv-input>
          </view>
        </view>
        <view class="info-row">
          <text class="info-label">工作经验</text>
          <view class="info-input-container">
            <uv-input 
              v-model="jobInfo.experience"
              placeholder=""
              :customStyle="inputCustomStyle"
              border="none"
            ></uv-input>
          </view>
        </view>
        <view class="info-row">
          <text class="info-label">学历要求</text>
          <view class="info-input-container">
            <uv-input 
              v-model="jobInfo.education"
              placeholder=""
              :customStyle="inputCustomStyle"
              border="none"
            ></uv-input>
          </view>
        </view>
      </view>
      
      <!-- 职位详情卡片 -->
      <view class="job-detail-card">
        <!-- 职位详情标题 -->
        <text class="section-title">职位详情</text>
        
        <!-- 职位描述 -->
        <text class="sub-title">职位描述</text>
        <view class="description-container">
          <uv-textarea 
            v-model="jobInfo.description"
            placeholder="请输入职位描述"
            :customStyle="textareaCustomStyle"
            autoHeight
            maxlength="500"
          ></uv-textarea>
        </view>
        
        
        
        <!-- 职业要求 -->
        <text class="sub-title">职业要求</text>
        <view class="requirement-item">
          <view class="requirement-input-container">
            <uv-textarea 
              v-model="jobInfo.educationRequirement"
              placeholder="请输入学历要求"
              :customStyle="requirementTextareaStyle"
              autoHeight
              maxlength="1000"
            ></uv-textarea>
          </view>
        </view>
        
        
        <!-- 操作按钮 -->
        <view class="action-button-container">
          <view class="custom-save-button" @click="handleSave">
            <text class="button-text">点击保存</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { enterpriseApi } from '@/api/index.js'
import { staticBaseUrl } from '@/config/index.js'

export default {
  name: 'JobDetails',
  data() {
    return {
      statusBarHeight: 0,
      jobId: '',
      loading: false,
      saving: false,
      applying: false,
      // 企业级缓存管理
      cacheData: null,
      cacheTimestamp: 0,
      cacheExpiration: 10 * 60 * 1000, // 10分钟缓存
      // 重试机制配置
      maxRetries: 3,
      retryDelays: [1000, 2000, 4000], // 指数退避延迟
      // 错误状态管理
      loadError: null,
      saveError: null,
      applyError: null,
      jobInfo: {
        title: '法务专员',
        location: '',
        experience: '',
        education: '',
        description: `       本岗位主要负责公司合同审核、法律咨询支持、风险防控管理及法律文书处理等相关事务，确保公司经营活动合法合规。
        负责各类合同、协议的起草与审核；
        提供日常法律咨询服务，出具法律意见书；
        参与处理劳动人事、商业合作等相关法律事务；
        协助进行公司合规体系建设，培训业务部门员工；
        配合处理公司重大突发法律事务。
        `,
        educationRequirement: `学历要求：本科及以上（法律相关专业优先）
工作经验：1–3年相关工作经验
专业技能：
熟悉合同法、劳动法、公司法等相关法律法规
能独立起草、审核法律文件
其他要求：
具备较强的沟通协调能力与逻辑分析能力
具备良好的职业道德，严谨细致
有律师资格证者优先
        `,
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

      inputCustomStyle: {
        backgroundColor: '#eaf5fa',
        borderRadius: '4px',
        padding: '0 12px',
        fontSize: '14px',
        color: '#555555'
      },
      textareaCustomStyle: {
        backgroundColor: '#eaf5fa',
        borderRadius: '4px',
        padding: '12px',
        fontSize: '14px',
        color: '#555555'
      },
      requirementInputStyle: {
        backgroundColor: '#eaf5fa',
        borderRadius: '4px',
        padding: '0 8px',
        fontSize: '14px',
        color: '#555555',
        flex: 1
      },
      requirementTextareaStyle: {
        backgroundColor: '#eaf5fa',
        borderRadius: '4px',
        padding: '12px',
        fontSize: '14px',
        color: '#555555'
      }
    }
  },
  
  computed: {
    // 动态生成背景图片URL
    backgroundImageUrl() {
      return `${staticBaseUrl}/bg9.png`
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
     * 企业级API调用重试机制
     * @param {Function} apiCall - API调用函数
     * @param {Array} params - API参数
     * @param {number} retryCount - 当前重试次数
     */
    async callApiWithRetry(apiCall, params = [], retryCount = 0) {
      try {
        return await apiCall(...params)
      } catch (error) {
        console.error(`API调用失败 (尝试 ${retryCount + 1}/${this.maxRetries + 1}):`, error)
        
        if (retryCount < this.maxRetries) {
          // 添加随机抖动避免雷群效应
          const baseDelay = this.retryDelays[retryCount] || 4000
          const jitter = Math.random() * 1000
          const delay = baseDelay + jitter
          
          console.log(`${delay}ms后进行第${retryCount + 1}次重试...`)
          await new Promise(resolve => setTimeout(resolve, delay))
          
          return this.callApiWithRetry(apiCall, params, retryCount + 1)
        }
        
        throw error
      }
    },

    /**
     * 智能缓存数据获取
     * @param {string} key - 缓存键
     */
    getCachedData(key) {
      const now = Date.now()
      if (this.cacheData && this.cacheData[key] &&
          (now - this.cacheTimestamp) < this.cacheExpiration) {
        console.log(`使用缓存数据: ${key}`)
        return this.cacheData[key]
      }
      return null
    },

    /**
     * 设置缓存数据
     * @param {string} key - 缓存键
     * @param {any} data - 缓存数据
     */
    setCachedData(key, data) {
      if (!this.cacheData) {
        this.cacheData = {}
      }
      this.cacheData[key] = data
      this.cacheTimestamp = Date.now()
      console.log(`缓存数据已更新: ${key}`)
    },

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
     * 企业级职位详情加载 - 多层数据保护
     */
    async loadJobDetail() {
      if (!this.jobId) {
        console.log('未提供职位ID，使用默认数据')
        this.handleLoadError('缺少职位ID参数')
        return
      }
      
      this.loading = true
      this.loadError = null
      
      try {
        // 第一层：尝试从缓存获取数据
        const cacheKey = `job_detail_${this.jobId}`
        const cachedData = this.getCachedData(cacheKey)
        
        if (cachedData) {
          this.updateJobInfo(cachedData)
          this.loading = false
          // 后台静默更新数据
          this.silentUpdateJobDetail()
          return
        }
        
        // 第二层：API调用获取数据
        const response = await this.callApiWithRetry(
          enterpriseApi.getJobDetail.bind(enterpriseApi),
          [this.jobId]
        )
        
        if (response && response.data) {
          const jobData = response.data
          this.updateJobInfo(jobData)
          this.setCachedData(cacheKey, jobData)
          
          // 记录职位浏览量（异步，不影响主流程）
          this.incrementViewCount().catch(error => {
            console.warn('浏览量记录失败:', error)
          })
          
          uni.showToast({
            title: '职位详情加载成功',
            icon: 'success',
            duration: 1500
          })
        } else {
          throw new Error('职位数据格式异常')
        }
      } catch (error) {
        console.error('加载职位详情失败:', error)
        this.handleLoadError(error)
        
        // 第三层：使用默认数据作为降级方案
        this.useDefaultJobData()
      } finally {
        this.loading = false
      }
    },

    /**
     * 静默更新职位详情数据
     */
    async silentUpdateJobDetail() {
      try {
        const response = await enterpriseApi.getJobDetail(this.jobId)
        if (response && response.data) {
          const cacheKey = `job_detail_${this.jobId}`
          this.setCachedData(cacheKey, response.data)
          console.log('职位详情数据已静默更新')
        }
      } catch (error) {
        console.warn('静默更新失败:', error)
      }
    },

    /**
     * 更新职位信息
     * @param {Object} jobData - 职位数据
     */
    updateJobInfo(jobData) {
      this.jobInfo = {
        title: jobData.title || this.jobInfo.title,
        location: jobData.location || this.jobInfo.location,
        experience: jobData.workExperience || jobData.experience || this.jobInfo.experience,
        education: jobData.educationRequirement || jobData.education || this.jobInfo.education,
        description: jobData.description || this.jobInfo.description,
        educationRequirement: jobData.requirements || jobData.educationRequirement || this.jobInfo.educationRequirement,
        experienceRequirement: jobData.workExperience || jobData.experienceRequirement || this.jobInfo.experienceRequirement
      }
    },

    /**
     * 使用默认职位数据
     */
    useDefaultJobData() {
      console.log('使用默认职位数据作为降级方案')
      // 当前已有默认数据，无需额外处理
      uni.showToast({
        title: '已加载默认职位信息',
        icon: 'none',
        duration: 2000
      })
    },

    /**
     * 处理加载错误
     * @param {Error|string} error - 错误信息
     */
    handleLoadError(error) {
      this.loadError = error
      const errorMessage = this.getErrorMessage(error)
      
      uni.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 3000
      })
    },
    
    /**
     * 企业级浏览量记录 - 带重试机制
     */
    async incrementViewCount() {
      try {
        await this.callApiWithRetry(
          enterpriseApi.incrementJobViewCount.bind(enterpriseApi),
          [this.jobId]
        )
        console.log('职位浏览量记录成功')
      } catch (error) {
        console.error('记录浏览量失败:', error)
        // 浏览量记录失败不影响主要功能，只记录日志
      }
    },
    
    /**
     * 企业级简历投递 - 完整验证和错误处理
     */
    async handleSave() {
      // 基础验证
      if (!this.jobId) {
        this.handleApplyError('职位信息异常，无法投递简历')
        return
      }
      
      if (this.applying) {
        uni.showToast({
          title: '正在投递中，请稍候...',
          icon: 'none'
        })
        return
      }
      
      // 确认投递
      const confirmed = await this.showConfirmDialog(
        '确认投递',
        `确定要投递简历到"${this.jobInfo.title}"职位吗？`
      )
      
      if (!confirmed) {
        return
      }
      
      this.applying = true
      this.applyError = null
      
      try {
        uni.showLoading({
          title: '投递中...',
          mask: true
        })
        
        // 构建投递数据
        const applicationData = {
          jobId: this.jobId,
          coverLetter: `我对${this.jobInfo.title}职位非常感兴趣，希望能够加入贵公司。我具备相关工作经验和专业技能，期待能有机会为贵公司贡献力量。`,
          applyTime: new Date().toISOString()
        }
        
        // 企业级API调用
        const response = await this.callApiWithRetry(
          enterpriseApi.applyJob.bind(enterpriseApi),
          [applicationData]
        )
        
        if (response && (response.success || response.code === 200)) {
          uni.showToast({
            title: '简历投递成功！',
            icon: 'success',
            duration: 2000
          })
          
          // 记录投递成功状态
          this.recordApplicationSuccess()
          
          // 延迟返回上一页
          setTimeout(() => {
            uni.navigateBack({
              delta: 1
            })
          }, 2000)
        } else {
          throw new Error(response?.message || response?.msg || '投递失败，请重试')
        }
      } catch (error) {
        console.error('投递简历失败:', error)
        this.handleApplyError(error)
      } finally {
        this.applying = false
        uni.hideLoading()
      }
    },

    /**
     * 记录投递成功状态
     */
    recordApplicationSuccess() {
      try {
        // 可以在这里添加本地存储记录
        const applicationRecord = {
          jobId: this.jobId,
          jobTitle: this.jobInfo.title,
          applyTime: new Date().toISOString(),
          status: 'applied'
        }
        
        // 存储到本地缓存
        const existingRecords = uni.getStorageSync('job_applications') || []
        existingRecords.push(applicationRecord)
        uni.setStorageSync('job_applications', existingRecords)
        
        console.log('投递记录已保存到本地')
      } catch (error) {
        console.warn('保存投递记录失败:', error)
      }
    },

    /**
     * 处理投递错误
     * @param {Error|string} error - 错误信息
     */
    handleApplyError(error) {
      this.applyError = error
      const errorMessage = this.getErrorMessage(error)
      
      uni.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 3000
      })
    },

    /**
     * 显示确认对话框
     * @param {string} title - 标题
     * @param {string} content - 内容
     */
    showConfirmDialog(title, content) {
      return new Promise((resolve) => {
        uni.showModal({
          title,
          content,
          confirmText: '确定',
          cancelText: '取消',
          success: (res) => {
            resolve(res.confirm)
          },
          fail: () => {
            resolve(false)
          }
        })
      })
    },

    /**
     * 统一错误消息处理
     * @param {Error|string} error - 错误对象或字符串
     */
    getErrorMessage(error) {
      if (typeof error === 'string') {
        return error
      }
      
      if (error && error.message) {
        // 网络错误
        if (error.message.includes('Network Error') || error.message.includes('timeout')) {
          return '网络连接异常，请检查网络后重试'
        }
        
        // 权限错误
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          return '登录已过期，请重新登录'
        }
        
        // 服务器错误
        if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
          return '服务器繁忙，请稍后重试'
        }
        
        // 数据验证错误
        if (error.message.includes('400') || error.message.includes('Bad Request')) {
          return '请求参数异常，请重试'
        }
        
        return error.message
      }
      
      return '操作失败，请重试'
    }
  }
}
</script>

<style lang="scss" scoped>
.job-detail-container {
  min-height: 100vh;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
}

.status-bar {
  background-color: transparent;
}

.navbar {
  background-color: transparent;
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
    font-size: 45rpx;
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
    
    .info-input-container {
      flex: 1;
      height: 32px;
      margin-left: 12px;
      display: flex;
      align-items: center;
    }
  }
}

.job-detail-card {
  // background-color: #FFFFFF;
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
  
  .description-container {
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
    display: flex;
    align-items: center;
    
    .requirement-label {
      font-size: 14px;
      color: #666666;
      font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
      width: 80px;
      flex-shrink: 0;
    }
    
    .requirement-input-container {
      flex: 1;
      margin-left: 8px;
    }
  }
  
  .action-button-container {
    margin-top: 40px;
    display: flex;
    justify-content: center;
    padding-bottom: 20px;
    
    .custom-save-button {
      width: 90%;
      height: 50px;
      background-color: #82C0F9;
      border-radius: 25px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 0.2s ease;
      
      &:active {
        opacity: 0.8;
      }
      
      .button-text {
        color: #000;
        font-size: 18px;
        font-weight: normal;
        font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
      }
    }
  }
}

/* iOS Home Indicator 适配 */
.job-detail-container {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>

