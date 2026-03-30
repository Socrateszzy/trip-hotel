import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  username: string;
  password: string;
  role: 'merchant' | 'admin';
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  
  // Tab状态
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // 登录表单状态
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // 注册表单状态
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registerRole, setRegisterRole] = useState<'merchant' | 'admin'>('merchant');
  
  // 通用状态
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // 初始化本地存储用户数据
  useEffect(() => {
    const users = localStorage.getItem('users');
    if (!users) {
      // 预置两个账号
      const defaultUsers: User[] = [
        { username: 'merchant', password: '123456', role: 'merchant' },
        { username: 'admin', password: '123456', role: 'admin' },
      ];
      localStorage.setItem('users', JSON.stringify(defaultUsers));
    }
  }, []);
  
  // 处理登录
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!loginUsername || !loginPassword) {
      setErrorMessage('请输入用户名和密码');
      return;
    }
    
    setIsLoading(true);
    
    // 模拟网络延迟
    setTimeout(() => {
      const usersStr = localStorage.getItem('users');
      const users: User[] = usersStr ? JSON.parse(usersStr) : [];
      
      const foundUser = users.find(
        user => user.username === loginUsername && user.password === loginPassword
      );
      
      if (foundUser) {
        // 登录成功，保存当前用户
        localStorage.setItem('currentUser', JSON.stringify(foundUser));
        
        // 根据角色跳转
        if (foundUser.role === 'merchant') {
          navigate('/admin/form');
        } else if (foundUser.role === 'admin') {
          navigate('/admin/audit');
        }
      } else {
        setErrorMessage('用户名或密码错误');
      }
      
      setIsLoading(false);
    }, 800);
  };
  
  // 处理注册
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    // 验证输入
    if (!registerUsername || !registerPassword || !confirmPassword) {
      setErrorMessage('请填写所有必填字段');
      return;
    }
    
    if (registerPassword.length < 6) {
      setErrorMessage('密码长度至少6位');
      return;
    }
    
    if (registerPassword !== confirmPassword) {
      setErrorMessage('两次输入的密码不一致');
      return;
    }
    
    setIsLoading(true);
    
    // 模拟网络延迟
    setTimeout(() => {
      const usersStr = localStorage.getItem('users');
      const users: User[] = usersStr ? JSON.parse(usersStr) : [];
      
      // 检查用户名是否已存在
      const userExists = users.some(user => user.username === registerUsername);
      if (userExists) {
        setErrorMessage('用户名已存在，请更换其他用户名');
        setIsLoading(false);
        return;
      }
      
      // 创建新用户
      const newUser: User = {
        username: registerUsername,
        password: registerPassword,
        role: registerRole,
      };
      
      // 保存到本地存储
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      // 自动登录新用户
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      
      // 根据角色跳转
      if (newUser.role === 'merchant') {
        navigate('/admin/form');
      } else if (newUser.role === 'admin') {
        navigate('/admin/audit');
      }
      
      setIsLoading(false);
    }, 800);
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0084FF] to-[#0052CC] p-6">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* 顶部图标和标题 */}
          <div className="text-center py-8 bg-gradient-to-r from-blue-50 to-white">
            <div className="text-6xl mb-4">🏨</div>
            <h1 className="text-3xl font-bold text-gray-900">易宿管理平台</h1>
            <p className="text-gray-600 mt-2">酒店预订平台管理后台系统</p>
          </div>
          
          {/* 登录/注册切换Tab */}
          <div className="flex border-b border-gray-200">
            <button
              className={`flex-1 py-4 text-lg font-medium transition-colors ${
                activeTab === 'login'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('login')}
            >
              登录
            </button>
            <button
              className={`flex-1 py-4 text-lg font-medium transition-colors ${
                activeTab === 'register'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('register')}
            >
              注册
            </button>
          </div>
          
          {/* 错误提示 */}
          {errorMessage && (
            <div className="mx-6 mt-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {errorMessage}
            </div>
          )}
          
          {/* 登录表单 */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  用户名
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                  <div className="pl-4 pr-3 text-gray-400">
                    👤
                  </div>
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    className="flex-1 py-3 outline-none"
                    placeholder="请输入用户名"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  密码
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                  <div className="pl-4 pr-3 text-gray-400">
                    🔒
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="flex-1 py-3 outline-none"
                    placeholder="请输入密码"
                    required
                  />
                  <button
                    type="button"
                    className="px-4 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                    记住登录状态
                  </label>
                </div>
                <button type="button" className="text-sm text-blue-600 hover:text-blue-800">
                  忘记密码？
                </button>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-[#0084FF] text-white text-lg font-semibold rounded-lg hover:bg-[#0073e6] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    登录中...
                  </span>
                ) : (
                  '登录'
                )}
              </button>
              
              {/* 预置账号提示 */}
              <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-100">
                <p>预置测试账号：</p>
                <div className="flex justify-center gap-6 mt-2">
                  <div className="bg-gray-100 px-3 py-1 rounded">
                    <div className="font-medium">商户账号</div>
                    <div>merchant / 123456</div>
                  </div>
                  <div className="bg-gray-100 px-3 py-1 rounded">
                    <div className="font-medium">管理员账号</div>
                    <div>admin / 123456</div>
                  </div>
                </div>
              </div>
            </form>
          )}
          
          {/* 注册表单 */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  用户名
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                  <div className="pl-4 pr-3 text-gray-400">
                    👤
                  </div>
                  <input
                    type="text"
                    value={registerUsername}
                    onChange={(e) => setRegisterUsername(e.target.value)}
                    className="flex-1 py-3 outline-none"
                    placeholder="请输入用户名"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  密码
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                  <div className="pl-4 pr-3 text-gray-400">
                    🔒
                  </div>
                  <input
                    type="password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="flex-1 py-3 outline-none"
                    placeholder="至少6位密码"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  确认密码
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                  <div className="pl-4 pr-3 text-gray-400">
                    🔒
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="flex-1 py-3 outline-none"
                    placeholder="请再次输入密码"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  角色选择
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    className={`p-4 rounded-xl border-2 transition-all ${
                      registerRole === 'merchant'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                    onClick={() => setRegisterRole('merchant')}
                  >
                    <div className="text-2xl mb-2">🏪</div>
                    <div className="font-semibold">商户入驻</div>
                    <div className="text-sm mt-1">管理自己的酒店</div>
                  </button>
                  <button
                    type="button"
                    className={`p-4 rounded-xl border-2 transition-all ${
                      registerRole === 'admin'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                    onClick={() => setRegisterRole('admin')}
                  >
                    <div className="text-2xl mb-2">👨‍💼</div>
                    <div className="font-semibold">平台管理员</div>
                    <div className="text-sm mt-1">管理所有酒店</div>
                  </button>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-[#0084FF] text-white text-lg font-semibold rounded-lg hover:bg-[#0073e6] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    注册中...
                  </span>
                ) : (
                  '注册'
                )}
              </button>
              
              <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-100">
                <p>点击注册即表示同意<span className="text-blue-600 cursor-pointer">《用户协议》</span>和<span className="text-blue-600 cursor-pointer">《隐私政策》</span></p>
              </div>
            </form>
          )}
          
          {/* 底部信息 */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <p className="text-center text-gray-600 text-sm">
              © 2026 易宿管理平台 · 专业酒店管理解决方案
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
