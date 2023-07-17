import { CreateStoreReviewDTO } from "./../interfaces/store/createStoreReviewDTO";
import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { rm, sc } from "../constants";
import { fail, success } from "../constants/response";
import jwtHandler from "../modules/jwtHandler";
import { mainService } from "../service";
import axios from "axios";

// 카페 검색
const getCafeByKeyword = async (req: Request, res: Response) => {
  const keyword = req.body.keyword;
  if (req.user) {
    const customerId = req.user.id;
    return customerId;
  }
  if (!keyword) {
    return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.NULL_VALUE));
  }
  try {
    const data = await mainService.getCafeByKeyword(keyword);
    if (!data) {
      return res
        .status(sc.BAD_REQUEST)
        .send(fail(sc.BAD_REQUEST, rm.SEARCH_CAFE_BY_KEYWORD_FAIL));
    }
    return res
      .status(sc.OK)
      .send(success(sc.OK, rm.SEARCH_CAFE_BY_KEYWORD_SUCCESS, data));
  } catch (error) {
    console.log(error);
    res
      .status(sc.INTERNAL_SERVER_ERROR)
      .send(fail(sc.INTERNAL_SERVER_ERROR, rm.INTERNAL_SERVER_ERROR));
  }
};

// 카페 찜하기
const createLikeCafe = async (req: Request, res: Response) => {
  const storeId = req.params.storeId;
  const customerId = req.user.id;
  try {
    if (!storeId) {
      return res
        .status(sc.BAD_REQUEST)
        .send(fail(sc.BAD_REQUEST, rm.NULL_VALUE));
    }
    const data = await mainService.createLikeCafe(+storeId, customerId);
    if (!data) {
      return res
        .status(sc.BAD_REQUEST)
        .send(fail(sc.BAD_REQUEST, rm.CREATE_LIKE_CAFE_FAIL));
    }
    return res
      .status(sc.OK)
      .send(success(sc.OK, rm.CREATE_LIKE_CAFE_SUCCESS, data));
  } catch (error) {
    console.log(error);
    res
      .status(sc.INTERNAL_SERVER_ERROR)
      .send(fail(sc.INTERNAL_SERVER_ERROR, rm.INTERNAL_SERVER_ERROR));
  }
};

// 카페 찜 해제하기
const deleteLikeCafe = async (req: Request, res: Response) => {
  const storeId = req.params.storeId;
  const customerId = req.user.id;
  try {
    if (!storeId) {
      return res
        .status(sc.BAD_REQUEST)
        .send(fail(sc.BAD_REQUEST, rm.NULL_VALUE));
    }
    const data = await mainService.deleteLikeCafe(+storeId, customerId);
    if (!data) {
      return res
        .status(sc.BAD_REQUEST)
        .send(fail(sc.BAD_REQUEST, rm.DELETE_LIKE_CAFE_FAIL));
    }
    return res
      .status(sc.OK)
      .send(success(sc.OK, rm.DELETE_LIKE_CAFE_SUCCESS, data));
  } catch (error) {
    console.log(error);
    res
      .status(sc.INTERNAL_SERVER_ERROR)
      .send(fail(sc.INTERNAL_SERVER_ERROR, rm.INTERNAL_SERVER_ERROR));
  }
};

// 유저 근처 카페 전체 조회
const getAllCafe = async (req: Request, res: Response) => {
  console.log("req.body.id: ", req.body.id);
  console.log("req.user: ", req.user);
  // 유저 현위치 x, y 좌표
  const x = req.body.x;
  const y = req.body.y;
  const category = req.body.category;
  if (!x || !y || !category) {
    console.log("null value");
    return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.NULL_VALUE));
  }
  let customerId;
  if (req.user === undefined) {
    console.log("req user is undefined");
    customerId = 77777;
  }
  if (req.user) {
    console.log("req user exists");
    customerId = req.user.id;
  }

  try {
    console.log("customerId: ", customerId);
    const data = await mainService.getAllCafe(customerId, x, y, category);
    if (!data) {
      console.log("bad request");
      return res
        .status(sc.BAD_REQUEST)
        .send(fail(sc.BAD_REQUEST, rm.GET_ALL_NEAR_CAFE_FAIL));
    } else {
      return res
        .status(sc.OK)
        .send(success(sc.OK, rm.GET_ALL_NEAR_CAFE_SUCCESS, data));
    }
  } catch (error) {
    console.log(error);
    res
      .status(sc.INTERNAL_SERVER_ERROR)
      .send(fail(sc.INTERNAL_SERVER_ERROR, rm.INTERNAL_SERVER_ERROR));
  }
};

