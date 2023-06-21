import { CreateTourDTO } from "./../interfaces/manager/createTourDTO";
import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { rm, sc } from "../constants";
import { fail, success } from "../constants/response";
import jwtHandler from "../modules/jwtHandler";
import { ManagerCreateDTO } from "./../interfaces/user/managerCreateDTO";
import { UserSignInDTO } from "../interfaces/user/userSignInDTO";
import { managerService } from "../service";
import { CreateTourIdForStoreDTO } from "../interfaces/manager/createTourIdForStoreDTO";

// 최고관리자 회원가입
const managerSignup = async (req: Request, res: Response) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res
      .status(sc.BAD_REQUEST)
      .send(fail(sc.BAD_REQUEST, rm.BAD_REQUEST));
  }

  const managerCreateDTO: ManagerCreateDTO = req.body;

  try {
    const data = await managerService.managerSignup(managerCreateDTO);

    if (!data) {
      return res
        .status(sc.BAD_REQUEST)
        .send(fail(sc.BAD_REQUEST, rm.SIGNUP_FAIL));
    }

    // jwtHandler 내 sign 함수를 이용해 accessToken 생성
    const accessToken = jwtHandler.sign(data.id);

    const result = {
      userId: data.id,
      loginId: data.loginId,
      accessToken,
    };

    return res
      .status(sc.CREATED)
      .send(success(sc.CREATED, rm.SIGNUP_SUCCESS, result));
  } catch (error) {
    console.log(error);
    // 서버 내부에서 오류 발생
    res
      .status(sc.INTERNAL_SERVER_ERROR)
      .send(fail(sc.INTERNAL_SERVER_ERROR, rm.INTERNAL_SERVER_ERROR));
  }
};

// 최고관리자 로그인
const managerSignin = async (req: Request, res: Response) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res
      .status(sc.BAD_REQUEST)
      .send(fail(sc.BAD_REQUEST, rm.BAD_REQUEST));
  }

  const userSigninDTO: UserSignInDTO = req.body;

  try {
    const userId = await managerService.managerSignIn(userSigninDTO);

    if (!userId)
      return res.status(sc.NOT_FOUND).send(fail(sc.NOT_FOUND, rm.NOT_FOUND));
    else if (userId === sc.UNAUTHORIZED)
      return res
        .status(sc.UNAUTHORIZED)
        .send(fail(sc.UNAUTHORIZED, rm.INVALID_PASSWORD));

    const accessToken = jwtHandler.sign(userId);
    console.log(accessToken);
    const result = {
      userId: userId,
      accessToken,
    };

    res.status(sc.OK).send(success(sc.OK, rm.SIGNIN_SUCCESS, result));
  } catch (e) {
    console.log(error);
    // 서버 내부에서 오류 발생
    res
      .status(sc.INTERNAL_SERVER_ERROR)
      .send(fail(sc.INTERNAL_SERVER_ERROR, rm.INTERNAL_SERVER_ERROR));
  }
};

// // 최고관리자 로그아웃
// const managerLogout = async (req: Request, res: Response) => {
//   const managerId = req.user.id;
//   try {
//     const userId = await managerService.managerLogout(managerId);

//     // if (!userId)
//     //   return res.status(sc.NOT_FOUND).send(fail(sc.NOT_FOUND, rm.NOT_FOUND));
//     // else if (userId === sc.UNAUTHORIZED)
//     //   return res
//     //     .status(sc.UNAUTHORIZED)
//     //     .send(fail(sc.UNAUTHORIZED, rm.INVALID_PASSWORD));

//     // const accessToken = jwtHandler.sign(userId);
//     // console.log(accessToken);
//     // const result = {
//     //   userId: userId,
//     //   accessToken,
//     // };

//     res.status(sc.OK).send(success(sc.OK, rm.LOGOUT_SUCCESS, result));
//   } catch (e) {
//     console.log(e);
//     // 서버 내부에서 오류 발생
//     res
//       .status(sc.INTERNAL_SERVER_ERROR)
//       .send(fail(sc.INTERNAL_SERVER_ERROR, rm.INTERNAL_SERVER_ERROR));
//   }
// };

