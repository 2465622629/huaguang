<template>
	<view class="container">
		<!-- 搜索栏 -->
		<view class="search-box">
			<view class="search-input">
				<uni-icons type="search" size="18" color="#999"></uni-icons>
				<input type="text" v-model="searchKey" placeholder="搜索咨询" @confirm="handleSearch" />
			</view>
		</view>
		
		<!-- 状态标签 -->
		<scroll-view class="status-scroll" scroll-x>
			<view class="status-list">
				<view 
					class="status-item" 
					:class="{ active: currentStatus === item.value }"
					v-for="(item, index) in statusList" 
					:key="index"
					@click="handleStatusChange(item.value)"
				>
					{{item.label}}
				</view>
			</view>
		</scroll-view>
		
		<!-- 咨询列表 -->
		<scroll-view 
			class="consultation-list" 
			scroll-y 
			@scrolltolower="loadMore"
			:style="{ height: scrollHeight + 'px' }"
		>
			<view class="consultation-item" v-for="(item, index) in filteredConsultationList" :key="index" @click="goToDetail(item)">
				<view class="consultation-info">
					<view class="header">
						<text class="title">{{item.title}}</text>
						<text :class="['status', item.status]">{{getStatusText(item.status)}}</text>
					</view>
					<view class="desc">{{item.description}}</view>
					<view class="meta">
						<view class="user">
							<text class="label">咨询人：</text>
							<text class="value">{{item.userName}}</text>
						</view>
						<view class="time">
							<text class="label">咨询时间：</text>
							<text class="value">{{formatTime(item.createTime)}}</text>
						</view>
					</view>
					<view class="category">
						<text class="label">咨询类型：</text>
						<text class="value">{{item.category}}</text>
					</view>
				</view>
				<view class="actions">
					<button class="action-btn" @click.stop="handleReply(item)" v-if="item.status === 'pending'">
						<uni-icons type="chat" size="16" color="#007AFF"></uni-icons>
						<text>回复</text>
					</button>
				</view>
			</view>
			
			<!-- 加载更多 -->
			<view class="loading" v-if="loading">加载中...</view>
			<view class="no-more" v-if="noMore">没有更多数据了</view>
		</scroll-view>
		
		<!-- 回复弹窗 -->
		<uni-popup ref="replyPopup" type="bottom">
			<view class="reply-popup">
				<view class="popup-header">
					<text class="title">回复咨询</text>
					<text class="close" @click="closeReplyPopup">关闭</text>
				</view>
				<view class="popup-content">
					<view class="form-item">
						<text class="label">回复内容</text>
						<textarea v-model="replyForm.content" placeholder="请输入回复内容" />
					</view>
					<view class="form-item">
						<text class="label">上传图片</text>
						<view class="upload-list">
							<view 
								class="upload-item" 
								v-for="(item, index) in replyForm.images" 
								:key="index"
							>
								<image :src="item" mode="aspectFill"></image>
								<view class="delete-btn" @click="deleteImage(index)">
									<uni-icons type="close" size="20" color="#fff"></uni-icons>
								</view>
							</view>
							<view class="upload-btn" @click="chooseImage" v-if="replyForm.images.length < 9">
								<uni-icons type="camera" size="30" color="#999"></uni-icons>
								<text>上传图片</text>
							</view>
						</view>
					</view>
					<button class="submit-btn" @click="submitReply">提交回复</button>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
import { 
	getLawyerConsultations, 
	replyConsultation, 
	updateConsultationStatus,
	getLawyerConsultationStats
} from '@/api/modules/lawyer.js'

