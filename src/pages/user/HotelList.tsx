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
  
  // 筛选状态
  const [selectedStars, setSelectedStars] = useState<number[]>([]);
  const [priceFilter, setPriceFilter] = useState<'不限' | '200以下' | '200-500' | '500以上'>(priceRange as any || '不限');
  const [selectedTags, setSelectedTags] = useState<string[]>(tags);
  
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
  }, [hotels, selectedStars, priceFilter, selectedTags]);

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

    // 星级筛选
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
          case '500以上':
            return minPrice > 500;
          default:
            return true;
        }
      });
    }

    // 标签筛选
    if (selectedTags.length > 0) {
      result = result.filter(hotel => {
        return selectedTags.every(tag => hotel.tags.includes(tag));
      });
    }

    setFilteredHotels(result);
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

  // 处理标签选择
  const handleTagSelect = (tag: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
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

  // 常用标签
  const commonTags = ['免费停车', '含早餐', '游泳池', '健身房', 'Wi-Fi', '亲子', '豪华', '商务中心'];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
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

        <div className="flex flex-col md:flex-row gap-6">
          {/* 筛选侧边栏 */}
          <aside className="w-full md:w-1/4">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">筛选条件</h3>
              <div className="space-y-6">
                {/* 价格范围筛选 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    价格范围
                  </label>
                  <div className="space-y-2">
                    {(['不限', '200以下', '200-500', '500以上'] as const).map((range) => (
                      <div key={range} className="flex items-center">
                        <input
                          type="radio"
                          id={`price-${range}`}
                          name="price-range"
                          checked={priceFilter === range}
                          onChange={() => setPriceFilter(range)}
                          className="mr-2"
                        />
                        <label htmlFor={`price-${range}`} className="text-gray-700 cursor-pointer">
                          {range === '不限' ? '不限' : `¥${range}`}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 星级筛选 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    星级
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
                        <label htmlFor={`star-${star}`} className="text-gray-700 cursor-pointer">
                          {'★'.repeat(star)}星及以上
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 标签筛选 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    酒店标签
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {commonTags.map((tag) => (
                      <button
                        key={tag}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          selectedTags.includes(tag)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        onClick={() => handleTagSelect(tag)}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 应用筛选按钮 */}
                <button 
                  className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition mt-4"
                  onClick={handleApplyFilters}
                >
                  应用筛选
                </button>
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
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* 酒店图片 */}
                        <div className="md:w-1/4">
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
                        <div className="md:w-3/4">
                          <div className="flex justify-between items-start">
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
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-blue-600 mb-1">
                                ¥{minPrice}
                              </div>
                              <div className="text-sm text-gray-500">起/晚</div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-4">
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
