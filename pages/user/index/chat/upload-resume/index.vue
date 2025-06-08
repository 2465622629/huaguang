<template>
    <view class="upload-resume-page" :style="{ backgroundImage: `url('${config.staticBaseUrl}/bg9.png')` }">
        <!-- iOS状态栏占位 -->
        <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

        <!-- 自定义导航栏 -->
        <view class="custom-navbar">
            <view class="navbar-content">
                <!-- 返回按钮 -->
                <view class="back-button" @click="goBack">
                    <uv-icon :name="`${config.staticBaseUrl}/icons/back.png`" size="32" color="#4A90E2"></uv-icon>
                </view>
            </view>
        </view>

        <!-- 主内容区域 -->
        <view class="main-content">
            <!-- 简历上传卡片 -->
            <view class="upload-card" @click="chooseFile">
                <!-- 简历图片 -->
                <image :src="`${config.staticBaseUrl}/jianli.png`" class="resume-image" mode="aspectFit"></image>

                <!-- 上传文本 -->
                <text class="upload-text">+ 上传简历</text>
            </view>
        </view>

        <!-- 底部确认按钮 -->
        <view class="bottom-action">
            <view class="confirm-button" @click="confirmSave">
                <text class="confirm-text">确认保存</text>
            </view>
        </view>

    </view>
</template>

<script>
import config from '@/config/index.js'

export default {
    name: 'UploadResume',
    data() {
        return {
            statusBarHeight: 0,
            selectedFile: null,
            config
        }
    },
    onLoad() {
        // 获取系统信息
        const systemInfo = uni.getSystemInfoSync()
        this.statusBarHeight = systemInfo.statusBarHeight || 0
    },
    methods: {
        // 返回上一页
        goBack() {
            uni.navigateBack({
                delta: 1
            })
        },

        // 选择文件
        chooseFile() {
            // #ifdef APP-PLUS || H5
            uni.chooseFile({
                count: 1,
                type: 'file',
                extension: ['.pdf', '.doc', '.docx'],
                success: (res) => {
                    this.selectedFile = res.tempFiles[0]
                    uni.showToast({
                        title: '文件选择成功',
                        icon: 'success'
                    })
                },
                fail: (err) => {
                    console.log('选择文件失败:', err)
                    uni.showToast({
                        title: '选择文件失败',
                        icon: 'none'
                    })
                }
            })
            // #endif

            // #ifdef MP-WEIXIN
            uni.chooseMessageFile({
                count: 1,
                type: 'file',
                success: (res) => {
                    this.selectedFile = res.tempFiles[0]
                    uni.showToast({
                        title: '文件选择成功',
                        icon: 'success'
                    })
                },
                fail: (err) => {
                    console.log('选择文件失败:', err)
                    uni.showToast({
                        title: '选择文件失败',
                        icon: 'none'
                    })
                }
            })
            // #endif
        },

        // 确认保存
        confirmSave() {
            if (!this.selectedFile) {
                uni.showToast({
                    title: '请先选择简历文件',
                    icon: 'none'
                })
                return
            }

            // 显示加载状态
            uni.showLoading({
                title: '正在保存...'
            })

            // 模拟保存过程
            setTimeout(() => {
                uni.hideLoading()
                uni.showToast({
                    title: '保存成功',
                    icon: 'success'
                })

                // 保存成功后返回上一页
                setTimeout(() => {
                    this.goBack()
                }, 1500)
            }, 2000)
        }
    }
}
</script>

<style lang="scss" scoped>
.upload-resume-page {
    width: 100%;
    height: 100vh;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    display: flex;
    flex-direction: column;
    position: relative;
}

.status-bar {
    width: 100%;
}

.custom-navbar {
    width: 100%;
    height: 88rpx;
    display: flex;
    align-items: center;
    padding: 0 30rpx;

    .navbar-content {
        width: 100%;
        display: flex;
        align-items: center;

        .back-button {
            width: 60rpx;
            height: 60rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
        }
    }
}

.main-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 60rpx 40rpx 0rpx 40rpx;
}

.upload-card {
    width: 85%;
    height: 720rpx;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 32rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60rpx 40rpx;
    cursor: pointer;
    backdrop-filter: blur(10rpx);
    position: relative;

    &::before {
        content: '';
        position: absolute;
        top: 20rpx;
        left: 20rpx;
        right: 20rpx;
        bottom: 20rpx;
        border: 2rpx dashed #D1D5DB;
        border-radius: 24rpx;
        pointer-events: none;
    }

    .resume-image {
        width: 300rpx;
        height: 300rpx;
        margin-bottom: 50rpx;
    }

    .upload-text {
        font-size: 42rpx;
        color: #60A5FA;
        font-weight: 500;
        font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
    }
}

.bottom-action {
    padding: 0rpx 40rpx 320rpx 40rpx;
    display: flex;
    justify-content: center;

    .confirm-button {
        width: 85%;
        height: 96rpx;
        background: #3B82F6;
        border-radius: 48rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;

        .confirm-text {
            font-size: 36rpx;
            color: #FFFFFF;
            font-weight: 400;
            font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
        }
    }
}

.home-indicator {
    position: absolute;
    bottom: 16rpx;
    left: 50%;
    transform: translateX(-50%);
    width: 280rpx;
    height: 8rpx;
    background: #000000;
    border-radius: 4rpx;
}
</style>
