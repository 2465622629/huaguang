<template>
	<view class="home-container">
		<!-- 轮播图区域 -->
		<view class="banner-section" v-if="banners.length > 0">
			<swiper
				class="banner-swiper"
				:indicator-dots="true"
				:autoplay="true"
				:interval="3000"
				:duration="500"
				indicator-color="rgba(255, 255, 255, 0.5)"
				indicator-active-color="#4893FF"
			>
				<swiper-item v-for="(banner, index) in banners" :key="index">
					<image
						:src="banner.imageUrl"
						class="banner-image"
						mode="aspectFill"
						@click="handleBannerClick(banner)"
					/>
				</swiper-item>
			</swiper>
		</view>

		<!-- 功能导航区域 -->
		<view class="navigation-section" v-if="navigations.length > 0">
			<view class="section-title">
				<text>服务导航</text>
			</view>
			<view class="nav-grid">
				<view
					class="nav-item"
					v-for="(nav, index) in navigations"
					:key="index"
					@click="handleNavClick(nav)"
				>
					<image :src="nav.icon" class="nav-icon" mode="aspectFit" />
					<text class="nav-text">{{ nav.title }}</text>
				</view>
			</view>
		</view>

		<!-- 服务卡片区域 -->
		<view class="service-section" v-if="serviceCards.length > 0">
			<view class="section-title">
				<text>热门服务</text>
			</view>
			<view class="service-cards">
				<view
					class="service-card"
					v-for="(card, index) in serviceCards"
					:key="index"
					@click="handleServiceClick(card)"
				>
					<image :src="card.imageUrl" class="service-image" mode="aspectFill" />
					<view class="service-info">
						<text class="service-title">{{ card.title }}</text>
						<text class="service-desc">{{ card.description }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 热门律师推荐 -->
		<view class="lawyers-section" v-if="hotLawyers.length > 0">
			<view class="section-title">
				<text>热门律师</text>
				<text class="more-link" @click="goToLawyerList">更多</text>
			</view>
			<scroll-view class="lawyers-scroll" scroll-x="true" show-scrollbar="false">
				<view class="lawyers-list">
					<view
						class="lawyer-card"
						v-for="(lawyer, index) in hotLawyers"
						:key="index"
						@click="goToLawyerDetail(lawyer)"
					>
						<image :src="lawyer.avatar || '/static/default-avatar.png'" class="lawyer-avatar" mode="aspectFill" />
						<view class="lawyer-info">
							<text class="lawyer-name">{{ lawyer.realName }}</text>
							<text class="lawyer-specialty">{{ lawyer.specialty }}</text>
							<view class="lawyer-rating">
								<text class="rating-text">{{ lawyer.rating || '5.0' }}</text>
								<text class="rating-count">({{ lawyer.consultationCount || 0 }})</text>
							</view>
						</view>
					</view>
				</view>
			</scroll-view>
		</view>

		<!-- 热门职位推荐 -->
		<view class="jobs-section" v-if="hotJobs.length > 0">
			<view class="section-title">
				<text>热门职位</text>
				<text class="more-link" @click="goToJobList">更多</text>
			</view>
			<view class="jobs-list">
				<view
					class="job-card"
					v-for="(job, index) in hotJobs"
					:key="index"
					@click="goToJobDetail(job)"
				>
					<view class="job-header">
						<text class="job-title">{{ job.title }}</text>
						<text class="job-salary">{{ job.salary }}</text>
					</view>
					<view class="job-info">
						<text class="job-company">{{ job.companyName }}</text>
						<text class="job-location">{{ job.location }}</text>
					</view>
					<view class="job-tags">
						<text
							class="job-tag"
							v-for="(tag, tagIndex) in job.tags"
							:key="tagIndex"
						>{{ tag }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 加载状态 -->
		<view class="loading-section" v-if="isLoading">
			<uv-loading-icon mode="flower"></uv-loading-icon>
			<text class="loading-text">加载中...</text>
		</view>

		<!-- 错误状态 -->
		<view class="error-section" v-if="hasError && !isLoading">
			<image src="/static/error-icon.png" class="error-icon" mode="aspectFit" />
			<text class="error-text">{{ errorMessage }}</text>
			<uv-button
				text="重新加载"
				type="primary"
				size="small"
				@click="retryLoad"
				:custom-style="{ marginTop: '20rpx' }"
			/>
		</view>
	</view>
</template>

<script>
	import {
		getHomePageData,
		getBanners,
		getNavigations,
		getHotLawyers,
		getHotJobs,
		getServiceCards
	} from '@/api/modules/home.js'
	
	export default {
		data() {
			return {
				// 轮播图数据
				banners: [],
				// 功能导航数据
				navigations: [],
				// 服务卡片数据
				serviceCards: [],
				// 热门律师数据
				hotLawyers: [],
				// 热门职位数据
				hotJobs: [],
				// 加载状态
				isLoading: false,
				// 错误状态
				hasError: false,
				errorMessage: '',
				// 重试计数
				retryCount: 0,
				maxRetries: 3,
				// 缓存时间戳
				cacheTimestamp: 0,
				cacheExpiry: 5 * 60 * 1000 // 5分钟缓存
			}
		},
		onLoad() {
			this.initHomePage()
		},
		onShow() {
			// 检查缓存是否过期
			if (this.shouldRefreshCache()) {
				this.initHomePage()
			}
		},
		onPullDownRefresh() {
			this.refreshHomePage()
		},
		methods: {
			/**
			 * 初始化主页数据
			 */
			async initHomePage() {
				this.isLoading = true
				this.hasError = false
				this.retryCount = 0
				
				try {
					await this.loadHomeData()
					this.cacheTimestamp = Date.now()
				} catch (error) {
					console.error('初始化主页失败：', error)
					this.handleLoadError('加载失败，请重试')
				} finally {
					this.isLoading = false
				}
			},

			/**
			 * 刷新主页数据
			 */
			async refreshHomePage() {
				try {
					await this.loadHomeData()
					this.cacheTimestamp = Date.now()
					uni.showToast({
						title: '刷新成功',
						icon: 'success'
					})
				} catch (error) {
					console.error('刷新主页失败：', error)
					uni.showToast({
						title: '刷新失败',
						icon: 'none'
					})
				} finally {
					uni.stopPullDownRefresh()
				}
			},

			/**
			 * 加载主页数据
			 */
			async loadHomeData() {
				const promises = [
					// this.loadBanners(),
					this.loadNavigations(),
					this.loadServiceCards(),
					this.loadHotLawyers(),
					this.loadHotJobs()
				]

				// 并行加载所有数据，但允许部分失败
				const results = await Promise.allSettled(promises)
				
				// 检查是否有关键数据加载失败
				const failedCount = results.filter(result => result.status === 'rejected').length
				if (failedCount === promises.length) {
					throw new Error('所有数据加载失败')
				}
			},

			/**
			 * 加载轮播图数据
			 */
			// async loadBanners() {
			// 	try {
			// 		const response = await this.executeWithRetry(() => getBanners({ active: true }))
			// 		this.banners = response.data || []
			// 	} catch (error) {
			// 		console.error('加载轮播图失败：', error)
			// 		this.banners = this.getDefaultBanners()
			// 	}
			// },

			/**
			 * 加载功能导航数据
			 */
			async loadNavigations() {
				try {
					const response = await this.executeWithRetry(() => getNavigations())
					this.navigations = response.data || []
				} catch (error) {
					console.error('加载功能导航失败：', error)
					this.navigations = this.getDefaultNavigations()
				}
			},

			/**
			 * 加载服务卡片数据
			 */
			async loadServiceCards() {
				try {
					const response = await this.executeWithRetry(() => getServiceCards())
					this.serviceCards = response.data || []
				} catch (error) {
					console.error('加载服务卡片失败：', error)
					this.serviceCards = this.getDefaultServiceCards()
				}
			},

			/**
			 * 加载热门律师数据
			 */
			async loadHotLawyers() {
				try {
					const response = await this.executeWithRetry(() => getHotLawyers({ limit: 10 }))
					this.hotLawyers = response.data || []
				} catch (error) {
					console.error('加载热门律师失败：', error)
					this.hotLawyers = []
				}
			},

			/**
			 * 加载热门职位数据
			 */
			async loadHotJobs() {
				try {
					const response = await this.executeWithRetry(() => getHotJobs({ limit: 8 }))
					this.hotJobs = response.data || []
				} catch (error) {
					console.error('加载热门职位失败：', error)
					this.hotJobs = []
				}
			},

			/**
			 * 带重试机制的请求执行
			 */
			async executeWithRetry(requestFn, currentRetry = 0) {
				try {
					return await requestFn()
				} catch (error) {
					if (currentRetry < this.maxRetries) {
						const delay = Math.min(1000 * Math.pow(2, currentRetry), 8000) + Math.random() * 1000
						await new Promise(resolve => setTimeout(resolve, delay))
						return this.executeWithRetry(requestFn, currentRetry + 1)
					}
					throw error
				}
			},

			/**
			 * 处理加载错误
			 */
			handleLoadError(message) {
				this.hasError = true
				this.errorMessage = message
			},

			/**
			 * 重试加载
			 */
			async retryLoad() {
				if (this.retryCount < this.maxRetries) {
					this.retryCount++
					await this.initHomePage()
				} else {
					uni.showToast({
						title: '重试次数过多，请稍后再试',
						icon: 'none'
					})
				}
			},

			/**
			 * 检查是否需要刷新缓存
			 */
			shouldRefreshCache() {
				return Date.now() - this.cacheTimestamp > this.cacheExpiry
			},

			/**
			 * 轮播图点击处理
			 */
			handleBannerClick(banner) {
				if (banner.linkUrl) {
					uni.navigateTo({
						url: banner.linkUrl
					})
				}
			},

			/**
			 * 导航点击处理
			 */
			handleNavClick(nav) {
				if (nav.url) {
					uni.navigateTo({
						url: nav.url
					})
				}
			},

			/**
			 * 服务卡片点击处理
			 */
			handleServiceClick(service) {
				if (service.url) {
					uni.navigateTo({
						url: service.url
					})
				}
			},

			/**
			 * 跳转到律师详情
			 */
			goToLawyerDetail(lawyer) {
				uni.navigateTo({
					url: `/pages/user/index/lawyer-detail/index?id=${lawyer.id}`
				})
			},

			/**
			 * 跳转到律师列表
			 */
			goToLawyerList() {
				uni.navigateTo({
					url: '/pages/user/index/legal-help/index'
				})
			},

			/**
			 * 跳转到职位详情
			 */
			goToJobDetail(job) {
				uni.navigateTo({
					url: `/pages/user/index/job-detail/index?id=${job.id}`
				})
			},

			/**
			 * 跳转到职位列表
			 */
			goToJobList() {
				uni.navigateTo({
					url: '/pages/user/index/job-platform/index'
				})
			},

			/**
			 * 获取默认轮播图数据
			 */
			getDefaultBanners() {
				return [
					{
						id: 1,
						imageUrl: '/static/banner-default-1.jpg',
						title: '华光APP - 您的法律助手',
						linkUrl: '/pages/user/index/legal-help/index'
					},
					{
						id: 2,
						imageUrl: '/static/banner-default-2.jpg',
						title: '专业律师在线咨询',
						linkUrl: '/pages/user/index/consultation/index'
					}
				]
			},

			/**
			 * 获取默认功能导航数据
			 */
			getDefaultNavigations() {
				return [
					{ id: 1, title: '法律咨询', icon: '/static/nav-legal.png', url: '/pages/user/index/legal-help/index' },
					{ id: 2, title: '求职招聘', icon: '/static/nav-job.png', url: '/pages/user/index/job-platform/index' },
					{ id: 3, title: '心理咨询', icon: '/static/nav-psychology.png', url: '/pages/user/fund/psychological/index' },
					{ id: 4, title: '青年基金', icon: '/static/nav-fund.png', url: '/pages/user/fund/index' },
					{ id: 5, title: '技能培训', icon: '/static/nav-training.png', url: '/pages/user/index/skill-training/index' },
					{ id: 6, title: '企业服务', icon: '/static/nav-enterprise.png', url: '/pages/enterprise/jobhunting/index' }
				]
			},

			/**
			 * 获取默认服务卡片数据
			 */
			getDefaultServiceCards() {
				return [
					{
						id: 1,
						title: '免费法律咨询',
						description: '专业律师在线解答',
						imageUrl: '/static/service-legal.jpg',
						url: '/pages/user/index/legal-help/index'
					},
					{
						id: 2,
						title: '职业规划指导',
						description: '专业求职建议',
						imageUrl: '/static/service-career.jpg',
						url: '/pages/user/index/job-platform/index'
					}
				]
			}
		}
	}
</script>

<style>
.home-container {
	background-color: #f8f9fa;
	min-height: 100vh;
}

/* 轮播图样式 */
.banner-section {
	margin-bottom: 20rpx;
}

.banner-swiper {
	height: 300rpx;
}

.banner-image {
	width: 100%;
	height: 100%;
}

/* 区域标题样式 */
.section-title {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx 30rpx 20rpx;
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
}

.more-link {
	font-size: 28rpx;
	color: #4893FF;
	font-weight: normal;
}

/* 功能导航样式 */
.navigation-section {
	background: white;
	margin-bottom: 20rpx;
}

.nav-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 20rpx;
	padding: 0 30rpx 30rpx;
}

.nav-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 20rpx;
	border-radius: 12rpx;
	background: #f8f9fa;
}

