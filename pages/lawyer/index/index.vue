<template>
	<view class="container">
		<!-- 下拉刷新 -->
		<scroll-view
			scroll-y="true"
			refresher-enabled="true"
			:refresher-triggered="refreshing"
			@refresherrefresh="onRefresh"
			class="scroll-container"
		>
			<view class="header">
				<text class="title">律师工作台</text>
				<view class="refresh-btn" @click="refreshData" :class="{ 'loading': loading }">
					<text class="refresh-icon">🔄</text>
				</view>
			</view>
			
			<view class="content">
				<!-- 加载状态 -->
				<view v-if="loading && !hasData" class="loading-container">
					<text class="loading-text">正在加载工作台数据...</text>
				</view>
				
				<!-- 统计卡片 -->
				<view class="stats-cards" v-else>
					<view class="stat-card">
						<text class="stat-number">{{ statistics.pendingCases }}</text>
						<text class="stat-label">待处理案件</text>
					</view>
					<view class="stat-card">
						<text class="stat-number">{{ statistics.todayConsultations }}</text>
						<text class="stat-label">今日咨询</text>
					</view>
					<view class="stat-card">
						<text class="stat-number">{{ statistics.monthlyIncome }}</text>
						<text class="stat-label">本月收入</text>
					</view>
				</view>
				
				<!-- 功能菜单 -->
				<view class="menu-list">
					<view class="menu-item" @click="goToCases">
						<text class="menu-title">案件管理</text>
						<text class="arrow">></text>
					</view>
					<view class="menu-item" @click="goToConsultation">
						<text class="menu-title">咨询管理</text>
						<text class="arrow">></text>
					</view>
					<view class="menu-item" @click="goToSchedule">
						<text class="menu-title">日程安排</text>
						<text class="arrow">></text>
					</view>
				</view>
				
				<!-- 错误状态 -->
				<view v-if="error && !hasData" class="error-container">
					<text class="error-text">{{ error }}</text>
					<view class="retry-btn" @click="loadWorkspaceData">
						<text class="retry-text">重试</text>
					</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	// 导入API模块
	import { getCurrentLawyerInfo } from '@/api/modules/lawyer.js'
	import { getIncomeStatistics, getDocumentReviewList } from '@/api/modules/lawyer-workspace.js'
	import { getUserConsultations } from '@/api/modules/lawyer.js'
	
	export default {
		data() {
			return {
				// 统计数据
				statistics: {
					pendingCases: 0,
					todayConsultations: 0,
					monthlyIncome: '¥0'
				},
				// 状态管理
				loading: false,
				refreshing: false,
				error: '',
				hasData: false,
				// 缓存管理
				cacheKey: 'lawyer_workspace_data',
				cacheExpiry: 8 * 60 * 1000, // 8分钟缓存
				lastLoadTime: 0
			}
		},
		
		onLoad() {
			this.loadWorkspaceData()
		},
		
		onShow() {
			// 检查数据是否需要刷新
			const now = Date.now()
			if (now - this.lastLoadTime > this.cacheExpiry) {
				this.loadWorkspaceData()
			}
		},
		
		methods: {
			/**
			 * 加载工作台数据 - 并行获取多个数据源
			 */
			async loadWorkspaceData() {
				if (this.loading) return
				
				this.loading = true
				this.error = ''
				
				try {
					console.log('开始加载律师工作台数据...')
					
					// 尝试从缓存获取数据
					const cachedData = this.getCachedData()
					if (cachedData && !this.shouldRefreshCache()) {
						console.log('使用缓存数据')
						this.statistics = cachedData
						this.hasData = true
						this.loading = false
						return
					}
					
					// 并行调用多个API获取数据
					const [lawyerInfo, incomeStats, casesList, consultationsList] = await Promise.allSettled([
						this.callApiWithRetry(() => getCurrentLawyerInfo()),
						this.callApiWithRetry(() => getIncomeStatistics()),
						this.callApiWithRetry(() => getDocumentReviewList({ page: 1, size: 100 })),
						this.callApiWithRetry(() => getUserConsultations({ page: 1, size: 100 }))
					])
					
					// 处理和格式化数据
					const formattedData = this.formatStatisticsData({
						lawyerInfo: lawyerInfo.status === 'fulfilled' ? lawyerInfo.value : null,
						incomeStats: incomeStats.status === 'fulfilled' ? incomeStats.value : null,
						casesList: casesList.status === 'fulfilled' ? casesList.value : null,
						consultationsList: consultationsList.status === 'fulfilled' ? consultationsList.value : null
					})
					
					this.statistics = formattedData
					this.hasData = true
					this.lastLoadTime = Date.now()
					
					// 缓存数据
					this.setCachedData(formattedData)
					
					console.log('律师工作台数据加载完成:', formattedData)
					
				} catch (error) {
					console.error('加载工作台数据失败:', error)
					this.handleLoadError(error)
				} finally {
					this.loading = false
					this.refreshing = false
				}
			},
			
			/**
			 * 智能指数退避重试机制
			 */
			async callApiWithRetry(apiCall, maxRetries = 3) {
				for (let attempt = 1; attempt <= maxRetries; attempt++) {
					try {
						const result = await apiCall()
						return result
					} catch (error) {
						console.warn(`API调用失败 (尝试 ${attempt}/${maxRetries}):`, error)
						
						if (attempt === maxRetries) {
							throw error
						}
						
						// 指数退避延迟，添加随机抖动避免雷群效应
						const baseDelay = Math.min(1000 * Math.pow(2, attempt - 1), 8000)
						const jitter = Math.random() * 1000
						const delay = baseDelay + jitter
						
						console.log(`等待 ${Math.round(delay)}ms 后重试...`)
						await new Promise(resolve => setTimeout(resolve, delay))
					}
				}
			},
			
			/**
			 * 格式化统计数据
			 */
			formatStatisticsData(rawData) {
				const { lawyerInfo, incomeStats, casesList, consultationsList } = rawData
				
				// 计算待处理案件数量
				let pendingCases = 0
				if (casesList && casesList.data && Array.isArray(casesList.data.list)) {
					pendingCases = casesList.data.list.filter(item =>
						item.status === 'pending' || item.status === 'PENDING' || item.status === '待审核'
					).length
				}
				
				// 计算今日咨询数量
				let todayConsultations = 0
				if (consultationsList && consultationsList.data && Array.isArray(consultationsList.data.list)) {
					const today = new Date().toDateString()
					todayConsultations = consultationsList.data.list.filter(item => {
						if (!item.createTime && !item.createdAt) return false
						const itemDate = new Date(item.createTime || item.createdAt).toDateString()
						return itemDate === today
					}).length
				}
				
				// 格式化本月收入
				let monthlyIncome = '¥0'
				if (incomeStats && incomeStats.data) {
					const income = incomeStats.data.monthlyIncome || incomeStats.data.currentMonthIncome || 0
					monthlyIncome = `¥${this.formatCurrency(income)}`
				}
				
				return {
					pendingCases,
					todayConsultations,
					monthlyIncome
				}
			},
			
			/**
			 * 格式化货币显示
			 */
			formatCurrency(amount) {
				if (!amount || isNaN(amount)) return '0'
				return Number(amount).toLocaleString('zh-CN', {
					minimumFractionDigits: 0,
					maximumFractionDigits: 2
				})
			},
			
			/**
			 * 处理加载错误
			 */
			handleLoadError(error) {
				console.error('工作台数据加载错误:', error)
				
				// 尝试使用缓存数据
				const cachedData = this.getCachedData()
				if (cachedData) {
					console.log('使用缓存数据作为降级方案')
					this.statistics = cachedData
					this.hasData = true
					this.error = '数据可能不是最新的，请稍后刷新'
					return
				}
				
				// 错误分类处理
				if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
					this.error = '网络连接异常，请检查网络后重试'
				} else if (error.code === 401 || error.status === 401) {
					this.error = '登录已过期，请重新登录'
					// 可以跳转到登录页面
				} else if (error.code === 403 || error.status === 403) {
					this.error = '权限不足，请联系管理员'
				} else if (error.code === 500 || error.status >= 500) {
					this.error = '服务器暂时不可用，请稍后重试'
				} else {
					this.error = '加载数据失败，请重试'
				}
				
				// 使用默认值
				this.statistics = {
					pendingCases: 0,
					todayConsultations: 0,
					monthlyIncome: '¥0'
				}
			},
			
			/**
			 * 缓存管理
			 */
			getCachedData() {
				try {
					const cached = uni.getStorageSync(this.cacheKey)
					if (cached && cached.timestamp && cached.data) {
						const now = Date.now()
						if (now - cached.timestamp < this.cacheExpiry) {
							return cached.data
						}
					}
				} catch (error) {
					console.warn('读取缓存失败:', error)
				}
				return null
			},
			
			setCachedData(data) {
				try {
					uni.setStorageSync(this.cacheKey, {
						data,
						timestamp: Date.now()
					})
				} catch (error) {
					console.warn('设置缓存失败:', error)
				}
			},
			
			shouldRefreshCache() {
				const cached = uni.getStorageSync(this.cacheKey)
				if (!cached || !cached.timestamp) return true
				return Date.now() - cached.timestamp > this.cacheExpiry
			},
			
			/**
			 * 下拉刷新
			 */
			async onRefresh() {
				this.refreshing = true
				// 清除缓存，强制刷新
				uni.removeStorageSync(this.cacheKey)
				await this.loadWorkspaceData()
			},
			
			/**
			 * 手动刷新数据
			 */
			async refreshData() {
				if (this.loading) return
				uni.removeStorageSync(this.cacheKey)
				await this.loadWorkspaceData()
				uni.showToast({
					title: '数据已刷新',
					icon: 'success',
					duration: 1500
				})
			},
			
			/**
			 * 页面跳转方法
			 */
			goToCases() {
				uni.navigateTo({
					url: '/pages/lawyer/cases/cases'
				})
			},
			
			goToConsultation() {
				uni.navigateTo({
					url: '/pages/lawyer/consultation/consultation'
				})
			},
			
			goToSchedule() {
				// 跳转到日程安排页面
				uni.showToast({
					title: '功能开发中',
					icon: 'none'
				})
			}
		}
	}
