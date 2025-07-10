<template>
  <view class="company-details-page" :style="{ backgroundImage: 'url(' + backgroundImageUrl + ')' }">
    <!-- iOS 状态栏 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
    
    <!-- 导航栏 -->
    <view class="navigation-bar">
      <view class="nav-left" @click="goBack">
        <uv-icon name="arrow-left" size="18" color="#333333"></uv-icon>
        <text class="back-text">返回</text>
      </view>
      <text class="nav-title">公司详情</text>
    </view>
    
    <!-- 主内容区域 -->
    <view class="main-content">
      <!-- 公司名称标题 -->
      <text class="company-name-title">{{ companyInfo.name }}</text>
      
      <!-- 表单项组 -->
      <view class="form-section">
        <!-- 公司类型 -->
        <view class="form-item">
          <text class="form-label">公司类型</text>
          <view class="form-input" @click="showCompanyTypeSelector">
            <text class="input-text" :class="{ placeholder: !companyInfo.type }">
              {{ companyInfo.type || '请选择公司类型' }}
            </text>
          </view>
        </view>
        
        <!-- 公司规模 -->
        <view class="form-item">
          <text class="form-label">公司规模</text>
          <view class="form-input" @click="showCompanyScaleSelector">
            <text class="input-text" :class="{ placeholder: !companyInfo.scale }">
              {{ companyInfo.scale || '请选择公司规模' }}
            </text>
          </view>
        </view>
        
        <!-- 上传头像 -->
        <view class="form-item">
          <text class="form-label">上传头像</text>
          <view class="avatar-upload" @click="uploadAvatar">
            <image v-if="companyInfo.avatar" :src="companyInfo.avatar" class="avatar-image" mode="aspectFill"></image>
            <view v-else class="upload-placeholder">
              <uv-icon name="plus" size="24" color="#45D8D4"></uv-icon>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 公司简介 -->
      <view class="content-section">
        <text class="section-title">公司简介</text>
        <view class="content-container">
          <text class="content-text">
            XX科技成立于2012年，是一家专注于人工智能、大数据分析与云计算服务的高新技术企业。我们致力于用科技赋能产业，推动数字化转型，服务全球客户。
          </text>
          <view class="content-list">
            <text class="list-item">· 核心业务：智慧零售、智慧物流、AI算法平台开发</text>
            <text class="list-item">· 服务客户：已覆盖全球30多个国家，超过500家企业</text>
            <text class="list-item">· 公司文化：创新、开放、高效、合作</text>
          </view>
        </view>
      </view>
      
      <!-- 公司福利 -->
      <view class="content-section">
        <text class="section-title">公司福利</text>
        <view class="content-container">
          <view class="content-list">
            <text class="list-item">· 五险一金</text>
            <text class="list-item">· 弹性工作</text>
            <text class="list-item">· 年终奖金</text>
          </view>
        </view>
      </view>
      
      <!-- 保存按钮 -->
      <view class="save-button-container">
        <uv-button 
          text="点击保存" 
          type="primary"
          :customStyle="{
            backgroundColor: '#68A7FC',
            borderRadius: '25px',
            height: '50px',
            fontSize: '16px',
            width: '100%',
            color: '#000'
          }"
          @click="saveCompanyInfo"
        ></uv-button>
      </view>
    </view>
    
    <!-- iOS Home Indicator -->
    <!-- <view class="home-indicator"></view> -->
    
    <!-- 公司类型选择器 -->
    <uv-picker
      ref="companyTypePicker"
      :show="showTypeSelector"
      :columns="[companyTypes]"
      @confirm="onCompanyTypeConfirm"
      @cancel="showTypeSelector = false"
      title="选择公司类型"
    ></uv-picker>
    
    <!-- 公司规模选择器 -->
    <uv-picker
      ref="companyScalePicker"
      :show="showScaleSelector"
      :columns="[companyScales]"
      @confirm="onCompanyScaleConfirm"
      @cancel="showScaleSelector = false"
      title="选择公司规模"
    ></uv-picker>
  </view>
</template>

