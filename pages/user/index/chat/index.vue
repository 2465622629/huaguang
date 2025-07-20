<template>
  <view class="chat-page">
    <!-- 系统状态栏占位 -->
    <view class="status-bar" :style="{ background: themeColors.gradient }"></view>
    
    <!-- 自定义导航栏 -->
    <view class="custom-navbar" :style="{ background: themeColors.gradient }">
      <view class="navbar-content">
        <!-- 返回按钮 -->
        <view class="back-button" @click="goBack">
          <uv-icon name="arrow-left" color="#FFFFFF" size="50"></uv-icon>
        </view>
        
        <!-- 专家信息和计时器 -->
        <view class="lawyer-info">
          <text class="lawyer-name">
            {{ sessionInfo.expertName }}
            <text v-if="unreadCount > 0" class="unread-badge">{{ unreadCount }}</text>
          </text>
          <text class="lawyer-desc">{{ sessionInfo.expertDesc }}</text>
          <view class="timer-container">
            <uv-icon :name="config.staticBaseUrl + '/icons/shalou.png'" color="#FFFFFF" size="32"></uv-icon>
            <text class="timer-text">{{ sessionInfo.sessionDuration }}</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 聊天内容区域 -->
        <scroll-view 
      class="chat-content" 
      scroll-y="true" 
      :scroll-top="scrollTop"
      :style="{ height: chatHeight }"
      @scrolltoupper="handleScrollToUpper"
    >
      <!-- 加载更多 -->
      <view v-if="loadingMessages" class="loading-more">
        <text class="loading-text">正在加载更多消息...</text>
      </view>
      <!-- 加载状态 -->
      <view v-if="loading" class="loading-container">
        <text class="loading-text">加载中...</text>
      </view>
      
      <!-- 消息列表 -->
      <template v-else>
        <!-- 消息项 -->
        <view v-for="(message, index) in messages" :key="message.id" class="message-wrapper">
          <!-- 消息内容 -->
          <view class="message-item" :class="message.senderType === 'user' ? 'sent' : 'received'">
            <!-- 接收的消息 -->
            <template v-if="message.senderType !== 'user'">
              <view class="avatar"></view>
              <view class="message-bubble received-bubble">
                <text v-if="message.type === 'text'" class="message-text">{{ message.content }}</text>
                <image v-else-if="message.type === 'image'" :src="message.content" mode="aspectFit" class="message-image" />
              </view>
            </template>
            
            <!-- 发送的消息 -->
            <template v-else>
              <view class="message-bubble sent-bubble" :style="{ backgroundColor: themeColors.bubbleColor }">
                <text v-if="message.type === 'text'" class="message-text">{{ message.content }}</text>
                <image v-else-if="message.type === 'image'" :src="message.content" mode="aspectFit" class="message-image" />
              </view>
              <view class="avatar"></view>
            </template>
          </view>
          <!-- 消息状态显示 -->
           <view v-if="message.senderType === 'user' && message.status" class="message-status">
             <text v-if="message.status === 'sending'" class="status-sending">发送中...</text>
             <text v-else-if="message.status === 'sent'" class="status-sent">已发送</text>
             <view v-else-if="message.status === 'failed'" class="status-failed-container">
               <text class="status-failed">发送失败</text>
               <text class="retry-btn" @tap="retryMessage(message)">重试</text>
             </view>
             <text v-else-if="message.status === 'read'" class="status-read">已读</text>
           </view>
        </view>
        
        <!-- 空状态 -->
        <view v-if="!loading && messages.length === 0" class="empty-container">
          <text class="empty-text">暂无消息，开始聊天吧</text>
        </view>
      </template>
    </scroll-view>
    
    <!-- 消息输入区域 -->
    <view class="message-input-area">
      <view class="input-container">
        <input 
          class="message-input" 
          placeholder="请输入消息" 
          v-model="inputMessage"
          @confirm="sendMessage"
        />
        <button v-if="inputMessage.trim()" class="send-button" @click="sendMessage">发送</button>
        <view v-else class="add-button" @click="showMoreOptions">
          <uv-icon name="plus-circle" color="#888888" size="54"></uv-icon>
        </view>
      </view>
    </view>
    
    <!-- 快捷操作栏 -->
    <view class="quick-actions" v-if="showQuickActions">
      <view class="action-item" @click="sendTestResult">
        <view class="action-icon" >
          <uv-icon :name="config.staticBaseUrl + '/icons/send_test.png'" color="#FFFFFF" size="64"></uv-icon>
        </view>
        <text class="action-label">发送测试结果</text>
      </view>
      <view class="action-item" @click="openAlbum">
        <view class="action-icon" >
          <uv-icon :name="config.staticBaseUrl + '/icons/photo.png'" color="#FFFFFF" size="64"></uv-icon>
        </view>
        <text class="action-label">相册</text>
      </view>
    </view>
  </view>