// 유저 근처 카페 개별 업체 정보 조회
const getCafeById = async (req: Request, res: Response) => {
  const storeId = req.params.storeId;
  if (!storeId) {
    return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.NULL_VALUE));
  }
  try {
    const data = await mainService.getCafeById(+storeId);
    if (!data) {
      return res
        .status(sc.BAD_REQUEST)
        .send(fail(sc.BAD_REQUEST, rm.GET_NEAR_CAFE_FAIL));
    }
    return res
      .status(sc.OK)
      .send(success(sc.OK, rm.GET_NEAR_CAFE_SUCCESS, data));
  } catch (error) {
    console.log(error);
    res
      .status(sc.INTERNAL_SERVER_ERROR)
      .send(fail(sc.INTERNAL_SERVER_ERROR, rm.INTERNAL_SERVER_ERROR));
  }
};

const queryType = {
  ALL: "all",
  MENU: "menu",
  SALE: "sale",
};

// 유저 근처 카페 개별 업체 소식 조회
const getCafeNoticeById = async (req: Request, res: Response) => {
  const id = req.params.storeId;
  const query = req.query.query as string;

  if (!id || !query) {
    return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.NULL_VALUE));
  }
  if (
    query !== queryType.ALL &&
    query !== queryType.MENU &&
    query !== queryType.SALE
  ) {
    return res
      .status(sc.BAD_REQUEST)
      .send(fail(sc.BAD_REQUEST, rm.BAD_REQUEST));
  }
  try {
    const data = await mainService.getCafeNoticeById(+id, query);
    if (!data || data.length === 0) {
      return res
        .status(sc.BAD_REQUEST)
        .send(fail(sc.BAD_REQUEST, rm.GET_CAFE_NOTICE_FAIL));
    }
    return res
      .status(sc.OK)
      .send(success(sc.OK, rm.GET_CAFE_NOTICE_SUCCESS, data));
  } catch (error) {
    console.log(error);
    res
      .status(sc.INTERNAL_SERVER_ERROR)
      .send(fail(sc.INTERNAL_SERVER_ERROR, rm.INTERNAL_SERVER_ERROR));
  }
};

// 유저 근처 카페 개별 업체 메뉴 조회
const getCafeMenuById = async (req: Request, res: Response) => {
  const id = req.params.storeId;
  if (!id) {
    return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.NULL_VALUE));
  }
  try {
    const data = await mainService.getCafeMenuById(+id);
    if (!data) {
      return res
        .status(sc.BAD_REQUEST)
        .send(fail(sc.BAD_REQUEST, rm.GET_CAFE_MENU_FAIL));
    }
    return res
      .status(sc.OK)
      .send(success(sc.OK, rm.GET_CAFE_MENU_SUCCESS, data));
  } catch (error) {
    console.log(error);
    res
      .status(sc.INTERNAL_SERVER_ERROR)
      .send(fail(sc.INTERNAL_SERVER_ERROR, rm.INTERNAL_SERVER_ERROR));
  }
};

// 유저 근처 카페 개별 업체 피드 조회
const getCafeReviewById = async (req: Request, res: Response) => {
  const storeId = req.params.storeId;
  if (!storeId) {
    return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.NULL_VALUE));
  }
  try {
    const data = await mainService.getCafeReviewById(+storeId);
    if (!data || data.length === 0) {
      return res
        .status(sc.BAD_REQUEST)
        .send(fail(sc.BAD_REQUEST, rm.GET_CAFE_REVIEW_FAIL));
    }
    return res
      .status(sc.OK)
      .send(success(sc.OK, rm.GET_CAFE_REVIEW_SUCCESS, data));
  } catch (error) {
    console.log(error);
    res
      .status(sc.INTERNAL_SERVER_ERROR)
      .send(fail(sc.INTERNAL_SERVER_ERROR, rm.INTERNAL_SERVER_ERROR));
  }
};

// 유저 근처 카페 개별 업체 피드 작성
const createCafeReviewById = async (req: Request, res: Response) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res
      .status(sc.BAD_REQUEST)
      .send(fail(sc.BAD_REQUEST, rm.BAD_REQUEST));
  }
  const writerId = req.user.id;
  const storeId = req.params.storeId;
  const createStoreReviewDTO: CreateStoreReviewDTO = req.body;
  if (!storeId) {
    return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.NULL_VALUE));
  }

  const image: Express.Multer.File = req.file as Express.Multer.File;
  const path = image.path;

  // 현시각보다 9시간 느려서 가산
  const now = new Date().getTime() + 1 * 60 * 60 * 9 * 1000;
  const date = new Date(now);

  try {
    const data = await mainService.createCafeReviewById(
      writerId,
      +storeId,
      createStoreReviewDTO,
      path,
      date
    );
    if (!data) {
      return res
        .status(sc.BAD_REQUEST)
        .send(fail(sc.BAD_REQUEST, rm.CREATE_CAFE_REVIEW_FAIL));
    }
    return res
      .status(sc.OK)
      .send(success(sc.OK, rm.CREATE_CAFE_REVIEW_SUCCESS, data));
  } catch (error) {
    console.log(error);
    res
      .status(sc.INTERNAL_SERVER_ERROR)
      .send(fail(sc.INTERNAL_SERVER_ERROR, rm.INTERNAL_SERVER_ERROR));
  }
};

