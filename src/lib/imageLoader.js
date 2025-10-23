export default function imageLoader({ src, width, quality }) {
  // Для локальных изображений возвращаем как есть
  if (src.startsWith('/images/')) {
    return src
  }
  
  // Для внешних изображений возвращаем как есть (без оптимизации)
  return src
}
