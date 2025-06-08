<template>
  <view class="job-detail-container" :style="{ backgroundImage: `url('${config.staticBaseUrl}/bg9.png')` }">
    <!-- 自定义导航栏 -->
    <uv-navbar title="职位详情" :autoBack="true" leftText="返回" leftIcon="arrow-left" :bgColor="navbarBgColor"
      :leftIconColor="navbarTextColor" :safeAreaInsetTop="true" :fixed="true" :placeholder="true"
      @leftClick="goBack"></uv-navbar>

    <!-- 可滚动的页面内容 -->
    <scroll-view class="scroll-container" scroll-y="true">
      <view class="page-content">
        <!-- 职位标题与薪资区域 -->
        <view class="job-header">
          <view class="job-title-salary">
            <text class="job-title">{{ jobInfo.title }}</text>
            <text class="job-salary">{{ jobInfo.salary }}</text>
          </view>
          <view class="job-tags">
            <view class="tag-item">
              <uv-icon :name="`${config.staticBaseUrl}/icons/location.png`" size="24" color="#888888"></uv-icon>
              <text class="tag-text">{{ jobInfo.location }}</text>
            </view>
            <view class="tag-item">
              <uv-icon :name="`${config.staticBaseUrl}/icons/experience.png`" size="24" color="#888888"></uv-icon>
              <text class="tag-text">{{ jobInfo.experience }}</text>
            </view>
            <view class="tag-item">
              <uv-icon :name="`${config.staticBaseUrl}/icons/graduation.png`" size="24" color="#888888"></uv-icon>
              <text class="tag-text">{{ jobInfo.education }}</text>
            </view>
          </view>
        </view>

        <!-- 公司信息区域 -->
        <view class="company-info">
          <view class="company-content">
            <view class="company-logo">
              <!-- 公司Logo占位符 -->
            </view>
            <view class="company-details">
              <text class="company-name">{{ jobInfo.companyName }}</text>
              <text class="company-desc">{{ jobInfo.companyDesc }} </text>
              <text class="company-size">{{ jobInfo.companySize }}</text>
            </view>
            <view class="company-arrow">
              <uv-icon name="arrow-right" size="0" color="#AAAAAA"></uv-icon>
            </view>
          </view>
        </view>

        <!-- 职位详情区域 -->
        <view class="job-details">
          <text class="section-title">职位详情</text>
          <text class="subsection-title">职位描述</text>
          <text class="job-description">{{ jobInfo.description }}</text>
          <view class="job-responsibilities">
            <view v-for="(item, index) in jobInfo.responsibilities" :key="index" class="responsibility-item">
              <text class="bullet-point">·</text>
              <text class="responsibility-text">{{ item }}</text>
            </view>
          </view>
        </view>

        <!-- 职业要求区域 -->
        <view class="job-requirements">
          <text class="section-title">职业要求</text>

          <view class="requirement-item">
            <text class="requirement-label">学历要求: </text>
            <text class="requirement-value">{{ jobInfo.requirements.education }}</text>
          </view>

          <view class="requirement-item">
            <text class="requirement-label">工作经验: </text>
            <text class="requirement-value">{{ jobInfo.requirements.experience }}</text>
          </view>

          <view class="requirement-section">
            <text class="requirement-label">专业技能:</text>
            <view class="requirement-list">
              <view v-for="(skill, index) in jobInfo.requirements.skills" :key="index" class="requirement-list-item">
                <text class="bullet-point">·</text>
                <text class="requirement-text">{{ skill }}</text>
              </view>
            </view>
          </view>

          <view class="requirement-section">
            <text class="requirement-label">其他要求:</text>
            <view class="requirement-list">
              <view v-for="(other, index) in jobInfo.requirements.others" :key="index" class="requirement-list-item">
                <text class="bullet-point">·</text>
                <text class="requirement-text">{{ other }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部固定按钮 -->
    <view class="bottom-action" :style="{ paddingBottom: safeAreaBottom + 'px' }">
      <view class="custom-button" @click="submitResume">
        投递简历
      </view>
    </view>
  </view>
</template>

<script>
import config from '@/config/index.js'

export default {
  data() {
    return {
      config,
      safeAreaBottom: 0,
      navbarBgColor: 'transparent',
      navbarTextColor: '#3F3F3F',
      jobInfo: {
        title: '法务专员',
        salary: '6k-9k',
        location: '上海市·浦东新区',
        experience: '1-3年',
        education: '本科',
        companyName: 'XX科技有限公司',
        companyDesc: '互联网 · 软件开发 ',
        companySize: '500-999人',
        description: '本岗位主要负责公司合同审核、法律咨询支持、风险防控管理及法律文书处理等相关事务，确保公司经营活动合法合规。',
        responsibilities: [
          '负责各类合同、协议的起草与审核；',
          '提供日常法律咨询服务，出具法律意见书；',
          '参与处理劳动人事、商业合作等相关法律事务；',
          '协助进行公司合规体系建设，培训业务部门员工；',
          '配合处理公司重大突发法律事务。'
        ],
        requirements: {
          education: '本科及以上 (法律相关专业优先)',
          experience: '1-3年相关工作经验',
          skills: [
            '熟悉合同法、劳动法、公司法等相关法律法规',
            '能独立起草、审核法律文件'
          ],
          others: [
            '具备较强的沟通协调能力与逻辑分析能力',
            '具备良好的职业道德，严谨细致',
            '有律师资格证者优先'
          ]
        }
      }
    }
  },
  onLoad(options) {
    this.getSystemInfo()
    // 接收传递的职位ID参数
    if (options.id) {
      this.loadJobDetail(options.id)
    }
  },
  methods: {
    // 获取系统信息
    getSystemInfo() {
      const systemInfo = uni.getSystemInfoSync()
      this.safeAreaBottom = systemInfo.safeAreaInsets?.bottom || 0
    },

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

    // 投递简历
    submitResume() {
      uni.showToast({
        title: '简历投递成功',
        icon: 'success'
      })
    },

    // 根据职位ID加载职位详情
    loadJobDetail(jobId) {
      // 模拟不同职位的数据
      const jobData = {
        1: {
          title: '法务专员',
          salary: '6k-9k',
          location: '上海市·浦东新区',
          experience: '1-3年',
          education: '本科',
          companyName: 'XX科技有限公司',
          companyDesc: '互联网 · 软件开发 500-999人',
          description: '本岗位主要负责公司合同审核、法律咨询支持、风险防控管理及法律文书处理等相关事务，确保公司经营活动合法合规。',
          responsibilities: [
            '负责各类合同、协议的起草与审核；',
            '提供日常法律咨询服务，出具法律意见书；',
            '参与处理劳动人事、商业合作等相关法律事务；',
            '协助进行公司合规体系建设，培训业务部门员工；',
            '配合处理公司重大突发法律事务。'
          ],
          requirements: {
            education: '本科及以上 (法律相关专业优先)',
            experience: '1-3年相关工作经验',
            skills: [
              '熟悉合同法、劳动法、公司法等相关法律法规',
              '能独立起草、审核法律文件'
            ],
            others: [
              '具备较强的沟通协调能力与逻辑分析能力',
              '具备良好的职业道德，严谨细致',
              '有律师资格证者优先'
            ]
          }
        },
        2: {
          title: '心理咨询师',
          salary: '8k-12k',
          location: '北京市·朝阳区',
          experience: '2-5年',
          education: '本科',
          companyName: 'YY心理健康中心',
          companyDesc: '医疗健康 · 心理服务 100-499人',
          description: '负责为来访者提供专业的心理咨询服务，包括个体咨询、团体咨询等，帮助来访者解决心理困扰，提升心理健康水平。',
          responsibilities: [
            '为来访者提供个体心理咨询服务；',
            '开展团体心理咨询和心理健康讲座；',
            '制定个性化的心理干预方案；',
            '撰写心理评估报告和咨询记录；',
            '参与心理危机干预和应急处理。'
          ],
          requirements: {
            education: '本科及以上 (心理学相关专业)',
            experience: '2-5年心理咨询工作经验',
            skills: [
              '具备国家心理咨询师资格证书',
              '熟练掌握各种心理咨询技术和方法'
            ],
            others: [
              '具备良好的沟通能力和共情能力',
              '有较强的心理承受能力和职业操守',
              '有团体咨询经验者优先'
            ]
          }
        },
        3: {
          title: '软件工程师',
          salary: '10k-18k',
          location: '深圳市·南山区',
          experience: '3-5年',
          education: '本科',
          companyName: 'ZZ互联网公司',
          companyDesc: '互联网 · 软件开发 1000+人',
          description: '负责公司核心产品的后端开发工作，参与系统架构设计，确保系统的稳定性和可扩展性。',
          responsibilities: [
            '负责后端系统的设计和开发；',
            '参与产品需求分析和技术方案设计；',
            '优化系统性能，提升用户体验；',
            '编写技术文档和代码注释；',
            '参与代码审查和技术分享。'
          ],
          requirements: {
            education: '本科及以上 (计算机相关专业)',
            experience: '3-5年软件开发经验',
            skills: [
              '熟练掌握Java、Python等编程语言',
              '熟悉Spring、MyBatis等开发框架'
            ],
            others: [
              '具备良好的编程习惯和代码规范意识',
              '有分布式系统开发经验者优先',
              '具备良好的团队协作能力'
            ]
          }
        }
      }

      // 根据ID获取对应的职位数据，如果没有找到则使用默认数据
      const selectedJob = jobData[jobId] || jobData[1]
      this.jobInfo = selectedJob
    }
  }
}
</script>

<style lang="scss" scoped>
.job-detail-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  // background-color: #F7F8FA;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.scroll-container {
  flex: 1;
  height: 0; // 重要：配合flex使用，确保滚动容器能够正确计算高度
}