// 전체 카페 소식 모아보기
const getAllCafeNotice = async (req: Request, res: Response) => {
  const query = req.query.query as string;
  if (!query) {
    return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.NULL_VALUE));
  }
  if (
    query !== queryType.ALL &&
    query !== queryType.MENU &&
    query !== queryType.SALE
  ) {
    return res
      .status(sc.BAD_REQUEST)
      .send(fail(sc.BAD_REQUEST, rm.BAD_REQUEST));
  }
  try {
    const data = await mainService.getAllCafeNotice(query);
    if (!data || data.length === 0) {
      return res
        .status(sc.BAD_REQUEST)
        .send(fail(sc.BAD_REQUEST, rm.GET_ALL_CAFE_NOTICE_FAIL));
    }
    return res
      .status(sc.OK)
      .send(success(sc.OK, rm.GET_ALL_CAFE_NOTICE_SUCCESS, data));
  } catch (error) {
    console.log(error);
    res
      .status(sc.INTERNAL_SERVER_ERROR)
      .send(fail(sc.INTERNAL_SERVER_ERROR, rm.INTERNAL_SERVER_ERROR));
  }
};

// 찜한 카페 소식 모아보기
const getAllLikeCafeNotice = async (req: Request, res: Response) => {
  const customerId = req.user.id;
  const query = req.query.query as string;
  if (!query) {
    return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.NULL_VALUE));
  }
  if (
    query !== queryType.ALL &&
    query !== queryType.MENU &&
    query !== queryType.SALE
  ) {
    return res
      .status(sc.BAD_REQUEST)
      .send(fail(sc.BAD_REQUEST, rm.BAD_REQUEST));
  }
  try {
    const data = await mainService.getAllLikeCafeNotice(query, +customerId);
    if (!data || data.length === 0) {
      return res
        .status(sc.BAD_REQUEST)
        .send(fail(sc.BAD_REQUEST, rm.GET_ALL_LIKE_CAFE_NOTICE_FAIL));
    }
    return res
      .status(sc.OK)
      .send(success(sc.OK, rm.GET_ALL_LIKE_CAFE_NOTICE_SUCCESS, data));
  } catch (error) {
    console.log(error);
    res
      .status(sc.INTERNAL_SERVER_ERROR)
      .send(fail(sc.INTERNAL_SERVER_ERROR, rm.INTERNAL_SERVER_ERROR));
  }
};

const sortType = {
  ALL: "all",
  COOKIE: "cookie",
  CAKE: "cake",
  BEAN: "bean",
};

// 소복 스토어 상품 조회
const getCafeStoreProducts = async (req: Request, res: Response) => {
  const sort = req.query.sort as string;

  if (!sort) {
    return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.NULL_VALUE));
  }

  if (
    sort !== sortType.ALL &&
    sort !== sortType.COOKIE &&
    sort !== sortType.CAKE &&
    sort !== sortType.BEAN
  ) {
    return res
      .status(sc.BAD_REQUEST)
      .send(fail(sc.BAD_REQUEST, rm.BAD_REQUEST));
  }

  try {
    const data = await mainService.getCafeStoreProducts(sort);
    if (!data) {
      return res
        .status(sc.BAD_REQUEST)
        .send(fail(sc.BAD_REQUEST, rm.GET_STORE_PRODUCTS_FAIL));
    }
    return res
      .status(sc.OK)
      .send(success(sc.OK, rm.GET_STORE_PRODUCTS_SUCCESS, data));
  } catch (error) {
    console.log(error);
    res
      .status(sc.INTERNAL_SERVER_ERROR)
      .send(fail(sc.INTERNAL_SERVER_ERROR, rm.INTERNAL_SERVER_ERROR));
  }
};