.nav-icon {
	width: 60rpx;
	height: 60rpx;
	margin-bottom: 10rpx;
}

.nav-text {
	font-size: 24rpx;
	color: #333;
	text-align: center;
}

/* 服务卡片样式 */
.service-section {
	background: white;
	margin-bottom: 20rpx;
}

.service-cards {
	padding: 0 30rpx 30rpx;
}

.service-card {
	display: flex;
	background: white;
	border-radius: 12rpx;
	box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.1);
	margin-bottom: 20rpx;
	overflow: hidden;
}

.service-image {
	width: 160rpx;
	height: 120rpx;
	flex-shrink: 0;
}

.service-info {
	flex: 1;
	padding: 20rpx;
	display: flex;
	flex-direction: column;
	justify-content: center;
}

.service-title {
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 10rpx;
}

.service-desc {
	font-size: 24rpx;
	color: #666;
}

/* 热门律师样式 */
.lawyers-section {
	background: white;
	margin-bottom: 20rpx;
}

.lawyers-scroll {
	white-space: nowrap;
}

.lawyers-list {
	display: flex;
	padding: 0 30rpx 30rpx;
}

.lawyer-card {
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 200rpx;
	margin-right: 20rpx;
	padding: 20rpx;
	background: #f8f9fa;
	border-radius: 12rpx;
	flex-shrink: 0;
}

