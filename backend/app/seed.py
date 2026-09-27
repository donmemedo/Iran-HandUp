from datetime import timedelta

from sqlmodel import Session, select

from .db import engine
from .models import (
    Campaign,
    CampaignStatus,
    CampaignUpdate,
    Category,
    Donation,
    Organization,
    Role,
    User,
    utcnow,
)
from .security import hash_password

IMG = "https://images.unsplash.com/photo-{}?auto=format&fit=crop&w=1200&q=70"

CATEGORIES = [
    ("medical", "درمان و دارو", "Medical & Care", "stethoscope", "#FF5C38"),
    ("food", "غذا و سبد معیشت", "Food & Basics", "utensils", "#F59E0B"),
    ("shelter", "سرپناه و اجاره", "Shelter & Rent", "home", "#14B8A6"),
    ("education", "آموزش و تحصیل", "Education", "book", "#7C5CFF"),
    ("employment", "ابزار اشتغال", "Livelihood Tools", "hammer", "#3B82F6"),
    ("clothing", "پوشاک و گرما", "Clothing & Warmth", "shirt", "#EC4899"),
]

ORGS = [
    ("mehr-afarin", "خیریه مهرآفرین", "Mehr Afarin Charity", "تهران",
     "حمایت از کودکان کار و خانواده‌های کم‌برخوردار در حاشیه تهران.",
     "Supporting working children and low-income families around Tehran."),
    ("bahar-mehr", "مؤسسه بهار مهر", "Bahar Mehr Institute", "مشهد",
     "تأمین دارو و خدمات درمانی برای بیماران بی‌بضاعت.",
     "Providing medicine and treatment for patients in need."),
    ("dastan-sabz", "انجمن دستان سبز", "Green Hands Association", "شیراز",
     "توانمندسازی زنان سرپرست خانوار از طریق ابزار کار و آموزش.",
     "Empowering female heads of households through tools and training."),
    ("panahgah-omid", "پناهگاه امید", "Omid Shelter", "اصفهان",
     "سرپناه شبانه، غذای گرم و بازتوانی افراد بی‌خانمان.",
     "Night shelter, warm meals and rehabilitation for homeless people."),
]

