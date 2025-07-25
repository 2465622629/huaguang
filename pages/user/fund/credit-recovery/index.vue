<template>
  <view class="credit-recovery-page" :style="{ backgroundImage: 'url(' + backgroundImage + ')' }">
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
                customStyle="background-color: #F7F7F7; border-radius: 12rpx; padding: 0; font-size: 28rpx; height: 80rpx; line-height: 80rpx;"
                clearable
              />
            </view>
            <view class="input-field">
              <view class="date-picker-wrapper" @click="showLoanTimePicker">
                <view class="date-display" :class="{ 'placeholder': !formData.loanInfo.loanTime }">
                  {{ formData.loanInfo.loanTime || '借款时间' }}
                </view>
                <uv-icon name="arrow-down" color="#AAAAAA" size="14"></uv-icon>
              </view>
            </view>
          </view>
          <view class="input-row">
            <view class="input-field">
              <uv-input 
                v-model="formData.loanInfo.amount" 
                placeholder="金额" 
                placeholderClass="input-placeholder"
                border="none"
                customStyle="background-color: #F7F7F7; border-radius: 12rpx; padding: 0; font-size: 28rpx; height: 80rpx; line-height: 80rpx;"
                clearable
              />
            </view>
            <view class="input-field">
              <view class="date-picker-wrapper" @click="showOverdueTimePicker">
                <view class="date-display" :class="{ 'placeholder': !formData.loanInfo.overdueTime }">
                  {{ formData.loanInfo.overdueTime || '逾期时间' }}
                </view>
                <uv-icon name="arrow-down" color="#AAAAAA" size="14"></uv-icon>
              </view>
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
              customStyle="background-color: #F7F7F7; border-radius: 12rpx; padding: 0; font-size: 28rpx; height: 80rpx; line-height: 80rpx;"
              clearable
            />
          </view>
          <view class="input-field">
            <uv-input 
              v-model="formData.repaymentInfo.repaymentAmount" 
              placeholder="补交金额" 
              placeholderClass="input-placeholder"
              border="none"
              customStyle="background-color: #F7F7F7; border-radius: 12rpx; padding: 0; font-size: 28rpx; height: 80rpx; line-height: 80rpx;"
              clearable
            />
          </view>
        </view>
        
        <!-- 文件上传区域 -->
        <view class="file-upload-area">
          <view v-if="screenshotFiles.length === 0" class="upload-placeholder" @click="handleScreenshotUpload">
            <view class="upload-icon">+</view>
            <view class="upload-text">上传补交截图</view>
            <view class="upload-hint">请确保截图清晰完整</view>
          </view>
          <view v-else class="uploaded-files">
            <view v-for="file in screenshotFiles" :key="file.id" class="uploaded-file" @click.stop="previewImage(file.path)">
              <image :src="file.path" class="file-preview" mode="aspectFill"></image>
              <view class="file-info">
                <text class="file-name">{{ file.name }}</text>
                <text class="file-size">{{ (file.size / 1024).toFixed(1) }}KB</text>
              </view>
              <view class="delete-btn" @click.stop="deleteScreenshot(file.id)">
                <uv-icon name="close" color="#FFFFFF" size="12"></uv-icon>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 底部提交按钮 -->
      <view class="submit-button" @click="handleSubmit" :class="{ 'submitting': isSubmitting }">
        <text class="submit-text">{{ isSubmitting ? '提交中...' : '提 交 审 核' }}</text>
      </view>
    </view>
    
    <!-- 日期选择器 -->
    <uv-datetime-picker
      ref="loanTimePicker"
      v-model="loanTimePickerValue"
      mode="date"
      :maxDate="new Date().getTime()"
      @confirm="onLoanTimeConfirm"
      @close="onLoanTimeClose"
    ></uv-datetime-picker>
    
    <uv-datetime-picker
      ref="overdueTimePicker"
      v-model="overdueTimePickerValue"
      mode="date"
      :maxDate="new Date().getTime()"
      @confirm="onOverdueTimeConfirm"
      @close="onOverdueTimeClose"
    ></uv-datetime-picker>
    
    <!-- iOS Home Indicator -->
    <!-- <view class="home-indicator"></view> -->
  </view>
</template>

