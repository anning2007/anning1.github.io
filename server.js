const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 模拟AI API端点（实际项目需要替换为真实API）
app.post('/api/chat', async (req, res) => {
    try {
        const { message, personality, temperature } = req.body;
        
        // 这里应该调用真实的AI API
        // 例如: OpenAI, Anthropic Claude, 或本地模型
        
        // 模拟响应
        const responses = [
            `我已经收到您的消息："${message}"。作为您的AI助手，我会尽力提供帮助。`,
            `感谢您的提问！关于"${message}"，我的建议是...`,
            `这是一个很好的问题！让我思考一下如何最好地回答...`,
            `我理解您想了解"${message}"。根据我的知识...`,
            `您提到了一个有趣的话题："${message}"。让我分享一些相关的见解...`
        ];
        
        // 根据温度添加随机性
        const randomIndex = Math.floor(Math.random() * responses.length * (1 + temperature));
        const response = responses[randomIndex % responses.length] || responses[0];
        
        // 模拟延迟
        await new Promise(resolve => setTimeout(resolve, 800));
        
        res.json({
            success: true,
            response: response,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('聊天API错误:', error);
        res.status(500).json({
            success: false,
            error: '处理请求时出错'
        });
    }
});

// 文件上传端点（头像）
app.post('/api/upload-avatar', (req, res) => {
    // 实际项目中应该实现文件上传逻辑
    res.json({
        success: true,
        url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`
    });
});

// 主页
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log(`AI聊天网站已启动！`);
});