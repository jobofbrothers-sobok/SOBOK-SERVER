import { Router } from "express";
import { managerController } from "../controller";
import { body } from "express-validator";
import { auth } from "../middlewares";

const router: Router = Router();

// 최고관리자 회원가입
router.post("/signup", managerController.managerSignup);

// 최고관리자 로그인
router.post("/signin", managerController.managerSignin);

// // 최고관리자 로그아웃
// router.post("/logout", managerController.managerLogout);

// 점주 회원가입 승인
router.post("/grant/:id", auth, managerController.grantOwnerSignUp);

// 최고관리자 담당자(점주) 정보 개별 조회
router.get("/owner/:id", auth, managerController.getOwnerById);

// 최고관리자 담당자(점주) 정보 전체 조회
router.get("/owner", auth, managerController.getAllOwner);

// 최고관리자 고객 정보 개별 조회
router.get("/customer/:id", auth, managerController.getCustomerById);

// 최고관리자 고객 정보 전체 조회
router.get("/customer", auth, managerController.getAllCustomer);

// 매장정보를 투어에 추가
router.post("/tour/store", auth, managerController.createTourIdForStore);

// 최고관리자 투어 추가
router.post(
  "/tour",
  auth,
  [
    body("keyword").trim().notEmpty(),
    body("title").trim().notEmpty(),
    body("reward").trim().notEmpty(),
  ],
  managerController.createTour
);

// 최고관리자 스탬프 정보 조회 (스템프 정보 리스트 조회)
router.get("/tour", auth, managerController.getAllTour);

// 최고관리자 배송신청 리스트 개별 조회
router.get("/delivery/:id", auth, managerController.getDeliveryRequestById);

// 최고관리자 배송신청 리스트 전체 조회
router.get("/delivery", auth, managerController.getAllDeliveryRequest);

export default router;
