import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const HotelList: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 解析URL参数
  const searchParams = new URLSearchParams(location.search);
  const city = searchParams.get('city') || '';
  const keyword = searchParams.get('keyword') || '';
  const priceRange = searchParams.get('priceRange') || '不限';
  const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
  
  // 排序方式
  const [sortBy, setSortBy] = useState<string>('推荐排序');
  
  // 价格筛选状态
  const priceOptions = ['不限', '200以下', '200-500', '500-1000', '1000以上'] as const;
  type PriceOption = typeof priceOptions[number];
  
  // 转换priceRange到新的选项（兼容旧参数）
  const getTransformedPriceRange = (range: string): PriceOption => {
    if (range === '500以上') return '500-1000'; // 旧参数映射到500-1000范围
    if (priceOptions.includes(range as PriceOption)) return range as PriceOption;
    return '不限';
  };
  
  const [priceFilter, setPriceFilter] = useState<PriceOption>(getTransformedPriceRange(priceRange));
  
  // 星级筛选状态（多选复选框）
  const [selectedStars, setSelectedStars] = useState<number[]>([]);
  
  // 酒店设施筛选状态（多选标签）
  const facilityTags = ['WiFi', '停车', '早餐', '健身房', '泳池', '亲子'];
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>(tags);
  
  // 酒店数据
  const [hotels, setHotels] = useState<any[]>([]);
  const [filteredHotels, setFilteredHotels] = useState<any[]>([]);

  // 加载酒店数据
  useEffect(() => {
    loadHotels();
  }, []);

  // 应用筛选
  useEffect(() => {
    applyFilters();
  }, [hotels, selectedStars, priceFilter, selectedFacilities, sortBy]);

  const loadHotels = () => {
    try {
      // 从localStorage加载酒店数据
      const hotelsStr = localStorage.getItem('hotels');
      if (hotelsStr) {
        const allHotels = JSON.parse(hotelsStr);
        // 只显示已发布的酒店
        const publishedHotels = allHotels.filter((hotel: any) => hotel.status === 'published');
        setHotels(publishedHotels);
      } else {
        // 如果没有数据，从hotels.json导入
        import('../../data/hotels.json').then((data) => {
          const allHotels = data.default;
          const publishedHotels = allHotels.filter((hotel: any) => hotel.status === 'published');
          setHotels(publishedHotels);
          // 保存到localStorage
          localStorage.setItem('hotels', JSON.stringify(allHotels));
        });
      }
    } catch (error) {
      console.error('加载酒店数据失败:', error);
    }
  };

  // 获取酒店最低价格
  const getHotelMinPrice = (hotel: any) => {
    if (!hotel.rooms || hotel.rooms.length === 0) return 0;
    return Math.min(...hotel.rooms.map((room: any) => room.price));
  };

  // 应用筛选
  const applyFilters = () => {
    let result = [...hotels];

    // 关键词筛选（从URL参数）
    if (keyword) {
      const keywordLower = keyword.toLowerCase();
      result = result.filter(hotel => 
        hotel.name.toLowerCase().includes(keywordLower) ||
        hotel.nameEn.toLowerCase().includes(keywordLower) ||
        hotel.address.toLowerCase().includes(keywordLower) ||
        hotel.city.toLowerCase().includes(keywordLower)
      );
    }

    // 城市筛选（从URL参数）
    if (city) {
      result = result.filter(hotel => hotel.city === city);
    }

    // 星级筛选（多选）
    if (selectedStars.length > 0) {
      result = result.filter(hotel => {
        return selectedStars.some(star => hotel.stars >= star);
      });
    }

    // 价格范围筛选
    if (priceFilter !== '不限') {
      result = result.filter(hotel => {
        const minPrice = getHotelMinPrice(hotel);
        switch (priceFilter) {
          case '200以下':
            return minPrice < 200;
          case '200-500':
            return minPrice >= 200 && minPrice <= 500;
          case '500-1000':
            return minPrice >= 500 && minPrice <= 1000;
          case '1000以上':
            return minPrice > 1000;
          default:
            return true;
        }
      });
    }

    // 设施筛选（多选标签）
    if (selectedFacilities.length > 0) {
      // 将前端设施标签映射到酒店的真实标签
      const facilityMapping: Record<string, string[]> = {
        'WiFi': ['Wi-Fi', '免费Wi-Fi'],
        '停车': ['免费停车'],
        '早餐': ['含早餐', '早餐'],
        '健身房': ['健身房'],
        '泳池': ['游泳池', '泳池'],
        '亲子': ['亲子']
      };
      
      result = result.filter(hotel => {
        return selectedFacilities.every(facility => {
          const relatedTags = facilityMapping[facility] || [facility];
          return relatedTags.some(tag => hotel.tags.includes(tag));
        });
      });
    }

    // 排序
    let sortedResult = [...result];
    switch (sortBy) {
      case '价格从低到高':
        sortedResult.sort((a, b) => getHotelMinPrice(a) - getHotelMinPrice(b));
        break;
      case '价格从高到低':
        sortedResult.sort((a, b) => getHotelMinPrice(b) - getHotelMinPrice(a));
        break;
      case '评分最高':
        sortedResult.sort((a, b) => b.score - a.score);
        break;
      case '推荐排序':
      default:
        // 默认按推荐排序（评分*评价数量权重）
        sortedResult.sort((a, b) => (b.score * Math.log(b.reviewCount + 1)) - (a.score * Math.log(a.reviewCount + 1)));
        break;
    }

    setFilteredHotels(sortedResult);
  };

  // 处理星级选择
  const handleStarSelect = (star: number) => {
    setSelectedStars(prev => {
      if (prev.includes(star)) {
        return prev.filter(s => s !== star);
      } else {
        return [...prev, star];
      }
    });
  };

  // 处理设施选择
  const handleFacilitySelect = (facility: string) => {
    setSelectedFacilities(prev => {
      if (prev.includes(facility)) {
        return prev.filter(f => f !== facility);
      } else {
        return [...prev, facility];
      }
    });
  };

  // 处理应用筛选按钮
  const handleApplyFilters = () => {
    applyFilters();
  };

  // 处理查看详情
  const handleViewDetail = (hotelId: number) => {
    navigate(`/user/detail/${hotelId}`);
  };

  // 处理排序
  const handleSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sortBy = e.target.value;
    let sorted = [...filteredHotels];
    
    switch (sortBy) {
      case '按评分排序':
        sorted.sort((a, b) => b.score - a.score);
        break;
      case '按价格从低到高':
        sorted.sort((a, b) => getHotelMinPrice(a) - getHotelMinPrice(b));
        break;
      case '按价格从高到低':
        sorted.sort((a, b) => getHotelMinPrice(b) - getHotelMinPrice(a));
        break;
      default:
        break;
    }
    
    setFilteredHotels(sorted);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1200px] mx-auto p-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">酒店列表</h1>
          <p className="text-gray-600">找到最适合您的住宿选择</p>
          {keyword && (
            <div className="mt-2">
              <span className="text-sm text-gray-600">搜索关键词：</span>
              <span className="text-sm font-medium text-blue-600">{keyword}</span>
            </div>
          )}
          {city && (
            <div>
              <span className="text-sm text-gray-600">城市：</span>
              <span className="text-sm font-medium text-blue-600">{city}</span>
            </div>
          )}
        </header>

        <div className="flex flex-col md:flex-row gap-8">
          {/* 筛选侧边栏 */}
          <aside className="w-full md:w-[280px] shrink-0">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6 sticky top-6">
              <h3 className="text-lg font-semibold mb-4">筛选条件</h3>
              <div className="space-y-8">
                {/* 排序方式 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    排序方式
                  </label>
                  <div className="space-y-2">
                    {['推荐排序', '价格从低到高', '价格从高到低', '评分最高'].map((sortOption) => (
                      <div key={sortOption} className="flex items-center">
                        <input
                          type="radio"
                          id={`sort-${sortOption}`}
                          name="sort"
                          checked={sortBy === sortOption}
                          onChange={() => setSortBy(sortOption)}
                          className="mr-2"
                        />
                        <label htmlFor={`sort-${sortOption}`} className="text-gray-700 cursor-pointer text-sm">
                          {sortOption}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 价格范围筛选 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    价格范围
                  </label>
                  <div className="space-y-2">
                    {priceOptions.map((range) => (
                      <div key={range} className="flex items-center">
                        <input
                          type="radio"
                          id={`price-${range}`}
                          name="price-range"
                          checked={priceFilter === range}
                          onChange={() => setPriceFilter(range)}
                          className="mr-2"
                        />
                        <label htmlFor={`price-${range}`} className="text-gray-700 cursor-pointer text-sm">
                          {range === '不限' ? '不限' : `¥${range}`}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 酒店星级筛选 - 多选复选框 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    酒店星级
                  </label>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <div key={star} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`star-${star}`}
                          checked={selectedStars.includes(star)}
                          onChange={() => handleStarSelect(star)}
                          className="mr-2"
                        />
                        <label htmlFor={`star-${star}`} className="text-gray-700 cursor-pointer text-sm">
                          {'★'.repeat(star)}星
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 酒店设施筛选 - 多选标签 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    酒店设施
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {facilityTags.map((facility) => {
                      const facilityIcons: Record<string, string> = {
                        'WiFi': '📶',
                        '停车': '🚗',
                        '早餐': '🍳',
                        '健身房': '💪',
                        '泳池': '🏊',
                        '亲子': '🧒'
                      };
                      return (
                        <button
                          key={facility}
                          className={`px-3 py-1.5 rounded-full text-sm transition-colors flex items-center ${
                            selectedFacilities.includes(facility)
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                          onClick={() => handleFacilitySelect(facility)}
                        >
                          <span className="mr-1">{facilityIcons[facility] || ''}</span>
                          {facility}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 按钮组 */}
                <div className="flex gap-3 pt-2">
                  <button 
                    className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                    onClick={handleApplyFilters}
                  >
                    应用筛选
                  </button>
                  <button 
                    className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                    onClick={() => {
                      setSelectedStars([]);
                      setPriceFilter('不限');
                      setSelectedFacilities([]);
                      setSortBy('推荐排序');
                    }}
                  >
                    重置
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* 酒店列表 */}
          <main className="w-full md:w-3/4">
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                共找到 <span className="font-semibold">{filteredHotels.length}</span> 家酒店
              </p>
              <select 
                className="border border-gray-300 rounded-lg px-4 py-2"
                onChange={handleSort}
                defaultValue="按评分排序"
              >
                <option>按评分排序</option>
                <option>按价格从低到高</option>
                <option>按价格从高到低</option>
              </select>
            </div>

            <div className="space-y-6">
              {filteredHotels.map((hotel) => {
                const minPrice = getHotelMinPrice(hotel);
                
                return (
                  <div
                    key={hotel.id}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer"
                    onClick={() => handleViewDetail(hotel.id)}
                  >
                    <div className="p-6">
                      {/* 移动端布局 - 竖向 */}
                      <div className="flex flex-col md:hidden gap-6">
                        {/* 酒店图片 */}
                        <div>
                          <div className="w-full h-48 rounded-lg overflow-hidden">
                            {hotel.images && hotel.images.length > 0 ? (
                              <img
                                src={hotel.images[0]}
                                alt={hotel.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg"></div>
                            )}
                          </div>
                        </div>

                        {/* 酒店信息 */}
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 mb-1">
                                {hotel.name}
                              </h3>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-yellow-500">
                                  {'★'.repeat(hotel.stars)}
                                </span>
                                <span className="text-gray-500 text-sm">
                                  {hotel.stars}星级酒店 · {hotel.city}
                                </span>
                              </div>
                              <p className="text-gray-600 mb-2">{hotel.address}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-blue-600 mb-1">
                                ¥{minPrice}
                              </div>
                              <div className="text-sm text-gray-500">起/晚</div>
                            </div>
                          </div>

                          {/* 酒店标签 */}
                          <div className="flex flex-wrap gap-1 mb-4">
                            {hotel.tags?.slice(0, 4).map((tag: string) => (
                              <span
                                key={tag}
                                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                              >
                                {tag}
                              </span>
                            ))}
                            {hotel.tags?.length > 4 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                +{hotel.tags.length - 4}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center">
                                <span className="text-lg font-semibold text-green-600 mr-2">
                                  {hotel.score}
                                </span>
                                <span className="text-gray-600">评分</span>
                              </div>
                              <div className="text-gray-600">
                                <span className="font-medium">{hotel.reviewCount}</span> 条评价
                              </div>
                            </div>
                            <button 
                              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetail(hotel.id);
                              }}
                            >
                              查看详情
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* PC端布局 - 横向左图右文 */}
                      <div className="hidden md:flex gap-6">
                        {/* 酒店图片 - 固定240px */}
                        <div className="w-[240px] shrink-0">
                          <div className="w-full h-[200px] rounded-lg overflow-hidden">
                            {hotel.images && hotel.images.length > 0 ? (
                              <img
                                src={hotel.images[0]}
                                alt={hotel.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg"></div>
                            )}
                          </div>
                        </div>

                        {/* 酒店信息 */}
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                {hotel.name}
                              </h3>
                              <div className="flex items-center gap-3 mb-3">
                                <span className="text-yellow-500 text-xl">
                                  {'★'.repeat(hotel.stars)}
                                </span>
                                <span className="text-gray-600">
                                  {hotel.stars}星级酒店 · {hotel.city}
                                </span>
                              </div>
                              <p className="text-gray-700 mb-3">{hotel.address}</p>
                              
                              {/* 酒店标签 */}
                              <div className="flex flex-wrap gap-2 mb-4">
                                {hotel.tags?.slice(0, 6).map((tag: string) => (
                                  <span
                                    key={tag}
                                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {hotel.tags?.length > 6 && (
                                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg">
                                    +{hotel.tags.length - 6}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-3xl font-bold text-blue-600 mb-2">
                                ¥{minPrice}
                              </div>
                              <div className="text-gray-500">起/晚</div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                              <div className="flex items-center">
                                <span className="text-xl font-semibold text-green-600 mr-2">
                                  {hotel.score}
                                </span>
                                <span className="text-gray-700">评分</span>
                              </div>
                              <div className="text-gray-700">
                                <span className="font-medium">{hotel.reviewCount}</span> 条评价
                              </div>
                            </div>
                            <button 
                              className="px-8 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetail(hotel.id);
                              }}
                            >
                              查看详情
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredHotels.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                  <p className="text-gray-500 text-lg">没有找到匹配的酒店</p>
                  <p className="text-gray-400 text-sm mt-2">请尝试调整筛选条件</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default HotelList;
