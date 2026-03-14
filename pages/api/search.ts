import type { NextApiRequest, NextApiResponse } from 'next'
import { aiConfig } from '../../config/ai'

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

interface ResponseData {
  films: Film[]
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    res.status(405).end()
    return
  }

  const { query } = req.body

  try {
    // 调用硅基流动AI服务
    const apiKey = process.env.SILICONFLOW_API_KEY
    const apiUrl = process.env.SILICONFLOW_API_URL
    
    if (!apiKey || !apiUrl) {
      throw new Error('硅基流动API配置未找到')
    }

    // 构建AI请求
    const aiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: aiConfig.model,
        messages: [
          {
            role: 'system',
            content: aiConfig.systemPrompt
          },
          {
            role: 'user',
            content: query
          }
        ],
        // 使用配置文件中的AI参数
        temperature: aiConfig.temperature,
        max_tokens: aiConfig.maxTokens,
        timeout: aiConfig.timeout,
        top_p: aiConfig.topP,
        top_k: aiConfig.topK,
        presence_penalty: aiConfig.presencePenalty,
        frequency_penalty: aiConfig.frequencyPenalty
      })
    })

    if (!aiResponse.ok) {
      const errorBody = await aiResponse.text()
      throw new Error(`AI请求失败: ${aiResponse.status} - ${errorBody}`)
    }

    const aiData = await aiResponse.json()
    const aiContent = aiData.choices?.[0]?.message?.content || ''

    // 解析AI返回的结果
    const films: Film[] = []
    
    if (aiContent) {
      console.log('原始AI返回内容:', aiContent)
      
      try {
        // 尝试将整个内容作为JSON数组解析
        const allFilms = JSON.parse(aiContent) as Film[]
        // 替换AI返回的placeholder链接为picsum.photos链接
        allFilms.forEach(film => {
          film.posterUrl = `https://picsum.photos/300/450?random=${film.title}`
          // 初始化链接字段，后续会生成准确的链接
          film.doubanLink = ''
          film.bilibiliLink = ''
          film.tmdbLink = ''
          films.push(film)
        })
      } catch (arrayError) {
        console.log('不是JSON数组，尝试匹配单个JSON对象:', arrayError instanceof Error ? arrayError.message : String(arrayError))
        
        // 尝试匹配所有独立的JSON对象
        const jsonRegex = /\{(?:[^\{\}]|\{[\s\S]*?\})*\}/g
        let match
        
        while ((match = jsonRegex.exec(aiContent)) !== null) {
          try {
            const film = JSON.parse(match[0]) as Film
            // 替换AI返回的placeholder链接为picsum.photos链接
            film.posterUrl = `https://picsum.photos/300/450?random=${film.title}`
            
            // 初始化链接字段，后续会生成准确的链接
            film.doubanLink = ''
            film.bilibiliLink = ''
            film.tmdbLink = ''
            
            films.push(film)
            console.log('成功解析JSON对象:', film.title)
          } catch (parseError) {
            console.error('解析单个JSON失败:', parseError)
            console.error('问题JSON:', match[0])
          }
        }
      }
    }
    
    // 限制返回6部影片
    const limitedFilms = films.slice(0, 6)
    
    // 调用TMDB API获取真实海报（可选）
    const tmdbApiKey = process.env.TMDB_API_KEY
    const tmdbApiUrl = process.env.TMDB_API_URL
    
    if (tmdbApiKey && tmdbApiUrl) {
      console.log('调用TMDB API获取真实海报...')
      
      // 并行处理所有影片，添加超时处理
      const filmsWithPosters = await Promise.all(
        limitedFilms.map(async (film) => {
          try {
            // 添加超时设置的fetch包装函数
            const fetchWithTimeout = async (url: string, options: any = {}, timeout = 5000) => {
              const controller = new AbortController()
              const timeoutId = setTimeout(() => controller.abort(), timeout)
              
              try {
                const response = await fetch(url, {
                  ...options,
                  signal: controller.signal
                })
                clearTimeout(timeoutId)
                return response
              } catch (error) {
                clearTimeout(timeoutId)
                throw error
              }
            }
            
            // 从tags中提取作品类型
            const tags = film.tags || []
            console.log(`影片${film.title}的标签:`, tags)
            
            // 判断作品类型（确保只搜索动漫）
            const isAnime = tags.some(tag => 
              tag.includes('动漫') || tag.includes('动画') || tag.includes('二次元') || 
              film.title.includes('动画') || film.title.includes('动漫') || 
              film.title.includes('Animation') || film.title.includes('Anime')
            )
            
            console.log(`影片${film.title}是否为动漫:`, isAnime)
            
            // 定义TMDB类型：动漫优先搜索TV，真人优先搜索电影
            const preferredTypes = isAnime ? 
              [{ name: 'TV剧集', endpoint: '/search/tv' }, { name: '电影', endpoint: '/search/movie' }] :
              [{ name: '电影', endpoint: '/search/movie' }, { name: 'TV剧集', endpoint: '/search/tv' }]
            
            let foundPoster = false
            
            // 尝试所有搜索类型（按优先级）
            for (const searchType of preferredTypes) {
              if (foundPoster) break
              
              console.log(`尝试搜索${searchType.name}...`)
              
              // 构建搜索参数
              let searchUrl = `${tmdbApiUrl}${searchType.endpoint}?api_key=${tmdbApiKey}&query=${encodeURIComponent(film.title)}&language=zh-CN&include_adult=false`
              
              // 只有电影搜索支持sort_by参数
              if (searchType.name === '电影') {
                searchUrl += '&sort_by=popularity.desc'
              }
              
              // 动漫类型添加genre过滤
              if (isAnime && searchType.name === '电影') {
                searchUrl += '&with_genres=16' // 16是动画genre ID
              }
              
              const searchResponse = await fetchWithTimeout(
                searchUrl,
                {},
                3000 // 3秒超时
              )
              
              if (searchResponse.ok) {
                const searchData = await searchResponse.json()
                if (searchData.results && searchData.results.length > 0) {
                  // 对结果进行二次筛选，优先选择动画类作品
                  let filteredResults = searchData.results
                  
                  // 如果是动漫类型，优先选择动画类别
                  if (isAnime) {
                    filteredResults = filteredResults.filter((result: any) => {
                      // 检查genre_ids中是否包含动画类别（16表示动画）
                      return result.genre_ids && result.genre_ids.includes(16)
                    })
                    
                    // 如果没有找到动画类别，使用原始结果
                    if (filteredResults.length === 0) {
                      filteredResults = searchData.results
                    }
                  }
                  
                  const bestMatch = filteredResults[0]
                  if (bestMatch.poster_path) {
                    film.posterUrl = `https://image.tmdb.org/t/p/w500${bestMatch.poster_path}`
                    console.log(`通过${searchType.name}搜索策略成功获取影片${film.title}的海报: ${film.posterUrl}`)
                    foundPoster = true
                  }
                }
              }
            }
            
            // 如果所有搜索都失败，使用默认图片
            if (!foundPoster) {
              console.log(`所有搜索策略都失败，为影片${film.title}使用默认图片`)
              film.posterUrl = `https://via.placeholder.com/300x450/1a1a2e/ffffff?text=动漫海报`
            }
          } catch (tmdbError) {
            console.error(`获取影片${film.title}的海报失败:`, tmdbError instanceof Error ? tmdbError.message : String(tmdbError))
            // 失败时使用默认图片
            film.posterUrl = `https://via.placeholder.com/300x450/1a1a2e/ffffff?text=动漫海报`
          }
          
          // 生成准确的搜索链接
          try {
            // 构建豆瓣搜索URL，搜索影片标题
            const doubanSearchUrl = `https://search.douban.com/movie/subject_search?search_text=${encodeURIComponent(film.title)}&cat=1002`
            film.doubanLink = doubanSearchUrl
            
            // 构建B站搜索URL，搜索影片标题
            const bilibiliSearchUrl = `https://search.bilibili.com/all?keyword=${encodeURIComponent(film.title)}&from_source=webtop_search&spm_id_from=333.1007&search_source=5`
            film.bilibiliLink = bilibiliSearchUrl
            
            // 构建TMDB搜索URL，搜索影片标题
            const tmdbSearchUrl = `https://www.themoviedb.org/search?query=${encodeURIComponent(film.title)}`
            film.tmdbLink = tmdbSearchUrl
          } catch (error) {
            console.error(`生成搜索链接失败:`, error)
            // 失败时使用各平台首页
            film.doubanLink = 'https://movie.douban.com'
            film.bilibiliLink = 'https://www.bilibili.com'
            film.tmdbLink = 'https://www.themoviedb.org'
          }
          
          return film
        })
      )
      
      res.status(200).json({ films: filmsWithPosters })
    } else {
      // 如果没有TMDB API配置，使用picsum.photos服务
      limitedFilms.forEach(film => {
        film.posterUrl = `https://picsum.photos/300/450?random=${film.title}`
        // 生成链接
        film.doubanLink = `https://search.douban.com/movie/subject_search?search_text=${encodeURIComponent(film.title)}&cat=1002`
        film.bilibiliLink = `https://search.bilibili.com/all?keyword=${encodeURIComponent(film.title)}&from_source=webtop_search&spm_id_from=333.1007&search_source=5`
        film.tmdbLink = `https://www.themoviedb.org/search?query=${encodeURIComponent(film.title)}`
      })
      res.status(200).json({ films: limitedFilms })
    }
  } catch (error) {
    console.error('搜索错误:', error)
    res.status(500).json({ films: [] })
  }
}
