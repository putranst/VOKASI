-- VOKASI2 — Sandbox Template Seeds
-- Pre-built exercises for Python, JavaScript, SQL

INSERT INTO sandbox_templates (template_code, name, description, language, category, difficulty, instructions, starter_files, test_cases, tags, estimated_minutes)
VALUES (
  'python-hello-world',
  'Python: Hello World',
  'Your first Python program. Learn print statements and basic syntax.',
  'python',
  'exercise',
  'beginner',
  '# Hello World Exercise

Write a Python program that:
1. Prints "Hello, World!" to the console
2. Prints your name
3. Prints today''s date

## Hints
- Use the print() function
- Strings go inside quotes',
  '[{"filename": "main.py", "content": "# Write your Hello World program here\n\n", "language": "python"}]'::jsonb,
  '[{"input": "", "expected_output": "Hello, World!", "description": "Print Hello World"}]'::jsonb,
  ARRAY['python', 'basics', 'hello-world'],
  15
) ON CONFLICT (template_code) DO NOTHING;

INSERT INTO sandbox_templates (template_code, name, description, language, category, difficulty, instructions, starter_files, test_cases, tags, estimated_minutes)
VALUES (
  'python-lists',
  'Python: Working with Lists',
  'Practice creating, accessing, and manipulating Python lists.',
  'python',
  'exercise',
  'beginner',
  '# Lists Exercise

Complete the following tasks:
1. Create a list of 5 favorite foods
2. Print the first and last item
3. Add a new item to the list
4. Remove the second item
5. Sort the list alphabetically',
  '[{"filename": "main.py", "content": "# Lists Exercise\n\n# 1. Create a list of 5 favorite foods\nfoods = []\n\n# 2. Print the first and last item\n\n# 3. Add a new item\n\n# 4. Remove the second item\n\n# 5. Sort the list\n\nprint(foods)\n", "language": "python"}]'::jsonb,
  '[]'::jsonb,
  ARRAY['python', 'lists', 'data-structures'],
  20
) ON CONFLICT (template_code) DO NOTHING;

INSERT INTO sandbox_templates (template_code, name, description, language, category, difficulty, instructions, starter_files, test_cases, tags, estimated_minutes)
VALUES (
  'python-functions',
  'Python: Functions',
  'Learn to define and call functions with parameters and return values.',
  'python',
  'exercise',
  'beginner',
  '# Functions Exercise

Write the following functions:
1. greet(name) - returns "Hello, {name}!"
2. add(a, b) - returns the sum of a and b
3. is_even(n) - returns True if n is even, False otherwise
4. count_vowels(text) - returns the number of vowels in text',
  '[{"filename": "main.py", "content": "def greet(name):\n    pass\n\ndef add(a, b):\n    pass\n\ndef is_even(n):\n    pass\n\ndef count_vowels(text):\n    pass\n\nprint(greet(\"Alice\"))\nprint(add(3, 5))\nprint(is_even(4))\nprint(count_vowels(\"hello world\"))\n", "language": "python"}]'::jsonb,
  '[{"input": "greet(\"Alice\")", "expected_output": "Hello, Alice!", "description": "greet function"}]'::jsonb,
  ARRAY['python', 'functions', 'basics'],
  25
) ON CONFLICT (template_code) DO NOTHING;

INSERT INTO sandbox_templates (template_code, name, description, language, category, difficulty, instructions, starter_files, test_cases, tags, estimated_minutes)
VALUES (
  'python-pandas-intro',
  'Python: Intro to Pandas',
  'Learn data manipulation with pandas DataFrames.',
  'python',
  'exercise',
  'intermediate',
  '# Pandas Exercise

Using the provided dataset:
1. Load the data into a DataFrame
2. Display the first 5 rows
3. Calculate basic statistics
4. Filter rows by condition
5. Group and aggregate data',
  '[{"filename": "main.py", "content": "import pandas as pd\n\ndf = pd.DataFrame({\n    \"name\": [\"Alice\", \"Bob\", \"Charlie\", \"Diana\", \"Eve\"],\n    \"age\": [25, 30, 35, 28, 22],\n    \"score\": [85, 92, 78, 95, 88],\n    \"department\": [\"Engineering\", \"Marketing\", \"Engineering\", \"Sales\", \"Marketing\"]\n})\n\n# Tasks here\n", "language": "python"}]'::jsonb,
  '[]'::jsonb,
  ARRAY['python', 'pandas', 'data-analysis'],
  30
) ON CONFLICT (template_code) DO NOTHING;

