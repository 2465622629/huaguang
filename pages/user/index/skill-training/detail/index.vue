<template>
  <view class="skill-detail-container" :style="{ backgroundImage: 'url(' + config.staticBaseUrl + '/bg3.png)' }">
    <!-- 自定义导航栏 -->
    <uv-navbar 
      :background="{ background: 'transparent' }"
      left-icon="arrow-left"
      left-text=""
      title="课程详情"
      title-color="#FFFFFF"
      @left-click="goBack"
      placeholder
    ></uv-navbar>

    <!-- 页面内容 -->
    <scroll-view 
      class="page-content" 
      scroll-y="true"
      style="flex: 1; height: auto;"
      :refresher-enabled="true"
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
    >
      <!-- 横幅插画区域 -->
      <view class="banner-section">
        <image 
          class="banner-image" 
          :src="courseInfo.thumbnail || config.staticBaseUrl + '/skill.png'" 
          mode="aspectFill"
          @error="onImageError"
        ></image>
        
        <!-- 价格信息 -->
        <view v-if="courseInfo.price !== undefined" class="price-overlay">
          <view v-if="courseInfo.price > 0" class="price-tag">
            <text class="price">¥{{ courseInfo.price }}</text>
            <text v-if="courseInfo.originalPrice > courseInfo.price" class="original-price">¥{{ courseInfo.originalPrice }}</text>
          </view>
          <view v-else class="free-tag">免费</view>
        </view>
        
        <!-- 时长信息 -->
        <view v-if="courseInfo.duration" class="duration-overlay">
          <uv-icon name="clock" size="24" color="#FFFFFF"></uv-icon>
          <text class="duration-text">{{ courseInfo.duration }}</text>
        </view>
      </view>

      <!-- 加载状态 -->
      <view v-if="isLoading && !courseInfo.title" class="loading-section">
        <uv-loading-icon mode="flower" size="60"></uv-loading-icon>
        <text class="loading-text">正在加载课程详情...</text>
      </view>

      <!-- 错误状态 -->
      <view v-else-if="errorState.hasError && !courseInfo.title" class="error-section">
        <uv-icon name="wifi-off" size="120" color="#cccccc"></uv-icon>
        <text class="error-text">{{ errorState.errorMessage }}</text>
        <uv-button 
          v-if="errorState.canRetry"
          text="重试" 
          type="primary" 
          size="small"
          @click="retryLoad"
          :loading="isLoading"
          class="retry-button"
        />
      </view>

      <!-- 课程内容 -->
      <view v-else class="course-content">
        <!-- 课程标题区域 -->
        <view class="course-title-section">
          <text class="course-title">{{ courseInfo.title || '课程标题' }}</text>
          
          <!-- 课程标签 -->
          <view v-if="courseInfo.category || courseInfo.level || courseInfo.tags" class="course-tags">
            <text v-if="courseInfo.category" class="course-tag">{{ courseInfo.category }}</text>
            <text v-if="courseInfo.level" class="course-tag level-tag">{{ courseInfo.level }}</text>
            <text v-for="tag in (courseInfo.tags || [])" :key="tag" class="course-tag">{{ tag }}</text>
          </view>
          
          <!-- 评分信息 -->
          <view v-if="courseInfo.rating > 0" class="rating-section">
            <view class="stars">
              <uv-icon 
                v-for="star in 5" 
                :key="star"
                name="star-fill" 
                size="28" 
                :color="star <= Math.floor(courseInfo.rating) ? '#FFB020' : '#E0E0E0'"
              ></uv-icon>
            </view>
            <text class="rating-text">{{ courseInfo.rating.toFixed(1) }}</text>
            <text class="rating-count">({{ courseInfo.reviewCount || 0 }}人评价)</text>
          </view>
        </view>

        <!-- 统计数据区域 -->
        <view class="statistics-section">
          <view class="stat-item">
            <uv-icon name="eye" size="32" color="#1890ff"></uv-icon>
            <text class="stat-text">{{ formatViewCount(courseInfo.viewCount) }}次观看</text>
          </view>
          <view class="stat-right-group">
            <view class="stat-item" @click="toggleFavorite">
              <uv-icon
                :name="courseInfo.isFavorited ? 'heart-fill' : 'heart'"
                size="32"
                :color="courseInfo.isFavorited ? '#FF4D4F' : '#888888'"
              ></uv-icon>
              <text class="stat-text">{{ courseInfo.favoriteCount || 0 }}</text>
            </view>
            <view class="stat-item" @click="handleShare">
              <uv-icon name="share-fill" size="32" color="#52C41A"></uv-icon>
              <text class="stat-text">{{ courseInfo.shareCount || 0 }}</text>
            </view>
          </view>
        </view>

        <!-- 讲师信息区域 -->
        <view v-if="courseInfo.instructor" class="instructor-section">
          <text class="section-title">讲师介绍</text>
          <view class="instructor-info">
            <image
              v-if="courseInfo.instructor.avatar"
              class="instructor-avatar"
              :src="courseInfo.instructor.avatar"
              mode="aspectFill"
              @error="onInstructorImageError"
            ></image>
            <view v-else class="instructor-avatar-placeholder">
              <uv-icon name="account" size="48" color="#CCCCCC"></uv-icon>
            </view>
            <view class="instructor-details">
              <text class="instructor-name">{{ courseInfo.instructor.name || '未知讲师' }}</text>
              <text v-if="courseInfo.instructor.title" class="instructor-title">{{ courseInfo.instructor.title }}</text>
              <text v-if="courseInfo.instructor.experience" class="instructor-experience">{{ courseInfo.instructor.experience }}年经验</text>
              <view v-if="courseInfo.instructor.rating > 0" class="instructor-rating">
                <uv-icon name="star-fill" size="24" color="#FFB020"></uv-icon>
                <text class="instructor-rating-text">{{ courseInfo.instructor.rating.toFixed(1) }}</text>
              </view>
            </view>
          </view>
          <text v-if="courseInfo.instructor.bio" class="instructor-bio">{{ courseInfo.instructor.bio }}</text>
        </view>

        <!-- 课程简介区域 -->
        <view class="introduction-section">
          <text class="section-title">课程简介</text>
          <text class="intro-content">{{ courseInfo.introduction || courseInfo.description || '暂无课程简介' }}</text>
        </view>

        <!-- 课程信息区域 -->
        <view class="course-info-section">
          <text class="section-title">课程信息</text>
          <view class="info-grid">
            <view v-if="courseInfo.duration" class="info-item">
              <uv-icon name="clock" size="32" color="#1890ff"></uv-icon>
              <view class="info-content">
                <text class="info-label">课程时长</text>
                <text class="info-value">{{ courseInfo.duration }}</text>
              </view>
            </view>
            <view v-if="courseInfo.difficulty" class="info-item">
              <uv-icon name="bookmark" size="32" color="#52C41A"></uv-icon>
              <view class="info-content">
                <text class="info-label">难度等级</text>
                <text class="info-value">{{ courseInfo.difficulty }}</text>
              </view>
            </view>
            <view v-if="courseInfo.language" class="info-item">
              <uv-icon name="chat" size="32" color="#FA8C16"></uv-icon>
              <view class="info-content">
                <text class="info-label">授课语言</text>
                <text class="info-value">{{ courseInfo.language }}</text>
              </view>
            </view>
            <view v-if="courseInfo.updateTime" class="info-item">
              <uv-icon name="calendar" size="32" color="#722ED1"></uv-icon>
              <view class="info-content">
                <text class="info-label">更新时间</text>
                <text class="info-value">{{ formatDate(courseInfo.updateTime) }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import config from '@/config/index.js'

export default {
  name: 'SkillTrainingDetail',
  data() {
    return {
      config,
      isRefreshing: false,
      isLoading: false,
      errorState: {
        hasError: false,
        errorMessage: '',
        canRetry: false
      },
      courseInfo: {
        title: '',
        thumbnail: '',
        price: 0,
        originalPrice: 0,
        duration: '',
        rating: 0,
        reviewCount: 0,
        viewCount: 0,
        favoriteCount: 0,
        shareCount: 0,
        isFavorited: false,
        category: '',
        level: '',
        tags: [],
        instructor: null,
        introduction: '',
        description: '',
        difficulty: '',
        language: '',
        updateTime: ''
      }
    }
  },
  onLoad(options) {
    console.log('课程详情页加载参数:', options)
    this.initializePage()
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    
    initializePage() {
      this.loadCourseData()
    },
    
    async loadCourseData() {
      this.isLoading = true;
      this.errorState.hasError = false;
      try {
        console.log('加载课程数据');
        // 模拟数据加载
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.courseInfo = {
          title: '技能训练课程',
          description: '这是一个技能训练课程的详细介绍...',
          duration: '2小时30分钟',
          rating: 4.5,
          reviewCount: 128,
          viewCount: 1520,
          favoriteCount: 85,
          shareCount: 32,
          isFavorited: false,
          category: '职业技能',
          level: '初级',
          tags: ['实用', '热门'],
          difficulty: '初级',
          language: '中文',
          updateTime: new Date().toISOString()
        };
      } catch (error) {
        console.error('加载课程数据失败:', error);
        this.errorState = {
          hasError: true,
          errorMessage: '加载失败，请稍后重试',
          canRetry: true
        };
      } finally {
        this.isLoading = false;
      }
    },
    
    async onRefresh() {
      this.isRefreshing = true;
      try {
        await this.loadCourseData();
      } finally {
        this.isRefreshing = false;
      }
    },
    
    retryLoad() {
      this.errorState.hasError = false
      this.loadCourseData()
    },
    
    onImageError() {
      console.log('图片加载失败')
    },
    
    onInstructorImageError() {
      console.log('讲师头像加载失败')
    },
    
    formatViewCount(count) {
      if (!count) return '0'
      if (count >= 10000) {
        return (count / 10000).toFixed(1) + '万'
      }
      if (count >= 1000) {
        return (count / 1000).toFixed(1) + 'k'
      }
      return count.toString()
    },
    
    toggleFavorite() {
      this.courseInfo.isFavorited = !this.courseInfo.isFavorited
      if (this.courseInfo.isFavorited) {
        this.courseInfo.favoriteCount++
      } else {
        this.courseInfo.favoriteCount--
      }
    },
    
    handleShare() {
      console.log('分享课程')
    },
    
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
  }
}
</script>

<style lang="scss" scoped>
.skill-detail-container {
  width: 100%;
  height: 100vh;
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
}

.page-content {
  flex: 1;
}

.banner-section {
  position: relative;
  height: 200px;
  margin: 20px;
  border-radius: 12px;
  overflow: hidden;
  
  .banner-image {
    width: 100%;
    height: 100%;
  }
  
  .price-overlay {
    position: absolute;
    top: 15px;
    right: 15px;
    
    .price-tag {
      background-color: rgba(255, 0, 0, 0.8);
      color: #FFFFFF;
      padding: 4px 8px;
      border-radius: 4px;
      
      .price {
        font-size: 14px;
        font-weight: bold;
      }
      
      .original-price {
        font-size: 12px;
        text-decoration: line-through;
        margin-left: 4px;
      }
    }
    
    .free-tag {
      background-color: rgba(0, 255, 0, 0.8);
      color: #FFFFFF;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 14px;
      font-weight: bold;
    }
  }
  
  .duration-overlay {
    position: absolute;
    bottom: 15px;
    right: 15px;
    display: flex;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.6);
    padding: 4px 8px;
    border-radius: 4px;
    
    .duration-text {
      color: #FFFFFF;
      font-size: 12px;
      margin-left: 4px;
    }
  }
}

