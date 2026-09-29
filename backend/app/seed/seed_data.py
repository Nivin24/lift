import logging
from sqlalchemy.orm import Session
import datetime
from app.core.security import get_password_hash
from app.models.entities import (
    User, Module, LearningArea, Topic, Material, Resource, Question, Task,
    UserTopicProgress, UserTaskProgress, UserProgress, ActivityLog
)
from app.services.progression import ProgressionEngine

logger = logging.getLogger("lift.seed")

def seed_database(db: Session):
    from app.seed.import_real_bm1_curriculum import import_real_bm1_curriculum
    # Check if already seeded
    if db.query(Module).first():
        logger.info("Database already seeded with curriculum. Ensuring real BM1 curriculum is loaded...")
        try:
            import_real_bm1_curriculum()
        except Exception as e:
            logger.warning(f"Curriculum sync notice: {e}")
        return

    logger.info("Seeding initial LIFT curriculum and demo users...")

    # 1. Create Initial Users
    user1 = User(
        username="user1",
        email="user1@lift.local",
        full_name="Nivin",
        hashed_password=get_password_hash("password123"),
        is_active=True
    )
    user2 = User(
        username="user2",
        email="user2@lift.local",
        full_name="Study Partner",
        hashed_password=get_password_hash("password123"),
        is_active=True
    )
    db.add_all([user1, user2])
    db.commit()
    db.refresh(user1)
    db.refresh(user2)

    # 2. Create Modules: BM1 -> BM2 -> TOI
    bm1 = Module(
        code="BM1",
        title="BM1 — Foundations & Core Knowledge",
        description="First stage mastery: Python, Mathematics, Statistics, DSA, and Data Engineering foundations.",
        order_index=1
    )
    bm2 = Module(
        code="BM2",
        title="BM2 — Advanced Systems & Engineering",
        description="Second stage: Advanced ML systems, distributed architectures, and end-to-end engineering pipelines.",
        order_index=2
    )
    toi = Module(
        code="TOI",
        title="TOI — Technical Preparation & Evaluation",
        description="Final stage: Vertical mastery, live Machine Tasks, and Practical Scenario assessments.",
        order_index=3
    )
    db.add_all([bm1, bm2, toi])
    db.commit()
    db.refresh(bm1)
    db.refresh(bm2)
    db.refresh(toi)

    # 3. BM1 Learning Areas
    area_py = LearningArea(
        module_id=bm1.id,
        title="Python",
        code="python",
        description="Core language mechanics, functional paradigms, OOP, and Python internals.",
        icon="code",
        order_index=1
    )
    area_stat = LearningArea(
        module_id=bm1.id,
        title="Mathematics & Statistics",
        code="statistics",
        description="Probability, statistical testing, linear algebra, and inference foundations.",
        icon="bar-chart-2",
        order_index=2
    )
    area_dsa = LearningArea(
        module_id=bm1.id,
        title="Data Structures & Algorithms",
        code="dsa",
        description="Algorithmic problem solving, complexity analysis, and essential data structures.",
        icon="layers",
        order_index=3
    )
    db.add_all([area_py, area_stat, area_dsa])
    db.commit()
    db.refresh(area_py)
    db.refresh(area_stat)
    db.refresh(area_dsa)

    # Topics for Python
    t_vars = Topic(
        learning_area_id=area_py.id,
        title="Variables & Data Types",
        slug="variables-data-types",
        summary="Primitive types, memory representation, mutability, and scoping rules in Python.",
        difficulty="BEGINNER",
        estimated_minutes=30,
        order_index=1
    )
    t_funcs = Topic(
        learning_area_id=area_py.id,
        title="Functions & Closures",
        slug="functions-closures",
        summary="First-class citizens, lexical scoping, closures, and parameter unpacking.",
        difficulty="BEGINNER",
        estimated_minutes=45,
        order_index=2
    )
    t_oop = Topic(
        learning_area_id=area_py.id,
        title="OOP & Dunder Methods",
        slug="oop-dunder-methods",
        summary="Object-oriented patterns, classes, inheritance, encapsulation, and magic methods.",
        difficulty="INTERMEDIATE",
        estimated_minutes=60,
        order_index=3
    )
    t_dec = Topic(
        learning_area_id=area_py.id,
        title="Decorators & Wrappers",
        slug="decorators-wrappers",
        summary="Function & class decorators, functools.wraps, parameterized decorators, and practical telemetry wrappers.",
        difficulty="INTERMEDIATE",
        estimated_minutes=60,
        order_index=4
    )
    t_gen = Topic(
        learning_area_id=area_py.id,
        title="Generators & Iterators",
        slug="generators-iterators",
        summary="Iterator protocol (__iter__, __next__), yield expressions, generator expressions, and memory streaming.",
        difficulty="INTERMEDIATE",
        estimated_minutes=45,
        order_index=5
    )
    db.add_all([t_vars, t_funcs, t_oop, t_dec, t_gen])

    # Topics for Statistics
    t_prob = Topic(
        learning_area_id=area_stat.id,
        title="Probability Fundamentals",
        slug="probability-fundamentals",
        summary="Conditional probability, Bayes theorem, independence, and probability mass/density functions.",
        difficulty="INTERMEDIATE",
        estimated_minutes=45,
        order_index=1
    )
    t_hypo = Topic(
        learning_area_id=area_stat.id,
        title="Hypothesis Testing & p-values",
        slug="hypothesis-testing",
        summary="Null vs Alternative hypothesis, Type I/II errors, z-test, t-test, and p-value interpretation.",
        difficulty="ADVANCED",
        estimated_minutes=60,
        order_index=2
    )
    db.add_all([t_prob, t_hypo])

    # Topics for DSA
    t_arr = Topic(
        learning_area_id=area_dsa.id,
        title="Arrays & Two Pointers",
        slug="arrays-two-pointers",
        summary="Dynamic array amortization, two-pointer techniques, and sliding window patterns.",
        difficulty="BEGINNER",
        estimated_minutes=45,
        order_index=1
    )
    t_ll = Topic(
        learning_area_id=area_dsa.id,
        title="Linked Lists & Traversal",
        slug="linked-lists",
        summary="Singly and doubly linked lists, cycle detection (Floyd's algorithm), and reversing lists.",
        difficulty="INTERMEDIATE",
        estimated_minutes=60,
        order_index=2
    )
    db.add_all([t_arr, t_ll])
    db.commit()
    db.refresh(t_dec)

    # 4. Detailed Study Material & Content for Decorators
    dec_material = Material(
        topic_id=t_dec.id,
        title="Mastering Python Decorators: Architecture & Production Patterns",
        content="""# Python Decorators & Wrappers

## Overview
A decorator is a design pattern in Python that allows you to modify or extend the behavior of a callable (function, method, or class) without permanently altering the callable's source code.

## Why It Matters
Decorators form the architectural foundation for:
1. Web routing (e.g. FastAPI `@app.get()`, Flask `@app.route()`)
2. Cross-cutting concerns (authentication, rate-limiting, tracing, timing)
3. Caching (`@functools.lru_cache`)
4. Data validation and class modifications (`@dataclass`, `@property`)

## Core Concepts
- Functions are **first-class citizens** in Python. They can be passed as arguments, assigned to variables, and returned from other functions.
- A decorator takes a function as an argument and returns a new function.
- Always use `@functools.wraps` on the inner wrapper to preserve the original function's `__name__`, docstrings, and signatures.

## Production Example
```python
import time
import functools
import logging

def timed(func):
    \"\"\"Decorator that measures and logs execution time.\"\"\"
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        duration = time.perf_counter() - start
        logging.info(f"Function {func.__name__} executed in {duration:.4f}s")
        return result
    return wrapper

@timed
def compute_heavy_task(n: int) -> int:
    return sum(i * i for i in range(n))
```

## Common Mistakes
- **Forgetting `@functools.wraps`**: Losing introspection metadata in debugging.
- **Forgetting `*args, **kwargs` in the wrapper**: Breaks functions taking arguments.
- **Confusion with decorators that accept arguments**: Decorators taking arguments require 3 nested levels (outer takes args, middle takes func, inner wraps).
""",
        format="MARKDOWN",
        author_type="SYSTEM"
    )
    db.add(dec_material)

    # Resources for Decorators
    r1 = Resource(
        topic_id=t_dec.id,
        title="Official Python Decorator Documentation (PEP 318)",
        url="https://peps.python.org/pep-0318/",
        resource_type="DOCUMENTATION",
        description="The formal Python enhancement proposal defining syntax and semantics."
    )
    r2 = Resource(
        topic_id=t_dec.id,
        title="Functools Python Standard Library Guide",
        url="https://docs.python.org/3/library/functools.html",
        resource_type="DOCUMENTATION",
        description="Comprehensive guide on functools.wraps and functools.lru_cache."
    )
    db.add_all([r1, r2])

    # Questions for Decorators
    q1 = Question(
        topic_id=t_dec.id,
        question_text="What problem does @functools.wraps solve in custom decorators?",
        answer_text="When a function is decorated, the wrapper function replaces the original. Without @functools.wraps, the original function's __name__, __doc__, and module metadata are overwritten by the wrapper's metadata, breaking reflection, documentation generation, and debugging tools.",
        difficulty="INTERMEDIATE",
        question_type="INTERVIEW"
    )
    q2 = Question(
        topic_id=t_dec.id,
        question_text="How do you write a decorator that accepts configuration arguments (e.g. @retry(times=3))?",
        answer_text="You create a decorator factory function that accepts the configuration arguments and returns the actual decorator function. This creates 3 levels of nesting: factory(args) -> decorator(func) -> wrapper(*args, **kwargs).",
        difficulty="INTERMEDIATE",
        question_type="CONCEPTUAL"
    )
    db.add_all([q1, q2])

    # Tasks for BM1
    task1 = Task(
        module_id=bm1.id,
        learning_area_id=area_py.id,
        topic_id=t_dec.id,
        title="Build an Exponential Backoff Retry Decorator",
        description="Implement a reusable `@retry(max_attempts=3, backoff_factor=1.5)` decorator with typed exceptions handling and timing logs.",
        task_type="CODING",
        priority="HIGH",
        due_date=datetime.datetime.utcnow() + datetime.timedelta(days=2),
        is_required=True
    )
    task2 = Task(
        module_id=bm1.id,
        learning_area_id=area_dsa.id,
        topic_id=t_arr.id,
        title="Solve 3 Sliding Window LeetCode Patterns",
        description="Implement and test Maximum Sum Subarray, Longest Substring Without Repeating Characters, and Minimum Window Substring.",
        task_type="PRACTICE",
        priority="MEDIUM",
        due_date=datetime.datetime.utcnow() + datetime.timedelta(days=3),
        is_required=True
    )
    task3 = Task(
        module_id=bm1.id,
        learning_area_id=area_stat.id,
        topic_id=t_hypo.id,
        title="Perform A/B Test Two-Sample t-Test in Python",
        description="Use scipy.stats to calculate p-value, Cohen's d effect size, and confidence intervals for conversion rates.",
        task_type="PRACTICE",
        priority="MEDIUM",
        due_date=datetime.datetime.utcnow() + datetime.timedelta(days=4),
        is_required=True
    )
    db.add_all([task1, task2, task3])
    db.commit()

    # 5. BM2 Learning Areas & Topics (Initial structure)
    area_ml = LearningArea(
        module_id=bm2.id,
        title="Machine Learning Pipelines",
        code="ml-pipelines",
        description="Data drift, feature stores, model training lifecycle, and evaluation.",
        icon="cpu",
        order_index=1
    )
    area_sys = LearningArea(
        module_id=bm2.id,
        title="Distributed Systems & Performance",
        code="distributed-systems",
        description="Async concurrency, queues, caching layers, and database partitioning.",
        icon="server",
        order_index=2
    )
    db.add_all([area_ml, area_sys])
    db.commit()
    db.refresh(area_ml)
    db.refresh(area_sys)

    t_drift = Topic(
        learning_area_id=area_ml.id,
        title="Data & Concept Drift Monitoring",
        slug="drift-monitoring",
        summary="Detecting distribution shifts, KS-test, PSI, and automated retraining triggers.",
        difficulty="ADVANCED",
        estimated_minutes=60,
        order_index=1
    )
    t_async = Topic(
        learning_area_id=area_sys.id,
        title="Asynchronous Architecture with AsyncIO & Celery",
        slug="async-architecture",
        summary="Event loops, coroutines, non-blocking I/O, worker pools, and task broker design.",
        difficulty="ADVANCED",
        estimated_minutes=75,
        order_index=1
    )
    db.add_all([t_drift, t_async])

    task_bm2 = Task(
        module_id=bm2.id,
        learning_area_id=area_ml.id,
        topic_id=t_drift.id,
        title="Build PSI Drift Detector Component",
        description="Calculate Population Stability Index between baseline and inference feature distributions.",
        task_type="MACHINE_TASK",
        priority="HIGH",
        is_required=True
    )
    db.add(task_bm2)
    db.commit()

    # 6. TOI Module Structure
    area_vert = LearningArea(
        module_id=toi.id,
        title="Vertical Knowledge",
        code="vertical",
        description="Domain-specific deep dive and system integration knowledge.",
        icon="target",
        order_index=1
    )
    area_mach = LearningArea(
        module_id=toi.id,
        title="Machine Task",
        code="machine-task",
        description="Live timed hands-on engineering challenges and system building.",
        icon="terminal",
        order_index=2
    )
    area_prac = LearningArea(
        module_id=toi.id,
        title="Practical Task",
        code="practical-task",
        description="Troubleshooting, root-cause analysis, and incident response under pressure.",
        icon="briefcase",
        order_index=3
    )
    db.add_all([area_vert, area_mach, area_prac])
    db.commit()
    db.refresh(area_vert)
    db.refresh(area_mach)
    db.refresh(area_prac)

    t_toi1 = Topic(
        learning_area_id=area_mach.id,
        title="End-to-End Microservice Machine Task",
        slug="e2e-microservice-task",
        summary="90-minute timed exercise building a rate-limited streaming service with tests.",
        difficulty="ADVANCED",
        estimated_minutes=90,
        order_index=1
    )
    db.add(t_toi1)

    task_toi = Task(
        module_id=toi.id,
        learning_area_id=area_mach.id,
        topic_id=t_toi1.id,
        title="Timed Machine Task Simulation",
        description="Complete end-to-end coding benchmark under timed constraints.",
        task_type="MACHINE_TASK",
        priority="URGENT",
        is_required=True
    )
    db.add(task_toi)
    db.commit()

    # 7. Independent Progress Setup for User 1 & User 2
    # User 1 (Nivin): Completed Variables, Functions, Probability, Arrays. OOP in progress.
    now = datetime.datetime.utcnow()
    db.add_all([
        UserTopicProgress(user_id=user1.id, topic_id=t_vars.id, status="COMPLETED", completed_at=now),
        UserTopicProgress(user_id=user1.id, topic_id=t_funcs.id, status="COMPLETED", completed_at=now),
        UserTopicProgress(user_id=user1.id, topic_id=t_prob.id, status="COMPLETED", completed_at=now),
        UserTopicProgress(user_id=user1.id, topic_id=t_arr.id, status="COMPLETED", completed_at=now),
        UserTopicProgress(user_id=user1.id, topic_id=t_oop.id, status="IN_PROGRESS"),
        UserTopicProgress(user_id=user1.id, topic_id=t_dec.id, status="NOT_STARTED"),
        UserTaskProgress(user_id=user1.id, task_id=task2.id, status="COMPLETED", completed_at=now),
        UserTaskProgress(user_id=user1.id, task_id=task1.id, status="IN_PROGRESS"),
    ])

    # User 2 (Partner): Completed Variables. Functions in progress. Others not started.
    db.add_all([
        UserTopicProgress(user_id=user2.id, topic_id=t_vars.id, status="COMPLETED", completed_at=now),
        UserTopicProgress(user_id=user2.id, topic_id=t_funcs.id, status="IN_PROGRESS"),
        UserTopicProgress(user_id=user2.id, topic_id=t_oop.id, status="NOT_STARTED"),
        UserTopicProgress(user_id=user2.id, topic_id=t_prob.id, status="NOT_STARTED"),
        UserTopicProgress(user_id=user2.id, topic_id=t_arr.id, status="NOT_STARTED"),
    ])

    # Initial Activity Logs
    db.add_all([
        ActivityLog(user_id=user1.id, action_type="TOPIC_COMPLETED", description="Completed topic: Variables & Data Types"),
        ActivityLog(user_id=user1.id, action_type="TOPIC_COMPLETED", description="Completed topic: Functions & Closures"),
        ActivityLog(user_id=user1.id, action_type="TASK_COMPLETED", description="Completed task: Solve 3 Sliding Window LeetCode Patterns"),
        ActivityLog(user_id=user2.id, action_type="TOPIC_COMPLETED", description="Completed topic: Variables & Data Types"),
    ])
    db.commit()

    # Recalculate module statuses for both users
    ProgressionEngine.get_user_module_status(db, user1.id, "BM1")
    ProgressionEngine.get_user_module_status(db, user1.id, "BM2")
    ProgressionEngine.get_user_module_status(db, user1.id, "TOI")

    ProgressionEngine.get_user_module_status(db, user2.id, "BM1")
    ProgressionEngine.get_user_module_status(db, user2.id, "BM2")
    ProgressionEngine.get_user_module_status(db, user2.id, "TOI")

    logger.info("Seed data creation complete!")
