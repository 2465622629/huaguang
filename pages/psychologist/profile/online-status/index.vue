<template>
  <view class="container" :style="{ backgroundImage: 'url(' + config.staticBaseUrl + '/bg11.png)' }">
    <!-- 状态栏占位 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

    <!-- 导航区域 -->
    <view class="navigation-area">
      <view class="back-button" @click="goBack">
        <uv-icon name="arrow-left" color="#FF4646" size="20"></uv-icon>
        <text class="back-text">返回</text>
      </view>
    </view>

    <!-- 插画区域 -->
    <view class="illustration-area">
      <image :src="config.staticBaseUrl + '/xinlistatus.png'" class="lawyer-image" mode="aspectFit" />
    </view>

    <!-- 设置卡片区域 -->
    <view class="settings-card">
      <!-- 接受新咨询设置 -->
      <view class="setting-item">
        <text class="setting-label">接受新咨询</text>
        <uv-switch v-model="settings.acceptNewConsultation" :activeColor="switchActiveColor"
          :inactiveColor="switchInactiveColor" :size="switchSize"
          @change="onSwitchChange('acceptNewConsultation', $event)"></uv-switch>
      </view>

      <!-- 分割线 -->
      <view class="divider"></view>

      <!-- 暂不接单设置 -->
      <view class="setting-item">
        <text class="setting-label">暂不接单</text>
        <uv-switch v-model="settings.temporarilyUnavailable" :activeColor="switchActiveColor"
          :inactiveColor="switchInactiveColor" :size="switchSize"
          @change="onSwitchChange('temporarilyUnavailable', $event)"></uv-switch>
      </view>
    </view>

    <!-- 说明文字区域 -->
    <view class="description-area">
      <text class="description-text">你可以随时切换当前在线状态，方便灵活安排接单时间。</text>
    </view>

    <!-- 操作按钮区域 -->
    <view class="action-area">
      <view class="save-button" @click="saveSettings" :class="{ disabled: loading }">
        <text class="save-button-text">{{ loading ? '保存中...' : '点击保存' }}</text>
      </view>
    </view>

    <!-- iOS Home Indicator -->
    <!-- <view class="home-indicator"></view> -->
  </view>
</template>

<script>
import config from '@/config/index.js'
import { updatePsychologistOnlineStatus, getPsychologistProfile } from '@/api/modules/psychologist.js'

