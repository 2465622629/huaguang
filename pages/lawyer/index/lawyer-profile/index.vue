<template>
  <view class="lawyer-profile-page" :style="backgroundStyle">
    <!-- 状态栏占位 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
    
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="navbar-content">
        <view class="back-button" @click="goBack">
          <uv-icon name="arrow-left" color="#4A90E2" size="18"></uv-icon>
          <text class="back-text">返回</text>
        </view>
      </view>
    </view>
    
    <!-- 滚动容器 -->
    <scroll-view 
      class="scroll-container" 
      scroll-y 
      :style="{ height: scrollHeight + 'px' }"
      enable-flex
    >
      <!-- 用户信息卡片 -->
      <view class="user-info-card">
        <!-- 头像区域 -->
        <view class="avatar-section">
          <image
            v-if="lawyerInfo.avatar"
            :src="lawyerInfo.avatar"
            class="avatar-image"
            mode="aspectFill"
          ></image>
          <view v-else class="avatar-placeholder">
            <uv-icon name="person" color="#999" size="30"></uv-icon>
          </view>
          <view v-if="isLoading" class="loading-overlay">
            <uv-loading-icon mode="circle" size="20"></uv-loading-icon>
          </view>
        </view>
        
        <!-- 详细信息列表 -->
        <view class="info-list">
          <view class="info-row">
            <text class="info-label">姓名</text>
            <input
              v-if="isEditing"
              v-model="editForm.name"
              class="info-input"
              placeholder="请输入姓名"
              maxlength="20"
            />
            <text v-else class="info-content">{{ lawyerInfo.name }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">专长</text>
            <input
              v-if="isEditing"
              v-model="editForm.specialty"
              class="info-input"
              placeholder="请输入专业领域"
              maxlength="50"
            />
            <text v-else class="info-content">{{ lawyerInfo.specialty }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">执业经验</text>
            <input
              v-if="isEditing"
              v-model="editForm.experience"
              class="info-input"
              placeholder="请输入执业年限"
              type="number"
            />
            <text v-else class="info-content">{{ formattedExperience }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">胜诉率</text>
            <text class="info-content">{{ formattedSuccessRate }}</text>
          </view>
        </view>
      </view>
      
      <!-- 详细说明卡片 -->
      <view class="detail-info-card">
        <view class="detail-row">
          <text class="detail-label">近期案例</text>
          <view class="detail-content">
            <text
              v-for="(caseItem, index) in lawyerInfo.recentCases"
              :key="index"
              class="detail-text"
            >
              {{ caseItem }}
            </text>
            <text v-if="lawyerInfo.recentCases.length === 0" class="detail-text empty-text">
              暂无案例数据
            </text>
          </view>
        </view>
        
        <view class="detail-row">
          <text class="detail-label">服务优势</text>
          <view class="detail-content">
            <textarea
              v-if="isEditing"
              v-model="editForm.serviceAreas"
              class="detail-textarea"
              placeholder="请输入服务优势，用逗号分隔"
              maxlength="200"
            ></textarea>
            <view v-else>
              <text
                v-for="(advantage, index) in lawyerInfo.serviceAdvantages"
                :key="index"
                class="detail-text"
              >
                {{ advantage }}
              </text>
              <text v-if="lawyerInfo.serviceAdvantages.length === 0" class="detail-text empty-text">
                暂无服务优势介绍
              </text>
            </view>
          </view>
        </view>
        
        <view class="detail-row">
          <text class="detail-label">成功案例</text>
          <view class="detail-content">
            <textarea
              v-if="isEditing"
              v-model="editForm.introduction"
              class="detail-textarea"
              placeholder="请输入成功案例介绍"
              maxlength="300"
            ></textarea>
            <text v-else class="detail-text">
              {{ lawyerInfo.successCases || '暂无成功案例统计' }}
            </text>
          </view>
        </view>
        
        <view class="detail-row">
          <text class="detail-label">咨询范围</text>
          <view class="detail-content">
            <textarea
              v-if="isEditing"
              v-model="editForm.practiceAreas"
              class="detail-textarea"
              placeholder="请输入执业领域，用逗号分隔"
              maxlength="200"
            ></textarea>
            <view v-else>
              <text
                v-for="(area, index) in lawyerInfo.consultationAreas"
                :key="index"
                class="detail-text"
              >
                {{ area }}
              </text>
              <text v-if="lawyerInfo.consultationAreas.length === 0" class="detail-text empty-text">
                暂无咨询范围信息
              </text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 操作按钮组 -->
      <view class="action-buttons">
        <!-- 编辑/取消按钮 -->
        <view
          class="action-button edit-button"
          :class="{ 'cancel-button': isEditing }"
          @click="handleEdit"
        >
          <uv-icon
            :name="isEditing ? 'close' : 'edit-pen'"
            color="#FFFFFF"
            size="16"
          ></uv-icon>
          <text class="button-text">{{ isEditing ? '取消编辑' : '编辑资料' }}</text>
        </view>
        
        <!-- 保存按钮 (仅编辑模式显示) -->
        <view
          v-if="isEditing"
          class="action-button save-button"
          :class="{ 'saving': isSaving }"
          @click="handleSave"
        >
          <uv-loading-icon v-if="isSaving" mode="circle" size="16" color="#FFFFFF"></uv-loading-icon>
          <uv-icon v-else name="checkmark" color="#FFFFFF" size="16"></uv-icon>
          <text class="button-text">{{ isSaving ? '保存中...' : '保存修改' }}</text>
        </view>
        
        <!-- 刷新按钮 (非编辑模式显示) -->
        <view
          v-if="!isEditing"
          class="action-button refresh-button"
          :class="{ 'loading': isLoading }"
          @click="loadLawyerProfile(true)"
        >
          <uv-loading-icon v-if="isLoading" mode="circle" size="16" color="#FFFFFF"></uv-loading-icon>
          <uv-icon v-else name="reload" color="#FFFFFF" size="16"></uv-icon>
          <text class="button-text">{{ isLoading ? '加载中...' : '刷新数据' }}</text>
        </view>
      </view>
      
      <!-- 底部安全区域 -->
      <view class="bottom-safe-area"></view>
    </scroll-view>
    
    <!-- 律师底部导航栏 -->
    <lawyer-tabbar></lawyer-tabbar>
  </view>
</template>

<script>
import LawyerTabbar from '@/components/tabbar/lawyer-tabbar/lawyer-tabbar.vue'
import { staticBaseUrl } from '@/config/index.js'
import { getCurrentLawyerInfo, updateLawyerInfo } from '@/api/modules/lawyer.js'
import { getIncomeStatistics, getDocumentReviewList } from '@/api/modules/lawyer-workspace.js'

export default {
  name: 'LawyerProfile',
  components: {
    LawyerTabbar
  },
  data() {
    return {
      statusBarHeight: 0,
      scrollHeight: 0,
      isLoading: false,
      isEditing: false,
      isSaving: false,
      lawyerInfo: {
        name: '加载中...',
        specialty: '加载中...',
        experience: '加载中...',
        successRate: '加载中...',
        avatar: '',
        recentCases: [],
        serviceAdvantages: [],
        successCases: '',
        consultationAreas: []
      },
      editForm: {
        name: '',
        specialty: '',
        experience: '',
        introduction: '',
        serviceAreas: '',
        practiceAreas: ''
      },
      cacheKey: 'lawyer_profile_cache',
      cacheExpiry: 10 * 60 * 1000, // 10分钟缓存
      retryCount: 0,
      maxRetries: 3
    }
  },
  computed: {
    backgroundStyle() {
      return {
        backgroundImage: 'url(' + staticBaseUrl + '/bg10.png)'
      }
    },
    
    // 格式化执业经验显示
    formattedExperience() {
      if (typeof this.lawyerInfo.experience === 'number') {
        return `${this.lawyerInfo.experience}年`
      }
      return this.lawyerInfo.experience || '暂无数据'
    },
    
    // 格式化胜诉率显示
    formattedSuccessRate() {
      if (typeof this.lawyerInfo.successRate === 'number') {
        return `${this.lawyerInfo.successRate}%`
      }
      return this.lawyerInfo.successRate || '暂无数据'
    }
  },
  onLoad() {
    this.initPage()
    this.loadLawyerProfile()
  },
  onPullDownRefresh() {
    this.loadLawyerProfile(true)
  },
  methods: {
    // 初始化页面
    initPage() {
      const systemInfo = uni.getSystemInfoSync()
      this.statusBarHeight = systemInfo.statusBarHeight || 0
      // 计算滚动区域高度：总高度 - 状态栏 - 导航栏 - 底部导航栏
      this.scrollHeight = systemInfo.windowHeight - this.statusBarHeight - 44 - 50
    },
    
    // 加载律师资料
    async loadLawyerProfile(forceRefresh = false) {
      if (this.isLoading) return
      
      this.isLoading = true
      this.retryCount = 0
      
      try {
        // 检查缓存
        if (!forceRefresh) {
          const cachedData = this.getCachedData()
          if (cachedData) {
            this.lawyerInfo = { ...this.lawyerInfo, ...cachedData }
            this.isLoading = false
            return
          }
        }
        
        // 并行获取多源数据
        const results = await Promise.allSettled([
          this.callApiWithRetry(() => getCurrentLawyerInfo()),
          this.callApiWithRetry(() => getIncomeStatistics()),
          this.callApiWithRetry(() => getDocumentReviewList({ page: 1, size: 5 }))
        ])
        
        // 处理律师基本信息
        if (results[0].status === 'fulfilled') {
          const lawyerData = results[0].value?.data || results[0].value
          this.formatLawyerData(lawyerData)
        }
        
        // 处理统计数据
        if (results[1].status === 'fulfilled') {
          const statsData = results[1].value?.data || results[1].value
          this.calculateStatistics(statsData)
        }
        
        // 处理案例数据
        if (results[2].status === 'fulfilled') {
          const casesData = results[2].value?.data || results[2].value
          this.formatRecentCases(casesData)
        }
        
        // 缓存数据
        this.setCachedData(this.lawyerInfo)
        
        console.log('律师资料加载完成:', this.lawyerInfo)
        
      } catch (error) {
        console.error('加载律师资料失败:', error)
        this.handleLoadError(error)
      } finally {
        this.isLoading = false
        if (forceRefresh) {
          uni.stopPullDownRefresh()
        }
      }
    },
    
    // 智能重试机制
    async callApiWithRetry(apiCall) {
      const baseDelay = 1000 // 基础延迟1秒
      const maxDelay = 8000 // 最大延迟8秒
      
      for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
        try {
          const result = await apiCall()
          return result
        } catch (error) {
          if (attempt === this.maxRetries) {
            throw error
          }
          
          // 指数退避 + 随机抖动
          const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay)
          const jitter = Math.random() * 1000 // 随机抖动0-1秒
          const totalDelay = delay + jitter
          
          console.log(`API调用失败，${totalDelay.toFixed(0)}ms后重试 (${attempt + 1}/${this.maxRetries})`)
          await new Promise(resolve => setTimeout(resolve, totalDelay))
        }
      }
    },
    
    // 格式化律师数据
    formatLawyerData(data) {
      if (!data) return
      
      this.lawyerInfo.name = data.name || data.realName || '未设置姓名'
      this.lawyerInfo.avatar = data.avatar || data.avatarUrl || ''
      this.lawyerInfo.specialty = this.formatSpecialty(data.specialty || data.practiceAreas)
      this.lawyerInfo.experience = this.calculateExperience(data.experience || data.registrationDate)
      
      // 更新编辑表单
      this.editForm = {
        name: this.lawyerInfo.name,
        specialty: Array.isArray(data.practiceAreas) ? data.practiceAreas.join(', ') : (data.specialty || ''),
        experience: data.experience || '',
        introduction: data.introduction || '',
        serviceAreas: Array.isArray(data.serviceAreas) ? data.serviceAreas.join(', ') : '',
        practiceAreas: Array.isArray(data.practiceAreas) ? data.practiceAreas.join(', ') : ''
      }
    },
    
    // 格式化专长标签
    formatSpecialty(specialty) {
      if (Array.isArray(specialty)) {
        return specialty.length > 0 ? specialty[0] : '法律咨询'
      }
      return specialty || '法律咨询'
    },
    
    // 计算执业经验
    calculateExperience(experience) {
      if (typeof experience === 'number') {
        return experience
      }
      if (typeof experience === 'string' && experience.includes('年')) {
        return experience
      }
      if (experience && new Date(experience).getTime()) {
        const years = Math.floor((Date.now() - new Date(experience).getTime()) / (365 * 24 * 60 * 60 * 1000))
        return Math.max(years, 1)
      }
      return 1
    },
    
    // 计算统计数据
    calculateStatistics(statsData) {
      if (!statsData) return
      
      // 计算胜诉率
      const totalCases = statsData.totalCases || 0
      const successCases = statsData.successCases || 0
      if (totalCases > 0) {
        this.lawyerInfo.successRate = Math.round((successCases / totalCases) * 100)
      } else {
        this.lawyerInfo.successRate = 85 // 默认胜诉率
      }
      
      // 格式化成功案例
      if (successCases > 0) {
        this.lawyerInfo.successCases = `成功处理案件${successCases}起，累计为当事人挽回损失${statsData.totalAmount || '数百万'}元`
      }
    },
    
    // 格式化近期案例
    formatRecentCases(casesData) {
      if (!casesData || !casesData.list) return
      
      const recentCase = casesData.list[0]
      if (recentCase) {
        this.lawyerInfo.recentCases = [
          `案例时间：${this.formatDateTime(recentCase.createTime)}`,
          `案例描述：${recentCase.title || '成功协助当事人'}`,
          `处理结果：${recentCase.status === 'approved' ? '审核通过，案件顺利解决' : '正在处理中'}`
        ]
      }
      
      // 生成服务优势
      this.lawyerInfo.serviceAdvantages = [
        '1. 响应迅速，24小时内答复',
        `2. 丰富的${this.lawyerInfo.specialty}等服务经验`,
        '3. 专业团队，一对一服务'
      ]
      
      // 生成咨询范围
      this.lawyerInfo.consultationAreas = [
        '劳动合同起草与审查',
        '工伤/违法解雇维权',
        '社保、加班、赔偿、争议等'
      ]
    },
    
    // 格式化日期时间
    formatDateTime(dateTime) {
      if (!dateTime) return '最近'
      
      const date = new Date(dateTime)
      const now = new Date()
      const diffDays = Math.floor((now - date) / (24 * 60 * 60 * 1000))
      
      if (diffDays === 0) return '今天'
      if (diffDays === 1) return '昨天'
      if (diffDays < 7) return `${diffDays}天前`
      
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
    },
    
    // 处理编辑模式
    handleEdit() {
      this.isEditing = !this.isEditing
      if (!this.isEditing) {
        // 取消编辑，恢复原数据
        this.editForm = {
          name: this.lawyerInfo.name,
          specialty: this.lawyerInfo.specialty,
          experience: this.lawyerInfo.experience,
          introduction: '',
          serviceAreas: '',
          practiceAreas: ''
        }
      }
    },
    
    // 处理保存操作
    async handleSave() {
      if (this.isSaving) return
      
      if (!this.isEditing) {
        this.handleEdit()
        return
      }
      
      // 验证表单
      if (!this.validateForm()) {
        return
      }
      
      this.isSaving = true
      
      try {
        const updateData = {
          name: this.editForm.name.trim(),
          specialty: this.editForm.specialty.trim(),
          experience: this.editForm.experience,
          introduction: this.editForm.introduction.trim(),
          serviceAreas: this.editForm.serviceAreas.split(',').map(s => s.trim()).filter(s => s),
          practiceAreas: this.editForm.practiceAreas.split(',').map(s => s.trim()).filter(s => s)
        }
        
        await this.callApiWithRetry(() => updateLawyerInfo(updateData))
        
        // 更新本地数据
        this.lawyerInfo.name = updateData.name
        this.lawyerInfo.specialty = updateData.specialty
        this.lawyerInfo.experience = updateData.experience
        
        // 清除缓存，强制下次重新加载
        this.clearCachedData()
        
        this.isEditing = false
        
        uni.showToast({
          title: '保存成功',
          icon: 'success'
        })
        
        console.log('律师资料保存成功')
        
      } catch (error) {
        console.error('保存律师资料失败:', error)
        this.handleSaveError(error)
      } finally {
        this.isSaving = false
      }
    },
    
    // 表单验证
    validateForm() {
      if (!this.editForm.name.trim()) {
        uni.showToast({
          title: '请输入姓名',
          icon: 'none'
        })
        return false
      }
      
      if (this.editForm.name.trim().length < 2) {
        uni.showToast({
          title: '姓名至少2个字符',
          icon: 'none'
        })
        return false
      }
      
      if (!this.editForm.specialty.trim()) {
        uni.showToast({
          title: '请输入专业领域',
          icon: 'none'
        })
        return false
      }
      
      return true
    },
    
    // 处理加载错误
    handleLoadError(error) {
      console.error('加载错误详情:', error)
      
      let errorMessage = '加载失败'
      
      if (error.code === 401 || error.status === 401) {
        errorMessage = '登录已过期，请重新登录'
        // 可以跳转到登录页面
      } else if (error.code === 403 || error.status === 403) {
        errorMessage = '权限不足'
      } else if (error.code === 404 || error.status === 404) {
        errorMessage = '律师信息不存在'
      } else if (error.code === 500 || error.status === 500) {
        errorMessage = '服务器错误，请稍后重试'
      } else if (!navigator.onLine) {
        errorMessage = '网络连接失败'
      }
      
      // 尝试使用缓存数据
      const cachedData = this.getCachedData()
      if (cachedData) {
        this.lawyerInfo = { ...this.lawyerInfo, ...cachedData }
        errorMessage += '，已显示缓存数据'
      } else {
        // 使用默认数据
        this.lawyerInfo = {
          name: '律师',
          specialty: '法律咨询',
          experience: '1年',
          successRate: '85%',
          avatar: '',
          recentCases: ['暂无案例数据'],
          serviceAdvantages: ['专业服务', '响应及时', '经验丰富'],
          successCases: '暂无统计数据',
          consultationAreas: ['法律咨询', '合同审查', '纠纷处理']
        }
      }
      
      uni.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 3000
      })
    },
    
    // 处理保存错误
    handleSaveError(error) {
      console.error('保存错误详情:', error)
      
      let errorMessage = '保存失败'
      
      if (error.code === 401 || error.status === 401) {
        errorMessage = '登录已过期，请重新登录'
      } else if (error.code === 403 || error.status === 403) {
        errorMessage = '权限不足，无法修改'
      } else if (error.code === 422 || error.status === 422) {
        errorMessage = '数据格式错误'
      } else if (error.code === 500 || error.status === 500) {
        errorMessage = '服务器错误，请稍后重试'
      } else if (!navigator.onLine) {
        errorMessage = '网络连接失败'
      }
      
      uni.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 3000
      })
    },
    
    // 获取缓存数据
    getCachedData() {
      try {
        const cached = uni.getStorageSync(this.cacheKey)
        if (cached && cached.timestamp && (Date.now() - cached.timestamp < this.cacheExpiry)) {
          console.log('使用缓存的律师资料数据')
          return cached.data
        }
      } catch (error) {
        console.error('获取缓存失败:', error)
      }
      return null
    },
    
    // 设置缓存数据
    setCachedData(data) {
      try {
        uni.setStorageSync(this.cacheKey, {
          data: data,
          timestamp: Date.now()
        })
      } catch (error) {
        console.error('设置缓存失败:', error)
      }
    },
    
    // 清除缓存数据
    clearCachedData() {
      try {
        uni.removeStorageSync(this.cacheKey)
      } catch (error) {
        console.error('清除缓存失败:', error)
      }
    },
    
    // 返回上一页
    goBack() {
      if (this.isEditing) {
        uni.showModal({
          title: '提示',
          content: '有未保存的修改，确定要离开吗？',
          success: (res) => {
            if (res.confirm) {
              this.isEditing = false
              this.navigateBack()
            }
          }
        })
      } else {
        this.navigateBack()
      }
    },
    
    // 执行返回导航
    navigateBack() {
      uni.navigateBack({
        fail: () => {
          // 如果没有上一页，跳转到律师工作台首页
          uni.navigateTo({
            url: '/pages/lawyer/index/dashboard/index'
          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.lawyer-profile-page {
  width: 100%;
  height: 100vh;
  
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
}

// 状态栏占位
.status-bar {
  width: 100%;
  background: transparent;
}

// 自定义导航栏
.custom-navbar {
  height: 44px;
  background: transparent;
  
  .navbar-content {
    height: 100%;
    display: flex;
    align-items: center;
    padding: 0 15px;
  }
  
  .back-button {
    display: flex;
    align-items: center;
    
    .back-text {
      font-size: 16px;
      color: #4A90E2;
      margin-left: 5px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    }
  }
}

// 滚动容器
.scroll-container {
  width: 100%;
  box-sizing: border-box;
}

// 用户信息卡片
.user-info-card {
  background-color: #FFFFFF;
  border-radius: 12px;
  padding: 20px 18px;
  margin: 15px 5%;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
  
  .avatar-section {
    position: relative;
    margin: 0 auto 20px auto;
    width: 80px;
    height: 80px;
    
    .avatar-image {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      border: 2px solid #E0E0E0;
    }
    
    .avatar-placeholder {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background-color: #F5F5F5;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #E0E0E0;
    }
    
    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  
  .info-list {
    padding: 0 10rpx;
    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .info-label {
        font-size: 14px;
        color: #666666;
        width: 30%;
        text-align: left;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Helvetica Neue', Helvetica, Arial, sans-serif;
      }
      
      .info-content {
        font-size: 14px;
        color: #000;
        flex: 1;
        margin-left: 12px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Helvetica Neue', Helvetica, Arial, sans-serif;
      }
      
      .info-input {
        font-size: 14px;
        color: #000;
        flex: 1;
        margin-left: 12px;
        padding: 8px 12px;
        border: 1px solid #E0E0E0;
        border-radius: 6px;
        background-color: #FAFAFA;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Helvetica Neue', Helvetica, Arial, sans-serif;
        
        &:focus {
          border-color: #5896FD;
          background-color: #FFFFFF;
          outline: none;
        }
      }
    }
  }
}

// 详细说明卡片
.detail-info-card {
  background-color: #FFFFFF;
  border-radius: 12px;
  padding: 20px 18px;
  margin: 15px 5%;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
  
  .detail-row {
    display: flex;
    align-items: flex-start;
    margin-bottom: 18px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .detail-label {
      font-size: 14px;
      color: #666666;
      width: 30%;
      text-align: left;
      margin-top: 2px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    }
    
    .detail-content {
      flex: 1;
      margin-left: 12px;
      
      .detail-text {
        display: block;
        font-size: 14px;
        color: #000;
        line-height: 1.5;
        margin-bottom: 2px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Helvetica Neue', Helvetica, Arial, sans-serif;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        &.empty-text {
          color: #999999;
          font-style: italic;
        }
      }
      
      .detail-textarea {
        width: 100%;
        min-height: 80px;
        padding: 12px;
        border: 1px solid #E0E0E0;
        border-radius: 8px;
        background-color: #FAFAFA;
        font-size: 14px;
        color: #000;
        line-height: 1.5;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Helvetica Neue', Helvetica, Arial, sans-serif;
        resize: vertical;
        
        &:focus {
          border-color: #5896FD;
          background-color: #FFFFFF;
          outline: none;
        }
        
        &::placeholder {
          color: #CCCCCC;
        }
      }
    }
  }
}

// 操作按钮组
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 25px 5%;
  
  .action-button {
    height: 44px;
    border-radius: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.3s ease;
    
    .button-text {
      font-size: 16px;
      color: #FFFFFF;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    }
    
    // 编辑按钮
    &.edit-button {
      background-color: #5896FD;
      
      &:active {
        background-color: #4A7FE7;
        transform: scale(0.98);
      }
      
      &.cancel-button {
        background-color: #FF6B6B;
        
        &:active {
          background-color: #E55A5A;
        }
      }
    }
    
    // 保存按钮
    &.save-button {
      background-color: #52C41A;
      
      &:active {
        background-color: #46B317;
        transform: scale(0.98);
      }
      
      &.saving {
        background-color: #95D475;
        pointer-events: none;
      }
    }
    
    // 刷新按钮
    &.refresh-button {
      background-color: #1890FF;
      
      &:active {
        background-color: #1677FF;
        transform: scale(0.98);
      }
      
      &.loading {
        background-color: #69C0FF;
        pointer-events: none;
      }
    }
  }
}

// 底部安全区域
.bottom-safe-area {
  height: 20px;
}
</style> 