// 점주 회원가입 승인
const grantOwnerSignUp = async (req: Request, res: Response) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res
      .status(sc.BAD_REQUEST)
      .send(fail(sc.BAD_REQUEST, rm.BAD_REQUEST));
  }
  const { id } = req.params;

  try {
    const grantOwnerId = await managerService.grantOwnerSignUp(+id);

    return res
      .status(sc.OK)
      .send(
        success(sc.OK, rm.SIGNUP_GRANT_SUCCESS, { grantOwnerId: grantOwnerId })
      );
  } catch (error) {
    console.log(error);
    // 서버 내부에서 오류 발생
    res
      .status(sc.INTERNAL_SERVER_ERROR)
      .send(fail(sc.INTERNAL_SERVER_ERROR, rm.INTERNAL_SERVER_ERROR));
  }
};

const sortType = {
  ALL: "all",
  AUTH: "auth",
  NOT_AUTH: "pending",
};

// 최고관리자 담당자(점주) 정보 전체 조회
const getAllOwner = async (req: Request, res: Response) => {
  const sort = req.query.sort as string;
  if (!sort) {
    return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.NULL_VALUE));
  }
  if (
    sort !== sortType.ALL &&
    sort !== sortType.AUTH &&
    sort !== sortType.NOT_AUTH
  ) {
    return res
      .status(sc.BAD_REQUEST)
      .send(fail(sc.BAD_REQUEST, rm.BAD_REQUEST));
  }
  try {
    const data = await managerService.getAllOwner(sort);
    if (!data) {
      return res
        .status(sc.NOT_FOUND)
        .send(success(sc.NOT_FOUND, rm.GET_ALL_OWNER_FAIL, data));
    }

    if (data.length === 0 && data != null) {
      return res.status(sc.OK).send(success(sc.OK, rm.NO_OWNER_YET, data));
    }
    return res
      .status(sc.OK)
      .send(success(sc.OK, rm.GET_ALL_OWNER_SUCCESS, data));
  } catch (error) {
    console.log(error);
    return res
      .status(sc.INTERNAL_SERVER_ERROR)
      .send(fail(sc.INTERNAL_SERVER_ERROR, rm.INTERNAL_SERVER_ERROR));
  }
};

// 최고관리자 담당자(점주) 정보 개별 조회
const getOwnerById = async (req: Request, res: Response) => {
  const ownerId = req.params.id;
  if (!ownerId) {
    return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.NULL_VALUE));
  }
  try {
    const data = await managerService.getOwnerById(+ownerId);
    if (!data) {
      return res
        .status(sc.NOT_FOUND)
        .send(success(sc.NOT_FOUND, rm.GET_OWNER_FAIL, data));
    }
    return res.status(sc.OK).send(success(sc.OK, rm.GET_OWNER_SUCCESS, data));
  } catch (error) {
    console.log(error);
    return res
      .status(sc.INTERNAL_SERVER_ERROR)
      .send(fail(sc.INTERNAL_SERVER_ERROR, rm.INTERNAL_SERVER_ERROR));
  }
};

// 최고관리자 고객 정보 전체 조회
const getAllCustomer = async (req: Request, res: Response) => {
  try {
    const data = await managerService.getAllCustomer();
    if (!data) {
      return res
        .status(sc.NOT_FOUND)
        .send(success(sc.NOT_FOUND, rm.GET_ALL_CUSTOMER_FAIL, data));
    }
    return res
      .status(sc.OK)
      .send(success(sc.OK, rm.GET_ALL_CUSTOMER_SUCCESS, data));
  } catch (error) {
    console.log(error);
    return res
      .status(sc.INTERNAL_SERVER_ERROR)
      .send(fail(sc.INTERNAL_SERVER_ERROR, rm.INTERNAL_SERVER_ERROR));
  }
};

// 최고관리자 고객 정보 개별 조회
const getCustomerById = async (req: Request, res: Response) => {
  const customerId = req.params.id;
  if (!customerId) {
    return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.NULL_VALUE));
  }
  try {
    const data = await managerService.getCustomerById(+customerId);
    if (!data) {
      return res
        .status(sc.NOT_FOUND)
        .send(success(sc.NOT_FOUND, rm.GET_CUSTOMER_FAIL, data));
    }
    return res
      .status(sc.OK)
      .send(success(sc.OK, rm.GET_CUSTOMER_SUCCESS, data));
  } catch (error) {
    console.log(error);
    return res
      .status(sc.INTERNAL_SERVER_ERROR)
      .send(fail(sc.INTERNAL_SERVER_ERROR, rm.INTERNAL_SERVER_ERROR));
  }
};

