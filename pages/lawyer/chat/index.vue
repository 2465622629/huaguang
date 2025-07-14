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

        <!-- 律师信息和计时器 -->
        <view class="lawyer-info">
          <text class="lawyer-name">{{ sessionInfo.clientName }}</text>
          <text class="lawyer-desc">{{ sessionInfo.consultationCategory }}</text>
          <view class="timer-container">
            <uv-icon :name="staticBaseUrl + '/icons/shalou.png'" color="#FFFFFF" size="32"></uv-icon>
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
      @scrolltoupper="loadMoreMessages"
      :refresher-enabled="true"
      :refresher-triggered="isLoadingMessages"
      @refresherrefresh="refreshMessages"
    >
      <!-- 加载更多指示器 -->
      <view v-if="hasMoreMessages && isLoadingMessages" class="loading-more">
        <uv-loading-icon mode="spinner" color="#999999"></uv-loading-icon>
        <text class="loading-text">加载更多消息...</text>
      </view>
      
      <!-- 消息列表 -->
      <view v-for="(message, index) in sortedMessages" :key="message.id" class="message-wrapper">
        <!-- 时间戳分隔符 -->
        <view v-if="shouldShowTimestamp(message, index)" class="timestamp-separator">
          <text class="timestamp-text">{{ formatMessageTime(message.timestamp) }}</text>
        </view>

        <!-- 消息项 -->
        <view class="message-item" :class="message.senderType === 'lawyer' ? 'sent' : 'received'">
          <!-- 接收的消息（用户发送） -->
          <template v-if="message.senderType !== 'lawyer'">
            <view class="avatar" :style="{ backgroundImage: message.senderAvatar ? 'url(' + message.senderAvatar + ')' : 'none' }"></view>
            <view class="message-bubble received-bubble">
              <!-- 文本消息 -->
              <text v-if="message.type === 'text'" class="message-text">{{ message.content }}</text>
              
              <!-- 图片消息 -->
              <image v-else-if="message.type === 'image'" 
                :src="message.mediaUrl" 
                class="message-image" 
                mode="aspectFit"
                @click="previewImage(message.mediaUrl)"
              ></image>
              
              <!-- 文件消息 -->
              <view v-else-if="message.type === 'file'" class="message-file" @click="openFile(message)">
                <uv-icon name="file-text" size="24" color="#666"></uv-icon>
                <text class="file-name">{{ message.fileName }}</text>
                <text class="file-size">{{ formatFileSize(message.fileSize) }}</text>
              </view>
              
              <!-- 音频消息 -->
              <view v-else-if="message.type === 'audio'" class="message-audio" @click="playAudio(message)">
                <uv-icon name="sound" size="24" color="#666"></uv-icon>
                <text class="audio-duration">{{ formatDuration(message.duration) }}</text>
              </view>
              
              <!-- 消息状态指示器 -->
              <view v-if="message.status === 'sending'" class="message-status">
                <uv-loading-icon mode="spinner" size="12"></uv-loading-icon>
              </view>
              <view v-else-if="message.status === 'failed'" class="message-status failed" @click="resendMessage(message)">
                <uv-icon name="error-circle" size="12" color="#ff4444"></uv-icon>
              </view>
            </view>
          </template>

          <!-- 发送的消息（律师发送） -->
          <template v-else>
            <view class="message-bubble sent-bubble" :style="{ backgroundColor: themeColors.bubbleColor }">
              <!-- 文本消息 -->
              <text v-if="message.type === 'text'" class="message-text">{{ message.content }}</text>
              
              <!-- 图片消息 -->
              <image v-else-if="message.type === 'image'" 
                :src="message.mediaUrl" 
                class="message-image" 
                mode="aspectFit"
                @click="previewImage(message.mediaUrl)"
              ></image>
              
              <!-- 文件消息 -->
              <view v-else-if="message.type === 'file'" class="message-file" @click="openFile(message)">
                <uv-icon name="file-text" size="24" color="#fff"></uv-icon>
                <text class="file-name">{{ message.fileName }}</text>
                <text class="file-size">{{ formatFileSize(message.fileSize) }}</text>
              </view>
              
              <!-- 音频消息 -->
              <view v-else-if="message.type === 'audio'" class="message-audio" @click="playAudio(message)">
                <uv-icon name="sound" size="24" color="#fff"></uv-icon>
                <text class="audio-duration">{{ formatDuration(message.duration) }}</text>
              </view>
              
              <!-- 消息状态指示器 -->
              <view v-if="message.status === 'sending'" class="message-status">
                <uv-loading-icon mode="spinner" size="12"></uv-loading-icon>
              </view>
              <view v-else-if="message.status === 'failed'" class="message-status failed" @click="resendMessage(message)">
                <uv-icon name="error-circle" size="12" color="#ff4444"></uv-icon>
              </view>
            </view>
            <view class="avatar" :style="{ backgroundImage: message.senderAvatar ? 'url(' + message.senderAvatar + ')' : 'none' }"></view>
          </template>
        </view>

        <!-- 视频邀请卡片 -->
        <view v-if="message.type === 'video_invite'" class="video-invitation-card"
          :style="{ backgroundColor: themeColors.cardBg, borderColor: themeColors.cardBorder }">
          <view class="invitation-info">
            <view class="video-icon" :style="{ backgroundColor: themeColors.iconColor }">
              <uv-icon :name="staticBaseUrl + '/icons/video.png'" color="#FFFFFF" size="32"></uv-icon>
            </view>
            <view class="invitation-text">
              <text class="invitation-line1">{{ message.senderType === 'lawyer' ? '您' : '对方' }}发送了视频邀请</text>
            </view>
          </view>
          <view v-if="message.senderType !== 'lawyer'" class="invitation-buttons">
            <view class="reject-button" @click="rejectVideo">
              <text class="reject-text">拒绝</text>
            </view>
            <view class="accept-button" @click="acceptVideo" :style="{ backgroundColor: themeColors.acceptBg }">
              <text class="accept-text" :style="{ color: themeColors.acceptText }">同意</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 无消息提示 -->
      <view v-if="!isLoadingMessages && messages.length === 0" class="no-messages">
        <uv-icon name="chat" size="48" color="#cccccc"></uv-icon>
        <text class="no-messages-text">开始与用户对话吧</text>
      </view>
    </scroll-view>

    <!-- 消息输入区域 -->
    <view class="message-input-area">
      <view class="input-container">
        <input class="message-input" placeholder="请输入消息" v-model="inputMessage" @confirm="sendMessage" />
        <view class="add-button" @click="showMoreOptions">
          <uv-icon name="plus-circle" color="#888888" size="54"></uv-icon>
        </view>
      </view>
    </view>

    <!-- 快捷操作栏 -->
    <view class="quick-actions">


      <view class="action-item" @click="openAlbum">
        <view class="action-icon">
          <uv-icon :name="staticBaseUrl + '/icons/photo-blue.png'" color="#FFFFFF" size="64"></uv-icon>
        </view>
        <text class="action-label">相册</text>
      </view>
    </view>
  </view>
