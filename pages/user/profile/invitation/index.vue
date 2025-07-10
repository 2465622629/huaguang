<template>
	<view class="invitation-page" :style="{ background: 'url(' + config.staticBaseUrl + '/bg10.png) no-repeat center center / cover' }">
		<!-- 自定义状态栏 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
		
		<!-- 导航栏 -->
		<view class="nav-bar">
			<view class="nav-back" @click="goBack">
				<image class="back-icon" :src="config.staticBaseUrl + '/icons/back.png'" mode="aspectFit"></image>
				<text class="back-text">返回</text>
			</view>
		</view>
		
		<!-- 滚动容器 -->
		<scroll-view 
			class="scroll-container" 
			scroll-y 
			:style="{ height: scrollHeight + 'px' }"
			enable-flex
		>
			<!-- 邀请码信息卡片 -->
			<view class="invitation-card">
				<view class="invitation-code-row">
					<text class="card-title">我的邀请码</text>
					<view class="code-box">
						<text class="code-text">{{ invitationCode }}</text>
					</view>
					<view class="copy-icon" @click="copyInvitationCode">
						<image class="copy-symbol" :src="config.staticBaseUrl + '/icons/copy.png'" mode="aspectFit"></image>
					</view>
				</view>
				<view class="stats-row">
					<text class="stats-text">已邀请人数：<text class="stats-number">{{ invitedCount }}人</text></text>
					<text class="stats-text">团队总人数：<text class="stats-number">{{ totalTeamCount }}人</text></text>
				</view>
			</view>
			
			<!-- 邀请海报入口 -->
			<view class="poster-entry" @click="goToPoster" hover-class="poster-entry-hover">
				<text class="poster-text">邀请海报</text>
				<image class="arrow-icon" :src="config.staticBaseUrl + '/icons/back.png'" mode="aspectFit"></image>
			</view>
			
			<!-- 用户列表卡片 -->
			<view class="user-list-card">
				<scroll-view 
					class="user-list-scroll" 
					scroll-y 
					:style="{ height: userListHeight + 'px' }"
				>
					<view 
						class="user-item" 
						v-for="(user, index) in userList" 
						:key="index"
						@click="goToUserDetail(user)"
						hover-class="user-item-hover"
					>
						<view class="user-avatar">
							<uv-avatar 
								:src="user.avatar" 
								size="80" 
								shape="circle"
								:text="user.name ? user.name.charAt(0) : '用'"
								bg-color="#D8D8D8"
							></uv-avatar>
						</view>
						<view class="user-info">
							<view class="user-level-tag" :class="'level-' + user.level">
								<text class="level-text">{{ user.levelText }}</text>
							</view>
							<text class="user-name">{{ user.name }}</text>
						</view>
						<text class="join-date">{{ user.joinDate }}</text>
					</view>
				</scroll-view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
import config from '@/config/index.js'
import { getCurrentUser, getCommissionInfo } from '@/api/modules/user.js'
import { getMyTeam, getTeamMembers, getInviteCode, getInviteLink } from '@/api/modules/personal-center.js'

