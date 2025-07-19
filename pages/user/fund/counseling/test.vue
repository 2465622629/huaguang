<template>
  <view class="counseling-test-page" :style="{ backgroundImage: `url('${config.staticBaseUrl}/bg6.png')` }">
   
    
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
      <!-- 加载状态 -->
      <view v-if="isLoadingQuestions" class="loading-section">
        <view class="loading-spinner"></view>
        <text class="loading-text">正在加载测试问题...</text>
      </view>
      
      <!-- 测试内容 -->
      <template v-else-if="questions.length > 0 && currentQuestion">
        <!-- 进度指示器 -->
        <view class="progress-section">
          <view class="progress-bar">
            <view
              class="progress-fill"
              :style="{ width: ((currentQuestionIndex + 1) / questions.length * 100) + '%' }"
            ></view>
          </view>
          <text class="progress-text">{{ currentQuestionIndex + 1 }} / {{ questions.length }}</text>
        </view>
        
        <!-- 问题文本 - {{ AURA-X: Modify - 添加分组标题显示 }} -->
        <view class="question-section">
          <!-- 显示当前分组标题 -->
          <view v-if="currentSectionHeader" class="section-header">
            <text class="section-title">{{ currentSectionHeader.title }}</text>
            <text v-if="currentSectionHeader.description" class="section-description">{{ currentSectionHeader.description }}</text>
          </view>
          
          <!-- 问题文本 -->
          <view v-for="(line, index) in currentQuestion.question.split('\n')" :key="index" class="question-line">
            <text class="question-text">{{ line }}</text>
          </view>
        </view>
        
        <!-- 答案选项 -->
        <scroll-view scroll-y class="options-section" :show-scrollbar="false">
          <view class="options-container">
            <view
              v-for="(option, index) in currentQuestion.options"
              :key="index"
              class="option-btn"
              :class="{ 
                'option-selected': currentQuestion.type === 'multiple_choice' 
                  ? (Array.isArray(answers[currentQuestionIndex]) && answers[currentQuestionIndex].includes(option.value))
                  : answers[currentQuestionIndex] === option.value 
              }"
              @click="selectAnswer(option.value)"
            >
             
              <text>{{ option.text }}</text>
            </view>
          </view>
        </scroll-view>
        
        <!-- 导航按钮 -->
        <view class="navigation-section">
          <view
            class="prev-question"
            :class="{'prev-disabled': isFirstQuestion}"
            @click="goToPrevQuestion"
          >
            <text>回到上一题</text>
          </view>
          
          <!-- {{ AURA-X: Modify - 简化条件判断，确保下一题按钮正确显示 }} -->
          <view 
            v-if="!isLastQuestion" 
            class="next-btn" 
            :class="{ 'btn-disabled': !hasAnsweredCurrentQuestion }"
            @click="goToNextQuestion"
          >
            <text>下一题</text>
          </view>
          
          <view v-if="isLastQuestion && hasAnsweredCurrentQuestion" class="finish-btn" @click="finishTest">
            <text>完成测试</text>
          </view>
          
          <!-- 调试信息暂时移除 -->
          <!-- <view class="debug-info">
            <text>调试信息</text>
          </view> -->
        </view>
      </template>
      
      <!-- 错误状态 -->
      <view v-else class="error-section">
        <text class="error-text">加载测试失败</text>
        <view class="retry-btn" @click="loadTestQuestions">
          <text>重试</text>
        </view>
      </view>
    </view>
    
    <!-- iOS Home Indicator -->
    <!-- <view class="home-indicator">
      <view class="indicator-line"></view>
    </view> -->
  </view>
</template>

<script>
import config from '@/config/index.js'
// {{ AURA-X: Modify - 使用心理测试模块的API }}
import { getTestDetail, submitTest } from '@/api/modules/psychological-tests.js'

