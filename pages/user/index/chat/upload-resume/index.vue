<template>
    <view class="upload-resume-page" :style="{ backgroundImage: `url('${config.staticBaseUrl}/bg9.png')` }">
        <!-- iOS状态栏占位 -->
        <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

        <!-- 自定义导航栏 -->
        <view class="custom-navbar">
            <view class="navbar-content">
                <!-- 返回按钮 -->
                <view class="back-button" @click="goBack">
                    <uv-icon name="arrow-left" size="32" color="#4A90E2"></uv-icon>
                </view>
                <text class="navbar-title">上传简历</text>
                <!-- 帮助按钮 -->
                <view class="help-button" @click="showHelp">
                    <uv-icon name="help" size="32" color="#4A90E2"></uv-icon>
                </view>
            </view>
        </view>

        <!-- 主内容区域 -->
        <view class="main-content">
            <!-- 文件选择状态显示 -->
            <view v-if="selectedFile" class="file-preview-card">
                <!-- 文件信息 -->
                <view class="file-info">
                    <view class="file-icon">
                        <uv-icon :name="getFileIcon(selectedFile.name)" size="80" color="#4A90E2"></uv-icon>
                    </view>
                    <view class="file-details">
                        <text class="file-name">{{ selectedFile.name }}</text>
                        <text class="file-size">{{ formatFileSize(selectedFile.size) }}</text>
                        <text class="file-type">{{ getFileType(selectedFile.name) }}</text>
                    </view>
                    <view class="file-actions">
                        <view class="action-btn" @click="previewFile" v-if="canPreview">
                            <uv-icon name="eye" size="32" color="#52C41A"></uv-icon>
                        </view>
                        <view class="action-btn" @click="removeFile">
                            <uv-icon name="close" size="32" color="#FF4D4F"></uv-icon>
                        </view>
                    </view>
                </view>
                
                <!-- 上传进度 -->
                <view v-if="uploadStatus === 'uploading'" class="upload-progress">
                    <view class="progress-bar">
                        <view class="progress-fill" :style="{ width: uploadProgress + '%' }"></view>
                    </view>
                    <text class="progress-text">{{ uploadProgress.toFixed(1) }}%</text>
                </view>
                
                <!-- 上传状态 -->
                <view v-else-if="uploadStatus === 'success'" class="upload-status success">
                    <uv-icon name="checkmark-circle" size="32" color="#52C41A"></uv-icon>
                    <text class="status-text">上传成功</text>
                </view>
                <view v-else-if="uploadStatus === 'failed'" class="upload-status failed">
                    <uv-icon name="close-circle" size="32" color="#FF4D4F"></uv-icon>
                    <text class="status-text">上传失败</text>
                </view>
            </view>

            <!-- 简历上传卡片 -->
            <view v-else class="upload-card" @click="chooseFile">
                <!-- 简历图片 -->
                <image :src="config.staticBaseUrl + '/jianli.png'" class="resume-image" mode="aspectFit"></image>

                <!-- 上传文本 -->
                <text class="upload-text">+ 上传简历</text>
                <text class="upload-hint">支持 PDF、DOC、DOCX 格式，文件大小不超过 10MB</text>
            </view>

            <!-- 历史简历列表 -->
            <view v-if="resumeHistory.length > 0" class="history-section">
                <text class="section-title">最近上传</text>
                <scroll-view class="history-list" scroll-y="true" :style="{ maxHeight: '300rpx' }">
                    <view 
                        v-for="resume in resumeHistory" 
                        :key="resume.id"
                        class="history-item"
                        @click="selectHistoryResume(resume)"
                    >
                        <view class="history-icon">
                            <uv-icon :name="getFileIcon(resume.fileName)" size="48" color="#666666"></uv-icon>
                        </view>
                        <view class="history-info">
                            <text class="history-name">{{ resume.fileName }}</text>
                            <text class="history-date">{{ formatDate(resume.uploadTime) }}</text>
                        </view>
                        <view class="history-action">
                            <uv-icon name="arrow-right" size="24" color="#CCCCCC"></uv-icon>
                        </view>
                    </view>
                </scroll-view>
            </view>
        </view>

        <!-- 底部确认按钮 -->
        <view class="bottom-action">
            <uv-button 
                :text="getButtonText()"
                :type="selectedFile ? 'primary' : 'default'"
                :disabled="!selectedFile || isUploading"
                :loading="isUploading"
                size="large"
                @click="confirmSave"
                class="confirm-button"
            />
        </view>

        <!-- 帮助弹窗 -->
        <uv-modal 
            ref="helpModal"
            :show="showHelpModal"
            title="上传帮助"
            @close="showHelpModal = false"
            @confirm="showHelpModal = false"
        >
            <view class="help-content">
                <text class="help-title">支持的文件格式：</text>
                <text class="help-text">• PDF (.pdf)</text>
                <text class="help-text">• Word 文档 (.doc, .docx)</text>
                
                <text class="help-title">文件大小限制：</text>
                <text class="help-text">• 最大文件大小：10MB</text>
                
                <text class="help-title">建议：</text>
                <text class="help-text">• 使用 PDF 格式保证格式兼容性</text>
                <text class="help-text">• 文件名尽量简洁明了</text>
                <text class="help-text">• 确保简历内容完整清晰</text>
            </view>
        </uv-modal>
    </view>