.loading-section {
  text-align: center;
  padding: 60px 20px;
  
  .loading-text {
    color: #999999;
    font-size: 14px;
    margin-top: 20px;
  }
}

.error-section {
  text-align: center;
  padding: 60px 20px;
  
  .error-text {
    color: #999999;
    font-size: 14px;
    margin: 20px 0;
  }
  
  .retry-button {
    margin-top: 20px;
  }
}

.course-content {
  padding: 20px;
}

.course-title-section {
  margin-bottom: 20px;
  
  .course-title {
    font-size: 20px;
    font-weight: bold;
    color: #333333;
    margin-bottom: 10px;
  }
  
  .course-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 15px;
    
    .course-tag {
      background-color: #F0F0F0;
      color: #666666;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      
      &.level-tag {
        background-color: #E6F7FF;
        color: #1890FF;
      }
    }
  }
  
  .rating-section {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .stars {
      display: flex;
      gap: 2px;
    }
    
    .rating-text {
      font-size: 14px;
      font-weight: bold;
      color: #333333;
    }
    
    .rating-count {
      font-size: 12px;
      color: #999999;
    }
  }
}

.statistics-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-top: 1px solid #F0F0F0;
  border-bottom: 1px solid #F0F0F0;
  margin-bottom: 20px;
  
  .stat-item {
    display: flex;
    align-items: center;
    gap: 4px;
    
    .stat-text {
      font-size: 12px;
      color: #666666;
    }
  }
  
  .stat-right-group {
    display: flex;
    gap: 20px;
  }
}