export default {
	data() {
		return {
			// 搜索和筛选
			searchKey: '',
			currentStatus: 'all',
			statusList: [
				{ label: '全部', value: 'all' },
				{ label: '待回复', value: 'pending' },
				{ label: '已回复', value: 'replied' },
				{ label: '已关闭', value: 'closed' }
			],
			
			// 数据列表
			consultationList: [],
			originalList: [], // 原始数据，用于本地搜索
			
			// 分页相关
			page: 1,
			pageSize: 10,
			loading: false,
			refreshing: false,
			noMore: false,
			hasMore: true,
			
			// UI相关
			scrollHeight: 0,
			currentConsultation: null,
			
			// 回复表单
			replyForm: {
				content: '',
				images: []
			},
			
			// 缓存管理
			cacheKey: 'lawyer_consultations_cache',
			cacheExpiry: 10 * 60 * 1000, // 10分钟缓存
			lastFetchTime: 0,
			
			// 重试配置
			retryConfig: {
				maxRetries: 3,
				baseDelay: 1000,
				maxDelay: 10000
			},
			
			// 统计数据
			statsData: {
				total: 0,
				pending: 0,
				replied: 0,
				closed: 0
			}
		}
	},
	
	computed: {
		// 筛选后的咨询列表
		filteredConsultationList() {
			let list = this.originalList
			
			// 状态筛选
			if (this.currentStatus !== 'all') {
				list = list.filter(item => item.status === this.currentStatus)
			}
			
			// 关键词搜索
			if (this.searchKey.trim()) {
				const keyword = this.searchKey.trim().toLowerCase()
				list = list.filter(item => 
					item.title?.toLowerCase().includes(keyword) ||
					item.description?.toLowerCase().includes(keyword) ||
					item.userName?.toLowerCase().includes(keyword) ||
					item.category?.toLowerCase().includes(keyword)
				)
			}
			
			return list
		}
	},
	
	async onLoad() {
		this.calculateScrollHeight()
		await this.initializeData()
	},
	
	// 下拉刷新
	async onPullDownRefresh() {
		this.refreshing = true
		await this.refreshData()
		uni.stopPullDownRefresh()
		this.refreshing = false
	},
	
	// 触底加载更多
	onReachBottom() {
		this.loadMore()
	},
	
	methods: {
		/**
		 * 初始化数据
		 */
		async initializeData() {
			try {
				// 并行加载数据
				await Promise.allSettled([
					this.loadConsultations(true),
					this.loadStatistics()
				])
			} catch (error) {
				console.error('初始化数据失败:', error)
				this.showError('数据加载失败，请下拉刷新重试')
			}
		},
		
		/**
		 * 加载咨询列表
		 */
		async loadConsultations(isRefresh = false) {
			if (this.loading && !isRefresh) return
			
			// 检查缓存（仅在非刷新时使用）
			if (!isRefresh && this.shouldUseCache()) {
				const cached = this.getCache()
				if (cached?.data) {
					this.originalList = cached.data
					this.consultationList = [...this.originalList]
					this.updateStatusCounts()
					return
				}
			}
			
			this.loading = true
			if (isRefresh) {
				this.page = 1
				this.hasMore = true
				this.noMore = false
			}
			
			try {
				const response = await this.executeWithRetry(() => 
					getLawyerConsultations({
						page: this.page,
						pageSize: this.pageSize,
						sortBy: 'created_time',
						sortOrder: 'desc'
					})
				)
				
				if (response?.code === 200) {
					const newData = response.data?.list || []
					
					if (isRefresh) {
						this.originalList = newData
						this.consultationList = [...newData]
					} else {
						this.originalList = [...this.originalList, ...newData]
						this.consultationList = [...this.originalList]
					}
					
					// 更新分页状态
					this.hasMore = newData.length === this.pageSize
					this.noMore = !this.hasMore
					this.page += 1
					this.lastFetchTime = Date.now()
					
					// 更新缓存
					this.setCache({
						data: this.originalList,
						timestamp: this.lastFetchTime
					})
					
					// 更新状态计数
					this.updateStatusCounts()
					
				} else {
					throw new Error(response?.message || '获取咨询列表失败')
				}
				
			} catch (error) {
				console.error('加载咨询列表失败:', error)
				this.handleLoadError(error)
			} finally {
				this.loading = false
				this.refreshing = false
			}
		},
		
		/**
		 * 加载统计数据
		 */
		async loadStatistics() {
			try {
				const response = await getLawyerConsultationStats({
					period: 'month'
				})
				
				if (response?.code === 200) {
					this.statsData = {
						...this.statsData,
						...response.data
					}
				}
			} catch (error) {
				console.error('加载统计数据失败:', error)
			}
		},
		
		/**
		 * 更新状态计数
		 */
		updateStatusCounts() {
			const counts = this.originalList.reduce((acc, item) => {
				acc[item.status] = (acc[item.status] || 0) + 1
				return acc
			}, {})
			
			this.statusList.forEach(status => {
				if (status.value !== 'all') {
					status.count = counts[status.value] || 0
				} else {
					status.count = this.originalList.length
				}
			})
		},
		
		/**
		 * 计算滚动区域高度
		 */
		calculateScrollHeight() {
			const systemInfo = uni.getSystemInfoSync()
			const statusBarHeight = systemInfo.statusBarHeight || 0
			const searchBoxHeight = 120 // 搜索框高度
			const statusTabHeight = 80  // 状态标签高度
			
			this.scrollHeight = systemInfo.windowHeight - statusBarHeight - searchBoxHeight - statusTabHeight
		},
		
		/**
		 * 处理搜索
		 */
		handleSearch() {
			// 本地搜索，不重新请求接口
			// 因为filteredConsultationList已经包含了搜索逻辑
		},
		
		/**
		 * 处理状态切换
		 */
		handleStatusChange(status) {
			this.currentStatus = status
			// 本地筛选，不重新请求接口
		},
		
		/**
		 * 刷新数据
		 */
		async refreshData() {
			await this.loadConsultations(true)
			await this.loadStatistics()
		},
		
		/**
		 * 加载更多数据
		 */
		loadMore() {
			if (!this.loading && this.hasMore && !this.noMore) {
				this.loadConsultations(false)
			}
		},
		
		/**
		 * 跳转到详情页面
		 */
		goToDetail(consultation) {
			uni.navigateTo({
				url: `/pages/lawyer/consultation/detail?id=${consultation.id}`
			})
		},
		
		/**
		 * 处理回复操作
		 */
		handleReply(consultation) {
			this.currentConsultation = consultation
			this.replyForm.content = ''
			this.replyForm.images = []
			this.$refs.replyPopup.open()
		},
		
		/**
		 * 关闭回复弹窗
		 */
		closeReplyPopup() {
			this.$refs.replyPopup.close()
			this.currentConsultation = null
		},
		
		/**
		 * 选择图片
		 */
		chooseImage() {
			uni.chooseImage({
				count: 9 - this.replyForm.images.length,
				sourceType: ['camera', 'album'],
				success: (res) => {
					this.replyForm.images = [...this.replyForm.images, ...res.tempFilePaths]
				},
				fail: (error) => {
					console.error('选择图片失败:', error)
					this.showError('选择图片失败')
				}
			})
		},
		
		/**
		 * 删除图片
		 */
		deleteImage(index) {
			this.replyForm.images.splice(index, 1)
		},
		
		/**
		 * 提交回复
		 */
		async submitReply() {
			if (!this.replyForm.content.trim()) {
				this.showError('请输入回复内容')
				return
			}
			
			if (!this.currentConsultation) {
				this.showError('咨询信息异常')
				return
			}
			
			try {
				uni.showLoading({ title: '提交中...' })
				
				const response = await this.executeWithRetry(() => 
					replyConsultation(this.currentConsultation.id, {
						content: this.replyForm.content.trim(),
						images: this.replyForm.images,
						replyType: 'text'
					})
				)
				
				if (response?.code === 200) {
					// 更新本地数据
					const index = this.originalList.findIndex(item => item.id === this.currentConsultation.id)
					if (index !== -1) {
						this.originalList[index].status = 'replied'
						this.originalList[index].lastReplyTime = new Date().toISOString()
						this.originalList[index].replyCount = (this.originalList[index].replyCount || 0) + 1
					}
					
					// 更新显示列表
					this.consultationList = [...this.originalList]
					this.updateStatusCounts()
					
					// 更新缓存
					this.setCache({
						data: this.originalList,
						timestamp: Date.now()
					})
					
					uni.hideLoading()
					this.showSuccess('回复成功')
					this.closeReplyPopup()
					
				} else {
					throw new Error(response?.message || '回复失败')
				}
				
			} catch (error) {
				uni.hideLoading()
				console.error('提交回复失败:', error)
				this.handleSubmitError(error)
			}
		},
		
		/**
		 * 缓存相关方法
		 */
		shouldUseCache() {
			return this.lastFetchTime > 0 && (Date.now() - this.lastFetchTime) < this.cacheExpiry
		},
		
		getCache() {
			try {
				return uni.getStorageSync(this.cacheKey)
			} catch (error) {
				console.error('获取缓存失败:', error)
				return null
			}
		},
		
		setCache(data) {
			try {
				uni.setStorageSync(this.cacheKey, data)
			} catch (error) {
				console.error('设置缓存失败:', error)
			}
		},
		
		/**
		 * 带重试的API请求
		 */
		async executeWithRetry(apiCall, retryCount = 0) {
			try {
				return await apiCall()
			} catch (error) {
				if (retryCount < this.retryConfig.maxRetries) {
					const delay = Math.min(
						this.retryConfig.baseDelay * Math.pow(2, retryCount) + Math.random() * 1000,
						this.retryConfig.maxDelay
					)
					
					console.log(`API调用失败，${delay.toFixed(0)}ms后进行第${retryCount + 1}次重试:`, error.message)
					await new Promise(resolve => setTimeout(resolve, delay))
					return this.executeWithRetry(apiCall, retryCount + 1)
				}
				throw error
			}
		},
		
		/**
		 * 错误处理
		 */
		handleLoadError(error) {
			let message = '加载失败，请重试'
			
			if (error.message?.includes('timeout') || error.message?.includes('超时')) {
				message = '网络超时，请检查网络连接'
			} else if (error.message?.includes('Network Error')) {
				message = '网络连接异常'
			} else if (error.message?.includes('401')) {
				message = '请重新登录'
				setTimeout(() => {
					uni.reLaunch({ url: '/pages/login/login' })
				}, 2000)
			} else if (error.message?.includes('403')) {
				message = '没有访问权限'
			}
			
			this.showError(message)
		},
		
		handleSubmitError(error) {
			let message = '操作失败，请重试'
			
			if (error.message?.includes('timeout')) {
				message = '网络超时，请重试'
			} else if (error.message?.includes('401')) {
				message = '登录已过期，请重新登录'
				setTimeout(() => {
					uni.reLaunch({ url: '/pages/login/login' })
				}, 2000)
			}
			
			this.showError(message)
		},
		
		/**
		 * 工具方法
		 */
		showError(message) {
			uni.showToast({
				title: message,
				icon: 'none',
				duration: 3000
			})
		},
		
		showSuccess(message) {
			uni.showToast({
				title: message,
				icon: 'success',
				duration: 2000
			})
		},
		
		/**
		 * 格式化时间
		 */
		formatTime(timeString) {
			if (!timeString) return ''
			
			const time = new Date(timeString)
			const now = new Date()
			const diff = now - time
			
			if (diff < 60000) return '刚刚'
			if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
			if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
			if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
			
			return time.toLocaleDateString()
		},
		
		/**
		 * 获取状态显示文本
		 */
		getStatusText(status) {
			const statusMap = {
				pending: '待回复',
				replied: '已回复', 
				closed: '已关闭'
			}
			return statusMap[status] || status
		}
	}
}
</script>