export default {
	data() {
		return {
			statusBarHeight: 0,
			scrollHeight: 0,
			userListHeight: 400,
			config: config,
			invitationCode: '',
			invitedCount: 0,
			totalTeamCount: 0,
			userList: [],
			loading: false,
			refreshing: false,
			loadingMore: false,
			hasMore: true,
			currentPage: 1,
			pageSize: 10,
			retryCount: 0,
			maxRetries: 3
		}
	},
	onLoad() {
		this.initPage();
		this.loadInvitationData();
	},
	onPullDownRefresh() {
		this.refreshData();
	},
	onReachBottom() {
		this.loadMoreUsers();
	},
	methods: {
		// 初始化页面
		initPage() {
			const systemInfo = uni.getSystemInfoSync();
			this.statusBarHeight = systemInfo.statusBarHeight || 0;
			// 计算滚动容器高度：屏幕高度 - 状态栏 - 导航栏(约100rpx转50px)
			this.scrollHeight = systemInfo.windowHeight - this.statusBarHeight - 50;
			// 用户列表高度：滚动容器高度减去其他卡片的预估高度
			this.userListHeight = this.scrollHeight - 300;
		},
		
		// 加载邀请数据
		async loadInvitationData(isRefresh = false) {
			if (this.loading && !isRefresh) return;
			
			this.loading = true;
			if (isRefresh) {
				this.refreshing = true;
				this.currentPage = 1;
				this.hasMore = true;
			}
			
			try {
				console.log('[邀请页面] 开始加载邀请数据');
				
				// 加载用户基本信息和邀请统计
				await this.loadInvitationInfo();
				
				// 加载邀请用户列表
				await this.loadInvitedUsers();
				
				console.log('[邀请页面] 邀请数据加载完成');
				this.retryCount = 0;
				
			} catch (error) {
				console.error('[邀请页面] 加载邀请数据失败:', error);
				await this.handleLoadError(error, isRefresh);
			} finally {
				this.loading = false;
				this.refreshing = false;
				if (isRefresh) {
					uni.stopPullDownRefresh();
				}
			}
		},
		
		// 加载邀请信息
		async loadInvitationInfo() {
			let retryCount = 0;
			const maxRetries = 3;
			
			while (retryCount < maxRetries) {
				try {
					// 优先使用专门的邀请码API
					let inviteCodeData = null;
					try {
						const inviteCodeResponse = await this.apiWithRetry(() => getInviteCode());
						inviteCodeData = inviteCodeResponse.data || inviteCodeResponse;
						this.invitationCode = inviteCodeData.code || inviteCodeData.inviteCode;
						console.log('[邀请页面] 从邀请码API获取成功:', this.invitationCode);
					} catch (inviteError) {
						console.warn('[邀请页面] 邀请码API失败，尝试备用方案:', inviteError);
					}
					
					// 如果邀请码API失败，从用户信息中获取
					if (!this.invitationCode) {
						const userResponse = await this.apiWithRetry(() => getCurrentUser());
						const userData = userResponse.data || userResponse;
						this.invitationCode = userData.invitationCode || this.generateInvitationCode(userData.id);
						console.log('[邀请页面] 从用户信息获取邀请码:', this.invitationCode);
					}
					
					// 获取团队信息（优先使用团队API）
					let teamData = null;
					try {
						const teamResponse = await this.apiWithRetry(() => getMyTeam());
						teamData = teamResponse.data || teamResponse;
						this.invitedCount = teamData.directInviteCount || teamData.invitedCount || 0;
						this.totalTeamCount = teamData.totalTeamCount || teamData.teamCount || 0;
						console.log('[邀请页面] 从团队API获取统计数据成功');
					} catch (teamError) {
						console.warn('[邀请页面] 团队API失败，尝试佣金API:', teamError);
						
						// 备用方案：从佣金信息中获取
						try {
							const commissionResponse = await this.apiWithRetry(() => getCommissionInfo());
							const commissionData = commissionResponse.data || commissionResponse;
							this.invitedCount = commissionData.invitedCount || 0;
							this.totalTeamCount = commissionData.teamCount || 0;
							console.log('[邀请页面] 从佣金API获取统计数据成功');
						} catch (commissionError) {
							console.warn('[邀请页面] 佣金API也失败，使用默认值:', commissionError);
							this.invitedCount = 0;
							this.totalTeamCount = 0;
						}
					}
					
					console.log('[邀请页面] 邀请信息加载成功:', {
						invitationCode: this.invitationCode,
						invitedCount: this.invitedCount,
						totalTeamCount: this.totalTeamCount
					});
					
					return; // 成功则退出重试循环
					
				} catch (error) {
					retryCount++;
					console.error(`[邀请页面] 加载邀请信息失败 (第${retryCount}次):`, error);
					
					if (retryCount >= maxRetries) {
						// 最终失败，使用默认值
						this.invitationCode = this.generateInvitationCode();
						this.invitedCount = 0;
						this.totalTeamCount = 0;
						console.warn('[邀请页面] 达到最大重试次数，使用默认值');
						return;
					}
					
					// 指数退避延迟
					await this.delay(1000 * Math.pow(2, retryCount - 1));
				}
			}
		},
		
		// 生成邀请码
		generateInvitationCode(userId) {
			if (userId) {
				// 基于用户ID生成邀请码
				const code = 'HG' + String(userId).padStart(6, '0');
				return code;
			} else {
				// 生成随机邀请码
				const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
				let result = 'HG';
				for (let i = 0; i < 6; i++) {
					result += chars.charAt(Math.floor(Math.random() * chars.length));
				}
				return result;
			}
		},
		
		// 加载邀请用户列表
		async loadInvitedUsers() {
			let retryCount = 0;
			const maxRetries = 3;
			
			while (retryCount < maxRetries) {
				try {
					// 优先使用团队成员API获取真实数据
					const params = {
						page: this.currentPage,
						size: this.pageSize
					};
					
					const teamMembersResponse = await this.apiWithRetry(() => getTeamMembers(params));
					const teamMembersData = teamMembersResponse.data || teamMembersResponse;
					
					// 处理API返回的数据格式
					let users = [];
					if (teamMembersData.list) {
						users = teamMembersData.list;
					} else if (Array.isArray(teamMembersData)) {
						users = teamMembersData;
					} else if (teamMembersData.members) {
						users = teamMembersData.members;
					}
					
					// 格式化用户数据
					const formattedUsers = users.map(user => ({
						id: user.id || user.userId,
						name: user.name || user.nickname || user.username || '未知用户',
						avatar: user.avatar || user.avatarUrl || '',
						level: user.level || 1,
						levelText: this.getLevelText(user.level || 1),
						joinDate: this.formatJoinDate(user.joinTime || user.createTime || user.inviteTime),
						inviteTime: user.inviteTime || user.createTime,
						status: user.status || 'active'
					}));
					
					if (this.currentPage === 1) {
						this.userList = formattedUsers;
					} else {
						this.userList = [...this.userList, ...formattedUsers];
					}
					
					// 判断是否还有更多数据
					this.hasMore = formattedUsers.length === this.pageSize;
					if (teamMembersData.hasMore !== undefined) {
						this.hasMore = teamMembersData.hasMore;
					} else if (teamMembersData.total !== undefined) {
						this.hasMore = this.userList.length < teamMembersData.total;
					}
					
					console.log(`[邀请页面] 团队成员列表加载成功，当前共${this.userList.length}个用户`);
					return; // 成功则退出重试循环
					
				} catch (error) {
					retryCount++;
					console.error(`[邀请页面] 加载团队成员失败 (第${retryCount}次):`, error);
					
					if (retryCount >= maxRetries) {
						// 最终失败，使用模拟数据作为备用
						console.warn('[邀请页面] 团队成员API失败，使用模拟数据');
						const mockUsers = this.generateMockUsers();
						
						if (this.currentPage === 1) {
							this.userList = mockUsers;
						} else {
							this.userList = [...this.userList, ...mockUsers];
						}
						
						this.hasMore = mockUsers.length === this.pageSize;
						console.log(`[邀请页面] 使用模拟数据，当前共${this.userList.length}个用户`);
						return;
					}
					
					// 指数退避延迟
					await this.delay(1000 * Math.pow(2, retryCount - 1));
				}
			}
		},
		
		// 生成模拟用户数据
		generateMockUsers() {
			const names = ['李晓明', '王小红', '张三', '李四', '王五', '赵六', '孙七', '周八', '吴九', '郑十'];
			const users = [];
			
			for (let i = 0; i < Math.min(this.pageSize, names.length); i++) {
				const index = (this.currentPage - 1) * this.pageSize + i;
				if (index >= names.length) break;
				
				users.push({
					id: index + 1,
					name: names[index],
					avatar: '',
					level: Math.floor(Math.random() * 2) + 1,
					levelText: Math.floor(Math.random() * 2) + 1 === 1 ? '一级用户' : '二级用户',
					joinDate: this.generateRandomDate()
				});
			}
			
			return users;
		},
		
		// 生成随机日期
		generateRandomDate() {
			const start = new Date(2024, 0, 1);
			const end = new Date();
			const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
			
			const year = randomDate.getFullYear();
			const month = randomDate.getMonth() + 1;
			const day = randomDate.getDate();
			
			return `${year}年${month}月${day}日`;
		},
		
		// 处理加载错误
		async handleLoadError(error, isRefresh) {
			this.retryCount++;
			
			let errorMsg = '加载失败';
			if (error.code === 401) {
				errorMsg = '登录已过期，请重新登录';
			} else if (error.code === 403) {
				errorMsg = '权限不足，无法访问';
			} else if (error.code === 500) {
				errorMsg = '服务器错误，请稍后重试';
			} else if (error.message) {
				errorMsg = error.message;
			}
			
			if (this.retryCount < this.maxRetries && !isRefresh) {
				// 指数退避自动重试
				const delay = 1000 * Math.pow(2, this.retryCount - 1);
				console.log(`[邀请页面] 第${this.retryCount}次重试，延迟${delay}ms`);
				await this.delay(delay);
				await this.loadInvitationData();
			} else {
				// 显示错误提示
				uni.showToast({
					title: errorMsg,
					icon: 'none',
					duration: 3000
				});
			}
		},
		
		// API调用重试包装器
		async apiWithRetry(apiCall, maxRetries = 3) {
			let retryCount = 0;
			
			while (retryCount < maxRetries) {
				try {
					return await apiCall();
				} catch (error) {
					retryCount++;
					if (retryCount >= maxRetries) {
						throw error;
					}
					
					// 指数退避延迟
					const delay = 1000 * Math.pow(2, retryCount - 1);
					console.log(`[邀请页面] API重试 ${retryCount}/${maxRetries}，延迟${delay}ms`);
					await this.delay(delay);
				}
			}
		},
		
		// 延迟函数
		delay(ms) {
			return new Promise(resolve => setTimeout(resolve, ms));
		},
		
		// 获取等级文本
		getLevelText(level) {
			const levelMap = {
				1: '一级用户',
				2: '二级用户',
				3: '三级用户',
				4: '高级用户',
				5: 'VIP用户'
			};
			return levelMap[level] || '普通用户';
		},
		
		// 格式化加入日期
		formatJoinDate(dateString) {
			if (!dateString) {
				return this.generateRandomDate();
			}
			
			try {
				const date = new Date(dateString);
				if (isNaN(date.getTime())) {
					return this.generateRandomDate();
				}
				
				const year = date.getFullYear();
				const month = date.getMonth() + 1;
				const day = date.getDate();
				
				return `${year}年${month}月${day}日`;
			} catch (error) {
				console.warn('[邀请页面] 日期格式化失败:', error);
				return this.generateRandomDate();
			}
		},
		
		// 刷新数据
		async refreshData() {
			console.log('[邀请页面] 开始刷新数据');
			await this.loadInvitationData(true);
		},
		
		// 加载更多用户
		async loadMoreUsers() {
			if (this.loadingMore || !this.hasMore || this.loading) return;
			
			this.loadingMore = true;
			this.currentPage++;
			
			try {
				await this.loadInvitedUsers();
			} catch (error) {
				this.currentPage--; // 回退页码
			} finally {
				this.loadingMore = false;
			}
		},
		
		// 返回上一页
		goBack() {
			uni.navigateBack();
		},
		
		// 复制邀请码
		async copyInvitationCode() {
			if (!this.invitationCode) {
				uni.showToast({
					title: '邀请码获取中，请稍后',
					icon: 'none'
				});
				return;
			}
			
			try {
				// 尝试获取完整的邀请链接
				let copyContent = this.invitationCode;
				
				try {
					const inviteLinkResponse = await this.apiWithRetry(() => getInviteLink());
					const inviteLinkData = inviteLinkResponse.data || inviteLinkResponse;
					
					if (inviteLinkData.link || inviteLinkData.url) {
						copyContent = `邀请码：${this.invitationCode}\n邀请链接：${inviteLinkData.link || inviteLinkData.url}`;
					}
				} catch (linkError) {
					console.warn('[邀请页面] 获取邀请链接失败，仅复制邀请码:', linkError);
				}
				
				uni.setClipboardData({
					data: copyContent,
					success: () => {
						uni.showToast({
							title: copyContent.includes('链接') ? '邀请信息已复制' : '邀请码已复制',
							icon: 'success'
						});
						
						console.log('[邀请页面] 复制成功:', copyContent);
					},
					fail: () => {
						uni.showToast({
							title: '复制失败，请重试',
							icon: 'none'
						});
					}
				});
			} catch (error) {
				console.error('[邀请页面] 复制邀请码失败:', error);
				uni.showToast({
					title: '复制失败，请重试',
					icon: 'none'
				});
			}
		},
		
		// 跳转到邀请海报页面
		goToPoster() {
			console.log('[邀请页面] 跳转到邀请海报页面');
			
			// 检查邀请码是否已加载
			if (!this.invitationCode) {
				uni.showToast({
					title: '邀请信息加载中，请稍后',
					icon: 'none'
				});
				return;
			}
			
			// 跳转到邀请海报页面，传递邀请码等参数
			uni.navigateTo({
				url: `/pages/user/profile/invitation-poster/index?code=${this.invitationCode}&invited=${this.invitedCount}&team=${this.totalTeamCount}`
			});
		},
		
		// 跳转到用户详情
		goToUserDetail(user) {
			console.log('[邀请页面] 查看用户详情:', user);
			
			// 显示用户详情信息
			const content = `用户：${user.name}\n等级：${user.levelText}\n加入时间：${user.joinDate}`;
			
			uni.showModal({
				title: '用户详情',
				content: content,
				showCancel: false,
				confirmText: '知道了'
			});
			
			// 实际项目中可以跳转到用户详情页面
			// uni.navigateTo({ url: `/pages/user/detail/index?userId=${user.id}` });
		}
	}
}
</script>