.instructor-section {
  margin-bottom: 20px;
  
  .section-title {
    font-size: 16px;
    font-weight: bold;
    color: #333333;
    margin-bottom: 15px;
  }
  
  .instructor-info {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    
    .instructor-avatar {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      margin-right: 15px;
    }
    
    .instructor-avatar-placeholder {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background-color: #F0F0F0;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 15px;
    }
    
    .instructor-details {
      flex: 1;
      
      .instructor-name {
        display: block;
        font-size: 16px;
        font-weight: bold;
        color: #333333;
        margin-bottom: 4px;
      }
      
      .instructor-title {
        display: block;
        font-size: 14px;
        color: #666666;
        margin-bottom: 2px;
      }
      
      .instructor-experience {
        display: block;
        font-size: 12px;
        color: #999999;
        margin-bottom: 4px;
      }
      
      .instructor-rating {
        display: flex;
        align-items: center;
        gap: 4px;
        
        .instructor-rating-text {
          font-size: 12px;
          color: #FFB020;
          font-weight: bold;
        }
      }
    }
  }
  
  .instructor-bio {
    font-size: 14px;
    color: #666666;
    line-height: 1.5;
  }
}

.introduction-section {
  margin-bottom: 20px;
  
  .section-title {
    font-size: 16px;
    font-weight: bold;
    color: #333333;
    margin-bottom: 15px;
  }
  
  .intro-content {
    font-size: 14px;
    color: #666666;
    line-height: 1.6;
  }
}

.course-info-section {
  margin-bottom: 20px;
  
  .section-title {
    font-size: 16px;
    font-weight: bold;
    color: #333333;
    margin-bottom: 15px;
  }
  
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    
    .info-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px;
      background-color: #F9F9F9;
      border-radius: 8px;
      
      .info-content {
        flex: 1;
        
        .info-label {
          display: block;
          font-size: 12px;
          color: #999999;
          margin-bottom: 2px;
        }
        
        .info-value {
          font-size: 14px;
          color: #333333;
          font-weight: 500;
        }
      }
    }
  }
}
</style>