</template>

<script>
import config from '@/config/index.js'
import { uploadResume, sendResumeToChat, getUserResumeHistory } from '@/api/modules/enterprise.js'
import { uploadChatMedia } from '@/api/modules/chat.js'

export default {
    name: 'UploadResume',
    data() {
        return {
            statusBarHeight: 0,
            selectedFile: null,
            config,
            
            // 企业级状态管理
            isLoading: false,
            isUploading: false,
            uploadProgress: 0,
            showHelpModal: false,
            
            // 重试机制配置
            retryConfig: {
                maxRetries: 3,
                baseDelay: 1000,
                maxDelay: 8000
            },
            
            // 页面参数
            sessionId: '',
            targetType: '',
            targetId: '',
            
            // 文件验证配置
            allowedTypes: ['.pdf', '.doc', '.docx'],
            allowedMimeTypes: [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ],
            maxFileSize: 10 * 1024 * 1024, // 10MB
            
            // 上传状态
            uploadStatus: 'idle', // idle, uploading, success, failed
            
            // 简历历史记录
            resumeHistory: [],
            
            // 缓存管理
            cacheKey: 'user_resume_history',
            cacheExpiry: 30 * 60 * 1000 // 30分钟缓存
        }
    },
    
    computed: {
        canPreview() {
            if (!this.selectedFile) return false
            const fileName = this.selectedFile.name.toLowerCase()
            return fileName.endsWith('.pdf')
        }
    },
    
    async onLoad(options) {
        // 获取系统信息
        const systemInfo = uni.getSystemInfoSync()
        this.statusBarHeight = systemInfo.statusBarHeight || 0
        
        // 解析页面参数
        this.parsePageParams(options)
        
        // 加载简历历史
        await this.loadResumeHistory()
    },
    
    methods: {
        /**
         * 解析页面参数
         */
        parsePageParams(options) {
            try {
                this.sessionId = options.sessionId || ''
                this.targetType = options.targetType || 'enterprise'
                this.targetId = options.targetId || ''
                
                console.log('上传简历页面参数:', {
                    sessionId: this.sessionId,
                    targetType: this.targetType,
                    targetId: this.targetId
                })
            } catch (error) {
                console.error('解析页面参数失败:', error)
            }
        },
        
        /**
         * 加载简历历史记录
         */
        async loadResumeHistory() {
            try {
                // 先尝试从缓存加载
                const cachedHistory = this.loadCachedHistory()
                if (cachedHistory) {
                    this.resumeHistory = cachedHistory
                }
                
                // 异步加载最新数据
                const response = await this.executeWithRetry(() => 
                    getUserResumeHistory({ limit: 5 })
                )
                
                if (response?.data) {
                    this.resumeHistory = response.data.map(item => ({
                        id: item.id,
                        fileName: item.fileName || item.name,
                        uploadTime: item.uploadTime || item.createdAt,
                        fileUrl: item.fileUrl || item.url,
                        fileSize: item.fileSize || item.size
                    }))
                    
                    // 缓存数据
                    this.saveCachedHistory(this.resumeHistory)
                }
                
            } catch (error) {
                console.error('加载简历历史失败:', error)
                // 失败时使用缓存数据，不影响主要功能
            }
        },

        /**
         * 缓存管理 - 加载历史记录
         */
        loadCachedHistory() {
            try {
                const cached = uni.getStorageSync(this.cacheKey)
                if (cached && cached.timestamp) {
                    const isExpired = Date.now() - cached.timestamp > this.cacheExpiry
                    if (!isExpired) {
                        return cached.data
                    }
                }
            } catch (error) {
                console.error('加载简历历史缓存失败:', error)
            }
            return null
        },

        /**
         * 缓存管理 - 保存历史记录
         */
        saveCachedHistory(data) {
            try {
                uni.setStorageSync(this.cacheKey, {
                    data,
                    timestamp: Date.now()
                })
            } catch (error) {
                console.error('保存简历历史缓存失败:', error)
            }
        },

        /**
         * 指数退避重试机制
         */
        async executeWithRetry(apiCall, retryCount = 0) {
            try {
                return await apiCall()
            } catch (error) {
                if (retryCount < this.retryConfig.maxRetries) {
                    const baseDelay = this.retryConfig.baseDelay * Math.pow(2, retryCount)
                    const jitter = Math.random() * 0.3 * baseDelay
                    const delay = Math.min(baseDelay + jitter, this.retryConfig.maxDelay)
                    
                    console.log(`API调用失败，${delay.toFixed(0)}ms后进行第${retryCount + 1}次重试:`, error.message)
                    
                    await new Promise(resolve => setTimeout(resolve, delay))
                    return this.executeWithRetry(apiCall, retryCount + 1)
                }
                throw error
            }
        },

        /**
         * 选择文件
         */
        chooseFile() {
            const actions = ['从相册选择', '拍照', '选择文件']
            
            uni.showActionSheet({
                itemList: actions,
                success: (res) => {
                    switch (res.tapIndex) {
                        case 0:
                            this.chooseFromGallery()
                            break
                        case 1:
                            this.takePhoto()
                            break
                        case 2:
                            this.chooseDocument()
                            break
                    }
                }
            })
        },

        /**
         * 从相册选择图片
         */
        chooseFromGallery() {
            uni.chooseImage({
                count: 1,
                sourceType: ['album'],
                success: (res) => {
                    this.handleImageSelected(res.tempFilePaths[0])
                },
                fail: (error) => {
                    console.error('选择图片失败:', error)
                    this.handleFileError('选择图片失败，请重试')
                }
            })
        },

        /**
         * 拍照
         */
        takePhoto() {
            uni.chooseImage({
                count: 1,
                sourceType: ['camera'],
                success: (res) => {
                    this.handleImageSelected(res.tempFilePaths[0])
                },
                fail: (error) => {
                    console.error('拍照失败:', error)
                    this.handleFileError('拍照失败，请重试')
                }
            })
        },

        /**
         * 选择文档
         */
        chooseDocument() {
            // #ifdef APP-PLUS || H5
            uni.chooseFile({
                count: 1,
                type: 'file',
                extension: this.allowedTypes,
                success: (res) => {
                    this.handleFileSelected(res.tempFiles[0])
                },
                fail: (error) => {
                    console.error('选择文件失败:', error)
                    this.handleFileError('选择文件失败，请重试')
                }
            })
            // #endif

            // #ifdef MP-WEIXIN
            uni.chooseMessageFile({
                count: 1,
                type: 'file',
                success: (res) => {
                    this.handleFileSelected(res.tempFiles[0])
                },
                fail: (error) => {
                    console.error('选择文件失败:', error)
                    this.handleFileError('选择文件失败，请重试')
                }
            })
            // #endif
        },

        /**
         * 处理图片选择
         */
        handleImageSelected(filePath) {
            // 获取文件信息
            uni.getFileInfo({
                filePath,
                success: (res) => {
                    const file = {
                        path: filePath,
                        name: `简历图片_${Date.now()}.jpg`,
                        size: res.size,
                        type: 'image/jpeg'
                    }
                    this.handleFileSelected(file)
                },
                fail: (error) => {
                    console.error('获取文件信息失败:', error)
                    this.handleFileError('文件信息获取失败')
                }
            })
        },
        
        /**
         * 处理文件选择
         */
        handleFileSelected(file) {
            try {
                // 文件验证
                const validationResult = this.validateFile(file)
                if (!validationResult.valid) {
                    this.handleFileError(validationResult.message)
                    return
                }
                
                this.selectedFile = file
                this.uploadStatus = 'idle'
                this.uploadProgress = 0
                
                uni.showToast({
                    title: '文件选择成功',
                    icon: 'success'
                })
                
                console.log('选择的简历文件:', {
                    name: file.name,
                    size: file.size,
                    type: file.type || 'unknown'
                })
                
            } catch (error) {
                console.error('处理文件选择失败:', error)
                this.handleFileError('文件处理失败')
            }
        },
        
        /**
         * 文件验证 - 企业级验证逻辑
         */
        validateFile(file) {
            if (!file) {
                return { valid: false, message: '未选择文件' }
            }
            
            // 检查文件大小
            if (file.size > this.maxFileSize) {
                return {
                    valid: false,
                    message: `文件大小不能超过${Math.round(this.maxFileSize / 1024 / 1024)}MB`
                }
            }
            
            // 最小文件大小检查（防止空文件）
            if (file.size < 1024) {
                return {
                    valid: false,
                    message: '文件太小，请选择有效的简历文件'
                }
            }
            
            // 检查文件类型
            const fileName = file.name || ''
            const fileExtension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'))
            
            if (!this.allowedTypes.includes(fileExtension)) {
                return {
                    valid: false,
                    message: `仅支持${this.allowedTypes.join('、')}格式的文件`
                }
            }
            
            // MIME类型检查（如果可用）
            if (file.type && !this.allowedMimeTypes.includes(file.type.toLowerCase())) {
                return {
                    valid: false,
                    message: '文件格式不正确，请选择有效的简历文件'
                }
            }
            
            return { valid: true }
        },

        /**
         * 选择历史简历
         */
        selectHistoryResume(resume) {
            this.selectedFile = {
                name: resume.fileName,
                size: resume.fileSize,
                url: resume.fileUrl,
                isHistory: true
            }
            this.uploadStatus = 'success'
            
            uni.showToast({
                title: '已选择历史简历',
                icon: 'success'
            })
        },

        /**
         * 移除已选择的文件
         */
        removeFile() {
            this.selectedFile = null
            this.uploadStatus = 'idle'
            this.uploadProgress = 0
        },

        /**
         * 预览文件
         */
        previewFile() {
            if (!this.selectedFile) return
            
            if (this.selectedFile.isHistory && this.selectedFile.url) {
                // 预览历史文件
                uni.downloadFile({
                    url: this.selectedFile.url,
                    success: (res) => {
                        uni.openDocument({
                            filePath: res.tempFilePath,
                            showMenu: true
                        })
                    },
                    fail: (error) => {
                        console.error('下载文件失败:', error)
                        uni.showToast({
                            title: '预览失败',
                            icon: 'none'
                        })
                    }
                })
            } else if (this.selectedFile.path) {
                // 预览本地文件
                uni.openDocument({
                    filePath: this.selectedFile.path,
                    showMenu: true,
                    fail: (error) => {
                        console.error('预览文件失败:', error)
                        uni.showToast({
                            title: '预览失败，该格式暂不支持预览',
                            icon: 'none'
                        })
                    }
                })
            }
        },

        /**
         * 确认保存
         */
        async confirmSave() {
            if (!this.selectedFile) {
                uni.showToast({
                    title: '请先选择简历文件',
                    icon: 'none'
                })
                return
            }
            
            if (this.isUploading) {
                return
            }
            
            // 如果是历史简历，直接发送
            if (this.selectedFile.isHistory) {
                await this.sendHistoryResume()
                return
            }
            
            try {
                this.isUploading = true
                this.uploadStatus = 'uploading'
                this.uploadProgress = 0
                
                // 显示加载状态
                uni.showLoading({
                    title: '正在上传...'
                })
                
                // 上传简历文件
                await this.uploadResumeWithRetry()
                
                this.uploadStatus = 'success'
                uni.hideLoading()
                
                uni.showToast({
                    title: '简历上传成功',
                    icon: 'success'
                })
                
                // 刷新历史记录
                await this.loadResumeHistory()
                
                // 成功后返回上一页
                setTimeout(() => {
                    this.goBack()
                }, 1500)
                
            } catch (error) {
                console.error('上传简历失败:', error)
                this.uploadStatus = 'failed'
                uni.hideLoading()
                this.handleUploadError(error)
            } finally {
                this.isUploading = false
            }
        },

        /**
         * 发送历史简历
         */
        async sendHistoryResume() {
            try {
                this.isUploading = true
                
                if (this.sessionId && this.targetType) {
                    await this.executeWithRetry(() => sendResumeToChat({
                        sessionId: this.sessionId,
                        targetType: this.targetType,
                        targetId: this.targetId,
                        fileUrl: this.selectedFile.url,
                        fileName: this.selectedFile.name,
                        fileSize: this.selectedFile.size
                    }))
                }
                
                uni.showToast({
                    title: '简历发送成功',
                    icon: 'success'
                })
                
                setTimeout(() => {
                    this.goBack()
                }, 1500)
                
            } catch (error) {
                console.error('发送历史简历失败:', error)
                this.handleUploadError(error)
            } finally {
                this.isUploading = false
            }
        },
        
        /**
         * 带重试机制的简历上传
         */
        async uploadResumeWithRetry() {
            return this.executeWithRetry(async () => {
                // 根据场景选择上传方式
                if (this.sessionId && this.targetType) {
                    // 聊天场景：上传到聊天
                    await this.uploadToChatSession()
                } else {
                    // 普通场景：上传到简历库
                    await this.uploadToResumeLibrary()
                }
            })
        },
        
        /**
         * 上传到聊天会话
         */
        async uploadToChatSession() {
            try {
                // 先上传文件到聊天媒体服务
                const uploadResponse = await uploadChatMedia({
                    file: this.selectedFile,
                    sessionId: this.sessionId,
                    messageType: 'file',
                    onProgress: (progress) => {
                        this.uploadProgress = progress * 100
                    }
                })
                
                if (uploadResponse && uploadResponse.code === 200) {
                    // 发送简历到聊天
                    const sendResponse = await sendResumeToChat({
                        sessionId: this.sessionId,
                        targetType: this.targetType,
                        targetId: this.targetId,
                        fileUrl: uploadResponse.data.fileUrl,
                        fileName: this.selectedFile.name,
                        fileSize: this.selectedFile.size
                    })
                    
                    if (sendResponse && sendResponse.code === 200) {
                        console.log('简历发送到聊天成功')
                    } else {
                        throw new Error(sendResponse?.message || '发送简历到聊天失败')
                    }
                } else {
                    throw new Error(uploadResponse?.message || '上传文件失败')
                }
                
            } catch (error) {
                console.error('上传到聊天会话失败:', error)
                throw error
            }
        },
        
        /**
         * 上传到简历库
         */
        async uploadToResumeLibrary() {
            try {
                const response = await uploadResume({
                    file: this.selectedFile,
                    fileName: this.selectedFile.name,
                    fileSize: this.selectedFile.size,
                    onProgress: (progress) => {
                        this.uploadProgress = progress * 100
                    }
                })
                
                if (response && response.code === 200) {
                    console.log('简历上传到简历库成功:', response.data)
                } else {
                    throw new Error(response?.message || '上传简历失败')
                }
                
            } catch (error) {
                console.error('上传到简历库失败:', error)
                throw error
            }
        },
        
        /**
         * 处理上传错误 - 企业级错误分类
         */
        handleUploadError(error) {
            let message = '上传失败，请重试'
            
            if (error.message) {
                if (error.message.includes('timeout') || error.message.includes('超时')) {
                    message = '网络超时，请检查网络连接后重试'
                } else if (error.message.includes('Network Error') || error.message.includes('网络错误')) {
                    message = '网络连接异常，请检查网络设置'
                } else if (error.message.includes('413') || error.message.includes('文件过大')) {
                    message = '文件过大，请选择较小的文件'
                } else if (error.message.includes('415') || error.message.includes('格式不支持')) {
                    message = '文件格式不支持，请选择PDF、DOC或DOCX格式'
                } else if (error.message.includes('401')) {
                    message = '请先登录后再上传简历'
                    setTimeout(() => {
                        uni.reLaunch({ url: '/pages/login/login' })
                    }, 2000)
                } else if (error.message.includes('403')) {
                    message = '没有上传权限，请联系管理员'
                } else if (error.message.includes('500')) {
                    message = '服务器内部错误，请稍后重试'
                }
            }
            
            this.handleFileError(message)
        },
        
        /**
         * 处理文件错误
         */
        handleFileError(message) {
            uni.showToast({
                title: message,
                icon: 'none',
                duration: 3000
            })
        },

        /**
         * 显示帮助
         */
        showHelp() {
            this.showHelpModal = true
        },

        /**
         * 获取按钮文本
         */
        getButtonText() {
            if (this.isUploading) {
                return '上传中...'
            }
            if (this.selectedFile) {
                if (this.selectedFile.isHistory) {
                    return '发送简历'
                }
                return '确认上传'
            }
            return '请先选择文件'
        },

        /**
         * 工具函数 - 获取文件图标
         */
        getFileIcon(fileName) {
            if (!fileName) return 'document'
            
            const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'))
            switch (extension) {
                case '.pdf':
                    return 'file-pdf'
                case '.doc':
                case '.docx':
                    return 'file-word'
                case '.jpg':
                case '.jpeg':
                case '.png':
                    return 'image'
                default:
                    return 'document'
            }
        },

        /**
         * 工具函数 - 获取文件类型描述
         */
        getFileType(fileName) {
            if (!fileName) return '未知格式'
            
            const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'))
            switch (extension) {
                case '.pdf':
                    return 'PDF 文档'
                case '.doc':
                    return 'Word 文档'
                case '.docx':
                    return 'Word 文档'
                case '.jpg':
                case '.jpeg':
                    return 'JPEG 图片'
                case '.png':
                    return 'PNG 图片'
                default:
                    return '文档文件'
            }
        },
        
        /**
         * 工具函数 - 格式化文件大小
         */
        formatFileSize(bytes) {
            if (bytes === 0) return '0 B'
            const k = 1024
            const sizes = ['B', 'KB', 'MB', 'GB']
            const i = Math.floor(Math.log(bytes) / Math.log(k))
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
        },

        /**
         * 工具函数 - 格式化日期
         */
        formatDate(dateString) {
            if (!dateString) return ''
            
            const date = new Date(dateString)
            const now = new Date()
            const diff = now - date
            
            const days = Math.floor(diff / (1000 * 60 * 60 * 24))
            
            if (days === 0) return '今天'
            if (days === 1) return '昨天'
            if (days < 7) return `${days}天前`
            if (days < 30) return `${Math.floor(days / 7)}周前`
            
            return date.toLocaleDateString()
        },
        
        /**
         * 返回上一页
         */
        goBack() {
            uni.navigateBack({
                delta: 1,
                fail: () => {
                    // 如果没有上一页，返回首页
                    uni.reLaunch({
                        url: '/pages/user/index/index'
                    })
                }
            })
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
        justify-content: space-between;

        .back-button, .help-button {
            width: 60rpx;
            height: 60rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: opacity 0.2s ease;
            
            &:active {
                opacity: 0.7;
            }
        }
        
        .navbar-title {
            font-size: 32rpx;
            font-weight: 600;
            color: #333333;
            font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
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
        margin-bottom: 20rpx;
    }
    
    .upload-hint {
        font-size: 26rpx;
        color: #999999;
        text-align: center;
        line-height: 1.4;
        font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
    }
}

/* 文件预览卡片 */
.file-preview-card {
    width: 85%;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 32rpx;
    padding: 40rpx;
    margin-bottom: 40rpx;
    backdrop-filter: blur(10rpx);
    box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
    
    .file-info {
        display: flex;
        align-items: center;
        gap: 30rpx;
        margin-bottom: 30rpx;
        
        .file-icon {
            flex-shrink: 0;
        }
        
        .file-details {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 8rpx;
            
            .file-name {
                font-size: 32rpx;
                font-weight: 600;
                color: #333333;
                line-height: 1.3;
                word-break: break-all;
            }
            
            .file-size {
                font-size: 26rpx;
                color: #666666;
            }
            
            .file-type {
                font-size: 24rpx;
                color: #999999;
            }
        }
        
        .file-actions {
            display: flex;
            gap: 20rpx;
            
            .action-btn {
                width: 64rpx;
                height: 64rpx;
                border-radius: 50%;
                background: rgba(0, 0, 0, 0.05);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s ease;
                
                &:active {
                    transform: scale(0.95);
                    background: rgba(0, 0, 0, 0.1);
                }
            }
        }
    }
    
    .upload-progress {
        margin-top: 20rpx;
        
        .progress-bar {
            width: 100%;
            height: 8rpx;
            background: #E5E7EB;
            border-radius: 4rpx;
            overflow: hidden;
            margin-bottom: 16rpx;
            
            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #3B82F6, #60A5FA);
                border-radius: 4rpx;
                transition: width 0.3s ease;
            }
        }
        
        .progress-text {
            font-size: 24rpx;
            color: #666666;
            text-align: center;
        }
    }
    
    .upload-status {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16rpx;
        padding: 20rpx;
        border-radius: 16rpx;
        margin-top: 20rpx;
        
        .status-text {
            font-size: 28rpx;
            font-weight: 500;
        }
        
        &.success {
            background: rgba(82, 196, 26, 0.1);
            
            .status-text {
                color: #52C41A;
            }
        }
        
        &.failed {
            background: rgba(255, 77, 79, 0.1);
            
            .status-text {
                color: #FF4D4F;
            }
        }
    }
}

/* 历史简历区域 */
.history-section {
    width: 85%;
    margin-top: 40rpx;
    
    .section-title {
        font-size: 30rpx;
        font-weight: 600;
        color: #333333;
        margin-bottom: 24rpx;
        font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
    }
    
    .history-list {
        background: rgba(255, 255, 255, 0.9);
        border-radius: 24rpx;
        backdrop-filter: blur(10rpx);
        overflow: hidden;
        
        .history-item {
            display: flex;
            align-items: center;
            padding: 24rpx 30rpx;
            border-bottom: 1rpx solid rgba(0, 0, 0, 0.06);
            cursor: pointer;
            transition: background-color 0.2s ease;
            
            &:last-child {
                border-bottom: none;
            }
            
            &:active {
                background: rgba(0, 0, 0, 0.04);
            }
            
            .history-icon {
                margin-right: 24rpx;
            }
            
            .history-info {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 6rpx;
                
                .history-name {
                    font-size: 28rpx;
                    color: #333333;
                    font-weight: 500;
                    line-height: 1.2;
                    word-break: break-all;
                }
                
                .history-date {
                    font-size: 24rpx;
                    color: #999999;
                }
            }
            
            .history-action {
                margin-left: 16rpx;
            }
        }
    }
}

/* 帮助弹窗 */
.help-content {
    padding: 20rpx;
    
    .help-title {
        display: block;
        font-size: 30rpx;
        font-weight: 600;
        color: #333333;
        margin: 24rpx 0 16rpx 0;
        
        &:first-child {
            margin-top: 0;
        }
    }
    
    .help-text {
        display: block;
        font-size: 26rpx;
        color: #666666;
        line-height: 1.6;
        margin-bottom: 8rpx;
        padding-left: 16rpx;
    }
}

.bottom-action {
    padding: 40rpx 40rpx;
    display: flex;
    justify-content: center;
    margin-bottom: env(safe-area-inset-bottom);

    .confirm-button {
        width: 85%;
        border-radius: 48rpx;
        font-size: 32rpx;
        font-weight: 600;
        font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
        box-shadow: 0 8rpx 24rpx rgba(59, 130, 246, 0.25);
        transition: all 0.2s ease;
        
        &:active {
            transform: translateY(2rpx);
            box-shadow: 0 4rpx 12rpx rgba(59, 130, 246, 0.2);
        }
    }
}


</style>
