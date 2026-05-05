from datetime import datetime

# --- Mock Data Stores ---

# Pathways (Static Data)
PATHWAYS_DB = [
    {
        "title": "Chief Sustainability Officer",
        "subtitle": "Orchestrate green transformation.",
        "courses": 6,
        "duration": "3 Months",
        "partner": "MIT Sloan & UID",
        "icon": "Globe",
        "color": "text-green-600",
        "bg": "bg-green-50"
    },
    {
        "title": "Smart City Architect",
        "subtitle": "Design the cities of tomorrow.",
        "courses": 8,
        "duration": "4 Months",
        "partner": "Tsinghua Architecture",
        "icon": "Hexagon",
        "color": "text-[#663399]",
        "bg": "bg-purple-50"
    }
]

# Quiz and Discussion databases (In-Memory)
QUIZZES_DB = {}  # quiz_id -> Quiz
QUIZ_SUBMISSIONS_DB = {}  # submission_id -> QuizSubmission
DISCUSSIONS_DB = {}  # thread_id -> DiscussionThread
DISCUSSION_COMMENTS_DB = {}  # comment_id -> DiscussionComment

# Notification and Inbox databases
NOTIFICATIONS_DB = {} # notification_id -> Notification
CONVERSATIONS_DB = {} # conversation_id -> Conversation

# Blockchain Credentials database
CREDENTIALS_DB = {} # credential_id -> Credential

# ID counters (Global state)
class IDCounter:
    project = 1
    charter = 1
    blueprint = 1
    implementation = 1
    deployment = 1
    quiz = 1
    quiz_submission = 1
    discussion = 1
    comment = 1
    notification = 1
    conversation = 1
    message = 1
    enrollment = 1
    credential = 1
    snapshot = 1

    @classmethod
    def reset(cls):
        cls.project = 1
        cls.charter = 1
        cls.blueprint = 1
        cls.implementation = 1
        cls.deployment = 1
        cls.quiz = 1
        cls.quiz_submission = 1
        cls.discussion = 1
        cls.comment = 1
        cls.notification = 1
        cls.conversation = 1
        cls.message = 1
        cls.enrollment = 1
        cls.credential = 1
        cls.snapshot = 1

# Helper to clear all in-memory DBs
def clear_mock_db():
    QUIZZES_DB.clear()
    QUIZ_SUBMISSIONS_DB.clear()
    DISCUSSIONS_DB.clear()
    DISCUSSION_COMMENTS_DB.clear()
    NOTIFICATIONS_DB.clear()
    CONVERSATIONS_DB.clear()
    CREDENTIALS_DB.clear()
    IDCounter.reset()
