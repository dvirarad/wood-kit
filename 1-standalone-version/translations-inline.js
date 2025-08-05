// Inline translations to avoid CORS issues
const TRANSLATIONS = {
    en: {
        "site": {
            "title": "Wood Kits - DIY Wooden Construction Kits",
            "logo": "Wood Kits"
        },
        "navigation": {
            "home": "Home",
            "furniture": "Custom Furniture",
            "cart": "Cart",
            "orders": "Orders",
            "about": "About",
            "venice_bookshelf": "Venice Bookshelf",
            "amsterdam_bookshelf": "Amsterdam Bookshelf",
            "stairs": "Custom Stairs",
            "custom_garden_bench": "Garden Bench",
            "wooden_planter": "Wooden Planter",
            "dog_bed": "Dog Bed"
        },
        "hero": {
            "title": "Premium DIY Wooden Construction Kits",
            "subtitle": "Create beautiful, functional pieces for your home and garden with our easy-to-assemble wooden kits."
        },
        "products": {
            "featured_title": "Custom Furniture Collection",
            "customize": "Customize",
            "add_to_cart": "Add to Cart",
            "added": "Added!",
            "venice_bookshelf": {
                "title": "Venice Bookshelf",
                "description": "Elegant customizable bookshelf with classic Venice styling. Configure all dimensions to fit your space perfectly. Crafted from premium wood with optional lacquer finish.",
                "price": "From ₪149"
            },
            "amsterdam_bookshelf": {
                "title": "Amsterdam Bookshelf",
                "description": "Modern bookshelf design with clean lines and minimalist aesthetics. Configure all dimensions to create the perfect storage solution for your space. Crafted from premium wood with optional lacquer finish.",
                "price": "From ₪129"
            },
            "stairs": {
                "title": "Custom Stairs",
                "description": "Handcrafted wooden stairs built to your exact specifications. Configure dimensions, number of steps, and handrail options. Perfect for indoor and outdoor applications.",
                "price": "From ₪299"
            },
            "custom_garden_bench": {
                "title": "Garden Bench",
                "description": "Beautiful outdoor bench crafted from weather-resistant wood. Customize length, width, and height to create the perfect seating for your garden, patio, or outdoor space.",
                "price": "From ₪179"
            },
            "wooden_planter": {
                "title": "Wooden Planter",
                "description": "Custom wooden planter perfect for your garden, patio, or balcony. Built with drainage system and weather-resistant materials. Configure length and height to suit your plants and space.",
                "price": "From ₪89"
            },
            "dog_bed": {
                "title": "Dog Bed",
                "description": "Comfortable wooden dog bed frame designed for your furry friend. Customize the mattress dimensions to fit your pet perfectly. Built with smooth edges and pet-safe materials.",
                "price": "From ₪119"
            }
        },
        "cart": {
            "title": "Shopping Cart",
            "empty": "Your cart is empty",
            "continue_shopping": "Continue Shopping",
            "subtotal": "Subtotal:",
            "tax": "Tax (10%):",
            "total": "Total:",
            "checkout": "Proceed to Checkout",
            "quantity": "Qty:",
            "remove": "Remove",
            "customer_info": "Customer Information",
            "full_name": "Full Name",
            "email": "Email",
            "phone": "Phone",
            "address": "Address",
            "special_instructions": "Special Instructions (Optional)",
            "special_instructions_placeholder": "Any special requests or delivery instructions...",
            "cancel": "Cancel",
            "submit_order": "Submit Order",
            "order_success": "Order Submitted Successfully!",
            "order_id": "Your order ID is:",
            "confirmation_email": "You will receive a confirmation email shortly."
        },
        "product_config": {
            "customize": "Customize Your",
            "length": "Length:",
            "width": "Width:",
            "height": "Height:",
            "depth": "Depth:",
            "steps": "Number of Steps:",
            "add_lacquer": "Add Lacquer Finish",
            "add_handrail": "Add Handrail",
            "price_breakdown": "Price Breakdown",
            "base_price": "Base Price:",
            "size_adjustment": "Size Adjustment:",
            "lacquer_finish": "Lacquer Finish:",
            "handrail": "Handrail:",
            "total": "Total:",
            "add_to_cart": "Add to Cart",
            "save_config": "Save Configuration",
            "price_updates": "Price updates as you customize",
            "range": "Range:",
            "cm": "cm",
            "steps_unit": "steps"
        },
        "reviews": {
            "title": "Customer Reviews",
            "write_review": "Write a Review",
            "your_name": "Your Name",
            "your_review": "Your Review",
            "rating": "Rating",
            "submit_review": "Submit Review",
            "no_reviews": "No reviews yet. Be the first to review this product!",
            "average_rating": "Average Rating",
            "reviews_count": "reviews",
            "review_success": "Review submitted successfully!",
            "review_error": "Please fill in all fields and select a rating"
        },
        "admin": {
            "login": "Admin Login",
            "username": "Username:",
            "password": "Password:",
            "close": "Close",
            "dashboard": "Admin Dashboard",
            "pricing_management": "Pricing Management",
            "orders": "Orders",
            "product_settings": "Product Settings",
            "logout": "Logout"
        },
        "about": {
            "page_title": "About Us - Wood Kits",
            "title": "About Wood Kits",
            "subtitle": "Crafting quality custom furniture since 2020, bringing your vision to life with precision and care.",
            "our_story_title": "Our Story",
            "our_story_text": "Wood Kits was founded with a simple mission: to make high-quality, custom furniture accessible to everyone. We believe that every home deserves beautiful, functional pieces that are built to last. Our journey began when our founder, passionate about woodworking and design, saw the need for customizable furniture solutions that don't compromise on quality or break the bank.",
            "our_craft_title": "Our Craft",
            "our_craft_text": "Every piece we create is handcrafted by skilled artisans using premium wood and time-tested techniques. We combine traditional woodworking methods with modern precision tools to ensure each item meets our exacting standards. Our customization system allows you to specify exact dimensions, materials, and finishes to create furniture that perfectly fits your space and style.",
            "sustainability_title": "Sustainability",
            "sustainability_text": "We're committed to environmental responsibility. All our wood is sourced from sustainable forests, and we use eco-friendly finishes and adhesives. Our made-to-order approach means we only create what's needed, reducing waste. We also partner with local suppliers to minimize our carbon footprint and support our community.",
            "values_title": "Our Values",
            "quality_title": "Quality",
            "quality_text": "We never compromise on materials or craftsmanship. Every piece is built to last generations.",
            "customization_title": "Customization",
            "customization_text": "Your furniture should be as unique as you are. We offer unlimited customization options.",
            "customer_service_title": "Customer Service",
            "customer_service_text": "From design to delivery, we're with you every step of the way to ensure your complete satisfaction.",
            "sustainability_value_title": "Sustainability",
            "sustainability_value_text": "We care about our planet and future generations. All our practices are environmentally conscious.",
            "contact_title": "Get in Touch",
            "contact_text": "Have questions about our products or need help with your order? We'd love to hear from you.",
            "email_label": "Email:",
            "phone_label": "Phone:",
            "address_label": "Address:",
            "address_text": "123 Rothschild Blvd, Tel Aviv, Israel"
        },
        "footer": {
            "copyright": "© 2024 Wood Kits. All rights reserved."
        }
    },
    he: {
        "site": {
            "title": "ערכות עץ - ערכות בנייה מעץ להרכבה עצמית",
            "logo": "ערכות עץ"
        },
        "navigation": {
            "home": "בית",
            "furniture": "ריהוט מותאם אישית",
            "cart": "עגלה",
            "orders": "הזמנות",
            "about": "אודות",
            "venice_bookshelf": "מדף ונציה",
            "amsterdam_bookshelf": "מדף אמסטרדם",
            "stairs": "מדרגות מותאמות",
            "custom_garden_bench": "ספסל גינה",
            "wooden_planter": "עציץ עץ",
            "dog_bed": "מיטת כלב"
        },
        "hero": {
            "title": "ערכות בנייה מעץ איכותיות להרכבה עצמית",
            "subtitle": "צרו חפצים יפים ופונקציונליים לבית ולגינה עם ערכות העץ הקלות להרכבה שלנו."
        },
        "products": {
            "featured_title": "קולקציית ריהוט מותאם אישית",
            "customize": "התאמה אישית",
            "add_to_cart": "הוסף לעגלה",
            "added": "נוסף!",
            "venice_bookshelf": {
                "title": "מדף ונציה",
                "description": "מדף ספרים אלגנטי הניתן להתאמה אישית בסגנון ונציה קלאסי. התאם את כל המידות כדי להתאים למרחב שלך בצורה מושלמת. עשוי מעץ איכותי עם אופציה לציפוי לכה.",
                "price": "החל מ-₪149"
            },
            "amsterdam_bookshelf": {
                "title": "מדף אמסטרדם",
                "description": "עיצוב מדף ספרים מודרני עם קווים נקיים ואסתטיקה מינימליסטית. התאם את כל המידות ליצירת פתרון האחסון המושלם למרחב שלך. עשוי מעץ איכותי עם אופציה לציפוי לכה.",
                "price": "החל מ-₪129"
            },
            "stairs": {
                "title": "מדרגות מותאמות",
                "description": "מדרגות עץ בעבודת יד הבנויות לפי המפרט המדויק שלך. התאם מידות, מספר מדרגות ואפשרויות מעקה. מושלם ליישומים פנימיים וחיצוניים.",
                "price": "החל מ-₪299"
            },
            "custom_garden_bench": {
                "title": "ספסל גינה",
                "description": "ספסל חוץ יפהפה העשוי מעץ עמיד בפני מזג האוויר. התאם אורך, רוחב וגובה ליצירת הישיבה המושלמת לגינה, למרפסת או למרחב החיצוני שלך.",
                "price": "החל מ-₪179"
            },
            "wooden_planter": {
                "title": "עציץ עץ",
                "description": "עציץ עץ מותאם אישית מושלם לגינה, למרפסת או למרפסת שלך. בנוי עם מערכת ניקוז וחומרים עמידים בפני מזג האוויר. התאם אורך וגובה כדי להתאים לצמחים ולמרחב שלך.",
                "price": "החל מ-₪89"
            },
            "dog_bed": {
                "title": "מיטת כלב",
                "description": "מסגרת מיטת כלב מעץ נוחה המיועדת לחבר הפרוותי שלך. התאם את מידות המזרון כדי להתאים לחיית המחמד שלך בצורה מושלמת. בנוי עם קצוות חלקים וחומרים בטוחים לחיות מחמד.",
                "price": "החל מ-₪119"
            }
        },
        "cart": {
            "title": "עגלת קניות",
            "empty": "העגלה שלך ריקה",
            "continue_shopping": "המשך קניות",
            "subtotal": "סכום ביניים:",
            "tax": "מס (10%):",
            "total": "סה\"כ:",
            "checkout": "המשך לתשלום",
            "quantity": "כמות:",
            "remove": "הסר",
            "customer_info": "פרטי לקוח",
            "full_name": "שם מלא",
            "email": "אימייל",
            "phone": "טלפון",
            "address": "כתובת",
            "special_instructions": "הוראות מיוחדות (אופציונלי)",
            "special_instructions_placeholder": "בקשות מיוחדות או הוראות משלוח...",
            "cancel": "ביטול",
            "submit_order": "שלח הזמנה",
            "order_success": "ההזמנה נשלחה בהצלחה!",
            "order_id": "מספר ההזמנה שלך:",
            "confirmation_email": "תקבל אישור במייל בקרוב."
        },
        "product_config": {
            "customize": "התאם אישית את",
            "length": "אורך:",
            "width": "רוחב:",
            "height": "גובה:",
            "depth": "עומק:",
            "steps": "מספר מדרגות:",
            "add_lacquer": "הוסף ציפוי לכה",
            "add_handrail": "הוסף מעקה",
            "price_breakdown": "פירוט מחיר",
            "base_price": "מחיר בסיס:",
            "size_adjustment": "התאמת גודל:",
            "lacquer_finish": "ציפוי לכה:",
            "handrail": "מעקה:",
            "total": "סה\"כ:",
            "add_to_cart": "הוסף לעגלה",
            "save_config": "שמור תצורה",
            "price_updates": "המחיר מתעדכן בזמן ההתאמה",
            "range": "טווח:",
            "cm": "ס\"מ",
            "steps_unit": "מדרגות"
        },
        "reviews": {
            "title": "ביקורות לקוחות",
            "write_review": "כתוב ביקורת",
            "your_name": "השם שלך",
            "your_review": "הביקורת שלך",
            "rating": "דירוג",
            "submit_review": "שלח ביקורת",
            "no_reviews": "עדיין אין ביקורות. היה הראשון לכתוב ביקורת על המוצר!",
            "average_rating": "דירוג ממוצע",
            "reviews_count": "ביקורות",
            "review_success": "הביקורת נשלחה בהצלחה!",
            "review_error": "אנא מלא את כל השדות ובחר דירוג"
        },
        "admin": {
            "login": "כניסת מנהל",
            "username": "שם משתמש:",
            "password": "סיסמה:",
            "close": "סגור",
            "dashboard": "לוח בקרה",
            "pricing_management": "ניהול מחירים",
            "orders": "הזמנות",
            "product_settings": "הגדרות מוצר",
            "logout": "התנתק"
        },
        "about": {
            "page_title": "אודותינו - ערכות עץ",
            "title": "אודות ערכות עץ",
            "subtitle": "יוצרים ריהוט מותאם אישית איכותי משנת 2020, מביאים את החזון שלכם לחיים בדיוק ובטיפוח.",
            "our_story_title": "הסיפור שלנו",
            "our_story_text": "ערכות עץ נוסדה עם משימה פשוטה: להפוך ריהוט מותאם אישית איכותי לנגיש לכולם. אנחנו מאמינים שכל בית ראוי לחפצים יפים ופונקציונליים הבנויים להחזיק מעמד. המסע שלנו החל כשהמייסד שלנו, הנלהב מעבודת עץ ועיצוב, ראה את הצורך בפתרונות ריהוט הניתנים להתאמה אישית שלא מתפשרים על איכות או שוברים את הכיס.",
            "our_craft_title": "המלאכה שלנו",
            "our_craft_text": "כל חפץ שאנו יוצרים נעשה בעבודת יד על ידי אומנים מיומנים באמצעות עץ איכותי וטכניקות מוכחות זמן. אנו משלבים שיטות עבודת עץ מסורתיות עם כלי דיוק מודרניים כדי להבטיח שכל פריט עומד בסטנדרטים המחמירים שלנו. מערכת ההתאמה האישית שלנו מאפשרת לכם לציין מידות מדויקות, חומרים וגימור ליצירת ריהוט שמתאים בצורה מושלמת למרחב ולסגנון שלכם.",
            "sustainability_title": "קיימות",
            "sustainability_text": "אנחנו מחויבים לאחריות סביבתית. כל העץ שלנו מקורו ביערות בר-קיימא, ואנו משתמשים בגימור ודבקים ידידותיים לסביבה. הגישה שלנו של הזמנה לפי דרישה אומרת שאנו יוצרים רק מה שנחוץ, מפחיתים פסולת. אנו גם שותפים עם ספקים מקומיים כדי למזער את טביעת הרגל הפחמנית שלנו ולתמוך בקהילה שלנו.",
            "values_title": "הערכים שלנו",
            "quality_title": "איכות",
            "quality_text": "אנחנו אף פעם לא מתפשרים על חומרים או איכות עבודה. כל חפץ בנוי להחזיק מעמד לדורות.",
            "customization_title": "התאמה אישית",
            "customization_text": "הריהוט שלכם צריך להיות ייחודי כמוכם. אנו מציעים אפשרויות התאמה אישית בלתי מוגבלות.",
            "customer_service_title": "שירות לקוחות",
            "customer_service_text": "מעיצוב ועד משלוח, אנחנו איתכם בכל שלב כדי להבטיח את שביעות רצונכם המלאה.",
            "sustainability_value_title": "קיימות",
            "sustainability_value_text": "אכפת לנו מהכוכב שלנו ומהדורות הבאים. כל הפרקטיקות שלנו מודעות לסביבה.",
            "contact_title": "צור קשר",
            "contact_text": "יש לך שאלות על המוצרים שלנו או צריך עזרה עם ההזמנה? נשמח לשמוע ממך.",
            "email_label": "אימייל:",
            "phone_label": "טלפון:",
            "address_label": "כתובת:",
            "address_text": "שדרות רוטשילד 123, תל אביב, ישראל"
        },
        "footer": {
            "copyright": "© 2024 ערכות עץ. כל הזכויות שמורות."
        }
    },
    es: {
        "site": {
            "title": "Kits de Madera - Kits de Construcción DIY",
            "logo": "Kits de Madera"
        },
        "navigation": {
            "home": "Inicio",
            "furniture": "Muebles Personalizados",
            "cart": "Carrito",
            "orders": "Pedidos",
            "about": "Acerca de",
            "venice_bookshelf": "Estante Venecia",
            "amsterdam_bookshelf": "Estante Amsterdam",
            "stairs": "Escaleras Personalizadas",
            "custom_garden_bench": "Banco de Jardín",
            "wooden_planter": "Jardinera de Madera",
            "dog_bed": "Cama para Perro"
        },
        "hero": {
            "title": "Kits Premium de Construcción en Madera DIY",
            "subtitle": "Crea piezas hermosas y funcionales para tu hogar y jardín con nuestros kits de madera fáciles de ensamblar."
        },
        "products": {
            "featured_title": "Colección de Muebles Personalizados",
            "customize": "Personalizar",
            "add_to_cart": "Añadir al Carrito",
            "added": "¡Añadido!",
            "venice_bookshelf": {
                "title": "Estante Venecia",
                "description": "Estante de libros elegante y personalizable con el estilo clásico de Venecia. Configura todas las dimensiones para que se adapte perfectamente a tu espacio. Elaborado con madera premium con opción de acabado lacado.",
                "price": "Desde ₪149"
            },
            "amsterdam_bookshelf": {
                "title": "Estante Amsterdam",
                "description": "Diseño de estante moderno con líneas limpias y estética minimalista. Configura todas las dimensiones para crear la solución de almacenamiento perfecta para tu espacio. Elaborado con madera premium con opción de acabado lacado.",
                "price": "Desde ₪129"
            },
            "stairs": {
                "title": "Escaleras Personalizadas",
                "description": "Escaleras de madera artesanales construidas según tus especificaciones exactas. Configura dimensiones, número de escalones y opciones de pasamanos. Perfecto para aplicaciones interiores y exteriores.",
                "price": "Desde ₪299"
            },
            "custom_garden_bench": {
                "title": "Banco de Jardín",
                "description": "Hermoso banco para exteriores elaborado con madera resistente a la intemperie. Personaliza la longitud, ancho y altura para crear el asiento perfecto para tu jardín, patio o espacio exterior.",
                "price": "Desde ₪179"
            },
            "wooden_planter": {
                "title": "Jardinera de Madera",
                "description": "Jardinera de madera personalizada perfecta para tu jardín, patio o balcón. Construida con sistema de drenaje y materiales resistentes a la intemperie. Configura la longitud y altura para adaptarse a tus plantas y espacio.",
                "price": "Desde ₪89"
            },
            "dog_bed": {
                "title": "Cama para Perro",
                "description": "Marco cómodo de cama para perro de madera diseñado para tu amigo peludo. Personaliza las dimensiones del colchón para que se adapte perfectamente a tu mascota. Construido con bordes suaves y materiales seguros para mascotas.",
                "price": "Desde ₪119"
            }
        },
        "cart": {
            "title": "Carrito de Compras",
            "empty": "Tu carrito está vacío",
            "continue_shopping": "Continuar Comprando",
            "subtotal": "Subtotal:",
            "tax": "Impuesto (10%):",
            "total": "Total:",
            "checkout": "Proceder al Pago",
            "quantity": "Cant:",
            "remove": "Eliminar",
            "customer_info": "Información del Cliente",
            "full_name": "Nombre Completo",
            "email": "Email",
            "phone": "Teléfono",
            "address": "Dirección",
            "special_instructions": "Instrucciones Especiales (Opcional)",
            "special_instructions_placeholder": "Solicitudes especiales o instrucciones de entrega...",
            "cancel": "Cancelar",
            "submit_order": "Enviar Pedido",
            "order_success": "¡Pedido Enviado Exitosamente!",
            "order_id": "Tu ID de pedido es:",
            "confirmation_email": "Recibirás un email de confirmación pronto."
        },
        "product_config": {
            "customize": "Personaliza tu",
            "length": "Longitud:",
            "width": "Ancho:",
            "height": "Altura:",
            "depth": "Profundidad:",
            "steps": "Número de Escalones:",
            "add_lacquer": "Agregar Acabado Lacado",
            "add_handrail": "Agregar Pasamanos",
            "price_breakdown": "Desglose de Precio",
            "base_price": "Precio Base:",
            "size_adjustment": "Ajuste de Tamaño:",
            "lacquer_finish": "Acabado Lacado:",
            "handrail": "Pasamanos:",
            "total": "Total:",
            "add_to_cart": "Agregar al Carrito",
            "save_config": "Guardar Configuración",
            "price_updates": "El precio se actualiza mientras personalizas",
            "range": "Rango:",
            "cm": "cm",
            "steps_unit": "escalones"
        },
        "reviews": {
            "title": "Reseñas de Clientes",
            "write_review": "Escribir Reseña",
            "your_name": "Tu Nombre",
            "your_review": "Tu Reseña",
            "rating": "Calificación",
            "submit_review": "Enviar Reseña",
            "no_reviews": "Aún no hay reseñas. ¡Sé el primero en reseñar este producto!",
            "average_rating": "Calificación Promedio",
            "reviews_count": "reseñas",
            "review_success": "¡Reseña enviada exitosamente!",
            "review_error": "Por favor completa todos los campos y selecciona una calificación"
        },
        "admin": {
            "login": "Inicio Administrador",
            "username": "Usuario:",
            "password": "Contraseña:",
            "close": "Cerrar",
            "dashboard": "Panel Administrador",
            "pricing_management": "Gestión de Precios",
            "orders": "Pedidos",
            "product_settings": "Configuración Productos",
            "logout": "Cerrar Sesión"
        },
        "about": {
            "page_title": "Acerca de Nosotros - Kits de Madera",
            "title": "Acerca de Kits de Madera",
            "subtitle": "Elaborando muebles personalizados de calidad desde 2020, dando vida a su visión con precisión y cuidado.",
            "our_story_title": "Nuestra Historia",
            "our_story_text": "Kits de Madera fue fundada con una misión simple: hacer que los muebles personalizados de alta calidad sean accesibles para todos. Creemos que cada hogar merece piezas hermosas y funcionales que estén construidas para durar. Nuestro viaje comenzó cuando nuestro fundador, apasionado por la carpintería y el diseño, vio la necesidad de soluciones de muebles personalizables que no comprometan la calidad ni arruinen el presupuesto.",
            "our_craft_title": "Nuestro Oficio",
            "our_craft_text": "Cada pieza que creamos está hecha a mano por artesanos expertos utilizando madera premium y técnicas probadas en el tiempo. Combinamos métodos tradicionales de carpintería con herramientas de precisión modernas para asegurar que cada artículo cumpla con nuestros estándares exigentes. Nuestro sistema de personalización le permite especificar dimensiones exactas, materiales y acabados para crear muebles que se adapten perfectamente a su espacio y estilo.",
            "sustainability_title": "Sostenibilidad",
            "sustainability_text": "Estamos comprometidos con la responsabilidad ambiental. Toda nuestra madera proviene de bosques sostenibles, y utilizamos acabados y adhesivos ecológicos. Nuestro enfoque de fabricación bajo pedido significa que solo creamos lo que se necesita, reduciendo el desperdicio. También nos asociamos con proveedores locales para minimizar nuestra huella de carbono y apoyar a nuestra comunidad.",
            "values_title": "Nuestros Valores",
            "quality_title": "Calidad",
            "quality_text": "Nunca comprometemos los materiales o la artesanía. Cada pieza está construida para durar generaciones.",
            "customization_title": "Personalización",
            "customization_text": "Sus muebles deben ser tan únicos como usted. Ofrecemos opciones de personalización ilimitadas.",
            "customer_service_title": "Servicio al Cliente",
            "customer_service_text": "Desde el diseño hasta la entrega, estamos con usted en cada paso para asegurar su completa satisfacción.",
            "sustainability_value_title": "Sostenibilidad",
            "sustainability_value_text": "Nos importa nuestro planeta y las generaciones futuras. Todas nuestras prácticas son ambientalmente conscientes.",
            "contact_title": "Póngase en Contacto",
            "contact_text": "¿Tiene preguntas sobre nuestros productos o necesita ayuda con su pedido? Nos encantaría escuchar de usted.",
            "email_label": "Email:",
            "phone_label": "Teléfono:",
            "address_label": "Dirección:",
            "address_text": "123 Rothschild Blvd, Tel Aviv, Israel"
        },
        "footer": {
            "copyright": "© 2024 Kits de Madera. Todos los derechos reservados."
        }
    }
};

