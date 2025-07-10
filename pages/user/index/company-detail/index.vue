<template>
  <view class="company-detail-container" :style="{ background: `url('${config.staticBaseUrl}/bg9.png') no-repeat center center / cover` }">
    <!-- 自定义导航栏 -->
    <uv-navbar 
      title="公司详情" 
      :autoBack="true"
      leftText="返回"
      leftIcon="arrow-left"
      :bgColor="navbarBgColor"
      :leftIconColor="navbarTextColor"
      :safeAreaInsetTop="true"
      :fixed="true"
      :placeholder="true"
      @leftClick="goBack"
    ></uv-navbar>

    <!-- 可滚动的页面内容 -->
    <scroll-view class="scroll-container" scroll-y="true">
      <view class="page-content">
        <!-- 公司基本信息区块 -->
        <view class="company-basic-info">
          <view class="company-logo">
            <uv-image 
              v-if="companyInfo.logo"
              :src="companyInfo.logo" 
              width="60px" 
              height="60px" 
              mode="aspectFill"
              radius="30px"
            ></uv-image>
            <view v-else class="logo-placeholder"></view>
          </view>
          
          <view class="company-details">
            <text class="company-name">{{ companyInfo.name }}</text>
            <view class="company-tags">
              <text class="industry-tag">{{ companyInfo.industry }}</text>
              <view class="scale-tag">
                <text class="scale-text">{{ companyInfo.scale }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 白色卡片容器 -->
        <view class="content-card">
          <!-- 公司简介区块 -->
          <view class="company-intro">
            <text class="section-title">公司简介</text>
            <text class="subsection-title">{{ companyInfo.about.title }}</text>
            <text class="intro-description">{{ companyInfo.about.description }}</text>
            <view class="intro-highlights">
              <view v-for="(item, index) in companyInfo.about.highlights" :key="index" class="highlight-item">
                <text class="bullet-point">·</text>
                <text class="highlight-text">{{ item }}</text>
              </view>
            </view>
          </view>

          <!-- 福利待遇图标区块 -->
          <view class="benefits-section">
            <view 
              v-for="(benefit, index) in companyInfo.benefits" 
              :key="index"
              class="benefit-item"
            >
              <view class="benefit-icon">
                <image :src="config.staticBaseUrl + '/icons/' + benefit.icon + '.png'" style="width: 51rpx; height: 48rpx;"></image>
              </view>
              <text class="benefit-text">{{ benefit.text }}</text>
            </view>
          </view>

          <!-- 招聘职位列表区块 -->
          <view class="jobs-section">
            <text class="section-title">招聘职位</text>
            <view class="jobs-list">
              <view 
                v-for="(job, index) in companyInfo.jobs" 
                :key="index"
                class="job-item"
                :class="{ 'no-border': index === companyInfo.jobs.length - 1 }"
              >
                <view class="job-info">
                  <view class="job-title-row">
                    <text class="job-title">{{ job.title }}</text>
                    <text class="job-company">{{ job.company }}</text>
                  </view>
                  <view class="job-details-row">
                    <text class="job-salary">{{ job.salaryRange }}</text>
                    <text class="job-location">{{ job.location }}</text>
                    <text class="job-education">{{ job.educationRequirement }}</text>
                  </view>
                </view>
                <view class="job-action">
                  <uv-button 
                    text="快速投递"
                    type="primary"
                    size="small"
                    :customStyle="quickApplyButtonStyle"
                    @click="quickApply(job)"
                  ></uv-button>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { getEnterpriseDetail } from '@/api/modules/enterprise.js'
import config from '@/config/index.js'

export default {
  data() {
    return {
      navbarBgColor: 'transparent',
      navbarTextColor: '#333333',
      quickApplyButtonStyle: {
        backgroundColor: '#40A9FF',
        borderRadius: '15px',
        height: '30px',
        width: '80px',
        fontSize: '13px'
      },
      config,
      // 企业级数据管理
      loading: false,
      retryCount: 0,
      maxRetries: 3,
      cacheKey: '',
      cacheExpiry: 10 * 60 * 1000, // 10分钟缓存
      lastUpdateTime: 0,
      // 公司信息数据
      companyInfo: {
        name: 'XX科技公司',
        industry: '互联网 · 软件开发',
        scale: '500-999人',
        logo: '',
        about: {
          title: '关于XX科技',
          description: 'XX科技成立于2012年，是一家专注于人工智能、大数据分析与云计算服务的高新技术企业。我们致力于用科技赋能产业，推动数字化转型，服务全球客户。',
          highlights: [
            '核心业务：智慧零售、智慧物流、AI算法平台开发',
            '服务客户：已覆盖全球30多个国家，超过500家企业',
            '公司文化：创新、开放、高效、合作'
          ]
        },
        benefits: [
          { icon: 'wuxian', text: '五险一金' },
          { icon: 'tanxing', text: '弹性工作' },
          { icon: 'nian', text: '年终奖金' }
        ],
        jobs: [
          {
            title: '法务专员',
            company: 'XX科技',
            salary: '6k-9k',
            location: '上海',
            education: '本科及以上'
          },
          {
            title: '前端开发工程师',
            company: 'XX科技',
            salary: '12k-18k',
            location: '上海',
            education: '本科及以上'
          },
          {
            title: '产品经理',
            company: 'XX科技',
            salary: '15k-25k',
            location: '上海',
            education: '本科及以上'
          }
        ]
      }
    }
  },
  onLoad(options) {
    // 接收传递的公司ID参数
    if (options.id) {
      this.cacheKey = `company_detail_${options.id}`
      this.loadCompanyDetailWithCache(options.id)
    }
  },
  onPullDownRefresh() {
    // 下拉刷新时清除缓存并重新加载
    if (this.cacheKey) {
      uni.removeStorageSync(this.cacheKey)
      const companyId = this.cacheKey.replace('company_detail_', '')
      this.loadCompanyDetailWithCache(companyId)
    }
    setTimeout(() => {
      uni.stopPullDownRefresh()
    }, 1000)
  },
  methods: {
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
    
    // 企业级快速投递功能
    async quickApply(job) {
      try {
        // 显示确认对话框
        const result = await this.showConfirmDialog(`确认投递"${job.title}"职位吗？`)
        if (!result) return
        
        uni.showLoading({ title: '投递中...' })
        
        // 模拟投递API调用
        await this.simulateApiCall(1000)
        
        uni.hideLoading()
        uni.showToast({
          title: `已成功投递${job.title}职位`,
          icon: 'success'
        })
        
        // 记录投递历史到本地存储
        this.recordJobApplication(job)
        
      } catch (error) {
        console.error('职位投递失败:', error)
        uni.hideLoading()
        uni.showToast({
          title: '投递失败，请重试',
          icon: 'none'
        })
      }
    },
    
    // 智能缓存加载公司详情
    async loadCompanyDetailWithCache(companyId) {
      try {
        // 检查缓存
        const cachedData = this.getCachedData()
        if (cachedData && this.isCacheValid()) {
          console.log('使用缓存数据加载公司详情')
          this.companyInfo = cachedData
          return
        }
        
        // 缓存无效或不存在，从API加载
        await this.loadCompanyDetailFromApi(companyId)
        
      } catch (error) {
        console.error('加载公司详情失败:', error)
        // 尝试使用过期缓存作为降级方案
        const expiredCache = this.getExpiredCache()
        if (expiredCache) {
          console.log('使用过期缓存作为降级方案')
          this.companyInfo = expiredCache
          uni.showToast({
            title: '数据可能不是最新的',
            icon: 'none'
          })
        }
      }
    },
    
    // 从API加载公司详情（带重试机制）
    async loadCompanyDetailFromApi(companyId) {
      this.loading = true
      this.retryCount = 0
      
      while (this.retryCount < this.maxRetries) {
        try {
          if (this.retryCount === 0) {
            uni.showLoading({ title: '加载中...' })
          } else {
            uni.showLoading({ title: `重试中(${this.retryCount}/${this.maxRetries})...` })
          }
          
          const response = await this.callApiWithTimeout(companyId)
          
          if (response && response.enterprise) {
            const processedData = this.processCompanyData(response)
            this.companyInfo = processedData
            
            // 保存到缓存
            this.saveToCache(processedData)
            this.lastUpdateTime = Date.now()
            
            uni.hideLoading()
            this.loading = false
            return
          } else {
            throw new Error('API返回数据格式错误')
          }
          
        } catch (error) {
          this.retryCount++
          console.error(`获取企业详情失败 (尝试 ${this.retryCount}/${this.maxRetries}):`, error)
          
          if (this.retryCount < this.maxRetries) {
            // 指数退避重试策略
            const delay = Math.min(1000 * Math.pow(2, this.retryCount - 1), 8000) + Math.random() * 1000
            await this.delay(delay)
          } else {
            // 最终失败处理
            uni.hideLoading()
            this.loading = false
            this.handleApiError(error)
            throw error
          }
        }
      }
    },
    
    // 带超时的API调用
    async callApiWithTimeout(companyId, timeout = 10000) {
      return Promise.race([
        getEnterpriseDetail(companyId),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('请求超时')), timeout)
        )
      ])
    },
    
    // 处理公司数据
    processCompanyData(response) {
      const enterprise = response.enterprise
      const activeJobs = response.activeJobs || []
      
      return {
        name: this.validateString(enterprise.companyName, 'XX科技公司'),
        industry: this.validateString(enterprise.industry, '互联网 · 软件开发'),
        scale: this.validateString(enterprise.companySize, '500-999人'),
        logo: enterprise.logo || '',
        about: {
          title: '关于' + this.validateString(enterprise.companyName, 'XX科技'),
          description: this.validateString(enterprise.description, '企业简介暂无'),
          highlights: this.processHighlights(enterprise)
        },
        benefits: this.processBenefits(enterprise.benefits),
        jobs: this.processJobs(activeJobs, enterprise.companyName)
      }
    },
    
    // 处理企业亮点
    processHighlights(enterprise) {
      const highlights = []
      if (enterprise.businessScope) {
        highlights.push(`核心业务：${enterprise.businessScope}`)
      }
      if (enterprise.establishedYear) {
        highlights.push(`成立时间：${enterprise.establishedYear}年`)
      }
      if (enterprise.companySize) {
        highlights.push(`公司规模：${enterprise.companySize}`)
      }
      return highlights.length > 0 ? highlights : [
        '核心业务：智慧零售、智慧物流、AI算法平台开发',
        '服务客户：已覆盖全球30多个国家，超过500家企业',
        '公司文化：创新、开放、高效、合作'
      ]
    },
    
    // 处理福利待遇
    processBenefits(benefits) {
      if (!benefits || !Array.isArray(benefits) || benefits.length === 0) {
        return [
          { icon: 'wuxian', text: '五险一金' },
          { icon: 'tanxing', text: '弹性工作' },
          { icon: 'nian', text: '年终奖金' }
        ]
      }
      
      const icons = ['wuxian', 'tanxing', 'nian']
      return benefits.map((benefit, index) => ({
        icon: icons[index % icons.length],
        text: this.validateString(benefit, '福利待遇')
      }))
    },
    
    // 处理职位数据
    processJobs(activeJobs, companyName) {
      if (!activeJobs || !Array.isArray(activeJobs)) {
        return []
      }
      
      return activeJobs.map(job => ({
        id: job.id,
        title: this.validateString(job.jobTitle || job.title, '职位名称'),
        company: this.validateString(companyName, 'XX科技'),
        salary: this.validateString(job.salaryRange || job.salary, '面议'),
        location: this.validateString(job.workLocation || job.location, '工作地点'),
        education: this.validateString(job.educationRequirement || job.education, '学历要求')
      }))
    },
    
    // 缓存管理方法
    getCachedData() {
      try {
        const cached = uni.getStorageSync(this.cacheKey)
        return cached ? JSON.parse(cached) : null
      } catch (error) {
        console.error('读取缓存失败:', error)
        return null
      }
    },
    
    isCacheValid() {
      try {
        const cacheTime = uni.getStorageSync(`${this.cacheKey}_time`)
        if (!cacheTime) return false
        return (Date.now() - cacheTime) < this.cacheExpiry
      } catch (error) {
        return false
      }
    },
    
    getExpiredCache() {
      try {
        const cached = uni.getStorageSync(this.cacheKey)
        return cached ? JSON.parse(cached) : null
      } catch (error) {
        return null
      }
    },
    
    saveToCache(data) {
      try {
        uni.setStorageSync(this.cacheKey, JSON.stringify(data))
        uni.setStorageSync(`${this.cacheKey}_time`, Date.now())
      } catch (error) {
        console.error('保存缓存失败:', error)
      }
    },
    
    // 工具方法
    validateString(value, defaultValue) {
      return (typeof value === 'string' && value.trim()) ? value.trim() : defaultValue
    },
    
    async delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    },
    
    async simulateApiCall(delay) {
      return new Promise(resolve => setTimeout(resolve, delay))
    },
    
    async showConfirmDialog(message) {
      return new Promise((resolve) => {
        uni.showModal({
          title: '确认操作',
          content: message,
          success: (res) => resolve(res.confirm),
          fail: () => resolve(false)
        })
      })
    },
    
    recordJobApplication(job) {
      try {
        const applications = uni.getStorageSync('job_applications') || []
        applications.unshift({
          ...job,
          appliedAt: new Date().toISOString(),
          companyName: this.companyInfo.name
        })
        // 只保留最近50条记录
        if (applications.length > 50) {
          applications.splice(50)
        }
        uni.setStorageSync('job_applications', applications)
      } catch (error) {
        console.error('记录投递历史失败:', error)
      }
    },
    
    handleApiError(error) {
      let message = '获取企业信息失败'
      
      if (error.message) {
        if (error.message.includes('timeout') || error.message.includes('超时')) {
          message = '网络请求超时，请检查网络连接'
        } else if (error.message.includes('Network Error') || error.message.includes('网络错误')) {
          message = '网络连接异常，请检查网络设置'
        } else if (error.message.includes('404')) {
          message = '企业信息不存在'
        } else if (error.message.includes('500')) {
          message = '服务器内部错误，请稍后重试'
        }
      }
      
      uni.showToast({
        title: message,
        icon: 'none',
        duration: 3000
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.company-detail-container {
  min-height: 100vh;
  
}

.scroll-container {
  height: calc(100vh - 44px);
  // background-color: #F0F7FF;
}

.page-content {
  padding-bottom: 20px;
}

/* 公司基本信息区块样式 */
.company-basic-info {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  // background-color: #F0F7FF;
  
  .company-logo {
    margin-right: 15px;
    
    .logo-placeholder {
      width: 60px;
      height: 60px;
      border-radius: 30px;
      background-color: #D9D9D9;
    }
  }
  
  .company-details {
    flex: 1;
    
    .company-name {
      font-size: 18px;
      font-weight: bold;
      color: #333333;
      display: block;
      margin-bottom: 8px;
    }
    
    .company-tags {
      display: flex;
      align-items: center;
      
      .industry-tag {
        font-size: 12px;
        color: #666666;
        margin-right: 10px;
        background-color: #fbffff;
      }
      
      .scale-tag {
        background-color: #fbffff;
        border-radius: 3px;
        display: inline-block; // 使用inline-block让元素宽高包裹内容
        
        .scale-text {
          font-size: 12px;
          color: #666666;
          padding: 2px 8px; // 通过padding控制文字周围的间距
          display: block; // 确保文字能够正确撑开容器
        }
      }
    }
  }
}

/* 白色卡片容器样式 */
.content-card {
  // background-color: #FFFFFF;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  padding: 0 20px;
  margin-top: 10px;
}

/* 公司简介区块样式 */
.company-intro {
  padding-top: 20rpx;
  padding-bottom: 25rpx;
  
  .section-title {
    font-size: 16px;
    font-weight: bold;
    color: #333333;
    display: block;
    margin-bottom: 15px;
  }
  
  .subsection-title {
    font-size: 14px;
    color: #666666;
    display: block;
    margin-bottom: 10px;
  }
  
  .intro-description {
    font-size: 13px;
    line-height: 1.6;
    color: #333333;
    display: block;
    margin-bottom: 15px;
  }
  
  .intro-highlights {
    .highlight-item {
      display: flex;
      margin-bottom: 8px;
      
      .bullet-point {
        font-size: 13px;
        color: #333333;
        margin-right: 5px;
      }
      
      .highlight-text {
        font-size: 13px;
        color: #333333;
        flex: 1;
      }
    }
  }
}

/* 福利待遇区块样式 */
.benefits-section {
  padding: 20px 0;
  overflow-x: auto;
  white-space: nowrap;
  // border-bottom: 1px solid #F0F0F0;
  
  .benefit-item {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    width: calc(100% / 3);
    min-width: calc(100% / 3);
    flex-shrink: 0;
    
    .benefit-icon {
      margin-bottom: 8px;
    }
    
    .benefit-text {
      font-size: 12px;
      color: #666666;
      text-align: center;
      white-space: normal;
    }
  }
}

/* 招聘职位列表区块样式 */
.jobs-section {
  padding-top: 5px;
  
  .section-title {
    font-size: 16px;
    font-weight: bold;
    color: #333333;
    display: block;
    margin-bottom: 20px;
  }
  
  .jobs-list {
    .job-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 15px;
      margin: 10px 0;
      border-radius: 8px;
      background-color: #FFFFFF;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      
      &.no-border {
        // 移除no-border类的样式，因为不再需要分割线
      }
      
      .job-info {
        flex: 1;
        
        .job-title-row {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
          
          .job-title {
            font-size: 15px;
            font-weight: bold;
            color: #333333;
            margin-right: 10px;
          }
          
          .job-company {
            font-size: 14px;
            color: #666666;
          }
        }
        
        .job-details-row {
          display: flex;
          align-items: center;
          gap: 25rpx;
          .job-salary {
            font-size: 13px;
            // color: #FA541C;
            margin-right: 15px;
          }
          
          .job-location {
            font-size: 12px;
            color: #888888;
            margin-right: 15px;
          }
          
          .job-education {
            font-size: 12px;
            color: #888888;
          }
        }
      }
      
      .job-action {
        margin-left: 15px;
      }
    }
  }
}
</style>