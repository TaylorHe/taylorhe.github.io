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

This can substantially improve our runtime, but at a cost. Each thread takes up a bit of stack space for its own variables, and takes up a thread ID. There are a limited number of threads that can be spawned on a server. In fact, the first pass of implementing threading had big issues with resource management - we were warned by the machine managers that our N number of instances of the service was collectively spawning over 10,000 threads when we got a huge number of requests. The machine maximum was 65k, and it was unfair that one process was hogging so much resource of both threads and RAM. In addition to resource control, this practice is undesirable because you'd have to manage the lifetime of the threads, paying the cost of constructing and destroying the thread, context switching, etc.

On that note, context switching between threads is, ahem, relatively higher, but still very fast. On a typical x86, a context switch costs thousands of CPU cycles when entering and exiting kernel mode to call the scheduler. Still, very fast, but compared to some other methods below, it is an order of magnitude slower. 

## Thread Pools
A common paradigm to allocate a thread pool. A thread pool is a simple concept: let's try limiting the number of threads, and each piece of work is placed on a queue to be processed. A request asks for a resource, a line of execution, from the thread pool. If it's available, then great, that I/O request can take it, and when finished, give it back to the pool when it's done. If there is no resource available, we simply wait for one in a queue.

There are key decisions to be made when making a thread pool - how many threads to use, the most efficient way to allocate tasks, and maybe even low long you can wait for a task to complete. What if one of the threads is stuck? How do you manage sequential requests, rather, tasks that rely on other tasks to be completed? Should the thread wait for the entire sequence to be completed? Another point of performance concern is the queue that tasks are scheduled on. Because we are constantly pushing and popping off the queue, there might be a lot of contention, especially as the number of threads increase.

When tuned properly, thread pooling is a great solution to compute-bound workloads. In I/O bound workloads, the only issue is when waiting for a task to complete, you're not effectively utilizing the thread that can be used by another item on the queue in the meantime.

## Fibers
Fibers can be described as user-space threads. Like threads, they have their own stacks, execution contexts, and some scheduler. Unlike threads that are scheduled by the kernel, fibers do not have to go to the kernel, which makes context switching much faster. According to `boost::fiber` documentation, the context switch only takes hundreds of CPU cycles, compared to the thousands for thread switching.

Fibers yield cooperatively instead of being time-sliced by a scheduler, making this suitable for I/O bound workloads. The fiber can effectively call I/O, yield immediately, and have other fibers of execution continue. This makes the call asynchronous and also does not block a whole thread of execution, which leads to better resource management. When the request is done executing, we can give control back to that fiber with some condition variable.

This usage is very similar to an async-await pattern, allowing for cooperative multitasking in a single thread (or multiple) around I/O in a service.

Fibers also can be run and scheduled across multiple threads, known as an M:N threading model. The downside is that because fibers are user-scheduled, it increases complexity and potentially suboptimal scheduling with a poor implementation.

## Coroutines
Fibers are great, but effectively what we try to achieve from it is some asynchronous model of suspending and resuming execution.
C++20 introduces coroutines into the standard library which does the same thing, natively. Simply, coroutines are just functions that can be suspended and resumed. If you've ever created a python generator, it's like that. My guess is that coroutines, when released, will probably replace most fiber usage.

On a conceptual level, coroutines separate the idea of execution and state; they can suspend execution while maintaining state. Coroutines can have multiple execution states, but does not own any thread of exection.

`co_yield` in C++20, or `yield` in python, essentially suspends the function's execution, but still stores the state.
It then returns the value of whatever `yield` produced.

`co_await` is lets the user wait for the called coroutine to yield - so you'd typically `co_await` a coroutine.

```cpp

std::future<std::string> DoThingsInOrder(std::string input)
{
    auto result1 = co_await DoThing1(input);
    auto result2 = co_await DoThing2(result1);
    while (auto result3 = co_await DoThing3(result2))
    {
        co_return result3;
    }
    
}

```

## Usage and Drawbacks
There are some drawbacks. Since fibers and coroutines run on a single thread, it's difficult to step through code linearly on GDB or any other debugger.
One other drawback, which isn't so much technical as it is a consideration, is that the concept of coroutines is new and unfamiliar. There is a high time cost for a developer to learn about this and implement it effectively. For every I/O contribution to the codebase, developers need to think about performance, concepts and syntax of the new design, how they schedule the asynchronous call, and when to await it.

However, when done properly, we can leverage all of these concepts to massively increase the processing throughput of a service. Going from a single-threaded system to a one that uses a thread pool is a large performance increase. Taking it one step further to introduce asynchronicity within a single thread via fibers or coroutines is another way of trying to squeeze all the juice of the orange - ideally when dealing with large throughput, very little time is ever being wasted on any one thread of execution.
