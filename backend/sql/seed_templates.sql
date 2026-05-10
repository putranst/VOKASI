-- VOKASI2 — Seed Course Templates
-- 8 starter templates for common vocational topics
-- Run after schema.sql

DO $$ BEGIN
  INSERT INTO course_templates (template_code, name, description, category, keywords, grade_levels, domain_tags, block_structure)
  VALUES (
    'web-dev-101',
    'Web Development Fundamentals',
    'A comprehensive introduction to HTML, CSS, and JavaScript for building modern web applications.',
    'tech',
    ARRAY['web', 'html', 'css', 'javascript', 'frontend', 'development', 'programming'],
    ARRAY['beginner'],
    ARRAY['technology', 'software', 'web'],
    '{"blocks": [
      {"type": "ModuleHeader", "props": {"title": "Module 1: Introduction to Web Development", "subtitle": "Understanding how the web works", "learningObjectives": "Understand client-server architecture\nIdentify core web technologies\nSet up a development environment", "estimatedMinutes": 45}},
      {"type": "RichContent", "props": {"html": "<h2>How the Web Works</h2><p>The World Wide Web is a system of interlinked hypertext documents accessed via the internet. When you type a URL into your browser, a complex chain of events occurs...</p>"}},
      {"type": "VideoBlock", "props": {"videoUrl": "https://www.youtube.com/watch?v=example", "caption": "How the Internet Works in 5 Minutes"}},
      {"type": "QuizBuilder", "props": {"quizTitle": "Web Basics Quiz", "questions": [{"question": "What does HTML stand for?", "options": "Hyper Text Markup Language\nHigh Tech Modern Language\nHyper Transfer Markup Language\nHome Tool Markup Language", "correctIndex": 0}], "passingScore": 70}},
      {"type": "ModuleHeader", "props": {"title": "Module 2: HTML Foundations", "subtitle": "Building the structure of web pages", "learningObjectives": "Write semantic HTML\nUse common HTML elements\nCreate forms and tables", "estimatedMinutes": 60}},
      {"type": "RichContent", "props": {"html": "<h2>HTML Elements</h2><p>HTML (HyperText Markup Language) is the standard markup language for creating web pages...</p>"}},
      {"type": "CodeSandbox", "props": {"language": "javascript", "starterCode": "<!DOCTYPE html>\n<html>\n<head><title>My Page</title></head>\n<body>\n  <!-- Your content here -->\n</body>\n</html>", "instructions": "Create a basic HTML page with a heading, paragraph, and list."}},
      {"type": "QuizBuilder", "props": {"quizTitle": "HTML Quiz", "questions": [{"question": "Which tag is used for the largest heading?", "options": "<h6>\n<h1>\n<heading>\n<title>", "correctIndex": 1}], "passingScore": 70}}
    ]}'::jsonb
  )
  ON CONFLICT (template_code) DO NOTHING;
EXCEPTION WHEN others THEN null; END $$;

DO $$ BEGIN
  INSERT INTO course_templates (template_code, name, description, category, keywords, grade_levels, domain_tags, block_structure)
  VALUES (
    'data-analysis-python',
    'Data Analysis with Python',
    'Learn to analyze and visualize data using Python, pandas, and matplotlib.',
    'tech',
    ARRAY['python', 'data', 'analysis', 'pandas', 'visualization', 'statistics'],
    ARRAY['intermediate'],
    ARRAY['technology', 'data', 'analytics'],
    '{"blocks": [
      {"type": "ModuleHeader", "props": {"title": "Module 1: Python for Data Science", "subtitle": "Setting up your data analysis toolkit", "learningObjectives": "Install Python and key libraries\nUnderstand pandas DataFrame basics\nLoad and inspect datasets", "estimatedMinutes": 50}},
      {"type": "RichContent", "props": {"html": "<h2>Why Python for Data?</h2><p>Python has become the dominant language for data analysis due to its simplicity and powerful ecosystem...</p>"}},
      {"type": "CodeSandbox", "props": {"language": "python", "starterCode": "import pandas as pd\n\n# Load and inspect data\ndf = pd.read_csv('data.csv')\nprint(df.head())\nprint(df.describe())", "instructions": "Load the dataset and display basic statistics."}},
      {"type": "QuizBuilder", "props": {"quizTitle": "Python Data Basics", "questions": [{"question": "Which library is most commonly used for data manipulation in Python?", "options": "NumPy\nPandas\nMatplotlib\nScikit-learn", "correctIndex": 1}], "passingScore": 70}},
      {"type": "Assignment", "props": {"title": "Exploratory Data Analysis", "description": "Download a dataset from Kaggle and perform basic EDA using pandas. Submit your notebook with at least 5 visualizations.", "dueLabel": "End of week", "submissionType": "file", "maxScore": 100}}
    ]}'::jsonb
  )
  ON CONFLICT (template_code) DO NOTHING;
