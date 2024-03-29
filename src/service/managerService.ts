import { CreateNoticeDTO } from "./../interfaces/manager/createNoticeDTO";
import { CreateTourIdForStoreDTO } from "./../interfaces/manager/createTourIdForStoreDTO";
import { ManagerCreateDTO } from "./../interfaces/user/managerCreateDTO";
import { Alim_Request, Delivery, PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { sc } from "../constants";
import { UserSignInDTO } from "../interfaces/user/userSignInDTO";
import { CreateTourDTO } from "../interfaces/manager/createTourDTO";
import axios from "axios";
import FormData from "form-data";
import { response } from "express";

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
const getAllOwner = async (sort: string, ownerName: string) => {
  if (sort === "all") {
    const data = await prisma.store_Owner.findMany();
    if (ownerName) {
      const data = await prisma.store_Owner.findMany({
        where: {
          director: { contains: ownerName },
        },
      });
      return data;
    }
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
        if (ownerName) {
          const data = await prisma.store_Owner.findMany({
            where: {
              director: { contains: ownerName },
              authorized: true,
            },
          });
          return data;
        }
        return authorizedOwner;
      case "pending":
        const pendingOwner = await prisma.store_Owner.findMany({
          where: {
            authorized: false,
          },
        });
        if (ownerName) {
          const data = await prisma.store_Owner.findMany({
            where: {
              director: { contains: ownerName },
              authorized: false,
            },
          });
          return data;
        }
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
const getAllCustomer = async (customerName: string) => {
  const data = await prisma.customer.findMany();

  if (customerName) {
    const data = await prisma.customer.findMany({
      where: {
        name: { contains: customerName },
      },
    });
    return data;
  }

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
const createTour = async (createTourDTO: CreateTourDTO, path: string) => {
  const data = await prisma.tour.create({
    data: {
      keyword: createTourDTO.keyword,
      title: createTourDTO.title,
      reward: createTourDTO.reward,
      image: path,
      cafeList: createTourDTO.cafeList.split(","),
    },
  });

  // 매장 정보에 투어 id 부여
  const cafeListArray = createTourDTO.cafeList.split(",");
  for (let i = 0; i < cafeListArray.length; i++) {
    const tourStore = await prisma.store.updateMany({
      where: {
        storeName: { contains: cafeListArray[i].trim() },
      },
      data: {
        tourId: data.id,
      },
    });
  }

  return data;
};

// 최고관리자 투어 추가 시 매장정보 검색
const getStoreByStoreName = async (store: string) => {
  const data = await prisma.store.findMany({
    // 검색어를 포함하는 매장명 조회 시 해당 매장 레코드 반환
    where: {
      storeName: { contains: store },
    },
  });
  return data;
};

// 최고관리자 배송신청 리스트 전체 조회
const getAllDeliveryRequest = async (keyword: string) => {
  const data: any = await prisma.delivery.findMany({
    where: {
      isGrant: false,
    },
  });
  const keywordData: Array<Delivery> = [];
  for (let i = 0; i < data.length; i++) {
    const customer = await prisma.customer.findFirst({
      where: {
        id: data[i].customerId,
      },
    });
    data[i].title = `${customer?.name} 배송신청`;
    if (keyword && keyword.trim() !== "") {
      if (data[i].title.includes(keyword)) {
        keywordData.push(data[i]);
        console.log(keywordData);
      }
    }
  }

  if (keywordData.length >= 1) {
    return keywordData;
  }
  if (keywordData.length === 0) {
    return data;
  }

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

// 최고관리자 스탬프 서비스 사용 신청 담당자 전체 조회
const getAllStampSignInRequest = async (sort: string, keyword: string) => {
  if (!keyword) {
    // 키워드를 기입하는 경우
    switch (sort) {
      case "auth":
        const allAuthOwner = await prisma.store_Owner.findMany({
          where: {
            stampAuthorized: true,
          },
        });
        return allAuthOwner;
      case "pending":
        const allRequest = await prisma.stamp_Request.findMany();
        console.log("allRequest: ", allRequest);
        let allPendingOwner: Array<object> = [];
        for (let i = 0; i < allRequest.length; i++) {
          const ownerId = allRequest[i].ownerId;
          const requestOwner = await prisma.store_Owner.findFirst({
            where: {
              id: ownerId,
              stampAuthorized: false,
            },
          });
          if (requestOwner !== null) {
            allPendingOwner.push(requestOwner as object);
          }
        }
        return allPendingOwner;
    }
  } else {
    // const owner = await prisma.store_Owner.findMany({
    //   where: {
    //     director: { contains: keyword },
    //   },
    // });
    // return owner;
    switch (sort) {
      case "auth":
        const allAuthOwner = await prisma.store_Owner.findMany({
          where: {
            stampAuthorized: true,
            director: { contains: keyword },
          },
        });
        return allAuthOwner;
      case "pending":
        const allRequest = await prisma.stamp_Request.findMany();
        console.log("allRequest: ", allRequest);
        let allPendingOwner: Array<object> = [];
        for (let i = 0; i < allRequest.length; i++) {
          const ownerId = allRequest[i].ownerId;
          const requestOwner = await prisma.store_Owner.findFirst({
            where: {
              id: ownerId,
              stampAuthorized: false,
              director: { contains: keyword },
            },
          });
          if (requestOwner !== null) {
            allPendingOwner.push(requestOwner as object);
          }
        }
        return allPendingOwner;
    }
  }
};

// 최고관리자 스탬프 서비스 사용 신청 담당자 개별 조회
const getStampSignInRequest = async (ownerId: number) => {
  const requestOwner = await prisma.stamp_Request.findUnique({
    where: {
      ownerId: ownerId,
    },
  });
  if (requestOwner !== null) {
    const data = await prisma.store_Owner.findUnique({
      where: {
        id: ownerId,
      },
    });
    return data;
  }
};

// 최고관리자 스탬프 서비스 사용 신청 승인
const stampSignInGrant = async (ownerId: number) => {
  // 스탬프 사용 신청 건 - 승인 여부 갱신
  await prisma.stamp_Request.update({
    where: {
      ownerId: ownerId,
    },
    data: {
      isGrant: true,
    },
  });
  // 스탬프 사용 신청 담당자 - 승인 여부 갱신
  const data = await prisma.store_Owner.update({
    where: {
      id: ownerId,
    },
    data: {
      stampAuthorized: true,
    },
  });
  const result = {
    ownerId: data.id,
    stampAuthorized: data.stampAuthorized,
  };
  return result;
};

// 최고관리자 스탬프 정보 조회 (스템프 정보 리스트 조회)
const getAllTour = async (keyword: string) => {
  const data = await prisma.tour.findMany();
  if (keyword !== null) {
    const data = await prisma.tour.findMany({
      where: {
        title: { contains: keyword },
      },
    });
    return data;
  }
  return data;
};

// 최고관리자 소복 매니저 신청 리스트 전체 조회
const getAllAlimRequest = async (keyword: string) => {
  const data: any = await prisma.alim_Request.findMany();
  const keywordData: Array<Alim_Request> = [];
  for (let i = 0; i < data.length; i++) {
    const store = await prisma.store.findUnique({
      where: {
        ownerId: data[i].writerId,
      },
    });
    data[i].title = `${store?.storeName} 문자서비스 신청`;
    if (keyword !== null) {
      if (data[i].title.includes(keyword)) {
        keywordData.push(data[i]);
        console.log(keywordData);
      }
    }
  }

  if (keywordData.length >= 1) {
    return keywordData;
  }
  if (keywordData.length === 0) {
    return data;
  }
};

// 최고관리자 소복 매니저 신청 리스트 개별 조회
const getAlimRequestById = async (id: number) => {
  const data: any = await prisma.alim_Request.findUnique({
    where: {
      id: id,
    },
  });
  const store = await prisma.store.findUnique({
    where: {
      ownerId: data?.writerId,
    },
  });

  data.title = `${store?.storeName} 문자서비스 신청`;
  return data;
};

// 최고관리자 소복 매니저 문자 일괄전송
const sendMessage = async (writerId: number, content: string) => {
  // 문자 전송 신청자의 매장 및 매장id 탐색
  const writerStore = await prisma.store.findUnique({
    where: {
      ownerId: writerId,
    },
  });
  console.log(writerStore);
  const storeId = writerStore?.id;

  // 해당 매장에서 스탬프 적립 승인을 받은 고객 탐색
  const customer = await prisma.stamp.findMany({
    where: {
      timestamp: { not: null },
      storeId: storeId,
      store: { not: null },
      tourId: { not: null },
      tour: { not: null },
    },
  });
  console.log(customer);

  // 고객 id 배열에 스탬프를 적립한 고객의 id를 push
  const customerId = [];
  for (let i = 0; i < customer.length; i++) {
    customerId.push(customer[i].customerId);
  }
  console.log(customerId);

  // 스탬프를 적립한 고객 id 배열에서 중복값을 제거
  const set = new Set(customerId);
  const uniqueCustomerId: Array<any> = [...set];
  console.log(uniqueCustomerId);

  // 스탬프를 적립한 곡객들의 전화번호가 모인 배열 생송
  let customerPhone: Array<string> = [];
  for (let i = 0; i < uniqueCustomerId.length; i++) {
    const customer = await prisma.customer.findUnique({
      where: {
        id: uniqueCustomerId[i],
      },
    });
    // 전화번호 문자열 정제
    let phone = customer?.phone as string;
    let replacedPhone = phone.replace(/-/g, ""); // "-" globally replaced
    customerPhone.push(replacedPhone); // 배열에 값 추가
  }

  console.log(typeof customerPhone, "customerPhone: ", customerPhone);

  // 배열 안 전화번호를 하나의 스트링으로 합침
  const customerPhoneResult: string = customerPhone.join();
  console.log(customerPhoneResult);

  // 알리고 문자 api 호출
  let data = new FormData();
  data.append("key", "5hs408olr441l1gojp90yf2lqvcbkwi0");
  data.append("user_id", "sobok");
  data.append("sender", "01025636996");
  data.append("receiver", customerPhoneResult);
  data.append("msg", content);

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://apis.aligo.in/send/",
    headers: {
      ...data.getHeaders(),
    },
    data: data,
  };

  const axiosResult = async () => {
    const promise = axios.request(config);

    const dataPromise = promise.then((response) => response.data);
    return dataPromise;
  };

  return axiosResult();
};

// 최고관리자 소복 매니저 카카오톡(친구톡) 일괄전송
const sendKakao = async (writerId: number, content: string) => {
  // 문자 전송 신청자의 매장 및 매장id 탐색
  const writerStore = await prisma.store.findUnique({
    where: {
      ownerId: writerId,
    },
  });
  console.log(writerStore);
  const storeId = writerStore?.id;
  // 해당 매장에서 스탬프 적립 승인을 받은 고객 탐색
  const customer = await prisma.stamp.findMany({
    where: {
      timestamp: { not: null },
      storeId: storeId,
      store: { not: null },
      tourId: { not: null },
      tour: { not: null },
    },
  });

  // 고객 id 배열에 스탬프를 적립한 고객의 id를 push
  const customerId = [];
  for (let i = 0; i < customer.length; i++) {
    customerId.push(customer[i].customerId);
  }

  // 스탬프를 적립한 고객 id 배열에서 중복값을 제거
  const set = new Set(customerId);
  const uniqueCustomerId: Array<any> = [...set];
  console.log(uniqueCustomerId);

  // 스탬프를 적립한 곡객들의 전화번호가 모인 배열 생성
  let customerPhone: Array<string> = [];
  for (let i = 0; i < uniqueCustomerId.length; i++) {
    const customer = await prisma.customer.findUnique({
      where: {
        id: uniqueCustomerId[i],
      },
    });
    // 전화번호 문자열 정제
    let phone = customer?.phone as string;
    let replacedPhone = phone.replace(/-/g, ""); // "-" globally replaced
    customerPhone.push(replacedPhone); // 배열에 값 추가
  }

  // 알리고 토큰 생성 api 호출
  let data = new FormData();
  data.append("apikey", "5hs408olr441l1gojp90yf2lqvcbkwi0");
  data.append("userid", "sobok");

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://kakaoapi.aligo.in/akv10/token/create/30/s/",
    headers: {
      ...data.getHeaders(),
    },
    data: data,
  };

  const axiosResult = async () => {
    const promise = axios.request(config);

    const dataPromise = promise.then((response) => response.data);
    return dataPromise;
  };

  const token = await axiosResult();

  // 알리고 친구톡 일괄전송 api
  let newData = new FormData();
  newData.append("apikey", "5hs408olr441l1gojp90yf2lqvcbkwi0");
  newData.append("userid", "sobok");
  newData.append("token", token.token);
  newData.append("senderkey", "28761cda9b6c4062146443a53dcdbd29a057fcb7");
  newData.append("sender", "01025636996");
  for (let i = 0; i < customerPhone.length; i++) {
    newData.append(`receiver_${i + 1}`, customerPhone[i]);
    newData.append(`subject_${i + 1}`, "[SOBOK] 친구톡입니다.");
    newData.append(`message_${i + 1}`, content);
  }

  let configuration = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://kakaoapi.aligo.in/akv10/friend/send/ ",
    headers: {
      ...newData.getHeaders(),
    },
    data: newData,
  };

  const newAxiosResult = async () => {
    const promise = axios.request(configuration);

    const dataPromise = promise.then((response) => response.data);
    return dataPromise;
  };

  return newAxiosResult();
};

// 최고관리자 공지사항 작성
const createNotice = async (
  createNoticeDTO: CreateNoticeDTO,
  date: Date,
  path: string
) => {
  const data = await prisma.notice.create({
    data: {
      title: createNoticeDTO.title,
      content: createNoticeDTO.content,
      image: path,
      timestamp: date,
    },
  });
  return data;
};

// 최고관리자 문의사항 전체 조회
const getAllInquiry = async () => {
  const data: any = await prisma.inquiry.findMany();
  console.log("getAllInquiry");
  for (let i = 0; i < data.length; i++) {
    // 고객 유저의 문의사항일 경우
    if (data[i].customerId && data[i].ownerId === null) {
      console.log("customer");
      const customer = await prisma.customer.findUnique({
        where: {
          id: data[i].customerId,
        },
      });
      data[i].who = "일반";
      data[i].name = customer?.name;
      data[i].phone = customer?.phone;
    }
    if (data[i].ownerId && data[i].customerId === null) {
      console.log("owner");

      const owner = await prisma.store_Owner.findUnique({
        where: {
          id: data[i].ownerId,
        },
      });
      data[i].who = "점주";
      data[i].name = owner?.director;
      data[i].phone = owner?.phone;
    }
  }
  return data;
};
const managerService = {
  managerSignup,
  managerSignIn,
  grantOwnerSignUp,
  findManagerById,
  getAllStampSignInRequest,
  getStampSignInRequest,
  stampSignInGrant,
  createTour,
  getStoreByStoreName,
  getAllDeliveryRequest,
  getDeliveryRequestById,
  getAllTour,
  getAllOwner,
  getOwnerById,
  getAllCustomer,
  getCustomerById,
  getAllAlimRequest,
  getAlimRequestById,
  sendMessage,
  sendKakao,
  createNotice,
  getAllInquiry,
};

export default managerService;
