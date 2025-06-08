<template>
  <view class="container" :style="backgroundStyle">
   
    
    <!-- 导航栏 -->
    <view class="navigation-bar">
      <view class="nav-back-btn" @click="goBack">
        <uv-icon name="arrow-left" color="#007AFF" size="18"></uv-icon>
        <text class="nav-back-text">返回</text>
      </view>
    </view>
    
    <!-- 主内容区域 -->
    <view class="main-content">
      <view class="settings-card">
        <!-- 咨询通知 -->
        <view class="setting-item">
          <text class="setting-label">咨询通知</text>
          <uv-switch 
            v-model="notificationSettings.consultation"
            :activeColor="switchActiveColor"
            :inactiveColor="switchInactiveColor"
            :size="switchSize"
            @change="onSwitchChange('consultation', $event)"
          ></uv-switch>
        </view>
        <view class="divider"></view>
        
        <!-- 审核通知 -->
        <view class="setting-item">
          <text class="setting-label">审核通知</text>
          <uv-switch 
            v-model="notificationSettings.review"
            :activeColor="switchActiveColor"
            :inactiveColor="switchInactiveColor"
            :size="switchSize"
            @change="onSwitchChange('review', $event)"
          ></uv-switch>
        </view>
        <view class="divider"></view>
        
        <!-- 收益通知 -->
        <view class="setting-item">
          <text class="setting-label">收益通知</text>
          <uv-switch 
            v-model="notificationSettings.income"
            :activeColor="switchActiveColor"
            :inactiveColor="switchInactiveColor"
            :size="switchSize"
            @change="onSwitchChange('income', $event)"
          ></uv-switch>
        </view>
        <view class="divider"></view>
        
        <!-- 系统通知 -->
        <view class="setting-item">
          <text class="setting-label">系统通知</text>
          <uv-switch 
            v-model="notificationSettings.system"
            :activeColor="switchActiveColor"
            :inactiveColor="switchInactiveColor"
            :size="switchSize"
            @change="onSwitchChange('system', $event)"
          ></uv-switch>
        </view>
      </view>
    </view>
    
  </view>
</template>

<script>
import { staticBaseUrl } from '@/config/index.js'

export default {
  name: 'NotificationSettings',
  data() {
    return {
      // 通知设置状态
      notificationSettings: {
        consultation: true,    // 咨询通知
        review: false,        // 审核通知  
        income: true,         // 收益通知
        system: true          // 系统通知
      },
      // 开关样式配置
      switchActiveColor: '#007AFF',
      switchInactiveColor: '#E0E0E0',
      switchSize: 36
    }
  },
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack({
        delta: 1
      })
    },
    
    // 开关状态变更处理
    onSwitchChange(type, value) {
      console.log(`${type} 通知设置变更为: ${value}`)
      // 这里可以添加保存设置到本地存储或服务器的逻辑
      this.saveNotificationSettings()
    },
    
    // 保存通知设置
    saveNotificationSettings() {
      try {
        uni.setStorageSync('lawyer_notification_settings', this.notificationSettings)
        console.log('通知设置已保存')
      } catch (error) {
        console.error('保存通知设置失败:', error)
      }
    },
    
    // 加载通知设置
    loadNotificationSettings() {
      try {
        const savedSettings = uni.getStorageSync('lawyer_notification_settings')
        if (savedSettings) {
          this.notificationSettings = { ...this.notificationSettings, ...savedSettings }
        }
      } catch (error) {
        console.error('加载通知设置失败:', error)
      }
    }
  },
  
  onLoad() {
    // 页面加载时读取保存的设置
    this.loadNotificationSettings()
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

<style scoped>
.container {
  min-height: 100vh;
  
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
}

/* iOS状态栏样式 */
.status-bar {
  height: 44px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  background: transparent;
}

.status-time {
  font-size: 17px;
  font-weight: 600;
  color: #000000;
}

.status-icons {
  display: flex;
  align-items: center;
  gap: 6px;
}

.signal-icon, .wifi-icon, .battery-icon {
  width: 18px;
  height: 12px;
  background: #000000;
  border-radius: 2px;
}

.signal-icon {
  background: linear-gradient(to right, #000 0%, #000 60%, #ccc 60%, #ccc 80%, #ccc 80%);
}

.wifi-icon {
  border-radius: 50% 50% 0 0;
}

.battery-icon {
  width: 24px;
  height: 12px;
  border: 1px solid #000;
  border-radius: 2px;
  position: relative;
  background: #000;
}

.battery-icon::after {
  content: '';
  position: absolute;
  right: -3px;
  top: 3px;
  width: 2px;
  height: 6px;
  background: #000;
  border-radius: 0 1px 1px 0;
}

/* 导航栏样式 */
.navigation-bar {
  height: 44px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  background: transparent;
}

.nav-back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
}

.nav-back-text {
  font-size: 17px;
  color: #007AFF;
  font-weight: 400;
}

/* 主内容区域 */
.main-content {
  padding: 20px 15px;
  display: flex;
  justify-content: center;
}

.settings-card {
  width: 90%;
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

/* 设置项样式 */
.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 30rpx;
  min-height: 44px;
}

.setting-label {
  font-size: 16px;
  color: #333333;
  font-weight: 400;
}

/* 分割线样式 */
.divider {
  height: 1px;
  background: #F0F0F0;
  margin: 0 20px;
}

.setting-item:last-child + .divider {
  display: none;
}

/* iOS Home Indicator */
.home-indicator {
  position: fixed;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 134px;
  height: 5px;
  background: #000000;
  border-radius: 3px;
}

/* 响应式调整 */
@media screen and (max-width: 375px) {
  .settings-card {
    width: 95%;
  }
  
  .setting-item {
    padding: 10px 12px;
  }
  
  .setting-label {
    font-size: 15px;
  }
}
</style> 