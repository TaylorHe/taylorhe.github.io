---
layout: post
title:  C++ Function Qualifiers
date:   2020-06-15 03:00:00 -0500
excerpt: A collection of stuff about C++ functions.
tags: c++
---
If I'm going to write a post about C++ classes, why not functions too?
### inline
`inline` is a pretty popular function qualifier.

If a function is inline, the compiler puts a copy of the code of the function at each point where the function is called. This means that any time an inline function is changed, all callers of that function have to be recompiled so that the code is replaced with the new version.

Consider the code:
```cpp
int max(int a, int b) {
    return a > b ? a : b;
}
int main() {
  std::cout << max(3, 4) << std::endl;
}
```
When the program executes, it:
    1. Calls the `max()` function
    2. Pushes `a` and `b` on to the stack
    3. Pops `a` and `b` off of the stack
    4. Returns the value
Doesn't seem like much, but there is some overhead associated with calling the function, pushing/popping variables on the stack, and the return overhead.
If we qualify max with `inline`, the code is replaced with the contents of the inline function at compile time.

```cpp
inline int max(int a, int b) {
    return a > b ? a : b;
}
int main() {
  std::cout << max(3, 4) << std::endl;
}
```
During compile time, the cout statement will become
```cpp
std::cout << 3 > 4 ? 3 : 4 << std::endl;
```
The compiler can then run context-specific optimizations on this, and possibly even make for more cache-friendly code.

Obviously, inline can't be used to replace everything. They're meant for simple functions - and the limitations show that. The compiler can't inline functions with loops, static variables, recursion, or switch statements.

The advantage of inline is performace related, but there are disadvantages.
One minor thing I can think of off the top of my head is if you modify an inline function, there may be an expensive cost to recompile during development.
Because the code is copied into every place where the inline function is called, this means that the binary might be large due to code duplication.
