<template>
  <view class="lawyer-consultation-page" :style="{ backgroundImage: `url('${config.staticBaseUrl}/bg7.png')` }">
    <!-- 状态栏占位 -->
    <view class="status-bar"></view>
    
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="navbar-content">
        <view class="back-button" @click="goBack">
          <uv-icon name="arrow-left" color="#FFFFFF" size="32"></uv-icon>
          <text class="back-text">返回</text>
        </view>
      </view>
    </view>
    
    <!-- 页面标题区域 -->
    <view class="page-header">
      <text class="main-title">法律帮助</text>
      <text class="sub-title">一对一咨询</text>
      <text class="description">专业律师为您排忧解难</text>
    </view>
    
    <!-- 内容区域 -->
    <view class="content-container" :style="{ height: scrollHeight }">
      <!-- 固定的筛选标签栏 -->
      <view class="fixed-tabs-area">
        <scroll-view 
          class="filter-tabs" 
          scroll-x="true" 
          show-scrollbar="false"
          :enable-flex="true"
          :scroll-with-animation="true"
        >
          <view class="tabs-container">
            <view 
              v-for="(tab, index) in filterTabs" 
              :key="index"
              class="tab-item"
              :class="{ 'tab-active': tab.active }"
              @click="selectTab(index)"
            >
              <text class="tab-text">{{ tab.name }}</text>
            </view>
          </view>
        </scroll-view>
      </view>
      
      <!-- 可滚动的律师列表区域 -->
      <view class="scrollable-list-area">
        <scroll-view 
          class="list-scroll" 
          scroll-y="true" 
          :style="{ height: listScrollHeight }"
          :enable-back-to-top="true"
          :scroll-with-animation="true"
          :enhanced="true"
          :bounces="true"
          :show-scrollbar="false"
          :fast-deceleration="false"
          :lower-threshold="100"
          :upper-threshold="50"
          refresher-enabled="true"
          :refresher-triggered="refreshing"
          @refresherrefresh="refreshData"
          @scroll="onScroll"
          @scrolltoupper="onScrollToUpper"
          @scrolltolower="onScrollToLower"
        >
          <!-- 下拉刷新指示器 -->
          <view v-if="refreshing" class="refresh-indicator">
            <uv-loading-icon mode="flower" color="#4A7DFF" size="24"></uv-loading-icon>
            <text class="refresh-text">正在刷新...</text>
          </view>
          
          <!-- 专家卡片列表 -->
          <view class="lawyer-list">
            <view
              v-for="(expert, index) in expertList"
              :key="expert.id"
              class="lawyer-card"
            >
              <view class="card-content">
                <!-- 专家基本信息区域 -->
                <view class="lawyer-basic-info">
                  <!-- 专家头像 -->
                  <view class="lawyer-avatar">
                    <view class="expert-type-badge" :class="expert.type">
                      {{ expert.type === 'lawyer' ? '律' : '心' }}
                    </view>
                  </view>
                  
                  <!-- 专家文本信息 -->
                  <view class="lawyer-text-info">
                    <text class="lawyer-name">{{ expert.name }}</text>
                    <text class="lawyer-tags">{{ expert.specialty }} | {{ expert.experience }} | {{ expert.successRate }}</text>
                    <text class="consult-count">{{ expert.consultCount }}</text>
                  </view>
                </view>
                
                <!-- 服务项目区域 -->
                <view class="services-section">
                  <view class="services">
                    <view
                      v-for="(service, sIndex) in expert.services"
                      :key="sIndex"
                      class="service-item"
                    >
                      <image :src="config.staticBaseUrl + '/icons/' + service.icon + '.png'" style="width: 12px; height: 12px;" mode="aspectFit"></image>
                      <text class="service-name">{{ service.type }}</text>
                      <view class="service-price-container">
                        <text class="service-price">¥{{ service.price }}</text>
                        <text class="service-unit">/{{ service.unit }}</text>
                      </view>
                    </view>
                  </view>
                  
                  <!-- 立即咨询按钮 -->
                  <view class="consult-button" @click="consultLawyer(expert)">
                    <text class="consult-text">立即咨询</text>
                  </view>
                </view>
                
                <!-- 成功案例/专业介绍 -->
                <text class="achievement">{{ expert.achievement }}</text>
              </view>
              
              <!-- 分割线 -->
              <view v-if="index < expertList.length - 1" class="divider"></view>
            </view>
          </view>
          
          <!-- 加载更多指示器 -->
          <view v-if="loadingMore" class="loading-more-indicator">
            <uv-loading-icon mode="circle" color="#4A7DFF" size="20"></uv-loading-icon>
            <text class="loading-text">加载更多...</text>
          </view>
          
          <!-- 空状态提示 -->
          <view v-if="!loading && expertList.length === 0" class="empty-state">
            <view class="empty-icon">
              <uv-icon name="search" color="#C8C8C8" size="48"></uv-icon>
            </view>
            <text class="empty-title">暂无相关专家</text>
            <text class="empty-desc">请尝试切换其他分类或稍后再试</text>
            <view class="empty-action" @click="refreshData">
              <text class="empty-action-text">重新加载</text>
            </view>
          </view>
          

          <!-- 增强的没有更多数据提示 -->
          <view v-if="noMoreData && expertList.length > 0" class="enhanced-no-more-data">
            <view class="no-more-line"></view>
            <view class="no-more-content">
              <!-- <uv-icon name="check-circle" color="#4A7DFF" size="18"></uv-icon> -->
              <text class="no-more-text">已显示全部 {{ expertList.length }} 位专家</text>
            </view>
            <view class="no-more-line"></view>
          </view>
          
          <!-- 滚动到底部的视觉提示 -->
          <view v-if="expertList.length >= 5 && !loadingMore && !noMoreData" class="scroll-bottom-hint">
            <view class="hint-content">
              <uv-icon name="arrow-down" color="#999999" size="14"></uv-icon>
              <text class="hint-text">继续滑动查看更多</text>
              <uv-icon name="arrow-down" color="#999999" size="14"></uv-icon>
            </view>
          </view>
          
          <!-- 底部安全区域 -->
          <view class="bottom-safe-area"></view>
        </scroll-view>
      </view>
    </view>
    
    <!-- 回到顶部按钮 -->
    <view 
      v-if="showBackToTop" 
      class="back-to-top-btn" 
      @click="scrollToTop"
    >
      <uv-icon name="arrow-up" color="#FFFFFF" size="20"></uv-icon>
    </view>
    
    <!-- 底部导航栏 -->
    <user-tabbar></user-tabbar>
  </view>
