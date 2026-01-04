from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Enums
class GoalCategory(str, Enum):
    HEALTH = "health"
    CAREER = "career"
    FINANCE = "finance"
    PERSONAL = "personal"
    EDUCATION = "education"
    RELATIONSHIPS = "relationships"

class GoalType(str, Enum):
    MILESTONE = "milestone"
    NUMERIC = "numeric"
    HABIT = "habit"

# Models
class Milestone(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    completed: bool = False
    deadline: Optional[str] = None

class Goal(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: Optional[str] = None
    category: GoalCategory
    goal_type: GoalType
    target_value: Optional[int] = None
    current_value: int = 0
    milestones: List[Milestone] = []
    deadline: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    year: int = Field(default_factory=lambda: datetime.now().year)

class GoalCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: GoalCategory
    goal_type: GoalType
    target_value: Optional[int] = None
    deadline: Optional[str] = None
    year: Optional[int] = None

class GoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[GoalCategory] = None
    target_value: Optional[int] = None
    current_value: Optional[int] = None
    deadline: Optional[str] = None

class MilestoneCreate(BaseModel):
    title: str
    deadline: Optional[str] = None

class Habit(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    category: GoalCategory
    streak: int = 0
    completions: List[str] = []  # ISO date strings
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class HabitCreate(BaseModel):
    title: str
    category: GoalCategory

class HabitCompletion(BaseModel):
    date: str  # ISO date string YYYY-MM-DD

# Goal Routes
@api_router.get("/goals", response_model=List[Goal])
async def get_goals(year: Optional[int] = None):
    query = {}
    if year:
        query["year"] = year
    goals = await db.goals.find(query, {"_id": 0}).to_list(1000)
    return goals

@api_router.get("/goals/{goal_id}", response_model=Goal)
async def get_goal(goal_id: str):
    goal = await db.goals.find_one({"id": goal_id}, {"_id": 0})
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    return goal

@api_router.post("/goals", response_model=Goal)
async def create_goal(goal_data: GoalCreate):
    goal = Goal(
        title=goal_data.title,
        description=goal_data.description,
        category=goal_data.category,
        goal_type=goal_data.goal_type,
        target_value=goal_data.target_value,
        deadline=goal_data.deadline,
        year=goal_data.year or datetime.now().year
    )
    await db.goals.insert_one(goal.model_dump())
    return goal

@api_router.put("/goals/{goal_id}", response_model=Goal)
async def update_goal(goal_id: str, goal_update: GoalUpdate):
    update_data = {k: v for k, v in goal_update.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")
    
    result = await db.goals.update_one({"id": goal_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    goal = await db.goals.find_one({"id": goal_id}, {"_id": 0})
    return goal

@api_router.delete("/goals/{goal_id}")
async def delete_goal(goal_id: str):
    result = await db.goals.delete_one({"id": goal_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Goal not found")
    return {"message": "Goal deleted"}

# Milestone Routes
@api_router.post("/goals/{goal_id}/milestones", response_model=Goal)
async def add_milestone(goal_id: str, milestone_data: MilestoneCreate):
    milestone = Milestone(title=milestone_data.title, deadline=milestone_data.deadline)
    result = await db.goals.update_one(
        {"id": goal_id},
        {"$push": {"milestones": milestone.model_dump()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    goal = await db.goals.find_one({"id": goal_id}, {"_id": 0})
    return goal

@api_router.put("/goals/{goal_id}/milestones/{milestone_id}/toggle", response_model=Goal)
async def toggle_milestone(goal_id: str, milestone_id: str):
    goal = await db.goals.find_one({"id": goal_id}, {"_id": 0})
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    milestones = goal.get("milestones", [])
    for m in milestones:
        if m["id"] == milestone_id:
            m["completed"] = not m["completed"]
            break
    
    await db.goals.update_one({"id": goal_id}, {"$set": {"milestones": milestones}})
    goal = await db.goals.find_one({"id": goal_id}, {"_id": 0})
    return goal

@api_router.delete("/goals/{goal_id}/milestones/{milestone_id}", response_model=Goal)
async def delete_milestone(goal_id: str, milestone_id: str):
    result = await db.goals.update_one(
        {"id": goal_id},
        {"$pull": {"milestones": {"id": milestone_id}}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    goal = await db.goals.find_one({"id": goal_id}, {"_id": 0})
    return goal

# Habit Routes
@api_router.get("/habits", response_model=List[Habit])
async def get_habits():
    habits = await db.habits.find({}, {"_id": 0}).to_list(1000)
    return habits

@api_router.post("/habits", response_model=Habit)
async def create_habit(habit_data: HabitCreate):
    habit = Habit(title=habit_data.title, category=habit_data.category)
    await db.habits.insert_one(habit.model_dump())
    return habit

@api_router.put("/habits/{habit_id}/complete", response_model=Habit)
async def complete_habit(habit_id: str, completion: HabitCompletion):
    habit = await db.habits.find_one({"id": habit_id}, {"_id": 0})
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    completions = habit.get("completions", [])
    date_str = completion.date
    
    if date_str in completions:
        completions.remove(date_str)
    else:
        completions.append(date_str)
    
    # Calculate streak
    completions_sorted = sorted(completions, reverse=True)
    streak = 0
    today = datetime.now(timezone.utc).date()
    
    for i, comp_date in enumerate(completions_sorted):
        comp = datetime.fromisoformat(comp_date).date()
        expected = today - __import__('datetime').timedelta(days=i)
        if comp == expected:
            streak += 1
        else:
            break
    
    await db.habits.update_one(
        {"id": habit_id},
        {"$set": {"completions": completions, "streak": streak}}
    )
    
    habit = await db.habits.find_one({"id": habit_id}, {"_id": 0})
    return habit

@api_router.delete("/habits/{habit_id}")
async def delete_habit(habit_id: str):
    result = await db.habits.delete_one({"id": habit_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Habit not found")
    return {"message": "Habit deleted"}

# Update goal progress (for numeric goals)
@api_router.put("/goals/{goal_id}/progress", response_model=Goal)
async def update_progress(goal_id: str, value: int):
    result = await db.goals.update_one(
        {"id": goal_id},
        {"$set": {"current_value": value}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    goal = await db.goals.find_one({"id": goal_id}, {"_id": 0})
    return goal

@api_router.get("/")
async def root():
    return {"message": "Jahresziele API"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
