---
layout: post
title:  C++ Attributes
date:   2020-07-06 03:00:00 -0500
excerpt: '[[nodiscard]] const Information& postAboutAttributes();'
tags: c++
---
I was actually going to include this in the function qualifiers post, but it didn't exactly fit with the rest of the real qualifiers. I'm not exactly sure how to group them yet, and they're not only for functions, so I'm making a separate post for them.

This isn't going to cover all the attributes, but just the ones I like or remember.

### [[deprecated]]
This one is going first because it's actually from C++14, not C++17.

`[[deprecated]]` marks some entity as allowed, but discouraged to be used.
You can also supply a reason as to why the it's deprecated.

Some examples of usage:
```cpp
struct [[deprecated]] Foo;  // On a struct
[[deprecated]] int i;  // On a variable
[[deprecated("use Baz() instead")]] void Bar() { };  // Function
```

### [[nodiscard]]


### [[fallthrough]]


### [[likely]] and [[unlikely]]
Coming in C++20, these attributes can be assigned to code paths. The compiler will look for these and optimize for the likely path.