.lawyer-avatar {
	width: 80rpx;
	height: 80rpx;
	border-radius: 50%;
	margin-bottom: 10rpx;
}

.lawyer-info {
	text-align: center;
	width: 100%;
}

.lawyer-name {
	font-size: 26rpx;
	font-weight: bold;
	color: #333;
	display: block;
	margin-bottom: 5rpx;
}

.lawyer-specialty {
	font-size: 22rpx;
	color: #666;
	display: block;
	margin-bottom: 5rpx;
}

.lawyer-rating {
	display: flex;
	justify-content: center;
	align-items: center;
}

.rating-text {
	font-size: 22rpx;
	color: #ff6b35;
	margin-right: 5rpx;
}

.rating-count {
	font-size: 20rpx;
	color: #999;
}

/* 热门职位样式 */
.jobs-section {
	background: white;
	margin-bottom: 20rpx;
}

.jobs-list {
	padding: 0 30rpx 30rpx;
}

.job-card {
	background: white;
	border-radius: 12rpx;
	box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.1);
	padding: 30rpx;
	margin-bottom: 20rpx;
}

.job-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 15rpx;
}

.job-title {
	font-size: 30rpx;
	font-weight: bold;
	color: #333;
	flex: 1;
}

.job-salary {
	font-size: 28rpx;
	color: #ff6b35;
	font-weight: bold;
}

.job-info {
	display: flex;
	justify-content: space-between;
	margin-bottom: 15rpx;
}

.job-company {
	font-size: 26rpx;
	color: #666;
}

.job-location {
	font-size: 26rpx;
	color: #666;
}

.job-tags {
	display: flex;
	flex-wrap: wrap;
}

.job-tag {
	font-size: 22rpx;
	color: #4893FF;
	background: rgba(72, 147, 255, 0.1);
	padding: 8rpx 16rpx;
	border-radius: 20rpx;
	margin-right: 10rpx;
	margin-bottom: 10rpx;
}

/* 加载和错误状态样式 */
.loading-section, .error-section {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 100rpx 30rpx;
}

.loading-text, .error-text {
	font-size: 28rpx;
	color: #666;
	margin-top: 20rpx;
}

.error-icon {
	width: 120rpx;
	height: 120rpx;
}
</style>
