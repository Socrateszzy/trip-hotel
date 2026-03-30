import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/user/Home';
import HotelList from './pages/user/HotelList';
import HotelDetail from './pages/user/HotelDetail';
import Login from './pages/admin/Login';
import HotelForm from './pages/admin/HotelForm';
import HotelAudit from './pages/admin/HotelAudit';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Routes>
          {/* 默认重定向到用户首页 */}
          <Route path="/" element={<Navigate to="/user/home" replace />} />
          
          {/* 用户端路由 */}
          <Route path="/user/home" element={<Home />} />
          <Route path="/user/list" element={<HotelList />} />
          <Route path="/user/detail/:id" element={<HotelDetail />} />
          
          {/* 管理端路由 */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/form" element={<HotelForm />} />
          <Route path="/admin/form/:id" element={<HotelForm />} />
          <Route path="/admin/audit" element={<HotelAudit />} />
          
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
