<template>
  <view class="job-platform-page" :style="{ background: `url('${config.staticBaseUrl}/bg3.png')` }">
   

    <!-- 主内容区域 -->
    <view class="main-content">
      <!-- Banner区域 -->
      <view class="banner-section">
        <image class="banner-full-img" :src="`${config.staticBaseUrl}/jobs_banner.png`" mode="aspectFill"></image>
      </view>

      <!-- 推荐企业模块 -->
      <view class="section-card">
        <view class="section-header" @click="handleMoreCompanies">
          <text class="section-title">推荐企业</text>
          <uv-icon name="arrow-right" size="24" color="#87CEFA"></uv-icon>
        </view>
        <view class="companies-container">
          <view v-for="(company, index) in companies" :key="company.id" class="company-card"
            @click="handleCompanyClick(company)">
            <view class="company-header">
              <view class="company-logo">
                <!-- 圆形企业logo占位符 -->
              </view>
              <view class="company-info">
                <text class="company-name">{{ company.name }}</text>
              </view>
            </view>
            <text class="company-jobs">招聘职位 {{ company.jobCount }}</text>
          </view>
        </view>
      </view>

      <!-- 推荐职业模块 -->
      <view class="section-card">
        <view class="section-header" @click="handleMoreJobs">
          <text class="section-title">推荐职业</text>
          <uv-icon name="arrow-right" size="24" color="#87CEFA"></uv-icon>
        </view>
        <view class="jobs-list">
          <view v-for="(job, index) in jobs" :key="job.id" class="job-item-wrapper">
            <view class="job-item">
              <view class="job-main">
                <view class="job-title-row">
                  <text class="job-title">{{ job.title }}</text>
                  <text class="job-company">{{ job.company }}</text>
                </view>
                <view class="job-info-row">
                  <text class="job-info">{{ job.salary }}</text>
                  <text class="job-info">{{ job.location }}</text>
                  <text class="job-info">{{ job.education }}</text>
                </view>
              </view>
              <view class="job-action">
                <view class="apply-btn" @click="handleQuickApply(job)">
                  <text class="apply-text">快速投递</text>
                </view>
              </view>
            </view>
            <!-- 分割线 -->
            <view v-if="index < jobs.length - 1" class="job-divider"></view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部导航栏 -->
    <UserTabbar />
  </view>
</template>

<script>
import UserTabbar from '@/components/tabbar/user-tabbar/user-tabbar.vue'
import config from '@/config/index.js'

