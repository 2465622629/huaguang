<template>
  <view class="debt-apply-page" :style="{ backgroundImage: 'url(' + backgroundImage + ')' }">
    <!-- 状态栏占位 -->
    <view class="status-bar"></view>

    <!-- 页眉区域 -->
    <view class="page-header">
      <!-- 返回导航 -->
      <view class="back-navigation" @click="goBack">
        <uv-icon name="arrow-left" color="#FFFFFF" size="18"></uv-icon>
        <text class="back-text">返回</text>
      </view>

      <!-- 页面标题组 -->
      <view class="title-group">
        <view class="main-title">青年帮扶基金申请</view>
        <view class="sub-title">失业援助</view>
      </view>
    </view>

    <!-- 主内容区域背景 -->
    <view class="content-background">
      <!-- 基本材料卡片 -->
      <view class="content-card">
        <view class="card-section-title">基本材料</view>

        <!-- 文件上传区域 - 身份证 -->
        <view class="file-upload-area">
          <view v-if="idCardFiles.length === 0" class="upload-placeholder" @click="handleIdCardUpload">
            <view class="upload-icon">+</view>
            <view class="upload-text">上传身份证正反面照片</view>
            <view class="upload-hint">请确保照片清晰完整</view>
          </view>
          <view v-else class="uploaded-files">
            <view v-for="file in idCardFiles" :key="file.id" class="uploaded-file" @click.stop="previewImage(file.path)">
              <image :src="file.path" class="file-preview" mode="aspectFill"></image>
              <view class="file-info">
                <text class="file-name">{{ file.name }}</text>
                <text class="file-size">{{ (file.size / 1024).toFixed(1) }}KB</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 文件上传区域 - 失业证明 -->
        <view class="file-upload-area">
          <view v-if="unemploymentProofFiles.length === 0" class="upload-placeholder" @click="handleUnemploymentProofUpload">
            <view class="upload-icon">+</view>
            <view class="upload-text">最近一个月的失业证明</view>
            <view class="upload-hint">如离职证明、社保停缴记录等</view>
          </view>
          <view v-else class="uploaded-files">
            <view v-for="file in unemploymentProofFiles" :key="file.id" class="uploaded-file" @click.stop="previewImage(file.path)">
              <image :src="file.path" class="file-preview" mode="aspectFill"></image>
              <view class="file-info">
                <text class="file-name">{{ file.name }}</text>
                <text class="file-size">{{ (file.size / 1024).toFixed(1) }}KB</text>
              </view>
            </view>
          </view>
        </view>
      </view>



      <!-- 个人简历卡片 -->
      <view class="content-card">
        <view class="card-section-title">个人简历（选填）</view>

        <!-- 文件上传区域 - 个人简历 -->
        <view class="file-upload-area">
          <view v-if="resumeFiles.length === 0" class="upload-placeholder" @click="handleResumeUpload">
            <view class="upload-icon">+</view>
            <view class="upload-text">个人简历（用于就业推荐）</view>
            <view class="upload-hint">支持图片格式，有助于为您匹配合适工作</view>
          </view>
          <view v-else class="uploaded-files">
            <view v-for="file in resumeFiles" :key="file.id" class="uploaded-file" @click.stop="previewImage(file.path)">
              <image :src="file.path" class="file-preview" mode="aspectFill"></image>
              <view class="file-info">
                <text class="file-name">{{ file.name }}</text>
                <text class="file-size">{{ (file.size / 1024).toFixed(1) }}KB</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 底部提交按钮 -->
      <view class="submit-button" @click="handleSubmit">
        <text class="submit-text">提 交 审 核</text>
      </view>
    </view>

    <!-- iOS Home Indicator -->
    <!-- <view class="home-indicator"></view> -->
  </view>
</template>

<script>
import config from '@/config/index.js'
import { staticBaseUrl } from '@/config/index.js'
import youthAssistanceApi from '@/api/modules/youth-assistance.js'

