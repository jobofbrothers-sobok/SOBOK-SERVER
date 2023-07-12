import { Router } from "express";
import { managerController } from "../controller";
import { body } from "express-validator";
import { auth } from "../middlewares";
import multer from "multer";

const router: Router = Router();
const tourUpload = multer({ dest: "uploads/manager/tour" });
const noticeUpload = multer({ dest: "uploads/manager/notice" });

// 점주 회원가입 승인
router.post("/grant/:id", auth, managerController.grantOwnerSignUp);

// 최고관리자 담당자(점주) 정보 개별 조회
router.get("/owner/:id", auth, managerController.getOwnerById);

// 최고관리자 담당자(점주) 정보 전체 조회
router.get("/owner", auth, managerController.getAllOwner);

// 최고관리자 스탬프 사용 신청 담당자 개별 조회
router.get("/stamp/:id", auth, managerController.getStampSignInRequest);

// 최고관리자 스탬프 사용 신청 승인
router.post("/stamp/:id", auth, managerController.stampSignInGrant);

// 최고관리자 스탬프 사용 신청 담당자 전체 조회
router.get("/stamp", auth, managerController.getAllStampSignInRequest);

// 최고관리자 고객 정보 개별 조회
router.get("/client/:id", auth, managerController.getCustomerById);

// 최고관리자 고객 정보 전체 조회
router.get("/client", auth, managerController.getAllCustomer);

// 최고관리자 배송신청 리스트 개별 조회
router.get("/delivery/:id", auth, managerController.getDeliveryRequestById);

// 최고관리자 배송신청 리스트 전체 조회
router.get("/delivery", auth, managerController.getAllDeliveryRequest);

// 최고관리자 투어 추가 시 매장 검색
router.get("/tour/search", auth, managerController.getStoreByStoreName);

// 최고관리자 투어 추가
router.post(
  "/tour",
  auth,
  tourUpload.single("file"),
  [
    body("keyword").trim().notEmpty(),
    body("title").trim().notEmpty(),
    body("reward").trim().notEmpty(),
    body("cafeList").isLength({ min: 1 }),
  ],
  managerController.createTour
);

// 최고관리자 스탬프 정보 조회 (스템프 정보 리스트 조회)
router.get("/tour", auth, managerController.getAllTour);

// // 최고관리자 회원가입
// router.post("/signup", managerController.managerSignup);

// // 최고관리자 로그인
// router.post("/signin", managerController.managerSignin);

// 최고관리자 소복 매니저 신청 리스트 개별 조회
router.get("/alim/:id", auth, managerController.getAlimRequestById);

// 최고관리자 소복 매니저 신청 리스트 전체 조회
router.get("/alim", auth, managerController.getAllAlimRequest);

// 최고관리자 소복 매니저 문자 일괄전송
router.get("/message", auth, managerController.sendMessage);

// 최고관리자 공지글 작성
router.post(
  "/",
  auth,
  noticeUpload.single("file"),
  managerController.createNotice
);

export default router;