</script>

<style>
.container {
	padding: 20rpx;
	background-color: #f5f5f5;
	min-height: 100vh;
}

.scroll-container {
	height: 100vh;
}

.header {
	padding: 20rpx 0;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.title {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
}

.refresh-btn {
	padding: 10rpx;
	border-radius: 50%;
	background-color: #fff;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
	transition: transform 0.3s ease;
}

.refresh-btn.loading {
	animation: rotate 1s linear infinite;
}

.refresh-icon {
	font-size: 24rpx;
	color: #4893FF;
}

@keyframes rotate {
	from { transform: rotate(0deg); }
	to { transform: rotate(360deg); }
}

.content {
	margin-top: 30rpx;
}

/* 加载状态 */
.loading-container {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 80rpx 0;
	background-color: #fff;
	border-radius: 12rpx;
	margin-bottom: 30rpx;
}

.loading-text {
	font-size: 28rpx;
	color: #666;
}

/* 统计卡片 */
.stats-cards {
	display: flex;
	justify-content: space-between;
	margin-bottom: 30rpx;
	gap: 20rpx;
}

.stat-card {
	flex: 1;
	background-color: #fff;
	border-radius: 12rpx;
	padding: 30rpx 20rpx;
	text-align: center;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
	transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:active {
	transform: scale(0.98);
	box-shadow: 0 1rpx 6rpx rgba(0, 0, 0, 0.12);
}

.stat-number {
	font-size: 40rpx;
	font-weight: bold;
	color: #4893FF;
	display: block;
	margin-bottom: 12rpx;
	line-height: 1.2;
}

.stat-label {
	font-size: 24rpx;
	color: #666;
	line-height: 1.4;
}

/* 功能菜单 */
.menu-list {
	background-color: #fff;
	border-radius: 12rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
	overflow: hidden;
}

.menu-item {
	padding: 30rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
	border-bottom: 1rpx solid #f0f0f0;
	transition: background-color 0.2s ease;
}

.menu-item:last-child {
	border-bottom: none;
}

.menu-item:active {
	background-color: #f8f9fa;
}

.menu-title {
	font-size: 30rpx;
	color: #333;
	font-weight: 500;
}

.arrow {
	color: #999;
	font-size: 28rpx;
	font-weight: bold;
}

/* 错误状态 */
.error-container {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	padding: 80rpx 40rpx;
	background-color: #fff;
	border-radius: 12rpx;
	margin-bottom: 30rpx;
}

.error-text {
	font-size: 28rpx;
	color: #ff6b6b;
	text-align: center;
	margin-bottom: 30rpx;
	line-height: 1.5;
}

.retry-btn {
	padding: 20rpx 40rpx;
	background-color: #4893FF;
	border-radius: 8rpx;
	transition: background-color 0.2s ease, transform 0.1s ease;
}

.retry-btn:active {
	background-color: #3a7bd5;
	transform: scale(0.98);
}

.retry-text {
	font-size: 28rpx;
	color: #fff;
	font-weight: 500;
}

/* 响应式设计 */
@media screen and (max-width: 750rpx) {
	.stats-cards {
		gap: 15rpx;
	}
	
	.stat-card {
		padding: 25rpx 15rpx;
	}
	
	.stat-number {
		font-size: 36rpx;
	}
	
	.stat-label {
		font-size: 22rpx;
	}
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
	.container {
		background-color: #1a1a1a;
	}
	
	.title {
		color: #fff;
	}
	
	.stat-card, .menu-list, .loading-container, .error-container {
		background-color: #2d2d2d;
	}
	
	.stat-label, .loading-text {
		color: #999;
	}
	
	.menu-title {
		color: #fff;
	}
	
	.menu-item {
		border-bottom-color: #404040;
	}
	
	.menu-item:active {
		background-color: #404040;
	}
}
</style>