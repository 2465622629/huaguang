<template>
	<view class="my-profile-page">
		<!-- 自定义状态栏 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
		
		<!-- 滚动容器 -->
		<scroll-view
			class="scroll-container"
			scroll-y
			:style="{ height: scrollHeight + 'px' }"
			enable-flex
			refresher-enabled
			:refresher-triggered="refreshing"
			@refresherrefresh="onRefresh"
		>
			<!-- 用户信息卡片 -->
			<view class="user-info-card">
				<view class="user-header">
					<uv-avatar 
						:src="userInfo.avatar" 
						size="120" 
						shape="circle"
						:text="userInfo.nickname ? userInfo.nickname.charAt(0) : '用'"
						bg-color="#D8D8D8"
					></uv-avatar>
					<view class="user-details">
						<text class="nickname">{{ userInfo.nickname || '昵称' }}</text>
						<text class="member-id">会员ID: {{ userInfo.memberId || '9842108' }}</text>
					</view>
				</view>
				
				<!-- 统计信息区域 -->
				<view class="statistics-section" v-if="!statisticsInfo.loading">
					<view class="stats-item">
						<text class="stats-number">{{ statisticsInfo.favoriteCount }}</text>
						<text class="stats-label">收藏</text>
					</view>
					<view class="stats-divider"></view>
					<view class="stats-item">
						<text class="stats-number">{{ formatCommission(statisticsInfo.commissionTotal) }}</text>
						<text class="stats-label">佣金</text>
					</view>
					<view class="stats-divider"></view>
					<view class="stats-item">
						<text class="stats-number">{{ statisticsInfo.assistanceCount }}</text>
						<text class="stats-label">帮扶</text>
					</view>
				</view>
				
				<!-- 统计信息加载状态 -->
				<view class="statistics-loading" v-if="statisticsInfo.loading">
					<text class="loading-text">统计信息加载中...</text>
				</view>
				
				<!-- 快捷功能区域 -->
				<view class="quick-actions">
					<view 
						class="action-item" 
						v-for="(item, index) in quickActions" 
						:key="index"
						@click="handleQuickAction(item.type)"
						hover-class="action-item-hover"
					>
						<view class="action-icon">
							          <uv-image :src="config.staticBaseUrl + '/icons/' + item.icon + '.png'" width="50rpx" height="50rpx" mode="aspectFit"></uv-image>
						</view>
						<text class="action-text">{{ item.text }}</text>
					</view>
				</view>
			</view>
			
							<!-- 设置卡片 -->
			<view class="settings-card">
				<text class="card-title">设置</text>
				<view class="settings-list">
					<view 
						class="list-item" 
						v-for="(item, index) in settingsItems" 
						:key="index"
						@click="handleSettingsClick(item.type)"
						hover-class="list-item-hover"
					>
						<view class="item-left">
							<uv-image :src="config.staticBaseUrl + '/icons/' + item.icon + '.png'" width="32rpx" height="32rpx"  mode="aspectFit"></uv-image>
							<text class="item-text">{{ item.text }}</text>
						</view>
						<text class="arrow-icon">></text>
					</view>
				</view>
			</view>
			
			<!-- 分销推广卡片 -->
			<view class="promotion-card">
				<text class="card-title">分销推广</text>
				<view class="promotion-list">
					<view 
						class="list-item" 
						v-for="(item, index) in promotionItems" 
						:key="index"
						@click="handlePromotionClick(item.type)"
						hover-class="list-item-hover"
					>
						<view class="item-left">
							<uv-image :src="config.staticBaseUrl + '/icons/' + item.icon + '.png'" width="32rpx" height="32rpx"  mode="aspectFit"></uv-image>
							<text class="item-text">{{ item.text }}</text>
						</view>
						<text class="arrow-icon">></text>
					</view>
				</view>
			</view>
		</scroll-view>
		
		<!-- 底部导航栏 -->
		<user-tabbar></user-tabbar>
	</view>
</template>

<script>
import UserTabbar from '@/components/tabbar/user-tabbar/user-tabbar.vue'
import { getCurrentUser, getUserSettings, getFavorites, getCommissionInfo } from '@/api/modules/user.js'
import config from '@/config/index.js'