</template>

<script>
import config from '@/config/index.js'
import { getTestResult } from '@/api/modules/psychological-tests.js'
import {
  getChatMessages,
  sendMessage as apiSendMessage,
  createChatSession,
  getChatSessions,
  getChatSessionDetail,
  markMessagesAsRead,
  getSessionUnreadCount,
  uploadChatFile,
  sendPsychTestResult,
  sendEnterpriseResume,
  getPsychChatPageData,
  getLawyerChatPageData,
  getEnterpriseChatPageData,
  getChatPageData
} from '@/api/modules/chat.js'

export default {
  name: 'ChatPage',
  data() {
    return {
      chatHeight: '100vh',
      scrollTop: 0,
      inputMessage: '',
      messages: [],
      themeType: 'pink',
      config,
      sessionId: '',
      targetType: '',
      targetId: '',
      sessionInfo: {
        expertName: '林默',
        expertDesc: '专业心理咨询师',
        sessionDuration: '30:00', // 默认显示
        sessionStatus: 'active'
      },
      testResultId: null,
      timer: null,
      remainingTime: 30 * 60, // 30分钟，单位秒
      countdownInterval: null,
      fullTestResult: null,
      loading: true,
      loadingMessages: false,
      sendingMessage: false,
      currentPage: 1,
      pageSize: 20,
      hasMoreMessages: true,
      cacheKey: '',
      cacheExpiry: 5 * 60 * 1000,
      retryCount: 0,
      maxRetries: 3,
      showQuickActions: false,
      expertId: null,
      // 新增状态变量
      unreadCount: 0,
      sessionDetail: null,
      uploadingFile: false,
      pageData: null,
      unreadTimer: null,
      consultationOrderId: null,
      sessionList: []
    }
  },
  async onLoad(options) {
    console.log('聊天页面加载参数:', options)
    
    if (options.theme) {
      this.themeType = options.theme
    }
    
    this.targetType = options.targetType || options.type || 'psychologist'
    this.targetId = options.targetId || options.expertId || ''
    this.consultationOrderId = options.consultationOrderId || options.orderId || null
    
    // 处理会话ID：如果没有传入sessionId，则需要创建或获取会话
    if (options.sessionId || options.conversationId) {
      this.sessionId = options.sessionId || options.conversationId
    } else if (this.targetId) {
      // 没有sessionId但有targetId，需要创建或获取会话
      await this.createOrGetSession()
    } else {
      uni.showToast({
        title: '缺少必要参数',
        icon: 'none'
      })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
      return
    }

    if (options.testResultId) {
      this.testResultId = options.testResultId || null;
      this.expertId = options.expertId || null;
      // 先加载页面数据和历史消息，再处理测试结果的显示
      this.initChatData().then(() => {
        this.handleTestResult(this.testResultId)
      })
    } else {
      this.initChatData()
    }
    
    this.cacheKey = `chat_${this.sessionId}_${this.targetType}`
    
    // 加载页面数据和会话详情
    this.loadPageData()
    this.loadSessionDetail()
  },
  computed: {
    themeColors() {
      const themes = {
        blue: {
          primary: 'rgb(99, 141, 255)',
          secondary: 'rgb(135, 175, 255)',
          gradient: 'linear-gradient(180deg, rgb(160, 196, 255) 0%, rgb(135, 175, 255) 100%)',
          bubbleColor: 'rgb(160, 196, 255)',
          cardBg: 'rgba(230, 240, 255, 0.8)',
          cardBorder: 'rgb(192, 216, 255)',
          acceptBg: 'rgb(217, 230, 255)',
          acceptText: 'rgb(74, 109, 229)',
          iconColor: 'rgb(74, 144, 226)',
          iconBg: 'rgb(74, 144, 226)'
        },
        red: {
          primary: 'rgb(253, 132, 132)',
          secondary: 'rgb(255, 160, 160)',
          gradient: 'linear-gradient(180deg, rgb(253, 132, 132) 0%, rgb(255, 160, 160) 100%)',
          bubbleColor: 'rgb(253, 132, 132)',
          cardBg: 'rgba(255, 230, 230, 0.8)',
          cardBorder: 'rgb(255, 192, 192)',
          acceptBg: 'rgb(255, 217, 217)',
          acceptText: 'rgb(229, 74, 74)',
          iconColor: 'rgb(226, 74, 74)',
          iconBg: 'rgb(226, 74, 74)'
        },
        pink: {
          primary: '#FF8FA3',
          secondary: '#FFB3C1',
          gradient: 'linear-gradient(200deg, #fd6565 10%, #ffd6d6 100%)',
          bubbleColor: 'rgb(255, 167, 167)',
          cardBg: 'linear-gradient(180deg, rgb(255, 224, 224) 0%, rgb(255, 252, 252) 100%)',
          cardBorder: '#ffcccc',
          acceptBg: '#FFE6EA',
          acceptText: '#333',
          iconColor: '#ffbdbd',
          iconBg: '#ffbdbd'
        }
      }
      return themes[this.themeType] || themes.blue
    }
  },
  mounted() {
    this.calculateChatHeight()
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    
    // 启动计时器
    startTimer() {
      if (this.countdownInterval) return // 防止重复启动

      this.countdownInterval = setInterval(() => {
        if (this.remainingTime > 0) {
          this.remainingTime--
          const minutes = Math.floor(this.remainingTime / 60).toString().padStart(2, '0')
          const seconds = (this.remainingTime % 60).toString().padStart(2, '0')
          this.sessionInfo.sessionDuration = `${minutes}:${seconds}`
        } else {
          clearInterval(this.countdownInterval)
          this.sessionInfo.sessionDuration = '00:00'
          uni.showToast({
            title: '咨询时间已结束',
            icon: 'none'
          })
        }
      }, 1000)
    },

    async handleTestResult(resultId) {
      this.loading = true
      try {
        const res = await getTestResult(resultId)
        if (res.code === 200 && res.data) {
          const result = res.data
          this.fullTestResult = result // 保存完整结果
          const welcomeMessage = {
            id: 'system-welcome-' + Date.now(),
            senderType: 'expert',
            type: 'text',
            content: '您好，我们已经收到了您的测试结果，现在可以开始本次咨询了。'
          }
          const resultMessageContent = `测试结果概要：
- **测试名称**: ${result.testName}
- **综合评估**: ${result.resultLevel} (${result.resultDescription})`

          const resultMessage = {
            id: 'system-result-' + Date.now(),
            senderType: 'expert',
            type: 'text',
            content: resultMessageContent
          }

          this.messages.unshift(welcomeMessage, resultMessage)
          this.startTimer()
        } else {
          uni.showToast({
            title: res.message || '获取测试结果失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('获取测试结果失败:', error)
        uni.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },

    calculateChatHeight() {
      const systemInfo = uni.getSystemInfoSync();
      const statusBarHeight = systemInfo.statusBarHeight || 0;
      const navBarHeight = 60; 
      const inputAreaHeight = 50; 
      const quickActionsHeight = this.showQuickActions ? 80 : 0;

      this.chatHeight = `${systemInfo.windowHeight - statusBarHeight - navBarHeight - inputAreaHeight - quickActionsHeight}px`;
    },
    
    async initChatData() {
      this.loading = true
      await this.loadMessages(true)
      this.loading = false
      // 标记消息为已读
      this.markAsRead()
      this.startUnreadCheck() // 启动未读消息检查
    },

    // 创建或获取会话
    async createOrGetSession() {
      try {
        uni.showLoading({
          title: '初始化会话...'
        })
        
        const sessionData = {
          otherUserId: this.targetId,
          type: 'consultation' // 默认为咨询类型
        }
        
        // 如果有咨询订单ID，添加到请求中
        if (this.consultationOrderId) {
          sessionData.consultationOrderId = this.consultationOrderId
        }
        
        const res = await createChatSession(sessionData)
        
        if (res.code === 200 && res.data) {
          this.sessionId = res.data.id || res.data.conversationId
          
          // 如果返回了参与者信息，更新专家数据
          if (res.data.participantInfos && res.data.participantInfos.length > 0) {
            const expertInfo = res.data.participantInfos.find(p => p.userType !== 'user')
            if (expertInfo) {
              this.expertName = expertInfo.realName || expertInfo.nickname
              this.expertId = expertInfo.userId
            }
          }
          
          console.log('会话创建成功:', this.sessionId)
          
          // 创建会话后获取会话列表
          await this.loadChatSessions()
        } else {
          throw new Error(res.message || '创建会话失败')
        }
      } catch (error) {
        console.error('创建/获取会话失败:', error)
        uni.showToast({
          title: error.message || '会话初始化失败',
          icon: 'none'
        })
        
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      } finally {
        uni.hideLoading()
      }
    },

    // 加载会话列表
    async loadChatSessions() {
      try {
        const params = {
          messageType: 'all'
        }
        
        const res = await getChatSessions(params)
        
        if (res.code === 200 && res.data) {
          console.log('会话列表加载成功:', res.data)
          
          // 可以将会话列表存储到data中，供其他功能使用
          this.sessionList = res.data.conversations || res.data
          
          // 如果当前会话在列表中，可以更新相关信息
          if (this.sessionId && this.sessionList) {
            const currentSession = this.sessionList.find(s => s.id == this.sessionId)
            if (currentSession) {
              // 更新未读消息数量等信息
              this.unreadCount = currentSession.unreadCount || 0
            }
          }
        } else {
          console.warn('获取会话列表失败:', res.message)
        }
      } catch (error) {
        console.error('加载会话列表失败:', error)
      }
    },

    // 加载页面数据
    async loadPageData(retryCount = 0) {
      try {
        let pageDataApi = null
        
        // 根据咨询类型选择对应的API
        switch (this.targetType) {
          case 'psychologist':
            pageDataApi = getPsychChatPageData
            break
          case 'lawyer':
            pageDataApi = getLawyerChatPageData
            break
          case 'enterprise':
            pageDataApi = getEnterpriseChatPageData
            break
          default:
            pageDataApi = getChatPageData
        }
        
        const res = await pageDataApi(this.sessionId)
        if (res.code === 200 && res.data) {
          this.pageData = res.data
          // 更新专家信息
          if (res.data.expertInfo) {
            this.sessionInfo.expertName = res.data.expertInfo.name || this.sessionInfo.expertName
            this.sessionInfo.expertDesc = res.data.expertInfo.title || this.sessionInfo.expertDesc
          }
        } else if (res.code === 401 || res.code === 403) {
          // 认证失败，跳转到登录页
          uni.showToast({
            title: '请先登录',
            icon: 'none'
          })
          uni.navigateTo({
            url: '/pages/login/index'
          })
        }
      } catch (error) {
        console.error('加载页面数据失败:', error)
        
        // 网络错误重试机制
        if (retryCount < 2 && (error.code === 'NETWORK_ERROR' || !error.code)) {
          setTimeout(() => {
            this.loadPageData(retryCount + 1)
          }, 1000 * (retryCount + 1))
        } else {
          uni.showToast({
            title: '加载失败，请检查网络',
            icon: 'none'
          })
        }
      }
    },

    // 加载会话详情
    async loadSessionDetail(retryCount = 0) {
      try {
        const res = await getChatSessionDetail(this.sessionId)
        if (res.code === 200 && res.data) {
          this.sessionDetail = res.data
          // 更新会话信息
          if (res.data.expertName) {
            this.sessionInfo.expertName = res.data.expertName
          }
          if (res.data.expertDesc) {
            this.sessionInfo.expertDesc = res.data.expertDesc
          }
        } else if (res.code === 401 || res.code === 403) {
          // 认证失败，跳转到登录页
          uni.showToast({
            title: '请先登录',
            icon: 'none'
          })
          uni.navigateTo({
            url: '/pages/login/index'
          })
        }
      } catch (error) {
        console.error('加载会话详情失败:', error)
        
        // 网络错误重试机制
        if (retryCount < 2 && (error.code === 'NETWORK_ERROR' || !error.code)) {
          setTimeout(() => {
            this.loadSessionDetail(retryCount + 1)
          }, 1000 * (retryCount + 1))
        } else {
          uni.showToast({
            title: '加载会话详情失败',
            icon: 'none'
          })
        }
      }
    },

    // 标记消息为已读
    async markAsRead() {
      try {
        await markMessagesAsRead({
          conversationId: this.sessionId
        })
        this.unreadCount = 0
      } catch (error) {
        console.error('标记已读失败:', error)
      }
    },

    // 获取未读消息数量
    async getUnreadCount() {
      try {
        const res = await getSessionUnreadCount(this.sessionId)
        if (res.code === 200) {
          this.unreadCount = res.data || 0
        }
      } catch (error) {
        console.error('获取未读数量失败:', error)
      }
    },

    // 开始定时检查未读消息
    startUnreadCheck() {
      if (this.unreadTimer) {
        clearInterval(this.unreadTimer)
      }
      
      // 每30秒检查一次未读消息
      this.unreadTimer = setInterval(() => {
        this.getUnreadCount()
      }, 30000)
    },

    // 停止定时检查未读消息
    stopUnreadCheck() {
      if (this.unreadTimer) {
        clearInterval(this.unreadTimer)
        this.unreadTimer = null
      }
    },

    async loadMessages(isInitialLoad = false, retryCount = 0) {
      if (this.loadingMessages || !this.hasMoreMessages) return

      this.loadingMessages = true
      try {
        const res = await getChatMessages(this.sessionId, {
          targetId: this.expertId || this.targetId,
          page: this.currentPage,
          size: this.pageSize
        })

        if (res.code === 200 && res.data) {
          const newMessages = res.data.records.map(m => ({
            id: m.id,
            senderType: m.senderInfo?.userType === 'user' ? 'user' : 'expert', // 根据senderInfo.userType判断
            type: m.messageType,
            content: m.content,
            createdAt: m.createdAt // 保存创建时间用于排序
          }))

          // 根据createdAt字段对消息进行时间排序（升序，旧消息在前）
          newMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

          // 根据是否是初始加载来决定消息合并方式
          if (isInitialLoad) {
            // 初始加载时，直接使用排序后的消息
            this.messages = newMessages
          } else {
            // 上拉加载更多历史消息时，将新消息放在现有消息前面，然后对整个列表重新排序
            const allMessages = [...newMessages, ...this.messages]
            this.messages = allMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
          }
          this.hasMoreMessages = res.data.pages > this.currentPage
          if (this.hasMoreMessages) {
            this.currentPage++
          }

          if (isInitialLoad) {
            this.$nextTick(() => {
              this.scrollTop = 999999
            })
          }
        } else if (res.code === 401 || res.code === 403) {
          // 认证失败，跳转到登录页
          uni.showToast({
            title: '请先登录',
            icon: 'none'
          })
          uni.navigateTo({
            url: '/pages/login/index'
          })
        }
      } catch (error) {
        console.error('加载消息失败:', error)
        
        // 网络错误重试机制
        if (retryCount < 2 && (error.code === 'NETWORK_ERROR' || !error.code)) {
          setTimeout(() => {
            this.loadMessages(isInitialLoad, retryCount + 1)
          }, 1000 * (retryCount + 1))
        } else {
          uni.showToast({
            title: '加载消息失败，请检查网络',
            icon: 'none'
          })
        }
      } finally {
        this.loadingMessages = false
      }
    },

    handleScrollToUpper() {
      this.loadMessages()
    },

    async sendMessage(retryCount = 0) {
      const content = this.inputMessage.trim()
      if (!content || this.sendingMessage) return

      this.sendingMessage = true
      const tempMessageId = 'temp-' + Date.now()

      // 立即显示在界面上
      this.messages.push({
        id: tempMessageId,
        senderType: 'user',
        type: 'text',
        content: content,
        status: 'sending'
      })
      this.inputMessage = ''
      this.$nextTick(() => {
        this.scrollTop = 999999
      })

      try {
        const res = await apiSendMessage({
          conversationId: this.sessionId,
          targetId: this.expertId || this.targetId,
          messageType: 'text',
          content: content
        })

        if (res.code === 200 && res.data) {
          // 用服务器返回的真实消息替换临时消息
          const index = this.messages.findIndex(m => m.id === tempMessageId)
          if (index !== -1) {
            this.$set(this.messages, index, {
              id: res.data.id,
              senderType: 'user',
              type: 'text',
              content: res.data.content,
              status: 'sent'
            })
          }
        } else if (res.code === 401 || res.code === 403) {
          // 认证失败，跳转到登录页
          uni.showToast({
            title: '请先登录',
            icon: 'none'
          })
          uni.navigateTo({
            url: '/pages/login/index'
          })
        } else {
          // 发送失败处理
          const index = this.messages.findIndex(m => m.id === tempMessageId)
          if (index !== -1) {
            this.messages[index].status = 'failed'
            // 可以增加一个重试按钮
          }
        }
      } catch (error) {
        console.error('发送消息失败:', error)
        const index = this.messages.findIndex(m => m.id === tempMessageId)
        if (index !== -1) {
          // 网络错误重试机制
          if (retryCount < 2 && (error.code === 'NETWORK_ERROR' || !error.code)) {
            this.messages[index].content = '正在重试发送...'
            setTimeout(() => {
              // 移除临时消息，重新发送
              const retryIndex = this.messages.findIndex(m => m.id === tempMessageId)
              if (retryIndex !== -1) {
                this.messages.splice(retryIndex, 1)
              }
              this.inputMessage = content
              this.sendingMessage = false
              this.sendMessage(retryCount + 1)
            }, 1000 * (retryCount + 1))
            return
          } else {
            this.messages[index].status = 'failed'
          }
        }
      } finally {
        this.sendingMessage = false
      }
    },
    
    showMoreOptions() {
      this.showQuickActions = !this.showQuickActions;
      this.$nextTick(() => {
        this.calculateChatHeight();
      });
    },

    async sendTestResult() {
      if (!this.fullTestResult || !this.testResultId) {
        uni.showToast({
          title: '当前没有可发送的测试结果',
          icon: 'none'
        })
        return
      }

      try {
        // 使用API发送测试结果
        const res = await sendPsychTestResult({
          conversationId: this.sessionId,
          testResultId: this.testResultId
        })

        if (res.code === 200) {
          uni.showToast({
            title: '测试结果已发送',
            icon: 'success'
          })
          
          // 重新加载消息列表以显示发送的结果
          await this.loadMessages(true)
          
          this.$nextTick(() => {
            this.scrollTop = 999999
          })
        } else {
          throw new Error(res.message || '发送失败')
        }
      } catch (error) {
        console.error('发送测试结果失败:', error)
        
        // 降级到本地显示
        const result = this.fullTestResult
        const messageContent = `我完成了 "${result.testName}"，这是我的结果概要：\n- **综合评估**: ${result.resultLevel}\n- **详细描述**: ${result.resultDescription}`

        const userResultMessage = {
          id: 'user-result-' + Date.now(),
          senderType: 'user',
          type: 'text',
          content: messageContent
        }

        this.messages.push(userResultMessage)

        this.$nextTick(() => {
          this.scrollTop = 999999
        })
        
        uni.showToast({
          title: '网络错误，已本地显示',
          icon: 'none'
        })
      }
    },

    openAlbum() {
      uni.chooseImage({
        count: 1,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0]
          this.uploadImage(tempFilePath)
        },
        fail: (error) => {
          console.error('选择图片失败:', error)
          uni.showToast({
            title: '选择图片失败',
            icon: 'none'
          })
        }
      })
    },

    // 上传图片
    async uploadImage(filePath) {
      if (this.uploadingFile) return
      
      this.uploadingFile = true
      uni.showLoading({
        title: '上传中...'
      })

      try {
        // 创建文件对象
        const file = {
          path: filePath,
          name: 'image_' + Date.now() + '.jpg'
        }

        const res = await uploadChatFile(file, 'image')
        
        if (res.code === 200 && res.data) {
          // 发送图片消息
          await this.sendImageMessage(res.data.fileUrl, res.data.fileName)
          
          uni.showToast({
            title: '图片发送成功',
            icon: 'success'
          })
        } else {
          throw new Error(res.message || '上传失败')
        }
      } catch (error) {
        console.error('上传图片失败:', error)
        uni.showToast({
          title: '上传失败，请重试',
          icon: 'none'
        })
      } finally {
        this.uploadingFile = false
        uni.hideLoading()
      }
    },

    // 发送图片消息
    async sendImageMessage(fileUrl, fileName) {
      try {
        const res = await apiSendMessage({
          conversationId: this.sessionId,
          targetId: this.expertId || this.targetId,
          messageType: 'image',
          fileUrl: fileUrl,
          fileName: fileName
        })

        if (res.code === 200 && res.data) {
          // 添加到消息列表
          this.messages.push({
            id: res.data.id,
            senderType: 'user',
            type: 'image',
            content: fileUrl,
            fileName: fileName,
            status: 'sent'
          })

          this.$nextTick(() => {
            this.scrollTop = 999999
          })
        }
      } catch (error) {
        console.error('发送图片消息失败:', error)
        throw error
      }
    },

    // 发送简历（企业咨询场景）
    async sendResume(resumeFileId) {
      try {
        const res = await sendEnterpriseResume({
          conversationId: this.sessionId,
          resumeFileId: resumeFileId
        })

        if (res.code === 200) {
          uni.showToast({
            title: '简历已发送',
            icon: 'success'
          })
          
          // 重新加载消息列表
          await this.loadMessages(true)
          
          this.$nextTick(() => {
            this.scrollTop = 999999
          })
        } else {
          throw new Error(res.message || '发送失败')
        }
      } catch (error) {
        console.error('发送简历失败:', error)
        uni.showToast({
           title: '发送简历失败',
           icon: 'none'
         })
       }
     },

     // 重试发送消息
     async retryMessage(message) {
       if (message.type === 'text') {
         // 移除失败的消息
         const index = this.messages.findIndex(m => m.id === message.id)
         if (index !== -1) {
           this.messages.splice(index, 1)
         }
         
         // 重新发送
         this.inputMessage = message.content
         await this.sendMessage()
       } else if (message.type === 'image') {
         // 图片重试逻辑
         uni.showToast({
           title: '请重新选择图片发送',
           icon: 'none'
         })
         
         // 移除失败的消息
         const index = this.messages.findIndex(m => m.id === message.id)
         if (index !== -1) {
           this.messages.splice(index, 1)
         }
       }
     }
  },
  beforeDestroy() {
    // 页面销毁前清除计时器
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval)
    }
    if (this.unreadTimer) {
      clearInterval(this.unreadTimer)
    }
  },

  onShow() {
    // 页面显示时标记消息为已读
    if (this.sessionId) {
      this.markAsRead()
      this.getUnreadCount()
    }
  },

  onHide() {
    // 页面隐藏时停止未读消息检查
    if (this.unreadTimer) {
      clearInterval(this.unreadTimer)
      this.unreadTimer = null
    }
  }
}
</script>