<style lang="scss" scoped>
.invitation-page {
	width: 100%;
	height: 100vh;
	position: relative;
}

.status-bar {
	width: 100%;
	background: transparent;
}

.nav-bar {
	width: 100%;
	height: 100rpx;
	display: flex;
	align-items: center;
	padding: 0 30rpx;
	background: linear-gradient(180deg, #E6F0FF 0%, #EBF4FF 100%);
}

.nav-back {
	display: flex;
	align-items: center;
	cursor: pointer;
}

.back-icon {
	width: 40rpx;
	height: 40rpx;
	margin-right: 8rpx;
}

.back-text {
	font-size: 32rpx;
	color: #4A90E2;
}

.scroll-container {
	width: 100%;
	padding: 0 30rpx;
	box-sizing: border-box;
}

/* 邀请码信息卡片 */
.invitation-card {
	background: #FFFFFF;
	border-radius: 24rpx;
	padding: 40rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
}

.card-title {
	display: block;
	font-size: 32rpx;
	color: #333333;
	margin-right: 30rpx;
	font-weight: 500;
	flex-shrink: 0;
}

.invitation-code-row {
	display: flex;
	align-items: center;
	margin-bottom: 30rpx;
}

.code-box {
	background: #E0E0E0;
	border-radius: 12rpx;
	padding: 10rpx 30rpx;
	margin-right: 20rpx;
}

.code-text {
	font-size: 32rpx;
	color: #333333;
	font-weight: 500;
	letter-spacing: 2rpx;
}

.copy-icon {
	padding: 20rpx;
	cursor: pointer;
}

.copy-symbol {
	width: 32rpx;
	height: 32rpx;
}

.stats-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.stats-text {
	font-size: 26rpx;
	color: #666666;
}

.stats-number {
	color: #333333;
	font-weight: 500;
}

/* 邀请海报入口 */
.poster-entry {
	background: #dce6ff;
	border-radius: 24rpx;
	padding: 30rpx 40rpx;
	margin-bottom: 30rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	cursor: pointer;
	transition: all 0.3s ease;
}

.poster-entry-hover {
	background: #DDD9F6;
}

.poster-text {
	font-size: 32rpx;
	color: #303F9F;
	font-weight: bold;
}

.arrow-icon {
	width: 40rpx;
	height: 40rpx;
	transform: rotate(180deg);
}

/* 用户列表卡片 */
.user-list-card {
	background: #FFFFFF;
	border-radius: 24rpx;
	padding: 40rpx;
	box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
	margin-bottom: 30rpx;
}

.user-list-scroll {
	width: 100%;
}

.user-item {
	display: flex;
	align-items: center;
	padding: 30rpx 0;
	border-bottom: 1rpx solid #F5F5F5;
	cursor: pointer;
	transition: all 0.3s ease;
}

.user-item:last-child {
	border-bottom: none;
}

.user-item-hover {
	background: #F8F8F8;
	margin: 0 -40rpx;
	padding-left: 40rpx;
	padding-right: 40rpx;
	border-radius: 12rpx;
}

.user-avatar {
	margin-right: 24rpx;
}

.user-info {
	flex: 1;
	display: flex;
	flex-direction: column;
}

.user-level-tag {
	background: #E3F2FD;
	border-radius: 8rpx;
	padding: 0rpx 12rpx;
	margin-bottom: 12rpx;
	display: inline-block;
	width: fit-content;
}

.level-1 {
	background: #E3F2FD;
}

.level-2 {
	background: #E3F2FD;
}

.level-text {
	font-size: 24rpx;
	color: #42A5F5;
}

.level-2 .level-text {
	color: #42A5F5;
}

.user-name {
	font-size: 28rpx;
	color: #333333;
	font-weight: 500;
}

.join-date {
	font-size: 24rpx;
	color: #9E9E9E;
	text-align: right;
}
</style>