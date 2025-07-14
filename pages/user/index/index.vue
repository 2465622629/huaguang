<template>
  <scroll-view class="container" scroll-y="true">
    <!-- 轮播图 -->
    <view class="swiper-section">
      <uv-swiper :list="swiperList" indicator indicatorMode="line" circular height="300"></uv-swiper>
    </view>

    <!-- 宫格导航 -->
    <view class="grid-section">
      <uv-grid :col="5" @click="handleGridClick">
        <uv-grid-item v-for="(item, index) in gridList" :key="index">
          <view class="icon-wrapper" :style="{ backgroundColor: item.bgColor }">
            <uv-image :src="item.icon" width="60rpx" height="60rpx" mode="aspectFit"></uv-image>
          </view>
          <text class="grid-text">{{ item.title }}</text>
        </uv-grid-item>
      </uv-grid>
    </view>

    <!-- 通知栏 -->
    <view class="notice-section">
      <view class="notice-bar">
        <view class="notice-left">
          <text class="headline-title">头条</text>
          <text class="headline-news">快讯</text>
        </view>
        <view class="notice-content">
          <uv-notice-bar :text="noticeList" direction="column" :fontSize="28" :icon="false" :style="{
            backgroundColor: 'transparent',
            padding: '0',
            fontSize: '62rpx'
          }"></uv-notice-bar>
        </view>
      </view>
    </view>

    <!-- 功能模块 -->
    <view class="feature-section">
      <view class="feature-item" style="background-color: #A8C8FF;" @click="handleResumeClick">
        <view class="feature-header">
          <text class="feature-title">投递简历</text>
                      <uv-image class="feature-icon" :src="config.staticBaseUrl + '/icons/resume.png'" width="120rpx"
            height="120rpx" mode="aspectFit"></uv-image>
        </view>
        <view class="feature-desc">
          <text>快速投递</text>
          <text>高效求职</text>
        </view>
      </view>
      <view class="feature-item" style="background-color: #A8E3FF;" @click="handleSkillTrainingClick">
        <view class="feature-header">
          <text class="feature-title">技能网课</text>
                      <uv-image class="feature-icon" :src="config.staticBaseUrl + '/icons/course.png'" width="120rpx"
            height="120rpx" mode="aspectFit"></uv-image>
        </view>
        <view class="feature-desc">
          <text>专业课程</text>
          <text>提升技能</text>
        </view>
      </view>
    </view>

    <!-- Banner图 -->
    <view class="banner-section">
              <uv-image :src="config.staticBaseUrl + '/banner/bottom-banner.png'" width="100%" height="200rpx" mode="aspectFill"
        radius="16rpx"></uv-image>
    </view>

    <!-- 律师推荐 -->
    <view class="lawyer-section">
      <view class="section-header">
        <view class="header-left">
          <uv-image :src="config.staticBaseUrl + '/icons/lawyer.png'" width="40rpx" height="40rpx"
            mode="aspectFit"></uv-image>
          <text class="header-title">热门律师推荐</text>
        </view>
        <view class="header-right">
          <view class="more-btn" @click="handleLawyerMoreClick">
            <text class="more-text">了解更多</text>
            <view class="triangle"></view>
          </view>
        </view>
      </view>

      <uv-scroll-list :indicator="false" indicatorColor="#fff0f0" indicatorActiveColor="#f56c6c">
        <view v-for="(item, index) in lawyerList" :key="index" class="lawyer-item">
          <uv-image :src="item.image" mode="aspectFill" width="200rpx" height="200rpx" radius="16rpx"></uv-image>
        </view>
      </uv-scroll-list>
    </view>

    <!-- 热门职业推荐 -->
    <view class="job-section">
      <view class="section-header">
        <view class="header-left">
          <uv-image :src="config.staticBaseUrl + '/icons/career.png'" width="40rpx" height="40rpx"
            mode="aspectFit"></uv-image>
          <text class="header-title">热门职业推荐</text>
        </view>
        <view class="header-right">
          <view class="more-btn" @click="handleJobMoreClick">
            <text class="more-text">了解更多</text>
            <view class="triangle"></view>
          </view>
        </view>
      </view>

      <uv-scroll-list :indicator="false" indicatorColor="#fff0f0" indicatorActiveColor="#f56c6c">
        <view v-for="(item, index) in jobList" :key="index" class="job-item" @click="handleJobItemClick(item)">
          <uv-image :src="item.image" mode="aspectFill" width="200rpx" height="200rpx" radius="16rpx"></uv-image>
          <view class="job-info-overlay">
            <text class="job-title">{{ item.title || '热门职位' }}</text>
            <text class="job-company">{{ item.company || '知名企业' }}</text>
          </view>
        </view>
      </uv-scroll-list>
    </view>

    <!-- 引入用户 TabBar -->
    <user-tabbar></user-tabbar>
  </scroll-view>
