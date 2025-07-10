<template>
  <view class="arbitration-review" :style="backgroundStyle">
    <!-- 状态栏占位 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
    
    <!-- 自定义导航栏 -->
    <view class="navbar">
      <view class="navbar-content">
        <view class="back-btn" @click="goBack">
          <uv-icon name="arrow-left" color="#409EFF" size="32"></uv-icon>
          <text class="back-text">返回</text>
        </view>
      </view>
    </view>
    
    <!-- 主内容区域 -->
    <scroll-view class="main-content" scroll-y="true" :style="{ height: scrollViewHeight + 'px' }">
      <!-- 申请书卡片 -->
      <view class="application-card">
        <!-- 卡片头部 -->
        <view class="card-header">
          <view class="title-section">
            <text class="main-title">{{ arbitrationApplication.title }}</text>
            <text class="date-time">{{ arbitrationApplication.createTime }}</text>
          </view>
          <view class="status-badge">
            <text class="status-text">{{ arbitrationApplication.status }}</text>
          </view>
        </view>
        
        <!-- 卡片内容 -->
        <view class="card-content">
          <!-- 引言段落 -->
          <view class="content-section">
            <text class="content-text">仲裁委员会：</text>
            <text class="content-text">申请人因与用人单位发生劳动争议，现依据《中华人民共和国劳动争议调解仲裁法》的有关规定，向贵委员会申请仲裁，请依法受理。</text>
          </view>
          
          <!-- 一、申请人基本信息 -->
          <view class="content-section">
            <text class="section-title">一、申请人基本信息</text>
            <view class="info-list">
              <text class="info-item">姓名： {{ arbitrationApplication.applicant.name }}</text>
              <text class="info-item">性别： {{ arbitrationApplication.applicant.gender }}</text>
              <text class="info-item">出生日期： {{ arbitrationApplication.applicant.birthDate }}</text>
              <text class="info-item">身份证号： {{ arbitrationApplication.applicant.idCard }}</text>
              <text class="info-item">联系电话： {{ arbitrationApplication.applicant.phone }}</text>
              <text class="info-item">联系地址： {{ arbitrationApplication.applicant.address }}</text>
            </view>
          </view>
          
          <!-- 二、被申请人基本信息 -->
          <view class="content-section">
            <text class="section-title">二、被申请人基本信息</text>
            <view class="info-list">
              <text class="info-item">单位名称： {{ arbitrationApplication.respondent.companyName }}</text>
              <text class="info-item">法定代表人： {{ arbitrationApplication.respondent.legalRepresentative }}</text>
              <text class="info-item">单位地址： {{ arbitrationApplication.respondent.address }}</text>
              <text class="info-item">联系电话： {{ arbitrationApplication.respondent.phone }}</text>
            </view>
          </view>
          
          <!-- 三、仲裁请求 -->
          <view class="content-section">
            <text class="section-title">三、仲裁请求</text>
            <view class="request-list">
              <text
                v-for="(request, index) in arbitrationApplication.requests"
                :key="index"
                class="request-item"
              >
                {{ index + 1 }}. {{ request }}
              </text>
            </view>
          </view>
          
          <!-- 四、事实与理由 -->
          <view class="content-section">
            <text class="section-title">四、事实与理由</text>
            <text class="content-text">{{ arbitrationApplication.factsAndReasons }}</text>
          </view>
          
          <!-- 落款 -->
          <view class="signature-section">
            <text class="signature-text">此致</text>
            <text class="signature-text signature-center">南京市劳动争议仲裁委员会</text>
            <text class="signature-text signature-right">申请人： {{ arbitrationApplication.applicant.name }}</text>
            <text class="signature-text signature-right">{{ arbitrationApplication.createTime.split(' ')[0] }}</text>
          </view>
        </view>
      </view>
      
      <!-- 附件材料区域 -->
      <view
        v-for="(attachment, index) in arbitrationApplication.attachments"
        :key="index"
        class="attachment-card"
      >
        <view class="attachment-content">
                            <uv-icon :name="staticBaseUrl + '/icons/' + (attachment.icon || 'cailiao.png')" color="#409EFF" size="66"></uv-icon>
          <text class="attachment-name">{{ attachment.name }}</text>
          <text v-if="attachment.size" class="attachment-size">{{ attachment.size }}</text>
        </view>
      </view>
      
      <!-- 加载状态 -->
      <view v-if="loading" class="loading-overlay">
        <view class="loading-content">
          <uv-loading-icon mode="circle" color="#409EFF" size="40"></uv-loading-icon>
          <text class="loading-text">处理中...</text>
        </view>
      </view>

      <!-- 操作按钮区域 -->
      <view class="action-buttons">
        <uv-button
          type="primary"
          shape="circle"
          size="large"
          :disabled="loading || arbitrationApplication.status !== '待审核'"
          :customStyle="loading || arbitrationApplication.status !== '待审核' ?
            'background: #CCCCCC; border: none; width: 85%;' :
            'background: #409EFF; border: none; width: 85%;'"
          @click="handleApprove"
        >
          {{ loading ? '处理中...' : '确认通过' }}
        </uv-button>
        <uv-button
          type="error"
          shape="circle"
          size="large"
          :disabled="loading || arbitrationApplication.status !== '待审核'"
          :customStyle="loading || arbitrationApplication.status !== '待审核' ?
            'background: #CCCCCC; border: none; width: 70%;' :
            'background: #FF7F7F; border: none; width: 70%;'"
          @click="handleReject"
        >
          {{ loading ? '处理中...' : '驳回' }}
        </uv-button>
      </view>
    </scroll-view>
    
    <!-- 律师底部导航栏 -->
    <lawyer-tabbar></lawyer-tabbar>
  </view>
