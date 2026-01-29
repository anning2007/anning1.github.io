// 全局变量
let currentChat = [];
let currentPersonality = 'assistant';
let currentTemperature = 0.7;
let currentAIAvatar = 'bot';
let userName = '用户';

// DOM元素
const chatContainer = document.getElementById('chatContainer');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const clearButton = document.getElementById('clearButton');
const newChatButton = document.getElementById('newChat');
const changeAvatarButton = document.getElementById('changeAvatar');
const avatarUpload = document.getElementById('avatarUpload');
const personalityType = document.getElementById('personalityType');
const temperature = document.getElementById('temperature');
const tempValue = document.getElementById('tempValue');
const customPrompt = document.getElementById('customPrompt');
const saveSettingsButton = document.getElementById('saveSettings');
const avatarOptions = document.querySelectorAll('.avatar-option');
const userAvatar = document.getElementById('userAvatar');
const chatTitle = document.getElementById('chatTitle');
const currentPersonalityDisplay = document.getElementById('currentPersonality');
const messageCountDisplay = document.getElementById('messageCount');
const typingIndicator = document.getElementById('typingIndicator');

// 性格预设
const personalityPresets = {
    'assistant': '你是一个有帮助的AI助手。',
    'friendly': '你是一个友好、热情的AI朋友，喜欢用表情符号和温暖的语气对话。',
    'professional': '你是一个专业的AI顾问，回答准确、简洁、专业。',
    'humorous': '你是一个幽默有趣的AI，喜欢讲笑话和用轻松的方式交流。',
    'teacher': '你是一个耐心的AI导师，善于解释复杂概念，鼓励用户学习。',
    'creative': '你是一个富有创造力的AI，擅长讲故事、写诗和创意写作。',
    'custom': ''
};

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
    loadChatHistory();
    updateMessageCount();
    
    // 设置输入框自动调整高度
    messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
    
    // 发送消息事件
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // 清空聊天
    clearButton.addEventListener('click', clearChat);
    
    // 新对话
    newChatButton.addEventListener('click', startNewChat);
    
    // 更换头像
    changeAvatarButton.addEventListener('click', function() {
        avatarUpload.click();
    });
    
    avatarUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                userAvatar.src = event.target.result;
                // 保存到localStorage
                localStorage.setItem('userAvatar', event.target.result);
                showNotification('头像更新成功！');
            };
            reader.readAsDataURL(file);
        }
    });
    
    // 性格类型变化
    personalityType.addEventListener('change', function() {
        if (this.value === 'custom') {
            customPrompt.focus();
        } else {
            customPrompt.value = personalityPresets[this.value];
        }
    });
    
    // 温度滑块
    temperature.addEventListener('input', function() {
        tempValue.textContent = this.value;
        currentTemperature = parseFloat(this.value);
    });
    
    // AI头像选择
    avatarOptions.forEach(option => {
        option.addEventListener('click', function() {
            avatarOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            currentAIAvatar = this.dataset.avatar;
            updateAIAvatar();
        });
    });
    
    // 保存设置
    saveSettingsButton.addEventListener('click', saveSettings);
});

// 发送消息函数
async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;
    
    // 添加用户消息到界面
    addMessageToChat('user', message);
    
    // 清空输入框
    messageInput.value = '';
    messageInput.style.height = 'auto';
    
    // 显示正在输入指示器
    showTypingIndicator(true);
    
    try {
        // 获取AI回复
        const aiResponse = await getAIResponse(message);
        
        // 添加AI消息到界面
        addMessageToChat('ai', aiResponse);
        
        // 保存聊天记录
        saveChatToHistory();
        
    } catch (error) {
        console.error('获取AI回复失败:', error);
        addMessageToChat('ai', '抱歉，我遇到了一些问题。请稍后再试或检查您的网络连接。');
    } finally {
        showTypingIndicator(false);
    }
}

