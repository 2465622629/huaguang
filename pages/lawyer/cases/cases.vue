<template>
	<view class="container">
		<!-- 搜索栏 -->
		<view class="search-box">
			<view class="search-input">
				<uni-icons type="search" size="18" color="#999"></uni-icons>
				<input type="text" v-model="searchKey" placeholder="搜索案件" @confirm="handleSearch" />
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
		
		<!-- 案件列表 -->
		<scroll-view
			class="case-list"
			scroll-y
			@scrolltolower="loadMore"
			@refresherrefresh="onRefresh"
			:refresher-enabled="true"
			:refresher-triggered="refreshing"
			:style="{ height: scrollHeight + 'px' }"
		>
			<view class="case-item" v-for="(item, index) in caseList" :key="index" @click="goToDetail(item.id)">
				<view class="case-info">
					<view class="header">
						<text class="title">{{item.title}}</text>
						<text :class="['status', item.status]">{{item.statusText}}</text>
					</view>
					<view class="desc">{{item.description}}</view>
					<view class="meta">
						<view class="client">
							<text class="label">委托人：</text>
							<text class="value">{{item.clientName}}</text>
						</view>
						<view class="time">
							<text class="label">创建时间：</text>
							<text class="value">{{item.createTime}}</text>
						</view>
					</view>
					<view class="progress" v-if="item.status === 'processing'">
						<text class="label">当前进度：</text>
						<text class="value">{{item.progress}}</text>
					</view>
				</view>
				<view class="actions">
					<button class="action-btn" @click.stop="handleUpdate(item)">
						<uni-icons type="compose" size="16" color="#007AFF"></uni-icons>
						<text>更新进度</text>
					</button>
				</view>
			</view>
			
			<!-- 加载更多 -->
			<view class="loading" v-if="loading">加载中...</view>
			<view class="no-more" v-if="noMore">没有更多数据了</view>
		</scroll-view>
		
		<!-- 更新进度弹窗 -->
		<uni-popup ref="updatePopup" type="bottom">
			<view class="update-popup">
				<view class="popup-header">
					<text class="title">更新案件进度</text>
					<text class="close" @click="closeUpdatePopup">关闭</text>
				</view>
				<view class="popup-content">
					<view class="form-item">
						<text class="label">当前进度</text>
						<input type="text" v-model="updateForm.progress" placeholder="请输入当前进度" />
					</view>
					<view class="form-item">
						<text class="label">进度说明</text>
						<textarea v-model="updateForm.description" placeholder="请输入进度说明" />
					</view>
					<button class="submit-btn" @click="submitUpdate">提交更新</button>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	// 导入法律服务API模块
	import { getAssistanceCases, getLegalDocumentDetail } from '@/api/modules/legal.js'
	
	export default {
		data() {
			return {
				searchKey: '',
				currentStatus: 'all',
				statusList: [
					{ label: '全部', value: 'all' },
					{ label: '待处理', value: 'pending' },
					{ label: '处理中', value: 'processing' },
					{ label: '已完成', value: 'completed' },
					{ label: '已取消', value: 'cancelled' }
				],
				caseList: [],
				page: 1,
				pageSize: 10,
				loading: false,
				noMore: false,
				scrollHeight: 0,
				currentCase: null,
				updateForm: {
					progress: '',
					description: ''
				},
				// 缓存相关
				cacheKey: 'lawyer_cases_cache',
				cacheExpiry: 10 * 60 * 1000, // 10分钟缓存
				searchTimeout: null, // 搜索防抖
				retryCount: 0,
				maxRetries: 3,
				refreshing: false // 下拉刷新状态
			}
		},
		onLoad() {
			// 获取屏幕高度
			const systemInfo = uni.getSystemInfoSync()
			// 减去搜索栏和状态标签的高度
			this.scrollHeight = systemInfo.windowHeight - uni.upx2px(180)
			
			this.loadData()
		},
		methods: {
			handleSearch() {
				// 清除之前的搜索定时器
				if (this.searchTimeout) {
					clearTimeout(this.searchTimeout)
				}
				
				// 搜索防抖，300ms后执行
				this.searchTimeout = setTimeout(() => {
					this.page = 1
					this.caseList = []
					this.noMore = false
					this.retryCount = 0
					this.loadData()
				}, 300)
			},
			handleStatusChange(status) {
				this.currentStatus = status
				this.page = 1
				this.caseList = []
				this.noMore = false
				this.loadData()
			},
			async loadData() {
				if (this.loading || this.noMore) return
				
				this.loading = true
				
				try {
					// 检查缓存（仅第一页且无搜索条件时使用）
					if (this.page === 1 && !this.searchKey && this.currentStatus === 'all') {
						const cachedData = this.getCachedData()
						if (cachedData) {
							console.log('使用缓存数据加载律师案例')
							this.caseList = cachedData.list
							this.loading = false
							this.page = cachedData.nextPage
							return
						}
					}
					
					// 构建API请求参数
					const params = {
						page: this.page,
						pageSize: this.pageSize
					}
					
					// 添加搜索条件
					if (this.searchKey && this.searchKey.trim()) {
						params.keyword = this.searchKey.trim()
					}
					
					// 添加状态筛选
					if (this.currentStatus && this.currentStatus !== 'all') {
						params.status = this.currentStatus
					}
					
					console.log('正在加载律师案例数据，参数：', params)
					
					// 调用API获取案例数据
					const response = await getAssistanceCases(params)
					
					if (response && response.code === 200) {
						const apiData = response.data || {}
						const newCases = this.formatCaseData(apiData.list || [])
						
						if (this.page === 1) {
							this.caseList = newCases
							// 缓存第一页数据（无搜索条件时）
							if (!this.searchKey && this.currentStatus === 'all') {
								this.setCachedData({
									list: newCases,
									nextPage: 2,
									timestamp: Date.now()
								})
							}
						} else {
							this.caseList = [...this.caseList, ...newCases]
						}
						
						// 判断是否还有更多数据
						this.noMore = newCases.length < this.pageSize || !apiData.hasMore
						
						if (!this.noMore) {
							this.page++
						}
						
						console.log(`成功加载 ${newCases.length} 条律师案例数据`)
						this.retryCount = 0 // 重置重试计数
						
					} else {
						throw new Error(response?.message || '获取案例数据失败')
					}
					
				} catch (error) {
					console.error('加载律师案例数据失败：', error)
					await this.handleLoadError(error)
				} finally {
					this.loading = false
				}
			},
			
			// 格式化案例数据
			formatCaseData(rawData) {
				if (!Array.isArray(rawData)) return []
				
				return rawData.map(item => ({
					id: item.id || item.caseId || Date.now() + Math.random(),
					title: item.title || item.caseName || '案例标题',
					description: item.description || item.summary || '案例描述',
					status: this.mapCaseStatus(item.status),
					statusText: this.getStatusText(item.status),
					clientName: item.clientName || item.applicantName || '委托人',
					createTime: this.formatDate(item.createTime || item.createdAt),
					progress: item.progress || item.currentStage || '进行中',
					amount: item.amount || 0,
					category: item.category || '法律咨询',
					lawyerId: item.lawyerId || '',
					documentId: item.documentId || ''
				}))
			},
			
			// 映射案例状态
			mapCaseStatus(status) {
				const statusMap = {
					'PENDING': 'pending',
					'IN_PROGRESS': 'processing',
					'PROCESSING': 'processing',
					'COMPLETED': 'completed',
					'CANCELLED': 'cancelled',
					'CLOSED': 'completed'
				}
				return statusMap[status] || 'pending'
			},
			
			// 获取状态文本
			getStatusText(status) {
				const textMap = {
					'pending': '待处理',
					'processing': '处理中',
					'completed': '已完成',
					'cancelled': '已取消'
				}
				return textMap[this.mapCaseStatus(status)] || '待处理'
			},
			
			// 处理加载错误
			async handleLoadError(error) {
				if (this.retryCount < this.maxRetries) {
					this.retryCount++
					const delay = Math.min(1000 * Math.pow(2, this.retryCount - 1), 8000) + Math.random() * 1000
					console.log(`第 ${this.retryCount} 次重试，延迟 ${Math.round(delay)}ms`)
					
					setTimeout(() => {
						this.loadData()
					}, delay)
					return
				}
				
				// 尝试使用缓存数据
				const cachedData = this.getCachedData()
				if (cachedData && this.page === 1) {
					console.log('API失败，使用缓存数据')
					this.caseList = cachedData.list
					uni.showToast({
						title: '使用缓存数据',
						icon: 'none',
						duration: 2000
					})
					return
				}
				
				// 使用默认数据
				if (this.page === 1) {
					this.caseList = this.getDefaultCaseData()
					uni.showToast({
						title: '网络异常，显示示例数据',
						icon: 'none',
						duration: 3000
					})
				} else {
					uni.showToast({
						title: '加载失败，请重试',
						icon: 'none',
						duration: 2000
					})
				}
			},
			
			// 获取默认案例数据
			getDefaultCaseData() {
				return [
					{
						id: 'default_1',
						title: '劳动纠纷案例',
						description: '处理劳动合同纠纷，包括工资、加班费等争议问题',
						status: 'processing',
						statusText: '处理中',
						clientName: '李先生',
						createTime: '2024-12-01',
						progress: '正在调解中'
					},
					{
						id: 'default_2',
						title: '合同纠纷案例',
						description: '处理买卖合同纠纷，涉及货物质量和付款问题',
						status: 'completed',
						statusText: '已完成',
						clientName: '王女士',
						createTime: '2024-11-15',
						progress: '已结案'
					}
				]
			},
			loadMore() {
				this.loadData()
			},
			
			// 下拉刷新
			async onRefresh() {
				this.refreshing = true
				this.page = 1
				this.caseList = []
				this.noMore = false
				this.retryCount = 0
				
				// 清除缓存，强制从服务器获取最新数据
				try {
					uni.removeStorageSync(this.cacheKey)
				} catch (error) {
					console.error('清除缓存失败：', error)
				}
				
				await this.loadData()
				this.refreshing = false
			},
			
			// 缓存管理方法
			getCachedData() {
				try {
					const cached = uni.getStorageSync(this.cacheKey)
					if (cached && cached.timestamp) {
						const now = Date.now()
						if (now - cached.timestamp < this.cacheExpiry) {
							return cached
						}
					}
				} catch (error) {
					console.error('获取缓存失败：', error)
				}
				return null
			},
			
			setCachedData(data) {
				try {
					uni.setStorageSync(this.cacheKey, {
						...data,
						timestamp: Date.now()
					})
				} catch (error) {
					console.error('设置缓存失败：', error)
				}
			},
			
			// 格式化日期
			formatDate(dateStr) {
				if (!dateStr) return '未知时间'
				
				try {
					const date = new Date(dateStr)
					if (isNaN(date.getTime())) return dateStr
					
					const year = date.getFullYear()
					const month = String(date.getMonth() + 1).padStart(2, '0')
					const day = String(date.getDate()).padStart(2, '0')
					return `${year}-${month}-${day}`
				} catch (error) {
					return dateStr
				}
			},
			
			goToDetail(id) {
				uni.navigateTo({
					url: `/pages/lawyer/cases/detail?id=${id}`
				})
			},
			handleUpdate(case_) {
				this.currentCase = case_
				this.updateForm.progress = case_.progress
				this.updateForm.description = ''
				this.$refs.updatePopup.open()
			},
			closeUpdatePopup() {
				this.$refs.updatePopup.close()
			},
			async submitUpdate() {
				if (!this.updateForm.progress.trim()) {
					uni.showToast({
						title: '请输入当前进度',
						icon: 'none'
					})
					return
				}
				
				if (!this.updateForm.description.trim()) {
					uni.showToast({
						title: '请输入进度说明',
						icon: 'none'
					})
					return
				}
				
				uni.showLoading({
					title: '更新中...'
				})
				
				try {
					// 构建更新数据
					const updateData = {
						caseId: this.currentCase.id,
						progress: this.updateForm.progress.trim(),
						description: this.updateForm.description.trim(),
						updateTime: new Date().toISOString()
					}
					
					console.log('正在更新案例进度：', updateData)
					
					// 这里可以调用更新案例进度的API
					// const response = await updateCaseProgress(updateData)
					
					// 模拟API调用成功
					await new Promise(resolve => setTimeout(resolve, 1000))
					
					uni.hideLoading()
					uni.showToast({
						title: '更新成功',
						icon: 'success'
					})
					
					// 更新列表数据
					const index = this.caseList.findIndex(item => item.id === this.currentCase.id)
					if (index !== -1) {
						this.caseList[index].progress = this.updateForm.progress
						// 如果有时间戳，也可以更新
						if (this.caseList[index].updateTime) {
							this.caseList[index].updateTime = updateData.updateTime
						}
					}
					
					// 清除相关缓存，确保下次加载最新数据
					try {
						uni.removeStorageSync(this.cacheKey)
					} catch (error) {
						console.error('清除缓存失败：', error)
					}
					
					this.closeUpdatePopup()
					
				} catch (error) {
					console.error('更新案例进度失败：', error)
					uni.hideLoading()
					uni.showToast({
						title: '更新失败，请重试',
						icon: 'none',
						duration: 2000
					})
				}
			},
			
			// 页面销毁时清理定时器
			onUnload() {
				if (this.searchTimeout) {
					clearTimeout(this.searchTimeout)
				}
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

.case-list {
	background-color: #fff;
	
	.case-item {
		padding: 30rpx;
		border-bottom: 1rpx solid #eee;
		
		.case-info {
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
					
					&.processing {
						color: #007AFF;
						background-color: rgba(0, 122, 255, 0.1);
					}
					
					&.completed {
						color: #4cd964;
						background-color: rgba(76, 217, 100, 0.1);
					}
					
					&.cancelled {
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
				
				.client, .time {
					font-size: 26rpx;
					color: #666;
					margin-right: 30rpx;
					
					.label {
						color: #999;
					}
				}
			}
			
			.progress {
				font-size: 26rpx;
				
				.label {
					color: #999;
				}
				
				.value {
					color: #007AFF;
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

.update-popup {
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
			
			input {
				width: 100%;
				height: 80rpx;
				background-color: #f5f5f5;
				border-radius: 8rpx;
				padding: 0 20rpx;
				font-size: 28rpx;
			}
			
			textarea {
				width: 100%;
				height: 200rpx;
				background-color: #f5f5f5;
				border-radius: 8rpx;
				padding: 20rpx;
				font-size: 28rpx;
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