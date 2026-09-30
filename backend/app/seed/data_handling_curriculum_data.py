"""
LIFT Curriculum Seed Data: Data Handling & Visualization Area (BM1)
Full revision checklist: NumPy, Pandas, Matplotlib, Seaborn, Data Wrangling.
Exactly 17 structured topics:
 1. 1. NumPy: Introduction
 2. 2. NumPy: Advanced
 3. 3. Pandas: Introduction
 4. 4. Pandas: Advanced
 5. 5. Matplotlib: Introduction
 6. 6. Data Visualization with Matplotlib
 7. 7. Seaborn
 8. 8. Other Viz Libraries and EDA
 9. 9. Practical Session: NumPy, Pandas, Matplotlib
10. 10. Data Wrangling: Collection and Import
11. 11. Data Wrangling: Cleaning Techniques
12. 12. Data Wrangling: Transformation
13. 13. Data Wrangling: Integration
14. 14. Advanced Data Wrangling
15. 15. Practical Data Wrangling
16. 16. Assignment and Project
17. 17. Revision and Interview Prep
"""

DATA_HANDLING_TOPICS = [
    # -------------------------------------------------------------
    # 1. NumPy: Introduction
    # -------------------------------------------------------------
    {
        "slug": "numpy-introduction",
        "title": "1. NumPy: Introduction",
        "summary": "Core array programming in Python: ndarray anatomy, array instantiation, multidimensional indexing, slicing, boolean masking, vectorization, universal functions, and broadcasting rules.",
        "difficulty": "BEGINNER",
        "learning_objective": "Understand contiguous array memory, master vectorized arithmetic over Python loops, and implement broadcasting rules without explicit copies.",
        "prerequisites": "Python Fundamentals & Data Structures",
        "expected_outcome": "Write fast numeric code using NumPy ndarrays, multidimensional indexing, masking, and linear algebra operations.",
        "practice_requirement": "Implement 10 vectorized array transformations and verify broadcasting rules across differing dimensions.",
        "machine_task_relevance": "Underpins numerical computations in ML algorithms, neural nets, and scientific benchmarks.",
        "practical_task_relevance": "Used for feature vector calculations, data matrix transformations, and image tensor slicing.",
        "interview_relevance": "Common technical screening topic: vectorization vs loops, broadcasting rules, and memory layout.",
        "subtopics": [
            "What is NumPy, why vectorized ops beat Python loops",
            "Installing, import numpy as np",
            "ndarray vs list (speed, memory, homogeneous dtype)",
            "Attributes: shape, ndim, size, dtype, itemsize, nbytes",
            "np.array, np.zeros, np.ones, np.full, np.empty",
            "np.arange, np.linspace, np.logspace",
            "np.eye, np.identity, np.diag",
            "np.random.rand, randn, randint",
            "dtypes and astype()",
            "1D, 2D, 3D indexing",
            "Slicing with step, negative indexes",
            "Boolean masking",
            "Fancy indexing",
            "Views vs copies (copy())",
            "Element-wise arithmetic (+ - * / // % **)",
            "Comparison and logical operations",
            "Universal functions (ufuncs): sqrt, exp, log, sin, cos, abs",
            "Aggregations: sum, mean, min, max, std, var, argmin, argmax",
            "axis parameter (axis=0 vs axis=1), keepdims",
            "Broadcasting rules",
            "Scalar with array, row with column",
            "Common broadcasting errors and fixes (np.newaxis, reshape)",
            "Dot product, matmul, @ operator",
            "Transpose, trace",
            "np.linalg.inv, det, solve",
            "np.linalg.eig, svd",
            "np.linalg.norm"
        ],
        "material": """# 1. NumPy: Introduction

## 1. Basics: Why NumPy Beats Python Loops
- **Vectorization**: Operations run in compiled C-speed loops without Python interpreter overhead.
- **Contiguous Memory**: NumPy arrays (`ndarray`) allocate contiguous memory buffers containing homogeneous data types (`int32`, `float64`), enabling CPU cache hits and SIMD vector hardware acceleration.
- **Python list overhead**: Python lists hold arrays of *pointers* to boxed object wrappers (`PyObject`), incurring pointer dereferencing and dynamic type checking per element.

```python
import numpy as np
import time

# Speed comparison
n = 1_000_000
py_list = list(range(n))
np_arr = np.arange(n)

t0 = time.perf_counter()
res_py = [x * 2 for x in py_list]
t_py = time.perf_counter() - t0

t0 = time.perf_counter()
res_np = np_arr * 2
t_np = time.perf_counter() - t0

print(f"NumPy is {t_py / t_np:.1f}x faster than Python loop!")
```

### Core ndarray Attributes
- `arr.shape`: Tuple of array dimensions `(rows, cols)`
- `arr.ndim`: Number of array axes/dimensions
- `arr.size`: Total number of elements
- `arr.dtype`: Data type of elements
- `arr.itemsize`: Length of one array element in bytes
- `arr.nbytes`: Total bytes consumed by elements (`size * itemsize`)

---

## 2. Creating Arrays & Types
```python
# Initializers
zeros = np.zeros((3, 3), dtype=np.float32)
ones = np.ones((2, 4))
full_val = np.full((2, 3), 7.5)
empty_buf = np.empty((2, 2))  # uninitialized memory

# Ranges
r1 = np.arange(0, 10, 2)            # [0, 2, 4, 6, 8]
lin = np.linspace(0, 1, 5)          # [0.0, 0.25, 0.5, 0.75, 1.0]
log_space = np.logspace(1, 3, 3)    # [10^1, 10^2, 10^3]

# Matrices
identity = np.eye(3)
diag_matrix = np.diag([10, 20, 30])

# Random
rand_unif = np.random.rand(2, 3)    # uniform [0, 1)
rand_norm = np.random.randn(2, 3)   # standard normal N(0, 1)
rand_ints = np.random.randint(1, 100, size=(3, 3))

# Type casting
float_arr = np.array([1.2, 2.7, 3.9])
int_arr = float_arr.astype(np.int32)  # [1, 2, 3] (truncation)
```

---

## 3. Indexing, Slicing & Views vs Copies
- **Slicing creates views**: Modifying a slice modifies the original array!
- **Fancy indexing and boolean masking create copies**.

```python
A = np.arange(12).reshape(3, 4)
# [[ 0,  1,  2,  3],
#  [ 4,  5,  6,  7],
#  [ 8,  9, 10, 11]]

# 2D Slicing: row 0 to 2, col 1 to 3
view_slice = A[0:2, 1:3]
view_slice[0, 0] = 999  # A[0, 1] is now 999!

# Explicit Copy
safe_copy = A[0:2, 1:3].copy()

# Boolean Masking
mask = (A > 5) & (A < 20)
filtered_vals = A[mask]

# Fancy indexing (using integer coordinate arrays)
row_idx = np.array([0, 2])
col_idx = np.array([1, 3])
selected = A[row_idx, col_idx]  # elements A[0,1] and A[2,3]
```

---

## 4. Vectorized Operations & Broadcasting
### Broadcasting Rules
When operating on two arrays, NumPy compares their shapes element-wise starting from trailing (rightmost) dimensions:
1. Two dimensions are compatible when:
   - They are equal, OR
   - One of them is 1.
2. If dimensions mismatch and neither is 1, a `ValueError: operands could not be broadcast together` is raised.

```python
# Row vector (1, 3) and Column vector (3, 1)
row = np.array([[10, 20, 30]])     # shape (1, 3)
col = np.array([[1], [2], [3]])     # shape (3, 1)

# Broadcasted addition -> shape (3, 3)
grid_sum = row + col
# [[11, 21, 31],
#  [12, 22, 32],
#  [13, 23, 33]]

# Expand dimension with np.newaxis
x = np.array([1, 2, 3])            # shape (3,)
x_col = x[:, np.newaxis]           # shape (3, 1)
```

### Aggregations & Axis Parameter
- `axis=0`: Collapse rows (operate down columns)
- `axis=1`: Collapse columns (operate across rows)
- `keepdims=True`: Preserve rank for downstream broadcasting

```python
data = np.array([[1, 2, 3], [4, 5, 6]])
col_means = data.mean(axis=0, keepdims=True)  # shape (1, 3)
standardized = data - col_means                # broadcasted center
```

---

## 5. Linear Algebra Operations
```python
A = np.array([[1, 2], [3, 4]])
B = np.array([[5, 6], [7, 8]])

# Matrix Multiplication
C = A @ B  # or np.matmul(A, B)

# Inverse and Determinant
det_A = np.linalg.det(A)          # -2.0
inv_A = np.linalg.inv(A)

# Solve Ax = b
b = np.array([1, 2])
x = np.linalg.solve(A, b)

# Norm and Eigenvalues
norm_fro = np.linalg.norm(A)      # Frobenius norm
eigenvals, eigenvecs = np.linalg.eig(A)
```

---

## 6. Sample Workouts
### Workout 1: Vectorized Euclidean Distance Matrix
Compute pairwise Euclidean distance between $M$ vectors and $N$ vectors without nested loops:
```python
def pairwise_distances(X, Y):
    # X shape (M, D), Y shape (N, D)
    # (x - y)^2 = x^2 - 2xy + y^2
    diff = X[:, np.newaxis, :] - Y[np.newaxis, :, :] # (M, N, D)
    return np.sqrt(np.sum(diff ** 2, axis=-1))

X = np.random.rand(5, 3)
Y = np.random.rand(4, 3)
dist = pairwise_distances(X, Y)
print("Distance Matrix Shape:", dist.shape)  # (5, 4)
```

### Workout 2: Min-Max Feature Scaling along Axis
```python
def min_max_scale(arr):
    # Normalize each feature (column) to [0, 1]
    col_min = arr.min(axis=0, keepdims=True)
    col_max = arr.max(axis=0, keepdims=True)
    return (arr - col_min) / (col_max - col_min + 1e-8)

raw_features = np.array([[10, 200], [20, 400], [30, 100]], dtype=float)
scaled = min_max_scale(raw_features)
print("Scaled features:\n", scaled)
```

### Workout 3: Image Grayscale Brightness Threshold Mask
```python
def apply_brightness_filter(image_tensor, threshold=128):
    # image_tensor of shape (H, W, 3)
    # Weights for RGB to luminance: 0.299 R + 0.587 G + 0.114 B
    weights = np.array([0.299, 0.587, 0.114])
    grayscale = image_tensor @ weights  # shape (H, W)
    mask = grayscale > threshold
    return mask

img = np.random.randint(0, 256, size=(100, 100, 3), dtype=np.uint8)
bright_pixels = apply_brightness_filter(img, threshold=150)
print(f"Bright pixels percentage: {bright_pixels.mean() * 100:.2f}%")
```
""",
        "questions": [
            {
                "question_text": "Why does modifying a NumPy slice alter the original array, whereas a Python list slice does not?",
                "answer_text": "NumPy slices produce 'views' that share the same underlying memory buffer with different strides and offsets to avoid costly memory allocations. Python list slices construct entirely new list objects containing shallow copies of the references.",
                "difficulty": "INTERMEDIATE",
                "question_type": "CONCEPTUAL"
            }
        ],
        "resources": [
            {"title": "NumPy Official Quickstart", "url": "https://numpy.org/doc/stable/user/quickstart.html", "resource_type": "DOCUMENTATION"},
            {"title": "NumPy Illustrated: The Visual Guide", "url": "https://betterprogramming.pub/numpy-illustrated-the-visual-guide-to-numpy-3b1d4976de1d", "resource_type": "ARTICLE"}
        ]
    },

    # -------------------------------------------------------------
    # 2. NumPy: Advanced
    # -------------------------------------------------------------
    {
        "slug": "numpy-advanced",
        "title": "2. NumPy: Advanced",
        "summary": "Advanced multi-axis array transformations, shape manipulations, conditional selection, robust statistics, random Generator API, memory strides (C vs Fortran order), and Einstein summation (einsum).",
        "difficulty": "ADVANCED",
        "learning_objective": "Master memory strides, multidimensional tensor restructuring, conditional logic with np.where and np.select, and optimize linear tensor contractions with np.einsum.",
        "prerequisites": "NumPy Introduction",
        "expected_outcome": "Implement high-throughput numerical pipelines avoiding memory copies and write multi-condition vector logic.",
        "practice_requirement": "Implement custom train-test splitting, matrix trace/diagonal contractions using einsum, and nan-safe robust statistics.",
        "machine_task_relevance": "Key to accelerating data preprocessing pipelines and custom loss functions in neural network modeling.",
        "practical_task_relevance": "Used for tensor re-shaping in PyTorch/TensorFlow bridges and high-frequency analytical backtests.",
        "interview_relevance": "Common senior interview questions: C-order vs Fortran-order cache performance, ravel vs flatten, and einsum notation.",
        "subtopics": [
            "reshape, flatten vs ravel",
            "transpose, swapaxes, moveaxis",
            "concatenate, stack, vstack, hstack, dstack",
            "split, hsplit, vsplit",
            "tile, repeat",
            "append, insert, delete",
            "sort, argsort, np.unique, np.searchsorted",
            "np.where, np.select, np.piecewise",
            "np.clip, np.round",
            "mean, median, mode (scipy.stats), std, var",
            "percentile, quantile",
            "cumsum, cumprod",
            "corrcoef, cov",
            "histogram, bincount",
            "nan-safe functions (nanmean, nansum, nanstd)",
            "Seeding and reproducibility",
            "New Generator API (np.random.default_rng)",
            "uniform, normal, binomial, poisson, exponential",
            "choice, shuffle, permutation",
            "Train/test split by random indices",
            "Vectorization vs loops (timeit comparison)",
            "Memory layout: C vs Fortran order, strides",
            "np.vectorize, np.einsum",
            "Structured arrays",
            "Saving and loading (np.save, np.load, savetxt, loadtxt, savez)",
            "Masked arrays"
        ],
        "material": """# 2. NumPy: Advanced

## 1. Array Manipulation: Views, Reshaping & Stacking
- `flatten()` always returns a **copy** of the array in contiguous 1D memory.
- `ravel()` returns a **view** whenever possible, avoiding memory allocation.
- `reshape()` changes view dimensions if memory strides allow; otherwise it copies.

```python
import numpy as np

arr = np.arange(12).reshape(3, 4)
rav = arr.ravel()   # view
flat = arr.flatten() # copy

# Transposition & Axis Swapping
trans = arr.T
swapped = np.swapaxes(arr, 0, 1)

# Stacking
a = np.array([1, 2, 3])
b = np.array([4, 5, 6])
v = np.vstack((a, b))  # shape (2, 3)
h = np.hstack((a, b))  # shape (6,)
stacked = np.stack((a, b), axis=0) # new axis at 0
```

---

## 2. Conditional Selection: `np.where`, `np.select`
```python
scores = np.array([45, 82, 67, 95, 33])

# Binary condition: np.where(condition, x_if_true, y_if_false)
results = np.where(scores >= 50, "PASS", "FAIL")

# Multi-condition: np.select(condlist, choicelist, default)
conditions = [
    scores >= 90,
    scores >= 75,
    scores >= 50
]
grades = ["A", "B", "C"]
assigned_grades = np.select(conditions, grades, default="F")
print(assigned_grades)  # ['F' 'B' 'C' 'A' 'F']
```

---

## 3. Robust Statistics & NaN Handling
```python
noisy_data = np.array([10.0, 12.0, np.nan, 14.0, 100.0, np.nan])

# Nan-safe aggregations
valid_mean = np.nanmean(noisy_data)
valid_median = np.nanmedian(noisy_data)
p25, p75 = np.nanpercentile(noisy_data, [25, 75])

# Outlier clipping
iqr = p75 - p25
lower = p25 - 1.5 * iqr
upper = p75 + 1.5 * iqr
clean = np.clip(noisy_data, lower, upper)
```

---

## 4. Modern Random Generator API (`default_rng`)
Avoid the legacy `np.random.seed()` API in production; use the PCG64-based `np.random.default_rng`:
```python
rng = np.random.default_rng(seed=42)

# Distributions
normals = rng.normal(loc=0.0, scale=1.0, size=(1000,))
integers = rng.integers(low=1, high=10, size=5)

# Shuffle and choice
items = np.array(["apple", "banana", "cherry", "date"])
sample = rng.choice(items, size=2, replace=False)
```

---

## 5. Memory Layout: Strides, C-Order vs Fortran-Order
- **C-Order (Row-Major)**: Consecutive elements of a row are adjacent in memory. Default in NumPy and C.
- **Fortran-Order (Column-Major)**: Consecutive elements of a column are adjacent. Used in MATLAB, R, and BLAS.
- Iterating down columns of a large C-contiguous matrix causes cache misses!

```python
c_arr = np.zeros((10000, 10000), order='C')
f_arr = np.zeros((10000, 10000), order='F')

# c_arr.strides -> (80000, 8) bytes to step row, col
# f_arr.strides -> (8, 80000) bytes to step row, col
```

### Einstein Summation (`np.einsum`)
Combines transpose, trace, matrix multiply, and batch contractions into a concise string notation:
```python
A = np.random.rand(3, 4)
B = np.random.rand(4, 5)

# Matrix multiplication: A @ B
C = np.einsum('ij,jk->ik', A, B)

# Matrix trace (sum of diagonal)
tr = np.einsum('ii', np.eye(4))

# Batch matrix multiplication: (B, N, K) x (B, K, M) -> (B, N, M)
batch_A = np.random.rand(10, 3, 4)
batch_B = np.random.rand(10, 4, 5)
batch_C = np.einsum('bij,bjk->bik', batch_A, batch_B)
```

---

## 6. Sample Workouts
### Workout 1: Train/Test Split by Random Indices
```python
def train_test_split_np(X, y, test_size=0.2, random_state=42):
    rng = np.random.default_rng(random_state)
    n_samples = len(X)
    indices = rng.permutation(n_samples)
    split_idx = int(n_samples * (1 - test_size))
    
    train_idx, test_idx = indices[:split_idx], indices[split_idx:]
    return X[train_idx], X[test_idx], y[train_idx], y[test_idx]

X = np.arange(100).reshape(50, 2)
y = np.arange(50)
X_train, X_test, y_train, y_test = train_test_split_np(X, y)
print(f"Train size: {len(X_train)}, Test size: {len(X_test)}")
```

### Workout 2: Moving Average via 1D Convolution
```python
def moving_average(data, window_size=3):
    kernel = np.ones(window_size) / window_size
    return np.convolve(data, kernel, mode='valid')

series = np.array([1, 3, 5, 7, 9, 11, 13])
ma = moving_average(series, window_size=3)
print("Moving Average:", ma)  # [3., 5., 7., 9., 11.]
```

### Workout 3: Fast Pairwise Cosine Similarity via Matrix Ops
```python
def pairwise_cosine_similarity(A, B):
    # A: (N, D), B: (M, D)
    dot = A @ B.T
    norm_A = np.linalg.norm(A, axis=1, keepdims=True)
    norm_B = np.linalg.norm(B, axis=1, keepdims=True)
    return dot / (norm_A @ norm_B.T + 1e-9)

docs = np.random.rand(5, 128)
queries = np.random.rand(2, 128)
sim = pairwise_cosine_similarity(queries, docs)
print("Query-Doc Similarity Shape:", sim.shape)  # (2, 5)
```
""",
        "questions": [
            {
                "question_text": "What is the key performance difference between looping through a C-contiguous matrix row-by-row versus column-by-column?",
                "answer_text": "In a C-contiguous (row-major) matrix, rows are stored adjacent in physical RAM. Looping row-by-row pre-loads sequential cache lines into the CPU L1/L2 caches (spatial locality). Looping column-by-column strides across memory pages, causing frequent CPU cache misses and significant slowdown.",
                "difficulty": "ADVANCED",
                "question_type": "CONCEPTUAL"
            }
        ],
        "resources": [
            {"title": "NumPy Internals & Memory Layout", "url": "https://numpy.org/doc/stable/reference/internals.html", "resource_type": "DOCUMENTATION"},
            {"title": "Mastering np.einsum", "url": "https://ajcr.net/Basic-guide-to-einsum/", "resource_type": "ARTICLE"}
        ]
    },

    # -------------------------------------------------------------
    # 3. Pandas: Introduction
    # -------------------------------------------------------------
    {
        "slug": "pandas-introduction",
        "title": "3. Pandas: Introduction",
        "summary": "Foundational tabular data manipulation in Python: Series, DataFrames, loc vs iloc selection, boolean indexing, query(), column operations, type conversions, and understanding SettingWithCopyWarning.",
        "difficulty": "BEGINNER",
        "learning_objective": "Master Series and DataFrame structures, execute label-based and integer-based indexing without warnings, and apply vectorized data cleaning functions.",
        "prerequisites": "NumPy Introduction",
        "expected_outcome": "Load, inspect, slice, filter, and transform tabular datasets with clean idiomatic Pandas code.",
        "practice_requirement": "Perform 10 DataFrame manipulation exercises with filtering, type conversions, and SettingWithCopy resolution.",
        "machine_task_relevance": "Standard format for tabular feature engineering, data pipelines, and database imports.",
        "practical_task_relevance": "Used in ETL scripts, CSV transformations, feature store ingestion, and BI reporting.",
        "interview_relevance": "Critical interview filter: difference between loc and iloc, why SettingWithCopy occurs, and vectorization vs apply.",
        "subtopics": [
            "Creating Series (list, dict, scalar)",
            "Index and values, custom index",
            "Indexing, slicing, boolean filtering",
            "Vectorized operations and alignment",
            "Creating DataFrames (dict, list of dicts, NumPy array)",
            "head, tail, sample, info, describe, shape, dtypes, columns, index",
            "Selecting columns, adding, renaming, dropping",
            "loc vs iloc vs at vs iat",
            "Boolean indexing, query()",
            "isin, between, str.contains for filtering",
            "Sorting: sort_values, sort_index",
            "set_index, reset_index",
            "Arithmetic and aggregation (sum, mean, count, min, max)",
            "value_counts, unique, nunique",
            "apply, map, applymap / DataFrame.map",
            "Lambda functions with apply",
            "String methods (.str)",
            "Datetime basics (.dt, to_datetime)",
            "astype and type conversion",
            "Copy vs view, SettingWithCopyWarning"
        ],
        "material": """# 3. Pandas: Introduction

## 1. Core Structures: Series & DataFrame
- **Series**: 1D labeled array capable of holding any data type with an explicit index.
- **DataFrame**: 2D labeled tabular structure with heterogeneous columns and row/column indexes.

```python
import pandas as pd
import numpy as np

# Series
s = pd.Series([100, 250, 300], index=["US", "EU", "APAC"], name="revenue")

# DataFrame from dictionary of lists
data = {
    "name": ["Alice", "Bob", "Charlie", "David"],
    "age": [25, 30, 35, 40],
    "city": ["New York", "London", "San Francisco", "London"],
    "salary": [75000.0, 92000.0, 110000.0, 88000.0]
}
df = pd.DataFrame(data)

# Inspection
print(df.info())
print(df.describe())
print(df.shape)  # (4, 4)
```

---

## 2. Selection & Indexing: `loc` vs `iloc`
- `df.loc[row_label, col_label]`: Label-based indexing (inclusive of end label).
- `df.iloc[row_idx, col_idx]`: Integer position-based indexing (exclusive of end index, like Python slice).
- `df.at` and `df.iat`: Fast single-value scalar access.

```python
# Access by label
alice_salary = df.loc[0, "salary"]
london_staff = df.loc[df["city"] == "London", ["name", "salary"]]

# Access by integer position
first_two_rows = df.iloc[0:2, 0:3]
val = df.iat[1, 3]  # row 1, col 3

# query() expression filtering
high_earners = df.query("salary > 85000 and city != 'New York'")
```

---

## 3. String & Datetime Accessors
```python
# String methods (.str)
df["city_clean"] = df["city"].str.strip().str.upper()
has_san = df["city"].str.contains("San", case=False, na=False)

# Datetime methods (.dt)
dates = pd.to_datetime(["2025-01-15", "2025-02-20", "2025-03-25"])
df["hire_date"] = dates
df["year"] = df["hire_date"].dt.year
df["month_name"] = df["hire_date"].dt.month_name()
```

---

## 4. SettingWithCopyWarning: Cause and Fix
- Occurs when chained indexing (`df[col][mask] = val`) creates an ambiguous view/copy reference.
- **Fix**: Always use `df.loc[mask, col] = val` or explicit `.copy()`.

```python
# WRONG (Chained Indexing): triggers SettingWithCopyWarning
# df[df["age"] > 30]["salary"] = 120000

# CORRECT:
df.loc[df["age"] > 30, "salary"] = 120000.0

# When creating a subset to mutate independently:
subset_df = df[df["city"] == "London"].copy()
subset_df["bonus"] = 5000
```

---

## 5. Sample Workouts
### Workout 1: Clean and Standardize Employee Registry
```python
raw = pd.DataFrame({
    "emp_id": ["E101", "E102", "E103"],
    "compensation": ["$85,000", "$110,500", "$92,000"],
    "department": ["  engineering  ", "HR", "FINANCE "]
})

# Strip $, comma and cast to float
raw["compensation"] = (
    raw["compensation"]
    .str.replace("$", "", regex=False)
    .str.replace(",", "", regex=False)
    .astype(float)
)
raw["department"] = raw["department"].str.strip().str.title()
print(raw)
```

### Workout 2: Conditional Binning via pd.cut
```python
ages = pd.Series([19, 24, 33, 45, 52, 68])
bins = [0, 25, 45, 65, 100]
labels = ["Gen-Z", "Millennial", "Gen-X", "Boomer"]

age_groups = pd.cut(ages, bins=bins, labels=labels, right=True)
print(age_groups.value_counts())
```

### Workout 3: Deduplication and Ranking
```python
records = pd.DataFrame({
    "user_id": [1, 1, 2, 2, 3],
    "login_time": pd.to_datetime(["2025-01-01", "2025-01-05", "2025-01-02", "2025-01-03", "2025-01-01"]),
    "score": [80, 95, 70, 75, 88]
})

# Keep the latest record per user
latest_records = records.sort_values("login_time", ascending=False).drop_duplicates(subset=["user_id"], keep="first")
print(latest_records)
```
""",
        "questions": [
            {
                "question_text": "What causes the Pandas `SettingWithCopyWarning`, and how do you resolve it reliably?",
                "answer_text": "The warning occurs during chained indexing (e.g. `df['col'][mask] = val`), where Pandas cannot determine whether the intermediate slice is a memory view or a copy, risking silent failure. It is resolved by using label-based `.loc` indexing (`df.loc[mask, 'col'] = val`) or by making an explicit `.copy()` on sliced DataFrames.",
                "difficulty": "INTERMEDIATE",
                "question_type": "CONCEPTUAL"
            }
        ],
        "resources": [
            {"title": "10 Minutes to Pandas", "url": "https://pandas.pydata.org/docs/user_guide/10min.html", "resource_type": "DOCUMENTATION"},
            {"title": "Pandas Indexing & Selecting Data", "url": "https://pandas.pydata.org/docs/user_guide/indexing.html", "resource_type": "DOCUMENTATION"}
        ]
    },

    # -------------------------------------------------------------
    # 4. Pandas: Advanced
    # -------------------------------------------------------------
    {
        "slug": "pandas-advanced",
        "title": "4. Pandas: Advanced",
        "summary": "High-performance data aggregation: Split-Apply-Combine groupby, window functions, relational joins, table reshaping (pivot, melt, stack), MultiIndex, missing data imputation patterns, and memory optimization.",
        "difficulty": "ADVANCED",
        "learning_objective": "Master complex groupby operations with named aggregation, relational merges with validation, long-to-wide table reshaping, and optimize memory footprints with categorical downcasting.",
        "prerequisites": "Pandas Introduction",
        "expected_outcome": "Execute complex multi-table analytical joins and optimize memory footprints on million-row data frames.",
        "practice_requirement": "Build multi-level grouped aggregations, pivot table summaries, and downcast memory usage by over 60%.",
        "machine_task_relevance": "Essential for tabular ML pipelines, feature stores, and automated training data extraction.",
        "practical_task_relevance": "Used in complex financial report consolidation, churn forecasting features, and warehouse ETL.",
        "interview_relevance": "Classic data science interview question: explain split-apply-combine, differences between transform vs apply, and merge vs concat.",
        "subtopics": [
            "groupby basics (split-apply-combine)",
            "agg with multiple functions, named aggregation",
            "transform and filter",
            "Grouping by multiple columns",
            "groupby apply",
            "Rolling and expanding windows",
            "resample for time series",
            "pd.merge (inner, left, right, outer)",
            "on, left_on, right_on, suffixes, indicator",
            "join on index",
            "pd.concat (axis=0 and axis=1)",
            "Handling duplicate keys",
            "pivot and pivot_table",
            "melt (wide to long)",
            "stack and unstack",
            "crosstab",
            "MultiIndex basics",
            "explode",
            "isna, notna, isnull",
            "dropna (how, thresh, subset)",
            "fillna (constant, mean, median, ffill, bfill)",
            "interpolate",
            "Missing data patterns (MCAR, MAR, MNAR)",
            "category dtype",
            "Downcasting numeric types",
            "Vectorization over apply",
            "chunksize for large files",
            "Method chaining, pipe(), assign()",
            "eval and query",
            "Parquet vs CSV"
        ],
        "material": """# 4. Pandas: Advanced

## 1. GroupBy: Split-Apply-Combine & Named Aggregation
```python
import pandas as pd
import numpy as np

df = pd.DataFrame({
    "department": ["Sales", "Sales", "Eng", "Eng", "Eng"],
    "employee": ["A", "B", "C", "D", "E"],
    "salary": [60000, 75000, 110000, 125000, 95000],
    "experience": [2, 5, 4, 8, 3]
})

# Named aggregation: clean output column names without MultiIndex
summary = df.groupby("department").agg(
    total_payroll=("salary", "sum"),
    avg_salary=("salary", "mean"),
    max_exp=("experience", "max"),
    headcount=("employee", "count")
).reset_index()

# transform: preserves original DataFrame row shape (broadcasts back)
df["dept_avg_salary"] = df.groupby("department")["salary"].transform("mean")
df["salary_vs_dept_mean"] = df["salary"] - df["dept_avg_salary"]

# filter: keep only groups meeting criteria
large_depts = df.groupby("department").filter(lambda g: len(g) >= 3)
```

---

## 2. Merging, Joining & Concatenation
```python
orders = pd.DataFrame({
    "order_id": [101, 102, 103],
    "customer_id": [1, 2, 99],
    "amount": [250.0, 140.0, 500.0]
})
customers = pd.DataFrame({
    "customer_id": [1, 2, 3],
    "name": ["Alice", "Bob", "Charlie"]
})

# pd.merge with validation and indicator
merged = pd.merge(
    orders,
    customers,
    on="customer_id",
    how="left",
    indicator=True,
    validate="many_to_one"
)
# _merge column indicates: 'both', 'left_only', or 'right_only'
```

---

## 3. Table Reshaping: `pivot_table` & `melt`
- **Pivot Table**: Aggregate and spread categorical values across columns (long to wide).
- **Melt**: Unpivot columns into variable-value rows (wide to long, ideal for tidy data).

```python
sales = pd.DataFrame({
    "date": ["2025-01", "2025-01", "2025-02", "2025-02"],
    "region": ["North", "South", "North", "South"],
    "revenue": [1000, 1500, 1200, 1800]
})

# Long to Wide
pivot = sales.pivot_table(index="date", columns="region", values="revenue", aggfunc="sum")

# Wide to Long
wide_df = pd.DataFrame({
    "product": ["Widget A", "Widget B"],
    "Q1": [100, 150],
    "Q2": [120, 170]
})
tidy_df = wide_df.melt(id_vars=["product"], var_name="quarter", value_name="units_sold")
```

---

## 4. Missing Data Imputation & Diagnostics
- **MCAR** (Missing Completely at Random): Drop or mean/median impute.
- **MAR** (Missing at Random): Conditioned on other columns (group-wise impute).
- **MNAR** (Missing Not at Random): Missingness has meaning; add missing indicator column.

```python
df["salary_filled"] = df.groupby("department")["salary"].transform(lambda g: g.fillna(g.median()))
```

---

## 5. Memory Optimization & Parquet Storage
```python
def optimize_dtypes(df):
    for col in df.columns:
        if df[col].dtype == "object":
            if df[col].nunique() / len(df) < 0.5:
                df[col] = df[col].astype("category")
        elif df[col].dtype == "int64":
            df[col] = pd.to_numeric(df[col], downcast="integer")
        elif df[col].dtype == "float64":
            df[col] = pd.to_numeric(df[col], downcast="float")
    return df

# Parquet storage: snappy compressed, columnar, type-safe
# df.to_parquet("optimized.parquet", engine="pyarrow", compression="snappy")
```

---

## 6. Sample Workouts
### Workout 1: Rolling 7-Day Revenue with Expanding Benchmark
```python
dates = pd.date_range("2025-01-01", periods=10, freq="D")
ts_df = pd.DataFrame({
    "date": dates,
    "revenue": [100, 120, 110, 150, 130, 170, 200, 190, 210, 250]
}).set_index("date")

ts_df["rolling_7d_mean"] = ts_df["revenue"].rolling(window=7, min_periods=1).mean()
ts_df["expanding_max"] = ts_df["revenue"].expanding().max()
print(ts_df.tail())
```

### Workout 2: Multi-Column Fuzzy Grouping with Cross Tabulation
```python
survey = pd.DataFrame({
    "education": ["BSc", "MSc", "PhD", "BSc", "MSc", "PhD"],
    "satisfaction": ["High", "High", "Medium", "Low", "Medium", "High"]
})
ct = pd.crosstab(survey["education"], survey["satisfaction"], normalize="index") * 100
print(ct.round(1))
```

### Workout 3: High-Performance Method Chaining with `.pipe()`
```python
def remove_outliers(df, col):
    q25, q75 = df[col].quantile(0.25), df[col].quantile(0.75)
    iqr = q75 - q25
    return df[(df[col] >= q25 - 1.5 * iqr) & (df[col] <= q75 + 1.5 * iqr)]

def add_tax(df):
    return df.assign(gross_salary=df["salary"] * 1.25)

clean_df = (
    df
    .pipe(remove_outliers, col="salary")
    .pipe(add_tax)
    .sort_values("gross_salary", ascending=False)
)
print(clean_df[["employee", "salary", "gross_salary"]])
```
""",
        "questions": [
            {
                "question_text": "What is the difference between `groupby.transform` and `groupby.apply` in Pandas?",
                "answer_text": "`transform` returns an object with the exact same index and size as the original grouped DataFrame, making it ideal for broadcasting group statistics (e.g. group means or z-scores) back to individual rows. `apply` is a general-purpose method that can return arbitrary scalar, Series, or DataFrame shapes per group.",
                "difficulty": "ADVANCED",
                "question_type": "CONCEPTUAL"
            }
        ],
        "resources": [
            {"title": "Pandas GroupBy User Guide", "url": "https://pandas.pydata.org/docs/user_guide/groupby.html", "resource_type": "DOCUMENTATION"},
            {"title": "Reshaping and Pivot Tables", "url": "https://pandas.pydata.org/docs/user_guide/reshaping.html", "resource_type": "DOCUMENTATION"}
        ]
    },

    # -------------------------------------------------------------
    # 5. Matplotlib: Introduction
    # -------------------------------------------------------------
    {
        "slug": "matplotlib-introduction",
        "title": "5. Matplotlib: Introduction",
        "summary": "Core data visualization foundation: Matplotlib Object-Oriented (OO) API vs pyplot, Figure & Axes hierarchy, line styling, legends, axis ticks, GridSpec subplots, twin axes, and vector asset export.",
        "difficulty": "BEGINNER",
        "learning_objective": "Master the Object-Oriented Matplotlib interface (`fig, ax = plt.subplots()`), customize figure canvases, and build clean multi-panel scientific charts.",
        "prerequisites": "Python Fundamentals",
        "expected_outcome": "Construct clean, publication-ready multi-panel plots with proper labels, scales, legends, and dpi export.",
        "practice_requirement": "Build a 2x2 multi-axis dashboard showcasing twin axes, custom annotations, and customized ticks.",
        "machine_task_relevance": "Used for model training loss curve monitoring, metric visualization, and diagnostic inspection.",
        "practical_task_relevance": "Essential for communicating findings to engineering, product, and leadership stakeholders.",
        "interview_relevance": "Core interview test: why prefer the Object-Oriented API over stateful `plt.*` calls.",
        "subtopics": [
            "pyplot vs object-oriented API",
            "Figure, Axes, Axis, Artist",
            "plt.plot, plt.show, plt.savefig (dpi, bbox_inches)",
            "Line styles, markers, colors, linewidth",
            "Title, xlabel, ylabel",
            "Legend and label",
            "xlim, ylim, ticks, tick labels, rotation",
            "Grid, spines",
            "Annotations and text",
            "Colormaps and colorbars",
            "Styles (plt.style.use), rcParams",
            "Figure size and dpi",
            "plt.subplots (nrows, ncols)",
            "Sharing axes (sharex, sharey)",
            "tight_layout vs constrained_layout",
            "GridSpec and subplot_mosaic",
            "Twin axes (twinx)",
            "Inset axes"
        ],
        "material": """# 5. Matplotlib: Introduction

## 1. Anatomy of Matplotlib: Figure vs Axes
- **Figure**: The top-level bounding canvas holding all subplots, titles, legends, and artists.
- **Axes**: A single plot/coordinate area containing x-axis, y-axis, lines, bars, and titles.
- **Rule**: Always use the **Object-Oriented API** (`fig, ax = plt.subplots()`) instead of stateful `plt.plot()`.

```python
import matplotlib.pyplot as plt
import numpy as np

# Object-Oriented initialization
fig, ax = plt.subplots(figsize=(8, 4), dpi=100)

x = np.linspace(0, 10, 100)
y1 = np.sin(x)
y2 = np.cos(x)

ax.plot(x, y1, color="#2563EB", linewidth=2.0, linestyle="-", label="Sine Wave")
ax.plot(x, y2, color="#DC2626", linewidth=1.5, linestyle="--", label="Cosine Wave")

# Styling
ax.set_title("Harmonic Oscillations", fontsize=14, fontweight="bold", pad=12)
ax.set_xlabel("Time (seconds)", fontsize=11)
ax.set_ylabel("Amplitude", fontsize=11)
ax.set_xlim(0, 10)
ax.set_ylim(-1.5, 1.5)
ax.grid(True, linestyle=":", alpha=0.6)
ax.legend(loc="upper right", frameon=True)

# Export
# fig.savefig("sine_wave.png", dpi=300, bbox_inches="tight")
plt.close(fig)
```

---

## 2. Multi-Panel Subplots & GridSpec
```python
# 2x2 grid sharing x-axis
fig, axes = plt.subplots(2, 2, figsize=(10, 8), sharex="col", layout="constrained")

axes[0, 0].plot(x, np.exp(x/5), color="green")
axes[0, 0].set_title("Exponential Growth")

axes[0, 1].plot(x, np.log1p(x), color="purple")
axes[0, 1].set_title("Logarithmic Curve")

axes[1, 0].bar([1, 2, 3, 4], [10, 24, 18, 30], color="#0284C7")
axes[1, 0].set_title("Category Volume")

axes[1, 1].scatter(np.random.rand(20), np.random.rand(20), color="#E11D48")
axes[1, 1].set_title("Scatter Distribution")
plt.close(fig)
```

---

## 3. Twin Axes & Annotations
```python
fig, ax1 = plt.subplots(figsize=(8, 4))

months = ["Jan", "Feb", "Mar", "Apr", "May"]
revenue = [120, 150, 170, 160, 210]
margin_pct = [18, 22, 25, 21, 28]

# Primary Axis: Bars
ax1.bar(months, revenue, color="#3B82F6", alpha=0.7, label="Revenue ($k)")
ax1.set_ylabel("Revenue ($k)", color="#3B82F6")

# Twin Secondary Axis: Line
ax2 = ax1.twinx()
ax2.plot(months, margin_pct, color="#10B981", marker="o", linewidth=2.5, label="Margin %")
ax2.set_ylabel("Profit Margin (%)", color="#10B981")

# Annotation
ax2.annotate(
    "Peak Margin!",
    xy=(4, 28),
    xytext=(2.8, 26),
    arrowprops=dict(facecolor="#10B981", shrink=0.05, width=1.5, headwidth=6)
)
plt.close(fig)
```

---

## 4. Sample Workouts
### Workout 1: Custom Loss & Accuracy Convergence Monitor
```python
def plot_training_curves(epochs, train_loss, val_loss, val_acc):
    fig, (ax_loss, ax_acc) = plt.subplots(1, 2, figsize=(12, 4))
    
    ax_loss.plot(epochs, train_loss, label="Train Loss", color="blue")
    ax_loss.plot(epochs, val_loss, label="Val Loss", color="red", linestyle="--")
    ax_loss.set_title("Loss Trajectory")
    ax_loss.set_xlabel("Epoch")
    ax_loss.set_ylabel("Cross Entropy")
    ax_loss.legend()
    ax_loss.grid(True, alpha=0.3)
    
    ax_acc.plot(epochs, val_acc, label="Validation Accuracy", color="green")
    ax_acc.set_title("Validation Accuracy")
    ax_acc.set_xlabel("Epoch")
    ax_acc.set_ylabel("Accuracy (%)")
    ax_acc.set_ylim(0, 100)
    ax_acc.grid(True, alpha=0.3)
    
    return fig

fig = plot_training_curves(range(1, 6), [0.9, 0.6, 0.4, 0.3, 0.25], [0.95, 0.68, 0.45, 0.38, 0.35], [55, 72, 83, 87, 89])
plt.close(fig)
```

### Workout 2: Histogram with Fitted Normal PDF Curve
```python
data = np.random.normal(loc=50, scale=10, size=1000)
fig, ax = plt.subplots(figsize=(8, 4))

# Density histogram
count, bins, _ = ax.hist(data, bins=30, density=True, color="#93C5FD", edgecolor="white", alpha=0.8)

# Analytical PDF overlay
mu, sigma = 50, 10
pdf = 1 / (sigma * np.sqrt(2 * np.pi)) * np.exp(- (bins - mu)**2 / (2 * sigma**2))
ax.plot(bins, pdf, color="#1E40AF", linewidth=2.5, label="Theoretical PDF")

ax.set_title("Normal Distribution Fit")
ax.legend()
plt.close(fig)
```

### Workout 3: Subplot Mosaic Layout for Complex Dashboards
```python
# Expressive multi-panel layouts using string mosaics
mosaic_layout = '''
AAB
AAC
'''
fig, ax_dict = plt.subplot_mosaic(mosaic_layout, figsize=(9, 6))

ax_dict["A"].set_title("Main Timeline (A)")
ax_dict["B"].set_title("Summary Donut (B)")
ax_dict["C"].set_title("Metrics Table (C)")
plt.close(fig)
```
""",
        "questions": [
            {
                "question_text": "Why is the Object-Oriented Matplotlib API preferred over the stateful `plt` procedural interface in production code?",
                "answer_text": "The procedural `plt` interface relies on a global, stateful state machine that tracks the 'current' figure and axes, leading to subtle bugs in multi-threaded environments, functions, or complex dashboards. The Object-Oriented API explicitly binds operations to specific Figure and Axes instances (`fig, ax`), ensuring thread-safety, modular code, and complete layout control.",
                "difficulty": "BEGINNER",
                "question_type": "CONCEPTUAL"
            }
        ],
        "resources": [
            {"title": "Matplotlib Anatomy of a Plot", "url": "https://matplotlib.org/stable/gallery/showcase/anatomy.html", "resource_type": "DOCUMENTATION"},
            {"title": "Matplotlib Plot Types Guide", "url": "https://matplotlib.org/stable/plot_types/index.html", "resource_type": "DOCUMENTATION"}
        ]
    },

    # -------------------------------------------------------------
    # 6. Data Visualization with Matplotlib
    # -------------------------------------------------------------
    {
        "slug": "data-visualization-with-matplotlib",
        "title": "6. Data Visualization with Matplotlib",
        "summary": "Practical chart taxonomy & visual storytelling: Bar charts (grouped, stacked), histograms, scatter with colorbars, box & violin distributions, heatmaps via imshow, error bars, and eliminating chartjunk.",
        "difficulty": "INTERMEDIATE",
        "learning_objective": "Select optimal visual encodings for numeric and categorical relationships, format colorblind-safe palettes, and communicate insights clearly.",
        "prerequisites": "Matplotlib Introduction",
        "expected_outcome": "Design high-impact visual narratives that accurately communicate distributions, correlations, and rankings.",
        "practice_requirement": "Construct grouped bar charts with error bars, a custom correlation heatmap with imshow, and boxplot distribution comparisons.",
        "machine_task_relevance": "Critical for model interpretability, error analysis, and feature importance reporting.",
        "practical_task_relevance": "Used in executive KPI decks, customer segment profiling, and experimental analytics.",
        "interview_relevance": "Frequently asked: when to use box plots vs violin plots, and why pie charts are discouraged.",
        "subtopics": [
            "Line plot",
            "Bar chart (vertical, horizontal, grouped, stacked)",
            "Histogram (bins, density, cumulative)",
            "Scatter plot (size, color, alpha, colormap)",
            "Box plot",
            "Violin plot",
            "Pie chart and when not to use it",
            "Area plot, stackplot",
            "Heatmap (imshow)",
            "Error bars",
            "Contour and 3D plots",
            "Choosing the right chart for the question",
            "Clear titles, labels, units",
            "Color choice, colorblind-friendly palettes",
            "Reduce clutter, highlight the key insight",
            "Annotate important points",
            "Avoid misleading axes",
            "df.plot (kind, x, y, subplots)",
            "df.hist, df.boxplot",
            "Time series plots"
        ],
        "material": """# 6. Data Visualization with Matplotlib

## 1. Chart Selection Framework
| Question / Relationship | Primary Chart | Alternative | What to Avoid |
| :--- | :--- | :--- | :--- |
| **Trend over Time** | Line plot | Area plot | High-cardinality bar charts |
| **Categorical Comparison** | Horizontal bar chart | Grouped bar | Pie chart (>3 slices) |
| **Distribution / Spread** | Box plot / Violin plot | Histogram with KDE | Truncating zero on bar charts |
| **Relationship / Correlation** | Scatter plot with alpha | 2D Hexbin / Contour | Spaghetti line plots |
| **Part-to-Whole Ratio** | 100% Stacked bar | Waffle chart | 3D exploded pie charts |

---

## 2. Advanced Bar Charts: Grouped & Stacked
```python
import matplotlib.pyplot as plt
import numpy as np

categories = ["North", "South", "East", "West"]
q1_sales = [45, 52, 38, 60]
q2_sales = [55, 48, 42, 65]

x = np.arange(len(categories))
width = 0.35

fig, (ax_grouped, ax_stacked) = plt.subplots(1, 2, figsize=(12, 5))

# Grouped
ax_grouped.bar(x - width/2, q1_sales, width, label="Q1", color="#3B82F6")
ax_grouped.bar(x + width/2, q2_sales, width, label="Q2", color="#10B981")
ax_grouped.set_xticks(x, categories)
ax_grouped.set_title("Grouped Regional Comparison")
ax_grouped.legend()

# Stacked
ax_stacked.bar(categories, q1_sales, label="Q1", color="#3B82F6")
ax_stacked.bar(categories, q2_sales, bottom=q1_sales, label="Q2", color="#10B981")
ax_stacked.set_title("Stacked Total Sales")
ax_stacked.legend()

plt.close(fig)
```

---

## 3. Scatter Plots with Colorbars & Size Encodings
```python
np.random.seed(42)
n = 100
gdp_per_capita = np.random.uniform(5000, 60000, n)
life_expectancy = 40 + 8 * np.log(gdp_per_capita) + np.random.normal(0, 2, n)
population = np.random.uniform(1, 100, n)
hdi_index = np.random.uniform(0.4, 0.95, n)

fig, ax = plt.subplots(figsize=(8, 5))
scatter = ax.scatter(
    gdp_per_capita,
    life_expectancy,
    s=population * 3,     # size encoding
    c=hdi_index,          # color encoding
    cmap="viridis",
    alpha=0.75,
    edgecolors="black",
    linewidth=0.5
)
cbar = fig.colorbar(scatter, ax=ax)
cbar.set_label("Human Development Index")
ax.set_xscale("log")
ax.set_xlabel("GDP per Capita (USD, Log Scale)")
ax.set_ylabel("Life Expectancy (Years)")
ax.set_title("Development Indicators by Nation")
plt.close(fig)
```

---

## 4. Heatmap via `ax.imshow`
```python
corr_matrix = np.corrcoef(np.random.randn(5, 50))
feature_names = [f"F_{i}" for i in range(5)]

fig, ax = plt.subplots(figsize=(6, 5))
im = ax.imshow(corr_matrix, cmap="coolwarm", vmin=-1, vmax=1)
fig.colorbar(im, ax=ax)

ax.set_xticks(range(5), feature_names)
ax.set_yticks(range(5), feature_names)
for i in range(5):
    for j in range(5):
        ax.text(j, i, f"{corr_matrix[i, j]:.2f}", ha="center", va="center", color="black", fontsize=9)
ax.set_title("Feature Correlation Matrix")
plt.close(fig)
```

---

## 5. Sample Workouts
### Workout 1: Box Plot vs Violin Plot Distribution Comparison
```python
groups = [np.random.normal(0, 1, 100), np.random.normal(2, 1.5, 100), np.random.exponential(1.5, 100)]
fig, (ax_box, ax_violin) = plt.subplots(1, 2, figsize=(10, 4))

ax_box.boxplot(groups, labels=["Normal 1", "Normal 2", "Exponential"], patch_artist=True)
ax_box.set_title("Boxplot (Medians & Quartiles)")

ax_violin.violinplot(groups, showmedians=True)
ax_violin.set_xticks([1, 2, 3], ["Normal 1", "Normal 2", "Exponential"])
ax_violin.set_title("Violin Plot (Full Density Profile)")
plt.close(fig)
```

### Workout 2: Error Bars on Survey Satisfaction Scores
```python
means = [78.2, 84.5, 69.1]
errors = [4.1, 3.2, 5.5]
labels = ["Product A", "Product B", "Product C"]

fig, ax = plt.subplots(figsize=(6, 4))
ax.bar(labels, means, yerr=errors, capsize=5, color="#60A5FA", edgecolor="#2563EB", alpha=0.85)
ax.set_ylabel("Satisfaction Score (0-100)")
ax.set_title("Customer Satisfaction (with 95% CI)")
plt.close(fig)
```

### Workout 3: Horizontal Benchmark Chart with Value Labels
```python
models = ["Logistic Reg", "Random Forest", "Gradient Boost", "Transformer"]
f1_scores = [0.76, 0.84, 0.89, 0.94]

fig, ax = plt.subplots(figsize=(7, 3.5))
bars = ax.barh(models, f1_scores, color="#059669", height=0.55)
ax.set_xlim(0, 1.05)
for bar in bars:
    w = bar.get_width()
    ax.text(w + 0.01, bar.get_y() + bar.get_height()/2, f"{w:.2f}", va="center", fontweight="bold")
ax.set_xlabel("F1-Score")
ax.set_title("Model Benchmark Performance")
plt.close(fig)
```
""",
        "questions": [
            {
                "question_text": "Why are pie charts generally discouraged in professional data visualization, and what chart is preferred instead?",
                "answer_text": "Human vision is poor at accurately estimating and comparing angles and 2D area slices, especially when categories have similar values or more than 3 categories exist. A horizontal bar chart is strongly preferred because humans perceive 1D lengths aligned along a common baseline with far greater precision.",
                "difficulty": "INTERMEDIATE",
                "question_type": "CONCEPTUAL"
            }
        ],
        "resources": [
            {"title": "Storytelling with Data Guide", "url": "https://www.storytellingwithdata.com/chart-guide", "resource_type": "ARTICLE"},
            {"title": "From Data to Viz (Chart Selector)", "url": "https://www.data-to-viz.com/", "resource_type": "WEBSITE"}
        ]
    },

    # -------------------------------------------------------------
    # 7. Seaborn
    # -------------------------------------------------------------
    {
        "slug": "seaborn-statistical-visualization",
        "title": "7. Seaborn",
        "summary": "Statistical graphics with Seaborn: Figure-level vs axes-level functions, distribution plots (histplot, kdeplot, ecdfplot), categorical plots (catplot, boxplot, violin), relational plots (relplot, scatterplot), matrix heatmaps, and pairplot analysis.",
        "difficulty": "INTERMEDIATE",
        "learning_objective": "Harness Seaborn's semantic encodings (`hue`, `size`, `style`), distinguish figure-level (`relplot`, `displot`, `catplot`) from axes-level primitives, and conduct rapid multivariate exploratory data analysis.",
        "prerequisites": "Matplotlib Introduction, Pandas Introduction",
        "expected_outcome": "Quickly generate elegant statistical plots with built-in confidence intervals and faceted grid displays.",
        "practice_requirement": "Produce a multi-panel pairplot, correlation heatmap with annotations, and a faceted catplot across demographic segments.",
        "machine_task_relevance": "Used in automated exploratory data analysis scripts and model diagnostic reporting.",
        "practical_task_relevance": "Accelerates exploratory data analysis in Kaggle competitions, user behavior studies, and clinical trials.",
        "interview_relevance": "Interview classic: figure-level vs axes-level functions in Seaborn and how to customize them via Matplotlib.",
        "subtopics": [
            "Installing, import seaborn as sns",
            "Built-in datasets (load_dataset)",
            "Themes, styles, context, palettes",
            "histplot, kdeplot, ecdfplot",
            "displot",
            "rugplot",
            "barplot, countplot",
            "boxplot, violinplot, stripplot, swarmplot",
            "catplot",
            "scatterplot, lineplot",
            "relplot",
            "hue, size, style parameters",
            "heatmap (annot, cmap, correlation matrix)",
            "clustermap",
            "pairplot, jointplot",
            "FacetGrid and col/row faceting",
            "regplot, lmplot, residplot",
            "Figure-level vs axes-level functions",
            "Using Seaborn with Matplotlib axes",
            "Custom palettes and despine"
        ],
        "material": """# 7. Seaborn: Statistical Graphics

## 1. Seaborn Architecture: Figure-Level vs Axes-Level
- **Axes-Level Functions** (`sns.histplot`, `sns.scatterplot`, `sns.boxplot`):
  - Plot onto an existing Matplotlib `Axes` (`ax=ax`).
  - Compatible with `plt.subplots()` layouts.
- **Figure-Level Functions** (`sns.displot`, `sns.relplot`, `sns.catplot`):
  - Manage their own `FacetGrid` figure canvas.
  - Support easy row and column multi-panel faceting (`col='category'`).

```python
import seaborn as sns
import matplotlib.pyplot as plt

# Theming
sns.set_theme(style="whitegrid", palette="muted")
tips = sns.load_dataset("tips")

# Axes-level plot inside Matplotlib figure
fig, ax = plt.subplots(figsize=(6, 4))
sns.scatterplot(data=tips, x="total_bill", y="tip", hue="time", style="smoker", ax=ax)
ax.set_title("Tip vs Total Bill")
plt.close(fig)

# Figure-level plot with faceting across lunch vs dinner
g = sns.relplot(
    data=tips,
    x="total_bill",
    y="tip",
    col="time",
    hue="sex",
    kind="scatter"
)
plt.close(g.fig)
```

---

## 2. Distribution Diagnostics: Histplot, KDE & ECDF
- **ECDF** (Empirical Cumulative Distribution Function): No binning bias; exact representation of percentiles.

```python
fig, axes = plt.subplots(1, 3, figsize=(15, 4))

# 1. Histogram + KDE
sns.histplot(data=tips, x="total_bill", kde=True, ax=axes[0], color="#2563EB")
axes[0].set_title("Histogram with KDE Curve")

# 2. KDE Split by Group
sns.kdeplot(data=tips, x="total_bill", hue="time", common_norm=False, fill=True, ax=axes[1])
axes[1].set_title("KDE Split by Meal Time")

# 3. ECDF
sns.ecdfplot(data=tips, x="total_bill", hue="time", ax=axes[2])
axes[2].set_title("Empirical Cumulative Distribution (ECDF)")

plt.close(fig)
```

---

## 3. Categorical Encodings: `boxplot`, `violinplot`, `catplot`
```python
fig, axes = plt.subplots(1, 2, figsize=(12, 4))

# Stripplot jitter overlaid on boxplot
sns.boxplot(data=tips, x="day", y="total_bill", ax=axes[0], color="#F3F4F6")
sns.stripplot(data=tips, x="day", y="total_bill", color="black", alpha=0.3, jitter=0.2, ax=axes[0])
axes[0].set_title("Boxplot with Jittered Observations")

# Split Violin Plot
sns.violinplot(data=tips, x="day", y="total_bill", hue="smoker", split=True, ax=axes[1])
axes[1].set_title("Split Violin by Smoking Status")

plt.close(fig)
```

---

## 4. Matrix Visualizations: `heatmap` & `clustermap`
```python
numeric_tips = tips.select_dtypes(include="number")
corr = numeric_tips.corr()

fig, ax = plt.subplots(figsize=(6, 5))
sns.heatmap(corr, annot=True, cmap="mako", fmt=".2f", vmin=-1, vmax=1, linewidths=0.5, ax=ax)
ax.set_title("Correlation Heatmap")
plt.close(fig)

# Clustermap: hierarchical clustering on rows and columns
cluster = sns.clustermap(corr, cmap="vlag", annot=True)
plt.close(cluster.fig)
```

---

## 5. Sample Workouts
### Workout 1: Regression Diagnostics with `lmplot` and Residuals
```python
# Linear fit with 95% confidence interval
g = sns.lmplot(data=tips, x="total_bill", y="tip", hue="smoker", col="time", height=4)
plt.close(g.fig)

# Residual plot to check homoscedasticity
fig, ax = plt.subplots(figsize=(6, 4))
sns.residplot(data=tips, x="total_bill", y="tip", ax=ax, color="#EF4444")
ax.set_title("Linear Model Residuals")
plt.close(fig)
```

### Workout 2: Pairplot Multivariate Feature Screening
```python
iris = sns.load_dataset("iris")
pair_grid = sns.pairplot(iris, hue="species", corner=True, diag_kind="kde", palette="Set2")
plt.close(pair_grid.fig)
```

### Workout 3: Jointplot Bivariate Kernel Density & Marginals
```python
jp = sns.jointplot(data=tips, x="total_bill", y="tip", kind="kde", fill=True, cmap="rocket")
plt.close(jp.fig)
```
""",
        "questions": [
            {
                "question_text": "How do figure-level functions (e.g. `sns.relplot`) differ from axes-level functions (e.g. `sns.scatterplot`) in Seaborn?",
                "answer_text": "Axes-level functions draw directly onto an existing Matplotlib `Axes` object and can be placed inside arbitrary `plt.subplots()` layouts. Figure-level functions manage an entire `FacetGrid` window, wrapping both creation and layout of multiple subplots (via `col` and `row` parameters), and return a `FacetGrid` object rather than an `Axes`.",
                "difficulty": "INTERMEDIATE",
                "question_type": "CONCEPTUAL"
            }
        ],
        "resources": [
            {"title": "Seaborn Overview & Tutorial", "url": "https://seaborn.pydata.org/tutorial.html", "resource_type": "DOCUMENTATION"},
            {"title": "Seaborn Example Gallery", "url": "https://seaborn.pydata.org/examples/index.html", "resource_type": "WEBSITE"}
        ]
    },

    # -------------------------------------------------------------
    # 8. Other Viz Libraries and EDA
    # -------------------------------------------------------------
    {
        "slug": "other-viz-libraries-and-eda",
        "title": "8. Other Viz Libraries and EDA",
        "summary": "Modern interactive visualization & systematic EDA: Plotly Express interactive graphics, Altair grammar of graphics, Streamlit dashboards, automated profiling tools, and end-to-end univariate/multivariate EDA workflows.",
        "difficulty": "INTERMEDIATE",
        "learning_objective": "Build interactive Plotly visualizations with zoom/hover tooltips, automate data health audits with profiling tools, and execute structured exploratory data analysis.",
        "prerequisites": "Pandas Advanced, Seaborn",
        "expected_outcome": "Generate interactive web dashboards, isolate outliers with IQR and Z-scores, and validate hypotheses systematically.",
        "practice_requirement": "Build an interactive Plotly scatter plot with slider animation and perform a complete 5-step EDA on a public dataset.",
        "machine_task_relevance": "Used for interactive model debugging tools, TensorBoard embeddings, and ML experiment tracking.",
        "practical_task_relevance": "Essential for client-facing analytics, Streamlit prototypes, and executive stakeholder presentations.",
        "interview_relevance": "Key interview component: describe your end-to-end exploratory data analysis process on an unfamiliar dataset.",
        "subtopics": [
            "plotly.express basics (line, scatter, bar, histogram)",
            "Interactive hover, zoom, animation",
            "Saving to HTML",
            "Altair basics",
            "Streamlit / Dash overview",
            "pandas-profiling / ydata-profiling",
            "Understand shape, dtypes, summary stats",
            "Univariate analysis",
            "Bivariate and multivariate analysis",
            "Correlation analysis",
            "Outlier detection (IQR, z-score)",
            "Hypothesis-driven questions"
        ],
        "material": """# 8. Other Viz Libraries and EDA

## 1. Interactive Visualizations with Plotly Express
- **Plotly Express**: Declarative high-level Python API for interactive D3.js and WebGL visualizations.
- **Interactive features**: Native pan, box zoom, hover data tooltips, legend toggling, and HTML export.

```python
import plotly.express as px
import pandas as pd

# Interactive scatter plot with tooltip and size
df = px.data.gapminder().query("year == 2007")
fig = px.scatter(
    df,
    x="gdpPercap",
    y="lifeExp",
    size="pop",
    color="continent",
    hover_name="country",
    log_x=True,
    size_max=60,
    title="Gapminder 2007: GDP vs Life Expectancy"
)
# Save standalone interactive web report
# fig.write_html("gapminder_interactive.html")
```

---

## 2. Automated Profiling Tools
- **ydata-profiling** (formerly `pandas-profiling`): Generates comprehensive HTML reports covering missing rates, cardinalities, skewness, quantile metrics, and multicollinearity alerts with a single line of code.

```python
# from ydata_profiling import ProfileReport
# profile = ProfileReport(df, title="Data Health Audit", explorative=True)
# profile.to_file("data_audit.html")
```

---

## 3. Systematic 5-Step EDA Workflow
1. **First Look**: Inspect `shape`, column names, data types, and check for truncated/corrupted rows.
2. **Missingness & Data Integrity**: Audit percentage of `null` values per column; detect sentinel values (`-999`, `?`, `None`).
3. **Univariate Analysis**: Plot histograms and boxplots for continuous variables; value counts for categoricals. Inspect skewness and kurtosis.
4. **Bivariate & Correlation Analysis**: Scatter plots, cross-tabs, correlation matrix (`Spearman` for non-linear, `Pearson` for linear).
5. **Outlier Detection & Business Anomalies**: Calculate IQR bounds and Z-scores. Formulate data-driven hypotheses for business anomalies.

```python
import numpy as np

def detect_outliers_iqr(df, column):
    q25 = df[column].quantile(0.25)
    q75 = df[column].quantile(0.75)
    iqr = q75 - q25
    lower_bound = q25 - 1.5 * iqr
    upper_bound = q75 + 1.5 * iqr
    outliers = df[(df[column] < lower_bound) | (df[column] > upper_bound)]
    return outliers, lower_bound, upper_bound
```

---

## 4. Sample Workouts
### Workout 1: Plotly Interactive Time Series with Range Slider
```python
stocks = px.data.stocks()
fig = px.line(stocks, x="date", y=["GOOG", "AAPL", "AMZN"], title="Tech Stock Trajectories")
fig.update_xaxes(rangeslider_visible=True)
# fig.show()
```

### Workout 2: Z-Score Outlier Flagging Function
```python
def flag_zscore_outliers(series, threshold=3.0):
    mean = series.mean()
    std = series.std()
    z_scores = (series - mean) / (std + 1e-8)
    return np.abs(z_scores) > threshold

nums = pd.Series([10, 12, 11, 13, 12, 14, 100, 11])
outlier_flags = flag_zscore_outliers(nums)
print(f"Detected {outlier_flags.sum()} outliers using Z-score > 3")
```

### Workout 3: High-Cardinality Categorical Truncation for EDA
```python
def truncate_categories(series, top_n=5, other_label="Other"):
    top_cats = series.value_counts().nlargest(top_n).index
    return series.apply(lambda x: x if x in top_cats else other_label)

raw_cities = pd.Series(["NYC", "LA", "Chicago", "Houston", "Phoenix", "Dallas", "Austin", "LA", "NYC"])
clean_cities = truncate_categories(raw_cities, top_n=3)
print(clean_cities.value_counts())
```
""",
        "questions": [
            {
                "question_text": "When is the IQR method preferred over the Z-score method for detecting outliers?",
                "answer_text": "The Z-score method assumes the underlying data follows a normal (Gaussian) distribution, and both the mean and standard deviation are themselves heavily distorted by extreme outliers. The IQR method relies on percentiles (Q1, Q3), making it non-parametric, robust to skewed distributions, and resilient to extreme values.",
                "difficulty": "INTERMEDIATE",
                "question_type": "CONCEPTUAL"
            }
        ],
        "resources": [
            {"title": "Plotly Express Python Guide", "url": "https://plotly.com/python/plotly-express/", "resource_type": "DOCUMENTATION"},
            {"title": "Kaggle Comprehensive Guide to EDA", "url": "https://www.kaggle.com/code/pmarcelino/comprehensive-data-exploration-with-python", "resource_type": "TUTORIAL"}
        ]
    },

    # -------------------------------------------------------------
    # 9. Practical Session: NumPy, Pandas, Matplotlib
    # -------------------------------------------------------------
    {
        "slug": "practical-session-numpy-pandas-matplotlib",
        "title": "9. Practical Session: NumPy, Pandas, Matplotlib",
        "summary": "Hands-on synthesis workout: Combining vector NumPy array math, complex multi-key Pandas transformations, and publication-ready Matplotlib/Seaborn multi-panel visualizations on realistic public datasets.",
        "difficulty": "INTERMEDIATE",
        "learning_objective": "Integrate NumPy vector logic, Pandas grouping/merging pipelines, and Matplotlib multi-axis dashboards into an end-to-end exploratory project.",
        "prerequisites": "NumPy Advanced, Pandas Advanced, Seaborn",
        "expected_outcome": "Complete a full end-to-end data analysis pipeline from raw arrays to aggregated dataframes to visual dashboards.",
        "practice_requirement": "Execute an end-to-end analysis on the Titanic or Tips dataset with feature engineering and a 4-panel Matplotlib dashboard.",
        "machine_task_relevance": "Reflects real-world machine task assessments where candidates are given a messy dataset and 60 minutes to deliver insights.",
        "practical_task_relevance": "Standard daily workflow for data scientists and ML engineers cleaning and validating training sets.",
        "interview_relevance": "Essential benchmark workout directly tested in live coding interviews and machine tasks.",
        "subtopics": [
            "NumPy: array creation, slicing, broadcasting exercises",
            "NumPy: matrix operations and stats exercises",
            "Pandas: filtering, groupby and aggregation exercises",
            "Pandas: merge and reshape exercises",
            "Matplotlib: build subplot dashboard",
            "Seaborn: EDA on a public dataset (tips, titanic, iris)",
            "Mini project: analyse and visualise a real dataset end to end"
        ],
        "material": """# 9. Practical Session: NumPy, Pandas, Matplotlib

## 1. Integrated Data Pipeline Architecture
In production analytics, the three foundational libraries operate as an integrated pipeline:
1. **NumPy**: Hardware-accelerated mathematical transformations and vectorized distance matrices.
2. **Pandas**: Structural alignment, categorical encoding, and SQL-like aggregations.
3. **Matplotlib / Seaborn**: Visual synthesis and diagnostic validation.

```mermaid
graph LR
    A[Raw Data Sources] --> B[Pandas DataFrame]
    B --> C[NumPy Vectorized Ops]
    C --> D[Aggregated Metrics]
    D --> E[Matplotlib/Seaborn Dashboard]
```

---

## 2. End-to-End Mini Project: Titanic Demographic Survival
```python
import seaborn as sns
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# 1. Load and Inspect
df = sns.load_dataset("titanic")

# 2. Data Cleaning & Feature Engineering
df["age"] = df["age"].fillna(df.groupby(["pclass", "sex"])["age"].transform("median"))
df["fare_log"] = np.log1p(df["fare"])
df["family_size"] = df["sibsp"] + df["parch"] + 1
df["is_alone"] = (df["family_size"] == 1).astype(int)

# 3. Aggregations
survival_by_class_sex = df.groupby(["pclass", "sex"])["survived"].mean().unstack()

# 4. Multi-Panel Dashboard
fig, axes = plt.subplots(2, 2, figsize=(12, 10))

# Subplot 1: Survival Rate by Class & Sex
survival_by_class_sex.plot(kind="bar", ax=axes[0, 0], color=["#EC4899", "#3B82F6"], alpha=0.85)
axes[0, 0].set_title("Survival Rate by Class & Gender")
axes[0, 0].set_ylabel("Survival Rate")
axes[0, 0].set_ylim(0, 1)

# Subplot 2: Age Distribution by Survival
sns.kdeplot(data=df, x="age", hue="survived", common_norm=False, fill=True, ax=axes[0, 1], palette="Set1")
axes[0, 1].set_title("Age Distribution by Survival Outcome")

# Subplot 3: Fare Log Density by Class
sns.boxplot(data=df, x="pclass", y="fare_log", ax=axes[1, 0], palette="Blues")
axes[1, 0].set_title("Log-Fare Spread by Passenger Class")

# Subplot 4: Family Size vs Survival
sns.barplot(data=df, x="family_size", y="survived", ax=axes[1, 1], color="#10B981", errorbar=None)
axes[1, 1].set_title("Survival Probability vs Family Size")

plt.tight_layout()
plt.close(fig)
```

---

## 3. Sample Workouts
### Workout 1: Vectorized Standard Deviation Without Built-in Functions
```python
def custom_std_vectorized(arr):
    # arr shape (N,)
    n = len(arr)
    mean = np.sum(arr) / n
    variance = np.sum((arr - mean) ** 2) / (n - 1)
    return np.sqrt(variance)

nums = np.random.randn(1000)
assert np.isclose(custom_std_vectorized(nums), np.std(nums, ddof=1))
print("Vectorized standard deviation matches np.std!")
```

### Workout 2: Multi-Key Pivot Table with Ratio Encodings
```python
flights = sns.load_dataset("flights")
pivot_flights = flights.pivot_table(index="month", columns="year", values="passengers", aggfunc="sum")

# Compute Year-over-Year Growth Percentage
yoy_growth = pivot_flights.pct_change(axis=1) * 100
print(yoy_growth.iloc[:3, :4].round(1))
```

### Workout 3: High-DPI Executive KPI Dashboard Export
```python
def export_kpi_card(title, value, delta_str, filename="kpi.png"):
    fig, ax = plt.subplots(figsize=(4, 2), dpi=150)
    ax.axis("off")
    ax.text(0.05, 0.75, title, fontsize=11, color="#6B7280", fontweight="medium")
    ax.text(0.05, 0.35, value, fontsize=24, color="#111827", fontweight="bold")
    ax.text(0.05, 0.10, delta_str, fontsize=10, color="#059669", fontweight="bold")
    # fig.savefig(filename, bbox_inches="tight")
    plt.close(fig)

export_kpi_card("Monthly Recurring Revenue", "$248,500", "+14.2% vs last month")
```
""",
        "questions": [
            {
                "question_text": "When building an integrated data pipeline, what are the primary performance advantages of applying feature transformations using NumPy vector math before converting back to Pandas?",
                "answer_text": "NumPy operates on flat contiguous C buffers without the metadata, indexing, alignment checks, and object boxing overhead required by Pandas. Performing raw mathematical transformations (e.g. logarithmic scaling, Euclidean distances, trigonometric encodings) directly in NumPy delivers substantial speed improvements before wrapping results back into labeled DataFrames.",
                "difficulty": "INTERMEDIATE",
                "question_type": "CONCEPTUAL"
            }
        ],
        "resources": [
            {"title": "Kaggle Titanic Data Science Solutions", "url": "https://www.kaggle.com/code/startupsci/titanic-data-science-solutions", "resource_type": "NOTEBOOK"}
        ]
    },

    # -------------------------------------------------------------
    # 10. Data Wrangling: Collection and Import
    # -------------------------------------------------------------
    {
        "slug": "data-wrangling-collection-and-import",
        "title": "10. Data Wrangling: Collection and Import",
        "summary": "Data ingestion & I/O mechanics: Reading CSV, Excel, JSON, SQL, and Parquet formats with memory tuning, handling bad headers, encoding corruptions, chunked stream processing, and REST API ingestion.",
        "difficulty": "INTERMEDIATE",
        "learning_objective": "Ingest heterogeneous data sources safely, handle non-standard delimiters and character encodings, read multi-gigabyte datasets via chunking, and query SQL databases into DataFrames.",
        "prerequisites": "Pandas Introduction",
        "expected_outcome": "Load messy enterprise files, handle bad headers and chunked streams without exhausting memory.",
        "practice_requirement": "Read a multi-sheet Excel file, ingest chunked CSV streams with memory profiling, and query SQLite via SQLAlchemy.",
        "machine_task_relevance": "Standard first step in data extraction pipelines and machine task evaluations.",
        "practical_task_relevance": "Used in daily ETL batch jobs importing CSV dumps, warehouse syncs, and third-party APIs.",
        "interview_relevance": "Common interview questions: how to handle large files that exceed RAM and resolving UTF-8 vs Latin-1 encoding errors.",
        "subtopics": [
            "read_csv (sep, header, names, usecols, dtype, parse_dates, na_values, nrows, skiprows, encoding)",
            "read_excel (sheet_name, multiple sheets)",
            "read_json, json_normalize",
            "read_sql and read_sql_query (sqlite3, SQLAlchemy)",
            "read_html, read_parquet",
            "Reading from URLs and APIs (requests)",
            "Reading large files in chunks",
            "to_csv, to_excel, to_json, to_sql, to_parquet",
            "index=False, encoding, compression",
            "head, info, describe, shape, dtypes",
            "Memory usage",
            "Spotting bad headers and junk rows"
        ],
        "material": """# 10. Data Wrangling: Collection and Import

## 1. Advanced `pd.read_csv` Parameters
- `usecols`: Load only required columns to slash memory usage by 70%+.
- `dtype`: Specify explicit data types upfront to prevent expensive dynamic type inference.
- `na_values`: Treat custom strings like `"NA"`, `"N/A"`, `"-999"`, `"?"` as `np.nan`.
- `parse_dates`: Automatically convert date strings to `datetime64`.
- `encoding`: Handle `"utf-8"`, `"latin1"`, `"cp1252"` character encodings.

```python
import pandas as pd
import io

csv_sample = '''# Generated by SAP System
# Date: 2025-01-01
txn_id;cust_id;amount;status;txn_date
1001;C201;$1,200.50;COMPLETED;2025-01-15
1002;C202;?;FAILED;2025-01-16
1003;C203;$340.00;COMPLETED;2025-01-17
'''

df = pd.read_csv(
    io.StringIO(csv_sample),
    sep=";",
    skiprows=2,                       # skip junk metadata header comments
    usecols=["txn_id", "cust_id", "amount", "status", "txn_date"],
    na_values=["?", "N/A", "null"],
    parse_dates=["txn_date"]
)
print(df.dtypes)
```

---

## 2. Ingesting Large Files with `chunksize`
When a dataset exceeds available system RAM, stream processing prevents Out-Of-Memory (OOM) crashes:
```python
def process_large_csv_in_chunks(filepath, chunk_size=50_000):
    total_revenue = 0.0
    row_count = 0
    
    # TextFileReader iterator
    for chunk in pd.read_csv(filepath, chunksize=chunk_size, usecols=["amount"]):
        total_revenue += chunk["amount"].sum()
        row_count += len(chunk)
        
    return total_revenue, row_count
```

---

## 3. Nested JSON Normalization
APIs frequently return nested JSON payloads that require flattening:
```python
api_response = [
    {
        "id": 1,
        "name": "Acme Corp",
        "contact": {"email": "info@acme.com", "phone": "123-456"},
        "orders": [{"id": "O1", "val": 500}, {"id": "O2", "val": 300}]
    }
]

# Flatten top-level and nested contact dict
flat_df = pd.json_normalize(
    api_response,
    record_path="orders",
    meta=["id", "name", ["contact", "email"]],
    record_prefix="order_"
)
print(flat_df)
```

---

## 4. SQL Ingestion with SQLAlchemy
```python
from sqlalchemy import create_engine

# SQLite engine
engine = create_engine("sqlite:///:memory:")

# Write DataFrame to SQL
df.to_sql("transactions", con=engine, index=False, if_exists="replace")

# Read using parameterized SQL query
query = "SELECT cust_id, status FROM transactions WHERE status = :status"
filtered_df = pd.read_sql_query(query, con=engine, params={"status": "COMPLETED"})
print(filtered_df)
```

---

## 5. Sample Workouts
### Workout 1: Safe Multi-Encoding File Reader
```python
def read_csv_safe_encoding(filepath):
    encodings = ["utf-8", "utf-8-sig", "latin1", "cp1252"]
    for enc in encodings:
        try:
            return pd.read_csv(filepath, encoding=enc)
        except UnicodeDecodeError:
            continue
    raise ValueError(f"Unable to decode {filepath} with tested encodings.")
```

### Workout 2: Multi-Sheet Excel Aggregator
```python
def summarize_excel_workbooks(excel_path):
    # Reads all sheets into a dictionary of DataFrames
    all_sheets = pd.read_excel(excel_path, sheet_name=None)
    combined = []
    for sheet_name, sheet_df in all_sheets.items():
        sheet_df["source_sheet"] = sheet_name
        combined.append(sheet_df)
    return pd.concat(combined, ignore_index=True)
```

### Workout 3: Chunked Aggregation with Categorical Memory Profiling
```python
def stream_aggregate_ratings(filepath):
    category_counts = pd.Series(dtype=int)
    for chunk in pd.read_csv(filepath, chunksize=10000, usecols=["rating_category"]):
        category_counts = category_counts.add(chunk["rating_category"].value_counts(), fill_value=0)
    return category_counts
```
""",
        "questions": [
            {
                "question_text": "What strategy allows Pandas to process a 40 GB CSV file on a machine with only 8 GB of RAM?",
                "answer_text": "Pass `chunksize=N` to `pd.read_csv()`, which returns an iterable `TextFileReader` that streams N rows into memory at a time. The program processes and aggregates each chunk incrementally (e.g. accumulating running sums and counts), writing intermediate results or discarding raw chunks to keep memory usage constant and bounded.",
                "difficulty": "INTERMEDIATE",
                "question_type": "CONCEPTUAL"
            }
        ],
        "resources": [
            {"title": "Pandas IO Tools User Guide", "url": "https://pandas.pydata.org/docs/user_guide/io.html", "resource_type": "DOCUMENTATION"},
            {"title": "Handling Large Datasets in Pandas", "url": "https://realpython.com/pandas-big-data/", "resource_type": "ARTICLE"}
        ]
    },

    # -------------------------------------------------------------
    # 11. Data Wrangling: Cleaning Techniques
    # -------------------------------------------------------------
    {
        "slug": "data-wrangling-cleaning-techniques",
        "title": "11. Data Wrangling: Cleaning Techniques",
        "summary": "Core data sanitization & quality assurance: Missing value diagnostic patterns (MCAR/MAR/MNAR), group-wise imputation, type casting with coercion, deduplication, regex text cleansing, outlier handling, and data assertions.",
        "difficulty": "INTERMEDIATE",
        "learning_objective": "Detect and remediate messy enterprise data corruptions, formulate statistical imputation strategies, sanitize noisy strings with regex, and write data quality assertions.",
        "prerequisites": "Data Wrangling Collection & Import",
        "expected_outcome": "Build robust, automated data cleansing pipelines that clean missing values, duplicate keys, and outliers without data leakage.",
        "practice_requirement": "Clean a corrupted dataset containing messy currency strings, missing dates, duplicate customer keys, and extreme outliers.",
        "machine_task_relevance": "Directly tested in machine task screening tests where raw data is intentionally injected with dirty values.",
        "practical_task_relevance": "Standard precursor to all production machine learning training and analytics workflows.",
        "interview_relevance": "Universal technical interview question: handling missing data, deciding whether to drop or impute, and outlier capping vs removal.",
        "subtopics": [
            "Detect: isna().sum(), percentage missing",
            "Visualize missingness (heatmap, missingno)",
            "Drop vs impute decision",
            "Mean, median, mode, group-wise imputation",
            "ffill, bfill, interpolate",
            "Indicator column for missing",
            "astype",
            "to_numeric (errors='coerce')",
            "to_datetime (format, errors)",
            "category dtype",
            "Converting strings with currency, commas, percent signs",
            "duplicated(), drop_duplicates() (subset, keep)",
            "Near-duplicates and fuzzy matching overview",
            "strip, lower, replace, regex with str.replace",
            "Standardizing categories and typos",
            "Splitting and extracting (str.split, str.extract)",
            "IQR method",
            "Z-score",
            "Capping (winsorizing), removal, transformation",
            "Range and consistency checks",
            "Assertions on cleaned data",
            "Keep a cleaning log"
        ],
        "material": """# 11. Data Wrangling: Cleaning Techniques

## 1. Missing Value Strategy Matrix
| Pattern | Description | Recommended Treatment |
| :--- | :--- | :--- |
| **MCAR** | Missing completely at random (independent of all variables) | Mean/median imputation or drop if < 5% |
| **MAR** | Missingness depends on observed features (e.g., missing salary depends on age/role) | Conditional / Group-wise median imputation |
| **MNAR** | Missingness depends on unobserved values (e.g., high earners hide salary) | Impute with constant + create binary `salary_is_missing` indicator |

```python
import pandas as pd
import numpy as np

df = pd.DataFrame({
    "department": ["IT", "IT", "HR", "HR", "Sales"],
    "salary": [80000, np.nan, 55000, np.nan, 70000]
})

# Missingness Indicator + Group-wise Median Imputation
df["salary_was_missing"] = df["salary"].isna().astype(int)
df["salary"] = df.groupby("department")["salary"].transform(lambda g: g.fillna(g.median()))
```

---

## 2. Type Conversions & Safe Coercion
```python
dirty_numbers = pd.Series(["100", "250.5", "corrupt_data", "$500", "N/A"])

# Coerce invalid numbers to NaN safely
clean_numeric = pd.to_numeric(
    dirty_numbers.str.replace("$", "", regex=False),
    errors="coerce"
)
# Result: [100.0, 250.5, NaN, 500.0, NaN]

# Safe Datetime Parsing
dates = pd.Series(["2025-01-01", "invalid_date", "2025/12/31"])
clean_dates = pd.to_datetime(dates, errors="coerce", format="mixed")
```

---

## 3. String Sanitization & Regex Extraction
```python
addresses = pd.Series(["123 Main St, New York, NY 10001", "456 Elm Ave, Boston, MA 02108"])

# Regex capture groups: State and Zip
extracted = addresses.str.extract(r",\\s*([A-Z]{2})\\s+(\\d{5})")
extracted.columns = ["state", "zip_code"]
print(extracted)
```

---

## 4. Outlier Winsorization (Capping)
Rather than deleting outlier rows and losing training records, cap extreme values to IQR fences:
```python
def winsorize_iqr(series, multiplier=1.5):
    q25 = series.quantile(0.25)
    q75 = series.quantile(0.75)
    iqr = q75 - q25
    lower_bound = q25 - multiplier * iqr
    upper_bound = q75 + multiplier * iqr
    return series.clip(lower=lower_bound, upper=upper_bound)

raw_vals = pd.Series([10, 12, 11, 14, 15, 120, -50])
capped_vals = winsorize_iqr(raw_vals)
print("Capped:", capped_vals.tolist())
```

---

## 5. Sample Workouts
### Workout 1: Clean Corrupted Financial Ledger
```python
ledger = pd.DataFrame({
    "trans_id": [1, 2, 2, 3],
    "amount": ["$1,500.00", " ($250.00) ", "$1,500.00", "FREE"],
    "date": ["2025-01-01", "2025-01-02", "2025-01-02", "2025-02-30"]
})

# 1. Deduplicate
ledger = ledger.drop_duplicates(subset=["trans_id"])

# 2. Parse accounting negatives ($250.00) -> -250.00
def parse_accounting_currency(val):
    val = str(val).strip().replace("$", "").replace(",", "")
    if val.startswith("(") and val.endswith(")"):
        return -float(val[1:-1])
    try:
        return float(val)
    except ValueError:
        return np.nan

ledger["clean_amount"] = ledger["amount"].apply(parse_accounting_currency)
print(ledger[["trans_id", "clean_amount"]])
```

### Workout 2: Data Quality Assertion Suite
```python
def validate_cleaned_dataset(df):
    assert df["clean_amount"].isna().sum() == 0, "Missing amounts detected!"
    assert (df["clean_amount"] > -100_000).all(), "Unrealistic negative amount!"
    assert df["trans_id"].is_unique, "Duplicate primary keys exist!"
    return True
```

### Workout 3: Categorical Standardization via Dict Mapping
```python
channels = pd.Series(["google", "Google Ads", "GOOGLE", "fb", "Facebook", "meta", "organic"])
mapping = {
    "google": "Google",
    "google ads": "Google",
    "fb": "Meta",
    "facebook": "Meta",
    "meta": "Meta",
    "organic": "Organic"
}
standardized = channels.str.strip().str.lower().map(mapping).fillna("Other")
print(standardized.value_counts())
```
""",
        "questions": [
            {
                "question_text": "Why is clipping (winsorizing) outliers often preferred over deleting rows in machine learning datasets?",
                "answer_text": "Deleting outlier rows reduces training sample size and can discard valid real-world high-impact observations, potentially biasing the dataset. Capping (winsorizing) preserves the row and all its accompanying feature signals while constraining extreme numerical values within reasonable statistical bounds to prevent gradient explosions or model distortion.",
                "difficulty": "INTERMEDIATE",
                "question_type": "CONCEPTUAL"
            }
        ],
        "resources": [
            {"title": "Data Cleansing with Python Best Practices", "url": "https://towardsdatascience.com/the-ultimate-guide-to-data-cleaning-3969843991d4", "resource_type": "ARTICLE"}
        ]
    },

    # -------------------------------------------------------------
    # 12. Data Wrangling: Transformation
    # -------------------------------------------------------------
    {
        "slug": "data-wrangling-transformation",
        "title": "12. Data Wrangling: Transformation",
        "summary": "Feature scaling & non-linear transformations: Min-Max, Standard Z-score, Robust, MaxAbs, Box-Cox, Yeo-Johnson, binning (cut/qcut), avoiding train-test data leakage, and Scikit-Learn ColumnTransformer integration.",
        "difficulty": "INTERMEDIATE",
        "learning_objective": "Master feature scaling mechanics, determine which algorithms require scaling, execute non-linear transformations to normalize skewed distributions, and prevent data leakage.",
        "prerequisites": "Data Wrangling Cleaning Techniques",
        "expected_outcome": "Build leak-free feature transformation pipelines that standardize, normalize, and bin numerical features.",
        "practice_requirement": "Compare distributions before and after Min-Max, Standard, and Yeo-Johnson transformations and build a Scikit-Learn ColumnTransformer pipeline.",
        "machine_task_relevance": "Critical machine task skill: failure to scale distance-based or gradient-based models leads to severe performance degradation.",
        "practical_task_relevance": "Required for all linear models, SVMs, neural networks, and k-means clustering architectures.",
        "interview_relevance": "Standard ML interview question: difference between normalization vs standardization, and explaining data leakage during preprocessing.",
        "subtopics": [
            "Min-Max normalization",
            "Standardization (z-score)",
            "Robust scaling",
            "MaxAbs scaling",
            "When to scale (distance-based, gradient-based models)",
            "Fit on train only, avoid data leakage",
            "sklearn: MinMaxScaler, StandardScaler, RobustScaler",
            "Log, sqrt, Box-Cox, Yeo-Johnson",
            "Binning (cut, qcut)",
            "Clipping",
            "Feature engineering: date parts, ratios, interactions",
            "Mapping and replace",
            "Compare distributions before and after scaling (histograms)",
            "Pipelines with ColumnTransformer"
        ],
        "material": """# 12. Data Wrangling: Transformation

## 1. Feature Scaling Comparison
| Scaler | Formula | Key Characteristic | Best Used When |
| :--- | :--- | :--- | :--- |
| **StandardScaler** | $z = \\frac{x - \\mu}{\\sigma}$ | Mean = 0, Std = 1 | Features follow Gaussian distribution; linear models, logistic regression |
| **MinMaxScaler** | $x' = \\frac{x - x_{min}}{x_{max} - x_{min}}$ | Bounds strictly in $[0, 1]$ | Neural nets, image pixel normalization; algorithms sensitive to scale |
| **RobustScaler** | $x' = \\frac{x - Q_2}{Q_3 - Q_1}$ | Uses median & IQR | Dataset contains heavy outliers |
| **MaxAbsScaler** | $x' = \\frac{x}{|x_{max}|}$ | Scales to $[-1, 1]$ preserving sparsity | Sparse matrices (text bag-of-words / TF-IDF) |

---

## 2. Preventing Data Leakage
- **Golden Rule**: Always `fit()` transformers on the **Training set only**, then `transform()` both Training and Test sets!
- Fitting on the combined dataset leaks test set distribution metrics (mean, min, max) into model training.

```python
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import numpy as np

X = np.random.rand(100, 2) * 50
y = np.random.randint(0, 2, 100)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# CORRECT:
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train) # fit + transform on train
X_test_scaled = scaler.transform(X_test)       # ONLY transform on test!
```

---

## 3. Power & Non-Linear Transformations
For heavily right-skewed features (income, house prices, web traffic):
- `np.log1p(x)`: Computes $\\log(1 + x)$, safe for zero values ($x \\ge 0$).
- `Box-Cox`: Requires strictly positive values ($x > 0$).
- `Yeo-Johnson`: Supports negative values and zero.

```python
from sklearn.preprocessing import PowerTransformer
pt = PowerTransformer(method="yeo-johnson")
skewed_data = np.random.exponential(scale=2.0, size=(100, 1))
normalized = pt.fit_transform(skewed_data)
```

---

## 4. Production Pipelines with `ColumnTransformer`
```python
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
import pandas as pd

df = pd.DataFrame({
    "age": [25, 45, 35, 50],
    "income": [50000, 120000, 80000, 140000],
    "city": ["NYC", "London", "NYC", "Tokyo"]
})

numeric_features = ["age", "income"]
categorical_features = ["city"]

preprocessor = ColumnTransformer(
    transformers=[
        ("num", StandardScaler(), numeric_features),
        ("cat", OneHotEncoder(drop="first"), categorical_features)
    ]
)

processed_array = preprocessor.fit_transform(df)
```

---

## 5. Sample Workouts
### Workout 1: Manual vs Sklearn Scaler Verification
```python
raw = np.array([[10.0], [20.0], [30.0], [40.0], [50.0]])
manual_minmax = (raw - raw.min()) / (raw.max() - raw.min())

from sklearn.preprocessing import MinMaxScaler
sklearn_minmax = MinMaxScaler().fit_transform(raw)
assert np.allclose(manual_minmax, sklearn_minmax)
print("Manual MinMax matches scikit-learn output!")
```

### Workout 2: Quantile-Based Binning (`qcut`) for Credit Scoring
```python
scores = pd.Series([350, 620, 580, 710, 800, 690, 750, 450, 510, 790])
# Equal-frequency binning into 4 credit tiers
tiers = pd.qcut(scores, q=4, labels=["Subprime", "Near-Prime", "Prime", "Super-Prime"])
print(tiers.value_counts())
```

### Workout 3: Cyclical Feature Engineering for Dates
```python
# Hour-of-day cyclical encoding (23 and 0 should be close in distance!)
hours = pd.Series([0, 6, 12, 18, 23])
sin_hour = np.sin(2 * np.pi * hours / 24)
cos_hour = np.cos(2 * np.pi * hours / 24)
print("0:00 vs 23:00 distance:", np.sqrt((sin_hour[0] - sin_hour[4])**2 + (cos_hour[0] - cos_hour[4])**2))
```
""",
        "questions": [
            {
                "question_text": "What is data leakage during preprocessing, and how do you guarantee it does not occur?",
                "answer_text": "Data leakage occurs when information from outside the training dataset (such as test set means, min/max values, or target labels) is inadvertently used to transform features or train the model. It is guaranteed to be prevented by splitting the dataset into train and test sets *before* any preprocessing, fitting scalers/imputers exclusively on the training split, and applying `.transform()` to the test set.",
                "difficulty": "INTERMEDIATE",
                "question_type": "CONCEPTUAL"
            }
        ],
        "resources": [
            {"title": "Scikit-Learn Preprocessing Guide", "url": "https://scikit-learn.org/stable/modules/preprocessing.html", "resource_type": "DOCUMENTATION"},
            {"title": "Avoiding Data Leakage in Machine Learning", "url": "https://machinelearningmastery.com/data-leakage-machine-learning/", "resource_type": "ARTICLE"}
        ]
    },

    # -------------------------------------------------------------
    # 13. Data Wrangling: Integration
    # -------------------------------------------------------------
    {
        "slug": "data-wrangling-integration",
        "title": "13. Data Wrangling: Integration",
        "summary": "Multi-source tabular integration: Advanced relational merges (1:1, 1:N, M:N), join types (inner, left, outer, cross), duplicate key diagnostics, merge validation, combining disparate CSV/Excel/SQL data, and integrity assertions.",
        "difficulty": "INTERMEDIATE",
        "learning_objective": "Consolidate multi-source data warehouses, detect row inflation from duplicate join keys, validate join cardinality with `validate='many_to_one'`, and combine mismatched records.",
        "prerequisites": "Pandas Advanced, Data Wrangling Collection & Import",
        "expected_outcome": "Integrate disparate tables across multiple databases without data loss or accidental Cartesian product explosions.",
        "practice_requirement": "Merge three relational tables with validation flags, handle duplicate keys, and verify row counts before and after merging.",
        "machine_task_relevance": "Key test in take-home data engineering assignments joining customer, order, and clickstream tables.",
        "practical_task_relevance": "Critical in enterprise environments where data is siloed across CRM, billing, and transactional databases.",
        "interview_relevance": "Common interview pitfall: silent row multiplications caused by many-to-many join key duplicates.",
        "subtopics": [
            "concat (rows and columns, ignore_index, keys)",
            "merge: one-to-one, one-to-many, many-to-many",
            "Join types: inner, left, right, outer, cross",
            "Merging on multiple keys and on index",
            "validate parameter and indicator",
            "Handling mismatched keys and duplicate columns",
            "combine_first and update",
            "Row count checks before and after merge",
            "Combining data from CSV, Excel, and SQL sources"
        ],
        "material": """# 13. Data Wrangling: Integration

## 1. Join Types & Relational Algebra
- **Inner Join**: Retains only keys matching in both tables.
- **Left Join**: Preserves all rows from left table; injects `NaN` for missing right keys.
- **Outer Join**: Preserves all records from both tables.
- **Cross Join**: Cartesian product ($M \\times N$ rows).

```python
import pandas as pd

users = pd.DataFrame({"user_id": [1, 2, 3], "username": ["a", "b", "c"]})
purchases = pd.DataFrame({"user_id": [1, 2, 2, 4], "amount": [50, 100, 200, 30]})

# Left join with indicator tracking
merged = pd.merge(users, purchases, on="user_id", how="left", indicator=True)
print(merged[["user_id", "username", "amount", "_merge"]])
```

---

## 2. Preventing Cartesian Key Explosions (`validate`)
If keys in either table contain unexpected duplicates, a one-to-many merge silently becomes a many-to-many merge, exponentially multiplying rows!
```python
# Pass validate="one_to_many" or "one_to_one"
try:
    safe_merge = pd.merge(users, purchases, on="user_id", validate="one_to_many")
except pd.errors.MergeError as e:
    print(f"Integrity Violation: {e}")
```

---

## 3. Merging on Multiple Keys & Suffix Resolution
```python
df1 = pd.DataFrame({"year": [2024, 2025], "country": ["US", "US"], "gdp": [25, 27]})
df2 = pd.DataFrame({"year": [2024, 2025], "country": ["US", "US"], "pop": [330, 335]})

combined = pd.merge(
    df1,
    df2,
    on=["year", "country"],
    how="inner",
    suffixes=("_econ", "_demo")
)
```

---

## 4. `combine_first` & Priority Updates
Fill missing values in a primary DataFrame with values from a secondary fallback DataFrame:
```python
primary_records = pd.DataFrame({"id": [1, 2, 3], "email": ["a@x.com", None, "c@x.com"]})
backup_records = pd.DataFrame({"id": [1, 2, 3], "email": ["old@x.com", "b@x.com", None]})

# Impute missing email using backup
consolidated = primary_records.set_index("id").combine_first(backup_records.set_index("id")).reset_index()
print(consolidated)
```

---

## 5. Sample Workouts
### Workout 1: Pre- and Post-Merge Integrity Check Function
```python
def safe_left_merge(left_df, right_df, on_key):
    initial_rows = len(left_df)
    merged = pd.merge(left_df, right_df, on=on_key, how="left", validate="many_to_one")
    assert len(merged) == initial_rows, f"Row inflation detected! Expected {initial_rows}, got {len(merged)}"
    return merged
```

### Workout 2: Multi-Source Harmonization (CSV + SQL + Dict)
```python
csv_data = pd.DataFrame({"uid": [1, 2], "score": [90, 85]})
sql_data = pd.DataFrame({"uid": [2, 3], "balance": [500.0, 120.0]})

harmonized = pd.merge(csv_data, sql_data, on="uid", how="outer")
print(harmonized)
```

### Workout 3: Ordered Time-Series Merge via `merge_asof`
Match asynchronous sensor readings to the closest preceding timestamp:
```python
trades = pd.DataFrame({
    "time": pd.to_datetime(["2025-01-01 09:30:00", "2025-01-01 09:30:05"]),
    "ticker": ["AAPL", "AAPL"],
    "price": [180.5, 180.8]
})
quotes = pd.DataFrame({
    "time": pd.to_datetime(["2025-01-01 09:29:59", "2025-01-01 09:30:04"]),
    "ticker": ["AAPL", "AAPL"],
    "bid": [180.4, 180.7]
})

asof_merged = pd.merge_asof(trades, quotes, on="time", by="ticker", direction="backward")
print(asof_merged)
```
""",
        "questions": [
            {
                "question_text": "What happens if both DataFrames in a `pd.merge()` contain duplicate values in the join key column, and how do you protect against it?",
                "answer_text": "If both DataFrames have duplicate keys, Pandas performs a Cartesian product for those keys (a Many-to-Many merge), causing massive row multiplication, incorrect aggregation counts, and potential memory exhaustion. You protect against this by enforcing cardinality checks with the `validate='one_to_many'` or `validate='one_to_one'` parameter, which immediately raises a `MergeError` if duplicates exist.",
                "difficulty": "INTERMEDIATE",
                "question_type": "CONCEPTUAL"
            }
        ],
        "resources": [
            {"title": "Pandas Merge, Join, Concatenate User Guide", "url": "https://pandas.pydata.org/docs/user_guide/merging.html", "resource_type": "DOCUMENTATION"}
        ]
    },

    # -------------------------------------------------------------
    # 14. Advanced Data Wrangling
    # -------------------------------------------------------------
    {
        "slug": "advanced-data-wrangling",
        "title": "14. Advanced Data Wrangling",
        "summary": "Sophisticated feature engineering: Cross-tabulations, categorical encoding (One-Hot, Ordinal, Target, Frequency), dummy variable trap, high-cardinality strategies, time series resampling, and Scikit-Learn Pipelines.",
        "difficulty": "ADVANCED",
        "learning_objective": "Encode nominal and ordinal categories without multicollinearity, manage high cardinality with frequency and target encoding, and build end-to-end reproducible preprocessing pipelines.",
        "prerequisites": "Data Wrangling Transformation",
        "expected_outcome": "Build scalable, production-grade feature engineering pipelines that handle complex categorical features and time series resampling.",
        "practice_requirement": "Implement Target Encoding with out-of-fold smoothing, resolve the dummy variable trap, and resample an irregular time series.",
        "machine_task_relevance": "Direct differentiator in competitive ML and advanced feature store engineering.",
        "practical_task_relevance": "Used in automated machine learning (AutoML) pipelines and real-time fraud feature computation.",
        "interview_relevance": "Senior interview topic: avoiding the dummy variable trap (`drop_first=True`), target encoding leakage, and handling unseen categories.",
        "subtopics": [
            "pivot_table (values, index, columns, aggfunc, margins, fill_value)",
            "pivot vs pivot_table",
            "crosstab with normalize",
            "melt and wide-to-long reshaping",
            "Nominal vs ordinal",
            "Label encoding",
            "Ordinal encoding",
            "One-hot encoding (get_dummies, OneHotEncoder)",
            "Dummy variable trap (drop_first)",
            "Target encoding and frequency encoding",
            "Handling rare categories",
            "High cardinality strategies",
            "DatetimeIndex, resample, shift, diff",
            "Rolling windows",
            "Time zones",
            "Method chaining with pipe",
            "Reusable cleaning functions",
            "sklearn Pipeline and ColumnTransformer"
        ],
        "material": """# 14. Advanced Data Wrangling

## 1. Categorical Encoding Taxonomy
- **Nominal Categories** (no inherent ranking: Country, Department):
  - **One-Hot Encoding**: Best for low cardinality (< 10 levels). Drop first column (`drop_first=True`) in linear models to avoid multicollinearity (the **dummy variable trap**).
  - **Frequency / Count Encoding**: Replaces each category with its dataset prevalence.
  - **Target (Mean) Encoding**: Replaces category with average target value. Must use out-of-fold smoothing to prevent overfitting!
- **Ordinal Categories** (inherent ordering: Low, Med, High):
  - **OrdinalEncoder**: Map explicitly to integer ranks (`{"Low": 1, "Med": 2, "High": 3}`).

```python
import pandas as pd
from sklearn.preprocessing import OneHotEncoder

df = pd.DataFrame({"city": ["London", "Paris", "London", "Tokyo"]})

# One-Hot Encoding avoiding dummy variable trap
ohe = OneHotEncoder(drop="first", sparse_output=False)
encoded = ohe.fit_transform(df[["city"]])
print("Encoded columns:", ohe.get_feature_names_out())
```

---

## 2. High Cardinality: Frequency & Target Encoding
```python
# Frequency Encoding
df["city_freq"] = df["city"].map(df["city"].value_counts(normalize=True))

# Target Encoding with Smoothing
def target_encode(train_df, cat_col, target_col, weight=10):
    global_mean = train_df[target_col].mean()
    stats = train_df.groupby(cat_col)[target_col].agg(["count", "mean"])
    # Bayesian smoothed mean
    smoothed = (stats["count"] * stats["mean"] + weight * global_mean) / (stats["count"] + weight)
    return train_df[cat_col].map(smoothed).fillna(global_mean)
```

---

## 3. Time Series Wrangling: Resampling & Lags
```python
# Irregular time series
ts = pd.DataFrame({
    "timestamp": pd.date_range("2025-01-01", periods=100, freq="15min"),
    "sensor_val": np.random.randn(100)
}).set_index("timestamp")

# Downsample to 1-hour intervals with OHLC aggregation
hourly_ohlc = ts["sensor_val"].resample("1h").ohlc()

# Shift and Diff for Momentum Features
ts["lag_1"] = ts["sensor_val"].shift(1)
ts["diff_1"] = ts["sensor_val"].diff(1)
```

---

## 4. End-to-End Pipeline with Scikit-Learn
```python
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder

num_pipeline = Pipeline([
    ("imputer", SimpleImputer(strategy="median")),
    ("scaler", StandardScaler())
])

cat_pipeline = Pipeline([
    ("imputer", SimpleImputer(strategy="most_frequent")),
    ("ohe", OneHotEncoder(handle_unknown="ignore"))
])

full_preprocessor = ColumnTransformer([
    ("num", num_pipeline, ["age", "fare"]),
    ("cat", cat_pipeline, ["embarked", "sex"])
])
```

---

## 5. Sample Workouts
### Workout 1: Out-of-Fold Target Encoding Function
```python
from sklearn.model_selection import KFold

def kfold_target_encode(df, cat_col, target_col, n_splits=5):
    kf = KFold(n_splits=n_splits, shuffle=True, random_state=42)
    encoded_vals = np.zeros(len(df))
    for train_idx, val_idx in kf.split(df):
        train_fold = df.iloc[train_idx]
        group_means = train_fold.groupby(cat_col)[target_col].mean()
        encoded_vals[val_idx] = df.iloc[val_idx][cat_col].map(group_means)
    return encoded_vals
```

### Workout 2: Rare Category Collapsing Strategy
```python
def collapse_rare_categories(series, threshold=0.05):
    freq = series.value_counts(normalize=True)
    frequent_categories = freq[freq >= threshold].index
    return series.apply(lambda x: x if x in frequent_categories else "Other")

categories = pd.Series(["A"]*80 + ["B"]*15 + ["C"]*3 + ["D"]*2)
collapsed = collapse_rare_categories(categories, threshold=0.05)
print(collapsed.value_counts())
```

### Workout 3: Multi-Horizon Rolling Volatility Feature
```python
prices = pd.Series([100, 102, 101, 105, 108, 107, 110, 115])
returns = prices.pct_change()
vol_3d = returns.rolling(window=3).std()
vol_5d = returns.rolling(window=5).std()
print("3-day Volatility:\n", vol_3d)
```
""",
        "questions": [
            {
                "question_text": "What is the 'Dummy Variable Trap' in regression modeling, and how is it resolved?",
                "answer_text": "The dummy variable trap occurs when one-hot encoded variables are mutually redundant (collinear) because the sum of all dummy columns equals 1 (matching the intercept term). In linear models, this causes perfect multicollinearity and matrix singularity (non-invertibility). It is resolved by dropping one baseline category column (`drop_first=True` or `OneHotEncoder(drop='first')`).",
                "difficulty": "ADVANCED",
                "question_type": "CONCEPTUAL"
            }
        ],
        "resources": [
            {"title": "Categorical Encoding Guide", "url": "https://contrib.scikit-learn.org/category_encoders/", "resource_type": "DOCUMENTATION"},
            {"title": "Target Encoding for Categorical Data", "url": "https://maxhalford.github.io/blog/target-encoding/", "resource_type": "ARTICLE"}
        ]
    },

    # -------------------------------------------------------------
    # 15. Practical Data Wrangling
    # -------------------------------------------------------------
    {
        "slug": "practical-data-wrangling",
        "title": "15. Practical Data Wrangling",
        "summary": "Full-spectrum enterprise data cleansing workout: Ingesting messy raw CSV datasets, statistical missingness remediation, date/type sanitization, duplicate resolution, outlier capping, feature engineering, and before/after EDA verification.",
        "difficulty": "INTERMEDIATE",
        "learning_objective": "Execute a full-spectrum data cleaning workflow on a realistic messy dataset and generate audit logs detailing every transformation.",
        "prerequisites": "Advanced Data Wrangling",
        "expected_outcome": "Deliver a cleaned, modeling-ready dataset accompanied by audit metrics and before-vs-after distribution visualizations.",
        "practice_requirement": "Clean a raw customer transactions dataset and write a verification script asserting zero nulls, zero duplicates, and bounded ranges.",
        "machine_task_relevance": "Direct match for technical screening machine tasks and data engineer coding assessments.",
        "practical_task_relevance": "Simulates real-world data science tasks cleaning client data dumps before training production models.",
        "interview_relevance": "Expect to be asked: walk through the exact steps you take when given a corrupt real-world dataset.",
        "subtopics": [
            "Clean a messy real-world CSV (Titanic / Kaggle dataset)",
            "Handle missing values with a justified strategy",
            "Fix dtypes and dates",
            "Remove duplicates and outliers",
            "Encode categoricals",
            "Scale numeric features",
            "Merge two or more related datasets",
            "Build pivot table summaries",
            "Visualize before vs after cleaning"
        ],
        "material": """# 15. Practical Data Wrangling

## 1. End-to-End Enterprise Cleaning Blueprint
1. **Audit & Log Baseline Metrics**: Record row count, column counts, missing percentages, and memory footprints.
2. **Schema & Header Repair**: Strip whitespace from column names, convert snake_case, rename cryptic keys.
3. **Primary Key Deduplication**: Isolate and resolve duplicate entity records (`drop_duplicates`).
4. **Data Type Casting**: Convert string representations of currencies, dates, and numbers.
5. **Missing Value Resolution**: Apply explicit strategies (conditional median, mode, or indicator flag).
6. **Outlier Mitigation**: Cap extreme values using statistical IQR fences.
7. **Categorical Sanitization**: Consolidate rare typos, trim whitespace, and apply encoding.
8. **Final Validation Suite**: Execute assertion tests verifying integrity before exporting.

---

## 2. Complete Case Study Code Implementation
```python
import pandas as pd
import numpy as np

# Simulate messy raw customer churn dataset
raw_data = {
    "Customer_ID": ["C101", "C102", "C102", "C103", "C104"],
    "Monthly_Fee": ["$70.50", " $120.00 ", "$120.00", "UNKNOWN", "$45.20"],
    "Tenure_Months": [12, np.nan, 24, 3, 400], # 400 is an outlier
    "Contract_Type": ["month-to-month", "Two-Year", "two year", "Month-to-Month", "1 Year"],
    "Joined_Date": ["2023/01/15", "2022-06-20", "2022-06-20", "invalid", "2020-03-10"]
}
df_raw = pd.DataFrame(raw_data)

# --- CLEANING PIPELINE ---
def clean_churn_dataset(df):
    clean_df = df.copy()
    
    # 1. Normalize Column Names
    clean_df.columns = clean_df.columns.str.lower()
    
    # 2. Deduplicate on Customer ID
    clean_df = clean_df.drop_duplicates(subset=["customer_id"], keep="first")
    
    # 3. Clean Currency and Coerce
    clean_df["monthly_fee"] = (
        clean_df["monthly_fee"]
        .astype(str)
        .str.replace("$", "", regex=False)
        .str.strip()
    )
    clean_df["monthly_fee"] = pd.to_numeric(clean_df["monthly_fee"], errors="coerce")
    clean_df["monthly_fee"] = clean_df["monthly_fee"].fillna(clean_df["monthly_fee"].median())
    
    # 4. Outlier Capping on Tenure (realistic range 0 to 72 months)
    clean_df["tenure_months"] = clean_df["tenure_months"].fillna(clean_df["tenure_months"].median())
    clean_df["tenure_months"] = clean_df["tenure_months"].clip(lower=0, upper=72)
    
    # 5. Categorical Typo Consolidation
    contract_map = {
        "month-to-month": "Month-to-Month",
        "two-year": "Two-Year",
        "two year": "Two-Year",
        "1 year": "One-Year",
        "one-year": "One-Year"
    }
    clean_df["contract_type"] = (
        clean_df["contract_type"]
        .str.strip()
        .str.lower()
        .map(contract_map)
        .fillna("Other")
    )
    
    # 6. Date Parsing
    clean_df["joined_date"] = pd.to_datetime(clean_df["joined_date"], errors="coerce")
    
    return clean_df

cleaned = clean_churn_dataset(df_raw)
print(cleaned)
```

---

## 3. Sample Workouts
### Workout 1: Automated Data Health Audit Logger
```python
def generate_health_audit_report(df_before, df_after):
    return {
        "initial_rows": len(df_before),
        "cleaned_rows": len(df_after),
        "initial_missing_cells": int(df_before.isna().sum().sum()),
        "final_missing_cells": int(df_after.isna().sum().sum()),
        "initial_memory_kb": round(df_before.memory_usage(deep=True).sum() / 1024, 2),
        "final_memory_kb": round(df_after.memory_usage(deep=True).sum() / 1024, 2)
    }

metrics = generate_health_audit_report(df_raw, cleaned)
for k, v in metrics.items():
    print(f"{k}: {v}")
```

### Workout 2: Visual Distribution Before and After Transformation
```python
import matplotlib.pyplot as plt

def plot_before_after_distributions(raw_series, clean_series, feature_name):
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4))
    ax1.hist(raw_series.dropna(), bins=20, color="#EF4444", alpha=0.7)
    ax1.set_title(f"Raw {feature_name}")
    
    ax2.hist(clean_series, bins=20, color="#10B981", alpha=0.7)
    ax2.set_title(f"Cleaned {feature_name}")
    plt.close(fig)
```

### Workout 3: Production Pipeline Unit Tests
```python
def test_pipeline_invariants(df):
    assert df["customer_id"].is_unique, "Duplicate IDs exist!"
    assert (df["monthly_fee"] > 0).all(), "Negative monthly fee!"
    assert (df["tenure_months"] <= 72).all(), "Unrealistic tenure value!"
    print("All production pipeline invariant unit tests passed!")

test_pipeline_invariants(cleaned)
```
""",
        "questions": [
            {
                "question_text": "What are data invariants, and why should you write assertion tests after executing a data wrangling script?",
                "answer_text": "Data invariants are business and structural guarantees that must always hold true (e.g. primary keys are strictly unique, prices are non-negative, dates are not in the future). Writing assertion unit tests after data cleaning catches upstream schema corruptions, broken assumptions, or silent join errors immediately before bad data can corrupt downstream machine learning models.",
                "difficulty": "INTERMEDIATE",
                "question_type": "CONCEPTUAL"
            }
        ],
        "resources": [
            {"title": "Great Expectations Data Quality Framework", "url": "https://greatexpectations.io/", "resource_type": "WEBSITE"}
        ]
    },

    # -------------------------------------------------------------
    # 16. Assignment and Project
    # -------------------------------------------------------------
    {
        "slug": "assignment-and-project-data-wrangling",
        "title": "16. Assignment and Project",
        "summary": "Capstone portfolio project: End-to-end data cleaning, multi-source feature engineering, EDA, visual dashboard generation, Git repository versioning, and reproducible documentation.",
        "difficulty": "ADVANCED",
        "learning_objective": "Synthesize data collection, sanitization, feature transformation, visual analytics, and write a reproducible analytical repository with README and scripts.",
        "prerequisites": "Practical Data Wrangling",
        "expected_outcome": "Deliver an end-to-end GitHub portfolio repository with executable scripts, cleaned data artifacts, and an analytical insights report.",
        "practice_requirement": "Complete a full capstone project on a real-world dataset answering 5 key business questions with supporting visuals.",
        "machine_task_relevance": "Direct preparation for take-home interview challenges and senior technical portfolio reviews.",
        "practical_task_relevance": "Reflects the exact deliverable expected of professional data scientists and analytics engineers.",
        "interview_relevance": "Candidates who showcase a clean, documented GitHub portfolio project dramatically outperform those with only theoretical answers.",
        "subtopics": [
            "Pick a real dataset",
            "Define questions to answer",
            "Import and inspect",
            "Clean (missing, types, duplicates, outliers)",
            "Transform (scale, encode, engineer features)",
            "Integrate additional sources",
            "EDA with Matplotlib and Seaborn",
            "Summarize insights with visuals",
            "Write README and push to GitHub",
            "Reproducible notebook or script"
        ],
        "material": """# 16. Assignment and Project

## 1. Capstone Project Specifications
Your capstone project demonstrates end-to-end mastery of Python's scientific data stack (NumPy, Pandas, Matplotlib, Seaborn).

### Deliverables Checklist
- [ ] **1. Problem Formulation**: Clear business context and 5 concrete, testable hypotheses/questions.
- [ ] **2. Data Ingestion & Audit**: Programmatic loading, memory profiling, schema review.
- [ ] **3. Cleaning & Quality Suite**: Missing value imputation, outlier winsorization, deduplication, and invariant assertions.
- [ ] **4. Feature Engineering**: Cyclical time features, group aggregations, interaction terms, categorical encoding.
- [ ] **5. Visual Storytelling Dashboard**: 4-panel Matplotlib/Seaborn dashboard highlighting primary findings.
- [ ] **6. Production Deliverable**: Standalone Python script or Jupyter Notebook with clean README and requirements.txt.

---

## 2. Recommended Open-Access Datasets
1. **E-Commerce Transaction Records** (Customer behavior, RFM segmentation, revenue trajectory).
2. **Healthcare Hospital Readmissions** (Patient demographics, clinical missingness, survival analysis).
3. **Real Estate Housing Valuations** (Spatial features, skewness, non-linear pricing power transformations).
4. **Telco Customer Churn** (Contract structures, tenure distributions, cohort retention).

---

## 3. Project Directory Architecture
```
capstone_data_wrangling/
├── README.md               # Executive summary, findings & setup instructions
├── requirements.txt         # Fixed library versions (numpy, pandas, matplotlib, seaborn)
├── data/
│   ├── raw/                # Immutable original data files
│   └── processed/          # Sanitized, model-ready Parquet datasets
├── notebooks/
│   └── 01_eda_and_cleaning.ipynb
├── src/
│   ├── clean.py            # Reusable data cleansing functions
│   ├── transform.py        # Feature engineering and scalers
│   └── visualize.py        # Dashboard generation script
└── figures/
    └── executive_kpi_dashboard.png
```

---

## 4. Sample Workouts
### Workout 1: Automated Requirements Generator Script
```python
def generate_project_requirements():
    return \"\"\"numpy>=1.24.0
pandas>=2.0.0
matplotlib>=3.7.0
seaborn>=0.12.0
scikit-learn>=1.2.0
pyarrow>=12.0.0
\"\"\"
```

### Workout 2: Reusable Pipeline Module Structure
```python
# src/clean.py
class DataCleaner:
    def __init__(self, raw_df):
        self.df = raw_df.copy()
        
    def drop_missing_targets(self, target_col):
        self.df = self.df.dropna(subset=[target_col])
        return self
        
    def get_clean_data(self):
        return self.df
```

### Workout 3: High-Resolution Dashboard Exporter
```python
def save_executive_dashboard(fig, output_path="figures/dashboard.png"):
    fig.savefig(output_path, dpi=300, bbox_inches="tight")
    print(f"Publication-ready dashboard saved to {output_path}!")
```
""",
        "questions": [
            {
                "question_text": "What makes a data science project repository 'reproducible'?",
                "answer_text": "A project is reproducible when any engineer can clone the repository, install pinned dependencies via `requirements.txt` or a virtual environment, run the scripts or notebooks with deterministic random seeds, and generate the exact same cleaned data artifacts, metrics, and visualization plots without manual interventions.",
                "difficulty": "ADVANCED",
                "question_type": "CONCEPTUAL"
            }
        ],
        "resources": [
            {"title": "Cookiecutter Data Science Project Structure", "url": "https://drivendata.github.io/cookiecutter-data-science/", "resource_type": "WEBSITE"},
            {"title": "Kaggle Datasets Repository", "url": "https://www.kaggle.com/datasets", "resource_type": "WEBSITE"}
        ]
    },

    # -------------------------------------------------------------
    # 17. Revision and Interview Prep
    # -------------------------------------------------------------
    {
        "slug": "revision-and-interview-prep-data-wrangling",
        "title": "17. Revision and Interview Prep",
        "summary": "Comprehensive technical interview revision: NumPy vs Pandas comparisons, loc vs iloc, broadcasting mechanics, SettingWithCopyWarning internals, groupby split-apply-combine, scaling vs standardization, and chart selection frameworks.",
        "difficulty": "INTERMEDIATE",
        "learning_objective": "Confidently explain foundational memory mechanics, vectorization theory, data cleaning trade-offs, and chart selection frameworks during high-stakes technical interviews.",
        "prerequisites": "All Data Handling & Visualization Topics",
        "expected_outcome": "Ace data engineering and data science technical screening rounds with articulate, authoritative explanations.",
        "practice_requirement": "Answer all 8 core revision questions concisely and solve 5 live coding challenges under timed conditions.",
        "machine_task_relevance": "Guarantees high-scoring verbal performance in machine task reviews and technical Q&A rounds.",
        "practical_task_relevance": "Consolidates all conceptual knowledge required across enterprise data workflows.",
        "interview_relevance": "Direct compilation of the most frequently asked questions in data science, ML, and data engineering interviews.",
        "subtopics": [
            "NumPy vs Pandas: when to use which",
            "loc vs iloc, merge vs join vs concat",
            "Explain broadcasting and vectorization",
            "Explain SettingWithCopyWarning",
            "Explain groupby split-apply-combine",
            "Normalization vs standardization",
            "Handling missing data strategies",
            "Choosing the right chart"
        ],
        "material": """# 17. Revision and Interview Prep

## 1. Quick Technical Comparison Cheatsheet

### NumPy vs Pandas
- **NumPy**: Best for homogeneous, multi-dimensional numerical tensors, linear algebra, custom mathematical loss functions, and array buffer manipulations. Minimum memory overhead; no index labels.
- **Pandas**: Best for heterogeneous tabular datasets, labeled indexes, missing data handling, SQL-like merges, date-time resampling, and categorical manipulation. Higher memory footprint due to index and object wrappers.

### `loc` vs `iloc` vs `at`
- `df.loc[row_label, col_label]`: Label-based indexing; includes endpoint label.
- `df.iloc[row_idx, col_idx]`: Integer position-based indexing; excludes endpoint index (Python slice standard).
- `df.at[label, label]` / `df.iat[idx, idx]`: Optimized for single scalar lookups (significantly faster).

### `merge` vs `join` vs `concat`
- `pd.merge()`: General-purpose database-style join on one or more columns or indexes (inner, left, right, outer).
- `df.join()`: Convenience wrapper around `merge()` designed specifically for joining on indexes.
- `pd.concat()`: Stacks DataFrames along a specified axis (`axis=0` for rows, `axis=1` for columns) without key-based relational lookups.

### Normalization vs Standardization
- **Normalization (Min-Max)**: Rescales data strictly to $[0, 1]$. Sensitive to outliers (an outlier compresses normal data into a tiny interval). Ideal for neural nets and non-Gaussian inputs.
- **Standardization (Z-Score)**: Rescales to $\\mu=0, \\sigma=1$. Robust to mild outliers and preserves bell-curve shape. Ideal for linear regression, logistic regression, and SVMs.

---

## 2. Common Interview Traps & Model Answers

### Question 1: What causes SettingWithCopyWarning and how do you resolve it?
> **Answer**: `SettingWithCopyWarning` occurs when you attempt to assign values using chained indexing (e.g., `df[df['age'] > 30]['salary'] = 100000`). Because the first bracket returns an object that could either be a view of the original memory or a temporary copy, Pandas cannot guarantee whether the original DataFrame was mutated. Resolve it by using `.loc` for single-step assignment (`df.loc[df['age'] > 30, 'salary'] = 100000`) or by explicitly creating a copy using `.copy()`.

### Question 2: How does NumPy broadcasting work when shapes differ?
> **Answer**: NumPy compares the shapes of two arrays element-wise from right to left (trailing dimensions). Two dimensions are compatible if they are equal or if one of them is 1. If a dimension is 1, NumPy stretches it conceptually to match the other array without making physical memory copies. If neither dimension is 1 and they do not match, a `ValueError` is thrown.

### Question 3: What is the split-apply-combine strategy in Pandas GroupBy?
> **Answer**: 
> 1. **Split**: The DataFrame is partitioned into subsets based on unique keys in the grouping column(s).
> 2. **Apply**: A calculation (aggregation like `sum()`, transformation like `transform()`, or filtering like `filter()`) is applied independently to each subset.
> 3. **Combine**: The subset results are unified back into a single output Series or DataFrame.

---

## 3. Sample Workouts
### Workout 1: Vectorized Fibonacci Generator in NumPy
```python
def fibonacci_matrix_power(n):
    # [[1, 1], [1, 0]]^n gives F(n+1), F(n) in first row
    M = np.array([[1, 1], [1, 0]], dtype=object)
    return np.linalg.matrix_power(M, n)[0, 1]

print("10th Fibonacci number:", fibonacci_matrix_power(10))  # 55
```

### Workout 2: Memory Footprint Profiler Function
```python
def print_memory_profile(df):
    mem = df.memory_usage(deep=True)
    total_mb = mem.sum() / (1024 * 1024)
    print(f"Total DataFrame Memory: {total_mb:.2f} MB")
    print("Top memory-consuming columns:")
    print((mem / (1024 * 1024)).nlargest(3))
```

### Workout 3: Chart Selection Decision Rule
```python
def recommend_chart_type(num_vars, cat_vars, is_time_series=False):
    if is_time_series:
        return "Line Plot (ax.plot)"
    if num_vars == 1 and cat_vars == 0:
        return "Histogram with KDE (sns.histplot)"
    if num_vars == 2 and cat_vars == 0:
        return "Scatter Plot (ax.scatter / sns.scatterplot)"
    if num_vars == 1 and cat_vars == 1:
        return "Box Plot / Violin Plot (sns.boxplot)"
    if num_vars == 0 and cat_vars == 1:
        return "Horizontal Bar Chart (ax.barh)"
    return "Pairplot or FacetGrid (sns.pairplot)"
```
""",
        "questions": [
            {
                "question_text": "What is the difference between a shallow copy and a deep copy in Pandas, and when should you use each?",
                "answer_text": "A shallow copy (`df.copy(deep=False)`) creates a new DataFrame object but shares the underlying indices and data buffers with the original DataFrame; modifying data in the shallow copy modifies the original. A deep copy (`df.copy(deep=True)`) creates an independent copy of all data and index buffers. Use deep copies whenever you want to mutate, clean, or filter a slice without side-effects on the original dataset.",
                "difficulty": "INTERMEDIATE",
                "question_type": "CONCEPTUAL"
            }
        ],
        "resources": [
            {"title": "Real Python Pandas Interview Questions", "url": "https://realpython.com/pandas-interview-questions/", "resource_type": "ARTICLE"}
        ]
    }
]
