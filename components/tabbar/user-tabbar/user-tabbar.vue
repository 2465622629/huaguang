<template>
  <view class="custom-tabbar">
    <uv-tabbar :value="current" @change="onChange">
      <uv-tabbar-item text="首页">
        <template v-slot:active-icon>
          <image class="icon" :src="staticBaseUrl + '/home-active.png'"></image>
        </template>
        <template v-slot:inactive-icon>
          <image class="icon" :src="staticBaseUrl + '/home.png'"></image>
        </template>
      </uv-tabbar-item>
      <uv-tabbar-item text="青年帮扶基金">
        <template v-slot:active-icon>
          <image class="icon" :src="staticBaseUrl + '/fund-active.png'"></image>
        </template>
        <template v-slot:inactive-icon>
          <image class="icon" :src="staticBaseUrl + '/fund.png'"></image>
        </template>
      </uv-tabbar-item>
      <!-- 信息页面功能已注释 -->
      <!-- <uv-tabbar-item text="信息">
        <template v-slot:active-icon>
          <image class="icon" :src="staticBaseUrl + '/icons/info-active.png'"></image>
        </template>
        <template v-slot:inactive-icon>
          <image class="icon" :src="staticBaseUrl + '/info.png'"></image>
        </template>
      </uv-tabbar-item> -->
      <uv-tabbar-item text="我的">
        <template v-slot:active-icon>
          <image class="icon" :src="staticBaseUrl + '/icons/profile-active.png'"></image>
        </template>
        <template v-slot:inactive-icon>
          <image class="icon" :src="staticBaseUrl + '/profile.png'"></image>
        </template>
      </uv-tabbar-item>
    </uv-tabbar>
  </view>
</template>

<script>
import { staticBaseUrl } from '@/config/index'

export default {
  name: 'UserTabbar',
  props: {
    defaultActive: {
      type: Number,
      default: -1
    }
  },
  data() {
    return {
      current: 0,
      staticBaseUrl
    }
  },
  created() {
    // 如果传入了默认选中索引，直接使用
    if (this.defaultActive !== -1) {
      this.current = this.defaultActive
      console.log('使用传入的defaultActive:', this.defaultActive)
      return
    }
    
    // 根据当前路由设置 current 值
    const routes = [
      '/pages/user/index/index',
      '/pages/user/fund/index',
      // '/pages/user/info/index', // 信息页面已注释
      '/pages/user/profile/index'
    ]
    const currentRoute = getCurrentPages()[getCurrentPages().length - 1].route
    
    // 调试：输出当前路由信息
    console.log('当前路由:', currentRoute)
    console.log('完整页面信息:', getCurrentPages()[getCurrentPages().length - 1])
    
    // 特殊处理：如果是青年帮扶基金相关页面，都设置为选中青年帮扶基金标签
    if (currentRoute.includes('/pages/user/fund/')) {
      this.current = 1 // 青年帮扶基金的索引
      console.log('匹配到青年帮扶基金页面，设置current为1')
    } else if (currentRoute.includes('pages/user/fund/')) {
      // 尝试不带开头斜杠的匹配
      this.current = 1
      console.log('匹配到青年帮扶基金页面（无开头斜杠），设置current为1')
    } else {
      this.current = routes.findIndex(route => route.includes(currentRoute))
      console.log('使用默认匹配，current设置为:', this.current)
    }
    
    // 如果没有匹配到，默认为0
    if (this.current === -1) {
      this.current = 0
      console.log('没有匹配到任何路由，设置current为0')
    }
    
    console.log('最终current值:', this.current)
  },
  methods: {
    onChange(index) {
      this.current = index
      const routes = [
        '/pages/user/index/index',
        '/pages/user/fund/index',
        // '/pages/user/info/index', // 信息页面已注释
        '/pages/user/profile/index'
      ]
      uni.reLaunch({
        url: routes[index]
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.custom-tabbar {
  width: 100%;
  
  .icon {
    width: 48rpx;
    height: 48rpx;
  }
}
</style>