export default {
  name: 'UnemploymentAssistanceApplyPage',
  data() {
    return {
      config: config,
      backgroundImage: staticBaseUrl + '/apply-bg.png',

      idCardFiles: [],
      unemploymentProofFiles: [],
      resumeFiles: [],
      
      // 企业级状态管理
      isLoading: false,
      isSubmitting: false,
      
      // 智能缓存系统
      cacheKey: 'unemployment_assistance_form_cache',
      cacheExpiry: 5 * 60 * 1000, // 5分钟缓存
      
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
      }
    }
  },
  methods: {
    // 页面导航
    goBack() {
      // 保存表单缓存
      this.saveFormCache()
      
      uni.navigateBack({
        delta: 1,
        fail: () => {
          uni.switchTab({
            url: '/pages/user/fund/index'
          })
        }
      })
    },

    // 智能缓存系统
    saveFormCache() {
      try {
        const cacheData = {
          timestamp: Date.now()
        }
        uni.setStorageSync(this.cacheKey, JSON.stringify(cacheData))
      } catch (error) {
        console.warn('表单缓存保存失败:', error)
      }
    },

    loadFormCache() {
      try {
        const cacheStr = uni.getStorageSync(this.cacheKey)
        if (cacheStr) {
          const cacheData = JSON.parse(cacheStr)
          const isExpired = Date.now() - cacheData.timestamp > this.cacheExpiry
          
          // 缓存已加载但无需恢复内容
        }
      } catch (error) {
        console.warn('表单缓存加载失败:', error)
      }
    },

    clearFormCache() {
      try {
        uni.removeStorageSync(this.cacheKey)
      } catch (error) {
        console.warn('清除表单缓存失败:', error)
      }
    },

    // 文件上传处理
    handleIdCardUpload() {
      this.uploadFile('idCard', '身份证', this.idCardFiles)
    },

    handleUnemploymentProofUpload() {
      this.uploadFile('unemploymentProof', '失业证明', this.unemploymentProofFiles)
    },

    handleResumeUpload() {
      this.uploadFile('resume', '个人简历', this.resumeFiles)
    },

    async uploadFile(type, typeName, fileArray) {
      try {
        const result = await new Promise((resolve, reject) => {
          uni.chooseImage({
            count: type === 'idCard' ? 2 : 1,
            sizeType: ['compressed'],
            sourceType: ['album', 'camera'],
            success: resolve,
            fail: reject
          })
        })

        if (result.tempFilePaths && result.tempFilePaths.length > 0) {
          // 模拟文件上传成功
          const uploadedFiles = result.tempFilePaths.map((path, index) => ({
            id: Date.now() + index,
            name: `${typeName}_${Date.now()}_${index + 1}.jpg`,
            path: path,
            size: Math.floor(Math.random() * 1000000) + 100000,
            uploadTime: new Date().toISOString()
          }))

          fileArray.push(...uploadedFiles)
          
          uni.showToast({
            title: `${typeName}上传成功`,
            icon: 'success'
          })
        }
      } catch (error) {
        console.error(`${typeName}上传失败:`, error)
        uni.showToast({
          title: `${typeName}上传失败，请重试`,
          icon: 'none'
        })
      }
    },

    // 图片预览功能
    previewImage(imagePath) {
      uni.previewImage({
        current: imagePath,
        urls: [imagePath],
        fail: (error) => {
          console.error('图片预览失败:', error)
          uni.showToast({
            title: '图片预览失败',
            icon: 'none'
          })
        }
      })
    },

    // 指数退避重试机制
    async retryWithBackoff(apiCall, retryCount = 0) {
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
          return this.retryWithBackoff(apiCall, retryCount + 1)
        }
        throw error
      }
    },

    // 错误分类和处理
    handleApiError(error) {
      let errorType = 'unknown'
      let errorMessage = '提交失败，请稍后重试'
      let canRetry = true

      if (error.code) {
        switch (error.code) {
          case 'NETWORK_ERROR':
            errorType = 'network'
            errorMessage = '网络连接异常，请检查网络后重试'
            break
          case 'VALIDATION_ERROR':
            errorType = 'validation'
            errorMessage = error.message || '提交信息有误，请检查后重试'
            canRetry = false
            break
          case 'AUTH_ERROR':
            errorType = 'auth'
            errorMessage = '登录已过期，请重新登录'
            canRetry = false
            break
          case 'QUOTA_EXCEEDED':
            errorType = 'quota'
            errorMessage = '今日申请次数已达上限'
            canRetry = false
            break
          case 'SERVER_ERROR':
            errorType = 'server'
            errorMessage = '服务器繁忙，请稍后重试'
            break
          default:
            errorMessage = error.message || errorMessage
        }
      }

      this.errorState = {
        hasError: true,
        errorType,
        errorMessage,
        canRetry
      }

      return { errorType, errorMessage, canRetry }
    },

    // 表单验证
    validateForm() {
      // 验证身份证文件
      if (this.idCardFiles.length === 0) {
        uni.showToast({
          title: '请上传身份证照片',
          icon: 'none'
        })
        return false
      }

      // 验证失业证明文件
      if (this.unemploymentProofFiles.length === 0) {
        uni.showToast({
          title: '请上传失业证明',
          icon: 'none'
        })
        return false
      }



      return true
    },

    // 主提交方法
    async handleSubmit() {
      if (this.isSubmitting) return

      // 表单验证
      if (!this.validateForm()) return

      this.isSubmitting = true
      this.errorState.hasError = false

      try {
        // 显示加载提示
        uni.showLoading({
          title: '提交中...',
          mask: true
        })

        // 构建提交数据
        const submitData = {
          idCardFiles: this.idCardFiles.map(file => ({
            name: file.name,
            path: file.path,
            size: file.size
          })),
          unemploymentProofFiles: this.unemploymentProofFiles.map(file => ({
            name: file.name,
            path: file.path,
            size: file.size
          })),
          resumeFiles: this.resumeFiles.map(file => ({
            name: file.name,
            path: file.path,
            size: file.size
          })),
          applicationTime: new Date().toISOString(),
          deviceInfo: {
            platform: uni.getSystemInfoSync().platform,
            version: uni.getSystemInfoSync().version
          }
        }

        // 使用重试机制调用API
        const response = await this.retryWithBackoff(async () => {
          return await youthAssistanceApi.submitUnemploymentAssistance(submitData)
        })

        // 提交成功处理
        uni.hideLoading()
        
        // 清除表单缓存
        this.clearFormCache()
        
        // 显示成功提示
        await new Promise(resolve => {
          uni.showModal({
            title: '提交成功',
            content: '您的失业援助申请已提交，我们将在3-5个工作日内审核并联系您。',
            showCancel: false,
            confirmText: '确定',
            success: resolve
          })
        })

        // 返回上一页
        uni.navigateBack({
          delta: 1,
          fail: () => {
            uni.switchTab({
              url: '/pages/user/fund/index'
            })
          }
        })

      } catch (error) {
        console.error('失业援助申请提交失败:', error)
        uni.hideLoading()
        
        const { errorMessage, canRetry } = this.handleApiError(error)
        
        if (canRetry) {
          uni.showModal({
            title: '提交失败',
            content: errorMessage,
            confirmText: '重试',
            cancelText: '取消',
            success: (res) => {
              if (res.confirm) {
                setTimeout(() => this.handleSubmit(), 1000)
              }
            }
          })
        } else {
          uni.showModal({
            title: '提交失败',
            content: errorMessage,
            showCancel: false,
            confirmText: '确定'
          })
        }
      } finally {
        this.isSubmitting = false
      }
    }
  },

  // 生命周期
  onLoad() {
    // 加载表单缓存
    this.loadFormCache()
  },

  onUnload() {
    // 页面卸载时保存表单缓存
    this.saveFormCache()
  }
}
</script>