<script>
import { staticBaseUrl } from '@/config/index.js'
import { enterpriseApi } from '@/api/index.js'

export default {
  name: 'CompanyDetails',
  data() {
    return {
      statusBarHeight: 0,
      showTypeSelector: false,
      showScaleSelector: false,
      loading: false,
      saving: false,
      uploading: false,
      enterpriseId: '',
      companyInfo: {
        name: 'XX科技公司',
        type: '',
        scale: '',
        avatar: '',
        description: 'XX科技成立于2012年，是一家专注于人工智能、大数据分析与云计算服务的高新技术企业。我们致力于用科技赋能产业，推动数字化转型，服务全球客户。',
        benefits: ['五险一金', '弹性工作', '年终奖金']
      },
      // 缓存相关
      cacheKey: 'enterprise_company_info',
      cacheExpiry: 10 * 60 * 1000, // 10分钟缓存
      companyTypes: [
        '科技公司',
        '制造业',
        '服务业',
        '金融业',
        '教育培训',
        '医疗健康',
        '房地产',
        '零售业',
        '物流运输',
        '其他'
      ],
      companyScales: [
        '1-50人',
        '51-200人',
        '201-500人',
        '501-1000人',
        '1000人以上'
      ]
    }
  },
  computed: {
    // 动态生成背景图片URL
    backgroundImageUrl() {
      return `${staticBaseUrl}/bg9.png`
    }
  },
  onLoad() {
    // 获取系统状态栏高度
    const systemInfo = uni.getSystemInfoSync()
    this.statusBarHeight = systemInfo.statusBarHeight || 0
    
    // 加载企业详情数据
    this.loadCompanyDetail()
  },
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack({
        delta: 1
      })
    },
    
    /**
     * 企业级API调用重试机制
     * @param {Function} apiCall API调用函数
     * @param {number} maxRetries 最大重试次数
     * @returns {Promise} API响应
     */
    async callApiWithRetry(apiCall, maxRetries = 3) {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          return await apiCall()
        } catch (error) {
          console.log(`API调用失败，第${attempt}次尝试:`, error)
          
          if (attempt === maxRetries) {
            throw error
          }
          
          // 指数退避重试，添加随机抖动避免雷群效应
          const baseDelay = 1000 * Math.pow(2, attempt - 1)
          const jitter = Math.random() * 1000
          const delay = Math.min(baseDelay + jitter, 8000)
          
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    },
    
    /**
     * 获取缓存数据
     * @param {string} key 缓存键
     * @returns {Object|null} 缓存数据
     */
    getCachedData(key) {
      try {
        const cached = uni.getStorageSync(key)
        if (cached && cached.timestamp && (Date.now() - cached.timestamp < this.cacheExpiry)) {
          return cached.data
        }
        return null
      } catch (error) {
        console.error('获取缓存失败:', error)
        return null
      }
    },
    
    /**
     * 设置缓存数据
     * @param {string} key 缓存键
     * @param {Object} data 数据
     */
    setCachedData(key, data) {
      try {
        uni.setStorageSync(key, {
          data,
          timestamp: Date.now()
        })
      } catch (error) {
        console.error('设置缓存失败:', error)
      }
    },
    
    /**
     * 加载企业详情数据 - 企业级优化版本
     */
    async loadCompanyDetail() {
      try {
        this.loading = true
        
        // 尝试从缓存获取数据
        const cachedData = this.getCachedData(this.cacheKey)
        if (cachedData) {
          this.companyInfo = { ...this.companyInfo, ...cachedData }
          console.log('使用缓存的企业信息')
        }
        
        // 使用重试机制调用API
        const response = await this.callApiWithRetry(async () => {
          return await enterpriseApi.getCurrentEnterpriseInfo()
        })
        
        if (response && response.data) {
          const companyData = response.data
          const updatedInfo = {
            name: companyData.companyName || this.companyInfo.name,
            type: companyData.companyType || this.companyInfo.type,
            scale: companyData.scale || this.companyInfo.scale,
            avatar: companyData.logo || this.companyInfo.avatar,
            description: companyData.description || this.companyInfo.description,
            benefits: companyData.benefits || this.companyInfo.benefits
          }
          
          this.companyInfo = updatedInfo
          
          // 缓存数据
          this.setCachedData(this.cacheKey, updatedInfo)
          
          console.log('企业信息加载成功')
        }
      } catch (error) {
        console.error('加载企业详情失败:', error)
        
        // 多层错误处理
        const cachedData = this.getCachedData(this.cacheKey)
        if (cachedData) {
          this.companyInfo = { ...this.companyInfo, ...cachedData }
          uni.showToast({
            title: '网络异常，显示缓存数据',
            icon: 'none'
          })
        } else {
          this.handleLoadError(error)
        }
      } finally {
        this.loading = false
      }
    },
    
    /**
     * 处理加载错误
     * @param {Error} error 错误对象
     */
    handleLoadError(error) {
      let errorMessage = '加载企业信息失败'
      
      if (error.code === 'NETWORK_ERROR') {
        errorMessage = '网络连接失败，请检查网络'
      } else if (error.code === 'TIMEOUT') {
        errorMessage = '请求超时，请重试'
      } else if (error.code === 'UNAUTHORIZED') {
        errorMessage = '登录已过期，请重新登录'
        // 可以跳转到登录页面
      } else if (error.code === 'FORBIDDEN') {
        errorMessage = '没有权限访问企业信息'
      } else if (error.code === 'SERVER_ERROR') {
        errorMessage = '服务器异常，请稍后重试'
      }
      
      uni.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 3000
      })
    },
    
    // 显示公司类型选择器
    showCompanyTypeSelector() {
      this.showTypeSelector = true
    },
    
    // 显示公司规模选择器
    showCompanyScaleSelector() {
      this.showScaleSelector = true
    },
    
    // 公司类型选择确认
    onCompanyTypeConfirm(e) {
      this.companyInfo.type = e.value[0]
      this.showTypeSelector = false
      uni.showToast({
        title: `已选择：${this.companyInfo.type}`,
        icon: 'none',
        duration: 1500
      })
    },
    
    // 公司规模选择确认
    onCompanyScaleConfirm(e) {
      this.companyInfo.scale = e.value[0]
      this.showScaleSelector = false
      uni.showToast({
        title: `已选择：${this.companyInfo.scale}`,
        icon: 'none',
        duration: 1500
      })
    },
    
    // 上传头像 - 企业级优化版本
    uploadAvatar() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: async (res) => {
          const filePath = res.tempFilePaths[0]
          
          // 文件验证
          const fileInfo = await this.validateImageFile(filePath)
          if (!fileInfo.valid) {
            uni.showToast({
              title: fileInfo.message,
              icon: 'none',
              duration: 2000
            })
            return
          }
          
          try {
            this.uploading = true
            uni.showLoading({
              title: '上传中...'
            })
            
            // 使用重试机制上传头像
            const response = await this.callApiWithRetry(async () => {
              return await enterpriseApi.uploadAvatar ?
                await enterpriseApi.uploadAvatar(filePath) :
                await this.mockUploadAvatar(filePath)
            })
            
            if (response && response.data && response.data.url) {
              this.companyInfo.avatar = response.data.url
              uni.showToast({
                title: '头像上传成功',
                icon: 'success',
                duration: 1500
              })
            } else {
              // 临时使用本地路径
              this.companyInfo.avatar = filePath
              uni.showToast({
                title: '头像设置成功',
                icon: 'success',
                duration: 1500
              })
            }
          } catch (error) {
            console.error('上传头像失败:', error)
            this.handleUploadError(error)
          } finally {
            this.uploading = false
            uni.hideLoading()
          }
        },
        fail: (err) => {
          console.error('选择图片失败：', err)
          uni.showToast({
            title: '选择图片失败',
            icon: 'none',
            duration: 1500
          })
        }
      })
    },
    
    /**
     * 验证图片文件
     * @param {string} filePath 文件路径
     * @returns {Object} 验证结果
     */
    async validateImageFile(filePath) {
      try {
        const fileInfo = await new Promise((resolve, reject) => {
          uni.getImageInfo({
            src: filePath,
            success: resolve,
            fail: reject
          })
        })
        
        // 检查文件大小（限制5MB）
        const maxSize = 5 * 1024 * 1024
        if (fileInfo.size && fileInfo.size > maxSize) {
          return { valid: false, message: '图片大小不能超过5MB' }
        }
        
        // 检查图片尺寸（建议最小200x200）
        if (fileInfo.width < 200 || fileInfo.height < 200) {
          return { valid: false, message: '图片尺寸建议不小于200x200像素' }
        }
        
        // 检查图片格式
        const allowedTypes = ['jpg', 'jpeg', 'png', 'webp']
        const fileType = fileInfo.type?.toLowerCase() || filePath.split('.').pop()?.toLowerCase()
        if (!allowedTypes.includes(fileType)) {
          return { valid: false, message: '仅支持JPG、PNG、WEBP格式图片' }
        }
        
        return { valid: true, fileInfo }
      } catch (error) {
        console.error('文件验证失败:', error)
        return { valid: false, message: '图片文件验证失败' }
      }
    },
    
    /**
     * 模拟头像上传（当API不可用时）
     * @param {string} filePath 文件路径
     * @returns {Promise} 上传结果
     */
    async mockUploadAvatar(filePath) {
      // 模拟上传延迟
      await new Promise(resolve => setTimeout(resolve, 1000))
      return {
        success: true,
        data: {
          url: filePath // 临时使用本地路径
        }
      }
    },
    
    /**
     * 处理上传错误
     * @param {Error} error 错误对象
     */
    handleUploadError(error) {
      let errorMessage = '头像上传失败'
      
      if (error.code === 'NETWORK_ERROR') {
        errorMessage = '网络连接失败，请检查网络'
      } else if (error.code === 'FILE_TOO_LARGE') {
        errorMessage = '文件过大，请选择较小的图片'
      } else if (error.code === 'INVALID_FILE_TYPE') {
        errorMessage = '不支持的文件格式'
      } else if (error.code === 'UPLOAD_FAILED') {
        errorMessage = '上传失败，请重试'
      }
      
      uni.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 2000
      })
    },
    
    // 保存公司信息 - 企业级优化版本
    async saveCompanyInfo() {
      // 增强表单验证
      const validationResult = this.validateForm()
      if (!validationResult.valid) {
        uni.showToast({
          title: validationResult.message,
          icon: 'none',
          duration: 2000
        })
        return
      }
      
      try {
        this.saving = true
        uni.showLoading({
          title: '保存中...'
        })
        
        // 构建更新数据
        const updateData = {
          companyName: this.companyInfo.name.trim(),
          companyType: this.companyInfo.type,
          scale: this.companyInfo.scale,
          logo: this.companyInfo.avatar,
          description: this.companyInfo.description.trim(),
          benefits: this.companyInfo.benefits
        }
        
        // 使用重试机制保存数据
        const response = await this.callApiWithRetry(async () => {
          return await enterpriseApi.updateEnterpriseDetailInfo(updateData)
        })
        
        if (response && (response.success || response.code === 200)) {
          // 更新缓存
          this.setCachedData(this.cacheKey, this.companyInfo)
          
          uni.showToast({
            title: '保存成功',
            icon: 'success',
            duration: 2000
          })
          
          // 延迟返回上一页
          setTimeout(() => {
            uni.navigateBack({
              delta: 1
            })
          }, 2000)
        } else {
          throw new Error(response?.message || '保存失败')
        }
      } catch (error) {
        console.error('保存企业信息失败:', error)
        this.handleSaveError(error)
      } finally {
        this.saving = false
        uni.hideLoading()
      }
    },
    
    /**
     * 增强表单验证
     * @returns {Object} 验证结果
     */
    validateForm() {
      // 公司名称验证
      if (!this.companyInfo.name || this.companyInfo.name.trim().length < 2) {
        return { valid: false, message: '公司名称至少需要2个字符' }
      }
      
      if (this.companyInfo.name.trim().length > 50) {
        return { valid: false, message: '公司名称不能超过50个字符' }
      }
      
      // 公司类型验证
      if (!this.companyInfo.type) {
        return { valid: false, message: '请选择公司类型' }
      }
      
      // 公司规模验证
      if (!this.companyInfo.scale) {
        return { valid: false, message: '请选择公司规模' }
      }
      
      // 公司描述验证
      if (!this.companyInfo.description || this.companyInfo.description.trim().length < 10) {
        return { valid: false, message: '公司简介至少需要10个字符' }
      }
      
      if (this.companyInfo.description.trim().length > 1000) {
        return { valid: false, message: '公司简介不能超过1000个字符' }
      }
      
      return { valid: true }
    },
    
    /**
     * 处理保存错误
     * @param {Error} error 错误对象
     */
    handleSaveError(error) {
      let errorMessage = '保存失败，请重试'
      
      if (error.code === 'NETWORK_ERROR') {
        errorMessage = '网络连接失败，请检查网络后重试'
      } else if (error.code === 'TIMEOUT') {
        errorMessage = '保存超时，请重试'
      } else if (error.code === 'UNAUTHORIZED') {
        errorMessage = '登录已过期，请重新登录'
      } else if (error.code === 'FORBIDDEN') {
        errorMessage = '没有权限修改企业信息'
      } else if (error.code === 'VALIDATION_ERROR') {
        errorMessage = error.message || '数据格式不正确'
      } else if (error.code === 'DUPLICATE_NAME') {
        errorMessage = '企业名称已存在，请使用其他名称'
      } else if (error.code === 'SERVER_ERROR') {
        errorMessage = '服务器异常，请稍后重试'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      uni.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 3000
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.company-details-page {
  min-height: 100vh;
  background-color: #F8F9FA;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
}

.status-bar {
  width: 100%;
  background: transparent;
}

.navigation-bar {
  height: 44px;
  // background-color: #eaf5fa;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 0 16px;
  
  .nav-left {
    position: absolute;
    left: 16px;
    display: flex;
    align-items: center;
    
    .back-text {
      margin-left: 4px;
      font-size: 16px;
      color: #333333;
    }
  }
  
  .nav-title {
    font-size: 18px;
    // font-weight: 600;
    color: #333333;
  }
}

.main-content {
  padding: 24px 16px 0;
}

.company-name-title {
  font-size: 26px;
  font-weight: 700;
  color: #333333;
  margin-bottom: 32px;
}

.form-section {
  margin-bottom: 32px;
}

.form-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
  
  .form-label {
    font-size: 16px;
    color: #333333;
    width: 80px;
    flex-shrink: 0;
    line-height: 40px;
  }
  
  .form-input {
    flex: 1;
    height: 40px;
    background-color: #eaf5fa;
    border-radius: 8px;
    padding: 0 12px;
    display: flex;
    align-items: center;
    margin-left: 12px;
    
    .input-text {
      font-size: 16px;
      color: #333333;
      
      &.placeholder {
        color: #999999;
      }
    }
  }
  
  .avatar-upload {
    width: 80px;
    height: 80px;
    background-color: #eaf5fa;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 12px;
    
    .avatar-image {
      width: 100%;
      height: 100%;
      border-radius: 8px;
    }
    
    .upload-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

.content-section {
  margin-bottom: 32px;
  
  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: #333333;
    margin-bottom: 16px;
  }
  
  .content-container {
    background-color: #eaf5fa;
    border-radius: 8px;
    padding: 16px;
    
    .content-text {
      font-size: 14px;
      color: #666666;
      line-height: 1.6;
      margin-bottom: 12px;
    }
    
    .content-list {
      .list-item {
        font-size: 14px;
        color: #666666;
        line-height: 1.8;
        display: block;
        margin-bottom: 4px;
        
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
}

.save-button-container {
  margin: 0px 0 32px;
}

.home-indicator {
  height: 34px;
  width: 100%;
  position: fixed;
  bottom: 0;
  left: 0;
  background: transparent;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    width: 134px;
    height: 5px;
    background-color: #000000;
    border-radius: 3px;
  }
}
</style>
