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
              <text class="main-title">{{ documentInfo.title }}</text>
              <text class="date-time">{{ documentInfo.createTime }}</text>
            </view>
            <view class="status-badge">
              <text class="status-text">{{ documentInfo.status }}</text>
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
                <text class="info-item">姓名： {{ documentInfo.applicant.name }}</text>
                <text class="info-item">性别： {{ documentInfo.applicant.gender }}</text>
                <text class="info-item">出生日期： {{ documentInfo.applicant.birthDate }}</text>
                <text class="info-item">身份证号： {{ documentInfo.applicant.idCard }}</text>
                <text class="info-item">联系电话： {{ documentInfo.applicant.phone }}</text>
                <text class="info-item">联系地址： {{ documentInfo.applicant.address }}</text>
              </view>
            </view>
            
            <!-- 二、被申请人基本信息 -->
            <view class="content-section">
              <text class="section-title">二、被申请人基本信息</text>
              <view class="info-list">
                <text class="info-item">单位名称： {{ documentInfo.respondent.companyName }}</text>
                <text class="info-item">法定代表人： {{ documentInfo.respondent.legalRepresentative }}</text>
                <text class="info-item">单位地址： {{ documentInfo.respondent.address }}</text>
                <text class="info-item">联系电话： {{ documentInfo.respondent.phone }}</text>
              </view>
            </view>
            
            <!-- 三、仲裁请求 -->
            <view class="content-section">
              <text class="section-title">三、仲裁请求</text>
              <view class="request-list">
                <text
                  v-for="(request, index) in documentInfo.requests"
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
              <text class="content-text">{{ documentInfo.content }}</text>
              <text class="content-text">{{ documentInfo.reason }}</text>
            </view>
            
            <!-- 落款 -->
            <view class="signature-section">
              <text class="signature-text">此致</text>
              <text class="signature-text signature-center">南京市劳动争议仲裁委员会</text>
              <text class="signature-text signature-right">申请人： {{ documentInfo.applicant.name }}</text>
              <text class="signature-text signature-right">{{ documentInfo.createTime.split(' ')[0] }}</text>
            </view>
          </view>
        </view>
        
        <!-- 附件材料区域 -->
        <view class="attachment-card" v-if="documentInfo.attachments && documentInfo.attachments.length > 0">
          <view
            v-for="(attachment, index) in documentInfo.attachments"
            :key="index"
            class="attachment-content"
          >
                              <uv-icon :name="staticBaseUrl + '/icons/cailiao.png'" color="#409EFF" size="66"></uv-icon>
            <text class="attachment-name">{{ attachment.name }}</text>
            <text v-if="attachment.size" class="attachment-size">{{ attachment.size }}</text>
          </view>
        </view>
        
        <!-- 操作按钮区域 -->
        <view class="action-buttons">
          <uv-button
            type="primary"
            shape="circle"
            size="large"
            :customStyle="'background: ' + (downloading ? '#cccccc' : '#409EFF') + '; border: none; width: 85%;'"
            :disabled="downloading"
            @click="handleDownload"
          >
            {{ downloading ? '下载中...' : '下载' }}
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
  import lawyerWorkspaceApi from '@/api/modules/lawyer-workspace.js'
  
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
        // 文档信息
        documentInfo: {
          id: '',
          title: '劳动仲裁申请书',
          status: '待审核',
          createTime: '2025年5月6日 14:33',
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
          content: '申请人自2022年5月入职被申请人单位，担任软件工程师一职，双方签订了为期三年的劳动合同。但自2024年11月起，被申请人以经营困难为由拖欠申请人工资。2025年1月20日，被申请人未经协商，单方面以口头方式解除了与申请人的劳动合同，并拒绝出具解除证明及支付相应补偿金。',
          reason: '申请人多次与单位协商无果，现依法提起劳动仲裁，望依法维护申请人合法权益。',
          attachments: [
            {
              name: '证据材料.pdf',
              url: '',
              size: '2.5MB'
            }
          ]
        },
        loading: false,
        downloading: false
      }
    },
    onLoad(options) {
      this.getSystemInfo()
      // 获取文档ID参数
      if (options.documentId) {
        this.documentInfo.id = options.documentId
        this.loadDocumentDetail()
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
      
      // 加载文档详情（企业级API集成）
      async loadDocumentDetail() {
        if (!this.documentInfo.id) {
          console.warn('[仲裁下载] 文档ID为空，使用默认数据')
          return
        }
        
        this.loading = true
        let retryCount = 0
        const maxRetries = 3
        
        const attemptLoad = async () => {
          try {
            console.log(`[仲裁下载] 第${retryCount + 1}次尝试获取文档详情，文档ID: ${this.documentInfo.id}`)
            
            // 直接调用文档详情API
            const response = await lawyerWorkspaceApi.getDocumentDetail(this.documentInfo.id)
            
            if (response && response.data) {
              // 更新文档信息
              this.updateDocumentInfo(response.data)
              console.log('[仲裁下载] 文档详情加载成功:', response.data)
            } else {
              throw new Error('API返回数据格式错误')
            }
            
          } catch (error) {
            console.error(`[仲裁下载] 第${retryCount + 1}次获取文档详情失败:`, error)
            
            if (retryCount < maxRetries - 1) {
              retryCount++
              // 指数退避重试机制（1000ms, 2000ms, 4000ms）+ 随机抖动
              const baseDelay = 1000 * Math.pow(2, retryCount - 1)
              const jitter = Math.random() * 500 // 0-500ms随机抖动
              const delay = baseDelay + jitter
              
              console.log(`[仲裁下载] ${delay.toFixed(0)}ms后进行第${retryCount + 1}次重试`)
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
      
      // 处理加载错误
      handleLoadError(error) {
        let errorMessage = '加载文档失败，显示默认内容'
        
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
        
        console.error('[仲裁下载] 文档加载最终失败:', error)
      },
      
      // 更新文档信息
      updateDocumentInfo(documentData) {
        if (!documentData) return
        
        // 更新基本信息
        this.documentInfo.title = documentData.title || this.documentInfo.title
        this.documentInfo.status = this.formatStatus(documentData.status)
        this.documentInfo.createTime = this.formatDateTime(documentData.createTime)
        
        // 更新申请人信息（如果API返回）
        if (documentData.applicant) {
          this.documentInfo.applicant = {
            ...this.documentInfo.applicant,
            ...documentData.applicant
          }
        }
        
        // 更新被申请人信息（如果API返回）
        if (documentData.respondent) {
          this.documentInfo.respondent = {
            ...this.documentInfo.respondent,
            ...documentData.respondent
          }
        }
        
        // 更新仲裁请求（如果API返回）
        if (documentData.requests && Array.isArray(documentData.requests)) {
          this.documentInfo.requests = documentData.requests
        }
        
        // 更新内容和理由
        if (documentData.content) {
          this.documentInfo.content = documentData.content
        }
        if (documentData.reason) {
          this.documentInfo.reason = documentData.reason
        }
        
        // 更新附件信息
        if (documentData.attachments && Array.isArray(documentData.attachments)) {
          this.documentInfo.attachments = documentData.attachments
        }
      },
      
      // 格式化状态
      formatStatus(status) {
        const statusMap = {
          'pending': '待审核',
          'reviewing': '审核中',
          'approved': '已通过',
          'rejected': '已拒绝',
          'draft': '草稿'
        }
        return statusMap[status] || status || '待审核'
      },
      
      // 格式化日期时间
      formatDateTime(dateTime) {
        if (!dateTime) return this.documentInfo.createTime
        
        try {
          const date = new Date(dateTime)
          const year = date.getFullYear()
          const month = date.getMonth() + 1
          const day = date.getDate()
          const hours = date.getHours()
          const minutes = date.getMinutes()
          
          return `${year}年${month}月${day}日 ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
        } catch (error) {
          console.error('[仲裁下载] 日期格式化失败:', error)
          return dateTime
        }
      },
      
      // 下载文档
      async handleDownload() {
        if (this.downloading) return
        
        uni.showModal({
          title: '确认操作',
          content: '确认下载这份劳动仲裁申请书？',
          success: async (res) => {
            if (res.confirm) {
              await this.downloadDocument()
            }
          }
        })
      },
      
      // 执行下载（企业级API集成）
      async downloadDocument() {
        this.downloading = true
        let retryCount = 0
        const maxRetries = 3
        
        // 显示下载进度
        uni.showLoading({
          title: '正在下载...',
          mask: true
        })
        
        const attemptDownload = async () => {
          try {
            console.log(`[仲裁下载] 第${retryCount + 1}次尝试下载文档，文档ID: ${this.documentInfo.id}`)
            
            // 调用真实下载API
            const downloadResponse = await lawyerWorkspaceApi.downloadLegalDocument(this.documentInfo.id)
            
            if (downloadResponse && downloadResponse.success) {
              // 记录文档查看
              try {
                await this.recordDocumentView()
              } catch (viewError) {
                console.warn('[仲裁下载] 记录查看失败:', viewError)
              }
              
              uni.hideLoading()
              uni.showToast({
                title: '下载成功',
                icon: 'success',
                duration: 2000
              })
              
              console.log('[仲裁下载] 文档下载成功')
            } else {
              throw new Error(downloadResponse?.message || '下载失败')
            }
            
          } catch (error) {
            console.error(`[仲裁下载] 第${retryCount + 1}次下载失败:`, error)
            
            if (retryCount < maxRetries - 1) {
              retryCount++
              // 指数退避重试机制
              const baseDelay = 1000 * Math.pow(2, retryCount - 1)
              const jitter = Math.random() * 500
              const delay = baseDelay + jitter
              
              console.log(`[仲裁下载] ${delay.toFixed(0)}ms后进行第${retryCount + 1}次重试`)
              setTimeout(attemptDownload, delay)
              return
            }
            
            // 所有重试失败后的错误处理
            this.handleDownloadError(error)
          } finally {
            if (retryCount >= maxRetries - 1) {
              uni.hideLoading()
              this.downloading = false
            }
          }
        }
        
        await attemptDownload()
      },
      
      // 处理下载错误
      handleDownloadError(error) {
        let errorMessage = '下载失败，请稍后重试'
        
        // 下载特定错误分类处理
        if (error.message?.includes('网络')) {
          errorMessage = '网络连接失败，请检查网络'
        } else if (error.message?.includes('权限')) {
          errorMessage = '权限不足，请重新登录'
        } else if (error.message?.includes('文件不存在')) {
          errorMessage = '文件不存在或已被删除'
        } else if (error.message?.includes('存储空间')) {
          errorMessage = '设备存储空间不足'
        } else if (error.message?.includes('格式')) {
          errorMessage = '文件格式不支持'
        }
        
        uni.showToast({
          title: errorMessage,
          icon: 'none',
          duration: 3000
        })
        
        console.error('[仲裁下载] 下载最终失败:', error)
      },
      
      // 记录文档查看（企业级API集成）
      async recordDocumentView() {
        if (!this.documentInfo.id) return
        
        let retryCount = 0
        const maxRetries = 2 // 查看记录失败不影响主流程，减少重试次数
        
        const attemptRecord = async () => {
          try {
            console.log(`[仲裁下载] 第${retryCount + 1}次尝试记录文档查看，文档ID: ${this.documentInfo.id}`)
            
            // 调用真实查看记录API
            const viewResponse = await lawyerWorkspaceApi.recordLegalDocumentView(this.documentInfo.id)
            
            if (viewResponse && viewResponse.success) {
              console.log('[仲裁下载] 文档查看记录成功')
            } else {
              throw new Error(viewResponse?.message || '记录查看失败')
            }
            
          } catch (error) {
            console.error(`[仲裁下载] 第${retryCount + 1}次记录查看失败:`, error)
            
            if (retryCount < maxRetries - 1) {
              retryCount++
              // 简化重试机制，查看记录不是关键功能
              const delay = 1000 + Math.random() * 500
              console.log(`[仲裁下载] ${delay.toFixed(0)}ms后进行查看记录重试`)
              setTimeout(attemptRecord, delay)
              return
            }
            
            // 查看记录失败不影响主流程，仅记录错误
            console.warn('[仲裁下载] 查看记录最终失败，但不影响下载流程:', error)
            throw error
          }
        }
        
        await attemptRecord()
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
      margin-bottom: 20rpx;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .attachment-name {
        font-size: 28rpx;
        color: #333333;
        font-weight: 400;
        word-wrap: break-word;
        flex: 1;
        max-width: calc(100% - 120rpx);
      }
      
      .attachment-size {
        font-size: 24rpx;
        color: #888888;
        font-weight: 400;
        white-space: nowrap;
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
  