INSERT INTO sandbox_templates (template_code, name, description, language, category, difficulty, instructions, starter_files, test_cases, tags, estimated_minutes)
VALUES (
  'js-basics',
  'JavaScript: Variables and Functions',
  'Practice JavaScript variables, arrow functions, and array methods.',
  'javascript',
  'exercise',
  'beginner',
  '# JavaScript Basics

Complete these tasks:
1. Declare variables using let and const
2. Write an arrow function that doubles a number
3. Use array methods: map, filter, reduce
4. Template literals for string formatting',
  '[{"filename": "main.js", "content": "// 1. Declare variables\nconst myName = \"\";\nlet age = 0;\n\n// 2. Arrow function\nconst double = (n) => {\n  // Return n * 2\n};\n\n// 3. Array methods\nconst numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];\n\n// 4. Template literal\nconst greeting = ``;\n\nconsole.log(double(5));\n", "language": "javascript"}]'::jsonb,
  '[]'::jsonb,
  ARRAY['javascript', 'basics', 'functions'],
  20
) ON CONFLICT (template_code) DO NOTHING;

INSERT INTO sandbox_templates (template_code, name, description, language, category, difficulty, instructions, starter_files, test_cases, tags, estimated_minutes)
VALUES (
  'sql-basics',
  'SQL: Queries and Filtering',
  'Practice SELECT, WHERE, JOIN, and aggregation queries.',
  'sql',
  'exercise',
  'beginner',
  '# SQL Exercise

Write queries against the sample tables:
1. Select all employees in Engineering
2. Find average salary by department
3. Join employees with their projects
4. Find employees who earn more than average',
  '[{"filename": "queries.sql", "content": "-- 1. All Engineering employees\n\n\n-- 2. Average salary by department\n\n\n-- 3. Employees with projects\n\n\n-- 4. Above-average earners\n\n", "language": "sql"}]'::jsonb,
  '[]'::jsonb,
  ARRAY['sql', 'queries', 'database'],
  25
) ON CONFLICT (template_code) DO NOTHING;

INSERT INTO sandbox_templates (template_code, name, description, language, category, difficulty, instructions, starter_files, test_cases, tags, estimated_minutes)
VALUES (
  'empty-playground',
  'Empty Playground',
  'A blank sandbox for free experimentation.',
  'python',
  'playground',
  'beginner',
  '# Playground

Use this sandbox to experiment freely. No specific tasks - just explore and learn!',
  '[{"filename": "main.py", "content": "# Start coding here!\nprint(\"Hello from the playground!\")\n", "language": "python"}]'::jsonb,
  '[]'::jsonb,
  ARRAY['playground', 'free'],
  0
) ON CONFLICT (template_code) DO NOTHING;

INSERT INTO sandbox_templates (template_code, name, description, language, category, difficulty, instructions, starter_files, test_cases, tags, estimated_minutes)
VALUES (
  'python-visualization',
  'Python: Data Visualization',
  'Create charts and graphs with matplotlib.',
  'python',
  'exercise',
  'intermediate',
  '# Data Visualization Exercise

Create the following visualizations:
1. Bar chart of monthly sales
2. Line chart showing trends
3. Pie chart of category distribution
4. Scatter plot of two correlated variables',
  '[{"filename": "main.py", "content": "import matplotlib.pyplot as plt\n\nmonths = [\"Jan\", \"Feb\", \"Mar\", \"Apr\", \"May\", \"Jun\"]\nsales = [1200, 1500, 1100, 1800, 2000, 1700]\n\n# 1. Bar chart\n\n# 2. Line chart\n\n# 3. Pie chart\ncategories = [\"Electronics\", \"Clothing\", \"Food\", \"Books\"]\nvalues = [45, 25, 20, 10]\n\n# 4. Scatter plot\n", "language": "python"}]'::jsonb,
  '[]'::jsonb,
  ARRAY['python', 'matplotlib', 'visualization'],
  30
) ON CONFLICT (template_code) DO NOTHING;
