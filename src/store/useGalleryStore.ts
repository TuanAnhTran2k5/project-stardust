import { create } from 'zustand'
import type { IGalleryState, IPhotoItem } from '@/types/gallery'
import { INITIAL_GALLERY_PHOTOS } from '@/constants/galleryData'
import { soundEngine } from '@/utils/soundEffects'

export const useGalleryStore = create<IGalleryState>((set, get) => ({
  photos: INITIAL_GALLERY_PHOTOS,
  selectedPhoto: null,
  focusedPhotoIndex: null,

  setSelectedPhoto: (photo: IPhotoItem | null) => {
    if (photo) {
      soundEngine.playSparkle()
      const index = get().photos.findIndex((p) => p.id === photo.id)
      set({ selectedPhoto: photo, focusedPhotoIndex: index >= 0 ? index : null })
    } else {
      soundEngine.playClick()
      set({ selectedPhoto: null, focusedPhotoIndex: null })
    }
  },

  setFocusedPhotoIndex: (index: number | null) => {
    set({ focusedPhotoIndex: index })
  },

  selectNextPhoto: () => {
    const { photos, focusedPhotoIndex } = get()
    if (photos.length === 0) return
    const nextIndex =
      focusedPhotoIndex === null || focusedPhotoIndex >= photos.length - 1
        ? 0
        : focusedPhotoIndex + 1
    soundEngine.playSparkle()
    set({
      focusedPhotoIndex: nextIndex,
      selectedPhoto: photos[nextIndex],
    })
  },

  selectPrevPhoto: () => {
    const { photos, focusedPhotoIndex } = get()
    if (photos.length === 0) return
    const prevIndex =
      focusedPhotoIndex === null || focusedPhotoIndex <= 0
        ? photos.length - 1
        : focusedPhotoIndex - 1
    soundEngine.playSparkle()
    set({
      focusedPhotoIndex: prevIndex,
      selectedPhoto: photos[prevIndex],
    })
  },
}))
