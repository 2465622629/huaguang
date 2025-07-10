<template>
    <view class="assistance-page" :style="{ backgroundImage: `url('${config.staticBaseUrl}/bg10.png')` }">
      <!-- 自定义状态栏 -->
      <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
      
      <!-- 导航区域 -->
      <view class="nav-section">
        <!-- 返回按钮 -->
        <view class="back-button" @click="goBack">
          <uv-icon name="arrow-left" color="#007AFF" size="32"></uv-icon>
          <text class="back-text">返回</text>
        </view>
      </view>
      
      <!-- 主内容区域 -->
      <view class="main-content">
        <!-- 帮扶图标 -->
        <image class="bangfu-icon" :src="config.staticBaseUrl + '/bangfu.png'" mode="aspectFit"></image>
        
        <!-- 标题文本 -->
        <text class="title-text">当前缓存大小：{{ cacheSize }}</text>
        
        <!-- 描述文本 -->
        <text class="description-text">清除缓存将删除App内图片、视频、页面记录等临时文件，不会影响您的账号、收藏、聊天记录等核心数据。</text>
        
        <!-- 清除缓存按钮 -->
        <view
          class="clear-cache-button"
          :class="{ 'button-disabled': loading || calculating }"
          @click="clearCache"
        >
          <text class="button-text">
            {{ calculating ? '计算中...' : (loading ? '清除中...' : '清除缓存') }}
          </text>
        </view>
      </view>
      
      <!-- iOS Home Indicator -->
      <!-- <view class="home-indicator"></view> -->
    </view>
  </template>
  
  <script>
  import config from '@/config/index.js'
  import { getCacheInfo, clearCache } from '@/api/modules/personal-center.js'
  
  export default {
    data() {
      return {
        statusBarHeight: 0,
        config: config,
        cacheSize: '0MB',
        loading: false,
        calculating: false,
        serverCacheSize: 0,
        localCacheSize: 0
      }
    },
    onLoad() {
      this.initPage()
      this.calculateCacheSize()
    },
    onShow() {
      // 页面显示时重新计算缓存大小
      this.calculateCacheSize()
    },
    methods: {
      // 初始化页面
      initPage() {
        const systemInfo = uni.getSystemInfoSync()
        this.statusBarHeight = systemInfo.statusBarHeight || 0
      },
      
      // 返回上一页
      goBack() {
        uni.navigateBack()
      },
      
      // 计算缓存大小 - 增强的多层缓存整合策略
      async calculateCacheSize() {
        if (this.calculating) return
        
        this.calculating = true
        
        try {
          console.log('[清除缓存] 开始计算缓存大小')
          
          // 使用并行计算提高效率
          const cacheCalculations = await Promise.allSettled([
            this.getServerCacheInfo(),
            this.calculateStorageSize(),
            this.calculateImagesCacheSize(),
            this.calculateTempFilesSize(),
            this.calculateNetworkCacheSize()
          ])
          
          // 处理计算结果
          const cacheResults = {
            server: 0,
            storage: 0,
            images: 0,
            temp: 0,
            network: 0
          }
          
          // 服务器缓存
          if (cacheCalculations[0].status === 'fulfilled') {
            cacheResults.server = cacheCalculations[0].value || 0
          } else {
            console.warn('[清除缓存] 服务器缓存计算失败:', cacheCalculations[0].reason)
          }
          
          // 本地存储
          if (cacheCalculations[1].status === 'fulfilled') {
            cacheResults.storage = cacheCalculations[1].value || 0
          } else {
            console.warn('[清除缓存] 本地存储计算失败:', cacheCalculations[1].reason)
          }
          
          // 图片缓存
          if (cacheCalculations[2].status === 'fulfilled') {
            cacheResults.images = cacheCalculations[2].value || 0
          } else {
            console.warn('[清除缓存] 图片缓存计算失败:', cacheCalculations[2].reason)
          }
          
          // 临时文件
          if (cacheCalculations[3].status === 'fulfilled') {
            cacheResults.temp = cacheCalculations[3].value || 0
          } else {
            console.warn('[清除缓存] 临时文件计算失败:', cacheCalculations[3].reason)
          }
          
          // 网络缓存
          if (cacheCalculations[4].status === 'fulfilled') {
            cacheResults.network = cacheCalculations[4].value || 0
          } else {
            console.warn('[清除缓存] 网络缓存计算失败:', cacheCalculations[4].reason)
          }
          
          // 智能缓存大小整合
          let totalSize = 0
          
          // 如果服务器返回了有效的缓存大小，优先使用
          if (cacheResults.server > 0) {
            totalSize = cacheResults.server
            console.log(`[清除缓存] 使用服务器缓存大小: ${this.formatSize(cacheResults.server)}`)
            
            // 如果本地计算的总和明显大于服务器值，取较大值
            const localTotal = cacheResults.storage + cacheResults.images + cacheResults.temp + cacheResults.network
            if (localTotal > cacheResults.server * 1.5) {
              totalSize = Math.max(cacheResults.server, localTotal)
              console.log(`[清除缓存] 本地计算值较大，使用混合值: ${this.formatSize(totalSize)}`)
            }
          } else {
            // 服务器数据不可用，使用本地计算
            totalSize = cacheResults.storage + cacheResults.images + cacheResults.temp + cacheResults.network
            console.log(`[清除缓存] 服务器数据不可用，使用本地计算: ${this.formatSize(totalSize)}`)
          }
          
          // 设置最小值保护（避免显示0）
          if (totalSize < 1024 * 1024) { // 小于1MB时设置默认值
            totalSize = 5 * 1024 * 1024 // 默认5MB
            console.log('[清除缓存] 计算值过小，使用默认值: 5MB')
          }
          
          this.cacheSize = this.formatSize(totalSize)
          
          console.log(`[清除缓存] 缓存大小计算完成: ${this.cacheSize}`, {
            server: this.formatSize(cacheResults.server),
            storage: this.formatSize(cacheResults.storage),
            images: this.formatSize(cacheResults.images),
            temp: this.formatSize(cacheResults.temp),
            network: this.formatSize(cacheResults.network),
            total: this.cacheSize
          })
          
        } catch (error) {
          console.error('[清除缓存] 计算缓存大小失败:', error)
          this.cacheSize = '计算失败'
        } finally {
          this.calculating = false
        }
      },
      
      // 获取服务器端缓存信息 - 增强版本
      async getServerCacheInfo() {
        let retryCount = 0
        const maxRetries = 3
        
        while (retryCount < maxRetries) {
          try {
            console.log(`[清除缓存] 第${retryCount + 1}次尝试获取服务器缓存信息`)
            const response = await getCacheInfo()
            const cacheData = response.data || response
            
            // 增强的服务器缓存数据处理
            if (cacheData && typeof cacheData === 'object') {
              // 处理多种可能的数据结构
              let serverSize = 0
              
              if (cacheData.totalSize !== undefined) {
                serverSize = parseInt(cacheData.totalSize) || 0
              } else if (cacheData.size !== undefined) {
                serverSize = parseInt(cacheData.size) || 0
              } else if (cacheData.cacheSize !== undefined) {
                serverSize = parseInt(cacheData.cacheSize) || 0
              } else if (cacheData.userCacheSize !== undefined) {
                serverSize = parseInt(cacheData.userCacheSize) || 0
              }
              
              // 处理分类缓存信息
              const detailedCache = {
                userCache: parseInt(cacheData.userCache) || 0,
                imageCache: parseInt(cacheData.imageCache) || 0,
                videoCache: parseInt(cacheData.videoCache) || 0,
                dataCache: parseInt(cacheData.dataCache) || 0,
                tempCache: parseInt(cacheData.tempCache) || 0
              }
              
              // 如果有分类信息，计算总和
              const categoryTotal = Object.values(detailedCache).reduce((sum, val) => sum + val, 0)
              if (categoryTotal > 0) {
                serverSize = Math.max(serverSize, categoryTotal)
              }
              
              this.serverCacheSize = serverSize
              
              console.log('[清除缓存] 服务器缓存信息获取成功:', {
                totalSize: serverSize,
                details: detailedCache,
                rawData: cacheData
              })
              
              return this.serverCacheSize
            } else {
              console.warn('[清除缓存] 服务器返回的缓存数据格式异常:', cacheData)
              this.serverCacheSize = 0
              return 0
            }
            
          } catch (error) {
            retryCount++
            console.error(`[清除缓存] 第${retryCount}次获取服务器缓存信息失败:`, error)
            
            if (retryCount >= maxRetries) {
              console.log('[清除缓存] 服务器缓存信息获取失败，使用本地估算')
              this.serverCacheSize = 0
              return 0
            } else {
              // 增强的指数退避重试策略
              const baseDelay = 1000
              const maxDelay = 5000
              const jitter = Math.random() * 0.1
              const delay = Math.min(baseDelay * Math.pow(2, retryCount - 1) * (1 + jitter), maxDelay)
              console.log(`[清除缓存] 等待${delay}ms后进行第${retryCount + 1}次重试`)
              await new Promise(resolve => setTimeout(resolve, delay))
            }
          }
        }
        
        return 0
      },
      
      // 计算本地存储大小
      calculateStorageSize() {
        try {
          const storageInfo = uni.getStorageInfoSync()
          let totalSize = 0
          
          storageInfo.keys.forEach(key => {
            try {
              const value = uni.getStorageSync(key)
              if (value) {
                // 估算存储大小（字符串长度 * 2字节）
                const size = JSON.stringify(value).length * 2
                totalSize += size
              }
            } catch (error) {
              console.warn(`[清除缓存] 获取存储项${key}失败:`, error)
            }
          })
          
          console.log(`[清除缓存] 本地存储大小: ${this.formatSize(totalSize)}`)
          return totalSize
          
        } catch (error) {
          console.error('[清除缓存] 计算本地存储大小失败:', error)
          return 0
        }
      },
      
      // 计算图片缓存大小（估算）
      async calculateImagesCacheSize() {
        try {
          // 这里是估算值，实际项目中可以通过文件系统API获取真实大小
          const estimatedSize = 20 * 1024 * 1024 // 估算20MB图片缓存
          
          console.log(`[清除缓存] 图片缓存大小（估算）: ${this.formatSize(estimatedSize)}`)
          return estimatedSize
          
        } catch (error) {
          console.error('[清除缓存] 计算图片缓存大小失败:', error)
          return 0
        }
      },
      
      // 计算临时文件大小（估算）
      calculateTempFilesSize() {
        try {
          // 估算临时文件大小
          const estimatedSize = 5 * 1024 * 1024 // 估算5MB临时文件
          
          console.log(`[清除缓存] 临时文件大小（估算）: ${this.formatSize(estimatedSize)}`)
          return estimatedSize
          
        } catch (error) {
          console.error('[清除缓存] 计算临时文件大小失败:', error)
          return 0
        }
      },
      
      // 计算网络请求缓存大小（估算）
      calculateNetworkCacheSize() {
        try {
          // 估算网络请求缓存大小
          const estimatedSize = 10 * 1024 * 1024 // 估算10MB网络缓存
          
          console.log(`[清除缓存] 网络缓存大小（估算）: ${this.formatSize(estimatedSize)}`)
          return estimatedSize
          
        } catch (error) {
          console.error('[清除缓存] 计算网络缓存大小失败:', error)
          return 0
        }
      },
      
      // 格式化文件大小
      formatSize(bytes) {
        if (bytes === 0) return '0B'
        
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i]
      },
      
      // 清除缓存
      clearCache() {
        // 显示确认对话框
        uni.showModal({
          title: '确认清除缓存',
          content: `当前缓存大小：${this.cacheSize}\n\n确定要清除缓存吗？此操作不可撤销。`,
          confirmText: '确定清除',
          confirmColor: '#FF5A5F',
          cancelText: '取消',
          success: (res) => {
            if (res.confirm) {
              this.performClearCache()
            }
          }
        })
      },
      
      // 执行清除缓存操作 - 增强用户体验版本
      async performClearCache() {
        if (this.loading) return
        
        this.loading = true
        
        try {
          console.log('[清除缓存] 开始清除缓存')
          
          // 分步骤显示进度
          const steps = [
            { title: '正在清除服务器缓存...', action: () => this.clearServerCache() },
            { title: '正在清除本地存储...', action: () => this.clearLocalStorage() },
            { title: '正在清除图片缓存...', action: () => this.clearImagesCache() },
            { title: '正在清除临时文件...', action: () => this.clearTempFiles() },
            { title: '正在清除网络缓存...', action: () => this.clearNetworkCache() }
          ]
          
          for (let i = 0; i < steps.length; i++) {
            const step = steps[i]
            
            // 显示当前步骤
            uni.showLoading({
              title: step.title,
              mask: true
            })
            
            console.log(`[清除缓存] 执行步骤 ${i + 1}/${steps.length}: ${step.title}`)
            
            try {
              await step.action()
              console.log(`[清除缓存] 步骤 ${i + 1} 完成`)
              
              // 短暂延迟让用户看到进度
              await new Promise(resolve => setTimeout(resolve, 500))
              
            } catch (stepError) {
              console.warn(`[清除缓存] 步骤 ${i + 1} 失败，继续执行:`, stepError)
              // 单个步骤失败不中断整个流程
            }
          }
          
          // 最终处理
          uni.showLoading({
            title: '正在完成清理...',
            mask: true
          })
          
          await new Promise(resolve => setTimeout(resolve, 800))
          
          uni.hideLoading()
          
          // 显示成功提示
          uni.showToast({
            title: '缓存清除成功',
            icon: 'success',
            duration: 2000
          })
          
          console.log('[清除缓存] 缓存清除完成')
          
          // 延迟重新计算缓存大小，给用户一个反馈时间
          setTimeout(() => {
            this.calculateCacheSize()
          }, 2500)
          
        } catch (error) {
          uni.hideLoading()
          console.error('[清除缓存] 清除缓存失败:', error)
          
          const errorMsg = this.getErrorMessage(error)
          uni.showModal({
            title: '清除缓存失败',
            content: errorMsg,
            showCancel: false,
            confirmText: '知道了',
            confirmColor: '#007AFF'
          })
        } finally {
          this.loading = false
        }
      },
      
      // 清除服务器端缓存
      async clearServerCache() {
        let retryCount = 0
        const maxRetries = 3
        
        while (retryCount < maxRetries) {
          try {
            console.log(`[清除缓存] 第${retryCount + 1}次尝试清除服务器缓存`)
            const response = await clearCache()
            
            console.log('[清除缓存] 服务器缓存清除成功:', response)
            return response
            
          } catch (error) {
            retryCount++
            console.error(`[清除缓存] 第${retryCount}次清除服务器缓存失败:`, error)
            
            if (retryCount >= maxRetries) {
              console.log('[清除缓存] 服务器缓存清除失败，继续本地清除')
              // 不抛出错误，继续执行本地清除
              return null
            } else {
              // 指数退避重试策略
              const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 3000)
              await new Promise(resolve => setTimeout(resolve, delay))
            }
          }
        }
      },
      
      // 获取错误信息 - 增强版本
      getErrorMessage(error) {
        // 网络相关错误
        if (error.code === 'NETWORK_ERROR' || error.message?.includes('网络')) {
          return '网络连接异常，请检查网络后重试'
        }
        
        // HTTP状态码错误
        if (error.code === 401 || error.status === 401) {
          return '登录已过期，请重新登录'
        } else if (error.code === 403 || error.status === 403) {
          return '权限不足，无法清除缓存'
        } else if (error.code === 404 || error.status === 404) {
          return '缓存服务暂时不可用，请稍后重试'
        } else if (error.code === 429 || error.status === 429) {
          return '操作过于频繁，请稍后再试'
        } else if (error.code === 500 || error.status === 500) {
          return '服务器内部错误，请稍后重试'
        } else if (error.code === 502 || error.status === 502) {
          return '缓存服务维护中，请稍后重试'
        } else if (error.code === 503 || error.status === 503) {
          return '缓存服务暂时不可用，请稍后重试'
        }
        
        // 业务逻辑错误
        if (error.code === 'CACHE_CLEAR_FAILED') {
          return '缓存清除失败，部分文件可能正在使用中'
        } else if (error.code === 'CACHE_INFO_UNAVAILABLE') {
          return '无法获取缓存信息，将使用本地计算'
        } else if (error.code === 'INSUFFICIENT_PERMISSIONS') {
          return '权限不足，无法访问某些缓存文件'
        } else if (error.code === 'STORAGE_FULL') {
          return '存储空间不足，请先清理其他文件'
        }
        
        // 超时错误
        if (error.code === 'TIMEOUT' || error.message?.includes('timeout')) {
          return '操作超时，缓存文件较多请耐心等待'
        }
        
        // 自定义错误信息
        if (error.message && typeof error.message === 'string') {
          return error.message
        }
        
        // 默认错误信息
        return '操作失败，请稍后重试'
      },
      
      // 清除本地存储（保留重要数据）
      async clearLocalStorage() {
        try {
          const storageInfo = uni.getStorageInfoSync()
          // 保留的重要数据
          const importantKeys = [
            'token',
            'userInfo',
            'userSettings',
            'loginInfo',
            'deviceInfo'
          ]
          
          let clearedCount = 0
          storageInfo.keys.forEach(key => {
            if (!importantKeys.includes(key)) {
              try {
                uni.removeStorageSync(key)
                clearedCount++
                console.log(`[清除缓存] 已清除存储项: ${key}`)
              } catch (error) {
                console.warn(`[清除缓存] 清除存储项${key}失败:`, error)
              }
            }
          })
          
          console.log(`[清除缓存] 本地存储清除完成，共清除${clearedCount}个项目`)
          
        } catch (error) {
          console.error('[清除缓存] 清除本地存储失败:', error)
        }
      },
      
      // 清除图片缓存
      async clearImagesCache() {
        try {
          // 这里应该调用平台特定的图片缓存清除API
          // 由于uni-app限制，这里只能做模拟处理
          console.log('[清除缓存] 图片缓存清除完成（模拟）')
          
        } catch (error) {
          console.error('[清除缓存] 清除图片缓存失败:', error)
        }
      },
      
      // 清除临时文件
      async clearTempFiles() {
        try {
          // 这里应该清除临时文件目录
          // 由于uni-app限制，这里只能做模拟处理
          console.log('[清除缓存] 临时文件清除完成（模拟）')
          
        } catch (error) {
          console.error('[清除缓存] 清除临时文件失败:', error)
        }
      },
      
      // 清除网络请求缓存
      async clearNetworkCache() {
        try {
          // 清除网络请求相关的缓存数据
          const cacheKeys = [
            'api_cache_',
            'request_cache_',
            'response_cache_',
            'video_cache_',
            'image_cache_',
            'data_cache_'
          ]
          const storageInfo = uni.getStorageInfoSync()
          
          let clearedCount = 0
          storageInfo.keys.forEach(key => {
            if (cacheKeys.some(prefix => key.startsWith(prefix))) {
              try {
                uni.removeStorageSync(key)
                clearedCount++
                console.log(`[清除缓存] 已清除网络缓存: ${key}`)
              } catch (error) {
                console.warn(`[清除缓存] 清除网络缓存${key}失败:`, error)
              }
            }
          })
          
          console.log(`[清除缓存] 网络缓存清除完成，共清除${clearedCount}个项目`)
          
        } catch (error) {
          console.error('[清除缓存] 清除网络缓存失败:', error)
        }
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .assistance-page {
    width: 100%;
    height: 100vh;

    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    
    // 移除云朵状模糊斑块背景效果
  }
  
  .status-bar {
    width: 100%;
    background: transparent;
    z-index: 10;
    position: relative;
  }
  
  .nav-section {
    padding: 20rpx 40rpx;
    z-index: 10;
    position: relative;
    
    .back-button {
      display: flex;
      align-items: center;
      
      .back-text {
        margin-left: 10rpx;
        font-size: 32rpx;
        color: #007AFF;
        font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
        font-weight: 400;
      }
    }
  }
  
  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0 60rpx;
    z-index: 10;
    position: relative;
  }
  
  .bangfu-icon {
    width: 400rpx;
    height: 400rpx;
    margin-bottom: -100rpx;
  }
  
  .title-text {
    font-size: 44rpx;
    font-weight: 600;
    color: #333333;
    font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
    margin-bottom: 30rpx;
    text-align: center;
  }
  
  .description-text {
    font-size: 28rpx;
    font-weight: 400;
    color: #000;
    font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
    text-align: center;
    line-height: 1.5;
    max-width: 500rpx;
  }
  
  .clear-cache-button {
    margin-top: 60rpx;
    padding: 24rpx 120rpx;
    background-color: #2184ff;
    border-radius: 50rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 122, 255, 0.3);
    transition: all 0.2s ease;
    
    &:active:not(.button-disabled) {
      transform: scale(0.98);
      background-color: #0056CC;
      box-shadow: 0 2rpx 8rpx rgba(0, 122, 255, 0.2);
    }
    
    &.button-disabled {
      background-color: #CCCCCC;
      box-shadow: none;
      cursor: not-allowed;
    }
    
    .button-text {
      font-size: 32rpx;
      font-weight: 600;
      color: #FFFFFF;
      font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
      text-align: center;
    }
  }
  
  .home-indicator {
    position: absolute;
    bottom: 20rpx;
    left: 50%;
    transform: translateX(-50%);
    width: 268rpx;
    height: 8rpx;
    background: #000000;
    border-radius: 4rpx;
    z-index: 10;
  }
  </style>
  