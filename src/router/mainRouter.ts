import { Router } from "express";
import { mainController } from "../controller";
import { body } from "express-validator";
import { auth } from "../middlewares";
import multer from "multer";

const router: Router = Router();
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}_${file.originalname}`);
    },
  }),
});

// 유저 근처 카페 개별 업체 정보 조회
router.get("/store/info/:storeId", mainController.getCafeById);

// 유저 근처 카페 개별 업체 소식 조회
router.get("/store/notice/:storeId", mainController.getCafeNoticeById);

// 유저 근처 카페 개별 업체 메뉴 조회
router.get("/store/menu/:storeId", mainController.getCafeMenuById);

// 유저 근처 카페 개별 업체 피드 조회
router.get("/store/review/:storeId", mainController.getCafeReviewById);

// 유저 근처 카페 개별 업체 피드 작성
router.post(
  "/store/review/:storeId",
  auth,
  upload.single("file"),
  [body("title").trim().notEmpty(), body("content").trim().notEmpty()],
  mainController.createCafeReviewById
);

// 소복 스토어 상품 조회
router.get("/store/products", mainController.getCafeStoreProducts);

// 점주 유저 근처 카페 전체 조회 - GET ~/main/store/owner
router.post("/store/owner", auth, mainController.getAllCafeForOwner);

// 카페 찜하기
router.post("/store/:storeId", auth, mainController.createLikeCafe);

// 카페 찜 해제하기
router.delete("/store/:storeId", auth, mainController.deleteLikeCafe);

// 고객, 최고관리자 유저 근처 카페 전체 조회 - GET ~/main/store
router.post("/store", auth, mainController.getAllCafe);

// 고객 유저 마이페이지 조회
router.post("/mypage", auth, mainController.getCustomerMyPage);

// 최고관리자 | 개별 업체 소식 삭제
router.delete(
  "/store/notice/:noticeId",
  auth,
  mainController.deleteCafeNoticeById
);

// 최고관리자 | 개별 업체 메뉴 삭제
router.delete("/store/menu/:menuId", auth, mainController.deleteCafeMenuById);

// 최고관리자 | 개별 업체 피드 삭제
router.delete(
  "/store/review/:reviewId",
  auth,
  mainController.deleteCafeReviewById
);

// 최고관리자 | 스토어 상품 삭제
router.delete(
  "/store/products/:productId",
  auth,
  mainController.deleteCafeProductById
);

// 전체 카페 소식 모아보기
router.get("/notice/all", mainController.getAllCafeNotice);

// 찜한 카페 소식 모아보기
router.get("/notice/like", auth, mainController.getAllLikeCafeNotice);

// 공지사항 개별 조회
router.get("/notice/:noticeId", mainController.findNoticeById);

// 공지사항 전체 조회
router.get("/notice", mainController.getAllNotice);

// 문의사항 작성
router.post(
  "/inquiry",
  auth,
  [body("title").trim().notEmpty(), body("content").trim().notEmpty()],
  mainController.createInquiry
);

// 카페 검색
router.post("/", auth, mainController.getCafeByKeyword);

export default router;
