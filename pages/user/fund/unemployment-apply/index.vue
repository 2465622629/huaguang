<template>
  <view class="debt-apply-page" :style="{ backgroundImage: `url(${backgroundImage})` }">
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
        <view class="file-upload-area" @click="handleIdCardUpload">
          <view class="upload-icon">+</view>
          <view class="upload-text">上传身份证正反面照片</view>
        </view>
        <view class="file-upload-area" @click="handleIdCardUpload">
          <view class="upload-icon">+</view>
          <view class="upload-text">最近一个月的失业证明</view>
          <view class="upload-text">（如社离职证明、社保停缴记录等）</view>
        </view>
      </view>



      <!-- 问诊资料卡片 -->
      <view class="content-card">
        <view class="card-section-title">个人简历（选填）</view>

        <!-- 文件上传区域 - 问诊资料 -->
        <view class="file-upload-area" @click="handleMedicalRecordUpload">
          <view class="upload-icon">+</view>
          <view class="upload-text">个人简历（用于就业推荐）</view>
        </view>
      </view>

      <!-- 底部提交按钮 -->
      <view class="submit-button" @click="handleSubmit">
        <text class="submit-text">提 交 审 核</text>
      </view>
    </view>

    <!-- iOS Home Indicator -->
    <view class="home-indicator"></view>
  </view>
</template>

<script>
import config from '@/config/index.js'
import { staticBaseUrl } from '@/config/index.js'

export default {
  name: 'DebtApplyPage',
  data() {
    return {
      config: config,
      backgroundImage: staticBaseUrl + '/apply-bg.png',
      psychologicalDistress: '',
      idCardFiles: [],
      medicalRecords: []
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
    handleIdCardUpload() {
      uni.showToast({
        title: '身份证上传功能开发中',
        icon: 'none'
      })
    },
    handlePsychologicalInput(e) {
      this.psychologicalDistress = e.detail.value
    },
    handleMedicalRecordUpload() {
      uni.showToast({
        title: '问诊资料上传功能开发中',
        icon: 'none'
      })
    },
    handleSubmit() {
      // 验证必填项
      if (!this.psychologicalDistress.trim()) {
        uni.showToast({
          title: '请描述您的心理困扰情况',
          icon: 'none'
        })
        return
      }

      // 构建提交数据
      const submitData = {
        psychologicalDistress: this.psychologicalDistress,
        idCardFiles: this.idCardFiles,
        medicalRecords: this.medicalRecords
      }

      console.log('提交数据:', submitData)
      uni.showToast({
        title: '提交功能开发中',
        icon: 'none'
      })
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
        margin-bottom: 30rpx;
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