</template>

<script>
import UserTabbar from '@/components/tabbar/user-tabbar/user-tabbar.vue'
import config from '@/config/index.js'
import { getHomePageData, getHotLawyers, getHotJobs, getBanners } from '@/api/modules/home.js'

export default {
  components: {
    UserTabbar
  },
  data() {
    return {
      swiperList: [],
      noticeList: [
        '欢迎使用华光服务平台',
        '我们提供专业的法律咨询、就业指导等服务',
        '如有问题请及时联系客服'
      ],
      gridList: [
        {
          title: '法律咨询',
          icon: `${config.staticBaseUrl}/icons/legal.png`,
          bgColor: '#0049FF'
        },
        {
          title: '就业求职',
          icon: `${config.staticBaseUrl}/icons/job.png`,
          bgColor: '#C06FF7'
        },
        {
          title: '帮扶基金',
          icon: `${config.staticBaseUrl}/icons/fund.png`,
          bgColor: '#FFB217'
        },
        {
          title: '心理咨询',
          icon: `${config.staticBaseUrl}/icons/psychology.png`,
          bgColor: '#FA6F48'
        },
        {
          title: '技能培训',
          icon: `${config.staticBaseUrl}/icons/training.png`,
          bgColor: '#64D0EE'
        }
      ],
      lawyerList: [{
        image: `${config.staticBaseUrl}/lawyer1.png`
      }, {
        image: `${config.staticBaseUrl}/lawyer2.png`
      }, {
        image: `${config.staticBaseUrl}/lawyer3.png`
      }, {
        image: `${config.staticBaseUrl}/lawyer1.png`
      }, {
        image: `${config.staticBaseUrl}/lawyer3.png`
      }],
      jobList: [{
        image: "https://via.placeholder.com/200x200.png/3c9cff/fff"
      }, {
        image: "https://via.placeholder.com/200x200.png/f9ae3d/fff"
      }, {
        image: "https://via.placeholder.com/200x200.png/5ac725/fff"
      }, {
        image: "https://via.placeholder.com/200x200.png/f56c6c/fff"
      }, {
        image: "https://via.placeholder.com/200x200.png/909399/fff"
      }],
      config
    }
  },
  onLoad() {
    this.loadHomeData()
  },
  methods: {
    // 加载主页数据
    async loadHomeData() {
      try {
        // 并行加载多个接口数据
        const [homeData, banners, hotLawyers, hotJobs] = await Promise.allSettled([
          this.getHomePageData(),
          this.getBanners(),
          this.getHotLawyers(),
          this.getHotJobs()
        ])
        
        console.log('主页数据加载完成')
      } catch (error) {
        console.error('加载主页数据失败：', error)
        // 如果API失败，使用默认数据
        this.getRandomImages()
      }
    },
    
    // 获取主页数据
    async getHomePageData() {
      try {
        const response = await getHomePageData({
          platform: 'app',
          userType: 'individual'
        })
        console.log('主页数据：', response)
        
        // 根据API返回的数据更新页面内容
        if (response && response.data) {
          // 更新通知栏内容
          if (response.data.notices && response.data.notices.length > 0) {
            this.noticeList = response.data.notices
          }
        }
      } catch (error) {
        console.error('获取主页数据失败：', error)
      }
    },
    
    // 获取轮播图
    async getBanners() {
      try {
        const response = await getBanners({
          position: 'home_banner',
          active: true
        })
        console.log('轮播图数据：', response)
        
        if (response && response.data && response.data.length > 0) {
          this.swiperList = response.data.map(banner => banner.imageUrl || banner.image)
        } else {
          // 如果没有轮播图数据，使用随机图片
          this.getRandomImages()
        }
      } catch (error) {
        console.error('获取轮播图失败：', error)
        this.getRandomImages()
      }
    },
    
    // 获取热门律师
    async getHotLawyers() {
      try {
        const response = await getHotLawyers({
          limit: 5
        })
        console.log('热门律师数据：', response)
        
        if (response && response.data && response.data.length > 0) {
          this.lawyerList = response.data.map(lawyer => ({
            id: lawyer.id,
            image: lawyer.avatar || lawyer.image || `${config.staticBaseUrl}/lawyer1.png`,
            name: lawyer.name,
            specialty: lawyer.specialty
          }))
        }
      } catch (error) {
        console.error('获取热门律师失败：', error)
      }
    },
    
    // 获取热门职位
    async getHotJobs() {
      try {
        const response = await getHotJobs({
          limit: 5
        })
        console.log('热门职位数据：', response)
        
        if (response && response.data && response.data.length > 0) {
          this.jobList = response.data.map(job => ({
            id: job.id,
            image: job.image || "https://via.placeholder.com/200x200.png/3c9cff/fff",
            title: job.title,
            company: job.company
          }))
        }
      } catch (error) {
        console.error('获取热门职位失败：', error)
      }
    },
    
    // 备用方法：获取随机图片
    async getRandomImages() {
      try {
        console.log('获取随机图片')
        const images = []
        for (let i = 0; i < 3; i++) {
          const width = 750
          const height = 300
          const randomId = Math.floor(Math.random() * 1000)
          const url = `https://picsum.photos/seed/${randomId}/${width}/${height}`
          images.push(url)
        }
        this.swiperList = images
        console.log('获取随机图片成功', this.swiperList)
      } catch (error) {
        console.error('获取随机图片失败：', error)
        this.swiperList = []
      }
    },
    handleGridClick(index) {
      const item = this.gridList[index]

      // 如果点击的是法律咨询，跳转到法律帮助页面
      if (item.title === '法律咨询') {
        uni.navigateTo({
          url: '/pages/user/index/legal-help/index',
          fail: (err) => {
            console.error('跳转失败：', err)
            uni.showToast({
              icon: 'none',
              title: '页面跳转失败'
            })
          }
        })
        return
      }

      // 如果点击的是就业求职，跳转到职位搜索结果页面
      if (item.title === '就业求职') {
        uni.navigateTo({
          url: '/pages/user/index/work-service/index',
          fail: (err) => {
            console.error('跳转失败：', err)
            uni.showToast({
              icon: 'none',
              title: '页面跳转失败'
            })
          }
        })
        return
      } else if (item.title === '帮扶基金') {
        uni.navigateTo({
          url: '/pages/user/fund/index',
          fail: (err) => {
            console.error('跳转失败：', err)
          }
        })
        return
      }
      else if (item.title === '心理咨询') {
        uni.navigateTo({
          url: '/pages/user/fund/counseling/index',
        })
        return
      }
      else if (item.title === '技能培训') {
        uni.navigateTo({
          url: '/pages/user/index/skill-training/index',
          fail: (err) => {
            console.error('跳转失败：', err)
            uni.showToast({
              icon: 'none',
              title: '页面跳转失败'
            })
          }
        })
        return
      }

      // 其他项目显示toast提示
      uni.showToast({
        icon: 'none',
        title: `点击了${item.title}`
      })
    },
    handleSkillTrainingClick() {
      // 跳转到技能培训页面
      uni.navigateTo({
        url: '/pages/user/index/skill-training/index',
        fail: (err) => {
          console.error('跳转失败：', err)
          uni.showToast({
            icon: 'none',
            title: '页面跳转失败'
          })
        }
      })
    },
    handleResumeClick() {
      // 跳转到投递简历页面
      uni.navigateTo({
        url: '/pages/user/index/job-platform/index',
      })
    },
    handleLawyerMoreClick() {
      // 跳转到律师咨询页面
      uni.navigateTo({
        url: '/pages/user/index/consultation/index',
        fail: (err) => {
          console.error('跳转失败：', err)
          uni.showToast({
            icon: 'none',
            title: '页面跳转失败'
          })
        }
      })
    },
    
    // 处理职位更多点击
    handleJobMoreClick() {
      // 跳转到职位搜索结果页面
      uni.navigateTo({
        url: '/pages/user/index/job-search-result/index?keyword=热门职位',
        fail: (err) => {
          console.error('跳转失败：', err)
          uni.showToast({
            icon: 'none',
            title: '页面跳转失败'
          })
        }
      })
    },
    
    // 处理职位项点击
    handleJobItemClick(job) {
      if (job.id) {
        // 如果有职位ID，跳转到职位详情页
        uni.navigateTo({
          url: `/pages/user/index/job-detail/index?id=${job.id}`,
          fail: (err) => {
            console.error('跳转失败：', err)
            uni.showToast({
              icon: 'none',
              title: '页面跳转失败'
            })
          }
        })
      } else {
        // 如果没有职位ID，跳转到求职平台
        uni.navigateTo({
          url: '/pages/user/index/job-platform/index',
          fail: (err) => {
            console.error('跳转失败：', err)
            uni.showToast({
              icon: 'none',
              title: '页面跳转失败'
            })
          }
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.container {
  min-height: 100vh;
  height: 100vh;
  padding-bottom: 100rpx;
  /* 为 TabBar 预留空间 */
  background-image: $bg-image;
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
}

.swiper-section {
  padding: 20rpx;
  margin-bottom: 20rpx;

  :deep(.uv-swiper) {
    border-radius: 16rpx;
    overflow: hidden;
  }
}

.grid-section {
  padding: 20rpx;
  margin: 0 20rpx;

  .icon-wrapper {
    width: 100rpx;
    height: 100rpx;
    border-radius: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 10rpx;
  }

  .grid-text {
    font-size: 28rpx;
    color: #333;
  }
}

.notice-section {
  margin: 20rpx;

  .notice-bar {
    display: flex;
    align-items: center;
    background-color: #ffffff;
    padding: 20rpx;
    border-radius: 16rpx;
  }
}

.notice-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  line-height: 1.1;
  min-width: 80rpx;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    right: -20rpx;
    top: 50%;
    transform: translateY(-50%);
    width: 2rpx;
    height: 40rpx;
    background-color: #EEEEEE;
  }
}

.headline-title {
  font-family: $font-family-youshe, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  color: #0049ff;
  font-size: 28rpx;
}

.headline-news {
  font-family: $font-family-youshe, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  color: #333333;
  font-size: 24rpx;
  margin-top: 2rpx;
}

.notice-content {
  flex: 1;
  margin-left: 20rpx;

  :deep(.uv-notice-bar) {
    background-color: transparent !important;
    box-shadow: none !important;
    padding: 0 !important;

    .uv-notice-bar__content {
      font-size: 32rpx !important;
    }
  }
}

.feature-section {
  display: flex;
  justify-content: space-between;
  margin: 20rpx 30rpx;
  gap: 20rpx;

  .feature-item {
    width: calc(50% - 10rpx);
    height: 200rpx;
    border-radius: 16rpx;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    overflow: hidden;

    .feature-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: calc(100% - 40rpx);
      padding: 20rpx 30rpx;
    }

    .feature-title {
      font-size: 40rpx;
      color: #3C5D9F;
      font-weight: 500;
    }

    .feature-icon {
      width: 120rpx;
      height: 120rpx;
    }

    .feature-desc {
      width: 100%;
      background-color: rgba(255, 255, 255, 0.4);
      margin-top: 20rpx;

      display: flex;
      flex-direction: column;
      align-items: flex-start;
      padding: 10rpx 20rpx;
      position: absolute;
      bottom: 0;
      left: 0;

      text {
        font-size: 22rpx;
        color: #3C5D9F;
        line-height: 1.4;
      }
    }
  }
}

.banner-section {
  margin: 20rpx 30rpx;

  :deep(.uv-image) {
    width: 100%;
    height: 200rpx;
    border-radius: 16rpx;
  }
}

.lawyer-section {
  margin: 20rpx 30rpx;
  background: linear-gradient(to bottom, #FAFCFF, #DCECFF);
  padding: 20rpx;
  position: relative;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;

    .header-left {
      display: flex;
      align-items: center;
      gap: 10rpx;

      .header-title {
        font-family: $font-family-youshe;
        font-size: 32rpx;
        color: #3C5D9F;
        font-weight: 500;
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      position: absolute;
      right: 0;
      top: 0;

      .more-btn {
        position: relative;
        padding: 8rpx 40rpx 8rpx 60rpx;
        background: linear-gradient(to left, #42B0FF, #DCF0FF);
        clip-path: polygon(0 0, 100% 0, 100% 100%, 20% 100%);
        min-width: 200rpx;
        display: flex;
        align-items: center;
        justify-content: flex-end;

        .more-text {
          font-size: 28rpx;
          color: #3C5D9F;
          margin-right: 4rpx;
        }

        .triangle {
          width: 0;
          height: 0;
          border-style: solid;
          border-width: 8rpx 0 8rpx 12rpx;
          border-color: transparent transparent transparent #3C5D9F;
        }
      }
    }
  }

  .lawyer-item {
    margin-right: 20rpx;

    &:last-child {
      margin-right: 0;
    }
  }
}

.job-section {
  margin: 20rpx 30rpx;
  background: linear-gradient(to bottom, #FAFCFF, #DCECFF);
  padding: 20rpx;
  position: relative;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;

    .header-left {
      display: flex;
      align-items: center;
      gap: 10rpx;

      .header-title {
        font-family: $font-family-youshe;
        font-size: 32rpx;
        color: #0049ff;
        font-weight: 500;
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      position: absolute;
      right: 0;
      top: 0;

      .more-btn {
        position: relative;
        padding: 8rpx 40rpx 8rpx 60rpx;
        background: linear-gradient(to left, #98B5FF, #D0DDFF);
        clip-path: polygon(0 0, 100% 0, 100% 100%, 20% 100%);
        min-width: 200rpx;
        display: flex;
        align-items: center;
        justify-content: flex-end;

        .more-text {
          font-size: 28rpx;
          color: #3C5D9F;
          margin-right: 4rpx;
        }

        .triangle {
          width: 0;
          height: 0;
          border-style: solid;
          border-width: 8rpx 0 8rpx 12rpx;
          border-color: transparent transparent transparent #3C5D9F;
        }
      }
    }
  }

  .job-item {
    margin-right: 20rpx;
    position: relative;
    cursor: pointer;

    &:last-child {
      margin-right: 0;
    }

    .job-info-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
      padding: 20rpx 10rpx 10rpx;
      border-radius: 0 0 16rpx 16rpx;
      display: flex;
      flex-direction: column;
      align-items: center;

      .job-title {
        font-size: 24rpx;
        color: #ffffff;
        font-weight: 500;
        margin-bottom: 4rpx;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 180rpx;
      }

      .job-company {
        font-size: 20rpx;
        color: #cccccc;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 180rpx;
      }
    }
  }
}

@font-face {
  font-family: $font-family-youshe;
  src: url($font-url-youshe);
  font-weight: normal;
  font-style: normal;
}
</style>