// 고객 마이페이지 조회
const getCustomerMyPage = async (req: Request, res: Response) => {
  const customerId = req.user.id;
  try {
    const data = await mainService.getCustomerMyPage(customerId);
    if (!data) {
      return res
        .status(sc.BAD_REQUEST)
        .send(fail(sc.BAD_REQUEST, rm.GET_CUSTOMER_MYPAGE_FAIL));
    }
    return res
      .status(sc.OK)
      .send(success(sc.OK, rm.GET_CUSTOMER_MYPAGE_SUCCESS, data));
  } catch (error) {
    console.log(error);
    res
      .status(sc.INTERNAL_SERVER_ERROR)
      .send(fail(sc.INTERNAL_SERVER_ERROR, rm.INTERNAL_SERVER_ERROR));
  }
};

// 카페 소식 삭제
const deleteCafeNoticeById = async (req: Request, res: Response) => {
  const noticeId = req.params.noticeId;
  if (!noticeId) {
    return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.NULL_VALUE));
  }
  try {
    const data = await mainService.deleteCafeNoticeById(+noticeId);
    if (!data) {
      return res
        .status(sc.BAD_REQUEST)
        .send(fail(sc.BAD_REQUEST, rm.DELETE_CAFE_NOTICE_FAIL));
    }
    return res
      .status(sc.OK)
      .send(success(sc.OK, rm.DELETE_CAFE_NOTICE_SUCCESS, data));
  } catch (error) {
    console.log(error);
    res
      .status(sc.INTERNAL_SERVER_ERROR)
      .send(fail(sc.INTERNAL_SERVER_ERROR, rm.INTERNAL_SERVER_ERROR));
  }
};

// 카페 메뉴 삭제
const deleteCafeMenuById = async (req: Request, res: Response) => {
  const menuId = req.params.menuId;
  if (!menuId) {
    return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.NULL_VALUE));
  }
  try {
    const data = await mainService.deleteCafeMenuById(+menuId);
    if (!data) {
      return res
        .status(sc.BAD_REQUEST)
        .send(fail(sc.BAD_REQUEST, rm.DELETE_CAFE_MENU_FAIL));
    }
    return res
      .status(sc.OK)
      .send(success(sc.OK, rm.DELETE_CAFE_MENU_SUCCESS, data));
  } catch (error) {
    console.log(error);
    res
      .status(sc.INTERNAL_SERVER_ERROR)
      .send(fail(sc.INTERNAL_SERVER_ERROR, rm.INTERNAL_SERVER_ERROR));
  }
};

// 카페 피드 삭제
const deleteCafeReviewById = async (req: Request, res: Response) => {
  const reviewId = req.params.reviewId;
  if (!reviewId) {
    return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.NULL_VALUE));
  }
  try {
    const data = await mainService.deleteCafeReviewById(+reviewId);
    if (!data) {
      return res
        .status(sc.BAD_REQUEST)
        .send(fail(sc.BAD_REQUEST, rm.DELETE_CAFE_REVIEW_FAIL));
    }
    return res
      .status(sc.OK)
      .send(success(sc.OK, rm.DELETE_CAFE_REVIEW_SUCCESS, data));
  } catch (error) {
    console.log(error);
    res
      .status(sc.INTERNAL_SERVER_ERROR)
      .send(fail(sc.INTERNAL_SERVER_ERROR, rm.INTERNAL_SERVER_ERROR));
  }
};

// 소복 스토어 상품 삭제
const deleteCafeProductById = async (req: Request, res: Response) => {
  try {
    const productId = req.params.productId;
    if (!productId) {
      return res
        .status(sc.BAD_REQUEST)
        .send(fail(sc.BAD_REQUEST, rm.NULL_VALUE));
    }
    const data = await mainService.deleteCafeProductById(+productId);
    if (!data) {
      return res
        .status(sc.BAD_REQUEST)
        .send(fail(sc.BAD_REQUEST, rm.DELETE_STORE_PRODUCTS_FAIL));
    }
    return res
      .status(sc.OK)
      .send(success(sc.OK, rm.DELETE_STORE_PRODUCTS_SUCCESS, data));
  } catch (error) {
    console.log(error);
    res
      .status(sc.INTERNAL_SERVER_ERROR)
      .send(fail(sc.INTERNAL_SERVER_ERROR, rm.INTERNAL_SERVER_ERROR));
  }
};

const mainController = {
  getCafeByKeyword,
  createLikeCafe,
  deleteLikeCafe,
  getAllCafe,
  getCafeById,
  getCafeNoticeById,
  getCafeMenuById,
  getCafeReviewById,
  createCafeReviewById,
  getAllCafeNotice,
  getAllLikeCafeNotice,
  getCafeStoreProducts,
  getCustomerMyPage,
  deleteCafeNoticeById,
  deleteCafeMenuById,
  deleteCafeReviewById,
  deleteCafeProductById,
};
export default mainController;
