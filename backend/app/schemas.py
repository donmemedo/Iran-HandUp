from datetime import datetime

from pydantic import BaseModel, EmailStr

from .models import CampaignStatus, Role


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    role: Role = Role.donor
    city: str | None = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserRead(BaseModel):
    id: int
    email: str
    full_name: str
    role: Role
    avatar: str | None = None
    city: str | None = None


class CategoryRead(BaseModel):
    id: int
    slug: str
    name: str
    name_en: str
    icon: str
    color: str


class OrganizationRead(BaseModel):
    id: int
    slug: str
    name: str
    name_en: str
    description: str
    description_en: str
    city: str
    logo: str | None
    verified: bool


class CampaignUpdateRead(BaseModel):
    id: int
    title: str
    title_en: str
    body: str
    body_en: str
    spent_amount: int | None
    receipt_url: str | None
    created_at: datetime


class DonationRead(BaseModel):
    id: int
    amount: int
    message: str | None
    donor_name: str
    anonymous: bool
    created_at: datetime
    campaign_id: int


class CampaignRead(BaseModel):
    id: int
    slug: str
    title: str
    title_en: str
    summary: str
    summary_en: str
    cover: str
    beneficiary_name: str
    beneficiary_name_en: str
    beneficiary_age: int | None
    city: str
    city_en: str
    goal_amount: int
    raised_amount: int
    donors_count: int
    urgent: bool
    featured: bool
    verified: bool
    status: CampaignStatus
    deadline: datetime | None
    created_at: datetime
    category: CategoryRead | None = None
    organization: OrganizationRead | None = None


class CampaignDetail(CampaignRead):
    story: str = ""
    story_en: str = ""
    updates: list[CampaignUpdateRead] = []
    recent_donations: list[DonationRead] = []


class CampaignCreate(BaseModel):
    title: str
    title_en: str = ""
    summary: str
    summary_en: str = ""
    story: str = ""
    story_en: str = ""
    cover: str = ""
    beneficiary_name: str = ""
    city: str = ""
    goal_amount: int
    category_id: int | None = None
    organization_id: int | None = None
    urgent: bool = False


class DonationCreate(BaseModel):
    amount: int
    message: str | None = None
    anonymous: bool = False
    donor_name: str | None = None


class Stats(BaseModel):
    total_raised: int
    campaigns_count: int
    donors_count: int
    organizations_count: int
    beneficiaries_helped: int
