# APK Web Viewer

אתר סטטי (ללא שרת) שמפרק קובץ APK בתוך הדפדפן ומציג אותו – בלי אמולטור.

## מה הוא עושה
- פותח את ה-APK (ZIP) ומפענח את `AndroidManifest.xml` ואת `resources.arsc`.
- מציג שם חבילה, גרסה, אייקון, הרשאות ופעילויות.
- ממיר קבצי `res/layout/*.xml` ל-HTML/CSS ומציג אותם במסגרת טלפון (מחרוזות, צבעים, מידות ותמונות נפתרים מתוך המשאבים).
- מפענח קבצי `classes*.dex` ומציג רשימת מחלקות עם חיפוש.
- הכל רץ מקומית בדפדפן – הקובץ לא נשלח לשום מקום.

## הרצה (ניסיוני)
כפתור **▶ הרצה** מפעיל מפרש Dalvik שכתוב ב-JavaScript (`js/vm.js`) מעל מימוש חלקי של ספריות Java/Android (`js/lib.js`).
נתמכים: Activity, setContentView, findViewById, TextView/Button/EditText, android:onClick, Toast, Log, String/StringBuilder/Integer/Math, ArrayList/HashMap, חריגות ו-try/catch.
לא נתמכים: קוד native, Compose, Google Play Services, מצלמה/חיישנים, Intent בין מסכים, Fragments, float/double שמקורם בקבועים. שגיאה כמו "לא נתמך עדיין: X" מציינת בדיוק מה להוסיף ל-`lib.js`.

## הגבלות (חשוב)
זו **תצוגה סטטית**, לא הרצה. קוד האפליקציה (Dex) לא מורץ, ולכן אין לוגיקה, ניווט או נתונים דינמיים.
RelativeLayout / ConstraintLayout / FrameLayout מוצגים בקירוב (בעמודה). Drawables מסוג XML (shape, vector) לא מצוירים עדיין.

## פריסה
1. העלו את התיקייה למאגר חדש בענף `main`.
2. Settings → Pages → Source: **GitHub Actions**.
3. הכתובת תופיע לאחר ריצת ה-workflow.

להרצה מקומית: `python3 -m http.server` ואז פתחו `localhost:8000`.

## רעיונות להמשך
תצוגת Vector/Shape drawables, מיפוי Activity ל-Layout דרך ניתוח Dex, תמיכה ב-AAB, ו-ConstraintLayout מלא.
