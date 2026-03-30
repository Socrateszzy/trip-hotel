import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Home from './pages/user/Home';
import HotelList from './pages/user/HotelList';
import HotelDetail from './pages/user/HotelDetail';
import Login from './pages/admin/Login';
import HotelForm from './pages/admin/HotelForm';
import HotelAudit from './pages/admin/HotelAudit';

// 路由守卫组件
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireRole?: 'admin' | 'merchant' | 'any';
}

const ProtectedRoute = ({ children, requireAuth = true, requireRole = 'any' }: ProtectedRouteProps) => {
  const location = useLocation();

  useEffect(() => {
    if (requireAuth) {
      const userStr = localStorage.getItem('currentUser');
      if (!userStr) {
        // 没有登录信息，跳转到登录页
        window.location.href = '/admin/login';
        return;
      }

      try {
        const user = JSON.parse(userStr);
        if (requireRole !== 'any' && user.role !== requireRole) {
          // 角色不匹配
          window.location.href = '/admin/login';
          return;
        }
      } catch (error) {
        // 用户信息解析失败
        localStorage.removeItem('currentUser');
        window.location.href = '/admin/login';
        return;
      }
    }
  }, [location, requireAuth, requireRole]);

  if (requireAuth) {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
      // 显示加载状态或空白页面
      return <div className="min-h-screen flex items-center justify-center">检查登录状态...</div>;
    }

    try {
      const user = JSON.parse(userStr);
      if (requireRole !== 'any' && user.role !== requireRole) {
        return <div className="min-h-screen flex items-center justify-center">权限不足...</div>;
      }
    } catch (error) {
      return <div className="min-h-screen flex items-center justify-center">登录信息无效...</div>;
    }
  }

  return <>{children}</>;
};

// 滚动到顶部组件
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <ScrollToTop />
        <Routes>
          {/* 默认重定向到用户首页 */}
          <Route path="/" element={<Navigate to="/user/home" replace />} />
          
          {/* 用户端路由 - 不需要认证 */}
          <Route path="/user/home" element={<Home />} />
          <Route path="/user/list" element={<HotelList />} />
          <Route path="/user/detail/:id" element={<HotelDetail />} />
          
          {/* 管理端登录页 - 不需要认证 */}
          <Route path="/admin/login" element={<Login />} />
          
          {/* 管理端表单页 - 需要认证，角色可以是admin或merchant */}
          <Route path="/admin/form" element={
            <ProtectedRoute requireAuth requireRole="any">
              <HotelForm />
            </ProtectedRoute>
          } />
          <Route path="/admin/form/:id" element={
            <ProtectedRoute requireAuth requireRole="any">
              <HotelForm />
            </ProtectedRoute>
          } />
          
          {/* 管理端审核页 - 需要认证，必须是admin角色 */}
          <Route path="/admin/audit" element={
            <ProtectedRoute requireAuth requireRole="admin">
              <HotelAudit />
            </ProtectedRoute>
          } />
          
          {/* 404 页面 */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-gray-600 mb-8">页面未找到</p>
                <a href="/user/home" className="text-blue-600 hover:text-blue-800 underline">
                  返回首页
                </a>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
