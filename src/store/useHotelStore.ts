import { create } from 'zustand';
import hotelsData from '../data/hotels.json';

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
  merchantName?: string;
  submitTime?: string;
  rejectReason?: string;
}

interface SearchParams {
  city?: string;
  checkIn?: string;
  checkOut?: string;
  keyword?: string;
  priceRange?: string;
  tags?: string[];
  statusFilter?: 'user' | 'all';
}

interface HotelStore {
  hotels: Hotel[];
  searchParams: SearchParams;
  isLoading: boolean;
  
  // 初始化方法
  initializeHotels: () => void;
  
  // 搜索参数方法
  setSearchParams: (params: Partial<SearchParams>) => void;
  
  // 酒店操作方法
  getHotelById: (id: number) => Hotel | undefined;
  updateHotelStatus: (id: number, status: Hotel['status'], rejectReason?: string) => void;
  addHotel: (hotel: Omit<Hotel, 'id'>) => void;
  updateHotel: (id: number, updates: Partial<Hotel>) => void;
  deleteHotel: (id: number) => void;
  
  // 过滤方法
  filterHotels: (filters: Partial<SearchParams>) => Hotel[];
  
  // 同步到localStorage
  syncToLocalStorage: () => void;
}

// 从localStorage加载或初始化酒店数据
const loadHotelsFromStorage = (): Hotel[] => {
  try {
    const hotelsStr = localStorage.getItem('hotels');
    if (hotelsStr) {
      return JSON.parse(hotelsStr);
    } else {
      // 如果没有本地数据，使用hotels.json数据
      const initialHotels = (hotelsData as Hotel[]).map(hotel => ({
        ...hotel,
        merchantName: hotel.merchantName || '测试商户',
        submitTime: hotel.submitTime || new Date().toISOString().split('T')[0],
        rejectReason: hotel.rejectReason || ''
      }));
      localStorage.setItem('hotels', JSON.stringify(initialHotels));
      return initialHotels;
    }
  } catch (error) {
    console.error('加载酒店数据失败:', error);
    return [];
  }
};

export const useHotelStore = create<HotelStore>((set, get) => ({
  hotels: loadHotelsFromStorage(),
  searchParams: {
    city: '',
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    keyword: '',
    priceRange: '不限',
    tags: [],
  },
  isLoading: false,

  // 初始化酒店数据
  initializeHotels: () => {
    const hotels = loadHotelsFromStorage();
    set({ hotels });
  },

  // 设置搜索参数
  setSearchParams: (params) =>
    set((state) => ({
      searchParams: { ...state.searchParams, ...params },
    })),

  // 根据ID获取酒店
  getHotelById: (id) => {
    const { hotels } = get();
    return hotels.find((hotel) => hotel.id === id);
  },

  // 更新酒店状态
  updateHotelStatus: (id, status, rejectReason) => {
    set((state) => {
      const updatedHotels = state.hotels.map((hotel) =>
        hotel.id === id 
          ? { 
              ...hotel, 
              status,
              rejectReason: rejectReason || hotel.rejectReason
            } 
          : hotel
      );
      
      // 同步到localStorage
      localStorage.setItem('hotels', JSON.stringify(updatedHotels));
      
      return { hotels: updatedHotels };
    });
  },

  // 添加新酒店
  addHotel: (hotel) => {
    set((state) => {
      const newHotel: Hotel = {
        ...hotel,
        id: state.hotels.length > 0 ? Math.max(...state.hotels.map((h) => h.id)) + 1 : 1,
        status: 'pending' as const,
        submitTime: new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0].substring(0, 5),
      };
      
      const updatedHotels = [...state.hotels, newHotel];
      
      // 同步到localStorage
      localStorage.setItem('hotels', JSON.stringify(updatedHotels));
      
      return { hotels: updatedHotels };
    });
  },

  // 更新酒店信息
  updateHotel: (id, updates) => {
    set((state) => {
      const updatedHotels = state.hotels.map((hotel) =>
        hotel.id === id ? { ...hotel, ...updates } : hotel
      );
      
      // 同步到localStorage
      localStorage.setItem('hotels', JSON.stringify(updatedHotels));
      
      return { hotels: updatedHotels };
    });
  },

  // 删除酒店
  deleteHotel: (id) => {
    set((state) => {
      const updatedHotels = state.hotels.filter((hotel) => hotel.id !== id);
      
      // 同步到localStorage
      localStorage.setItem('hotels', JSON.stringify(updatedHotels));
      
      return { hotels: updatedHotels };
    });
  },

  // 过滤酒店
  filterHotels: (filters) => {
    const { hotels } = get();
    
    return hotels.filter((hotel) => {
      // 城市筛选
      if (filters.city && hotel.city !== filters.city) return false;
      
      // 关键词搜索
      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase();
        if (!hotel.name.toLowerCase().includes(keyword) && 
            !hotel.nameEn.toLowerCase().includes(keyword) && 
            !hotel.address.toLowerCase().includes(keyword) &&
            !hotel.city.toLowerCase().includes(keyword)) {
          return false;
        }
      }
      
      // 标签筛选
      if (filters.tags && filters.tags.length > 0) {
        const hasAllTags = filters.tags.every(tag => hotel.tags.includes(tag));
        if (!hasAllTags) return false;
      }
      
      // 价格范围筛选（简化逻辑）
      if (filters.priceRange && filters.priceRange !== '不限') {
        const minPrice = Math.min(...hotel.rooms.map(r => r.price));
        
        if (filters.priceRange === '200以下' && minPrice >= 200) return false;
        if (filters.priceRange === '200-500' && (minPrice < 200 || minPrice > 500)) return false;
        if (filters.priceRange === '500以上' && minPrice <= 500) return false;
      }
      
      // 只显示已发布的酒店给用户端
      if (filters.statusFilter === 'user') {
        return hotel.status === 'published';
      }
      
      return true;
    });
  },

  // 同步到localStorage
  syncToLocalStorage: () => {
    const { hotels } = get();
    localStorage.setItem('hotels', JSON.stringify(hotels));
  },
}));
