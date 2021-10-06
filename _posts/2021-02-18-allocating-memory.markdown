---
layout: post
title:  Allocation Memory
date:   2021-02-18 03:00:00 -0500
excerpt: What kind of software engineer really works with this stuff, anyway?
tags: c++ memory linux
---

## New and Malloc
A few months back, I was asked a very interesting question: What does the keyword `new` do?

I was caught off guard - and after desperately probing my brain and clawing for old memories from my college classes, I replied that new allocates memory and constructs the object of the type specified. Malloc is similar but does not call the constructor of the type.

Apparently, that wasn't good enough.

"Ok, that's true - but what does it _actually_ do?" he pushed. "Behind the scenes, how does it allocate memory?"

I felt that the question was a little unfair. Besides the low-level trivia, how `new` allocates memory is most likely implementation dependent. As far as I knew, `new` allocated memory, probably using `malloc`, and then called the constructor of the provided type.

Still, I was determined to find out what the answer. Armed with time and internet resources, I decided to document my findings here.

A disclaimer here, some of this is from reading journals/stackoverflow posts, and some of it is my intuition and guessing based on what I've learned. I've specified when I am guessing, but if I'm wrong please contact me and let me know! I can't find much detail on this topic online.

## Memory Layout
Let's take a look at how memory is laid out.

<img src="/assets/img/memorylayout.jpg" />

At the top you'll notice a `brk` pointer. That's called the program break, and it signals the top of the heap.
Writing to memory above that line will lead to a segfault.

In older systems, manually moving this program break was a way to allocate more heap memory.

## brk
The system call to move the program break is `brk()`.

- `brk(void* addr)` moves the location of that program break to the provided address. Increasing the address of the program break effectively "allocates" memory to the process, and decreasing the break frees memory. You can also provide a NULL address parameter to ask where the heap memory ends.

- `sbrk(intptr_t increment)` is similar, except that it increases the program break by an amount. This function is just a wrapper around the `brk()` call. The man pages also specify that sbrk is a library function that uses the brk syscall, as opposed to being a syscall itself.

<img src="/assets/img/sbrk_example.png" />

According to its [man pages](https://man7.org/linux/man-pages/man2/brk.2.html), using `brk()` directly is considered legacy. It was removed from the POSIX 2001 standard, and you shouldn't ever manually use it.

I can't find much reason on why `brk` is legacy online, but I can take my guesses:

1. Fragmentation. Because there is only one program break, there may be unaccessible memory.

    Take the case where brk allocates a large chunk of memory and moves the program break up. Then, it allocates a small amount of memory, and then frees the large chunk. The large chunk of memory is now technically usable, but the program break is hogging more memory than it needs to. The smaller chunk of memory makes the larger chunk unusable.

2. Thread safety.

    This is kind of a guess, but I could imagine two threads reading the program break at the same time, and then allocating memory with that starting address. It would mean that both threads would write to the same chunk of memory, and may delete a portion of the larger allocation.

## malloc
Some implementations of malloc use `brk` to allocate smaller amounts of memory, and `mmap` for large allocations. We'll discuss `mmap` next.

malloc is typically faster than brk because it acts as a wrapper around brk, by aggregating small memory requests to fewer, larger brk syscalls.

Since a system call is generally more expensive than a library call, that strategy "yields a significant performance improvement", according to the [Linux Journal](https://www.linuxjournal.com/article/6390). I haven't done any of my own performance tests, so I don't know how much faster it really is.

So a call to malloc will grab a large chunk of memory from brk and then split it on subsequent malloc calls.

In the same vein, freeing memory does not require a system call every time. The C library aggregates the freed chunks until a large, contiguous chunk can be freed at the same time.

Malloc also implements a free list, which is just a circular linked list of blocks of memory that have been freed, with the data being the pointer to the memory and the size. Maintaining this list means that we can re-use the freed, fragmented blocks. The drawback is that this can lead to poor performance, since we would have to scan through the list for either the first fit block or the best fit block.

## mmap
`mmap` is the generally accepted better choice compared to `brk()`. It allocates memory in pages, and the allocated memory blocks can always be independently freed back, as opposed to the program break solution with brk.

```cpp
void* mmap(void* start, size_t length, int prot, int flags, int fd, off_t offset)
``` 

malloc uses mmap for large allocations of memory, namely, the size is defined by `M_MMAP_THRESHOLD`. The default size is 128K.

This size is typically much larger than the page size, since mmap allocations must be page-aligned. If mmap tries to allocate something smaller, there will be wasted memory in the last page.

mmap creates a block in the virtual address space, of which the starting address and length/size are supplied. You can supply a NULL address, which means that the kernel chooses the memory address to create the mapping - page aligned, of course. If the supplied address is not page aligned, then the kernel will use a nearby page boundary above/equal to the value.

When I test on my (ubuntu on windows) system and on online repls, I see that `M_MMAP_THRESHOLD == -3`, and it never moves the program break at all. I'm guessing each system is implementation dependent, whether they use 128K or not.

<img src="/assets/img/mmap_example.png" />



## Conclusion
This isn't an exhaustive post, obviously. 
I'm not sure how much deeper I can go without it turning into one of those 50 minute college lectures. There's a lot about understanding mmap that I haven't discussed. Some of that is just ignorance - I am still learning about this through some forums and journals, and some of that is because it would make better for a dedicated post.

In summary, a ton of this is implementation/system dependent.

If I had the chance to answer "how does `new` work under the hood?" again, I would approach the question like this:

0. Disclaimer that it is implementation/system dependent.
1. `new` uses malloc to allocate memory, and calls the constructor of the type. We must always name a type, do not need to re-cast the void* return of malloc.
2. `malloc` uses either the system call `brk` to allocate the memory, or `mmap`, depending on the M_MMAP_THRESHOLD. It provides some nice book-keeping on top of brk, like solving fragmentation issues with freelists.
3. `brk` adjusts the program break, which just signals the top of the heap. There are a few issues to this, which led to its deprecation.
4. `mmap` creates a mapping in virtual memory, and is preferred over `brk` because of fragmentation advantages.
