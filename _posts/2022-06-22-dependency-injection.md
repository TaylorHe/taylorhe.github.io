---
layout: post
title:  Dependency Injection
date:   2022-06-22 03:00:00 -0500
excerpt: It's too confusing for me
tags: Java
---

## What in Tarnation
I'm too lazy to insert the dog meme with the weird hat captioned "what in tarnation", but you can imagine it here. The dog's expression will be the general mood of the post.

I've been struggling with a programming paradigm at work called dependency injection. It's a technique where something supplies the dependencies of another object.

## What is dependency injection trying to solve?
In Java (and probably in any OOP language), a class might depend on many other classes, which in turn depends on many other classes. This leads to a lot of testing headaches - creating mocks, tearing down mocks, and other potential code slowdowns.

Let's give an example:

### First Draft
Let's say you're writing a piece of Java code that requires some handling of an Object. It needs to perform some actions on properties of the object - like formatting the String description and doing something with the creation time. These actions are functions of different classes.

A first draft of code that uses this might look like this (I'll fix the syntax color highlighting later):

```java
public class Client {
    public void formatObject(Object object) {
        StringUtil stringUtil = new StringUtil();
        String text = stringUtil.format(object.getDescription());
        ...
        TimeUtil timeUtil = new TimeUtil();
        Time createdAt = timeUtil.parseTime(object.getCreationTime());
        ...
    } 
}
```

It's not very good. You're at the mercy of potentially creating (and destroying) many of the same classes throughout your code. Even worse, testing is difficult since you'd have to mock out every service and its methods.

### Second Draft
The common solution to this problem is using the factory paradigm. We take out the class creation into a factory class that handles that for us.

```java
import package.haha.fake.StringUtilFactory;
import package.haha.fake.TimeUtilFactory;

public class Client {
    public void formatObject(Object object) {
        StringUtil stringUtil = StringUtilFactory.get();
        String text = stringUtil.format(object.getDescription());
        ...
        TimeUtil timeUtil = TimeUtilFactory.get();
        Time createdAt = timeUtil.parseTime(object.getCreationTime());
        ...
    } 
}
```

Now, the hard dependency is one layer of abstraction away. It kind of helps because you can now enforce singleton patterns with the Factory so there's no excess construction cost, but not much else. The dependency, although abstracted away in the Factory layer, is still indirectly a dependency.

Also - I'm can't find any articles about this - but in my opinion this pattern leads to VERY verbose code. For every class, you need to write a factory, and for every one of those, there's boilerplate. This leads to lengthy code reviews, more code means more potential for error, and potentially slower development because you have to wade through all the nonsense to find actual code. Reading Java becomes a nightmare.


### Third Draft
A simple dependency injection takes this issue and kind of moves it to the class constructor. Instead of creating or getting dependencies when your code needs them, they are just passed in in the constructor (or method).

```java
public class Client {
    private final StringUtil stringUtil;
    private final TimeUtil timeUtil;
    
    public Client(StringUtil stringUtil, TimeUtil timeUtil) {
        this.stringUtil = stringUtil;
        this.timeUtil = timeUtil;
    }
    public void formatObject(Object object) {
        String text = this.stringUtil.format(object.getDescription());
        ...
        Time createdAt = this.timeUtil.parseTime(object.getCreationTime());
        ...
    }
}

public class ClientFactory {
    public static ClientFactory get() {
        StringUtil stringUtil = StringUtilFactory.get();
        TimeUtil timeUtil = TimeUtilFactory.get();
        return new Client(stringUtil, timeUtil);
    }
}
```

With this, you've made it easier to find your dependencies in your code. Class `Client` depends on `StringUtil` and `TimeUtil`, and it's very easy to see in the constructor.

However, now you have another issue: you have to write yet another factory class to wrap the creation of this class.

Ick, even more boilerplate!

The good part is that now our `Client` depends on very little, only the interfaces are needed, but the fundamental problem still exists: the code still depends on these Factory classes and we've only just shifted the dependencies down in the chain.

### Fourth and final form: Guice
[Guice](https://github.com/google/guice) replaces Factories and their dependencies with things called Injectors and Modules. The code in `ClientFactory` above is implicitly handled for you. In Guice, the big difference is that you are no longer writing the imperative code you're used to seeing - you're writing Modules that will be installed by other classes that use your code. 

This post doesn't cover everything about Guice, like bind(), because I don't know how they're used. I'm writing this as a basic user of Guice, who just uses the simple module + injector pattern.

An example of Guice usage: define the module's dependencies, and inject specific dependencies into each class with the `@Inject` keyword.
```java

public static void configure() {
    Guice.createInjector(
        new ModuleA(),  // Installs class A defined elsewhere
        new ModuleB(),  // Installs class B defined elsewhere
        new ModuleC())  // Installs class C defined elsewhere
    .inject(this);
}

public final class FooUtil {
    private final static A a;
    private final static B b;

    @Inject
    FooUtil(A a, B b) {
        this.a = a;
        this.b = b;
    }
}

public final class BarUtil {
    private final static B b;
    private final static C c;

    @Inject
    FooUtil(B b, C c) {
        this.b = b;
        this.c = c;
    }
}

public final class BazUtil {
    private final static BarUtil barUtil;
    private final static C c;

    @Inject
    FooUtil(BarUtil barUtil, C c) {
        this.barUtil = barUtil;
        this.c = c;
    }
}
```

In `BazUtil`, we now have access to `BarUtil`. It was very confusing to me how this was the case - neither of the classes were explicitly instantiated, but somehow I was able to use it.

During testing, the same modules can be installed to replicate the utility's behavior.

### How do you export a class as a module?
Honestly, I don't know.


## What is so difficult about it?
Abstraction, in general, makes it easier for a programmer to express their intended actions. No inner-working shenanigans, just a simple interface.

Abstraction, in practice, makes it harder for a programmer (might just be me) to really understand what's going on. When something is *too* easy, it makes it really difficult to understand why and where things happen.

That's kind of what's happening with Guice here. It's hard for me, a developer not using dependency injection, to understand the progression of code - where code starts, where code comes from, and how things just appear. I guess that's the nature of every moderately complex framework, though.

In the examples above, I focused on constructor initialization, but I think method parameters can also be injected.


After I finished writing this, I think I have a better understanding already. In the moment, it's tough to transition from a certain type of coding to another.




