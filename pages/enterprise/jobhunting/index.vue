<template>
  <view class="enterprise-page" :style="{ backgroundImage: 'url(' + backgroundImageUrl + ')' }">
    <!-- iOS 状态栏 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
    
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">我的企业</text>
    </view>
    
    <!-- 公司基本信息 -->
    <view class="company-info-section">
      <view class="company-logo">
        <view class="logo-placeholder"></view>
      </view>
      <view class="company-details">
        <text class="company-name">{{ enterpriseInfo.name }}</text>
        <view class="company-tags">
          <view class="tag">
            <text class="tag-text">{{ enterpriseInfo.industry }}</text>
          </view>
          <view class="tag">
            <text class="tag-text">{{ enterpriseInfo.scale }}</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 公司简介模块 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">公司简介</text>
        <uv-button 
          text="编辑详情" 
          type="primary"
          size="mini"
          :customStyle="{
            backgroundColor: '#58AFFF',
            borderRadius: '8px',
            height: '28px',
            fontSize: '12px',
            padding: '0 8px'
          }"
          @click="editCompanyInfo"
        ></uv-button>
      </view>
      <view class="section-content">
        <text class="content-subtitle">关于{{ enterpriseInfo.name.replace('有限公司', '').replace('科技', '') }}</text>
        <text class="content-text">{{ enterpriseInfo.description }}</text>
        <view class="content-list">
          <text class="list-item">· 核心业务：智慧零售、智慧物流、AI算法平台开发</text>
          <text class="list-item">· 服务客户：已覆盖全球30多个国家，超过500家企业</text>
          <text class="list-item">· 公司文化：创新、开放、高效、合作</text>
        </view>
      </view>
    </view>
    
    <!-- 职位编辑模块 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">职位编辑</text>
        <uv-button 
          text="立即编辑" 
          type="primary"
          size="mini"
          :customStyle="{
            backgroundColor: '#58AFFF',
            borderRadius: '8px',
            height: '28px',
            fontSize: '12px',
            padding: '0 8px'
          }"
          @click="editJobs"
        ></uv-button>
      </view>
      
      <!-- 职位列表 -->
      <view class="job-list">
        <view 
          class="job-card" 
          v-for="(job, index) in jobList" 
          :key="index"
          @click="goToJobDetail(job)"
        >
          <view class="job-header">
            <text class="job-title">{{ job.title }}</text>
            <text class="job-salary">{{ job.salary }}</text>
            <text class="arrow-icon">></text>
          </view>
          <view class="job-info">
            <view class="info-item">
              <uv-icon name="map-pin" size="13" color="#888888"></uv-icon>
              <text class="info-text">{{ job.location }}</text>
            </view>
            <view class="info-item">
              <uv-icon name="graduation-cap" size="13" color="#888888"></uv-icon>
              <text class="info-text">{{ job.education }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    
    <!-- 底部导航栏 -->
    <UserTabbar :defaultActive="1" />
  </view>
</template>

<script>
import UserTabbar from '@/components/tabbar/user-tabbar/user-tabbar.vue'
import { staticBaseUrl } from '@/config/index.js'
import { enterpriseApi } from '@/api/index.js'

export default {
  name: 'EnterpriseJobHunting',
  components: {
    UserTabbar
  },
  data() {
    return {
      statusBarHeight: 0,
      loading: false,
      loadingJobs: false,
      // 企业级缓存管理
      cacheData: null,
      cacheTimestamp: 0,
      cacheExpiration: 10 * 60 * 1000, // 10分钟缓存
      // 重试机制配置
      maxRetries: 3,
      retryDelays: [1000, 2000, 4000], // 指数退避延迟
      // 错误状态管理
      enterpriseLoadError: null,
      jobsLoadError: null,
      enterpriseInfo: {
        name: 'XX科技有限公司',
        industry: '互联网 · 软件开发',
        scale: '500-999人',
        logo: '',
        description: 'XX科技成立于2012年，是一家专注于人工智能、大数据分析与云计算服务的高新技术企业。我们致力于用科技赋能产业，推动数字化转型，服务全球客户。'
      },
      jobList: []
    }
  },
  computed: {
    // 动态生成背景图片URL
    backgroundImageUrl() {
      return `${staticBaseUrl}/bg3.png`
    }
  },
  onLoad() {
    // 获取系统状态栏高度
    const systemInfo = uni.getSystemInfoSync()
    this.statusBarHeight = systemInfo.statusBarHeight || 0
    
    // 加载企业数据
    this.loadEnterpriseData()
    
    // 加载职位列表
    this.loadJobList()
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
     * 企业级企业信息加载 - 多层数据保护
     */
    async loadEnterpriseData() {
      this.loading = true
      this.enterpriseLoadError = null
      
      try {
        // 第一层：尝试从缓存获取数据
        const cacheKey = 'enterprise_info'
        const cachedData = this.getCachedData(cacheKey)
        
        if (cachedData) {
          this.updateEnterpriseInfo(cachedData)
          this.loading = false
          // 后台静默更新数据
          this.silentUpdateEnterpriseInfo()
          return
        }
        
        // 第二层：API调用获取数据
        const response = await this.callApiWithRetry(
          enterpriseApi.getCurrentEnterpriseInfo.bind(enterpriseApi)
        )
        
        if (response && response.data) {
          const enterpriseData = response.data
          this.updateEnterpriseInfo(enterpriseData)
          this.setCachedData(cacheKey, enterpriseData)
          
          console.log('企业信息加载成功')
        } else {
          throw new Error('企业信息数据格式异常')
        }
      } catch (error) {
        console.error('加载企业信息失败:', error)
        this.handleEnterpriseLoadError(error)
        
        // 第三层：使用默认数据作为降级方案
        this.useDefaultEnterpriseData()
      } finally {
        this.loading = false
      }
    },

    /**
     * 静默更新企业信息
     */
    async silentUpdateEnterpriseInfo() {
      try {
        const response = await enterpriseApi.getCurrentEnterpriseInfo()
        if (response && response.data) {
          const cacheKey = 'enterprise_info'
          this.setCachedData(cacheKey, response.data)
          console.log('企业信息已静默更新')
        }
      } catch (error) {
        console.warn('企业信息静默更新失败:', error)
      }
    },

    /**
     * 更新企业信息
     * @param {Object} enterpriseData - 企业数据
     */
    updateEnterpriseInfo(enterpriseData) {
      this.enterpriseInfo = {
        name: enterpriseData.companyName || enterpriseData.name || this.enterpriseInfo.name,
        industry: enterpriseData.industry || this.enterpriseInfo.industry,
        scale: enterpriseData.scale || this.enterpriseInfo.scale,
        logo: enterpriseData.logo || this.enterpriseInfo.logo,
        description: enterpriseData.description || this.enterpriseInfo.description
      }
    },

    /**
     * 使用默认企业数据
     */
    useDefaultEnterpriseData() {
      console.log('使用默认企业数据作为降级方案')
      // 当前已有默认数据，无需额外处理
    },

    /**
     * 处理企业信息加载错误
     * @param {Error|string} error - 错误信息
     */
    handleEnterpriseLoadError(error) {
      this.enterpriseLoadError = error
      const errorMessage = this.getErrorMessage(error)
      
      uni.showToast({
        title: `企业信息加载失败: ${errorMessage}`,
        icon: 'none',
        duration: 3000
      })
    },
    
    /**
     * 企业级职位列表加载 - 多层数据保护
     */
    async loadJobList() {
      this.loadingJobs = true
      this.jobsLoadError = null
      
      try {
        // 第一层：尝试从缓存获取数据
        const cacheKey = 'enterprise_jobs'
        const cachedData = this.getCachedData(cacheKey)
        
        if (cachedData) {
          this.updateJobList(cachedData)
          this.loadingJobs = false
          // 后台静默更新数据
          this.silentUpdateJobList()
          return
        }
        
        // 第二层：API调用获取数据
        const response = await this.callApiWithRetry(
          enterpriseApi.getEnterpriseJobs.bind(enterpriseApi),
          [{
            page: 1,
            size: 20
          }]
        )
        
        if (response && response.data && response.data.list) {
          const jobsData = response.data.list
          this.updateJobList(jobsData)
          this.setCachedData(cacheKey, jobsData)
          
          console.log('职位列表加载成功')
        } else {
          throw new Error('职位列表数据格式异常')
        }
      } catch (error) {
        console.error('加载职位列表失败:', error)
        this.handleJobsLoadError(error)
        
        // 第三层：使用默认数据作为降级方案
        this.useDefaultJobsData()
      } finally {
        this.loadingJobs = false
      }
    },

    /**
     * 静默更新职位列表
     */
    async silentUpdateJobList() {
      try {
        const response = await enterpriseApi.getEnterpriseJobs({
          page: 1,
          size: 20
        })
        if (response && response.data && response.data.list) {
          const cacheKey = 'enterprise_jobs'
          this.setCachedData(cacheKey, response.data.list)
          console.log('职位列表已静默更新')
        }
      } catch (error) {
        console.warn('职位列表静默更新失败:', error)
      }
    },

    /**
     * 更新职位列表
     * @param {Array} jobsData - 职位数据数组
     */
    updateJobList(jobsData) {
      this.jobList = jobsData.map(job => ({
        id: job.id,
        title: job.title,
        salary: job.salaryMin && job.salaryMax ?
          `${job.salaryMin}k-${job.salaryMax}k` :
          job.salary || '面议',
        location: job.location || '待定',
        education: job.educationRequirement || job.education || '本科'
      }))
    },

    /**
     * 使用默认职位数据
     */
    useDefaultJobsData() {
      console.log('使用默认职位数据作为降级方案')
      this.jobList = [
        {
          id: 1,
          title: '法务专员',
          salary: '6k-9k',
          location: '上海市 · 浦东新区',
          education: '本科'
        },
        {
          id: 2,
          title: '产品经理',
          salary: '12k-18k',
          location: '上海市 · 徐汇区',
          education: '本科'
        },
        {
          id: 3,
          title: '前端开发工程师',
          salary: '10k-15k',
          location: '上海市 · 静安区',
          education: '本科'
        }
      ]
    },

    /**
     * 处理职位列表加载错误
     * @param {Error|string} error - 错误信息
     */
    handleJobsLoadError(error) {
      this.jobsLoadError = error
      const errorMessage = this.getErrorMessage(error)
      
      uni.showToast({
        title: `职位列表加载失败: ${errorMessage}`,
        icon: 'none',
        duration: 3000
      })
    },

    /**
     * 编辑公司信息
     */
    editCompanyInfo() {
      console.log('编辑公司详情')
      uni.navigateTo({
        url: '/pages/enterprise/companydetails/index'
      })
    },

    /**
     * 编辑职位信息
     */
    editJobs() {
      console.log('立即编辑职位')
      uni.navigateTo({
        url: '/pages/enterprise/jobdetails/index'
      })
    },

    /**
     * 跳转到职位详情
     * @param {Object} job - 职位信息
     */
    goToJobDetail(job) {
      console.log('查看职位详情', job)
      if (!job.id) {
        uni.showToast({
          title: '职位信息异常',
          icon: 'none'
        })
        return
      }
      
      uni.navigateTo({
        url: `/pages/enterprise/jobdetails/index?jobId=${job.id}&title=${encodeURIComponent(job.title)}`
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
.enterprise-page {
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

.page-header {
  padding: 20rpx 40rpx 30rpx;
  
  .page-title {
    font-size: 45rpx;
    font-weight: bold;
    color: #333333;
    line-height: 1.2;
  }
}

.company-info-section {
  display: flex;
  align-items: center;
  padding: 0 40rpx 40rpx;
  
  .company-logo {
    margin-right: 30rpx;
    
    .logo-placeholder {
      width: 140rpx;
      height: 140rpx;
      background-color: #D8D8D8;
      border-radius: 50%;
    }
  }
  
  .company-details {
    flex: 1;
    
    .company-name {
      font-size: 32rpx;
      font-weight: bold;
      color: #333333;
      margin-bottom: 20rpx;
      display: block;
    }
    
    .company-tags {
      display: flex;
      gap: 20rpx;
      align-items: center; /* 让文字垂直居中 */
      
      .tag {
        background-color: #eefdff;
        // border: 1px solid #E0E0E0;
        border-radius: 12rpx;
        padding: 4rpx 8rpx;
        display: flex; /* 让标签内容也使用flex布局 */
        align-items: center; /* 让标签内文字垂直居中 */
        
        .tag-text {
          font-size: 24rpx;
          color: #666666;
        }
      }
    }
  }
}

.section {
  margin: 0 40rpx 40rpx;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30rpx;
    
    .section-title {
      font-size: 36rpx;
      font-weight: bold;
      color: #333333;
    }
  }
  
  .section-content {
    .content-subtitle {
      font-size: 32rpx;
      font-weight: bold;
      color: #333333;
      margin-bottom: 20rpx;
      display: block;
    }
    
    .content-text {
      font-size: 28rpx;
      color: #333333;
      line-height: 1.5;
      margin-bottom: 30rpx;
      display: block;
    }
    
    .content-list {
      .list-item {
        font-size: 28rpx;
        color: #333333;
        line-height: 1.5;
        margin-bottom: 15rpx;
        display: block;
      }
    }
  }
}

.job-list {
  .job-card {
    background-color: #FFFFFF;
    border-radius: 24rpx;
    padding: 30rpx 40rpx;
    margin-bottom: 30rpx;
    box-shadow: 0px 4rpx 16rpx rgba(0, 0, 0, 0.05);
    
    .job-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;
      
      .job-title {
        font-size: 34rpx;
        font-weight: bold;
        color: #333333;
        flex: 1;
      }
      
      .job-salary {
        font-size: 34rpx;
        font-weight: 600;
        color: #65C4BA;
        margin-right: 20rpx;
      }
      
      .arrow-icon {
        font-size: 32rpx;
        color: #333333;
        font-weight: bold;
      }
    }
    
    .job-info {
      display: flex;
      align-items: center;
      gap: 60rpx;
      
      .info-item {
        display: flex;
        align-items: center;
        gap: 10rpx;
        
        .info-text {
          font-size: 26rpx;
          color: #888888;
        }
      }
    }
  }
}


</style>