EXCEPTION WHEN others THEN null; END $$;

DO $$ BEGIN
  INSERT INTO course_templates (template_code, name, description, category, keywords, grade_levels, domain_tags, block_structure)
  VALUES (
    'digital-marketing',
    'Digital Marketing Essentials',
    'Master the fundamentals of digital marketing including SEO, social media, and content strategy.',
    'business',
    ARRAY['marketing', 'digital', 'seo', 'social media', 'content', 'strategy', 'analytics'],
    ARRAY['beginner'],
    ARRAY['business', 'marketing', 'digital'],
    '{"blocks": [
      {"type": "ModuleHeader", "props": {"title": "Module 1: Digital Marketing Landscape", "subtitle": "Understanding the digital marketing ecosystem", "learningObjectives": "Identify key digital marketing channels\nUnderstand the marketing funnel\nSet SMART marketing goals", "estimatedMinutes": 40}},
      {"type": "RichContent", "props": {"html": "<h2>The Digital Marketing Ecosystem</h2><p>Digital marketing encompasses all marketing efforts that use electronic devices or the internet...</p>"}},
      {"type": "DiscussionSeed", "props": {"topic": "Your Favorite Brand Online", "seedPost": "Think about a brand that does digital marketing well. What makes their online presence effective?", "requiredReplies": 2, "gradingNotes": "Substantive analysis required."}},
      {"type": "QuizBuilder", "props": {"quizTitle": "Marketing Fundamentals", "questions": [{"question": "What does SEO stand for?", "options": "Search Engine Optimization\nSocial Engagement Online\nStrategic Email Outreach\nSearch Engine Operations", "correctIndex": 0}], "passingScore": 70}}
    ]}'::jsonb
  )
  ON CONFLICT (template_code) DO NOTHING;
EXCEPTION WHEN others THEN null; END $$;

DO $$ BEGIN
  INSERT INTO course_templates (template_code, name, description, category, keywords, grade_levels, domain_tags, block_structure)
  VALUES (
    'project-management-agile',
    'Project Management (Agile/Scrum)',
    'Learn Agile project management methodologies with practical Scrum framework application.',
    'business',
    ARRAY['project', 'management', 'agile', 'scrum', 'sprint', 'kanban', 'leadership'],
    ARRAY['intermediate'],
    ARRAY['business', 'management', 'technology'],
    '{"blocks": [
      {"type": "ModuleHeader", "props": {"title": "Module 1: Agile Manifesto & Principles", "subtitle": "Understanding the Agile mindset", "learningObjectives": "Explain the 4 values and 12 principles of Agile\nCompare Agile vs Waterfall\nIdentify when to use Agile", "estimatedMinutes": 45}},
      {"type": "RichContent", "props": {"html": "<h2>The Agile Manifesto</h2><p>In 2001, 17 software developers met and created the Agile Manifesto...</p>"}},
      {"type": "ReflectionJournal", "props": {"prompt": "Think about a project you have worked on. How would applying Agile principles have changed the outcome?", "minWords": 150, "tags": "agile, reflection"}},
      {"type": "QuizBuilder", "props": {"quizTitle": "Agile Basics", "questions": [{"question": "Which is NOT one of the 4 Agile values?", "options": "Individuals and interactions over processes\nWorking software over documentation\nContract negotiation over collaboration\nResponding to change over following a plan", "correctIndex": 2}], "passingScore": 70}}
    ]}'::jsonb
  )
  ON CONFLICT (template_code) DO NOTHING;
EXCEPTION WHEN others THEN null; END $$;

DO $$ BEGIN
  INSERT INTO course_templates (template_code, name, description, category, keywords, grade_levels, domain_tags, block_structure)
  VALUES (
    'uiux-design',
    'UI/UX Design Principles',
    'Master user interface and user experience design fundamentals for digital products.',
    'creative',
    ARRAY['design', 'ui', 'ux', 'user experience', 'interface', 'figma', 'wireframe'],
    ARRAY['beginner'],
    ARRAY['creative', 'design', 'technology'],
    '{"blocks": [
      {"type": "ModuleHeader", "props": {"title": "Module 1: Design Thinking", "subtitle": "Understanding user-centered design", "learningObjectives": "Apply design thinking methodology\nConduct user research\nCreate user personas", "estimatedMinutes": 50}},
      {"type": "RichContent", "props": {"html": "<h2>What is Design Thinking?</h2><p>Design thinking is a human-centered approach to innovation...</p>"}},
      {"type": "Assignment", "props": {"title": "User Persona Creation", "description": "Create 3 detailed user personas for a food delivery app. Include demographics, goals, pain points, and scenarios.", "dueLabel": "End of week", "submissionType": "file", "maxScore": 100}},
      {"type": "PeerReviewRubric", "props": {"rubricTitle": "Persona Review", "instructions": "Review your peer's user personas for completeness and realism.", "criteria": [{"criterion": "Completeness", "maxPoints": 10, "description": "All required fields present"}, {"criterion": "Realism", "maxPoints": 10, "description": "Persona feels like a real person"}]}}
    ]}'::jsonb
  )
  ON CONFLICT (template_code) DO NOTHING;
