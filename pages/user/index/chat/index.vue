<template>
  <view class="chat-page">
    <!-- 系统状态栏占位 -->
    <view class="status-bar" :style="{ background: themeColors.gradient }"></view>
    
    <!-- 自定义导航栏 -->
    <view class="custom-navbar" :style="{ background: themeColors.gradient }">
      <view class="navbar-content">
        <!-- 返回按钮 -->
        <view class="back-button" @click="goBack">
          <uv-icon name="arrow-left" color="#FFFFFF" size="50" ></uv-icon>
        </view>
        
        <!-- 律师信息和计时器 -->
        <view class="lawyer-info">
          <text class="lawyer-name">林默</text>
          <text class="lawyer-desc">专业心理咨询师</text>
          <view class="timer-container">
            <uv-icon :name="`${config.staticBaseUrl}/icons/shalou.png`" color="#FFFFFF" size="32"></uv-icon>
            <text class="timer-text">19:58</text>
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
      <!-- 时间戳分隔符 -->
      <view class="timestamp-separator">
        <text class="timestamp-text">2025年4月24日 17:01</text>
      </view>
      
      <!-- 接收的消息1 -->
      <view class="message-item received">
        <view class="avatar"></view>
        <view class="message-bubble received-bubble">
          <text class="message-text">你好呀，我是心理咨询师林默。在这里，你可以放心地聊聊自己最近的感受。今天是什么让你想找个人说说话呢？</text>
        </view>
      </view>
      
      <!-- 发送的消息1 -->
      <view class="message-item sent">
        <view class="message-bubble sent-bubble" :style="{ backgroundColor: themeColors.bubbleColor }">
          <text class="message-text">工作特别忙，晚上睡不着，白天又没精神，感觉整个人被掏空了...</text>
        </view>
        <view class="avatar"></view>
      </view>
      
      <!-- 接收的消息2 -->
      <view class="message-item received">
        <view class="avatar"></view>
        <view class="message-bubble received-bubble">
          <text class="message-text">嗯，我能感觉到你现在真的很累...这种"被掏空"的状态持续多久了？是一两周，还是更久？</text>
        </view>
      </view>
      
      <!-- 发送的消息2 -->
      <view class="message-item sent">
        <view class="message-bubble sent-bubble" :style="{ backgroundColor: themeColors.bubbleColor }">
          <text class="message-text">好像几个月了</text>
        </view>
        <view class="avatar"></view>
      </view>
      
      <!-- 视频邀请卡片 -->
      <view class="video-invitation-card" :style="{ backgroundColor: themeColors.cardBg, borderColor: themeColors.cardBorder }">
        <view class="invitation-info">
          <view class="video-icon" :style="{ backgroundColor: themeColors.iconColor }">
            <uv-icon :name="`${config.staticBaseUrl}/icons/zixun-liao.png`" color="#FFFFFF" size="32"></uv-icon>
          </view>
          <view class="invitation-text">
            <text class="invitation-line1">为了让咨询师更好的了解你,</text>
            <text class="invitation-line2">建议向她发送测试结果哦。</text>
          </view>
        </view>
        <view class="invitation-buttons">
          <view class="reject-button" @click="rejectVideo">
            <text class="reject-text">拒绝</text>
          </view>
          <view class="accept-button" @click="acceptVideo" :style="{ backgroundColor: themeColors.acceptBg }">
            <text class="accept-text" :style="{ color: themeColors.acceptText }">同意</text>
          </view>
        </view>
      </view>
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
          <uv-icon :name="`${config.staticBaseUrl}/icons/send_test.png`" color="#FFFFFF" size="64"></uv-icon>
        </view>
        <text class="action-label">发送测试结果</text>
      </view>
      <view class="action-item" @click="openAlbum">
        <view class="action-icon" >
          <uv-icon :name="`${config.staticBaseUrl}/icons/photo.png`" color="#FFFFFF" size="64"></uv-icon>
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
      themeType: 'pink', // 默认粉色主题
      config
    }
  },
  onLoad(options) {
    // 接收页面参数
    if (options.theme) {
      this.themeType = options.theme
    }
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
    }
  },
  mounted() {
    this.calculateChatHeight()
  },
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack()
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
    
    // 发送消息
    sendMessage() {
      if (this.inputMessage.trim()) {
        // 这里可以添加发送消息的逻辑
        console.log('发送消息:', this.inputMessage)
        this.inputMessage = ''
      }
    },
    
    // 显示更多选项
    showMoreOptions() {
      uni.showActionSheet({
        itemList: ['拍照', '从相册选择', '文件'],
        success: (res) => {
          console.log('选择了第' + (res.tapIndex + 1) + '个选项')
        }
      })
    },
    
    // 打开相册
    openAlbum() {
      uni.chooseImage({
        count: 9,
        sizeType: ['original', 'compressed'],
        sourceType: ['album'],
        success: (res) => {
          console.log('选择的图片:', res.tempFilePaths)
        }
      })
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
      uni.showToast({
        title: '已接受视频邀请',
        icon: 'none'
      })
    },
    
    // 语音通话
    makeVoiceCall() {
      uni.showToast({
        title: '发起语音通话',
        icon: 'none'
      })
    },
    
    // 视频通话
    makeVideoCall() {
      uni.showToast({
        title: '发起视频通话',
        icon: 'none'
      })
    },
    
    // 发送测试结果
    sendTestResult() {
      uni.showToast({
        title: '发送测试结果',
        icon: 'none'
      })
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
  background-color: rgb(255, 248, 248);
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
  background: linear-gradient(180deg, rgb(255, 224, 224) 0%, rgb(255, 252, 252) 100%) !important;
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