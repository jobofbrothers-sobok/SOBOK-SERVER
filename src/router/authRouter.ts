import { Router } from "express";
import { authController } from "../controller";
import { body } from "express-validator";
import { auth } from "../middlewares";
import multer from "multer";

const router: Router = Router();
const customerUpload = multer({ dest: "uploads/customer/" });
const ownerUpload = multer({ dest: "uploads/owner/" });

// 고객 유저 회원가입
router.post(
  "/signup/customer",
  [
    body("loginId").trim().notEmpty(),
    body("password").trim().notEmpty(),
    body("name").trim().notEmpty(),
    body("email").trim().notEmpty(),
    body("phone").trim().notEmpty(),
  ],
  authController.createCustomer
);

// 점주 유저 회원가입
router.post(
  "/signup/owner",
  // [
  //   body("loginId").notEmpty(),
  //   body("password").notEmpty(),
  //   body("store").notEmpty(),
  //   body("director").notEmpty(),
  //   body("phone").notEmpty(),
  //   body("email").notEmpty(),
  //   body("address").notEmpty(),
  //   body("licenseNumber").notEmpty(),
  // ],
  ownerUpload.single("file"),
  authController.createOwner
);

// 고객 유저 회원정보 수정
router.post(
  "/update/customer",
  auth,
  customerUpload.single("file"),
  [
    body("password").trim().notEmpty(),
    body("email").trim().notEmpty(),
    body("phone").trim().notEmpty(),
  ],
  authController.customerUpdate
);

// 점주 유저 회원정보 수정
router.post(
  "/update/owner",
  auth,
  ownerUpload.fields([{ name: "file1" }, { name: "file2" }]),
  // [
  //   body("password").trim().notEmpty(),
  //   body("director").trim().notEmpty(),
  //   body("phone").trim().notEmpty(),
  //   body("email").trim().notEmpty(),
  //   body("address").trim().notEmpty(),
  //   body("detailAddress").trim().notEmpty(),
  //   body("licenseNumber").trim().notEmpty(),
  //   body("licenseImage").trim().notEmpty(),
  // ],
  authController.ownerUpdate
);

// 고객 유저 로그인
router.post("/signin/customer", authController.customerSignIn);

// 점주 유저 로그인
router.post("/signin/owner", authController.ownerSignIn);

// // 고객 유저 로그아웃
// router.get("/signout/customer", auth, authController.customerSignOut);

// 고객 유저 회원정보 찾기 및 비밀번호 재설정
router.post("/find/customer", authController.findCustomerByEmail);

// 점주 유저 회원정보 찾기 및 비밀번호 재설정
router.post("/find/owner", authController.findOwnerByEmail);

// 점주 유저 회원정보 찾기

// 고객 유저 회원탈퇴
router.delete("/customer", auth, authController.customerDelete);

// 점주 유저 회원탈퇴
router.delete("/owner", auth, authController.ownerDelete);

export default router;
