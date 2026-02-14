
export interface Memory {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

export type Screen = 'welcome' | 'journey' | 'flower_result' | 'bouquet_result' | 'final' | 'upload_picture' | 'comic_result';
