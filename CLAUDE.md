# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## 프로젝트 구조

```
src/
├── app/
│   ├── layout.tsx          # 루트 레이아웃 (폰트, ThemeProvider, Toaster, AdSense)
│   ├── page.tsx            # 단일 페이지 → <EditorShell /> 렌더
│   └── globals.css
├── components/
│   ├── editor/             # 에디터 핵심 UI
│   │   ├── EditorShell.tsx         # 최상위 레이아웃 (DropZone ↔ Canvas/Overlay 분기)
│   │   ├── Canvas.tsx              # 이미지 미리보기 캔버스 (DPR 대응)
│   │   ├── DropZone.tsx            # 초기 업로드 화면 (드래그·파일·URL·붙여넣기)
│   │   ├── OptionsPanel.tsx        # 우측 옵션 패널 (activeTool 기반 분기)
│   │   ├── ToolTabs.tsx            # 상단 도구 탭
│   │   ├── StatusBar.tsx           # 하단 이미지 정보 표시
│   │   ├── ImportFromUrlDialog.tsx # URL 임포트 다이얼로그
│   │   └── ThemeToggle.tsx
│   ├── tools/              # 도구별 컴포넌트
│   │   ├── crop/
│   │   │   ├── CropOverlay.tsx     # 자르기 인터랙티브 오버레이
│   │   │   └── CropOptions.tsx     # 비율 프리셋, 좌표·크기 입력
│   │   ├── slice/
│   │   │   ├── SliceOverlay.tsx    # 격자 분할 오버레이
│   │   │   └── SliceOptions.tsx    # N×M 격자 설정, ZIP 다운로드
│   │   ├── resize/
│   │   │   └── ResizeOptions.tsx   # 픽셀·퍼센트 입력, 비율 잠금
│   │   ├── rotate/
│   │   │   ├── RotateOverlay.tsx   # 회전 미리보기 오버레이
│   │   │   └── RotateOptions.tsx   # 90° 버튼, 자유 각도, 반전
│   │   ├── SectionHeader.tsx       # 옵션 패널 섹션 제목 공용 컴포넌트
│   │   └── ToolFooter.tsx          # 적용·되돌리기 버튼 공용 컴포넌트
│   ├── layout/
│   │   ├── SiteHeader.tsx
│   │   └── SiteFooter.tsx
│   └── ui/                 # shadcn/ui 기반 공용 컴포넌트
├── hooks/
│   ├── useDropImage.ts     # 드래그 앤 드롭 이미지 로드
│   ├── usePasteImage.ts    # 클립보드 붙여넣기 이미지 로드
│   └── useFitSize.ts       # 컨테이너에 맞는 이미지 표시 크기 계산
├── lib/
│   ├── image/
│   │   ├── load.ts         # loadFile(), loadFromUrl(), decodeImage()
│   │   ├── crop.ts         # cropImage() — Canvas API
│   │   ├── slice.ts        # sliceImage() — JSZip 번들
│   │   ├── resize.ts       # resizeImage() — 최대 16384px
│   │   ├── rotate.ts       # rotateImage(), flipImage()
│   │   ├── export.ts       # downloadAs(), triggerDownload()
│   │   ├── formats.ts      # MIME·확장자·ExportFormat 정의, rasterizeMime()
│   │   ├── pdf.ts          # imageSrcToPdfBlob() — jsPDF dynamic import
│   │   └── zip.ts          # ZIP 생성 헬퍼
│   ├── presets/
│   │   └── crop-presets.ts # 비율·소셜미디어 프리셋 정의
│   └── utils.ts            # cn() 등 공용 유틸
├── store/
│   └── editor-store.ts     # 단일 Zustand 스토어
└── types/
    └── image.ts            # ImageAsset 등 공용 타입
```

## 개발 명령어

```bash
npm run dev      # 개발 서버 (http://localhost:3000), Turbopack 사용
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버 실행 (build 선행 필요)
npm run lint     # ESLint 검사
```

## 아키텍처 개요

Snippix는 **서버로 이미지를 전송하지 않는** 클라이언트 전용 이미지 편집기다. Next.js App Router를 사용하지만 실질적으로 SPA처럼 동작한다.

### 라우트 구조

- `src/app/page.tsx` → `<EditorShell />` 하나뿐인 페이지
- `src/app/layout.tsx` → 폰트, ThemeProvider, Toaster, AdSense 스크립트

### 상태 관리

`src/store/editor-store.ts`에 단일 Zustand 스토어가 있다.

- `status: "idle" | "loading" | "ready" | "error"` — 이미지 로드 여부 제어
- `activeTool: "crop" | "slice" | "resize" | "rotate" | null`
- `original`, `current`: `ImageAsset | null` — 원본/현재 이미지 (blob URL + 메타데이터)
- `commitEdit(asset)` — 각 도구가 편집 완료 시 호출; current를 교체하고 blob URL을 안전하게 revoke
- `revokeIfDifferent()` — blob URL 메모리 누수 방지; current ≠ original일 때만 revoke
- `TOOL_RESET` 상수 — 각 액션 후 도구별 임시 상태를 초기화하는 spread 값

### 이미지 처리 흐름

1. **로드**: `src/lib/image/load.ts` — `loadFile()`, `loadFromUrl()`, `decodeImage()` (CORS, MIME 검증 포함)
2. **처리**: `src/lib/image/` — `crop.ts`, `slice.ts`, `resize.ts`, `rotate.ts` (모두 Canvas API 사용)
3. **내보내기**: `src/lib/image/export.ts` — `downloadAs()` → raster blob 또는 PDF; `triggerDownload()` 5초 후 blob URL revoke
4. **SVG**: `rasterizeMime()` (`formats.ts`) — SVG는 Canvas 처리 전 `image/png`로 변환

### 도구별 컴포넌트

각 도구는 Options + Overlay 쌍으로 구성된다:

```
src/components/tools/
  crop/    → CropOverlay.tsx, CropOptions.tsx
  slice/   → SliceOverlay.tsx, SliceOptions.tsx
  resize/  → ResizeOptions.tsx  (Canvas 오버레이 없음, 메인 Canvas 재사용)
  rotate/  → RotateOverlay.tsx, RotateOptions.tsx
```

`EditorShell.tsx`가 `activeTool` 값에 따라 Overlay를 조건부 렌더링한다. Options는 항상 `OptionsPanel`에 마운트되어 있다.

### 주요 제약

- `resizeImage()`의 최대 크기는 16384px — `ResizeOptions.tsx`의 `clampDim()`이 입력 단계에서 이미 제한하므로, `resize.ts` 내부의 상한 체크 코드는 사실상 데드 코드다
- Slice ZIP 다운로드는 JSZip(`src/lib/image/slice.ts`) → `downloadBlob()` 경로를 사용
- PDF 내보내기는 jsPDF를 dynamic import로 지연 로드 (`src/lib/image/pdf.ts`)
- AdSense `<script>`는 Next.js `<Script>` 컴포넌트 대신 일반 `<script async>`로 삽입 — `<Script>`가 자동으로 추가하는 `data-nscript` 속성이 AdSense 경고를 유발하기 때문
