// 类型定义文件，定义项目中使用的所有 TypeScript 类型

// 用户类型定义
export interface User {
  id: string;           // 用户唯一标识
  email: string;        // 用户邮箱
  username?: string;    // 用户显示名称（可选）
  avatar_url?: string;  // 用户头像 URL（可选）
  bio?: string;         // 用户个人简介（可选）
  created_at?: string;  // 用户创建时间（可选）
  theme?: string;       // 用户主题偏好（可选）
}

// 工具类型定义
export interface Tool {
  id: string;               // 工具唯一标识
  name: string;             // 工具名称
  category: string;         // 工具分类
  description: string;      // 工具描述
  icon: string;             // 工具图标（SVG 字符串）
  featured: boolean;        // 是否为精选工具
  usage_count: number;      // 使用次数
  views_count: number;      // 浏览量
  created_at?: string;      // 创建时间
}

// 评论类型定义
export interface Comment {
  id: string;               // 评论唯一标识
  user_id: string;          // 发表评论的用户 ID
  tool_id: string;          // 评论所属的工具 ID
  parent_id?: string;       // 父评论 ID（用于回复）
  content: string;          // 评论内容
  rating: number;           // 评分（1-5星）
  likes: number;            // 点赞数
  created_at: string;       // 评论创建时间
  user?: User;              // 用户信息（可选，用于关联查询）
  tool_name?: string;       // 工具名称（用于关联查询）
  tool?: {                  // 工具信息（可选，用于关联查询）
    id: string;
    name: string;
    icon?: string;
  };
}

// 收藏类型定义
export interface Favorite {
  id: string;               // 收藏唯一标识
  user_id: string;          // 用户 ID
  tool_id: string;          // 工具 ID
  created_at: string;       // 收藏时间
}

// 认证状态类型定义
export interface AuthState {
  user: User | null;        // 当前登录用户，如果未登录则为 null
  loading: boolean;         // 是否正在加载认证状态
}

// 工具分类类型定义
export interface Category {
  name: string;             // 分类名称
  icon: string;             // 分类图标
  count: number;            // 该分类下的工具数量
}

// 登录表单数据类型
export interface LoginFormData {
  email: string;            // 用户邮箱
  password: string;         // 用户密码
}

// 注册表单数据类型
export interface RegisterFormData {
  email: string;            // 用户邮箱
  password: string;         // 用户密码
  confirmPassword: string;  // 确认密码
  username: string;         // 用户名称
}

// 评论表单数据类型
export interface CommentFormData {
  content: string;          // 评论内容
  rating: number;           // 评分
}

// 工具使用历史记录类型
export interface ToolHistory {
  tool_id: string;          // 工具 ID
  tool_name: string;        // 工具名称
  last_used: string;        // 最后使用时间
  usage_count: number;      // 使用次数
}

// 聊天消息类型定义
export interface ChatMessage {
  id: string;               // 消息唯一标识
  user_id: string;          // 发送消息的用户 ID
  content: string;          // 消息内容
  created_at: string;       // 消息创建时间
  user?: User;              // 用户信息（可选，用于关联查询）
}

// 私聊消息类型定义
export interface PrivateMessage {
  id: string;               // 消息唯一标识
  sender_id: string;        // 发送者用户 ID
  receiver_id: string;      // 接收者用户 ID
  content: string;          // 消息内容
  created_at: string;       // 消息创建时间
  user?: User;              // 用户信息（可选，用于关联查询）
}

// 会话类型定义
export interface Conversation {
  user_id: string;          // 对方用户 ID
  username: string;         // 对方用户名
  avatar_url?: string;      // 对方头像 URL
  last_message: string;     // 最后一条消息内容
  last_message_at: string;  // 最后一条消息时间
}
