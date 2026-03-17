export type RegionStatus =
  | 'empty'
  | 'recognized'
  | 'translated'
  | 'reviewed'
  | 'embedded'
  | 'error';

export type ViewMode = 'original' | 'translated' | 'compare';

export interface ComicRegion {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  status: RegionStatus;
  sourceText: string;
  translatedText: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  color: string;
}

export interface ComicPage {
  id: string;
  name: string;
  src: string;
  width: number;
  height: number;
  regions: ComicRegion[];
}
