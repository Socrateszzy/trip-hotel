import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

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

const HotelDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // 状态管理
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  // 触摸滑动相关状态
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  // 解析URL参数中的日期（从首页传过来）
  const searchParams = new URLSearchParams(location.search);
  const checkInDate = searchParams.get('checkIn') || '2026-03-30';
  const checkOutDate = searchParams.get('checkOut') || '2026-03-31';
  
  // 根据ID获取酒店数据
  useEffect(() => {
    const loadHotel = async () => {
      try {
        const hotelId = parseInt(id || '1');
        
        // 尝试从localStorage获取数据
        const hotelsStr = localStorage.getItem('hotels');
        if (hotelsStr) {
          const hotels: Hotel[] = JSON.parse(hotelsStr);
          const foundHotel = hotels.find(h => h.id === hotelId);
          if (foundHotel && foundHotel.status === 'published') {
            setHotel(foundHotel);
            return;
          }
        }
        
        // 如果没有找到，尝试从hotels.json导入
        const hotelsData = await import('../../data/hotels.json');
        const foundHotel = (hotelsData.default as any[]).find(h => h.id === hotelId) || hotelsData.default[0];
        setHotel(foundHotel as Hotel);
        
        // 如果localStorage中没有数据，保存到localStorage
        if (!hotelsStr) {
          localStorage.setItem('hotels', JSON.stringify(hotelsData.default));
        }
      } catch (error) {
        console.error('加载酒店数据失败:', error);
      }
    };
    
    loadHotel();
  }, [id]);
  
  if (!hotel) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="md:hidden max-w-[430px] w-full mx-auto text-center">加载中...</div>
        <div className="hidden md:block text-center">加载中...</div>
      </div>
    );
  }
  
  // 计算住宿天数
  const getNights = () => {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  
  // 获取最低价格
  const getMinPrice = () => {
    if (!hotel.rooms || hotel.rooms.length === 0) return 0;
    return Math.min(...hotel.rooms.map(room => room.price));
  };
  
  // 触摸滑动处理
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) {
      // 向左滑动，下一张
      setCurrentImageIndex(prev => 
        prev === hotel.images.length - 1 ? 0 : prev + 1
      );
    }
    
    if (isRightSwipe) {
      // 向右滑动，上一张
      setCurrentImageIndex(prev => 
        prev === 0 ? hotel.images.length - 1 : prev - 1
      );
    }
  };
  
  // 处理预订按钮点击
  const handleBookClick = (_roomType: string) => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };
  
  // 标签图标映射
  const tagIcons: Record<string, string> = {
    '免费停车': '🚗',
    '含早餐': '🍳',
    '游泳池': '🏊',
    '健身房': '💪',
    'Wi-Fi': '📶',
    '免费Wi-Fi': '📶',
    '设计感强': '🎨',
    '艺术氛围': '🖼️',
    '咖啡厅': '☕',
    '商务中心': '💼',
    '会议室': '👥',
    '早餐': '🍳',
    '海景': '🌊',
    '私人沙滩': '🏖️',
    '水疗中心': '🧖',
    '亲子': '🧒',
    '温泉': '♨️',
    '山景': '🏔️',
    '养生': '🧘',
    '行政酒廊': '🍸',
    '特色民宿': '🏡',
    '庭院': '🌳',
    '古风': '🏯',
    '国际品牌': '🌍',
    '顶级服务': '⭐',
    '多个餐厅': '🍽️',
    '经济实惠': '💰',
    '交通便利': '🚇',
    '基础设施': '⚙️',
  };
  
  // 按价格从低到高排序房型
  const sortedRooms = [...hotel.rooms].sort((a, b) => a.price - b.price);
  
  return (
    <div className="min-h-screen bg-[#f5f5f5] relative">
      {/* 移动端顶部导航栏 */}
      <div className="md:hidden fixed top-0 left-0 right-0 max-w-[430px] mx-auto bg-white h-12 flex items-center justify-between px-4 z-50 border-b border-gray-200">
        <button 
          className="flex items-center text-gray-700"
          onClick={() => navigate(-1)}
        >
          <span className="text-xl mr-1">←</span>
          <span className="text-sm">返回</span>
        </button>
        
        <div className="text-center flex-1 px-2 overflow-hidden">
          <div className="font-medium text-gray-900 truncate">{hotel.name}</div>
        </div>
        
        <button 
          className={`text-2xl ${isFavorite ? 'text-red-500' : 'text-gray-400'}`}
          onClick={() => setIsFavorite(!isFavorite)}
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>
      </div>

      {/* PC端顶部导航栏 */}
      <div className="hidden md:block">
        <div className="fixed top-6 left-6 right-6 max-w-[1200px] mx-auto bg-white h-14 flex items-center justify-between px-6 z-50 rounded-xl shadow-lg">
          <button 
            className="flex items-center text-gray-700 hover:text-gray-900"
            onClick={() => navigate(-1)}
          >
            <span className="text-2xl mr-2">←</span>
            <span className="text-base">返回</span>
          </button>
          
          <div className="text-center flex-1 px-4 overflow-hidden">
            <div className="font-bold text-xl text-gray-900 truncate">{hotel.name}</div>
            <div className="text-sm text-gray-500 truncate">{hotel.nameEn}</div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              className={`text-2xl ${isFavorite ? 'text-red-500' : 'text-gray-400'}`}
              onClick={() => setIsFavorite(!isFavorite)}
            >
              {isFavorite ? '❤️' : '🤍'}
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              分享
            </button>
          </div>
        </div>
      </div>
      
      {/* 移动端内容区域 */}
      <div className="md:hidden">
        <div className="pt-12">
          {/* 图片轮播 */}
          <div 
            className="relative h-[240px] overflow-hidden"
            ref={carouselRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {hotel.images.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-transform duration-300 ease-in-out ${
                  index === currentImageIndex ? 'translate-x-0' : 
                  index < currentImageIndex ? '-translate-x-full' : 'translate-x-full'
                }`}
              >
                <img
                  src={image}
                  alt={`酒店图片 ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            
            {/* 页码指示器 */}
            <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentImageIndex + 1}/{hotel.images.length}
            </div>
            
            {/* 左右切换按钮 */}
            <button
              className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/30 text-white rounded-full flex items-center justify-center text-lg"
              onClick={() => setCurrentImageIndex(prev => 
                prev === 0 ? hotel.images.length - 1 : prev - 1
              )}
            >
              ‹
            </button>
            <button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/30 text-white rounded-full flex items-center justify-center text-lg"
              onClick={() => setCurrentImageIndex(prev => 
                prev === hotel.images.length - 1 ? 0 : prev + 1
              )}
            >
              ›
            </button>
          </div>
          
          {/* 酒店基础信息块 */}
          <div className="bg-white p-4">
            {/* 第一行：酒店中英文名称 */}
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{hotel.name}</h1>
            <p className="text-gray-500 text-sm mb-3">{hotel.nameEn}</p>
            
            {/* 第二行：星级和开业年份 */}
            <div className="flex items-center mb-3">
              <div className="text-yellow-500 text-lg mr-2">
                {'★'.repeat(hotel.stars)}
              </div>
              <span className="text-gray-700 mr-4">{hotel.stars}星级</span>
              <span className="text-gray-500">开业于 {hotel.openYear}年</span>
            </div>
            
            {/* 第三行：设施标签横向滚动 */}
            <div className="mb-4 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <div className="flex space-x-2 min-w-max">
                {hotel.tags.map((tag, index) => (
                  <div
                    key={index}
                    className="flex items-center px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700 whitespace-nowrap"
                  >
                    <span className="mr-1">{tagIcons[tag] || '🏨'}</span>
                    {tag}
                  </div>
                ))}
              </div>
            </div>
            
            {/* 第四行：地址 */}
            <div className="flex items-start text-gray-600">
              <span className="text-lg mr-2">📍</span>
              <span className="text-sm">{hotel.address}</span>
            </div>
          </div>
          
          {/* 日期选择Banner */}
          <div className="mx-4 my-4 bg-gradient-to-r from-blue-500 to-[#0084FF] rounded-xl p-4 text-white">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <div className="text-sm opacity-90 mb-1">入住离店日期</div>
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <div className="text-lg font-semibold">
                      {checkInDate.split('-')[1]}月{checkInDate.split('-')[2]}日
                    </div>
                    <div className="text-xs opacity-80">入住</div>
                  </div>
                  
                  <div className="text-center px-2">
                    <div className="text-sm">共{getNights()}晚</div>
                    <div className="text-xs opacity-80">→</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg font-semibold">
                      {checkOutDate.split('-')[1]}月{checkOutDate.split('-')[2]}日
                    </div>
                    <div className="text-xs opacity-80">离店</div>
                  </div>
                </div>
              </div>
              
              <button 
                className="ml-4 px-3 py-1 bg-white/20 rounded-lg text-sm hover:bg-white/30 transition"
                onClick={() => navigate('/user/home')}
              >
                修改
              </button>
            </div>
          </div>
          
          {/* 房型价格列表 */}
          <div className="bg-white p-4 mb-24">
            <h2 className="text-xl font-bold text-gray-900 mb-4">选择房型</h2>
            
            <div className="space-y-4">
              {sortedRooms.map((room) => (
                <div
                  key={room.id}
                  className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">{room.type}</h3>
                      <p className="text-gray-600 text-sm">
                        {room.area}㎡ · 最多 {room.maxPerson}人
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-red-600">¥{room.price}</div>
                      <div className="text-gray-500 text-sm">每晚</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-gray-600 text-sm">
                      剩余: <span className="font-medium">{room.stock}</span>间
                    </div>
                    <button
                      className="px-4 py-2 bg-[#0084FF] text-white rounded-lg hover:bg-[#0073e6] transition-colors active:scale-95"
                      onClick={() => handleBookClick(room.type)}
                    >
                      预订
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* PC端内容区域 - 两栏布局 */}
      <div className="hidden md:block">
        <div className="max-w-[1200px] mx-auto pt-24 pb-8 px-4">
          <div className="flex gap-8">
            {/* 左侧栏 - 图片轮播和酒店信息 (60%) */}
            <div className="w-[60%]">
              {/* 图片轮播 */}
              <div 
                className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl"
                ref={carouselRef}
              >
                {hotel.images.map((image, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-transform duration-300 ease-in-out ${
                      index === currentImageIndex ? 'translate-x-0' : 
                      index < currentImageIndex ? '-translate-x-full' : 'translate-x-full'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`酒店图片 ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                
                {/* 页码指示器 */}
                <div className="absolute bottom-6 right-6 bg-black/50 text-white px-4 py-2 rounded-full text-base">
                  {currentImageIndex + 1}/{hotel.images.length}
                </div>
                
                {/* 左右切换按钮 */}
                <button
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/40 text-white rounded-full flex items-center justify-center text-2xl hover:bg-black/60 transition"
                  onClick={() => setCurrentImageIndex(prev => 
                    prev === 0 ? hotel.images.length - 1 : prev - 1
                  )}
                >
                  ‹
                </button>
                <button
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/40 text-white rounded-full flex items-center justify-center text-2xl hover:bg-black/60 transition"
                  onClick={() => setCurrentImageIndex(prev => 
                    prev === hotel.images.length - 1 ? 0 : prev + 1
                  )}
                >
                  ›
                </button>
              </div>
              
              {/* 酒店基础信息块 */}
              <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{hotel.name}</h1>
                  <p className="text-gray-500 text-lg">{hotel.nameEn}</p>
                </div>
                
                {/* 星级和开业年份 */}
                <div className="flex items-center mb-6">
                  <div className="text-yellow-500 text-2xl mr-3">
                    {'★'.repeat(hotel.stars)}
                  </div>
                  <span className="text-gray-700 text-lg mr-6">{hotel.stars}星级</span>
                  <span className="text-gray-500 text-lg">开业于 {hotel.openYear}年</span>
                </div>
                
                {/* 酒店标签 */}
                <div className="mb-6">
                  <div className="text-gray-700 font-medium mb-3">设施与服务</div>
                  <div className="flex flex-wrap gap-3">
                    {hotel.tags.map((tag, index) => (
                      <div
                        key={index}
                        className="flex items-center px-4 py-2 bg-gray-100 rounded-xl text-gray-700"
                      >
                        <span className="mr-2 text-lg">{tagIcons[tag] || '🏨'}</span>
                        {tag}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* 地址 */}
                <div className="flex items-start text-gray-700">
                  <span className="text-2xl mr-3">📍</span>
                  <div>
                    <div className="text-lg font-medium mb-1">地址</div>
                    <div className="text-gray-600">{hotel.address}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧栏 - 日期选择和房型列表 (40%, sticky定位) */}
            <div className="w-[40%]">
              <div className="sticky top-24 space-y-6">
                {/* 日期选择Banner */}
                <div className="bg-gradient-to-r from-blue-500 to-[#0084FF] rounded-2xl p-6 text-white shadow-xl">
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-xl font-semibold opacity-90">入住离店日期</div>
                    <button 
                      className="px-4 py-2 bg-white/20 rounded-lg text-base hover:bg-white/30 transition"
                      onClick={() => navigate('/user/home')}
                    >
                      修改
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {checkInDate.split('-')[1]}月{checkInDate.split('-')[2]}日
                      </div>
                      <div className="text-sm opacity-80">入住</div>
                    </div>
                    
                    <div className="text-center px-4">
                      <div className="text-lg">共{getNights()}晚</div>
                      <div className="text-sm opacity-80">→</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {checkOutDate.split('-')[1]}月{checkOutDate.split('-')[2]}日
                      </div>
                      <div className="text-sm opacity-80">离店</div>
                    </div>
                  </div>
                </div>

                {/* 房型价格列表 */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">选择房型</h2>
                  
                  <div className="space-y-4">
                    {sortedRooms.map((room) => (
                      <div
                        key={room.id}
                        className="border border-gray-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-md transition-all"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{room.type}</h3>
                            <p className="text-gray-600">
                              {room.area}㎡ · 最多 {room.maxPerson}人
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-red-600 mb-1">¥{room.price}</div>
                            <div className="text-gray-500">每晚</div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="text-gray-700">
                            剩余: <span className="font-bold">{room.stock}</span>间
                          </div>
                          <button
                            className="px-6 py-3 bg-[#0084FF] text-white text-lg font-semibold rounded-lg hover:bg-[#0073e6] transition-colors"
                            onClick={() => handleBookClick(room.type)}
                          >
                            预订
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 底部价格汇总 */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-gray-600">最低价格</div>
                        <div className="text-3xl font-bold text-red-600">¥{getMinPrice()}起</div>
                      </div>
                      <button
                        className="px-8 py-4 bg-[#0084FF] text-white text-xl font-bold rounded-xl hover:bg-[#0073e6] transition-colors shadow-lg"
                        onClick={() => handleBookClick('酒店')}
                      >
                        立即预订
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 底部固定栏 - 仅移动端显示 */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-white border-t border-gray-200 p-4 flex items-center justify-between">
        <div>
          <div className="text-gray-600 text-sm">最低价格</div>
          <div className="text-2xl font-bold text-red-600">¥{getMinPrice()}起</div>
        </div>
        
        <button
          className="px-8 py-3 bg-[#0084FF] text-white text-lg font-semibold rounded-full hover:bg-[#0073e6] transition-colors active:scale-95"
          onClick={() => handleBookClick('酒店')}
        >
          立即预订
        </button>
      </div>
      
      {/* Toast提示 */}
      {showToast && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-6 py-3 rounded-lg z-50">
          预订成功！
        </div>
      )}
      
      {/* 底部留白 */}
      <div className="pb-24"></div>
    </div>
  );
};

export default HotelDetail;
