import re
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, col, func, or_, select

from ..db import get_session
from ..models import Campaign, CampaignStatus, CampaignUpdate, Category, Donation, Organization, User
from ..schemas import (
    CampaignCreate,
    CampaignDetail,
    CampaignRead,
    CampaignUpdateRead,
    CategoryRead,
    DonationCreate,
    DonationRead,
    OrganizationRead,
    Stats,
)
from ..security import current_user, optional_user

router = APIRouter(prefix="/api", tags=["campaigns"])


def slugify(value: str) -> str:
    value = re.sub(r"[\s_]+", "-", value.strip())
    value = re.sub(r"[^\w؀-ۿ-]", "", value)
    return value.lower()[:60] or "campaign"


@router.get("/categories", response_model=list[CategoryRead])
def categories(session: Session = Depends(get_session)):
    return session.exec(select(Category)).all()


@router.get("/organizations", response_model=list[OrganizationRead])
def organizations(session: Session = Depends(get_session)):
    return session.exec(select(Organization)).all()


@router.get("/stats", response_model=Stats)
def stats(session: Session = Depends(get_session)):
    total = session.exec(select(func.coalesce(func.sum(Campaign.raised_amount), 0))).one()
    campaigns_count = session.exec(select(func.count()).select_from(Campaign)).one()
    donors = session.exec(select(func.count()).select_from(User)).one()
    orgs = session.exec(select(func.count()).select_from(Organization)).one()
    funded = session.exec(
        select(func.count()).select_from(Campaign).where(Campaign.status == CampaignStatus.funded)
    ).one()
    return Stats(
        total_raised=int(total or 0),
        campaigns_count=int(campaigns_count),
        donors_count=int(donors) + 1840,
        organizations_count=int(orgs),
        beneficiaries_helped=int(funded) + 312,
    )


@router.get("/campaigns", response_model=list[CampaignRead])
def list_campaigns(
    session: Session = Depends(get_session),
    q: str | None = None,
    category: str | None = None,
    city: str | None = None,
    urgent: bool | None = None,
    featured: bool | None = None,
    sort: str = Query("trending", pattern="^(trending|newest|closest|most_funded)$"),
    limit: int = Query(24, le=100),
    offset: int = 0,
):
    stmt = select(Campaign)
    if q:
        like = f"%{q}%"
        stmt = stmt.where(
            or_(
                col(Campaign.title).ilike(like),
                col(Campaign.title_en).ilike(like),
                col(Campaign.summary).ilike(like),
                col(Campaign.beneficiary_name).ilike(like),
            )
        )
    if category:
        stmt = stmt.join(Category).where(Category.slug == category)
    if city:
        stmt = stmt.where(Campaign.city == city)
    if urgent is not None:
        stmt = stmt.where(Campaign.urgent == urgent)
    if featured is not None:
        stmt = stmt.where(Campaign.featured == featured)

    if sort == "newest":
        stmt = stmt.order_by(col(Campaign.created_at).desc())
    elif sort == "most_funded":
        stmt = stmt.order_by(col(Campaign.raised_amount).desc())
    elif sort == "closest":
        stmt = stmt.order_by(col(Campaign.deadline).asc())
    else:
        stmt = stmt.order_by(col(Campaign.donors_count).desc(), col(Campaign.urgent).desc())

    return session.exec(stmt.offset(offset).limit(limit)).all()


@router.get("/campaigns/{slug}", response_model=CampaignDetail)
def get_campaign(slug: str, session: Session = Depends(get_session)):
    campaign = session.exec(select(Campaign).where(Campaign.slug == slug)).first()
    if not campaign:
        raise HTTPException(404, "کمپین پیدا نشد")
    donations = session.exec(
        select(Donation)
        .where(Donation.campaign_id == campaign.id)
        .order_by(col(Donation.created_at).desc())
        .limit(12)
    ).all()
    detail = CampaignDetail.model_validate(campaign, from_attributes=True)
    detail.updates = sorted(campaign.updates, key=lambda u: u.created_at, reverse=True)
    detail.recent_donations = [
        DonationRead.model_validate(d, from_attributes=True) for d in donations
    ]
    return detail


@router.post("/campaigns", response_model=CampaignRead, status_code=201)
def create_campaign(
    data: CampaignCreate,
    session: Session = Depends(get_session),
    user: User = Depends(current_user),
):
    base = slugify(data.title_en or data.title)
    slug, i = base, 2
    while session.exec(select(Campaign).where(Campaign.slug == slug)).first():
        slug = f"{base}-{i}"
        i += 1
    campaign = Campaign(
        **data.model_dump(),
        slug=slug,
        status=CampaignStatus.active,
        verified=False,
    )
    session.add(campaign)
    session.commit()
    session.refresh(campaign)
    return campaign


@router.post("/campaigns/{slug}/donate", response_model=DonationRead, status_code=201)
def donate(
    slug: str,
    data: DonationCreate,
    session: Session = Depends(get_session),
    user: User | None = Depends(optional_user),
):
    if data.amount < 10_000:
        raise HTTPException(400, "کمترین مبلغ کمک ۱۰٬۰۰۰ تومان است")
    campaign = session.exec(select(Campaign).where(Campaign.slug == slug)).first()
    if not campaign:
        raise HTTPException(404, "کمپین پیدا نشد")
    name = "خیر ناشناس"
    if not data.anonymous:
        name = data.donor_name or (user.full_name if user else "خیر ناشناس")
    donation = Donation(
        amount=data.amount,
        message=data.message,
        anonymous=data.anonymous,
        donor_name=name,
        campaign_id=campaign.id,
        donor_id=user.id if user else None,
    )
    campaign.raised_amount += data.amount
    campaign.donors_count += 1
    if campaign.raised_amount >= campaign.goal_amount:
        campaign.status = CampaignStatus.funded
    session.add(donation)
    session.add(campaign)
    session.commit()
    session.refresh(donation)
    return donation


@router.get("/campaigns/{slug}/updates", response_model=list[CampaignUpdateRead])
def campaign_updates(slug: str, session: Session = Depends(get_session)):
    campaign = session.exec(select(Campaign).where(Campaign.slug == slug)).first()
    if not campaign:
        raise HTTPException(404, "کمپین پیدا نشد")
    return sorted(campaign.updates, key=lambda u: u.created_at, reverse=True)


@router.get("/me/donations", response_model=list[DonationRead])
def my_donations(
    session: Session = Depends(get_session), user: User = Depends(current_user)
):
    return session.exec(
        select(Donation)
        .where(Donation.donor_id == user.id)
        .order_by(col(Donation.created_at).desc())
    ).all()
