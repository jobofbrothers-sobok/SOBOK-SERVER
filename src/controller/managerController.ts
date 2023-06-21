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

// 매니저 회원가입
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

// 매니저 로그인
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
      .status(sc.OK)
      .send(success(sc.OK, rm.CREATE_TOURID_FOR_STORE_SUCCESS, data));
  } catch (error) {
    console.log(error);
    return res
      .status(sc.INTERNAL_SERVER_ERROR)
      .send(fail(sc.INTERNAL_SERVER_ERROR, rm.INTERNAL_SERVER_ERROR));
  }
};

// 최고관리자 배송신청 리스트 조회
const getDeliveryRequest = async (req: Request, res: Response) => {
  try {
    const data = await managerService.getDeliveryRequest();
    if (!data || data.length === 0) {
      return res
        .status(sc.OK)
        .send(success(sc.OK, rm.GET_ALL_DELIVERY_REQUEST_FAIL, data));
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

const managerController = {
  managerSignup,
  managerSignin,
  grantOwnerSignUp,
  createTour,
  createTourIdForStore,
  getDeliveryRequest,
};

export default managerController;