<style lang="scss" scoped>
.chat-page {
  width: 100%;
  height: 100vh;
  background-color: #F7F7F8;
  display: flex;
  flex-direction: column;
}

.status-bar {
  height: var(--status-bar-height);
}

.custom-navbar {
  padding: 15px 15px;
  box-shadow: 0 20px 4px rgba(0, 0, 0, 0.1);
  
  .navbar-content {
    display: flex;
    align-items: center;
    position: relative;
    height: 60px;
  }
  
  .back-button {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    padding: 8px;
  }
  
  .lawyer-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    
    .lawyer-name {
      color: #FFFFFF;
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 2px;
      position: relative;
    }
    
    .unread-badge {
      background-color: #ff4757;
      color: white;
      font-size: 12px;
      padding: 2px 6px;
      border-radius: 10px;
      margin-left: 8px;
      min-width: 18px;
      text-align: center;
      display: inline-block;
    }
    
    .lawyer-desc {
      color: #FFFFFF;
      font-size: 12px;
      margin-bottom: 4px;
    }
    
    .timer-container {
      display: flex;
      align-items: center;
      gap: 4px;
      
      .timer-text {
        color: #FFFFFF;
        font-size: 20px;
        font-weight: bold;
      }
    }
  }
}

.chat-content {
  flex: 1;
  background-color: rgb(255, 248, 248);
  padding-top: 30rpx;
}

