<template>
  <view class="legal-help-page" :style="pageStyle">
    <!-- 状态栏占位 -->
    <view class="status-bar"></view>

    <!-- 页眉Banner区域 -->
    <view class="page-header">
      <view class="header-content">
        <text class="main-title">获取法律帮助</text>
        <text class="sub-title">一站式解决您的法律问题</text>
      </view>
      <!-- 律师插画 -->
      <view class="lawyer-illustration">
        <!-- 这里将放置律师插画 -->
      </view>
    </view>

    <!-- 主内容区域 -->
    <view class="content-background">
      <!-- 功能入口卡片 -->
      <view class="main-options-card">
        <view class="option-item" @click="handleDocumentDownload">
          <uv-icon name="file-text" color="#3A7AF0" size="60"></uv-icon>
          <view class="option-text">
            <text class="option-title">法律文书下载</text>
            <text class="option-desc">提供法律文书模版</text>
          </view>
        </view>
        <view class="option-item" @click="handleLawyerRecommend">
          <image :src="lawyerIconPath" style="width: 60rpx; height: 60rpx;"></image>
          <view class="option-text">
            <text class="option-title">推荐律师</text>
            <text class="option-desc">专业律师推荐</text>
          </view>
        </view>
      </view>

      <!-- 法律文书下载卡片 -->
      <view class="content-card">
        <view class="card-title">法律文书下载</view>
        <view class="card-subtitle">常用合同、协议模版免费下载</view>
        <view class="document-grid">
          <view v-for="(doc, index) in documentList" :key="index" class="document-item"
            @click="handleDocumentClick(doc)">
            <uv-icon name="file-text" color="#AAAAAA" size="35"></uv-icon>
            <text class="document-name">{{ doc.name }}</text>
          </view>
        </view>
      </view>

      <!-- 推荐律师卡片 -->
      <view class="content-card">
        <view class="card-title" @click="handleLawyerRecommend">推荐律师</view>
        <view class="card-subtitle" @click="handleLawyerRecommend">精选经验丰富律师，快速响应您的需求</view>
        <uv-scroll-list :indicator="false">
          <view v-for="(lawyer, index) in lawyerList" :key="index" class="lawyer-item">
            <view class="lawyer-avatar"></view>
            <view class="lawyer-info">
              <text class="lawyer-name">{{ lawyer.name }}</text>
              <text class="lawyer-specialty">{{ lawyer.specialty }}</text>
            </view>
            <view class="lawyer-footer">
              <text class="lawyer-price">{{ lawyer.price }}</text>
              <view class="consult-btn" @click="handleConsult(lawyer)">
                <text class="consult-text">立即咨询</text>
              </view>
            </view>
          </view>
        </uv-scroll-list>
      </view>

      <!-- 法律知识科普卡片 -->
      <view class="content-card">
        <view class="card-title">法律知识科普</view>
        <view class="card-subtitle">常见法律问题一读即懂，保护自己的第一步从了解权利开始。</view>
        <view class="knowledge-list">
          <view v-for="(item, index) in knowledgeList" :key="index" class="knowledge-item">
            <view class="question-row">
              <view class="question-icon">?</view>
              <text class="question-text">{{ item.question }}</text>
            </view>
            <text class="answer-text">{{ item.answer }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部导航栏 -->
    <user-tabbar></user-tabbar>
  </view>
</template>

<script>
import UserTabbar from '@/components/tabbar/user-tabbar/user-tabbar.vue'
import config from '@/config/index.js'
import { getLegalHomeData, getLegalConsultationLawyers, downloadLegalDocument } from '@/api/modules/legal.js'

export default {
  name: 'LegalHelpPage',
  components: {
    UserTabbar
  },
  data() {
    return {
      config: config,
      // 图片路径
      lawyerIconPath: config.staticBaseUrl + '/icons/lvshi.png',
      backgroundImagePath: config.staticBaseUrl + '/lvshi_bg2.png',
      
      // 法律文书列表
      documentList: [
        { id: 1, name: '劳动合同模板', category: 'labor', downloadUrl: '' },
        { id: 2, name: '租房合同模板', category: 'rental', downloadUrl: '' },
        { id: 3, name: '借款协议模板', category: 'loan', downloadUrl: '' },
        { id: 4, name: '购销合同模板', category: 'purchase', downloadUrl: '' },
        { id: 5, name: '代理协议模板', category: 'agency', downloadUrl: '' },
        { id: 6, name: '保密协议模板', category: 'confidentiality', downloadUrl: '' }
      ],
      
      // 推荐律师列表
      lawyerList: [],
      
      // 法律知识科普
      knowledgeList: [
        {
          question: '劳动合同到期后公司不续签，有补偿吗？',
          answer: '根据《劳动合同法》规定，劳动合同到期终止的，用人单位应当向劳动者支付经济补偿。'
        },
        {
          question: '工伤认定的时效是多长时间？',
          answer: '职工发生事故伤害或者被诊断、鉴定为职业病，所在单位应当自事故伤害发生之日或者被诊断、鉴定为职业病之日起30日内申请工伤认定。'
        },
        {
          question: '买房定金和订金有什么区别？',
          answer: '定金具有法律约束力，买方违约定金不退，卖方违约双倍返还；订金不具有担保性质，可以退还。'
        }
      ],
      
      // 加载状态
      loading: {
        homeData: false,
        lawyers: false,
        downloading: false
      },
      
      // 缓存管理
      cache: {
        homeData: null,
        homeDataExpiry: 0,
        lawyers: null,
        lawyersExpiry: 0
      },
      
      // 重试配置
      retryConfig: {
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 8000
      }
    }
  },
  computed: {
    pageStyle() {
      return {
        backgroundImage: `url('${this.backgroundImagePath}')`
      }
    }
  },
  onLoad() {
    // 页面加载时获取法律帮助主页数据
    this.loadPageData()
  },
  onPullDownRefresh() {
    // 下拉刷新时清除缓存
    this.clearCache()
    this.loadPageData().finally(() => {
      uni.stopPullDownRefresh()
    })
  },
  methods: {
    /**
     * 加载页面数据 - 企业级并行加载策略
     */
    async loadPageData() {
      try {
        // 显示加载状态
        this.loading.homeData = true
        this.loading.lawyers = true
        
        // 并行加载主页数据和律师列表，使用智能缓存
        const [homePageResult, lawyersResult] = await Promise.allSettled([
          this.loadLegalHelpHomeWithCache(),
          this.loadLawyerListWithCache()
        ])
        
        // 处理主页数据结果
        if (homePageResult.status === 'fulfilled') {
          console.log('✅ 法律帮助主页数据加载成功')
        } else {
          console.error('❌ 获取法律帮助主页数据失败：', homePageResult.reason)
          this.handleApiError('法律帮助主页数据', homePageResult.reason)
        }
        
        // 处理律师列表结果
        if (lawyersResult.status === 'fulfilled') {
          console.log('✅ 律师列表数据加载成功')
        } else {
          console.error('❌ 获取律师列表失败：', lawyersResult.reason)
          this.handleApiError('律师列表', lawyersResult.reason)
        }
      } catch (error) {
        console.error('❌ 加载页面数据失败：', error)
        this.handleApiError('页面数据', error)
      } finally {
        // 隐藏加载状态
        this.loading.homeData = false
        this.loading.lawyers = false
      }
    },

    /**
     * 智能缓存加载法律帮助主页数据
     */
    async loadLegalHelpHomeWithCache() {
      const now = Date.now()
      const cacheKey = 'homeData'
      
      // 检查缓存是否有效（10分钟有效期）
      if (this.cache[cacheKey] && now < this.cache[`${cacheKey}Expiry`]) {
        console.log('📦 使用缓存的法律帮助主页数据')
        this.applyHomeData(this.cache[cacheKey])
        return this.cache[cacheKey]
      }
      
      try {
        // 从API获取法律帮助主页数据
        const response = await this.callApiWithRetry(() => getLegalHomeData())
        console.log('🌐 从API获取法律帮助主页数据成功')
        
        // 处理和应用数据
        const homeData = this.processHomeData(response)
        this.applyHomeData(homeData)
        
        // 缓存数据（10分钟过期）
        this.cache[cacheKey] = homeData
        this.cache[`${cacheKey}Expiry`] = now + 10 * 60 * 1000
        
        return homeData
      } catch (error) {
        // API失败时尝试使用过期缓存
        if (this.cache[cacheKey]) {
          console.log('🔄 API失败，使用过期缓存作为降级方案')
          this.applyHomeData(this.cache[cacheKey])
          uni.showToast({
            title: '数据可能不是最新的',
            icon: 'none'
          })
          return this.cache[cacheKey]
        }
        throw error
      }
    },

    /**
     * 智能缓存加载律师列表
     */
    async loadLawyerListWithCache() {
      const now = Date.now()
      const cacheKey = 'lawyers'
      
      // 检查缓存是否有效（15分钟有效期）
      if (this.cache[cacheKey] && now < this.cache[`${cacheKey}Expiry`]) {
        console.log('📦 使用缓存的律师列表数据')
        this.lawyerList = this.cache[cacheKey]
        return this.cache[cacheKey]
      }
      
      try {
        // 从API获取律师列表（推荐前5名）
        const response = await this.callApiWithRetry(() => 
          getLegalConsultationLawyers({ 
            page: 1, 
            pageSize: 5,
            sortBy: 'rating' // 按评分排序
          })
        )
        console.log('🌐 从API获取律师列表成功')
        
        // 处理律师数据
        const lawyerData = this.processLawyerData(response)
        this.lawyerList = lawyerData
        
        // 缓存数据（15分钟过期）
        this.cache[cacheKey] = lawyerData
        this.cache[`${cacheKey}Expiry`] = now + 15 * 60 * 1000
        
        return lawyerData
      } catch (error) {
        // API失败时尝试使用过期缓存
        if (this.cache[cacheKey]) {
          console.log('🔄 API失败，使用过期缓存作为降级方案')
          this.lawyerList = this.cache[cacheKey]
          uni.showToast({
            title: '律师信息可能不是最新的',
            icon: 'none'
          })
          return this.cache[cacheKey]
        }
        throw error
      }
    },

    /**
     * 处理法律帮助主页数据
     */
    processHomeData(response) {
      const data = response.data || response
      return {
        documents: data.documents || this.documentList,
        knowledge: data.knowledge || this.knowledgeList,
        banners: data.banners || [],
        statistics: data.statistics || {}
      }
    },

    /**
     * 应用法律帮助主页数据
     */
    applyHomeData(homeData) {
      if (homeData.documents && Array.isArray(homeData.documents)) {
        this.documentList = homeData.documents
      }
      if (homeData.knowledge && Array.isArray(homeData.knowledge)) {
        this.knowledgeList = homeData.knowledge
      }
    },

    /**
     * 处理律师数据
     */
    processLawyerData(response) {
      const data = response.data || response
      const lawyers = data.list || data.records || data || []
      
      return lawyers.map(lawyer => ({
        id: lawyer.id,
        name: lawyer.name || lawyer.lawyerName || '律师',
        avatar: lawyer.avatar || lawyer.headImg || '',
        specialty: this.formatSpecialties(lawyer.specialties) || lawyer.specialty || '法律咨询',
        price: this.formatPrice(lawyer.voiceFee || lawyer.consultationPrice || lawyer.price || 0),
        rating: lawyer.rating || lawyer.score || 0,
        experience: lawyer.experienceYears || lawyer.practiceYears || 0,
        isOnline: Boolean(lawyer.isOnline || lawyer.onlineStatus)
      }))
    },

    /**
     * 智能重试API调用
     */
    async callApiWithRetry(apiCall, maxRetries = 3) {
      let retryCount = 0
      while (retryCount < maxRetries) {
        try {
          const response = await this.callApiWithTimeout(apiCall)
          return response
        } catch (error) {
          retryCount++
          if (retryCount >= maxRetries) {
            throw error
          }
          // 指数退避 + 随机抖动
          const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 8000) + Math.random() * 1000
          await this.delay(delay)
        }
      }
    },

    /**
     * 带超时的API调用
     */
    async callApiWithTimeout(apiCall, timeout = 10000) {
      return Promise.race([
        apiCall(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('请求超时')), timeout)
        )
      ])
    },

    /**
     * 处理文档下载
     */
    async handleDocumentDownload() {
      try {
        uni.showActionSheet({
          itemList: this.documentList.map(doc => doc.name),
          success: async (res) => {
            const selectedDoc = this.documentList[res.tapIndex]
            await this.downloadDocument(selectedDoc)
          }
        })
      } catch (error) {
        console.error('文档下载操作失败:', error)
        uni.showToast({
          title: '操作失败',
          icon: 'none'
        })
      }
    },

    /**
     * 下载具体文档
     */
    async downloadDocument(document) {
      if (this.loading.downloading) {
        uni.showToast({
          title: '正在下载中，请稍候',
          icon: 'none'
        })
        return
      }

      this.loading.downloading = true
      
      try {
        uni.showLoading({ title: '下载中...' })
        
        // 尝试多种下载方案
        let downloadSuccess = false
        
        // 方案1: 通过API下载
        try {
          const response = await this.callApiWithRetry(() => downloadLegalDocument(document.id))
          if (response && response.downloadUrl) {
            downloadSuccess = await this.downloadFromUrl(response.downloadUrl, document.name)
          }
        } catch (apiError) {
          console.log('API下载失败，尝试备用方案')
        }
        
        // 方案2: 预定义的下载链接
        if (!downloadSuccess && document.downloadUrl) {
          downloadSuccess = await this.downloadFromUrl(document.downloadUrl, document.name)
        }
        
        // 方案3: 使用默认文档链接
        if (!downloadSuccess) {
          const defaultUrl = `${config.apiBaseUrl}/templates/${document.category}.docx`
          downloadSuccess = await this.downloadFromUrl(defaultUrl, document.name)
        }
        
        if (downloadSuccess) {
          uni.showToast({
            title: '下载成功',
            icon: 'success'
          })
        } else {
          throw new Error('所有下载方案都失败了')
        }
      } catch (error) {
        console.error('文档下载失败:', error)
        this.handleDownloadError(error, document)
      } finally {
        uni.hideLoading()
        this.loading.downloading = false
      }
    },

    /**
     * 从URL下载文件
     */
    async downloadFromUrl(url, fileName) {
      return new Promise((resolve, reject) => {
        const downloadTask = uni.downloadFile({
          url: url,
          success: (res) => {
            if (res.statusCode === 200) {
              // 保存到本地
              uni.saveFile({
                tempFilePath: res.tempFilePath,
                success: (saveRes) => {
                  console.log('文件保存成功:', saveRes.savedFilePath)
                  resolve(true)
                },
                fail: (saveError) => {
                  console.error('文件保存失败:', saveError)
                  resolve(false)
                }
              })
            } else {
              resolve(false)
            }
          },
          fail: (error) => {
            console.error('下载失败:', error)
            resolve(false)
          }
        })
        
        // 监听下载进度
        downloadTask.onProgressUpdate((res) => {
          console.log('下载进度:', res.progress + '%')
        })
      })
    },

    /**
     * 处理文档点击
     */
    async handleDocumentClick(document) {
      uni.showActionSheet({
        itemList: ['下载文档', '查看详情'],
        success: async (res) => {
          if (res.tapIndex === 0) {
            await this.downloadDocument(document)
          } else if (res.tapIndex === 1) {
            // 查看文档详情
            uni.showModal({
              title: document.name,
              content: `文档类型：${document.category}\n适用场景：法律文书模板\n格式：Word文档`,
              showCancel: false
            })
          }
        }
      })
    },

    /**
     * 处理律师推荐
     */
    handleLawyerRecommend() {
      // 跳转到咨询页面
      uni.navigateTo({
        url: '/pages/user/index/consultation/index'
      })
    },

    /**
     * 处理律师咨询
     */
    handleConsult(lawyer) {
      // 跳转到律师详情页面
      uni.navigateTo({
        url: `/pages/user/index/lawyer-detail/index?lawyerId=${lawyer.id}`
      })
    },

    /**
     * 格式化专业特长
     */
    formatSpecialties(specialties) {
      if (!specialties) {
        return ''
      }
      if (Array.isArray(specialties)) {
        // 取前3个专业特长，用中文顿号分隔
        return specialties.slice(0, 3).join('、')
      }
      return String(specialties)
    },

    /**
     * 格式化价格
     */
    formatPrice(price) {
      if (!price || price === 0) {
        return '免费咨询'
      }
      return `¥${price}/次`
    },

    /**
     * 清除缓存
     */
    clearCache() {
      this.cache = {
        homeData: null,
        homeDataExpiry: 0,
        lawyers: null,
        lawyersExpiry: 0
      }
    },

    /**
     * 延迟函数
     */
    delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    },

    /**
     * 处理API错误
     */
    handleApiError(context, error) {
      console.error(`${context}失败:`, error)
      let message = `获取${context}失败`
      
      if (error.message) {
        if (error.message.includes('timeout') || error.message.includes('超时')) {
          message = '网络超时，请检查网络连接'
        } else if (error.message.includes('Network Error') || error.message.includes('网络错误')) {
          message = '网络连接失败，请检查网络'
        } else if (error.code === 401 || error.statusCode === 401) {
          message = '登录已过期，请重新登录'
        } else if (error.code === 403 || error.statusCode === 403) {
          message = '权限不足'
        } else if (error.code >= 500 || error.statusCode >= 500) {
          message = '服务器错误，请稍后重试'
        }
      }
      
      // 不显示错误提示，使用降级方案
      console.log(`${context}使用降级方案`)
    },

    /**
     * 处理下载错误
     */
    handleDownloadError(error, document) {
      let message = '下载失败'
      
      if (error.message) {
        if (error.message.includes('timeout') || error.message.includes('超时')) {
          message = '下载超时，请重试'
        } else if (error.message.includes('Network Error') || error.message.includes('网络错误')) {
          message = '网络连接失败，请检查网络'
        } else if (error.message.includes('space') || error.message.includes('存储')) {
          message = '存储空间不足'
        } else if (error.code === 404 || error.statusCode === 404) {
          message = '文档不存在'
        }
      }
      
      uni.showModal({
        title: '下载失败',
        content: message + '，是否重试？',
        success: (res) => {
          if (res.confirm) {
            this.downloadDocument(document)
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.legal-help-page {
  height: 100vh;
  overflow-y: auto;
  // background-color: #F0F2F8;
  background-size: cover;
  background-position: center -10px; // 向下偏移100px
  background-repeat: no-repeat;
  background-attachment: fixed;

  .status-bar {
    height: var(--status-bar-height);
    background: transparent;
  }

  .page-header {
    position: relative;
    padding: 20rpx 30rpx 60rpx;
    overflow: hidden;
    margin-top: 70rpx;

    .header-content {
      z-index: 10;
      position: relative;

      .main-title {
        color: #FFFFFF;
        font-size: 40rpx;
        font-weight: 600;
        display: block;
        margin-bottom: 16rpx;
      }

      .sub-title {
        color: #FFFFFF;
        font-size: 39rpx;
        font-weight: 400;
        display: block;
        letter-spacing: 5rpx;
      }
    }

    .lawyer-illustration {
      position: absolute;
      right: 30rpx;
      bottom: 0;
      width: 200rpx;
      height: 200rpx;
      // 这里将添加律师插画背景
    }
  }

  .content-background {
    // background-color: #F0F2F8;
    border-top-left-radius: 40rpx;
    border-top-right-radius: 40rpx;
    margin-top: -40rpx;
    position: relative;
    z-index: 2;
    padding: 30rpx 30rpx 100rpx;
  }

  .main-options-card {
    background: #FFFFFF;
    border-radius: 30rpx;
    padding: 40rpx;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
    margin-bottom: 30rpx;
    display: flex;
    justify-content: space-between;

    .option-item {
      display: flex;
      align-items: center;
      flex: 1;

      &:first-child {
        margin-right: 20rpx;
      }

      .option-text {
        margin-left: 20rpx;

        .option-title {
          color: #333333;
          font-size: 32rpx;
          font-weight: 600;
          display: block;
          margin-bottom: 8rpx;
        }

        .option-desc {
          color: #888888;
          font-size: 24rpx;
          display: block;
        }
      }
    }
  }

  .content-card {
    background: #FFFFFF;
    border-radius: 30rpx;
    padding: 40rpx;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
    margin-bottom: 30rpx;

    .card-title {
      color: #333333;
      font-size: 34rpx;
      font-weight: 600;
      margin-bottom: 12rpx;
    }

    .card-subtitle {
      color: #888888;
      font-size: 26rpx;
      margin-bottom: 30rpx;
    }

    .document-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20rpx;

      .document-item {
        display: flex;
        align-items: center;
        padding: 12rpx 0;

        .document-name {
          color: #3A7AF0;
          font-size: 28rpx;
          margin-left: 12rpx;
          text-decoration: underline;
        }
      }
    }

    .lawyer-item {
      display: grid;
      grid-template-columns: 96rpx 1fr;
      grid-template-rows: auto auto;
      gap: 8rpx 16rpx;
      width: 270rpx !important;   // 使用 !important 强制覆盖
      min-width: 270rpx !important;
      margin-right: 20rpx;

      .lawyer-avatar {
        width: 96rpx;
        height: 96rpx;
        border-radius: 50%;
        background-color: #E0E0E0;
        grid-row: 1 / 2;
        grid-column: 1 / 2;
      }

      .lawyer-info {
        display: flex;
        flex-direction: column;
        grid-row: 1 / 2;
        grid-column: 2 / 3;

        .lawyer-name {
          color: #333333;
          font-size: 30rpx;
          font-weight: 500;
          margin-bottom: 8rpx;
        }

        .lawyer-specialty {
          color: #888888;
          font-size: 24rpx;
        }
      }

      .lawyer-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        grid-row: 2 / 3;
        grid-column: 1 / 3;
        margin-top: 8rpx;

        .lawyer-price {
          color: #333333;
          font-size: 24rpx;
          flex-shrink: 0;
        }

        .consult-btn {
          background-color: #3A7AF0;
          border-radius: 30rpx;
          padding: 3rpx 16rpx;
          flex-shrink: 0;
          display: flex;
          align-items: center;

          .consult-text {
            color: #FFFFFF;
            font-size: 24rpx;
          }
        }
      }
    }

    .knowledge-list {
      .knowledge-item {
        margin-bottom: 30rpx;

        &:last-child {
          margin-bottom: 0;
        }

        .question-row {
          display: flex;
          align-items: center;
          margin-bottom: 16rpx;

          .question-icon {
            width: 32rpx;
            height: 32rpx;
            border-radius: 50%;
            background-color: #666666;
            color: #FFFFFF;
            font-size: 20rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 16rpx;
          }

          .question-text {
            color: #333333;
            font-size: 30rpx;
            font-weight: 600;
            flex: 1;
          }
        }

        .answer-text {
          color: #666666;
          font-size: 26rpx;
          line-height: 1.5;
          margin-left: 48rpx;
        }
      }
    }
  }
}
</style>