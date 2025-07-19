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
          <text class="lawyer-name">{{ sessionInfo.expertName }}</text>
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
              </view>
            </template>
            
            <!-- 发送的消息 -->
            <template v-else>
              <view class="message-bubble sent-bubble" :style="{ backgroundColor: themeColors.bubbleColor }">
                <text v-if="message.type === 'text'" class="message-text">{{ message.content }}</text>
              </view>
              <view class="avatar"></view>
            </template>
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
import { getChatMessages, sendMessage as apiSendMessage } from '@/api/modules/chat.js'

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
      expertId: null
    }
  },
  onLoad(options) {
    console.log('聊天页面加载参数:', options)
    
    if (options.theme) {
      this.themeType = options.theme
    }
    
    this.sessionId = options.sessionId || options.conversationId || ''
    this.targetType = options.targetType || options.type || 'psychologist'
    this.targetId = options.targetId || options.expertId || ''

    if (options.testResultId) {
      this.testResultId = options.testResultId || null;
      this.expertId = options.expertId || null;
      // 先加载历史消息，再处理测试结果的显示
      this.initChatData().then(() => {
        this.handleTestResult(this.testResultId)
      })
    } else {
      this.initChatData()
    }
    
    this.cacheKey = `chat_${this.sessionId}_${this.targetType}`
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

          this.messages.push(welcomeMessage, resultMessage)
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
    },

    async loadMessages(isInitialLoad = false) {
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
            senderType: m.senderType === 'user' ? 'user' : 'expert',
            type: m.messageType,
            content: m.content
          }))

          this.messages = [...newMessages.reverse(), ...this.messages]
          this.hasMoreMessages = res.data.pages > this.currentPage
          if (this.hasMoreMessages) {
            this.currentPage++
          }

          if (isInitialLoad) {
            this.$nextTick(() => {
              this.scrollTop = 999999
            })
          }
        }
      } catch (error) {
        console.error('加载消息失败:', error)
      } finally {
        this.loadingMessages = false
      }
    },

    handleScrollToUpper() {
      this.loadMessages()
    },

    async sendMessage() {
      const content = this.inputMessage.trim()
      if (!content || this.sendingMessage) return

      this.sendingMessage = true
      const tempMessageId = 'temp-' + Date.now()

      // 立即显示在界面上
      this.messages.push({
        id: tempMessageId,
        senderType: 'user',
        type: 'text',
        content: content
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
              content: res.data.content
            })
          }
        } else {
          // 发送失败处理
          const index = this.messages.findIndex(m => m.id === tempMessageId)
          if (index !== -1) {
            this.messages[index].content = '消息发送失败，请重试'
            // 可以增加一个重试按钮
          }
        }
      } catch (error) {
        console.error('发送消息失败:', error)
        const index = this.messages.findIndex(m => m.id === tempMessageId)
        if (index !== -1) {
          this.messages[index].content = '网络错误，发送失败'
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

    sendTestResult() {
      if (!this.fullTestResult) {
        uni.showToast({
          title: '当前没有可发送的测试结果',
          icon: 'none'
        })
        return
      }

      const result = this.fullTestResult
      const messageContent = `我完成了 “${result.testName}”，这是我的结果概要：\n- **综合评估**: ${result.resultLevel}\n- **详细描述**: ${result.resultDescription}`

      const userResultMessage = {
        id: 'user-result-' + Date.now(),
        senderType: 'user',
        type: 'text',
        content: messageContent
      }

      this.messages.push(userResultMessage)

      // 滚动到底部以显示新消息
      this.$nextTick(() => {
        this.scrollTop = 999999
      })
    },

    openAlbum() {
      console.log('打开相册')
    }
  },
  beforeDestroy() {
    // 页面销毁前清除计时器
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval)
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
</style> 