.message-item {
  display: flex;
  margin-bottom: 35rpx;
  margin-right: 12rpx;
  margin-left: 30rpx;
  
  &.received {
    justify-content: flex-start;
    
    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: #D9D9D9;
      margin-right: 8px;
    }
    
    .message-bubble {
      max-width: 70%;
    }
  }
  
  &.sent {
    justify-content: flex-end;
    padding-right: 15px;
    align-items: flex-end; // 头像对齐到底部
    
    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: #D9D9D9;
      margin-left: 8px;
      flex-shrink: 0;
      align-self: flex-end; // 确保头像在底部
    }
    
    .message-bubble {
      max-width: 70%;
    }
  }
}

.message-bubble {
  padding: 10px 12px;
  border-radius: 12px;
  
  .message-text {
    font-size: 14px;
    line-height: 1.4;
  }
  
  &.received-bubble {
    background-color: #FFFFFF;
    border-bottom-left-radius: 4px;
    
    .message-text {
      color: #333333;
    }
  }
  
  &.sent-bubble {
    border-bottom-right-radius: 4px;
    
    .message-text {
      color: #FFFFFF;
    }
  }
}

.message-input-area {
  background-color: #FFFFFF;
  padding: 10px 15px;
  border-top: 1px solid #EEEEEE;

  .input-container {
    display: flex;
    align-items: center;

    .message-input {
      flex: 1;
      height: 36px;
      background-color: rgb(255, 246, 246);
      border-radius: 18px;
      padding: 0 15px;
      font-size: 14px;
      border: none;

      &::placeholder {
        color: #BDBDBD;
      }
    }

    .send-button {
      flex-shrink: 0;
      margin-left: 10px;
      padding: 0 15px;
      height: 36px;
      line-height: 36px;
      background-color: #FF8FA3;
      color: white;
      border: none;
      border-radius: 18px;
      font-size: 14px;
      // uni-app button 样式重置
      &::after {
        border: none;
      }
    }

    .add-button {
      flex-shrink: 0;
      margin-left: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

.quick-actions {
  background-color: #FFFFFF;
  padding: 20px 20px;
  display: flex;
  justify-content: space-around;
  
  .action-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    flex: 1;
    
    .action-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      
      &:active {
        transform: scale(0.95);
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
      }
    }
    
    .action-label {
      color: #666666;
      font-size: 11px;
      text-align: center;
      font-weight: 500;
    }
  }
}

.loading-container {
  text-align: center;
  padding: 40px 20px;
  
  .loading-text {
    color: #999999;
    font-size: 14px;
  }
}

.empty-container {
  text-align: center;
  padding: 60px 20px;
  
  .empty-text {
    color: #999999;
    font-size: 14px;
  }
}

.message-wrapper {
  margin-bottom: 10px;
}

.message-status {
  text-align: right;
  padding: 2px 15px 0 0;
  
  .status-sending {
    color: #999999;
    font-size: 12px;
  }
  
  .status-sent {
    color: #999999;
    font-size: 12px;
  }
  
  .status-failed-container {
     display: flex;
     align-items: center;
     gap: 8px;
   }
   
   .status-failed {
     color: #ff4757;
     font-size: 12px;
   }
   
   .retry-btn {
     color: #007aff;
     font-size: 12px;
     padding: 2px 6px;
     border: 1px solid #007aff;
     border-radius: 4px;
     background-color: transparent;
   }
  
  .status-read {
    color: #2ed573;
    font-size: 12px;
  }
}

.message-image {
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
}
</style>