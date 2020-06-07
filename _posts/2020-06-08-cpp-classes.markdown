---
layout: post
title:  C++ Classes
date:   2020-06-08 03:00:00 -0500
excerpt: Always great to have a refresher, so this post is going back to the basics!
tags: c++
---

At first, this was going to be a quick and easy post about virtual functions, but the more I thought about it, why not cover the fundamentals of cpp classes while I'm at it? This isn't going to go too in depth, but just provide some nice-to-know knowledge. I kind of have this info jumbled in my head, so it's good to structure and have some me-documentation for it instead of having to read through some overly complex StackOverflow answer.
<hr /> <br />
### Thanks, Mr. Compiler.
```cpp
class Foo { };
```
When you write the most basic definition of a class, like above, it looks like it has nothing in it, but the compiler actually declares some default methods for your class that you can use. These default methods typically just goes away if you write your own constructor, and most likely you'll want to write your own.

They're pretty unsurprisingly straightforward:
 - A default constructor: This default constructor has no arguments and no body.
    It's so you can write `Foo foo;` without writing your own constructor.
 - A destructor: This is implicitly marked `virtual`. Can you guess why?
 - A copy constructor: So that you can copy one instance to another. Just copies each member of the first instance to the second.
    ```cpp
    Foo f1;
    Foo f2 = f1;  // copy construct
    ```
 - A copy assignment operator: It's effectively the same thing as the copy above, but doesn't allocate any new memory.
    ```cpp
    Foo f1;
    Foo f2;
    f2 = f1;  // copy assignment
    ```
 - A move constructor: Love me some move semantics! Used when a new object is created from a temporary object is destroyed.
    ```cpp
    Foo f1;
    Foo f2 = std::move(f1);  // move construct
    ```
 - A move assignment operator: See any similarities from copy/copy assign?
    ```cpp
    Foo f1;
    Foo f2;
    f2 = std::move(f1);  // move assignment
    ```

So now that I've written it out, I'm thinking: 6 implicit methods? C++ basically writes itself! Thanks, Mr. Compiler!
Also in practice, I find that I don't really touch copy/copy assign/move/move assign often. Most of the time the implicit ones are good enough. Thanks, Mr. Compiler!

### Derived Classes
Have you had some time to think about the question about why destructors are implicitly virtual?
Destructors are virtual because it ensures that the destructor of a derived class will be called.

Derived classes are ... [To be continued]