// 최고관리자 투어 추가하기
const createTour = async (req: Request, res: Response) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res
      .status(sc.BAD_REQUEST)
      .send(fail(sc.BAD_REQUEST, rm.BAD_REQUEST));
  }

  const createTourDTO: CreateTourDTO = req.body;
  try {
    const createTour = await managerService.createTour(createTourDTO);
    return res
      .status(sc.OK)
      .send(success(sc.OK, rm.CREATE_TOUR_SUCCESS, createTour));
  } catch (error) {
    console.log(error);
    return res
      .status(sc.INTERNAL_SERVER_ERROR)
      .send(fail(sc.INTERNAL_SERVER_ERROR, rm.INTERNAL_SERVER_ERROR));
  }
};

// 매장정보를 투어에 추가
const createTourIdForStore = async (req: Request, res: Response) => {
  const createTourIdForStoreDTO: CreateTourIdForStoreDTO = req.body;
  const storeId = createTourIdForStoreDTO.storeId;
  const tourId = createTourIdForStoreDTO.tourId;

  if (!storeId || !tourId) {
    return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.NULL_VALUE));
  }

  try {
    const data = await managerService.createTourIdForStore(
      createTourIdForStoreDTO
    );
    return res
      .status(sc.NOT_FOUND)
      .send(success(sc.NOT_FOUND, rm.CREATE_TOURID_FOR_STORE_SUCCESS, data));
  } catch (error) {
    console.log(error);
    return res
      .status(sc.INTERNAL_SERVER_ERROR)
      .send(fail(sc.INTERNAL_SERVER_ERROR, rm.INTERNAL_SERVER_ERROR));
  }
};

// 최고관리자 배송신청 리스트 전체 조회
const getAllDeliveryRequest = async (req: Request, res: Response) => {
  try {
    const data = await managerService.getAllDeliveryRequest();
    if (!data || data.length === 0) {
      return res
        .status(sc.NOT_FOUND)
        .send(success(sc.NOT_FOUND, rm.GET_ALL_DELIVERY_REQUEST_FAIL, data));
    }
    return res
      .status(sc.OK)
      .send(success(sc.OK, rm.GET_ALL_DELIVERY_REQUEST_SUCCESS, data));
  } catch (error) {
    console.log(error);
    return res
      .status(sc.INTERNAL_SERVER_ERROR)
      .send(fail(sc.INTERNAL_SERVER_ERROR, rm.INTERNAL_SERVER_ERROR));
  }
};

// 최고관리자 배송신청 리스트 개별 조회
const getDeliveryRequestById = async (req: Request, res: Response) => {
  const deliveryId = req.params.id;
  try {
    const data = await managerService.getDeliveryRequestById(+deliveryId);
    if (!data) {
      return res
        .status(sc.NOT_FOUND)
        .send(success(sc.NOT_FOUND, rm.GET_DELIVERY_REQUEST_FAIL, data));
    }
    return res
      .status(sc.OK)
      .send(success(sc.OK, rm.GET_DELIVERY_REQUEST_SUCCESS, data));
  } catch (error) {
    console.log(error);
    return res
      .status(sc.INTERNAL_SERVER_ERROR)
      .send(fail(sc.INTERNAL_SERVER_ERROR, rm.INTERNAL_SERVER_ERROR));
  }
};

// 최고관리자 스탬프 정보 조회 (스템프 정보 리스트 조회)
const getAllTour = async (req: Request, res: Response) => {
  try {
    const data = await managerService.getAllTour();
    if (!data) {
      return res
        .status(sc.NOT_FOUND)
        .send(success(sc.NOT_FOUND, rm.GET_ALL_TOUR_FAIL, data));
    }
    return res
      .status(sc.OK)
      .send(success(sc.OK, rm.GET_ALL_TOUR_SUCCESS, data));
  } catch (error) {
    console.log(error);
    return res
      .status(sc.INTERNAL_SERVER_ERROR)
      .send(fail(sc.INTERNAL_SERVER_ERROR, rm.INTERNAL_SERVER_ERROR));
  }
};
const managerController = {
  managerSignup,
  managerSignin,
  //managerLogout,
  grantOwnerSignUp,
  createTour,
  createTourIdForStore,
  getAllDeliveryRequest,
  getDeliveryRequestById,
  getAllTour,
  getAllOwner,
  getOwnerById,
  getAllCustomer,
  getCustomerById,
};

export default managerController;
