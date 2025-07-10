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
import { 
	getUserCenterPage, 
	getPersonalCenterAssistanceRecords,
	getMyFavoriteVideos,
	getMyJobApplicationRecords,
	getCacheInfo,
	clearCache as clearCacheAPI,
	getMyTeam,
	generateInvitePoster,
	getAvailableWithdrawalAmount,
	getWithdrawalRecords
} from '@/api/modules/application-record.js'
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
			cacheManagement: {
				loading: false,
				totalSize: 0,
				itemCount: 0,
				lastUpdate: null
			},
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
		this.loadCacheInfo();
	},
	onShow() {
		// 页面显示时检查是否需要刷新数据
		this.checkAndRefreshData();
		
		// 开发环境下测试接口集成
		if (process.env.NODE_ENV === 'development') {
			this.testInterfaceIntegration();
		}
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
				// 优先尝试使用综合接口获取个人中心页面数据
				const userCenterData = await this.getUserCenterDataWithFallback(forceRefresh);
				
				// 将API返回的数据映射到userInfo
				this.userInfo = {
					avatar: userCenterData.avatar || userCenterData.userInfo?.avatar || '',
					nickname: userCenterData.nickname || userCenterData.userInfo?.nickname || '昵称',
					memberId: userCenterData.memberId || userCenterData.userInfo?.memberId || userCenterData.id || '9842108'
				};
				
				// 如果综合接口返回了统计信息，直接使用
				if (userCenterData.statistics) {
					this.statisticsInfo = {
						...this.statisticsInfo,
						assistanceCount: userCenterData.statistics.assistanceCount || 0,
						favoriteCount: userCenterData.statistics.favoriteCount || 0,
						commissionTotal: userCenterData.statistics.commissionTotal || 0,
						loading: false
					};
					this.cacheStatistics(this.statisticsInfo);
				}
				
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

		// 使用综合接口获取个人中心数据（多层数据保护策略）
		async getUserCenterDataWithFallback(forceRefresh) {
			const cacheKey = 'user_center_page_data_cache';
			
			try {
				// 第一层：优先使用综合个人中心页面接口
				const userCenterData = await this.retryWithBackoff(async () => {
					const response = await getUserCenterPage();
					return response.data || response;
				}, 2, 1000);
				
				// 缓存综合接口数据
				this.cacheData(cacheKey, userCenterData);
				console.log('使用综合个人中心页面接口成功');
				return userCenterData;
				
			} catch (error) {
				console.warn('综合接口失败，尝试分散接口获取:', error);
				
				try {
					// 第二层：使用原有的分散接口获取数据
					const userData = await this.getUserDataWithFallback(forceRefresh);
					console.log('使用分散接口获取数据成功');
					return userData;
				} catch (backupError) {
					console.warn('分散接口也失败:', backupError);
				}
				
				try {
					// 第三层：缓存数据
					const cachedData = this.getCachedData(cacheKey);
					if (cachedData) {
						console.log('使用缓存的综合数据');
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

		// 多层数据保护策略获取用户数据（保留作为备用）
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
		async handleQuickAction(type) {
			console.log('快捷功能点击:', type);
			
			// 显示加载提示
			uni.showLoading({
				title: '加载中...'
			});
			
			try {
				// 根据type进行相应的数据预加载和跳转
				switch(type) {
					case 'help':
						// 预加载帮扶记录数据
						try {
							const assistanceData = await getPersonalCenterAssistanceRecords({ page: 1, size: 10 });
							console.log('帮扶记录预加载成功:', assistanceData);
							
							// 缓存预加载的数据
							if (assistanceData && assistanceData.code === 200) {
								uni.setStorageSync('assistance_records_cache', JSON.stringify({
									data: assistanceData.data,
									timestamp: Date.now()
								}));
							}
						} catch (error) {
							console.warn('帮扶记录预加载失败:', error);
						}
						uni.navigateTo({ url: '/pages/user/profile/assistance/index' });
						break;
					case 'video':
						// 预加载收藏视频数据
						try {
							const videoData = await getMyFavoriteVideos({ page: 1, size: 10 });
							console.log('收藏视频预加载成功:', videoData);
						} catch (error) {
							console.warn('收藏视频预加载失败:', error);
						}
						uni.navigateTo({ url: '/pages/user/profile/video-collection/index' });
						break;
					case 'job':
						// 预加载求职记录数据
						try {
							const jobData = await getMyJobApplicationRecords({ page: 1, size: 10 });
							console.log('求职记录预加载成功:', jobData);
						} catch (error) {
							console.warn('求职记录预加载失败:', error);
						}
						uni.navigateTo({ url: '/pages/user/profile/job-hunting/index' });
						break;
				}
			} catch (error) {
				console.error('快捷功能处理失败:', error);
				uni.showToast({
					title: '功能暂时不可用',
					icon: 'none'
				});
			} finally {
				uni.hideLoading();
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
		async handlePromotionClick(type) {
			console.log('分销推广点击:', type);
			
			// 显示加载提示
			uni.showLoading({
				title: '加载中...'
			});
			
			try {
				// 根据type进行相应的数据预加载和跳转
				switch(type) {
					case 'team':
						// 预加载团队数据
						try {
							const teamData = await getMyTeam();
							console.log('团队数据预加载成功:', teamData);
							// 可以将数据缓存到全局状态或本地存储
							uni.setStorageSync('my_team_cache', JSON.stringify({
								data: teamData,
								timestamp: Date.now()
							}));
						} catch (error) {
							console.warn('团队数据预加载失败:', error);
						}
						uni.navigateTo({ url: '/pages/user/profile/invitation/index' });
						break;
					case 'poster':
						// 预加载并生成邀请海报
						try {
							const posterData = await generateInvitePoster({
								type: 'user_invitation',
								customData: {
									userInfo: this.userInfo,
									timestamp: Date.now()
								}
							});
							console.log('邀请海报生成成功:', posterData);
							// 缓存海报数据
							uni.setStorageSync('invite_poster_cache', JSON.stringify({
								data: posterData,
								timestamp: Date.now()
							}));
						} catch (error) {
							console.warn('邀请海报生成失败:', error);
						}
						uni.navigateTo({ url: '/pages/user/profile/invitation-poster/index' });
						break;
					case 'commission':
						// 预加载佣金相关数据
						try {
							const [withdrawalAmount, withdrawalRecords] = await Promise.allSettled([
								getAvailableWithdrawalAmount(),
								getWithdrawalRecords({ page: 1, size: 10 })
							]);
							
							if (withdrawalAmount.status === 'fulfilled') {
								console.log('可提现金额获取成功:', withdrawalAmount.value);
								uni.setStorageSync('withdrawal_amount_cache', JSON.stringify({
									data: withdrawalAmount.value,
									timestamp: Date.now()
								}));
							}
							
							if (withdrawalRecords.status === 'fulfilled') {
								console.log('提现记录获取成功:', withdrawalRecords.value);
								uni.setStorageSync('withdrawal_records_cache', JSON.stringify({
									data: withdrawalRecords.value,
									timestamp: Date.now()
								}));
							}
						} catch (error) {
							console.warn('佣金数据预加载失败:', error);
						}
						
						// 跳转到我的佣金页面
						uni.navigateTo({
							url: '/pages/user/profile/promotion-commission/index',
							fail: (err) => {
								console.error('跳转失败:', err);
								uni.showToast({
									title: '页面跳转失败',
									icon: 'none'
								});
							}
						});
						break;
				}
			} catch (error) {
				console.error('分销推广功能处理失败:', error);
				uni.showToast({
					title: '功能暂时不可用',
					icon: 'none'
				});
			} finally {
				uni.hideLoading();
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

		// 加载缓存信息
		async loadCacheInfo() {
			this.cacheManagement.loading = true;
			
			try {
				// 获取服务器端缓存信息
				const serverCacheInfo = await getCacheInfo();
				console.log('服务器缓存信息:', serverCacheInfo);
				
				// 获取本地缓存信息
				const localCacheInfo = this.getLocalCacheInfo();
				
				// 合并缓存信息
				this.cacheManagement = {
					loading: false,
					totalSize: (serverCacheInfo.data?.totalSize || 0) + localCacheInfo.totalSize,
					itemCount: (serverCacheInfo.data?.itemCount || 0) + localCacheInfo.itemCount,
					lastUpdate: new Date().toLocaleString(),
					serverCache: serverCacheInfo.data,
					localCache: localCacheInfo
				};
				
			} catch (error) {
				console.warn('获取缓存信息失败:', error);
				// 只使用本地缓存信息
				const localCacheInfo = this.getLocalCacheInfo();
				this.cacheManagement = {
					loading: false,
					totalSize: localCacheInfo.totalSize,
					itemCount: localCacheInfo.itemCount,
					lastUpdate: new Date().toLocaleString(),
					localCache: localCacheInfo
				};
			}
		},

		// 获取本地缓存信息
		getLocalCacheInfo() {
			const cacheKeys = [
				'user_profile_cache',
				'user_profile_statistics_cache',
				'user_center_page_data_cache',
				'user_settings_cache',
				'consultation_records_cache',
				'video_collection_cache',
				'assistance_records_cache',
				'commission_records_cache',
				'my_team_cache',
				'invite_poster_cache',
				'withdrawal_amount_cache',
				'withdrawal_records_cache'
			];
			
			let totalSize = 0;
			let itemCount = 0;
			const details = [];
			
			cacheKeys.forEach(key => {
				try {
					const data = uni.getStorageSync(key);
					if (data) {
						const size = new Blob([data]).size;
						totalSize += size;
						itemCount++;
						details.push({
							key,
							size: this.formatFileSize(size),
							lastModified: this.getCacheLastModified(key)
						});
					}
				} catch (error) {
					console.warn(`获取缓存 ${key} 信息失败:`, error);
				}
			});
			
			return {
				totalSize,
				itemCount,
				details,
				formattedSize: this.formatFileSize(totalSize)
			};
		},

		// 获取缓存最后修改时间
		getCacheLastModified(key) {
			try {
				const data = uni.getStorageSync(key);
				if (data) {
					const parsed = JSON.parse(data);
					return parsed.timestamp ? new Date(parsed.timestamp).toLocaleString() : '未知';
				}
			} catch (error) {
				return '未知';
			}
			return '未知';
		},

		// 格式化文件大小
		formatFileSize(bytes) {
			if (bytes === 0) return '0 B';
			const k = 1024;
			const sizes = ['B', 'KB', 'MB', 'GB'];
			const i = Math.floor(Math.log(bytes) / Math.log(k));
			return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
		},

		// 清空缓存（增强版本）
		async clearCache() {
			uni.showModal({
				title: '清空缓存',
				content: '确定要清空所有缓存数据吗？这将清除用户信息和统计信息缓存。',
				success: async (res) => {
					if (res.confirm) {
						try {
							// 先尝试调用后端清除缓存接口
							try {
								await clearCacheAPI({
									cacheTypes: ['user_profile', 'statistics', 'settings', 'records']
								});
								console.log('后端缓存清除成功');
							} catch (apiError) {
								console.warn('后端缓存清除失败:', apiError);
							}
							
							// 清空本地缓存
							uni.removeStorageSync(this.cacheKey);
							uni.removeStorageSync(this.statisticsCacheKey);
							
							// 清空其他可能的缓存
							const cacheKeys = [
								'user_profile_cache',
								'user_profile_statistics_cache',
								'user_center_page_data_cache',
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
							
							// 重新加载数据和缓存信息
							setTimeout(() => {
								this.loadUserInfo(true);
								this.loadStatisticsInfo(true);
								this.loadCacheInfo();
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
		},

		// 测试接口集成（开发环境）
		async testInterfaceIntegration() {
			console.log('=== 开始接口集成测试 ===');
			
			const testResults = {
				userCenterPage: false,
				personalCenterAssistance: false,
				favoriteVideos: false,
				jobApplicationRecords: false,
				cacheInfo: false,
				myTeam: false,
				generatePoster: false,
				withdrawalAmount: false,
				withdrawalRecords: false
			};
			
			// 测试个人中心页面接口
			try {
				const result = await getUserCenterPage();
				testResults.userCenterPage = true;
				console.log('✅ 个人中心页面接口测试成功:', result);
			} catch (error) {
				console.log('❌ 个人中心页面接口测试失败:', error);
			}
			
			// 测试帮扶记录接口
			try {
				const result = await getPersonalCenterAssistanceRecords({ page: 1, size: 5 });
				testResults.personalCenterAssistance = true;
				console.log('✅ 帮扶记录接口测试成功:', result);
			} catch (error) {
				console.log('❌ 帮扶记录接口测试失败:', error);
			}
			
			// 测试收藏视频接口
			try {
				const result = await getMyFavoriteVideos({ page: 1, size: 5 });
				testResults.favoriteVideos = true;
				console.log('✅ 收藏视频接口测试成功:', result);
			} catch (error) {
				console.log('❌ 收藏视频接口测试失败:', error);
			}
			
			// 测试求职记录接口
			try {
				const result = await getMyJobApplicationRecords({ page: 1, size: 5 });
				testResults.jobApplicationRecords = true;
				console.log('✅ 求职记录接口测试成功:', result);
			} catch (error) {
				console.log('❌ 求职记录接口测试失败:', error);
			}
			
			// 测试缓存信息接口
			try {
				const result = await getCacheInfo();
				testResults.cacheInfo = true;
				console.log('✅ 缓存信息接口测试成功:', result);
			} catch (error) {
				console.log('❌ 缓存信息接口测试失败:', error);
			}
			
			// 测试团队信息接口
			try {
				const result = await getMyTeam();
				testResults.myTeam = true;
				console.log('✅ 团队信息接口测试成功:', result);
			} catch (error) {
				console.log('❌ 团队信息接口测试失败:', error);
			}
			
			// 测试海报生成接口
			try {
				const result = await generateInvitePoster({
					type: 'test',
					customData: { test: true }
				});
				testResults.generatePoster = true;
				console.log('✅ 海报生成接口测试成功:', result);
			} catch (error) {
				console.log('❌ 海报生成接口测试失败:', error);
			}
			
			// 测试可提现金额接口
			try {
				const result = await getAvailableWithdrawalAmount();
				testResults.withdrawalAmount = true;
				console.log('✅ 可提现金额接口测试成功:', result);
			} catch (error) {
				console.log('❌ 可提现金额接口测试失败:', error);
			}
			
			// 测试提现记录接口
			try {
				const result = await getWithdrawalRecords({ page: 1, size: 5 });
				testResults.withdrawalRecords = true;
				console.log('✅ 提现记录接口测试成功:', result);
			} catch (error) {
				console.log('❌ 提现记录接口测试失败:', error);
			}
			
			// 汇总测试结果
			const successCount = Object.values(testResults).filter(Boolean).length;
			const totalCount = Object.keys(testResults).length;
			
			console.log(`=== 接口集成测试完成: ${successCount}/${totalCount} 成功 ===`);
			console.log('详细结果:', testResults);
			
			// 在开发环境显示测试结果
			if (successCount < totalCount) {
				uni.showToast({
					title: `接口测试: ${successCount}/${totalCount} 成功`,
					icon: 'none',
					duration: 3000
				});
			}
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