export default {
  name: 'PsychologistOnlineStatus',
  data() {
    return {
      config,
      statusBarHeight: 0,
      // 开关设置
      settings: {
        acceptNewConsultation: true,  // 接受新咨询 - 默认开启
        temporarilyUnavailable: false // 暂不接单 - 默认关闭
      },
      loading: false,
      psychologistInfo: {},
      // 开关样式配置
      switchActiveColor: '#FF4646',
      switchInactiveColor: '#CCCCCC',
      switchSize: 36
    }
  },
  onLoad() {
    // 获取状态栏高度
    this.getSystemInfo()
    // 加载保存的设置
    this.loadSettings()
    // 加载服务器状态
    this.loadServerStatus()
  },
  methods: {
    // 获取系统信息
    getSystemInfo() {
      const systemInfo = uni.getSystemInfoSync()
      this.statusBarHeight = systemInfo.statusBarHeight || 20
    },

    // 返回上一页
    goBack() {
      uni.navigateBack({
        delta: 1
      })
    },

    // 开关状态改变处理
    onSwitchChange(key, value) {
      console.log(`设置项 ${key} 改变为:`, value)

      // 如果开启"暂不接单"，自动关闭"接受新咨询"
      if (key === 'temporarilyUnavailable' && value === true) {
        this.settings.acceptNewConsultation = false
      }
      // 如果开启"接受新咨询"，自动关闭"暂不接单"
      else if (key === 'acceptNewConsultation' && value === true) {
        this.settings.temporarilyUnavailable = false
      }
    },

    // 加载服务器状态
    async loadServerStatus() {
      try {
        const response = await getPsychologistProfile()
        this.psychologistInfo = response.data || {}
        
        // 从服务器数据同步状态
        if (this.psychologistInfo.onlineStatus !== undefined) {
          this.settings.acceptNewConsultation = this.psychologistInfo.onlineStatus
          this.settings.temporarilyUnavailable = !this.psychologistInfo.onlineStatus
        }
        
        console.log('服务器状态加载成功:', this.psychologistInfo)
      } catch (error) {
        console.error('服务器状态加载失败:', error)
        // 如果服务器加载失败，使用本地存储的设置
      }
    },

    // 保存设置
    async saveSettings() {
      if (this.loading) return
      
      this.loading = true
      try {
        // 同步到服务器
        const isOnline = this.settings.acceptNewConsultation && !this.settings.temporarilyUnavailable
        await updatePsychologistOnlineStatus(isOnline)
        
        // 保存到本地存储
        uni.setStorageSync('psychologist_online_status', this.settings)

        uni.showToast({
          title: '设置已保存',
          icon: 'success',
          duration: 2000
        })

        console.log('在线状态设置已保存:', this.settings)
      } catch (error) {
        console.error('保存设置失败:', error)
        uni.showToast({
          title: '保存失败，请重试',
          icon: 'none',
          duration: 2000
        })
      } finally {
        this.loading = false
      }
    },

    // 加载保存的设置
    loadSettings() {
      try {
        const savedSettings = uni.getStorageSync('psychologist_online_status')
        if (savedSettings) {
          this.settings = { ...this.settings, ...savedSettings }
          console.log('已加载保存的设置:', this.settings)
        }
      } catch (error) {
        console.error('加载设置失败:', error)
      }
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  overflow: hidden;
}

.status-bar {
  width: 100%;
}

.navigation-area {
  padding: 10rpx 30rpx;
  position: relative;
  z-index: 10;
}

.back-button {
  display: flex;
  align-items: center;
  width: fit-content;
}

.back-text {
  color: #FF4646; 
  font-size: 32rpx;
  margin-left: 8rpx;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

.illustration-area {
  padding: 40rpx 30rpx;
  height: 400rpx;
  position: relative;
  z-index: 10;
}

.lawyer-image {
  width: 550rpx;
  height: 550rpx;
  position: absolute;
  top: 60%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.settings-card {
  margin: 40rpx 30rpx;
  background-color: #FFFFFF;
  border-radius: 24rpx;
  padding: 40rpx 30rpx;
  box-shadow: 0px 8rpx 24rpx rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 10;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10rpx 0;
}

.setting-label {
  color: #333333;
  font-size: 32rpx;
  font-weight: bold;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

.divider {
  height: 1rpx;
  background-color: rgba(0, 0, 0, 0.08);
  margin: 30rpx 0;
}

.description-area {
  padding: 0 40rpx;
  margin-bottom: 60rpx;
  position: relative;
  z-index: 10;
}

.description-text {
  color: #666666;
  font-size: 30rpx;
  line-height: 1.5;
  text-align: left;
  /* 增加字间距 */
  letter-spacing: 2rpx;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

.action-area {
  padding: 0 120rpx;
  margin-bottom: 80rpx;
  position: relative;
  z-index: 10;
}

.save-button {
  width: 100%;
  height: 88rpx;
  background-color: #FF4646;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4rpx 12rpx rgba(255, 70, 70, 0.3);
}

.save-button-text {
  color: #FFFFFF;
  font-size: 32rpx;
  font-weight: 500;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

.home-indicator {
  position: fixed;
  bottom: 10rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 100rpx;
  height: 8rpx;
  background-color: #000000;
  border-radius: 4rpx;
  z-index: 20;
}

/* 响应式适配 */
@media screen and (max-width: 375px) {
  .illustration-area {
    height: 300rpx;
  }

  .lawyer-image {
    width: 250rpx;
    height: 250rpx;
  }

  .settings-card {
    margin: 30rpx 20rpx;
    padding: 30rpx 25rpx;
  }
}

/* 按钮点击效果 */
.save-button:active {
  transform: scale(0.98);
  transition: transform 0.1s ease;
}

.back-button:active {
  opacity: 0.7;
  transition: opacity 0.1s ease;
}
</style>