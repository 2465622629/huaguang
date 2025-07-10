<template>
    <view class="lawyer-profile-page" :style="{ backgroundImage: 'url(' + config.staticBaseUrl + '/bg11.png)' }">
        <!-- 状态栏占位 -->
        <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

        <!-- 自定义导航栏 -->
        <view class="custom-navbar">
            <view class="navbar-content">
                <view class="back-button" @click="goBack">
                    <uv-icon name="arrow-left" color="#FF4646" size="18"></uv-icon>
                    <text class="back-text">返回</text>
                </view>
            </view>
        </view>

        <!-- 滚动容器 -->
        <scroll-view class="scroll-container" scroll-y :style="{ height: scrollHeight + 'px' }" enable-flex>
            <!-- 用户信息卡片 -->
            <view class="user-info-card">
                <!-- 头像占位符 -->
                <view class="avatar-placeholder"></view>

                <!-- 详细信息列表 -->
                <view class="info-list">
                    <view class="info-row">
                        <text class="info-label">姓名</text>
                        <text class="info-content">{{ psychologistInfo.realName || '心理师' }}</text>
                    </view>
                    <view class="info-row">
                        <text class="info-label">专业领域</text>
                        <text class="info-content">{{ formatSpecialties(psychologistInfo.specialties) }}</text>
                    </view>
                    <view class="info-row">
                        <text class="info-label">执业经验</text>
                        <text class="info-content">{{ psychologistInfo.experienceYears || 0 }}年</text>
                    </view>
                </view>
            </view>

            <!-- 详细说明卡片 -->
            <view class="detail-info-card">
                <view class="detail-row">
                    <text class="detail-label">宣传语句</text>
                    <view class="detail-content">
                        <text class="detail-text">{{ psychologistInfo.slogan || '在你疲惫无助的时候，我会陪你一起走过这段低谷。' }}</text>
                    </view>
                </view>

                <view class="detail-row">
                    <text class="detail-label">服务优势</text>
                    <view class="detail-content">
                        <text class="detail-text">{{ psychologistInfo.serviceAdvantages || '擅长情绪调节、焦虑缓解与亲密关系修复，始终坚持倾听、共情与专业并重，致力于用温和而坚定的方式陪伴来访者走出困境。' }}</text>
                    </view>
                </view>

                <view class="detail-row">
                    <text class="detail-label">相关证书</text>
                    <view class="detail-content">
                        <view class="upload-area" @click="handleFileUpload">
                            <text class="upload-text">+ 上传附件</text>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 操作按钮 -->
            <view class="action-button" @click="handleSave" :class="{ disabled: loading }">
                <text class="button-text">{{ loading ? '保存中...' : '点击保存' }}</text>
            </view>

            <!-- 底部安全区域 -->
            <view class="bottom-safe-area"></view>
        </scroll-view>

        <!-- 心理师底部导航栏 -->
        <psychologist-tabbar></psychologist-tabbar>
    </view>
</template>

<script>
import PsychologistTabbar from '@/components/tabbar/psychologist-tabbar/psychologist-tabbar.vue'
import config from '@/config/index.js'
import { getPsychologistProfile, updatePsychologistProfile } from '@/api/modules/psychologist.js'

