<template>
  <view class="custom-tabbar">
    <uv-tabbar :value="current" @change="onChange">
      <uv-tabbar-item text="首页">
        <template v-slot:active-icon>
          <image :src="`${config.staticBaseUrl}/icons/home-active.png`" style="width: 48rpx; height: 48rpx;"></image>
        </template>
        <template v-slot:inactive-icon>
          <image :src="`${config.staticBaseUrl}/icons/home.png`" style="width: 48rpx; height: 48rpx;"></image>
        </template>
      </uv-tabbar-item>
      <uv-tabbar-item text="消息">
        <template v-slot:active-icon>
          <image :src="`${config.staticBaseUrl}/icons/info-active.png`" style="width: 48rpx; height: 48rpx;"></image>
        </template>
        <template v-slot:inactive-icon>
          <image :src="`${config.staticBaseUrl}/icons/info.png`" style="width: 48rpx; height: 48rpx;"></image>
        </template>
      </uv-tabbar-item>
      <uv-tabbar-item text="我的">
        <template v-slot:active-icon>
          <image :src="`${config.staticBaseUrl}/icons/profile-active.png`" style="width: 48rpx; height: 48rpx;"></image>
        </template>
        <template v-slot:inactive-icon>
          <image :src="`${config.staticBaseUrl}/icons/profile.png`" style="width: 48rpx; height: 48rpx;"></image>
        </template>
      </uv-tabbar-item>
    </uv-tabbar>
  </view>
</template>

<script>
import config from '@/config/index.js'

export default {
  name: 'LawyerTabbar',
  data() {
    return {
      config,
      current: 0
    }
  },
  created() {
    // 根据当前路由设置 current 值
    const routes = [
      '/pages/lawyer/index/dashboard/index',
      '/pages/lawyer/index/consultation-message/index', 
      '/pages/lawyer/index/profile/index'
    ]
    
    // 获取当前页面完整路径
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const currentRoute = '/' + currentPage.route
    
    // 使用精确匹配
    this.current = routes.findIndex(route => route === currentRoute)
    
    // 如果是律师个人资料页面，归类到"我的"标签页
    if (currentRoute === '/pages/lawyer/index/lawyer-profile/index') {
      this.current = 2
    }
    
    if (this.current === -1) {
      this.current = 0 // 默认选中首页
    }
  },
  methods: {
    onChange(index) {
      this.current = index
      console.log(index);
      
      const routes = [
        '/pages/lawyer/index/dashboard/index',
        '/pages/lawyer/index/consultation-message/index',
        '/pages/lawyer/index/profile/index'
      ]
      uni.reLaunch({
        url: routes[index]
      })
    }
  }
}
</script>

<style scoped>
.custom-tabbar {
  width: 100%;
}
</style>