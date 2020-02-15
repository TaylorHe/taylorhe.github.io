---
layout: post
title:  "Python's Walrus Operator"
date:   2019-12-23 03:00:00 -0500
excerpt: <img src="assets/img/walrus.jpg" />
---

Python 3.8 introduced a nice quality of life assignment expression denoted by ":=".  It's also called the walrus operator because it looks like the eyes and tusks of a walrus on its side. It allows the writer to assign and return a variable in a single expression, which reduces the amount of code you actually have to write to do something. It's much easier to see it in use. Let's check out some examples!

When a calculated value is part of a conditional, it can be shortened inline with the conditional. 
{% highlight python %}
# No walrus
value = foo()
if value is not None:
    bar(value)

# Walrus operator
if (value := foo()) is not None:
    bar(value)
{% endhighlight %}
You make your code for reading a file more concise as well.
{% highlight python %}
# No walrus
block = file.readline()
while block is not None:
    process(block)
    block = file.readline()

# Walrus operator
if (block := file.readline() is not None:
    process(block)
{% endhighlight %}
And finally, it can make expressions in list comprehension more efficient.
{% highlight python %}
# No walrus makes this list comprehension perform expensive_operation twice!
values = [1, 2, 3, 4, 5, ... ]  // Some random list
[expensive_operation(v) for v in values if expensive_operation(v) > 0]

# Walrus operator caches the result for you and therefore only computes once
[result for v in values if (result := expensive_operation(v)) > 0]
{% endhighlight %}
This is actually a pretty controversial addition to Python, with critics arguing that assignment in the middle of an expression is ugly and complex, and now there's ambiguity in assignments. There are more points to be made in the argument linked above, but overall I think it helps simply my code a ton, and I think this optimization of writing one line instead of a few is really nice.