.page-content {
  padding-bottom: 80px; // 为底部按钮留出空间
}

// 职位标题与薪资区域
.job-header {
  padding: 15px 20px;
  // background-color: #F7F8FA;

  .job-title-salary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;

    .job-title {
      font-size: 24px;
      font-weight: bold;
      color: #000000;
    }

    .job-salary {
      font-size: 18px;
      color: #9ADBDA;
      font-weight: 500;
      margin-right: 90rpx;
    }
  }

  .job-tags {
    display: flex;
    align-items: center;

    .tag-item {
      display: flex;
      align-items: center;
      margin-right: 70rpx;

      .tag-text {
        font-size: 12px;
        color: #888888;
        margin-left: 4px;
      }
    }
  }
}

// 公司信息区域
.company-info {
  // background-color: #F7F8FA;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);

  .company-content {
    display: flex;
    align-items: center;
    padding: 12px 20px;

    .company-logo {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background-color: #DCDCDC;
      margin-right: 12px;
    }

    .company-details {
      flex: 1;

      .company-name {
        display: block;
        font-size: 16px;
        font-weight: 600;
        color: #000000;
        margin-bottom: 4px;
      }

      .company-desc {
        font-size: 12px;
        color: #666666;
        background-color: #fbffff;

      }

      .company-size {
        font-size: 12px;
        color: #666666;
        background-color: #fbffff;
        margin-left: 10rpx;
      }
    }

    .company-arrow {
      margin-left: 10px;
    }
  }
}