export default {
	components: {
		UserTabbar
	},
	data() {
		return {
			statusBarHeight: 0,
			scrollHeight: 0,
			loading: false,
			refreshing: false,
			dataLoaded: false,
			lastLoadTime: 0,
			config: config,
			userInfo: {
				avatar: '',
				nickname: '昵称',
				memberId: '9842108'
			},
			statisticsInfo: {
				assistanceCount: 0,
				favoriteCount: 0,
				commissionTotal: 0,
				loading: false
			},
			cacheKey: 'user_profile_cache',
			statisticsCacheKey: 'user_profile_statistics_cache',
			cacheExpiry: 5 * 60 * 1000, // 5分钟缓存
			retryCount: 0,
			maxRetries: 3,
			quickActions: [
				{
					type: 'help',
					icon: 'huifu',
					text: '我的帮扶'
				},
				{
					type: 'video',
					icon: 'shoucangshipin',
					text: '我的收藏视频'
				},
				{
					type: 'job',
					icon: 'qiuzhi',
					text: '我的求职'
				}
			],
			settingsItems: [
				{
					type: 'security',
					icon: 'zhanghao',
					text: '账号与安全'
				},
				{
					type: 'profile',
					icon: 'xinxixiugai',
					text: '用户信息修改'
				},
				{
					type: 'cache',
					icon: 'qingkong',
					text: '清空缓存'
				},
				{
					type: 'about',
					icon: 'guanyu',
					text: '关于'
				}
			],
			promotionItems: [
				{
					type: 'team',
					icon: 'wodeteam',
					text: '我的团队'
				},
				{
					type: 'poster',
					icon: 'haibao',
					text: '分享海报'
				},
				{
					type: 'commission',
					icon: 'yongjin',
					text: '我的佣金'
				}
			]
		}
	},
	onLoad() {
		this.initPage();
		this.loadUserInfo();
		this.loadStatisticsInfo();
	},
	onShow() {
		// 页面显示时检查是否需要刷新数据
		this.checkAndRefreshData();
	},
	methods: {
		// 初始化页面
		initPage() {
			const systemInfo = uni.getSystemInfoSync();
			this.statusBarHeight = systemInfo.statusBarHeight || 0;
			// 减去底部导航栏高度（约100rpx，转换为px约50px）
			this.scrollHeight = systemInfo.windowHeight - this.statusBarHeight - 50;
		},
		
		// 加载用户信息（企业级优化版本）
		async loadUserInfo(forceRefresh = false) {
			if (this.loading) return;
			
			// 检查缓存
			if (!forceRefresh) {
				const cachedData = this.getCachedUserInfo();
				if (cachedData) {
					this.userInfo = cachedData;
					this.dataLoaded = true;
					console.log('使用缓存的用户信息:', this.userInfo);
					return;
				}
			}
			
			this.loading = true;
			uni.showLoading({
				title: '加载中...'
			});
			
			try {
				// 使用多层数据保护策略获取用户信息
				const userData = await this.getUserDataWithFallback(forceRefresh);
				
				// 将API返回的数据映射到userInfo
				this.userInfo = {
					avatar: userData.avatar || '',
					nickname: userData.nickname || '昵称',
					memberId: userData.memberId || userData.id || '9842108'
				};
				
				// 缓存用户信息
				this.cacheUserInfo(this.userInfo);
				
				// 更新加载状态
				this.dataLoaded = true;
				this.lastLoadTime = Date.now();
				this.retryCount = 0;
				
				console.log('用户信息加载成功:', this.userInfo);
				
			} catch (error) {
				console.error('获取用户信息失败:', error);
				await this.handleUserInfoLoadError(error, forceRefresh);
			} finally {
				this.loading = false;
				uni.hideLoading();
			}
		},

		// 多层数据保护策略获取用户数据
		async getUserDataWithFallback(forceRefresh) {
			const cacheKey = 'user_profile_data_cache';
			
			try {
				// 第一层：主要API数据（带智能重试）
				const userData = await this.retryWithBackoff(async () => {
					const response = await getCurrentUser();
					return response.data || response;
				}, 3, 1000);
				
				// 尝试获取备用数据源以丰富用户信息
				await this.enrichUserDataFromBackupSources(userData);
				
				// 缓存数据
				this.cacheData(cacheKey, userData);
				return userData;
				
			} catch (error) {
				console.warn('主要API失败，尝试备用数据源:', error);
				
				try {
					// 第二层：备用数据源
					const backupData = await this.getBackupUserData();
					if (backupData) {
						console.log('使用备用数据源成功');
						return backupData;
					}
				} catch (backupError) {
					console.warn('备用数据源失败:', backupError);
				}
				
				try {
					// 第三层：缓存数据
					const cachedData = this.getCachedData(cacheKey);
					if (cachedData) {
						console.log('使用缓存数据');
						return cachedData;
					}
				} catch (cacheError) {
					console.warn('缓存数据获取失败:', cacheError);
				}
				
				// 第四层：默认值
				console.log('使用默认用户数据');
				return {
					avatar: '',
					nickname: '昵称',
					memberId: '9842108'
				};
			}
		},

		// 智能指数退避重试算法
		async retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
			for (let attempt = 0; attempt < maxRetries; attempt++) {
				try {
					return await fn();
				} catch (error) {
					if (attempt === maxRetries - 1) throw error;
					
					// 指数退避 + 随机抖动，避免雷群效应
					const exponentialDelay = baseDelay * Math.pow(2, attempt);
					const randomJitter = Math.random() * 1000;
					const delay = Math.min(exponentialDelay + randomJitter, 8000);
					
					console.log(`重试第 ${attempt + 1} 次，延迟 ${Math.round(delay)}ms`);
					await new Promise(resolve => setTimeout(resolve, delay));
				}
			}
		},

		// 从备用数据源丰富用户信息
		async enrichUserDataFromBackupSources(userData) {
			try {
				// 并行获取备用数据源
				const [settingsResult, favoritesResult] = await Promise.allSettled([
					getUserSettings(),
					getFavorites({ page: 1, pageSize: 1 })
				]);
				
				// 处理用户设置数据
				if (settingsResult.status === 'fulfilled') {
					const settingsData = settingsResult.value.data || settingsResult.value;
					if (settingsData) {
						userData.language = settingsData.language || 'zh-CN';
						userData.theme = settingsData.theme || 'light';
						userData.notifications = settingsData.notifications || {};
					}
				}
				
				// 处理收藏数据
				if (favoritesResult.status === 'fulfilled') {
					const favoritesData = favoritesResult.value.data || favoritesResult.value;
					if (favoritesData && favoritesData.userInfo) {
						// 补充用户信息
						userData.avatar = userData.avatar || favoritesData.userInfo.avatar;
						userData.nickname = userData.nickname || favoritesData.userInfo.nickname;
					}
				}
				
			} catch (error) {
				console.warn('丰富用户信息失败:', error);
			}
		},

		// 获取备用用户数据
		async getBackupUserData() {
			const errors = [];
			
			// 备用数据源1：用户设置
			try {
				const settingsResponse = await getUserSettings();
				const settingsData = settingsResponse.data || settingsResponse;
				
				if (settingsData && (settingsData.nickname || settingsData.userInfo)) {
					const userInfo = settingsData.userInfo || settingsData;
					return {
						avatar: userInfo.avatar || '',
						nickname: userInfo.nickname || settingsData.nickname || '昵称',
						memberId: userInfo.memberId || userInfo.id || '9842108'
					};
				}
			} catch (error) {
				errors.push({ source: 'settings', error });
			}
			
			// 备用数据源2：收藏信息
			try {
				const favoritesResponse = await getFavorites({ page: 1, pageSize: 1 });
				const favoritesData = favoritesResponse.data || favoritesResponse;
				
				if (favoritesData && favoritesData.userInfo) {
					return {
						avatar: favoritesData.userInfo.avatar || '',
						nickname: favoritesData.userInfo.nickname || '昵称',
						memberId: favoritesData.userInfo.memberId || '9842108'
					};
				}
			} catch (error) {
				errors.push({ source: 'favorites', error });
			}
			
			console.warn('所有备用数据源都失败:', errors);
			return null;
		},

		// 加载备用用户数据
		async loadBackupUserData() {
			try {
				// 尝试获取用户设置信息
				const settingsResponse = await getUserSettings();
				const settingsData = settingsResponse.data || settingsResponse;
				
				// 补充用户信息
				if (settingsData) {
					this.userInfo.language = settingsData.language || 'zh-CN';
					this.userInfo.theme = settingsData.theme || 'light';
					console.log('备用数据源1（用户设置）加载成功');
				}
			} catch (error) {
				console.warn('备用数据源1（用户设置）加载失败:', error);
			}
		},

		// 尝试备用数据源
		async tryBackupDataSources() {
			console.log('主要数据源失败，尝试备用数据源...');
			
			try {
				// 备用数据源1：用户设置
				const settingsResponse = await getUserSettings();
				const settingsData = settingsResponse.data || settingsResponse;
				
				if (settingsData && settingsData.nickname) {
					this.userInfo = {
						avatar: settingsData.avatar || '',
						nickname: settingsData.nickname || '昵称',
						memberId: settingsData.memberId || '9842108'
					};
					
					uni.showToast({
						title: '使用备用数据源',
						icon: 'none',
						duration: 2000
					});
					
					console.log('备用数据源1成功:', this.userInfo);
					return true;
				}
			} catch (error) {
				console.warn('备用数据源1失败:', error);
			}
			
			try {
				// 备用数据源2：收藏信息（可能包含用户基本信息）
				const favoritesResponse = await getFavorites({ page: 1, pageSize: 1 });
				const favoritesData = favoritesResponse.data || favoritesResponse;
				
				if (favoritesData && favoritesData.userInfo) {
					this.userInfo = {
						avatar: favoritesData.userInfo.avatar || '',
						nickname: favoritesData.userInfo.nickname || '昵称',
						memberId: favoritesData.userInfo.memberId || '9842108'
					};
					
					uni.showToast({
						title: '使用备用数据源',
						icon: 'none',
						duration: 2000
					});
					
					console.log('备用数据源2成功:', this.userInfo);
					return true;
				}
			} catch (error) {
				console.warn('备用数据源2失败:', error);
			}
			
			return false;
		},

		// 加载统计信息（企业级优化版本）
		async loadStatisticsInfo(forceRefresh = false) {
			if (this.statisticsInfo.loading) return;
			
			// 检查缓存
			if (!forceRefresh) {
				const cachedStats = this.getCachedStatistics();
				if (cachedStats) {
					this.statisticsInfo = { ...this.statisticsInfo, ...cachedStats };
					console.log('使用缓存的统计信息:', this.statisticsInfo);
					return;
				}
			}
			
			this.statisticsInfo.loading = true;
			
			try {
				// 使用智能重试并行获取统计数据
				const statisticsData = await this.getStatisticsWithRetry();
				
				// 更新统计信息
				this.statisticsInfo = {
					...this.statisticsInfo,
					...statisticsData,
					loading: false
				};
				
				// 缓存统计信息
				this.cacheStatistics(this.statisticsInfo);
				
				console.log('统计信息加载成功:', this.statisticsInfo);
				
			} catch (error) {
				console.error('获取统计信息失败:', error);
				await this.handleStatisticsLoadError(error);
			} finally {
				this.statisticsInfo.loading = false;
			}
		},

		// 智能重试获取统计数据
		async getStatisticsWithRetry() {
			const cacheKey = 'user_profile_statistics_enhanced_cache';
			
			try {
				// 使用智能重试并行获取统计数据
				const statisticsData = await this.retryWithBackoff(async () => {
					const [commissionResult, favoritesResult, assistanceResult] = await Promise.allSettled([
						this.getCommissionStats(),
						this.getFavoritesStats(),
						this.getAssistanceStats()
					]);
					
					const stats = {
						commissionTotal: 0,
						favoriteCount: 0,
						assistanceCount: 0
					};
					
					// 处理佣金统计
					if (commissionResult.status === 'fulfilled' && commissionResult.value) {
						stats.commissionTotal = commissionResult.value.totalAmount || 0;
					}
					
					// 处理收藏统计
					if (favoritesResult.status === 'fulfilled' && favoritesResult.value) {
						stats.favoriteCount = favoritesResult.value.total || 0;
					}
					
					// 处理帮扶统计
					if (assistanceResult.status === 'fulfilled' && assistanceResult.value) {
						stats.assistanceCount = assistanceResult.value.count || 0;
					}
					
					return stats;
				}, 2, 1000);
				
				// 缓存数据
				this.cacheData(cacheKey, statisticsData);
				return statisticsData;
				
			} catch (error) {
				console.warn('统计数据API失败，尝试使用缓存:', error);
				
				// 尝试使用缓存数据
				const cachedData = this.getCachedData(cacheKey);
				if (cachedData) {
					console.log('使用缓存的统计数据');
					return cachedData;
				}
				
				// 返回默认值
				console.log('使用默认统计数据');
				return {
					commissionTotal: 0,
					favoriteCount: 0,
					assistanceCount: 0
				};
			}
		},

		// 获取帮扶统计
		async getAssistanceStats() {
			try {
				// 这里可以调用帮扶记录API获取统计
				// 暂时返回模拟数据
				return { count: 0 };
			} catch (error) {
				console.warn('获取帮扶统计失败:', error);
				return { count: 0 };
			}
		},

		// 获取佣金统计
		async getCommissionStats() {
			try {
				const response = await getCommissionInfo();
				const data = response.data || response;
				return {
					totalAmount: data.totalCommission || data.balance || 0,
					availableAmount: data.availableCommission || data.availableBalance || 0
				};
			} catch (error) {
				console.warn('获取佣金统计失败:', error);
				return null;
			}
		},

		// 获取收藏统计
		async getFavoritesStats() {
			try {
				const response = await getFavorites({ page: 1, pageSize: 1 });
				const data = response.data || response;
				return {
					total: data.total || data.count || 0
				};
			} catch (error) {
				console.warn('获取收藏统计失败:', error);
				return null;
			}
		},

		// 缓存统计信息
		cacheStatistics(stats) {
			try {
				const cacheData = {
					data: {
						assistanceCount: stats.assistanceCount,
						favoriteCount: stats.favoriteCount,
						commissionTotal: stats.commissionTotal
					},
					timestamp: Date.now()
				};
				uni.setStorageSync(this.statisticsCacheKey, JSON.stringify(cacheData));
			} catch (error) {
				console.error('缓存统计信息失败:', error);
			}
		},

		// 获取缓存的统计信息
		getCachedStatistics() {
			try {
				const cacheStr = uni.getStorageSync(this.statisticsCacheKey);
				if (!cacheStr) return null;
				
				const cacheData = JSON.parse(cacheStr);
				const now = Date.now();
				
				// 检查缓存是否过期
				if (now - cacheData.timestamp > this.cacheExpiry) {
					uni.removeStorageSync(this.statisticsCacheKey);
					return null;
				}
				
				return cacheData.data;
			} catch (error) {
				console.error('获取缓存统计信息失败:', error);
				uni.removeStorageSync(this.statisticsCacheKey);
				return null;
			}
		},

		// 缓存用户信息
		cacheUserInfo(userInfo) {
			try {
				const cacheData = {
					data: userInfo,
					timestamp: Date.now()
				};
				uni.setStorageSync(this.cacheKey, JSON.stringify(cacheData));
			} catch (error) {
				console.error('缓存用户信息失败:', error);
			}
		},

		// 获取缓存的用户信息
		getCachedUserInfo() {
			try {
				const cacheStr = uni.getStorageSync(this.cacheKey);
				if (!cacheStr) return null;
				
				const cacheData = JSON.parse(cacheStr);
				const now = Date.now();
				
				// 检查缓存是否过期
				if (now - cacheData.timestamp > this.cacheExpiry) {
					uni.removeStorageSync(this.cacheKey);
					return null;
				}
				
				return cacheData.data;
			} catch (error) {
				console.error('获取缓存用户信息失败:', error);
				uni.removeStorageSync(this.cacheKey);
				return null;
			}
		},

		// 检查并刷新数据（增强版本）
		checkAndRefreshData() {
			// 检查是否有标记需要刷新
			const needRefresh = uni.getStorageSync('user_profile_need_refresh');
			if (needRefresh) {
				uni.removeStorageSync('user_profile_need_refresh');
				this.loadUserInfo(true); // 强制刷新
				this.loadStatisticsInfo(true); // 同时刷新统计信息
				return;
			}
			
			// 检查数据是否过期
			const now = Date.now();
			if (this.lastLoadTime && (now - this.lastLoadTime > this.cacheExpiry)) {
				console.log('数据已过期，自动刷新');
				this.loadUserInfo(true);
				this.loadStatisticsInfo(true);
			}
		},

		// 处理加载错误（增强版本）
		handleLoadError(error) {
			// 错误分类处理
			let errorMessage = '获取用户信息失败';
			let showRetry = true;
			
			if (error.code === 'NETWORK_ERROR' || error.message?.includes('网络')) {
				errorMessage = '网络连接异常';
			} else if (error.code === 'TIMEOUT' || error.message?.includes('timeout')) {
				errorMessage = '请求超时';
			} else if (error.code === 401 || error.status === 401) {
				errorMessage = '登录已过期，请重新登录';
				showRetry = false;
				// 处理登录过期逻辑
				this.handleLoginExpired();
				return;
			} else if (error.code === 403 || error.status === 403) {
				errorMessage = '访问权限不足';
				showRetry = false;
			}
			
			// 尝试使用缓存数据
			const cachedData = this.getCachedUserInfo();
			if (cachedData) {
				this.userInfo = cachedData;
				this.dataLoaded = true;
				uni.showToast({
					title: '网络异常，显示缓存数据',
					icon: 'none',
					duration: 2000
				});
				return;
			}
			
			// 没有缓存数据时的错误处理
			uni.showToast({
				title: errorMessage,
				icon: 'none',
				duration: 2000
			});
			
			// 显示重试选项
			if (showRetry) {
				this.showRetryOption();
			}
		},

		// 处理登录过期
		handleLoginExpired() {
			uni.showModal({
				title: '登录过期',
				content: '您的登录已过期，请重新登录',
				showCancel: false,
				success: () => {
					// 清除本地存储
					uni.clearStorageSync();
					// 跳转到登录页
					uni.reLaunch({
						url: '/pages/login/login'
					});
				}
			});
		},

		// 显示重试选项
		showRetryOption() {
			uni.showModal({
				title: '加载失败',
				content: '获取用户信息失败，是否重试？',
				success: (res) => {
					if (res.confirm) {
						this.retryCount = 0; // 重置重试计数
						this.loadUserInfo(true);
					}
				}
			});
		},

		// 下拉刷新（企业级优化版本）
		async onRefresh() {
			this.refreshing = true;
			try {
				// 使用智能重试并行刷新用户信息和统计信息
				const [userResult, statsResult] = await Promise.allSettled([
					this.retryWithBackoff(() => this.loadUserInfo(true), 2, 500),
					this.retryWithBackoff(() => this.loadStatisticsInfo(true), 2, 500)
				]);
				
				// 检查刷新结果
				const userSuccess = userResult.status === 'fulfilled';
				const statsSuccess = statsResult.status === 'fulfilled';
				
				if (userSuccess && statsSuccess) {
					uni.showToast({
						title: '刷新成功',
						icon: 'success',
						duration: 1500
					});
				} else if (userSuccess || statsSuccess) {
					uni.showToast({
						title: '部分数据刷新成功',
						icon: 'none',
						duration: 2000
					});
				} else {
					throw new Error('刷新失败');
				}
				
			} catch (error) {
				console.error('刷新失败:', error);
				
				// 尝试使用缓存数据
				const hasCache = this.tryLoadFromCache();
				
				uni.showToast({
					title: hasCache ? '网络异常，显示缓存数据' : '刷新失败，请稍后重试',
					icon: 'none',
					duration: 2000
				});
			} finally {
				this.refreshing = false;
			}
		},

		// 尝试从缓存加载数据
		tryLoadFromCache() {
			try {
				const cachedUser = this.getCachedUserInfo();
				const cachedStats = this.getCachedStatistics();
				
				if (cachedUser) {
					this.userInfo = cachedUser;
					this.dataLoaded = true;
				}
				
				if (cachedStats) {
					this.statisticsInfo = { ...this.statisticsInfo, ...cachedStats };
				}
				
				return !!(cachedUser || cachedStats);
			} catch (error) {
				console.warn('从缓存加载数据失败:', error);
				return false;
			}
		},

		// 通用缓存数据方法
		cacheData(key, data) {
			try {
				const cacheItem = {
					data: data,
					timestamp: Date.now(),
					expiry: 5 * 60 * 1000 // 5分钟过期
				};
				uni.setStorageSync(key, JSON.stringify(cacheItem));
			} catch (error) {
				console.warn('缓存数据失败:', error);
			}
		},

		// 通用获取缓存数据方法
		getCachedData(key) {
			try {
				const cacheStr = uni.getStorageSync(key);
				if (!cacheStr) return null;
				
				const cacheItem = JSON.parse(cacheStr);
				const now = Date.now();
				
				// 检查是否过期
				if (now - cacheItem.timestamp > cacheItem.expiry) {
					uni.removeStorageSync(key);
					return null;
				}
				
				return cacheItem.data;
			} catch (error) {
				console.warn('获取缓存数据失败:', error);
				return null;
			}
		},

		// 处理用户信息加载错误
		async handleUserInfoLoadError(error, forceRefresh) {
			// 错误分类处理
			const errorMessage = this.classifyError(error);
			
			// 尝试使用缓存数据
			const cachedData = this.getCachedUserInfo();
			if (cachedData) {
				this.userInfo = cachedData;
				this.dataLoaded = true;
				uni.showToast({
					title: '网络异常，显示缓存数据',
					icon: 'none',
					duration: 2000
				});
				return;
			}
			
			// 处理特殊错误
			if (error.code === 401 || error.status === 401) {
				this.handleLoginExpired();
				return;
			}
			
			// 显示错误信息
			uni.showToast({
				title: errorMessage,
				icon: 'none',
				duration: 2000
			});
			
			// 显示重试选项
			this.showRetryOption();
		},

		// 处理统计信息加载错误
		async handleStatisticsLoadError(error) {
			// 尝试使用缓存数据
			const cachedStats = this.getCachedStatistics();
			if (cachedStats) {
				this.statisticsInfo = { ...this.statisticsInfo, ...cachedStats };
				console.log('统计信息使用缓存数据');
				return;
			}
			
			// 统计信息失败不影响主要功能，只记录错误
			console.warn('统计信息加载失败，使用默认值:', error);
			this.statisticsInfo = {
				assistanceCount: 0,
				favoriteCount: 0,
				commissionTotal: 0,
				loading: false
			};
		},

		// 错误分类
		classifyError(error) {
			if (!error) return '未知错误';
			
			const errorMsg = error.message || error.msg || error.toString();
			const errorCode = error.code || error.status;
			
			// 网络相关错误
			if (errorCode === 'NETWORK_ERROR' || errorMsg.includes('网络')) {
				return '网络连接异常，请检查网络设置';
			}
			
			// 超时错误
			if (errorCode === 'TIMEOUT' || errorMsg.includes('timeout') || errorMsg.includes('超时')) {
				return '请求超时，请稍后重试';
			}
			
			// 权限相关错误
			if (errorCode === 401 || errorMsg.includes('401') || errorMsg.includes('未授权')) {
				return '登录已过期，请重新登录';
			}
			
			if (errorCode === 403 || errorMsg.includes('403') || errorMsg.includes('权限')) {
				return '访问权限不足';
			}
			
			// 服务器错误
			if (errorCode >= 500 || errorMsg.includes('500') || errorMsg.includes('服务器')) {
				return '服务器内部错误，请稍后重试';
			}
			
			return '获取数据失败，请稍后重试';
		},
		
		// 处理快捷功能点击
		handleQuickAction(type) {
			console.log('快捷功能点击:', type);
			// 根据type进行相应的跳转或操作
			switch(type) {
				case 'help':
					uni.navigateTo({ url: '/pages/user/profile/assistance/index' });
					break;
				case 'video':
					uni.navigateTo({ url: '/pages/user/profile/video-collection/index' });
					break;
				case 'job':
					uni.navigateTo({ url: '/pages/user/profile/job-hunting/index' });
					break;
			}
		},
		
		// 处理设置项点击
		handleSettingsClick(type) {
			console.log('设置项点击:', type);
			// 根据type进行相应的跳转或操作
			switch(type) {
				case 'security':
					uni.navigateTo({ url: '/pages/user/profile/security/index' });
					break;
				case 'profile':
					uni.navigateTo({ url: '/pages/user/profile/edit/index' });
					break;
				case 'cache':
					// 直接调用清空缓存方法，不跳转页面
					this.clearCache();
					break;
				case 'about':
					uni.navigateTo({ url: '/pages/user/profile/about/index' });
					break;
			}
		},
		
		// 处理分销推广点击
		handlePromotionClick(type) {
			console.log('分销推广点击:', type);
			// 根据type进行相应的跳转或操作
			switch(type) {
				case 'team':
					uni.navigateTo({ url: '/pages/user/profile/invitation/index' });
					break;
				case 'poster':
					uni.navigateTo({ url: '/pages/user/profile/invitation-poster/index' });
					break;
				case 'commission':
					// 显示加载提示
					uni.showLoading({
						title: '加载中...'
					});
					
					// 跳转到我的佣金页面
					uni.navigateTo({
						url: '/pages/user/profile/promotion-commission/index',
						success: () => {
							uni.hideLoading();
						},
						fail: (err) => {
							uni.hideLoading();
							console.error('跳转失败:', err);
							uni.showToast({
								title: '页面跳转失败',
								icon: 'none'
							});
						}
					});
					break;
			}
		},
		
		// 格式化佣金显示
		formatCommission(amount) {
			if (!amount || amount === 0) return '0';
			if (amount >= 10000) {
				return (amount / 10000).toFixed(1) + '万';
			}
			return amount.toFixed(2);
		},

		// 清空缓存（增强版本）
		clearCache() {
			uni.showModal({
				title: '清空缓存',
				content: '确定要清空所有缓存数据吗？这将清除用户信息和统计信息缓存。',
				success: (res) => {
					if (res.confirm) {
						try {
							// 清空用户信息缓存
							uni.removeStorageSync(this.cacheKey);
							uni.removeStorageSync(this.statisticsCacheKey);
							
							// 清空其他可能的缓存
							const cacheKeys = [
								'user_profile_cache',
								'user_profile_statistics_cache',
								'user_settings_cache',
								'consultation_records_cache',
								'video_collection_cache',
								'assistance_records_cache',
								'commission_records_cache'
							];
							
							cacheKeys.forEach(key => {
								try {
									uni.removeStorageSync(key);
								} catch (error) {
									console.warn(`清除缓存 ${key} 失败:`, error);
								}
							});
							
							// 重置数据状态
							this.dataLoaded = false;
							this.lastLoadTime = 0;
							this.statisticsInfo = {
								assistanceCount: 0,
								favoriteCount: 0,
								commissionTotal: 0,
								loading: false
							};
							
							uni.showToast({
								title: '缓存已清空',
								icon: 'success'
							});
							
							// 重新加载数据
							setTimeout(() => {
								this.loadUserInfo(true);
								this.loadStatisticsInfo(true);
							}, 1000);
							
						} catch (error) {
							console.error('清空缓存失败:', error);
							uni.showToast({
								title: '清空缓存失败',
								icon: 'none'
							});
						}
					}
				}
			});
		}
	}
}
</script>