export default {
  name: 'JobPlatform',
  components: {
    UserTabbar
  },
  data() {
    return {
      config,
      // 推荐企业数据
      companies: [
        {
          id: 1,
          name: 'XX科技',
          jobCount: 15
        },
        {
          id: 2,
          name: 'YY集团',
          jobCount: 8
        },
        {
          id: 3,
          name: 'ZZ公司',
          jobCount: 12
        }
        
      ],
      // 推荐职业数据
      jobs: [
        {
          id: 1,
          title: '法务专员',
          company: 'XX科技',
          salary: '6k-9k',
          location: '上海',
          education: '本科及以上'
        },
        {
          id: 2,
          title: '前端开发工程师',
          company: 'YY集团',
          salary: '8k-15k',
          location: '北京',
          education: '本科及以上'
        },
        {
          id: 3,
          title: '产品经理',
          company: 'ZZ公司',
          salary: '12k-20k',
          location: '深圳',
          education: '本科及以上'
        },
        {
          id: 4,
          title: '数据分析师',
          company: 'AA科技',
          salary: '10k-18k',
          location: '广州',
          education: '本科及以上'
        },
        {
          id: 5,
          title: 'UI/UX设计师',
          company: 'BB设计',
          salary: '9k-16k',
          location: '杭州',
          education: '本科及以上'
        },
        {
          id: 6,
          title: '后端开发工程师',
          company: 'CC科技',
          salary: '11k-19k',
          location: '成都',
          education: '本科及以上'
        },
        {
          id: 7,
          title: '测试工程师',
          company: 'DD科技',
          salary: '7k-13k',
          location: '武汉',
          education: '本科及以上'
        },
        {
          id: 8,
          title: '运营专员',
          company: 'EE传媒',
          salary: '5k-10k',
          location: '西安',
          education: '本科及以上'
        },
        {
          id: 9,
          title: '市场营销',
          company: 'FF集团',
          salary: '8k-14k',
          location: '南京',
          education: '本科及以上'
        },
        {
          id: 10,
          title: '人力资源',
          company: 'GG企业',
          salary: '6k-12k',
          location: '苏州',
          education: '本科及以上'
        }
      ]
    }
  },
  onLoad() {
    console.log('招聘主页加载完成')
  },
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack()
    },

    // 处理企业卡片点击
    handleCompanyClick(company) {
      console.log('点击企业：', company.name)
      uni.showToast({
        title: '企业详情功能开发中',
        icon: 'none'
      })
    },

    // 处理更多企业点击
    handleMoreCompanies() {
      console.log('查看更多企业')
      uni.navigateTo({
        url: '/pages/user/index/company-list/index',
        success: () => {
          console.log('跳转成功');
        },
        fail: (err) => {
          console.log('跳转失败', err);
        }
      })
    },

    // 处理更多职业点击
    handleMoreJobs() {
      console.log('查看更多职业')
      uni.navigateTo({
        url: '/pages/user/index/recommended-jobs/index',
        success: () => {
          console.log('跳转成功');
        },
        fail: (err) => {
          console.log('跳转失败', err);
        }
      })
    },

    // 处理快速投递
    handleQuickApply(job) {
      console.log('快速投递职位：', job.title)
      uni.showToast({
        title: '投递功能开发中',
        icon: 'none'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.job-platform-page {
  min-height: 100vh;
}

/* 自定义导航栏 */
.custom-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  background: rgba(255, 255, 255, 0.8);
  padding-top: var(--status-bar-height);

  .navbar-content {
    height: 44px;
    display: flex;
    align-items: center;
    padding: 0 16px;

    .navbar-left {
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

/* 主内容区域 */
.main-content {
  padding-top: calc(var(--status-bar-height) + 44px + 20px);
  padding: calc(var(--status-bar-height) + 44px + 20px) 20rpx 20rpx;
  padding-bottom: calc(100rpx + 20px);
  /* 为底部导航栏留出空间 */
}

/* Banner区域 */
.banner-section {
  height: 300rpx;
  border-radius: 16rpx;
  margin-bottom: 30rpx;
  position: relative;
  overflow: hidden;

  .banner-full-img {
    width: 100%;
    height: 100%;
    border-radius: 16rpx;
  }
}

/* 模块卡片 */
.section-card {
  background: #f7f9ff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 30rpx;

    .section-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333333;
    }
  }

  // 推荐企业模块固定高度
  &:first-of-type {
    height: 300rpx;

    .uv-scroll-list {
      height: 200rpx;
      overflow-x: auto;
      overflow-y: hidden;
    }
  }

  // 推荐职业模块固定高度
  &:last-of-type {
    height: 500rpx;

    .jobs-list {
      height: 430rpx;
      overflow-y: auto;
      overflow-x: hidden;
    }
  }
}

/* 企业容器 */
.companies-container {
  display: flex;
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 10rpx;
}

/* 企业卡片 */
.company-card {
  width: 200rpx;
  min-width: 200rpx;
  flex-shrink: 0;
  background: #F8FBFF;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-right: 20rpx;
  display: flex;
  flex-direction: column;

  .company-header {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 15rpx;
  }

  .company-logo {
    width: 70rpx;
    height: 70rpx;
    background: #D0E8FF;
    border-radius: 50%;
    margin-right: 15rpx;
    flex-shrink: 0;
  }

  .company-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;

    .company-name {
      font-size: 26rpx;
      color: #555555;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .company-jobs {
    font-size: 22rpx;
    color: #888888;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;
  }
}

/* 职业列表 */
.jobs-list {
  .job-item-wrapper {
    position: relative;
    background: #ffffff;
    border-radius: 12rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
    margin: 16rpx 0;
    padding: 0 20rpx;

    .job-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20rpx 0;

      .job-main {
        flex: 1;

        .job-title-row {
          display: flex;
          align-items: baseline;
          margin-bottom: 10rpx;

          .job-title {
            font-size: 30rpx;
            font-weight: bold;
            color: #333333;
            margin-right: 20rpx;
          }

          .job-company {
            font-size: 26rpx;
            color: #666666;
          }
        }

        .job-info-row {
          display: flex;
          align-items: center;

          .job-info {
            font-size: 24rpx;
            color: #888888;
            margin-right: 60rpx; /* 增加间距从20rpx到40rpx */
          }
        }
      }

      .job-action {
        .apply-btn {
          background: #47b2fb;
          border-radius: 12rpx;
          padding: 6rpx 24rpx;
          display: flex;
          align-items: center;
          justify-content: center;

          .apply-text {
            font-size: 26rpx;
            color: #FFFFFF;
          }
        }
      }
    }

    .job-divider {
      height: 1rpx;
      background: #EEEEEE;
      margin: 0 20rpx;
    }
  }
}
</style>