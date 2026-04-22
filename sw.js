const CACHE_NAME = 'catchase-word-app-v1';

// 这里写上你需要断网访问的所有“静态文件”
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    // 缓存你的代码里用到的四个外部 CDN 库
    'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/localforage/1.10.0/localforage.min.js'
];

// 1. 安装时：把上面的文件全下载到缓存里
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// 2. 运行时：拦截网络请求
self.addEventListener('fetch', event => {
    const requestUrl = event.request.url;

    // 💡 极其重要：跳过 .jsonl 数据文件！
    // 因为你的 data/part1.jsonl 已经由 localforage 存在 IndexedDB 里了，
    // 不要让 sw.js 去拦截它们，否则会引起冲突。
    if (requestUrl.includes('.jsonl')) {
        return; 
    }

    // 对于 HTML、图片和 JS 库，优先从缓存里拿，断网也能瞬间秒开
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                return cachedResponse; // 命中缓存，直接返回
            }
            return fetch(event.request); // 没有缓存，再去联网下载
        })
    );
});

// 3. 更新时：清理旧缓存
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys.map(key => {
                if (key !== CACHE_NAME) {
                    return caches.delete(key);
                }
            }));
        })
    );
    self.clients.claim();
});