CAMPAIGNS = [
    dict(slug="darman-sara", title="درمان قلب سارا، ۷ ساله", title_en="Heart surgery for Sara, 7",
         summary="سارا برای جراحی دریچه قلب به ۱۸۰ میلیون تومان نیاز دارد. بیمه تنها بخشی را پوشش می‌دهد.",
         summary_en="Sara needs a heart valve surgery; insurance covers only part of the cost.",
         story="سارا هفت ساله است و از بدو تولد با نارسایی دریچه قلب زندگی می‌کند. پزشکان معالج در مرکز قلب تهران جراحی را فوری اعلام کرده‌اند. پدر سارا کارگر فصلی است و مادرش از او نگهداری می‌کند. مبلغ جمع‌آوری‌شده مستقیماً به حساب بیمارستان واریز و رسید آن در همین صفحه منتشر می‌شود.",
         story_en="Sara is seven and has lived with a heart valve defect since birth. Her surgery is urgent. Funds go directly to the hospital account and receipts are published on this page.",
         cover=IMG.format("1631217868264-e5b90bb7e133"), beneficiary="سارا م.", beneficiary_en="Sara M.",
         age=7, city="تهران", city_en="Tehran", goal=180_000_000, raised=142_500_000, donors=613,
         cat="medical", org="bahar-mehr", urgent=True, featured=True),
    dict(slug="sabad-maishat-100", title="سبد معیشت زمستانه برای ۱۰۰ خانواده", title_en="Winter food baskets for 100 families",
         summary="هر سبد شامل برنج، روغن، حبوبات و پروتئین برای یک ماه یک خانواده چهارنفره است.",
         summary_en="Each basket feeds a family of four for one month.",
         story="با هر ۹۵۰ هزار تومان، یک سبد کامل معیشتی تهیه و توسط خیریه مهرآفرین درب منزل خانواده‌های شناسایی‌شده تحویل می‌شود. فهرست اقلام، فاکتور خرید عمده و عکس تحویل در بخش گزارش‌ها منتشر می‌شود.",
         story_en="Every 950,000 Toman provides one complete basket, delivered to identified families with published invoices.",
         cover=IMG.format("1593113630400-ea4288922497"), beneficiary="۱۰۰ خانواده", beneficiary_en="100 families",
         age=None, city="تهران", city_en="Tehran", goal=95_000_000, raised=71_200_000, donors=489,
         cat="food", org="mehr-afarin", urgent=False, featured=True),
    dict(slug="charkh-khayati-maryam", title="چرخ خیاطی برای مریم، مادر سه فرزند", title_en="A sewing machine for Maryam",
         summary="با یک چرخ خیاطی صنعتی، مریم می‌تواند از خانه درآمد پایدار داشته باشد.",
         summary_en="An industrial sewing machine gives Maryam a stable income from home.",
         story="مریم ۳۴ ساله، سرپرست خانوار و مادر سه کودک است. او دوره خیاطی فنی‌وحرفه‌ای را گذرانده اما ابزار کار ندارد. انجمن دستان سبز پس از خرید چرخ، شش ماه سفارش کار برای او تضمین می‌کند.",
         story_en="Maryam, 34, is a trained tailor without tools. After the purchase, the association guarantees six months of orders.",
         cover=IMG.format("1556905055-8f358a7a47b2"), beneficiary="مریم ر.", beneficiary_en="Maryam R.",
         age=34, city="شیراز", city_en="Shiraz", goal=42_000_000, raised=42_000_000, donors=277,
         cat="employment", org="dastan-sabz", urgent=False, featured=True),
    dict(slug="ejare-ezterari-khanevade-ahmadi", title="اجاره اضطراری خانواده احمدی", title_en="Emergency rent for the Ahmadi family",
         summary="حکم تخلیه صادر شده است؛ برای رهن یک اتاق در حاشیه شهر کمک لازم است.",
         summary_en="An eviction notice was issued; help is needed for a deposit on a small room.",
         story="خانواده پنج‌نفره احمدی پس از بیکاری پدر، سه ماه اجاره عقب‌افتاده دارند. مبلغ جمع‌آوری‌شده مستقیماً به حساب موجر و با تنظیم قرارداد یک‌ساله پرداخت می‌شود.",
         story_en="Funds are paid directly to the landlord with a one-year contract.",
         cover=IMG.format("1517048676732-d65bc937f952"), beneficiary="خانواده احمدی", beneficiary_en="Ahmadi family",
         age=None, city="اصفهان", city_en="Isfahan", goal=120_000_000, raised=38_400_000, donors=154,
         cat="shelter", org="panahgah-omid", urgent=True, featured=False),
    dict(slug="loazem-tahsili-kudakan-kar", title="لوازم‌التحریر ۲۵۰ کودک کار", title_en="School supplies for 250 working children",
         summary="بسته تحصیلی کامل برای کودکانی که مهر امسال به مدرسه برمی‌گردند.",
         summary_en="Complete school kits for children returning to class this year.",
         story="هر بسته شامل کیف، دفتر، نوشت‌افزار و کفش است. تحویل بسته‌ها در مراکز آموزشی مهرآفرین انجام و لیست دریافت‌کنندگان به‌صورت ناشناس منتشر می‌شود.",
         story_en="Each kit includes a bag, notebooks, stationery and shoes.",
         cover=IMG.format("1503676260728-1c00da094a0b"), beneficiary="۲۵۰ کودک", beneficiary_en="250 children",
         age=None, city="تهران", city_en="Tehran", goal=62_500_000, raised=51_300_000, donors=402,
         cat="education", org="mehr-afarin", urgent=False, featured=True),
    dict(slug="daroye-shimidarmani", title="داروی شیمی‌درمانی آقای کاظمی", title_en="Chemotherapy medicine for Mr. Kazemi",
         summary="شش دوره شیمی‌درمانی باقی مانده و داروها خارج از پوشش بیمه است.",
         summary_en="Six chemotherapy cycles remain; the medicine is not covered by insurance.",
         story="آقای کاظمی ۵۸ ساله، راننده بازنشسته است. داروخانه همکار، داروها را با ۱۲٪ تخفیف تأمین می‌کند و رسید هر دوره در گزارش‌ها بارگذاری می‌شود.",
         story_en="A partner pharmacy supplies the medicine at a 12% discount, with receipts published per cycle.",
         cover=IMG.format("1584515933487-779824d29309"), beneficiary="آقای کاظمی", beneficiary_en="Mr. Kazemi",
         age=58, city="مشهد", city_en="Mashhad", goal=88_000_000, raised=66_900_000, donors=331,
         cat="medical", org="bahar-mehr", urgent=True, featured=False),
    dict(slug="palto-zemestani", title="پالتو و پتوی زمستانی برای بی‌خانمان‌ها", title_en="Winter coats and blankets for homeless people",
         summary="۳۰۰ بسته گرمایشی برای شب‌های سرد؛ توزیع توسط تیم‌های سیار.",
         summary_en="300 warmth kits distributed by mobile teams on cold nights.",
         story="هر بسته شامل پالتو، پتوی گرم، جوراب و یک وعده غذای گرم است. توزیع در گرمخانه‌ها و مسیرهای شبانه انجام می‌شود.",
         story_en="Each kit includes a coat, a warm blanket, socks and a hot meal.",
         cover=IMG.format("1518398046578-8cca57782e17"), beneficiary="۳۰۰ نفر", beneficiary_en="300 people",
         age=None, city="اصفهان", city_en="Isfahan", goal=54_000_000, raised=22_700_000, donors=188,
         cat="clothing", org="panahgah-omid", urgent=False, featured=False),
    dict(slug="taemin-shir-khoshk", title="شیرخشک و پوشک نوزادان", title_en="Formula and diapers for infants",
         summary="حمایت ماهانه از ۴۰ نوزاد خانواده‌های تحت پوشش.",
         summary_en="Monthly support for 40 infants in covered families.",
         story="حمایت ماهانه با اشتراک ۲۵۰ هزار تومانی خیرین تأمین می‌شود و گزارش مصرف هر ماه منتشر می‌گردد.",
         story_en="Funded by monthly 250,000 Toman subscriptions with monthly consumption reports.",
         cover=IMG.format("1555252333-9f8e92e65df9"), beneficiary="۴۰ نوزاد", beneficiary_en="40 infants",
         age=None, city="شیراز", city_en="Shiraz", goal=36_000_000, raised=29_150_000, donors=243,
         cat="food", org="dastan-sabz", urgent=False, featured=False),
    dict(slug="taviz-samak", title="سمعک برای دانش‌آموز ناشنوا", title_en="Hearing aid for a deaf student",
         summary="بدون سمعک، امیرحسین نمی‌تواند کلاس را دنبال کند.",
         summary_en="Without a hearing aid, Amirhossein cannot follow class.",
         story="سمعک دیجیتال دوگوشی به همراه تنظیم و پشتیبانی دو ساله خریداری می‌شود.",
         story_en="A digital binaural hearing aid with two years of support will be purchased.",
         cover=IMG.format("1576091160399-112ba8d25d1d"), beneficiary="امیرحسین ک.", beneficiary_en="Amirhossein K.",
         age=11, city="مشهد", city_en="Mashhad", goal=48_000_000, raised=12_600_000, donors=97,
         cat="education", org="bahar-mehr", urgent=False, featured=False),
]

