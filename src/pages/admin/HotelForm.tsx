import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import hotelsData from '../../data/hotels.json';

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
  status: 'published' | 'pending' | 'offline';
  tags: string[];
}

interface RoomType {
  id: number;
  type: string;
  area: number;
  maxPerson: number;
  price: number;
  stock: number;
}

const HotelForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // 表单数据状态
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    address: '',
    city: '上海',
    stars: 3,
    openYear: new Date().getFullYear(),
    tags: [] as string[],
  });

  // 房型管理状态
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [newRoom, setNewRoom] = useState({
    type: '',
    area: '',
    maxPerson: '',
    price: '',
    stock: '',
  });

  // 通用状态
  const [toastMessage, setToastMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  // 城市选项
  const cities = ['上海', '北京', '杭州', '成都', '广州'];
  
  // 标签选项
  const tagOptions = ['WiFi', '免费停车', '含早餐', '健身房', '泳池', '亲子', '豪华', '商务中心', '机场接送'];

  // 初始化用户和酒店数据
  useEffect(() => {
    // 获取当前登录用户
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    } else {
      navigate('/admin/login');
    }

    // 初始化酒店数据（如果localStorage中没有则使用hotels.json数据）
    const hotelsStr = localStorage.getItem('hotels');
    if (!hotelsStr) {
      localStorage.setItem('hotels', JSON.stringify(hotelsData));
    }

    // 如果是编辑模式，加载已有酒店数据
    if (isEditMode && id) {
      const hotelsStr = localStorage.getItem('hotels');
      if (hotelsStr) {
        const hotels: Hotel[] = JSON.parse(hotelsStr);
        const hotelToEdit = hotels.find(h => h.id === parseInt(id));
        if (hotelToEdit) {
          setFormData({
            name: hotelToEdit.name,
            nameEn: hotelToEdit.nameEn,
            address: hotelToEdit.address,
            city: hotelToEdit.city,
            stars: hotelToEdit.stars,
            openYear: hotelToEdit.openYear,
            tags: hotelToEdit.tags || [],
          });
          setRooms(hotelToEdit.rooms || []);
        }
      }
    }
  }, [id, isEditMode, navigate]);

  // 处理标签选择
  const handleTagToggle = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  // 处理星级选择
  const handleStarSelect = (star: number) => {
    setFormData({ ...formData, stars: star });
  };

  // 处理房型添加
  const handleAddRoom = () => {
    if (!newRoom.type || !newRoom.area || !newRoom.maxPerson || !newRoom.price || !newRoom.stock) {
      setToastMessage('请填写完整的房型信息');
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }

    const newRoomItem: RoomType = {
      id: rooms.length > 0 ? Math.max(...rooms.map(r => r.id)) + 1 : 1,
      type: newRoom.type,
      area: parseInt(newRoom.area),
      maxPerson: parseInt(newRoom.maxPerson),
      price: parseInt(newRoom.price),
      stock: parseInt(newRoom.stock),
    };

    setRooms([...rooms, newRoomItem]);
    setNewRoom({ type: '', area: '', maxPerson: '', price: '', stock: '' });
    setShowRoomForm(false);
    setToastMessage('房型添加成功');
    setTimeout(() => setToastMessage(''), 3000);
  };

  // 处理房型删除
  const handleDeleteRoom = (roomId: number) => {
    setRooms(rooms.filter(room => room.id !== roomId));
    setToastMessage('房型已删除');
    setTimeout(() => setToastMessage(''), 3000);
  };

  // 处理保存草稿
  const handleSaveDraft = () => {
    // 草稿功能暂不实现具体保存逻辑
    setToastMessage('已保存为草稿');
    setTimeout(() => setToastMessage(''), 3000);
  };

  // 处理提交审核
  const handleSubmit = () => {
    // 验证必填字段
    if (!formData.name || !formData.nameEn || !formData.address) {
      setToastMessage('请填写酒店基本信息');
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }

    if (rooms.length === 0) {
      setToastMessage('请至少添加一个房型');
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }

    // 获取现有酒店数据
    const hotelsStr = localStorage.getItem('hotels');
    let hotels: Hotel[] = hotelsStr ? JSON.parse(hotelsStr) : [];

    // 创建新酒店对象
    const newHotel: Hotel = {
      id: isEditMode ? parseInt(id!) : hotels.length > 0 ? Math.max(...hotels.map(h => h.id)) + 1 : 1,
      name: formData.name,
      nameEn: formData.nameEn,
      address: formData.address,
      city: formData.city,
      stars: formData.stars,
      openYear: formData.openYear,
      score: 8.0, // 默认评分
      reviewCount: 0, // 初始评价数
      images: [
        'https://picsum.photos/400/300?random=1',
        'https://picsum.photos/400/300?random=2',
        'https://picsum.photos/400/300?random=3'
      ],
      rooms: rooms,
      status: 'pending',
      tags: formData.tags,
    };

    if (isEditMode) {
      // 编辑模式：更新现有酒店
      hotels = hotels.map(h => h.id === parseInt(id!) ? newHotel : h);
    } else {
      // 新增模式：添加到数组
      hotels.push(newHotel);
    }

    // 保存到localStorage
    localStorage.setItem('hotels', JSON.stringify(hotels));

    setToastMessage('提交成功，等待审核');
    setTimeout(() => {
      setToastMessage('');
      navigate('/admin/audit');
    }, 3000);
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
              <span className="text-xl">📝</span>
              <span className="font-medium">酒店录入</span>
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
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? '酒店信息编辑' : '酒店信息录入'}
          </h1>
          {currentUser && (
            <p className="text-gray-600 mt-2">
              当前登录用户：<span className="font-medium">{currentUser.username}</span> 
              （{currentUser.role === 'merchant' ? '商户' : '管理员'}）
            </p>
          )}
        </div>

        {/* 表单内容 */}
        <div className="p-6">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            {/* 【基本信息】 */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-6 pb-3 border-b border-gray-200">
                基本信息
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    酒店中文名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="请输入酒店中文名"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    酒店英文名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="请输入酒店英文名"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    所在城市
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    详细地址 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="请输入详细地址"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    酒店星级
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        className={`text-2xl ${star <= formData.stars ? 'text-yellow-500' : 'text-gray-300'}`}
                        onClick={() => handleStarSelect(star)}
                      >
                        ★
                      </button>
                    ))}
                    <span className="ml-2 text-gray-700">{formData.stars}星</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    开业年份
                  </label>
                  <input
                    type="number"
                    value={formData.openYear}
                    onChange={(e) => setFormData({ ...formData, openYear: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>
              </div>
            </div>

            {/* 【酒店标签】 */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-6 pb-3 border-b border-gray-200">
                酒店标签
              </h2>
              <div className="flex flex-wrap gap-3">
                {tagOptions.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      formData.tags.includes(tag)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => handleTagToggle(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              {formData.tags.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">已选择标签：</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 【房型设置】 */}
            <div>
              <h2 className="text-xl font-semibold mb-6 pb-3 border-b border-gray-200">
                房型设置
              </h2>
              
              {/* 已添加的房型列表 */}
              {rooms.length > 0 ? (
                <div className="mb-6">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            房型名称
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            面积(m²)
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            最大人数
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            价格(元/晚)
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            房间数量
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            操作
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {rooms.map(room => (
                          <tr key={room.id}>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {room.type}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {room.area}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              最多 {room.maxPerson} 人
                            </td>
                            <td className="px-4 py-3 text-sm font-bold text-red-600">
                              ¥{room.price}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {room.stock} 间
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <button
                                type="button"
                                className="text-red-600 hover:text-red-800"
                                onClick={() => handleDeleteRoom(room.id)}
                              >
                                删除
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 mb-6">
                  暂无房型，请添加房型信息
                </div>
              )}

              {/* 添加房型按钮 */}
              <div className="mb-6">
                <button
                  type="button"
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800"
                  onClick={() => setShowRoomForm(!showRoomForm)}
                >
                  <span className="text-xl">＋</span>
                  <span>添加房型</span>
                </button>
              </div>

              {/* 房型表单 */}
              {showRoomForm && (
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
                  <h3 className="text-lg font-semibold mb-4">新增房型</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        房型名称
                      </label>
                      <input
                        type="text"
                        value={newRoom.type}
                        onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="例如：标准大床房"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        面积(m²)
                      </label>
                      <input
                        type="number"
                        value={newRoom.area}
                        onChange={(e) => setNewRoom({ ...newRoom, area: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="例如：35"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        最大人数
                      </label>
                      <input
                        type="number"
                        value={newRoom.maxPerson}
                        onChange={(e) => setNewRoom({ ...newRoom, maxPerson: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="例如：2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        每晚价格
                      </label>
                      <input
                        type="number"
                        value={newRoom.price}
                        onChange={(e) => setNewRoom({ ...newRoom, price: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="例如：899"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        房间数量
                      </label>
                      <input
                        type="number"
                        value={newRoom.stock}
                        onChange={(e) => setNewRoom({ ...newRoom, stock: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="例如：5"
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex gap-3">
                    <button
                      type="button"
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      onClick={handleAddRoom}
                    >
                      确认添加
                    </button>
                    <button
                      type="button"
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      onClick={() => setShowRoomForm(false)}
                    >
                      取消
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 底部操作栏 */}
      <div className="fixed bottom-0 left-64 right-0 bg-white border-t border-gray-200 shadow-lg p-4">
        <div className="flex justify-end gap-4">
          <button
            type="button"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            onClick={handleSaveDraft}
          >
            保存草稿
          </button>
          <button
            type="button"
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            onClick={handleSubmit}
          >
            提交审核
          </button>
        </div>
      </div>

      {/* Toast提示 */}
      {toastMessage && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          {toastMessage}
        </div>
      )}

      {/* 底部留白 */}
      <div className="pb-24"></div>
    </div>
  );
};

export default HotelForm;
