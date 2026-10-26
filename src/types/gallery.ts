export interface IPhotoItem {
  id: string
  title: string
  date: string
  imageUrl: string
  caption: string
  story: string
  position?: [number, number, number]
  rotation?: [number, number, number]
}

export interface IGalleryState {
  photos: IPhotoItem[]
  selectedPhoto: IPhotoItem | null
  focusedPhotoIndex: number | null
  setSelectedPhoto: (photo: IPhotoItem | null) => void
  setFocusedPhotoIndex: (index: number | null) => void
  selectNextPhoto: () => void
  selectPrevPhoto: () => void
}
