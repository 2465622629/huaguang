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
      <!-- 加载状态提示 -->
      <view v-if="isLoading" class="loading-container">
        <view class="loading-spinner"></view>
        <text class="loading-text">正在加载设置...</text>
      </view>
      
      <!-- 设置卡片 -->
      <view class="settings-card" :class="{ 'disabled': isLoading || isSaving }">
        <!-- 咨询通知 -->
        <view class="setting-item">
          <text class="setting-label">咨询通知</text>
          <view class="switch-container">
            <uv-switch
              v-model="notificationSettings.consultation"
              :activeColor="switchActiveColor"
              :inactiveColor="switchInactiveColor"
              :size="switchSize"
              :disabled="isLoading || isSaving"
              @change="onSwitchChange('consultation', $event)"
            ></uv-switch>
            <view v-if="isSaving" class="saving-indicator">
              <text class="saving-text">保存中...</text>
            </view>
          </view>
        </view>
        <view class="divider"></view>
        
        <!-- 审核通知 -->
        <view class="setting-item">
          <text class="setting-label">审核通知</text>
          <view class="switch-container">
            <uv-switch
              v-model="notificationSettings.review"
              :activeColor="switchActiveColor"
              :inactiveColor="switchInactiveColor"
              :size="switchSize"
              :disabled="isLoading || isSaving"
              @change="onSwitchChange('review', $event)"
            ></uv-switch>
            <view v-if="isSaving" class="saving-indicator">
              <text class="saving-text">保存中...</text>
            </view>
          </view>
        </view>
        <view class="divider"></view>
        
        <!-- 收益通知 -->
        <view class="setting-item">
          <text class="setting-label">收益通知</text>
          <view class="switch-container">
            <uv-switch
              v-model="notificationSettings.income"
              :activeColor="switchActiveColor"
              :inactiveColor="switchInactiveColor"
              :size="switchSize"
              :disabled="isLoading || isSaving"
              @change="onSwitchChange('income', $event)"
            ></uv-switch>
            <view v-if="isSaving" class="saving-indicator">
              <text class="saving-text">保存中...</text>
            </view>
          </view>
        </view>
        <view class="divider"></view>
        
        <!-- 系统通知 -->
        <view class="setting-item">
          <text class="setting-label">系统通知</text>
          <view class="switch-container">
            <uv-switch
              v-model="notificationSettings.system"
              :activeColor="switchActiveColor"
              :inactiveColor="switchInactiveColor"
              :size="switchSize"
              :disabled="isLoading || isSaving"
              @change="onSwitchChange('system', $event)"
            ></uv-switch>
            <view v-if="isSaving" class="saving-indicator">
              <text class="saving-text">保存中...</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    
  </view>
</template>