// 获取AI回复（模拟版本，实际使用时需要接入真实API）
async function getAIResponse(userMessage) {
    // 这里使用模拟数据，实际项目需要替换为真实的API调用
    // 例如：OpenAI API、Claude API或本地模型API
    
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 获取当前性格提示
    let systemPrompt = '';
    if (personalityType.value === 'custom' && customPrompt.value.trim()) {
        systemPrompt = customPrompt.value.trim();
    } else {
        systemPrompt = personalityPresets[personalityType.value] || personalityPresets['assistant'];
    }
    
    // 模拟不同性格的回复
    const responses = {
        'assistant': `我已经收到您的消息："${userMessage}"。作为AI助手，我会尽力帮助您解决问题。`,
        'friendly': `嘿！很高兴收到您的消息！😊 您说："${userMessage}"。这听起来很有趣！我很乐意和您聊聊这个话题！`,
        'professional': `关于您提到的"${userMessage}"，这是一个值得探讨的话题。根据我的分析，建议您考虑以下几个方面：首先...`,
        'humorous': `哈哈，您提到了"${userMessage}"！这让我想起了一个笑话...不过言归正传，让我认真回答您的问题！`,
        'teacher': `很好的问题！"${userMessage}"涉及到一些重要的概念。让我一步步为您解释：首先，我们需要理解...`,
        'creative': `"${userMessage}"...多么富有诗意的表达！这让我灵感迸发，让我用创造性的方式回应您...`
    };
    
    const personality = personalityType.value;
    let response = responses[personality] || responses['assistant'];
    
    // 添加温度影响（创造力）
    if (currentTemperature > 0.8) {
        response += "\n\n（根据您的创造力设置，我尝试提供了一些更具想象力的内容！）";
    } else if (currentTemperature < 0.3) {
        response += "\n\n（根据您的创造力设置，我提供了更加保守和准确的回答。）";
    }
    
    return response;
}

// 添加消息到聊天界面
function addMessageToChat(sender, text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    // 获取头像URL
    let avatarUrl = '';
    if (sender === 'user') {
        avatarUrl = userAvatar.src;
    } else {
        avatarUrl = getAIAvatarUrl();
    }
    
    const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    messageDiv.innerHTML = `
        <img src="${avatarUrl}" alt="${sender}头像" class="message-avatar">
        <div class="message-content">
            <div class="message-text">${formatMessage(text)}</div>
            <div class="message-time">${time}</div>
        </div>
    `;
    
    chatContainer.appendChild(messageDiv);
    
    // 添加到当前聊天记录
    currentChat.push({
        sender,
        text,
        time: new Date().toISOString()
    });
    
    // 滚动到底部
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    // 更新消息计数
    updateMessageCount();
}

// 格式化消息（简单的换行处理）
function formatMessage(text) {
    return text.replace(/\n/g, '<br>');
}

// 获取AI头像URL
function getAIAvatarUrl() {
    const avatars = {
        'bot': 'https://api.dicebear.com/7.x/bottts/svg?seed=AI',
        'human': 'https://api.dicebear.com/7.x/personas/svg?seed=AI',
        'cat': 'https://api.dicebear.com/7.x/shapes/svg?seed=AI'
    };
    return avatars[currentAIAvatar] || avatars['bot'];
}

// 更新AI头像
function updateAIAvatar() {
    // 更新聊天中现有的AI消息头像
    const aiAvatars = document.querySelectorAll('.ai-message .message-avatar');
    aiAvatars.forEach(avatar => {
        avatar.src = getAIAvatarUrl();
    });
}

// 显示/隐藏正在输入指示器
function showTypingIndicator(show) {
    typingIndicator.style.display = show ? 'block' : 'none';
}

// 清空聊天
function clearChat() {
    if (currentChat.length === 0) return;
    
    if (confirm('确定要清空当前对话吗？')) {
        // 保留欢迎消息
        const welcomeMessage = chatContainer.querySelector('.message');
        chatContainer.innerHTML = '';
        if (welcomeMessage) {
            chatContainer.appendChild(welcomeMessage);
        }
        
        currentChat = [];
        updateMessageCount();
        showNotification('对话已清空');
    }
}

// 开始新对话
function startNewChat() {
    if (currentChat.length === 0) return;
    
    if (confirm('开始新的对话吗？当前对话将保存到历史记录中。')) {
        // 保存当前对话
        saveChatToHistory();
        
        // 清空当前聊天
        const welcomeMessage = chatContainer.querySelector('.message');
        chatContainer.innerHTML = '';
        if (welcomeMessage) {
            chatContainer.appendChild(welcomeMessage);
        }
        
        currentChat = [];
        updateMessageCount();
        showNotification('新对话已开始');
    }
}

