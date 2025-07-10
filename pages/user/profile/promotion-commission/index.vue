<template>
	<view class="promotion-commission-page" :style="{ backgroundImage: 'url(' + backgroundImage + ')' }">
		<!-- 自定义状态栏 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
		
		<!-- 自定义导航栏 -->
		<view class="custom-navbar">
			<view class="navbar-content">
				<view class="back-button" @click="goBack">
					<uv-icon :name="backIconPath" size="32" color="#4A90E2"></uv-icon>
					<text class="back-text">返回</text>
				</view>
			</view>
		</view>
		
		<!-- 主内容区域 -->
		<scroll-view
			class="scroll-container"
			:style="{ height: scrollHeight + 'px' }"
			scroll-y="true"
			@scrolltolower="onLoadMore"
			refresher-enabled="true"
			:refresher-triggered="refreshing"
			@refresherrefresh="onRefresh"
		>
			<view class="main-content">
				<!-- 加载状态 -->
				<view v-if="loading && !commissionData" class="loading-state">
					<text class="loading-text">加载中...</text>
				</view>
				
				<!-- 佣金概览卡片 -->
				<view v-else class="commission-overview-card">
					<view class="total-amount">¥{{ formatAmount(commissionData.totalAmount) }}</view>
					<text class="amount-label">累计佣金 (元)</text>
					
					<view class="divider"></view>
					
					<view class="amount-details">
						<view class="amount-item">
							<text class="amount-value">¥{{ formatAmount(commissionData.withdrawnAmount) }}</text>
							<text class="amount-desc">已提现</text>
						</view>
						<view class="amount-item">
							<text class="amount-value">¥{{ formatAmount(commissionData.pendingAmount) }}</text>
							<text class="amount-desc">待提现</text>
						</view>
					</view>
					
					<uv-button
						text="提现"
						type="primary"
						size="large"
						:loading="withdrawing"
						:disabled="!canWithdraw"
						:customStyle="{
							backgroundColor: canWithdraw ? '#5291ff' : '#cccccc',
							borderRadius: '50rpx',
							height: '88rpx',
							fontWeight: 'normal',
							width: '85%',
							marginTop: '50rpx'
						}"
						:customTextStyle="{
							fontSize: '40rpx',
						}"
						@click="handleWithdraw"
					></uv-button>
				</view>
				
				<!-- 佣金记录卡片 -->
				<view class="commission-records-card">
					<text class="card-title">佣金记录</text>
					
					<!-- 记录列表 -->
					<view v-if="commissionRecords.length > 0" class="records-list">
						<view
							class="record-item"
							v-for="(record, index) in commissionRecords"
							:key="record.id || index"
							@click="handleRecordClick(record)"
						>
							<view class="record-avatar" :class="getRecordTypeClass(record.type)"></view>
							<view class="record-info">
								<text class="record-type">{{ record.type }}</text>
								<text class="record-time">{{ formatTime(record.time) }}</text>
							</view>
							<text class="record-amount" :class="getAmountClass(record.amount)">
								{{ formatRecordAmount(record.amount) }}
							</text>
						</view>
					</view>
					
					<!-- 空状态 -->
					<view v-else-if="!recordsLoading" class="empty-records">
						<text class="empty-text">暂无佣金记录</text>
					</view>
					
					<!-- 记录加载状态 -->
					<view v-if="recordsLoading" class="records-loading">
						<text class="loading-text">加载中...</text>
					</view>
					
					<!-- 加载更多提示 -->
					<view v-if="commissionRecords.length > 0" class="load-more">
						<text v-if="recordsLoading" class="load-text">加载中...</text>
						<text v-else-if="!hasMoreRecords" class="load-text">没有更多了</text>
						<text v-else class="load-text">上拉加载更多</text>
					</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
import { staticBaseUrl } from '@/config/index.js'
import { getCommissionInfo, getCommissionRecords, applyWithdraw } from '@/api/modules/user.js'

