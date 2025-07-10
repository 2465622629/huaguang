<template>
  <view class="fund-page">
    <!-- 功能按钮 -->
    <view class="grid-section">
      <uv-grid :col="3" @click="handleGridClick">
        <uv-grid-item v-for="(item, index) in gridList" :key="index">
          <view class="icon-wrapper" :class="{ 'legal-icon': item.title === '法律咨询' }">
            <uv-image :src="item.icon" :width="item.title === '法律咨询' ? '100rpx' : '60rpx'"
              :height="item.title === '法律咨询' ? '100rpx' : '60rpx'" mode="aspectFit"></uv-image>
          </view>
          <text class="grid-text">{{ item.title }}</text>
        </uv-grid-item>
      </uv-grid>
    </view>

    <!-- 统计数据 Banner -->
    <view class="statistics-banner">
      <view class="stat-item">
        <text class="stat-title">已帮扶人数</text>
        <text class="stat-number">{{ statistics.helpedCount || 0 }}</text>
      </view>
      <view class="divider"></view>
      <view class="stat-item">
        <text class="stat-title">正在帮扶人数</text>
        <text class="stat-number">{{ statistics.helpingCount || 0 }}</text>
      </view>
    </view>

    <!-- 帮扶案例模块 -->
    <view class="case-section">
      <view class="section-header">
        <view class="header-left">
          <uv-image :src="config.staticBaseUrl + '/icons/case.png'" width="40rpx" height="40rpx"
            mode="aspectFit"></uv-image>
          <text class="header-title">帮扶案例</text>
        </view>
        <view class="header-right">
          <view class="more-btn" @click="navigateToCase">
            <text class="more-text">了解更多</text>
            <view class="triangle"></view>
          </view>
        </view>
      </view>

      <view class="case-content">
        <view class="case-item" v-for="(item, index) in caseList" :key="index">
          <view class="case-info">
            <text>{{ item.maskedName }} 获得帮扶金额 {{ item.loanAmount }}元</text>
            <text class="case-time">{{ item.createTime }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 功能模块 -->
    <view class="feature-section">
      <view class="feature-left">
        <view class="feature-item" style="background-color: #A8C8FF;" @click="navigateToHelpTypes">
          <view class="feature-header"> <text class="feature-title" style="color: #3c5d9f;">帮扶类型</text> <uv-image
              class="feature-icon" :src="config.staticBaseUrl + '/icons/help-type.png'" width="120rpx" height="120rpx"
              mode="aspectFit"></uv-image> </view>
          <view class="feature-desc"> <text style="color: #3c5d9f;">选择帮扶项目</text> <text
              style="color: #3c5d9f;">填写遇到的问题困境</text> </view>
        </view>
        <view class="feature-item" style="background-color: #A8E3FF;" @click="navigateToApply">
          <view class="feature-header">
            <text class="feature-title" style="color: #4c3d9f;">帮扶申请</text>
            <uv-image class="feature-icon" :src="config.staticBaseUrl + '/icons/help-apply.png'" width="120rpx"
              height="120rpx" mode="aspectFit"></uv-image>
          </view>
          <view class="feature-desc">
            <text style="color: #4c3d9f;">选择帮扶项目</text>
            <text style="color: #4c3d9f;">填写遇到的问题困境</text>
          </view>
        </view>
      </view>
      <view class="feature-item" style="background-color: #FFB217;" @click="navigateToCreditRecovery">
        <view class="feature-header"
          style="display: flex; flex-direction: column; justify-content: center; height: 200rpx;">
          <view class="title-group" style="position: absolute; top: 50%;"> <text class="feature-title"
              style="color: #9f5f3c; font-size: 40rpx; z-index: 1;">在线申请</text> <text class="feature-subtitle"
              style="color: #9f5f3c; z-index: 1; font-size: 36rpx;">信用记录修复</text> </view> <uv-image class="feature-icon"
            :src="config.staticBaseUrl + '/icons/credit-repair.png'" width="200rpx" height="200rpx"
            mode="aspectFit"></uv-image>
        </view>
        <view class="feature-desc" style="position: absolute; bottom: 12%;"> <text
            style="color: #9f5f3c;">信用教育知识普及</text> <text style="color: #9f5f3c;">修复逾期记录 提升信用积分</text> </view>
      </view>
    </view>

    <!-- 心理咨询模块 -->
    <view class="counseling-section" style="margin: 20rpx 30rpx;">
      <view class="feature-item"
        style="background: linear-gradient(to right, #FF7F7F, #FDDCDC); position: relative; height: 300rpx; border-radius: 20rpx; overflow: visible;"
        @click="navigateToCounseling">
        <view class="counseling-header" style="display: flex; align-items: center; padding: 20rpx 30rpx;">
          <uv-image :src="config.staticBaseUrl + '/icons/counseling.png'" width="60rpx" height="60rpx"
            mode="aspectFit"></uv-image>
          <text style="color: #A83333; font-size: 32rpx; margin-left: 12rpx;">心理咨询</text>
        </view>
        <view class="counseling-content" style="padding: 0 30rpx;">
          <view style="display: flex; align-items: baseline;">
            <text
              style="color: #A83333; font-size: 56rpx; font-weight: bold; margin: 10rpx 0; text-wrap: nowrap;">1,188,777</text>
            <text style="color: #A83333; font-size: 36rpx; margin-left: 4rpx;">人</text>
          </view>
          <text style="color: #A83333; font-size: 28rpx; display: block; margin-bottom: 20rpx;">在这里选择了咨询师</text>
        </view>
        <view class="counseling-footer" style="position: absolute; bottom: 30rpx; left: 30rpx;">
          <text style="color: #A83333; font-size: 32rpx;">勇敢迈出第一步 ></text>
        </view>
        <uv-image class="counseling-bg" :src="config.staticBaseUrl + '/icons/counseling-bg.png'" width="240rpx"
          height="240rpx" mode="aspectFit" style="position: absolute; right: 20rpx; bottom: 0; z-index: 1;">
        </uv-image>
      </view>
    </view>

    <!-- 引入用户 TabBar -->
    <user-tabbar></user-tabbar>
  </view>
</template>

<script>
import UserTabbar from '@/components/tabbar/user-tabbar/user-tabbar.vue'
import config from '@/config/index.js'
import youthAssistanceApi from '@/api/modules/youth-assistance.js'

export default {
  name: 'FundPage',
  components: {
    UserTabbar
  },
  data() {
    return {
      gridList: [
        {
          title: '填写申请表',
          icon: `${config.staticBaseUrl}/icons/apply.png`,
          bgColor: '#0049FF'
        },
        {
          title: '法律咨询',
          icon: `${config.staticBaseUrl}/icons/legal2.png`,
          bgColor: '#C06FF7'
        },
        {
          title: '就业帮扶',
          icon: `${config.staticBaseUrl}/icons/job2.png`,
          bgColor: '#FFB217'
        }
      ],
      statistics: {
        helpingCount: 7680,
        helpedCount: 1680,
        totalAmount: 0,
        monthlyNewCount: 0
      },
      caseList: [],
      config: config
    }
  },
  onLoad() {
    this.loadPageData()
  },
  methods: {
    handleGridClick(index) {
      const item = this.gridList[index]
      if (item.title === '填写申请表') {
        uni.navigateTo({
          url: '/pages/user/fund/apply/index'
        })
      }
      else if (item.title === '法律咨询') {
        // pages\user\index\legal-help\index.vue
        uni.navigateTo({
          url: '/pages/user/index/legal-help/index'
        })
      }
      else if (item.title === '就业帮扶') {
        uni.navigateTo({
          url: '/pages/user/index/job-platform/index'
        })
      }
      else {
        uni.showToast({
          icon: 'none',
          title: `点击了${item.title}`
        })
      }
    },
    navigateToApply() { uni.navigateTo({ url: '/pages/user/fund/apply/index' }) }, 
    navigateToHelpTypes() { uni.navigateTo({ url: '/pages/user/fund/help-types/index' }) }, 
    navigateToCounseling() { uni.navigateTo({ url: '/pages/user/fund/counseling/index' }) }, 
    navigateToCreditRecovery() { uni.navigateTo({ url: '/pages/user/fund/credit-recovery/index' }) },
    navigateToCase() { 
      uni.navigateTo({ 
        url: '/pages/user/fund/case/index' 
      }) 
    },
    /**
     * 加载页面数据
     */
    async loadPageData() {
      try {
        // 并行加载主页数据和帮扶案例
        const [homePageResult, casesResult] = await Promise.allSettled([
          this.getHomePageData(),
          this.getCaseList()
        ])
        
        // 处理主页数据结果
        if (homePageResult.status === 'rejected') {
          console.error('获取主页数据失败：', homePageResult.reason)
        }
        
        // 处理案例数据结果
        if (casesResult.status === 'rejected') {
          console.error('获取帮扶案例失败：', casesResult.reason)
        }
      } catch (error) {
        console.error('加载页面数据失败：', error)
      }
    },

    /**
     * 获取主页数据（包括统计信息）
     */
    async getHomePageData() {
      try {
        const response = await youthAssistanceApi.getHomePage()
        if (response.code === 0 && response.data) {
          // 更新统计数据
          if (response.data.statistics) {
            this.statistics = {
              helpedCount: response.data.statistics.helpedCount || 0,
              helpingCount: response.data.statistics.helpingCount || 0,
              totalAmount: response.data.statistics.totalAmount || 0,
              monthlyNewCount: response.data.statistics.monthlyNewCount || 0
            }
          }
        }
      } catch (error) {
        console.error('获取主页数据失败：', error)
        // 保持默认统计数据
      }
    },

    /**
     * 获取帮扶案例列表
     */
    async getCaseList() {
      try {
        const response = await youthAssistanceApi.getAssistanceRecords({
          page: 1,
          size: 10,
          status: 'completed' // 只获取已完成的帮扶记录作为案例展示
        })
        
        if (response.code === 0 && response.data && response.data.records && response.data.records.length > 0) {
          let cases = response.data.records.map(record => ({
            maskedName: this.maskName(record.userName || record.applicantName),
            loanAmount: record.assistanceAmount || record.amount || 0,
            createTime: this.formatDate(record.completedTime || record.createTime)
          }))
          
          // 按金额排序并取前3个
          cases = cases.sort((a, b) => b.loanAmount - a.loanAmount).slice(0, 3)
          
          // 如果不足3个，用默认数据补充
          if (cases.length < 3) {
            const defaultCases = [
              { maskedName: '张**', loanAmount: 50000, createTime: '2024-03-15' },
              { maskedName: '李**', loanAmount: 30000, createTime: '2024-03-10' },
              { maskedName: '王**', loanAmount: 20000, createTime: '2024-03-05' }
            ]
            cases = [...cases, ...defaultCases.slice(cases.length)].slice(0, 3)
          }
          
          this.caseList = cases
        } else {
          this.setDefaultCaseList()
        }
      } catch (error) {
        console.error('获取帮扶案例列表失败：', error)
        this.setDefaultCaseList()
      }
    },

    /**
     * 设置默认案例列表
     */
    setDefaultCaseList() {
      this.caseList = [
        {
          maskedName: '张**',
          loanAmount: 50000,
          createTime: '2024-03-15'
        },
        {
          maskedName: '李**',
          loanAmount: 30000,
          createTime: '2024-03-10'
        },
        {
          maskedName: '王**',
          loanAmount: 20000,
          createTime: '2024-03-05'
        }
      ]
    },

    /**
     * 姓名脱敏处理
     */
    maskName(name) {
      if (!name || name.length < 2) return '**'
      if (name.length === 2) return name[0] + '*'
      return name[0] + '*'.repeat(name.length - 1)
    },

    /**
     * 格式化日期
     */
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return dateString
      return date.toISOString().split('T')[0]
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.fund-page {
  min-height: 100%;
  padding-bottom: 100rpx;
  /* 为 TabBar 预留空间 */
  background-image: $fund-bg-image;
  background-size: cover;
  background-position: top;
  background-repeat: no-repeat;

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
      overflow: hidden;
      flex-shrink: 0;

      &.legal-icon {
        .uv-image {
          transform: scale(1.4);
        }
      }
    }

    .grid-text {
      font-size: 28rpx;
      color: #fff;
    }
  }

  .statistics-banner {
    margin: 20rpx 30rpx;
    background: linear-gradient(to right, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.5));
    border-radius: 16rpx;
    padding: 30rpx;
    display: flex;
    justify-content: space-around;
    align-items: center;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;

      .stat-title {
        font-size: 28rpx;
        color: #333;
        margin-bottom: 10rpx;
      }

      .stat-number {
        font-size: 48rpx;
        color: #1D5DD9;
        font-weight: bold;
      }
    }

    .divider {
      width: 2rpx;
      height: 80rpx;
      background-color: #225BCB;
    }
  }

  .case-section {
    margin: 20rpx 30rpx;
    background: white;
    border-radius: 16rpx;
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
          border-top-right-radius: 16rpx;

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

    .case-item {
      margin-right: 20rpx;

      &:last-child {
        margin-right: 0;
      }
    }

    .case-content {
      border-radius: 12rpx;
      padding: 20rpx;
      margin-top: 20rpx;
      display: flex;
      flex-direction: column;
      gap: 12rpx;

      .case-item {
        font-size: 28rpx;
        color: #3C5D9F;
        line-height: 1.5;
        background-color: #F5F8FF;
        padding: 16rpx 20rpx;
        border-radius: 8rpx;
        width: 100%;
        box-sizing: border-box;

        .case-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .case-time {
          font-size: 24rpx;
          color: #999;
        }
      }
    }
  }

  .feature-section {
    margin: 20rpx 30rpx;
    display: flex;
    gap: 20rpx;

    .feature-left {
      width: 50%;
      display: flex;
      flex-direction: column;
      gap: 20rpx;

      .feature-item {
        width: 100%;
      }
    }

    .feature-item {
      width: 50%;
      border-radius: 16rpx;
      padding: 20rpx;
      color: #fff;
      box-sizing: border-box;

      .feature-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 16rpx;
        position: relative;

        .title-group {
          display: flex;
          flex-direction: column;
          gap: 8rpx;
        }

        .feature-title {
          font-size: 32rpx;
          font-weight: bold;
        }

        .feature-subtitle {
          font-size: 28rpx;
        }

        .feature-icon {
          position: absolute;
          right: 0;
          top: 10%;

        }
      }

      .feature-desc {
        display: flex;
        flex-direction: column;
        gap: 8rpx;

        text {
          font-size: 24rpx;
          opacity: 0.9;
        }
      }
    }
  }
}
</style>