UPDATES = {
    "darman-sara": [
        ("مرحله اول پرداخت انجام شد", "First payment completed",
         "مبلغ ۸۰ میلیون تومان بابت پیش‌پرداخت جراحی به حساب بیمارستان واریز شد. تصویر رسید در پرونده کمپین ثبت است.",
         "80 million Toman was paid to the hospital as a surgery deposit.", 80_000_000),
        ("تاریخ عمل مشخص شد", "Surgery date scheduled",
         "با تکمیل ۷۰٪ هدف، تیم پزشکی تاریخ عمل را برای هفته آینده تعیین کرد.",
         "With 70% of the goal met, the medical team scheduled the operation for next week.", None),
    ],
    "charkh-khayati-maryam": [
        ("چرخ خیاطی تحویل شد", "Sewing machine delivered",
         "چرخ خیاطی صنعتی خریداری و در منزل مریم نصب شد. اولین سفارش کار نیز ثبت شده است.",
         "The industrial sewing machine was purchased and installed; the first order is in.", 42_000_000),
    ],
    "sabad-maishat-100": [
        ("۶۸ سبد تحویل شد", "68 baskets delivered",
         "تا امروز ۶۸ سبد معیشتی به خانواده‌های شناسایی‌شده تحویل داده شد.",
         "68 food baskets have been delivered so far.", 64_600_000),
    ],
}

