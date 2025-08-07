# 🗄️ Manual MongoDB Database Setup

## Collections to Create

You need to create 3 collections in your MongoDB database:

1. **products** - Product catalog
2. **orders** - Customer orders  
3. **reviews** - Product reviews

---

## 📦 Products Collection

**Collection Name:** `products`

Copy and paste each product document into your MongoDB products collection:

### Product 1: Amsterdam Bookshelf
```json
{
  "productId": "amsterdam-bookshelf",
  "name": {
    "en": "Amsterdam Bookshelf",
    "he": "ספרייה אמסטרדם",
    "es": "Estantería Amsterdam"
  },
  "description": {
    "en": "Modern bookshelf with clean lines. Customize height and width to fit your space perfectly.",
    "he": "ספרייה מודרנית עם קווים נקיים. התאימו גובה ורוחב כדי להתאים לחלל שלכם בצורה מושלמת.",
    "es": "Estantería moderna con líneas limpias. Personaliza altura y ancho para adaptarse perfectamente a tu espacio."
  },
  "basePrice": 199,
  "currency": "NIS",
  "dimensions": {
    "height": {
      "min": 100,
      "max": 250,
      "default": 180,
      "multiplier": 0.5
    },
    "width": {
      "min": 60,
      "max": 120,
      "default": 80,
      "multiplier": 0.3
    },
    "depth": {
      "min": 25,
      "max": 40,
      "default": 30,
      "multiplier": 0.4
    }
  },
  "options": {
    "lacquer": {
      "available": true,
      "price": 45
    },
    "handrail": {
      "available": false,
      "price": 0
    }
  },
  "category": "bookshelf",
  "tags": ["modern", "minimalist", "customizable"],
  "images": [
    {
      "url": "/images/amsterdam-bookshelf-1.jpg",
      "alt": "Amsterdam Bookshelf Front View",
      "isPrimary": true
    },
    {
      "url": "/images/amsterdam-bookshelf-2.jpg",
      "alt": "Amsterdam Bookshelf Side View",
      "isPrimary": false
    }
  ],
  "isActive": true,
  "inventory": {
    "inStock": true,
    "stockLevel": 50,
    "lowStockThreshold": 5
  },
  "seo": {
    "metaTitle": {
      "en": "Amsterdam Bookshelf - Modern Custom Wood Furniture",
      "he": "ספרייה אמסטרדם - רהיטי עץ מותאמים מודרניים",
      "es": "Estantería Amsterdam - Muebles de Madera Modernos Personalizados"
    },
    "metaDescription": {
      "en": "Custom Amsterdam bookshelf with modern design. Choose your dimensions and finish.",
      "he": "ספרייה אמסטרדם מותאמת עם עיצוב מודרני. בחרו את המידות והגימור שלכם.",
      "es": "Estantería Amsterdam personalizada con diseño moderno. Elige tus dimensiones y acabado."
    },
    "slug": {
      "en": "amsterdam-bookshelf-modern-custom",
      "he": "ספרייה-אמסטרדם-מודרנית-מותאמת",
      "es": "estanteria-amsterdam-moderna-personalizada"
    }
  },
  "ratings": {
    "average": 4.8,
    "count": 24
  },
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

### Product 2: Venice Bookshelf
```json
{
  "productId": "venice-bookshelf",
  "name": {
    "en": "Venice Bookshelf",
    "he": "ספרייה ונציה",
    "es": "Estantería Venecia"
  },
  "description": {
    "en": "Classic design bookshelf with elegant curves. Choose your dimensions for the perfect fit.",
    "he": "ספרייה בעיצוב קלאסי עם קימורים אלגנטיים. בחרו את המידות שלכם להתאמה מושלמת.",
    "es": "Estantería de diseño clásico con curvas elegantes. Elige tus dimensiones para un ajuste perfecto."
  },
  "basePrice": 249,
  "currency": "NIS",
  "dimensions": {
    "height": {
      "min": 120,
      "max": 300,
      "default": 200,
      "multiplier": 0.4
    },
    "width": {
      "min": 70,
      "max": 140,
      "default": 90,
      "multiplier": 0.35
    }
  },
  "options": {
    "lacquer": {
      "available": true,
      "price": 45
    },
    "handrail": {
      "available": false,
      "price": 0
    }
  },
  "category": "bookshelf",
  "tags": ["classic", "elegant", "traditional"],
  "images": [
    {
      "url": "/images/venice-bookshelf-1.jpg",
      "alt": "Venice Bookshelf Front View",
      "isPrimary": true
    }
  ],
  "isActive": true,
  "inventory": {
    "inStock": true,
    "stockLevel": 30,
    "lowStockThreshold": 5
  },
  "seo": {
    "metaTitle": {
      "en": "Venice Bookshelf - Classic Custom Wood Furniture",
      "he": "ספרייה ונציה - רהיטי עץ קלאסיים מותאמים",
      "es": "Estantería Venecia - Muebles de Madera Clásicos Personalizados"
    },
    "metaDescription": {
      "en": "Custom Venice bookshelf with classic design and elegant curves.",
      "he": "ספרייה ונציה מותאמת עם עיצוב קלאסי וקימורים אלגנטיים.",
      "es": "Estantería Venecia personalizada con diseño clásico y curvas elegantes."
    },
    "slug": {
      "en": "venice-bookshelf-classic-custom",
      "he": "ספרייה-ונציה-קלאסית-מותאמת",
      "es": "estanteria-venecia-clasica-personalizada"
    }
  },
  "ratings": {
    "average": 4.6,
    "count": 18
  },
  "createdAt": "2024-01-15T10:05:00.000Z",
  "updatedAt": "2024-01-15T10:05:00.000Z"
}
```

### Product 3: Custom Stairs
```json
{
  "productId": "stairs",
  "name": {
    "en": "Custom Stairs",
    "he": "מדרגות מותאמות",
    "es": "Escaleras Personalizadas"
  },
  "description": {
    "en": "Wooden stairs for indoor use. Fully customizable dimensions with optional handrail.",
    "he": "מדרגות עץ לשימוש פנימי. מידות הניתנות להתאמה מלאה עם מעקה אופציונלי.",
    "es": "Escaleras de madera para uso interior. Dimensiones totalmente personalizables con barandilla opcional."
  },
  "basePrice": 299,
  "currency": "NIS",
  "dimensions": {
    "length": {
      "min": 150,
      "max": 400,
      "default": 250,
      "multiplier": 0.8
    },
    "width": {
      "min": 60,
      "max": 120,
      "default": 80,
      "multiplier": 0.5
    },
    "height": {
      "min": 50,
      "max": 150,
      "default": 100,
      "multiplier": 0.6
    },
    "steps": {
      "min": 3,
      "max": 12,
      "default": 6,
      "multiplier": 15
    }
  },
  "options": {
    "lacquer": {
      "available": true,
      "price": 45
    },
    "handrail": {
      "available": true,
      "price": 120
    }
  },
  "category": "stairs",
  "tags": ["custom", "indoor", "functional"],
  "images": [
    {
      "url": "/images/stairs-1.jpg",
      "alt": "Custom Wooden Stairs",
      "isPrimary": true
    }
  ],
  "isActive": true,
  "inventory": {
    "inStock": true,
    "stockLevel": 15,
    "lowStockThreshold": 3
  },
  "seo": {
    "metaTitle": {
      "en": "Custom Wooden Stairs - Indoor Wood Stairs",
      "he": "מדרגות עץ מותאמות - מדרגות עץ פנימיות",
      "es": "Escaleras de Madera Personalizadas - Escaleras Interiores"
    },
    "metaDescription": {
      "en": "Custom wooden stairs for indoor use with optional handrail and personalized dimensions.",
      "he": "מדרגות עץ מותאמות לשימוש פנימי עם מעקה אופציונלי ומידות מותאמות אישית.",
      "es": "Escaleras de madera personalizadas para uso interior con barandilla opcional y dimensiones personalizadas."
    },
    "slug": {
      "en": "custom-wooden-stairs-indoor",
      "he": "מדרגות-עץ-מותאמות-פנימיות",
      "es": "escaleras-madera-personalizadas-interior"
    }
  },
  "ratings": {
    "average": 4.9,
    "count": 12
  },
  "createdAt": "2024-01-15T10:10:00.000Z",
  "updatedAt": "2024-01-15T10:10:00.000Z"
}
```

### Product 4: Garden Bench
```json
{
  "productId": "garden-bench",
  "name": {
    "en": "Garden Bench",
    "he": "ספסל גינה",
    "es": "Banco de Jardín"
  },
  "description": {
    "en": "Beautiful outdoor bench perfect for gardens and patios. Customize length, width, and height.",
    "he": "ספסל חיצוני יפה מושלם לגינות ופטיו. התאימו אורך, רוחב וגובה.",
    "es": "Hermoso banco para exteriores perfecto para jardines y patios. Personaliza largo, ancho y altura."
  },
  "basePrice": 179,
  "currency": "NIS",
  "dimensions": {
    "length": {
      "min": 100,
      "max": 200,
      "default": 150,
      "multiplier": 0.4
    },
    "width": {
      "min": 30,
      "max": 50,
      "default": 40,
      "multiplier": 0.3
    },
    "height": {
      "min": 40,
      "max": 60,
      "default": 45,
      "multiplier": 0.5
    }
  },
  "options": {
    "lacquer": {
      "available": true,
      "price": 45
    },
    "handrail": {
      "available": false,
      "price": 0
    }
  },
  "category": "outdoor",
  "tags": ["outdoor", "garden", "seating"],
  "images": [
    {
      "url": "/images/garden-bench-1.jpg",
      "alt": "Garden Bench in Garden Setting",
      "isPrimary": true
    }
  ],
  "isActive": true,
  "inventory": {
    "inStock": true,
    "stockLevel": 25,
    "lowStockThreshold": 5
  },
  "seo": {
    "metaTitle": {
      "en": "Garden Bench - Custom Outdoor Wood Furniture",
      "he": "ספסל גינה - רהיטי עץ חיצוניים מותאמים",
      "es": "Banco de Jardín - Muebles de Madera Exterior Personalizados"
    },
    "metaDescription": {
      "en": "Custom garden bench for outdoor use. Perfect for gardens, patios, and outdoor spaces.",
      "he": "ספסל גינה מותאם לשימוש חיצוני. מושלם לגינות, פטיו וחללים חיצוניים.",
      "es": "Banco de jardín personalizado para uso exterior. Perfecto para jardines, patios y espacios al aire libre."
    },
    "slug": {
      "en": "garden-bench-outdoor-custom",
      "he": "ספסל-גינה-חיצוני-מותאם",
      "es": "banco-jardin-exterior-personalizado"
    }
  },
  "ratings": {
    "average": 4.7,
    "count": 31
  },
  "createdAt": "2024-01-15T10:15:00.000Z",
  "updatedAt": "2024-01-15T10:15:00.000Z"
}
```

### Product 5: Wooden Planter
```json
{
  "productId": "wooden-planter",
  "name": {
    "en": "Wooden Planter",
    "he": "עציץ עץ",
    "es": "Maceta de Madera"
  },
  "description": {
    "en": "Custom wooden planter for your garden. Perfect for herbs, flowers, and small plants.",
    "he": "עציץ עץ מותאם אישית לגינה שלכם. מושלם לעשבי תיבול, פרחים וצמחים קטנים.",
    "es": "Maceta de madera personalizada para tu jardín. Perfecta para hierbas, flores y plantas pequeñas."
  },
  "basePrice": 89,
  "currency": "NIS",
  "dimensions": {
    "length": {
      "min": 40,
      "max": 120,
      "default": 60,
      "multiplier": 0.3
    },
    "height": {
      "min": 20,
      "max": 60,
      "default": 30,
      "multiplier": 0.4
    }
  },
  "options": {
    "lacquer": {
      "available": true,
      "price": 25
    },
    "handrail": {
      "available": false,
      "price": 0
    }
  },
  "category": "outdoor",
  "tags": ["planter", "garden", "plants"],
  "images": [
    {
      "url": "/images/wooden-planter-1.jpg",
      "alt": "Wooden Planter with Plants",
      "isPrimary": true
    }
  ],
  "isActive": true,
  "inventory": {
    "inStock": true,
    "stockLevel": 40,
    "lowStockThreshold": 8
  },
  "seo": {
    "metaTitle": {
      "en": "Wooden Planter - Custom Garden Planters",
      "he": "עציץ עץ - עציצים מותאמים לגינה",
      "es": "Maceta de Madera - Macetas Personalizadas para Jardín"
    },
    "metaDescription": {
      "en": "Custom wooden planters for gardens. Perfect for herbs, flowers, and decorative plants.",
      "he": "עציצי עץ מותאמים לגינות. מושלמים לעשבי תיבול, פרחים וצמחי נוי.",
      "es": "Macetas de madera personalizadas para jardines. Perfectas para hierbas, flores y plantas decorativas."
    },
    "slug": {
      "en": "wooden-planter-garden-custom",
      "he": "עציץ-עץ-גינה-מותאם",
      "es": "maceta-madera-jardin-personalizada"
    }
  },
  "ratings": {
    "average": 4.5,
    "count": 27
  },
  "createdAt": "2024-01-15T10:20:00.000Z",
  "updatedAt": "2024-01-15T10:20:00.000Z"
}
```

### Product 6: Dog Bed
```json
{
  "productId": "dog-bed",
  "name": {
    "en": "Dog Bed",
    "he": "מיטה לכלב",
    "es": "Cama para Perro"
  },
  "description": {
    "en": "Comfortable wooden dog bed designed for your pet's comfort. Choose the perfect size for your furry friend.",
    "he": "מיטת עץ נוחה לכלב המיועדת לנוחות של חיית המחמד שלכם. בחרו את הגודל המושלם לחבר הפרוותי שלכם.",
    "es": "Cama de madera cómoda para perro diseñada para la comodidad de tu mascota. Elige el tamaño perfecto para tu amigo peludo."
  },
  "basePrice": 129,
  "currency": "NIS",
  "dimensions": {
    "length": {
      "min": 60,
      "max": 120,
      "default": 80,
      "multiplier": 0.4
    },
    "width": {
      "min": 40,
      "max": 80,
      "default": 60,
      "multiplier": 0.3
    },
    "height": {
      "min": 15,
      "max": 25,
      "default": 20,
      "multiplier": 0.8
    }
  },
  "options": {
    "lacquer": {
      "available": true,
      "price": 35
    },
    "handrail": {
      "available": false,
      "price": 0
    }
  },
  "category": "pet",
  "tags": ["pet", "bed", "comfort"],
  "images": [
    {
      "url": "/images/dog-bed-1.jpg",
      "alt": "Wooden Dog Bed with Dog",
      "isPrimary": true
    }
  ],
  "isActive": true,
  "inventory": {
    "inStock": true,
    "stockLevel": 20,
    "lowStockThreshold": 4
  },
  "seo": {
    "metaTitle": {
      "en": "Dog Bed - Custom Wooden Pet Furniture",
      "he": "מיטה לכלב - רהיטי עץ מותאמים לחיות מחמד",
      "es": "Cama para Perro - Muebles de Madera Personalizados para Mascotas"
    },
    "metaDescription": {
      "en": "Custom wooden dog bed for pet comfort. Available in various sizes for all dog breeds.",
      "he": "מיטת עץ מותאמת לכלב לנוחות חיות מחמד. זמינה בגדלים שונים לכל גזעי הכלבים.",
      "es": "Cama de madera personalizada para perro para comodidad de mascotas. Disponible en varios tamaños para todas las razas de perros."
    },
    "slug": {
      "en": "dog-bed-wooden-custom-pet",
      "he": "מיטה-לכלב-עץ-מותאמת-חיות-מחמד",
      "es": "cama-perro-madera-personalizada-mascota"
    }
  },
  "ratings": {
    "average": 4.8,
    "count": 19
  },
  "createdAt": "2024-01-15T10:25:00.000Z",
  "updatedAt": "2024-01-15T10:25:00.000Z"
}
```

---

## 🛒 Orders Collection

**Collection Name:** `orders`

### Sample Order 1
```json
{
  "orderId": "WK-2024-001",
  "customer": {
    "name": "John Smith",
    "email": "john.smith@example.com",
    "phone": "+972-50-123-4567",
    "address": "123 Rothschild Blvd, Tel Aviv, Israel"
  },
  "items": [
    {
      "productId": "amsterdam-bookshelf",
      "name": "Amsterdam Bookshelf",
      "configuration": {
        "dimensions": {
          "height": 200,
          "width": 100,
          "depth": 35
        },
        "options": {
          "lacquer": true,
          "handrail": false
        }
      },
      "pricing": {
        "basePrice": 199,
        "sizeAdjustment": 16,
        "optionsCost": 45,
        "unitPrice": 260
      },
      "quantity": 1,
      "totalPrice": 260
    }
  ],
  "pricing": {
    "subtotal": 260,
    "tax": 44.20,
    "shipping": 50,
    "total": 354.20
  },
  "status": "completed",
  "paymentStatus": "paid",
  "paymentMethod": "credit_card",
  "language": "en",
  "notes": "Please deliver after 2 PM on weekdays",
  "shippingAddress": {
    "street": "123 Rothschild Blvd",
    "city": "Tel Aviv",
    "country": "Israel",
    "postalCode": "6423806"
  },
  "trackingNumber": "WK-TRK-001",
  "estimatedDelivery": "2024-02-01T00:00:00.000Z",
  "createdAt": "2024-01-20T14:30:00.000Z",
  "updatedAt": "2024-01-22T09:15:00.000Z"
}
```

### Sample Order 2
```json
{
  "orderId": "WK-2024-002",
  "customer": {
    "name": "Sarah Cohen",
    "email": "sarah.cohen@example.com",
    "phone": "+972-52-987-6543",
    "address": "456 Ben Yehuda St, Jerusalem, Israel"
  },
  "items": [
    {
      "productId": "garden-bench",
      "name": "Garden Bench",
      "configuration": {
        "dimensions": {
          "length": 180,
          "width": 45,
          "height": 50
        },
        "options": {
          "lacquer": true,
          "handrail": false
        }
      },
      "pricing": {
        "basePrice": 179,
        "sizeAdjustment": 12,
        "optionsCost": 45,
        "unitPrice": 236
      },
      "quantity": 1,
      "totalPrice": 236
    },
    {
      "productId": "wooden-planter",
      "name": "Wooden Planter",
      "configuration": {
        "dimensions": {
          "length": 80,
          "height": 40
        },
        "options": {
          "lacquer": true,
          "handrail": false
        }
      },
      "pricing": {
        "basePrice": 89,
        "sizeAdjustment": 10,
        "optionsCost": 25,
        "unitPrice": 124
      },
      "quantity": 2,
      "totalPrice": 248
    }
  ],
  "pricing": {
    "subtotal": 484,
    "tax": 82.28,
    "shipping": 75,
    "total": 641.28
  },
  "status": "processing",
  "paymentStatus": "paid",
  "paymentMethod": "paypal",
  "language": "he",
  "notes": "דרוש תיאום מראש לפני משלוח",
  "shippingAddress": {
    "street": "456 Ben Yehuda St",
    "city": "Jerusalem",
    "country": "Israel",
    "postalCode": "9422306"
  },
  "trackingNumber": "WK-TRK-002",
  "estimatedDelivery": "2024-02-10T00:00:00.000Z",
  "createdAt": "2024-01-25T11:20:00.000Z",
  "updatedAt": "2024-01-25T16:45:00.000Z"
}
```

### Sample Order 3
```json
{
  "orderId": "WK-2024-003",
  "customer": {
    "name": "Maria Rodriguez",
    "email": "maria.rodriguez@example.com",
    "phone": "+972-54-555-1234",
    "address": "789 Dizengoff St, Tel Aviv, Israel"
  },
  "items": [
    {
      "productId": "dog-bed",
      "name": "Dog Bed",
      "configuration": {
        "dimensions": {
          "length": 90,
          "width": 70,
          "height": 22
        },
        "options": {
          "lacquer": true,
          "handrail": false
        }
      },
      "pricing": {
        "basePrice": 129,
        "sizeAdjustment": 8,
        "optionsCost": 35,
        "unitPrice": 172
      },
      "quantity": 1,
      "totalPrice": 172
    }
  ],
  "pricing": {
    "subtotal": 172,
    "tax": 29.24,
    "shipping": 30,
    "total": 231.24
  },
  "status": "shipped",
  "paymentStatus": "paid",
  "paymentMethod": "credit_card",
  "language": "es",
  "notes": "Por favor llamar antes de entregar",
  "shippingAddress": {
    "street": "789 Dizengoff St",
    "city": "Tel Aviv",
    "country": "Israel",
    "postalCode": "6423701"
  },
  "trackingNumber": "WK-TRK-003",
  "estimatedDelivery": "2024-01-30T00:00:00.000Z",
  "createdAt": "2024-01-18T09:45:00.000Z",
  "updatedAt": "2024-01-28T14:20:00.000Z"
}
```

---

## ⭐ Reviews Collection

**Collection Name:** `reviews`

**Note:** You'll need to replace `"PRODUCT_OBJECT_ID_HERE"` with the actual MongoDB ObjectId of each product after you insert the products.

### Review 1 - Amsterdam Bookshelf
```json
{
  "product": "AMSTERDAM_BOOKSHELF_OBJECT_ID_HERE",
  "productId": "amsterdam-bookshelf",
  "customer": {
    "name": "Sarah Cohen",
    "email": "sarah.cohen@example.com",
    "verified": true
  },
  "rating": 5,
  "title": "Perfect fit for my living room",
  "text": "Beautiful bookshelf with excellent craftsmanship. The custom dimensions were exactly what I needed. The wood quality is outstanding and the lacquer finish looks professional. Highly recommend!",
  "language": "en",
  "status": "approved",
  "isHelpful": 12,
  "moderationNotes": "Verified purchase - excellent detailed review",
  "images": [],
  "createdAt": "2024-01-22T15:30:00.000Z",
  "updatedAt": "2024-01-22T15:30:00.000Z",
  "moderatedAt": "2024-01-22T16:00:00.000Z"
}
```

### Review 2 - Amsterdam Bookshelf (Hebrew)
```json
{
  "product": "AMSTERDAM_BOOKSHELF_OBJECT_ID_HERE",
  "productId": "amsterdam-bookshelf",
  "customer": {
    "name": "דוד לוי",
    "email": "david.levi@example.com",
    "verified": true
  },
  "rating": 5,
  "title": "איכות מעולה",
  "text": "ספרייה יפהפייה עם איכות בנייה מעולה. בדיוק מה שחיפשתי לבית. השירות היה מקצועי והמשלוח מהיר. ממליץ בחום!",
  "language": "he",
  "status": "approved",
  "isHelpful": 8,
  "moderationNotes": "Verified purchase - positive Hebrew review",
  "images": [],
  "createdAt": "2024-01-24T10:20:00.000Z",
  "updatedAt": "2024-01-24T10:20:00.000Z",
  "moderatedAt": "2024-01-24T11:00:00.000Z"
}
```

### Review 3 - Garden Bench
```json
{
  "product": "GARDEN_BENCH_OBJECT_ID_HERE",
  "productId": "garden-bench",
  "customer": {
    "name": "Maria Rodriguez",
    "email": "maria.rodriguez@example.com",
    "verified": true
  },
  "rating": 4,
  "title": "Great for outdoor use",
  "text": "Sturdy bench that looks great in my garden. Good value for money. The wood holds up well to weather. Only minor issue was delivery took a bit longer than expected.",
  "language": "en",
  "status": "approved",
  "isHelpful": 6,
  "moderationNotes": "Verified purchase - honest review with minor complaint",
  "images": [],
  "createdAt": "2024-01-20T14:15:00.000Z",
  "updatedAt": "2024-01-20T14:15:00.000Z",
  "moderatedAt": "2024-01-20T15:00:00.000Z"
}
```

### Review 4 - Dog Bed
```json
{
  "product": "DOG_BED_OBJECT_ID_HERE",
  "productId": "dog-bed",
  "customer": {
    "name": "Alex Thompson",
    "email": "alex.thompson@example.com",
    "verified": true
  },
  "rating": 5,
  "title": "My dog loves it!",
  "text": "Perfect size for my golden retriever. Well-made and comfortable. The custom dimensions option was exactly what I needed. My dog immediately claimed it as his favorite spot!",
  "language": "en",
  "status": "approved",
  "isHelpful": 9,
  "moderationNotes": "Verified purchase - enthusiastic customer",
  "images": [],
  "createdAt": "2024-01-19T11:30:00.000Z",
  "updatedAt": "2024-01-19T11:30:00.000Z",
  "moderatedAt": "2024-01-19T12:00:00.000Z"
}
```

### Review 5 - Wooden Planter
```json
{
  "product": "WOODEN_PLANTER_OBJECT_ID_HERE",
  "productId": "wooden-planter",
  "customer": {
    "name": "Rachel Green",
    "email": "rachel.green@example.com",
    "verified": true
  },
  "rating": 4,
  "title": "Good quality planter",
  "text": "Nice wooden planter for my herbs. The drainage is good and it fits perfectly on my balcony. The lacquer finish protects it well from the elements.",
  "language": "en",
  "status": "approved",
  "isHelpful": 5,
  "moderationNotes": "Verified purchase - balanced review",
  "images": [],
  "createdAt": "2024-01-23T16:45:00.000Z",
  "updatedAt": "2024-01-23T16:45:00.000Z",
  "moderatedAt": "2024-01-23T17:00:00.000Z"
}
```

### Review 6 - Venice Bookshelf
```json
{
  "product": "VENICE_BOOKSHELF_OBJECT_ID_HERE",
  "productId": "venice-bookshelf",
  "customer": {
    "name": "Michael Brown",
    "email": "michael.brown@example.com",
    "verified": true
  },
  "rating": 5,
  "title": "Classic and elegant",
  "text": "Beautiful classic design that fits perfectly in my study. The curved details are expertly crafted. Excellent customer service throughout the ordering process.",
  "language": "en",
  "status": "approved",
  "isHelpful": 7,
  "moderationNotes": "Verified purchase - appreciates craftsmanship",
  "images": [],
  "createdAt": "2024-01-21T13:20:00.000Z",
  "updatedAt": "2024-01-21T13:20:00.000Z",
  "moderatedAt": "2024-01-21T14:00:00.000Z"
}
```

---

## 🔧 Manual Setup Instructions

### Step 1: Connect to MongoDB
1. Open MongoDB Compass or connect via CLI
2. Connect to your database: `woodkits`

### Step 2: Create Collections
Create these 3 collections:
- `products`
- `orders` 
- `reviews`

### Step 3: Insert Products
1. Select the `products` collection
2. Click "Add Data" → "Insert Document"
3. Copy and paste each product JSON (6 total)
4. **Important**: Save the ObjectId of each product for reviews

### Step 4: Insert Orders
1. Select the `orders` collection
2. Insert the 3 sample orders
3. Modify customer details as needed

### Step 5: Insert Reviews
1. Select the `reviews` collection
2. **Before inserting**: Replace `"PRODUCT_OBJECT_ID_HERE"` with actual ObjectIds from products
3. Insert all 6 reviews

### Step 6: Verify Data
Check that your API returns data:
- `GET /api/v1/products` should return 6 products
- `GET /api/v1/orders` should return 3 orders  
- `GET /api/v1/reviews` should return 6 reviews

---

## ✅ Result

After manual setup, your database will have:
- **6 Complete Products** with multi-language content
- **3 Sample Orders** with different statuses
- **6 Customer Reviews** in multiple languages
- **Professional Demo Data** ready for production

Your Wood Kits platform will be fully functional with real data! 🎉