</template>

<script>
import LawyerTabbar from '@/components/tabbar/lawyer-tabbar/lawyer-tabbar.vue'
import { staticBaseUrl } from '@/config/index.js'
import { getDocumentDetail, submitDocumentReview } from '@/api/modules/lawyer-workspace.js'

export default {
  name: 'ArbitrationReview',
  components: {
    LawyerTabbar
  },
  data() {
    return {
      staticBaseUrl,
      statusBarHeight: 0,
      scrollViewHeight: 0,
      loading: false,
      documentId: '',
      arbitrationApplication: {
        id: '',
        title: '劳动仲裁申请书',
        createTime: '2025年5月6日 14:33',
        status: '待审核',
        applicant: {
          name: '张三',
          gender: '男',
          birthDate: '1995年6月1日',
          idCard: '32010119950601XXXX',
          phone: '138XXXXXXXXX',
          address: '江苏省南京市玄武区××小区×号楼'
        },
        respondent: {
          companyName: '南京某科技有限公司',
          legalRepresentative: '李四',
          address: '江苏省南京市雨花台区××路×号',
          phone: '025-8XXXXXXXX'
        },
        requests: [
          '请求被申请人支付2024年11月至2025年1月的工资共计人民币15,000元；',
          '请求被申请人支付经济补偿金人民币5,000元；',
          '请求被申请人出具解除劳动关系证明；',
          '请求仲裁费用由被申请人承担。'
        ],
        factsAndReasons: '申请人自2022年5月入职被申请人单位，担任软件工程师一职，双方签订了为期三年的劳动合同。但自2024年11月起，被申请人以经营困难为由拖欠申请人工资。2025年1月20日，被申请人未经协商，单方面以口头方式解除了与申请人的劳动合同，并拒绝出具解除证明及支付相应补偿金。申请人多次与单位协商无果，现依法提起劳动仲裁，望依法维护申请人合法权益。',
        attachments: [
          {
            name: '证据材料.pdf',
            size: '2.5MB',
            icon: 'cailiao.png'
          }
        ]
      }
    }
  },
  onLoad(options) {
    this.getSystemInfo()
    // 获取文档ID参数
    if (options && options.documentId) {
      this.documentId = options.documentId
      this.loadArbitrationDetail()
    } else {
      // 如果没有传入documentId，使用默认数据进行演示
      console.log('未传入documentId，使用默认数据')
    }
  },
  methods: {
    // 获取系统信息
    getSystemInfo() {
      const systemInfo = uni.getSystemInfoSync()
      this.statusBarHeight = systemInfo.statusBarHeight || 20
      // 计算滚动视图高度：屏幕高度 - 状态栏高度 - 导航栏高度 - 底部导航栏高度
      this.scrollViewHeight = systemInfo.screenHeight - this.statusBarHeight - 44 - 100
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack()
    },

    // 加载仲裁申请书详情（企业级API集成）
    async loadArbitrationDetail() {
      if (!this.documentId) {
        console.log('文档ID为空，跳过API调用')
        return
      }

      this.loading = true
      let retryCount = 0
      const maxRetries = 3

      const attemptLoad = async () => {
        try {
          console.log(`正在加载仲裁申请书详情，文档ID: ${this.documentId}`)
          
          const response = await getDocumentDetail(this.documentId)
          
          if (response && response.data) {
            // 格式化API数据到本地数据结构
            this.formatApplicationData(response.data)
            console.log('仲裁申请书详情加载成功')
          } else {
            throw new Error('API返回数据格式错误')
          }
        } catch (error) {
          console.error(`加载仲裁申请书详情失败 (尝试 ${retryCount + 1}/${maxRetries}):`, error)
          
          if (retryCount < maxRetries - 1) {
            retryCount++
            // 指数退避重试机制（1000ms, 2000ms, 4000ms）+ 随机抖动
            const baseDelay = 1000 * Math.pow(2, retryCount - 1)
            const jitter = Math.random() * 500 // 0-500ms随机抖动
            const delay = baseDelay + jitter
            
            console.log(`${delay.toFixed(0)}ms后进行第${retryCount + 1}次重试`)
            setTimeout(attemptLoad, delay)
            return
          }
          
          // 所有重试失败后的错误处理
          this.handleLoadError(error)
        } finally {
          if (retryCount >= maxRetries - 1) {
            this.loading = false
          }
        }
      }

      await attemptLoad()
    },

    // 格式化API数据到本地数据结构
    formatApplicationData(apiData) {
      try {
        // 更新基本信息
        if (apiData.title) this.arbitrationApplication.title = apiData.title
        if (apiData.createTime) this.arbitrationApplication.createTime = this.formatDateTime(apiData.createTime)
        if (apiData.status) this.arbitrationApplication.status = this.formatStatus(apiData.status)
        
        // 更新申请人信息
        if (apiData.applicant) {
          Object.assign(this.arbitrationApplication.applicant, apiData.applicant)
        }
        
        // 更新被申请人信息
        if (apiData.respondent) {
          Object.assign(this.arbitrationApplication.respondent, apiData.respondent)
        }
        
        // 更新仲裁请求
        if (apiData.requests && Array.isArray(apiData.requests)) {
          this.arbitrationApplication.requests = apiData.requests
        }
        
        // 更新事实与理由
        if (apiData.factsAndReasons) {
          this.arbitrationApplication.factsAndReasons = apiData.factsAndReasons
        }
        
        // 更新附件信息
        if (apiData.attachments && Array.isArray(apiData.attachments)) {
          this.arbitrationApplication.attachments = apiData.attachments
        }
        
        console.log('仲裁申请书数据格式化完成')
      } catch (error) {
        console.error('数据格式化失败:', error)
        uni.showToast({
          title: '数据处理失败',
          icon: 'none'
        })
      }
    },

    // 格式化状态显示
    formatStatus(status) {
      const statusMap = {
        'pending': '待审核',
        'approved': '已通过',
        'rejected': '已驳回',
        'reviewing': '审核中'
      }
      return statusMap[status] || status || '待审核'
    },

    // 格式化日期时间
    formatDateTime(dateTime) {
      if (!dateTime) return ''
      
      try {
        const date = new Date(dateTime)
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const day = date.getDate()
        const hours = date.getHours()
        const minutes = date.getMinutes()
        
        return `${year}年${month}月${day}日 ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
      } catch (error) {
        console.error('日期格式化失败:', error)
        return dateTime
      }
    },

    // 处理加载错误
    handleLoadError(error) {
      let errorMessage = '加载失败，请重试'
      
      // 错误分类处理
      if (error.message?.includes('网络')) {
        errorMessage = '网络连接失败，请检查网络'
      } else if (error.message?.includes('超时')) {
        errorMessage = '请求超时，请重试'
      } else if (error.message?.includes('权限')) {
        errorMessage = '权限不足，请重新登录'
      } else if (error.message?.includes('404')) {
        errorMessage = '文档不存在'
      } else if (error.message?.includes('500')) {
        errorMessage = '服务器错误，请稍后重试'
      }
      
      uni.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 3000
      })
      
      console.error('仲裁申请书加载最终失败:', error)
    },

    // 提交审核结果（企业级API集成）
    async submitReview(reviewResult, reviewComment = '') {
      if (!this.documentId) {
        uni.showToast({
          title: '文档ID缺失',
          icon: 'none'
        })
        return false
      }

      this.loading = true
      let retryCount = 0
      const maxRetries = 3

      const attemptSubmit = async () => {
        try {
          console.log(`正在提交审核结果: ${reviewResult}`)
          
          const reviewData = {
            documentId: this.documentId,
            reviewResult: reviewResult,
            reviewComment: reviewComment
          }
          
          const response = await submitDocumentReview(reviewData)
          
          if (response && response.success) {
            // 更新本地状态
            this.arbitrationApplication.status = reviewResult === 'approved' ? '已通过' : '已驳回'
            
            uni.showToast({
              title: reviewResult === 'approved' ? '审核通过' : '已驳回',
              icon: 'success'
            })
            
            console.log('审核结果提交成功')
            
            // 延迟返回上一页
            setTimeout(() => {
              uni.navigateBack()
            }, 1500)
            
            return true
          } else {
            throw new Error(response?.message || '提交失败')
          }
        } catch (error) {
          console.error(`提交审核结果失败 (尝试 ${retryCount + 1}/${maxRetries}):`, error)
          
          if (retryCount < maxRetries - 1) {
            retryCount++
            // 指数退避重试机制
            const baseDelay = 1000 * Math.pow(2, retryCount - 1)
            const jitter = Math.random() * 500
            const delay = baseDelay + jitter
            
            console.log(`${delay.toFixed(0)}ms后进行第${retryCount + 1}次重试`)
            setTimeout(attemptSubmit, delay)
            return
          }
          
          // 所有重试失败后的错误处理
          this.handleSubmitError(error)
          return false
        } finally {
          if (retryCount >= maxRetries - 1) {
            this.loading = false
          }
        }
      }

      return await attemptSubmit()
    },

    // 处理提交错误
    handleSubmitError(error) {
      let errorMessage = '提交失败，请重试'
      
      if (error.message?.includes('网络')) {
        errorMessage = '网络连接失败，请检查网络'
      } else if (error.message?.includes('权限')) {
        errorMessage = '权限不足，请重新登录'
      } else if (error.message?.includes('已审核')) {
        errorMessage = '该文档已被审核'
      }
      
      uni.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 3000
      })
    },
    
    // 确认通过
    async handleApprove() {
      uni.showModal({
        title: '确认操作',
        content: '确认通过这份劳动仲裁申请书？',
        success: async (res) => {
          if (res.confirm) {
            await this.submitReview('approved', '审核通过')
          }
        }
      })
    },
    
    // 驳回申请
    async handleReject() {
      uni.showModal({
        title: '确认操作',
        content: '确认驳回这份劳动仲裁申请书？',
        success: async (res) => {
          if (res.confirm) {
            await this.submitReview('rejected', '审核驳回')
          }
        }
      })
    }
  },
  computed: {
    backgroundStyle() {
      return {
        backgroundImage: `url('${staticBaseUrl}/bg10.png')`
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.arbitration-review {
  min-height: 100vh;
  
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.status-bar {
  width: 100%;
}

.navbar {
  height: 44px;
  display: flex;
  align-items: center;
  padding: 0 20rpx;
  
  .navbar-content {
    display: flex;
    align-items: center;
    
    .back-btn {
      display: flex;
      align-items: center;
      gap: 8rpx;
      
      .back-text {
        color: #409EFF;
        font-size: 16px;
        font-weight: 400;
      }
    }
  }
}

.main-content {
  padding: 20rpx;
  box-sizing: border-box;
  overflow-x: hidden;
}

// 申请书卡片样式
.application-card {
  background: #FFFFFF;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
  padding: 30rpx;
  margin-bottom: 30rpx;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 40rpx;
    
    .title-section {
      flex: 1;
      
      .main-title {
        font-size: 42rpx;
        font-weight: bold;
        color: #333333;
        line-height: 1.2;
        display: block;
        margin-bottom: 16rpx;
        word-wrap: break-word;
      }
      
      .date-time {
        font-size: 24rpx;
        color: #888888;
        line-height: 1.2;
        display: block;
      }
    }
    
    .status-badge {
      background: #EBF5FF;
      border-radius: 10rpx;
      padding: 8rpx 24rpx;
      
      .status-text {
        font-size: 24rpx;
        color: #409EFF;
        font-weight: 400;
      }
    }
  }
  
  .card-content {
    // 内容段落通用样式
    .content-section {
      margin-bottom: 30rpx;
      
      .section-title {
        display: block;
        font-size: 28rpx;
        font-weight: bold;
        color: #333333;
        line-height: 1.5;
        margin-bottom: 20rpx;
        word-wrap: break-word;
      }
      
      .content-text {
        display: block;
        font-size: 28rpx;
        color: #333333;
        line-height: 1.6;
        margin-bottom: 20rpx;
        text-align: left;
        word-wrap: break-word;
        word-break: break-all;
      }
      
      .info-list {
        .info-item {
          display: block;
          font-size: 28rpx;
          color: #333333;
          line-height: 1.6;
          margin-bottom: 8rpx;
          word-wrap: break-word;
          word-break: break-all;
        }
      }
      
      .request-list {
        .request-item {
          display: block;
          font-size: 28rpx;
          color: #333333;
          line-height: 1.6;
          margin-bottom: 12rpx;
          word-wrap: break-word;
          word-break: break-all;
        }
      }
    }
    
    // 落款样式
    .signature-section {
      margin-top: 60rpx;
      
      .signature-text {
        display: block;
        font-size: 28rpx;
        color: #333333;
        line-height: 2;
        
        &.signature-center {
          text-align: center;
          margin: 20rpx 0;
        }
        
        &.signature-right {
          text-align: right;
          margin-bottom: 8rpx;
        }
      }
    }
  }
}

// 附件材料区域样式
.attachment-card {
  background: #FFFFFF;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
  padding: 30rpx;
  margin-bottom: 40rpx;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  
  .attachment-content {
    display: flex;
    align-items: center;
    gap: 20rpx;
    
    .attachment-name {
      font-size: 28rpx;
      color: #333333;
      font-weight: 400;
      word-wrap: break-word;
      flex: 1;
      max-width: calc(100% - 50rpx);
    }
    
    .attachment-size {
      font-size: 24rpx;
      color: #888888;
      margin-left: auto;
      white-space: nowrap;
    }
  }
}

// 加载状态样式
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  
  .loading-content {
    background: #FFFFFF;
    border-radius: 16rpx;
    padding: 40rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20rpx;
    
    .loading-text {
      font-size: 28rpx;
      color: #333333;
    }
  }
}

// 操作按钮区域样式
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  align-items: center;
}
</style>
