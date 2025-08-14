# main.py
# To run this:
# 1. Install necessary packages: pip install "fastapi[all]" uvicorn python-jose[cryptography] passlib[bcrypt]
# 2. Run the server: uvicorn main:app --reload

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext

# --- Configuration ---
SECRET_KEY = "YOUR_SUPER_SECRET_KEY_CHANGE_ME"  # Change this in a real app
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# --- Password Hashing ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- Database (Mock) ---
# In a real application, this would be a proper database like PostgreSQL.
fake_users_db = {
    "test@onestop.shop": {
        "username": "Test User",
        "email": "test@onestop.shop",
        "hashed_password": pwd_context.hash("password123"),
        "disabled": False,
    }
}

fake_stories_db = [
    { "id": 'PROJ-123', "title": 'Refactor user authentication module', "status": 'In Progress', "priority": 'High', "points": 8 },
    { "id": 'PROJ-124', "title": 'Design new dashboard UI components', "status": 'To Do', "priority": 'Medium', "points": 5 },
    { "id": 'PROJ-125', "title": 'Fix API endpoint for user profiles', "status": 'Done', "priority": 'High', "points": 3 },
    { "id": 'PROJ-126', "title": 'Implement two-factor authentication (2FA)', "status": 'Blocked', "priority": 'Critical', "points": 13 },
    { "id": 'PROJ-127', "title": 'Write documentation for the payment gateway', "status": 'To Do', "priority": 'Low', "points": 5 },
]


# --- Pydantic Models (Data Shapes) ---
class User(BaseModel):
    username: str
    email: str
    disabled: Optional[bool] = None

class UserInDB(User):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class Story(BaseModel):
    id: str
    title: str
    status: str
    priority: str
    points: int

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str


# --- Security & JWT Functions ---
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    user = fake_users_db.get(token_data.email)
    if user is None:
        raise credentials_exception
    return user


# --- FastAPI App Initialization ---
app = FastAPI(
    title="ONE STOP SHOP API",
    description="Backend for the AI-powered assistant application.",
    version="1.0.0",
)

# --- CORS Middleware ---
# This allows the React frontend to make requests to this backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your frontend's domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- API Endpoints ---

@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Standard OAuth2 endpoint to get a token.
    In React, you'd send a POST request with 'username' (email) and 'password'.
    """
    user = fake_users_db.get(form_data.username)
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/signup", status_code=status.HTTP_201_CREATED)
def signup(user_create: UserCreate):
    """
    Registers a new user.
    """
    if user_create.email in fake_users_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    hashed_password = get_password_hash(user_create.password)
    fake_users_db[user_create.email] = {
        "username": user_create.full_name,
        "email": user_create.email,
        "hashed_password": hashed_password,
        "disabled": False,
    }
    return {"message": "Account created successfully! Please sign in."}


@app.get("/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Fetches the current authenticated user's details.
    """
    return current_user


@app.get("/stories", response_model=List[Story])
async def get_stories(current_user: User = Depends(get_current_user)):
    """
    Fetches the list of JIRA stories.
    This is a mock endpoint for now.
    """
    # In a real app, you would use the Atlassian API here
    return fake_stories_db

@app.get("/")
def read_root():
    return {"message": "Welcome to the ONE STOP SHOP API!"}