class SimpleTranslationManager {
    constructor() {
        this.currentLanguage = 'en';
        this.translations = TRANSLATIONS;
        this.rtlLanguages = ['he', 'ar'];
        this.init();
    }

    init() {
        const savedLanguage = localStorage.getItem('selectedLanguage') || 'en';
        this.setLanguage(savedLanguage);
        this.setupLanguageSelector();
        console.log('Simple translation system initialized');
    }

    setupLanguageSelector() {
        const selector = document.getElementById('languageSelect');
        if (selector) {
            selector.value = this.currentLanguage;
            selector.addEventListener('change', (e) => {
                this.setLanguage(e.target.value);
            });
        }
    }

    setLanguage(language) {
        if (!this.translations[language]) {
            console.warn(`Language ${language} not available, falling back to English`);
            language = 'en';
        }

        this.currentLanguage = language;
        localStorage.setItem('selectedLanguage', language);
        
        document.documentElement.lang = language;
        
        if (this.rtlLanguages.includes(language)) {
            document.documentElement.dir = 'rtl';
            document.body.classList.add('rtl');
        } else {
            document.documentElement.dir = 'ltr';
            document.body.classList.remove('rtl');
        }

        this.translatePage();
        
        const selector = document.getElementById('languageSelect');
        if (selector) {
            selector.value = language;
        }
    }

