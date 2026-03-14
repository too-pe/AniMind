'use client'

import { useState } from 'react'
import Image from 'next/image'

interface Film {
  title: string
  description: string
  posterUrl: string
  rating: string
  tags: string[]
  hotComments: string[]
  doubanLink: string
  bilibiliLink: string
  tmdbLink: string
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [films, setFilms] = useState<Film[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery }),
      })

      if (!response.ok) {
        throw new Error('搜索失败')
      }

      const data = await response.json()
      setFilms(data.films)
    } catch (err) {
      setError('搜索出错，请稍后重试')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen pixel-bg">
      <div className="container mx-auto px-4 py-12 pixel-font relative z-10">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-200 mb-4">AniMind</h1>
          <p className="text-lg text-gray-700 dark:text-gray-300">想看什么番,一搜便知道</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 italic">本项目搜索结果由AI提供，可能会出现一些AI暴论或完全不准确的内容，目前还在努力优化中~本项目只做个人学习交流使用，不作为商业用途！</p>
        </header>

        <main className="max-w-3xl mx-auto pb-24">
          <form onSubmit={handleSearch} className="mb-10">
            <div className="relative w-full max-w-2xl mx-auto">
              {/* 黄色小猫搜索框 - 总宽度包含身体和猫头 */}
              <div className="relative w-full" style={{ height: '64px', width: '600px' }}>
                {/* 猫身体 - 固定不动 */}
                <div className="absolute left-0 top-0" style={{ height: '100%', width: '520px' }}>
                  <Image 
                    src="/pixel-cat-search.svg" 
                    alt="Pixel Cat Body" 
                    fill
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* 猫头 - 可独立动画 */}
                <div 
                  className="absolute top-0 transition-all duration-300 ease-in-out"
                  style={{ left: '520px', height: '100%', width: '80px' }}
                  id="cat-head"
                >
                  <Image 
                    src="/pixel-cat-head.svg" 
                    alt="Pixel Cat Head" 
                    fill
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* 搜索框容器 - 精确对齐猫身体 */}
                <div className="absolute inset-0 flex items-center" style={{ paddingLeft: '60px', paddingRight: '80px' }}>
                  {/* 搜索框 - 完全贴合猫身体 */}
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索影片，例如：女主是反派的动漫"
                    className="flex-1 bg-black/70 dark:bg-gray-900/90 border-2 border-gray-600 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white dark:text-white placeholder-gray-300 dark:placeholder-gray-400 text-sm font-medium"
                    style={{ 
                      height: '48px',
                      lineHeight: '48px',
                      padding: '0 20px',
                      opacity: 1,
                      fontWeight: '500',
                      borderRadius: '0px',
                      borderLeft: 'none',
                      borderRight: 'none'
                    }}
                  />
                </div>
                
                {/* 点击猫头搜索 - 只覆盖猫头区域 */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="absolute top-0 bg-transparent border-none p-0 z-10"
                  style={{ left: '520px', height: '100%', width: '80px' }}
                  aria-label="Search"
                  onMouseEnter={() => {
                    const catHead = document.getElementById('cat-head');
                    if (catHead) {
                      catHead.style.transform = 'translateY(-5px)';
                    }
                  }}
                  onMouseLeave={() => {
                    const catHead = document.getElementById('cat-head');
                    if (catHead) {
                      catHead.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  {/* 猫头区域 - 点击搜索 */}
                </button>
              </div>
            </div>
          </form>

          {error && (
            <div className="mb-8 p-4 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-700 pixel-border">
              {error}
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              {/* 跳舞的小猫加载动画 */}
              <div className="w-16 h-16">
                <img 
                  src="/dancing-cat.svg" 
                  alt="Dancing Cat Loading" 
                  className="w-full h-full" 
                />
              </div>
              <div className="text-xl text-gray-900 dark:text-gray-200">
                正在为您寻找最适合的影片...
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                AI正在深度分析您的需求
              </div>
            </div>
          )}

          {!isLoading && films.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 grid-rows-auto">
              {films.map((film, index) => (
                <div 
                  key={index} 
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1 border-2 border-gray-300 dark:border-gray-600 pixel-border"
                  style={{ 
                    opacity: 0, 
                    transform: 'translateY(20px)',
                    animation: `fadeIn 0.6s ease-out ${index * 100}ms forwards` 
                  }}
                >
                  {/* 海报区域 - 顶部，缩小尺寸 */}
                  <div className="relative w-full aspect-[2/3] overflow-hidden rounded-t-lg border-b border-gray-200 dark:border-gray-700">
                    {/* 主图片 */}
                    <Image 
                      src={film.posterUrl} 
                      alt={film.title} 
                      fill
                      className="object-cover transition-all duration-500 hover:scale-105"
                      priority={index < 3}
                    />
                    
                    {/* 评分标签 - 左上角 */}
                    <div className="absolute top-2 left-2 bg-gray-600 text-white text-sm font-bold px-2 py-1 rounded-full shadow-md z-20">
                      {film.rating}
                    </div>
                  </div>
                  
                  {/* 内容区域 - 所有信息显示在海报下面 */}
                  <div className="p-3 flex flex-col">
                    {/* 标题 */}
                    <h2 className="text-base font-bold text-gray-900 dark:text-gray-200 mb-2 line-clamp-1">{film.title}</h2>
                    
                    {/* 标签 */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {film.tags.map((tag, tagIndex) => (
                        <span 
                          key={tagIndex} 
                          className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    {/* 概述 */}
                    <div className="mb-2">
                      <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-normal">
                        {film.description}
                      </p>
                    </div>
                    
                    {/* 热门评价 */}
                    <div className="mb-2 flex flex-col">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2">热门评价</h3>
                      <div className="space-y-1">
                        {film.hotComments.map((comment, commentIndex) => (
                          <div 
                            key={commentIndex} 
                            className="flex gap-1.5"
                          >
                            <div className="w-4 h-4 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <svg className="w-2 h-2 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd"></path>
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-normal">{comment}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* 链接按钮 */}
                    <div className="flex gap-1 mt-auto">
                      <a
                        href={film.doubanLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gray-600 hover:bg-gray-700 text-white text-sm px-2 py-1 rounded-full transition-colors flex-1 text-center border border-gray-500 dark:border-gray-700 flex items-center justify-center"
                      >
                        豆瓣
                      </a>
                      <a
                        href={film.bilibiliLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gray-600 hover:bg-gray-700 text-white text-sm px-2 py-1 rounded-full transition-colors flex-1 text-center border border-gray-500 dark:border-gray-700 flex items-center justify-center"
                      >
                        B站
                      </a>
                      <a
                        href={film.tmdbLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gray-600 hover:bg-gray-700 text-white text-sm px-2 py-1 rounded-full transition-colors flex-1 text-center border border-gray-500 dark:border-gray-700 flex items-center justify-center"
                      >
                        TMDB
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : isLoading ? null : (
            <div className="text-center py-16 text-gray-900 dark:text-gray-200">
              {/* 搜索提示已移除 */}
            </div>
          )}
        </main>
        
        {/* TMDB归因信息 - 必须添加以符合TMDB API使用条款 */}
        <footer className="fixed bottom-0 left-0 right-0 z-10 text-center text-gray-900 dark:text-gray-200 text-xs bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm py-2 px-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <Image 
              src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg" 
              alt="TMDB Logo" 
              width={60}
              height={12}
              className="opacity-70" 
            />
          </div>
          <p className="opacity-70">This website uses TMDB and the TMDB APIs but is not endorsed, certified, or otherwise approved by TMDB.</p>
        </footer>
      </div>
    </div>
  )
}
