<template>
  <view class="credit-recovery-page" :style="{ backgroundImage: `url(${backgroundImage})` }">
    <!-- 状态栏占位 -->
    <view class="status-bar"></view>
    
    <!-- 页眉区域 -->
    <view class="page-header">
      <!-- 返回导航 -->
      <view class="back-navigation" @click="goBack">
        <uv-icon name="arrow-left" color="#FFFFFF" size="18"></uv-icon>
        <text class="back-text">返回</text>
      </view>
      
      <!-- 页面标题 -->
      <view class="page-title">申请信用记录恢复</view>
    </view>
    
    <!-- 主内容区域背景 -->
    <view class="content-background">
      <!-- 第一个内容卡片 - 借款逾期信息 -->
      <view class="content-card">
        <view class="card-section-title">借款逾期信息</view>
        
        <!-- 2x2 网格输入框 -->
        <view class="input-grid-2x2">
          <view class="input-row">
            <view class="input-field">
              <uv-input 
                v-model="formData.loanInfo.bank" 
                placeholder="银行/平台" 
                placeholderClass="input-placeholder"
                border="none"
                customStyle="background-color: #F7F7F7; border-radius: 12rpx; padding: 0; font-size: 28rpx; height: 102rpx; line-height: 102rpx;"
                clearable
              />
            </view>
            <view class="input-field">
              <uv-input 
                v-model="formData.loanInfo.loanTime" 
                placeholder="借款时间" 
                placeholderClass="input-placeholder"
                border="none"
                customStyle="background-color: #F7F7F7; border-radius: 12rpx; padding: 0; font-size: 28rpx; height: 102rpx; line-height: 102rpx;"
                clearable
              />
            </view>
          </view>
          <view class="input-row">
            <view class="input-field">
              <uv-input 
                v-model="formData.loanInfo.amount" 
                placeholder="金额" 
                placeholderClass="input-placeholder"
                border="none"
                customStyle="background-color: #F7F7F7; border-radius: 12rpx; padding: 0; font-size: 28rpx; height: 102rpx; line-height: 102rpx;"
                clearable
              />
            </view>
            <view class="input-field">
              <uv-input 
                v-model="formData.loanInfo.overdueTime" 
                placeholder="逾期时间" 
                placeholderClass="input-placeholder"
                border="none"
                customStyle="background-color: #F7F7F7; border-radius: 12rpx; padding: 0; font-size: 28rpx; height: 102rpx; line-height: 102rpx;"
                clearable
              />
            </view>
          </view>
        </view>
      </view>
      
      <!-- 第二个内容卡片 - 逾期记录补交 -->
      <view class="content-card">
        <view class="card-section-title">逾期记录补交</view>
        
        <!-- 1x2 输入框 -->
        <view class="input-grid-1x2">
          <view class="input-field">
            <uv-input 
              v-model="formData.repaymentInfo.remainingAmount" 
              placeholder="剩余金额" 
              placeholderClass="input-placeholder"
              border="none"
              customStyle="background-color: #F7F7F7; border-radius: 12rpx; padding: 0; font-size: 28rpx; height: 102rpx; line-height: 102rpx;"
              clearable
            />
          </view>
          <view class="input-field">
            <uv-input 
              v-model="formData.repaymentInfo.repaymentAmount" 
              placeholder="补交金额" 
              placeholderClass="input-placeholder"
              border="none"
              customStyle="background-color: #F7F7F7; border-radius: 12rpx; padding: 0; font-size: 28rpx; height: 102rpx; line-height: 102rpx;"
              clearable
            />
          </view>
        </view>
        
        <!-- 文件上传区域 -->
        <view class="file-upload-area" v-if="!formData.repaymentInfo.screenshot" @click="chooseScreenshot">
          <view class="upload-icon">+</view>
          <view class="upload-text">上传补交截图</view>
        </view>
        
        <!-- 图片预览区域 -->
        <view class="screenshot-preview" v-if="formData.repaymentInfo.screenshot">
          <view class="preview-container">
            <image 
              :src="formData.repaymentInfo.screenshot.url || formData.repaymentInfo.screenshot.tempPath" 
              class="preview-image"
              mode="aspectFill"
              @click="previewImage"
              @error="onImageError"
              @load="onImageLoad"
            />
            <view class="preview-overlay" v-if="formData.repaymentInfo.screenshot.status === 'uploading'">
              <uv-loading-icon size="24" mode="circle" color="#FFFFFF"></uv-loading-icon>
              <text class="upload-status-text">上传中...</text>
            </view>
            <view class="preview-overlay" v-if="formData.repaymentInfo.screenshot.status === 'failed'">
              <uv-icon name="close-circle" color="#FFFFFF" size="24"></uv-icon>
              <text class="upload-status-text">上传失败</text>
            </view>
            <view class="delete-btn" @click.stop="deleteScreenshot" v-if="formData.repaymentInfo.screenshot.status !== 'uploading'">
              <uv-icon name="close" color="#FFFFFF" size="12"></uv-icon>
            </view>
          </view>
          <view class="reselect-btn" @click="chooseScreenshot" v-if="formData.repaymentInfo.screenshot.status !== 'uploading'">
            <text class="reselect-text">重新选择</text>
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
import { uploadFile } from '@/utils/file.js'

