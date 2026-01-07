# 📚 Library AI Recommendation System

Bu proje, AWS bulut altyapısı üzerinde çalışan, kullanıcıların kitap listelerini yönetebildiği ve Amazon Bedrock (AI) desteği ile kişiselleştirilmiş kitap tavsiyeleri alabildiği modern bir web uygulamasıdır.

## 🚀 Live Demo
**Application URL:** [https://d1d6cfn3r8jipr.cloudfront.net](https://d1d6cfn3r8jipr.cloudfront.net)

## 🏗️ Mimari Yapı (Architecture)
Proje tamamen **Serverless** (Sunucusuz) mimari üzerine inşa edilmiştir:
- **Frontend:** React (Vite) + Tailwind CSS
- **Hosting & Dağıtım:** AWS S3 & CloudFront (CDN)
- **Kimlik Doğrulama:** AWS Cognito User Pool
- **Backend API:** AWS API Gateway + AWS Lambda
- **Veritabanı:** Amazon DynamoDB
- **Yapay Zeka:** Amazon Bedrock (Titan/Claude modelleri)


## 🛠️ API Uç Noktaları (Endpoints)
- `GET /books`: Kütüphanedeki tüm kitapları listeler.
- `POST /recommendations`: Kullanıcı tercihlerine göre AI destekli tavsiye üretir.
- `POST /reading-lists`: Yeni bir okuma listesi oluşturur.

## 💻 Yerel Kurulum (Setup)
1. `git clone https://github.com/BerkSayin-0/library-recommendation-system.git`
2. `npm install`
3. `.env` dosyası oluşturun (VITE_AWS_REGION, VITE_API_URL vb. alanları ekleyin).
4. `npm run dev` ile başlatın.

## 👥 Katkıda Bulunanlar
- **Berk Sayın** - 

## 📄 Lisans
Bu proje MIT Lisansı ile lisanslanmıştır.