</template>

<script>
import UserTabbar from '@/components/tabbar/user-tabbar/user-tabbar.vue'
import { getLegalConsultationLawyers } from '@/api/modules/legal.js'
import { getPsychologists } from '@/api/modules/psychologist.js'
import { getHotLawyers } from '@/api/modules/home.js'
import config from '@/config/index.js'

export default {
  name: 'LawyerConsultationPage',
  components: {
    UserTabbar
  },
  data() {
    return {
      config,
      scrollHeight: '100vh',
      listScrollHeight: '400px', // 列表滚动区域高度
      loading: false,
      refreshing: false, // 下拉刷新状态
      loadingMore: false, // 加载更多状态
      noMoreData: false, // 没有更多数据
      showBackToTop: false, // 显示回到顶部按钮
      scrollTop: 0, // 当前滚动位置
      retryCount: 0,
      maxRetries: 3,
      cacheExpiry: 10 * 60 * 1000, // 10分钟缓存
      lastCacheTime: null,
      cachedData: null,
      // 筛选标签数据
      filterTabs: [
        { name: '法律咨询', active: true, type: 'legal' },
        { name: '心理咨询', active: false, type: 'psychology' },
        { name: '劳动纠纷', active: false, type: 'legal', specialty: 'labor' },
        { name: '合同纠纷', active: false, type: 'legal', specialty: 'contract' },
        { name: '婚姻家庭', active: false, type: 'legal', specialty: 'family' },
        { name: '心理健康', active: false, type: 'psychology', specialty: 'mental' },
        { name: '情感咨询', active: false, type: 'psychology', specialty: 'emotion' },
      ],
      // 专家信息数据（律师+心理师）
      expertList: [],
      allLawyers: [],
      allPsychologists: [],
      currentType: 'legal', // 当前显示类型：legal 或 psychology
      
      // 分页相关
      currentPage: 1,
      pageSize: 10,
      totalPages: 1,
      hasMoreData: true
    }
  },
  mounted() {
    this.calculateScrollHeight()
    this.initData()
    
    // 监听页面显示，重新计算高度
    uni.$on('onShow', this.calculateScrollHeight)
  },
  
  beforeDestroy() {
    // 清理事件监听
    uni.$off('onShow', this.calculateScrollHeight)
  },
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack()
    },
    
    // 滚动事件处理
    onScroll(e) {
      this.scrollTop = e.detail.scrollTop
      // 显示/隐藏回到顶部按钮
      this.showBackToTop = this.scrollTop > 300
    },
    
    // 滚动到顶部事件
    onScrollToUpper() {
      if (!this.refreshing && !this.loading) {
        this.refreshData()
      }
    },
    
    // 滚动到底部事件 - 增强检测逻辑
    onScrollToLower() {
      console.log('滚动到底部', {
        loadingMore: this.loadingMore,
        hasMoreData: this.hasMoreData,
        noMoreData: this.noMoreData,
        expertListLength: this.expertList.length
      })
      
      // 如果正在加载或没有更多数据，不触发加载
      if (this.loadingMore || this.noMoreData) {
        return
      }
      
      // 如果有更多数据，触发加载
      if (this.hasMoreData) {
        this.loadMoreData()
      } else {
        // 如果没有更多数据但状态未更新，更新状态
        if (this.expertList.length > 0) {
          this.noMoreData = true
          this.hasMoreData = false
        }
      }
    },
    
    // 回到顶部
    scrollToTop() {
      // 通过设置scroll-top属性实现平滑滚动
      this.$nextTick(() => {
        const query = uni.createSelectorQuery().in(this)
        query.select('.list-scroll').node().exec((res) => {
          if (res[0]) {
            res[0].node.scrollTo({
              top: 0,
              behavior: 'smooth'
            })
          }
        })
      })
    },
    
    // 下拉刷新
    async refreshData() {
      if (this.refreshing) return
      
      this.refreshing = true
      this.currentPage = 1
      this.hasMoreData = true
      this.noMoreData = false
      
      try {
        // 清除缓存，重新加载数据
        this.cachedData = null
        this.lastCacheTime = null
        await this.loadExpertDataPage(1)
        
        uni.showToast({
          title: '刷新成功',
          icon: 'success',
          duration: 1500
        })
      } catch (error) {
        console.error('刷新失败:', error)
        uni.showToast({
          title: '刷新失败',
          icon: 'none',
          duration: 2000
        })
      } finally {
        this.refreshing = false
      }
    },
    
    // 加载更多数据
    async loadMoreData() {
      if (this.loadingMore || this.noMoreData || !this.hasMoreData) {
        return
      }
      
      try {
        this.loadingMore = true
        
        // 加载下一页数据
        const nextPage = this.currentPage + 1
        await this.loadExpertDataPage(nextPage)
        
        this.currentPage = nextPage
        
      } catch (error) {
        console.error('加载更多数据失败:', error)
        uni.showToast({
          title: '加载失败，请重试',
          icon: 'none'
        })
        
        // 恢复状态，允许重试
        this.hasMoreData = true
        this.noMoreData = false
        
      } finally {
        this.loadingMore = false
      }
    },
    // 选择筛选标签
    selectTab(index) {
      this.filterTabs.forEach((tab, i) => {
        tab.active = i === index
      })
      
      const selectedTab = this.filterTabs[index]
      this.currentType = selectedTab.type
      
      // 根据选择的标签筛选和显示对应的专家
      this.filterExpertsByTab(selectedTab)
    },
    
    // 根据标签筛选专家
    filterExpertsByTab(selectedTab) {
      console.log('筛选专家，选择的标签:', selectedTab)
      
      if (selectedTab.type === 'legal') {
        // 显示律师数据
        if (selectedTab.specialty) {
          // 按专业领域筛选律师
          this.expertList = this.allLawyers.filter(lawyer =>
            lawyer.specialties && lawyer.specialties.includes(selectedTab.specialty)
          )
        } else {
          // 显示所有律师
          this.expertList = [...this.allLawyers]
        }
      } else if (selectedTab.type === 'psychology') {
        // 显示心理师数据
        if (selectedTab.specialty) {
          // 按专业领域筛选心理师
          this.expertList = this.allPsychologists.filter(psychologist =>
            psychologist.specialties && psychologist.specialties.includes(selectedTab.specialty)
          )
        } else {
          // 显示所有心理师
          this.expertList = [...this.allPsychologists]
        }
      }
      
      console.log('筛选后的专家列表:', this.expertList)
    },
    // 咨询专家（律师或心理师）
    consultLawyer(expert) {
      console.log('咨询专家:', expert)
      
      if (expert.type === 'lawyer') {
        // 使用userId字段而不是id字段
        const lawyerId = expert.userId || expert.id
        uni.navigateTo({
          url: `/pages/user/index/lawyer-detail/index?lawyerId=${lawyerId}`
        })
      } else if (expert.type === 'psychologist') {
        const psychologistId = expert.userId || expert.id
        uni.navigateTo({
          url: `/pages/psychologist/consultation/consultation?psychologistId=${psychologistId}`
        })
      }
    },
    // 初始化数据
    async initData() {
      try {
        uni.showLoading({ title: '加载中...' })
        
        // 重置分页状态
        this.currentPage = 1
        this.hasMoreData = true
        this.noMoreData = false
        
        // 使用新的分页加载方法
        await this.loadExpertDataPage(1)
        
        // 默认显示律师列表
        this.filterExpertsByTab(this.filterTabs[0])
        
      } catch (error) {
        console.error('初始化数据失败:', error)
        uni.showToast({
          title: '数据加载失败',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    },
    

    
    // 带重试机制的数据加载
    async loadDataWithRetry() {
      for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
        try {
          console.log(`数据加载尝试 ${attempt + 1}/${this.maxRetries + 1}`)
          
          // 并行加载律师和心理师数据
          const [lawyersResult, psychologistsResult] = await Promise.allSettled([
            this.loadLawyersData(),
            this.loadPsychologistsData()
          ])
          
          // 处理律师数据
          if (lawyersResult.status === 'fulfilled') {
            this.allLawyers = lawyersResult.value
            console.log('律师数据加载成功，数量:', this.allLawyers.length)
          } else {
            console.warn('律师数据加载失败:', lawyersResult.reason)
            this.allLawyers = this.getDefaultLawyerData()
          }
          
          // 处理心理师数据
          if (psychologistsResult.status === 'fulfilled') {
            this.allPsychologists = psychologistsResult.value
            console.log('心理师数据加载成功，数量:', this.allPsychologists.length)
          } else {
            console.warn('心理师数据加载失败:', psychologistsResult.reason)
            this.allPsychologists = this.getDefaultPsychologistData()
          }
          
          // 如果至少有一个数据源成功，就认为加载成功
          if (lawyersResult.status === 'fulfilled' || psychologistsResult.status === 'fulfilled') {
            console.log('专家数据加载完成')
            return
          }
          
          throw new Error('所有数据源都加载失败')
          
        } catch (error) {
          console.error(`第 ${attempt + 1} 次尝试失败:`, error)
          
          if (attempt === this.maxRetries) {
            throw error
          }
          
          // 指数退避重试，添加随机抖动
          const delay = Math.min(1000 * Math.pow(2, attempt), 8000) + Math.random() * 1000
          console.log(`等待 ${delay.toFixed(0)}ms 后重试...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    },
    
    // 分页加载专家数据
    async loadExpertDataPage(page = 1) {
      try {
        const [lawyersResult, psychologistsResult] = await Promise.allSettled([
          this.loadLawyersDataPage(page),
          this.loadPsychologistsDataPage(page)
        ])
        
        // 处理律师数据
        let newLawyers = []
        if (lawyersResult.status === 'fulfilled') {
          newLawyers = lawyersResult.value.data || []
          if (page === 1) {
            this.allLawyers = newLawyers
          } else {
            this.allLawyers = [...this.allLawyers, ...newLawyers]
          }
        }
        
        // 处理心理师数据
        let newPsychologists = []
        if (psychologistsResult.status === 'fulfilled') {
          newPsychologists = psychologistsResult.value.data || []
          if (page === 1) {
            this.allPsychologists = newPsychologists
          } else {
            this.allPsychologists = [...this.allPsychologists, ...newPsychologists]
          }
        }
        
        // 检查是否还有更多数据
        const hasMoreLawyers = newLawyers.length === this.pageSize
        const hasMorePsychologists = newPsychologists.length === this.pageSize
        this.hasMoreData = hasMoreLawyers || hasMorePsychologists
        this.noMoreData = !this.hasMoreData && page > 1
        
        // 更新当前显示的专家列表
        this.filterExpertsByTab(this.filterTabs.find(tab => tab.active))
        
      } catch (error) {
        console.error('分页加载专家数据失败:', error)
        throw error
      }
    },
    
    // 加载律师数据（支持分页）
    async loadLawyersData() {
      return this.loadLawyersDataPage(1)
    },
    
    async loadLawyersDataPage(page = 1) {
      try {
        // 优先使用法律咨询专用API
        const response = await getLegalConsultationLawyers({
          page: page,
          pageSize: this.pageSize,
          sortBy: 'rating'
        })
        
        // 正确提取响应数据：response.data 而不是 response
        if (response && response.data && Array.isArray(response.data)) {
          return {
            data: this.formatLawyerData(response.data),
            total: response.total || response.data.length
          }
        }
        
        throw new Error('法律咨询API响应格式不正确')
        
      } catch (error) {
        console.warn('法律咨询API失败，尝试备用API:', error)
        
        // 备用方案：使用热门律师API
        try {
          const backupResponse = await getHotLawyers({ limit: this.pageSize })
          // 正确提取响应数据：backupResponse.data 而不是 backupResponse
          if (backupResponse && backupResponse.data && Array.isArray(backupResponse.data)) {
            return {
              data: this.formatLawyerData(backupResponse.data),
              total: backupResponse.total || backupResponse.data.length
            }
          }
        } catch (backupError) {
          console.error('备用律师API也失败:', backupError)
        }
        
        throw error
      }
    },
    
    // 加载心理师数据（支持分页）
    async loadPsychologistsData() {
      return this.loadPsychologistsDataPage(1)
    },
    
    async loadPsychologistsDataPage(page = 1) {
      try {
        const response = await getPsychologists({
          page: page,
          pageSize: this.pageSize,
          sortBy: 'rating'
        })
        
        // 正确提取响应数据：response.data 而不是 response
        if (response && response.data && Array.isArray(response.data)) {
          return {
            data: this.formatPsychologistData(response.data),
            total: response.total || response.data.length
          }
        }
        
        throw new Error('心理师API响应格式不正确')
        
      } catch (error) {
        console.error('心理师数据加载失败:', error)
        throw error
      }
    },
    
    // 格式化律师数据
    formatLawyerData(lawyers) {
      return lawyers.map(lawyer => ({
        id: lawyer.id,
        userId: lawyer.userId, // 保存userId字段用于咨询跳转
        type: 'lawyer',
        name: lawyer.name || '未知律师',
        specialty: lawyer.specialties ? lawyer.specialties.join('、') : '专业领域',
        specialties: lawyer.specialties || [],
        experience: lawyer.experienceYears ? `${lawyer.experienceYears}年经验` : '经验年限',
        successRate: lawyer.successRate ? `胜诉率${lawyer.successRate}%` : '胜诉率',
        consultCount: lawyer.consultationCount ? `${lawyer.consultationCount}+人已咨询` : '咨询次数',
        services: [
          { type: '图文咨询', price: Math.floor(lawyer.consultationFee * 0.6) || 60, unit: '次', icon: 'img' },
          { type: '语音咨询', price: lawyer.consultationFee || 120, unit: '30分钟', icon: 'call' }
        ],
        achievement: `专业${lawyer.specialties ? lawyer.specialties[0] : '法律'}服务，成功率${lawyer.successRate || 95}%`
      }))
    },
    
    // 格式化心理师数据
    formatPsychologistData(psychologists) {
      return psychologists.map(psychologist => ({
        id: psychologist.id,
        type: 'psychologist',
        name: psychologist.name || '未知心理师',
        specialty: psychologist.specialties ? psychologist.specialties.join('、') : '心理咨询',
        specialties: psychologist.specialties || [],
        experience: psychologist.experienceYears ? `${psychologist.experienceYears}年经验` : '经验年限',
        successRate: psychologist.rating ? `评分${psychologist.rating}分` : '专业评分',
        consultCount: psychologist.consultationCount ? `${psychologist.consultationCount}+人已咨询` : '咨询次数',
        services: [
          { type: '文字咨询', price: psychologist.textFee || 80, unit: '次', icon: 'img' },
          { type: '语音咨询', price: psychologist.voiceFee || 150, unit: '30分钟', icon: 'call' }
        ],
        achievement: `专业心理咨询服务，${psychologist.specialties ? psychologist.specialties[0] : '心理健康'}专家`
      }))
    },
    // 获取默认律师数据
    getDefaultLawyerData() {
      return [
        {
          id: 'default_lawyer_1',
          type: 'lawyer',
          name: '李晓明',
          specialty: '劳动法专长',
          specialties: ['labor'],
          experience: '8年经验',
          successRate: '胜诉率91%',
          consultCount: '400+人已咨询',
          services: [
            { type: '图文咨询', price: 60, unit: '次', icon: 'img' },
            { type: '语音咨询', price: 120, unit: '30分钟', icon: 'call' }
          ],
          achievement: '成功帮助某员工追回工资5万元'
        },
        {
          id: 'default_lawyer_2',
          type: 'lawyer',
          name: '王律师',
          specialty: '合同纠纷、债务纠纷',
          specialties: ['contract'],
          experience: '12年经验',
          successRate: '胜诉率95%',
          consultCount: '300+人已咨询',
          services: [
            { type: '图文咨询', price: 80, unit: '次', icon: 'img' },
            { type: '语音咨询', price: 150, unit: '30分钟', icon: 'call' }
          ],
          achievement: '专业合同服务，成功率95%'
        }
      ]
    },
    
    // 获取默认心理师数据
    getDefaultPsychologistData() {
      return [
        {
          id: 'default_psychologist_1',
          type: 'psychologist',
          name: '张心理师',
          specialty: '情感咨询、心理健康',
          specialties: ['emotion', 'mental'],
          experience: '6年经验',
          successRate: '评分4.8分',
          consultCount: '200+人已咨询',
          services: [
            { type: '文字咨询', price: 80, unit: '次', icon: 'img' },
            { type: '语音咨询', price: 150, unit: '30分钟', icon: 'call' }
          ],
          achievement: '专业心理咨询服务，情感专家'
        },
        {
          id: 'default_psychologist_2',
          type: 'psychologist',
          name: '刘心理师',
          specialty: '心理健康、职场压力',
          specialties: ['mental'],
          experience: '10年经验',
          successRate: '评分4.9分',
          consultCount: '350+人已咨询',
          services: [
            { type: '文字咨询', price: 100, unit: '次', icon: 'img' },
            { type: '语音咨询', price: 180, unit: '30分钟', icon: 'call' }
          ],
          achievement: '专业心理咨询服务，心理健康专家'
        }
      ]
    },
    
    // 缓存相关方法
    isCacheValid() {
      if (!this.cachedData || !this.lastCacheTime) {
        return false
      }
      return (Date.now() - this.lastCacheTime) < this.cacheExpiry
    },
    
    cacheData() {
      this.cachedData = {
        allLawyers: [...this.allLawyers],
        allPsychologists: [...this.allPsychologists]
      }
      this.lastCacheTime = Date.now()
      console.log('数据已缓存')
    },
    
    restoreFromCache() {
      if (this.cachedData) {
        this.allLawyers = [...this.cachedData.allLawyers]
        this.allPsychologists = [...this.cachedData.allPsychologists]
        this.filterExpertsByTab(this.filterTabs[0])
        console.log('从缓存恢复数据')
      }
    },
    
    // 错误处理
    handleLoadError(error) {
      console.error('专家数据加载失败:', error)
      
      // 使用默认数据
      this.allLawyers = this.getDefaultLawyerData()
      this.allPsychologists = this.getDefaultPsychologistData()
      this.filterExpertsByTab(this.filterTabs[0])
      
      // 显示用户友好的错误提示
      let errorMessage = '网络连接异常，显示默认数据'
      
      if (error.message && error.message.includes('timeout')) {
        errorMessage = '网络超时，请检查网络连接'
      } else if (error.message && error.message.includes('404')) {
        errorMessage = '服务暂时不可用，显示默认数据'
      }
      
      uni.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 3000
      })
    },
    calculateScrollHeight() {
      // 获取系统信息
      const systemInfo = uni.getSystemInfoSync()
      const statusBarHeight = systemInfo.statusBarHeight || 0
      const navBarHeight = 60 // 自定义导航栏高度
      const headerHeight = 200 // 页面标题区域高度
      const tabBarHeight = 50 // 底部导航栏高度
      const safeAreaBottom = systemInfo.safeAreaInsets?.bottom || 0
      const tabsHeight = 80 // 筛选标签栏高度
      
      // 计算content-container的准确高度
      const usedHeight = statusBarHeight + navBarHeight + headerHeight + tabBarHeight + safeAreaBottom
      const availableHeight = systemInfo.windowHeight - usedHeight
      this.scrollHeight = Math.max(availableHeight, 300) + 'px' // 确保最小高度
      
      // 计算列表滚动区域高度，减去标签栏高度
      const listHeight = Math.max(availableHeight - tabsHeight, 200)
      this.listScrollHeight = listHeight + 'px'
      
      console.log('滚动高度计算:', {
        windowHeight: systemInfo.windowHeight,
        usedHeight,
        availableHeight,
        listHeight,
        scrollHeight: this.scrollHeight,
        listScrollHeight: this.listScrollHeight
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.lawyer-consultation-page {
  background-size: cover;
  background-position: 50% 0%;
  background-repeat: no-repeat;
  min-height: 100vh;
  position: relative;
}

// 状态栏占位
.status-bar {
  height: var(--status-bar-height);
  background: transparent;
}

// 自定义导航栏
.custom-navbar {
  position: absolute;
  top: var(--status-bar-height);
  left: 0;
  right: 0;
  z-index: 10;
  
  .navbar-content {
    padding: 15px 20px;
    
    .back-button {
      display: flex;
      align-items: center;
      
      .back-text {
        color: #FFFFFF;
        font-size: 16px;
        margin-left: 5px;
      }
    }
  }
}

// 页面标题区域
.page-header {
  padding: 132rpx 40rpx 80rpx;
  
  .main-title {
    color: #FFFFFF;
    font-size: 72rpx;
    font-weight: bold;
    display: block;
    margin-bottom: 5px;
    text-shadow: -7px 6px 12px rgba(0, 0, 0, 0.5);
  }
  
  .sub-title {
    color: #FFFFFF;
    font-size: 42px;
    font-weight: bold;
    display: block;
    margin-bottom: 15px;
    text-shadow: -7px 6px 12px rgba(0, 0, 0, 0.5);
  }
  
  .description {
    color: #FFFFFF;
    font-size: 15px;
    display: block;
    letter-spacing: 3rpx;
  }
}

// 内容容器
.content-container {
  background-color: #FFFFFF;
  border-top-left-radius: 25px;
  border-top-right-radius: 25px;
  margin-top: -25px;
  position: relative;
  z-index: 5;
  overflow: hidden;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

// 固定的标签区域
.fixed-tabs-area {
  padding: 20px 20px 0 20px;
  flex-shrink: 0;
}

// 可滚动的列表区域
.scrollable-list-area {
  flex: 1;
  overflow: hidden;
}

// 列表滚动容器
.list-scroll {
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
}

// 筛选标签栏
.filter-tabs {
  
  .tabs-container {
    display: flex;
    white-space: nowrap;
  }
  
  .tab-item {
    background-color: #E8EAF6;
    border-radius: 8px;
    padding: 6px 14px;
    margin-right: 10px;
    flex-shrink: 0;
    
    &.tab-active {
      background-color: #4A7DFF;
      
      .tab-text {
        color: #FFFFFF;
      }
    }
    
    .tab-text {
      color: #606C9A;
      font-size: 13px;
    }
  }
  
  .more-tab {
    background-color: #E8EAF6;
    border-radius: 8px;
    padding: 8px 12px;
    flex-shrink: 0;
    
    .more-text {
      color: #606C9A;
      font-size: 13px;
    }
  }
}

// 律师卡片列表
.lawyer-list {
  .lawyer-card {
    background-color: #FFFFFF;
    border-radius: 15px;
    padding: 20px;
    margin-bottom: 15px;
    display: flex;
    position: relative;
    
    .card-content {
      flex: 1;
      
      .lawyer-basic-info {
        display: flex;
        align-items: center;
        margin-bottom: 15px;
        
        .lawyer-avatar {
          width: 65px;
          height: 65px;
          background-color: #D8D8D8;
          border-radius: 50%;
          margin-right: 15px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          
          .expert-type-badge {
            position: absolute;
            bottom: -2px;
            right: -2px;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: bold;
            color: #FFFFFF;
            border: 2px solid #FFFFFF;
            
            &.lawyer {
              background-color: #4A7DFF;
            }
            
            &.psychologist {
              background-color: #FF6B9D;
            }
          }
        }
        
        .lawyer-text-info {
          flex: 1;
          
          .lawyer-name {
            color: #333333;
            font-size: 20px;
            font-weight: bold;
            display: block;
            margin-bottom: 5px;
          }
          
          .lawyer-tags {
            color: #666666;
            font-size: 12px;
            display: block;
            margin-bottom: 5px;
          }
          
          .consult-count {
            color: #999999;
            font-size: 11px;
            display: block;
            margin-bottom: 15px;
          }
        }
      }
      
      .services-section {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        margin-bottom: 10px;
        
        .services {
          flex: 1;
          
          .service-item {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
            
            .service-name {
              color: #333333;
              font-size: 14px;
              margin-left: 8rpx;
              margin-right: 16rpx;
              // flex: 1;
            }
            
            .service-price-container {
              display: flex;
              align-items: baseline;
              
              .service-price {
                color: #333333;
                font-size: 17px;
                font-weight: bold;
              }
              
              .service-unit {
                color: #7A6FF0;
                font-size: 14px;
              }
            }
          }
        }
        
        .consult-button {
          background: linear-gradient(90deg, #7A8AFF 0%, #A19DFF 100%);
          border-radius: 20px;
          padding: 8px 20px;
          margin-left: 15px;
          align-self: center;
          
          .consult-text {
            color: #FFFFFF;
            font-size: 14px;
          }
        }
      }
      
      .achievement {
        color: #AAAAAA;
        font-size: 10px;
        display: block;
      }
    }
    
    .divider {
      height: 1px;
      background-color: #E8EAF6;
      margin: 15px 0;
    }
  }
}



// 底部安全区域
.bottom-safe-area {
  height: 20px;
}

// 刷新指示器
.refresh-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx 0;
  gap: 16rpx;
}

.refresh-text {
  color: #4A7DFF;
  font-size: 28rpx;
}

// 加载更多指示器
.loading-more-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx 0;
  gap: 16rpx;
}

.loading-text {
  color: #4A7DFF;
  font-size: 28rpx;
}

// 空状态提示
.empty-state {
  padding: 120rpx 60rpx;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-icon {
  margin-bottom: 32rpx;
  opacity: 0.6;
}

.empty-title {
  color: #333333;
  font-size: 32rpx;
  font-weight: 500;
  margin-bottom: 16rpx;
}

.empty-desc {
  color: #999999;
  font-size: 28rpx;
  margin-bottom: 48rpx;
  line-height: 1.5;
}

.empty-action {
  background: #4A7DFF;
  color: white;
  padding: 20rpx 40rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
}

.empty-action-text {
  color: white;
}



// 增强的没有更多数据提示
.enhanced-no-more-data {
  padding: 40rpx 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24rpx;
}

.no-more-line {
  width: 80rpx;
  height: 2rpx;
  background: #E5E5E5;
}

.no-more-content {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.no-more-text {
  color: #4A7DFF;
  font-size: 26rpx;
  font-weight: 500;
}

// 滚动到底部的视觉提示
.scroll-bottom-hint {
  padding: 32rpx 0;
  text-align: center;
  animation: bounce 2s infinite;
}

.hint-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
}

.hint-text {
  color: #999999;
  font-size: 24rpx;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-6rpx);
  }
  60% {
    transform: translateY(-3rpx);
  }
}

// 回到顶部按钮
.back-to-top-btn {
  position: fixed;
  right: 40rpx;
  bottom: 200rpx;
  width: 88rpx;
  height: 88rpx;
  background: rgba(74, 125, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(74, 125, 255, 0.3);
  z-index: 100;
}
</style>