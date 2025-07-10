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
        <view class="sub-title">债务纾困</view>
      </view>
    </view>
    
    <!-- 主内容区域背景 -->
    <view class="content-background">
      <!-- 内容卡片 -->
      <view class="content-card">
        <!-- 卡片内标题 -->
        <view class="card-section-title">基本材料</view>
        
        <!-- 文件上传区域1 - 身份证 -->
        <view class="file-upload-area" @click="handleIdCardUpload">
          <view class="upload-icon">+</view>
          <view class="upload-text">上传身份证正反面照片</view>
        </view>
        
        <!-- 文件上传区域2 - 债务证明 -->
        <view class="file-upload-area" @click="handleDebtProofUpload">
          <view class="upload-icon">+</view>
          <view class="upload-text-group">
            <view class="upload-text-primary">债务证明材料</view>
            <view class="upload-text-secondary">借款合同、账单截图等</view>
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
  name: 'DebtApplyPage',
  data() {
    return {
      config: config,
      backgroundImage: staticBaseUrl + '/apply-bg.png',
      formData: {
        idCardFiles: [], // 身份证文件列表
        debtProofFiles: [] // 债务证明文件列表
      },
      uploading: false
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
    
    // 身份证上传
    handleIdCardUpload() {
      uni.chooseImage({
        count: 2, // 身份证正反面
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: async (res) => {
          this.uploading = true
          try {
            const uploadPromises = res.tempFilePaths.map(async (filePath, index) => {
              const uploadParams = {
                file: filePath,
                businessType: 'DEBT_RELIEF_ID_CARD'
              }
              const result = await uploadFile(uploadParams)
              return {
                url: result.fileUrl || result.url,
                fileId: result.fileId || result.id,
                type: index === 0 ? 'front' : 'back'
              }
            })
            
            const uploadResults = await Promise.all(uploadPromises)
            this.formData.idCardFiles = uploadResults
            
            uni.showToast({
              title: '身份证上传成功',
              icon: 'success'
            })
          } catch (error) {
            console.error('身份证上传失败：', error)
            uni.showToast({
              title: '上传失败，请重试',
              icon: 'none'
            })
          } finally {
            this.uploading = false
          }
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
    
    // 债务证明上传
    handleDebtProofUpload() {
      uni.chooseImage({
        count: 9, // 最多9张
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: async (res) => {
          this.uploading = true
          try {
            const uploadPromises = res.tempFilePaths.map(async (filePath) => {
              const uploadParams = {
                file: filePath,
                businessType: 'DEBT_RELIEF_PROOF'
              }
              const result = await uploadFile(uploadParams)
              return {
                url: result.fileUrl || result.url,
                fileId: result.fileId || result.id,
                type: 'proof'
              }
            })
            
            const uploadResults = await Promise.all(uploadPromises)
            this.formData.debtProofFiles = [...this.formData.debtProofFiles, ...uploadResults]
            
            uni.showToast({
              title: '债务证明上传成功',
              icon: 'success'
            })
          } catch (error) {
            console.error('债务证明上传失败：', error)
            uni.showToast({
              title: '上传失败，请重试',
              icon: 'none'
            })
          } finally {
            this.uploading = false
          }
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
    
    // 提交申请
    async handleSubmit() {
      // 表单验证
      if (this.formData.idCardFiles.length === 0) {
        uni.showToast({
          title: '请上传身份证照片',
          icon: 'none'
        })
        return
      }
      
      if (this.formData.debtProofFiles.length === 0) {
        uni.showToast({
          title: '请上传债务证明材料',
          icon: 'none'
        })
        return
      }
      
      if (this.uploading) {
        uni.showToast({
          title: '文件上传中，请稍候',
          icon: 'none'
        })
        return
      }
      
      try {
        // 导入青年帮扶API模块
        const youthAssistanceApi = (await import('@/api/modules/youth-assistance.js')).default
        
        // 准备提交数据
        const submitData = {
          applicationType: 'DEBT_RELIEF',
          attachments: [
            ...this.formData.idCardFiles,
            ...this.formData.debtProofFiles
          ]
        }
        
        // 调用债务减免申请接口
        const res = await youthAssistanceApi.submitDebtReliefApplication(submitData)
        
        if (res && res.success) {
          uni.showToast({
            title: '债务减免申请提交成功',
            icon: 'success',
            duration: 1500
          })
          
          // 延时跳转到申请记录页面
          setTimeout(() => {
            uni.navigateTo({
              url: '/pages/user/fund/records/index'
            })
          }, 1500)
        } else {
          throw new Error(res.message || '提交失败')
        }
      } catch (error) {
        console.error('债务减免申请提交失败：', error)
        uni.showToast({
          title: error.message || '提交失败，请重试',
          icon: 'none'
        })
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
    // background: linear-gradient(135deg, #4A90E2 0%, #A0C8F0 100%);
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
    padding: 30rpx 30rpx 100rpx;
    min-height: calc(100vh - 300rpx);
    
    .content-card {
      background: #FFFFFF;
      border-radius: 48rpx;
      padding: 40rpx;
      box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
      margin-bottom: 40rpx;
      
      .card-section-title {
        color: #333333;
        font-size: 36rpx;
        font-weight: bold;
        margin-bottom: 30rpx;
      }
      
      .file-upload-area {
        background-color: #F5F5F5;
        border-radius: 24rpx;
        padding: 60rpx 40rpx;
        margin-bottom: 30rpx;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 240rpx;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .upload-icon {
          color: #C0C0C0;
          font-size: 80rpx;
          font-weight: normal;
          line-height: 1;
          margin-bottom: 20rpx;
        }
        
        .upload-text {
          color: #888888;
          font-size: 28rpx;
          font-weight: normal;
          text-align: center;
        }
        
        .upload-text-group {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8rpx;
          
          .upload-text-primary {
            color: #888888;
            font-size: 28rpx;
            font-weight: normal;
            text-align: center;
          }
          
          .upload-text-secondary {
            color: #A9A9A9;
            font-size: 24rpx;
            font-weight: normal;
            text-align: center;
          }
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
      margin: 300rpx auto 0 auto;
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