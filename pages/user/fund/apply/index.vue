<template>
  <view class="apply-page" :style="{ backgroundImage: 'url(' + backgroundImage + ')' }">
    <!-- 状态栏（iOS风格） -->
    <view class="status-bar"></view>
    
    <!-- 顶部导航栏 -->
    <view class="navbar">
      <view class="back-btn" @click="onBack">
        <uv-icon name="arrow-left" color="#FFFFFF" size="36"></uv-icon>
        <text class="back-text">返回</text>
      </view>
    </view>

    <!-- 标题文字 -->
    <view class="page-title">青年帮扶基金申请表</view>

    <!-- 表单内容 -->
    <view class="form-content">
      <view class="form-group">
        <view class="form-container">
          <!-- 用户信息 -->
          <view class="group-title">用户信息</view>

          <!-- 第一行：姓名、出生日期 -->
          <view class="form-row">
            <view class="form-item half">
              <input class="item-input" v-model="formData.applicantName" placeholder="姓名" />
            </view>
            <view class="form-item half" @click="openBirthDatePicker">
              <input class="item-input" v-model="displayBirthDate" placeholder="出生日期" disabled
                style="pointer-events: none;" />
              <uv-datetime-picker ref="birthDatePicker" v-model="formData.birthDate" mode="date"
                @confirm="handleBirthDateChange">
              </uv-datetime-picker>
            </view>
          </view>

          <!-- 第二行：性别、学历文凭 -->
          <view class="form-row">
            <view class="form-item half" @click="openGenderPicker">
              <input class="item-input" v-model="displayGender" placeholder="性别" disabled
                style="pointer-events: none;" />
              <uv-picker ref="genderPicker" :columns="[genderOptions]" @confirm="handleGenderChange">
              </uv-picker>
            </view>
            <view class="form-item half">
              <input class="item-input" v-model="formData.education" placeholder="学历文凭" />
            </view>
          </view>

          <!-- 第三行：家庭（工作）地址 -->
          <view class="form-item">
            <input class="item-input" v-model="formData.address" placeholder="家庭（工作）地址" />
          </view>

          <!-- 第四行：名下财产 -->
          <view class="form-item">
            <input class="item-input" v-model="formData.property" placeholder="名下财产（车房）" />
          </view>

          <!-- 第五行：父母联系方式 -->
          <view class="form-item">
            <input class="item-input" v-model="formData.parentContact" placeholder="父母联系方式" />
          </view>
        </view>

        <!-- 资产负债信息 -->
        <view class="form-container debt-container">
          <view class="group-title">资产负债</view>

          <!-- 负债信息列表 -->
          <view class="debt-list">
            <view class="debt-item" v-for="(item, index) in debtList" :key="index">
              <view class="debt-row">
                <input class="debt-input" v-model="item.platform" placeholder="银行/平台名称" />
                <input class="debt-input" v-model="item.amount" placeholder="负债金额（元）" type="number" />
                <view class="delete-icon" @click="deleteDebtItem(index)" v-if="debtList.length > 1">
                  <uv-icon name="minus" color="#407BFF" size="24"></uv-icon>
                </view>
              </view>
              <!-- 上传负债截图 -->
              <view class="upload-section">
               
                <!-- 未上传状态 -->
                <view class="custom-upload-box" v-if="!item.images || item.images.length === 0" @click="chooseImage(index)">
                  <uv-icon name="plus" color="#B0B0B0" size="60"></uv-icon>
                  <text class="upload-text">上传负债截图</text>
                </view>
                
                <!-- 有图片时的显示 -->
                <view v-else>
                  <!-- 上传中状态 -->
                  <view class="upload-loading" v-if="item.images[0].status === 'uploading'">
                    <view class="loading-content">
                      <uv-icon name="loading" color="#407BFF" size="40"></uv-icon>
                      <text class="loading-text">上传中...</text>
                    </view>
                  </view>
                  
                  <!-- 上传成功状态 -->
                  <view class="upload-success" v-else-if="item.images[0].status === 'success'">
                    <image 
                      class="preview-image" 
                      :src="item.images[0].url" 
                      mode="aspectFill"
                      @error="handleImageError(index)"
                      @load="handleImageLoad(index)"
                      style="width: 100%; height: 200rpx; display: block;"
                    ></image>
                    <view class="image-overlay">
                      <view class="overlay-actions">
                        <view class="action-btn reupload-btn" @click="chooseImage(index)">
                          <uv-icon name="camera" color="#FFFFFF" size="20"></uv-icon>
                          <text class="btn-text">重新上传</text>
                        </view>
                        <view class="action-btn delete-btn" @click="confirmDeleteImage(index)">
                          <uv-icon name="trash" color="#FFFFFF" size="20"></uv-icon>
                          <text class="btn-text">删除</text>
                        </view>
                      </view>
                    </view>
                  </view>
                  
                  <!-- 其他状态 -->
                  <view class="upload-error" v-else>
                    <view class="error-content">
                      <uv-icon name="image" color="#FF4757" size="40"></uv-icon>
                      <text class="error-text">状态异常: {{item.images[0].status}}</text>
                      <view class="error-actions">
                        <view class="action-btn reupload-btn" @click="chooseImage(index)">
                          <text class="btn-text">重新上传</text>
                        </view>
                      </view>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>

          <!-- 添加更多负债信息按钮 -->
          <view class="add-debt" @click="addDebtItem">
            <uv-icon name="plus" color="#407BFF" size="24"></uv-icon>
            <text class="add-text">增加更多负债信息</text>
          </view>
        </view>
      </view>

      <!-- 提交按钮 -->
      <view class="submit-section">
        <button class="submit-btn" @click="handleSubmit">提交审核</button>
      </view>
    </view>
    
    <!-- iOS Home Indicator -->
    <!-- <view class="home-indicator"></view> -->
  </view>
