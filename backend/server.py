from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException, Query
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, date as date_type, time
import pandas as pd
import io
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="SLA Tracker API", description="Help Center Individual SLA Tracker Dashboard API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Enums
class SLAStatus(str, Enum):
    MET = "Met"
    BREACHED = "Breached"
    AT_RISK = "At Risk"

class TicketStatus(str, Enum):
    RESOLVED = "Resolved"
    ASSIGNED = "Assigned"
    PENDING = "Pending"
    CLOSED = "Closed"

# Models
class Agent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    employee_id: str
    team: str
    shift_start: Optional[str] = None
    shift_end: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Ticket(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sr_number: str
    created: Optional[str] = None
    raised_for: Optional[str] = None
    area: Optional[str] = None
    sub_area: Optional[str] = None
    problem_area: Optional[str] = None
    status: Optional[str] = None
    sub_status: Optional[str] = None
    assigned: Optional[str] = None
    updated: Optional[str] = None
    assigned_sr_category: Optional[str] = None
    resolved_date: Optional[str] = None
    resolved_by: Optional[str] = None
    updated_resolved_by_team: Optional[str] = None
    response_sla_status: Optional[str] = None
    resolution_sla_status: Optional[str] = None
    response_time_hours: Optional[float] = None
    resolution_time_hours: Optional[float] = None
    if_breached_response_hrs: Optional[float] = None
    if_breached_resolution_hrs: Optional[float] = None
    updated_team: Optional[str] = None
    life_cycle_target_hrs: Optional[float] = None
    total_time_taken_hrs: Optional[float] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SLAMetrics(BaseModel):
    agent_name: str
    team: str
    total_tickets: int = 0
    response_sla_met: int = 0
    response_sla_breached: int = 0
    resolution_sla_met: int = 0
    resolution_sla_breached: int = 0
    avg_response_time: Optional[float] = None
    avg_resolution_time: Optional[float] = None
    response_sla_percentage: float = 0.0
    resolution_sla_percentage: float = 0.0
    date: date_type = Field(default_factory=date_type.today)

class DashboardSummary(BaseModel):
    total_tickets: int = 0
    tickets_closed_today: int = 0
    tickets_open: int = 0
    business_pending: int = 0
    functional_pending: int = 0
    dealer_pending: int = 0
    overall_response_sla: float = 0.0
    overall_resolution_sla: float = 0.0
    top_performers: List[Dict[str, Any]] = []
    sla_breaches_today: int = 0

class FileUploadResponse(BaseModel):
    message: str
    tickets_processed: int
    agents_created: int
    file_name: str

# Helper functions
def prepare_for_mongo(data):
    """Convert Python objects to MongoDB-compatible format"""
    if isinstance(data, dict):
        for key, value in data.items():
            if isinstance(value, datetime):
                data[key] = value.isoformat()
            elif isinstance(value, (date_type, time)):
                data[key] = value.isoformat()
    return data

def parse_from_mongo(item):
    """Parse MongoDB data back to Python objects"""
    if isinstance(item.get('created_at'), str):
        try:
            item['created_at'] = datetime.fromisoformat(item['created_at'])
        except:
            pass
    return item

def parse_time_to_hours(time_str):
    """Convert time string in format 'hh:mm' or decimal to hours"""
    if pd.isna(time_str) or time_str == '' or time_str is None:
        return None
    
    try:
        # If it's already a number, return it
        if isinstance(time_str, (int, float)):
            return float(time_str)
        
        # Convert to string and clean
        time_str = str(time_str).strip()
        
        # If it contains ':', parse as hh:mm
        if ':' in time_str:
            parts = time_str.split(':')
            if len(parts) == 2:
                hours = int(parts[0])
                minutes = int(parts[1])
                return hours + (minutes / 60.0)
        
        # Try to parse as decimal
        return float(time_str)
        
    except (ValueError, TypeError):
        return None

async def process_excel_data(file_content: bytes, filename: str):
    """Process uploaded Excel file and extract ticket data"""
    try:
        # Read Excel file
        df = pd.read_excel(io.BytesIO(file_content))
        
        # Clean column names
        df.columns = df.columns.str.strip()
        
        tickets_processed = 0
        agents_set = set()
        
        for _, row in df.iterrows():
            # Create ticket from row data
            ticket_data = {
                'sr_number': str(row.get('SR Number', '')),
                'created': str(row.get('Created', '')) if pd.notna(row.get('Created')) else None,
                'raised_for': str(row.get('Raised For', '')) if pd.notna(row.get('Raised For')) else None,
                'area': str(row.get('Area', '')) if pd.notna(row.get('Area')) else None,
                'sub_area': str(row.get('Sub Area', '')) if pd.notna(row.get('Sub Area')) else None,
                'problem_area': str(row.get('Problem Area', '')) if pd.notna(row.get('Problem Area')) else None,
                'status': str(row.get('Status', '')) if pd.notna(row.get('Status')) else None,
                'sub_status': str(row.get('Sub Status', '')) if pd.notna(row.get('Sub Status')) else None,
                'assigned': str(row.get('Assigned', '')) if pd.notna(row.get('Assigned')) else None,
                'updated': str(row.get('Updated', '')) if pd.notna(row.get('Updated')) else None,
                'assigned_sr_category': str(row.get('Assigned SR Category', '')) if pd.notna(row.get('Assigned SR Category')) else None,
                'resolved_date': str(row.get('Resolved Date', '')) if pd.notna(row.get('Resolved Date')) else None,
                'resolved_by': str(row.get('Resolved By', '')) if pd.notna(row.get('Resolved By')) else None,
                'updated_resolved_by_team': str(row.get('Updated Resolved By Team', '')) if pd.notna(row.get('Updated Resolved By Team')) else None,
                'response_sla_status': str(row.get('Response SLA Status', '')) if pd.notna(row.get('Response SLA Status')) else None,
                'resolution_sla_status': str(row.get('Resolution SLA Status', '')) if pd.notna(row.get('Resolution SLA Status')) else None,
                'updated_team': str(row.get('Updated Team', '')) if pd.notna(row.get('Updated Team')) else None,
            }
            
            # Parse time fields (hh:mm format) and numeric fields
            time_fields = [
                ('response_time_hours', 'Response Time (hh:mm)'),
                ('resolution_time_hours', 'Resolution Time (hh:mm)')
            ]
            
            numeric_fields = [
                ('if_breached_response_hrs', 'If Breached - Response (hrs)'),
                ('if_breached_resolution_hrs', 'If Breached - Resolution (hrs)'),
                ('life_cycle_target_hrs', 'Life Cycle Target (hrs)'),
                ('total_time_taken_hrs', 'Total Time Taken (hrs)')
            ]
            
            # Parse time fields using special parser
            for field, col_name in time_fields:
                val = row.get(col_name)
                ticket_data[field] = parse_time_to_hours(val)
            
            # Parse numeric fields
            for field, col_name in numeric_fields:
                try:
                    val = row.get(col_name)
                    if pd.notna(val) and val != '':
                        ticket_data[field] = float(val)
                except:
                    ticket_data[field] = None
            
            # Create ticket object
            ticket = Ticket(**ticket_data)
            
            # Store in database
            ticket_dict = prepare_for_mongo(ticket.dict())
            await db.tickets.insert_one(ticket_dict)
            tickets_processed += 1
            
            # Collect agent information
            if ticket.resolved_by:
                agents_set.add((ticket.resolved_by, ticket.updated_resolved_by_team or 'Unknown'))
            if ticket.assigned:
                agents_set.add((ticket.assigned, ticket.updated_team or 'Unknown'))
        
        # Create agents if they don't exist
        agents_created = 0
        for agent_name, team in agents_set:
            if agent_name and agent_name.strip():
                existing_agent = await db.agents.find_one({"name": agent_name})
                if not existing_agent:
                    agent = Agent(
                        name=agent_name,
                        employee_id=agent_name,  # Using name as ID for now
                        team=team
                    )
                    agent_dict = prepare_for_mongo(agent.dict())
                    await db.agents.insert_one(agent_dict)
                    agents_created += 1
        
        return tickets_processed, agents_created
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing Excel file: {str(e)}")

# API Routes
@api_router.post("/upload-excel", response_model=FileUploadResponse)
async def upload_excel_file(file: UploadFile = File(...)):
    """Upload and process Excel file with ticket data"""
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="File must be an Excel file (.xlsx or .xls)")
    
    file_content = await file.read()
    tickets_processed, agents_created = await process_excel_data(file_content, file.filename)
    
    return FileUploadResponse(
        message="File processed successfully",
        tickets_processed=tickets_processed,
        agents_created=agents_created,
        file_name=file.filename
    )

