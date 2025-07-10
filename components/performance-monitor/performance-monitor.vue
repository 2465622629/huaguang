<template>
  <view class="performance-monitor" v-if="visible">
    <!-- 监控面板头部 -->
    <view class="monitor-header">
      <text class="monitor-title">华光API性能监控</text>
      <view class="monitor-actions">
        <text class="action-btn" @click="refreshStats">刷新</text>
        <text class="action-btn" @click="clearStats">清空</text>
        <text class="action-btn close-btn" @click="close">关闭</text>
      </view>
    </view>
    
    <!-- 核心指标卡片 -->
    <scroll-view class="monitor-content" scroll-y="true">
      <!-- 总体统计 -->
      <view class="stats-section">
        <view class="section-title">总体统计</view>
        <view class="stats-grid">
          <view class="stat-card">
            <text class="stat-value">{{ stats.totalRequests }}</text>
            <text class="stat-label">总请求数</text>
          </view>
          <view class="stat-card success">
            <text class="stat-value">{{ stats.cacheHitRate }}</text>
            <text class="stat-label">缓存命中率</text>
          </view>
          <view class="stat-card warning">
            <text class="stat-value">{{ stats.errorRate }}</text>
            <text class="stat-label">错误率</text>
          </view>
          <view class="stat-card info">
            <text class="stat-value">{{ Math.round(stats.avgResponseTime) }}ms</text>
            <text class="stat-label">平均响应时间</text>
          </view>
        </view>
      </view>
      
      <!-- 实时状态 -->
      <view class="stats-section">
        <view class="section-title">实时状态</view>
        <view class="status-list">
          <view class="status-item">
            <text class="status-label">活跃请求</text>
            <text class="status-value">{{ stats.activeRequests }}</text>
          </view>
          <view class="status-item">
            <text class="status-label">队列长度</text>
            <text class="status-value">{{ stats.queueLength }}</text>
          </view>
          <view class="status-item">
            <text class="status-label">缓存大小</text>
            <text class="status-value">{{ stats.cacheSize }}</text>
          </view>
          <view class="status-item">
            <text class="status-label">重试次数</text>
            <text class="status-value">{{ stats.retryCount }}</text>
          </view>
        </view>
      </view>
      
      <!-- 性能趋势图 -->
      <view class="stats-section">
        <view class="section-title">性能趋势</view>
        <view class="chart-container">
          <canvas 
            class="performance-chart" 
            canvas-id="performanceChart"
            @touchstart="onChartTouch"
          ></canvas>
        </view>
      </view>
      
      <!-- 错误日志 -->
      <view class="stats-section" v-if="errorLogs.length > 0">
        <view class="section-title">
          <text>最近错误</text>
          <text class="error-count">({{ errorLogs.length }})</text>
        </view>
        <view class="error-list">
          <view 
            v-for="(error, index) in errorLogs.slice(0, 5)" 
            :key="index"
            class="error-item"
            :class="'error-' + error.type.toLowerCase()"
          >
            <view class="error-header">
              <text class="error-type">{{ error.type }}</text>
              <text class="error-time">{{ formatTime(error.timestamp) }}</text>
            </view>
            <text class="error-message">{{ error.message }}</text>
          </view>
        </view>
      </view>
      
      <!-- 操作按钮 -->
      <view class="stats-section">
        <view class="action-buttons">
          <button class="action-button primary" @click="exportStats">导出统计</button>
          <button class="action-button secondary" @click="clearCache">清理缓存</button>
          <button class="action-button warning" @click="resetStats">重置统计</button>
        </view>
      </view>
    </scroll-view>
    
    <!-- 浮动操作按钮 -->
    <view class="floating-btn" @click="toggleAutoRefresh">
      <text class="btn-text">{{ autoRefresh ? '停止' : '自动' }}</text>
      <text class="btn-subtext">刷新</text>
    </view>
  </view>
</template>

<script>
import { huaguangApiOptimizer } from '@/utils/api-optimizer.js'

