---
layout: post
title:  "Optional Chaining and Nullish Coalescing"
date:   2019-12-25 03:00:00 -0500
excerpt: You wanna read into it, but sometimes it's just not that deep.
tags: typescript
---
It's finally here, the day we've all been waiting for. Well, not exactly, as Typescript 3.7 was released November 5. It solves one of the most annoying issues of javascript: optional parameter chaining. There have been attempts at solving this problem in [lodash](https://lodash.com/), [idx](https://github.com/facebookincubator/idx) and other libraries, but it's great that typescript now supports this functionality natively.

### Issue
Let's first describe the issue of accessing a nested object property. For an example, let's take the decently nested object obj defined as follows:
{% highlight typescript %}
obj = {
    a: {
        b: {
            c: {
                d: "hello world",
                dEmpty: ""
            }
        }
    },
    e: {
        f: [{ g0: "nice" }]
    }
}
{% endhighlight %}

Any of the properties can be null or undefined, so how does one access property d? In pre-Typescript 3.7, it's common practice to short circuit the conditional like so:
{% highlight typescript %}
if (obj 
    && obj.a 
    && obj.a.b 
    && obj.a.b.c
    && obj.a.b.c.d) {
    console.log(obj.a.b.c.d);  // hello world safely accessed
}
{% endhighlight %}
I've even seen other monstrosities when arrays are mixed in:
{% highlight typescript %}
if (obj && obj.e && obj.e.f) {
    if (Array.isArray(obj.e.f) && obj.e.f.length > 0) {
        if (obj.e.f[0].g0) {
            console.log(obj.e.f[0].g0);  // => "nice"
        }
    }
}
{% endhighlight %}

### Optional Chaining
But those days are all over with Typescript 3.7's optional chaining. Basically what it allows you to do is stop running an expression if one of the previous arguments is null or undefined.

Now we can write the same expressions with the new syntax `?.` can the above code can be condensed to:
{% highlight typescript %}
// Same as checking if each parameter along the chain is either null or undefined
console.log(obj?.a?.b?.c?.d);    // => "hello world" safely accessed
console.log(obj?.a?.b?.c?.foo);  // => returns undefined, and does not throw
console.log(obj?.e?.f[0]?.g0) {  // Safe access or undefined
{% endhighlight %}
Nullish Coalescing
If we combine this new feature with yet another great Typescript 3.7 feature, nullish coalescing, denoted by a `??`, it can be a powerful tool. Null coalescing is to check if the expression given is null or undefined.
{% highlight typescript %}
undefined ?? "default"  // => "default"
null ?? "default"       // => "default"
"" ?? "default"         // => ""
{% endhighlight %}

It's slightly different than the OR symbol `||`, as that also checks if the expression is an empty string or 0. Combining them looks like this:
{% highlight typescript %}
console.log(obj?.a?.b?.c?.d ?? "default value");  // => "hello world"
console.log(obj?.a?.foo?.c?.d ?? "default value");  // => "default value"
console.log(obj?.a?.foo?.c?.dEmpty ?? "default value");  // => ""

console.log(obj?.e?.f[0]?.g0 ?? "default value");  // => "nice"
console.log(obj?.e?.f[42]?.g0 ?? "default value");  // => "default value"
{% endhighlight %}

I'm really excited to start putting optional chaining to use.