<template>
	<view class="profile-edit-page" :style="{ background: `url('${config.staticBaseUrl}/bg10.png') no-repeat center center / cover fixed` }">
		<!-- 自定义状态栏 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
		
		<!-- 导航栏 -->
		<view class="nav-bar">
			<view class="nav-back" @click="goBack">
				<uv-icon size="40" :name="config.staticBaseUrl + '/icons/back.png'"></uv-icon>
				<text class="nav-back-text">返回</text>
			</view>
		</view>
		
		<!-- 滚动容器 -->
		<scroll-view 
			class="scroll-container" 
			scroll-y 
			:style="{ height: scrollHeight + 'px' }"
			enable-flex
		>
			<!-- 主内容卡片 -->
			<view class="main-card">
				<!-- 头像区域 -->
				<view class="avatar-section" @click="changeAvatar">
					<view class="avatar-container">
						<image
							v-if="avatar"
							:src="avatar"
							class="avatar-image"
							mode="aspectFill"
						/>
						<view v-else class="avatar-placeholder"></view>
					</view>
					<text class="change-avatar-text">更换头像</text>
				</view>
				
				<!-- 昵称区域 -->
				<view class="form-section">
					<view class="form-row">
						<text class="form-label">昵称</text>
						<view class="form-input">
							<input
								v-model="nickname"
								class="input-field"
								placeholder="请输入昵称"
								maxlength="16"
							/>
						</view>
					</view>
					<text class="form-hint">2-16个字符，支持中英文、数字</text>
				</view>
				
				<!-- 会员编号区域 -->
				<view class="form-section">
					<view class="form-row">
						<text class="form-label">会员编号</text>
						<text class="form-value">{{ memberId }}</text>
						<text class="copy-icon" @click="copyMemberId">📄</text>
					</view>
					<view class="divider"></view>
				</view>
				
				<!-- 性别区域 -->
				<view class="form-section">
					<view class="form-row">
						<text class="form-label">性别</text>
						<view class="radio-group">
							<view class="radio-item" @click="selectGender('male')">
								<view class="radio-icon" :class="{ 'radio-selected': gender === 'male' }">
									<text v-if="gender === 'male'" class="radio-check">✓</text>
								</view>
								<text class="radio-text">男</text>
							</view>
							<view class="radio-item" @click="selectGender('female')">
								<view class="radio-icon" :class="{ 'radio-selected': gender === 'female' }">
									<text v-if="gender === 'female'" class="radio-check">✓</text>
								</view>
								<text class="radio-text">女</text>
							</view>
						</view>
					</view>
					<view class="divider"></view>
				</view>
				
				<!-- 联系方式区域 -->
				<view class="form-section">
					<view class="form-row">
						<text class="form-label">联系方式</text>
					</view>
					<view class="form-input-container">
						<input
							v-model="contact"
							class="contact-input"
							placeholder="微信号/邮箱号/手机号"
						/>
					</view>
				</view>
			</view>
			
			<!-- 保存按钮 -->
			<view class="save-button-container">
				<view
					class="save-button"
					:class="{ 'saving': saving }"
					@click="saveProfile"
				>
					<text class="save-button-text">{{ saving ? '保存中...' : '点击保存' }}</text>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
import config from '@/config/index.js'
import { getCurrentUser, updateProfile, uploadAvatar, getUserSettings, getFavorites } from '@/api/modules/user.js'