</template>

<script>
import { staticBaseUrl } from '@/config/index.js'
// 导入聊天相关API - 更新为存在的接口
import { 
  getLawyerChatPageData, 
  getChatMessages, 
  sendMessage, 
  uploadChatFile,
  markMessagesAsRead,
  getChatSessionDetail,
  createChatSession,
  getChatSessions,
  getUnreadCount
} from '@/api/modules/chat.js'
import { getCurrentLawyerInfo } from '@/api/modules/lawyer.js'

export default {
  name: 'LawyerChatPage',
  data() {
    return {
      staticBaseUrl,
      chatHeight: '100vh',
      scrollTop: 0,
      inputMessage: '',
      messages: [],
      themeType: 'blue', // 默认蓝色主题
      
      // 会话基本信息
      sessionId: '',
      consultationId: '',
      clientId: '',
      lawyerId: '',
      
      // 会话状态信息
      sessionInfo: {
        clientName: '用户',
        clientAvatar: '',
        lawyerName: '律师',
        lawyerDesc: '专业律师',
        sessionDuration: '00:00',
        sessionStatus: 'active', // active/paused/ended
        consultationCategory: '法律咨询',
        startTime: null,
        endTime: null
      },
      
      // 企业级状态管理
      isLoading: false,
      isLoadingMessages: false,
      isSendingMessage: false,
      isUploadingFile: false,
      
      // 分页和加载状态
      currentPage: 1,
      pageSize: 20,
      hasMoreMessages: true,
      lastMessageId: null,
      
      // 智能缓存系统
      cacheKey: '',
      cacheExpiry: 5 * 60 * 1000, // 5分钟缓存
      lastCacheTime: 0,
      
      // 重试机制配置
      retryConfig: {
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 8000,
        backoffFactor: 2
      },
      
      // 错误处理状态
      errorState: {
        hasError: false,
        errorType: '',
        errorMessage: '',
        canRetry: false
      },
      
      // 消息状态跟踪
      sendingMessages: new Map(), // 正在发送的消息
      messageRetryCount: new Map(), // 消息重试次数
      
      // 计时器
      sessionTimer: null,
      sessionStartTime: null,
      
      // 文件上传状态
      uploadProgress: {},
      
      // 视频通话状态
      isVideoCallActive: false,
      videoCallDuration: 0,
      
      // 快捷操作显示状态
      showQuickActions: false
    }
  },
  
  async onLoad(options) {
    console.log('律师聊天页面加载参数:', options)
    
    // 获取页面参数
    this.sessionId = options.sessionId || ''
    this.consultationId = options.consultationId || ''
    this.clientId = options.clientId || ''
    this.lawyerId = options.lawyerId || ''
    
    if (options.theme) {
      this.themeType = options.theme
    }
    
    // 设置缓存键 - 优化缓存策略
    this.cacheKey = `lawyer_chat_${this.sessionId || this.consultationId}_${this.lawyerId}`
    
    // 初始化聊天数据
    await this.initializeChatData()
    
    // 初始化完成后获取未读消息数量
    this.getUnreadMessageCount()
  },
  
  computed: {
    // 计算主题色
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
    },
    
    // 格式化的会话时长
    formattedSessionDuration() {
      if (!this.sessionStartTime) return '00:00'
      
      const now = Date.now()
      const duration = Math.floor((now - this.sessionStartTime) / 1000)
      const minutes = Math.floor(duration / 60)
      const seconds = duration % 60
      
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    },
    
    // 消息列表（按时间排序）
    sortedMessages() {
      return [...this.messages].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    }
  },
  
  mounted() {
    this.calculateChatHeight()
    
    // 启动会话计时器
    this.startSessionTimer()
  },
  
  onUnload() {
    // 清理计时器
    if (this.sessionTimer) {
      clearInterval(this.sessionTimer)
      this.sessionTimer = null
    }
    
    // 标记所有消息为已读
    this.markAllMessagesAsRead()
    
    // 保存聊天状态
    this.saveChatState()
    
    // 清理资源
    this.clearResources()
  },
  
  methods: {
    // 返回上一页
    goBack() {
      // 保存聊天状态
      this.saveChatState()
      uni.navigateBack()
    },

    // 初始化聊天数据 - 企业级版本
    async initializeChatData() {
      this.isLoading = true
      
      try {
        // 尝试从缓存加载数据
        const cachedData = this.getCachedChatData()
        if (cachedData) {
          console.log('使用缓存的聊天数据')
          this.applyCachedData(cachedData)
        }
        
        // 并行加载多个数据源
        const promises = []
        
        // 1. 获取会话详情和基本信息
        if (this.sessionId) {
          promises.push(this.loadSessionDetails())
        } else if (this.consultationId) {
          // 如果没有sessionId但有consultationId，创建或获取会话
          promises.push(this.createOrGetSessionFromConsultation())
        }
        
        // 2. 获取律师信息
        promises.push(this.loadLawyerInfo())
        
        // 等待所有数据加载完成
        await Promise.allSettled(promises)
        
        // 3. 加载聊天消息
        if (this.sessionId) {
          await this.loadChatMessages()
        }
        
        // 4. 缓存数据
        this.setCachedChatData({
          sessionInfo: this.sessionInfo,
          messages: this.messages,
          timestamp: Date.now()
        })
        
      } catch (error) {
        console.error('初始化聊天数据失败:', error)
        this.handleApiError(error)
      } finally {
        this.isLoading = false
      }
    },
    
    // 加载会话详情
    async loadSessionDetails() {
      try {
        const response = await this.callApiWithRetry(async () => {
          return await getChatSessionDetail(this.sessionId)
        })
        
        if (response && response.data) {
          const sessionData = response.data
          this.sessionInfo = {
            ...this.sessionInfo,
            clientName: sessionData.clientName || '用户',
            clientAvatar: sessionData.clientAvatar || '',
            sessionStatus: sessionData.status || 'active',
            consultationCategory: sessionData.category || '法律咨询',
            startTime: sessionData.startTime,
            endTime: sessionData.endTime
          }
          
          this.sessionStartTime = sessionData.startTime ? new Date(sessionData.startTime).getTime() : Date.now()
        }
        
      } catch (error) {
        console.warn('加载会话详情失败:', error)
      }
    },
    
    // 从咨询ID创建或获取会话
    async createOrGetSessionFromConsultation() {
      try {
        const response = await this.callApiWithRetry(async () => {
          return await createChatSession({
            targetId: this.lawyerId,
            targetType: 'lawyer',
            serviceType: 'consultation'
          })
        })
        
        if (response && response.data) {
          this.sessionId = response.data.id
          this.sessionInfo = {
            ...this.sessionInfo,
            clientName: response.data.participantInfos?.find(p => p.userType === 'user')?.realName || '用户',
            clientAvatar: response.data.participantInfos?.find(p => p.userType === 'user')?.avatarUrl || ''
          }
        }
        
      } catch (error) {
        console.error('创建或获取会话失败:', error)
        throw error
      }
    },
    
    // 加载律师信息
    async loadLawyerInfo() {
      try {
        const response = await this.callApiWithRetry(async () => {
          return await getCurrentLawyerInfo()
        })
        
        if (response && response.data) {
          this.sessionInfo.lawyerName = response.data.name || '律师'
          this.sessionInfo.lawyerDesc = response.data.specialtyDescription || '专业律师'
        }
        
      } catch (error) {
        console.warn('加载律师信息失败:', error)
      }
    },
    
    // 加载聊天消息 - 企业级版本
    async loadChatMessages(loadMore = false) {
      if (this.isLoadingMessages || !this.sessionId) return
      
      this.isLoadingMessages = true
      
      try {
        console.log('加载聊天消息, sessionId:', this.sessionId, 'loadMore:', loadMore)
        
        const params = {
          messageType: 'all',
          page: loadMore ? this.currentPage + 1 : 1,
          size: this.pageSize
        }
        
        const response = await this.callApiWithRetry(async () => {
          return await getChatMessages(this.sessionId, params)
        })
        
        if (response && response.data) {
          const newMessages = this.formatMessages(response.data.records || [])
          
          if (loadMore) {
            // 加载更多，插入到消息列表前面
            this.messages = [...newMessages, ...this.messages]
            this.currentPage++
          } else {
            // 首次加载
            this.messages = newMessages
            this.currentPage = 1
            this.scrollToBottom()
          }
          
          // 更新分页状态
          this.hasMoreMessages = response.data.current < response.data.total
          
          // 更新最后消息ID
          if (newMessages.length > 0) {
            this.lastMessageId = newMessages[0].id
          }
          
          // 标记消息为已读
          setTimeout(() => {
            this.markAllMessagesAsRead()
          }, 1000)
        }
        
      } catch (error) {
        console.error('加载聊天消息失败:', error)
        this.handleApiError(error)
      } finally {
        this.isLoadingMessages = false
      }
    },
    
    // 格式化消息数据 - 优化字段映射
    formatMessages(messages) {
      return messages.map(msg => ({
        id: msg.id || msg.messageId || Date.now() + Math.random(),
        content: msg.content || msg.text || msg.message || '',
        type: msg.type || msg.messageType || 'text', // text/image/file/audio/video_invite
        senderId: msg.senderId || msg.sender_id || msg.from_id,
        senderType: msg.senderType || msg.sender_type || msg.from_type, // user/lawyer
        senderName: msg.senderName || msg.sender_name || msg.from_name || '用户',
        senderAvatar: msg.senderAvatar || msg.sender_avatar || msg.from_avatar || '',
        timestamp: msg.timestamp || msg.created_at || msg.send_time || Date.now(),
        status: msg.status || msg.message_status || 'sent', // sending/sent/delivered/read/failed
        mediaUrl: msg.mediaUrl || msg.media_url || msg.file_url || msg.url,
        fileName: msg.fileName || msg.file_name || msg.filename,
        fileSize: msg.fileSize || msg.file_size || msg.size,
        duration: msg.duration || msg.audio_duration || 0, // 音频/视频时长
        isRecalled: msg.isRecalled || msg.is_recalled || msg.recalled || false,
        replyToMessage: msg.replyToMessage || msg.reply_to_message || msg.reply_to,
        // 新增字段支持
        readStatus: msg.readStatus || msg.read_status || 'unread',
        deliveryStatus: msg.deliveryStatus || msg.delivery_status || 'pending'
      }))
    },

    // 计算聊天区域高度
    calculateChatHeight() {
      const systemInfo = uni.getSystemInfoSync()
      const statusBarHeight = systemInfo.statusBarHeight || 0
      const navBarHeight = 60 // 自定义导航栏高度
      const inputAreaHeight = 50 // 输入区域高度
      const quickActionsHeight = 80 // 快捷操作栏高度

      this.chatHeight = `${systemInfo.windowHeight - statusBarHeight - navBarHeight - inputAreaHeight - quickActionsHeight}px`
    },

    // 发送消息 - 企业级版本
    async sendMessage() {
      const messageText = this.inputMessage.trim()
      if (!messageText || this.isSendingMessage || !this.sessionId) return

      try {
        this.isSendingMessage = true
        
        // 创建临时消息（乐观更新）
        const tempMessage = {
          id: 'temp_' + Date.now(),
          content: messageText,
          type: 'text',
          senderId: 'current_lawyer',
          senderType: 'lawyer',
          senderName: this.sessionInfo.lawyerName,
          timestamp: Date.now(),
          status: 'sending'
        }
        
        // 立即显示在界面上
        this.messages.push(tempMessage)
        this.inputMessage = ''
        this.scrollToBottom()
        
        // 发送消息到服务器 - 使用通用sendMessage接口
        const response = await this.callApiWithRetry(async () => {
          return await sendMessage({
            conversationId: this.sessionId,
            messageType: 'text',
            content: messageText
          })
        })
        
        // 更新消息状态
        const messageIndex = this.messages.findIndex(msg => msg.id === tempMessage.id)
        if (messageIndex !== -1) {
          if (response && response.data) {
            // 发送成功，更新消息信息
            this.messages[messageIndex] = {
              ...tempMessage,
              id: response.data.id || tempMessage.id,
              status: 'sent',
              timestamp: response.data.createdAt || tempMessage.timestamp
            }
          } else {
            // 发送失败
            this.messages[messageIndex].status = 'failed'
          }
        }
        
        // 清除消息缓存
        this.clearCachedChatData()
        
      } catch (error) {
        console.error('发送消息失败:', error)
        
        // 更新失败消息的状态
        const messageIndex = this.messages.findIndex(msg => msg.id.startsWith('temp_'))
        if (messageIndex !== -1) {
          this.messages[messageIndex].status = 'failed'
        }
        
        this.handleApiError(error)
      } finally {
        this.isSendingMessage = false
      }
    },

    // 显示更多选项
    showMoreOptions() {
      this.showQuickActions = !this.showQuickActions
    },

    // 打开相册 - 企业级版本
    async openAlbum() {
      try {
        const res = await new Promise((resolve, reject) => {
          uni.chooseImage({
            count: 9,
            sizeType: ['original', 'compressed'],
            sourceType: ['album'],
            success: resolve,
            fail: reject
          })
        })
        
        console.log('选择的图片:', res.tempFilePaths)
        
        // 批量上传并发送图片
        for (const imagePath of res.tempFilePaths) {
          await this.sendImageMessage(imagePath)
        }
        
      } catch (error) {
        console.error('选择图片失败:', error)
        uni.showToast({
          title: '选择图片失败',
          icon: 'none'
        })
      }
    },
    
    // 发送图片消息
    async sendImageMessage(imagePath) {
      if (!this.sessionId) return
      
      try {
        this.isUploadingFile = true
        
        // 创建临时图片消息
        const tempMessage = {
          id: 'temp_img_' + Date.now(),
          content: '[图片]',
          type: 'image',
          senderId: 'current_lawyer',
          senderType: 'lawyer',
          senderName: this.sessionInfo.lawyerName,
          timestamp: Date.now(),
          status: 'uploading',
          mediaUrl: imagePath // 临时显示本地路径
        }
        
        this.messages.push(tempMessage)
        this.scrollToBottom()
        
        // 上传图片 - 使用正确的上传接口
        const uploadResponse = await this.callApiWithRetry(async () => {
          return await uploadChatFile(imagePath, 'image')
        })
        
        if (uploadResponse && uploadResponse.data && uploadResponse.data.fileUrl) {
          // 发送图片消息 - 使用通用sendMessage接口
          const sendResponse = await this.callApiWithRetry(async () => {
            return await sendMessage({
              conversationId: this.sessionId,
              messageType: 'image',
              fileUrl: uploadResponse.data.fileUrl,
              fileName: uploadResponse.data.fileName,
              fileSize: uploadResponse.data.fileSize
            })
          })
          
          // 更新消息状态
          const messageIndex = this.messages.findIndex(msg => msg.id === tempMessage.id)
          if (messageIndex !== -1) {
            this.messages[messageIndex] = {
              ...tempMessage,
              id: sendResponse.data?.id || tempMessage.id,
              status: 'sent',
              mediaUrl: uploadResponse.data.fileUrl
            }
          }
        }
        
      } catch (error) {
        console.error('发送图片消息失败:', error)
        
        // 更新失败状态
        const messageIndex = this.messages.findIndex(msg => msg.id === tempMessage.id)
        if (messageIndex !== -1) {
          this.messages[messageIndex].status = 'failed'
        }
        
        this.handleApiError(error)
      } finally {
        this.isUploadingFile = false
      }
    },

    // 拒绝视频邀请
    rejectVideo() {
      uni.showToast({
        title: '已拒绝视频邀请',
        icon: 'none'
      })
    },

    // 接受视频邀请
    acceptVideo() {
      this.isVideoCallActive = true
      this.videoCallDuration = 0
      
      uni.showToast({
        title: '已接受视频邀请',
        icon: 'none'
      })
      
      // 启动视频通话计时器（这里只是模拟）
      const videoTimer = setInterval(() => {
        this.videoCallDuration++
      }, 1000)
      
      // 5秒后模拟结束通话
      setTimeout(() => {
        clearInterval(videoTimer)
        this.isVideoCallActive = false
        uni.showToast({
          title: `视频通话已结束，通话时长：${this.videoCallDuration}秒`,
          icon: 'none'
        })
      }, 5000)
    },

    // 语音通话
    makeVoiceCall() {
      uni.showToast({
        title: '发起语音通话',
        icon: 'none'
      })
    },
    
    // 滚动到底部
    scrollToBottom() {
      this.$nextTick(() => {
        this.scrollTop = 999999
      })
    },
    
    // 启动会话计时器
    startSessionTimer() {
      if (!this.sessionStartTime) {
        this.sessionStartTime = Date.now()
      }
      
      this.sessionTimer = setInterval(() => {
        this.sessionInfo.sessionDuration = this.formattedSessionDuration
      }, 1000)
    },
    
    // 标记所有消息为已读
    async markAllMessagesAsRead() {
      if (!this.sessionId || this.messages.length === 0) return
      
      try {
        const unreadMessageIds = this.messages
          .filter(msg => msg.senderType !== 'lawyer' && msg.status !== 'read')
          .map(msg => msg.id)
        
        if (unreadMessageIds.length > 0) {
          await markMessagesAsRead({
            conversationId: this.sessionId,
            messageIds: unreadMessageIds
          })
          
          // 更新本地消息状态
          this.messages.forEach(msg => {
            if (unreadMessageIds.includes(msg.id)) {
              msg.status = 'read'
            }
          })
        }
        
      } catch (error) {
        console.warn('标记消息已读失败:', error)
      }
    },
    
    // 智能缓存系统
    getCachedChatData() {
      try {
        const cacheStr = uni.getStorageSync(this.cacheKey)
        if (cacheStr) {
          const cacheData = JSON.parse(cacheStr)
          const isExpired = Date.now() - cacheData.timestamp > this.cacheExpiry
          
          if (!isExpired) {
            return cacheData
          } else {
            // 清除过期缓存
            uni.removeStorageSync(this.cacheKey)
          }
        }
      } catch (error) {
        console.warn('获取缓存聊天数据失败:', error)
      }
      return null
    },
    
    setCachedChatData(data) {
      try {
        const cacheData = {
          ...data,
          timestamp: Date.now()
        }
        uni.setStorageSync(this.cacheKey, JSON.stringify(cacheData))
      } catch (error) {
        console.warn('缓存聊天数据失败:', error)
      }
    },
    
    clearCachedChatData() {
      try {
        uni.removeStorageSync(this.cacheKey)
      } catch (error) {
        console.warn('清除聊天缓存失败:', error)
      }
    },
    
    applyCachedData(cachedData) {
      if (cachedData.sessionInfo) {
        this.sessionInfo = { ...this.sessionInfo, ...cachedData.sessionInfo }
      }
      if (cachedData.messages) {
        this.messages = cachedData.messages
        this.scrollToBottom()
      }
    },
    
    saveChatState() {
      // 保存当前聊天状态
      this.setCachedChatData({
        sessionInfo: this.sessionInfo,
        messages: this.messages,
        lastMessageId: this.lastMessageId,
        sessionStartTime: this.sessionStartTime
      })
    },
    
    // 智能指数退避重试机制
    async callApiWithRetry(apiCall, retryCount = 0) {
      try {
        return await apiCall()
      } catch (error) {
        if (retryCount < this.retryConfig.maxRetries) {
          const delay = Math.min(
            this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffFactor, retryCount) +
            Math.random() * 1000, // 随机抖动避免雷群效应
            this.retryConfig.maxDelay
          )
          
          console.log(`API调用失败，${delay}ms后进行第${retryCount + 1}次重试`)
          await new Promise(resolve => setTimeout(resolve, delay))
          return this.callApiWithRetry(apiCall, retryCount + 1)
        }
        throw error
      }
    },
    
    // 企业级错误处理
    handleApiError(error) {
      let errorType = 'unknown'
      let errorMessage = '操作失败，请稍后重试'
      let canRetry = true

      if (error.code || error.status) {
        const code = error.code || error.status
        switch (code) {
          case 'NETWORK_ERROR':
          case 'TIMEOUT':
          case 'ERR_NETWORK':
            errorType = 'network'
            errorMessage = '网络连接异常，请检查网络设置'
            break
          case 401:
          case 'AUTH_ERROR':
          case 'UNAUTHORIZED':
            errorType = 'auth'
            errorMessage = '登录已过期，请重新登录'
            canRetry = false
            // 可以在这里触发重新登录逻辑
            break
          case 403:
          case 'FORBIDDEN':
            errorType = 'permission'
            errorMessage = '访问权限不足'
            canRetry = false
            break
          case 404:
          case 'NOT_FOUND':
            errorType = 'not_found'
            errorMessage = '会话不存在或已结束'
            canRetry = false
            break
          case 500:
          case 502:
          case 503:
          case 'SERVER_ERROR':
            errorType = 'server'
            errorMessage = '服务器繁忙，请稍后重试'
            break
          default:
            errorMessage = error.message || error.msg || errorMessage
        }
      } else if (error.message) {
        errorMessage = error.message
      }

      this.errorState = {
        hasError: true,
        errorType,
        errorMessage,
        canRetry
      }

      // 显示错误提示
      uni.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 3000
      })

             return { errorType, errorMessage, canRetry }
     },
     
     // 消息时间格式化辅助方法
     shouldShowTimestamp(message, index) {
       if (index === 0) return true
       
       const prevMessage = this.sortedMessages[index - 1]
       if (!prevMessage) return true
       
       const currentTime = new Date(message.timestamp)
       const prevTime = new Date(prevMessage.timestamp)
       
       // 如果消息间隔超过5分钟，显示时间戳
       return (currentTime - prevTime) > 5 * 60 * 1000
     },
     
     formatMessageTime(timestamp) {
       const date = new Date(timestamp)
       const now = new Date()
       const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
       const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
       
       if (messageDate.getTime() === today.getTime()) {
         // 今天，只显示时间
         return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
       } else if (messageDate.getTime() === today.getTime() - 24 * 60 * 60 * 1000) {
         // 昨天
         return '昨天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
       } else {
         // 其他日期
         return date.toLocaleDateString('zh-CN', { 
           month: 'short', 
           day: 'numeric', 
           hour: '2-digit', 
           minute: '2-digit' 
         })
       }
     },
     
     // 文件大小格式化
     formatFileSize(bytes) {
       if (!bytes) return '0 B'
       
       const k = 1024
       const sizes = ['B', 'KB', 'MB', 'GB']
       const i = Math.floor(Math.log(bytes) / Math.log(k))
       
       return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
     },
     
     // 时长格式化
     formatDuration(seconds) {
       if (!seconds) return '0:00'
       
       const mins = Math.floor(seconds / 60)
       const secs = seconds % 60
       return `${mins}:${String(secs).padStart(2, '0')}`
     },
     
     // 加载更多消息
     loadMoreMessages() {
       if (!this.isLoadingMessages && this.hasMoreMessages) {
         this.loadChatMessages(true)
       }
     },
     
     // 刷新消息
     async refreshMessages() {
       await this.loadChatMessages(false)
     },
     
     // 预览图片
     previewImage(imageUrl) {
       uni.previewImage({
         urls: [imageUrl],
         current: imageUrl
       })
     },
     
     // 打开文件
     openFile(message) {
       if (message.mediaUrl) {
         uni.downloadFile({
           url: message.mediaUrl,
           success: (res) => {
             uni.openDocument({
               filePath: res.tempFilePath,
               showMenu: true
             })
           },
           fail: (error) => {
             console.error('下载文件失败:', error)
             uni.showToast({
               title: '文件打开失败',
               icon: 'none'
             })
           }
         })
       }
     },
     
     // 播放音频
     playAudio(message) {
       if (message.mediaUrl) {
         const innerAudioContext = uni.createInnerAudioContext()
         innerAudioContext.autoplay = true
         innerAudioContext.src = message.mediaUrl
         innerAudioContext.onPlay(() => {
           console.log('开始播放音频')
         })
         innerAudioContext.onError((res) => {
           console.error('音频播放失败:', res.errMsg)
           uni.showToast({
             title: '音频播放失败',
             icon: 'none'
           })
         })
       }
     },
     
     // 重发消息
     async resendMessage(message) {
       if (message.type === 'text') {
         // 重发文本消息
         this.inputMessage = message.content
         await this.sendMessage()
       } else if (message.type === 'image') {
         // 重发图片消息（需要重新上传）
         uni.showToast({
           title: '请重新选择图片发送',
           icon: 'none'
         })
       }
       
       // 移除失败的消息
       const index = this.messages.findIndex(msg => msg.id === message.id)
       if (index !== -1) {
         this.messages.splice(index, 1)
       }
     },
     

     
     // 获取未读消息数量
     async getUnreadMessageCount() {
       try {
         const response = await this.callApiWithRetry(async () => {
           return await getUnreadCount()
         })
         
         if (response && response.data) {
           return response.data || 0
         }
         
       } catch (error) {
         console.warn('获取未读消息数量失败:', error)
         return 0
       }
     },
      
      // 清理资源
      clearResources() {
        // 清理发送中的消息
        this.sendingMessages.clear()
        this.messageRetryCount.clear()
        
        // 清理上传进度
        this.uploadProgress = {}
        
        // 重置状态
        this.isLoading = false
        this.isLoadingMessages = false
        this.isSendingMessage = false
        this.isUploadingFile = false
        
        // 清理错误状态
        this.errorState = {
          hasError: false,
          errorType: '',
          errorMessage: '',
          canRetry: false
        }
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

// 系统状态栏占位
.status-bar {
  height: var(--status-bar-height);
  // background 通过动态绑定设置
}

// 自定义导航栏
.custom-navbar {
  // background 通过动态绑定设置
  padding: 15px 15px;
  // 添加阴影
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

// 聊天内容区域
.chat-content {
  flex: 1;
  // padding: 15px;
  background-color: #f8faff;
}

// 时间戳分隔符
.timestamp-separator {
  text-align: center;
  margin: 20px 0;

  .timestamp-text {
    color: #AAAAAA;
    font-size: 10px;
  }
}

// 消息项
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

    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: #D9D9D9;
      margin-left: 8px;
      flex-shrink: 0;
    }

    .message-bubble {
      max-width: 70%;
    }
  }
}

