# 🪵 ערכות עץ - מדריך הפעלה מלא

## גרסה עברית בלבד - הכל מוכן לשימוש!

### 🎯 מה השתנה:
- **מסד נתונים פשוט יותר** - ללא רב-לשוניות, עברית בלבד
- **זריעה אוטומטית** - המוצרים נטענים אוטומטית כשהשרת עולה
- **ממשק עברי מלא** - RTL, טקסט עברי, ניווט בעברית

---

## 🚀 הפעלה מהירה (3 דקות)

### שלב 1: הפעל את השרת האחורי
```bash
cd /Users/arad/dev/kits-wood/2-react-migrated-version/backend
npm start
```

**תוצאה צפויה:**
```
✅ Connected to MongoDB
📍 Database: woodkits
🌱 Database is empty - starting automatic seeding...
📦 Inserting Hebrew products...
✅ Inserted 6 products
⭐ Inserting Hebrew reviews...
✅ Inserted 6 reviews
🛒 Inserting Hebrew orders...
✅ Inserted 2 orders
📊 Updating product ratings...
✅ Auto-seeding completed successfully!
🚀 Server running on port 6003
```

### שלב 2: הפעל את הממשק הקדמי
```bash
cd /Users/arad/dev/kits-wood/2-react-migrated-version/frontend
npm start
```

**תוצאה צפויה:**
```
Local:            http://localhost:6005
webpack compiled with 0 errors
```

### שלב 3: בדוק שהכל עובד
- **דף הבית**: http://localhost:6005
- **דף מוצר**: http://localhost:6005/product/amsterdam-bookshelf
- **API**: http://localhost:6003/api/v1/products

---

## 🎉 מה תראה באתר:

### 🏠 **דף הבית**
- כותרת: "🪵 ערכות עץ"
- תת-כותרת: "רהיטי עץ מותאמים אישית לבית שלכם"
- 6 מוצרים עם תמונות אייקונים
- כל מוצר עם תיאור עברי ומחיר

### 📦 **המוצרים הזמינים**
1. **ספרייה אמסטרדם** (₪199) 📚
2. **ספרייה ונציה** (₪249) 📖  
3. **מדרגות מותאמות** (₪299) 🪜
4. **ספסל גינה** (₪179) 🪑
5. **עציץ עץ** (₪89) 🌱
6. **מיטה לכלב** (₪129) 🐕

### 🛠️ **דף מוצר**
- תיאור מלא בעברית
- סליידרים להתאמת מידות
- אפשרויות נוספות (לכה, מעקה)
- חישוב מחיר בזמן אמת
- כפתור "הוסף לעגלת קניות"

### 🛒 **עגלת קניות**
- רשימת מוצרים שנבחרו
- חישוב מחיר כולל
- ממשק עברי מלא

---

## 🗄️ המוצרים במסד הנתונים:

### ספרייה אמסטרדם
```json
{
  "productId": "amsterdam-bookshelf",
  "name": "ספרייה אמסטרדם",
  "description": "ספרייה מודרנית עם קווים נקיים...",
  "basePrice": 199,
  "dimensions": {
    "height": { "min": 100, "max": 250, "default": 180 },
    "width": { "min": 60, "max": 120, "default": 80 },
    "depth": { "min": 25, "max": 40, "default": 30 }
  }
}
```

### ספרייה ונציה
```json
{
  "productId": "venice-bookshelf", 
  "name": "ספרייה ונציה",
  "description": "ספרייה בעיצוב קלאסי עם קימורים אלגנטיים...",
  "basePrice": 249
}
```

### מדרגות מותאמות
```json
{
  "productId": "stairs",
  "name": "מדרגות מותאמות", 
  "description": "מדרגות עץ לשימוש פנימי...",
  "basePrice": 299,
  "options": {
    "lacquer": { "available": true, "price": 45 },
    "handrail": { "available": true, "price": 120 }
  }
}
```

*+ עוד 3 מוצרים...*

---

## 🔧 פתרון בעיות

### השרת לא עולה
```bash
# בדוק אם יש משהו שרץ על הפורט
lsof -ti:6003 | xargs kill -9
npm start
```

### הממשק לא נטען
```bash
# נקה ותתקין מחדש
rm -rf node_modules package-lock.json
npm install
npm start
```

### מסד הנתונים ריק
```bash
# הפעל מחדש את השרת - הזריעה תתבצע אוטומטית
npm start
```

### API לא מחזיר נתונים
```bash
# בדוק ידנית
curl http://localhost:6003/api/v1/products
```

---

## 📊 API עובד:

### רשימת מוצרים
```bash
GET http://localhost:6003/api/v1/products
# מחזיר 6 מוצרים בעברית
```

### מוצר ספציפי
```bash
GET http://localhost:6003/api/v1/products/amsterdam-bookshelf
# מחזיר ספרייה אמסטרדם עם כל הפרטים
```

### חישוב מחיר  
```bash
POST http://localhost:6003/api/v1/products/amsterdam-bookshelf/calculate-price
{
  "dimensions": { "height": 200, "width": 100, "depth": 35 },
  "options": { "lacquer": true }
}
# מחזיר: { "totalPrice": 260 }
```

### ביקורות
```bash
GET http://localhost:6003/api/v1/reviews  
# מחזיר 6 ביקורות בעברית
```

---

## ✅ בדיקה מלאה:

1. **דף הבית עובד** ✅
   - http://localhost:6005
   - רואים 6 מוצרים
   - כל הטקסט בעברית

2. **דפי מוצרים עובדים** ✅
   - http://localhost:6005/product/amsterdam-bookshelf
   - http://localhost:6005/product/venice-bookshelf  
   - http://localhost:6005/product/stairs
   - http://localhost:6005/product/garden-bench
   - http://localhost:6005/product/wooden-planter
   - http://localhost:6005/product/dog-bed

3. **התאמה אישית עובדת** ✅
   - סליידרים זמינים
   - מחיר מתעדכן בזמן אמת
   - אפשרויות נוספות זמינות

4. **עגלת קניות עובדת** ✅
   - הוספת מוצרים
   - חישוב מחיר כולל
   - ממשק עברי

---

## 🎯 הכל מוכן!

**האתר שלך כעת:**
- ✅ **עברי מלא** עם RTL
- ✅ **6 מוצרים מלאים** עם תיאורים בעברית
- ✅ **זריעת מסד נתונים אוטומטית**
- ✅ **ביקורות לקוחות** בעברית
- ✅ **התאמה אישית** עם חישוב מחירים
- ✅ **עגלת קניות** פונקציונלית
- ✅ **ממשק רספונסיבי** למובייל

**ברגע שהשרתים פועלים, הכל עובד מיד ללא הגדרות נוספות!** 🚀

---

## 📞 צריך עזרה?

אם משהו לא עובד:
1. וודא ששני השרתים רצים
2. בדוק שהמסד נתונים התמלא (יש הודעה בקונסול)
3. נסה לרענן את הדפדפן
4. בדוק את הקונסול לשגיאות

**הכל אמור לעבוד מיד!** 🎉