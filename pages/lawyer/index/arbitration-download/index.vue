<template>
    <view class="arbitration-review" :style="backgroundStyle">
      <!-- 状态栏占位 -->
      <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
      
      <!-- 自定义导航栏 -->
      <view class="navbar">
        <view class="navbar-content">
          <view class="back-btn" @click="goBack">
            <uv-icon name="arrow-left" color="#409EFF" size="32"></uv-icon>
            <text class="back-text">返回</text>
          </view>
        </view>
      </view>
      
      <!-- 主内容区域 -->
      <scroll-view class="main-content" scroll-y="true" :style="{ height: scrollViewHeight + 'px' }">
        <!-- 申请书卡片 -->
        <view class="application-card">
          <!-- 卡片头部 -->
          <view class="card-header">
            <view class="title-section">
              <text class="main-title">劳动仲裁申请书</text>
              <text class="date-time">2025年5月6日 14:33</text>
            </view>
            <view class="status-badge">
              <text class="status-text">待审核</text>
            </view>
          </view>
          
          <!-- 卡片内容 -->
          <view class="card-content">
            <!-- 引言段落 -->
            <view class="content-section">
              <text class="content-text">仲裁委员会：</text>
              <text class="content-text">申请人因与用人单位发生劳动争议，现依据《中华人民共和国劳动争议调解仲裁法》的有关规定，向贵委员会申请仲裁，请依法受理。</text>
            </view>
            
            <!-- 一、申请人基本信息 -->
            <view class="content-section">
              <text class="section-title">一、申请人基本信息</text>
              <view class="info-list">
                <text class="info-item">姓名： 张三</text>
                <text class="info-item">性别： 男</text>
                <text class="info-item">出生日期： 1995年6月1日</text>
                <text class="info-item">身份证号： 32010119950601XXXX</text>
                <text class="info-item">联系电话： 138XXXXXXXXX</text>
                <text class="info-item">联系地址： 江苏省南京市玄武区××小区×号楼</text>
              </view>
            </view>
            
            <!-- 二、被申请人基本信息 -->
            <view class="content-section">
              <text class="section-title">二、被申请人基本信息</text>
              <view class="info-list">
                <text class="info-item">单位名称： 南京某科技有限公司</text>
                <text class="info-item">法定代表人： 李四</text>
                <text class="info-item">单位地址： 江苏省南京市雨花台区××路×号</text>
                <text class="info-item">联系电话： 025-8XXXXXXXX</text>
              </view>
            </view>
            
            <!-- 三、仲裁请求 -->
            <view class="content-section">
              <text class="section-title">三、仲裁请求</text>
              <view class="request-list">
                <text class="request-item">1. 请求被申请人支付2024年11月至2025年1月的工资共计人民币15,000元；</text>
                <text class="request-item">2. 请求被申请人支付经济补偿金人民币5,000元；</text>
                <text class="request-item">3. 请求被申请人出具解除劳动关系证明；</text>
                <text class="request-item">4. 请求仲裁费用由被申请人承担。</text>
              </view>
            </view>
            
            <!-- 四、事实与理由 -->
            <view class="content-section">
              <text class="section-title">四、事实与理由</text>
              <text class="content-text">申请人自2022年5月入职被申请人单位，担任软件工程师一职，双方签订了为期三年的劳动合同。但自2024年11月起，被申请人以经营困难为由拖欠申请人工资。2025年1月20日，被申请人未经协商，单方面以口头方式解除了与申请人的劳动合同，并拒绝出具解除证明及支付相应补偿金。</text>
              <text class="content-text">申请人多次与单位协商无果，现依法提起劳动仲裁，望依法维护申请人合法权益。</text>
            </view>
            
            <!-- 落款 -->
            <view class="signature-section">
              <text class="signature-text">此致</text>
              <text class="signature-text signature-center">南京市劳动争议仲裁委员会</text>
              <text class="signature-text signature-right">申请人： 张三</text>
              <text class="signature-text signature-right">2025年5月7日</text>
            </view>
          </view>
        </view>
        
        <!-- 附件材料区域 -->
        <view class="attachment-card">
          <view class="attachment-content">
            				<uv-icon :name="`${staticBaseUrl}/icons/cailiao.png`" color="#409EFF" size="66"></uv-icon>
            <text class="attachment-name">证据材料.pdf</text>
          </view>
        </view>
        
        <!-- 操作按钮区域 -->
        <view class="action-buttons">
          <uv-button 
            type="primary"
            shape="circle"
            size="large"
            customStyle="background: #409EFF; border: none; width: 85%;"
            @click="handleDownload"
          >
            下载
          </uv-button>
          
        </view>
      </scroll-view>
      
      <!-- 律师底部导航栏 -->
      <lawyer-tabbar></lawyer-tabbar>
    </view>
  </template>
  
  <script>
  import LawyerTabbar from '@/components/tabbar/lawyer-tabbar/lawyer-tabbar.vue'
  import { staticBaseUrl } from '@/config/index.js'
  
  export default {
    name: 'ArbitrationReview',
    components: {
      LawyerTabbar
    },
    data() {
      return {
        staticBaseUrl,
        statusBarHeight: 0,
        scrollViewHeight: 0
      }
    },
    onLoad() {
      this.getSystemInfo()
    },
    methods: {
      // 获取系统信息
      getSystemInfo() {
        const systemInfo = uni.getSystemInfoSync()
        this.statusBarHeight = systemInfo.statusBarHeight || 20
        // 计算滚动视图高度：屏幕高度 - 状态栏高度 - 导航栏高度 - 底部导航栏高度
        this.scrollViewHeight = systemInfo.screenHeight - this.statusBarHeight - 44 - 100
      },
      
      // 返回上一页
      goBack() {
        uni.navigateBack()
      },
      
      // 确认通过
      handleDownload() {
        uni.showModal({
          title: '确认操作',
          content: '确认下载这份劳动仲裁申请书？',
          success: (res) => {
            if (res.confirm) {
              uni.showToast({
                title: '下载成功',
                icon: 'success'
              })
              // 这里可以调用API提交审核结果
            }
          }
        })
      }
    },
    computed: {
      backgroundStyle() {
        return {
          backgroundImage: `url('${staticBaseUrl}/bg10.png')`
        }
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .arbitration-review {
    min-height: 100vh;
    
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }
  
  .status-bar {
    width: 100%;
  }
  
  .navbar {
    height: 44px;
    display: flex;
    align-items: center;
    padding: 0 20rpx;
    
    .navbar-content {
      display: flex;
      align-items: center;
      
      .back-btn {
        display: flex;
        align-items: center;
        gap: 8rpx;
        
        .back-text {
          color: #409EFF;
          font-size: 16px;
          font-weight: 400;
        }
      }
    }
  }
  
  .main-content {
    padding: 20rpx;
    box-sizing: border-box;
    overflow-x: hidden;
  }
  
  // 申请书卡片样式
  .application-card {
    background: #FFFFFF;
    border-radius: 24rpx;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
    padding: 30rpx;
    margin-bottom: 30rpx;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    overflow: hidden;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40rpx;
      
      .title-section {
        flex: 1;
        
        .main-title {
          font-size: 42rpx;
          font-weight: bold;
          color: #333333;
          line-height: 1.2;
          display: block;
          margin-bottom: 16rpx;
          word-wrap: break-word;
        }
        
        .date-time {
          font-size: 24rpx;
          color: #888888;
          line-height: 1.2;
          display: block;
        }
      }
      
      .status-badge {
        background: #EBF5FF;
        border-radius: 10rpx;
        padding: 8rpx 24rpx;
        
        .status-text {
          font-size: 24rpx;
          color: #409EFF;
          font-weight: 400;
        }
      }
    }
    
    .card-content {
      // 内容段落通用样式
      .content-section {
        margin-bottom: 30rpx;
        
        .section-title {
          display: block;
          font-size: 28rpx;
          font-weight: bold;
          color: #333333;
          line-height: 1.5;
          margin-bottom: 20rpx;
          word-wrap: break-word;
        }
        
        .content-text {
          display: block;
          font-size: 28rpx;
          color: #333333;
          line-height: 1.6;
          margin-bottom: 20rpx;
          text-align: left;
          word-wrap: break-word;
          word-break: break-all;
        }
        
        .info-list {
          .info-item {
            display: block;
            font-size: 28rpx;
            color: #333333;
            line-height: 1.6;
            margin-bottom: 8rpx;
            word-wrap: break-word;
            word-break: break-all;
          }
        }
        
        .request-list {
          .request-item {
            display: block;
            font-size: 28rpx;
            color: #333333;
            line-height: 1.6;
            margin-bottom: 12rpx;
            word-wrap: break-word;
            word-break: break-all;
          }
        }
      }
      
      // 落款样式
      .signature-section {
        margin-top: 60rpx;
        
        .signature-text {
          display: block;
          font-size: 28rpx;
          color: #333333;
          line-height: 2;
          
          &.signature-center {
            text-align: center;
            margin: 20rpx 0;
          }
          
          &.signature-right {
            text-align: right;
            margin-bottom: 8rpx;
          }
        }
      }
    }
  }
  
  // 附件材料区域样式
  .attachment-card {
    background: #FFFFFF;
    border-radius: 24rpx;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
    padding: 30rpx;
    margin-bottom: 40rpx;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    overflow: hidden;
    
    .attachment-content {
      display: flex;
      align-items: center;
      gap: 20rpx;
      
      .attachment-name {
        font-size: 28rpx;
        color: #333333;
        font-weight: 400;
        word-wrap: break-word;
        flex: 1;
        max-width: calc(100% - 50rpx);
      }
    }
  }
  
  // 操作按钮区域样式
  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
    align-items: center;
  }
  </style>
  