DONORS = [
    ("رضا نیکنام", "reza@example.com"),
    ("نگار سلطانی", "negar@example.com"),
    ("امید فرهادی", "omid@example.com"),
]


def seed() -> None:
    with Session(engine) as s:
        if s.exec(select(Campaign)).first():
            return

        cats = {}
        for slug, name, name_en, icon, color in CATEGORIES:
            c = Category(slug=slug, name=name, name_en=name_en, icon=icon, color=color)
            s.add(c)
            cats[slug] = c

        orgs = {}
        for slug, name, name_en, city, desc, desc_en in ORGS:
            o = Organization(
                slug=slug, name=name, name_en=name_en, city=city,
                description=desc, description_en=desc_en,
                license_no=f"IR-{abs(hash(slug)) % 90000 + 10000}",
            )
            s.add(o)
            orgs[slug] = o

        admin = User(
            email="admin@handup.ir", full_name="مدیر دست‌یار",
            password_hash=hash_password("handup1234"), role=Role.admin, city="تهران",
        )
        s.add(admin)
        users = [admin]
        for name, email in DONORS:
            u = User(email=email, full_name=name, password_hash=hash_password("handup1234"), city="تهران")
            s.add(u)
            users.append(u)
        s.commit()

        now = utcnow()
        for i, d in enumerate(CAMPAIGNS):
            status = CampaignStatus.funded if d["raised"] >= d["goal"] else CampaignStatus.active
            c = Campaign(
                slug=d["slug"], title=d["title"], title_en=d["title_en"],
                summary=d["summary"], summary_en=d["summary_en"],
                story=d["story"], story_en=d["story_en"], cover=d["cover"],
                beneficiary_name=d["beneficiary"], beneficiary_name_en=d["beneficiary_en"],
                beneficiary_age=d["age"], city=d["city"], city_en=d["city_en"],
                goal_amount=d["goal"], raised_amount=d["raised"], donors_count=d["donors"],
                urgent=d["urgent"], featured=d["featured"], status=status,
                deadline=now + timedelta(days=14 + i * 6),
                created_at=now - timedelta(days=40 - i * 3),
                category_id=cats[d["cat"]].id, organization_id=orgs[d["org"]].id,
            )
            s.add(c)
            s.commit()
            s.refresh(c)

            for j, (t, t_en, b, b_en, spent) in enumerate(UPDATES.get(d["slug"], [])):
                s.add(CampaignUpdate(
                    title=t, title_en=t_en, body=b, body_en=b_en, spent_amount=spent,
                    campaign_id=c.id, created_at=now - timedelta(days=10 - j * 4),
                ))
            for k, u in enumerate(users[1:]):
                s.add(Donation(
                    amount=[500_000, 1_200_000, 250_000][k % 3],
                    message=["امیدوارم زودتر خوب بشه.", None, "به امید روزهای بهتر"][k % 3],
                    donor_name=u.full_name, campaign_id=c.id, donor_id=u.id,
                    created_at=now - timedelta(days=k + 1, hours=i),
                ))
        s.commit()
