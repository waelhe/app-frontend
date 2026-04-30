import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// POST /api/seed — Seed the database with demo/placeholder data
export async function POST() {
  try {
    // ── 1. Create Users ─────────────────────────────────────
    const adminUser = await db.user.upsert({
      where: { email: 'admin@marketplace.com' },
      update: {},
      create: {
        email: 'admin@marketplace.com',
        name: 'Admin User',
        displayName: 'المشرف',
        phone: '+963-11-0000001',
        role: 'ADMIN',
        password: 'admin123',
        isActive: true,
      },
    })

    const provider1 = await db.user.upsert({
      where: { email: 'ahmad@marketplace.com' },
      update: {},
      create: {
        email: 'ahmad@marketplace.com',
        name: 'Ahmad Al-Salem',
        displayName: 'أحمد السالم',
        phone: '+963-11-0000002',
        role: 'PROVIDER',
        password: 'provider123',
        isActive: true,
      },
    })

    const provider2 = await db.user.upsert({
      where: { email: 'sara@marketplace.com' },
      update: {},
      create: {
        email: 'sara@marketplace.com',
        name: 'Sara Khalil',
        displayName: 'سارة خليل',
        phone: '+963-11-0000003',
        role: 'PROVIDER',
        password: 'provider123',
        isActive: true,
      },
    })

    const provider3 = await db.user.upsert({
      where: { email: 'omar@marketplace.com' },
      update: {},
      create: {
        email: 'omar@marketplace.com',
        name: 'Omar Haddad',
        displayName: 'عمر حداد',
        phone: '+963-11-0000004',
        role: 'PROVIDER',
        password: 'provider123',
        isActive: true,
      },
    })

    const consumer1 = await db.user.upsert({
      where: { email: 'layla@marketplace.com' },
      update: {},
      create: {
        email: 'layla@marketplace.com',
        name: 'Layla Nasser',
        displayName: 'ليلى ناصر',
        phone: '+963-11-0000005',
        role: 'CONSUMER',
        password: 'consumer123',
        isActive: true,
      },
    })

    const consumer2 = await db.user.upsert({
      where: { email: 'youssef@marketplace.com' },
      update: {},
      create: {
        email: 'youssef@marketplace.com',
        name: 'Youssef Ibrahim',
        displayName: 'يوسف إبراهيم',
        phone: '+963-11-0000006',
        role: 'CONSUMER',
        password: 'consumer123',
        isActive: true,
      },
    })

    // ── 2. Create Listings ──────────────────────────────────
    const listingData = [
      {
        title: 'شقة فسيحة في قلب القدسية',
        description: 'شقة 3 غرف نوم مع صالة واسعة ومطبخ مجهز بالكامل. قريبة من السوق الرئيسي.',
        category: 'real-estate',
        price: 2500000,
        currency: 'SYP',
        location: 'القدسية - المركز',
        status: 'ACTIVE',
        providerId: provider1.id,
        images: JSON.stringify([]),
      },
      {
        title: 'Modern Apartment in Center',
        description: '2-bedroom apartment with balcony and city view. Fully renovated.',
        category: 'real-estate',
        price: 1800000,
        currency: 'SYP',
        location: 'Qudsaya Center',
        status: 'ACTIVE',
        providerId: provider2.id,
        images: JSON.stringify([]),
      },
      {
        title: 'آيفون 15 برو ماكس',
        description: 'آيفون 15 برو ماكس 256 جيجا، لون تيتانيوم طبيعي، جديد بالكرتون.',
        category: 'electronics',
        price: 12500000,
        currency: 'SYP',
        location: 'القدسية',
        status: 'ACTIVE',
        providerId: provider1.id,
        images: JSON.stringify([]),
      },
      {
        title: 'Samsung Galaxy S24 Ultra',
        description: 'Brand new, 512GB storage. Comes with warranty and all accessories.',
        category: 'electronics',
        price: 11000000,
        currency: 'SYP',
        location: 'Qudsaya - Dahia',
        status: 'ACTIVE',
        providerId: provider3.id,
        images: JSON.stringify([]),
      },
      {
        title: 'طقم كنبة خشب زان',
        description: 'طقم كنبة خشب زان أصلي يتكون من 3+2+1، بحالة ممتازة.',
        category: 'furniture',
        price: 850000,
        currency: 'SYP',
        location: 'القدسية - الضاحية',
        status: 'ACTIVE',
        providerId: provider2.id,
        images: JSON.stringify([]),
      },
      {
        title: 'Dining Table with 6 Chairs',
        description: 'Modern glass-top dining table with leather chairs. Excellent condition.',
        category: 'furniture',
        price: 650000,
        currency: 'SYP',
        location: 'Qudsaya Center',
        status: 'ACTIVE',
        providerId: provider1.id,
        images: JSON.stringify([]),
      },
      {
        title: 'تويوتا كامري 2022',
        description: 'تويوتا كامري 2022، ماشية 30 ألف كم، فل كامل، لون أبيض.',
        category: 'cars',
        price: 85000000,
        currency: 'SYP',
        location: 'دمشق',
        status: 'ACTIVE',
        providerId: provider3.id,
        images: JSON.stringify([]),
      },
      {
        title: 'Hyundai Tucson 2021',
        description: 'Hyundai Tucson 2021, 45K km, automatic, full option. Silver color.',
        category: 'cars',
        price: 72000000,
        currency: 'SYP',
        location: 'Damascus Highway',
        status: 'ACTIVE',
        providerId: provider3.id,
        images: JSON.stringify([]),
      },
      {
        title: 'خدمات سباكة محترفة',
        description: 'فني سباكة متخصص في جميع أعمال السباكة المنزلية والتجارية.',
        category: 'services',
        price: 25000,
        currency: 'SYP',
        location: 'القدسية والمناطق المحيطة',
        status: 'ACTIVE',
        providerId: provider2.id,
        images: JSON.stringify([]),
      },
      {
        title: 'Professional Electrician',
        description: 'Licensed electrician for home and commercial installations. 10+ years experience.',
        category: 'services',
        price: 30000,
        currency: 'SYP',
        location: 'Qudsaya & Surrounding',
        status: 'ACTIVE',
        providerId: provider1.id,
        images: JSON.stringify([]),
      },
      {
        title: 'مطلوب محاسب',
        description: 'مطلوب محاسب خبرة 3 سنوات على الأقل، إتقان برنامج Excel والأنظمة المحاسبية.',
        category: 'jobs',
        price: 0,
        currency: 'SYP',
        location: 'القدسية',
        status: 'ACTIVE',
        providerId: provider3.id,
        images: JSON.stringify([]),
      },
      {
        title: 'Graphic Designer Wanted',
        description: 'Looking for a creative graphic designer. Part-time or full-time. Adobe suite required.',
        category: 'jobs',
        price: 0,
        currency: 'SYP',
        location: 'Remote',
        status: 'ACTIVE',
        providerId: provider2.id,
        images: JSON.stringify([]),
      },
      // Additional listings for more categories
      {
        title: 'فيلا فاخرة مع حديقة',
        description: 'فيلا 5 غرف نوم مع مسبح وحديقة كبيرة. منطقة هادئة.',
        category: 'real-estate',
        price: 15000000,
        currency: 'SYP',
        location: 'القدسية - التلال',
        status: 'ACTIVE',
        providerId: provider1.id,
        images: JSON.stringify([]),
      },
      {
        title: 'لابتوب Dell XPS 15',
        description: 'Dell XPS 15, i7, 16GB RAM, 512GB SSD. Perfect for developers.',
        category: 'electronics',
        price: 6500000,
        currency: 'SYP',
        location: 'القدسية',
        status: 'ACTIVE',
        providerId: provider3.id,
        images: JSON.stringify([]),
      },
      {
        title: 'مكتبة خشبية كبيرة',
        description: 'مكتبة خشبية كبيرة بعدة أرفف، مناسبة للمكتبة المنزلية.',
        category: 'furniture',
        price: 350000,
        currency: 'SYP',
        location: 'القدسية - المركز',
        status: 'ACTIVE',
        providerId: provider2.id,
        images: JSON.stringify([]),
      },
      {
        title: 'خدمات تنظيف منزلية',
        description: 'شركة تنظيف متخصصة في التنظيف المنزلي والتجاري بأسعار منافسة.',
        category: 'services',
        price: 20000,
        currency: 'SYP',
        location: 'القدسية والضواحي',
        status: 'ACTIVE',
        providerId: provider1.id,
        images: JSON.stringify([]),
      },
      {
        title: 'مطلوب سائق توصيل',
        description: 'مطلوب سائق توصيل لديه سيارة وترخيص سائق ساري.',
        category: 'jobs',
        price: 0,
        currency: 'SYP',
        location: 'القدسية',
        status: 'ACTIVE',
        providerId: provider3.id,
        images: JSON.stringify([]),
      },
      {
        title: 'كيا سيراتو 2023',
        description: 'كيا سيراتو 2023، أوتوماتيك، فل أوبشن، لون رمادي.',
        category: 'cars',
        price: 55000000,
        currency: 'SYP',
        location: 'القدسية',
        status: 'ACTIVE',
        providerId: provider2.id,
        images: JSON.stringify([]),
      },
    ]

    // Clear existing listings first
    await db.listing.deleteMany({})
    const listings = await db.listing.createMany({
      data: listingData,
      skipDuplicates: true,
    })

    // ── 3. Create Directory Items ────────────────────────────
    const directoryData = [
      // Food & Hospitality
      {
        nameAr: 'مطعم الليمون الحلو',
        nameEn: 'Sweet Lemon Restaurant',
        category: 'restaurants',
        group: 'food',
        phone: '+963-11-5550001',
        address: 'القدسية - الشارع الرئيسي',
        descriptionAr: 'مطعم يقدم أشهى المأكولات السورية والشرقية',
        descriptionEn: 'Restaurant serving delicious Syrian and Middle Eastern cuisine',
        rating: 4.5,
        reviewCount: 120,
        isEmergency: false,
      },
      {
        nameAr: 'كافيه النسمة',
        nameEn: 'Breeze Café',
        category: 'cafes',
        group: 'food',
        phone: '+963-11-5550002',
        address: 'القدسية - ساحة الحرية',
        descriptionAr: 'كافيه هادئ مع مشهد رائع',
        descriptionEn: 'Cozy café with a great view',
        rating: 4.2,
        reviewCount: 85,
        isEmergency: false,
      },
      {
        nameAr: 'مخبز السعادة',
        nameEn: 'Happiness Bakery',
        category: 'bakeries',
        group: 'food',
        phone: '+963-11-5550003',
        address: 'القدسية - حي النزهة',
        descriptionAr: 'مخبز تقليدي يقدم أجود المعجنات والخبز الطازج',
        descriptionEn: 'Traditional bakery offering the finest pastries and fresh bread',
        rating: 4.7,
        reviewCount: 200,
        isEmergency: false,
      },
      // Health & Medical
      {
        nameAr: 'عيادة الدكتور سامي',
        nameEn: 'Dr. Sami Clinic',
        category: 'doctors',
        group: 'health',
        phone: '+963-11-5550004',
        address: 'القدسية - شارع المستشفى',
        descriptionAr: 'عيادة طبية عامة',
        descriptionEn: 'General medical clinic',
        rating: 4.8,
        reviewCount: 95,
        isEmergency: false,
      },
      {
        nameAr: 'صيدلية الشفاء',
        nameEn: 'Al-Shifa Pharmacy',
        category: 'pharmacies',
        group: 'health',
        phone: '+963-11-5550005',
        address: 'القدسية - المركز',
        descriptionAr: 'صيدلية مفتوحة 24 ساعة',
        descriptionEn: '24-hour pharmacy',
        rating: 4.3,
        reviewCount: 150,
        isEmergency: true,
      },
      {
        nameAr: 'مستوصف القدسية',
        nameEn: 'Qudsaya Medical Center',
        category: 'hospitals',
        group: 'health',
        phone: '+963-11-5550006',
        address: 'القدسية - الطريق الرئيسي',
        descriptionAr: 'مستوصف شامل مع طوارئ',
        descriptionEn: 'Comprehensive medical center with emergency services',
        rating: 4.6,
        reviewCount: 300,
        isEmergency: true,
      },
      // Beauty & Care
      {
        nameAr: 'صالون ياسمين',
        nameEn: 'Jasmine Salon',
        category: 'beauty',
        group: 'beauty',
        phone: '+963-11-5550007',
        address: 'القدسية - شارع الجميل',
        descriptionAr: 'صالون تجميل نسائي',
        descriptionEn: 'Women\'s beauty salon',
        rating: 4.4,
        reviewCount: 75,
        isEmergency: false,
      },
      {
        nameAr: 'حلاق الأنوار',
        nameEn: 'Al-Anwar Barbershop',
        category: 'barbershops',
        group: 'beauty',
        phone: '+963-11-5550008',
        address: 'القدسية - السوق',
        descriptionAr: 'حلاقة رجالية تقليدية',
        descriptionEn: 'Traditional men\'s barbershop',
        rating: 4.1,
        reviewCount: 60,
        isEmergency: false,
      },
      // Cars & Transport
      {
        nameAr: 'ورشة الأمل للسيارات',
        nameEn: 'Al-Amal Auto Workshop',
        category: 'mechanics',
        group: 'transport',
        phone: '+963-11-5550009',
        address: 'القدسية - المنطقة الصناعية',
        descriptionAr: 'ورشة صيانة وإصلاح السيارات',
        descriptionEn: 'Car maintenance and repair workshop',
        rating: 4.0,
        reviewCount: 45,
        isEmergency: false,
      },
      {
        nameAr: 'محطة وقود القدسية',
        nameEn: 'Qudsaya Gas Station',
        category: 'gas-stations',
        group: 'transport',
        phone: '+963-11-5550010',
        address: 'القدسية - الطريق السريع',
        descriptionAr: 'محطة وقود مع خدمات 24 ساعة',
        descriptionEn: '24-hour gas station with services',
        rating: 3.8,
        reviewCount: 180,
        isEmergency: true,
      },
      // Education & Sports
      {
        nameAr: 'مدرسة النور',
        nameEn: 'Al-Noor School',
        category: 'schools',
        group: 'education',
        phone: '+963-11-5550011',
        address: 'القدسية - حي الأمل',
        descriptionAr: 'مدرسة خاصة من الروضة حتى الثانوية',
        descriptionEn: 'Private school from kindergarten to high school',
        rating: 4.6,
        reviewCount: 220,
        isEmergency: false,
      },
      {
        nameAr: 'نادي الرياضة الذهبية',
        nameEn: 'Golden Fitness Club',
        category: 'gyms',
        group: 'education',
        phone: '+963-11-5550012',
        address: 'القدسية - شارع الرياضة',
        descriptionAr: 'نادي رياضي مجهز بأحدث الأجهزة',
        descriptionEn: 'Fitness club with the latest equipment',
        rating: 4.3,
        reviewCount: 90,
        isEmergency: false,
      },
      // Business & Offices
      {
        nameAr: 'مكتبة القدسية',
        nameEn: 'Qudsaya Bookstore',
        category: 'bookstores',
        group: 'business',
        phone: '+963-11-5550013',
        address: 'القدسية - شارع الثقافة',
        descriptionAr: 'مكتبة لبيع الكتب والقرطاسية',
        descriptionEn: 'Book and stationery store',
        rating: 4.5,
        reviewCount: 110,
        isEmergency: false,
      },
      {
        nameAr: 'شركة التكنولوجيا المتقدمة',
        nameEn: 'Advanced Tech Company',
        category: 'offices',
        group: 'business',
        phone: '+963-11-5550014',
        address: 'القدسية - برج الأعمال',
        descriptionAr: 'حلول تقنية متكاملة للشركات',
        descriptionEn: 'Comprehensive IT solutions for businesses',
        rating: 4.2,
        reviewCount: 35,
        isEmergency: false,
      },
      // Public Services
      {
        nameAr: 'بلدية القدسية',
        nameEn: 'Qudsaya Municipality',
        category: 'government',
        group: 'public',
        phone: '+963-11-5550015',
        address: 'القدسية - مبنى البلدية',
        descriptionAr: 'البلدية الرئيسية - خدمات عامة',
        descriptionEn: 'Main municipality - public services',
        rating: 3.5,
        reviewCount: 500,
        isEmergency: false,
      },
      {
        nameAr: 'مكتب البريد',
        nameEn: 'Post Office',
        category: 'post-office',
        group: 'public',
        phone: '+963-11-5550016',
        address: 'القدسية - الشارع الرئيسي',
        descriptionAr: 'خدمات بريدية وشحن',
        descriptionEn: 'Postal and shipping services',
        rating: 3.7,
        reviewCount: 200,
        isEmergency: false,
      },
    ]

    await db.directoryItem.deleteMany({})
    const directoryItems = await db.directoryItem.createMany({
      data: directoryData,
      skipDuplicates: true,
    })

    // ── 4. Create Emergency Contacts ─────────────────────────
    const emergencyData = [
      {
        nameAr: 'الشرطة',
        nameEn: 'Police',
        phone: '112',
        category: 'police',
        is24Hours: true,
        isActive: true,
      },
      {
        nameAr: 'الدفاع المدني',
        nameEn: 'Civil Defense',
        phone: '113',
        category: 'fire',
        is24Hours: true,
        isActive: true,
      },
      {
        nameAr: 'الإسعاف',
        nameEn: 'Ambulance',
        phone: '110',
        category: 'medical',
        is24Hours: true,
        isActive: true,
      },
      {
        nameAr: 'المستشفى العسكري',
        nameEn: 'Military Hospital',
        phone: '+963-11-2221234',
        category: 'medical',
        is24Hours: true,
        isActive: true,
      },
      {
        nameAr: 'مستشفى المواساة',
        nameEn: 'Al-Mouwasat Hospital',
        phone: '+963-11-2225678',
        category: 'medical',
        is24Hours: true,
        isActive: true,
      },
      {
        nameAr: 'شركة الكهرباء',
        nameEn: 'Electricity Company',
        phone: '+963-11-3330001',
        category: 'utility',
        is24Hours: false,
        isActive: true,
      },
      {
        nameAr: 'شركة المياه',
        nameEn: 'Water Company',
        phone: '+963-11-3330002',
        category: 'utility',
        is24Hours: false,
        isActive: true,
      },
      {
        nameAr: 'الغاز',
        nameEn: 'Gas Emergency',
        phone: '+963-11-3330003',
        category: 'utility',
        is24Hours: true,
        isActive: true,
      },
    ]

    await db.emergencyContact.deleteMany({})
    const emergencyContacts = await db.emergencyContact.createMany({
      data: emergencyData,
      skipDuplicates: true,
    })

    // ── 5. Create Community Posts ────────────────────────────
    const communityData = [
      {
        titleAr: 'افتتاح سوق القدسية الجديد',
        titleEn: 'Grand Opening of New Qudsaya Market',
        contentAr: 'يسرنا الإعلان عن افتتاح السوق الجديد في وسط القدسية. تفضلوا بزيارتنا!',
        contentEn: 'We are pleased to announce the grand opening of the new market in central Qudsaya. Come visit us!',
        type: 'news',
        isPinned: true,
        isActive: true,
      },
      {
        titleAr: 'مهرجان الربيع السنوي',
        titleEn: 'Annual Spring Festival',
        contentAr: 'مهرجان الربيع السنوي سيقام في حديقة القدسية يوم الجمعة القادم. فعاليات عائلية ممتعة!',
        contentEn: 'The annual spring festival will be held at Qudsaya Park next Friday. Fun family activities!',
        type: 'event',
        isPinned: true,
        isActive: true,
      },
      {
        titleAr: 'حملة تبرع للأسر المحتاجة',
        titleEn: 'Charity Drive for Needy Families',
        contentAr: 'نقوم بجمع التبرعات للأسر المحتاجة في المنطقة. يمكنكم التبرع في مكتب البلدية.',
        contentEn: 'We are collecting donations for needy families in the area. You can donate at the municipality office.',
        type: 'charity',
        isPinned: false,
        isActive: true,
      },
      {
        titleAr: 'إعلان هام: صيانة الطرق',
        titleEn: 'Important Notice: Road Maintenance',
        contentAr: 'سيتم إغلاق الشارع الرئيسي للصيانة يوم السبت من الساعة 8 صباحاً حتى 4 عصراً.',
        contentEn: 'The main road will be closed for maintenance on Saturday from 8 AM to 4 PM.',
        type: 'announcement',
        isPinned: true,
        isActive: true,
      },
      {
        titleAr: 'ورشة عمل لتعلم البرمجة',
        titleEn: 'Programming Workshop',
        contentAr: 'ورشة عمل مجانية لتعلم أساسيات البرمجة للشباب. التسجيل مفتوح!',
        contentEn: 'Free programming workshop for youth. Registration is open!',
        type: 'event',
        isPinned: false,
        isActive: true,
      },
      {
        titleAr: 'مسابقة أفضل طبق محلي',
        titleEn: 'Best Local Dish Competition',
        contentAr: 'شارك في مسابقة أفضل طبق محلي واربح جوائز قيمة! التسجيل في مكتب الثقافة.',
        contentEn: 'Participate in the best local dish competition and win valuable prizes! Register at the culture office.',
        type: 'event',
        isPinned: false,
        isActive: true,
      },
      {
        titleAr: 'مشروع تشجير القدسية',
        titleEn: 'Qudsaya Tree Planting Project',
        contentAr: 'مشروع تطوعي لزراعة 500 شجرة في أحياء القدسية المختلفة. انضم إلينا!',
        contentEn: 'Volunteer project to plant 500 trees in various Qudsaya neighborhoods. Join us!',
        type: 'charity',
        isPinned: false,
        isActive: true,
      },
      {
        titleAr: 'تحديثات خدمة النقل',
        titleEn: 'Transport Service Updates',
        contentAr: 'تم إضافة خطوط نقل جديدة تخدم منطقة القدسية. تفاصيل أكثر في المقال.',
        contentEn: 'New transport lines have been added serving the Qudsaya area. More details in the article.',
        type: 'news',
        isPinned: false,
        isActive: true,
      },
    ]

    await db.communityPost.deleteMany({})
    const communityPosts = await db.communityPost.createMany({
      data: communityData,
      skipDuplicates: true,
    })

    // ── 6. Create Sample Bookings ────────────────────────────
    const allListings = await db.listing.findMany({ take: 4 })
    const bookingsData = []

    if (allListings.length >= 4) {
      bookingsData.push(
        {
          listingId: allListings[0].id,
          consumerId: consumer1.id,
          providerId: allListings[0].providerId,
          status: 'CONFIRMED',
          notes: 'أرغب في زيارة الشقة يوم الخميس',
          priceCents: Math.round(allListings[0].price * 100),
          currency: allListings[0].currency,
        },
        {
          listingId: allListings[1].id,
          consumerId: consumer2.id,
          providerId: allListings[1].providerId,
          status: 'PENDING',
          notes: 'Is the apartment still available?',
          priceCents: Math.round(allListings[1].price * 100),
          currency: allListings[1].currency,
        },
        {
          listingId: allListings[2].id,
          consumerId: consumer1.id,
          providerId: allListings[2].providerId,
          status: 'COMPLETED',
          notes: null,
          priceCents: Math.round(allListings[2].price * 100),
          currency: allListings[2].currency,
        },
        {
          listingId: allListings[3].id,
          consumerId: consumer2.id,
          providerId: allListings[3].providerId,
          status: 'CANCELLED',
          notes: 'Changed my mind',
          priceCents: Math.round(allListings[3].price * 100),
          currency: allListings[3].currency,
        }
      )
    }

    await db.booking.deleteMany({})
    if (bookingsData.length > 0) {
      await db.booking.createMany({ data: bookingsData })
    }

    // ── 7. Create a Conversation with Messages ──────────────
    const allBookings = await db.booking.findMany({ take: 1 })
    if (allBookings.length > 0) {
      const booking = allBookings[0]

      await db.conversation.deleteMany({})
      const conversation = await db.conversation.create({
        data: {
          bookingId: booking.id,
          participants: {
            connect: [
              { id: booking.consumerId },
              { id: booking.providerId },
            ],
          },
        },
      })

      await db.message.createMany({
        data: [
          {
            conversationId: conversation.id,
            senderId: booking.consumerId,
            content: 'مرحباً، هل الشقة لا تزال متاحة؟',
          },
          {
            conversationId: conversation.id,
            senderId: booking.providerId,
            content: 'أهلاً! نعم الشقة متاحة، متى تريد زيارتها؟',
          },
          {
            conversationId: conversation.id,
            senderId: booking.consumerId,
            content: 'أريد زيارتها يوم الخميس بعد الظهر إذا ممكن.',
          },
          {
            conversationId: conversation.id,
            senderId: booking.providerId,
            content: 'تمام، بانتظارك يوم الخميس الساعة 3 عصراً.',
            isRead: false,
          },
        ],
      })
    }

    return NextResponse.json({
      message: 'Database seeded successfully',
      data: {
        users: 6,
        listings: listings.count,
        directoryItems: directoryItems.count,
        emergencyContacts: emergencyContacts.count,
        communityPosts: communityPosts.count,
        bookings: bookingsData.length,
      },
    })
  } catch (error) {
    console.error('[SEED_POST]', error)
    return NextResponse.json(
      { error: 'Failed to seed database', details: String(error) },
      { status: 500 }
    )
  }
}
