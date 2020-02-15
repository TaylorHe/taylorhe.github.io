---
layout: post
title:  "Perfect Forwarding"
date:   2019-12-21 03:00:00 -0500
<!-- categories:  -->
excerpt: No copying allowed, unless it's allowed.
---
In over-simplified terms, perfect forwarding is a function that forwards its parameters to another function without losing the parameter's qualifiers. It moves the parameters from one function to another, as if the first function does not exist. This is used in templated functions to preserve move semantics, avoid unnecessary copies, and avoid having to write multiple overloaded functions. It becomes more clear in an example.

Take a templated function insert, which is a wrapper around the emplace function of an `std::unordered_map` called `myMap`:

{% highlight c++ %}
std::unordered_map<std::string, int> myMap;

template <typename K, typename V>
void insert(K& key, V& value) {
    myMap.emplace(key, value);
}
int main() {
    std::string fries = "french fries";
    int numFries = 300;
    insert(fries, numFries);  // Success :)
    insert("hamburgers", 3);  // Fail :(
}
{% endhighlight %}
The function insert works when you pass in lvalues, but fails when you pass rvalues. A workaround could be writing another function with rvalue references:
{% highlight c++ %}
template <typename K, typename V>
void insert(K&& key, V&& value) {
    myMap.emplace(key, value);
}
int main() {
    insert("hamburgers", 3);  // Success :)
}
{% endhighlight %}
But now there are two functions that effectively do the same thing. You'll also need to write two more after that in case the key is an rvalue and the value is an lvalue, and vice versa. Perfect forwarding has the solution to this madness.
{% highlight c++ %}
template <typename K, typename V>
void insert(K&& key, V&& value) {
    myMap.emplace(std::forward<K>(key), std::forward<V>(value));
}
int main() {
    std::string fries = "french fries";
    std::string drink = "pepsi";
    int one = 1;
    int three = 3;
    insert(pepsi, one);               // Success :)
    insert(fries, std::move(three));  // Success :)
    insert("pizza", 1);               // Success :)   
}
{% endhighlight %}
There are two things to break down here: the concept of a universal reference and the std::forward function. The term universal reference was coined by Scott Meyers in his article, and it describes the concept of taking an rvalue reference to a cv-unqualified template parameter, which can then be deduced as either an l- or r-value reference. It's also known as a forwarding reference, which is its official name. Universal references are only defined when there's a cv-unqualified type, &&, and type deduction takes place.* (see 12/30 edit below for example). In the second and third code snippet, a casual reading of the code would lead the one to think that they are rvalue references, but since the type is deduced by the template and there is a &&, it's actually a universal reference. In practice, we almost never use universal references except in the context of templated functions.



To understand why universal references work the way they do, it's important to understand reference collapsing. When you are passing in a reference into the perfectly forwarded function, the call looks like this:
{% highlight c++ %}
template <typename K, typename V>
void insert(K&& key, V&& value) {
    myMap.emplace(std::forward<K>(key), std::forward<V>(value));
}
int main() {
    std::string foo = "foo";
    insert(foo, 3);
}
{% endhighlight %}
The call is instantiated with types:
{% highlight c++ %}
insert(std::string& &&, int&& &&);
{% endhighlight %}
Wait, a reference to a reference? That's not right...
The `& &&` is technically invalid.
The source code however, makes perfect sense.
To account for this, C++11 and above use a reference collapsing technique when 
ref to ref comes up in template instantiation. The collapsing rules are as follows:

- & and & collapse to &
- & and && collapse to &
- && and & collapse to &
- && and && collapse to &&  => only rvalue

Therefore, C++ deduces the call to type
{% highlight c++ %}
insert(std::string&, int&&)
{% endhighlight %}
I can't explain it any more clearly than Scott Meyers does: Reference collapsing is the mechanism that leads to universal references (which are really just rvalue references in situations where reference-collapsing takes place) sometimes resolving to lvalue references and sometimes to rvalue references.



The final question is what does std::forward do? According to the C++ Reference, it returns "an rvalue reference to the argument if it is not an lvalue reference. If the argument is an lvalue reference, the function returns the argument without modifying its type." Basically, it's a helper function to allow perfect forwarding of arguments taken as rvalue references to deduced types, preserving any potential move semantics involved.



Amazing, right? Using all of universal references, reference collapsing, and std::forward, we can effectively write a single, powerful wrapper function that allows for both l- and r-value references, preserve move semantics and therefore avoid unnecessary copying. What would make this even more cool is to apply variadic templating to accept arbitrary number of arguments on top of perfect forwarding. However, like my evil college textbook, that will be an exercise left to the reader.



I know this isn't a comprehensive post yet, but I'll be adding more to it when I get the time. For now, I think it's a good introduction to the perfect forwarding problem and solution.



EDIT 12/30:

When using universal references in classes, this code is incorrect.
{% highlight c++ %}
#include <unordered_map>

template <typename K, typename V>
class Cache
{
  public:
    bool add(K&& key, V&& value);
  private:
    std::unordered_map<K, V> map;
};

template <typename K, typename V>
bool Cache<K, V>::add(K&& key, V&& value)
{
    return map.emplace(std::forward<K>(key),
                       std::forward<V>(value)).second;
}

int main() {
    Cache<std::string, int> cache;
    std::string food = "jello";
    cache.add("item", 1);
    // cache.add(food, 2);
}
{% endhighlight %}

On first glance, it looks right, right? This actually compiles, and it works! Well, except for the commented `add(lvalue, rvalue)` call, so I guess it doesn't work.



We've failed to recognize the difference between universal references and r-value references. Once we declare the Cache object, in this case with `Cache<std::string, int>`, the `K` and `V` types are already known to the compiler.



Let's go back to our definition of a forwarding/universal reference. Universal references are only defined when there's a cv-unqualified type, &&, and type deduction takes place. In this case, there's no longer any type deduction because we've already told the compiler the types `K` and `V`. This means that the `K&&` and `V&&` are r-value references!



In order to perfectly forward, we need to introduce another template. The below code correctly implements perfect forwarding of the `add()` function.

{% highlight c++ %}

#include <unordered_map>

template <typename K, typename V>
class Cache
{
  public:
    template<KEYTYPE, VALUETYPE>
    bool add(KEYTYPE&& key, VALUETYPE&& value);
  private:
    std::unordered_map<K, V> map;
};

template <typename K, typename V>
template <typename KEYTYPE, typename VALUETYPE>
bool Cache<K, V>::add(KEYTYPE&& key, VALUETYPE&& value)
{
    return map.emplace(std::forward<KEYTYPE>(key),
                       std::forward<VALUETYPE>(value)).second;
}

int main() {
    Cache<std::string, int> cache;
    int one = 1;
    cache.add("item", 1);
    cache.add("jello", one);  // Success
}
{% endhighlight %}

In this new version, the compiler does not know `KEYTYPE` or `VALUETYPE`, and therefore must employ type deduction, making this double reference a universal reference, thereby enabling perfect forwarding.