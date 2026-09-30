import logging
import datetime
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base, ensure_schema_migrations
from app.models.entities import (
    User, Module, LearningArea, Topic, Material, Resource, Question, Task,
    UserTopicProgress, UserTaskProgress, UserProgress, ActivityLog
)
from app.services.progression import ProgressionEngine
from app.seed.dsa_curriculum_data import DSA_TOPICS
from app.seed.data_handling_curriculum_data import DATA_HANDLING_TOPICS

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("lift.curriculum")

def import_real_bm1_curriculum():
    """
    Imports the REAL BM1 Curriculum into the database as structured data.
    - Python (9 Comprehensive Topics covering Fundamentals, Data Structures, Functions, Modules & Files,
      Exceptions, OOPs, Advanced Internals & Concurrency, Testing & Tooling, and Revision & Practice)
    - Week 1 Technical Workouts from image (Data Handling & Visualization, DSA, Math & Stats, ML Concepts, SQL, Live Project)
    - Maintains shared curriculum across users while preserving user-specific progress.
    - Keeps BM2 and TOI locked.
    """
    logger.info("Starting Real BM1 Curriculum Import...")
    ensure_schema_migrations(engine)
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        # 1. Ensure BM1, BM2, TOI Modules exist
        bm1 = db.query(Module).filter(Module.code == "BM1").first()
        if not bm1:
            bm1 = Module(
                code="BM1",
                title="BM1 — Foundations & Core Knowledge",
                description="First stage mastery: Python, NumPy, Pandas, Matplotlib, Data Structures, Mathematics & Statistics, ML, and SQL.",
                order_index=1
            )
            db.add(bm1)
            db.commit()
            db.refresh(bm1)

        bm2 = db.query(Module).filter(Module.code == "BM2").first()
        if not bm2:
            bm2 = Module(
                code="BM2",
                title="BM2 — Advanced Systems & Engineering",
                description="Second stage: Advanced ML pipelines, distributed architectures, model serving, and high-scale data systems.",
                order_index=2
            )
            db.add(bm2)
            db.commit()
            db.refresh(bm2)

        toi = db.query(Module).filter(Module.code == "TOI").first()
        if not toi:
            toi = Module(
                code="TOI",
                title="TOI — Technical Preparation & Evaluation",
                description="Final stage: Vertical mastery, live Machine Tasks, and Practical Scenario assessments.",
                order_index=3
            )
            db.add(toi)
            db.commit()
            db.refresh(toi)

        # 2. Ensure Learning Areas for BM1 (Based on Week 1 Technical Workouts)
        areas_config = [
            {
                "code": "python",
                "title": "Python",
                "description": "Full revision checklist: Basics, Data Structures, Functions, Files, Exceptions, OOPs, Advanced Internals, Testing, and Workouts.",
                "icon": "code",
                "order_index": 1,
            },
            {
                "code": "data-handling",
                "title": "Data Handling & Visualization",
                "description": "Practice NumPy, Pandas, and Matplotlib for high-performance vectorized operations, data manipulation, and visual storytelling.",
                "icon": "bar-chart-2",
                "order_index": 2,
            },
            {
                "code": "dsa",
                "title": "Data Structures & Algorithms",
                "description": "Revise arrays, linked lists, trees, graphs, searching, and sorting with time and space complexity analysis.",
                "icon": "layers",
                "order_index": 3,
            },
            {
                "code": "statistics",
                "title": "Mathematics & Statistics",
                "description": "Descriptive statistics, probability, distributions, hypothesis testing, calculus/derivatives, linear algebra (matrices, eigenvalues), PCA, regression.",
                "icon": "pie-chart",
                "order_index": 4,
            },
            {
                "code": "ml-concepts",
                "title": "Machine Learning Concepts",
                "description": "Data preprocessing, exploratory data analysis (EDA), classification, regression, clustering algorithms, and model evaluation metrics.",
                "icon": "cpu",
                "order_index": 5,
            },
            {
                "code": "sql",
                "title": "SQL for Data & ML",
                "description": "SQL topics covering queries, filtering, complex joins, aggregations, window functions, and schema design.",
                "icon": "database",
                "order_index": 6,
            },
            {
                "code": "live-project",
                "title": "Live Project & Presentation",
                "description": "Prepare for technical project presentation: live deployment link and public GitHub repository verification.",
                "icon": "globe",
                "order_index": 7,
            },
        ]

        areas_map = {}
        for ac in areas_config:
            area = db.query(LearningArea).filter(
                LearningArea.module_id == bm1.id,
                LearningArea.code == ac["code"]
            ).first()
            if not area:
                area = LearningArea(
                    module_id=bm1.id,
                    code=ac["code"],
                    title=ac["title"],
                    description=ac["description"],
                    icon=ac["icon"],
                    order_index=ac["order_index"]
                )
                db.add(area)
                db.commit()
                db.refresh(area)
            else:
                area.title = ac["title"]
                area.description = ac["description"]
                area.order_index = ac["order_index"]
                db.commit()
            areas_map[ac["code"]] = area

        area_py = areas_map["python"]

        # 3. Comprehensive Python Topics (The 9 Real Sections Provided by User)
        python_topics_data = [
            {
                "slug": "python-setup-and-fundamentals",
                "title": "1. Setup, Fundamentals & Control Flow",
                "order_index": 1,
                "difficulty": "BEGINNER",
                "estimated_minutes": 90,
                "summary": "Python language setup, execution model, dynamic typing, fundamental data types, operator precedence, string operations, and control flow mechanics.",
                "learning_objective": "Master the Python environment setup, virtual environments, type system, operator semantics, string immutability, pattern matching, and loop control structures.",
                "prerequisites": "None. Foundational starting point for all Python engineering.",
                "expected_outcome": "Ability to configure reproducible Python environments, use Walrus operators, perform advanced string manipulation, and write idiomatic control flow with match-case and loop-else constructs.",
                "practice_requirement": "Complete exercises on string slicing, match-case structural pattern matching, and write a script utilizing sys.argv, input casting, and virtual environment isolation.",
                "machine_task_relevance": "Prerequisite for creating CLI test harnesses, data ingestion scripts, and parsing text files in weekly machine challenges.",
                "practical_task_relevance": "Essential for setting up reproducible virtual environments, reading input parameters, and structuring scripts cleanly.",
                "interview_relevance": "Interpreted vs compiled, mutable vs immutable types, is vs ==, chained comparisons, Walrus operator, loop else behavior.",
                "subtopics": [
                    "Introduction and setup: What is Python, features, interpreted vs compiled, Installing Python, pip, PATH",
                    "Virtual environments: venv, pip install, requirements.txt, pyproject.toml",
                    "Running scripts, REPL, __name__ == '__main__'",
                    "Comments, docstrings, PEP 8 style, indentation",
                    "Variables and naming: Dynamic typing, assignment, multiple assignment, naming rules, keywords, constants convention, id(), type(), isinstance(), del",
                    "Data types: int, float, complex, bool (truthy/falsy values), str, None (NoneType), type conversion, mutable vs immutable types",
                    "Operators: Arithmetic, comparison, logical with short-circuiting, augmented assignment, bitwise (&, |, ^, ~, <<, >>), identity (is) vs equality (==), membership (in), Walrus operator (:=), precedence",
                    "Input and output: print(sep, end, file, flush), input() casting, formatting (%, str.format(), f-strings, format specifiers)",
                    "Strings in depth: Indexing, slicing, negative indexes, step, immutability, escape sequences, raw strings, multiline strings, string methods, Unicode and encode/decode",
                    "Control flow: if, elif, else, ternary expressions, match-case pattern matching, truthiness in conditions",
                    "Loops: for loop with range(), while loop, break, continue, pass, loop else clause, nested loops, enumerate(), zip(), reversed(), sorted()"
                ],
                "material": """# Python Setup, Fundamentals & Control Flow

### Execution Model: Interpreted vs Compiled
Python source code (`.py`) is compiled into bytecode (`.pyc`) by the CPython interpreter, which is then executed on the Python Virtual Machine (PVM).

### The `__name__ == '__main__'` Idiom
Allows a module to be both imported into other modules without running top-level script logic, or run directly as an executable script.

```python
def main():
    print("Executed directly")

if __name__ == "__main__":
    main()
```

### Identity (`is`) vs Equality (`==`)
* `==` checks value equality (`__eq__`).
* `is` checks object memory identity (`id(a) == id(b)`).
* Small integer caching ([-5, 256]) and string interning can lead to subtle gotchas if `is` is misused instead of `==`.

### Walrus Operator (`:=`)
Assigns values to variables as part of a larger expression:
```python
while (line := input("Enter data (or exit): ")) != "exit":
    print(f"Processing {line}")
```

### Match-Case (Structural Pattern Matching - Python 3.10+)
```python
def process_command(cmd):
    match cmd:
        case ["load", filename]:
            print(f"Loading {filename}")
        case ["save", filename, *options]:
            print(f"Saving {filename} with {options}")
        case _:
            print("Unknown command")
```
""",
                "questions": [
                    {
                        "question_text": "What is the difference between `is` and `==` in Python? When can `a == b` be True but `a is b` False?",
                        "answer_text": "`==` checks value equality by calling `__eq__()`, comparing whether two objects have equivalent content. `is` checks memory identity by comparing memory addresses (`id(a) == id(b)`). Example: `a = [1, 2, 3]` and `b = [1, 2, 3]`. Here `a == b` is True (contents are identical), but `a is b` is False because they reside at different heap memory addresses.",
                        "difficulty": "BEGINNER",
                        "question_type": "INTERVIEW"
                    },
                    {
                        "question_text": "How does the loop `else` clause work in Python for `for` and `while` loops?",
                        "answer_text": "The `else` clause of a loop executes ONLY if the loop completes normally without encountering a `break` statement. If the loop terminates via `break`, the `else` block is skipped. It is commonly used for search loops where you want to execute fallback code when no match was found.",
                        "difficulty": "INTERMEDIATE",
                        "question_type": "CONCEPTUAL"
                    }
                ],
                "task": {
                    "title": "Implement CLI Argument & Structural String Parser",
                    "description": "Write a script that validates user-provided email and phone formats using match-case and string methods without external regex libraries, accepting arguments via input() or sys.argv.",
                    "task_type": "CODING",
                    "priority": "HIGH"
                },
                "resources": [
                    {"title": "Python 3 Official Tutorial - Control Flow", "url": "https://docs.python.org/3/tutorial/controlflow.html", "resource_type": "DOCUMENTATION"},
                    {"title": "PEP 636 - Structural Pattern Matching Tutorial", "url": "https://peps.python.org/pep-0636/", "resource_type": "DOCUMENTATION"}
                ]
            },
            {
                "slug": "python-data-structures",
                "title": "2. Data Structures & Collections",
                "order_index": 2,
                "difficulty": "INTERMEDIATE",
                "estimated_minutes": 120,
                "summary": "Deep dive into Python's built-in collections: lists, tuples, sets, dictionaries, comprehension syntax, shallow vs deep copying, and specialized collections (deque, Counter, defaultdict, heapq, bisect).",
                "learning_objective": "Master time complexity, memory characteristics, and idiomatic use cases of list comprehensions, dictionary merging, set operations, and standard library collections.",
                "prerequisites": "Variables, types, and loops in Python.",
                "expected_outcome": "Competency in choosing optimal data structures for O(1) lookups, implementing stacks/queues via deque, and writing clean comprehensions with condition filters.",
                "practice_requirement": "Implement a frequency counter, custom LRU cache skeleton using OrderedDict/deque, and demonstrate shallow vs deep copy implications on nested lists.",
                "machine_task_relevance": "High: Feature engineering, data manipulation, indexing token streams, and lookup caching in machine learning workflows.",
                "practical_task_relevance": "Directly impacts algorithm runtime and memory consumption in data pipelines.",
                "interview_relevance": "Time complexity of dict/set operations (hash table collisions, load factor), shallow vs deep copy, insertion order in Python dicts (since 3.7), namedtuple vs dataclass.",
                "subtopics": [
                    "Lists: Creating, indexing, slicing, append, extend, insert, remove, pop, clear, index, count",
                    "List sorting: sort() in-place (Timsort) vs sorted(), key and reverse params",
                    "Copying: Assignment (=) vs shallow copy (copy(), slice [:]) vs deep copy (copy.deepcopy())",
                    "Nested lists, 2D matrices, multi-dimensional structures",
                    "List comprehensions: conditional filtering, nested comprehensions",
                    "Unpacking: Tuple/list unpacking, star unpacking (*rest)",
                    "Tuples: Creation, single element comma pitfall, immutability, packing/unpacking, use cases, namedtuple",
                    "Sets: Hashable requirements, uniqueness, set operations (union |, intersection &, difference -, symmetric diff ^), issubset, frozenset, set comprehensions",
                    "Dictionaries: Hash map internals, keys/values/items, get(), setdefault(), update(), dict comprehensions",
                    "Dict merging: update(), | operator (PEP 584), ** kwargs unpacking",
                    "Insertion order guarantee (Python 3.7+ language specification)",
                    "collections module: defaultdict, OrderedDict, Counter, ChainMap",
                    "Specialized structures: array module, collections.deque, heapq (min-heap), bisect (binary search)",
                    "Stack and Queue implementations using deque vs list"
                ],
                "material": """# Python Data Structures & Collections

### Core Time Complexities
| Structure | Access | Search | Insert | Delete |
|:---|:---|:---|:---|:---|
| `list` | O(1) | O(n) | Append: O(1)* amortized, Insert(0): O(n) | Pop(): O(1), Pop(0): O(n) |
| `collections.deque` | O(n) | O(n) | Append left/right: O(1) | Pop left/right: O(1) |
| `dict` | N/A | Key: O(1) avg | O(1) avg | O(1) avg |
| `set` | N/A | O(1) avg | O(1) avg | O(1) avg |

### Shallow Copy vs Deep Copy
```python
import copy

original = [[1, 2, 3], [4, 5, 6]]
shallow = list(original)       # or original.copy()
deep = copy.deepcopy(original)

original[0][0] = 999
# shallow[0][0] is now 999 (nested references are shared!)
# deep[0][0] is still 1 (completely independent memory tree)
```

### Dict Merging (Python 3.9+)
```python
d1 = {"a": 1, "b": 2}
d2 = {"b": 99, "c": 3}
merged = d1 | d2  # {'a': 1, 'b': 99, 'c': 3}
```
""",
                "questions": [
                    {
                        "question_text": "Why is using a `list` as a queue (using `pop(0)`) inefficient in Python, and what is the recommended alternative?",
                        "answer_text": "In a Python `list`, elements are stored contiguously in memory. Calling `pop(0)` removes the first element and shifts all remaining n-1 elements left by one index, resulting in an O(n) linear time operation. The recommended alternative is `collections.deque`, which is implemented as a doubly linked list of blocks, allowing O(1) amortized `popleft()` and `appendleft()` operations.",
                        "difficulty": "INTERMEDIATE",
                        "question_type": "INTERVIEW"
                    },
                    {
                        "question_text": "How do dictionary keys work in Python, and why can't a `list` be a dictionary key?",
                        "answer_text": "Python dictionaries are hash maps that rely on hashing keys to compute table indices. A dictionary key must be 'hashable', meaning it must have an immutable hash value that never changes during its lifetime (`__hash__`) and can be compared to other objects (`__eq__`). Because lists are mutable and their contents can change, their hash value would change, which would corrupt the hash table bucket. Hence lists are unhashable (`TypeError: unhashable type: 'list'`).",
                        "difficulty": "INTERMEDIATE",
                        "question_type": "CONCEPTUAL"
                    }
                ],
                "task": {
                    "title": "Implement an In-Memory Word Frequency & Sliding Window Indexer",
                    "description": "Using `collections.Counter` and `collections.deque`, write an efficient sliding window word frequency analyzer that processes a text stream with O(1) window updates.",
                    "task_type": "CODING",
                    "priority": "HIGH"
                },
                "resources": [
                    {"title": "Python Documentation - Data Structures", "url": "https://docs.python.org/3/tutorial/datastructures.html", "resource_type": "DOCUMENTATION"},
                    {"title": "Python Collections Module Reference", "url": "https://docs.python.org/3/library/collections.html", "resource_type": "DOCUMENTATION"}
                ]
            },
            {
                "slug": "python-functions-and-scopes",
                "title": "3. Functions, Arguments & Scope (LEGB)",
                "order_index": 3,
                "difficulty": "INTERMEDIATE",
                "estimated_minutes": 105,
                "summary": "Function definitions, default arguments, *args/**kwargs, keyword-only and positional-only arguments, call-by-object-reference, and variable scope resolution (LEGB rule).",
                "learning_objective": "Master function signatures, prevent the dangerous mutable default argument pitfall, use nonlocal and global appropriately, and apply functional utilities (map, filter, reduce).",
                "prerequisites": "Python setup and data structures.",
                "expected_outcome": "Ability to write flexible, reusable function interfaces, avoid scope leakage bugs, and leverage first-class function mechanics.",
                "practice_requirement": "Refactor a buggy codebase suffering from the mutable default argument trap, and implement a recursive memoized accumulator.",
                "machine_task_relevance": "Critical for creating data transformation functions, parameter grids, and pipeline preprocessing components.",
                "practical_task_relevance": "Clean API design for reusable libraries and utility modules.",
                "interview_relevance": "The Mutable Default Argument gotcha (one of the most asked Python questions), LEGB scope resolution, pass-by-object-reference vs pass-by-value/reference.",
                "subtopics": [
                    "Defining and calling functions: def, return, multiple return values (tuple packing), None return by default",
                    "Docstrings (PEP 257) and type annotations (PEP 484)",
                    "Arguments: Positional vs keyword arguments",
                    "Default arguments and the Mutable Default Argument trap (def func(arg=[]))",
                    "Variadic arguments: *args (tuple) and **kwargs (dict)",
                    "Keyword-only arguments (*) and positional-only arguments (/) (PEP 570)",
                    "Argument unpacking: *list / **dict at call site",
                    "Parameter passing semantics: Pass by object reference / pass-by-assignment",
                    "Scope and namespace: The LEGB rule (Local, Enclosing, Global, Built-in)",
                    "Scope modification keywords: global and nonlocal",
                    "Special functions: Lambda expressions, map(), filter(), functools.reduce()",
                    "Math & numeric built-ins: any(), all(), sum(), min(), max(), abs(), round(), divmod(), pow()",
                    "Recursion: base case, stack frames, sys.getrecursionlimit() and sys.setrecursionlimit()",
                    "Nested / inner functions and closure setup",
                    "Key built-ins: len, type, isinstance, dir, help, vars, callable, id, hash, eval, exec, zip, enumerate, sorted, reversed, iter, next, range"
                ],
                "material": """# Python Functions, Arguments & Scopes

### The Mutable Default Argument Pitfall
Default argument expressions are evaluated **once when the function definition is executed**, not every time the function is called!

```python
# BUGGY:
def append_item(val, target_list=[]):
    target_list.append(val)
    return target_list

# Correct Idiomatic Pattern:
def append_item(val, target_list=None):
    if target_list is None:
        target_list = []
    target_list.append(val)
    return target_list
```

### Positional-Only and Keyword-Only Markers
```python
def configure(host, port, /, timeout=30, *, debug=False):
    # host, port: Positional only (cannot be called configure(host="localhost"))
    # timeout: Can be positional or keyword
    # debug: Keyword only (must be called configure(..., debug=True))
    pass
```

### LEGB Scope Rule
1. **L**ocal: Inside the current function.
2. **E**nclosing: In any outer enclosing defs (for nested functions).
3. **G**lobal: Module level (`global x`).
4. **B**uilt-in: Python builtins namespace (`len`, `range`).
""",
                "questions": [
                    {
                        "question_text": "Explain what happens when a function with a default parameter like `def add_to(item, items=[])` is called multiple times without passing `items`.",
                        "answer_text": "Because Python evaluates default arguments once at function definition time (not at invocation time), `items` references the exact same list object in heap memory across all subsequent calls. Modifying `items.append(item)` mutates that single shared list. On the second call, `items` will already contain the elements from the first call. To fix it, use `items=None` and initialize `items = []` inside the function body.",
                        "difficulty": "BEGINNER",
                        "question_type": "INTERVIEW"
                    },
                    {
                        "question_text": "What is the difference between `global` and `nonlocal` in Python?",
                        "answer_text": "`global` declares that a variable refers to the module-level (top-level) namespace. `nonlocal` (introduced in Python 3) is used inside nested functions to bind a variable in the nearest enclosing (outer) function's scope, without binding it to the global scope.",
                        "difficulty": "INTERMEDIATE",
                        "question_type": "CONCEPTUAL"
                    }
                ],
                "task": {
                    "title": "Build a Configurable Data Pipeline Filter Using Closures & *args/**kwargs",
                    "description": "Construct a higher-order pipeline function accepting variadic filters, positional-only thresholds, and keyword-only logging flags.",
                    "task_type": "CODING",
                    "priority": "MEDIUM"
                },
                "resources": [
                    {"title": "Python Docs - Defining Functions", "url": "https://docs.python.org/3/tutorial/controlflow.html#defining-functions", "resource_type": "DOCUMENTATION"}
                ]
            },
            {
                "slug": "python-modules-packages-and-files",
                "title": "4. Modules, Packages, File I/O & Regex",
                "order_index": 4,
                "difficulty": "INTERMEDIATE",
                "estimated_minutes": 120,
                "summary": "Import mechanics, sys.path, package initialization with __init__.py, standard library essentials, context managers for file I/O, CSV/JSON handling, and regular expressions (re).",
                "learning_objective": "Architect clean modular Python codebases, manage package imports without circular dependency issues, safely perform file operations using pathlib, and parse unstructured text with regex.",
                "prerequisites": "Functions, data structures, and string methods.",
                "expected_outcome": "Competency in writing maintainable packages, using pathlib.Path for cross-platform file paths, and parsing log formats with regular expressions.",
                "practice_requirement": "Build a modular package containing data loaders for CSV and JSON files with regex pattern extractors for dates and emails.",
                "machine_task_relevance": "Very high: In machine tasks, students frequently parse raw logs, read configuration files, and load training CSV datasets.",
                "practical_task_relevance": "Directly used in production backend services and data engineering workflows.",
                "interview_relevance": "How sys.path resolution works, circular imports and how to resolve them, relative vs absolute imports, with statement internals (context manager protocol), regex greedy vs non-greedy matching.",
                "subtopics": [
                    "Modules and packages: import, from ... import, as alias, import * (namespace pollution risk)",
                    "Creating your own module and package structure (__init__.py, __all__ export list)",
                    "Module search path: sys.path resolution, PYTHONPATH, module caching in sys.modules",
                    "Relative imports (from . import) vs absolute imports, diagnosing and fixing circular imports",
                    "Packaging tools: pip, PyPI, requirements.txt, pyproject.toml",
                    "Standard library essentials: math, statistics, datetime, zoneinfo, os, sys, pathlib, shutil, glob, json, csv, pickle",
                    "File handling: open() modes (r, w, a, x, b, +), read, readline, readlines, write, writelines",
                    "The with statement (context managers): deterministic file handle closure",
                    "File pointer: seek() and tell()",
                    "Working with CSV (csv.reader, csv.DictReader) and JSON (json.dump, json.load, json.dumps, json.loads)",
                    "pathlib.Path: cross-platform path manipulation, exists(), is_file(), glob(), rglob(), mkdir()",
                    "Regular expressions (re): match vs search vs findall vs finditer, sub, split, compile",
                    "Regex syntax: metacharacters, character classes, quantifiers, capturing groups, named groups (?P<name>), greedy vs lazy quantifiers, flags (re.IGNORECASE, re.MULTILINE)"
                ],
                "material": r"""# Modules, Packages, File Handling & Regex

### Deterministic File Handling with `pathlib`
```python
from pathlib import Path
import json

data_dir = Path("data")
data_dir.mkdir(parents=True, exist_ok=True)
file_path = data_dir / "config.json"

# Safe context manager write
payload = {"version": "1.0", "status": "active"}
with file_path.open("w", encoding="utf-8") as f:
    json.dump(payload, f, indent=2)

# Reading back
if file_path.exists():
    with file_path.open("r", encoding="utf-8") as f:
        loaded = json.load(f)
```

### Regular Expressions: Named Groups
```python
import re

log_pattern = re.compile(r"^(?P<ip>\d{1,3}(?:\.\d{1,3}){3}) - (?P<status>\d{3})")
match = log_pattern.match("192.168.1.1 - 200")
if match:
    print(match.groupdict())  # {'ip': '192.168.1.1', 'status': '200'}
```
""",
                "questions": [
                    {
                        "question_text": "What causes circular import errors in Python, and what are two idiomatic ways to fix them?",
                        "answer_text": "A circular import occurs when Module A imports Module B, and Module B imports Module A during module initialization before either has finished executing its top-level definitions. Two ways to fix it: 1) Refactor shared classes/functions into a third module (Module C) that both A and B import; 2) Move the import inside the specific function or method where it is needed (deferred / local import) rather than at top-level.",
                        "difficulty": "INTERMEDIATE",
                        "question_type": "INTERVIEW"
                    },
                    {
                        "question_text": "What is the difference between `re.match()` and `re.search()` in Python?",
                        "answer_text": "`re.match()` only checks for a match at the beginning of the string (index 0). If the pattern does not match the very first character, it returns None. `re.search()` scans through the entire string looking for the first location where the pattern matches anywhere in the string.",
                        "difficulty": "BEGINNER",
                        "question_type": "CONCEPTUAL"
                    }
                ],
                "task": {
                    "title": "Build a Structured Log Ingestion and Extraction Engine",
                    "description": "Write a script that reads an access log file, extracts IP addresses, HTTP status codes, and endpoints using named regex groups, and writes a summary report to JSON.",
                    "task_type": "PRACTICE",
                    "priority": "HIGH"
                },
                "resources": [
                    {"title": "Python pathlib - Object-oriented filesystem paths", "url": "https://docs.python.org/3/library/pathlib.html", "resource_type": "DOCUMENTATION"},
                    {"title": "Python re Module - Regular Expressions", "url": "https://docs.python.org/3/library/re.html", "resource_type": "DOCUMENTATION"}
                ]
            },
            {
                "slug": "python-exceptions-and-error-handling",
                "title": "5. Exceptions, Error Handling & Debugging",
                "order_index": 5,
                "difficulty": "INTERMEDIATE",
                "estimated_minutes": 90,
                "summary": "Exception hierarchy, try-except-else-finally control flow, custom exception classes, exception chaining (raise from), Python 3.11 ExceptionGroups, and EAFP vs LBYL philosophy.",
                "learning_objective": "Write robust, production-grade error handling without swallowing exceptions, debug tracebacks with pdb/breakpoint, and build custom exception hierarchies for domain models.",
                "prerequisites": "Functions and module architecture.",
                "expected_outcome": "Ability to write fail-fast, resilient applications that log actionable diagnostics and safely clean up resources under failure conditions.",
                "practice_requirement": "Implement a resilient API fetcher with retry logic, custom domain exceptions, and detailed logging of caught exceptions.",
                "machine_task_relevance": "Critical: Machine tasks test for defensive programming, preventing unexpected runtime crashes when processing malformed inputs.",
                "practical_task_relevance": "Direct impact on production reliability and telemetry.",
                "interview_relevance": "EAFP vs LBYL, why bare `except:` is an anti-pattern, exception chaining (`raise ... from None` vs `from e`), order of execution in try/except/else/finally.",
                "subtopics": [
                    "Error classification: Syntax errors vs runtime exceptions vs logical bugs",
                    "Reading tracebacks: Frame analysis and error pinpointing",
                    "Python exception hierarchy: BaseException, Exception, SystemExit, KeyboardInterrupt",
                    "Common built-ins: ValueError, TypeError, KeyError, IndexError, AttributeError, FileNotFoundError, ZeroDivisionError, StopIteration, RecursionError",
                    "try / except / else / finally flow: when else runs, when finally guarantees execution",
                    "Catching multiple exceptions in a tuple, multiple except blocks",
                    "Why bare except: and except Exception: without logging are dangerous anti-patterns",
                    "Exception object inspection with as e and traceback module",
                    "Raising and re-raising: raise, raise ... from cause (exception chaining)",
                    "Custom exceptions: subclassing Exception, adding domain metadata and error codes",
                    "Modern features: ExceptionGroups and except* (Python 3.11+), add_note()",
                    "Coding philosophy: EAFP (Easier to Ask for Forgiveness than Permission) vs LBYL (Look Before You Leap)",
                    "Debugging tools: breakpoint(), pdb commands (n, s, c, p, q), logging.exception"
                ],
                "material": """# Exceptions & Error Handling in Python

### The `try / except / else / finally` Sequence
* **`try`**: Code that might fail.
* **`except`**: Executes if matching exception occurs.
* **`else`**: Executes **only if no exception occurred** in `try`.
* **`finally`**: Executes **always**, regardless of whether an exception occurred, was caught, or was re-raised.

```python
try:
    f = open("data.csv", "r")
except FileNotFoundError as e:
    logger.error("File missing: %s", e)
else:
    process_data(f)
finally:
    if 'f' in locals() and not f.closed:
        f.close()
```

### Exception Chaining (`raise ... from ...`)
```python
class DatabaseConnectionError(Exception):
    pass

try:
    connect_to_postgres()
except OSError as err:
    raise DatabaseConnectionError("Failed to reach DB cluster") from err
```
""",
                "questions": [
                    {
                        "question_text": "What is the difference between EAFP and LBYL programming styles in Python?",
                        "answer_text": "LBYL ('Look Before You Leap') tests preconditions before performing an action (e.g. `if key in dict: return dict[key]`). EAFP ('Easier to Ask for Forgiveness than Permission') assumes valid preconditions and catches exceptions if they fail (e.g. `try: return dict[key] except KeyError: ...`). Python strongly prefers EAFP because it is more concise, avoids race conditions (TOCTOU: Time of Check to Time of Use in file/network operations), and is faster in the typical happy path.",
                        "difficulty": "INTERMEDIATE",
                        "question_type": "INTERVIEW"
                    },
                    {
                        "question_text": "Why should you never use a bare `except:` clause in Python?",
                        "answer_text": "A bare `except:` catches all subclasses of `BaseException`, including `SystemExit`, `KeyboardInterrupt` (Ctrl+C), and `GeneratorExit`. This prevents scripts from terminating cleanly and makes interruptions impossible. At minimum, catch `except Exception:` to only trap standard program errors, and preferably catch specific exceptions.",
                        "difficulty": "BEGINNER",
                        "question_type": "CONCEPTUAL"
                    }
                ],
                "task": {
                    "title": "Construct a Resilient Custom Exception Hierarchy with Telemetry",
                    "description": "Design a domain-specific exception hierarchy for an automated data validation system with error codes, timestamping, and structured logging.",
                    "task_type": "PRACTICE",
                    "priority": "HIGH"
                },
                "resources": [
                    {"title": "Python Built-in Exceptions Hierarchy", "url": "https://docs.python.org/3/library/exceptions.html", "resource_type": "DOCUMENTATION"}
                ]
            },
            {
                "slug": "python-oops-concepts",
                "title": "6. Object-Oriented Programming (OOPs)",
                "order_index": 6,
                "difficulty": "ADVANCED",
                "estimated_minutes": 150,
                "summary": "Classes, objects, constructors, self, instance vs class vs static methods, the 4 pillars (encapsulation, abstraction, inheritance, polymorphism), MRO (C3 linearization), magic dunder methods, dataclasses, and design patterns.",
                "learning_objective": "Architect scalable object-oriented systems, master method resolution order in multiple inheritance, implement protocol interfaces and abstract base classes, and leverage dunder methods for custom types.",
                "prerequisites": "Functions, data structures, and exception handling.",
                "expected_outcome": "Competency in writing production-grade OOP models using dataclasses, property decorators, slots for memory optimization, and custom dunder operators.",
                "practice_requirement": "Design a complete Banking / Account or Machine Task evaluation system featuring abstract base classes, property setters/getters, and magic method overloads.",
                "machine_task_relevance": "Very High: Standard pattern for modeling pipelines, estimators, and custom neural net / dataset objects.",
                "practical_task_relevance": "Foundation of Python frameworks like PyTorch, FastAPI, Django, and Scikit-learn.",
                "interview_relevance": "MRO and C3 linearization (the diamond problem), super() behavior, @classmethod vs @staticmethod, __new__ vs __init__, __slots__ memory optimization, encapsulation conventions.",
                "subtopics": [
                    "Classes and objects: class keyword, instance instantiation, __init__ constructor, self reference",
                    "Attributes: instance attributes vs class attributes (class namespace sharing)",
                    "Method types: instance methods, class methods (@classmethod with cls), static methods (@staticmethod)",
                    "Introspection: type(), isinstance(), issubclass(), dir(), vars()",
                    "Encapsulation: public, protected (_var), private (__var) conventions, name mangling (_ClassName__var)",
                    "Properties: @property getter, @prop.setter, @prop.deleter",
                    "Abstraction: abc module, ABC, @abstractmethod, interfaces via Abstract Base Classes and typing.Protocol",
                    "Inheritance: single, multiple, multilevel, hierarchical, and hybrid inheritance",
                    "The Diamond Problem and super() mechanics: cooperative multiple inheritance",
                    "Method Resolution Order (MRO): C3 linearization algorithm, Class.mro() and Class.__mro__",
                    "Mixins: design patterns for reusable modular functionality",
                    "Polymorphism: duck typing ('if it walks like a duck...'), method overriding, operator overloading",
                    "Magic (dunder) methods: __str__ vs __repr__, __len__, __getitem__, __setitem__, __delitem__, __contains__",
                    "Callable instances: __call__",
                    "Comparison operators: __eq__, __lt__, __gt__, functools.total_ordering",
                    "Arithmetic operators: __add__, __sub__, __mul__, __truediv__, __radd__, __iadd__",
                    "Context managers: __enter__ and __exit__",
                    "Object creation internals: __new__ (allocator) vs __init__ (initializer)",
                    "Memory optimization: __slots__ to eliminate per-instance __dict__ overhead",
                    "Modern OOP: @dataclass (frozen, order, field, default_factory, __post_init__), Enum, NamedTuple",
                    "Composition vs Inheritance ('has-a' vs 'is-a'), SOLID principles in Python"
                ],
                "material": """# Object-Oriented Programming (OOP) in Python

### Method Types: Instance, Class, Static
```python
class ModelRunner:
    default_precision = "float32"

    def __init__(self, model_name):
        self.model_name = model_name

    def run(self, inputs):  # Instance method (receives self)
        return f"Executing {self.model_name} with {self.default_precision}"

    @classmethod
    def set_precision(cls, precision):  # Class method (receives cls)
        cls.default_precision = precision

    @staticmethod
    def validate_tensor(tensor):  # Static method (no self or cls)
        return hasattr(tensor, "shape")
```

### The Diamond Problem & MRO
Python uses the C3 Linearization algorithm to calculate Method Resolution Order (`__mro__`):
```python
class A:
    def ping(self): print("A")

class B(A):
    def ping(self): print("B"); super().ping()

class C(A):
    def ping(self): print("C"); super().ping()

class D(B, C):
    def ping(self): print("D"); super().ping()

# D.mro() -> [D, B, C, A, object]
# d = D(); d.ping() -> prints D, B, C, A cooperatively
```

### `__slots__` Memory Optimization
Disables the dynamic per-instance `__dict__`, reducing RAM consumption by up to 50% for millions of objects:
```python
class Point:
    __slots__ = ("x", "y")
    def __init__(self, x, y):
        self.x = x
        self.y = y
```
""",
                "questions": [
                    {
                        "question_text": "What is the difference between `__str__` and `__repr__` in Python, and when is each called?",
                        "answer_text": "`__repr__` is intended to provide an unambiguous, formal representation of the object, primarily for developers and debugging (ideally executable Python code that could recreate the object). It is invoked by `repr(obj)` and in the REPL. `__str__` is intended to provide a human-readable, user-facing string representation and is called by `print()` and `str()`. If `__str__` is not defined on a class, Python falls back to `__repr__`.",
                        "difficulty": "INTERMEDIATE",
                        "question_type": "INTERVIEW"
                    },
                    {
                        "question_text": "How does `super()` work in Python multiple inheritance, and why is it preferred over explicit parent class calls like `Parent.__init__(self)`?",
                        "answer_text": "`super()` does not simply call the immediate parent class; it follows the class's Method Resolution Order (MRO) using C3 Linearization. When using cooperative multiple inheritance, `super()` ensures every ancestor in the inheritance diamond is visited exactly once in the correct order. Explicitly calling `Parent.__init__(self)` breaks the cooperative chain and can cause ancestor initializers to be invoked multiple times or skipped entirely.",
                        "difficulty": "ADVANCED",
                        "question_type": "INTERVIEW"
                    }
                ],
                "task": {
                    "title": "Design a Scalable Bank Account & Transaction System with OOP",
                    "description": "Implement an abstract Account base class with Encapsulation (private balance, property accessors), subclassed SavingsAccount and CheckingAccount with fee overrides and total_ordering comparisons.",
                    "task_type": "CODING",
                    "priority": "HIGH"
                },
                "resources": [
                    {"title": "Python Docs - Classes and OOP", "url": "https://docs.python.org/3/tutorial/classes.html", "resource_type": "DOCUMENTATION"},
                    {"title": "Python dataclasses module reference", "url": "https://docs.python.org/3/library/dataclasses.html", "resource_type": "DOCUMENTATION"}
                ]
            },
            {
                "slug": "python-advanced-internals-concurrency",
                "title": "7. Advanced Python, Concurrency & Internals",
                "order_index": 7,
                "difficulty": "ADVANCED",
                "estimated_minutes": 180,
                "summary": "Iterators and generators (yield from), decorators (functools.wraps), closures and late binding, async/await (asyncio), concurrency (GIL, threading, multiprocessing, concurrent.futures), memory management (gc), and CPython internals.",
                "learning_objective": "Master Python's memory model, overcome CPU-bound vs I/O-bound bottlenecks, implement custom decorators and asynchronous event loops, and optimize high-throughput applications.",
                "prerequisites": "Functions, OOPs, and exception handling.",
                "expected_outcome": "Competency in writing non-blocking asynchronous code, building reusable parameterized decorators, and selecting between multiprocessing and threading under the GIL.",
                "practice_requirement": "Build an asynchronous rate-limited web scraper or multi-threaded image processor using concurrent.futures and custom generator streams.",
                "machine_task_relevance": "Extremely High: Essential for high-performance ML inference, parallel training data preprocessing, and real-time streaming architectures.",
                "practical_task_relevance": "Directly required for production backends (FastAPI) and scalable data pipelines.",
                "interview_relevance": "The GIL (Global Interpreter Lock), Threading vs Multiprocessing, Generators vs Lists (lazy evaluation), Closures and late binding gotchas, Event loops in asyncio.",
                "subtopics": [
                    "Iterators and generators: Iterable vs iterator, iter(), next(), custom iterator classes (__iter__, __next__)",
                    "Generator functions: yield, generator expressions, yield from, lazy evaluation, memory efficiency",
                    "Advanced generator methods: send(), throw(), close()",
                    "itertools power tools: count, cycle, chain, islice, product, permutations, combinations, groupby, tee",
                    "Decorators: First-class functions, closures, function decorators, decorators with arguments, functools.wraps",
                    "Class decorators, class-based decorators (__call__)",
                    "Built-in decorators: @property, @staticmethod, @classmethod, @functools.lru_cache, @functools.cache",
                    "functools module: partial, reduce, singledispatch",
                    "Closures: free variables, nonlocal, the late binding closure gotcha in loops",
                    "Context managers: with internals (__enter__, __exit__), contextlib.contextmanager, ExitStack",
                    "Type hints and typing: Union (|), Optional, Callable, TypeVar, Generic, Protocol, mypy/pyright",
                    "Concurrency: The Global Interpreter Lock (GIL), free-threading in Python 3.13+",
                    "threading module: Thread, Lock, RLock, Event, Semaphore, Queue, I/O-bound workloads",
                    "multiprocessing module: Process, Pool, Queue, Value, Array, CPU-bound parallelism",
                    "concurrent.futures: ThreadPoolExecutor and ProcessPoolExecutor",
                    "Asynchronous programming: asyncio, event loop, async/await, coroutines, Tasks, asyncio.gather, TaskGroup",
                    "Memory management: Reference counting, cyclic garbage collection (gc module), sys.getsizeof, weakref",
                    "Profiling and optimization: cProfile, timeit, dis (bytecode inspection)"
                ],
                "material": """# Advanced Python: Generators, Decorators & Concurrency

### Generators & Memory Efficiency
Generators produce values on demand (`lazy evaluation`) without holding entire datasets in RAM:
```python
def stream_large_dataset(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                yield line.strip()
```

### Parameterized Decorator with `functools.wraps`
```python
import functools
import time

def retry(attempts=3, delay=1.0):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            last_err = None
            for _ in range(attempts):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_err = e
                    time.sleep(delay)
            raise last_err
        return wrapper
    return decorator
```

### Concurrency: I/O-Bound vs CPU-Bound
* **I/O-Bound (Network/Disk)**: Use `asyncio` or `concurrent.futures.ThreadPoolExecutor`. GIL is released during socket/file I/O.
* **CPU-Bound (Number Crunching/Matrix Math)**: Use `concurrent.futures.ProcessPoolExecutor` or `multiprocessing` to bypass the GIL across multiple CPU cores.
""",
                "questions": [
                    {
                        "question_text": "What is the Global Interpreter Lock (GIL) in CPython, and how does it impact multi-threaded performance?",
                        "answer_text": "The GIL is a mutex in CPython that protects access to Python objects, preventing multiple native threads from executing Python bytecode simultaneously. For I/O-bound operations (network requests, disk access), multi-threading remains beneficial because threads release the GIL while waiting for I/O. However, for CPU-bound tasks, multi-threading in Python cannot utilize multiple CPU cores in parallel due to the GIL contention; multi-processing (`ProcessPoolExecutor`) or native C-extensions are required to achieve true parallel execution.",
                        "difficulty": "ADVANCED",
                        "question_type": "INTERVIEW"
                    },
                    {
                        "question_text": "Explain the 'late binding' issue in closures and how to solve it.",
                        "answer_text": "In Python, closures bind variables by name, not by value, looking up the variable's value when the inner function is called rather than when it is created. Example: `funcs = [lambda: i for i in range(3)]`; calling `[f() for f in funcs]` returns `[2, 2, 2]` because `i` evaluated to 2 at the end of the loop. To fix it, bind `i` as a default parameter at creation time: `funcs = [lambda i=i: i for i in range(3)]`.",
                        "difficulty": "ADVANCED",
                        "question_type": "INTERVIEW"
                    }
                ],
                "task": {
                    "title": "Implement an Asynchronous Batch Request Pipeline with Concurrency Limiter",
                    "description": "Using `asyncio.Semaphore` and `httpx` or `aiohttp`, implement a resilient async pipeline that batches 100 concurrent requests without overloading host servers.",
                    "task_type": "CODING",
                    "priority": "HIGH"
                },
                "resources": [
                    {"title": "Python asyncio Documentation", "url": "https://docs.python.org/3/library/asyncio.html", "resource_type": "DOCUMENTATION"},
                    {"title": "Python itertools Documentation", "url": "https://docs.python.org/3/library/itertools.html", "resource_type": "DOCUMENTATION"}
                ]
            },
            {
                "slug": "python-testing-quality-and-tooling",
                "title": "8. Testing, Code Quality & Tooling",
                "order_index": 8,
                "difficulty": "INTERMEDIATE",
                "estimated_minutes": 90,
                "summary": "Automated testing with pytest (fixtures, parametrization, markers, mocking), code quality standards (PEP 8, ruff, black), static type checking (mypy), and modern package tooling.",
                "learning_objective": "Write comprehensive unit and integration test suites, mock external dependencies, enforce static type safety, and set up modern Python developer workflows.",
                "prerequisites": "Functions, OOP, and modules.",
                "expected_outcome": "Ability to achieve high test coverage, configure pytest fixtures, and run automated linting and formatting in continuous integration pipelines.",
                "practice_requirement": "Write a parametrized pytest suite with mock fixtures verifying error handling and edge cases for a REST API client.",
                "machine_task_relevance": "Machine tasks are evaluated automatically by test suites. Writing tests ensures first-time submission correctness.",
                "practical_task_relevance": "Mandatory standard for professional software and ML engineering.",
                "interview_relevance": "Pytest fixtures and scope (function, module, session), mocking vs monkeypatching, PEP 8 and linting tools (ruff/flake8), mypy type soundness.",
                "subtopics": [
                    "Testing basics: assert statement, unittest framework fundamentals",
                    "pytest: writing test functions, assertions, running tests",
                    "pytest fixtures: setup/teardown with yield, fixture scopes (function, class, module, session), autouse",
                    "pytest parametrization: @pytest.mark.parametrize for testing multiple input/output pairs",
                    "pytest markers: skip, xfail, custom markers",
                    "Mocking and monkeypatch: unittest.mock.patch, MagicMock, return_value, side_effect",
                    "Test coverage analysis: pytest-cov",
                    "doctest: documentation testing",
                    "Code quality: PEP 8 guidelines, PEP 20 (Zen of Python), PEP 257 (docstrings)",
                    "Modern linters and formatters: ruff, black, flake8, isort",
                    "Static type checking: mypy, pyright configuration and strictness flags",
                    "Modern tooling: venv, uv, pipx, poetry, debuggers (pdb, IDE debuggers), Git workflows for Python"
                ],
                "material": """# Testing, Quality & Tooling with pytest

### Parametrized Testing with Fixtures
```python
import pytest

@pytest.fixture
def sample_user():
    return {"id": 1, "username": "developer", "tier": "gold"}

@pytest.mark.parametrize("multiplier, expected_credits", [
    (1, 100),
    (2, 200),
    (5, 500),
])
def test_credit_calculation(sample_user, multiplier, expected_credits):
    base = 100
    assert base * multiplier == expected_credits
```

### Mocking External APIs with `unittest.mock`
```python
from unittest.mock import patch, MagicMock

def fetch_exchange_rate(pair):
    # network request...
    pass

@patch("app.services.requests.get")
def test_fetch_rate(mock_get):
    mock_get.return_value = MagicMock(status_code=200, json=lambda: {"rate": 1.08})
    rate = fetch_exchange_rate("EURUSD")
    assert rate == 1.08
```
""",
                "questions": [
                    {
                        "question_text": "What are pytest fixtures and what are the available fixture scopes?",
                        "answer_text": "Pytest fixtures are reusable functions that provide baseline data, connections, or state to test functions. They support setup and teardown via `yield`. The available scopes are: 1) `function` (default, runs once per test function); 2) `class` (runs once per test class); 3) `module` (runs once per test file/module); 4) `package` (runs once per test package); and 5) `session` (runs once across the entire test run, ideal for heavy resources like test databases).",
                        "difficulty": "INTERMEDIATE",
                        "question_type": "INTERVIEW"
                    }
                ],
                "task": {
                    "title": "Write a 100% Coverage pytest Test Suite with Mock Fixtures",
                    "description": "Construct a pytest test module for an e-commerce cart calculation module, testing edge cases, negative quantities, discount caps, and mocking external currency conversion.",
                    "task_type": "PRACTICE",
                    "priority": "MEDIUM"
                },
                "resources": [
                    {"title": "pytest Official Documentation", "url": "https://docs.pytest.org/", "resource_type": "DOCUMENTATION"}
                ]
            },
            {
                "slug": "python-revision-and-practice",
                "title": "9. Revision, Coding Workouts & Interview Prep",
                "order_index": 9,
                "difficulty": "ADVANCED",
                "estimated_minutes": 150,
                "summary": "Full revision synthesis, classic coding interview problems, gotchas and edge cases, algorithmic complexity of built-in operations, and end-to-end mini projects.",
                "learning_objective": "Synthesize all Python knowledge into rapid problem-solving fluency, resolve tricky interview questions on the spot, and build complete end-to-end CLI / API mini projects.",
                "prerequisites": "All prior Python topics (1 through 8).",
                "expected_outcome": "Complete mastery of Python interview standards, high performance in live technical machine tasks, and immediate readiness for BM1 clearance.",
                "practice_requirement": "Solve 5 classic algorithmic and system exercises in under 45 minutes without IDE autocompletion.",
                "machine_task_relevance": "Direct: Mirrors the exact machine task format evaluated during BM1 and TOI interviews.",
                "practical_task_relevance": "Capstone preparation for production tasks and vertical interviews.",
                "interview_relevance": "Core interview prep: Explain GIL, MRO, decorators, generators, GC, time complexity of built-ins, and solve live coding challenges.",
                "subtopics": [
                    "Practice problems: Basics programs (patterns, primes, Fibonacci with memoization, palindromes, factorials)",
                    "String and list manipulation challenges (sliding window, two pointers, anagrams, run-length encoding)",
                    "Dictionary and set challenges (grouping, invert dict, finding common keys, graph representation)",
                    "OOP mini projects (Bank account system, Library catalog, Inventory management)",
                    "Exception handling exercises (custom validation engine, safe file parser)",
                    "Generator and decorator workouts (rate limiter, memory-efficient CSV batcher, timer decorator)",
                    "File handling mini project (log aggregator with report generation)",
                    "Interview prep: Top 25 Python interview questions and authoritative answers",
                    "Python gotchas review (mutable defaults, late binding, is vs ==, small integer caching)",
                    "Time complexity cheat sheet for Python built-ins (list.pop(0) vs deque.popleft(), dict lookups)",
                    "System design & architecture interview talking points: GIL, MRO, garbage collection, memory profiling",
                    "Final revision: End-to-end full-stack or CLI project combining all concepts"
                ],
                "material": """# Python Revision & Interview Master Cheat-Sheet

### Essential Time Complexities of Built-in Operations
* `list.append(x)`: $O(1)$ amortized
* `list.insert(0, x)`: $O(n)$ — avoid in tight loops!
* `list.pop()`: $O(1)$
* `list.pop(0)`: $O(n)$ — use `deque.popleft()` ($O(1)$) instead.
* `x in list`: $O(n)$
* `x in dict` / `x in set`: $O(1)$ average
* `dict[k] = v`: $O(1)$ average
* `sorted(list)`: $O(n \\log n)$ via Timsort

### Top 5 Interview Gotchas
1. **Mutable default arguments**: Default values are evaluated once at definition time.
2. **Late binding in closures**: Variables in closures are resolved when called, not created.
3. **`is` vs `==`**: Never use `is` for value comparisons (except with `None`, `True`, `False`).
4. **Tuple with single element**: Must have a trailing comma: `(42,)`, not `(42)`.
5. **Modification during iteration**: Never delete items from a `dict` or `list` while iterating directly over it; iterate over a copy (`list(d.keys())`).
""",
                "questions": [
                    {
                        "question_text": "How does Python manage memory, and how does the Garbage Collector detect circular references?",
                        "answer_text": "Python primarily uses Reference Counting: every object has an internal reference counter that tracks how many references point to it. When the count drops to zero, the object's memory is deallocated immediately. To handle reference cycles (where Object A points to Object B and Object B points to Object A, keeping their reference counts > 0 even when inaccessible from root scope), Python has a cyclic Garbage Collector (`gc` module) that periodically runs a reachability algorithm across three generations (Generation 0, 1, 2) to detect and collect isolated reference cycles.",
                        "difficulty": "ADVANCED",
                        "question_type": "INTERVIEW"
                    },
                    {
                        "question_text": "Explain how Timsort (Python's built-in sorting algorithm for `sort()` and `sorted()`) works and what its time complexity is.",
                        "answer_text": "Timsort is a hybrid, stable sorting algorithm derived from Merge Sort and Insertion Sort, designed to perform exceptionally well on real-world data containing pre-existing ordered sequences ('runs'). It identifies monotonic runs and merges them using an insertion sort for small chunks (typically 32 or 64 elements) and merge sort for combining runs. Best-case time complexity is $O(n)$ (for already sorted data), and worst/average case is $O(n \\log n)$, with $O(n)$ space complexity.",
                        "difficulty": "ADVANCED",
                        "question_type": "INTERVIEW"
                    }
                ],
                "task": {
                    "title": "Complete the BM1 Comprehensive Python Machine Workout",
                    "description": "Build an end-to-end CLI tool with virtual environment isolation that reads a dataset, handles malformed records with custom exceptions, computes analytics using generators, and includes a full pytest suite.",
                    "task_type": "MACHINE_TASK",
                    "priority": "URGENT"
                },
                "resources": [
                    {"title": "Python Developer's Guide - CPython Internals", "url": "https://devguide.python.org/internals/", "resource_type": "DOCUMENTATION"},
                    {"title": "CPython Garbage Collection Internals", "url": "https://docs.python.org/3/library/gc.html", "resource_type": "DOCUMENTATION"}
                ]
            }
        ]

        # 4. Insert or Update Topics, Materials, Questions, Tasks, and Resources
        for t_data in python_topics_data:
            topic = db.query(Topic).filter(
                Topic.learning_area_id == area_py.id,
                Topic.slug == t_data["slug"]
            ).first()

            if not topic:
                topic = Topic(
                    learning_area_id=area_py.id,
                    slug=t_data["slug"],
                    title=t_data["title"],
                    summary=t_data["summary"],
                    difficulty=t_data["difficulty"],
                    estimated_minutes=t_data["estimated_minutes"],
                    order_index=t_data["order_index"],
                    learning_objective=t_data["learning_objective"],
                    prerequisites=t_data["prerequisites"],
                    expected_outcome=t_data["expected_outcome"],
                    practice_requirement=t_data["practice_requirement"],
                    machine_task_relevance=t_data["machine_task_relevance"],
                    practical_task_relevance=t_data["practical_task_relevance"],
                    interview_relevance=t_data["interview_relevance"],
                    subtopics=t_data["subtopics"],
                    metadata_json={
                        "stage": "BM1",
                        "area": "Python",
                        "subtopics_count": len(t_data["subtopics"]),
                        "rag_indexed": True,
                        "mcp_exposed": True,
                        "source": "LIFT_BM1_CURRICULUM_OFFICIAL"
                    }
                )
                db.add(topic)
                db.commit()
                db.refresh(topic)
                logger.info(f"Created Topic: {topic.title}")
            else:
                # Update existing topic with real BM1 data
                topic.title = t_data["title"]
                topic.summary = t_data["summary"]
                topic.difficulty = t_data["difficulty"]
                topic.estimated_minutes = t_data["estimated_minutes"]
                topic.order_index = t_data["order_index"]
                topic.learning_objective = t_data["learning_objective"]
                topic.prerequisites = t_data["prerequisites"]
                topic.expected_outcome = t_data["expected_outcome"]
                topic.practice_requirement = t_data["practice_requirement"]
                topic.machine_task_relevance = t_data["machine_task_relevance"]
                topic.practical_task_relevance = t_data["practical_task_relevance"]
                topic.interview_relevance = t_data["interview_relevance"]
                topic.subtopics = t_data["subtopics"]
                topic.metadata_json = {
                    "stage": "BM1",
                    "area": "Python",
                    "subtopics_count": len(t_data["subtopics"]),
                    "rag_indexed": True,
                    "mcp_exposed": True,
                    "source": "LIFT_BM1_CURRICULUM_OFFICIAL"
                }
                db.commit()
                logger.info(f"Updated Topic: {topic.title}")

            # Study Material
            mat = db.query(Material).filter(Material.topic_id == topic.id).first()
            if not mat:
                mat = Material(
                    topic_id=topic.id,
                    title=f"Core Revision Notes: {topic.title}",
                    content=t_data["material"],
                    format="MARKDOWN",
                    author_type="SYSTEM"
                )
                db.add(mat)
            else:
                mat.title = f"Core Revision Notes: {topic.title}"
                mat.content = t_data["material"]
            db.commit()

            # Questions
            for q_in in t_data["questions"]:
                existing_q = db.query(Question).filter(
                    Question.topic_id == topic.id,
                    Question.question_text == q_in["question_text"]
                ).first()
                if not existing_q:
                    q = Question(
                        topic_id=topic.id,
                        question_text=q_in["question_text"],
                        answer_text=q_in["answer_text"],
                        difficulty=q_in["difficulty"],
                        question_type=q_in["question_type"]
                    )
                    db.add(q)
            db.commit()

            # Tasks
            t_spec = t_data["task"]
            existing_task = db.query(Task).filter(
                Task.topic_id == topic.id,
                Task.title == t_spec["title"]
            ).first()
            if not existing_task:
                task = Task(
                    module_id=bm1.id,
                    learning_area_id=area_py.id,
                    topic_id=topic.id,
                    title=t_spec["title"],
                    description=t_spec["description"],
                    task_type=t_spec["task_type"],
                    priority=t_spec["priority"],
                    is_required=True
                )
                db.add(task)
            db.commit()

            # Resources
            for res_in in t_data.get("resources", []):
                existing_res = db.query(Resource).filter(
                    Resource.topic_id == topic.id,
                    Resource.url == res_in["url"]
                ).first()
                if not existing_res:
                    res = Resource(
                        topic_id=topic.id,
                        title=res_in["title"],
                        url=res_in["url"],
                        resource_type=res_in["resource_type"]
                    )
                    db.add(res)
            db.commit()

        # 5. Populate Initial Topics for the other 6 BM1 Learning Areas from the Week 1 Image
        other_areas_topics = [
            {
                "area_code": "data-handling",
                "topics": DATA_HANDLING_TOPICS
            },
            {
                "area_code": "dsa",
                "topics": DSA_TOPICS
            },
            {
                "area_code": "statistics",
                "topics": [
                    {
                        "slug": "descriptive-stats-and-probability",
                        "title": "Descriptive Statistics, Probability & Distributions",
                        "summary": "Mean, median, mode, variance, standard deviation, skewness, probability rules, Bayes theorem, Normal, Binomial, and Poisson distributions.",
                        "difficulty": "INTERMEDIATE",
                        "learning_objective": "Quantify dataset dispersion, formulate conditional probabilities with Bayes' rule, and model real-world distributions.",
                        "prerequisites": "Basic Algebra",
                        "expected_outcome": "Compute central tendencies, interpret probability densities, and apply Central Limit Theorem.",
                        "practice_requirement": "Calculate descriptive statistics and verify Central Limit Theorem via simulation.",
                        "machine_task_relevance": "Baseline statistical foundation for data profiling and feature distribution analysis.",
                        "practical_task_relevance": "Required for exploratory analysis, A/B test setup, and metric sanity verification.",
                        "interview_relevance": "Frequent subject of statistics and probability screening questions.",
                        "subtopics": ["Central tendency and dispersion", "Bayes' Theorem and conditional probability", "Normal / Gaussian distribution and empirical rule", "Central Limit Theorem (CLT)", "Probability density and cumulative functions"],
                        "questions": [
                            {
                                "question_text": "State the Central Limit Theorem and explain why it is fundamental to inferential statistics.",
                                "answer_text": "The Central Limit Theorem states that the distribution of sample means approximates a normal distribution as sample size n increases (typically n >= 30), regardless of the population distribution shape. This allows parametric statistical tests to be applied to diverse real-world data.",
                                "difficulty": "INTERMEDIATE",
                                "question_type": "INTERVIEW"
                            }
                        ],
                        "resources": [
                            {"title": "OpenIntro Statistics", "url": "https://www.openintro.org/book/os/", "resource_type": "DOCUMENTATION"}
                        ]
                    },
                    {
                        "slug": "hypothesis-testing-and-inference",
                        "title": "Hypothesis Testing & Statistical Inference",
                        "summary": "Null and alternative hypotheses, p-values, Type I and Type II errors, z-test, t-test, ANOVA, and Chi-Square tests.",
                        "difficulty": "ADVANCED",
                        "learning_objective": "Formulate hypotheses, compute p-values, select appropriate parametric tests, and control error rates.",
                        "prerequisites": "Descriptive Statistics & Probability",
                        "expected_outcome": "Formulate formal hypothesis tests to determine statistical significance in experiment results.",
                        "practice_requirement": "Conduct a two-sample t-test and a Chi-Square test on experiment data using SciPy.",
                        "machine_task_relevance": "Used to validate whether model improvements over a baseline are statistically significant.",
                        "practical_task_relevance": "Foundational for online controlled experiments (A/B testing) in software companies.",
                        "interview_relevance": "Interpreting p-values and Type I/II trade-offs is a staple of technical interviews.",
                        "subtopics": ["Null vs Alternative hypothesis", "p-value interpretation and significance alpha", "Type I vs Type II errors", "One-sample and Two-sample t-tests", "Chi-Square goodness of fit"],
                        "questions": [
                            {
                                "question_text": "What is a p-value, and what does it NOT mean?",
                                "answer_text": "A p-value is the probability of observing data at least as extreme as the observed sample, assuming the null hypothesis is true. It is NOT the probability that the null hypothesis is true, nor does it measure the effect size.",
                                "difficulty": "ADVANCED",
                                "question_type": "INTERVIEW"
                            }
                        ],
                        "resources": [
                            {"title": "NIST Engineering Statistics Handbook", "url": "https://www.itl.nist.gov/div898/handbook/", "resource_type": "DOCUMENTATION"}
                        ]
                    },
                    {
                        "slug": "linear-algebra-matrices-and-pca",
                        "title": "Linear Algebra, Matrices, Eigenvalues & PCA",
                        "summary": "Vectors, dot products, matrix multiplication, determinants, inverses, eigenvalues/eigenvectors, and Principal Component Analysis (PCA).",
                        "difficulty": "ADVANCED",
                        "learning_objective": "Understand vector spaces, linear transformations, matrix decompositions, and dimensionality reduction.",
                        "prerequisites": "High School Algebra, NumPy Basics",
                        "expected_outcome": "Perform matrix operations and derive PCA dimensionality reduction mathematically and computationally.",
                        "practice_requirement": "Implement Principal Component Analysis (PCA) using NumPy matrix operations without scikit-learn.",
                        "machine_task_relevance": "Underpins machine learning algorithms from Linear Regression to Deep Neural Networks.",
                        "practical_task_relevance": "Used for data compression, collinearity reduction, and embedding projections.",
                        "interview_relevance": "Questions on eigenvalues, dot products, and PCA projections appear in quantitative interviews.",
                        "subtopics": ["Vector spaces and dot products", "Matrix multiplication and transformations", "Eigenvalues and eigenvectors", "Dimensionality reduction intuition", "Principal Component Analysis (PCA) derivation"],
                        "questions": [
                            {
                                "question_text": "What are eigenvalues and eigenvectors in geometric terms?",
                                "answer_text": "Given a square matrix transformation A, an eigenvector is a non-zero vector whose direction remains unchanged when A is applied to it; it is only scaled by a factor lambda, which is the corresponding eigenvalue: A * v = lambda * v.",
                                "difficulty": "ADVANCED",
                                "question_type": "CONCEPTUAL"
                            }
                        ],
                        "resources": [
                            {"title": "3Blue1Brown - Essence of Linear Algebra", "url": "https://www.3blue1brown.com/topics/linear-algebra", "resource_type": "WEBSITE"}
                        ]
                    }
                ]
            },
            {
                "area_code": "ml-concepts",
                "topics": [
                    {
                        "slug": "data-preprocessing-and-eda",
                        "title": "Data Preprocessing & Exploratory Data Analysis (EDA)",
                        "summary": "Feature scaling (MinMax, Standard), encoding categorical variables (One-Hot, Ordinal), outlier detection, and correlation analysis.",
                        "difficulty": "INTERMEDIATE",
                        "learning_objective": "Cleanse raw data, impute missing features, apply appropriate scaling, and detect multicollinearity.",
                        "prerequisites": "Pandas, NumPy, Descriptive Statistics",
                        "expected_outcome": "Build robust scikit-learn preprocessing pipelines that prevent data leakage.",
                        "practice_requirement": "Build a ColumnTransformer pipeline handling numeric scaling and categorical encoding.",
                        "machine_task_relevance": "Directly evaluated in Machine Tasks to ensure raw inputs are appropriately transformed.",
                        "practical_task_relevance": "80% of real ML development time is spent on clean preprocessing and validation.",
                        "interview_relevance": "Data leakage questions and scaling choices are frequent interview talking points.",
                        "subtopics": ["Handling missing values and imputations", "StandardScaler vs MinMaxScaler", "One-Hot Encoding vs Label Encoding", "Outlier detection using IQR and z-scores", "Correlation and multicollinearity (VIF)"],
                        "questions": [
                            {
                                "question_text": "Explain why fitting a scaler on the entire dataset before train/test splitting causes data leakage.",
                                "answer_text": "Fitting a scaler on the entire dataset computes statistics (such as mean and standard deviation) using test set information. This contaminates the training phase with future/unseen test distributions, leading to overly optimistic evaluation metrics.",
                                "difficulty": "INTERMEDIATE",
                                "question_type": "INTERVIEW"
                            }
                        ],
                        "resources": [
                            {"title": "scikit-learn Preprocessing Guide", "url": "https://scikit-learn.org/stable/modules/preprocessing.html", "resource_type": "DOCUMENTATION"}
                        ]
                    },
                    {
                        "slug": "supervised-learning-classification-regression",
                        "title": "Supervised Learning: Classification & Regression",
                        "summary": "Linear regression, logistic regression, decision trees, random forests, cost functions, gradient descent, and regularization (L1/L2).",
                        "difficulty": "ADVANCED",
                        "learning_objective": "Train, tune, and evaluate core supervised classification and regression algorithms.",
                        "prerequisites": "Data Preprocessing, Linear Algebra",
                        "expected_outcome": "Implement supervised models, diagnose bias vs variance, and tune regularization hyperparameters.",
                        "practice_requirement": "Train and compare a Logistic Regression and Random Forest model on a benchmark dataset.",
                        "machine_task_relevance": "Standard baseline model training requirement for Machine Task submissions.",
                        "practical_task_relevance": "Primary machine learning paradigm deployed for predictive production workloads.",
                        "interview_relevance": "Deep understanding of cost functions, gradient descent, and L1 vs L2 regularization is universally tested.",
                        "subtopics": ["Ordinary Least Squares and Cost Functions", "Logistic Regression and Sigmoid activation", "Decision Trees, Gini impurity, Entropy", "Ensemble methods: Random Forests", "Overfitting, L1 Lasso, and L2 Ridge regularization"],
                        "questions": [
                            {
                                "question_text": "What is the key difference between L1 (Lasso) and L2 (Ridge) regularization regarding feature weights?",
                                "answer_text": "L1 regularization adds the sum of absolute weights (|w|) to the loss, driving non-essential coefficients strictly to zero (performing feature selection). L2 regularization adds squared weights (w^2), shrinking coefficients toward zero without making them exactly zero.",
                                "difficulty": "ADVANCED",
                                "question_type": "INTERVIEW"
                            }
                        ],
                        "resources": [
                            {"title": "scikit-learn Supervised Learning", "url": "https://scikit-learn.org/stable/supervised_learning.html", "resource_type": "DOCUMENTATION"}
                        ]
                    },
                    {
                        "slug": "unsupervised-clustering-and-evaluation",
                        "title": "Clustering & Model Evaluation Metrics",
                        "summary": "K-Means clustering, hierarchical clustering, confusion matrix, precision, recall, F1-score, ROC-AUC, and cross-validation.",
                        "difficulty": "ADVANCED",
                        "learning_objective": "Segment unlabelled data and evaluate predictive models using calibrated metrics.",
                        "prerequisites": "Supervised Learning, Linear Algebra",
                        "expected_outcome": "Select and justify appropriate evaluation metrics for imbalanced datasets and partition clusters effectively.",
                        "practice_requirement": "Compute Precision-Recall curves and implement K-Means clustering with the elbow method.",
                        "machine_task_relevance": "Required for presenting convincing evaluation summaries in Machine Task write-ups.",
                        "practical_task_relevance": "Essential for choosing the right business trade-off between false positives and false negatives.",
                        "interview_relevance": "Precision vs Recall trade-offs and ROC-AUC interpretations are guaranteed interview questions.",
                        "subtopics": ["K-Means algorithm and Elbow Method", "Hierarchical clustering and dendrograms", "Confusion Matrix, Precision, Recall, F1", "ROC curve and Area Under Curve (AUC)", "k-Fold Cross Validation"],
                        "questions": [
                            {
                                "question_text": "In a medical diagnosis scenario where failing to detect a disease is catastrophic, should you optimize for Precision or Recall?",
                                "answer_text": "You should optimize for Recall (Sensitivity). High recall minimizes False Negatives (cases where sick patients are mistakenly classified as healthy), even if it causes some False Positives (which can be re-tested).",
                                "difficulty": "INTERMEDIATE",
                                "question_type": "INTERVIEW"
                            }
                        ],
                        "resources": [
                            {"title": "Model Evaluation in scikit-learn", "url": "https://scikit-learn.org/stable/modules/model_evaluation.html", "resource_type": "DOCUMENTATION"}
                        ]
                    }
                ]
            },
            {
                "area_code": "sql",
                "topics": [
                    {
                        "slug": "sql-queries-filtering-and-joins",
                        "title": "SQL Queries, Joins & Aggregations",
                        "summary": "SELECT, WHERE, GROUP BY, HAVING, INNER, LEFT, RIGHT, FULL OUTER joins, and aggregate functions.",
                        "difficulty": "INTERMEDIATE",
                        "learning_objective": "Compose complex relational SQL queries combining multi-table joins, subqueries, and group aggregations.",
                        "prerequisites": "Basic Relational Concepts",
                        "expected_outcome": "Extract multi-entity metrics from relational schemas with high query accuracy.",
                        "practice_requirement": "Write 6 complex SQL queries containing joins, GROUP BY, and HAVING clauses.",
                        "machine_task_relevance": "Frequently required in data ingestion and ETL tasks to prepare feature tables.",
                        "practical_task_relevance": "Universal language for querying operational databases and analytics warehouses.",
                        "interview_relevance": "SQL query exercises are a standard part of technical interviews.",
                        "subtopics": ["Filtering with WHERE, LIKE, IN, BETWEEN", "GROUP BY and HAVING clauses", "JOIN types: INNER, LEFT, RIGHT, FULL", "Aggregate functions: COUNT, SUM, AVG, MIN, MAX", "Subqueries and Common Table Expressions (CTEs)"],
                        "questions": [
                            {
                                "question_text": "What is the difference between the WHERE clause and the HAVING clause in SQL?",
                                "answer_text": "WHERE filters rows before any grouping or aggregation takes place. HAVING filters groups after the GROUP BY aggregation has occurred.",
                                "difficulty": "INTERMEDIATE",
                                "question_type": "CONCEPTUAL"
                            }
                        ],
                        "resources": [
                            {"title": "PostgreSQL Official Documentation", "url": "https://www.postgresql.org/docs/current/tutorial-sql.html", "resource_type": "DOCUMENTATION"}
                        ]
                    },
                    {
                        "slug": "sql-window-functions-and-analytics",
                        "title": "SQL Window Functions & Analytical Queries",
                        "summary": "ROW_NUMBER, RANK, DENSE_RANK, NTILE, LAG, LEAD, and running totals using PARTITION BY and ORDER BY.",
                        "difficulty": "ADVANCED",
                        "learning_objective": "Author advanced analytical queries with windowing partitions, running calculations, and cumulative metrics.",
                        "prerequisites": "SQL Queries, Joins & Aggregations",
                        "expected_outcome": "Calculate running totals, moving averages, and period-over-period differences without multiple self-joins.",
                        "practice_requirement": "Implement top-N per category queries using ROW_NUMBER() and running totals using SUM() OVER.",
                        "machine_task_relevance": "Enables complex feature generation directly within database engines.",
                        "practical_task_relevance": "Critical for time-series feature engineering and executive dashboard queries.",
                        "interview_relevance": "Window functions (ROW_NUMBER vs DENSE_RANK, LAG/LEAD) are tested in senior data engineering rounds.",
                        "subtopics": ["OVER (PARTITION BY ... ORDER BY ...)", "ROW_NUMBER vs RANK vs DENSE_RANK", "LAG and LEAD for time series differences", "Running totals and moving averages", "Advanced CTEs and analytical reporting"],
                        "questions": [
                            {
                                "question_text": "Explain the difference between ROW_NUMBER(), RANK(), and DENSE_RANK() when values are tied.",
                                "answer_text": "ROW_NUMBER() assigns a unique sequential integer regardless of ties (e.g. 1, 2, 3). RANK() assigns the same rank to ties but skips subsequent ranks (e.g. 1, 2, 2, 4). DENSE_RANK() assigns the same rank to ties without skipping subsequent ranks (e.g. 1, 2, 2, 3).",
                                "difficulty": "ADVANCED",
                                "question_type": "INTERVIEW"
                            }
                        ],
                        "resources": [
                            {"title": "PostgreSQL Window Functions Tutorial", "url": "https://www.postgresql.org/docs/current/tutorial-window.html", "resource_type": "DOCUMENTATION"}
                        ]
                    }
                ]
            },
            {
                "area_code": "live-project",
                "topics": [
                    {
                        "slug": "live-project-deployment-and-presentation",
                        "title": "Live Project Deployment & GitHub Repository",
                        "summary": "Deploy a complete live project, verify public GitHub repository code standards, documentation, and present project architecture.",
                        "difficulty": "ADVANCED",
                        "learning_objective": "Deliver a fully operational live deployment with an open GitHub repository, clean README, and defendable architecture.",
                        "prerequisites": "All BM1 Technical Workouts",
                        "expected_outcome": "A public live URL and GitHub repository demonstrating end-to-end engineering excellence.",
                        "practice_requirement": "Deploy the project to a public cloud/container platform and verify health check endpoints.",
                        "machine_task_relevance": "Mandatory capstone requirement for Week 1 Technical Workouts evaluation.",
                        "practical_task_relevance": "Mirrors production deployment and engineering presentation standards.",
                        "interview_relevance": "The live project is the focal presentation piece for the TOI panel and final evaluation.",
                        "subtopics": ["Public GitHub repository with comprehensive README", "Live deployment URL verification & health check", "Code cleanliness, type annotations, and modular structure", "Technical demonstration and architecture walkthrough", "Defending technical decisions and design trade-offs"],
                        "questions": [
                            {
                                "question_text": "What are the essential elements required in a production-ready GitHub repository README for a live ML project?",
                                "answer_text": "A clear overview of the problem, architectural diagram, instructions for local reproduction (virtualenv, dependencies, env vars), API endpoint documentation with sample requests/responses, deployment topology details, and a working live URL.",
                                "difficulty": "ADVANCED",
                                "question_type": "INTERVIEW"
                            }
                        ],
                        "resources": [
                            {"title": "12-Factor App Methodology", "url": "https://12factor.net/", "resource_type": "DOCUMENTATION"}
                        ]
                    }
                ]
            }
        ]

        for oa in other_areas_topics:
            target_area = areas_map.get(oa["area_code"])
            if not target_area:
                continue
            for idx, top_cfg in enumerate(oa["topics"]):
                t = db.query(Topic).filter(
                    Topic.learning_area_id == target_area.id,
                    Topic.slug == top_cfg["slug"]
                ).first()
                if not t:
                    t = Topic(
                        learning_area_id=target_area.id,
                        slug=top_cfg["slug"],
                        title=top_cfg["title"],
                        summary=top_cfg["summary"],
                        difficulty=top_cfg["difficulty"],
                        estimated_minutes=90,
                        order_index=idx + 1,
                        subtopics=top_cfg["subtopics"],
                        learning_objective=top_cfg["learning_objective"],
                        prerequisites=top_cfg["prerequisites"],
                        expected_outcome=top_cfg["expected_outcome"],
                        practice_requirement=top_cfg["practice_requirement"],
                        machine_task_relevance=top_cfg["machine_task_relevance"],
                        practical_task_relevance=top_cfg["practical_task_relevance"],
                        interview_relevance=top_cfg["interview_relevance"],
                        metadata_json={
                            "stage": "BM1",
                            "area": target_area.title,
                            "rag_indexed": True,
                            "mcp_exposed": True,
                            "source": "LIFT_BM1_WEEK1_WORKOUTS"
                        }
                    )
                    db.add(t)
                    db.commit()
                    db.refresh(t)
                else:
                    # Update metadata fields if previously missing
                    t.learning_objective = top_cfg["learning_objective"]
                    t.prerequisites = top_cfg["prerequisites"]
                    t.expected_outcome = top_cfg["expected_outcome"]
                    t.practice_requirement = top_cfg["practice_requirement"]
                    t.machine_task_relevance = top_cfg["machine_task_relevance"]
                    t.practical_task_relevance = top_cfg["practical_task_relevance"]
                    t.interview_relevance = top_cfg["interview_relevance"]
                    t.subtopics = top_cfg["subtopics"]
                    db.commit()

                # Material
                mat = db.query(Material).filter(Material.topic_id == t.id).first()
                mat_content = top_cfg.get("material") or (f"# {t.title}\n\n**Area:** {target_area.title}\n\n### Key Workout Objectives\n" + "\n".join([f"- {s}" for s in top_cfg["subtopics"]]))
                if not mat:
                    mat = Material(
                        topic_id=t.id,
                        title=f"Study Material: {t.title}",
                        content=mat_content,
                        format="MARKDOWN",
                        author_type="SYSTEM"
                    )
                    db.add(mat)
                elif top_cfg.get("material"):
                    mat.title = f"Study Material: {t.title}"
                    mat.content = top_cfg["material"]

                # Questions
                for q_spec in top_cfg.get("questions", []):
                    existing_q = db.query(Question).filter(
                        Question.topic_id == t.id,
                        Question.question_text == q_spec["question_text"]
                    ).first()
                    if not existing_q:
                        db.add(Question(
                            topic_id=t.id,
                            question_text=q_spec["question_text"],
                            answer_text=q_spec["answer_text"],
                            difficulty=q_spec["difficulty"],
                            question_type=q_spec["question_type"]
                        ))

                # Resources
                for r_spec in top_cfg.get("resources", []):
                    existing_r = db.query(Resource).filter(
                        Resource.topic_id == t.id,
                        Resource.url == r_spec["url"]
                    ).first()
                    if not existing_r:
                        db.add(Resource(
                            topic_id=t.id,
                            title=r_spec["title"],
                            url=r_spec["url"],
                            resource_type=r_spec["resource_type"]
                        ))

                # Task
                if not db.query(Task).filter(Task.topic_id == t.id).first():
                    task = Task(
                        module_id=bm1.id,
                        learning_area_id=target_area.id,
                        topic_id=t.id,
                        title=f"Technical Workout: {t.title}",
                        description=f"Complete hands-on coding and problem-solving exercises for {t.title}.",
                        task_type="PRACTICE",
                        priority="HIGH",
                        is_required=True
                    )
                    db.add(task)
                db.commit()

        # 6. Clean up legacy placeholder topics from initial bootstrap across BM1 and migrate user progress
        legacy_topic_mappings = {
            "variables-data-types": "python-setup-and-fundamentals",
            "functions-closures": "python-functions-and-scopes",
            "oop-dunder-methods": "python-oops-concepts",
            "decorators-wrappers": "python-advanced-internals-concurrency",
            "generators-iterators": "python-advanced-internals-concurrency",
            "probability-fundamentals": "descriptive-stats-and-probability",
            "hypothesis-testing": "hypothesis-testing-and-inference",
            "arrays-two-pointers": "dsa-week-1-array",
            "linked-lists": "dsa-week-1-linked-list",
            "variables-and-data-types": "python-setup-and-fundamentals",
            "functions-and-closures": "python-functions-and-scopes",
            "object-oriented-programming": "python-oops-concepts",
            "decorators-and-generators": "python-advanced-internals-concurrency",
            "arrays-and-strings": "dsa-week-1-string",
            "trees-and-graphs": "dsa-week-2-trees-and-binary-search-trees",
            "dsa-arrays-lists-and-complexity": "dsa-basics",
            "dsa-trees-and-graphs": "dsa-week-2-trees-and-binary-search-trees",
            "dsa-searching-and-sorting": "dsa-week-1-linear-and-binary-search",
            "probability-distributions": "descriptive-stats-and-probability",
            "linear-algebra": "linear-algebra-matrices-and-pca",
            "sql-and-query-optimization": "sql-queries-filtering-and-joins",
            "numpy-vectorization-and-arrays": "numpy-introduction",
            "pandas-dataframes-and-manipulation": "pandas-introduction",
            "matplotlib-data-visualization": "matplotlib-introduction",
        }
        for old_slug, new_slug in legacy_topic_mappings.items():
            old_top = db.query(Topic).filter(Topic.slug == old_slug).first()
            new_top = db.query(Topic).filter(Topic.slug == new_slug).first()
            if old_top and new_top:
                # Migrate user progress
                for utp in db.query(UserTopicProgress).filter(UserTopicProgress.topic_id == old_top.id).all():
                    existing_new = db.query(UserTopicProgress).filter(
                        UserTopicProgress.user_id == utp.user_id,
                        UserTopicProgress.topic_id == new_top.id
                    ).first()
                    if not existing_new:
                        utp.topic_id = new_top.id
                    else:
                        if utp.status == "COMPLETED":
                            existing_new.status = "COMPLETED"
                            existing_new.completed_at = utp.completed_at
                        db.delete(utp)
                db.commit()
                # Clean up old child records and topic
                db.query(Material).filter(Material.topic_id == old_top.id).delete()
                db.query(Question).filter(Question.topic_id == old_top.id).delete()
                db.query(Resource).filter(Resource.topic_id == old_top.id).delete()
                for ot in db.query(Task).filter(Task.topic_id == old_top.id).all():
                    db.query(UserTaskProgress).filter(UserTaskProgress.task_id == ot.id).delete()
                    db.delete(ot)
                db.delete(old_top)
                db.commit()

        # 6. Recalculate user progression for all registered users
        users = db.query(User).all()
        for u in users:
            # Recalculate BM1, BM2, TOI
            st_bm1 = ProgressionEngine.get_user_module_status(db, u.id, "BM1")
            st_bm2 = ProgressionEngine.get_user_module_status(db, u.id, "BM2")
            st_toi = ProgressionEngine.get_user_module_status(db, u.id, "TOI")
            logger.info(f"User {u.username} Status -> BM1: {st_bm1['status']} ({st_bm1['completion_percent']}%), BM2: {st_bm2['status']}, TOI: {st_toi['status']}")

        logger.info("Real BM1 Curriculum Import Completed Successfully!")

    finally:
        db.close()

if __name__ == "__main__":
    import_real_bm1_curriculum()
