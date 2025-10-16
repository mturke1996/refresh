import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Seed demo data to Firestore
 * This will add sample categories and items for testing
 */

const demoCategories = [
  { name: 'مشروبات ساخنة', nameEn: 'Hot Drinks', iconType: 'Coffee', order: 0, active: true },
  { name: 'مشروبات باردة', nameEn: 'Cold Drinks', iconType: 'Snowflake', order: 1, active: true },
  { name: 'كيك وحلويات', nameEn: 'Cakes & Desserts', iconType: 'Cake', order: 2, active: true },
  { name: 'كريب', nameEn: 'Crepes', iconType: 'CircleDot', order: 3, active: true },
];

const demoItems = [
  {
    name: 'إسبريسو',
    nameEn: 'Espresso',
    description: 'قهوة إسبريسو إيطالية أصيلة محضرة من أجود أنواع البن',
    descriptionEn: 'Authentic Italian espresso made from the finest coffee beans',
    price: 15.00,
    discountPercent: 0,
    categoryName: 'مشروبات ساخنة',
    imageUrl: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=800&q=80',
    available: true,
    isNew: false,
    isOnOffer: false,
  },
  {
    name: 'كابتشينو',
    nameEn: 'Cappuccino',
    description: 'مزيج رائع من الإسبريسو والحليب المخفوق برغوة كريمية',
    descriptionEn: 'Perfect blend of espresso and steamed milk with creamy foam',
    price: 18.00,
    discountPercent: 10,
    categoryName: 'مشروبات ساخنة',
    imageUrl: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800&q=80',
    available: true,
    isNew: false,
    isOnOffer: true,
  },
  {
    name: 'لاتيه فانيليا',
    nameEn: 'Vanilla Latte',
    description: 'لاتيه كريمي مع نكهة الفانيليا الفرنسية الطبيعية',
    descriptionEn: 'Creamy latte with natural French vanilla flavor',
    price: 20.00,
    discountPercent: 0,
    categoryName: 'مشروبات ساخنة',
    imageUrl: 'https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=800&q=80',
    available: true,
    isNew: true,
    isOnOffer: false,
  },
  {
    name: 'آيس موكا',
    nameEn: 'Iced Mocha',
    description: 'قهوة باردة بنكهة الشوكولاتة الغنية مع الحليب والثلج',
    descriptionEn: 'Cold coffee with rich chocolate flavor, milk and ice',
    price: 22.00,
    discountPercent: 15,
    categoryName: 'مشروبات باردة',
    imageUrl: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=800&q=80',
    available: true,
    isNew: false,
    isOnOffer: true,
  },
  {
    name: 'فراپيه كراميل',
    nameEn: 'Caramel Frappe',
    description: 'مشروب مخفوق بارد بنكهة الكراميل اللذيذة',
    descriptionEn: 'Delicious cold blended drink with caramel flavor',
    price: 24.00,
    discountPercent: 0,
    categoryName: 'مشروبات باردة',
    imageUrl: 'https://images.unsplash.com/photo-1562184552-28c85e0d0378?w=800&q=80',
    available: true,
    isNew: true,
    isOnOffer: false,
  },
  {
    name: 'تشيز كيك فراولة',
    nameEn: 'Strawberry Cheesecake',
    description: 'تشيز كيك كريمي بطبقة فراولة طازجة',
    descriptionEn: 'Creamy cheesecake topped with fresh strawberries',
    price: 28.00,
    discountPercent: 20,
    categoryName: 'كيك وحلويات',
    imageUrl: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&q=80',
    available: true,
    isNew: false,
    isOnOffer: true,
  },
  {
    name: 'براوني شوكولاتة',
    nameEn: 'Chocolate Brownie',
    description: 'براوني شوكولاتة دافئ مع آيس كريم الفانيليا',
    descriptionEn: 'Warm chocolate brownie with vanilla ice cream',
    price: 25.00,
    discountPercent: 0,
    categoryName: 'كيك وحلويات',
    imageUrl: 'https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=800&q=80',
    available: true,
    isNew: false,
    isOnOffer: false,
  },
  {
    name: 'كريب نوتيلا',
    nameEn: 'Nutella Crepe',
    description: 'كريب محشي بالنوتيلا الشهية مع الموز والفراولة',
    descriptionEn: 'Crepe filled with delicious Nutella, banana and strawberry',
    price: 30.00,
    discountPercent: 0,
    categoryName: 'كريب',
    imageUrl: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=800&q=80',
    available: true,
    isNew: true,
    isOnOffer: false,
  },
];

export const seedDemoData = async () => {
  try {
    console.log('🌱 Starting to seed demo data...');

    // Add categories first
    const categoryMap: { [key: string]: string } = {};
    
    for (const category of demoCategories) {
      const docRef = await addDoc(collection(db, 'categories'), {
        ...category,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      categoryMap[category.name] = docRef.id;
      console.log(`✅ Added category: ${category.name}`);
    }

    // Add items
    for (const item of demoItems) {
      const { categoryName, ...itemData } = item;
      const categoryId = categoryMap[categoryName];
      
      if (categoryId) {
        await addDoc(collection(db, 'items'), {
          ...itemData,
          categoryId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        console.log(`✅ Added item: ${item.name}`);
      }
    }

    // Add default settings for Libya
    await addDoc(collection(db, 'settings'), {
      shopName: 'Refresh Cafe',
      shopNameEn: 'Refresh Cafe',
      phone: '+218 91 123 4567',
      email: 'info@refresh-cafe.ly',
      address: 'طرابلس، ليبيا',
      workingHours: 'من 6 صباحاً إلى 2 ليلاً',
      telegramChatIds: [],
      socialMedia: {
        instagram: 'https://instagram.com/refresh_cafe',
        facebook: 'https://facebook.com/refresh.cafe',
        snapchat: 'https://snapchat.com/add/refresh_cafe',
        tiktok: 'https://tiktok.com/@refresh_cafe',
        website: 'https://refresh-cafe.ly'
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log('✅ Added default settings');

    console.log('🎉 Demo data seeded successfully!');
    return { success: true, message: 'تم إضافة البيانات التجريبية بنجاح!' };
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    return { success: false, message: 'حدث خطأ أثناء إضافة البيانات' };
  }
};

