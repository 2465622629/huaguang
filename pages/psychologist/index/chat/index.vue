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
      >
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
          <view class="add-button" @click="showMoreOptions">
            <uv-icon name="plus-circle" color="#888888" size="54"></uv-icon>
          </view>
        </view>
      </view>
      
      <!-- 快捷操作栏 -->
      <view class="quick-actions">
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
          sessionDuration: '19:58',
          sessionStatus: 'active'
        },
        loading: false,
        loadingMessages: false,
        sendingMessage: false,
        currentPage: 1,
        pageSize: 20,
        hasMoreMessages: true,
        cacheKey: '',
        cacheExpiry: 5 * 60 * 1000,
        retryCount: 0,
        maxRetries: 3
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
      
      this.cacheKey = `chat_${this.sessionId}_${this.targetType}`
      
      this.initChatData()
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
      
      calculateChatHeight() {
        const systemInfo = uni.getSystemInfoSync()
        const statusBarHeight = systemInfo.statusBarHeight || 0
        const navBarHeight = 60
        const inputAreaHeight = 50
        const quickActionsHeight = 80
        
        this.chatHeight = `${systemInfo.windowHeight - statusBarHeight - navBarHeight - inputAreaHeight - quickActionsHeight}px`
      },
      
      async initChatData() {
        try {
          this.loading = true
          console.log('初始化聊天数据')
        } catch (error) {
          console.error('初始化聊天数据失败:', error)
        } finally {
          this.loading = false
        }
      },
  
      sendMessage() {
        if (this.inputMessage.trim()) {
          console.log('发送消息:', this.inputMessage)
          this.inputMessage = ''
        }
      },
      
      showMoreOptions() {
        console.log('显示更多选项')
      },
  
      sendTestResult() {
        console.log('发送测试结果')
      },
  
      openAlbum() {
        console.log('打开相册')
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