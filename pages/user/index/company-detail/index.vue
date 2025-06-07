<template>
  <view class="company-detail-container">
    <!-- 自定义导航栏 -->
    <uv-navbar 
      title="公司详情" 
      :autoBack="true"
      leftText="返回"
      leftIcon="arrow-left"
      :bgColor="navbarBgColor"
      :leftIconColor="navbarTextColor"
      :safeAreaInsetTop="true"
      :fixed="true"
      :placeholder="true"
      @leftClick="goBack"
    ></uv-navbar>

    <!-- 可滚动的页面内容 -->
    <scroll-view class="scroll-container" scroll-y="true">
      <view class="page-content">
        <!-- 公司基本信息区块 -->
        <view class="company-basic-info">
          <view class="company-logo">
            <uv-image 
              v-if="companyInfo.logo"
              :src="companyInfo.logo" 
              width="60px" 
              height="60px" 
              mode="aspectFill"
              radius="30px"
            ></uv-image>
            <view v-else class="logo-placeholder"></view>
          </view>
          
          <view class="company-details">
            <text class="company-name">{{ companyInfo.name }}</text>
            <view class="company-tags">
              <text class="industry-tag">{{ companyInfo.industry }}</text>
              <view class="scale-tag">
                <text class="scale-text">{{ companyInfo.scale }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 白色卡片容器 -->
        <view class="content-card">
          <!-- 公司简介区块 -->
          <view class="company-intro">
            <text class="section-title">公司简介</text>
            <text class="subsection-title">{{ companyInfo.about.title }}</text>
            <text class="intro-description">{{ companyInfo.about.description }}</text>
            <view class="intro-highlights">
              <view v-for="(item, index) in companyInfo.about.highlights" :key="index" class="highlight-item">
                <text class="bullet-point">·</text>
                <text class="highlight-text">{{ item }}</text>
              </view>
            </view>
          </view>

          <!-- 福利待遇图标区块 -->
          <view class="benefits-section">
            <view 
              v-for="(benefit, index) in companyInfo.benefits" 
              :key="index"
              class="benefit-item"
            >
              <view class="benefit-icon">
                <image :src="`http://localhost:3000/static/icons/${benefit.icon}.png`" style="width: 51rpx; height: 48rpx;"></image>
              </view>
              <text class="benefit-text">{{ benefit.text }}</text>
            </view>
          </view>

          <!-- 招聘职位列表区块 -->
          <view class="jobs-section">
            <text class="section-title">招聘职位</text>
            <view class="jobs-list">
              <view 
                v-for="(job, index) in companyInfo.jobs" 
                :key="index"
                class="job-item"
                :class="{ 'no-border': index === companyInfo.jobs.length - 1 }"
              >
                <view class="job-info">
                  <view class="job-title-row">
                    <text class="job-title">{{ job.title }}</text>
                    <text class="job-company">{{ job.company }}</text>
                  </view>
                  <view class="job-details-row">
                    <text class="job-salary">{{ job.salaryRange }}</text>
                    <text class="job-location">{{ job.location }}</text>
                    <text class="job-education">{{ job.educationRequirement }}</text>
                  </view>
                </view>
                <view class="job-action">
                  <uv-button 
                    text="快速投递"
                    type="primary"
                    size="small"
                    :customStyle="quickApplyButtonStyle"
                    @click="quickApply(job)"
                  ></uv-button>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { getEnterpriseDetail } from '@/api/modules/enterprise.js'

export default {
  data() {
    return {
      navbarBgColor: 'transparent',
      navbarTextColor: '#333333',
      quickApplyButtonStyle: {
        backgroundColor: '#40A9FF',
        borderRadius: '15px',
        height: '30px',
        width: '80px',
        fontSize: '13px'
      },
      // 公司信息数据
      companyInfo: {
        name: 'XX科技公司',
        industry: '互联网 · 软件开发',
        scale: '500-999人',
        logo: '',
        about: {
          title: '关于XX科技',
          description: 'XX科技成立于2012年，是一家专注于人工智能、大数据分析与云计算服务的高新技术企业。我们致力于用科技赋能产业，推动数字化转型，服务全球客户。',
          highlights: [
            '核心业务：智慧零售、智慧物流、AI算法平台开发',
            '服务客户：已覆盖全球30多个国家，超过500家企业',
            '公司文化：创新、开放、高效、合作'
          ]
        },
        benefits: [
          { icon: 'wuxian', text: '五险一金' },
          { icon: 'tanxing', text: '弹性工作' },
          { icon: 'nian', text: '年终奖金' }
        ],
        jobs: [
          {
            title: '法务专员',
            company: 'XX科技',
            salary: '6k-9k',
            location: '上海',
            education: '本科及以上'
          },
          {
            title: '前端开发工程师',
            company: 'XX科技',
            salary: '12k-18k',
            location: '上海',
            education: '本科及以上'
          },
          {
            title: '产品经理',
            company: 'XX科技',
            salary: '15k-25k',
            location: '上海',
            education: '本科及以上'
          }
        ]
      }
    }
  },
  onLoad(options) {
    // 接收传递的公司ID参数
    if (options.id) {
      this.loadCompanyDetail(options.id)
    }
  },
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack({
        fail: () => {
          // 如果没有上一页，跳转到首页
          uni.switchTab({
            url: '/pages/user/index/index'
          })
        }
      })
    },
    
    // 快速投递
    quickApply(job) {
      uni.showToast({
        title: `已投递${job.title}职位`,
        icon: 'success'
      })
    },
    
    // 根据公司ID加载公司详情
    async loadCompanyDetail(companyId) {
      try {
        uni.showLoading({
          title: '加载中...'
        })
        
        const response = await getEnterpriseDetail(companyId)
        console.log(response);
        
        if (response ) {
          const enterprise = response.enterprise
          const activeJobs = response.activeJobs || [] 
          
          // 更新企业信息数据
          this.companyInfo = {
            name: enterprise.companyName || 'XX科技公司',
            industry: enterprise.industry || '互联网 · 软件开发',
            scale: enterprise.companySize || '500-999人',
            logo: enterprise.logo || '',
            educationRequirement: enterprise.educationRequirement || '本科及以上',
            salaryRange: enterprise.salaryRange || '面议',
            about: {
              title: '关于' + (enterprise.companyName || 'XX科技'),
              description: enterprise.description || '企业简介暂无',
              highlights: []
            },
            benefits: enterprise.benefits ? enterprise.benefits.map(benefit => {
              // 定义可用的图标数组
              const icons = ['wuxian', 'tanxing', 'nian'];
              // 随机获取一个图标
              const randomIcon = icons[Math.floor(Math.random() * icons.length)];
              return {
                icon: randomIcon,
                text: benefit
              };
            }) : [
              { icon: 'wuxian', text: '五险一金' },
              { icon: 'tanxing', text: '弹性工作' },
              { icon: 'nian', text: '年终奖金' }
            ],
            jobs: activeJobs
          }
        }
        
        uni.hideLoading()
      } catch (error) {
        console.error('获取企业详情失败:', error)
        uni.hideLoading()
        uni.showToast({
          title: '获取企业信息失败',
          icon: 'none'
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.company-detail-container {
  min-height: 100vh;
  background: url('http://localhost:3000/static/bg9.png') no-repeat center center / cover;
  
}

.scroll-container {
  height: calc(100vh - 44px);
  // background-color: #F0F7FF;
}

.page-content {
  padding-bottom: 20px;
}

/* 公司基本信息区块样式 */
.company-basic-info {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  // background-color: #F0F7FF;
  
  .company-logo {
    margin-right: 15px;
    
    .logo-placeholder {
      width: 60px;
      height: 60px;
      border-radius: 30px;
      background-color: #D9D9D9;
    }
  }
  
  .company-details {
    flex: 1;
    
    .company-name {
      font-size: 18px;
      font-weight: bold;
      color: #333333;
      display: block;
      margin-bottom: 8px;
    }
    
    .company-tags {
      display: flex;
      align-items: center;
      
      .industry-tag {
        font-size: 12px;
        color: #666666;
        margin-right: 10px;
        background-color: #fbffff;
      }
      
      .scale-tag {
        background-color: #fbffff;
        border-radius: 3px;
        display: inline-block; // 使用inline-block让元素宽高包裹内容
        
        .scale-text {
          font-size: 12px;
          color: #666666;
          padding: 2px 8px; // 通过padding控制文字周围的间距
          display: block; // 确保文字能够正确撑开容器
        }
      }
    }
  }
}

/* 白色卡片容器样式 */
.content-card {
  // background-color: #FFFFFF;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  padding: 0 20px;
  margin-top: 10px;
}

/* 公司简介区块样式 */
.company-intro {
  padding-top: 20rpx;
  padding-bottom: 25rpx;
  
  .section-title {
    font-size: 16px;
    font-weight: bold;
    color: #333333;
    display: block;
    margin-bottom: 15px;
  }
  
  .subsection-title {
    font-size: 14px;
    color: #666666;
    display: block;
    margin-bottom: 10px;
  }
  
  .intro-description {
    font-size: 13px;
    line-height: 1.6;
    color: #333333;
    display: block;
    margin-bottom: 15px;
  }
  
  .intro-highlights {
    .highlight-item {
      display: flex;
      margin-bottom: 8px;
      
      .bullet-point {
        font-size: 13px;
        color: #333333;
        margin-right: 5px;
      }
      
      .highlight-text {
        font-size: 13px;
        color: #333333;
        flex: 1;
      }
    }
  }
}

/* 福利待遇区块样式 */
.benefits-section {
  padding: 20px 0;
  overflow-x: auto;
  white-space: nowrap;
  // border-bottom: 1px solid #F0F0F0;
  
  .benefit-item {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    width: calc(100% / 3);
    min-width: calc(100% / 3);
    flex-shrink: 0;
    
    .benefit-icon {
      margin-bottom: 8px;
    }
    
    .benefit-text {
      font-size: 12px;
      color: #666666;
      text-align: center;
      white-space: normal;
    }
  }
}

/* 招聘职位列表区块样式 */
.jobs-section {
  padding-top: 5px;
  
  .section-title {
    font-size: 16px;
    font-weight: bold;
    color: #333333;
    display: block;
    margin-bottom: 20px;
  }
  
  .jobs-list {
    .job-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 15px;
      margin: 10px 0;
      border-radius: 8px;
      background-color: #FFFFFF;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      
      &.no-border {
        // 移除no-border类的样式，因为不再需要分割线
      }
      
      .job-info {
        flex: 1;
        
        .job-title-row {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
          
          .job-title {
            font-size: 15px;
            font-weight: bold;
            color: #333333;
            margin-right: 10px;
          }
          
          .job-company {
            font-size: 14px;
            color: #666666;
          }
        }
        
        .job-details-row {
          display: flex;
          align-items: center;
          gap: 25rpx;
          .job-salary {
            font-size: 13px;
            // color: #FA541C;
            margin-right: 15px;
          }
          
          .job-location {
            font-size: 12px;
            color: #888888;
            margin-right: 15px;
          }
          
          .job-education {
            font-size: 12px;
            color: #888888;
          }
        }
      }
      
      .job-action {
        margin-left: 15px;
      }
    }
  }
}
</style>