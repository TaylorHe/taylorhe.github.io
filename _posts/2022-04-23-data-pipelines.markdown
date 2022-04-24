---
layout: post
title:  Data Pipelines
date:   2022-04-23 03:00:00 -0500
excerpt: "What does reducing a map mean?"
tags: Flume
---

# Data Pipelines
### What is MapReduce?

Instead of a big chonk machine doing all the work of a 25 year old's horribly written spaghetti, MapReduce splits up the work so that even the smol fries (less powerful CPUs) can do something. It's kind of like a Senior Engineer scoping and breaking up work into Jira stories. In the end, the output is combined to form a some feature or deliverable. 

In a true lecture on MapReduce, there's a "shuffle" somewhere too, but I'm just going to ignore that. As to how it works programmatically... there's some coordinator and magic.

### Stretching the comparison
Following the above example, a senior engineer breaks down a Jira epic into stories. But an epic is also just a piece of the team's bigger, more complex goal. Similarly, one instance of MapReduce-ing a dataset will not accomplish a data pipeline's larger goal. There are likely many datasets that have to be MapReduced, probably dependencies between them, and many other complexities that engineers love (or hate) thinking about.

### Many MapReduces
So let's just go one level up then. Now we have many epics, with many junior engineers working on a piece one epic, and each epic has a certain set of dependencies on other epics. For example and for obvious reasons, Epic #420 cannot start without Epic #69 and Epic #350 being complete. 

The geek who is reading this will probably think "Aha! A dependency graph!" Well, you're right. We can model epics in a dependency graph. What do you want, a cookie?
![cookie](/assets/img/cookie.jpeg)

## What does this have to do with Data Pipelines?

### Google's Flume Library
Not to be confused with Apache Flume, Google's (proprietary) Flume library is a pretty neat way to define these dependencies. The user starts with defining the data-parallel operations (epics), and programmatically links the outputs with the inputs of other operations (defining dependencies). Under the hood, Flume will build a dependency graph of inputs -> outputs for each "epic". 

Within each epic, it can also coordinate the actual work in the operation (a jira story) across many machines - the MapReduce part.

With this massively abstracted library, one can write pretty simple, elegant, procedural code. For example you can probably write the following in C++/Java syntax without much change, and have Flume just do it for you.

```Java
PCollection<OutputType> outputA = readDatabase(table A)
PCollection<OutputType> outputB = readDatabase(table B)
PCollection<OutputType> outputC = readDatabase(table C)
PCollection<OutputType> outputD = expensiveOperation(A, B)
PCollection<OutputType> outputE = expensiveOperation(B, C)
PCollection<OutputType> outputF = expensiveOperation(D, E)
writeToDatabase(F)  // Also very expensive call
```

Flume will generate a graph that looks like

![graph](/assets/img/graph.png)

PCollection is just the wrapper type used for Flume so it can generate graphs and defer execution.

With this graph, we can pretty easily parallelize see the nodes with no dependencies and run our compute resources on them. 

### Some things and notes

* If you might have noticed, the code as listed above does not actually immediately perform the work. `readDatabase()` will not actually read the database just yet - Flume will defer the execution until it generates the graph. When the graph is generated from the programmer's shit code, it can perform optimizations on the whole graph, like fusing operations together that are able to belong together.

* The final, terminal step in the process is called a `Sink`. This operation usually is one of persisting data to a database, a text file, a log file, or some other data container.

# Tuning Database Writes - A Story
Without tuning, performance of MapReduce jobs can be really slow. While sometimes you just can't speed up an expensive CPU operation, there are certain adjustments you can make to databases, as writes can be bottlenecking.

In a real example of a project I'm working on, I have to process and persist more than 30 billion mutations to a database on the first run - more than 10TB of total data. This data pipeline will run every day.

For the first run, I took a naive approach of "just write to the db like normal human being" - that is, group the mutations in a single mutation pool, and do the write-to-db API call. Unsurprisingly, the job stalled. Even with over 4000 threads of parallelism, it spent 19 hours to barely write 9-10% of the mutations. As it was supposed to run regularly, this was unacceptable.

I slowly rip my hair out in frustration for this terrible failure, but there's no time to wallow. A solution must be found.

"OK Taylor", I calm myself down to think...

### Speed Limit: 1,000,000
For the next genius Taylor idea (sarcasm), I tune the sink throttler up to a whopping 1 million commits per second in a single mutation pool, effectively hosing my own team's database. I hope it's not perceived as a DOS attack.

But... as expected, very quickly my team's oncall gets paged for my insane resource usage, way above production quota. No complaints from any users though, whew.

Welp, a good attempt but no cigar.

### Dividing Up The Mutations

Because the naive database sink cannot specify groups of transactions, maybe I can split up these transactions into groups and separately write to the DB, kind of making my own parallelism. This proved hard to even think about, how do I sample my PCollection correctly? Is sampling costly? Should it be random?

One more thing to keep in mind is that the write cost to the database scales very roughly with the number of RPCs made. Every time a database transaction occurs, there is a high cost associated. It's probably because the atomicity of a transaction requires locking, writing, and other network latency for persisting under the hood.

### Sharding and Grouping

How can we do better than just randomly sampling and writing? Time to get my thinking cap on. I put on my Noogler hat and then another hat on top of that. Two thinking caps, now we're talking - they should do the trick. I furrow my brow, curl my toes, and bite my life - a classic thinking position. "What's something we know about databases?"

![nooglerhat](/assets/img/noogler-hat.jpeg)

Well, databases are typically sharded, and after some research I find out that this one in particular is sharded by rows. For each shard of data - just a group of rows - there is a Split Point where the one shard ends and another begins.

We can query for the these Split Points in the table, and then work backwards to effectively range shard the mutations into their own mutation pools. The approach is similar to dividing up the mutations, but in a much smarter, locality-aware way. In this approach, mutations on the same shard will persist faster, and therefore theoretically speed up writes.

But there are more unknowns: 

* Should each shard get its own mutation pool? 
* How big should a mutation pool be? 
* How many pools should there be?

It's important to group related mutations together efficiently so that we don't spam RPCs, but we cannot just group a giant batch of mutations; there are tradeoffs and issues in the grouping process. 

The number of mutations should be large enough that writing to database is efficient, and we don't have millions of transactions. As noted previously, the more transactions you have, the more costly the whole operation will be.
On the other hand, we can't make each transaction so large that the data is split across so many shards that it runs into long-tail issues - a problem where some shards have stragglers that take a long time to be persisted. How can we find the right balance?

#### Liquid Sharding
The Taylor definition of liquid sharding means "if slow, throw more parallelism at it".

More formally, it's dynamic runtime optimization that allows Flume to minimize the above mentioned stragglers by splitting them into pieces that can be processed in parallel. It continually divids tasks and lets the system rebalance its again workload and increase parallelism. 

This runtime optimization will help in batch mutations for sure, or so I thought.  Fortunately for us, liquid sharding is built-in with Flume and we should get it for free. Unfortunately for us, there are a number of prerequisites to liquid sharding and the db sink I'm using does not meet all of them :(


## At the end of the day, the sharding concept worked. 
I don't have exact performance estimates of one to another, but with no liquid sharding and assuming the slow mutation pool scales linearly:

* The naive method took about 200 hours for just the database sink
* The group-by-split-point method took about 12 hours, of which also includes the work for pre-write computations.

An order of magnitude faster! Nice.


### For the lols, and credits.
Obviously, a lot of the writing/storytelling is just for the memes. While the core technical ideas are correct, I did not one day think "1 million commits!" single handedly and then fix an issue. Thankfully I had an amazingly competent TL and team to help me along the way.