<style lang="scss">
.container {
	min-height: 100vh;
	background-color: #f5f5f5;
}

.search-box {
	padding: 20rpx 30rpx;
	background-color: #fff;
	
	.search-input {
		display: flex;
		align-items: center;
		background-color: #f5f5f5;
		border-radius: 30rpx;
		padding: 10rpx 20rpx;
		
		input {
			flex: 1;
			height: 60rpx;
			margin-left: 10rpx;
			font-size: 28rpx;
		}
	}
}

.status-scroll {
	background-color: #fff;
	padding: 20rpx 0;
	white-space: nowrap;
	
	.status-list {
		display: inline-block;
		padding: 0 20rpx;
		
		.status-item {
			display: inline-block;
			padding: 10rpx 30rpx;
			margin-right: 20rpx;
			font-size: 28rpx;
			color: #666;
			background-color: #f5f5f5;
			border-radius: 30rpx;
			
			&.active {
				color: #fff;
				background-color: #007AFF;
			}
		}
	}
}

.consultation-list {
	background-color: #fff;
	
	.consultation-item {
		padding: 30rpx;
		border-bottom: 1rpx solid #eee;
		
		.consultation-info {
			margin-bottom: 20rpx;
			
			.header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 10rpx;
				
				.title {
					font-size: 32rpx;
					color: #333;
					font-weight: bold;
				}
				
				.status {
					font-size: 24rpx;
					padding: 4rpx 12rpx;
					border-radius: 4rpx;
					
					&.pending {
						color: #ff9500;
						background-color: rgba(255, 149, 0, 0.1);
					}
					
					&.replied {
						color: #4cd964;
						background-color: rgba(76, 217, 100, 0.1);
					}
					
					&.closed {
						color: #999;
						background-color: rgba(153, 153, 153, 0.1);
					}
				}
			}
			
			.desc {
				font-size: 28rpx;
				color: #666;
				margin-bottom: 20rpx;
				line-height: 1.6;
			}
			
			.meta {
				display: flex;
				flex-wrap: wrap;
				margin-bottom: 10rpx;
				
				.user, .time {
					font-size: 26rpx;
					color: #666;
					margin-right: 30rpx;
					
					.label {
						color: #999;
					}
				}
			}
			
			.category {
				font-size: 26rpx;
				color: #666;
				
				.label {
					color: #999;
				}
			}
		}
		
		.actions {
			display: flex;
			justify-content: flex-end;
			
			.action-btn {
				display: flex;
				align-items: center;
				background: none;
				border: 1rpx solid #007AFF;
				border-radius: 30rpx;
				padding: 10rpx 20rpx;
				margin: 0;
				line-height: 1;
				
				&::after {
					display: none;
				}
				
				text {
					font-size: 24rpx;
					color: #007AFF;
					margin-left: 6rpx;
				}
			}
		}
	}
}