// 职位详情区域
.job-details {
  padding: 10px 20px 20px 20px;
  // background-color: #F7F8FA;

  .section-title {
    display: block;
    font-size: 18px;
    font-weight: 600;
    color: #000000;
    margin-bottom: 15px;
  }

  .subsection-title {
    display: block;
    font-size: 15px;
    color: #333333;
    margin-bottom: 10px;
  }

  .job-description {
    display: block;
    font-size: 14px;
    color: #333333;
    line-height: 1.6;
    margin-bottom: 10px;
  }

  .job-responsibilities {
    .responsibility-item {
      display: flex;
      margin-bottom: 6px;

      .bullet-point {
        color: #333333;
        margin-right: 8px;
        font-size: 14px;
      }

      .responsibility-text {
        flex: 1;
        font-size: 14px;
        color: #333333;
        line-height: 1.6;
      }
    }
  }
}

// 职业要求区域
.job-requirements {
  padding: 0rpx 20rpx 20rpx 50rpx;
  // background-color: #F7F8FA;

  .section-title {
    display: block;
    font-size: 18px;
    font-weight: 600;
    color: #000000;
    margin-bottom: 15px;
  }

  .requirement-item {
    margin-bottom: 8px;

    .requirement-label {
      font-size: 14px;
      color: #333333;
    }

    .requirement-value {
      font-size: 14px;
      color: #333333;
    }
  }

  .requirement-section {
    margin-bottom: 8px;

    .requirement-label {
      display: block;
      font-size: 14px;
      color: #333333;
      margin-bottom: 6px;
    }

    .requirement-list {
      .requirement-list-item {
        display: flex;
        margin-bottom: 6px;

        .bullet-point {
          color: #333333;
          margin-right: 8px;
          font-size: 14px;
        }

        .requirement-text {
          flex: 1;
          font-size: 14px;
          color: #333333;
          line-height: 1.6;
        }
      }
    }
  }
}

// 底部固定按钮
.bottom-action {
  position: fixed;
  bottom: 0;
  left: 12rpx;
  right: 35rpx;
  padding: 10px 0;
  // border-top: 1px solid #EEEEEE;
  z-index: 10;

  .custom-button {
    background-color: #88c5ff;
    border-radius: 30rpx;
    height: 45px;
    color: #000000;
    font-size: 32rpx;
    letter-spacing: 12rpx;
    margin: 0 35rpx 52rpx 65rpx;
    border: 1px solid #88c5ff;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;

    &:active {
      background-color: #6bb3ff;
      transform: scale(0.98);
    }
  }
}
</style>