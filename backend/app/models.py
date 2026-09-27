from datetime import datetime, timezone
from enum import Enum

from sqlmodel import Field, Relationship, SQLModel


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Role(str, Enum):
    donor = "donor"
    ngo = "ngo"
    admin = "admin"


class CampaignStatus(str, Enum):
    draft = "draft"
    active = "active"
    funded = "funded"
    closed = "closed"


class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    full_name: str
    password_hash: str
    role: Role = Field(default=Role.donor)
    avatar: str | None = None
    city: str | None = None
    created_at: datetime = Field(default_factory=utcnow)

    donations: list["Donation"] = Relationship(back_populates="donor")


class Organization(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    slug: str = Field(index=True, unique=True)
    name: str
    name_en: str
    description: str = ""
    description_en: str = ""
    city: str = ""
    logo: str | None = None
    verified: bool = True
    license_no: str | None = None
    created_at: datetime = Field(default_factory=utcnow)

    campaigns: list["Campaign"] = Relationship(back_populates="organization")


class Category(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    slug: str = Field(index=True, unique=True)
    name: str
    name_en: str
    icon: str = "heart"
    color: str = "#FF5C38"

    campaigns: list["Campaign"] = Relationship(back_populates="category")


class Campaign(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    slug: str = Field(index=True, unique=True)
    title: str
    title_en: str
    summary: str
    summary_en: str
    story: str = ""
    story_en: str = ""
    cover: str = ""
    beneficiary_name: str = ""
    beneficiary_name_en: str = ""
    beneficiary_age: int | None = None
    city: str = ""
    city_en: str = ""
    goal_amount: int = 0
    raised_amount: int = 0
    donors_count: int = 0
    urgent: bool = False
    featured: bool = False
    verified: bool = True
    status: CampaignStatus = Field(default=CampaignStatus.active)
    deadline: datetime | None = None
    created_at: datetime = Field(default_factory=utcnow)

    category_id: int | None = Field(default=None, foreign_key="category.id")
    organization_id: int | None = Field(default=None, foreign_key="organization.id")

    category: Category | None = Relationship(back_populates="campaigns")
    organization: Organization | None = Relationship(back_populates="campaigns")
    donations: list["Donation"] = Relationship(back_populates="campaign")
    updates: list["CampaignUpdate"] = Relationship(back_populates="campaign")


class Donation(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    amount: int
    message: str | None = None
    anonymous: bool = False
    donor_name: str = "خیر ناشناس"
    created_at: datetime = Field(default_factory=utcnow)

    campaign_id: int = Field(foreign_key="campaign.id")
    donor_id: int | None = Field(default=None, foreign_key="user.id")

    campaign: Campaign | None = Relationship(back_populates="donations")
    donor: User | None = Relationship(back_populates="donations")


class CampaignUpdate(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    title: str
    title_en: str = ""
    body: str
    body_en: str = ""
    spent_amount: int | None = None
    receipt_url: str | None = None
    created_at: datetime = Field(default_factory=utcnow)

    campaign_id: int = Field(foreign_key="campaign.id")
    campaign: Campaign | None = Relationship(back_populates="updates")
