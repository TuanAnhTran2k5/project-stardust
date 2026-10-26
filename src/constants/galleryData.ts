import type { IPhotoItem } from '@/types/gallery'

/**
 * =========================================================================
 * BỘ SƯU TẬP KỶ NIỆM: HẢI TRÌNH ONE PIECE & TÌNH YÊU VŨ TRỤ
 * =========================================================================
 * Bạn có thể dễ dàng thay thế:
 * - `imageUrl`: Đường dẫn ảnh online hoặc file trong `src/assets/images/...`
 * - `title`: Tên khoảnh khắc
 * - `date`: Ngày kỷ niệm
 * - `caption`: Lời tựa ngắn
 * - `story`: Bức tâm thư, lời nhắn yêu thương chi tiết
 * =========================================================================
 */
export const INITIAL_GALLERY_PHOTOS: IPhotoItem[] = [
  {
    id: 'op-photo-1',
    title: 'Người Yêu Tương Lai',
    date: '2026-10-20',
    imageUrl: '/images/characters/female_avatar.png',
    caption: 'Hiện tại em setlove vô cùng đáng iu trong game của tôi nè',
    story: 'Muốn có 1 ngày gần nhất em đủ tin tui và iu tui để công khai em với cả thới giờ quá. Chớ giờ muốn gọi ngắm em cũng khó chưa call được huhu',
  },
  {
    id: 'op-photo-2',
    title: 'Còn Đây Là Tui Nè!!',
    date: '2026-10-26',
    imageUrl: '/images/characters/avarta.png',
    caption: 'Đang cố gắn hơn khi có em',
    story: 'Tôi đang cố gắn trưởng thành hơn hiện tại. Vì giờ tui còn long bong chưa lo được cho ai hết huhu. Tui cũng sợ em chê tui nhỏ tuổi hơn em nữa chớ trong mắt tui em dễ thương lắm, một chúc ngây ngô nữa, tuy mới biết em gần đây mà tim tôi có cảm nhận khác với mấy cô gái khác lắm kiểu tình iu sét đánh vậy á, mặt dù tôi chưa thấy em trực tiếp chỉ mới biết em qua ảnh. Tôi còn sợ đến khi em chấp nhận tui mà tui chưa có gì trong tay để lo cho em quá hazz',
  },
  {
    id: 'op-photo-3',
    title: 'Lời thề Kiếm Sĩ & Ánh Trăng',
    date: '2024-07-07',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200&auto=format&fit=crop',
    caption: 'Lưỡi kiếm bảo vệ người anh yêu suốt đời suốt kiếp',
    story: 'Giống như Zoro kiên định với lời thề trở thành đệ nhất kiếm sĩ, tình cảm anh dành cho em trước sau như một, vững chãi như núi đá trước ngàn đợt sóng ngầm. Dù có lạc đường cả thế giới, anh vẫn luôn tìm được lối về bên em.',
  },
  {
    id: 'op-photo-4',
    title: 'Bản đồ Tình Yêu của Nami',
    date: '2024-08-18',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop',
    caption: 'Mọi hải đồ trên thế giới đều chỉ về tọa độ trái tim em',
    story: 'Nami vẽ bản đồ cả thế giới, còn anh chỉ vẽ riêng một bản đồ tình yêu dẫn lối về trái tim em. Nơi ấy có hương cam ngọt ngào, có bầu trời trong xanh và những tháng ngày bình yên nhất của hai ta.',
  },
  {
    id: 'op-photo-5',
    title: 'Bữa tiệc Ngọt Ngào của Sanji',
    date: '2024-09-22',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop',
    caption: 'Hương vị tình yêu nêm nếm bằng sự dịu dàng vô hạn',
    story: 'Một tách hồng trà ấm, một đĩa bánh ngọt ngào được chăm chút bằng tất cả tấm lòng. Anh muốn chăm sóc em từng bữa ăn, từng giấc ngủ, để em luôn là nàng tiểu thư hạnh phúc nhất trần đời.',
  },
  {
    id: 'op-photo-6',
    title: 'Cơn mưa Anh Đào Tuyết của Chopper',
    date: '2024-10-30',
    imageUrl: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?q=80&w=1200&auto=format&fit=crop',
    caption: 'Phép màu chữa lành mọi vết thương trong tâm hồn',
    story: 'Cơn mưa tuyết màu hồng của bác sĩ Hiluluk đã làm tan chảy cả vương quốc băng giá, cũng giống như sự xuất hiện của em đã chữa lành và thắp sáng mọi góc khuất cô đơn trong trái tim anh.',
  },
  {
    id: 'op-photo-7',
    title: 'Nụ cười Tự Do của Robin',
    date: '2024-12-24',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop',
    caption: 'Tôi muốn sống! Và muốn yêu em trọn vẹn cả kiếp này!',
    story: 'Khoảnh khắc Robin gào khóc xin được sống tại Enies Lobby là minh chứng cho sức mạnh của sự thấu hiểu và chở che. Anh cũng muốn nói với em rằng: Hãy luôn tin tưởng anh, vì anh sẽ không bao giờ buông tay em giữa biển đời bão táp.',
  },
  {
    id: 'op-photo-8',
    title: 'Dấu ấn Chữ X Bất Diệt',
    date: '2025-02-14',
    imageUrl: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=1200&auto=format&fit=crop',
    caption: 'Dù ở bất cứ đâu trên đại dương, chúng ta mãi thuộc về nhau',
    story: 'Hình ảnh cánh tay giơ cao với dấu ấn chữ X hướng về công chúa Vivi mãi là biểu tượng bất hủ của sự gắn kết tâm hồn. Dù mai này vũ trụ đổi dời, tình anh dành cho em vẫn vẹn nguyên như dấu ấn định mệnh ấy.',
  },
   
]
