<template>
  <view class="counseling-test-page">
   
    
    <!-- 导航返回区 -->
    <view class="navbar">
      <view class="navbar-left" @click="goBack">
        <uv-icon name="arrow-left" color="#FFFFFF" size="20"></uv-icon>
        <text class="navbar-text">返回</text>
      </view>
    </view>
    
    <!-- 介绍文本区 -->
    <view class="intro-section">
      <text class="intro-text-1">Hi, 在进行咨询前</text>
      <text class="intro-text-2">让我们一起进行一个<text style="color: #FA5353;">小测试</text>吧</text>
    </view>
    

    
    <!-- 测试卡片 -->
    <view class="test-card">
      <!-- 问题文本 -->
      <view class="question-section">
        <template v-for="(line, index) in currentQuestion.question.split('\n')">
          <text :key="index" class="question-text">{{ line }}</text>
        </template>
      </view>
      
      <!-- 答案选项 -->
      <view class="options-section">
        <view 
          v-for="(option, index) in currentQuestion.options" 
          :key="index"
          class="option-btn" 
          @click="selectAnswer(index + 1)"
        >
          <text>{{ option }}</text>
        </view>
      </view>
      
      <!-- 回到上一题 -->
      <view 
        class="prev-question" 
        :class="{'prev-disabled': isFirstQuestion}"
        @click="goToPrevQuestion"
      >
        <text>回到上一题</text>
      </view>
    </view>
    
    <!-- iOS Home Indicator -->
    <view class="home-indicator">
      <view class="indicator-line"></view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'CounselingTestPage',
  data() {
    return {
      currentQuestionIndex: 0,
      answers: [],
      counselor: null, // 咨询师信息
      questions: [
        {
          question: '最近一周，你出现以下情绪的频率是？\n烦躁易怒',
          options: ['经常', '偶尔', '很少']
        },
        {
          question: '最近一周，你出现以下情绪的频率是？\n情绪低落',
          options: ['经常', '偶尔', '很少']
        },
        {
          question: '最近一周，你出现以下情绪的频率是？\n焦虑不安',
          options: ['经常', '偶尔', '很少']
        },
        {
          question: '最近一周，你出现以下情绪的频率是？\n愉悦平静',
          options: ['经常', '偶尔', '很少']
        },
        {
          question: '这些情绪是否影响你的日常生活？',
          options: ['严重影响', '有些影响', '几乎不影响']
        },
        {
          question: '你当前的压力主要来自？',
          options: [
            '工作/学业',
            '经济问题',
            '人际关系',
            '家庭关系',
            '健康问题',
            '未来规划',
            '其他'
          ],
          multiSelect: true
        },
        {
          question: '面对压力时，你通常如何应对？',
          options: [
            '独自消化',
            '向亲友倾诉',
            '运动/娱乐',
            '逃避拖延',
            '寻求专业帮助',
            '其他'
          ]
        },
        {
          question: '最近是否经常出现失眠/早醒？',
          options: ['是', '否']
        },
        {
          question: '最近是否经常出现食欲异常（暴食/没胃口）？',
          options: ['是', '否']
        },
        {
          question: '最近是否经常出现身体疲惫（无明确原因）？',
          options: ['是', '否']
        },
        {
          question: '近期社交意愿如何？',
          options: [
            '主动联系他人',
            '等人联系我',
            '不想接触任何人'
          ]
        },
        {
          question: '和他人相处时，你更常感到：',
          options: [
            '放松愉快',
            '疲惫勉强', 
            '无所谓'
          ]
        },
        {
          question: '你希望获得哪方面的支持？',
          options: [
            '情绪调节',
            '压力管理',
            '人际关系指导',
            '自我认知',
            '其他'
          ]
        }
      ]
    }
  },
  onLoad() {
    // 获取上一页面传递的咨询师数据
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on('counselorData', (data) => {
      this.counselor = data.counselor
    })
  },
  computed: {
    currentQuestion() {
      return this.questions[this.currentQuestionIndex]
    },
    isFirstQuestion() {
      return this.currentQuestionIndex === 0
    },
    isLastQuestion() {
      return this.currentQuestionIndex === this.questions.length - 1
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    selectAnswer(optionIndex) {
      // 记录答案
      this.answers[this.currentQuestionIndex] = optionIndex
      
      // 如果不是最后一题，前进到下一题
      if (!this.isLastQuestion) {
        this.currentQuestionIndex++
      } else {
        // 是最后一题，完成测试，进入咨询
        this.finishTest()
      }
    },
    goToPrevQuestion() {
      if (!this.isFirstQuestion) {
        this.currentQuestionIndex--
      }
    },
    finishTest() {
      // 计算测试结果
      const result = this.calculateTestResult()
      
      // 显示结果提示
      uni.showToast({
        title: '测试完成',
        icon: 'none'
      })
      // 跳转到 chat 页面
      uni.navigateTo({
        url: '/pages/user/index/chat/index',
      })
      
      // 延迟后跳转到咨询页面
      setTimeout(() => {
        if (!this.counselor) {
          uni.showToast({
            title: '获取咨询师信息失败',
            icon: 'none'
          })
          return
        }
        
        uni.navigateTo({
          url: '/pages/user/fund/counseling/chat',
          success: (res) => {
            // 传递测试结果和咨询师信息到聊天页面
            res.eventChannel.emit('counselData', {
              counselor: this.counselor,
              testResult: result,
              answers: this.answers
            })
          }
        })
      }, 1500)
    },
    calculateTestResult() {
      // 简单计算测试结果
      // 实际项目中可能需要更复杂的计算逻辑
      const sum = this.answers.reduce((total, answer) => total + answer, 0)
      const avg = sum / this.answers.length
      
      if (avg <= 1.5) {
        return '需要专业心理咨询'
      } else if (avg <= 2.5) {
        return '建议适当寻求心理支持'
      } else {
        return '心理状态良好'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.counseling-test-page {
  min-height: 100vh;
  background: url('http://localhost:3000/static/bg6.png') no-repeat center center / cover;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  
  // 状态栏
  .status-bar {
    height: var(--status-bar-height, 44px);
    width: 100%;
    
    &-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 20rpx;
      height: 100%;
    }
    
    &-time {
      font-size: 28rpx;
      color: #000000;
    }
    
    &-right {
      display: flex;
      align-items: center;
      
      .status-bar-signal,
      .status-bar-wifi,
      .status-bar-battery {
        width: 50rpx;
        height: 30rpx;
        background-repeat: no-repeat;
        background-position: center;
        background-size: contain;
      }
      
      .status-bar-signal {
        background-image: url("data:image/svg+xml,%3Csvg width='18' height='12' viewBox='0 0 18 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 8.5H3V11.5H1V8.5ZM5 6H7V11.5H5V6ZM9 3.5H11V11.5H9V3.5ZM13 1H15V11.5H13V1Z' fill='black'/%3E%3C/svg%3E");
      }
      
      .status-bar-wifi {
        background-image: url("data:image/svg+xml,%3Csvg width='16' height='12' viewBox='0 0 16 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8 9.5C8.82843 9.5 9.5 8.82843 9.5 8C9.5 7.17157 8.82843 6.5 8 6.5C7.17157 6.5 6.5 7.17157 6.5 8C6.5 8.82843 7.17157 9.5 8 9.5Z' fill='black'/%3E%3Cpath d='M8 3.5C5.23858 3.5 2.82443 4.93578 1.52143 7.10156C1.37146 7.35908 1.43136 7.68646 1.66459 7.87161C1.89782 8.05676 2.22737 8.04156 2.44615 7.83759C3.57143 6.78527 5.38287 6 8 6C10.6171 6 12.4286 6.78527 13.5538 7.83759C13.7726 8.04156 14.1022 8.05676 14.3354 7.87161C14.5686 7.68646 14.6285 7.35908 14.4786 7.10156C13.1756 4.93578 10.7614 3.5 8 3.5Z' fill='black'/%3E%3Cpath d='M8 0.5C3.58172 0.5 0.5 3.58172 0.5 8C0.5 8.27614 0.723858 8.5 1 8.5C1.27614 8.5 1.5 8.27614 1.5 8C1.5 4.13401 4.13401 1.5 8 1.5C11.866 1.5 14.5 4.13401 14.5 8C14.5 8.27614 14.7239 8.5 15 8.5C15.2761 8.5 15.5 8.27614 15.5 8C15.5 3.58172 12.4183 0.5 8 0.5Z' fill='black'/%3E%3C/svg%3E");
      }
      
      .status-bar-battery {
        background-image: url("data:image/svg+xml,%3Csvg width='25' height='12' viewBox='0 0 25 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='0.5' y='0.5' width='21' height='11' rx='2.5' stroke='black'/%3E%3Crect x='2' y='2' width='18' height='8' rx='1' fill='black'/%3E%3Cpath d='M23 4V8C24.1046 8 25 7.10457 25 6C25 4.89543 24.1046 4 23 4Z' fill='black'/%3E%3C/svg%3E");
      }
    }
  }
  
  // 导航栏
  .navbar {
    height: 90rpx;
    display: flex;
    align-items: center;
    padding: 0 30rpx;
    
    &-left {
      display: flex;
      align-items: center;
      
      .navbar-text {
        color: #FFFFFF;
        font-size: 32rpx;
        margin-left: 8rpx;
      }
    }
  }
  
  // 介绍文本区
  .intro-section {
    padding: 30rpx 40rpx;
    display: flex;
    flex-direction: column;
    align-items: center; // 水平居中对齐
    
    .intro-text-1 {
      font-size: 36rpx;
      color: #FFFFFF;
      margin-bottom: 16rpx;
      text-align: center; // 文本水平居中
      font-weight: bold;
    }
    
    .intro-text-2 {
      font-size: 48rpx;
      color: #FFFFFF;
      font-weight: bold;
      text-align: center; // 文本水平居中
    }
  }
  

  
  // 测试卡片
  .test-card {
    margin: 40rpx auto;
    width: 75%;
    height: 55vh;
    background-color: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(10px);
    border-radius: 48rpx;
    padding: 60rpx 50rpx;
    box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.1);
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    // 卡片背景渐变
    background: linear-gradient(to bottom right, rgb(255, 205, 205), rgb(255, 247, 247));
    
    // 问题文本
    .question-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      text-align: center;
      margin-bottom: 80rpx;
      
      .question-text {
        display: block;
        font-size: 42rpx;
        color: #C8647A;
        line-height: 1.6;
        margin-bottom: 20rpx;
        font-weight: 500;
      }
    }
    
    // 答案选项
    .options-section {
      flex: 2;
      display: flex;
      flex-direction: column;
      gap: 60rpx;
      margin-bottom: 80rpx;
      
      .option-btn {
        height: 120rpx;
        background-color: #FFF0F5;
        border-radius: 60rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 40rpx;
        
        text {
          font-size: 36rpx;
          color: #C8647A;
          text-align: center;
          line-height: 1.4;
        }
        
        &:active {
          opacity: 0.8;
          transform: scale(0.98);
        }
      }
    }
    
    // 回到上一题
    .prev-question {
      text-align: center;
      padding: 20rpx 0;
      
      text {
        font-size: 32rpx;
        color: #DDA0AF;
      }
      
      &:active {
        opacity: 0.8;
      }
      
      &.prev-disabled {
        opacity: 0.5;
        pointer-events: none;
      }
    }
  }
  
  // iOS Home Indicator
  .home-indicator {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    
    .indicator-line {
      width: 140rpx;
      height: 10rpx;
      background-color: #000000;
      border-radius: 5rpx;
    }
  }
}
</style>