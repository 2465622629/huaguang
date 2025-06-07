<template>
  <view class="legal-help-page" :style="pageStyle">
    <!-- 状态栏占位 -->
    <view class="status-bar"></view>

    <!-- 页眉Banner区域 -->
    <view class="page-header">
      <view class="header-content">
        <text class="main-title">获取法律帮助</text>
        <text class="sub-title">一站式解决您的法律问题</text>
      </view>
      <!-- 律师插画 -->
      <view class="lawyer-illustration">
        <!-- 这里将放置律师插画 -->
      </view>
    </view>

    <!-- 主内容区域 -->
    <view class="content-background">
      <!-- 功能入口卡片 -->
      <view class="main-options-card">
        <view class="option-item" @click="handleDocumentDownload">
          <uv-icon name="file-text" color="#3A7AF0" size="60"></uv-icon>
          <view class="option-text">
            <text class="option-title">法律文书下载</text>
            <text class="option-desc">提供法律文书模版</text>
          </view>
        </view>
        <view class="option-item" @click="handleLawyerRecommend">
          <image :src="lawyerIconPath" style="width: 60rpx; height: 60rpx;"></image>
          <view class="option-text">
            <text class="option-title">推荐律师</text>
            <text class="option-desc">专业律师推荐</text>
          </view>
        </view>
      </view>

      <!-- 法律文书下载卡片 -->
      <view class="content-card">
        <view class="card-title">法律文书下载</view>
        <view class="card-subtitle">常用合同、协议模版免费下载</view>
        <view class="document-grid">
          <view v-for="(doc, index) in documentList" :key="index" class="document-item"
            @click="handleDocumentClick(doc)">
            <uv-icon name="file-text" color="#AAAAAA" size="35"></uv-icon>
            <text class="document-name">{{ doc.name }}</text>
          </view>
        </view>
      </view>

      <!-- 推荐律师卡片 -->
      <view class="content-card">
        <view class="card-title" @click="handleLawyerRecommend">推荐律师</view>
        <view class="card-subtitle" @click="handleLawyerRecommend">精选经验丰富律师，快速响应您的需求</view>
        <uv-scroll-list :indicator="false">
          <view v-for="(lawyer, index) in lawyerList" :key="index" class="lawyer-item">
            <view class="lawyer-avatar"></view>
            <view class="lawyer-info">
              <text class="lawyer-name">{{ lawyer.name }}</text>
              <text class="lawyer-specialty">{{ lawyer.specialty }}</text>
            </view>
            <view class="lawyer-footer">
              <text class="lawyer-price">{{ lawyer.price }}</text>
              <view class="consult-btn" @click="handleConsult(lawyer)">
                <text class="consult-text">立即咨询</text>
              </view>
            </view>
          </view>
        </uv-scroll-list>
      </view>

      <!-- 法律知识科普卡片 -->
      <view class="content-card">
        <view class="card-title">法律知识科普</view>
        <view class="card-subtitle">常见法律问题一读即懂，保护自己的第一步从了解权利开始。</view>
        <view class="knowledge-list">
          <view v-for="(item, index) in knowledgeList" :key="index" class="knowledge-item">
            <view class="question-row">
              <view class="question-icon">?</view>
              <text class="question-text">{{ item.question }}</text>
            </view>
            <text class="answer-text">{{ item.answer }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部导航栏 -->
    <user-tabbar></user-tabbar>
  </view>
</template>

<script>
import UserTabbar from '@/components/tabbar/user-tabbar/user-tabbar.vue'
import config from '@/config/index.js'
import { getHotLawyers } from '@/api/modules/home.js'

export default {
  name: 'LegalHelpPage',
  components: {
    UserTabbar
  },
  data() {
    return {
      config: config,
      // 图片路径
      lawyerIconPath: config.staticBaseUrl + '/icons/lvshi.png',
      backgroundImagePath: config.staticBaseUrl + '/lvshi_bg2.png',
      // 法律文书列表
      documentList: [
        { name: '劳动合同模版' },
        { name: '租房合同模版' },
        { name: '租赁合同模版' },
        { name: '离婚协议书模版' },
        { name: '解除协议模版' }
      ],
      // 推荐律师列表
      lawyerList: [],
      // 法律知识科普
      knowledgeList: [
        {
          question: '离职后公司索赔，合法吗？',
          answer: '公司若因员工离职造成实际经济损失，可依法索赔。但必须提供充分证据，并且金额合理，不能随意扣除工资或押金。遇到争议，可申请劳动仲裁保护自身权益。'
        },
        {
          question: '租房押金纠纷怎么解决？',
          answer: '退租时若房东无合理理由扣押押金，属于违约行为。租客可保留合同、付款凭证等证据，先行协商，协商无果可向居住地法院提起小额诉讼维权。'
        },
        {
          question: '交通事故私了协议有效吗？',
          answer: '交通事故双方签订的私了协议，在双方自愿、内容合法的情况下具备法律效力。建议在协议中明确赔偿金额、履行方式及放弃追责等内容，签字确认后保存好原件。'
        }
      ]
    }
  },
  computed: {
    pageStyle() {
      return {
        backgroundImage: `url('${this.backgroundImagePath}')`
      }
    }
  },
  onLoad() {
    // 页面加载时获取热门律师数据
    this.loadHotLawyers()
  },
  methods: {
    // 加载热门律师数据
    async loadHotLawyers() {
      try {
        const response = await getHotLawyers({ limit: 10 })
        console.log('res',response);
        if (response ) {
          // 将API响应数据映射到模板所需的数据结构
          this.lawyerList = response.map(lawyer => ({
            name: lawyer.name,
            specialty: lawyer.specialties ? lawyer.specialties.join('、') : '',
            price: `¥${lawyer.consultationFee}/次`
          }))
        }
      } catch (error) {
        console.error('获取热门律师失败:', error)
        uni.showToast({
          title: '获取律师信息失败',
          icon: 'none'
        })
      }
    },
    handleDocumentDownload() {
      uni.showToast({
        title: '文书下载功能开发中',
        icon: 'none'
      })
    },
    handleLawyerRecommend() {
      console.log('handleLawyerRecommend');

      uni.navigateTo({
        url: '/pages/user/index/consultation/index'
      })
    },
    handleDocumentClick(doc) {
      uni.showToast({
        title: `下载${doc.name}`,
        icon: 'none'
      })
    },
    handleConsult(lawyer) {
      
      uni.showToast({
        title: `咨询${lawyer.name}`,
        icon: 'none'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.legal-help-page {
  height: 100vh;
  overflow-y: auto;
  // background-color: #F0F2F8;
  background-size: cover;
  background-position: center -10px; // 向下偏移100px
  background-repeat: no-repeat;
  background-attachment: fixed;

  .status-bar {
    height: var(--status-bar-height);
    background: transparent;
  }

  .page-header {
    position: relative;
    padding: 20rpx 30rpx 60rpx;
    overflow: hidden;
    margin-top: 70rpx;

    .header-content {
      z-index: 10;
      position: relative;

      .main-title {
        color: #FFFFFF;
        font-size: 40rpx;
        font-weight: 600;
        display: block;
        margin-bottom: 16rpx;
      }

      .sub-title {
        color: #FFFFFF;
        font-size: 39rpx;
        font-weight: 400;
        display: block;
        letter-spacing: 5rpx;
      }
    }

    .lawyer-illustration {
      position: absolute;
      right: 30rpx;
      bottom: 0;
      width: 200rpx;
      height: 200rpx;
      // 这里将添加律师插画背景
    }
  }

  .content-background {
    // background-color: #F0F2F8;
    border-top-left-radius: 40rpx;
    border-top-right-radius: 40rpx;
    margin-top: -40rpx;
    position: relative;
    z-index: 2;
    padding: 30rpx 30rpx 100rpx;
  }

  .main-options-card {
    background: #FFFFFF;
    border-radius: 30rpx;
    padding: 40rpx;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
    margin-bottom: 30rpx;
    display: flex;
    justify-content: space-between;

    .option-item {
      display: flex;
      align-items: center;
      flex: 1;

      &:first-child {
        margin-right: 20rpx;
      }

      .option-text {
        margin-left: 20rpx;

        .option-title {
          color: #333333;
          font-size: 32rpx;
          font-weight: 600;
          display: block;
          margin-bottom: 8rpx;
        }

        .option-desc {
          color: #888888;
          font-size: 24rpx;
          display: block;
        }
      }
    }
  }

  .content-card {
    background: #FFFFFF;
    border-radius: 30rpx;
    padding: 40rpx;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
    margin-bottom: 30rpx;

    .card-title {
      color: #333333;
      font-size: 34rpx;
      font-weight: 600;
      margin-bottom: 12rpx;
    }

    .card-subtitle {
      color: #888888;
      font-size: 26rpx;
      margin-bottom: 30rpx;
    }

    .document-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20rpx;

      .document-item {
        display: flex;
        align-items: center;
        padding: 12rpx 0;

        .document-name {
          color: #3A7AF0;
          font-size: 28rpx;
          margin-left: 12rpx;
          text-decoration: underline;
        }
      }
    }

    .lawyer-item {
      display: grid;
      grid-template-columns: 96rpx 1fr;
      grid-template-rows: auto auto;
      gap: 8rpx 16rpx;
      width: 270rpx !important;   // 使用 !important 强制覆盖
      min-width: 270rpx !important;
      margin-right: 20rpx;

      .lawyer-avatar {
        width: 96rpx;
        height: 96rpx;
        border-radius: 50%;
        background-color: #E0E0E0;
        grid-row: 1 / 2;
        grid-column: 1 / 2;
      }

      .lawyer-info {
        display: flex;
        flex-direction: column;
        grid-row: 1 / 2;
        grid-column: 2 / 3;

        .lawyer-name {
          color: #333333;
          font-size: 30rpx;
          font-weight: 500;
          margin-bottom: 8rpx;
        }

        .lawyer-specialty {
          color: #888888;
          font-size: 24rpx;
        }
      }

      .lawyer-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        grid-row: 2 / 3;
        grid-column: 1 / 3;
        margin-top: 8rpx;

        .lawyer-price {
          color: #333333;
          font-size: 24rpx;
          flex-shrink: 0;
        }

        .consult-btn {
          background-color: #3A7AF0;
          border-radius: 30rpx;
          padding: 3rpx 16rpx;
          flex-shrink: 0;
          display: flex;
          align-items: center;

          .consult-text {
            color: #FFFFFF;
            font-size: 24rpx;
          }
        }
      }
    }

    .knowledge-list {
      .knowledge-item {
        margin-bottom: 30rpx;

        &:last-child {
          margin-bottom: 0;
        }

        .question-row {
          display: flex;
          align-items: center;
          margin-bottom: 16rpx;

          .question-icon {
            width: 32rpx;
            height: 32rpx;
            border-radius: 50%;
            background-color: #666666;
            color: #FFFFFF;
            font-size: 20rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 16rpx;
          }

          .question-text {
            color: #333333;
            font-size: 30rpx;
            font-weight: 600;
            flex: 1;
          }
        }

        .answer-text {
          color: #666666;
          font-size: 26rpx;
          line-height: 1.5;
          margin-left: 48rpx;
        }
      }
    }
  }
}
</style>