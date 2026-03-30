import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Hotel {
  id: number;
  name: string;
  nameEn: string;
  address: string;
  city: string;
  stars: number;
  openYear: number;
  score: number;
  reviewCount: number;
  images: string[];
  rooms: {
    id: number;
    type: string;
    area: number;
    maxPerson: number;
    price: number;
    stock: number;
  }[];
  status: 'published' | 'pending' | 'offline' | 'rejected';
  tags: string[];
  // 新增字段
  merchantName?: string;
  submitTime?: string;
  rejectReason?: string;
}

const HotelAudit: React.FC = () => {
  const navigate = useNavigate();
  
  // 状态管理
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'published' | 'offline' | 'rejected'>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // 审核相关状态
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedHotelId, setSelectedHotelId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // 初始化：加载用户和酒店数据
  useEffect(() => {
    // 检查登录状态
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUser(user);
      // 只有管理员可以访问此页面
      if (user.role !== 'admin') {
        navigate('/admin/login');
      }
    } else {
      navigate('/admin/login');
    }

    // 加载酒店数据
    loadHotels();
  }, [navigate]);

  // 加载酒店数据
  const loadHotels = () => {
    const hotelsStr = localStorage.getItem('hotels');
    if (hotelsStr) {
      const hotelsData: Hotel[] = JSON.parse(hotelsStr);
      
      // 确保每个酒店都有必要的字段
      const enhancedHotels = hotelsData.map(hotel => ({
        ...hotel,
        merchantName: hotel.merchantName || '测试商户',
        submitTime: hotel.submitTime || generateSubmitTime(hotel.id),
        rejectReason: hotel.rejectReason || ''
      }));
      
      setHotels(enhancedHotels);
    }
  };

  // 生成提交时间（模拟）
  const generateSubmitTime = (id: number) => {
    const now = new Date();
    const offset = id * 24 * 60 * 60 * 1000; // 按ID偏移天数
    const date = new Date(now.getTime() - offset);
    return date.toISOString().split('T')[0] + ' ' + date.toTimeString().split(' ')[0].substring(0, 5);
  };

  // 统计数据
  const stats = {
    pending: hotels.filter(h => h.status === 'pending').length,
    published: hotels.filter(h => h.status === 'published').length,
    offline: hotels.filter(h => h.status === 'offline').length,
    rejected: hotels.filter(h => h.status === 'rejected').length,
    total: hotels.length
  };

  // 过滤酒店
  const filteredHotels = hotels.filter(hotel => {
    // 状态筛选
    if (filterStatus !== 'all' && hotel.status !== filterStatus) return false;
    
    // 关键词搜索
    if (searchKeyword && !hotel.name.toLowerCase().includes(searchKeyword.toLowerCase()) && 
        !hotel.nameEn.toLowerCase().includes(searchKeyword.toLowerCase()) &&
        !hotel.city.toLowerCase().includes(searchKeyword.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // 状态标签颜色
  const getStatusBadge = (status: string, rejectReason?: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">待审核</span>;
      case 'published':
        return <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">已发布</span>;
      case 'offline':
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">已下线</span>;
      case 'rejected':
        return (
          <div>
            <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">不通过</span>
            {rejectReason && <div className="text-red-600 text-xs mt-1">{rejectReason}</div>}
          </div>
        );
      default:
        return null;
    }
  };

  // 处理通过审核
  const handleApprove = (id: number) => {
    const updatedHotels = hotels.map(hotel => 
      hotel.id === id ? { ...hotel, status: 'published' as const } : hotel
    );
    
    setHotels(updatedHotels);
    localStorage.setItem('hotels', JSON.stringify(updatedHotels));
  };

  // 处理不通过审核
  const handleReject = (id: number) => {
    setSelectedHotelId(id);
    setRejectReason('');
    setShowRejectModal(true);
  };

  // 确认不通过审核
  const confirmReject = () => {
    if (!selectedHotelId || !rejectReason.trim()) return;
    
    const updatedHotels = hotels.map(hotel => 
      hotel.id === selectedHotelId ? { 
        ...hotel, 
        status: 'rejected' as const,
        rejectReason: rejectReason.trim()
      } : hotel
    );
    
    setHotels(updatedHotels);
    localStorage.setItem('hotels', JSON.stringify(updatedHotels));
    
    setShowRejectModal(false);
    setSelectedHotelId(null);
    setRejectReason('');
  };

  // 处理下线
  const handleTakeOffline = (id: number) => {
    const updatedHotels = hotels.map(hotel => 
      hotel.id === id ? { ...hotel, status: 'offline' as const } : hotel
    );
    
    setHotels(updatedHotels);
    localStorage.setItem('hotels', JSON.stringify(updatedHotels));
  };

  // 处理恢复上线
  const handleRestore = (id: number) => {
    const updatedHotels = hotels.map(hotel => 
      hotel.id === id ? { ...hotel, status: 'published' as const } : hotel
    );
    
    setHotels(updatedHotels);
    localStorage.setItem('hotels', JSON.stringify(updatedHotels));
  };

  // 处理退出登录
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen flex">
      {/* 左侧导航栏 */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <span className="text-2xl">🏨</span>
            <h1 className="text-xl font-bold">易宿管理平台</h1>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-blue-700 rounded-lg">
              <span className="text-xl">📋</span>
              <span className="font-medium">审核管理</span>
            </div>
          </div>
        </div>
        
        <div className="mt-auto p-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 text-gray-300 hover:bg-gray-800 rounded-lg transition"
          >
            <span>👋</span>
            <span>退出登录</span>
          </button>
        </div>
      </div>

      {/* 右侧内容区 */}
      <div className="flex-1 bg-gray-50">
        {/* 顶部标题 */}
        <div className="bg-white border-b border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900">酒店审核管理</h1>
          {currentUser && (
            <p className="text-gray-600 mt-2">
              管理员：<span className="font-medium">{currentUser.username}</span>
            </p>
          )}
        </div>

        {/* 统计卡片行 */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* 待审核卡片 */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">待审核</p>
                  <p className="text-3xl font-bold mt-2">{stats.pending}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 text-2xl">⏳</span>
                </div>
              </div>
            </div>
            
            {/* 已发布卡片 */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">已发布</p>
                  <p className="text-3xl font-bold mt-2">{stats.published}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-2xl">✓</span>
                </div>
              </div>
            </div>
            
            {/* 已下线卡片 */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-gray-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">已下线</p>
                  <p className="text-3xl font-bold mt-2">{stats.offline}</p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 text-2xl">⏸️</span>
                </div>
              </div>
            </div>
            
            {/* 审核不通过卡片 */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">审核不通过</p>
                  <p className="text-3xl font-bold mt-2">{stats.rejected}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-2xl">✗</span>
                </div>
              </div>
            </div>
          </div>

          {/* 筛选栏 */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* 状态筛选Tab */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-4 py-2 rounded-lg ${filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  全部
                </button>
                <button
                  onClick={() => setFilterStatus('pending')}
                  className={`px-4 py-2 rounded-lg ${filterStatus === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  待审核 ({stats.pending})
                </button>
                <button
                  onClick={() => setFilterStatus('published')}
                  className={`px-4 py-2 rounded-lg ${filterStatus === 'published' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  已发布 ({stats.published})
                </button>
                <button
                  onClick={() => setFilterStatus('offline')}
                  className={`px-4 py-2 rounded-lg ${filterStatus === 'offline' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  已下线 ({stats.offline})
                </button>
                <button
                  onClick={() => setFilterStatus('rejected')}
                  className={`px-4 py-2 rounded-lg ${filterStatus === 'rejected' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  不通过 ({stats.rejected})
                </button>
              </div>
              
              {/* 搜索框 */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="搜索酒店名、英文名或城市"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-64"
                />
              </div>
            </div>
          </div>

          {/* 酒店列表表格 */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      酒店名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      提交商户
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      城市
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      星级
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      提交时间
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredHotels.map((hotel) => (
                    <tr key={hotel.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{hotel.name}</div>
                          <div className="text-sm text-gray-500">{hotel.nameEn}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{hotel.merchantName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{hotel.city}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-yellow-500">
                          {'★'.repeat(hotel.stars)}
                          <span className="text-gray-500 ml-2">{hotel.stars}星</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{hotel.submitTime}</div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(hotel.status, hotel.rejectReason)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {/* 根据状态显示不同的操作按钮 */}
                          {hotel.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(hotel.id)}
                                className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700"
                              >
                                通过
                              </button>
                              <button
                                onClick={() => handleReject(hotel.id)}
                                className="px-3 py-1 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700"
                              >
                                不通过
                              </button>
                            </>
                          )}
                          
                          {hotel.status === 'published' && (
                            <button
                              onClick={() => handleTakeOffline(hotel.id)}
                              className="px-3 py-1 bg-gray-600 text-white text-xs font-medium rounded hover:bg-gray-700"
                            >
                              下线
                            </button>
                          )}
                          
                          {hotel.status === 'offline' && (
                            <button
                              onClick={() => handleRestore(hotel.id)}
                              className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700"
                            >
                              恢复上线
                            </button>
                          )}
                          
                          {hotel.status === 'rejected' && (
                            <button
                              className="px-3 py-1 bg-gray-300 text-gray-700 text-xs font-medium rounded cursor-not-allowed"
                              disabled
                            >
                              查看详情
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredHotels.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">没有找到匹配的酒店</p>
              </div>
            )}

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-700">
                  显示 <span className="font-medium">{filteredHotels.length}</span> 条结果，共 <span className="font-medium">{hotels.length}</span> 条
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 不通过审核模态框 */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">填写不通过原因</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
              placeholder="请输入不通过审核的原因..."
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedHotelId(null);
                  setRejectReason('');
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={confirmReject}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                disabled={!rejectReason.trim()}
              >
                确认不通过
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelAudit;