export default {
  name: 'PsychologicalTestPage',
  data() {
    return {
      config,
      currentQuestionIndex: 0,
      answers: [],
      counselor: null, // 咨询师信息
      
      // API数据 - {{ AURA-X: Modify - 使用固定testId为1 }}
      testId: 1, // 心理测试ID
      testSession: null, // 测试会话信息
      testDetail: null,
      questions: [], // 过滤后的实际答题问题（不包含section_header）
      allQuestions: [], // 原始问题列表（包含section_header）
      
      // 企业级状态管理
      isLoading: false,
      isSubmitting: false,
      isLoadingQuestions: true,
      
      // 智能缓存系统
      cacheKey: 'psychological_test_progress',
      cacheExpiry: 30 * 60 * 1000, // 30分钟缓存
      
      // 测试计时
      testStartTime: null,
      testDuration: 0,
      
      // 重试机制配置
      retryConfig: {
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 8000,
        backoffFactor: 2
      },
      
      // 错误处理状态
      errorState: {
        hasError: false,
        errorType: '',
        errorMessage: '',
        canRetry: false
      },
      
      // 默认问题数据（作为降级方案）
      defaultQuestions: [
        {
          id: '1',
          question: '最近一周，你出现以下情绪的频率是？\n烦躁易怒',
          options: [
            { value: 1, text: '经常' },
            { value: 2, text: '偶尔' },
            { value: 3, text: '很少' }
          ],
          type: 'single_choice',
          required: true
        },
        {
          id: '2',
          question: '最近一周，你出现以下情绪的频率是？\n情绪低落',
          options: [
            { value: 1, text: '经常' },
            { value: 2, text: '偶尔' },
            { value: 3, text: '很少' }
          ],
          type: 'single_choice',
          required: true
        },
        {
          id: '3',
          question: '最近一周，你出现以下情绪的频率是？\n焦虑不安',
          options: [
            { value: 1, text: '经常' },
            { value: 2, text: '偶尔' },
            { value: 3, text: '很少' }
          ],
          type: 'single_choice',
          required: true
        },
        {
          id: '4',
          question: '最近一周，你出现以下情绪的频率是？\n愉悦平静',
          options: [
            { value: 1, text: '经常' },
            { value: 2, text: '偶尔' },
            { value: 3, text: '很少' }
          ],
          type: 'single_choice',
          required: true
        },
        {
          id: '5',
          question: '这些情绪是否影响你的日常生活？',
          options: [
            { value: 1, text: '严重影响' },
            { value: 2, text: '有些影响' },
            { value: 3, text: '几乎不影响' }
          ],
          type: 'single_choice',
          required: true
        },
        {
          id: '6',
          question: '你当前的压力主要来自？',
          options: [
            { value: 1, text: '工作/学业' },
            { value: 2, text: '经济问题' },
            { value: 3, text: '人际关系' },
            { value: 4, text: '家庭关系' },
            { value: 5, text: '健康问题' },
            { value: 6, text: '未来规划' },
            { value: 7, text: '其他' }
          ],
          type: 'multiple_choice',
          required: true
        },
        {
          id: '7',
          question: '面对压力时，你通常如何应对？',
          options: [
            { value: 1, text: '独自消化' },
            { value: 2, text: '向亲友倾诉' },
            { value: 3, text: '运动/娱乐' },
            { value: 4, text: '逃避拖延' },
            { value: 5, text: '寻求专业帮助' },
            { value: 6, text: '其他' }
          ],
          type: 'single_choice',
          required: true
        },
        {
          id: '8',
          question: '最近是否经常出现失眠/早醒？',
          options: [
            { value: 1, text: '是' },
            { value: 2, text: '否' }
          ],
          type: 'single_choice',
          required: true
        },
        {
          id: '9',
          question: '最近是否经常出现食欲异常（暴食/没胃口）？',
          options: [
            { value: 1, text: '是' },
            { value: 2, text: '否' }
          ],
          type: 'single_choice',
          required: true
        },
        {
          id: '10',
          question: '最近是否经常出现身体疲惫（无明确原因）？',
          options: [
            { value: 1, text: '是' },
            { value: 2, text: '否' }
          ],
          type: 'single_choice',
          required: true
        },
        {
          id: '11',
          question: '近期社交意愿如何？',
          options: [
            { value: 1, text: '主动联系他人' },
            { value: 2, text: '等人联系我' },
            { value: 3, text: '不想接触任何人' }
          ],
          type: 'single_choice',
          required: true
        },
        {
          id: '12',
          question: '和他人相处时，你更常感到：',
          options: [
            { value: 1, text: '放松愉快' },
            { value: 2, text: '疲惫勉强' },
            { value: 3, text: '无所谓' }
          ],
          type: 'single_choice',
          required: true
        },
        {
          id: '13',
          question: '你希望获得哪方面的支持？',
          options: [
            { value: 1, text: '情绪调节' },
            { value: 2, text: '压力管理' },
            { value: 3, text: '人际关系指导' },
            { value: 4, text: '自我认知' },
            { value: 5, text: '其他' }
          ],
          type: 'multiple_choice',
          required: true
        }
      ]
    }
  },
      async onLoad(options) {
    // {{ AURA-X: Modify - 支持传递testId但默认使用1 }}
    if (options.testId) {
      this.testId = parseInt(options.testId) || 1
    }
    
    // 获取上一页面传递的咨询师数据
    const eventChannel = this.getOpenerEventChannel()
    if (eventChannel) {
      eventChannel.on('counselorData', (data) => {
        this.counselor = data.counselor
      })
    }
    
    // 初始化测试
    await this.initializeTest()
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
    },
    // {{ AURA-X: Modify - 增强答题状态检查，支持更多题型 }}
    hasAnsweredCurrentQuestion() {
      if (!this.currentQuestion || this.currentQuestionIndex < 0) {
        return false
      }
      
      const answer = this.answers[this.currentQuestionIndex]
      const questionType = this.currentQuestion.type
      
      switch (questionType) {
        case 'multiple_choice':
          return Array.isArray(answer) && answer.length > 0
        case 'text_input':
          return typeof answer === 'string' && answer.trim().length > 0
        case 'scale':
          return typeof answer === 'number' && answer > 0
        case 'single_choice':
        case 'yes_no':
        default:
          return answer !== null && answer !== undefined && answer !== ''
      }
    },
    // {{ AURA-X: Add - 获取当前题目对应的分组标题 }}
    currentSectionHeader() {
      if (!this.currentQuestion || !this.allQuestions.length) return null
      
      const currentQuestionId = this.currentQuestion.id
      
      // 在原始问题列表中找到当前问题的位置
      const currentIndex = this.allQuestions.findIndex(q => q.id === currentQuestionId)
      if (currentIndex === -1) return null
      
      // 往前查找最近的section_header
      for (let i = currentIndex - 1; i >= 0; i--) {
        if (this.allQuestions[i].type === 'section_header') {
          return this.allQuestions[i]
        }
      }
      
      return null
    }
  },
  methods: {
    // 页面导航
    goBack() {
      // 保存测试进度
      this.saveTestProgress()
      uni.navigateBack()
    },

    // 测试初始化 - 企业级优化版本
    async initializeTest() {
      this.testStartTime = Date.now()
      
      // 尝试加载缓存的测试进度
      this.loadTestProgress()
      
      // 加载测试问题
      await this.loadTestQuestions()
    },

    // 加载测试问题 - {{ AURA-X: Modify - 使用新的API和数据结构 }}
    async loadTestQuestions() {
      this.isLoadingQuestions = true
      this.errorState.hasError = false

      try {
        console.log('开始加载心理测试问题, testId:', this.testId)
        
        // 使用智能重试机制获取测试详情
        const response = await this.callApiWithRetry(async () => {
          return await getTestDetail(this.testId)
        })

        if (response && response.data) {
          this.testDetail = response.data
          this.allQuestions = response.data.questions || []
          
          // 过滤掉section_header类型的题目，只保留需要回答的题目
          this.questions = this.filterAnswerableQuestions(this.allQuestions)
          
          // 初始化答案数组
          this.answers = new Array(this.questions.length).fill(null)
          
          console.log('心理测试问题加载成功:', this.allQuestions.length, '个原始问题,', this.questions.length, '个答题问题')
          
          // 缓存测试数据
          this.setCachedTestData(response.data)
          
        } else {
          throw new Error('测试数据格式错误')
        }

      } catch (error) {
        console.warn('API加载失败，尝试缓存和降级方案:', error)
        
        // 尝试获取缓存数据
        const cachedData = this.getCachedTestData()
        if (cachedData && cachedData.questions) {
          console.log('使用缓存的测试数据')
          this.testDetail = cachedData
          this.allQuestions = cachedData.questions
          this.questions = this.filterAnswerableQuestions(this.allQuestions)
          this.answers = new Array(this.questions.length).fill(null)
        } else {
          console.log('使用默认问题作为降级方案')
          // 使用默认问题作为最终降级方案
          this.questions = this.defaultQuestions
          this.allQuestions = this.defaultQuestions
          this.answers = new Array(this.questions.length).fill(null)
          this.testDetail = {
            id: this.testId,
            name: '心理健康评估',
            description: '了解您的心理状态',
            questions: this.defaultQuestions
          }
        }

        const { errorMessage } = this.handleApiError(error)
        
        // 显示降级提示
        uni.showToast({
          title: errorMessage.includes('网络') ? '网络异常，已加载离线版本' : '已加载离线版本',
          icon: 'none',
          duration: 2000
        })
      } finally {
        this.isLoadingQuestions = false
      }
    },

    // {{ AURA-X: Add - 过滤可回答的问题，排除section_header }}
    filterAnswerableQuestions(allQuestions) {
      if (!Array.isArray(allQuestions)) {
        console.warn('filterAnswerableQuestions: 输入不是数组')
        return []
      }
      
      return allQuestions.filter(q => {
        // 过滤掉空对象和section_header类型
        return q && typeof q === 'object' && q.type !== 'section_header'
      }).map((q, index) => {
        // 数据验证和默认值设置
        const question = {
          id: q.id || `q_${index + 1}`,
          question: q.question || q.title || `问题 ${index + 1}`,
          options: this.formatOptions(q.options || []),
          type: this.validateQuestionType(q.type) || 'single_choice',
          required: q.required !== false,
          category: q.category || 'general',
          originalIndex: allQuestions.indexOf(q)
        }
        
        // 验证选项是否有效
        if (question.options.length === 0) {
          console.warn(`问题 ${question.id} 没有有效选项`)
          // 提供默认选项
          question.options = [
            { value: 'yes', text: '是', score: 1 },
            { value: 'no', text: '否', score: 0 }
          ]
          question.type = 'yes_no'
        }
        
        return question
      })
    },

    // 格式化问题数据（保留原方法作为兼容）
    formatQuestions(apiQuestions) {
      return apiQuestions.map((q, index) => ({
        id: q.id || `q_${index + 1}`,
        question: q.question || q.title,
        options: this.formatOptions(q.options || []),
        type: q.type || 'single_choice',
        required: q.required !== false,
        category: q.category || 'general'
      }))
    },

    // {{ AURA-X: Add - 验证问题类型的有效性 }}
    validateQuestionType(type) {
      const validTypes = ['single_choice', 'multiple_choice', 'yes_no', 'text_input', 'scale']
      return validTypes.includes(type) ? type : null
    },

    // 格式化选项数据 - {{ AURA-X: Modify - 支持新的选项格式并增强验证 }}
    formatOptions(apiOptions) {
      if (!Array.isArray(apiOptions)) {
        console.warn('formatOptions: 选项不是数组格式')
        return []
      }
      
      return apiOptions.filter(opt => opt != null).map((opt, index) => {
        // 处理不同格式的选项数据
        if (typeof opt === 'string') {
          return {
            value: index + 1,
            text: opt,
            score: 0,
            hasInput: false
          }
        }
        
        if (typeof opt === 'object') {
          return {
            value: opt.value || opt.id || (index + 1),
            text: opt.text || opt.label || opt.title || `选项 ${index + 1}`,
            score: typeof opt.score === 'number' ? opt.score : 0,
            hasInput: Boolean(opt.has_input || opt.hasInput)
          }
        }
        
        // 默认选项格式
        return {
          value: index + 1,
          text: `选项 ${index + 1}`,
          score: 0,
          hasInput: false
        }
      })
    },

    // 智能缓存系统
    setCachedTestData(data) {
      try {
        const cacheItem = {
          data: data,
          timestamp: Date.now(),
          expiry: this.cacheExpiry
        }
        uni.setStorageSync(`test_data_${this.testId}`, JSON.stringify(cacheItem))
      } catch (error) {
        console.warn('测试数据缓存失败:', error)
      }
    },

    getCachedTestData() {
      try {
        const cacheStr = uni.getStorageSync(`test_data_${this.testId}`)
        if (cacheStr) {
          const cacheItem = JSON.parse(cacheStr)
          const isExpired = Date.now() - cacheItem.timestamp > cacheItem.expiry
          
          if (!isExpired) {
            return cacheItem.data
          } else {
            // 清除过期缓存
            uni.removeStorageSync(`test_data_${this.testId}`)
          }
        }
      } catch (error) {
        console.warn('获取缓存测试数据失败:', error)
      }
      return null
    },

    saveTestProgress() {
      try {
        const progressData = {
          testId: this.testId,
          currentQuestionIndex: this.currentQuestionIndex,
          answers: this.answers,
          testStartTime: this.testStartTime,
          timestamp: Date.now()
        }
        uni.setStorageSync(this.cacheKey, JSON.stringify(progressData))
      } catch (error) {
        console.warn('测试进度保存失败:', error)
      }
    },

    loadTestProgress() {
      try {
        const progressStr = uni.getStorageSync(this.cacheKey)
        if (progressStr) {
          const progressData = JSON.parse(progressStr)
          const isExpired = Date.now() - progressData.timestamp > this.cacheExpiry
          
          if (!isExpired && progressData.testId === this.testId) {
            this.currentQuestionIndex = progressData.currentQuestionIndex || 0
            this.answers = progressData.answers || []
            this.testStartTime = progressData.testStartTime || Date.now()
            
            if (this.currentQuestionIndex > 0) {
              uni.showModal({
                title: '恢复测试进度',
                content: `检测到未完成的测试，是否继续？当前进度：${this.currentQuestionIndex + 1}/${this.questions.length || 13}`,
                confirmText: '继续',
                cancelText: '重新开始',
                success: (res) => {
                  if (!res.confirm) {
                    this.resetTest()
                  }
                }
              })
            }
          }
        }
      } catch (error) {
        console.warn('测试进度加载失败:', error)
      }
    },

    clearTestProgress() {
      try {
        uni.removeStorageSync(this.cacheKey)
        uni.removeStorageSync(`test_data_${this.testId}`)
      } catch (error) {
        console.warn('清除测试进度失败:', error)
      }
    },

    resetTest() {
      this.currentQuestionIndex = 0
      this.answers = new Array(this.questions.length).fill(null)
      this.testStartTime = Date.now()
      this.clearTestProgress()
    },

    // 答题逻辑 - {{ AURA-X: Modify - 增强验证和错误处理 }}
    selectAnswer(optionValue) {
      const currentQ = this.currentQuestion
      
      // 基础验证
      if (!currentQ) {
        console.error('selectAnswer: 当前问题不存在')
        return
      }
      
      if (optionValue == null) {
        console.error('selectAnswer: 选项值无效')
        return
      }
      
      // 验证选项是否有效
      const validOption = currentQ.options.find(opt => opt.value === optionValue)
      if (!validOption) {
        console.error('selectAnswer: 选项值不在有效范围内', optionValue)
        return
      }
      
      console.log('选择答案:', optionValue, '题目类型:', currentQ.type)
      
      try {
        if (currentQ.type === 'multiple_choice') {
          // 多选题处理 - 使用响应式方法
          let answerArray = this.answers[this.currentQuestionIndex]
          if (!Array.isArray(answerArray)) {
            answerArray = []
          }
          
          const index = answerArray.indexOf(optionValue)
          
          if (index > -1) {
            answerArray.splice(index, 1) // 取消选择
            console.log('取消选择:', optionValue, '当前答案:', answerArray)
          } else {
            answerArray.push(optionValue) // 添加选择
            console.log('添加选择:', optionValue, '当前答案:', answerArray)
          }
          
          // 使用Vue.set确保响应式更新
          this.$set(this.answers, this.currentQuestionIndex, [...answerArray])
        } else {
          // 单选题处理 (包括 yes_no 类型)
          this.$set(this.answers, this.currentQuestionIndex, optionValue)
          console.log('单选答案:', optionValue)
        }
        
        // 实时保存进度
        this.saveTestProgress()
        
        // 单选题和yes_no题自动前进到下一题
        if ((currentQ.type === 'single_choice' || currentQ.type === 'yes_no') && !this.isLastQuestion) {
          setTimeout(() => {
            this.currentQuestionIndex++
          }, 300) // 短暂延迟提供视觉反馈
        }
        
      } catch (error) {
        console.error('selectAnswer: 答题处理失败', error)
        uni.showToast({
          title: '答题失败，请重试',
          icon: 'none',
          duration: 1500
        })
      }
    },

    goToPrevQuestion() {
      if (!this.isFirstQuestion) {
        this.currentQuestionIndex--
        // 保存进度
        this.saveTestProgress()
      }
    },

    // {{ AURA-X: Add - 添加下一题方法，解决多选题无法前进问题 }}
    goToNextQuestion() {
      // 检查是否已回答当前题目
      if (!this.hasAnsweredCurrentQuestion) {
        uni.showToast({
          title: '请先回答当前问题',
          icon: 'none',
          duration: 1500
        })
        return
      }
      
      if (!this.isLastQuestion) {
        this.currentQuestionIndex++
        // 保存进度
        this.saveTestProgress()
      }
    },

    // 智能指数退避重试机制
    async callApiWithRetry(apiCall, retryCount = 0) {
      try {
        return await apiCall()
      } catch (error) {
        if (retryCount < this.retryConfig.maxRetries) {
          const delay = Math.min(
            this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffFactor, retryCount) +
            Math.random() * 1000, // 随机抖动避免雷群效应
            this.retryConfig.maxDelay
          )
          
          console.log(`API调用失败，${delay}ms后进行第${retryCount + 1}次重试`)
          await new Promise(resolve => setTimeout(resolve, delay))
          return this.callApiWithRetry(apiCall, retryCount + 1)
        }
        throw error
      }
    },

    // 企业级错误分类和处理
    handleApiError(error) {
      let errorType = 'unknown'
      let errorMessage = '加载失败，请稍后重试'
      let canRetry = true

      // 根据错误类型分类处理
      if (error.code || error.status) {
        const code = error.code || error.status
        switch (code) {
          case 'NETWORK_ERROR':
          case 'TIMEOUT':
          case 'ERR_NETWORK':
            errorType = 'network'
            errorMessage = '网络连接异常，已加载离线版本'
            break
          case 401:
          case 'AUTH_ERROR':
          case 'UNAUTHORIZED':
            errorType = 'auth'
            errorMessage = '登录已过期，请重新登录'
            canRetry = false
            break
          case 403:
          case 'FORBIDDEN':
            errorType = 'permission'
            errorMessage = '访问权限不足'
            canRetry = false
            break
          case 404:
          case 'NOT_FOUND':
            errorType = 'not_found'
            errorMessage = '测试不存在或已下线'
            canRetry = false
            break
          case 500:
          case 502:
          case 503:
          case 'SERVER_ERROR':
            errorType = 'server'
            errorMessage = '服务器繁忙，已加载离线版本'
            break
          default:
            errorMessage = error.message || error.msg || errorMessage
        }
      } else if (error.message) {
        errorMessage = error.message
      }

      this.errorState = {
        hasError: true,
        errorType,
        errorMessage,
        canRetry
      }

      return { errorType, errorMessage, canRetry }
    },

    // 完成测试 - 企业级提交机制
    async finishTest() {
      if (this.isSubmitting) return

      // 验证所有必填题是否已回答
      const unansweredRequired = this.questions.filter((q, index) => 
        q.required && (this.answers[index] === null || this.answers[index] === undefined)
      )

      if (unansweredRequired.length > 0) {
        uni.showModal({
          title: '测试未完成',
          content: `还有 ${unansweredRequired.length} 道必答题未完成，是否继续？`,
          confirmText: '继续答题',
          cancelText: '强制提交',
          success: (res) => {
            if (res.confirm) {
              // 跳转到第一个未回答的题目
              const firstUnanswered = this.questions.findIndex((q, index) => 
                q.required && (this.answers[index] === null || this.answers[index] === undefined)
              )
              if (firstUnanswered !== -1) {
                this.currentQuestionIndex = firstUnanswered
              }
            } else {
              this.submitTest()
            }
          }
        })
        return
      }

      await this.submitTest()
    },

    // 提交测试
    async submitTest() {
      this.isSubmitting = true
      this.testDuration = Math.floor((Date.now() - this.testStartTime) / 1000)

      try {
        // 显示提交提示
        uni.showLoading({
          title: '分析中...',
          mask: true
        })

        // 构建提交数据 - {{ AURA-X: Modify - 按照API文档格式 }}
        const submitData = {
          testId: this.testId,
          answers: this.formatAnswersForSubmission(),
          timeSpentSeconds: this.testDuration
        }

        let testResult = null

        try {
          console.log('提交心理测试结果:', submitData)
          
          // 使用心理测试模块API提交
          const response = await this.callApiWithRetry(async () => {
            return await submitTest(submitData)
          })
          
          testResult = response.data || response
          console.log('测试结果提交成功:', testResult)
          
          // 缓存测试结果
          this.cacheTestResult(testResult)
          
        } catch (error) {
          console.warn('服务器提交失败，使用本地计算:', error)
          // 使用本地计算作为降级方案
          testResult = this.calculateLocalTestResult()
          
          // 标记为本地计算结果
          testResult.isLocalCalculation = true
          testResult.needsManualReview = true
        }

        uni.hideLoading()

        // 清除测试进度缓存
        this.clearTestProgress()

        // 显示结果提示
        this.showTestResult(testResult)

      } catch (error) {
        console.error('测试完成处理失败:', error)
        uni.hideLoading()
        
        const { errorMessage } = this.handleApiError(error)
        
        uni.showModal({
          title: '提交失败',
          content: `${errorMessage}，是否重试？`,
          confirmText: '重试',
          cancelText: '继续',
          success: (res) => {
            if (res.confirm) {
              setTimeout(() => this.submitTest(), 1000)
            } else {
              // 使用本地结果继续
              const localResult = this.calculateLocalTestResult()
              this.showTestResult(localResult)
            }
          }
        })
      } finally {
        this.isSubmitting = false
      }
    },

    // 格式化答案数据用于提交 - {{ AURA-X: Modify - 按照API文档要求格式化 }}
    formatAnswersForSubmission() {
      const answersMap = {}
      
      this.questions.forEach((question, index) => {
        const answer = this.answers[index]
        
        // 跳过未回答的题目
        if (answer === null || answer === undefined) {
          return
        }
        
        // 将答案映射到题目ID，格式：{ "questionId": "answer" }
        answersMap[question.id.toString()] = answer
      })
      
      return answersMap
    },

    // {{ AURA-X: Add - 获取答案对应的文本内容 }}
    getAnswerText(question, answer) {
      if (!question || !question.options) return ''
      
      if (question.type === 'multiple_choice' && Array.isArray(answer)) {
        return answer.map(value => {
          const option = question.options.find(opt => opt.value === value)
          return option ? option.text : value
        }).join(', ')
      } else {
        const option = question.options.find(opt => opt.value === answer)
        return option ? option.text : String(answer || '')
      }
    },

    // 计算完成率 - {{ AURA-X: Modify - 更精确的完成率计算 }}
    calculateCompletionRate() {
      if (this.questions.length === 0) return 0
      
      const answeredCount = this.answers.filter((answer, index) => {
        const question = this.questions[index]
        if (!question) return false
        
        // 根据题型判断是否已回答
        switch (question.type) {
          case 'multiple_choice':
            return Array.isArray(answer) && answer.length > 0
          case 'text_input':
            return typeof answer === 'string' && answer.trim().length > 0
          default:
            return answer !== null && answer !== undefined && answer !== ''
        }
      }).length
      
      return Math.round((answeredCount / this.questions.length) * 100)
    },

    // 获取设备信息
    getDeviceInfo() {
      const systemInfo = uni.getSystemInfoSync()
      return {
        platform: systemInfo.platform,
        version: systemInfo.version,
        model: systemInfo.model,
        pixelRatio: systemInfo.pixelRatio,
        windowWidth: systemInfo.windowWidth,
        windowHeight: systemInfo.windowHeight
      }
    },

    // 缓存测试结果
    cacheTestResult(result) {
      try {
        const cacheData = {
          result: result,
          timestamp: Date.now(),
          testId: this.testId
        }
        uni.setStorageSync(`test_result_${this.testId}`, JSON.stringify(cacheData))
      } catch (error) {
        console.warn('缓存测试结果失败:', error)
      }
    },

    // 本地测试结果计算（降级方案）
    calculateLocalTestResult() {
      const validAnswers = this.answers.filter(answer => 
        answer !== null && answer !== undefined
      )
      
      if (validAnswers.length === 0) {
        return {
          summary: '测试数据不完整',
          level: 'unknown',
          score: 0,
          recommendations: ['请重新完成测试'],
          isLocalCalculation: true
        }
      }

      // 计算平均分数（简化算法）
      const scores = validAnswers.map(answer => {
        if (Array.isArray(answer)) {
          return answer.length > 0 ? answer.reduce((a, b) => a + b, 0) / answer.length : 0
        }
        return typeof answer === 'number' ? answer : 0
      })

      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length
      const normalizedScore = Math.min(100, Math.max(0, avgScore * 20)) // 归一化到0-100

      let level, summary, recommendations

      if (normalizedScore <= 30) {
        level = 'high_risk'
        summary = '建议尽快寻求专业心理咨询'
        recommendations = [
          '建议尽快寻求专业心理咨询师帮助',
          '关注情绪变化，避免独处',
          '保持规律作息和饮食',
          '适当进行放松训练'
        ]
      } else if (normalizedScore <= 60) {
        level = 'medium_risk'
        summary = '建议适当寻求心理支持'
        recommendations = [
          '可以考虑心理咨询',
          '多与亲友交流分享',
          '保持规律作息',
          '适当进行运动锻炼',
          '学习压力管理技巧'
        ]
      } else {
        level = 'low_risk'
        summary = '心理状态相对良好'
        recommendations = [
          '继续保持良好状态',
          '适当关注心理健康',
          '定期进行自我评估',
          '保持良好的生活习惯',
          '维护社交关系'
        ]
      }

      return {
        // 兼容API格式的字段
        resultDescription: summary,
        resultLevel: level,
        score: Math.round(normalizedScore),
        scorePercentage: Math.round(normalizedScore),
        recommendations,
        timeSpentSeconds: this.testDuration,
        timeSpentFormatted: this.formatDuration(this.testDuration),
        // 本地计算标识
        isLocalCalculation: true,
        calculationMethod: 'simplified_average',
        completionRate: this.calculateCompletionRate()
      }
    },

    // 显示测试结果 - {{ AURA-X: Modify - 适配新的API响应格式 }}
    showTestResult(testResult) {
      let resultText = ''
      
      if (testResult.isLocalCalculation) {
        // 本地计算结果格式
        resultText = `${testResult.summary}\n\n评分: ${testResult.score} (离线计算)\n完成率: ${testResult.completionRate || this.calculateCompletionRate()}%`
      } else {
        // API返回的结果格式
        resultText = `${testResult.resultDescription || '测试完成'}\n\n等级: ${testResult.resultLevel || '未知'}\n评分: ${testResult.score || 0}分${testResult.scorePercentage ? ` (${testResult.scorePercentage}%)` : ''}\n用时: ${testResult.timeSpentFormatted || this.formatDuration(this.testDuration)}`
      }
      
      uni.showModal({
        title: '测试完成',
        content: resultText,
        showCancel: false,
        confirmText: '继续咨询',
        success: () => {
          this.navigateToConsultation(testResult)
        }
      })
    },

    // {{ AURA-X: Add - 格式化时长显示 }}
    formatDuration(seconds) {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes}分${remainingSeconds}秒`
    },

    // 导航到咨询页面
    navigateToConsultation(testResult) {
      if (!this.counselor) {
        // 如果没有咨询师信息，跳转到咨询师选择页面
        uni.navigateTo({
          url: '/pages/user/fund/counseling/index',
          success: (res) => {
            res.eventChannel.emit('testResultData', {
              testResult: testResult,
              answers: this.answers,
              testDuration: this.testDuration
            })
          }
        })
        return
      }
      
      // 跳转到聊天页面
      uni.navigateTo({
        url: '/pages/user/fund/counseling/chat',
        success: (res) => {
          // 传递测试结果和咨询师信息到聊天页面
          res.eventChannel.emit('counselData', {
            counselor: this.counselor,
            testResult: testResult,
            answers: this.answers,
            testDuration: this.testDuration
          })
        }
      })
    }
  },

  // 生命周期
  onUnload() {
    // 页面卸载时保存测试进度
    this.saveTestProgress()
  },
  
  onHide() {
    // 页面隐藏时保存测试进度
    this.saveTestProgress()
  }
}
</script>

<style lang="scss" scoped>
.counseling-test-page {
  min-height: 100vh;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
  position: relative;
  display: flex;
  flex-direction: column;
  // {{ AURA-X: Modify - 移除overflow:hidden以支持内部滚动 }}
  
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
    height: calc(100vh - 350rpx); // {{ AURA-X: Modify - 设置固定高度以支持内部滚动 }}
    max-height: 70vh;
    background-color: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(10px);
    border-radius: 48rpx;
    padding: 60rpx 50rpx;
    box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.1);
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    // 卡片背景渐变
    background: linear-gradient(to bottom right, rgb(255, 205, 205), rgb(255, 247, 247));
    
    // 加载状态
    .loading-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      
      .loading-spinner {
        width: 80rpx;
        height: 80rpx;
        border: 6rpx solid #F3F3F3;
        border-top: 6rpx solid #C8647A;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 40rpx;
      }
      
      .loading-text {
        font-size: 32rpx;
        color: #C8647A;
        text-align: center;
      }
    }
    
    // 进度指示器
    .progress-section {
      margin-bottom: 40rpx;
      
      .progress-bar {
        width: 100%;
        height: 8rpx;
        background-color: #F0F0F0;
        border-radius: 4rpx;
        overflow: hidden;
        margin-bottom: 20rpx;
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #C8647A, #E8A5B8);
          border-radius: 4rpx;
          transition: width 0.3s ease;
        }
      }
      
      .progress-text {
        font-size: 28rpx;
        color: #C8647A;
        text-align: center;
        display: block;
      }
    }
    
    // 问题文本 - {{ AURA-X: Modify - 添加分组标题样式 }}
    .question-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      text-align: center;
      margin-bottom: 60rpx;
      
      .section-header {
        margin-bottom: 30rpx;
        padding: 20rpx;
        background-color: rgba(200, 100, 122, 0.1);
        border-radius: 20rpx;
        
        .section-title {
          display: block;
          font-size: 38rpx;
          color: #C8647A;
          font-weight: bold;
          margin-bottom: 10rpx;
        }
        
        .section-description {
          display: block;
          font-size: 28rpx;
          color: #DDA0AF;
          line-height: 1.4;
        }
      }
      
      .question-text {
        display: block;
        font-size: 42rpx;
        color: #C8647A;
        line-height: 1.6;
        margin-bottom: 20rpx;
        font-weight: 500;
      }
    }
    
    // 答案选项 - {{ AURA-X: Modify - 添加滚动容器支持 }}
    .options-section {
      flex: 2;
      margin-bottom: 60rpx;
      max-height: 40vh; // 限制最大高度，超出时滚动
      
      .options-container {
        display: flex;
        flex-direction: column;
        gap: 40rpx;
        padding: 10rpx 0; // 上下留白，提升滚动体验
      }
      
      .option-btn {
        min-height: 100rpx;
        background-color: #FFF0F5;
        border-radius: 50rpx;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        padding: 20rpx 40rpx;
        border: 3rpx solid transparent;
        transition: all 0.3s ease;
        
        text {
          font-size: 32rpx;
          color: #C8647A;
          text-align: left;
          line-height: 1.4;
          flex: 1;
        }
        
        &.option-selected {
          background-color: #E8A5B8;
          border-color: #C8647A;
          
          text {
            color: #FFFFFF;
            font-weight: bold;
          }
        }
        
        &:active {
          opacity: 0.8;
          transform: scale(0.98);
        }
      }
    }
    
    // 导航区域
    .navigation-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .prev-question {
        padding: 20rpx 40rpx;
        
        text {
          font-size: 28rpx;
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
      
      // {{ AURA-X: Add - 添加下一题按钮样式 }}
      .next-btn {
        background-color: #C8647A;
        border-radius: 40rpx;
        padding: 20rpx 40rpx;
        transition: all 0.3s ease;
        
        text {
          font-size: 28rpx;
          color: #FFFFFF;
          font-weight: bold;
        }
        
        &:active {
          opacity: 0.8;
          transform: scale(0.98);
        }
        
        &.btn-disabled {
          background-color: #DDA0AF;
          opacity: 0.6;
          
          text {
            color: rgba(255, 255, 255, 0.7);
          }
        }
      }
      
      .finish-btn {
        background-color: #C8647A;
        border-radius: 40rpx;
        padding: 20rpx 40rpx;
        
        text {
          font-size: 28rpx;
          color: #FFFFFF;
          font-weight: bold;
        }
        
        &:active {
          opacity: 0.8;
          transform: scale(0.98);
        }
      }
    }
    
    // 错误状态
    .error-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      
      .error-text {
        font-size: 32rpx;
        color: #C8647A;
        text-align: center;
        margin-bottom: 40rpx;
      }
      
      .retry-btn {
        background-color: #C8647A;
        border-radius: 40rpx;
        padding: 20rpx 40rpx;
        
        text {
          font-size: 28rpx;
          color: #FFFFFF;
          font-weight: bold;
        }
        
        &:active {
          opacity: 0.8;
          transform: scale(0.98);
        }
      }
    }
  }
  
  // 加载动画
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
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