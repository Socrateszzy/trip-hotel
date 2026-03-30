import React from 'react';

interface LoadingProps {
  type?: 'spinner' | 'skeleton' | 'dots';
  text?: string;
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ 
  type = 'skeleton', 
  text = '加载中...',
  fullScreen = false 
}) => {
  if (type === 'spinner') {
    return (
      <div className={`flex flex-col items-center justify-center ${fullScreen ? 'h-screen' : 'py-8'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">{text}</p>
      </div>
    );
  }

  if (type === 'dots') {
    return (
      <div className={`flex items-center justify-center ${fullScreen ? 'h-screen' : 'py-8'}`}>
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        <p className="ml-3 text-gray-600">{text}</p>
      </div>
    );
  }

  // 骨架屏加载效果
  return (
    <div className={`animate-pulse ${fullScreen ? 'h-screen p-8' : 'p-4'}`}>
      {fullScreen ? (
        <div className="space-y-6">
          {/* 头部骨架 */}
          <div className="h-8 bg-gray-300 rounded w-1/3"></div>
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
          
          {/* 内容骨架 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="space-y-4">
              <div className="h-48 bg-gray-300 rounded-lg"></div>
              <div className="h-6 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            </div>
            <div className="space-y-4">
              <div className="h-6 bg-gray-300 rounded w-1/2"></div>
              <div className="h-10 bg-gray-300 rounded w-full"></div>
              <div className="h-10 bg-gray-300 rounded w-full"></div>
              <div className="h-10 bg-gray-300 rounded w-full"></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* 酒店列表骨架 */}
          <div className="h-48 bg-gray-300 rounded-lg"></div>
          <div className="space-y-3">
            <div className="h-6 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            <div className="h-8 bg-gray-300 rounded w-1/4 mt-4"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Loading;