export default {
  name: 'CreditRecoveryPage',
  data() {
    return {
      config: config,
      backgroundImage: staticBaseUrl + '/apply-bg.png',
      formData: {
        loanInfo: {
          bank: '',
          loanTime: '',
          amount: '',
          overdueTime: ''
        },
        repaymentInfo: {
          remainingAmount: '',
          repaymentAmount: '',
          screenshot: null // { tempPath, url, status: 'uploading' | 'success' | 'failed' }
        }
      }
    }
  },
  methods: {
    goBack() {
      uni.navigateBack({
        delta: 1,
        fail: () => {
          uni.switchTab({
            url: '/pages/user/fund/index'
          })
        }
      })
    },
    
    // 选择截图
    chooseScreenshot() {
      uni.chooseImage({
        count: 1,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempPath = res.tempFilePaths[0]
          this.formData.repaymentInfo.screenshot = {
            tempPath: tempPath,
            url: '',
            status: 'uploading'
          }
          
          // 开始上传
          this.uploadScreenshot(tempPath)
        },
        fail: (err) => {
          console.error('选择图片失败:', err)
          uni.showToast({
            title: '选择图片失败',
            icon: 'none'
          })
        }
      })
    },
    
    // 上传截图
    async uploadScreenshot(filePath) {
      try {
        const uploadParams = {
          file: filePath,
          businessType: 'CREDIT_RECOVERY_SCREENSHOT'
        }
        
        const uploadResult = await uploadFile(uploadParams)
        console.log('上传结果：', uploadResult)
        
        // 上传成功 - 处理不同的响应格式
        const finalUrl = uploadResult.fileUrl || uploadResult.url || this.formData.repaymentInfo.screenshot.tempPath
        console.log('最终使用的图片URL：', finalUrl)
        
        this.formData.repaymentInfo.screenshot = {
          ...this.formData.repaymentInfo.screenshot,
          url: finalUrl,
          fileId: uploadResult.fileId || uploadResult.id || Date.now(),
          status: 'success'
        }
        
        console.log('更新后的screenshot对象：', this.formData.repaymentInfo.screenshot)
        
        uni.showToast({
          title: '上传成功',
          icon: 'success'
        })
      } catch (error) {
        console.error('上传失败:', error)
        this.formData.repaymentInfo.screenshot.status = 'failed'
        
        uni.showToast({
          title: '上传失败，请重试',
          icon: 'none'
        })
      }
    },
    
    // 删除截图
    deleteScreenshot() {
      this.formData.repaymentInfo.screenshot = null
    },
    
    // 预览图片
    previewImage() {
      const screenshot = this.formData.repaymentInfo.screenshot
      if (screenshot && (screenshot.url || screenshot.tempPath)) {
        const previewUrl = screenshot.url || screenshot.tempPath
        uni.previewImage({
          urls: [previewUrl],
          current: 0
        })
      }
    },
    
    // 图片加载成功
    onImageLoad(e) {
      console.log('图片加载成功：', e)
    },
    
    // 图片加载失败
    onImageError(e) {
      console.error('图片加载失败：', e)
      console.log('当前图片URL：', this.formData.repaymentInfo.screenshot?.url)
      console.log('当前tempPath：', this.formData.repaymentInfo.screenshot?.tempPath)
      
      // 如果url加载失败，尝试使用tempPath
      if (this.formData.repaymentInfo.screenshot && this.formData.repaymentInfo.screenshot.url && this.formData.repaymentInfo.screenshot.tempPath) {
        this.formData.repaymentInfo.screenshot.url = this.formData.repaymentInfo.screenshot.tempPath
      }
    },
    
    handleSubmit() {
      // 表单验证
      const { loanInfo, repaymentInfo } = this.formData
      
      if (!loanInfo.bank || !loanInfo.loanTime || !loanInfo.amount || !loanInfo.overdueTime) {
        uni.showToast({
          title: '请完善借款逾期信息',
          icon: 'none'
        })
        return
      }
      
      if (!repaymentInfo.remainingAmount || !repaymentInfo.repaymentAmount) {
        uni.showToast({
          title: '请完善补交信息',
          icon: 'none'
        })
        return
      }
      
      if (!repaymentInfo.screenshot || repaymentInfo.screenshot.status !== 'success') {
        uni.showToast({
          title: '请上传补交截图',
          icon: 'none'
        })
        return
      }
      
      // 显示提交成功提示
      uni.showToast({
        title: '提交成功',
        icon: 'success',
        duration: 1500
      })
      
      // 延时跳转到信用评分页面
      setTimeout(() => {
        uni.navigateTo({
          url: '/pages/user/fund/credit-score/index'
        })
      }, 1500)
    }
  }
}
</script>

