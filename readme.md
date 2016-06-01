# google-analytics-protocol.js

A tiny library that reimplements Google Analytics calls using the
[Google Analytics Measurement Protocol](https://developers.google.com/analytics/devguides/collection/protocol/v1/).

## Why?

Google's own analytics JS file requires a number of browser features, like cookies and XHR. Service
Workers do not have access to cookies, localStorage and the like, and we also want to be more
deliberate about versioning and caching when it comes to Service Workers. So this is a "fresh"
rewrite, using `fetch` and IndexedDB.

## Requirements

Since this is designed for use inside Service Workers I haven't added any shims for older
browsers. So it *requires* IndexedDB and `fetch` support.

## Additional features

Again, given the Service Worker nature of what we're doing, it caches analytics calls inside
the IndexedDB, so if it cannot connect to the GA server it'll store requests offline and try
the next time an analytics call is made. 

## How do I use it?

The actual call itself is very basic and uses the attributes specified in the protocol reference.

Use `setAnalyticsID()` to specify your ID before trying to send any calls.

    import Analytics from 'google-analytics-protocol';
    
    Analytics.setAnalyticsID(GA_ID);

    Analytics({
        t: 'pageview',
        dh: 'localhost.com',
        dp: '/index.html'
    })