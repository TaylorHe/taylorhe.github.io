---
layout: post
title:  C++ Functions
date:   2020-06-22 03:00:00 -0500
excerpt: A collection of stuff about C++ function qualifiers.
tags: c++
---
If I'm going to write a post about C++ classes, why not functions too?

### const
Probably the most popular of the function qualifiers, `const` can appear in many places in a function definition. For example,
```cpp
class Foo {
public:
    const std::string& function(const int& input) const;
}
```
The first and second `const` just qualify the types that come immediately after them.
The third `const` is the function qualifier - it means that the function cannot modify the object or any member variables.

### virtual
Virtual is also pretty popular. `virtual` is declared in a base class and then must be re-defined by a derived class. Formally, `virtual` functions are used to achieve runtime polymorphism (dynamic dispatch), which is just a fancy way of saying that the function that is called at runtime is also decided at runtime.
```cpp
class Foo {
    virtual void function() {
        std::cout << "implemented" << std::endl;
    }
}
```
Some rules apply:

 - Virtual functions can't be static or a friend function
 - They are always defined in the base class. If a derived class does not override the function, the base class implementation is used.

Two rules, and I actually lied about one of them. Virtual functions actually don't have to be defined in the base class when a it is a pure virtual function.
Pure virtual functions are defined by the `= 0` suffix. These functions *must* be implemented in the derived class.
```cpp
class Foo {
    virtual void function() = 0;
}
class Bar : public Foo {
    void funtion() {
        std::cout << "implemented" << std::endl;
    }
}
```
Pure virtual functions also change the `Class` in which they are defined. 

In the example above, `Foo` is now an abtract class, or an interface, which means that it cannot be used to instantiate objects.
```cpp
int main() {
    Foo foo;
}
```
This program would not compile, since foo is an abstract class.

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