export default {
    name: 'PsychologistProfile',
    components: {
        PsychologistTabbar
    },
    data() {
        return {
            config,
            statusBarHeight: 0,
            scrollHeight: 0,
            loading: false,
            psychologistInfo: {
                realName: '',
                specialties: [],
                experienceYears: 0,
                slogan: '',
                serviceAdvantages: '',
                certificates: []
            }
        }
    },
    onLoad() {
        this.initPage()
        this.loadPsychologistInfo()
    },
    methods: {
        // 初始化页面
        initPage() {
            const systemInfo = uni.getSystemInfoSync()
            this.statusBarHeight = systemInfo.statusBarHeight || 0
            // 计算滚动区域高度：总高度 - 状态栏 - 导航栏 - 底部导航栏
            this.scrollHeight = systemInfo.windowHeight - this.statusBarHeight - 44 - 50
        },

        // 返回上一页
        goBack() {
            uni.navigateBack({
                fail: () => {
                    // 如果没有上一页，跳转到律师工作台首页
                    uni.navigateTo({
                        url: '/pages/lawyer/index/dashboard/index'
                    })
                }
            })
        },

        // 加载心理师信息
        async loadPsychologistInfo() {
            this.loading = true
            try {
                const response = await getPsychologistProfile()
                this.psychologistInfo = response.data || {}
                console.log('心理师信息加载成功:', this.psychologistInfo)
            } catch (error) {
                console.error('心理师信息加载失败:', error)
                uni.showToast({
                    title: '数据加载失败',
                    icon: 'none'
                })
            } finally {
                this.loading = false
            }
        },

        // 处理保存操作
        async handleSave() {
            if (this.loading) return
            
            this.loading = true
            try {
                const updateData = {
                    slogan: this.psychologistInfo.slogan || '在你疲惫无助的时候，我会陪你一起走过这段低谷。',
                    serviceAdvantages: this.psychologistInfo.serviceAdvantages || '擅长情绪调节、焦虑缓解与亲密关系修复...',
                    certificates: this.psychologistInfo.certificates || []
                }
                
                await updatePsychologistProfile(updateData)
                
                uni.showToast({
                    title: '保存成功',
                    icon: 'success'
                })
                
                console.log('心理师信息保存成功')
            } catch (error) {
                console.error('保存失败:', error)
                uni.showToast({
                    title: '保存失败，请重试',
                    icon: 'none'
                })
            } finally {
                this.loading = false
            }
        },

        // 格式化专业领域
        formatSpecialties(specialties) {
            if (!specialties || !Array.isArray(specialties)) {
                return '心理咨询'
            }
            return specialties.join('、') || '心理咨询'
        },

        // 处理文件上传
        handleFileUpload() {
            uni.chooseFile({
                count: 9,
                type: 'file',
                success: (res) => {
                    console.log('选择文件成功：', res.tempFilePaths)
                    uni.showToast({
                        title: '文件选择成功',
                        icon: 'success'
                    })
                    // 这里可以添加文件上传到服务器的逻辑
                },
                fail: (err) => {
                    console.log('选择文件失败：', err)
                    uni.showToast({
                        title: '文件选择失败',
                        icon: 'none'
                    })
                }
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.lawyer-profile-page {
    width: 100%;
    height: 100vh;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    position: relative;
}

// 状态栏占位
.status-bar {
    width: 100%;
    background: transparent;
}

// 自定义导航栏
.custom-navbar {
    height: 44px;
    background: transparent;

    .navbar-content {
        height: 100%;
        display: flex;
        align-items: center;
        padding: 0 15px;
    }

    .back-button {
        display: flex;
        align-items: center;

        .back-text {
            font-size: 16px;
            color: #FF4646;
            margin-left: 5px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Helvetica Neue', Helvetica, Arial, sans-serif;
        }
    }
}

// 滚动容器
.scroll-container {
    width: 100%;
    box-sizing: border-box;
}

// 用户信息卡片
.user-info-card {
    background-color: #FFFFFF;
    border-radius: 12px;
    padding: 20px 18px;
    margin: 15px 5%;
    box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);

    .avatar-placeholder {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background-color: #D8D8D8;
        margin: 0 auto 20px auto;
    }

    .info-list {
        padding: 0 10rpx;

        .info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;

            &:last-child {
                margin-bottom: 0;
            }

            .info-label {
                font-size: 14px;
                color: #666666;
                width: 30%;
                text-align: left;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Helvetica Neue', Helvetica, Arial, sans-serif;
            }

            .info-content {
                font-size: 14px;
                color: #000;
                flex: 1;
                margin-left: 12px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Helvetica Neue', Helvetica, Arial, sans-serif;
            }
        }
    }
}

// 详细说明卡片
.detail-info-card {
    background-color: #FFFFFF;
    border-radius: 12px;
    padding: 20px 18px;
    margin: 15px 5%;
    box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);

    .detail-row {
        display: flex;
        align-items: flex-start;
        margin-bottom: 18px;

        &:last-child {
            margin-bottom: 0;
        }

        .detail-label {
            font-size: 14px;
            color: #666666;
            width: 30%;
            text-align: left;
            margin-top: 2px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Helvetica Neue', Helvetica, Arial, sans-serif;
        }

        .detail-content {
            flex: 1;
            margin-left: 12px;

            .detail-text {
                display: block;
                font-size: 14px;
                color: #000;
                line-height: 1.5;
                margin-bottom: 2px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Helvetica Neue', Helvetica, Arial, sans-serif;

                &:last-child {
                    margin-bottom: 0;
                }
            }
        }
    }
}

// 操作按钮
.action-button {
    width: 60%;
    height: 44px;
    background-color: #ff5252;
    border-radius: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 25px auto;

    .button-text {
        font-size: 16px;
        color: #FFFFFF;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    }
}

// 底部安全区域
.bottom-safe-area {
    height: 20px;
}

// 上传区域
.upload-area {
    width: 100%;
    height: 44px;
    background-color: #F0F0F0;
    // border-radius: 22px;
    display: flex;
    align-items: center;
    justify-content: center;

    .upload-text {
        font-size: 16px;
        color: #666666;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    }
}
</style>