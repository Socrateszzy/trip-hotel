import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import hotelsData from '../../data/hotels.json';
import { citiesByProvince, allCities } from '../../data/cities';
import { useHotelStore } from '../../store/useHotelStore';

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
  description?: string;
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
    description: '',
    tags: [] as string[],
    images: [
      'https://picsum.photos/400/300?random=1',
      'https://picsum.photos/400/300?random=2', 
      'https://picsum.photos/400/300?random=3'
    ]
  });

  // 表单验证错误
  const [formErrors, setFormErrors] = useState({
    name: false,
    nameEn: false,
    address: false
  });

  // 城市搜索状态
  const [showCitySearch, setShowCitySearch] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [filteredCityData, setFilteredCityData] = useState(citiesByProvince);
  
  // 过滤城市数据
  useEffect(() => {
    if (!citySearch.trim()) {
      setFilteredCityData(citiesByProvince);
    } else {
      const searchLower = citySearch.toLowerCase();
      const filtered = citiesByProvince
        .map(province => ({
          ...province,
          cities: province.cities.filter(city => 
            city.toLowerCase().includes(searchLower)
          )
        }))
        .filter(province => province.cities.length > 0);
      setFilteredCityData(filtered);
    }
  }, [citySearch]);

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

  // 图片预览状态
  const [showImageInputs, setShowImageInputs] = useState(false);

  // 通用状态
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
            description: hotelToEdit.description || '',
            tags: hotelToEdit.tags || [],
            images: hotelToEdit.images || [
              'https://picsum.photos/400/300?random=1',
              'https://picsum.photos/400/300?random=2',
              'https://picsum.photos/400/300?random=3'
            ]
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
    if (!formData.name.trim()) {
      setFormErrors({ ...formErrors, name: true });
      setToastMessage('酒店中文名不能为空');
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }
    if (!formData.nameEn.trim()) {
      setFormErrors({ ...formErrors, nameEn: true });
      setToastMessage('酒店英文名不能为空');
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }
    if (!formData.address.trim()) {
      setFormErrors({ ...formErrors, address: true });
      setToastMessage('详细地址不能为空');
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }

    // 清除错误状态
    setFormErrors({ name: false, nameEn: false, address: false });

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
      description: formData.description,
      score: 8.0, // 默认评分
      reviewCount: 0, // 初始评价数
      images: formData.images,
      rooms: rooms,
      status: 'pending',
      tags: formData.tags,
    };

    if (isEditMode) {
      // 编辑模式：更新现有酒店
      hotels = hotels.map(h => h.id === parseInt(id!) ? newHotel : h);
      // 同时更新zustand store
      const { updateHotel } = useHotelStore.getState();
      updateHotel(parseInt(id!), newHotel);
    } else {
      // 新增模式：添加到数组
      hotels.push(newHotel);
      // 同时更新zustand store
      const { addHotel } = useHotelStore.getState();
      addHotel(newHotel);
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
                  <div className="relative">
                    <button
                      type="button"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-left bg-white flex justify-between items-center"
                      onClick={() => setShowCitySearch(true)}
                    >
                      <span>{formData.city}</span>
                      <span className="text-gray-400">▼</span>
                    </button>
                    <div className="text-xs text-gray-500 mt-1">点击选择城市</div>
                  </div>
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
                
                {/* 酒店简介 */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    酒店简介（选填，最多200字）
                    <span className="ml-2 text-xs text-gray-500">
                      已输入 {formData.description.length}/200
                    </span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => {
                      if (e.target.value.length <= 200) {
                        setFormData({ ...formData, description: e.target.value });
                      }
                    }}
                    className="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="请输入酒店简介，例如：酒店特色、设施、位置优势等..."
                  />
                  <div className="flex justify-end text-xs text-gray-500 mt-1">
                    {formData.description.length >= 180 && formData.description.length < 200 && (
                      <span className="text-yellow-600">接近字数限制</span>
                    )}
                    {formData.description.length === 200 && (
                      <span className="text-red-600">已达字数上限</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 【图片上传】 */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-6 pb-3 border-b border-gray-200">
                酒店图片
              </h2>
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-600">支持最多3张图片，每张图片将在网站中展示</p>
                <button
                  type="button"
                  className="px-4 py-2 text-blue-600 hover:text-blue-800 flex items-center gap-2"
                  onClick={() => setShowImageInputs(!showImageInputs)}
                >
                  <span>{showImageInputs ? '收起' : '编辑图片URL'}</span>
                  <span className="text-lg">{showImageInputs ? '↑' : '↓'}</span>
                </button>
              </div>
              
              {/* 图片预览 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {formData.images.map((imgUrl, index) => (
                  <div key={index} className="relative">
                    <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={imgUrl}
                        alt={`酒店图片 ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = `https://picsum.photos/400/300?random=${index + 1}`;
                        }}
                      />
                    </div>
                    <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      图片 {index + 1}
                    </div>
                  </div>
                ))}
              </div>

              {/* 图片URL输入区域 */}
              {showImageInputs && (
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">编辑图片URL</h3>
                  {formData.images.map((imgUrl, index) => (
                    <div key={index} className="flex gap-4 items-start">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                        <img
                          src={imgUrl}
                          alt={`预览 ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = `https://picsum.photos/400/300?random=${index + 1}`;
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          图片 {index + 1} URL
                        </label>
                        <input
                          type="text"
                          value={imgUrl}
                          onChange={(e) => {
                            const newImages = [...formData.images];
                            newImages[index] = e.target.value;
                            setFormData({ ...formData, images: newImages });
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="请输入图片URL"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          {imgUrl.includes('picsum') ? '使用默认图片' : '自定义图片URL'}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-3 mt-4">
                    <button
                      type="button"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                      onClick={() => {
                        const defaultImages = [
                          'https://picsum.photos/400/300?random=1',
                          'https://picsum.photos/400/300?random=2',
                          'https://picsum.photos/400/300?random=3'
                        ];
                        setFormData({ ...formData, images: defaultImages });
                      }}
                    >
                      恢复默认图片
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                      onClick={() => setShowImageInputs(false)}
                    >
                      保存并收起
                    </button>
                  </div>
                </div>
              )}
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

      {/* 城市选择模态框 */}
      {showCitySearch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">选择城市</h3>
                <button
                  onClick={() => {
                    setShowCitySearch(false);
                    setCitySearch('');
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              <input
                type="text"
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                placeholder="搜索城市名或省份..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {filteredCityData.length > 0 ? (
                <div className="space-y-6">
                  {filteredCityData.map((province) => (
                    <div key={province.province}>
                      <h4 className="text-lg font-medium text-gray-900 mb-3">{province.province}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {province.cities.map((city: string) => (
                          <button
                            key={city}
                            onClick={() => {
                              setFormData({ ...formData, city });
                              setShowCitySearch(false);
                              setCitySearch('');
                            }}
                            className={`px-4 py-2 rounded-lg text-left transition ${
                              formData.city === city
                                ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'
                            }`}
                          >
                            {city}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  没有找到匹配的城市
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => {
                  setShowCitySearch(false);
                  setCitySearch('');
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

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