<style lang="scss" scoped>
.credit-recovery-page {
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
    padding: 70rpx 30rpx 60rpx;
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
        font-weight: 500;
      }
    }
    
    .page-title {
      color: #FFFFFF;
      font-size: 40rpx;
      font-weight: 600;
      text-align: left;
      z-index: 10;
      position: relative;
    }
  }
  
  .content-background {
    background-color: #F0F5FF;
    border-top-left-radius: 40rpx;
    border-top-right-radius: 40rpx;
    margin-top: -40rpx;
    position: relative;
    z-index: 2;
    padding: 30rpx 30rpx 100rpx;
    min-height: calc(100vh - 300rpx);
    
    .content-card {
      background: #FFFFFF;
      border-radius: 30rpx;
      padding: 40rpx;
      box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
      margin-bottom: 30rpx;
      
      .card-section-title {
        color: #333333;
        font-size: 32rpx;
        font-weight: 500;
        margin-bottom: 30rpx;
      }
      
      .input-grid-2x2 {
        .input-row {
          display: flex;
          gap: 20rpx;
          margin-bottom: 20rpx;
          
          &:last-child {
            margin-bottom: 0;
          }
          
          .input-field {
            flex: 1;
            
            // 移除原有的input-control样式，因为现在使用uv-input
          }
        }
      }
      
      .input-grid-1x2 {
        display: flex;
        gap: 20rpx;
        margin-bottom: 30rpx;
        
        .input-field {
          flex: 1;
          
          // 移除原有的input-control样式，因为现在使用uv-input
        }
      }
      
      .input-placeholder {
        color: #AAAAAA;
      }
      
      // uv-input内部输入框的样式调整
      :deep(.uv-input__content__field-wrapper__field) {
        padding: 34rpx 20rpx !important;
        box-sizing: border-box !important;
      }
      
      .file-upload-area {
        background-color: #F7F7F7;
        border-radius: 16rpx;
        padding: 60rpx 40rpx;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 200rpx;
        
        .upload-icon {
          color: #AAAAAA;
          font-size: 60rpx;
          font-weight: normal;
          line-height: 1;
          margin-bottom: 16rpx;
        }
        
        .upload-text {
          color: #AAAAAA;
          font-size: 28rpx;
          font-weight: normal;
          text-align: center;
        }
      }
      
      .screenshot-preview {
        .preview-container {
          position: relative;
          width: 100%;
          height: 300rpx;
          border-radius: 16rpx;
          overflow: hidden;
          margin-bottom: 20rpx;
          
          .preview-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          
          .preview-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            
            .upload-status-text {
              color: #FFFFFF;
              font-size: 24rpx;
              margin-top: 12rpx;
            }
          }
          
          .delete-btn {
            position: absolute;
            top: 12rpx;
            right: 12rpx;
            width: 40rpx;
            height: 40rpx;
            background-color: rgba(0, 0, 0, 0.6);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
        
        .reselect-btn {
          text-align: center;
          padding: 20rpx;
          
          .reselect-text {
            color: #3B82F6;
            font-size: 28rpx;
          }
        }
      }
    }
    
    .submit-button {
      background-color: #3B82F6;
      border-radius: 50rpx;
      height: 96rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
      width: 90%;
      position: fixed;
      bottom: 90rpx;
      left: 50%;
      transform: translateX(-50%);
      
      .submit-text {
        color: #FFFFFF;
        font-size: 36rpx;
        font-weight: 600;
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