export default {
	data() {
		return {
			statusBarHeight: 0,
			scrollHeight: 0,
			config: config,
			loading: false,
			saving: false,
			uploadProgress: 0,
			retryCount: 0,
			maxRetries: 3,
			gender: 'male', // 默认选中男性
			nickname: '',
			memberId: '',
			contact: '',
			avatar: '',
			originalData: {}, // 保存原始数据用于比较
			dataLoaded: false // 标记数据是否已加载
		}
	},
	onLoad() {
		this.initPage();
		this.loadUserProfile();
	},
	methods: {
		// 重试机制工具函数
		async retryOperation(operation, maxRetries = 3) {
			for (let attempt = 1; attempt <= maxRetries; attempt++) {
				try {
					const result = await operation();
					return result;
				} catch (error) {
					console.log(`操作失败，第${attempt}次尝试:`, error);
					
					if (attempt === maxRetries) {
						throw error;
					}
					
					// 指数退避：1s, 2s, 4s
					const delay = Math.pow(2, attempt - 1) * 1000;
					await new Promise(resolve => setTimeout(resolve, delay));
				}
			}
		},

		// 格式化时间显示
		formatTime(timestamp) {
			if (!timestamp) return '';
			
			try {
				const date = new Date(timestamp);
				const now = new Date();
				const diff = now - date;
				
				if (diff < 60000) return '刚刚';
				if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
				if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
				if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;
				
				return date.toLocaleDateString();
			} catch (error) {
				console.error('时间格式化失败:', error);
				return '';
			}
		},

		// 初始化页面
		initPage() {
			const systemInfo = uni.getSystemInfoSync();
			this.statusBarHeight = systemInfo.statusBarHeight || 0;
			// 计算滚动区域高度：屏幕高度 - 状态栏 - 导航栏
			this.scrollHeight = systemInfo.windowHeight - this.statusBarHeight - 60;
		},

		// 加载用户资料（多源数据支持）
		async loadUserProfile() {
			if (this.loading) return;
			
			this.loading = true;
			let userData = null;
			
			try {
				// 主要数据源：用户资料API
				userData = await this.retryOperation(async () => {
					const response = await getCurrentUser();
					return response.data || response;
				});
				
				console.log('主要数据源加载成功:', userData);
			} catch (error) {
				console.error('主要数据源失败，尝试备用数据源:', error);
				
				// 备用数据源1：用户设置
				try {
					const settingsResponse = await this.retryOperation(async () => {
						return await getUserSettings();
					});
					const settingsData = settingsResponse.data || settingsResponse;
					
					if (settingsData && settingsData.userInfo) {
						userData = settingsData.userInfo;
						console.log('备用数据源1加载成功:', userData);
					}
				} catch (settingsError) {
					console.error('备用数据源1失败:', settingsError);
				}
				
				// 备用数据源2：从收藏记录中提取用户信息
				if (!userData) {
					try {
						const favoritesResponse = await this.retryOperation(async () => {
							return await getFavorites({ page: 1, pageSize: 1 });
						});
						const favoritesData = favoritesResponse.data || favoritesResponse;
						
						if (favoritesData && favoritesData.list && favoritesData.list.length > 0) {
							const firstFavorite = favoritesData.list[0];
							if (firstFavorite.user) {
								userData = firstFavorite.user;
								console.log('备用数据源2加载成功:', userData);
							}
						}
					} catch (favoritesError) {
						console.error('备用数据源2失败:', favoritesError);
					}
				}
			}
			
			// 处理获取到的用户数据
			if (userData) {
				this.processUserData(userData);
				this.dataLoaded = true;
			} else {
				// 所有数据源都失败，显示错误并使用默认值
				uni.showToast({
					title: '无法获取用户资料，请检查网络连接',
					icon: 'none',
					duration: 3000
				});
				
				// 设置默认值
				this.setDefaultUserData();
			}
			
			this.loading = false;
		},

		// 处理用户数据
		processUserData(userData) {
			try {
				// 映射API数据到表单
				this.nickname = userData.nickname || userData.name || '';
				this.memberId = userData.memberId || userData.id || userData.userId || '';
				this.gender = userData.gender || 'male';
				this.contact = userData.phone || userData.email || userData.contact || '';
				this.avatar = userData.avatar || userData.avatarUrl || '';
				
				// 保存原始数据
				this.originalData = {
					nickname: this.nickname,
					gender: this.gender,
					contact: this.contact,
					avatar: this.avatar
				};
				
				console.log('用户资料处理完成:', {
					nickname: this.nickname,
					memberId: this.memberId,
					gender: this.gender,
					contact: this.contact,
					avatar: this.avatar
				});
			} catch (error) {
				console.error('用户数据处理失败:', error);
				this.setDefaultUserData();
			}
		},

		// 设置默认用户数据
		setDefaultUserData() {
			this.nickname = '';
			this.memberId = '';
			this.gender = 'male';
			this.contact = '';
			this.avatar = '';
			
			this.originalData = {
				nickname: this.nickname,
				gender: this.gender,
				contact: this.contact,
				avatar: this.avatar
			};
		},
		
		// 返回上一页
		goBack() {
			// 检查是否有未保存的更改
			if (this.hasUnsavedChanges()) {
				uni.showModal({
					title: '提示',
					content: '您有未保存的更改，确定要离开吗？',
					success: (res) => {
						if (res.confirm) {
							uni.navigateBack();
						}
					}
				});
			} else {
				uni.navigateBack();
			}
		},
		
		// 检查是否有未保存的更改
		hasUnsavedChanges() {
			return this.nickname !== this.originalData.nickname ||
				   this.gender !== this.originalData.gender ||
				   this.contact !== this.originalData.contact ||
				   this.avatar !== this.originalData.avatar;
		},
		
		// 选择性别
		selectGender(value) {
			this.gender = value;
		},
		
		// 复制会员编号
		copyMemberId() {
			uni.setClipboardData({
				data: this.memberId,
				success: () => {
					uni.showToast({
						title: '已复制到剪贴板',
						icon: 'success'
					});
				}
			});
		},

		// 更换头像
		changeAvatar() {
			uni.chooseImage({
				count: 1,
				sizeType: ['compressed'],
				sourceType: ['album', 'camera'],
				success: (res) => {
					const tempFilePath = res.tempFilePaths[0];
					this.uploadAvatarFile(tempFilePath);
				},
				fail: (error) => {
					console.error('选择图片失败:', error);
					uni.showToast({
						title: '选择图片失败',
						icon: 'none'
					});
				}
			});
		},

		// 上传头像文件（增强版）
		async uploadAvatarFile(filePath) {
			// 文件验证
			if (!await this.validateImageFile(filePath)) {
				return;
			}
			
			this.uploadProgress = 0;
			uni.showLoading({ title: '上传中 0%' });
			
			try {
				// 使用重试机制上传头像
				const response = await this.retryOperation(async () => {
					return new Promise((resolve, reject) => {
						const uploadTask = uni.uploadFile({
							url: this.config.baseUrl + '/api/upload/avatar',
							filePath: filePath,
							name: 'file',
							header: {
								'Authorization': uni.getStorageSync('token') || ''
							},
							success: (res) => {
								try {
									const data = JSON.parse(res.data);
									if (data.code === 200 || data.success) {
										resolve(data);
									} else {
										reject(new Error(data.message || '上传失败'));
									}
								} catch (parseError) {
									reject(new Error('响应解析失败'));
								}
							},
							fail: (error) => {
								reject(error);
							}
						});
						
						// 监听上传进度
						uploadTask.onProgressUpdate((res) => {
							this.uploadProgress = res.progress;
							uni.showLoading({
								title: `上传中 ${res.progress}%`,
								mask: true
							});
						});
					});
				}, this.maxRetries);
				
				const avatarUrl = response.data?.url || response.url;
				
				if (avatarUrl) {
					this.avatar = avatarUrl;
					uni.showToast({
						title: '头像上传成功',
						icon: 'success',
						duration: 2000
					});
					
					console.log('头像上传成功:', avatarUrl);
				} else {
					throw new Error('上传响应中没有头像URL');
				}
			} catch (error) {
				console.error('头像上传失败:', error);
				
				// 根据错误类型显示不同提示
				let errorMessage = '头像上传失败';
				if (error.message.includes('网络')) {
					errorMessage = '网络连接失败，请检查网络';
				} else if (error.message.includes('大小')) {
					errorMessage = '图片文件过大';
				} else if (error.message.includes('格式')) {
					errorMessage = '图片格式不支持';
				}
				
				uni.showToast({
					title: errorMessage,
					icon: 'none',
					duration: 3000
				});
			} finally {
				this.uploadProgress = 0;
				uni.hideLoading();
			}
		},

		// 验证图片文件
		async validateImageFile(filePath) {
			try {
				// 获取文件信息
				const fileInfo = await new Promise((resolve, reject) => {
					uni.getFileInfo({
						filePath: filePath,
						success: resolve,
						fail: reject
					});
				});
				
				// 检查文件大小（5MB限制）
				const maxSize = 5 * 1024 * 1024; // 5MB
				if (fileInfo.size > maxSize) {
					uni.showToast({
						title: '图片大小不能超过5MB',
						icon: 'none',
						duration: 3000
					});
					return false;
				}
				
				// 获取图片信息
				const imageInfo = await new Promise((resolve, reject) => {
					uni.getImageInfo({
						src: filePath,
						success: resolve,
						fail: reject
					});
				});
				
				// 检查图片尺寸（建议最大2000x2000）
				const maxDimension = 2000;
				if (imageInfo.width > maxDimension || imageInfo.height > maxDimension) {
					uni.showModal({
						title: '提示',
						content: `图片尺寸较大(${imageInfo.width}x${imageInfo.height})，建议使用小于${maxDimension}x${maxDimension}的图片以获得更好的上传体验。是否继续上传？`,
						success: (res) => {
							return res.confirm;
						}
					});
				}
				
				console.log('图片验证通过:', {
					size: fileInfo.size,
					width: imageInfo.width,
					height: imageInfo.height,
					type: imageInfo.type
				});
				
				return true;
			} catch (error) {
				console.error('图片验证失败:', error);
				uni.showToast({
					title: '图片格式不支持',
					icon: 'none',
					duration: 3000
				});
				return false;
			}
		},

		// 验证表单数据（增强版）
		validateForm() {
			// 昵称验证
			if (!this.nickname || this.nickname.trim().length < 2) {
				uni.showToast({
					title: '昵称至少需要2个字符',
					icon: 'none',
					duration: 3000
				});
				return false;
			}

			if (this.nickname.trim().length > 16) {
				uni.showToast({
					title: '昵称不能超过16个字符',
					icon: 'none',
					duration: 3000
				});
				return false;
			}

			// 昵称格式验证（中英文、数字、下划线）
			const nicknamePattern = /^[\u4e00-\u9fa5a-zA-Z0-9_]+$/;
			if (!nicknamePattern.test(this.nickname.trim())) {
				uni.showToast({
					title: '昵称只能包含中英文、数字和下划线',
					icon: 'none',
					duration: 3000
				});
				return false;
			}

			// 联系方式验证（如果填写了）
			if (this.contact && this.contact.trim()) {
				const contactValue = this.contact.trim();
				
				// 检查是否为有效的手机号、邮箱或微信号
				const phonePattern = /^1[3-9]\d{9}$/;
				const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				const wechatPattern = /^[a-zA-Z0-9_]{6,20}$/;
				
				if (!phonePattern.test(contactValue) &&
					!emailPattern.test(contactValue) &&
					!wechatPattern.test(contactValue)) {
					uni.showToast({
						title: '请输入有效的手机号、邮箱或微信号',
						icon: 'none',
						duration: 3000
					});
					return false;
				}
			}

			// 性别验证
			if (!this.gender || !['male', 'female'].includes(this.gender)) {
				uni.showToast({
					title: '请选择性别',
					icon: 'none',
					duration: 3000
				});
				return false;
			}

			console.log('表单验证通过:', {
				nickname: this.nickname.trim(),
				gender: this.gender,
				contact: this.contact.trim(),
				avatar: this.avatar
			});

			return true;
		},
		
		// 保存个人资料（增强版）
		async saveProfile() {
			if (this.saving) return;
			
			// 验证表单
			if (!this.validateForm()) {
				return;
			}
			
			// 检查是否有变化
			if (!this.hasUnsavedChanges()) {
				uni.showToast({
					title: '没有需要保存的更改',
					icon: 'none',
					duration: 2000
				});
				return;
			}
			
			this.saving = true;
			uni.showLoading({ title: '保存中...' });
			
			try {
				// 准备更新数据
				const updateData = {
					nickname: this.nickname.trim(),
					gender: this.gender,
					avatar: this.avatar
				};

				// 联系方式验证和处理
				if (this.contact && this.contact.trim()) {
					const contactValue = this.contact.trim();
					
					// 手机号验证
					if (/^1[3-9]\d{9}$/.test(contactValue)) {
						updateData.phone = contactValue;
					}
					// 邮箱验证
					else if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactValue)) {
						updateData.email = contactValue;
					}
					// 微信号验证（6-20位字母数字下划线）
					else if (/^[a-zA-Z0-9_]{6,20}$/.test(contactValue)) {
						updateData.wechat = contactValue;
					}
					// 其他联系方式
					else {
						updateData.contact = contactValue;
					}
				}
				
				console.log('准备更新的数据:', updateData);
				
				// 使用重试机制保存
				const response = await this.retryOperation(async () => {
					return await updateProfile(updateData);
				}, this.maxRetries);
				
				// 更新原始数据
				this.originalData = {
					nickname: this.nickname,
					gender: this.gender,
					contact: this.contact,
					avatar: this.avatar
				};
				
				uni.showToast({
					title: '保存成功',
					icon: 'success',
					duration: 2000
				});
				
				console.log('个人资料更新成功:', response);
				
				// 延迟返回上一页
				setTimeout(() => {
					uni.navigateBack();
				}, 1500);
				
			} catch (error) {
				console.error('保存个人资料失败:', error);
				
				// 根据错误类型显示不同提示
				let errorMessage = '保存失败，请重试';
				if (error.message) {
					if (error.message.includes('网络')) {
						errorMessage = '网络连接失败，请检查网络后重试';
					} else if (error.message.includes('昵称')) {
						errorMessage = '昵称格式不正确或已被使用';
					} else if (error.message.includes('联系方式')) {
						errorMessage = '联系方式格式不正确';
					} else if (error.message.includes('权限')) {
						errorMessage = '没有权限修改资料';
					}
				}
				
				uni.showToast({
					title: errorMessage,
					icon: 'none',
					duration: 3000
				});
			} finally {
				this.saving = false;
				uni.hideLoading();
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.profile-edit-page {
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

.nav-bar {
	height: 60px;
	display: flex;
	align-items: center;
	padding: 0 30rpx;
}

.nav-back {
	display: flex;
	align-items: center;
	cursor: pointer;
}

.nav-back-icon {
	font-size: 34rpx;
	color: #4A90E2;
	margin-right: 8rpx;
	font-weight: normal;
}

.nav-back-text {
	font-size: 32rpx;
	color: #4A90E2;
	font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
}

.scroll-container {
	width: 100%;
	padding: 0 30rpx;
	box-sizing: border-box;
}

.main-card {
	background: #FFFFFF;
	border-radius: 40rpx 40rpx 20rpx 20rpx;
	padding: 40rpx 48rpx;
	margin-bottom: 60rpx;
	box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.06);
}

.avatar-section {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 50rpx;
	cursor: pointer;
}

.avatar-container {
	width: 160rpx;
	height: 160rpx;
	border-radius: 50%;
	overflow: hidden;
	margin-bottom: 16rpx;
	border: 4rpx solid #FFFFFF;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.avatar-image {
	width: 100%;
	height: 100%;
	border-radius: 50%;
}

.avatar-placeholder {
	width: 160rpx;
	height: 160rpx;
	border-radius: 50%;
	background-color: #D8D8D8;
	margin-bottom: 16rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #999999;
	font-size: 24rpx;
}

.change-avatar-text {
	font-size: 26rpx;
	color: #4A90E2;
	font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
}

.form-section {
	margin-bottom: 30rpx;
}

.form-row {
	display: flex;
	align-items: center;
	margin-bottom: 12rpx;
	min-height: 44rpx;
}

.form-label {
	font-size: 30rpx;
	color: #333333;
	width: 140rpx;
	flex-shrink: 0;
	font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
}

.form-input {
	flex: 1;
	margin-left: 40rpx;
	background-color: #F7F7F9;
	border-radius: 8rpx;
	padding: 20rpx 24rpx;
}

.input-field {
	width: 100%;
	font-size: 30rpx;
	color: #333333;
	background: transparent;
	border: none;
	outline: none;
	font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
}

.input-field::placeholder {
	color: #AAAAAA;
}

.form-input-container {
	margin-top: 20rpx;
	background-color: #F7F7F9;
	border-radius: 8rpx;
	padding: 20rpx 24rpx;
}

.contact-input {
	width: 100%;
	font-size: 30rpx;
	color: #333333;
	background: transparent;
	border: none;
	outline: none;
	font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
}

.contact-input::placeholder {
	color: #AAAAAA;
}

.input-text {
	font-size: 30rpx;
	color: #000000;
	font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
}

.form-value {
	flex: 1;
	margin-left: 40rpx;
	font-size: 30rpx;
	color: #333333;
	font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
}

.copy-icon {
	font-size: 30rpx;
	color: #333333;
	margin-left: 20rpx;
	cursor: pointer;
	width: 32rpx;
	height: 32rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.form-hint {
	font-size: 22rpx;
	color: #888888;
	margin-left: 180rpx;
	margin-top: 12rpx;
	font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
}

.form-placeholder-container {
	margin-top: 12rpx;
}

.form-placeholder {
	font-size: 30rpx;
	color: #AAAAAA;
	font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
}

.radio-group {
	display: flex;
	margin-left: 40rpx;
}

.radio-item {
	display: flex;
	align-items: center;
	margin-right: 50rpx;
	cursor: pointer;
}

.radio-icon {
	width: 32rpx;
	height: 32rpx;
	border-radius: 50%;
	border: 2rpx solid #CCCCCC;
	background-color: #FFFFFF;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 12rpx;
}

.radio-selected {
	background-color: #4A90E2;
	border-color: #4A90E2;
}

.radio-check {
	font-size: 20rpx;
	color: #FFFFFF;
	font-weight: bold;
}

.radio-text {
	font-size: 30rpx;
	color: #333333;
	font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
}

.divider {
	height: 2rpx;
	background-color: #EEEEEE;
	margin: 30rpx 0;
}

.save-button-container {
	padding: 0 30rpx;
	margin-bottom: 40rpx;
	display: flex;
	justify-content: center;
}

.save-button {
	width: 100%;
	height: 88rpx;
	background-color: #5291ff;
	border-radius: 44rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	box-shadow: 0 4rpx 12rpx rgba(74, 144, 226, 0.3);
	transition: all 0.3s ease;
}

.save-button.saving {
	background-color: #CCCCCC;
	cursor: not-allowed;
	box-shadow: none;
}

.save-button-text {
	font-size: 32rpx;
	color: #FFFFFF;
	font-weight: 500;
	font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
}
</style>