<script>
import { staticBaseUrl } from '@/config/index.js'
import { getNotificationSettings, updateNotificationSettings } from '@/api/modules/lawyer-workspace.js'

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
      switchSize: 36,
      // 加载状态管理
      isLoading: false,
      isSaving: false,
      // 缓存管理
      cacheKey: 'lawyer_notification_settings_cache',
      cacheExpiry: 10 * 60 * 1000, // 10分钟缓存过期时间
      // 错误处理
      lastError: null,
      retryCount: 0,
      maxRetries: 3
    }
  },
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack({
        delta: 1
      })
    },
    
    // 智能指数退避重试机制
    async callApiWithRetry(apiCall, maxRetries = this.maxRetries) {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const result = await apiCall()
          this.retryCount = 0 // 重置重试计数
          return result
        } catch (error) {
          console.error(`API调用失败 (尝试 ${attempt}/${maxRetries}):`, error)
          
          if (attempt === maxRetries) {
            throw error // 最后一次尝试失败，抛出错误
          }
          
          // 指数退避延迟：1000ms, 2000ms, 4000ms，添加随机抖动避免雷群效应
          const baseDelay = Math.min(1000 * Math.pow(2, attempt - 1), 8000)
          const jitter = Math.random() * 1000 // 0-1000ms随机抖动
          const delay = baseDelay + jitter
          
          console.log(`等待 ${Math.round(delay)}ms 后重试...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    },
    
    // 开关状态变更处理
    async onSwitchChange(type, value) {
      console.log(`${type} 通知设置变更为: ${value}`)
      
      // 立即更新UI状态，提供即时反馈
      this.notificationSettings[type] = value
      
      // 异步保存到服务器
      await this.saveNotificationSettings(type, value)
    },
    
    // 保存通知设置到服务器
    async saveNotificationSettings(notificationType = null, enabled = null) {
      if (this.isSaving) return // 防止重复保存
      
      this.isSaving = true
      this.lastError = null
      
      try {
        // 如果指定了特定类型，只更新该类型
        if (notificationType && enabled !== null) {
          const updateData = {
            notificationType,
            enabled
          }
          
          await this.callApiWithRetry(() => updateNotificationSettings(updateData))
          
          // 更新本地缓存
          this.setCachedData({
            ...this.notificationSettings,
            [notificationType]: enabled
          })
          
          uni.showToast({
            title: '设置已保存',
            icon: 'success',
            duration: 1500
          })
        } else {
          // 批量更新所有设置
          const promises = Object.entries(this.notificationSettings).map(([type, enabled]) => {
            return this.callApiWithRetry(() => updateNotificationSettings({
              notificationType: type,
              enabled
            }))
          })
          
          await Promise.all(promises)
          
          // 更新本地缓存
          this.setCachedData(this.notificationSettings)
          
          uni.showToast({
            title: '所有设置已保存',
            icon: 'success',
            duration: 1500
          })
        }
        
        // 同时保存到本地存储作为备份
        uni.setStorageSync('lawyer_notification_settings', this.notificationSettings)
        
      } catch (error) {
        console.error('保存通知设置失败:', error)
        this.lastError = error
        
        // 恢复UI状态
        if (notificationType && enabled !== null) {
          this.notificationSettings[notificationType] = !enabled
        }
        
        this.handleSaveError(error)
      } finally {
        this.isSaving = false
      }
    },
    
    // 从服务器加载通知设置
    async loadNotificationSettings() {
      this.isLoading = true
      this.lastError = null
      
      try {
        // 首先尝试从缓存获取数据
        const cachedData = this.getCachedData()
        if (cachedData) {
          this.notificationSettings = { ...this.notificationSettings, ...cachedData }
          console.log('使用缓存的通知设置数据')
        }
        
        // 从服务器获取最新数据
        const response = await this.callApiWithRetry(() => getNotificationSettings())
        
        if (response && response.data) {
          const serverSettings = this.formatServerData(response.data)
          this.notificationSettings = { ...this.notificationSettings, ...serverSettings }
          
          // 更新缓存
          this.setCachedData(this.notificationSettings)
          
          // 同步到本地存储
          uni.setStorageSync('lawyer_notification_settings', this.notificationSettings)
          
          console.log('通知设置已从服务器加载')
        }
        
      } catch (error) {
        console.error('加载通知设置失败:', error)
        this.handleLoadError(error)
      } finally {
        this.isLoading = false
      }
    },
    
    // 处理加载错误
    handleLoadError(error) {
      this.lastError = error
      
      // 尝试从本地存储恢复数据
      try {
        const localSettings = uni.getStorageSync('lawyer_notification_settings')
        if (localSettings) {
          this.notificationSettings = { ...this.notificationSettings, ...localSettings }
          console.log('使用本地存储的通知设置数据')
          
          uni.showToast({
            title: '已加载本地设置',
            icon: 'none',
            duration: 2000
          })
          return
        }
      } catch (localError) {
        console.error('读取本地存储失败:', localError)
      }
      
      // 显示错误提示
      const errorMessage = this.getErrorMessage(error)
      uni.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 3000
      })
    },
    
    // 处理保存错误
    handleSaveError(error) {
      const errorMessage = this.getErrorMessage(error)
      uni.showToast({
        title: `保存失败: ${errorMessage}`,
        icon: 'none',
        duration: 3000
      })
    },
    
    // 智能缓存管理 - 获取缓存数据
    getCachedData() {
      try {
        const cacheData = uni.getStorageSync(this.cacheKey)
        if (cacheData && cacheData.timestamp) {
          const now = Date.now()
          const isExpired = (now - cacheData.timestamp) > this.cacheExpiry
          
          if (!isExpired && cacheData.data) {
            console.log('使用有效的缓存数据')
            return cacheData.data
          } else {
            console.log('缓存数据已过期，清除缓存')
            uni.removeStorageSync(this.cacheKey)
          }
        }
      } catch (error) {
        console.error('读取缓存数据失败:', error)
        uni.removeStorageSync(this.cacheKey)
      }
      return null
    },
    
    // 智能缓存管理 - 设置缓存数据
    setCachedData(data) {
      try {
        const cacheData = {
          data: data,
          timestamp: Date.now()
        }
        uni.setStorageSync(this.cacheKey, cacheData)
        console.log('缓存数据已更新')
      } catch (error) {
        console.error('设置缓存数据失败:', error)
      }
    },
    
    // 格式化服务器返回的数据
    formatServerData(serverData) {
      const formattedData = {}
      
      try {
        // 处理不同的服务器数据格式
        if (Array.isArray(serverData)) {
          // 如果服务器返回数组格式
          serverData.forEach(item => {
            if (item.notificationType && typeof item.enabled === 'boolean') {
              formattedData[item.notificationType] = item.enabled
            }
          })
        } else if (typeof serverData === 'object') {
          // 如果服务器返回对象格式
          Object.keys(this.notificationSettings).forEach(key => {
            if (serverData.hasOwnProperty(key)) {
              formattedData[key] = Boolean(serverData[key])
            }
          })
        }
        
        console.log('服务器数据格式化完成:', formattedData)
        return formattedData
      } catch (error) {
        console.error('格式化服务器数据失败:', error)
        return {}
      }
    },
    
    // 获取用户友好的错误信息
    getErrorMessage(error) {
      if (!error) return '未知错误'
      
      // 网络错误
      if (error.code === 'NETWORK_ERROR' || error.message?.includes('network')) {
        return '网络连接失败，请检查网络'
      }
      
      // HTTP状态码错误
      if (error.statusCode) {
        switch (error.statusCode) {
          case 400:
            return '请求参数错误'
          case 401:
            return '登录已过期，请重新登录'
          case 403:
            return '没有权限执行此操作'
          case 404:
            return '服务不存在'
          case 500:
            return '服务器内部错误'
          case 502:
          case 503:
          case 504:
            return '服务暂时不可用'
          default:
            return `服务器错误 (${error.statusCode})`
        }
      }
      
      // 业务逻辑错误
      if (error.message) {
        if (error.message.includes('timeout')) {
          return '请求超时，请重试'
        }
        if (error.message.includes('permission')) {
          return '权限不足'
        }
        return error.message
      }
      
      return '操作失败，请重试'
    },
    
    // 同步服务器数据
    async syncWithServer() {
      if (this.isLoading || this.isSaving) return
      
      try {
        console.log('开始同步服务器数据...')
        await this.loadNotificationSettings()
        console.log('服务器数据同步完成')
      } catch (error) {
        console.error('同步服务器数据失败:', error)
      }
    },
    
    // 检查网络状态
    checkNetworkStatus() {
      return new Promise((resolve) => {
        uni.getNetworkType({
          success: (res) => {
            const isConnected = res.networkType !== 'none'
            resolve(isConnected)
          },
          fail: () => {
            resolve(false)
          }
        })
      })
    }
  },
  
  onLoad() {
    // 页面加载时读取保存的设置
    this.loadNotificationSettings()
  },

  computed: {
    backgroundStyle() {
      return {
        backgroundImage: 'url(' + staticBaseUrl + '/bg10.png)'
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

/* 加载状态样式 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: #FFFFFF;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  width: 90%;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #F0F0F0;
  border-top: 3px solid #007AFF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 14px;
  color: #666666;
  text-align: center;
}

/* 禁用状态样式 */
.settings-card.disabled {
  opacity: 0.6;
  pointer-events: none;
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

/* 开关容器样式 */
.switch-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 保存状态指示器 */
.saving-indicator {
  display: flex;
  align-items: center;
}

.saving-text {
  font-size: 12px;
  color: #007AFF;
  margin-left: 8px;
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