// 消息气泡
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
    // background-color 通过动态绑定设置
    border-bottom-right-radius: 4px;

    .message-text {
      color: #FFFFFF;
    }
  }
}

// 视频邀请卡片
.video-invitation-card {
  margin: 20px auto;
  width: 70%;
  background: linear-gradient(180deg, #e0e9ff 0%, #fff 100%) !important;
  border: 3rpx solid;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;

  .invitation-info {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
    width: 100%;

    .video-icon {
      width: 32px;
      height: 32px;
      // background-color 通过动态绑定设置
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 4px;
      flex-shrink: 0;
    }

    .invitation-text {
      flex: 1;
      text-align: left;

      .invitation-line1,
      .invitation-line2 {
        display: block;
        color: #333333;
        font-size: 16px;
        line-height: 1.4;
      }
    }
  }

  .invitation-buttons {
    display: flex;
    justify-content: space-between;
    width: 100%;
    gap: 15px;

    .reject-button,
    .accept-button {
      flex: 1;
      padding: 8px 20px;
      border-radius: 20rpx;
      text-align: center;
      min-width: 80px;
      font-weight: 500;
      font-size: 0.8rem;
    }

    .reject-button {
      background-color: #F0F0F0;

      .reject-text {
        color: #666666;
        font-size: 12px;
      }
    }

    .accept-button {

      // background-color 通过动态绑定设置
      .accept-text {
        // color 通过动态绑定设置
        font-size: 12px;

      }
    }
  }
}

// 消息输入区域
.message-input-area {
  background-color: #FFFFFF;
  padding: 10px 15px;
  border-top: 1px solid #EEEEEE;

  .input-container {
    position: relative;
    display: flex;
    align-items: center;

    .message-input {
      flex: 1;
      height: 36px;
      background-color: rgb(255, 246, 246);
      border-radius: 18px;
      padding: 0 15px 0 15px;
      padding-right: 45px;
      font-size: 14px;
      border: none;
      background-color: #f6f8ff;

      &::placeholder {
        color: #BDBDBD;
      }
    }

    .add-button {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background-color: transparent;

      &:active {
        background-color: rgba(0, 0, 0, 0.05);
      }
    }
  }
}

// 快捷操作栏
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
      // background-color 通过动态绑定设置
      // box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
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
</style>