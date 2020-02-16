---
layout: post
title:  Invalid Transactions
date:   2020-02-15 03:00:00 -0500
excerpt: That expense is looking sus.
---
Today we're gonna attempt to solve the leetcode question [Invalid Transactions #1169](https://leetcode.com/problems/invalid-transactions). I haven't seen this questions before, so hopefully I don't get stuck for too long.

Take a moment to read the question.

Done? Cool, let's get to it.

### Setup and First Rule

This isn't too complicated to understand. For some list of transactions, we need to apply some kind of validation on a single transaction and pairs of transactions.

First things first - the parse the data into a usable format.

Right now we're given a list of strings, and that's not very friendly. Python's got structured binding and a handy `split` function.

It's also very easy to find the if a transaction breaks the first rule by checking the amount.

{% highlight python %}
class Solution:
    def invalidTransactions(self, transactions: List[str]) -> List[str]:
        possibly_invalid = set()
        for t in transactions:
            [name, minutes, amt, city] = t.split(",")
            if amt > 1000:
                possibly_invalid.add(t)
                continue
{% endhighlight %}

Hmm, I guess we don't need all the variables for the first rule. We can probably just get away with
```python
amt = t.split[2]
```
Great, we have the first rule finished, rather trivial so far.

### Pairs of Transactions
Things get a little interesting here.
Let's try to brute force it: for every transaction, we compare it against every other transaction.
```python
class Solution:
    def invalidTransactions(self, transactions: List[str]) -> List[str]:
        possibly_invalid = set()
        
        for t1 in transactions:
            [name, minutes, amt, city] = t1.split(",")

            # First rule
            if int(amt) > 1000:
                possibly_invalid.add(t1)
                continue

            # Brute force second rule
            for t2 in transactions:
                if t1 == t2:
                    continue
                [name2, minutes2, amt2, city2] = t2.split(",")
                if ((name == name2)
                    and (city != city2)
                    and abs(int(minutes) - int(minutes2)) <= 60):
                    possibly_invalid.add(t1)
                    possibly_invalid.add(t2)

        return list(possibly_invalid)
```
Brute force solution yields horrible results.
```
Runtime: 1144 ms, faster than 7.58% of Python3 online submissions for Invalid Transactions.
Memory Usage: 12.8 MB, less than 100.00% of Python3 online submissions for Invalid Transactions.
```
However, we can prune this brute force. When a transaction is added to the `possibly_invalid` set, we already know it's invalid, so there's not reason to check again.
```python
class Solution:
    def invalidTransactions(self, transactions: List[str]) -> List[str]:
        possibly_invalid = set()
        
        for t1 in transactions:
            # Skip if we already know invalid
            if t1 in possibly_invalid:
                continue
            [name, minutes, amt, city] = t1.split(",")

            # First rule
            if int(amt) > 1000:
                possibly_invalid.add(t1)
                continue

            # Brute force second rule
            for t2 in transactions:
                if t1 == t2:
                    continue
                [name2, minutes2, amt2, city2] = t2.split(",")
                if ((name == name2)
                    and (city != city2)
                    and abs(int(minutes) - int(minutes2)) <= 60):
                    possibly_invalid.add(t1)
                    possibly_invalid.add(t2)

        return list(possibly_invalid)
```
The single check improves performance roughly five-fold. It's still O(n<sup>2</sup>), though.

```
Runtime: 256 ms, faster than 34.32% of Python3 online submissions for Invalid Transactions.
Memory Usage: 12.9 MB, less than 100.00% of Python3 online submissions for Invalid Transactions.
```

I'm still not satisfied with a brute force solution.

### A Sliding Window

I don't think there's much more pruning that can happen in brute force to try to speed it up. Maybe some minor things here and there, but I think in order to really make it faster, we require a better solution.

My first thought is to optimize by the minutes parameter. If there's some way to implement a sliding window of time, we can easily detect possibly invalid transactions just by the time.
However, we need to organize our data somehow to support this.

To make it simpler, I'm thinking we can pre-process the transactions into a better format, probably group transactions by name. `defaultdict` comes in handy.
By grouping by name, we can take away a dimension and compare fewer items per loop.

Even better, we might want to sort each of those grouped transactions by time so we can iterate straight through instead of searching through the entire list for every transaction.

```python
from collections import defaultdict

class Solution:
    def invalidTransactions(self, transactions: List[str]) -> List[str]:
        # Populate { name : [ [name, minutes, amt, city], ... ] }
        name_map = defaultdict(list)
        for t in transactions:
            parsed_t = t.split(",")
            name_map[parsed_t[0]].append(parsed_t)

        possibly_invalid = set()

        for name in name_map:
            parsed_t_list = name_map[name]
            # Rule 1: amt > 1000
            for t in parsed_t_list:
                if int(t[2]) > 1000:
                    possibly_invalid.add(",".join(t))

            # Sort by time. Takes O(n log n) time
            parsed_t_list.sort(key = lambda tx: int(tx[1]))

            # Rule 2:   name is already the same,
            #           slide the minutes window
            #           check city
            window = [parsed_t_list[0]]
            for t in parsed_t_list[1:]:
                # if the window exists
                # and the next transaction's time > the first time
                while window and (int(t[1]) - 60) > int(window[0][1]):
                    # remove the earliest transaction
                    window.pop(0)
                # Add the current transaction
                window.append(t)
                for w_trans in window:
                    # if city is not the same, we have invalid
                    if t[3] != w_trans[3]:
                        possibly_invalid.add(",".join(t))
                        possibly_invalid.add(",".join(w_trans))

        return list(possibly_invalid)
```

We can check the runtimes and see that it's a big improvement.
While it's not the fastest, it sure is an an order of magnitude of improvement over the original brute force, easily over 10x as fast.

I'm trying to find the asymptotic complexity of this, and I think it's actually O(n log n). There are nested for loops, but actually only loop over the entire transaction list at worst case.
The sorting takes O(n log n) time because it sorts subarrays divided by unique name, which bumps up the time complexity.

```
Runtime: 76 ms, faster than 85.89% of Python3 online submissions for Invalid Transactions.
Memory Usage: 13.3 MB, less than 100.00% of Python3 online submissions for Invalid Transactions.
```

Maybe there's another way I missed. I can't seem to get to the 99th percentile on this one.
