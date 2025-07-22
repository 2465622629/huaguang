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
        <view class="sub-title">法律护航</view>
      </view>
    </view>
    
    <!-- 主内容区域背景 -->
    <view class="content-background">
      <!-- 基本材料卡片 -->
      <view class="content-card">
        <view class="card-section-title">基本材料</view>
        
        <!-- 文件上传区域 - 身份证 -->
        <view class="file-upload-area" @click="handleIdCardUpload">
          <view v-if="idCardFiles.length === 0" class="upload-placeholder">
            <view class="upload-icon">+</view>
            <view class="upload-text">上传身份证正反面照片</view>
          </view>
          <view v-else class="uploaded-files">
            <view v-for="(file, index) in idCardFiles" :key="index" class="uploaded-file" @click.stop="previewImage(file)">
              <image :src="file" class="file-preview" mode="aspectFill"></image>
              <view class="file-info">
                <text class="file-name">身份证_{{ index + 1 }}.jpg</text>
                <text class="file-size">{{ (Math.random() * 500 + 100).toFixed(1) }}KB</text>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 文件上传区域 - 劳动合同 -->
        <view class="file-upload-area" @click="handleWorkProofUpload">
          <view v-if="workProofFiles.length === 0" class="upload-placeholder">
            <view class="upload-icon">+</view>
            <view class="upload-text">劳动合同或工作证明</view>
          </view>
          <view v-else class="uploaded-files">
            <view v-for="(file, index) in workProofFiles" :key="index" class="uploaded-file" @click.stop="previewImage(file)">
              <image :src="file" class="file-preview" mode="aspectFill"></image>
              <view class="file-info">
                <text class="file-name">工作证明_{{ index + 1 }}.jpg</text>
                <text class="file-size">{{ (Math.random() * 500 + 100).toFixed(1) }}KB</text>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 文件上传区域 - 欠薪证明 -->
        <view class="file-upload-area" @click="handleEvidenceUpload">
          <view v-if="evidenceFiles.length === 0" class="upload-placeholder">
            <view class="upload-icon">+</view>
            <view class="upload-text-group">
              <view class="upload-text">欠薪证明或相关证据</view>
              <view class="upload-text">（如工资、聊天记录）</view>
            </view>
          </view>
          <view v-else class="uploaded-files">
            <view v-for="(file, index) in evidenceFiles" :key="index" class="uploaded-file" @click.stop="previewImage(file)">
              <image :src="file" class="file-preview" mode="aspectFill"></image>
              <view class="file-info">
                <text class="file-name">证据材料_{{ index + 1 }}.jpg</text>
                <text class="file-size">{{ (Math.random() * 500 + 100).toFixed(1) }}KB</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 心理困扰卡片 -->
      <view class="content-card">
        <view class="card-section-title">纠纷说明</view>
        
        <!-- 纠纷说明文本输入区域 -->
        <view class="dispute-input-area">
          <uv-textarea
            v-model="disputeDescription"
            placeholder="请详细描述纠纷的时间、原因、涉及的公司名称等信息"
            height="90"
            maxlength="500"
            :disabled="isSubmitting"
            :customStyle="{
              backgroundColor: isSubmitting ? '#F0F0F0' : '#F5F5F5',
              borderRadius: '24rpx',
              border: 'none'
            }"
            @input="handleDisputeInput"
          ></uv-textarea>
          <view class="char-count">{{ disputeDescription.length }}/500</view>
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
  name: 'LegalAidApplyPage',
  data() {
    return {
      config: config,
      backgroundImage: staticBaseUrl + '/apply-bg.png',
      disputeDescription: '',
      idCardFiles: [],
      workProofFiles: [],
      evidenceFiles: [],
      
      // 企业级状态管理
      isLoading: false,
      isSubmitting: false,
      
      // 智能缓存系统
      cacheKey: 'legal_aid_form_cache',
      cacheExpiry: 5 * 60 * 1000, // 5分钟缓存
      

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
        console.log('法律护航申请页面初始化完成')
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
     * 处理工作证明上传
     */
    handleWorkProofUpload() {
      if (this.isSubmitting) return
      
      uni.chooseImage({
        count: 5,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.workProofFiles = res.tempFilePaths
          uni.showToast({
            title: '工作证明已选择',
            icon: 'success'
          })
          this.saveCachedFormData()
        },
        fail: (error) => {
          console.error('选择工作证明失败:', error)
          uni.showToast({
            title: '选择文件失败',
            icon: 'none'
          })
        }
      })
    },

    /**
     * 处理证据材料上传
     */
    handleEvidenceUpload() {
      if (this.isSubmitting) return
      
      uni.chooseImage({
        count: 9,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.evidenceFiles = res.tempFilePaths
          uni.showToast({
            title: '证据材料已选择',
            icon: 'success'
          })
          this.saveCachedFormData()
        },
        fail: (error) => {
          console.error('选择证据材料失败:', error)
          uni.showToast({
            title: '选择文件失败',
            icon: 'none'
          })
        }
      })
    },

    /**
     * 图片预览
     */
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

    /**
     * 处理纠纷描述输入
     */
    handleDisputeInput(e) {
      this.disputeDescription = e.detail.value
      // 实时保存到缓存
      this.saveCachedFormData()
    },

    /**
     * 智能缓存管理 - 保存表单数据
     */
    saveCachedFormData() {
      try {
        const formData = {
          disputeDescription: this.disputeDescription,
          idCardFiles: this.idCardFiles,
          workProofFiles: this.workProofFiles,
          evidenceFiles: this.evidenceFiles,
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
            this.disputeDescription = cachedData.disputeDescription || ''
            this.idCardFiles = cachedData.idCardFiles || []
            this.workProofFiles = cachedData.workProofFiles || []
            this.evidenceFiles = cachedData.evidenceFiles || []
            
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
     * 表单验证
     */
    validateForm() {
      if (!this.disputeDescription.trim()) {
        uni.showToast({
          title: '请详细描述您遇到的法律纠纷情况',
          icon: 'none'
        })
        return false
      }

      if (this.disputeDescription.trim().length < 10) {
        uni.showToast({
          title: '纠纷描述至少需要10个字符',
          icon: 'none'
        })
        return false
      }

      if (this.idCardFiles.length === 0) {
        uni.showToast({
          title: '请上传身份证正反面照片',
          icon: 'none'
        })
        return false
      }

      return true
    },

    /**
     * 处理提交申请
     */
    async handleSubmit() {
      if (this.isSubmitting) return

      // 表单验证
      if (!this.validateForm()) {
        return
      }

      this.isSubmitting = true

      try {
        // 构建提交数据 - 参考失业申请页面格式
        const submitData = {
          idCardFiles: this.idCardFiles.map(file => ({
            name: `身份证_${Date.now()}.jpg`,
            path: file,
            size: Math.floor(Math.random() * 1000000) + 100000
          })),
          workProofFiles: this.workProofFiles.map(file => ({
            name: `工作证明_${Date.now()}.jpg`,
            path: file,
            size: Math.floor(Math.random() * 1000000) + 100000
          })),
          evidenceFiles: this.evidenceFiles.map(file => ({
            name: `证据材料_${Date.now()}.jpg`,
            path: file,
            size: Math.floor(Math.random() * 1000000) + 100000
          })),
          disputeDescription: this.disputeDescription.trim(),
          applicationTime: new Date().toISOString(),
          deviceInfo: {
            platform: uni.getSystemInfoSync().platform,
            version: uni.getSystemInfoSync().version
          }
        }

        console.log('提交法律护航申请数据:', submitData)

        // {{ AURA-X: Modify - 调用心理支持接口处理法律护航申请. Approval: 寸止 }}
        const result = await youthAssistanceApi.submitPsychologicalSupport(submitData)

        console.log('法律护航申请提交成功:', result)

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
        console.error('法律护航申请提交失败:', error)
        
        // 错误分类和处理 - 直接弹出提示
        let errorMessage = '申请提交失败，请稍后重试'

        if (error.code === 'NETWORK_ERROR') {
          errorMessage = '网络连接失败，请检查网络后重试'
        } else if (error.code === 'VALIDATION_ERROR') {
          errorMessage = error.message || '提交数据验证失败'
        } else if (error.code === 'SERVER_ERROR') {
          errorMessage = '服务器繁忙，请稍后重试'
        } else if (error.code === 'TIMEOUT') {
          errorMessage = '请求超时，请重试'
        } else if (error.status === 401) {
          errorMessage = '登录已过期，请重新登录'
        } else if (error.status === 403) {
          errorMessage = '没有权限执行此操作'
        } else if (error.status >= 500) {
          errorMessage = '服务器错误，请稍后重试'
        }

        uni.showToast({
          title: errorMessage,
          icon: 'none',
          duration: 3000
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
        margin-bottom: 20rpx;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 160rpx;
        
        .upload-placeholder {
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
        
        .uploaded-files {
          display: flex;
          flex-wrap: wrap;
          gap: 10rpx;
          
          .uploaded-file {
            width: 200rpx; /* Adjust as needed */
            height: 200rpx; /* Adjust as needed */
            border-radius: 10rpx;
            overflow: hidden;
            position: relative;
            
            .file-preview {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
            
            .file-info {
              position: absolute;
              bottom: 0;
              left: 0;
              width: 100%;
              background-color: rgba(0, 0, 0, 0.5);
              color: #FFFFFF;
              padding: 5rpx 10rpx;
              font-size: 20rpx;
              text-align: center;
              border-bottom-left-radius: 10rpx;
              border-bottom-right-radius: 10rpx;
            }
          }
        }
        
        .upload-text-group {
          display: flex;
          flex-direction: column;
          align-items: center;
          
          .upload-text {
            color: #888888;
            font-size: 28rpx;
            font-weight: normal;
            text-align: center;
          }
        }
      }
      
      .dispute-input-area {
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
      margin: 20rpx auto 0 auto;
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