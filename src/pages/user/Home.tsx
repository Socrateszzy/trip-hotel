import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { citiesByProvince, allCities } from '../../data/cities';

const Home: React.FC = () => {
  const navigate = useNavigate();
  
  // 轮播图状态
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    { id: 1, bgColor: 'bg-[#0084FF]', title: '发现精品酒店', subtitle: '探索城市中的隐藏宝藏' },
    { id: 2, bgColor: 'bg-[#FF6B35]', title: '限时特价优惠', subtitle: '预订即享8折优惠' },
    { id: 3, bgColor: 'bg-[#00B894]', title: '亲子度假推荐', subtitle: '适合全家出游的酒店' },
  ];

  // 搜索参数状态
  const [selectedCity, setSelectedCity] = useState('上海');
  const [checkInDate, setCheckInDate] = useState('2026-03-30');
  const [checkOutDate, setCheckOutDate] = useState('2026-03-31');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [priceRange, setPriceRange] = useState('不限');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // 弹出层状态
  const [showCityDrawer, setShowCityDrawer] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  
  // 城市搜索状态
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
  
  // 价格筛选选项
  const priceOptions = [
    { value: '不限', label: '不限' },
    { value: '200以下', label: '¥200以下' },
    { value: '200-500', label: '¥200-500' },
    { value: '500-1000', label: '¥500-1000' },
    { value: '1000以上', label: '¥1000以上' },
  ];
  
  // 快捷标签
  const tags = [
    { id: '亲子', label: '🧒 亲子', icon: '🧒' },
    { id: '豪华', label: '💎 豪华', icon: '💎' },
    { id: '免费停车', label: '🚗 免费停车', icon: '🚗' },
    { id: '含早餐', label: '🍳 含早餐', icon: '🍳' },
    { id: '健身房', label: '💪 健身房', icon: '💪' },
    { id: '泳池', label: '🏊 泳池', icon: '🏊' },
  ];

  // 计算住宿天数
  const getNights = () => {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // 轮播图自动切换
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // 处理标签选择
  const handleTagClick = (tagId: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tagId)) {
        return prev.filter(tag => tag !== tagId);
      } else {
        return [...prev, tagId];
      }
    });
  };

  // 处理搜索
  const handleSearch = () => {
    const searchParams = {
      city: selectedCity,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      keyword: searchKeyword,
      priceRange,
      tags: selectedTags,
    };
    
    // 构建查询参数
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (value.length > 0) params.set(key, value.join(','));
      } else if (value) {
        params.set(key, value);
      }
    });
    
    navigate(`/user/list?${params.toString()}`);
  };

  // 轮播图跳转
  const handleSlideClick = () => {
    navigate('/user/detail/1');
  };

  // 生成日期选项
  const generateDateOptions = () => {
    const today = new Date();
    const options = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const formatted = `${date.getMonth() + 1}月${date.getDate()}日`;
      options.push({ value: dateStr, label: formatted });
    }
    return options;
  };

  const dateOptions = generateDateOptions();

  // 选择日期
  const handleDateSelect = (dateStr: string, isCheckIn: boolean) => {
    if (isCheckIn) {
      setCheckInDate(dateStr);
      // 如果入住日期大于离店日期，自动调整离店日期为入住后一天
      if (new Date(dateStr) >= new Date(checkOutDate)) {
        const nextDay = new Date(dateStr);
        nextDay.setDate(nextDay.getDate() + 1);
        setCheckOutDate(nextDay.toISOString().split('T')[0]);
      }
    } else {
      setCheckOutDate(dateStr);
    }
    setShowCalendar(false);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] relative">
      {/* PC端顶部导航栏 - md及以上显示 */}
      <div className="hidden md:flex items-center justify-between px-8 py-4 bg-white shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🏨</span>
          <h1 className="text-xl font-bold text-gray-900">易宿</h1>
        </div>
        <a 
          href="/admin/login" 
          className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
        >
          登录商家后台
        </a>
      </div>

      {/* 顶部轮播组件 */}
      <div className="relative h-[180px] md:h-[300px] overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-500 ${slide.bgColor} ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
            onClick={handleSlideClick}
            style={{ cursor: 'pointer' }}
          >
            <div className="h-full flex flex-col items-center justify-center text-white p-6">
              <h2 className="text-3xl md:text-4xl font-bold mb-2">{slide.title}</h2>
              <p className="text-lg md:text-xl opacity-90">{slide.subtitle}</p>
            </div>
          </div>
        ))}
        
        {/* 轮播指示器 */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSlide(index);
              }}
              aria-label={`切换到轮播图 ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* 移动端搜索卡片 - 小屏显示 */}
      <div className="md:hidden">
        <div className="bg-white rounded-2xl mx-4 p-5 -mt-5 relative z-10 shadow-lg">
          {/* 城市选择 */}
          <div className="mb-4">
            <div 
              className="flex items-center p-3 border border-gray-200 rounded-xl hover:border-[#0084FF] transition-colors cursor-pointer"
              onClick={() => setShowCityDrawer(true)}
            >
              <span className="text-xl mr-3">📍</span>
              <div className="flex-1">
                <div className="text-sm text-gray-500 mb-1">城市</div>
                <div className="text-lg font-medium">{selectedCity}</div>
              </div>
              <span className="text-gray-400">▼</span>
            </div>
          </div>

          {/* 日期选择 */}
          <div className="mb-4">
            <div 
              className="flex items-center p-3 border border-gray-200 rounded-xl hover:border-[#0084FF] transition-colors cursor-pointer"
              onClick={() => setShowCalendar(true)}
            >
              <span className="text-xl mr-3">📅</span>
              <div className="flex-1 flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-500 mb-1">入住</div>
                  <div className="text-lg font-medium">
                    {checkInDate.split('-')[1]}月{checkInDate.split('-')[2]}日
                  </div>
                </div>
                <div className="text-center px-2">
                  <div className="text-sm text-gray-500 mb-1">共{getNights()}晚</div>
                  <div className="text-gray-400 text-xs">→</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">离店</div>
                  <div className="text-lg font-medium">
                    {checkOutDate.split('-')[1]}月{checkOutDate.split('-')[2]}日
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 关键字搜索 */}
          <div className="mb-4">
            <div className="flex items-center p-3 border border-gray-200 rounded-xl hover:border-[#0084FF] transition-colors">
              <span className="text-xl mr-3">🔍</span>
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="flex-1 outline-none text-lg"
                placeholder="搜索酒店名/地址"
              />
            </div>
          </div>

          {/* 价格筛选 */}
          <div className="mb-4">
            <div className="text-sm text-gray-500 mb-2">价格范围</div>
            <div className="flex flex-wrap gap-2">
              {priceOptions.map((option) => (
                <button
                  key={option.value}
                  className={`px-4 py-2 rounded-full transition-colors ${
                    priceRange === option.value
                      ? 'bg-[#0084FF] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setPriceRange(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* 快捷标签 */}
          <div className="mb-2">
            <div className="text-sm text-gray-500 mb-2">快捷标签</div>
            <div className="overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <div className="flex space-x-2 min-w-max">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors flex items-center ${
                      selectedTags.includes(tag.id)
                        ? 'bg-[#0084FF] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => handleTagClick(tag.id)}
                  >
                    <span className="mr-1">{tag.icon}</span>
                    {tag.label.replace(tag.icon + ' ', '')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PC端搜索卡片 - 大屏显示 */}
      <div className="hidden md:block">
        <div className="max-w-[1200px] mx-auto px-4 -mt-10 relative z-10">
          {/* 搜索主卡片 */}
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
            <div className="flex flex-col md:flex-row items-center gap-4">
              {/* 城市选择 */}
              <div className="flex-1 w-full md:w-auto">
                <div 
                  className="flex items-center p-3 border border-gray-200 rounded-xl hover:border-[#0084FF] transition-colors cursor-pointer"
                  onClick={() => setShowCityDrawer(true)}
                >
                  <span className="text-xl mr-3">📍</span>
                  <div className="flex-1">
                    <div className="text-sm text-gray-500 mb-1">城市</div>
                    <div className="text-lg font-medium">{selectedCity}</div>
                  </div>
                  <span className="text-gray-400">▼</span>
                </div>
              </div>

              {/* 日期选择 */}
              <div className="flex-1 w-full md:w-auto">
                <div 
                  className="flex items-center p-3 border border-gray-200 rounded-xl hover:border-[#0084FF] transition-colors cursor-pointer"
                  onClick={() => setShowCalendar(true)}
                >
                  <span className="text-xl mr-3">📅</span>
                  <div className="flex-1 flex justify-between items-center">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">入住</div>
                      <div className="text-lg font-medium">
                        {checkInDate.split('-')[1]}月{checkInDate.split('-')[2]}日
                      </div>
                    </div>
                    <div className="text-center px-2">
                      <div className="text-sm text-gray-500 mb-1">共{getNights()}晚</div>
                      <div className="text-gray-400 text-xs">→</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">离店</div>
                      <div className="text-lg font-medium">
                        {checkOutDate.split('-')[1]}月{checkOutDate.split('-')[2]}日
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 关键字搜索 */}
              <div className="flex-1 w-full md:w-auto">
                <div className="flex items-center p-3 border border-gray-200 rounded-xl hover:border-[#0084FF] transition-colors">
                  <span className="text-xl mr-3">🔍</span>
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="flex-1 outline-none text-lg"
                    placeholder="搜索酒店名/地址"
                  />
                </div>
              </div>

              {/* 查询按钮 */}
              <div className="w-full md:w-auto">
                <button
                  className="w-full md:w-32 h-12 bg-[#0084FF] text-white text-lg font-semibold rounded-xl shadow-lg hover:bg-[#0073e6] transition-colors active:scale-95"
                  onClick={handleSearch}
                >
                  查 询
                </button>
              </div>
            </div>
          </div>

          {/* 快捷筛选区域 */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            {/* 价格筛选 */}
            <div className="mb-6">
              <div className="text-sm text-gray-500 mb-3">价格范围</div>
              <div className="flex flex-wrap gap-3">
                {priceOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`px-5 py-2 rounded-full transition-colors ${
                      priceRange === option.value
                        ? 'bg-[#0084FF] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setPriceRange(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 快捷标签 */}
            <div>
              <div className="text-sm text-gray-500 mb-3">快捷标签</div>
              <div className="flex flex-wrap gap-3">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    className={`px-5 py-2 rounded-full whitespace-nowrap transition-colors flex items-center ${
                      selectedTags.includes(tag.id)
                        ? 'bg-[#0084FF] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => handleTagClick(tag.id)}
                  >
                    <span className="mr-2">{tag.icon}</span>
                    {tag.label.replace(tag.icon + ' ', '')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 移动端城市选择抽屉 - 从底部弹出 */}
      {showCityDrawer && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-2xl p-4 max-h-[70vh] overflow-y-auto">
            <div className="sticky top-0 bg-white z-10 pb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">选择城市</h3>
                <button 
                  className="text-2xl"
                  onClick={() => setShowCityDrawer(false)}
                >
                  ×
                </button>
              </div>
              
              {/* 搜索框 */}
              <div className="relative mb-4">
                <div className="flex items-center p-3 bg-gray-100 rounded-xl">
                  <span className="text-xl mr-3 text-gray-500">🔍</span>
                  <input
                    type="text"
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    className="flex-1 outline-none bg-transparent text-lg"
                    placeholder="搜索城市名"
                  />
                </div>
              </div>
            </div>
            
            {/* 城市列表 - 按省份分组 */}
            <div className="space-y-6">
              {filteredCityData.map((provinceData) => (
                <div key={provinceData.province}>
                  <div className="text-sm text-gray-500 mb-2 px-1">
                    {provinceData.province}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {provinceData.cities.map((city) => (
                      <button
                        key={city}
                        className={`px-4 py-2 rounded-full transition-colors ${
                          selectedCity === city
                            ? 'bg-[#0084FF] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        onClick={() => {
                          setSelectedCity(city);
                          setShowCityDrawer(false);
                        }}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PC端城市选择浮层 - 下拉显示 */}
      {showCityDrawer && (
        <div className="hidden md:block fixed inset-0 bg-black/10 z-50">
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-[600px] bg-white rounded-2xl shadow-2xl p-6 max-h-[70vh] overflow-y-auto">
            <div className="sticky top-0 bg-white z-10 pb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">选择城市</h3>
                <button 
                  className="text-2xl hover:text-gray-700"
                  onClick={() => setShowCityDrawer(false)}
                >
                  ×
                </button>
              </div>
              
              {/* 搜索框 */}
              <div className="relative mb-6">
                <div className="flex items-center p-3 bg-gray-100 rounded-xl">
                  <span className="text-xl mr-3 text-gray-500">🔍</span>
                  <input
                    type="text"
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    className="flex-1 outline-none bg-transparent text-lg"
                    placeholder="搜索城市名或拼音"
                  />
                </div>
              </div>
            </div>
            
            {/* 城市列表 - 按省份分组 */}
            <div className="grid grid-cols-2 gap-6">
              {filteredCityData.map((provinceData) => (
                <div key={provinceData.province}>
                  <div className="text-sm font-medium text-gray-500 mb-3 px-2">
                    {provinceData.province}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {provinceData.cities.map((city) => (
                      <button
                        key={city}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          selectedCity === city
                            ? 'bg-[#0084FF] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        onClick={() => {
                          setSelectedCity(city);
                          setShowCityDrawer(false);
                        }}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 日期选择日历 */}
      {showCalendar && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-2xl p-6 max-h-[70vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">选择日期</h3>
              <button 
                className="text-2xl"
                onClick={() => setShowCalendar(false)}
              >
                ×
              </button>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <div>
                  <div className="text-sm text-gray-500">入住</div>
                  <div className="font-medium">
                    {checkInDate.split('-')[1]}月{checkInDate.split('-')[2]}日
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">共{getNights()}晚</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">离店</div>
                  <div className="font-medium">
                    {checkOutDate.split('-')[1]}月{checkOutDate.split('-')[2]}日
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2">
              {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
                <div key={day} className="text-center text-gray-500 text-sm py-1">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {dateOptions.map((date) => {
                const isCheckIn = date.value === checkInDate;
                const isCheckOut = date.value === checkOutDate;
                const isBetween = new Date(date.value) > new Date(checkInDate) && 
                                 new Date(date.value) < new Date(checkOutDate);
                const isPast = new Date(date.value) < new Date(new Date().toISOString().split('T')[0]);

                return (
                  <button
                    key={date.value}
                    className={`aspect-square flex items-center justify-center rounded-lg transition-colors ${
                      isCheckIn || isCheckOut
                        ? 'bg-[#0084FF] text-white'
                        : isBetween
                        ? 'bg-blue-50 text-blue-600'
                        : isPast
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => !isPast && handleDateSelect(date.value, !checkInDate || new Date(date.value) <= new Date(checkInDate))}
                    disabled={isPast}
                  >
                    {date.label.split('月')[1]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 底部固定查询按钮 - 仅移动端显示 */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white to-transparent max-w-[430px] mx-auto">
        <button
          className="w-[90%] mx-auto h-12 bg-[#0084FF] text-white text-lg font-semibold rounded-full shadow-lg hover:bg-[#0073e6] transition-colors active:scale-95"
          onClick={handleSearch}
        >
          查 询
        </button>
      </div>

      {/* 底部留白 */}
      <div className="pb-24"></div>
    </div>
  );
};

export default Home;