export default {
  name: 'PerformanceMonitor',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    autoRefreshInterval: {
      type: Number,
      default: 5000 // 5秒自动刷新
    }
  },
  data() {
    return {
      stats: {
        totalRequests: 0,
        cacheHits: 0,
        retryCount: 0,
        errorCount: 0,
        avgResponseTime: 0,
        cacheHitRate: '0%',
        errorRate: '0%',
        cacheSize: 0,
        activeRequests: 0,
        queueLength: 0
      },
      
      // 性能历史数据（用于趋势图）
      performanceHistory: [],
      maxHistoryPoints: 20,
      
      // 错误日志
      errorLogs: [],
      maxErrorLogs: 50,
      
      // 自动刷新
      autoRefresh: false,
      refreshTimer: null,
      
      // 图表配置
      chartContext: null,
      chartInitialized: false
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.initMonitor()
      } else {
        this.stopAutoRefresh()
      }
    }
  },
  mounted() {
    if (this.visible) {
      this.initMonitor()
    }
  },
  beforeDestroy() {
    this.stopAutoRefresh()
  },
  methods: {
    // 初始化监控面板
    initMonitor() {
      this.refreshStats()
      this.initChart()
      this.startAutoRefresh()
    },
    
    // 刷新统计数据
    refreshStats() {
      try {
        const newStats = huaguangApiOptimizer.getStats()
        this.stats = { ...this.stats, ...newStats }
        
        // 添加到历史数据
        this.addToPerformanceHistory({
          timestamp: Date.now(),
          responseTime: newStats.avgResponseTime,
          errorRate: parseFloat(newStats.errorRate),
          cacheHitRate: parseFloat(newStats.cacheHitRate)
        })
        
        // 更新图表
        this.updateChart()
        
        console.log('[性能监控] 统计数据已刷新:', this.stats)
      } catch (error) {
        console.error('[性能监控] 刷新统计失败:', error)
        this.addErrorLog({
          type: 'MONITOR_ERROR',
          message: '刷新统计数据失败: ' + error.message,
          timestamp: Date.now()
        })
      }
    },
    
    // 添加性能历史数据
    addToPerformanceHistory(dataPoint) {
      this.performanceHistory.push(dataPoint)
      
      // 保持历史数据在限制范围内
      if (this.performanceHistory.length > this.maxHistoryPoints) {
        this.performanceHistory.shift()
      }
    },
    
    // 添加错误日志
    addErrorLog(error) {
      this.errorLogs.unshift(error)
      
      // 保持错误日志在限制范围内
      if (this.errorLogs.length > this.maxErrorLogs) {
        this.errorLogs.pop()
      }
    },
    
    // 初始化图表
    initChart() {
      this.$nextTick(() => {
        try {
          this.chartContext = uni.createCanvasContext('performanceChart', this)
          this.chartInitialized = true
          this.drawChart()
        } catch (error) {
          console.warn('[性能监控] 图表初始化失败:', error)
        }
      })
    },
    
    // 绘制性能趋势图
    drawChart() {
      if (!this.chartInitialized || !this.chartContext || this.performanceHistory.length === 0) {
        return
      }
      
      try {
        const ctx = this.chartContext
        const canvasWidth = 300
        const canvasHeight = 150
        const padding = 20
        
        // 清除画布
        ctx.clearRect(0, 0, canvasWidth, canvasHeight)
        
        // 绘制背景
        ctx.setFillStyle('#f8f9fa')
        ctx.fillRect(0, 0, canvasWidth, canvasHeight)
        
        // 绘制网格线
        ctx.setStrokeStyle('#e9ecef')
        ctx.setLineWidth(1)
        
        // 垂直网格线
        for (let i = 1; i < 5; i++) {
          const x = padding + (canvasWidth - 2 * padding) * i / 5
          ctx.beginPath()
          ctx.moveTo(x, padding)
          ctx.lineTo(x, canvasHeight - padding)
          ctx.stroke()
        }
        
        // 水平网格线
        for (let i = 1; i < 4; i++) {
          const y = padding + (canvasHeight - 2 * padding) * i / 4
          ctx.beginPath()
          ctx.moveTo(padding, y)
          ctx.lineTo(canvasWidth - padding, y)
          ctx.stroke()
        }
        
        // 绘制响应时间曲线
        if (this.performanceHistory.length > 1) {
          const maxResponseTime = Math.max(...this.performanceHistory.map(p => p.responseTime))
          const minResponseTime = Math.min(...this.performanceHistory.map(p => p.responseTime))
          const responseTimeRange = maxResponseTime - minResponseTime || 1
          
          ctx.setStrokeStyle('#007bff')
          ctx.setLineWidth(2)
          ctx.beginPath()
          
          this.performanceHistory.forEach((point, index) => {
            const x = padding + (canvasWidth - 2 * padding) * index / (this.performanceHistory.length - 1)
            const normalizedValue = (point.responseTime - minResponseTime) / responseTimeRange
            const y = canvasHeight - padding - (canvasHeight - 2 * padding) * normalizedValue
            
            if (index === 0) {
              ctx.moveTo(x, y)
            } else {
              ctx.lineTo(x, y)
            }
          })
          
          ctx.stroke()
          
          // 绘制数据点
          ctx.setFillStyle('#007bff')
          this.performanceHistory.forEach((point, index) => {
            const x = padding + (canvasWidth - 2 * padding) * index / (this.performanceHistory.length - 1)
            const normalizedValue = (point.responseTime - minResponseTime) / responseTimeRange
            const y = canvasHeight - padding - (canvasHeight - 2 * padding) * normalizedValue
            
            ctx.beginPath()
            ctx.arc(x, y, 3, 0, 2 * Math.PI)
            ctx.fill()
          })
        }
        
        // 绘制图例
        ctx.setFillStyle('#6c757d')
        ctx.setFontSize(12)
        ctx.fillText('响应时间趋势', padding, 15)
        
        ctx.draw()
      } catch (error) {
        console.warn('[性能监控] 绘制图表失败:', error)
      }
    },
    
    // 更新图表
    updateChart() {
      if (this.chartInitialized) {
        this.drawChart()
      }
    },
    
    // 图表触摸事件
    onChartTouch(e) {
      // 可以在这里添加图表交互逻辑
      console.log('[性能监控] 图表触摸事件:', e)
    },
    
    // 自动刷新控制
    startAutoRefresh() {
      if (this.autoRefresh && !this.refreshTimer) {
        this.refreshTimer = setInterval(() => {
          this.refreshStats()
        }, this.autoRefreshInterval)
      }
    },
    
    stopAutoRefresh() {
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer)
        this.refreshTimer = null
      }
    },
    
    toggleAutoRefresh() {
      this.autoRefresh = !this.autoRefresh
      
      if (this.autoRefresh) {
        this.startAutoRefresh()
        uni.showToast({
          title: '自动刷新已开启',
          icon: 'success'
        })
      } else {
        this.stopAutoRefresh()
        uni.showToast({
          title: '自动刷新已关闭',
          icon: 'none'
        })
      }
    },
    
    // 操作方法
    clearStats() {
      uni.showModal({
        title: '确认清空',
        content: '确定要清空所有统计数据吗？',
        success: (res) => {
          if (res.confirm) {
            this.performanceHistory = []
            this.errorLogs = []
            this.updateChart()
            uni.showToast({
              title: '统计数据已清空',
              icon: 'success'
            })
          }
        }
      })
    },
    
    clearCache() {
      uni.showModal({
        title: '确认清理',
        content: '确定要清理所有API缓存吗？',
        success: (res) => {
          if (res.confirm) {
            huaguangApiOptimizer.clearCache()
            this.refreshStats()
            uni.showToast({
              title: '缓存已清理',
              icon: 'success'
            })
          }
        }
      })
    },
    
    resetStats() {
      uni.showModal({
        title: '确认重置',
        content: '确定要重置所有性能统计吗？',
        success: (res) => {
          if (res.confirm) {
            huaguangApiOptimizer.resetStats()
            this.performanceHistory = []
            this.errorLogs = []
            this.refreshStats()
            this.updateChart()
            uni.showToast({
              title: '统计已重置',
              icon: 'success'
            })
          }
        }
      })
    },
    
    exportStats() {
      try {
        const exportData = {
          timestamp: Date.now(),
          stats: this.stats,
          performanceHistory: this.performanceHistory,
          errorLogs: this.errorLogs.slice(0, 10) // 只导出最近10条错误
        }
        
        const jsonStr = JSON.stringify(exportData, null, 2)
        
        // 在小程序中，可以通过剪贴板分享数据
        uni.setClipboardData({
          data: jsonStr,
          success: () => {
            uni.showToast({
              title: '统计数据已复制到剪贴板',
              icon: 'success'
            })
          }
        })
      } catch (error) {
        console.error('[性能监控] 导出统计失败:', error)
        uni.showToast({
          title: '导出失败',
          icon: 'none'
        })
      }
    },
    
    close() {
      this.$emit('close')
    },
    
    // 工具方法
    formatTime(timestamp) {
      const date = new Date(timestamp)
      return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.performance-monitor {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 9999;
  display: flex;
  flex-direction: column;
}

.monitor-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .monitor-title {
    color: #ffffff;
    font-size: 18px;
    font-weight: bold;
  }
  
  .monitor-actions {
    display: flex;
    gap: 12px;
    
    .action-btn {
      color: #ffffff;
      font-size: 14px;
      padding: 6px 12px;
      border-radius: 6px;
      background-color: rgba(255, 255, 255, 0.2);
      
      &.close-btn {
        background-color: rgba(255, 0, 0, 0.3);
      }
    }
  }
}

