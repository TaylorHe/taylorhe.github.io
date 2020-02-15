---
layout: post
title:  Number of Islands
date:   2020-01-31 03:00:00 -0500
excerpt: Leetcode runtime doesn't matter and isn't accurate anyway, so shut up - everyone, probably
---
After a conversation with a few friends, I realized that I suck at interview problems. I may have prepared for them at one point, but remembering and keeping that algorithmic skill sharp takes time and effort. I think I'll try to keep my skills sharp by doing a problem once a week or so.


The algorithmic question brought up in the conversation, and what I'll be completing in this blog, is called [Number of Islands](https://leetcode.com/problems/number-of-islands/). The problem is as follows: Given a 2-dimensional grid of `1`s (land) and `0`s (water), count the number of islands. An island is surrounded by water and is formed by connect adjacent land cells horizontally or vertically.

<hr /> <br />

### The 75/60 Solution
Let's try an intuitive approach and iterate on it.

1. Well we have to start somewhere, and what better place than the top left? From grid item [0][0], we will traverse left to right and top to bottom, like reading a sentence.

2. From there, we try again to find adjacent `1`s in all four directions - except we don't want to go back to the one we started with. Okay, that should be easy to account for: when we come across the 1s, mark them somehow so we don't "use" them again. We can mark them as `2`. The recursion is done when all paths are surrounded by water `0`s or marked land cell `2`s. Finally, we add one to a `num_islands` counter.

3. After the recursion is done, go back to the initial `1` cell, and keep traversing to find another unmarked `1`. If the `1` is marked, we know that it's part of another island, so we skip it. If we stumble across and unmarked `1`, repeat step 2.

4. When we reach the bottom right of the grid, we're done. Return the `num_islands` counter.



#### Analysis
Taking a step back, I realized that I've just done a simple depth first search.

What is the time complexity of this? If there are n rows and m columns, it's O(nm) time.

The space complexity is interesting. Technically the solution uses constant space, but that's only because I assumed we could modify the input grid. If we're not allowed to change the grid - we have to keep track of a separate marking grid, making the solution O(nm) space.

If you wanted to optimize for space complexity, then my `2` marking is useful here. Just change all the `2`s back to `1`s. This is better than most of the solutions on the leetcode discussion tab, where they change the `1`s to `0`s, thereby making it impossible to recover the original grid.

Here is my solution in Python 3.

{% highlight python %}
class Solution:
    def numIslands(self, grid: List[List[str]]) -> int:
        num_islands = 0
        for i in range(len(grid)):
            for j in range(len(grid[i])):
                if grid[i][j] == '1':
                    num_islands += 1
                    self.dfs(grid, i, j)
        return num_islands

    def dfs(self, grid: List[List[str]], i: int, j: int) -> None:
        # Check bounds
        if i < 0  or i >= len(grid) or j < 0 or j >= len(grid[i]):
            return
        # Check unmarked land
        if grid[i][j] != '1':
            return
        grid[i][j] = '2'

        self.dfs(grid, i-1, j)
        self.dfs(grid, i+1, j)
        self.dfs(grid, i, j-1)
        self.dfs(grid, i, j+1)
{% endhighlight %}

The leetcode statistics are interesting. While there is always variation in runtime due to server load, our runtime comes out to somewhere between 137ms - 150ms, putting our solution in only the ~60th-75th percentile in terms of runtime. The memory usage is also not very good, at 13.7-13.9MB, it puts the solution at about the 60th percentile. Horrible, and it deserves the name the 75/60 solution, giving us mediocre 75th percentile runtime results and less than great 60th percentile memory usage at 13.9MB.
```
Runtime: 144 ms, faster than 73.02% of Python3 online submissions for Number of Islands.
Memory Usage: 13.7 MB, less than 79.49% of Python3 online submissions for Number of Islands.
```
But who cares about memory - just download more RAM. I am on a quest to be top 1% of run time!

<hr /> <br />

### BFS

The cousin to depth first search is breadth first search, which is the next solution we should try before attempting a completely different one.

BFS requires some modification. This time we're gonna try something different - we're gonna first get all land cells and let BFS find the islands for us.

Let's think through the algorithm

1. We need some structure to store the locations of all the land cells

2. For each land cell, we have to remove the adjacent land cells

3. We iterate through the some structure to do this, and evict land cells while we iterate.

    What kind of structure should this be? Well, it should have constant time lookup and eviction, so the obvious choice here is a set.

4. When iterating through the set, we have to choose one cell and branch out into all the other connecting pieces. When coming across a land cell, evict it from the set. After we've exhausted that search, only then can we continue to the next item in the set until there are no more items.

{% highlight python %}
class Solution:
    def numIslands(self, grid: List[List[str]]) -> int:
        land_cells = set()
        for i in range(len(grid)):
            for j in range(len(grid[i])):
                if grid[i][j] == '1':
                    land_cells.add((i, j))

        return self.bfs(land_cells)

    def bfs(self, land_cells):
        num_islands = 0
        # While there are still land cells in the set
        while land_cells:
            # Take one, remove itself
            current = [land_cells.pop()]
            # Then remove all its neighbors and their neighbors
            while True:
                for (row, col) in current:
                    if (row - 1, col) in land_cells:
                        land_cells.remove((row - 1, col))
                        current.append((row - 1, col))
                    if (row + 1, col) in land_cells:
                        land_cells.remove((row + 1, col))
                        current.append((row + 1, col))
                    if (row, col - 1) in land_cells:
                        land_cells.remove((row, col - 1))
                        current.append((row, col - 1))
                    if (row, col + 1) in land_cells:
                        land_cells.remove((row, col + 1))
                        current.append((row, col + 1))
                # Keep going until there are no more land cells
                # for that island
                if not current:
                    break
                # Repeat
                current = []
            # After the inner while is complete, one island is
            # fully accounted for
            num_islands += 1
        return num_islands
{% endhighlight %}

BFS was a little more unintuitive than DFS. The code is a little messier and more difficult to read. Nevertheless, this was an insane performance boost.

Anywhere from 116-128ms of runtime, putting us at 95th to 99.91st percentile, with absolutely horrendous memory usage at the 5th percentile. The average is about 120ms at 99.37th percentile. I put the best runtime I got to flex a little.

```
Runtime: 116 ms, faster than 99.85% of Python3 online submissions for Number of Islands.
Memory Usage: 17.7 MB, less than 5.98% of Python3 online submissions for Number of Islands.
```