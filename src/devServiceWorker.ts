const cacheName = 'vite-sw-cache'
const version = 'v0.0.0'

const base = import.meta.env.BASE_URL || '/'

// add it again when HMR fixed on web workers:
// https://github.com/vitejs/vite/pull/6483
// if (import.meta.hot)
//     import.meta.hot.decline()
//

declare let self: ServiceWorkerGlobalScope

// TODO: we should use the base url
const exclusions: RegExp[] = [
    // to allow env changes?
    // /vite\/dist\/client\/env.(m)?js$/,
    // can we remove it?
    // /^\/@vite\/client$/,
    /^\/__inspect/,
    /^\/vite-sw-dev-server.js$/,
    /^\/vite-sw-dev-server.ts$/,
    /^\/__vite_ping$/
]

const shouldBeExcluded = (req: Request) => {
    const url = new URL(req.url);
    const path = url.pathname
    const protocol = url.protocol;

    if (!protocol.startsWith('http')) {
        return true;
    }

    return exclusions.some(re => path.match(re) !== null)
};

self.addEventListener('install', event => {
    // @ts-ignore
    console.log('Installing....')
    ;(event as ExtendableEvent).waitUntil(caches.open(version + cacheName))
});

self.addEventListener('activate', event => {
    // @ts-ignore
    console.log('clearing old caches...')
    ;(event as ExtendableEvent).waitUntil(
        caches.keys().then(keys => {
            // Remove caches whose name is no longer valid
            return Promise.all(
                keys
                    .filter(key => {
                        return key.indexOf(version) !== 0
                    })
                    .map(key => {
                        return caches.delete(key)
                    })
            )
        })
    );
});

self.addEventListener('fetch', event => {
    const fe = event as FetchEvent
    const request = fe.request

    // @ts-ignore
    console.log('HANDLING REQUEST', request.url)

    if (request.method === 'GET' && !shouldBeExcluded(request)) {
        // @ts-ignore
        console.log('fetching with cache:', request.url)
        fe.respondWith(getCached(request))
        return
    }

    return fe.respondWith(fetch(request))
});

const getCached = async (req: Request): Promise<Response> => {
    const cache = await caches.open(version + cacheName)

    const match = await cache.match(req)

    if (match) {
        return match
    }

    const resp = await fetch(req)

    await cache.put(req, resp)

    return resp
};

addEventListener('message', event => {
    if (event.data && event.data === 'SKIP_WAITING') {
        // noinspection JSIgnoredPromiseFromCall
        self.skipWaiting()
    }
});