.monitor-content {
  flex: 1;
  background-color: #f8f9fa;
  padding: 16px;
}

.stats-section {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  .section-title {
    font-size: 16px;
    font-weight: bold;
    color: #333333;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    
    .error-count {
      margin-left: 8px;
      color: #dc3545;
      font-size: 14px;
    }
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  
  .stat-card {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-radius: 8px;
    padding: 16px;
    text-align: center;
    border-left: 4px solid #6c757d;
    
    &.success {
      border-left-color: #28a745;
      background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
    }
    
    &.warning {
      border-left-color: #ffc107;
      background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
    }
    
    &.info {
      border-left-color: #17a2b8;
      background: linear-gradient(135deg, #d1ecf1 0%, #b8daff 100%);
    }
    
    .stat-value {
      display: block;
      font-size: 24px;
      font-weight: bold;
      color: #333333;
      margin-bottom: 4px;
    }
    
    .stat-label {
      font-size: 12px;
      color: #6c757d;
    }
  }
}

.status-list {
  .status-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #e9ecef;
    
    &:last-child {
      border-bottom: none;
    }
    
    .status-label {
      font-size: 14px;
      color: #6c757d;
    }
    
    .status-value {
      font-size: 16px;
      font-weight: bold;
      color: #333333;
    }
  }
}

.chart-container {
  height: 180px;
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 10px;
  
  .performance-chart {
    width: 100%;
    height: 150px;
  }
}

.error-list {
  .error-item {
    background-color: #fff5f5;
    border-left: 4px solid #dc3545;
    border-radius: 6px;
    padding: 12px;
    margin-bottom: 8px;
    
    &.error-network_error {
      border-left-color: #fd7e14;
      background-color: #fff8f0;
    }
    
    &.error-timeout_error {
      border-left-color: #ffc107;
      background-color: #fffdf0;
    }
    
    .error-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
      
      .error-type {
        font-size: 12px;
        font-weight: bold;
        color: #dc3545;
        background-color: rgba(220, 53, 69, 0.1);
        padding: 2px 6px;
        border-radius: 4px;
      }
      
      .error-time {
        font-size: 10px;
        color: #6c757d;
      }
    }
    
    .error-message {
      font-size: 12px;
      color: #333333;
      line-height: 1.4;
    }
  }
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  
  .action-button {
    flex: 1;
    padding: 10px 16px;
    border-radius: 6px;
    font-size: 14px;
    border: none;
    
    &.primary {
      background-color: #007bff;
      color: #ffffff;
    }
    
    &.secondary {
      background-color: #6c757d;
      color: #ffffff;
    }
    
    &.warning {
      background-color: #ffc107;
      color: #212529;
    }
  }
}

.floating-btn {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  
  .btn-text {
    color: #ffffff;
    font-size: 12px;
    font-weight: bold;
  }
  
  .btn-subtext {
    color: #ffffff;
    font-size: 10px;
    opacity: 0.8;
  }
}
</style> 