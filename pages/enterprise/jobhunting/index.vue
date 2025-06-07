<template>
  <view class="enterprise-page">
    <!-- iOS 状态栏 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
    
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">我的企业</text>
    </view>
    
    <!-- 公司基本信息 -->
    <view class="company-info-section">
      <view class="company-logo">
        <view class="logo-placeholder"></view>
      </view>
      <view class="company-details">
        <text class="company-name">XX科技有限公司</text>
        <view class="company-tags">
          <view class="tag">
            <text class="tag-text">互联网 · 软件开发</text>
          </view>
          <view class="tag">
            <text class="tag-text">500-999人</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 公司简介模块 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">公司简介</text>
        <uv-button 
          text="编辑详情" 
          type="primary"
          size="mini"
          :customStyle="{
            backgroundColor: '#58AFFF',
            borderRadius: '8px',
            height: '28px',
            fontSize: '12px',
            padding: '0 8px'
          }"
          @click="editCompanyInfo"
        ></uv-button>
      </view>
      <view class="section-content">
        <text class="content-subtitle">关于XX科技</text>
        <text class="content-text">XX科技成立于2012年，是一家专注于人工智能、大数据分析与云计算服务的高新技术企业。我们致力于用科技赋能产业，推动数字化转型，服务全球客户。</text>
        <view class="content-list">
          <text class="list-item">· 核心业务：智慧零售、智慧物流、AI算法平台开发</text>
          <text class="list-item">· 服务客户：已覆盖全球30多个国家，超过500家企业</text>
          <text class="list-item">· 公司文化：创新、开放、高效、合作</text>
        </view>
      </view>
    </view>
    
    <!-- 职位编辑模块 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">职位编辑</text>
        <uv-button 
          text="立即编辑" 
          type="primary"
          size="mini"
          :customStyle="{
            backgroundColor: '#58AFFF',
            borderRadius: '8px',
            height: '28px',
            fontSize: '12px',
            padding: '0 8px'
          }"
          @click="editJobs"
        ></uv-button>
      </view>
      
      <!-- 职位列表 -->
      <view class="job-list">
        <view 
          class="job-card" 
          v-for="(job, index) in jobList" 
          :key="index"
          @click="goToJobDetail(job)"
        >
          <view class="job-header">
            <text class="job-title">{{ job.title }}</text>
            <text class="job-salary">{{ job.salary }}</text>
            <text class="arrow-icon">></text>
          </view>
          <view class="job-info">
            <view class="info-item">
              <uv-icon name="map-pin" size="13" color="#888888"></uv-icon>
              <text class="info-text">{{ job.location }}</text>
            </view>
            <view class="info-item">
              <uv-icon name="graduation-cap" size="13" color="#888888"></uv-icon>
              <text class="info-text">{{ job.education }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    
    <!-- 底部导航栏 -->
    <UserTabbar :defaultActive="1" />
  </view>
</template>

<script>
import UserTabbar from '@/components/tabbar/user-tabbar/user-tabbar.vue'

export default {
  name: 'EnterpriseJobHunting',
  components: {
    UserTabbar
  },
  data() {
    return {
      statusBarHeight: 0,
      jobList: [
        {
          id: 1,
          title: '法务专员',
          salary: '6k-9k',
          location: '上海市 · 浦东新区',
          education: '本科'
        },
        {
          id: 2,
          title: '产品经理',
          salary: '12k-18k',
          location: '上海市 · 徐汇区',
          education: '本科'
        },
        {
          id: 3,
          title: '前端开发工程师',
          salary: '10k-15k',
          location: '上海市 · 静安区',
          education: '本科'
        }
      ]
    }
  },
  onLoad() {
    // 获取系统状态栏高度
    const systemInfo = uni.getSystemInfoSync()
    this.statusBarHeight = systemInfo.statusBarHeight || 0
  },
  methods: {
    editCompanyInfo() {
      console.log('编辑公司详情')
      uni.navigateTo({
        url: '/pages/enterprise/companydetails/index'
      })
    },
    editJobs() {
      console.log('立即编辑职位')
      uni.navigateTo({
        url: '/pages/enterprise/jobdetails/index'
      })
    },
    goToJobDetail(job) {
      console.log('查看职位详情', job)
      uni.navigateTo({
        url: `/pages/enterprise/jobdetails/index?jobId=${job.id}&title=${encodeURIComponent(job.title)}`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.enterprise-page {
  min-height: 100vh;
  background: url('http://localhost:3000/static/bg3.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
}

.status-bar {
  width: 100%;
  background: transparent;
}

.page-header {
  padding: 20rpx 40rpx 30rpx;
  
  .page-title {
    font-size: 45rpx;
    font-weight: bold;
    color: #333333;
    line-height: 1.2;
  }
}

.company-info-section {
  display: flex;
  align-items: center;
  padding: 0 40rpx 40rpx;
  
  .company-logo {
    margin-right: 30rpx;
    
    .logo-placeholder {
      width: 140rpx;
      height: 140rpx;
      background-color: #D8D8D8;
      border-radius: 50%;
    }
  }
  
  .company-details {
    flex: 1;
    
    .company-name {
      font-size: 32rpx;
      font-weight: bold;
      color: #333333;
      margin-bottom: 20rpx;
      display: block;
    }
    
    .company-tags {
      display: flex;
      gap: 20rpx;
      align-items: center; /* 让文字垂直居中 */
      
      .tag {
        background-color: #eefdff;
        // border: 1px solid #E0E0E0;
        border-radius: 12rpx;
        padding: 4rpx 8rpx;
        display: flex; /* 让标签内容也使用flex布局 */
        align-items: center; /* 让标签内文字垂直居中 */
        
        .tag-text {
          font-size: 24rpx;
          color: #666666;
        }
      }
    }
  }
}

.section {
  margin: 0 40rpx 40rpx;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30rpx;
    
    .section-title {
      font-size: 36rpx;
      font-weight: bold;
      color: #333333;
    }
  }
  
  .section-content {
    .content-subtitle {
      font-size: 32rpx;
      font-weight: bold;
      color: #333333;
      margin-bottom: 20rpx;
      display: block;
    }
    
    .content-text {
      font-size: 28rpx;
      color: #333333;
      line-height: 1.5;
      margin-bottom: 30rpx;
      display: block;
    }
    
    .content-list {
      .list-item {
        font-size: 28rpx;
        color: #333333;
        line-height: 1.5;
        margin-bottom: 15rpx;
        display: block;
      }
    }
  }
}

.job-list {
  .job-card {
    background-color: #FFFFFF;
    border-radius: 24rpx;
    padding: 30rpx 40rpx;
    margin-bottom: 30rpx;
    box-shadow: 0px 4rpx 16rpx rgba(0, 0, 0, 0.05);
    
    .job-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;
      
      .job-title {
        font-size: 34rpx;
        font-weight: bold;
        color: #333333;
        flex: 1;
      }
      
      .job-salary {
        font-size: 34rpx;
        font-weight: 600;
        color: #65C4BA;
        margin-right: 20rpx;
      }
      
      .arrow-icon {
        font-size: 32rpx;
        color: #333333;
        font-weight: bold;
      }
    }
    
    .job-info {
      display: flex;
      align-items: center;
      gap: 60rpx;
      
      .info-item {
        display: flex;
        align-items: center;
        gap: 10rpx;
        
        .info-text {
          font-size: 26rpx;
          color: #888888;
        }
      }
    }
  }
}


</style>
