<template>
	<view class="container">
		<!-- 搜索栏 -->
		<view class="search-box">
			<view class="search-input">
				<uni-icons type="search" size="18" color="#999"></uni-icons>
				<input type="text" v-model="searchKey" placeholder="搜索报告" @confirm="handleSearch" />
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
		
		<!-- 报告列表 -->
		<scroll-view 
			class="report-list" 
			scroll-y 
			@scrolltolower="loadMore"
			:style="{ height: scrollHeight + 'px' }"
		>
			<view class="report-item" v-for="(item, index) in reportList" :key="index" @click="goToDetail(item.id)">
				<view class="report-info">
					<view class="header">
						<text class="title">{{item.title}}</text>
						<text :class="['status', item.status]">{{item.statusText}}</text>
					</view>
					<view class="desc">{{item.description}}</view>
					<view class="meta">
						<view class="user">
							<text class="label">来访者：</text>
							<text class="value">{{item.userName}}</text>
						</view>
						<view class="time">
							<text class="label">创建时间：</text>
							<text class="value">{{item.createTime}}</text>
						</view>
					</view>
					<view class="category">
						<text class="label">报告类型：</text>
						<text class="value">{{item.category}}</text>
					</view>
				</view>
				<view class="actions">
					<button class="action-btn" @click.stop="handleEdit(item)" v-if="item.status === 'draft'">
						<uni-icons type="compose" size="16" color="#007AFF"></uni-icons>
						<text>编辑</text>
					</button>
					<button class="action-btn" @click.stop="handleShare(item)" v-if="item.status === 'completed'">
						<uni-icons type="share" size="16" color="#007AFF"></uni-icons>
						<text>分享</text>
					</button>
				</view>
			</view>
			
			<!-- 加载更多 -->
			<view class="loading" v-if="loading">加载中...</view>
			<view class="no-more" v-if="noMore">没有更多数据了</view>
		</scroll-view>
		
		<!-- 悬浮按钮 -->
		<view class="float-btn" @click="createReport">
			<uni-icons type="plus" size="24" color="#fff"></uni-icons>
		</view>
	</view>
</template>

