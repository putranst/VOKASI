#!/usr/bin/env python3
"""
Setup script for Beta Campaign.
Creates beta cohort and seeds courses for the beasiswa funnel.
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import json

# Import models
from sql_models import Base, BetaCohort, Course, User
from database import DATABASE_URL

def setup_beta_campaign():
    print(f"Connecting to database: {DATABASE_URL}")
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Check if beta cohort exists
        existing = db.query(BetaCohort).filter(BetaCohort.slug == "beta-2026").first()
        if existing:
            print(f"✓ Beta cohort already exists: {existing.name} (seats sold: {existing.seats_sold})")
        else:
            # Create beta cohort
            pricing_tiers = [
                {"max_seat": 100, "price_usd": 1},
                {"max_seat": 200, "price_usd": 2},
                {"max_seat": 300, "price_usd": 3},
                {"max_seat": 400, "price_usd": 4},
                {"max_seat": 500, "price_usd": 5},
                {"max_seat": 600, "price_usd": 6},
                {"max_seat": 700, "price_usd": 7},
                {"max_seat": 800, "price_usd": 8},
                {"max_seat": 900, "price_usd": 9},
                {"max_seat": 1000, "price_usd": 10},
            ]
            
            cohort = BetaCohort(
                name="Beta 2026",
                slug="beta-2026",
                description="Beasiswa Beta Campaign - Ekspedisi AI Nusantara 2026. 1,000 seats with tiered pricing.",
                seat_cap=1000,
                seats_sold=0,
                is_active=True,
                pricing_tiers=pricing_tiers,
                fixed_course_ids=None,  # Users pick 2 courses
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            db.add(cohort)
            db.commit()
            print(f"✓ Created beta cohort: {cohort.name} with {cohort.seat_cap} seats")
        
        # Seed courses if needed
        courses_data = [
            {
                "title": "AI Generalist",
                "description": "Regenerative learning workflow and agentic productivity for professional tasks. Covers prompt engineering, AI agents, and workflow automation.",
                "category": "AI",
                "level": "beginner",
                "duration": "4 weeks",
            },
            {
                "title": "AI Marketer",
                "description": "Growth engine berbasis AI untuk SME owner dan growth leader. Lead generation automation dan efisiensi operasional.",
                "category": "Marketing",
                "level": "intermediate",
                "duration": "4 weeks",
            },
            {
                "title": "Web Development Fundamentals",
                "description": "Learn modern web development with HTML, CSS, JavaScript, and React fundamentals.",
                "category": "Development",
                "level": "beginner",
                "duration": "6 weeks",
            },
            {
                "title": "Data Science Essentials",
                "description": "Introduction to data analysis, visualization, and machine learning basics with Python.",
                "category": "Data Science",
                "level": "beginner",
                "duration": "5 weeks",
            },
        ]
        
        created_count = 0
        for course_data in courses_data:
            existing = db.query(Course).filter(Course.title == course_data["title"]).first()
            if not existing:
                course = Course(
                    title=course_data["title"],
                    description=course_data["description"],
                    category=course_data["category"],
                    level=course_data["level"],
                    duration=course_data["duration"],
                )
                db.add(course)
                created_count += 1
        
        if created_count > 0:
            db.commit()
            print(f"✓ Created {created_count} courses")
        else:
            print("✓ All courses already exist")
        
        # List all courses
        all_courses = db.query(Course).all()
        print(f"\n📚 Available courses ({len(all_courses)} total):")
        for c in all_courses:
            print(f"  - {c.title} ({c.category}, {c.level})")
        
        # Show cohort status
        cohort = db.query(BetaCohort).filter(BetaCohort.slug == "beta-2026").first()
        if cohort:
            print(f"\n🎯 Beta Cohort Status:")
            print(f"  Name: {cohort.name}")
            print(f"  Seats: {cohort.seats_sold}/{cohort.seat_cap} sold")
            print(f"  Active: {cohort.is_active}")
            current_price = None
            for tier in sorted(cohort.pricing_tiers or [], key=lambda t: t["max_seat"]):
                if cohort.seats_sold < tier["max_seat"]:
                    current_price = tier["price_usd"]
                    break
            if not current_price and cohort.pricing_tiers:
                current_price = cohort.pricing_tiers[-1]["price_usd"]
            print(f"  Current Price: ${current_price} USD")
        
        print("\n✅ Beta campaign setup complete!")
        print("   Landing page: http://localhost:3000/beasiswa")
        print("   API endpoint: http://localhost:8000/api/v1/cohorts/beta-2026")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    setup_beta_campaign()
