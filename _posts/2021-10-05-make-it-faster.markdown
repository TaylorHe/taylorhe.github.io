---
layout: post
title:  "Make It Faster"
date:   2021-10-05 03:00:00 -0500
excerpt: Caches, Threads, Fibers, Coroutines
tags: c++
---

## Background
Thinking about performance has been extremely important at work. It's engrained in all the feature enhancements and bug fixes that go into the codebase.

Below is a simple problem statement my team faces, and some potential solutions we've thought about and attempted.


## Need for Speed
In college, we are taught a set of neat algorithms to solve a very specific, isolated problem. Taking fibonacci from non-polynomial time to linear time is a huge win. The dynamic programming solution to Coin Change is blazingly fast compared to the naive try-everything approach.

But when's the last time you or any software engineer you know had to write a fibonacci function?

Many times at work, I am not constrained by these 2^n or n^3 algorithms, but rather by slow requests to other services. Making a call on the network is extremely expensive - constructing and serializing the request over the network, machine routing, database queries, data filtering, and processing responses into something usable.

Say all this takes 10ms, a reasonable time for a single request to fetch complex data. But maybe you have to collect data for 50 fields on the one item you're processing. Each field requires a separate request. A back of the napkin calculation of 10ms * 50 gives you an extremely slow 0.5 seconds to retrieve data with synchronous requests. Doing this for every item in a list of thousands can easily take minutes to process. All of a sudden, making a dynamic programming approach to one small problem barely makes a dent in your total processing time.

How do we solve these throughput slowness issues?

## Caches
A distributed implementation of Redis is typically the way to cache requests. A request that takes a long time can be cached in Redis.

The implementation of distributed Redis at my current workplace retrieves a key in a blazingly fast 0.1ms on average, multiple magnitudes faster than the average service call. Caching the request and response of something like this yields incredible improvements. Even if you can only cache 5-10 requests, after the first request, you can reduce the cost of processing time by that amount for every item afterwards. In addition, you're reducing your network load, and freeing up the downstream resource to serve other requests.

Let's estimate the potential improvement.
Conservatively, let's say you find 5 slow service calls to cache. After the first item is processed, all other items in the queue only need 45 requests, an average of 0.45s. Over thousands of items, we've effectively reduced the time by 10% by employing this one technique.

There are a few things to note before caching:

- First, the the data must be tolerant to staleness. Caching a user permission, a default setting, or some other similar data is fine. If your system is a trading system that is sensitive to price changes, don't cache prices. If a response object can't be modified without obtaining some kind of lock, don't cache it.
- Caching should yield a significant performance improvement. If a request takes 0.5ms and the redis cache takes 0.2ms, you're just wasting memory if you put it in the cache. If a request takes 100ms and you can cache it, that's a big win. One request I cached took about 150ms!
- Caching should result in a high hit rate. We don't want to cache very specific data. If the request being made is too specific, it can't be reused as often.
- Apply a TTL (time to live) to expire data properly.



## Threads
The above calculations probably don't make any sense if you've ever worked in a system larger than your senior design project in college.

The obvious way to make things faster is to run them at the same time. Threading is a basic concept: we can just spawn another thread of execution that runs parallel to a bunch of others. That way, the theoretical best execution time is the time of the slowest request. In practice, things don't really work that way. Sometimes some prior response data is needed for input into another request, making chaining necessary. We also don't take into account the price of context switching between threads.

This can substantially improve our runtime, but at a cost. Each thread takes up a bit of stack space for its own variables, and takes up a thread ID. There are a limited number of threads that can be spawned on a server. In fact, my team implemented threading, but it was only on production for a bit as we were warned by the machine managers that our service was spawning over 10,000 threads when we got a huge number of requests. The machine maximum was 65k, and it was unfair that one process was hogging so much resource.

To be continued...

## Fibers

TBA

## Coroutines

TBA