EXCEPTION WHEN others THEN null; END $$;

DO $$ BEGIN
  INSERT INTO course_templates (template_code, name, description, category, keywords, grade_levels, domain_tags, block_structure)
  VALUES (
    'cloud-computing',
    'Cloud Computing Basics',
    'Introduction to cloud services, deployment models, and key providers.',
    'tech',
    ARRAY['cloud', 'aws', 'azure', 'devops', 'infrastructure', 'saas', 'iaas'],
    ARRAY['beginner'],
    ARRAY['technology', 'cloud', 'infrastructure'],
    '{"blocks": [
      {"type": "ModuleHeader", "props": {"title": "Module 1: Cloud Fundamentals", "subtitle": "Understanding cloud computing models", "learningObjectives": "Define cloud computing\nCompare IaaS, PaaS, SaaS\nIdentify major cloud providers", "estimatedMinutes": 40}},
      {"type": "RichContent", "props": {"html": "<h2>What is Cloud Computing?</h2><p>Cloud computing is the delivery of computing services over the internet...</p>"}},
      {"type": "QuizBuilder", "props": {"quizTitle": "Cloud Models", "questions": [{"question": "Which cloud model provides the most control over infrastructure?", "options": "SaaS\nPaaS\nIaaS\nFaaS", "correctIndex": 2}], "passingScore": 70}}
    ]}'::jsonb
  )
  ON CONFLICT (template_code) DO NOTHING;
EXCEPTION WHEN others THEN null; END $$;

DO $$ BEGIN
  INSERT INTO course_templates (template_code, name, description, category, keywords, grade_levels, domain_tags, block_structure)
  VALUES (
    'cybersecurity-fundamentals',
    'Cybersecurity Fundamentals',
    'Learn the basics of cybersecurity, threat detection, and security best practices.',
    'tech',
    ARRAY['security', 'cybersecurity', 'hacking', 'encryption', 'network', 'threat'],
    ARRAY['beginner'],
    ARRAY['technology', 'security', 'networking'],
    '{"blocks": [
      {"type": "ModuleHeader", "props": {"title": "Module 1: Security Landscape", "subtitle": "Understanding modern cyber threats", "learningObjectives": "Identify common cyber threats\nUnderstand the CIA triad\nApply basic security hygiene", "estimatedMinutes": 45}},
      {"type": "RichContent", "props": {"html": "<h2>The CIA Triad</h2><p>The foundation of information security rests on three principles: Confidentiality, Integrity, and Availability...</p>"}},
      {"type": "QuizBuilder", "props": {"quizTitle": "Security Basics", "questions": [{"question": "What does the 'I' in CIA triad stand for?", "options": "Intelligence\nIntegrity\nInfrastructure\nImplementation", "correctIndex": 1}], "passingScore": 70}}
    ]}'::jsonb
  )
  ON CONFLICT (template_code) DO NOTHING;
EXCEPTION WHEN others THEN null; END $$;

DO $$ BEGIN
  INSERT INTO course_templates (template_code, name, description, category, keywords, grade_levels, domain_tags, block_structure)
  VALUES (
    'business-communication',
    'Business Communication',
    'Master professional communication skills for the workplace including writing, presenting, and interpersonal skills.',
    'business',
    ARRAY['communication', 'writing', 'presentation', 'professional', 'soft skills', 'business'],
    ARRAY['beginner'],
    ARRAY['business', 'communication', 'professional'],
    '{"blocks": [
      {"type": "ModuleHeader", "props": {"title": "Module 1: Professional Writing", "subtitle": "Crafting clear and effective business documents", "learningObjectives": "Write professional emails\nCreate clear documentation\nAdapt tone for different audiences", "estimatedMinutes": 40}},
      {"type": "RichContent", "props": {"html": "<h2>The 7 Cs of Communication</h2><p>Effective business communication follows seven principles: Clear, Concise, Concrete, Correct, Coherent, Complete, Courteous...</p>"}},
      {"type": "Assignment", "props": {"title": "Professional Email Draft", "description": "Write 3 professional emails: a request, a follow-up, and a difficult conversation. Apply the 7 Cs principles.", "dueLabel": "End of week", "submissionType": "text", "maxScore": 100}},
      {"type": "SocraticChat", "props": {"seedQuestion": "What makes a business email effective vs ineffective?", "persona": "Communication Coach", "maxTurns": 5}}
    ]}'::jsonb
  )
  ON CONFLICT (template_code) DO NOTHING;
EXCEPTION WHEN others THEN null; END $$;
