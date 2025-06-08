<template>
	<view class="promotion-commission-page" :style="{ backgroundImage: `url(${backgroundImage})` }">
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
		<view class="main-content">
			<!-- 佣金概览卡片 -->
			<view class="commission-overview-card">
				<view class="total-amount">¥{{ commissionData.totalAmount }}</view>
				<text class="amount-label">累计佣金 (元)</text>
				
				<view class="divider"></view>
				
				<view class="amount-details">
					<view class="amount-item">
						<text class="amount-value">¥{{ commissionData.withdrawnAmount }}</text>
						<text class="amount-desc">已提现</text>
					</view>
					<view class="amount-item">
						<text class="amount-value">¥{{ commissionData.pendingAmount }}</text>
						<text class="amount-desc">待提现</text>
					</view>
				</view>
				
				<uv-button 
					text="提现"
					type="primary"
                    size="large"
					:customStyle="{
						backgroundColor: '#5291ff',
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
				
				<view class="records-list">
					<view 
						class="record-item" 
						v-for="(record, index) in commissionRecords" 
						:key="index"
						@click="handleRecordClick(record)"
					>
						<view class="record-avatar"></view>
						<view class="record-info">
							<text class="record-type">{{ record.type }}</text>
							<text class="record-time">{{ record.time }}</text>
						</view>
						<text class="record-amount">{{ record.amount }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { staticBaseUrl } from '@/config/index.js'

export default {
	name: 'PromotionCommission',
	data() {
		return {
			statusBarHeight: 0,
			backgroundImage: staticBaseUrl + '/bg10.png',
			backIconPath: staticBaseUrl + '/icons/back.png',
			// 佣金数据
			commissionData: {
				totalAmount: '3,560.00',
				withdrawnAmount: '1,780.00',
				pendingAmount: '780.00'
			},
			// 佣金记录
			commissionRecords: [
				{
					type: '推广分成',
					time: '2025年3月10日 15:32',
					amount: '+300.00'
				},
				{
					type: '推广分成',
					time: '2025年3月10日 15:32',
					amount: '+300.00'
				},
				{
					type: '推广分成',
					time: '2025年3月10日 15:32',
					amount: '+300.00'
				}
			]
		}
	},
	onLoad() {
		this.initPage();
	},
	methods: {
		// 初始化页面
		initPage() {
			const systemInfo = uni.getSystemInfoSync();
			this.statusBarHeight = systemInfo.statusBarHeight || 0;
		},
		
		// 返回上一页
		goBack() {
			uni.navigateBack();
		},
		
		// 处理提现
		handleWithdraw() {
			uni.showModal({
				title: '提现确认',
				content: `确定要提现 ¥${this.commissionData.pendingAmount} 吗？`,
				success: (res) => {
					if (res.confirm) {
						// 这里可以调用提现API
						uni.showToast({
							title: '提现申请已提交',
							icon: 'success'
						});
					}
				}
			});
		},
		
		// 处理记录点击
		handleRecordClick(record) {
			console.log('点击记录:', record);
			// 这里可以跳转到记录详情页面
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
			}
		}
	}
}

.main-content {
	padding: 40rpx 30rpx 30rpx 30rpx;
}

/* 佣金概览卡片 */
.commission-overview-card {
	background: #FFFFFF;
	border-radius: 20rpx;
	padding: 40rpx 40rpx 50rpx 40rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
	display: flex;
	flex-direction: column;
	align-items: center;
	
	.total-amount {
		font-size: 64rpx;
		font-weight: bold;
		color: #333333;
		margin-bottom: 8rpx;
	}
	
	.amount-label {
		font-size: 32rpx;
		color: #666666;
		margin-bottom: 30rpx;
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
			}
			
			.amount-desc {
				font-size: 24rpx;
				color: #888888;
			}
		}
	}
}

/* 佣金记录卡片 */
.commission-records-card {
	background: #FFFFFF;
	border-radius: 20rpx;
	padding: 30rpx 40rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
	
	.card-title {
		display: block;
		font-size: 36rpx;
		font-weight: bold;
		color: #333333;
		margin-bottom: 30rpx;
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
				background-color: #E0E0E0;
				margin-right: 20rpx;
				flex-shrink: 0;
			}
			
			.record-info {
				flex: 1;
				display: flex;
				flex-direction: column;
				
				.record-type {
					font-size: 30rpx;
					color: #333333;
					margin-bottom: 4rpx;
				}
				
				.record-time {
					font-size: 24rpx;
					color: #999999;
				}
			}
			
			.record-amount {
				font-size: 30rpx;
				color: #000;
			}
		}
	}
}
</style>
