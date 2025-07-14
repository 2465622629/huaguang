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
import { 
	getMyTeam, 
	getTeamMembers, 
	copyInviteCode, 
	getInviteLink, 
	getInviteInfo, 
	getInviteStats,
	generateInvitePosterGeneral 
} from '@/api/modules/personal-center.js'

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
					// 优先使用getInviteInfo获取完整邀请信息
					try {
						const inviteInfoResponse = await this.apiWithRetry(() => getInviteInfo());
						const inviteInfoData = inviteInfoResponse.data || inviteInfoResponse;
						
						// 从邀请信息API获取邀请码和基础数据
						this.invitationCode = inviteInfoData.inviteCode;
						this.invitedCount = inviteInfoData.inviteCount || 0;
						
						console.log('[邀请页面] 从邀请信息API获取成功:', {
							inviteCode: this.invitationCode,
							inviteCount: this.invitedCount
						});
						
						// 获取邀请统计数据
						try {
							const inviteStatsResponse = await this.apiWithRetry(() => getInviteStats());
							const inviteStatsData = inviteStatsResponse.data || inviteStatsResponse;
							
							// 更新统计数据
							this.invitedCount = inviteStatsData.totalInvites || this.invitedCount;
							this.totalTeamCount = inviteStatsData.totalInvites || this.invitedCount; // 如果没有团队总数，使用邀请总数
							
							console.log('[邀请页面] 从邀请统计API获取成功:', {
								totalInvites: inviteStatsData.totalInvites,
								monthlyInvites: inviteStatsData.monthlyInvites
							});
						} catch (statsError) {
							console.warn('[邀请页面] 邀请统计API失败，使用基础数据:', statsError);
						}
						
					} catch (inviteInfoError) {
						console.warn('[邀请页面] 邀请信息API失败，尝试备用方案:', inviteInfoError);
						
						// 备用方案1：使用copyInviteCode获取邀请码
						try {
							const inviteCodeResponse = await this.apiWithRetry(() => copyInviteCode());
							const inviteCodeData = inviteCodeResponse.data || inviteCodeResponse;
							this.invitationCode = inviteCodeData || inviteCodeData.code || inviteCodeData.inviteCode;
							console.log('[邀请页面] 从邀请码API获取成功:', this.invitationCode);
						} catch (inviteCodeError) {
							console.warn('[邀请页面] 邀请码API失败:', inviteCodeError);
						}
						
						// 备用方案2：从团队信息中获取统计数据
						try {
							const teamResponse = await this.apiWithRetry(() => getMyTeam());
							const teamData = teamResponse.data || teamResponse;
							
							// 从团队API获取邀请码（如果之前没获取到）
							if (!this.invitationCode && teamData.inviteCodeInfo) {
								this.invitationCode = teamData.inviteCodeInfo.inviteCode;
							}
							
							// 优先使用inviteCodeInfo中的数据
							if (teamData.inviteCodeInfo) {
								this.invitedCount = teamData.inviteCodeInfo.inviteCount || 0;
								this.totalTeamCount = teamData.inviteCodeInfo.totalTeamMembers || 0;
							}
							
							// 如果inviteCodeInfo中没有数据，使用teamStatistics
							if (teamData.teamStatistics && this.totalTeamCount === 0) {
								this.totalTeamCount = teamData.teamStatistics.totalMembers || 0;
								// 如果inviteCount没有设置，使用一级成员数作为直接邀请数
								if (this.invitedCount === 0) {
									this.invitedCount = teamData.teamStatistics.firstLevelCount || 0;
								}
							}
							
							console.log('[邀请页面] 从团队API获取成功:', {
								inviteCode: this.invitationCode,
								invitedCount: this.invitedCount,
								totalTeamCount: this.totalTeamCount
							});
						} catch (teamError) {
							console.warn('[邀请页面] 团队API失败，使用默认值:', teamError);
							
							// 最后备用方案：生成邀请码，使用默认统计
							if (!this.invitationCode) {
								this.invitationCode = this.generateInvitationCode();
							}
							this.invitedCount = 0;
							this.totalTeamCount = 0;
						}
					}
					
					console.log('[邀请页面] 邀请信息加载完成:', {
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
					// 第一页时优先使用getMyTeam获取完整团队数据
					if (this.currentPage === 1) {
						try {
							const teamResponse = await this.apiWithRetry(() => getMyTeam());
							const teamData = teamResponse.data || teamResponse;
							
							// 从getMyTeam获取团队成员
							if (teamData.teamMembers && Array.isArray(teamData.teamMembers)) {
								const formattedUsers = teamData.teamMembers.map(member => ({
									id: member.memberId,
									name: member.memberName || '未知用户',
									avatar: member.avatarUrl || '',
									level: this.parseLevelFromText(member.memberLevel),
									levelText: member.memberLevel || '普通用户',
									joinDate: this.formatJoinDate(member.joinTime),
									contributedCommission: member.contributedCommission || 0,
									status: member.status || 'active'
								}));
								
								this.userList = formattedUsers;
								this.hasMore = formattedUsers.length === this.pageSize;
								
								console.log(`[邀请页面] 从getMyTeam获取团队成员成功，共${formattedUsers.length}个用户`);
								return; // 成功则退出重试循环
							}
						} catch (teamError) {
							console.warn('[邀请页面] getMyTeam失败，尝试getTeamMembers:', teamError);
						}
					}
					
					// 备用方案：使用分页的团队成员API
					const params = {
						page: this.currentPage,
						size: this.pageSize
					};
					
					const teamMembersResponse = await this.apiWithRetry(() => getTeamMembers(params));
					const teamMembersData = teamMembersResponse.data || teamMembersResponse;
					
					// 处理API返回的数据格式
					let users = [];
					if (teamMembersData.records) {
						// MyBatis Plus分页格式
						users = teamMembersData.records;
						this.hasMore = this.userList.length + users.length < teamMembersData.total;
					} else if (teamMembersData.list) {
						users = teamMembersData.list;
					} else if (Array.isArray(teamMembersData)) {
						users = teamMembersData;
					} else if (teamMembersData.members) {
						users = teamMembersData.members;
					}
					
					// 格式化用户数据
					const formattedUsers = users.map(user => ({
						id: user.memberId || user.id || user.userId,
						name: user.memberName || user.name || user.nickname || user.username || '未知用户',
						avatar: user.avatarUrl || user.avatar || '',
						level: this.parseLevelFromText(user.memberLevel) || user.level || 1,
						levelText: user.memberLevel || this.getLevelText(user.level || 1),
						joinDate: this.formatJoinDate(user.joinTime || user.createTime || user.inviteTime),
						contributedCommission: user.contributedCommission || 0,
						status: user.status || 'active'
					}));
					
					if (this.currentPage === 1) {
						this.userList = formattedUsers;
					} else {
						this.userList = [...this.userList, ...formattedUsers];
					}
					
					// 判断是否还有更多数据
					if (teamMembersData.hasMore !== undefined) {
						this.hasMore = teamMembersData.hasMore;
					} else if (teamMembersData.total !== undefined) {
						this.hasMore = this.userList.length < teamMembersData.total;
					} else {
						this.hasMore = formattedUsers.length === this.pageSize;
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
		
		// 从等级文本解析数字等级
		parseLevelFromText(levelText) {
			if (!levelText) return 1;
			
			const levelMap = {
				'一级用户': 1,
				'二级用户': 2,
				'三级用户': 3,
				'高级用户': 4,
				'VIP用户': 5,
				'普通用户': 1
			};
			
			return levelMap[levelText] || 1;
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
				// 优先使用copyInviteCode API获取最新邀请码
				let copyContent = this.invitationCode;
				let latestInviteCode = this.invitationCode;
				
				try {
					const inviteCodeResponse = await this.apiWithRetry(() => copyInviteCode());
					const inviteCodeData = inviteCodeResponse.data || inviteCodeResponse;
					latestInviteCode = inviteCodeData || inviteCodeData.code || inviteCodeData.inviteCode || this.invitationCode;
					copyContent = latestInviteCode;
					console.log('[邀请页面] 获取最新邀请码成功:', latestInviteCode);
				} catch (codeError) {
					console.warn('[邀请页面] 获取邀请码API失败，使用当前邀请码:', codeError);
				}
				
				// 尝试获取完整的邀请链接
				try {
					const inviteLinkResponse = await this.apiWithRetry(() => getInviteLink());
					const inviteLinkData = inviteLinkResponse.data || inviteLinkResponse;
					
					if (inviteLinkData && (inviteLinkData.link || inviteLinkData.url || typeof inviteLinkData === 'string')) {
						const inviteLink = inviteLinkData.link || inviteLinkData.url || inviteLinkData;
						copyContent = `邀请码：${latestInviteCode}\n邀请链接：${inviteLink}`;
						console.log('[邀请页面] 获取邀请链接成功');
					}
				} catch (linkError) {
					console.warn('[邀请页面] 获取邀请链接失败，仅复制邀请码:', linkError);
				}
				
				// 执行复制操作
				uni.setClipboardData({
					data: copyContent,
					success: () => {
						uni.showToast({
							title: copyContent.includes('链接') ? '邀请信息已复制' : '邀请码已复制',
							icon: 'success'
						});
						
						// 更新当前显示的邀请码
						if (latestInviteCode !== this.invitationCode) {
							this.invitationCode = latestInviteCode;
						}
						
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
		async goToPoster() {
			console.log('[邀请页面] 开始生成邀请海报');
			
			// 检查邀请码是否已加载
			if (!this.invitationCode) {
				uni.showToast({
					title: '邀请信息加载中，请稍后',
					icon: 'none'
				});
				return;
			}
			
			// 显示加载中
			uni.showLoading({
				title: '生成海报中...',
				mask: true
			});
			
			try {
				// 调用生成邀请海报API
				const posterResponse = await this.apiWithRetry(() => generateInvitePosterGeneral());
				const posterData = posterResponse.data || posterResponse;
				
				// 获取海报URL
				const posterUrl = posterData.posterUrl || posterData.url || posterData;
				
				if (posterUrl) {
					console.log('[邀请页面] 海报生成成功:', posterUrl);
					
					// 跳转到邀请海报页面，传递海报URL和其他参数
					uni.navigateTo({
						url: `/pages/user/profile/invitation-poster/index?posterUrl=${encodeURIComponent(posterUrl)}&code=${this.invitationCode}&invited=${this.invitedCount}&team=${this.totalTeamCount}`
					});
				} else {
					// 如果API返回成功但没有海报URL，使用默认跳转
					console.warn('[邀请页面] 海报生成成功但未返回URL，使用默认跳转');
					uni.navigateTo({
						url: `/pages/user/profile/invitation-poster/index?code=${this.invitationCode}&invited=${this.invitedCount}&team=${this.totalTeamCount}`
					});
				}
				
			} catch (error) {
				console.error('[邀请页面] 生成海报失败:', error);
				
				// 海报生成失败，仍然可以跳转到海报页面，让页面内部处理
				uni.showToast({
					title: '海报生成失败，将使用默认模板',
					icon: 'none',
					duration: 2000
				});
				
				setTimeout(() => {
					uni.navigateTo({
						url: `/pages/user/profile/invitation-poster/index?code=${this.invitationCode}&invited=${this.invitedCount}&team=${this.totalTeamCount}`
					});
				}, 2000);
			} finally {
				uni.hideLoading();
			}
		},
		
		// 跳转到用户详情
		goToUserDetail(user) {
			console.log('[邀请页面] 查看用户详情:', user);
			
			// 显示用户详情信息，包含佣金贡献
			let content = `用户：${user.name}\n等级：${user.levelText}\n加入时间：${user.joinDate}`;
			
			// 如果有佣金贡献信息，添加到详情中
			if (user.contributedCommission !== undefined) {
				content += `\n贡献佣金：¥${user.contributedCommission.toFixed(2)}`;
			}
			
			// 如果有状态信息，添加到详情中
			if (user.status) {
				const statusText = user.status === 'active' ? '活跃' : '非活跃';
				content += `\n状态：${statusText}`;
			}
			
			uni.showModal({
				title: '团队成员详情',
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