    translatePage() {
        console.log('Translating page to:', this.currentLanguage);
        const elements = document.querySelectorAll('[data-translate]');
        console.log('Found elements to translate:', elements.length);
        
        elements.forEach(element => {
            const key = element.getAttribute('data-translate');
            const translation = this.getNestedTranslation(key);
            
            if (translation && translation !== key) {
                if (element.tagName === 'TITLE') {
                    document.title = translation;
                } else {
                    element.textContent = translation;
                }
                console.log(`Translated ${key} to: ${translation}`);
            } else {
                console.warn(`No translation found for key: ${key}`);
            }
        });
    }

    getNestedTranslation(key) {
        if (!key) return key;
        
        const keys = key.split('.');
        let translation = this.translations[this.currentLanguage];
        
        // Try current language first
        for (const k of keys) {
            if (translation && typeof translation === 'object' && k in translation) {
                translation = translation[k];
            } else {
                translation = null;
                break;
            }
        }
        
        if (translation) {
            return translation;
        }
        
        // Fallback to English
        let fallbackTranslation = this.translations['en'];
        for (const fk of keys) {
            if (fallbackTranslation && typeof fallbackTranslation === 'object' && fk in fallbackTranslation) {
                fallbackTranslation = fallbackTranslation[fk];
            } else {
                return key; // Return the key if no translation found
            }
        }
        
        return fallbackTranslation || key;
    }

    getLanguage() {
        return this.currentLanguage;
    }

    isRTL() {
        return this.rtlLanguages.includes(this.currentLanguage);
    }
}

// Initialize when DOM is ready
function initTranslations() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.translationManager = new SimpleTranslationManager();
        });
    } else {
        window.translationManager = new SimpleTranslationManager();
    }
}

// Initialize immediately
initTranslations();