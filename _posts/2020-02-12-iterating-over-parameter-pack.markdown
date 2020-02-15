---
layout: post
title:  Iterating over a Parameter Pack
date:   2020-02-12 03:00:00 -0500
excerpt: Dear C++ people, Make it easier please. Sincerely, me
---
Occasionally at work, I find myself wanting to use a variadic template to do some operation. Unfortunately, I only have access to C++14 features.

Supposed we want to push some info to a `std::ostringstream` with some comma separated delimiter.

Let's examine a case using variadic templates in C++14.

### Option 1: The brain dead recursive approach.
{% highlight cpp %}
template <typename T>
void getDelimitedKey(std::ostringstream& oss, T&& first) {
   oss << std::forward<T>(first);
}

template <typename T, typename U>
void getDelimitedKey(std::ostringstream& oss, T&& first, U&&... rest) {
    oss << std::forward<T>(first) << ',';
    getDelimitedKey(oss, rest...);
}
{% endhighlight %}

Pretty straightforward, right? Variadic templating and perfect forwarding packaged in a nice recursive solution. The only problem is that we need two functions - one for a base case - to perform one task. That doesn't make much sense to me. Let's try something else.

### Option 2: The Expander trick
{% highlight cpp %}
template <typename T, typename... U>
void getDelimitedKey(std::ostringstream& oss, T&& first, U&&... rest) {
    oss << std::forward<T>(first);
    using expander = int[];
    (void) expander {0, (oss << ',' << std::forward<U>(rest), 0)...};
}
{% endhighlight %}

If you're thinking to yourself "well that looks terrible", I would agree. It's not two functions like above, but rather one completely unreadable function.


To understand this expander trick, we must understand how `braced-init-list`s are leveraged. Pack expansion is able to occur in one of these braced-init-lists, so we can put a parameter pack inside a dummy array which is initialized in a braced-init-list.

 - The first `0` after the expander is a dummy element; the braced-init-list requires at least one element, guarantees that if the parameter pack is empty, the braced init list is not illegal.
 - The operation `<<`  inside the parens is the actual work, streaming in data to `oss` with perfect forwarding.
 - The second `0` is the return value.
 - The ellipsis `...` at the end is the parameter expansion.
 - The `void` cast in the beginning is to suppress a warning caused by an unused dummy int array.

Horrendous right? I guess some may call it clever.


### Fold Expressions in C++17

{% highlight cpp %}
template <typename T, typename... U>
void getDelimitedKey(std::ostringstream& oss, T&& first, U&&... rest) {
    oss << first;
    ((oss << ',' << std::forward<U>(rest)), ...);
}
{% endhighlight %}

Finally, something useful! This code is very readable: we can obviously see the parameter pack expansion, the logic it's performing inside the parens is very clear, and it only takes two lines, not two functions.

If you're being technical on me, you might notice and say wait, the title said *iterating* over a parameter pack, and this is not iteration! A fold expression is very obviously a *functional* programming concept.

Well, I don't have a good answer to that. I just thought that iterating sounded better.

Anyway, let's define a fold expression. I've always remembered what a fold expression is because it's pretty intuitive from the name. It "folds", or maybe "reduces" is the better word, a parameter pack into one item given some kind of operator.

In this case, we've defined the operator as `<<` into the ostringstream. The fold expression can be expanded, defined in the comment in the code below:

{% highlight cpp %}
template <typename T, typename... U>
void getDelimitedKey(std::ostringstream& oss, T&& first, U&&... rest) {
    oss << first;
    ((oss << ',' << std::forward<U>(rest)), ...);
    // ((((oss << ',' << 1), (oss << ',' << 2)), (oss << ',' << 3)), (oss << ',' << 4))
}

int main() {
    std::ostringstream oss;
    getDelimitedKey(oss, 1, 2, 3, 4);
    std::cout << oss.str(); // prints "1,2,3,4"
}
{% endhighlight %}


Whoa there, that's a lot of parentheses. No need to be scared of them, they just execute from left to right. This kind of fold expression is called a unary right fold. The name is pretty good at describing the concept: it's unary because there's only one operand per operation, which is the argument to be added to the ostringstream; it's right because, well, the ellipses are on the right side; and finally a fold - just means to reduce.


Not too bad right. You might be asking: if there's such thing as a unary right fold, is there such thing as a unary left fold? Well of course there is, just to complicate your life (just kidding, they are kind of different). Let's check out a similar example with a left fold. This time, see how the fold expands differently:

{% highlight cpp %}
template <typename T, typename... U>
void getDelimitedKey(std::ostringstream& oss, T&& first, U&&... rest) {
    oss << first;
    (..., (oss << ',' << std::forward<U>(rest)));
    // ((oss << ',' << 1), ((oss << ',' << 2), ((oss << ',' << 3), (oss << ',' << 4))))
}

int main() {
    std::ostringstream oss;
    getDelimitedKey(oss, 1, 2, 3, 4);
    std::cout << oss.str(); // prints "1,2,3,4"
}
{% endhighlight %}


Notice how the parentheses are grouped differently, but it does not matter. The order of execution is equivalent: left to right, due to the [comma operator](http://eel.is/c++draft/expr.comma#1.sentence-2). The comma operator states that a pair of expressions separated by a comma is evaluated left to right - but this definition is not really useful to me.

What I interpret and draw from this is that comma separated unary expressions always evaluate left to right, regardless of parentheses.

Let's take the differing expanded fold expression for an example - where you have two expressions of the form `((X, Y), Z)` and `(X, (Y, Z))`.


`((X, Y), Z)` evaluates like so, in this order: First evaluate `(X then Y) then Z`.

`(X, (Y, Z))` evaluates like so, in this order: First evaluate `X then (Y then Z)`.


The takeaway here is that the items in the parentheses are called in order, but they don't have to be called first, similar to a math problem.

`f() * (g() + h())`


There's no requirement to evaluate at `g() + h()` first. Order of operations tells us that it is fine to evaluate left to right in this case. `f()` is evaluated first, then `(g() + h())`.

<hr /> <br />

### Unpacking values with auto:
Since it won't be enough to be a whole post, I'll point it out here.

There have been many times where I find a value from an `std::unordered_map` and I need to unpack the iterator.


#### First and Second
{% highlight cpp %}
std::unordered_map<int, std::string> myMap;
...
const auto& itr = myMap.find(3);
std::cout << itr.first << ": " << itr.second;
{% endhighlight %}

I don't like this, since its ambiguous what `.first` and `.second` actually mean. The developer would have to reference the declaration of the map in order to figure out. Even then, you might want to assign it to some variable, which brings extra verbosity.

What would be much more clear is some kind of one-liner structured binding like python and javascript has.

#### Structured Binding
{% highlight cpp %}
std::unordered_map<int, std::string> myMap;
...
const auto& [id, code] = myMap.find(3);
std::cout << id << ": " << code << std::endl;
{% endhighlight %}

Would you look at that, C++17 has structured bindings like other high level languages. This makes it much more clear and readable. Please give me C++17.