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
        <view class="sub-title">心理支持</view>
      </view>
    </view>
    
    <!-- 主内容区域背景 -->
    <view class="content-background">
      <!-- 基本材料卡片 -->
      <view class="content-card">
        <view class="card-section-title">基本材料</view>
        
        <!-- 文件上传区域 - 身份证 -->
        <view class="file-upload-area" @click="handleIdCardUpload">
          <view class="upload-icon">+</view>
          <view class="upload-text">上传身份证正反面照片</view>
        </view>
      </view>
      
      <!-- 心理困扰卡片 -->
      <view class="content-card">
        <view class="card-section-title">心理困扰</view>
        
        <!-- 心理困扰文本输入区域 -->
        <view class="psychological-input-area">
          <uv-textarea
            v-model="psychologicalDistress"
            placeholder="请详细描述您的心理困扰情况，包括症状、持续时间、影响程度等"
            height="160"
            maxlength="500"
            :disabled="isSubmitting"
            :customStyle="{
              backgroundColor: isSubmitting ? '#F0F0F0' : '#F5F5F5',
              borderRadius: '24rpx',
              border: 'none'
            }"
            @input="handlePsychologicalInput"
          ></uv-textarea>
          <view class="char-count">{{ psychologicalDistress.length }}/500</view>
        </view>
      </view>
      
      <!-- 问诊资料卡片 -->
      <view class="content-card">
        <view class="card-section-title">问诊资料（选填）</view>
        
        <!-- 文件上传区域 - 问诊资料 -->
        <view class="file-upload-area" @click="handleMedicalRecordUpload">
          <view class="upload-icon">+</view>
          <view class="upload-text">心理咨询记录或相关证明材料</view>
        </view>
      </view>
      
      <!-- 底部提交按钮 -->
      <view
        class="submit-button"
        :class="{ 'submitting': isSubmitting, 'disabled': isSubmitting }"
        @click="handleSubmit"
      >
        <view v-if="isSubmitting" class="loading-spinner"></view>
        <text class="submit-text">{{ isSubmitting ? '提交中...' : '提 交 审 核' }}</text>
      </view>
      
      <!-- 错误提示区域 -->
      <view v-if="errorState.hasError" class="error-container">
        <view class="error-message">{{ errorState.errorMessage }}</view>
        <view v-if="errorState.canRetry" class="retry-button" @click="retrySubmit">
          重试
        </view>
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
  name: 'PsychologicalSupportApplyPage',
  data() {
    return {
      config: config,
      backgroundImage: staticBaseUrl + '/apply-bg.png',
      psychologicalDistress: '',
      idCardFiles: [],
      medicalRecords: [],
      
      // 企业级状态管理
      isLoading: false,
      isSubmitting: false,
      
      // 智能缓存系统
      cacheKey: 'psychological_support_form_cache',
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
  mounted() {
    this.initializePage()
  },
  
  methods: {
    /**
     * 页面初始化
     */
    async initializePage() {
      try {
        this.loadCachedFormData()
        console.log('心理支持申请页面初始化完成')
      } catch (error) {
        console.error('页面初始化失败:', error)
      }
    },

    /**
     * 返回上一页
     */
    goBack() {
      // 保存表单数据到缓存
      this.saveCachedFormData()
      
      uni.navigateBack({
        delta: 1,
        fail: () => {
          uni.switchTab({
            url: '/pages/user/fund/index'
          })
        }
      })
    },

    /**
     * 处理身份证上传
     */
    handleIdCardUpload() {
      if (this.isSubmitting) return
      
      uni.chooseImage({
        count: 2,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.idCardFiles = res.tempFilePaths
          uni.showToast({
            title: '身份证照片已选择',
            icon: 'success'
          })
          this.saveCachedFormData()
        },
        fail: (error) => {
          console.error('选择身份证照片失败:', error)
          uni.showToast({
            title: '选择照片失败',
            icon: 'none'
          })
        }
      })
    },

    /**
     * 处理心理困扰描述输入
     */
    handlePsychologicalInput(e) {
      this.psychologicalDistress = e.detail.value
      // 实时保存到缓存
      this.saveCachedFormData()
    },

    /**
     * 处理问诊资料上传
     */
    handleMedicalRecordUpload() {
      if (this.isSubmitting) return
      
      uni.chooseImage({
        count: 5,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.medicalRecords = res.tempFilePaths
          uni.showToast({
            title: '问诊资料已选择',
            icon: 'success'
          })
          this.saveCachedFormData()
        },
        fail: (error) => {
          console.error('选择问诊资料失败:', error)
          uni.showToast({
            title: '选择文件失败',
            icon: 'none'
          })
        }
      })
    },

    /**
     * 智能缓存管理 - 保存表单数据
     */
    saveCachedFormData() {
      try {
        const formData = {
          psychologicalDistress: this.psychologicalDistress,
          idCardFiles: this.idCardFiles,
          medicalRecords: this.medicalRecords,
          timestamp: Date.now()
        }
        
        uni.setStorageSync(this.cacheKey, formData)
      } catch (error) {
        console.error('保存表单缓存失败:', error)
      }
    },

    /**
     * 智能缓存管理 - 加载表单数据
     */
    loadCachedFormData() {
      try {
        const cachedData = uni.getStorageSync(this.cacheKey)
        if (cachedData && cachedData.timestamp) {
          const isExpired = Date.now() - cachedData.timestamp > this.cacheExpiry
          
          if (!isExpired) {
            this.psychologicalDistress = cachedData.psychologicalDistress || ''
            this.idCardFiles = cachedData.idCardFiles || []
            this.medicalRecords = cachedData.medicalRecords || []
            
            console.log('已加载缓存的表单数据')
          } else {
            // 清理过期缓存
            uni.removeStorageSync(this.cacheKey)
          }
        }
      } catch (error) {
        console.error('加载表单缓存失败:', error)
      }
    },

    /**
     * 清理错误状态
     */
    clearErrorState() {
      this.errorState = {
        hasError: false,
        errorType: '',
        errorMessage: '',
        canRetry: false
      }
    },

    /**
     * 设置错误状态
     */
    setErrorState(type, message, canRetry = false) {
      this.errorState = {
        hasError: true,
        errorType: type,
        errorMessage: message,
        canRetry
      }
    },

    /**
     * 表单验证
     */
    validateForm() {
      if (!this.psychologicalDistress.trim()) {
        this.setErrorState('validation', '请详细描述您的心理困扰情况')
        return false
      }

      if (this.psychologicalDistress.trim().length < 20) {
        this.setErrorState('validation', '心理困扰描述至少需要20个字符，请详细说明')
        return false
      }

      if (this.idCardFiles.length === 0) {
        this.setErrorState('validation', '请上传身份证正反面照片')
        return false
      }

      return true
    },

    /**
     * 指数退避重试机制
     */
    async executeWithRetry(apiCall, retryCount = 0) {
      try {
        return await apiCall()
      } catch (error) {
        if (retryCount < this.retryConfig.maxRetries) {
          // 计算延迟时间：基础延迟 * 退避因子^重试次数 + 随机抖动
          const baseDelay = this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffFactor, retryCount)
          const jitter = Math.random() * 0.3 * baseDelay // 30%随机抖动
          const delay = Math.min(baseDelay + jitter, this.retryConfig.maxDelay)
          
          console.log(`API调用失败，${delay}ms后进行第${retryCount + 1}次重试:`, error.message)
          
          await new Promise(resolve => setTimeout(resolve, delay))
          return this.executeWithRetry(apiCall, retryCount + 1)
        }
        throw error
      }
    },

    /**
     * 重试提交
     */
    async retrySubmit() {
      this.clearErrorState()
      await this.handleSubmit()
    },

    /**
     * 处理提交申请
     */
    async handleSubmit() {
      if (this.isSubmitting) return

      // 清理之前的错误状态
      this.clearErrorState()

      // 表单验证
      if (!this.validateForm()) {
        return
      }

      this.isSubmitting = true

      try {
        // 构建提交数据
        const submitData = {
          applicationType: 'psychological_support',
          basicInfo: {
            psychologicalDistress: this.psychologicalDistress.trim(),
            applicationDate: new Date().toISOString(),
            hasMedicalRecords: this.medicalRecords.length > 0
          },
          supportingDocuments: {
            idCardFiles: this.idCardFiles,
            medicalRecords: this.medicalRecords
          },
          metadata: {
            deviceInfo: uni.getSystemInfoSync(),
            submitTime: Date.now(),
            formVersion: '1.0.0'
          }
        }

        console.log('提交心理支持申请数据:', submitData)

        // 使用指数退避重试机制调用API
        const result = await this.executeWithRetry(async () => {
          return await youthAssistanceApi.submitPsychologicalSupport(submitData)
        })

        console.log('心理支持申请提交成功:', result)

        // 清理缓存的表单数据
        uni.removeStorageSync(this.cacheKey)

        // 显示成功提示
        uni.showToast({
          title: '申请提交成功',
          icon: 'success',
          duration: 2000
        })

        // 延迟返回上一页
        setTimeout(() => {
          this.goBack()
        }, 2000)

      } catch (error) {
        console.error('心理支持申请提交失败:', error)
        
        // 错误分类和处理
        let errorMessage = '申请提交失败，请稍后重试'
        let canRetry = true

        if (error.code === 'NETWORK_ERROR') {
          errorMessage = '网络连接失败，请检查网络后重试'
        } else if (error.code === 'VALIDATION_ERROR') {
          errorMessage = error.message || '提交数据验证失败'
          canRetry = false
        } else if (error.code === 'SERVER_ERROR') {
          errorMessage = '服务器繁忙，请稍后重试'
        } else if (error.code === 'TIMEOUT') {
          errorMessage = '请求超时，请重试'
        } else if (error.status === 401) {
          errorMessage = '登录已过期，请重新登录'
          canRetry = false
        } else if (error.status === 403) {
          errorMessage = '没有权限执行此操作'
          canRetry = false
        } else if (error.status >= 500) {
          errorMessage = '服务器错误，请稍后重试'
        }

        this.setErrorState('submit', errorMessage, canRetry)

        // 用户行为跟踪
        console.log('用户操作记录:', {
          action: 'psychological_support_submit_failed',
          error: error.message,
          timestamp: Date.now(),
          formData: {
            psychologicalDistressLength: this.psychologicalDistress.length,
            hasIdCard: this.idCardFiles.length > 0,
            hasMedicalRecords: this.medicalRecords.length > 0
          }
        })

      } finally {
        this.isSubmitting = false
      }
    }
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
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 160rpx;
        
        .upload-icon {
          color: #C0C0C0;
          font-size: 120rpx;
          font-weight: normal;
          line-height: 1;
          margin-bottom: 15rpx;
        }
        
        .upload-text {
          color: #888888;
          font-size: 28rpx;
          font-weight: normal;
          text-align: center;
        }
      }
      
      .psychological-input-area {
        position: relative;
        
        .char-count {
          position: absolute;
          bottom: 10rpx;
          right: 15rpx;
          font-size: 24rpx;
          color: #999999;
        }
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
      position: relative;
      transition: all 0.3s ease;
      
      &.submitting {
        background-color: #A0A0A0;
        
        .loading-spinner {
          width: 32rpx;
          height: 32rpx;
          border: 4rpx solid #FFFFFF;
          border-top: 4rpx solid transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-right: 16rpx;
        }
      }
      
      &.disabled {
        opacity: 0.6;
        pointer-events: none;
      }
      
      .submit-text {
        color: #FFFFFF;
        font-size: 36rpx;
        font-weight: bold;
        letter-spacing: 8rpx;
      }
    }
    
    .error-container {
      background-color: #FFF2F0;
      border: 2rpx solid #FFCCC7;
      border-radius: 24rpx;
      padding: 24rpx;
      margin: 20rpx auto 0 auto;
      width: 90%;
      display: flex;
      flex-direction: column;
      align-items: center;
      
      .error-message {
        color: #FF4D4F;
        font-size: 28rpx;
        text-align: center;
        margin-bottom: 16rpx;
        line-height: 1.4;
      }
      
      .retry-button {
        background-color: #FF4D4F;
        color: #FFFFFF;
        padding: 12rpx 32rpx;
        border-radius: 20rpx;
        font-size: 26rpx;
        font-weight: bold;
        
        &:active {
          opacity: 0.8;
        }
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

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>