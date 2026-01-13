export const ERROR_MESSAGES: Record<string, string> = {
    // Auth & Account
    'AUTHENTICATION_FAILED': '用户名或密码错误',
    'ACCOUNT_DISABLED': '账号已被禁用或待审核',
    'ACCOUNT_PENDING': '账号审核中，请耐心等待',
    'ACCOUNT_BANNED': '账号已被封禁，请联系管理员',
    'ACCOUNT_INACTIVE': '账号状态异常',
    'USER_NOT_FOUND': '用户不存在',
    'USER_ALREADY_EXISTS': '用户已存在',
    'USER_ALREADY_ACTIVE': '用户已经是激活状态',
    
    'UNAUTHORIZED': '请先登录您的账号',
    'FORBIDDEN': '您没有权限执行此操作',
    
    // Validation & Constraints
    'EMAIL_IN_USE': '该邮箱已被占用',
    'NICKNAME_TOO_LONG': '昵称过长（最大 50 个字符）',
    'VALIDATION_FAILED': '输入验证失败',
    'OLD_PASSWORD_MISMATCH': '旧密码不正确',
    'SELF_DELETION_PROTECTED': '您不能删除自己的账号',
    
    // Verification & Audit
    'VERIFICATION_CODE_NOT_FOUND': '验证码不存在或已失效',
    'VERIFICATION_CODE_EXPIRED': '验证码已过期',
    'VERIFICATION_CODE_INVALID': '验证码错误',
    'VERIFICATION_CODE_REQUIRED': '需要输入验证码',
    'INVALID_AUDIT_CODE': '无效的审核码',
    'AUDIT_CODE_EXPIRED': '审核码已过期',
    'RATE_LIMIT_EXCEEDED': '操作过于频繁，请稍后再试',
    'INVALID_2FA_CODE': '双重验证码错误',
    
    // System
    'INTERNAL_SERVER_ERROR': '服务器内部错误',
    'METHOD_NOT_ALLOWED': '请求方法不允许',
    'DATA_INTEGRITY_VIOLATION': '数据完整性冲突',
    'NOTICE_NOT_FOUND': '公告不存在',
    
    // Minecraft Binding
    'XBOX_ACCOUNT_NOT_FOUND': '未找到有效的 Xbox 档案，请先在 Xbox 官网创建个人资料',
    'XBOX_CHILD_ACCOUNT_RESTRICTION': '您的账号受到青少年保护限制，无法完成绑定',
    'MINECRAFT_AUTH_FAILED': 'Minecraft 验证失败，请确保您的账号已购买游戏',
    'MINECRAFT_APP_REGISTRATION_INVALID': 'Minecraft 服务配置无效（应用注册未完成），请联系管理员',
    'MINECRAFT_PROFILE_FAILED': '无法获取 Minecraft 资料，请确保您已购买游戏并设置游戏角色',
    'MINECRAFT_PROFILE_NOT_FOUND': '未找到 Minecraft 角色，请确保您已购买游戏并设置了角色名称',
    'MINECRAFT_UNAUTHORIZED': 'Minecraft 授权失效，请重新绑定',
    'MINECRAFT_ACCOUNT_SUSPENDED': '您的 Minecraft 账号已被封禁或挂起',
    'MINECRAFT_NOT_BOUND': '尚未绑定 Minecraft 账号',
    'MICROSOFT_AUTH_FAILED': '微软登录验证失败',
    'MICROSOFT_INVALID_GRANT': '微软授权码无效或已过期，请重新登录',
    'XBOX_LIVE_AUTH_FAILED': 'Xbox Live 验证失败',
    'XBOX_NOT_AVAILABLE_IN_COUNTRY': '您的地区不支持 Xbox Live 服务',
    'XSTS_AUTH_FAILED': 'Xbox 安全令牌获取失败',
};

export const getErrorMessage = (code: string, metadata?: any): string => {
    if (code === 'RATE_LIMIT_EXCEEDED' && metadata?.retryAfter) {
        return `操作过于频繁，请在 ${metadata.retryAfter} 秒后再试`;
    }
    if (code === 'NICKNAME_TOO_LONG' && metadata?.maxLength) {
        return `昵称过长（最大 ${metadata.maxLength} 个字符）`;
    }
    if (code === 'VALIDATION_FAILED' && metadata?.reason) {
        return `输入有误: ${metadata.reason}`;
    }
    return ERROR_MESSAGES[code] || `未知错误 (${code})`;
};