<style lang="scss" scoped>
.debt-apply-page {
  min-height: 100vh;
  background-color: #EBF4FA;
  position: relative;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: 100% 100%;

  .status-bar {
    height: var(--status-bar-height);
    background: transparent;
  }

  .page-header {
    position: relative;
    padding: 20rpx 30rpx 60rpx;
    overflow: hidden;

    .back-navigation {
      display: flex;
      align-items: center;
      margin-bottom: 40rpx;
      z-index: 10;
      position: relative;

      .back-text {
        color: #FFFFFF;
        font-size: 32rpx;
        margin-left: 8rpx;
        font-weight: normal;
      }
    }

    .title-group {
      z-index: 10;
      position: relative;

      .main-title {
        color: #FFFFFF;
        font-size: 48rpx;
        font-weight: bold;
        line-height: 1.2;
        margin-bottom: 10rpx;
      }

      .sub-title {
        color: #FFFFFF;
        font-size: 40rpx;
        font-weight: bold;
        line-height: 1.2;
      }
    }
  }

  .content-background {
    background-color: #f1f6fd;
    border-top-left-radius: 40rpx;
    border-top-right-radius: 40rpx;
    margin-top: -40rpx;
    position: relative;
    z-index: 2;
    padding: 25rpx 25rpx 60rpx;
    min-height: calc(100vh - 300rpx);

    .content-card {
      background: #FFFFFF;
      border-radius: 48rpx;
      padding: 30rpx;
      box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
      margin-bottom: 30rpx;

      .card-section-title {
        color: #000;
        font-size: 30rpx;
        // font-weight: bold;
        margin-bottom: 20rpx;
      }

      .file-upload-area {
        background-color: #F5F5F5;
        border-radius: 24rpx;
        padding: 40rpx 30rpx;
        margin-bottom: 30rpx;
        min-height: 160rpx;
        transition: all 0.3s ease;

        .upload-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          .upload-icon {
            color: #C0C0C0;
            font-size: 120rpx;
            font-weight: normal;
            line-height: 1;
            margin-bottom: 15rpx;
          }

          .upload-text {
            color: #333333;
            font-size: 28rpx;
            font-weight: 500;
            text-align: center;
            margin-bottom: 8rpx;
          }

          .upload-hint {
            color: #888888;
            font-size: 24rpx;
            text-align: center;
          }
        }

        .uploaded-files {
          .uploaded-file {
            display: flex;
            align-items: center;
            padding: 20rpx;
            background-color: #FFFFFF;
            border-radius: 16rpx;
            margin-bottom: 16rpx;
            border: 2rpx solid #E8F4FD;
            position: relative;
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover {
              border-color: #347ff1;
              box-shadow: 0 4rpx 12rpx rgba(52, 127, 241, 0.15);
            }

            .file-preview {
              width: 80rpx;
              height: 80rpx;
              border-radius: 12rpx;
              margin-right: 20rpx;
              border: 1rpx solid #E8F4FD;
            }

            .file-info {
              flex: 1;
              display: flex;
              flex-direction: column;

              .file-name {
                color: #333333;
                font-size: 26rpx;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                margin-bottom: 8rpx;
              }

              .file-size {
                color: #888888;
                font-size: 22rpx;
              }
            }

          }
        }
      }



      .required-mark {
        color: #FF4757;
        font-size: 28rpx;
        margin-left: 8rpx;
      }
    }

    .submit-button {
      background-color: #347ff1;
      border-radius: 50rpx;
      height: 96rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 40rpx auto 0 auto;
      width: 90%;

      .submit-text {
        color: #FFFFFF;
        font-size: 36rpx;
        font-weight: bold;
        letter-spacing: 8rpx;
      }
    }
  }

  .home-indicator {
    position: fixed;
    bottom: 16rpx;
    left: 50%;
    transform: translateX(-50%);
    width: 268rpx;
    height: 8rpx;
    background-color: #000000;
    border-radius: 4rpx;
  }
}
</style>