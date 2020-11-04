---
layout: post
title:  C++ Classes
date:   2020-06-08 03:00:00 -0500
excerpt: Random facts about C++ classes.
tags: c++
---

At first, this was going to be a quick and easy post about destructors, but the more I thought about it, why not cover what I know about cpp classes while I'm at it? This isn't going to go too in depth, but just provide some nice-to-know knowledge. I kind of have this info jumbled in my head, so it's good to structure and have some me-documentation for it instead of having to read through some overly complex StackOverflow answer.
<hr /> <br />
### Thanks, Mr. Compiler.
```cpp
class Foo { };
```
When you write the most basic definition of a class, like above, it looks like it has nothing in it, but the compiler actually declares some default methods for your class that you can use. These default methods typically just goes away if you write your own constructor, and most likely you'll want to write your own.

They're pretty unsurprisingly straightforward:
 - A default constructor: This default constructor has no arguments and no body.
    It's so you can write `Foo foo;` without writing your own constructor.
 - A destructor: to free memory
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

So now that I've written it out, I'm thinking: 6 implicit methods? C++ basically writes itself!
Also in practice, I find that I don't really touch copy/copy assign/move/move assign often. Most of the time the implicit ones are good enough. Thanks, Mr. Compiler!

### Derived Classes
Destructors are generally implemented with virtual because it ensures that the destructor of a derived class will be called.

Derived classes are just classes that inherit from the base class. Using the classic Animal example,
```cpp
// Base class Animal
class Animal {
public:
    Animal() {
      std::cout << "Constructing Animal\n";
    };
    // virtual ~Animal() {
    ~Animal() {
      std::cout << "Destructing Animal\n";
    };
};

// Derived class Dog
class Dog: public Animal {
public:
    Dog() {
      std::cout << "Constructing Dog\n";
    };
    ~Dog() {
        std::cout << "Destructing Dog\n";
    };
};

int main() {
    Animal* a = new Dog();
    delete a;
}
```
The output of this program will be:
```
Constructing Animal
Constructing Dog
Destructing Animal
```
The derived class is not destructed when deleting `a`.
If we qualify `Animal`'s destructor with the `virtual` keyword, then `Dog` will destruct before the `Animal` destructor is called.


### Multiple Inheritance
Derived classes can have multiple parents. The syntax is just to separate the base classes with commas.
The order in which the base classes appear dictate the order of the constructors.
```cpp
class Base1 { }
class Base2 { }
class Derived : public Base1, public Base2 { }
```

The derived class inherits the Base classes' public members.
```cpp
// Base class Animal
class Animal {
public:
    void makeSound() {
        std::cout << "I am an animal\n";
    }
};
class FourLeggedCreature {
public:
    // void makeSound() {
    //   std::cout << "I have four legs\n";
    // }
};
// Derived class Dog
class Dog: public FourLeggedCreature, public Animal {
public:
    void makeSounds() {
        this->makeSound();
    }
};

int main() {
    Dog d;
    d.makeSounds();  // "I am an animal"
}
```
In this example, it's very easy to see the output of the program when `d.makeSounds()` is called, because there's only one definition of `makeSound()`.

What if `FourLeggedCreature` also had a `makeSound()` method? More generically, what happens when there's a method name clash in the base classes?

If you have the exact code above and uncomment `FourLeggedCreature::makeSound()`, the program won't compile with error:
```
error: member 'makeSound' found in multiple base classes of different types
```

However, if you take out the last line `d.makeSounds();`, the program will compile with the duplicate method name, since nothing is using it.

Calling `makeSound()` in both base classes is possible, but I don't think it's very pretty. Honestly if you really want to do that, I would rethink the inheritance structure or rename the functions first. If you really can't, then the solution I would take is to wrap `makeSound()` in forwarding functions for each base class that implements it, so that theres no ambiguity.

### Friends
Every C++ professor I've come across has made the inappropriate joke at least once - that friends have access to each other's privates.

```cpp
class A {
public:
    int x;
protected:
    int y;
private:
    int z;

friend class B;
};

class B {
    B(const A& a) {
        std::cout << a.x << " " << a.y << " " << a.z;
    }
}
```
In this case, because `B` is declared a friend of `A`, it's possible to access both private and protected members of `A`.

I actually don't think I know any more about friend classes other than this...

In practice, the most common use case for me is for unit tests: to declare my mock classes/gtest classes as a friend.