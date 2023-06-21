import { CreateTourIdForStoreDTO } from "./../interfaces/manager/createTourIdForStoreDTO";
import { ManagerCreateDTO } from "./../interfaces/user/managerCreateDTO";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { sc } from "../constants";
import { UserSignInDTO } from "../interfaces/user/userSignInDTO";
import { CreateTourDTO } from "../interfaces/manager/createTourDTO";

const prisma = new PrismaClient();

// 매니저 생성
const managerSignup = async (managerCreateDTO: ManagerCreateDTO) => {
  // 넘겨받은 password를 bcrypt의 도움을 받아 암호화
  const salt = await bcrypt.genSalt(10); // 매우 작은 임의의 랜덤 텍스트 salt
  const password = await bcrypt.hash(managerCreateDTO.password, salt); // 위에서 랜덤으로 생성한 salt를 이용해 암호화
  const data = await prisma.manager.create({
    data: {
      loginId: managerCreateDTO.loginId,
      password,
    },
  });

  return data;
};

// 매니저 로그인
const managerSignIn = async (userSignInDTO: UserSignInDTO) => {
  try {
    const user = await prisma.manager.findFirst({
      where: {
        loginId: userSignInDTO.loginId,
      },
    });
    if (!user) return null;
    // bcrypt가 DB에 저장된 기존 password와 넘겨 받은 password를 대조하고
    // match false시 401을 리턴
    const isMatch = await bcrypt.compare(userSignInDTO.password, user.password);
    if (!isMatch) return sc.UNAUTHORIZED;

    return user.id;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// // 매니저 로그아웃
// const managerLogout = async (managerId: number) => {
//   const data = await prisma.manager.update({
//     where: {
//       id: managerId,
//     },
//     data: {
//       access,
//     },
//   });
// };

// 점주 회원가입 승인
const grantOwnerSignUp = async (id: number) => {
  const data = await prisma.store_Owner.update({
    where: {
      id: id,
    },
    data: {
      authorized: true,
    },
  });
  return data.id;
};

// 최고관리자 조회
const findManagerById = async (id: number) => {
  const data = await prisma.manager.findUnique({
    where: {
      id,
    },
  });
  return data;
};

// 최고관리자 담당자(점주) 정보 전체 조회
const getAllOwner = async (sort: string) => {
  if (sort === "all") {
    const data = await prisma.store_Owner.findMany();
    return data;
  }

  if (sort != "all") {
    switch (sort) {
      case "auth":
        const authorizedOwner = await prisma.store_Owner.findMany({
          where: {
            authorized: true,
          },
        });
        return authorizedOwner;
      case "pending":
        const pendingOwner = await prisma.store_Owner.findMany({
          where: {
            authorized: false,
          },
        });
        return pendingOwner;
    }
  }
};

// 최고관리자 담당자(점주) 정보 개별 조회
const getOwnerById = async (ownerId: number) => {
  const data = await prisma.store_Owner.findUnique({
    where: {
      id: ownerId,
    },
  });
  return data;
};

// 최고관리자 고객 정보 전체 조회
const getAllCustomer = async () => {
  const data = await prisma.customer.findMany();
  return data;
};

// 최고관리자 고객 정보 개별 조회
const getCustomerById = async (customerId: number) => {
  const data = await prisma.customer.findUnique({
    where: {
      id: customerId,
    },
  });
  return data;
};

// 최고관리자 투어 추가
const createTour = async (createTourDTO: CreateTourDTO) => {
  const data = await prisma.tour.create({
    data: {
      keyword: createTourDTO.keyword,
      title: createTourDTO.title,
      reward: createTourDTO.reward,
      image: createTourDTO.image,
    },
  });
  return data;
};

// 매장 id를 받아 매장 정보를 투어에 추가
const createTourIdForStore = async (
  createTourIdForStoreDTO: CreateTourIdForStoreDTO
) => {
  const data = await prisma.store.update({
    where: {
      id: createTourIdForStoreDTO.storeId as number,
    },
    data: {
      tourId: createTourIdForStoreDTO.tourId as number,
    },
  });
  return data;
};

// 최고관리자 배송신청 리스트 전체 조회
const getAllDeliveryRequest = async () => {
  const data = await prisma.delivery.findMany({
    where: {
      isGrant: false,
    },
  });
  return data;
};

// 최고관리자 배송신청 리스트 개별 조회
const getDeliveryRequestById = async (deliveryId: number) => {
  const data = await prisma.delivery.findUnique({
    where: {
      id: deliveryId,
    },
  });
  return data;
};

// 최고관리자 스탬프 정보 조회 (스템프 정보 리스트 조회)
const getAllTour = async () => {
  const data = await prisma.tour.findMany();
  return data;
};
const managerService = {
  managerSignup,
  managerSignIn,
  //managerLogout,
  grantOwnerSignUp,
  findManagerById,
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

export default managerService;