.loading, .no-more {
	text-align: center;
	padding: 30rpx;
	color: #999;
	font-size: 24rpx;
}

.reply-popup {
	background-color: #fff;
	border-radius: 20rpx 20rpx 0 0;
	
	.popup-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 30rpx;
		border-bottom: 1rpx solid #eee;
		
		.title {
			font-size: 32rpx;
			color: #333;
			font-weight: bold;
		}
		
		.close {
			font-size: 28rpx;
			color: #999;
		}
	}
	
	.popup-content {
		padding: 30rpx;
		
		.form-item {
			margin-bottom: 30rpx;
			
			.label {
				display: block;
				font-size: 28rpx;
				color: #333;
				margin-bottom: 10rpx;
			}
			
			textarea {
				width: 100%;
				height: 200rpx;
				background-color: #f5f5f5;
				border-radius: 8rpx;
				padding: 20rpx;
				font-size: 28rpx;
			}
			
			.upload-list {
				display: flex;
				flex-wrap: wrap;
				
				.upload-item {
					width: 200rpx;
					height: 200rpx;
					margin-right: 20rpx;
					margin-bottom: 20rpx;
					position: relative;
					
					image {
						width: 100%;
						height: 100%;
						border-radius: 8rpx;
					}
					
					.delete-btn {
						position: absolute;
						right: -10rpx;
						top: -10rpx;
						width: 40rpx;
						height: 40rpx;
						background-color: rgba(0, 0, 0, 0.5);
						border-radius: 50%;
						display: flex;
						align-items: center;
						justify-content: center;
					}
				}
				
				.upload-btn {
					width: 200rpx;
					height: 200rpx;
					background-color: #f5f5f5;
					border-radius: 8rpx;
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					
					text {
						font-size: 24rpx;
						color: #999;
						margin-top: 10rpx;
					}
				}
			}
		}
		
		.submit-btn {
			width: 100%;
			height: 80rpx;
			background-color: #007AFF;
			color: #fff;
			font-size: 32rpx;
			border-radius: 40rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			
			&::after {
				display: none;
			}
		}
	}
}
</style> 