export default {
	name: 'PromotionCommission',
	data() {
		return {
			statusBarHeight: 0,
			scrollHeight: 0,
			backgroundImage: staticBaseUrl + '/bg10.png',
			backIconPath: staticBaseUrl + '/icons/back.png',
			
			// 加载状态
			loading: false,
			refreshing: false,
			recordsLoading: false,
			withdrawing: false,
			
			// 佣金数据
			commissionData: null,
			
			// 佣金记录
			commissionRecords: [],
			recordsPage: 1,
			recordsPageSize: 20,
			hasMoreRecords: true
		}
	},

	computed: {
		// 是否可以提现
		canWithdraw() {
			return this.commissionData &&
				   parseFloat(this.commissionData.pendingAmount || 0) > 0 &&
				   !this.withdrawing
		}
	},

	onLoad() {
		this.initPage()
		this.loadCommissionData()
	},

	onShow() {
		// 页面显示时刷新数据
		this.refreshData()
	},

	onPullDownRefresh() {
		this.onRefresh().then(() => {
			uni.stopPullDownRefresh()
		})
	},

	onReachBottom() {
		this.onLoadMore()
	},

	methods: {
		// 初始化页面
		initPage() {
			const systemInfo = uni.getSystemInfoSync()
			this.statusBarHeight = systemInfo.statusBarHeight || 0
			// 计算滚动容器高度：屏幕高度 - 状态栏 - 导航栏(约88rpx)
			this.scrollHeight = systemInfo.windowHeight - this.statusBarHeight - 44
		},

		// 加载佣金数据
		async loadCommissionData() {
			await Promise.all([
				this.loadCommissionInfo(),
				this.loadCommissionRecords(true)
			])
		},

		// 加载佣金概览信息
		async loadCommissionInfo() {
			if (this.loading) return
			
			this.loading = true
			
			try {
				const response = await getCommissionInfo()
				// 修复数据解析路径：处理新的API响应格式 response.data.commissionOverview
				const data = response.data || response
				const overview = data.commissionOverview || data
				
				this.commissionData = {
					totalAmount: overview.totalCommission || overview.totalAmount || 0,
					withdrawnAmount: overview.withdrawnAmount || 0,
					pendingAmount: overview.availableAmount || overview.pendingAmount || 0,
					availableAmount: overview.availableAmount || 0
				}
				
				console.log('佣金信息加载成功:', this.commissionData)
				
			} catch (error) {
				console.error('获取佣金信息失败:', error)
				
				// 使用默认数据作为fallback
				this.commissionData = {
					totalAmount: 0,
					withdrawnAmount: 0,
					pendingAmount: 0,
					availableAmount: 0
				}
				
				uni.showToast({
					title: '获取佣金信息失败',
					icon: 'none'
				})
			} finally {
				this.loading = false
			}
		},

		// 加载佣金记录
		async loadCommissionRecords(isRefresh = false) {
			if (this.recordsLoading) return
			
			if (isRefresh) {
				this.recordsPage = 1
				this.hasMoreRecords = true
				this.commissionRecords = []
			}
			
			this.recordsLoading = true
			
			try {
				const response = await getCommissionRecords({
					page: this.recordsPage,
					pageSize: this.recordsPageSize
				})
				
				// 修复数据解析路径：处理新的API响应格式 response.data.records
				const recordsData = response.data || response
				const records = recordsData.records || recordsData.list || recordsData || []
				
				// 处理数据格式：正确映射新API响应字段
				const formattedRecords = records.map(record => ({
					id: record.id,
					type: record.commissionSource || record.type || record.commissionType || '推广分成',
					time: record.recordTime || record.createdAt || record.time,
					amount: record.commissionAmount || record.amount,
					status: record.status,
					description: record.description || record.remark
				}))
				
				if (isRefresh) {
					this.commissionRecords = formattedRecords
				} else {
					this.commissionRecords.push(...formattedRecords)
				}
				
				// 检查是否还有更多数据
				this.hasMoreRecords = records.length >= this.recordsPageSize
				
				if (this.hasMoreRecords) {
					this.recordsPage++
				}
				
				console.log('佣金记录加载成功:', formattedRecords)
				
			} catch (error) {
				console.error('获取佣金记录失败:', error)
				uni.showToast({
					title: '获取佣金记录失败',
					icon: 'none'
				})
			} finally {
				this.recordsLoading = false
			}
		},

		// 格式化金额显示
		formatAmount(amount) {
			if (!amount && amount !== 0) return '0.00'
			return parseFloat(amount).toFixed(2)
		},

		// 格式化记录金额
		formatRecordAmount(amount) {
			if (!amount && amount !== 0) return '0.00'
			const num = parseFloat(amount)
			return (num >= 0 ? '+' : '') + num.toFixed(2)
		},

		// 格式化时间
		formatTime(timestamp) {
			if (!timestamp) return ''
			
			const date = new Date(timestamp)
			const now = new Date()
			const diff = now - date
			
			// 今天
			if (diff < 24 * 60 * 60 * 1000 && date.getDate() === now.getDate()) {
				return '今天 ' + date.toLocaleTimeString('zh-CN', {
					hour: '2-digit',
					minute: '2-digit'
				})
			}
			
			// 昨天
			const yesterday = new Date(now)
			yesterday.setDate(yesterday.getDate() - 1)
			if (date.getDate() === yesterday.getDate()) {
				return '昨天 ' + date.toLocaleTimeString('zh-CN', {
					hour: '2-digit',
					minute: '2-digit'
				})
			}
			
			// 其他日期
			return date.toLocaleDateString('zh-CN', {
				year: 'numeric',
				month: '2-digit',
				day: '2-digit',
				hour: '2-digit',
				minute: '2-digit'
			})
		},

		// 获取记录类型样式类
		getRecordTypeClass(type) {
			switch (type) {
				case '推广分成':
					return 'type-promotion'
				case '邀请奖励':
					return 'type-invitation'
				case '提现':
					return 'type-withdraw'
				default:
					return 'type-default'
			}
		},

		// 获取金额样式类
		getAmountClass(amount) {
			const num = parseFloat(amount || 0)
			return num >= 0 ? 'amount-positive' : 'amount-negative'
		},

		// 刷新数据
		refreshData() {
			this.loadCommissionData()
		},

		// 下拉刷新
		async onRefresh() {
			this.refreshing = true
			try {
				await this.loadCommissionData()
			} finally {
				this.refreshing = false
			}
		},

		// 上拉加载更多
		onLoadMore() {
			if (!this.recordsLoading && this.hasMoreRecords) {
				this.loadCommissionRecords(false)
			}
		},

		// 处理提现
		async handleWithdraw() {
			if (!this.canWithdraw) {
				uni.showToast({
					title: '暂无可提现金额',
					icon: 'none'
				})
				return
			}

			const pendingAmount = this.formatAmount(this.commissionData.pendingAmount)
			
			uni.showModal({
				title: '提现确认',
				content: `确定要提现 ¥${pendingAmount} 吗？`,
				success: async (res) => {
					if (res.confirm) {
						await this.submitWithdraw()
					}
				}
			})
		},

		// 提交提现申请
		async submitWithdraw() {
			this.withdrawing = true
			
			try {
				const withdrawData = {
					amount: parseFloat(this.commissionData.pendingAmount)
				}
				
				await applyWithdraw(withdrawData)
				
				uni.showToast({
					title: '提现申请已提交',
					icon: 'success'
				})
				
				// 刷新佣金信息
				setTimeout(() => {
					this.loadCommissionInfo()
					this.loadCommissionRecords(true)
				}, 1000)
				
			} catch (error) {
				console.error('提现申请失败:', error)
				uni.showToast({
					title: '提现申请失败',
					icon: 'none'
				})
			} finally {
				this.withdrawing = false
			}
		},
		
		// 返回上一页
		goBack() {
			uni.navigateBack()
		},
		
		// 处理记录点击
		handleRecordClick(record) {
			console.log('点击记录:', record)
			// 这里可以跳转到记录详情页面或显示详情弹窗
			uni.showModal({
				title: '佣金详情',
				content: `类型：${record.type}\n金额：¥${this.formatAmount(record.amount)}\n时间：${this.formatTime(record.time)}`,
				showCancel: false
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.promotion-commission-page {
	width: 100%;
	height: 100vh;
	background-size: cover;
	background-position: center;
	background-repeat: no-repeat;
	display: flex;
	flex-direction: column;
}

.status-bar {
	width: 100%;
	background: transparent;
}

.custom-navbar {
	width: 100%;
	height: 88rpx;
	display: flex;
	align-items: center;
	background: transparent;
	
	.navbar-content {
		width: 100%;
		padding: 0 30rpx;
		
		.back-button {
			display: flex;
			align-items: center;
			
			.back-text {
				font-size: 32rpx;
				color: #4A90E2;
				margin-left: 8rpx;
				font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
			}
		}
	}
}

.scroll-container {
	flex: 1;
}

.main-content {
	padding: 40rpx 30rpx 30rpx 30rpx;
}

/* 加载状态 */
.loading-state {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 120rpx 0;
}

.loading-text {
	color: #999;
	font-size: 28rpx;
	font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
}

/* 佣金概览卡片 */
.commission-overview-card {
	background: rgba(255, 255, 255, 0.95);
	border-radius: 20rpx;
	padding: 40rpx 40rpx 50rpx 40rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
	backdrop-filter: blur(10rpx);
	display: flex;
	flex-direction: column;
	align-items: center;
	
	.total-amount {
		font-size: 64rpx;
		font-weight: bold;
		color: #333333;
		margin-bottom: 8rpx;
		font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
	}
	
	.amount-label {
		font-size: 32rpx;
		color: #666666;
		margin-bottom: 30rpx;
		font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
	}
	
	.divider {
		width: 90%;
		height: 1rpx;
		background-color: #EEEEEE;
		margin-bottom: 30rpx;
	}
	
	.amount-details {
		display: flex;
		justify-content: space-around;
		width: 100%;
		margin-bottom: 20rpx;
		
		.amount-item {
			display: flex;
			flex-direction: column;
			align-items: center;
			
			.amount-value {
				font-size: 36rpx;
				color: #000;
				margin-bottom: 8rpx;
				font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
				font-weight: 600;
			}
			
			.amount-desc {
				font-size: 24rpx;
				color: #888888;
				font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
			}
		}
	}
}

/* 佣金记录卡片 */
.commission-records-card {
	background: rgba(255, 255, 255, 0.95);
	border-radius: 20rpx;
	padding: 30rpx 40rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
	backdrop-filter: blur(10rpx);
	
	.card-title {
		display: block;
		font-size: 36rpx;
		font-weight: bold;
		color: #333333;
		margin-bottom: 30rpx;
		font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
	}
	
	.records-list {
		.record-item {
			display: flex;
			align-items: center;
			padding: 24rpx 0;
			border-bottom: 1rpx solid #F0F0F0;
			
			&:last-child {
				border-bottom: none;
			}
			
			.record-avatar {
				width: 80rpx;
				height: 80rpx;
				border-radius: 50%;
				margin-right: 20rpx;
				flex-shrink: 0;
				display: flex;
				align-items: center;
				justify-content: center;
				
				&.type-promotion {
					background: linear-gradient(135deg, #FF6B6B, #FF8E8E);
				}
				
				&.type-invitation {
					background: linear-gradient(135deg, #4ECDC4, #44A08D);
				}
				
				&.type-withdraw {
					background: linear-gradient(135deg, #45B7D1, #96C93D);
				}
				
				&.type-default {
					background: linear-gradient(135deg, #A8A8A8, #C0C0C0);
				}
			}
			
			.record-info {
				flex: 1;
				display: flex;
				flex-direction: column;
				
				.record-type {
					font-size: 30rpx;
					color: #333333;
					margin-bottom: 4rpx;
					font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
					font-weight: 500;
				}
				
				.record-time {
					font-size: 24rpx;
					color: #999999;
					font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
				}
			}
			
			.record-amount {
				font-size: 30rpx;
				font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
				font-weight: 600;
				
				&.amount-positive {
					color: #52C41A;
				}
				
				&.amount-negative {
					color: #FF4D4F;
				}
			}
		}
	}
	
	/* 空状态 */
	.empty-records {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 80rpx 0;
		
		.empty-text {
			color: #999;
			font-size: 28rpx;
			font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
		}
	}
	
	/* 记录加载状态 */
	.records-loading {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 40rpx 0;
	}
	
	/* 加载更多 */
	.load-more {
		display: flex;
		justify-content: center;
		padding: 30rpx 0 10rpx;
		
		.load-text {
			color: #999;
			font-size: 24rpx;
			font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
		}
	}
}
</style>