</template>

<script>
import request from '@/utils/request.js'
import { uploadFile } from '@/utils/file.js'
import config, { API_CONFIG, staticBaseUrl } from '@/config/index.js'

export default {
  name: 'FundApplyPage',
  data() {
    return {
      backgroundImage: staticBaseUrl + '/apply-bg.png',
      formData: {
        applicantName: '',
        birthDate: '',
        gender: null, // 使用null表示未选择
        education: '',
        address: '',
        property: '',
        parentContact: ''
      },
      genderOptions: ['男', '女'],
      debtList: [
        {
          platform: '',
          amount: '',
          images: []
        },
        {
          platform: '',
          amount: '',
          images: []
        }
      ]
    }
  },
  computed: {
    displayBirthDate() {
      if (!this.formData.birthDate) {
        return '';
      }
      const date = new Date(this.formData.birthDate);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
         displayGender() {
       return this.formData.gender !== null ? this.genderOptions[this.formData.gender] : '';
    }
  },
  methods: {
    onBack() {
      uni.navigateBack({
        delta: 1,
        fail: () => {
          uni.switchTab({
            url: '/pages/user/fund/index'
          })
        }
      })
    },
    openBirthDatePicker() {
      this.$refs.birthDatePicker.open()
    },
    openGenderPicker() {
      this.$refs.genderPicker.open()
    },
    handleBirthDateChange(e) {
      this.formData.birthDate = e.value
    },
    handleGenderChange(e) {
      // uv-picker返回的e.indexs是选中项的索引数组
      console.log('性别选择事件:', e)
      this.formData.gender = e.indexs[0]
      console.log('设置性别为:', this.formData.gender, '显示文本:', this.genderOptions[this.formData.gender])
    },
    addDebtItem() {
      this.debtList.push({
        platform: '',
        amount: '',
        images: []
      })
    },
    deleteDebtItem(index) {
      this.debtList.splice(index, 1)
    },

    
    // 选择图片
    chooseImage(index) {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.uploadImage(res.tempFilePaths[0], index)
        },
        fail: (err) => {
          console.log('选择图片失败:', err)
        }
      })
    },
    
    // 上传图片
    async uploadImage(filePath, index) {
      // 设置上传中状态
      this.debtList[index].images = [{
        status: 'uploading',
        message: '上传中',
        url: filePath
      }]
      
      try {
        let uploadParams = {
          file: filePath,
          businessType: 'DEBT_IMAGE',
          businessId: this.debtList[index].id || ''
        }
        
        const fileRes = await uploadFile(uploadParams)
        
        // 调试上传响应数据结构
        console.log('上传响应数据:', fileRes)
        
        // 根据实际响应结构处理数据
        let fileUrl, fileId
        if (fileRes.data && fileRes.data.fileUrl) {
          // 如果data下有fileUrl
          fileUrl = fileRes.data.fileUrl
          fileId = fileRes.data.fileName || fileRes.data.fileId
        } else if (fileRes.fileUrl) {
          // 如果直接在根级有fileUrl
          fileUrl = fileRes.fileUrl
          fileId = fileRes.fileName || fileRes.fileId
        } else {
          throw new Error('响应数据格式不正确')
        }
        
        // 拼接完整的图片URL
        const fullImageUrl = `${API_CONFIG.BASE_URL}${fileUrl}`
        console.log(`图片地址：${fullImageUrl}`)
        
        this.debtList[index].images = [{
          status: 'success',
          message: '',
          url: fullImageUrl,
          id: fileId
        }]
        
        uni.showToast({
          title: '上传成功',
          icon: 'success'
        })
        
      } catch (error) {
        console.log('上传失败:', error)
        uni.showToast({
          title: '图片上传失败',
          icon: 'none'
        })
        // 上传失败，清空图片
        this.debtList[index].images = []
      }
    },
    
    // 重新上传图片
    reUploadImage(index) {
      // 清空当前图片，触发重新上传
      this.debtList[index].images = []
    },
    
    // 确认删除图片
    confirmDeleteImage(index) {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这张图片吗？',
        success: (res) => {
          if (res.confirm) {
            this.debtList[index].images = []
          }
        }
      })
    },
    
    // 图片加载错误处理
    handleImageError(index) {
      console.log('图片加载失败:', this.debtList[index].images[0])
      uni.showToast({
        title: '图片加载失败',
        icon: 'none'
      })
    },
    
    // 图片加载成功处理
    handleImageLoad(index) {
      console.log('图片加载成功:', this.debtList[index].images[0])
    },
    
    // 格式化日期用于提交
    formatDateForSubmit(dateValue) {
      if (!dateValue) return ''
      
      const date = new Date(dateValue)
      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      
      return `${year}-${month}-${day}`
    },
    
    async handleSubmit() {
      // 表单验证
      if (!this.formData.applicantName) {
        uni.showToast({
          title: '请输入姓名',
          icon: 'none'
        })
        return
      }
      if (!this.formData.birthDate) {
        uni.showToast({
          title: '请选择出生日期',
          icon: 'none'
        })
        return
      }
      if (this.formData.gender === null || this.formData.gender === '') {
        uni.showToast({
          title: '请选择性别',
          icon: 'none'
        })
        return
      }
      if (!this.formData.education) {
        uni.showToast({
          title: '请输入学历文凭',
          icon: 'none'
        })
        return
      }
      if (!this.formData.address) {
        uni.showToast({
          title: '请输入家庭或工作地址',
          icon: 'none'
        })
        return
      }
      if (!this.formData.parentContact) {
        uni.showToast({
          title: '请输入父母联系方式',
          icon: 'none'
        })
        return
      }

      // 验证负债信息
      const debts = this.debtList.map(item => {
        if (!item.platform) {
          uni.showToast({
            title: '请输入银行/平台名称',
            icon: 'none'
          })
          return null
        }
        if (!item.amount) {
          uni.showToast({
            title: '请输入负债金额',
            icon: 'none'
          })
          return null
        }
        if (!item.images || item.images.length === 0) {
          uni.showToast({
            title: '请上传负债截图',
            icon: 'none'
          })
          return null
        }
        return {
          platformName: item.platform,
          debtAmount: Number(item.amount),
          debtImageFileId: item.images[0].id // 使用上传后返回的文件ID
        }
      })

      if (debts.includes(null)) {
        return
      }

      try {
        // 格式化日期用于调试
        const formattedDate = this.formatDateForSubmit(this.formData.birthDate)
        console.log('原始日期:', this.formData.birthDate, '格式化后:', formattedDate)
        
        // 使用申请记录模块API提交青年帮扶基金申请
        const submitData = {
          applicationType: 'general', // 通用帮扶申请
          userInfo: {
            name: this.formData.applicantName,
            birthDate: formattedDate,
            gender: this.formData.gender === 0 ? 'male' : 'female',
            education: this.formData.education,
            address: this.formData.address,
            assets: this.formData.property || '',
            parentContact: this.formData.parentContact
          },
          debtInfoList: debts.map(debt => ({
              bankPlatform: debt.platformName,
            debtAmount: debt.debtAmount,
            debtScreenshot: debt.debtImageFileId
          })),
          basicDocuments: debts.map(debt => debt.debtImageFileId),
          specialDocuments: [],
          applicationDescription: '青年帮扶基金申请'
        }

        console.log('提交数据:', submitData)

        // 导入申请记录API
        const applicationRecordApi = (await import('@/api/modules/application-record.js')).default
        
        const res = await applicationRecordApi.submitYouthAssistanceApplication(submitData)
        
        if (res && res.success !== false) {
          uni.showToast({
            title: '申请提交成功',
            icon: 'success'
          })
          // 提交成功后返回上一页
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } else {
          uni.showToast({
            title: res.message || '提交失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('提交申请失败:', error)
        uni.showToast({
          title: '提交失败，请稍后重试',
          icon: 'none'
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.apply-page {
  height: 100vh;
  padding-bottom: 100rpx;
  position: relative;
  background-size: cover;
  background-position: top;
  background-repeat: no-repeat;
  overflow-y: auto;

  /* 状态栏 */
  .status-bar {
    height: 44px;
    width: 100%;
    background: transparent;
  }

  /* 导航栏 */
  .navbar {
    padding: 20rpx 30rpx;
    // background: linear-gradient(to right, #5DAAFF, #407BFF);
    
    .back-btn {
      display: flex;
      align-items: center;
      
      .back-text {
        color: #FFFFFF;
        font-size: 32rpx;
        margin-left: 8rpx;
      }
    }
  }

  /* 页面标题 */
  .page-title {
    color: #fff;
    font-size: 44rpx;
    font-weight: bold;
    text-align: left;
    padding: 20rpx 30rpx 40rpx;
    // background: linear-gradient(to right, #5DAAFF, #407BFF);
  }

  /* 表单内容区域 */
  .form-content {
    margin: 0;
    margin-top: -20rpx;
    position: relative;
    z-index: 1;

    .form-group {
      background-color: transparent;
      border-radius: 30rpx 30rpx 0 0;
      padding: 30rpx 20rpx;
      margin: 0 0 30rpx;

      .form-container {
        min-height: 400rpx;
        border-radius: 20rpx;
        background-color: #fff;
        padding: 25rpx 20rpx;
        margin-bottom: 30rpx;
        box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.05);

        .form-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20rpx;

          .form-item.half {
            width: 48%;
          }
        }
      }

      .debt-container {
        margin-top: 30rpx;
      }

      .group-title {
        font-size: 32rpx;
        color: #333333;
        font-weight: 600;
        margin-bottom: 30rpx;
        display: block;
      }

      .form-item {
        margin-bottom: 20rpx;

        &:last-child {
          margin-bottom: 0;
        }

        .item-input {
          width: 100%;
          height: 80rpx;
          background-color: #F5F5F5;
          border-radius: 8rpx;
          padding: 0 20rpx;
          font-size: 28rpx;
          color: #333;
          box-sizing: border-box;
        }
      }
    }

    .submit-section {
      padding: 40rpx 30rpx 60rpx;

      .submit-btn {
        width: 100%;
        height: 90rpx;
        background: #407BFF;
        border-radius: 45rpx;
        color: #fff;
        font-size: 32rpx;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;

        &:active {
          opacity: 0.8;
        }
      }
    }
  }

  /* iOS Home Indicator */
  .home-indicator {
    position: fixed;
    bottom: 8rpx;
    left: 50%;
    transform: translateX(-50%);
    width: 120rpx;
    height: 10rpx;
    background-color: #000;
    border-radius: 5rpx;
  }
}

/* 负债列表样式 */
.debt-list {
  .debt-item {
    margin-bottom: 20rpx;
    border: 2rpx dashed #DCDCDC;
    border-radius: 16rpx;
    padding: 15rpx;

    .debt-row {
      display: flex;
      align-items: center;
      gap: 20rpx;

      .debt-input {
        flex: 1;
        height: 80rpx;
        background-color: #F5F5F5;
        border-radius: 8rpx;
        padding: 0 20rpx;
        font-size: 28rpx;
        color: #333;
        box-sizing: border-box;
      }

      .delete-icon {
        width: 40rpx;
        height: 40rpx;
        background-color: #D6E4FF;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-left: 10rpx;
      }
    }
  }
}

/* 添加负债按钮样式 */
.add-debt {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10rpx;
  padding: 20rpx 0;
  margin-left: 10rpx;
  cursor: pointer;

  .add-text {
    color: rgba(61, 61, 61, 0.8);
    font-size: 28rpx;
  }
}

/* 上传区域样式 */
.upload-section {
  margin-top: 20rpx;
  width: 100%;
  box-sizing: border-box;
  position: relative;
  
  // 未上传状态样式
  .custom-upload-box {
    width: 100%;
    height: 200rpx;
    background-color: #F5F5F5;
    border-radius: 8rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16rpx;
    box-sizing: border-box;
    cursor: pointer;
    transition: background-color 0.3s ease;

    &:active {
      background-color: #EEEEEE;
    }

    .upload-text {
      color: #AAAAAA;
      font-size: 28rpx;
    }
  }
  
  // 上传中状态样式
  .upload-loading {
    width: 100%;
    height: 200rpx;
    background-color: #F5F5F5;
    border-radius: 8rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    
    .loading-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16rpx;
      
      .loading-text {
        color: #407BFF;
        font-size: 28rpx;
      }
    }
  }
  
  // 上传成功状态样式
  .upload-success {
    width: 100% !important;
    height: 200rpx !important;
    position: relative;
    border-radius: 8rpx;
    overflow: hidden;
    box-sizing: border-box;
    background-color: #f0f0f0; // 添加背景色用于调试
    
    .preview-image {
      width: 100% !important;
      height: 100% !important;
      border-radius: 8rpx;
      display: block !important;
      object-fit: cover;
    }
    
    .image-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
      
      &:active {
        opacity: 1;
      }
      
      .overlay-actions {
        display: flex;
        gap: 30rpx;
        
        .action-btn {
          padding: 20rpx 30rpx;
          border-radius: 8rpx;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10rpx);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8rpx;
          transition: all 0.3s ease;
          
          &:active {
            background: rgba(255, 255, 255, 0.3);
            transform: scale(0.95);
          }
          
          .btn-text {
            color: #FFFFFF;
            font-size: 24rpx;
          }
        }
      }
    }
    
    // 点击整个图片区域也显示操作按钮
    &:active .image-overlay {
      opacity: 1;
    }
  }
  
  // 图片加载失败状态样式
  .upload-error {
    width: 100%;
    height: 200rpx;
    background-color: #FFF5F5;
    border: 2rpx dashed #FF4757;
    border-radius: 8rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    
    .error-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16rpx;
      
      .error-text {
        color: #FF4757;
        font-size: 28rpx;
      }
      
      .error-actions {
        .action-btn {
          padding: 16rpx 32rpx;
          background-color: #FF4757;
          border-radius: 8rpx;
          
          .btn-text {
            color: #FFFFFF;
            font-size: 26rpx;
          }
          
          &:active {
            opacity: 0.8;
          }
        }
      }
    }
  }
}
</style> 