<script>
import config from '@/config/index.js'
import { staticBaseUrl } from '@/config/index.js'
import { uploadFile } from '@/utils/file.js'
import applicationRecordApi from '@/api/modules/application-record.js'

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
          repaymentAmount: ''
        }
      },
      screenshotFiles: [],
      isSubmitting: false,
      loanTimePickerValue: new Date().getTime(),
      overdueTimePickerValue: new Date().getTime()
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
    
    // 显示借款时间选择器
    showLoanTimePicker() {
      this.$refs.loanTimePicker.open()
    },
    
    // 显示逾期时间选择器
    showOverdueTimePicker() {
      this.$refs.overdueTimePicker.open()
    },
    
    // 借款时间确认
    onLoanTimeConfirm(value) {
      const date = new Date(value.value)
      this.formData.loanInfo.loanTime = this.formatDate(date)
    },
    
    // 借款时间取消
    onLoanTimeClose() {
      // 关闭选择器时的处理
    },
    
    // 逾期时间确认
    onOverdueTimeConfirm(value) {
      const date = new Date(value.value)
      this.formData.loanInfo.overdueTime = this.formatDate(date)
    },
    
    // 逾期时间取消
    onOverdueTimeClose() {
      // 关闭选择器时的处理
    },
    
    // 格式化日期
    formatDate(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    
    // 处理截图上传
    handleScreenshotUpload() {
      this.uploadFile('screenshot', '补交截图', this.screenshotFiles)
    },

    async uploadFile(type, typeName, fileArray) {
      try {
        const result = await new Promise((resolve, reject) => {
          uni.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            sourceType: ['album', 'camera'],
            success: resolve,
            fail: reject
          })
        })

        if (result.tempFilePaths && result.tempFilePaths.length > 0) {
          // 模拟文件上传成功，实际项目中应调用uploadFile函数
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
    
    // 删除截图
    deleteScreenshot(fileId) {
      this.screenshotFiles = this.screenshotFiles.filter(file => file.id !== fileId)
    },
    
    // 预览图片
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

    // 表单验证
    validateForm() {
      const { loanInfo, repaymentInfo } = this.formData
      
      if (!loanInfo.bank || !loanInfo.loanTime || !loanInfo.amount || !loanInfo.overdueTime) {
        uni.showToast({
          title: '请完善借款逾期信息',
          icon: 'none'
        })
        return false
      }
      
      if (!repaymentInfo.remainingAmount || !repaymentInfo.repaymentAmount) {
        uni.showToast({
          title: '请完善补交信息',
          icon: 'none'
        })
        return false
      }
      
      if (this.screenshotFiles.length === 0) {
        uni.showToast({
          title: '请上传补交截图',
          icon: 'none'
        })
        return false
      }
      
      return true
    },
    
    async handleSubmit() {
      if (this.isSubmitting) return

      // 表单验证
      if (!this.validateForm()) return

      this.isSubmitting = true

      try {
        // 显示加载提示
        uni.showLoading({
          title: '提交中...',
          mask: true
        })
        
        // 准备提交数据
        const submitData = {
          overdueInfo: {
            bankOrPlatform: this.formData.loanInfo.bank,
            loanTime: this.formData.loanInfo.loanTime,
            amount: parseFloat(this.formData.loanInfo.amount),
            overdueTime: this.formData.loanInfo.overdueTime
          },
          repaymentInfo: {
            remainingAmount: parseFloat(this.formData.repaymentInfo.remainingAmount),
            repaymentAmount: parseFloat(this.formData.repaymentInfo.repaymentAmount),
            screenshotFiles: this.screenshotFiles.map(file => ({
              name: file.name,
              path: file.path,
              size: file.size
            }))
          }
        }
        
        // 调用信用记录恢复申请接口
        const res = await applicationRecordApi.submitCreditRecoveryApplication(submitData)
        
        if (res && res.success !== false) {
          uni.hideLoading()
          
          // 显示成功提示
          await new Promise(resolve => {
            uni.showModal({
              title: '提交成功',
              content: '您的信用记录恢复申请已提交，我们将在3-5个工作日内审核并联系您。',
              showCancel: false,
              confirmText: '确定',
              success: resolve
            })
          })

          // 跳转到信用分数页面
          uni.navigateTo({
            url: '/pages/user/fund/credit-score/index',
            fail: () => {
              uni.switchTab({
                url: '/pages/user/fund/index'
              })
            }
          })
        } else {
          throw new Error(res.message || '提交失败')
        }
      } catch (error) {
        console.error('信用记录恢复申请提交失败：', error)
        uni.hideLoading()
        
        uni.showModal({
          title: '提交失败',
          content: error.message || '提交失败，请稍后重试',
          confirmText: '重试',
          cancelText: '取消',
          success: (res) => {
            if (res.confirm) {
              setTimeout(() => this.handleSubmit(), 1000)
            }
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
          }
        }
      }
      
      .input-grid-1x2 {
        display: flex;
        gap: 20rpx;
        margin-bottom: 30rpx;
        
        .input-field {
          flex: 1;
        }
      }
      
      .input-placeholder {
        color: #AAAAAA;
      }
      
      // 日期选择器样式
      .date-picker-wrapper {
        background-color: #F7F7F7;
        border-radius: 12rpx;
        height: 80rpx;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 20rpx;
        box-sizing: border-box;
        
        .date-display {
          font-size: 28rpx;
          color: #333333;
          
          &.placeholder {
            color: #AAAAAA;
          }
        }
      }
      
      // uv-input内部输入框的样式调整
      :deep(.uv-input__content__field-wrapper__field) {
        padding: 20rpx !important;
        box-sizing: border-box !important;
      }
      
      .file-upload-area {
        background-color: #F5F5F5;
        border-radius: 24rpx;
        padding: 40rpx 30rpx;
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
            transition: all 0.3s ease;

            &:hover {
              border-color: #3B82F6;
              box-shadow: 0 4rpx 12rpx rgba(59, 130, 246, 0.15);
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

            .delete-btn {
              width: 40rpx;
              height: 40rpx;
              background-color: rgba(0, 0, 0, 0.6);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-left: 20rpx;
            }
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
      transition: all 0.3s ease;

      &.submitting {
        background-color: #9CA3AF;
        pointer-events: none;
      }
      
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