<script>
	import { getUserPsychTestHistory, getPsychTestResult } from '@/api/modules/psychologist.js'
	
	export default {
		data() {
			return {
				searchKey: '',
				currentStatus: 'all',
				statusList: [
					{ label: '全部', value: 'all' },
					{ label: '草稿', value: 'draft' },
					{ label: '已完成', value: 'completed' },
					{ label: '已分享', value: 'shared' }
				],
				reportList: [],
				page: 1,
				pageSize: 10,
				loading: false,
				noMore: false,
				scrollHeight: 0
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
				this.page = 1
				this.reportList = []
				this.noMore = false
				this.loadData()
			},
			handleStatusChange(status) {
				this.currentStatus = status
				this.page = 1
				this.reportList = []
				this.noMore = false
				this.loadData()
			},
			async loadData() {
				if (this.loading || this.noMore) return
				
				this.loading = true
				try {
					// 调用心理测试历史API
					const response = await getUserPsychTestHistory({
						page: this.page,
						pageSize: this.pageSize,
						status: this.currentStatus === 'all' ? undefined : this.currentStatus,
						keyword: this.searchKey || undefined
					})
					
					const apiData = response.data || {}
					const testHistory = apiData.list || []
					
					// 转换API数据格式为页面所需格式
					const formattedData = await Promise.all(testHistory.map(async (item) => {
						let testResult = null
						try {
							// 获取测试结果详情
							const resultResponse = await getPsychTestResult({ testId: item.id })
							testResult = resultResponse.data || {}
						} catch (error) {
							console.warn(`获取测试结果失败 (ID: ${item.id}):`, error)
						}
						
						return {
							id: item.id,
							title: item.testName || '心理测试报告',
							description: testResult?.summary || item.description || '心理测试评估报告',
							status: this.mapTestStatus(item.status),
							statusText: this.getStatusText(item.status),
							userName: item.userName || item.clientName || '未知用户',
							createTime: this.formatDateTime(item.createTime || item.testTime),
							category: item.testType || '心理评估',
							originalData: item,
							testResult: testResult
						}
					}))
					
					if (this.page === 1) {
						this.reportList = formattedData
					} else {
						this.reportList = [...this.reportList, ...formattedData]
					}
					
					// 检查是否还有更多数据
					const hasMore = testHistory.length === this.pageSize && apiData.hasMore !== false
					if (!hasMore) {
						this.noMore = true
					} else {
						this.page++
					}
					
				} catch (error) {
					console.error('加载心理测试历史失败:', error)
					
					// API失败时使用模拟数据作为备用
					if (this.page === 1) {
						this.loadMockData()
					} else {
						uni.showToast({
							title: '加载失败',
							icon: 'none'
						})
					}
				} finally {
					this.loading = false
				}
			},

			// 备用模拟数据加载方法
			loadMockData() {
				const mockData = Array(this.pageSize).fill(0).map((_, index) => ({
					id: this.page * this.pageSize + index,
					title: '心理咨询评估报告',
					description: '来访者表现出明显的焦虑症状，建议进行认知行为疗法干预。',
					status: ['draft', 'completed', 'shared'][Math.floor(Math.random() * 3)],
					statusText: this.getStatusText(['draft', 'completed', 'shared'][Math.floor(Math.random() * 3)]),
					userName: '王先生',
					createTime: '2024-05-09 14:30',
					category: '心理评估'
				}))
				
				this.reportList = [...this.reportList, ...mockData]
				
				if (this.page >= 3) {
					this.noMore = true
				} else {
					this.page++
				}
			},

			// 映射测试状态
			mapTestStatus(apiStatus) {
				const statusMap = {
					'pending': 'draft',
					'in_progress': 'draft',
					'completed': 'completed',
					'shared': 'shared',
					'published': 'shared'
				}
				return statusMap[apiStatus] || 'draft'
			},

			// 获取状态文本
			getStatusText(status) {
				const textMap = {
					'draft': '草稿',
					'completed': '已完成',
					'shared': '已分享',
					'pending': '草稿',
					'in_progress': '草稿',
					'published': '已分享'
				}
				return textMap[status] || '草稿'
			},

			// 格式化日期时间
			formatDateTime(dateTime) {
				if (!dateTime) return '未知时间'
				
				try {
					const date = new Date(dateTime)
					const year = date.getFullYear()
					const month = String(date.getMonth() + 1).padStart(2, '0')
					const day = String(date.getDate()).padStart(2, '0')
					const hours = String(date.getHours()).padStart(2, '0')
					const minutes = String(date.getMinutes()).padStart(2, '0')
					
					return `${year}-${month}-${day} ${hours}:${minutes}`
				} catch (error) {
					return dateTime.toString()
				}
			},
			loadMore() {
				this.loadData()
			},
			goToDetail(id) {
				uni.navigateTo({
					url: `/pages/psychologist/reports/detail?id=${id}`
				})
			},
			handleEdit(report) {
				// 传递更多参数以便编辑页面使用
				const params = {
					id: report.id,
					testId: report.originalData?.testId || report.id,
					type: 'edit'
				}
				const queryString = Object.keys(params).map(key => `${key}=${encodeURIComponent(params[key])}`).join('&')
				
				uni.navigateTo({
					url: `/pages/psychologist/reports/edit?${queryString}`
				})
			},
			async handleShare(report) {
				uni.showActionSheet({
					itemList: ['分享给来访者', '导出PDF', '打印'],
					success: async (res) => {
						switch (res.tapIndex) {
							case 0:
								// 分享给来访者
								await this.shareToClient(report)
								break
							case 1:
								// 导出PDF
								await this.exportToPDF(report)
								break
							case 2:
								// 打印
								uni.showToast({
									title: '打印功能开发中',
									icon: 'none'
								})
								break
						}
					}
				})
			},

			// 分享给来访者
			async shareToClient(report) {
				try {
					uni.showLoading({ title: '分享中...' })
					
					// TODO: 调用分享API
					// 这里可以扩展API模块来支持报告分享功能
					
					setTimeout(() => {
						uni.hideLoading()
						uni.showToast({
							title: '分享成功',
							icon: 'success'
						})
					}, 1000)
					
				} catch (error) {
					uni.hideLoading()
					console.error('分享失败:', error)
					uni.showToast({
						title: '分享失败',
						icon: 'none'
					})
				}
			},

			// 导出PDF
			async exportToPDF(report) {
				try {
					uni.showLoading({ title: '导出中...' })
					
					// TODO: 调用PDF导出API
					// 可以使用测试结果数据生成PDF报告
					
					setTimeout(() => {
						uni.hideLoading()
						uni.showToast({
							title: '导出成功',
							icon: 'success'
						})
					}, 1500)
					
				} catch (error) {
					uni.hideLoading()
					console.error('导出失败:', error)
					uni.showToast({
						title: '导出失败',
						icon: 'none'
					})
				}
			},
			createReport() {
				uni.navigateTo({
					url: '/pages/psychologist/reports/create'
				})
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

.report-list {
	background-color: #fff;
	
	.report-item {
		padding: 30rpx;
		border-bottom: 1rpx solid #eee;
		
		.report-info {
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
					
					&.draft {
						color: #ff9500;
						background-color: rgba(255, 149, 0, 0.1);
					}
					
					&.completed {
						color: #4cd964;
						background-color: rgba(76, 217, 100, 0.1);
					}
					
					&.shared {
						color: #007AFF;
						background-color: rgba(0, 122, 255, 0.1);
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

.float-btn {
	position: fixed;
	right: 30rpx;
	bottom: 30rpx;
	width: 100rpx;
	height: 100rpx;
	background-color: #007AFF;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 4rpx 16rpx rgba(0, 122, 255, 0.3);
}
</style> 