// 保存设置
function saveSettings() {
    // 保存到localStorage
    const settings = {
        personality: personalityType.value,
        temperature: currentTemperature,
        customPrompt: customPrompt.value,
        aiAvatar: currentAIAvatar,
        userName: userName
    };
    
    localStorage.setItem('chatSettings', JSON.stringify(settings));
    
    // 更新显示
    const personalityNames = {
        'assistant': '普通助手',
        'friendly': '友好伙伴',
        'professional': '专业顾问',
        'humorous': '幽默朋友',
        'teacher': '耐心导师',
        'creative': '创意伙伴',
        'custom': '自定义'
    };
    
    currentPersonalityDisplay.textContent = `性格: ${personalityNames[personalityType.value] || '自定义'}`;
    
    // 更新AI头像
    updateAIAvatar();
    
    showNotification('设置已保存！');
}

// 加载设置
function loadSettings() {
    const savedSettings = localStorage.getItem('chatSettings');
    const savedAvatar = localStorage.getItem('userAvatar');
    
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        
        personalityType.value = settings.personality || 'assistant';
        temperature.value = settings.temperature || 0.7;
        tempValue.textContent = temperature.value;
        currentTemperature = parseFloat(temperature.value);
        customPrompt.value = settings.customPrompt || '';
        currentAIAvatar = settings.aiAvatar || 'bot';
        userName = settings.userName || '用户';
        
        // 更新头像选择
        avatarOptions.forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.avatar === currentAIAvatar) {
                option.classList.add('selected');
            }
        });
        
        // 更新用户名显示
        document.getElementById('username').textContent = userName;
        
        // 更新当前性格显示
        const personalityNames = {
            'assistant': '普通助手',
            'friendly': '友好伙伴',
            'professional': '专业顾问',
            'humorous': '幽默朋友',
            'teacher': '耐心导师',
            'creative': '创意伙伴',
            'custom': '自定义'
        };
        
        currentPersonalityDisplay.textContent = `性格: ${personalityNames[personalityType.value] || '自定义'}`;
    }
    
    if (savedAvatar) {
        userAvatar.src = savedAvatar;
    }
}

// 保存聊天到历史记录
function saveChatToHistory() {
    if (currentChat.length === 0) return;
    
    const chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    
    const chatSummary = {
        id: Date.now(),
        title: currentChat[0]?.text?.substring(0, 30) + '...' || '新对话',
        preview: currentChat[currentChat.length - 1]?.text?.substring(0, 50) + '...' || '',
        timestamp: new Date().toLocaleString(),
        messages: [...currentChat]
    };
    
    chatHistory.unshift(chatSummary); // 添加到开头
    
    // 只保留最近的20个对话
    if (chatHistory.length > 20) {
        chatHistory.pop();
    }
    
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    
    // 更新历史记录显示
    loadChatHistory();
}

// 加载聊天历史
function loadChatHistory() {
    const chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    const historyList = document.getElementById('historyList');
    
    historyList.innerHTML = '';
    
    chatHistory.forEach(chat => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div class="history-title">${chat.title}</div>
            <div class="history-preview">${chat.preview}</div>
            <div class="history-time">${chat.timestamp}</div>
        `;
        
        historyItem.addEventListener('click', () => loadChat(chat));
        historyList.appendChild(historyItem);
    });
}

// 加载特定聊天
function loadChat(chat) {
    if (confirm('加载这个对话吗？当前未保存的对话将会丢失。')) {
        // 清空当前聊天
        chatContainer.innerHTML = '';
        currentChat = [];
        
        // 加载聊天消息
        chat.messages.forEach(message => {
            addMessageToChat(message.sender, message.text);
        });
        
        showNotification('对话已加载');
    }
}

// 更新消息计数
function updateMessageCount() {
    const count = currentChat.length;
    messageCountDisplay.textContent = `消息: ${count}`;
}

// 显示通知
function showNotification(message, duration = 3000) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, duration);
}