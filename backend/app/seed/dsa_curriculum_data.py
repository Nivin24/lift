"""
LIFT Curriculum Seed Data: Data Structures & Algorithms (DSA) Area
Scope: Only the Brocamp technical workouts (Week 1 and Week 2), inner topics of each, and DSA basics.
Exactly 14 structured topics:
1. 1. DSA Basics
2. 2. Week 1: Array
3. 3. Week 1: Linked List
4. 4. Week 1: String
5. 5. Week 1: Linear Search and Binary Search
6. 6. Week 1: Recursion
7. 7. Week 1: Applications
8. 8. Week 2: Basic Sorting Algorithms
9. 9. Week 2: Hash Table
10. 10. Week 2: Stacks and Queues
11. 11. Week 2: Trees and Binary Search Trees
12. 12. Week 2: Graphs and Traversals
13. 13. Week 2: Applications
14. 14. Practice Tracker
"""

DSA_TOPICS = [
    # -------------------------------------------------------------
    # 1. DSA Basics
    # -------------------------------------------------------------
    {
        "slug": "dsa-basics",
        "title": "1. DSA Basics",
        "summary": "Data structures & algorithms taxonomy, program memory organization (Stack, Heap, Code, Static), Python memory manager, reference counting, garbage collection, memory leaks, complexity analysis, and Big-O notation.",
        "difficulty": "BEGINNER",
        "learning_objective": "Master core computational theory, Python memory model, resource lifetime, and asymptotic Big-O runtime/space analysis.",
        "prerequisites": "Python Fundamentals",
        "expected_outcome": "Accurately compute time and space complexity of loops, recursion, and built-in operations, and debug memory issues.",
        "practice_requirement": "Analyze time and space complexity for 10 code algorithms and inspect memory allocation with tracemalloc and sys.getsizeof.",
        "machine_task_relevance": "Prevents algorithmic timeout (TLE) and memory exceeded (MLE) failures on automated code evaluation platforms.",
        "practical_task_relevance": "Fundamental to architecting high-throughput data processing services without lingering memory leaks.",
        "interview_relevance": "Universal first screening question in technical rounds: 'What is the time and space complexity of your solution?'",
        "subtopics": [
            "What is a data structure, why we need it",
            "What is an algorithm, characteristics (input, output, finiteness, definiteness, effectiveness)",
            "Abstract Data Type (ADT) vs data structure",
            "Classification: primitive vs non-primitive, linear vs non-linear, static vs dynamic",
            "Linear: array, linked list, stack, queue. Non-linear: tree, graph. Hash based: hash table",
            "Good algorithm: correctness, time efficiency, space efficiency",
            "Real-life applications of data structures",
            "Python built-in structures mapping (list, tuple, set, dict, deque, str)",
            "How program memory is organized (code, static/global, stack, heap)",
            "Static vs dynamic memory allocation",
            "Contiguous (array) vs non-contiguous (linked list) memory",
            "Stack memory: function calls, local variables, stack frames, stack overflow",
            "Heap memory: dynamic objects, lifetime",
            "Python memory management: private heap, everything is an object, references",
            "Reference counting and garbage collector (gc module), cyclic garbage collection",
            "Mutable vs immutable objects and memory effect, id()",
            "How list grows internally (dynamic array, over-allocation)",
            "sys.getsizeof() to inspect memory",
            "What is a memory leak",
            "Causes in Python: lingering references, global lists/dicts growing, circular references, unclosed files/resources, caches without limit",
            "Effect of memory leak on programs",
            "Detecting: tracemalloc, gc.get_objects, memory profiler, watching memory usage",
            "Preventing: with statement, weakref, clearing references, del, bounded caches",
            "Leak vs high memory usage vs stack overflow (difference)",
            "What is complexity analysis, why it matters",
            "Time complexity vs space complexity",
            "Auxiliary space vs total space",
            "Best case, average case, worst case",
            "Counting operations, analyzing single loop, nested loops, consecutive statements",
            "Logarithmic loops (i multiplied or divided by 2)",
            "Complexity of recursive functions, recursion call stack space",
            "Growth rate order: O(1), O(log n), O(n), O(n log n), O(n^2), O(2^n), O(n!)",
            "Amortized complexity (list append)",
            "Measuring runtime with time and timeit",
            "What is asymptotic analysis",
            "Big-O notation (upper bound, worst case)",
            "Big Omega (lower bound) and Big Theta (tight bound)",
            "Rules: drop constants, drop lower-order terms, different inputs use different variables",
            "Comparing growth of functions, examples",
            "Learn the complexity table of common operations of all data structures",
            "Python built-in operation costs: list append, pop(), pop(0), insert(0, x), x in list, list index, slicing, len",
            "Python built-in operation costs: dict get/set/delete, set add/in, deque append/appendleft/pop/popleft, string concat and join",
            "Algorithm complexity summary: linear search O(n), binary search O(log n), bubble/insertion/selection sort O(n^2)"
        ],
        "material": """# 1. DSA Basics

## 1. Concept: Data Structures & Algorithms
- **Data Structure**: A specialized format for organizing, processing, retrieving, and storing data in computer memory efficiently.
- **Algorithm**: A well-defined, step-by-step computational procedure that takes an input and produces an output in a finite number of steps.
- **Key Characteristics**: Input, Output, Definiteness (unambiguous steps), Finiteness (terminates), Effectiveness (feasible operations).
- **Abstract Data Type (ADT)**: Mathematical model of a data type defining behavior from user perspective (e.g., Stack: push, pop) independent of implementation (e.g., array vs linked list).

### Memory Organization
```text
+-----------------------+ High Memory
|      Stack Memory     | -> Function call frames, local primitives, return addresses (LIFO, fast, fixed size)
|           v           |
|                       |
|           ^           |
|      Heap Memory      | -> Dynamic objects, Python heap, object graphs, garbage collected
+-----------------------+
|  Static / Global Data | -> Module-level variables, constants
+-----------------------+
|    Code Segment       | -> Compiled bytecode / machine instructions (read-only)
+-----------------------+ Low Memory
```

### Python Memory Management & Leaks
- **Everything is an Object**: Variables in Python are pointers (references) stored in frames pointing to heap-allocated `PyObject` headers.
- **Reference Counting**: Incremented when assigned, decremented when reassigned/out of scope. Deallocated when `ref_count == 0`.
- **Cyclic Garbage Collector (`gc`)**: Detects unreachable reference cycles using tri-color generation heuristics (Gen 0, 1, 2).
- **Memory Leaks in Python**: Lingering global references, unclosed sockets/file handles, circular references holding `__del__`, and unbounded caches (`@lru_cache(maxsize=None)`).

---

## 2. Operations & Asymptotic Complexity Analysis
- **Big-O Notation ($O$)**: Upper bound describing worst-case scenario.
- **Big Omega ($\Omega$)**: Lower bound describing best-case scenario.
- **Big Theta ($\Theta$)**: Asymptotically tight bound (both upper and lower bound match).
- **Rules**:
  1. Drop constant coefficients: $O(3n) \to O(n)$
  2. Drop lower-order terms: $O(n^2 + 5n + 100) \to O(n^2)$
  3. Separate variables for separate inputs: $O(a + b)$ or $O(a \cdot b)$

### Complexity Reference Table
| Data Structure | Access | Search | Insert | Delete | Space |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Array / Python list** | $O(1)$ | $O(n)$ | $O(n)$, append $O(1)$ amortized | $O(n)$, pop() $O(1)$ | $O(n)$ |
| **Singly Linked List** | $O(n)$ | $O(n)$ | head $O(1)$, tail $O(1)$ w/ ptr | head $O(1)$, by value $O(n)$ | $O(n)$ |
| **Doubly Linked List** | $O(n)$ | $O(n)$ | head/tail $O(1)$ | node known $O(1)$, value $O(n)$ | $O(n)$ |
| **Stack** | $O(n)$ | $O(n)$ | push $O(1)$ | pop $O(1)$ | $O(n)$ |
| **Queue (deque)** | $O(n)$ | $O(n)$ | enqueue $O(1)$ | dequeue $O(1)$ | $O(n)$ |
| **Hash Table** | N/A | avg $O(1)$, worst $O(n)$ | avg $O(1)$, worst $O(n)$ | avg $O(1)$, worst $O(n)$ | $O(n)$ |
| **Binary Search Tree** | avg $O(\log n)$, worst $O(n)$ | avg $O(\log n)$, worst $O(n)$ | avg $O(\log n)$, worst $O(n)$ | avg $O(\log n)$, worst $O(n)$ | $O(n)$ |
| **Graph (Adj List)** | N/A | BFS/DFS $O(V + E)$ | add vertex $O(1)$, edge $O(1)$ | remove edge $O(E)$ | $O(V + E)$ |
| **Graph (Adj Matrix)** | edge $O(1)$ | BFS/DFS $O(V^2)$ | add edge $O(1)$ | remove edge $O(1)$ | $O(V^2)$ |

---

## 3. Sample Workouts

### Workout 1: Algorithmic Optimization (From $O(n^2)$ to $O(n)$)
```python
def has_pair_with_sum_naive(nums: list[int], target: int) -> bool:
    # O(n^2) nested loops
    n = len(nums)
    for i in range(n):
        for j in range(i + 1, n):
            if nums[i] + nums[j] == target:
                return True
    return False

def has_pair_with_sum_optimal(nums: list[int], target: int) -> bool:
    # O(n) using Hash Set lookup
    seen = set()
    for x in nums:
        if target - x in seen:
            return True
        seen.add(x)
    return False
```

### Workout 2: Memory Profile & Leak Detection
```python
import sys
import tracemalloc

def inspect_memory_growth():
    tracemalloc.start()
    snapshot1 = tracemalloc.take_snapshot()

    # Create dynamic list and inspect over-allocation
    dynamic_list = []
    print(f"Empty list size: {sys.getsizeof(dynamic_list)} bytes")
    for i in range(1000):
        dynamic_list.append(i)

    snapshot2 = tracemalloc.take_snapshot()
    top_stats = snapshot2.compare_to(snapshot1, 'lineno')
    print("[Top Memory Diff]")
    for stat in top_stats[:3]:
        print(stat)
    tracemalloc.stop()
```

### Workout 3: Benchmarking Runtime with `timeit`
```python
import timeit

setup_code = "from collections import deque; lst = list(range(10000)); deq = deque(range(10000))"
list_pop_time = timeit.timeit("lst.pop(0)", setup=setup_code, number=1000)
deque_pop_time = timeit.timeit("deq.popleft()", setup=setup_code, number=1000)

print(f"list.pop(0) [O(n)]: {list_pop_time:.5f}s")
print(f"deque.popleft() [O(1)]: {deque_pop_time:.5f}s")
```

---

## 4. Problems from Coding Platforms
1. **LeetCode 136 - Single Number**: Find element appearing once using XOR bitwise trick ($O(n)$ time, $O(1)$ space).
2. **HackerRank - Time Complexity: Primality**: Determine primality in $O(\\sqrt{n})$ time avoiding $O(n)$ check.
3. **LeetCode 70 - Climbing Stairs**: Analyze complexity transition from naive recursive $O(2^n)$ to iterative dynamic programming $O(n)$ time, $O(1)$ space.
""",
        "questions": [
            {
                "question_text": "Why does appending to a Python list run in amortized O(1) time rather than strict O(1)?",
                "answer_text": "Python lists are dynamic arrays. When capacity is reached, Python allocates a new contiguous buffer (over-allocation factor ~1.125x) and copies all elements over, taking O(n) time. However, this resize happens infrequently; spreading the cost over n appends results in an amortized O(1) constant time per operation.",
                "difficulty": "BEGINNER",
                "question_type": "INTERVIEW"
            },
            {
                "question_text": "What is the difference between memory leak, high memory usage, and stack overflow?",
                "answer_text": "High memory usage is legitimate allocation of large data that is freed once done. A memory leak occurs when memory that is no longer needed cannot be reclaimed because lingering references prevent garbage collection. Stack overflow occurs when the call stack exceeds its recursion/frame allocation limit.",
                "difficulty": "INTERMEDIATE",
                "question_type": "CONCEPTUAL"
            }
        ],
        "resources": [
            {"title": "Big-O Cheat Sheet", "url": "https://www.bigocheatsheet.com/", "resource_type": "WEBSITE"},
            {"title": "Python Memory Management Documentation", "url": "https://docs.python.org/3/c-api/memory.html", "resource_type": "DOCUMENTATION"}
        ]
    },

    # -------------------------------------------------------------
    # 2. Week 1: Array
    # -------------------------------------------------------------
    {
        "slug": "dsa-week-1-array",
        "title": "2. Week 1: Array",
        "summary": "Fixed and dynamic arrays, contiguous memory allocation, access, insertions, deletions, searching, reversals, 2D matrix transformations, and core array interview workouts.",
        "difficulty": "BEGINNER",
        "learning_objective": "Implement fundamental in-place array manipulation algorithms and understand memory access locality.",
        "prerequisites": "1. DSA Basics",
        "expected_outcome": "Fluently solve linear array and 2D matrix interview problems with optimal time and O(1) auxiliary space.",
        "practice_requirement": "Implement in-place reversal, cyclic rotation, and 2D matrix transposition from scratch without library shortcuts.",
        "machine_task_relevance": "Underpins image representation, tabular tensors, and columnar caching structures.",
        "practical_task_relevance": "Directly impacts CPU cache hit rates and memory serialization performance in data pipelines.",
        "interview_relevance": "Arrays are the most tested baseline topic in technical screening tests worldwide.",
        "subtopics": [
            "What is an array, index, contiguous memory, fixed vs dynamic array",
            "Python list as dynamic array, array module",
            "Traversal, access, update",
            "Insert at beginning, middle, end",
            "Delete from beginning, middle, end",
            "Search in an array",
            "Reverse an array, rotate an array",
            "Find min, max, second largest, sum, average",
            "2D arrays (matrix): create, traverse, row and column sum, transpose",
            "Slicing, copying (shallow vs deep), 2D list pitfall",
            "Array complexity of each operation",
            "Applications of arrays",
            "Sample workout 1",
            "Sample workout 2",
            "Sample workout 3",
            "Coding site problem 1",
            "Coding site problem 2",
            "Coding site problem 3"
        ],
        "material": """# 2. Week 1: Array

## 1. Concept: Memory Layout & Dynamic Arrays
- **Array**: A contiguous block of memory holding elements of homogeneous or pointer types indexed from $0$ to $n-1$.
- **Memory Address Formula**: $\\text{Address}(A[i]) = \\text{Base} + i \\times \\text{element\\_size}$. This gives $O(1)$ random access!
- **Fixed vs Dynamic**: Fixed arrays have immutable capacity. Dynamic arrays (like Python's `list`) dynamically resize when capacity is reached.

---

## 2. Operations & Complexity
- **Access / Update**: $O(1)$ via index.
- **Append**: Amortized $O(1)$, worst $O(n)$ on reallocation.
- **Insert at Index $i$**: $O(n)$ due to shifting elements right.
- **Delete at Index $i$**: $O(n)$ due to shifting elements left.
- **Linear Search**: $O(n)$.
- **Space**: $O(n)$ contiguous memory.

---

## 3. Sample Workouts

### Workout 1: Reverse an Array In-Place ($O(n)$ time, $O(1)$ space)
```python
def reverse_array_inplace(arr: list) -> None:
    left, right = 0, len(arr) - 1
    while left < right:
        arr[left], arr[right] = arr[right], arr[left]
        left += 1
        right -= 1
```

### Workout 2: Find Second Largest Element in Single Pass ($O(n)$ time, $O(1)$ space)
```python
def find_second_largest(arr: list[int]) -> int | None:
    if len(arr) < 2:
        return None
    first = second = float('-inf')
    for num in arr:
        if num > first:
            second = first
            first = num
        elif num > second and num != first:
            second = num
    return second if second != float('-inf') else None
```

### Workout 3: 2D Matrix In-Place Transposition ($O(n^2)$ time, $O(1)$ space)
```python
def transpose_matrix(matrix: list[list[int]]) -> None:
    n = len(matrix)
    for i in range(n):
        for j in range(i + 1, n):
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
```

---

## 4. Problems from Coding Platforms
1. **LeetCode 1 - Two Sum**: Use a hash map to achieve $O(n)$ time and $O(n)$ space.
2. **LeetCode 53 - Maximum Subarray (Kadane's Algorithm)**: Find contiguous subarray with maximum sum in $O(n)$ time and $O(1)$ space.
3. **HackerRank - Left Rotation**: Rotate array elements left by $d$ positions in $O(n)$ time and $O(1)$ auxiliary space.
""",
        "questions": [
            {
                "question_text": "Why does accessing an element in an array by index take O(1) time?",
                "answer_text": "Because array memory is contiguous and elements have uniform size, the physical RAM address can be computed in a single arithmetic calculation: Base Address + (Index * Element Size). The CPU jumps directly to that memory address in one operation.",
                "difficulty": "BEGINNER",
                "question_type": "CONCEPTUAL"
            }
        ],
        "resources": [
            {"title": "LeetCode Array Explore Card", "url": "https://leetcode.com/explore/learn/card/fun-with-arrays/", "resource_type": "WEBSITE"}
        ]
    },

    # -------------------------------------------------------------
    # 3. Week 1: Linked List
    # -------------------------------------------------------------
    {
        "slug": "dsa-week-1-linked-list",
        "title": "3. Week 1: Linked List",
        "summary": "Singly linked lists, doubly linked lists, circular linked lists, node pointers, conversions, edge case handling, Floyd's cycle detection, and list reversal.",
        "difficulty": "BEGINNER",
        "learning_objective": "Construct pointer-based dynamic data structures and perform safe link manipulation without memory leaks or cycle traps.",
        "prerequisites": "1. DSA Basics, 2. Week 1: Array",
        "expected_outcome": "Write clean Node classes, reverse lists in-place, detect cycles, and explain linked list vs array memory tradeoffs.",
        "practice_requirement": "Implement a Singly and Doubly Linked List with head/tail insertion, deletion, and cycle detection.",
        "machine_task_relevance": "Used for implementing LRU cache buckets, OS memory free lists, and undo stacks.",
        "practical_task_relevance": "Critical when frequent insertions and deletions at boundaries occur without reallocation overhead.",
        "interview_relevance": "Classic whiteboarding interview topic focusing on pointer manipulation and edge case handling.",
        "subtopics": [
            "What is a linked list, node (data, next), head, tail",
            "Array vs linked list comparison",
            "Types: singly, doubly, circular (overview)",
            "Node class in Python",
            "Construct a singly linked list",
            "Construct a doubly linked list (prev and next)",
            "Convert array to a linked list",
            "Add a node at the beginning",
            "Add a node at the end",
            "Insert a node after a node with x data",
            "Insert a node before a node with x data",
            "Delete the node with the specified value",
            "Delete head node, delete last node",
            "Print all elements in order",
            "Print all elements in reverse order (recursion or doubly list)",
            "Search, count length",
            "Edge cases: empty list, single node, value not found, head/tail change",
            "Remove duplicates in a sorted singly linked list",
            "Sample workout 1",
            "Sample workout 2",
            "Sample workout 3",
            "Complexity of insert, delete, search in singly and doubly linked list",
            "Applications of linked lists"
        ],
        "material": """# 3. Week 1: Linked List

## 1. Concept: Pointer-Linked Nodes
- **Linked List**: A linear collection of data elements called nodes whose order is not given by their physical placement in memory. Instead, each node points to the next.
- **Node**: Contains `data` and a reference `next` (and `prev` for doubly linked list).
- **Tradeoffs vs Array**:
  - Insert/delete at head: Linked List is $O(1)$, Array is $O(n)$.
  - Random access: Array is $O(1)$, Linked List is $O(n)$.
  - Memory: Linked list requires extra pointer memory per node and has poor CPU cache locality.

---

## 2. Operations & Complexity
- **Insert at Head**: $O(1)$
- **Insert at Tail**: $O(1)$ with tail pointer, $O(n)$ without.
- **Delete Head**: $O(1)$
- **Delete Target Value**: $O(n)$ to locate node, then $O(1)$ pointer update.
- **Search**: $O(n)$
- **Space**: $O(n)$ non-contiguous heap allocation.

---

## 3. Sample Workouts

### Workout 1: Reverse a Singly Linked List ($O(n)$ time, $O(1)$ space)
```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def reverse_linked_list(head: ListNode | None) -> ListNode | None:
    prev = None
    curr = head
    while curr:
        next_node = curr.next
        curr.next = prev
        prev = curr
        curr = next_node
    return prev
```

### Workout 2: Fast & Slow Pointer - Cycle Detection ($O(n)$ time, $O(1)$ space)
```python
def has_cycle(head: ListNode | None) -> bool:
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow == fast:
            return True
    return False
```

### Workout 3: Remove Duplicates from Sorted Linked List ($O(n)$ time, $O(1)$ space)
```python
def delete_duplicates(head: ListNode | None) -> ListNode | None:
    curr = head
    while curr and curr.next:
        if curr.val == curr.next.val:
            curr.next = curr.next.next
        else:
            curr = curr.next
    return head
```

---

## 4. Problems from Coding Platforms
1. **LeetCode 206 - Reverse Linked List**: Essential linked list reversal.
2. **LeetCode 141 - Linked List Cycle**: Floyd's Cycle Finding Algorithm.
3. **LeetCode 21 - Merge Two Sorted Lists**: Splice nodes of two sorted lists in $O(n)$ time and $O(1)$ auxiliary space.
""",
        "questions": [
            {
                "question_text": "What is the dummy node (sentinel node) pattern in linked list problems and why is it useful?",
                "answer_text": "A dummy node is an auxiliary node prepended before the head (dummy.next = head). It eliminates special-case handling for operations modifying the head (such as deleting or inserting at index 0), keeping pointer operations clean and uniform.",
                "difficulty": "BEGINNER",
                "question_type": "INTERVIEW"
            }
        ],
        "resources": [
            {"title": "Visualgo Linked List", "url": "https://visualgo.net/en/list", "resource_type": "WEBSITE"}
        ]
    },

    # -------------------------------------------------------------
    # 4. Week 1: String
    # -------------------------------------------------------------
    {
        "slug": "dsa-week-1-string",
        "title": "4. Week 1: String",
        "summary": "String immutability in Python, ASCII encoding, slicing, sliding windows, palindromes, anagrams, shift ciphers, and memory concatenation tradeoffs.",
        "difficulty": "BEGINNER",
        "learning_objective": "Master string manipulation, ASCII character math, and two-pointer substring validation.",
        "prerequisites": "1. DSA Basics, 2. Week 1: Array",
        "expected_outcome": "Implement alphabet shifting with wrap-around, validate anagrams/palindromes, and avoid quadratic concatenation overhead.",
        "practice_requirement": "Implement an n-position Caesar wrap-around shift function and an optimal anagram frequency checker.",
        "machine_task_relevance": "Core for text parsing, log processing, serialized payloads, and NLP tokenization.",
        "practical_task_relevance": "Ensures memory efficiency when formatting or transforming large streaming text datasets.",
        "interview_relevance": "High frequency in technical screens testing string parsing and hash map counts.",
        "subtopics": [
            "What is a string, characters, indexing, negative indexing",
            "Immutability of strings in Python",
            "Slicing, reversing a string",
            "ASCII values: ord() and chr()",
            "Common methods: upper, lower, strip, split, join, replace, find, count, startswith, endswith",
            "Iterating over a string, comparing strings",
            "Palindrome, anagram, character frequency",
            "String concatenation cost, join for building strings",
            "String complexity of common operations",
            "Function to replace each alphabet in the given string with another alphabet at the n-th position from each of them (shift with wrap-around)",
            "Sample workout 1",
            "Sample workout 2",
            "Sample workout 3",
            "Applications of strings"
        ],
        "material": """# 4. Week 1: String

## 1. Concept: Immutability & ASCII Encoding
- **String in Python**: An immutable sequence of Unicode code points. Any modification creates a new string object in heap memory.
- **Concatenation Pitfall**: Building a string of length $n$ using repeated `s += char` takes $O(n^2)$ time because strings are copied on each step. Using `''.join(list_of_chars)` takes optimal $O(n)$ time.
- **ASCII Math**: `ord('a') == 97`, `chr(97) == 'a'`. Useful for alphabet indexing: `ord(c) - ord('a')`.

---

## 2. Operations & Complexity
- **Length (`len(s)`)**: $O(1)$ (stored in object header).
- **Index Access (`s[i]`)**: $O(1)$.
- **Slice (`s[i:j]`)**: $O(k)$ where $k = j - i$.
- **Concatenation (`s1 + s2`)**: $O(n + m)$.
- **Join (`''.join(arr)`)**: $O(N)$ total characters.

---

## 3. Sample Workouts

### Workout 1: Alphabet Shift with Wrap-Around ($O(n)$ time, $O(n)$ space)
```python
def shift_alphabets(text: str, n: int) -> str:
    result = []
    n = n % 26
    for ch in text:
        if 'a' <= ch <= 'z':
            base = ord('a')
            result.append(chr(base + (ord(ch) - base + n) % 26))
        elif 'A' <= ch <= 'Z':
            base = ord('A')
            result.append(chr(base + (ord(ch) - base + n) % 26))
        else:
            result.append(ch)
    return ''.join(result)
```

### Workout 2: Valid Palindrome (Ignoring Non-Alphanumeric) ($O(n)$ time, $O(1)$ space)
```python
def is_palindrome(s: str) -> bool:
    left, right = 0, len(s) - 1
    while left < right:
        while left < right and not s[left].isalnum():
            left += 1
        while left < right and not s[right].isalnum():
            right -= 1
        if s[left].lower() != s[right].lower():
            return False
        left += 1
        right -= 1
    return True
```

### Workout 3: First Non-Repeating Character ($O(n)$ time, $O(1)$ space for 26 alphabet letters)
```python
def first_unique_char(s: str) -> int:
    counts = {}
    for ch in s:
        counts[ch] = counts.get(ch, 0) + 1
    for idx, ch in enumerate(s):
        if counts[ch] == 1:
            return idx
    return -1
```

---

## 4. Problems from Coding Platforms
1. **LeetCode 242 - Valid Anagram**: Verify character frequency balance in $O(n)$ time.
2. **LeetCode 125 - Valid Palindrome**: Two-pointer character validation with punctuation skipping.
3. **HackerRank - Making Anagrams**: Determine minimum character deletions to make strings anagrams.
""",
        "questions": [
            {
                "question_text": "Why is string concatenation inside a loop considered an anti-pattern in Python?",
                "answer_text": "Because strings in Python are immutable. Repeatedly running s += c creates a new string and copies all previous characters on every iteration, leading to an overall runtime of O(n^2). Accumulating characters in a list and using ''.join(list) executes in linear O(n) time.",
                "difficulty": "BEGINNER",
                "question_type": "INTERVIEW"
            }
        ],
        "resources": [
            {"title": "Python String Methods", "url": "https://docs.python.org/3/library/stdtypes.html#string-methods", "resource_type": "DOCUMENTATION"}
        ]
    },

    # -------------------------------------------------------------
    # 5. Week 1: Linear Search and Binary Search
    # -------------------------------------------------------------
    {
        "slug": "dsa-week-1-linear-and-binary-search",
        "title": "5. Week 1: Linear Search and Binary Search",
        "summary": "Linear search on unsorted data vs logarithmic Binary Search on sorted sequences, search space reduction, overflow prevention, boundary variations, and rotated arrays.",
        "difficulty": "BEGINNER",
        "learning_objective": "Master search space bisection and boundary conditions in logarithmic time algorithms.",
        "prerequisites": "1. DSA Basics, 2. Week 1: Array",
        "expected_outcome": "Implement iterative and recursive binary search, search in rotated arrays, and compute integer square roots.",
        "practice_requirement": "Implement binary search, first and last occurrence finder, and square root solver.",
        "machine_task_relevance": "Used for database range scans, index bisection, and hyperparameter grid searches.",
        "practical_task_relevance": "Dramatically reduces search time across millions of sorted records from minutes to microseconds.",
        "interview_relevance": "Universal technical interview topic with extensive edge-case questions around boundaries.",
        "subtopics": [
            "Linear search: concept and steps, working with example",
            "Code (iterative), return index or -1",
            "Complexity: best O(1), average and worst O(n), space O(1)",
            "When to use, works on unsorted data",
            "Sample workout 1",
            "Sample workout 2",
            "Sample workout 3",
            "Binary search: concept: sorted data required, divide search space in half",
            "Steps with low, high, mid, avoiding overflow style mid calculation",
            "Code iterative",
            "Code recursive",
            "Complexity: best O(1), average and worst O(log n), space O(1) iterative and O(log n) recursive",
            "Linear vs binary search comparison",
            "Binary search variations: first and last occurrence, insert position",
            "Sample workout 1",
            "Sample workout 2",
            "Sample workout 3"
        ],
        "material": """# 5. Week 1: Linear Search and Binary Search

## 1. Concept: Search Space Halving
- **Linear Search**: Sequentially checks every element in an array until a match is found or end of list is reached. Operates on unsorted data.
- **Binary Search**: Operates exclusively on **sorted** sequences. Compares the target with middle element; halves the remaining search space on every iteration.
- **Midpoint Formula**: `mid = low + (high - low) // 2` avoids integer overflow compared to `(low + high) // 2`.

---

## 2. Complexity Analysis
| Algorithm | Best Time | Average Time | Worst Time | Space (Iterative) | Space (Recursive) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Linear Search** | $O(1)$ | $O(n)$ | $O(n)$ | $O(1)$ | $O(n)$ |
| **Binary Search** | $O(1)$ | $O(\\log n)$ | $O(\\log n)$ | $O(1)$ | $O(\\log n)$ |

---

## 3. Sample Workouts

### Workout 1: Standard Binary Search (Iterative, $O(\\log n)$ time, $O(1)$ space)
```python
def binary_search(arr: list[int], target: int) -> int:
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = low + (high - low) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1
```

### Workout 2: First and Last Occurrence of Target ($O(\\log n)$ time, $O(1)$ space)
```python
def find_first_occurrence(arr: list[int], target: int) -> int:
    low, high = 0, len(arr) - 1
    first = -1
    while low <= high:
        mid = low + (high - low) // 2
        if arr[mid] == target:
            first = mid
            high = mid - 1  # Keep searching left
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return first
```

### Workout 3: Integer Square Root via Binary Search ($O(\\log x)$ time, $O(1)$ space)
```python
def my_sqrt(x: int) -> int:
    if x < 2:
        return x
    low, high = 1, x // 2
    ans = 1
    while low <= high:
        mid = low + (high - low) // 2
        if mid * mid <= x:
            ans = mid
            low = mid + 1
        else:
            high = mid - 1
    return ans
```

---

## 4. Problems from Coding Platforms
1. **LeetCode 704 - Binary Search**: Canonical implementation.
2. **LeetCode 33 - Search in Rotated Sorted Array**: Binary search with inflection point handling ($O(\\log n)$).
3. **LeetCode 34 - Find First and Last Position of Element in Sorted Array**: Double binary search boundary check.
""",
        "questions": [
            {
                "question_text": "Why does binary search require O(log n) comparisons to find an element in a list of size n?",
                "answer_text": "Because the search space is divided by 2 on every step. Starting with n elements, after k steps there are n / (2^k) elements remaining. Setting n / (2^k) = 1 yields 2^k = n, which means k = log2(n) iterations.",
                "difficulty": "BEGINNER",
                "question_type": "CONCEPTUAL"
            }
        ],
        "resources": [
            {"title": "Khan Academy - Binary Search", "url": "https://www.khanacademy.org/computing/computer-science/algorithms/binary-search", "resource_type": "ARTICLE"}
        ]
    },

    # -------------------------------------------------------------
    # 6. Week 1: Recursion
    # -------------------------------------------------------------
    {
        "slug": "dsa-week-1-recursion",
        "title": "6. Week 1: Recursion",
        "summary": "Recursive functions, base case, call stack activation records, stack overflow, recursion trees, tail recursion, and classic recursive problems.",
        "difficulty": "INTERMEDIATE",
        "learning_objective": "Deconstruct complex computational problems into self-similar subproblems with robust base termination conditions.",
        "prerequisites": "1. DSA Basics, 5. Week 1: Linear Search and Binary Search",
        "expected_outcome": "Formulate recursion trees, trace call stack memory, and solve combinatorial generation problems.",
        "practice_requirement": "Implement Tower of Hanoi, power set generator, and recursive list flattening.",
        "machine_task_relevance": "Forms the bedrock of Tree and Graph traversals (DFS), AST parsing, and Divide-and-Conquer sorts.",
        "practical_task_relevance": "Indispensable for processing nested hierarchical payloads (JSON schemas, file directory trees).",
        "interview_relevance": "Core evaluation metric for problem solving and call-stack mental modeling.",
        "subtopics": [
            "What is recursion, base case, recursive case",
            "How the call stack works in recursion, stack overflow, Python recursion limit",
            "Recursion vs iteration",
            "Types: direct, indirect, tail recursion (overview)",
            "Time and space complexity of recursion",
            "Recursion tree",
            "Factorial",
            "Fibonacci",
            "Sum of first n numbers, sum of digits",
            "Power of a number",
            "Reverse a string, palindrome check",
            "Print linked list in reverse using recursion",
            "Binary search using recursion",
            "Sample workout 1",
            "Sample workout 2",
            "Sample workout 3"
        ],
        "material": """# 6. Week 1: Recursion

## 1. Concept: Subproblem Decomposition & Call Stack
- **Recursion**: A problem-solving method where a function calls itself to solve smaller instances of the same problem.
- **Anatomy**:
  1. **Base Case**: The simplest terminal condition that stops recursion without calling itself.
  2. **Recursive Step**: Moves the state closer towards the base case.
- **Call Stack**: Every recursive invocation pushes a new stack frame (containing parameters, local variables, return address) onto the execution stack.
- **Stack Overflow**: Exceeding the maximum call stack depth. Python defaults to a limit of 1000 (`sys.getrecursionlimit()`).

---

## 2. Complexity & Recursion Tree
- **Time Complexity**: Total number of nodes in the recursion tree $\\times$ work done per call.
  - Fibonacci ($T(n) = T(n-1) + T(n-2)$): $O(2^n)$ exponential without memoization.
  - Binary search ($T(n) = T(n/2) + O(1)$): $O(\\log n)$.
- **Space Complexity**: Determined by the maximum depth of the recursion tree (maximum concurrent frames on call stack).

---

## 3. Sample Workouts

### Workout 1: Tower of Hanoi ($O(2^n)$ time, $O(n)$ stack space)
```python
def tower_of_hanoi(n: int, source: str, auxiliary: str, destination: str) -> list[str]:
    moves = []
    def solve(disks, src, aux, dest):
        if disks == 1:
            moves.append(f"Move disk 1 from {src} to {dest}")
            return
        solve(disks - 1, src, dest, aux)
        moves.append(f"Move disk {disks} from {src} to {dest}")
        solve(disks - 1, aux, src, dest)
    solve(n, source, auxiliary, destination)
    return moves
```

### Workout 2: Generate All Subsets / Power Set ($O(2^n)$ time, $O(n)$ space)
```python
def generate_subsets(nums: list[int]) -> list[list[int]]:
    subsets = []
    def backtrack(start: int, current: list[int]):
        subsets.append(list(current))
        for i in range(start, len(nums)):
            current.append(nums[i])
            backtrack(i + 1, current)
            current.pop()
    backtrack(0, [])
    return subsets
```

### Workout 3: Flatten Nested List Recursively ($O(n)$ time, $O(d)$ space)
```python
def flatten_list(nested: list) -> list:
    flat = []
    for item in nested:
        if isinstance(item, list):
            flat.extend(flatten_list(item))
        else:
            flat.append(item)
    return flat
```

---

## 4. Problems from Coding Platforms
1. **LeetCode 50 - Pow(x, n)**: Implement $x^n$ using recursive binary exponentiation in $O(\\log n)$ time.
2. **HackerRank - Recursive Digit Sum**: Super digit calculation using recursive modulo arithmetic.
3. **LeetCode 78 - Subsets**: Generate all subsets via recursive backtracking.
""",
        "questions": [
            {
                "question_text": "What happens if a recursive function does not have a properly terminating base case?",
                "answer_text": "The function continues invoking itself indefinitely, allocating new stack frames on every call until the stack memory is exhausted. In Python, this triggers a RecursionError: maximum recursion depth exceeded.",
                "difficulty": "BEGINNER",
                "question_type": "CONCEPTUAL"
            }
        ],
        "resources": [
            {"title": "MIT OpenCourseWare - Recursion", "url": "https://ocw.mit.edu/", "resource_type": "COURSE"}
        ]
    },

    # -------------------------------------------------------------
    # 7. Week 1: Applications
    # -------------------------------------------------------------
    {
        "slug": "dsa-week-1-applications",
        "title": "7. Week 1: Applications",
        "summary": "Real-world engineering applications of arrays, linked lists, strings, searching, and recursion. Architectural tradeoffs and practical case studies.",
        "difficulty": "BEGINNER",
        "learning_objective": "Synthesize Week 1 data structures to make informed architectural decisions for real-world software components.",
        "prerequisites": "Week 1 DSA Topics (2 through 6)",
        "expected_outcome": "Defend choices between array and linked list in real system design scenarios.",
        "practice_requirement": "Formulate a comparative trade-off document on Array vs Linked List for streaming workloads.",
        "machine_task_relevance": "Crucial for selecting storage primitives that balance latency and memory consumption.",
        "practical_task_relevance": "Underpins database buffer pools, text editor architectures, and network packet queues.",
        "interview_relevance": "Frequently asked in senior system design and architectural screening questions.",
        "subtopics": [
            "Applications of array, linked list, string, searching, recursion (write in own words)",
            "Where to use array vs linked list"
        ],
        "material": """# 7. Week 1: Applications

## 1. System Design Tradeoffs: Array vs Linked List
| Metric | Array / Dynamic Array | Singly / Doubly Linked List |
| :--- | :--- | :--- |
| **Lookup by Index** | $O(1)$ instant random access | $O(n)$ sequential pointer traversal |
| **Prepend (Insert at 0)** | $O(n)$ shifts all elements | $O(1)$ reassign head pointer |
| **Append (Insert at End)** | Amortized $O(1)$ | $O(1)$ with tail pointer |
| **Memory Locality** | High (contiguous, CPU cache-friendly) | Low (fragmented heap pointers) |
| **Memory Overhead** | Minor capacity over-allocation | 8-16 bytes per node for pointer references |
| **Resizing Behavior** | Periodic copy spikes ($O(n)$) | Smooth incremental allocation |

---

## 2. Practical Case Studies
1. **Text Editor Buffer**:
   - Arrays require costly $O(n)$ shift operations on each keystroke in large files.
   - Gap Buffers or Rope/Piece Tables (built on pointer hierarchies) permit localized $O(1)$ edits.
2. **LRU Cache Foundation**:
   - Fast $O(1)$ deletion and re-insertion at head upon access is achieved using a **Doubly Linked List** coupled with a **Hash Map**.
3. **Database Indexing**:
   - Contiguous B-Trees and Arrays maximize disk block read efficiency and CPU L1 cache line prefetching.
""",
        "questions": [
            {
                "question_text": "Why do modern high-performance databases prefer contiguous arrays over linked lists even when insertions occur?",
                "answer_text": "Modern CPUs fetch data into L1/L2 cache in 64-byte cache lines. Arrays reside in contiguous memory, meaning adjacent elements are pre-fetched automatically, yielding cache hit rates above 95%. Linked lists scatter nodes across heap memory, incurring a CPU cache miss on virtually every pointer dereference.",
                "difficulty": "INTERMEDIATE",
                "question_type": "INTERVIEW"
            }
        ],
        "resources": [
            {"title": "What Every Programmer Should Know About Memory", "url": "https://people.freebsd.org/~lstewart/articles/cpumemory.pdf", "resource_type": "ARTICLE"}
        ]
    },

    # -------------------------------------------------------------
    # 8. Week 2: Basic Sorting Algorithms
    # -------------------------------------------------------------
    {
        "slug": "dsa-week-2-basic-sorting-algorithms",
        "title": "8. Week 2: Basic Sorting Algorithms",
        "summary": "Bubble Sort, Selection Sort, Insertion Sort, loop invariants, stability, comparison counts, swap mechanics, and optimal application scenarios.",
        "difficulty": "BEGINNER",
        "learning_objective": "Master in-place comparison sorts, analyze stability, and optimize inner loops.",
        "prerequisites": "1. DSA Basics, 2. Week 1: Array",
        "expected_outcome": "Implement Bubble, Selection, and Insertion sort from scratch with benchmark metrics.",
        "practice_requirement": "Implement all 3 sorts with swap counter and early termination flags.",
        "machine_task_relevance": "Sorting order is prerequisite for binary search, deduplication, and aggregation pipelines.",
        "practical_task_relevance": "Insertion Sort is the inner engine of hybrid production sorts (Timsort) for small partitions (n <= 32).",
        "interview_relevance": "Standard baseline algorithmic question verifying mastery of loops and stability.",
        "subtopics": [
            "What is sorting, why sorting is needed",
            "Ascending and descending order",
            "In-place vs out-of-place, stable vs unstable",
            "Number of comparisons and swaps",
            "Bubble sort: concept, passes, swapping adjacent elements",
            "Bubble sort: code, optimization with swapped flag",
            "Bubble sort: complexity: best O(n) with flag, average and worst O(n^2), space O(1), stable",
            "Bubble sort: 3 workouts",
            "Selection sort: concept, find minimum and place at correct position",
            "Selection sort: code",
            "Selection sort: complexity: best, average, worst O(n^2), space O(1), not stable",
            "Selection sort: 3 workouts",
            "Insertion sort: concept, insert each element into the sorted part",
            "Insertion sort: code",
            "Insertion sort: complexity: best O(n), average and worst O(n^2), space O(1), stable",
            "Insertion sort: 3 workouts",
            "Compare bubble, selection, insertion (time, space, stability, when to use)"
        ],
        "material": """# 8. Week 2: Basic Sorting Algorithms

## 1. Concept: In-Place & Stability
- **In-Place Sorting**: Reorganizes elements inside the original array using $O(1)$ auxiliary space.
- **Stability**: A sorting algorithm is **stable** if elements with identical keys appear in the output in the same relative order as in the input.
  - Critical when sorting objects with multiple fields (e.g., sort by age, then sort by name).

---

## 2. Comparison Table
| Algorithm | Best Time | Average Time | Worst Time | Space | Stable? | Comparisons | Swaps |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Bubble Sort** | $O(n)$ (w/ flag) | $O(n^2)$ | $O(n^2)$ | $O(1)$ | Yes | $O(n^2)$ | $O(n^2)$ |
| **Selection Sort** | $O(n^2)$ | $O(n^2)$ | $O(n^2)$ | $O(1)$ | No | $O(n^2)$ | $O(n)$ |
| **Insertion Sort** | $O(n)$ | $O(n^2)$ | $O(n^2)$ | $O(1)$ | Yes | $O(n^2)$ | $O(n^2)$ shifts |

---

## 3. Sample Workouts

### Workout 1: Optimized Bubble Sort with Swapped Flag ($O(n)$ best, $O(n^2)$ worst)
```python
def bubble_sort(arr: list[int]) -> list[int]:
    n = len(arr)
    for i in range(n):
        swapped = False
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:
            break
    return arr
```

### Workout 2: Selection Sort ($O(n^2)$ time, $O(1)$ space, minimum swaps)
```python
def selection_sort(arr: list[int]) -> list[int]:
    n = len(arr)
    for i in range(n):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr
```

### Workout 3: Insertion Sort ($O(n)$ best for nearly sorted data)
```python
def insertion_sort(arr: list[int]) -> list[int]:
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr
```

---

## 4. Problems from Coding Platforms
1. **LeetCode 912 - Sort an Array**: Benchmark sorting performance.
2. **HackerRank - Insertion Sort Part 1 & 2**: Step-by-step invariant visualization.
3. **CodeChef - TSORT**: Practical fast sorting problem.
""",
        "questions": [
            {
                "question_text": "Why is Selection Sort unstable?",
                "answer_text": "Selection sort swaps the identified minimum element with the current position across long distances. This can move an element past an identical element earlier in the array, violating original relative order (e.g., in [4a, 4b, 2], 4a swaps with 2, resulting in [2, 4b, 4a]).",
                "difficulty": "BEGINNER",
                "question_type": "CONCEPTUAL"
            }
        ],
        "resources": [
            {"title": "Visualizing Sorting Algorithms", "url": "https://www.toptal.com/developers/sorting-algorithms", "resource_type": "WEBSITE"}
        ]
    },

    # -------------------------------------------------------------
    # 9. Week 2: Hash Table
    # -------------------------------------------------------------
    {
        "slug": "dsa-week-2-hash-table",
        "title": "9. Week 2: Hash Table",
        "summary": "Hash functions, collision resolution (Separate Chaining vs Open Addressing), load factors, rehashing, Python dictionary mechanics, and constant time dictionary lookup.",
        "difficulty": "INTERMEDIATE",
        "learning_objective": "Build a functional hash table from scratch and master collision handling techniques.",
        "prerequisites": "1. DSA Basics, 2. Week 1: Array, 3. Week 1: Linked List",
        "expected_outcome": "Implement separate chaining and linear probing, explain load factors, and solve grouping/lookup problems.",
        "practice_requirement": "Implement a custom HashTable class with insert, search, delete, and dynamic rehashing.",
        "machine_task_relevance": "Powers in-memory caches (Redis), database indexes, unique constraints, and dictionary maps.",
        "practical_task_relevance": "Fundamental to achieving O(1) key lookups across large web microservices.",
        "interview_relevance": "Most frequent algorithmic data structure utilized in LeetCode Medium interview solutions.",
        "subtopics": [
            "What is a hash table, key-value pairs",
            "Hash function and index calculation (modulo), properties of a good hash function",
            "Collisions and why they happen",
            "Collision handling: separate chaining",
            "Collision handling: open addressing (linear probing, quadratic probing, double hashing)",
            "Load factor and resizing (rehashing)",
            "Python dict and set as hash tables, hash(), hashable vs unhashable",
            "Complexity: search, insert, delete average O(1), worst O(n)",
            "Implement a simple hash table with insert, search, delete",
            "Applications: frequency counting, duplicates, lookup, caching, two sum",
            "Sample workout 1",
            "Sample workout 2",
            "Sample workout 3"
        ],
        "material": """# 9. Week 2: Hash Table

## 1. Concept: Hash Functions & Collision Resolution
- **Hash Table**: An associative data structure mapping keys to values using a mathematical hash function.
- **Index Computation**: $\\text{Index} = \\text{hash}(\\text{key}) \\pmod{\\text{capacity}}$.
- **Collisions**: Occur when two distinct keys yield identical indices (Pigeonhole Principle).
- **Collision Strategies**:
  1. **Separate Chaining**: Each bucket maintains a linked list of entries that hash to the same bucket.
  2. **Open Addressing**: All items stored in the table directly. Upon collision, search alternative slots:
     - Linear Probing: $h(k, i) = (h(k) + i) \\pmod{m}$
     - Quadratic Probing: $h(k, i) = (h(k) + c_1 i + c_2 i^2) \\pmod{m}$
     - Double Hashing: $h(k, i) = (h_1(k) + i \\cdot h_2(k)) \\pmod{m}$
- **Load Factor ($\\alpha$)**: $\\alpha = n / m$ (items / slots). When $\\alpha > 0.7$, the table doubles capacity and rehashes all keys.

---

## 2. Operations & Complexity
- **Average Case**: Insert $O(1)$, Search $O(1)$, Delete $O(1)$.
- **Worst Case**: $O(n)$ if all keys hash to the same single bucket.
- **Space**: $O(n)$ table capacity.

---

## 3. Sample Workouts

### Workout 1: Complete Hash Table with Separate Chaining
```python
class HashNode:
    def __init__(self, key, value):
        self.key = key
        self.value = value
        self.next = None

class SimpleHashTable:
    def __init__(self, capacity=10):
        self.capacity = capacity
        self.size = 0
        self.buckets = [None] * capacity

    def _hash(self, key):
        return hash(key) % self.capacity

    def put(self, key, value):
        idx = self._hash(key)
        head = self.buckets[idx]
        while head:
            if head.key == key:
                head.value = value
                return
            head = head.next
        new_node = HashNode(key, value)
        new_node.next = self.buckets[idx]
        self.buckets[idx] = new_node
        self.size += 1

    def get(self, key):
        idx = self._hash(key)
        head = self.buckets[idx]
        while head:
            if head.key == key:
                return head.value
            head = head.next
        return None
```

### Workout 2: Group Anagrams ($O(N \\cdot K)$ time using tuple counts)
```python
from collections import defaultdict

def group_anagrams(strs: list[str]) -> list[list[str]]:
    ans = defaultdict(list)
    for s in strs:
        count = [0] * 26
        for c in s:
            count[ord(c) - ord('a')] += 1
        ans[tuple(count)].append(s)
    return list(ans.values())
```

### Workout 3: Subarray Sum Equals K ($O(n)$ time using prefix sums and Hash Map)
```python
def subarray_sum(nums: list[int], k: int) -> int:
    count = 0
    curr_sum = 0
    prefix_sums = {0: 1}
    for num in nums:
        curr_sum += num
        if curr_sum - k in prefix_sums:
            count += prefix_sums[curr_sum - k]
        prefix_sums[curr_sum] = prefix_sums.get(curr_sum, 0) + 1
    return count
```

---

## 4. Problems from Coding Platforms
1. **LeetCode 49 - Group Anagrams**: Group anagram strings using hash map keys.
2. **LeetCode 387 - First Unique Character in a String**: $O(n)$ frequency count lookup.
3. **LeetCode 560 - Subarray Sum Equals K**: Cumulative sum prefix hash table.
""",
        "questions": [
            {
                "question_text": "What makes an object hashable in Python?",
                "answer_text": "An object is hashable if it has a hash value that never changes during its lifetime (requires a __hash__() method) and can be compared to other objects (requires an __eq__() method). Immutable built-in types (int, float, str, tuple with hashable items) are hashable; mutable containers (list, dict, set) are not.",
                "difficulty": "INTERMEDIATE",
                "question_type": "CONCEPTUAL"
            }
        ],
        "resources": [
            {"title": "CPython Dict Implementation Notes", "url": "https://github.com/python/cpython/blob/main/Objects/dictnotes.txt", "resource_type": "DOCUMENTATION"}
        ]
    },

    # -------------------------------------------------------------
    # 10. Week 2: Stacks and Queues
    # -------------------------------------------------------------
    {
        "slug": "dsa-week-2-stacks-and-queues",
        "title": "10. Week 2: Stacks and Queues",
        "summary": "Stack LIFO vs Queue FIFO principles, array vs linked list backing, circular queues, deques, expression evaluation, matching parentheses, and buffer architectures.",
        "difficulty": "BEGINNER",
        "learning_objective": "Implement bounded and unbounded Stacks and Queues and apply them to syntax parsing and task scheduling.",
        "prerequisites": "1. DSA Basics, 2. Week 1: Array, 3. Week 1: Linked List",
        "expected_outcome": "Build MinStack, evaluate Reverse Polish Notation, and validate balanced brackets.",
        "practice_requirement": "Implement a Stack and Queue from scratch using a Linked List with O(1) operations.",
        "machine_task_relevance": "Powers call stack management, undo buffers, expression evaluators, and BFS schedulers.",
        "practical_task_relevance": "Forms the basis for message queues (RabbitMQ, Kafka partitions) and async event loops.",
        "interview_relevance": "Foundational interview topic with high frequency in practical coding challenges.",
        "subtopics": [
            "What is a stack, LIFO principle",
            "PUSH operation",
            "POP operation",
            "Display elements",
            "Peek/top, is_empty, is_full, size",
            "Overflow and underflow",
            "Implementation using list, and using linked list",
            "Complexity of stack operations",
            "Applications: undo, function call stack, bracket matching, expression evaluation, reversing",
            "What is a queue, FIFO principle",
            "Enqueue operation",
            "Dequeue operation",
            "Display elements",
            "Front, rear, is_empty, is_full, size",
            "Implementation using list (why dequeue is slow), collections.deque, linked list",
            "Types: circular queue, deque, priority queue (concept only)",
            "Complexity of queue operations",
            "Applications: scheduling, BFS, buffering, printer queue",
            "Coding site problem 1",
            "Coding site problem 2",
            "Coding site problem 3"
        ],
        "material": """# 10. Week 2: Stacks and Queues

## 1. Concept: LIFO and FIFO Access Patterns
- **Stack (LIFO - Last In, First Out)**: Elements are inserted and removed from the same end, called `top`.
  - Operations: `push(x)`, `pop()`, `peek()`, `is_empty()`, `size()`.
- **Queue (FIFO - First In, First Out)**: Elements are inserted at `rear` (enqueue) and removed from `front` (dequeue).
  - Operations: `enqueue(x)`, `dequeue()`, `front()`, `is_empty()`, `size()`.
- **Why `list.pop(0)` is Slow for Queues**: Removing from index 0 in a Python list requires shifting all $n$ remaining elements, resulting in $O(n)$ time. `collections.deque` uses a doubly linked list of blocks, providing true $O(1)$ operations at both ends.

---

## 2. Operations & Complexity
- **Stack Push / Pop / Peek**: $O(1)$ time, $O(n)$ space.
- **Queue Enqueue / Dequeue / Front**: $O(1)$ time with linked list / deque, $O(n)$ space.

---

## 3. Sample Workouts

### Workout 1: Valid Parentheses Bracket Matching ($O(n)$ time, $O(n)$ space)
```python
def is_valid_parentheses(s: str) -> bool:
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    for char in s:
        if char in mapping:
            top = stack.pop() if stack else '#'
            if mapping[char] != top:
                return False
        else:
            stack.append(char)
    return not stack
```

### Workout 2: Min Stack with $O(1)$ `getMin()`
```python
class MinStack:
    def __init__(self):
        self.stack = []
        self.min_stack = []

    def push(self, val: int) -> None:
        self.stack.append(val)
        if not self.min_stack or val <= self.min_stack[-1]:
            self.min_stack.append(val)

    def pop(self) -> None:
        if self.stack:
            val = self.stack.pop()
            if val == self.min_stack[-1]:
                self.min_stack.pop()

    def top(self) -> int:
        return self.stack[-1]

    def getMin(self) -> int:
        return self.min_stack[-1]
```

### Workout 3: Implement Queue using Stacks ($O(1)$ amortized)
```python
class MyQueue:
    def __init__(self):
        self.in_stack = []
        self.out_stack = []

    def push(self, x: int) -> None:
        self.in_stack.append(x)

    def pop(self) -> int:
        self.peek()
        return self.out_stack.pop()

    def peek(self) -> int:
        if not self.out_stack:
            while self.in_stack:
                self.out_stack.append(self.in_stack.pop())
        return self.out_stack[-1]

    def empty(self) -> bool:
        return not self.in_stack and not self.out_stack
```

---

## 4. Problems from Coding Platforms
1. **LeetCode 20 - Valid Parentheses**: Classic stack bracket validation.
2. **LeetCode 155 - Min Stack**: Stack with constant time minimum lookup.
3. **LeetCode 232 - Implement Queue using Stacks**: Two-stack amortized transfer.
""",
        "questions": [
            {
                "question_text": "Why should you use collections.deque instead of list when implementing a Queue in Python?",
                "answer_text": "Python lists are dynamic contiguous arrays. Removing from the front with list.pop(0) forces an O(n) memory shift of all subsequent elements. collections.deque is implemented as a doubly-linked list of fixed-size blocks, making append() and popleft() guaranteed O(1) operations.",
                "difficulty": "BEGINNER",
                "question_type": "INTERVIEW"
            }
        ],
        "resources": [
            {"title": "Python collections.deque", "url": "https://docs.python.org/3/library/collections.html#collections.deque", "resource_type": "DOCUMENTATION"}
        ]
    },

    # -------------------------------------------------------------
    # 11. Week 2: Trees and Binary Search Trees
    # -------------------------------------------------------------
    {
        "slug": "dsa-week-2-trees-and-binary-search-trees",
        "title": "11. Week 2: Trees and Binary Search Trees",
        "summary": "Tree hierarchy, binary tree classifications, traversals (Inorder, Preorder, Postorder, Level-Order), BST properties, insertions, contains, node deletions, and tree balancing.",
        "difficulty": "INTERMEDIATE",
        "learning_objective": "Construct binary trees, traverse hierarchically, and implement Binary Search Tree invariants.",
        "prerequisites": "1. DSA Basics, 6. Week 1: Recursion, 10. Week 2: Stacks and Queues",
        "expected_outcome": "Build a complete BST with search, insert, delete, validate BST properties, and perform level-order traversal.",
        "practice_requirement": "Implement a BST with recursive traversals, node deletion with inorder successor, and BST validation.",
        "machine_task_relevance": "Underpins hierarchical data serialization, decision trees in machine learning, and database indices.",
        "practical_task_relevance": "Essential for nested configuration schemas, DOM trees, and file systems.",
        "interview_relevance": "Extremely high frequency in mid-to-senior technical interviews.",
        "subtopics": [
            "What is a tree, non-linear structure",
            "Terminology: root, node, parent, child, sibling, leaf, edge, path, depth, height, level, subtree, degree",
            "Binary tree, types: full, complete, perfect, skewed",
            "Tree node class in Python",
            "Traversals: inorder, preorder, postorder (recursive), level order (using queue)",
            "Binary Search Tree property (left smaller, right greater)",
            "Inorder traversal of BST gives sorted order",
            "Insertion",
            "Contains (search)",
            "Deletion: leaf node, node with one child, node with two children (inorder successor/predecessor)",
            "Find minimum and maximum, height of a tree",
            "Complexity: average O(log n), worst O(n) for skewed tree",
            "Create a BST with insertion, contains, delete, and traversals",
            "Find the closest value in a BST",
            "Validate if a tree is a BST (min/max range approach or inorder check)",
            "Applications of trees and BST (file system, searching, databases, hierarchical data)"
        ],
        "material": """# 11. Week 2: Trees and Binary Search Trees

## 1. Concept: Hierarchical Trees & BST Properties
- **Tree**: A non-linear hierarchical data structure consisting of nodes connected by edges, with a single designated `root` and no cycles.
- **Terminology**:
  - `Leaf`: Node with no children.
  - `Height`: Maximum edges from root to a leaf.
  - `Depth`: Number of edges from root to target node.
- **Binary Search Tree (BST) Property**: For every node $N$:
  - All values in $N$'s left subtree are strictly **less than** $N.\\text{val}$.
  - All values in $N$'s right subtree are strictly **greater than** $N.\\text{val}$.
  - **Inorder Traversal (Left, Root, Right)** of a BST produces elements in strictly **sorted order**!

---

## 2. Traversals & Complexity
- **Inorder**: Left $\\to$ Root $\\to$ Right (Sorted sequence for BST)
- **Preorder**: Root $\\to$ Left $\\to$ Right (Used for serialization)
- **Postorder**: Left $\\to$ Right $\\to$ Root (Used for deletion / bottom-up calculations)
- **Level-Order (BFS)**: Traversed horizontally level-by-level using a Queue.
- **Complexity**:
  - Average Balanced BST: Search, Insert, Delete in $O(\\log n)$.
  - Worst Skewed Tree: Degenerates to linked list with $O(n)$ operations.

---

## 3. Sample Workouts

### Workout 1: Complete BST Node Class with Insertion & Search
```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class BinarySearchTree:
    def __init__(self):
        self.root = None

    def insert(self, val: int) -> None:
        if not self.root:
            self.root = TreeNode(val)
            return
        curr = self.root
        while True:
            if val < curr.val:
                if not curr.left:
                    curr.left = TreeNode(val)
                    break
                curr = curr.left
            else:
                if not curr.right:
                    curr.right = TreeNode(val)
                    break
                curr = curr.right

    def contains(self, val: int) -> bool:
        curr = self.root
        while curr:
            if curr.val == val:
                return True
            curr = curr.left if val < curr.val else curr.right
        return False
```

### Workout 2: Validate if a Binary Tree is a Valid BST ($O(n)$ time, $O(h)$ space)
```python
def is_valid_bst(root: TreeNode | None) -> bool:
    def validate(node, low=float('-inf'), high=float('inf')):
        if not node:
            return True
        if not (low < node.val < high):
            return False
        return (validate(node.left, low, node.val) and 
                validate(node.right, node.val, high))
    return validate(root)
```

### Workout 3: Level-Order Traversal (BFS via Queue) ($O(n)$ time, $O(n)$ space)
```python
from collections import deque

def level_order(root: TreeNode | None) -> list[list[int]]:
    if not root:
        return []
    levels = []
    queue = deque([root])
    while queue:
        level_size = len(queue)
        current_level = []
        for _ in range(level_size):
            node = queue.popleft()
            current_level.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        levels.append(current_level)
    return levels
```

---

## 4. Problems from Coding Platforms
1. **LeetCode 98 - Validate Binary Search Tree**: Range checking validation.
2. **LeetCode 102 - Binary Tree Level Order Traversal**: Breadth-First tree extraction.
3. **AlgoExpert - Find Closest Value in BST**: Logarithmic proximity search.
""",
        "questions": [
            {
                "question_text": "How do you delete a node that has two children in a Binary Search Tree?",
                "answer_text": "To delete a node with two children, replace its value with either its inorder successor (minimum value in its right subtree) or its inorder predecessor (maximum value in its left subtree). Then recursively delete that successor/predecessor node from its original position (which is guaranteed to have at most one child).",
                "difficulty": "INTERMEDIATE",
                "question_type": "INTERVIEW"
            }
        ],
        "resources": [
            {"title": "Visualgo Binary Search Tree", "url": "https://visualgo.net/en/bst", "resource_type": "WEBSITE"}
        ]
    },

    # -------------------------------------------------------------
    # 12. Week 2: Graphs and Traversals
    # -------------------------------------------------------------
    {
        "slug": "dsa-week-2-graphs-and-traversals",
        "title": "12. Week 2: Graphs and Traversals",
        "summary": "Graph vertices and edges, representations (Adjacency Matrix vs Adjacency List), Breadth-First Search (BFS), Depth-First Search (DFS), cycle detection, and disconnected components.",
        "difficulty": "ADVANCED",
        "learning_objective": "Model networked systems with graphs and execute BFS and DFS traversals with cycle protection.",
        "prerequisites": "1. DSA Basics, 6. Week 1: Recursion, 10. Week 2: Stacks and Queues",
        "expected_outcome": "Build graph representations and implement BFS shortest paths and DFS cycle detection.",
        "practice_requirement": "Implement a graph adjacency list with BFS and DFS traversals and count connected components.",
        "machine_task_relevance": "Used in dependency resolution (DAGs), recommendation systems, and social graphs.",
        "practical_task_relevance": "Core architecture of routing engines, network topologies, and workflow runners (Airflow, Celery).",
        "interview_relevance": "Primary benchmark topic in advanced software engineering technical loops.",
        "subtopics": [
            "What is a graph, vertices (nodes) and edges",
            "Directed vs undirected, weighted vs unweighted",
            "Degree, path, cycle, connected graph, disconnected graph, tree as a graph",
            "Graph representation: adjacency matrix, adjacency list (dict of lists), edge list",
            "Space and time comparison of representations",
            "Build a graph in Python and add vertex, add edge",
            "BFS: concept, queue, visited set, level by level, code, complexity O(V + E)",
            "DFS: concept, stack or recursion, visited set, code, complexity O(V + E)",
            "BFS vs DFS comparison and when to use",
            "Handling disconnected graphs and cycles (visited tracking)",
            "3 sample workouts on BFS and DFS traversals",
            "Solve 3 problems on graph traversal techniques",
            "Applications of graphs (maps, social networks, networks, dependencies)"
        ],
        "material": """# 12. Week 2: Graphs and Traversals

## 1. Concept: Graph Networks & Representations
- **Graph $G = (V, E)$**: A set of vertices (nodes) $V$ connected by edges $E$.
- **Representations**:
  1. **Adjacency List** (`dict[int, list[int]]`): Stores lists of neighbors. Space $O(V + E)$. Ideal for sparse graphs.
  2. **Adjacency Matrix** ($V \\times V$ 2D array): Boolean or weight table. Space $O(V^2)$. Ideal for dense graphs or $O(1)$ edge existence checks.

---

## 2. Traversals & Complexity
- **Breadth-First Search (BFS)**:
  - Uses a **Queue** and explores neighbors level-by-level.
  - Computes the **shortest path in unweighted graphs**!
  - Time: $O(V + E)$, Space: $O(V)$ for queue and visited set.
- **Depth-First Search (DFS)**:
  - Uses a **Stack** or **Recursion** to explore along branches as deep as possible before backtracking.
  - Used for cycle detection, topological sorting, and maze exploration.
  - Time: $O(V + E)$, Space: $O(V)$ for recursion stack.

---

## 3. Sample Workouts

### Workout 1: Graph Construction & BFS Shortest Path
```python
from collections import deque

class Graph:
    def __init__(self):
        self.adj = {}

    def add_edge(self, u, v, directed=False):
        self.adj.setdefault(u, []).append(v)
        if not directed:
            self.adj.setdefault(v, []).append(u)

    def bfs_shortest_path(self, start, target):
        queue = deque([(start, 0)])
        visited = {start}
        while queue:
            node, dist = queue.popleft()
            if node == target:
                return dist
            for neighbor in self.adj.get(node, []):
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append((neighbor, dist + 1))
        return -1
```

### Workout 2: DFS Cycle Detection in Directed Graph (3-State Coloring)
```python
def has_cycle_directed(num_courses: int, prerequisites: list[list[int]]) -> bool:
    adj = {i: [] for i in range(num_courses)}
    for dest, src in prerequisites:
        adj[src].append(dest)

    # 0 = unvisited, 1 = visiting (in current path), 2 = completely visited
    visited = [0] * num_courses

    def dfs(node):
        if visited[node] == 1:
            return True  # Found cycle!
        if visited[node] == 2:
            return False
        visited[node] = 1
        for neighbor in adj[node]:
            if dfs(neighbor):
                return True
        visited[node] = 2
        return False

    for i in range(num_courses):
        if visited[i] == 0:
            if dfs(i):
                return True
    return False
```

### Workout 3: Number of Islands (Grid BFS/DFS, $O(R \\times C)$)
```python
def num_islands(grid: list[list[str]]) -> int:
    if not grid:
        return 0
    rows, cols = len(grid), len(grid[0])
    islands = 0

    def dfs(r, c):
        if r < 0 or c < 0 or r >= rows or c >= cols or grid[r][c] != '1':
            return
        grid[r][c] = '0'  # Mark visited
        dfs(r + 1, c)
        dfs(r - 1, c)
        dfs(r, c + 1)
        dfs(r, c - 1)

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == '1':
                islands += 1
                dfs(r, c)
    return islands
```

---

## 4. Problems from Coding Platforms
1. **LeetCode 200 - Number of Islands**: Connected component counting on 2D grid.
2. **LeetCode 133 - Clone Graph**: Deep copy graph using BFS/DFS and hash map.
3. **HackerRank - Breadth First Search: Shortest Reach**: BFS shortest distance calculations.
""",
        "questions": [
            {
                "question_text": "When is an Adjacency Matrix preferred over an Adjacency List?",
                "answer_text": "An Adjacency Matrix is preferred when the graph is dense (number of edges E approaches V^2), or when frequent O(1) checks are required to determine whether an edge exists between vertex u and vertex v without scanning neighbor lists.",
                "difficulty": "ADVANCED",
                "question_type": "INTERVIEW"
            }
        ],
        "resources": [
            {"title": "Visualgo Graph Traversals", "url": "https://visualgo.net/en/dfsbfs", "resource_type": "WEBSITE"}
        ]
    },

    # -------------------------------------------------------------
    # 13. Week 2: Applications
    # -------------------------------------------------------------
    {
        "slug": "dsa-week-2-applications",
        "title": "13. Week 2: Applications",
        "summary": "Real-world engineering applications of sorting, hash tables, stacks, queues, trees, BSTs, and graphs. Architectural selection matrix and problem-to-data-structure mapping.",
        "difficulty": "INTERMEDIATE",
        "learning_objective": "Map practical production software problems to optimal advanced data structures and algorithms.",
        "prerequisites": "Week 2 DSA Topics (8 through 12)",
        "expected_outcome": "Formulate system architecture trade-offs between Hash Tables, BSTs, and Graphs in production contexts.",
        "practice_requirement": "Design a complete data structure decision matrix for 5 common engineering scenarios.",
        "machine_task_relevance": "Key to passing architecture and algorithmic design evaluation benchmarks.",
        "practical_task_relevance": "Directly guides framework choices, message routing topologies, and index models.",
        "interview_relevance": "Critical in system design and high-level architecture screening loops.",
        "subtopics": [
            "Applications of sorting, hash tables, stacks, queues, trees, BST, graphs (write in own words)",
            "Which data structure to choose for which problem"
        ],
        "material": """# 13. Week 2: Applications

## 1. Data Structure Decision Matrix
| Problem Requirement | Optimal Data Structure | Why |
| :--- | :--- | :--- |
| **Instant Key-Value Lookup** | Hash Table (`dict`) | $O(1)$ average search, insert, and delete. |
| **Ordered Elements with Dynamic Min/Max** | Binary Search Tree / Red-Black Tree | Maintains strictly sorted order in $O(\\log n)$. |
| **LIFO Execution / Undo Buffers** | Stack | Pure $O(1)$ push and pop semantics. |
| **Fair FIFO Scheduling / Message Buffers** | Queue (`collections.deque`) | $O(1)$ append and popleft operations. |
| **Relationship Networks & Shortest Paths** | Graph (Adjacency List) | Models arbitrary multi-way networks with BFS/DFS. |
| **Hierarchical Data / File Systems** | Tree | Expresses recursive nested parent-child relationships. |

---

## 2. Real-World Applications
1. **Dependency Management (pip / npm / Docker builds)**:
   - Modeled as a Directed Acyclic Graph (DAG); resolved via **Topological Sorting** ($O(V + E)$).
2. **Web Browser History**:
   - Two **Stacks**: Back Stack and Forward Stack.
3. **Database B-Tree Indexing**:
   - Self-balancing n-ary tree keeping keys sorted for rapid range queries ($O(\\log n)$).
4. **Autocomplete Search Box**:
   - **Trie (Prefix Tree)** allows retrieving all strings sharing a prefix in $O(L)$ time where $L$ is query length.
""",
        "questions": [
            {
                "question_text": "Why do relational databases use B-Trees instead of Hash Indexes as their default index type?",
                "answer_text": "Hash indexes only support exact equality matches (WHERE id = 5) in O(1) time. They cannot perform range queries, sorting, or prefix searches (WHERE age BETWEEN 20 AND 30, ORDER BY date). B-Trees store data in sorted order, enabling both point lookups and efficient range scans in O(log n) time.",
                "difficulty": "INTERMEDIATE",
                "question_type": "INTERVIEW"
            }
        ],
        "resources": [
            {"title": "System Design Primer - Data Structures", "url": "https://github.com/donnemartin/system-design-primer", "resource_type": "WEBSITE"}
        ]
    },

    # -------------------------------------------------------------
    # 14. Practice Tracker
    # -------------------------------------------------------------
    {
        "slug": "dsa-practice-tracker",
        "title": "14. Practice Tracker",
        "summary": "Review, retention, and verification checklist for BM1 DSA technical workouts across HackerRank, CodeChef, LeetCode, and AlgoExpert.",
        "difficulty": "ADVANCED",
        "learning_objective": "Consolidate mastery across all Week 1 and Week 2 Brocamp technical workouts before the BM1 review.",
        "prerequisites": "All DSA Topics (1 through 13)",
        "expected_outcome": "Complete audit of complexity tables, problem sets, and workout code implementations.",
        "practice_requirement": "Solve 12 coding platform problems and recite complexity of all fundamental operations.",
        "machine_task_relevance": "Validates full readiness for the automated BM1 evaluation benchmark.",
        "practical_task_relevance": "Ensures problem-solving fluency under timed exam and interview conditions.",
        "interview_relevance": "Direct final checklist before live technical screening assessments.",
        "subtopics": [
            "Hacker Rank problems solved",
            "Code Chef problems solved",
            "Leet Code problems solved",
            "Algo Expert problems solved",
            "Revise the complexity table of all data structures",
            "Revise all sample workouts once before the review"
        ],
        "material": """# 14. Practice Tracker & Technical Review Checklist

## 1. Coding Platform Verification Target
- [ ] **HackerRank Problems**:
  1. Arrays - Left Rotation
  2. Making Anagrams
  3. Recursive Digit Sum
  4. Breadth First Search: Shortest Reach
- [ ] **CodeChef Problems**:
  1. TSORT - Turbo Sort
  2. HASH - Hash Table Lookup
  3. COMPONENT - Graph Components
- [ ] **LeetCode Problems**:
  1. LeetCode 1 - Two Sum
  2. LeetCode 20 - Valid Parentheses
  3. LeetCode 33 - Search in Rotated Sorted Array
  4. LeetCode 49 - Group Anagrams
  5. LeetCode 98 - Validate Binary Search Tree
  6. LeetCode 200 - Number of Islands
  7. LeetCode 206 - Reverse Linked List
- [ ] **AlgoExpert / System Problems**:
  1. Find Closest Value in BST
  2. Sunset Views
  3. Single Cycle Check

---

## 2. Final Review Checklist
1. Recite time and space complexity for Array, Linked List, Stack, Queue, Hash Table, BST, and Graph operations.
2. Dry-run linked list reversal and cycle detection on paper.
3. Code recursive DFS and iterative BFS from memory in under 5 minutes.
4. Verify all edge cases: Empty inputs, single-element collections, duplicate values, and boundary searches.
""",
        "questions": [
            {
                "question_text": "What is the recommended mental framework when approaching an unseen DSA problem in a technical interview?",
                "answer_text": "1. Clarify inputs, outputs, constraints, and edge cases (empty, duplicates, negatives). 2. State a brute-force approach and its Big-O. 3. Optimize using appropriate data structures (Hash Map for lookup, Two Pointers/Binary Search for sorted, Stack for nested/LIFO, Graph/Queue for shortest path). 4. Dry-run with an example before coding. 5. Write clean code and analyze final time and space complexity.",
                "difficulty": "ADVANCED",
                "question_type": "INTERVIEW"
            }
        ],
        "resources": [
            {"title": "LeetCode Top Interview Questions", "url": "https://leetcode.com/problemset/all/?listId=wpwgkgt", "resource_type": "WEBSITE"},
            {"title": "HackerRank Interview Preparation Kit", "url": "https://www.hackerrank.com/interview/interview-preparation-kit", "resource_type": "WEBSITE"}
        ]
    }
]
