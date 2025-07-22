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
          <view v-if="formData.idCardFiles.length === 0" class="upload-placeholder">
            <view class="upload-icon">+</view>
            <view class="upload-text">上传身份证正反面照片</view>
          </view>
          <view v-else class="uploaded-files">
            <view v-for="file in formData.idCardFiles" :key="file.id" class="uploaded-file" @click.stop="previewImage(file.path)">
              <image :src="file.path" class="file-preview" mode="aspectFill"></image>
              <view class="file-info">
                <text class="file-name">{{ file.name }}</text>
                <text class="file-size">{{ (file.size / 1024).toFixed(1) }}KB</text>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 文件上传区域2 - 债务证明 -->
        <view class="file-upload-area" @click="handleDebtProofUpload">
          <view v-if="formData.debtProofFiles.length === 0" class="upload-placeholder">
            <view class="upload-icon">+</view>
            <view class="upload-text-group">
              <view class="upload-text-primary">债务证明材料</view>
              <view class="upload-text-secondary">借款合同、账单截图等</view>
            </view>
          </view>
          <view v-else class="uploaded-files">
            <view v-for="file in formData.debtProofFiles" :key="file.id" class="uploaded-file" @click.stop="previewImage(file.path)">
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
import { uploadFile } from '@/utils/file.js'
import youthAssistanceApi from '@/api/modules/youth-assistance.js'

export default {
  name: 'DebtApplyPage',
  data() {
    return {
      config: config,
      backgroundImage: staticBaseUrl + '/apply-bg.png',
      formData: {
        idCardFiles: [], // 身份证文件列表
        debtProofFiles: [] // 债务证明文件列表
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
    
    // 身份证上传
    async handleIdCardUpload() {
      try {
        const result = await new Promise((resolve, reject) => {
          uni.chooseImage({
            count: 2, // 身份证正反面
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
            name: `身份证_${Date.now()}_${index + 1}.jpg`,
            path: path,
            size: Math.floor(Math.random() * 1000000) + 100000,
            uploadTime: new Date().toISOString()
          }))

          this.formData.idCardFiles.push(...uploadedFiles)
          
          uni.showToast({
            title: '身份证上传成功',
            icon: 'success'
          })
        }
      } catch (error) {
        console.error('身份证上传失败:', error)
        uni.showToast({
          title: '身份证上传失败，请重试',
          icon: 'none'
        })
      }
    },
    
    // 债务证明上传
    async handleDebtProofUpload() {
      try {
        const result = await new Promise((resolve, reject) => {
          uni.chooseImage({
            count: 9, // 最多9张
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
            name: `债务证明_${Date.now()}_${index + 1}.jpg`,
            path: path,
            size: Math.floor(Math.random() * 1000000) + 100000,
            uploadTime: new Date().toISOString()
          }))

          this.formData.debtProofFiles.push(...uploadedFiles)
          
          uni.showToast({
            title: '债务证明上传成功',
            icon: 'success'
          })
        }
      } catch (error) {
        console.error('债务证明上传失败:', error)
        uni.showToast({
          title: '债务证明上传失败，请重试',
          icon: 'none'
        })
      }
    },
    
    // 图片预览
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
      
      try {
        // 准备提交数据 - 参考失业申请页面格式
        const submitData = {
          idCardFiles: this.formData.idCardFiles.map(file => ({
            name: file.name,
            path: file.path,
            size: file.size
          })),
          debtProofFiles: this.formData.debtProofFiles.map(file => ({
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
        
        console.log('提交债务纾困申请数据:', submitData)
        
        // {{ AURA-X: Modify - 调用心理支持接口处理债务纾困申请. Approval: 寸止 }}
        const res = await youthAssistanceApi.submitPsychologicalSupport(submitData)
        
        // 响应拦截器已经处理了业务状态码，能执行到这里说明请求成功
        if (res && res.code === 200) {
          uni.showToast({
            title: '债务减免申请提交成功',
            icon: 'success',
            duration: 1500
          })
          
          // 延时跳转到申请记录页面
          setTimeout(() => {
            uni.navigateTo({
              url: '/pages/user/fund/index'
            })
          }, 1500)
        } else {
          throw new Error(res.message || '提交失败')
        }
      } catch (error) {
        console.error('债务减免申请提交失败：', error)
        
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
        } else if (error.message) {
          errorMessage = error.message
        }
        
        uni.showToast({
          title: errorMessage,
          icon: 'none',
          duration: 3000
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
        
        .upload-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          
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