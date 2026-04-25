export interface RatioPreset {
  id: string;
  label: string;
  aspect: number | undefined;
}

export const RATIO_PRESETS: RatioPreset[] = [
  { id: "free", label: "자유", aspect: undefined },
  { id: "1:1", label: "1:1", aspect: 1 },
  { id: "4:3", label: "4:3", aspect: 4 / 3 },
  { id: "3:4", label: "3:4", aspect: 3 / 4 },
  { id: "16:9", label: "16:9", aspect: 16 / 9 },
  { id: "9:16", label: "9:16", aspect: 9 / 16 },
  { id: "21:9", label: "21:9", aspect: 21 / 9 },
];

export interface SizePreset {
  id: string;
  label: string;
  width: number;
  height: number;
}

export const SIZE_PRESETS: SizePreset[] = [
  { id: "instagram-square", label: "Instagram 정사각형", width: 1080, height: 1080 },
  { id: "instagram-story", label: "Instagram 스토리/릴스", width: 1080, height: 1920 },
  { id: "youtube-thumb", label: "YouTube 썸네일", width: 1280, height: 720 },
  { id: "naver-blog", label: "네이버 블로그 (가로 966)", width: 966, height: 540 },
  { id: "facebook-cover", label: "Facebook 커버", width: 1640, height: 624 },
  { id: "x-header", label: "X 헤더", width: 1500, height: 500 },
];
