# Five Jars — Household Ledger

가족 가계부 앱. React + TypeScript + Vite 웹앱을 Capacitor로 iOS/Android 네이티브 앱으로 빌드합니다.

---

## 개발 환경

```bash
npm install
npm run dev          # 개발 서버 (localhost:8080)
npm run build        # 프로덕션 웹 빌드
npm run test         # 테스트 실행
npm run lint         # ESLint
```

---

## 모바일 빌드

### 전제 조건

| 플랫폼 | 필요 도구 |
|--------|-----------|
| iOS | Xcode 14+, Apple Developer 계정 |
| Android | Android Studio, JDK 17+, Android SDK 34+ |

### 빌드 스크립트

```bash
npm run build:ios       # vite build → cap sync → Xcode 열기
npm run build:android   # vite build → cap sync → Android Studio 열기
npm run build:all       # 위 두 개 순서대로 실행
npm run mobile:sync     # vite build → cap sync (IDE 열지 않음)
```

---

## Android 배포

### 1. Keystore 생성 (최초 1회)

```bash
keytool -genkey -v \
  -keystore fivejars-release.keystore \
  -alias fivejars \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

프롬프트에서 입력:
- 키스토어 비밀번호 (기억할 것)
- 이름, 조직, 국가 등 식별 정보
- 키 비밀번호 (키스토어 비밀번호와 같아도 됨)

> **주의:** `fivejars-release.keystore` 파일과 비밀번호는 분실 시 복구 불가. `.gitignore`에 추가해야 합니다.

```bash
echo "*.keystore" >> .gitignore
echo "*.jks" >> .gitignore
```

### 2. Keystore를 Android 프로젝트에 연결

`android/app/` 디렉토리에 keystore 파일을 복사한 뒤 `android/app/build.gradle`의 `android` 블록 안에 추가:

```groovy
android {
    ...
    signingConfigs {
        release {
            storeFile file("fivejars-release.keystore")
            storePassword "YOUR_STORE_PASSWORD"
            keyAlias "fivejars"
            keyPassword "YOUR_KEY_PASSWORD"
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
        }
    }
}
```

비밀번호를 코드에 직접 쓰지 않으려면 `local.properties`를 사용합니다:

```properties
# android/local.properties (gitignore 처리)
STORE_PASSWORD=your_store_password
KEY_PASSWORD=your_key_password
```

```groovy
// build.gradle에서 읽기
def localProps = new Properties()
localProps.load(new FileInputStream(rootProject.file("local.properties")))

signingConfigs {
    release {
        storePassword localProps["STORE_PASSWORD"]
        keyPassword   localProps["KEY_PASSWORD"]
    }
}
```

### 3. AAB (Android App Bundle) 빌드

**Android Studio에서:**

1. `npm run build:android` 으로 Android Studio 열기
2. 메뉴: **Build → Generate Signed Bundle / APK**
3. **Android App Bundle** 선택
4. Keystore 경로와 비밀번호 입력
5. **release** 빌드 변형 선택
6. 완료 → `android/app/release/app-release.aab`

**CLI에서 (Android Studio 없이):**

```bash
cd android
./gradlew bundleRelease
# 결과: android/app/build/outputs/bundle/release/app-release.aab
```

### 4. Google Play Console 업로드

1. [play.google.com/console](https://play.google.com/console) 접속
2. 앱 선택 → **프로덕션** (또는 내부 테스트) → **새 릴리스 만들기**
3. `app-release.aab` 업로드

---

## iOS 배포

### 1. Xcode 서명 설정

1. `npm run build:ios` 으로 Xcode 열기
2. `App` 타겟 → **Signing & Capabilities**
3. Team 선택 (Apple Developer 계정)
4. Bundle Identifier: `com.homehearth.ledger`

### 2. Archive & 업로드

```
Product → Archive → Distribute App → App Store Connect
```

또는 CLI (Xcode Command Line Tools):

```bash
xcodebuild -workspace ios/App/App.xcworkspace \
  -scheme App \
  -configuration Release \
  -archivePath build/FiveJars.xcarchive \
  archive

xcodebuild -exportArchive \
  -archivePath build/FiveJars.xcarchive \
  -exportOptionsPlist ExportOptions.plist \
  -exportPath build/
```

---

## 아이콘 & 스플래시 스크린

```bash
npm install @capacitor/assets --save-dev

# 소스 이미지 준비
mkdir -p resources
# resources/icon.png        1024×1024px (투명 배경 없음)
# resources/splash.png      2732×2732px (중앙 로고)
# resources/splash-dark.png (선택) 다크 모드용

# iOS + Android 전체 사이즈 자동 생성
npx capacitor-assets generate
```

---

## 프로젝트 구조

```
src/
├── pages/        # 라우트 페이지 (Dashboard, History, Budget, Charts, Settings, Members)
├── components/   # 공통 컴포넌트 + shadcn/ui
├── hooks/        # useTransactions, useBudgets, useMembers, useJars, useCurrency
├── lib/          # db.ts (IndexedDB), utils.ts
├── types/        # Transaction, Budget, JarBalance, FamilyMember
└── i18n/         # 다국어 (en, ja, ko)
ios/              # Xcode 프로젝트
android/          # Android Studio 프로젝트
```
