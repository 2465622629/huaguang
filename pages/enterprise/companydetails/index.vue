<template>
  <view class="company-details-page">
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
            width: '100%'
          }"
          @click="saveCompanyInfo"
        ></uv-button>
      </view>
    </view>
    
    <!-- iOS Home Indicator -->
    <view class="home-indicator"></view>
    
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
export default {
  name: 'CompanyDetails',
  data() {
    return {
      statusBarHeight: 0,
      showTypeSelector: false,
      showScaleSelector: false,
      companyInfo: {
        name: 'XX科技公司',
        type: '',
        scale: '',
        avatar: '',
        description: 'XX科技成立于2012年，是一家专注于人工智能、大数据分析与云计算服务的高新技术企业。我们致力于用科技赋能产业，推动数字化转型，服务全球客户。',
        benefits: ['五险一金', '弹性工作', '年终奖金']
      },
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
  onLoad() {
    // 获取系统状态栏高度
    const systemInfo = uni.getSystemInfoSync()
    this.statusBarHeight = systemInfo.statusBarHeight || 0
  },
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack({
        delta: 1
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
    
    // 上传头像
    uploadAvatar() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.companyInfo.avatar = res.tempFilePaths[0]
          uni.showToast({
            title: '头像上传成功',
            icon: 'success',
            duration: 1500
          })
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
    
    // 保存公司信息
    saveCompanyInfo() {
      // 简单的表单验证
      if (!this.companyInfo.type) {
        uni.showToast({
          title: '请选择公司类型',
          icon: 'none',
          duration: 1500
        })
        return
      }
      
      if (!this.companyInfo.scale) {
        uni.showToast({
          title: '请选择公司规模',
          icon: 'none',
          duration: 1500
        })
        return
      }
      
      // 模拟保存操作
      uni.showLoading({
        title: '保存中...'
      })
      
      setTimeout(() => {
        uni.hideLoading()
        uni.showToast({
          title: '保存成功',
          icon: 'success',
          duration: 2000
        })
        
        // 这里可以添加实际的保存逻辑，比如调用API
        console.log('保存的公司信息：', this.companyInfo)
      }, 1500)
    }
  }
}
</script>

<style lang="scss" scoped>
.company-details-page {
  min-height: 100vh;
  background-color: #F8F9FA;
  background-image: url('http://localhost:3000/static/bg9.png');
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
  margin: 48px 0 32px;
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
