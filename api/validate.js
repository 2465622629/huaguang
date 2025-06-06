/**
 * API模块验证脚本
 * 检查文件结构和基本语法
 */

const fs = require('fs')
const path = require('path')

// 检查文件是否存在
function checkFileExists(filePath) {
  return fs.existsSync(filePath)
}

// 检查文件内容
function checkFileContent(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    return {
      exists: true,
      size: content.length,
      hasExports: content.includes('export'),
      hasImports: content.includes('import')
    }
  } catch (error) {
    return {
      exists: false,
      error: error.message
    }
  }
}

console.log('🚀 开始API模块验证...')
console.log('=')

// 检查主要文件
const mainFiles = [
  'api/index.js',
  'api/request.js',
  'api/config.js'
]

console.log('📁 检查主要文件:')
mainFiles.forEach(file => {
  const fullPath = path.join(__dirname, '..', file)
  const info = checkFileContent(fullPath)
  if (info.exists) {
    console.log(`  ✅ ${file} (${info.size} bytes)`)
  } else {
    console.log(`  ❌ ${file} - ${info.error}`)
  }
})

// 检查新增模块
const newModules = [
  'api/modules/recruitment.js',
  'api/modules/search.js',
  'api/modules/navigation.js'
]

console.log('\n📦 检查新增模块:')
newModules.forEach(file => {
  const fullPath = path.join(__dirname, '..', file)
  const info = checkFileContent(fullPath)
  if (info.exists) {
    console.log(`  ✅ ${file} (${info.size} bytes)`)
    console.log(`     - 包含导出: ${info.hasExports ? '是' : '否'}`)
    console.log(`     - 包含导入: ${info.hasImports ? '是' : '否'}`)
  } else {
    console.log(`  ❌ ${file} - 文件不存在`)
  }
})

// 检查现有模块
const existingModules = [
  'api/modules/home.js',
  'api/modules/enterprise.js',
  'api/modules/auth.js',
  'api/modules/user.js'
]

console.log('\n🔄 检查现有模块:')
existingModules.forEach(file => {
  const fullPath = path.join(__dirname, '..', file)
  const info = checkFileContent(fullPath)
  if (info.exists) {
    console.log(`  ✅ ${file} (${info.size} bytes)`)
  } else {
    console.log(`  ❌ ${file} - 文件不存在`)
  }
})

// 检查文档和示例
const docFiles = [
  'api/README.md',
  'api/examples/usage-examples.js'
]

console.log('\n📚 检查文档和示例:')
docFiles.forEach(file => {
  const fullPath = path.join(__dirname, '..', file)
  const info = checkFileContent(fullPath)
  if (info.exists) {
    console.log(`  ✅ ${file} (${info.size} bytes)`)
  } else {
    console.log(`  ❌ ${file} - 文件不存在`)
  }
})

// 统计信息
console.log('\n📊 统计信息:')
const apiDir = path.join(__dirname, '..', 'api')
const modulesDir = path.join(apiDir, 'modules')

if (fs.existsSync(modulesDir)) {
  const moduleFiles = fs.readdirSync(modulesDir).filter(file => file.endsWith('.js'))
  console.log(`  - API模块总数: ${moduleFiles.length}`)
  console.log(`  - 模块列表: ${moduleFiles.join(', ')}`)
} else {
  console.log('  ❌ modules目录不存在')
}

// 检查index.js中的导入
console.log('\n🔍 检查index.js导入:')
const indexPath = path.join(__dirname, '..', 'api', 'index.js')
if (fs.existsSync(indexPath)) {
  const indexContent = fs.readFileSync(indexPath, 'utf8')
  const imports = [
    'recruitmentApi',
    'searchApi', 
    'navigationApi'
  ]
  
  imports.forEach(importName => {
    if (indexContent.includes(importName)) {
      console.log(`  ✅ ${importName} 已导入`)
    } else {
      console.log(`  ❌ ${importName} 未导入`)
    }
  })
} else {
  console.log('  ❌ index.js文件不存在')
}

console.log('\n🎉 验证完成!')
console.log('\n💡 提示: 这是一个基本的文件结构验证，实际运行时可能需要在uni-app环境中测试。')