@api_router.get("/dashboard-summary", response_model=DashboardSummary)
async def get_dashboard_summary():
    """Get overall dashboard summary with key metrics"""
    try:
        # Get total tickets
        total_tickets = await db.tickets.count_documents({})
        
        # Get tickets by status
        tickets_closed_today = await db.tickets.count_documents({"status": "Resolved"})
        tickets_open = await db.tickets.count_documents({"status": {"$ne": "Resolved"}})
        
        # Get pending tickets by team type
        business_pending = await db.tickets.count_documents({
            "updated_resolved_by_team": "Business Team",
            "status": {"$ne": "Resolved"}
        })
        functional_pending = await db.tickets.count_documents({
            "updated_resolved_by_team": "Functional Team",
            "status": {"$ne": "Resolved"}
        })
        dealer_pending = await db.tickets.count_documents({
            "updated_resolved_by_team": "Data Team",
            "status": {"$ne": "Resolved"}
        })
        
        # Calculate overall SLA percentages
        response_sla_met = await db.tickets.count_documents({"response_sla_status": "Met"})
        resolution_sla_met = await db.tickets.count_documents({"resolution_sla_status": "Met"})
        
        overall_response_sla = (response_sla_met / total_tickets * 100) if total_tickets > 0 else 0
        overall_resolution_sla = (resolution_sla_met / total_tickets * 100) if total_tickets > 0 else 0
        
        # Get SLA breaches today
        sla_breaches_today = await db.tickets.count_documents({
            "$or": [
                {"response_sla_status": "Breached"},
                {"resolution_sla_status": "Breached"}
            ]
        })
        
        # Get top performers (agents with highest resolution SLA)
        pipeline = [
            {"$match": {"resolved_by": {"$ne": None, "$ne": ""}}},
            {
                "$group": {
                    "_id": "$resolved_by",
                    "total_tickets": {"$sum": 1},
                    "sla_met": {
                        "$sum": {
                            "$cond": [{"$eq": ["$resolution_sla_status", "Met"]}, 1, 0]
                        }
                    }
                }
            },
            {
                "$project": {
                    "agent_name": "$_id",
                    "total_tickets": 1,
                    "sla_percentage": {
                        "$multiply": [
                            {"$divide": ["$sla_met", "$total_tickets"]},
                            100
                        ]
                    }
                }
            },
            {"$sort": {"sla_percentage": -1}},
            {"$limit": 5}
        ]
        
        top_performers_cursor = db.tickets.aggregate(pipeline)
        top_performers = []
        async for performer in top_performers_cursor:
            top_performers.append({
                "agent_name": performer["agent_name"],
                "total_tickets": performer["total_tickets"],
                "sla_percentage": round(performer["sla_percentage"], 2)
            })
        
        return DashboardSummary(
            total_tickets=total_tickets,
            tickets_closed_today=tickets_closed_today,
            tickets_open=tickets_open,
            business_pending=business_pending,
            functional_pending=functional_pending,
            dealer_pending=dealer_pending,
            overall_response_sla=round(overall_response_sla, 2),
            overall_resolution_sla=round(overall_resolution_sla, 2),
            top_performers=top_performers,
            sla_breaches_today=sla_breaches_today
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting dashboard summary: {str(e)}")

@api_router.get("/agents", response_model=List[Agent])
async def get_agents():
    """Get all agents"""
    agents = await db.agents.find().to_list(1000)
    return [Agent(**parse_from_mongo(agent)) for agent in agents]

@api_router.get("/agent-performance/{agent_name}")
async def get_agent_performance(agent_name: str):
    """Get detailed performance metrics for a specific agent"""
    try:
        # Get agent tickets
        tickets = await db.tickets.find({"resolved_by": agent_name}).to_list(1000)
        
        if not tickets:
            return {
                "agent_name": agent_name,
                "total_tickets": 0,
                "response_sla_met": 0,
                "response_sla_breached": 0,
                "resolution_sla_met": 0,
                "resolution_sla_breached": 0,
                "response_sla_percentage": 0,
                "resolution_sla_percentage": 0,
                "avg_response_time": 0,
                "avg_resolution_time": 0
            }
        
        total_tickets = len(tickets)
        response_sla_met = sum(1 for t in tickets if t.get('response_sla_status') == 'Met')
        resolution_sla_met = sum(1 for t in tickets if t.get('resolution_sla_status') == 'Met')
        response_sla_breached = sum(1 for t in tickets if t.get('response_sla_status') == 'Breached')
        resolution_sla_breached = sum(1 for t in tickets if t.get('resolution_sla_status') == 'Breached')
        
        # Calculate averages
        response_times = [t.get('response_time_hours', 0) for t in tickets if t.get('response_time_hours')]
        resolution_times = [t.get('resolution_time_hours', 0) for t in tickets if t.get('resolution_time_hours')]
        
        avg_response_time = sum(response_times) / len(response_times) if response_times else 0
        avg_resolution_time = sum(resolution_times) / len(resolution_times) if resolution_times else 0
        
        return {
            "agent_name": agent_name,
            "total_tickets": total_tickets,
            "response_sla_met": response_sla_met,
            "response_sla_breached": response_sla_breached,
            "resolution_sla_met": resolution_sla_met,
            "resolution_sla_breached": resolution_sla_breached,
            "response_sla_percentage": round((response_sla_met / total_tickets * 100), 2) if total_tickets > 0 else 0,
            "resolution_sla_percentage": round((resolution_sla_met / total_tickets * 100), 2) if total_tickets > 0 else 0,
            "avg_response_time": round(avg_response_time, 2),
            "avg_resolution_time": round(avg_resolution_time, 2)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting agent performance: {str(e)}")

@api_router.get("/team-performance")
async def get_team_performance():
    """Get performance metrics grouped by team"""
    try:
        pipeline = [
            {"$match": {"updated_resolved_by_team": {"$ne": None, "$ne": ""}}},
            {
                "$group": {
                    "_id": "$updated_resolved_by_team",
                    "total_tickets": {"$sum": 1},
                    "response_sla_met": {
                        "$sum": {
                            "$cond": [{"$eq": ["$response_sla_status", "Met"]}, 1, 0]
                        }
                    },
                    "resolution_sla_met": {
                        "$sum": {
                            "$cond": [{"$eq": ["$resolution_sla_status", "Met"]}, 1, 0]
                        }
                    },
                    "avg_response_time": {"$avg": "$response_time_hours"},
                    "avg_resolution_time": {"$avg": "$resolution_time_hours"}
                }
            },
            {
                "$project": {
                    "team_name": "$_id",
                    "total_tickets": 1,
                    "response_sla_percentage": {
                        "$multiply": [
                            {"$divide": ["$response_sla_met", "$total_tickets"]},
                            100
                        ]
                    },
                    "resolution_sla_percentage": {
                        "$multiply": [
                            {"$divide": ["$resolution_sla_met", "$total_tickets"]},
                            100
                        ]
                    },
                    "avg_response_time": 1,
                    "avg_resolution_time": 1
                }
            },
            {"$sort": {"resolution_sla_percentage": -1}}
        ]
        
        team_performance_cursor = db.tickets.aggregate(pipeline)
        team_performance = []
        async for team in team_performance_cursor:
            team_performance.append({
                "team_name": team["team_name"],
                "total_tickets": team["total_tickets"],
                "response_sla_percentage": round(team.get("response_sla_percentage", 0), 2),
                "resolution_sla_percentage": round(team.get("resolution_sla_percentage", 0), 2),
                "avg_response_time": round(team.get("avg_response_time") or 0, 2),
                "avg_resolution_time": round(team.get("avg_resolution_time") or 0, 2)
            })
        
        return team_performance
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting team performance: {str(e)}")

@api_router.get("/tickets")
async def get_tickets(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=1000),
    agent_name: Optional[str] = Query(None),
    team: Optional[str] = Query(None),
    sla_status: Optional[str] = Query(None)
):
    """Get tickets with filtering and pagination"""
    try:
        # Build filter query
        filter_query = {}
        if agent_name:
            filter_query["resolved_by"] = agent_name
        if team:
            filter_query["updated_resolved_by_team"] = team
        if sla_status:
            filter_query["$or"] = [
                {"response_sla_status": sla_status},
                {"resolution_sla_status": sla_status}
            ]
        
        # Get total count
        total_count = await db.tickets.count_documents(filter_query)
        
        # Get tickets
        tickets = await db.tickets.find(filter_query).skip(skip).limit(limit).to_list(limit)
        
        return {
            "tickets": [Ticket(**parse_from_mongo(ticket)) for ticket in tickets],
            "total_count": total_count,
            "skip": skip,
            "limit": limit
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting tickets: {str(e)}")

@api_router.delete("/clear-data")
async def clear_all_data():
    """Clear all tickets and agents data - useful for testing"""
    try:
        tickets_deleted = await db.tickets.delete_many({})
        agents_deleted = await db.agents.delete_many({})
        
        return {
            "message": "All data cleared successfully",
            "tickets_deleted": tickets_deleted.deleted_count,
            "agents_deleted": agents_deleted.deleted_count
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing data: {str(e)}")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