<style lang="scss" scoped>
.my-profile-page {
	width: 100%;
	height: 100vh;
	background: linear-gradient(180deg, #EBF4FF 0%, #F5F9FF 100%);
}

.status-bar {
	width: 100%;
	background: transparent;
}

.scroll-container {
	width: 100%;
	padding: 0 30rpx;
	box-sizing: border-box;
}

/* 用户信息卡片 */
.user-info-card {
	background: #FFFFFF;
	border-radius: 20rpx;
	padding: 30rpx;
	margin-top: 20rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.user-header {
	display: flex;
	align-items: center;
	margin-bottom: 40rpx;
}

.user-details {
	margin-left: 20rpx;
	flex: 1;
}

.nickname {
	display: block;
	font-size: 32rpx;
	font-weight: bold;
	color: #333333;
	margin-bottom: 10rpx;
}

.member-id {
	display: block;
	font-size: 28rpx;
	color: #666666;
}

/* 统计信息区域 */
.statistics-section {
	display: flex;
	justify-content: space-around;
	align-items: center;
	padding: 30rpx 0;
	margin-bottom: 20rpx;
	border-top: 1rpx solid #F0F0F0;
}

.stats-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	flex: 1;
}

.stats-number {
	font-size: 32rpx;
	font-weight: bold;
	color: #333333;
	margin-bottom: 8rpx;
}

.stats-label {
	font-size: 24rpx;
	color: #666666;
}

.stats-divider {
	width: 1rpx;
	height: 40rpx;
	background-color: #E0E0E0;
}

.statistics-loading {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 30rpx 0;
	margin-bottom: 20rpx;
	border-top: 1rpx solid #F0F0F0;
}

.loading-text {
	font-size: 26rpx;
	color: #999999;
}

/* 快捷功能区域 */
.quick-actions {
	display: flex;
	justify-content: space-between;
}

.action-item {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 20rpx 10rpx;
	border-radius: 12rpx;
	transition: all 0.3s ease;
}

.action-item-hover {
	background-color: #F5F5F5;
}

.action-icon {
	margin-bottom: 12rpx;
}

.action-icon .iconfont {
	font-size: 48rpx;
}

.action-text {
	font-size: 24rpx;
	color: #333333;
	text-align: center;
}

/* 卡片通用样式 */
.settings-card,
.promotion-card {
	background: #FFFFFF;
	border-radius: 20rpx;
	padding: 30rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.card-title {
	display: block;
	font-size: 32rpx;
	font-weight: bold;
	color: #333333;
	margin-bottom: 30rpx;
}

/* 列表项样式 */
.settings-list,
.promotion-list {
	width: 100%;
}

.list-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 30rpx 0;
	border-bottom: 1rpx solid #F0F0F0;
	transition: all 0.3s ease;
}

.list-item:last-child {
	border-bottom: none;
}

.list-item-hover {
	background-color: #F8F8F8;
	margin: 0 -30rpx;
	padding-left: 30rpx;
	padding-right: 30rpx;
	border-radius: 12rpx;
}

.item-left {
	display: flex;
	align-items: center;
	flex: 1;
}

.item-icon {
	font-size: 36rpx;
	color: #888888;
	margin-right: 20rpx;
}

.item-text {
	font-size: 30rpx;
	color: #333333;
	margin-left: 30rpx;
}

.arrow-icon {
	font-size: 28rpx;
	color: #CCCCCC;
}

/* 图标字体样式 */
.iconfont {
	font-family: 'iconfont';
}

/* 如果没有iconfont，可以使用以下备用样式 */
.icon-bangfu::before { content: '🤝'; }
.icon-shipin::before { content: '📹'; }
.icon-gongzuo::before { content: '💼'; }
.icon-anquan::before { content: '🛡️'; }
.icon-yonghu::before { content: '👤'; }
.icon-qingchu::before { content: '🗑️'; }
.icon-guanyu::before { content: 'ℹ️'; }
.icon-tuandui::before { content: '👥'; }
.icon-haibao::before { content: '🖼️'; }
.icon-yongjin::before { content: '💰'; }
</style> 