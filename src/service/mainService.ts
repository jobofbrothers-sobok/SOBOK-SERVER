import { CreateStoreReviewDTO } from "./../interfaces/store/createStoreReviewDTO";
import { Customer, PrismaClient, Stamp, Store } from "@prisma/client";
import bcrypt from "bcryptjs";
import { sc } from "../constants";
import axios from "axios";

const prisma = new PrismaClient();

// 키워드로 카페 검색
const getCafeByKeyword = async (keyword: string) => {
  const categoryList = [
    "콘센트",
    "테이블",
    "주차장",
    "주차",
    "애견동반",
    "애견",
    "강아지",
    "루프탑",
    "쇼파",
    "소파",
    "노키즈",
    "통유리",
    "흡연실",
    "흡연",
  ];
  const categoryListEng = [
    "concent",
    "table",
    "park",
    "park",
    "dog",
    "dog",
    "dog",
    "rooftop",
    "sofa",
    "sofa",
    "nokids",
    "window",
    "ciagrette",
    "ciagrette",
  ];

  console.log("here");

  // 카테고리 배열에 포함되는 문자열로 검색을 한 경우
  if (categoryList.includes(keyword)) {
    console.log("here2");
    let keywordEng;
    for (let i = 0; i < categoryList.length; i++) {
      if (keyword === categoryList[i]) {
        keyword = categoryListEng[i]; // 카테고리 문자열을 영어로 전환
        keywordEng = keyword;
      }
    }
    console.log("here3");

    // 매장명 또는 매장설명 또는 매장 카테고리에 카테고리가 포함된 경우 리턴
    const data = await prisma.store.findMany({
      where: {
        OR: [
          { storeName: { contains: keyword } },
          { description: { contains: keyword } },
          { category: { has: keywordEng } },
        ],
      },
    });
    console.log("Data: ", data);
    return data;
  } else {
    // 검색어에 카테고리명이 포함되지 않은 경우
    const data = await prisma.store.findMany({
      where: {
        OR: [
          { storeName: { contains: keyword } },
          { description: { contains: keyword } },
        ],
      },
    });
    console.log("No Keyword Data: ", data);
    return data;
  }
};

// 카페 찜하기
const createLikeCafe = async (storeId: number, customerId: number) => {
  const data = await prisma.store_Like.create({
    data: {
      customerId: customerId,
      storeId: storeId,
    },
  });
  return data;
};

// 카페 찜 해제
const deleteLikeCafe = async (storeId: number, customerId: number) => {
  const likedStore = await prisma.store_Like.findFirst({
    where: {
      customerId: customerId,
      storeId: storeId,
    },
  });
  const data = await prisma.store_Like.delete({
    where: {
      id: likedStore?.id,
    },
  });
  return data;
};

// 유저 근처 카페 전체 조회
const getAllCafe = async (x: number, y: number, category: Array<string>) => {
  // 전제 1: 투어에 포함된 카페 전체 조회
  const allTourCafe: any = await prisma.store.findMany({
    where: {
      tourId: { not: null },
      category: { hasEvery: category },
    },
  });

  // 현위치 좌표와 카페 좌표 사이의 거리 계산
  for (let i = 0; i < allTourCafe.length; i++) {
    // 전제 2: 카페의 도로명 주소가 정확히 기입되어 x, y 좌표가 등록된 상태
    if (
      allTourCafe !== null &&
      allTourCafe[i].x !== null &&
      allTourCafe[i].y !== null
    ) {
      let cafeX = allTourCafe[i].x;
      let cafeY = allTourCafe[i].y;
      // 좌표평면상 두 좌표 사이의 거리
      let distance = Math.sqrt(
        Math.pow(+x - parseFloat(cafeX as string), 2) +
          Math.pow(+y - parseFloat(cafeY as string), 2)
      );
      // // 전체 카페 배열 내의 카페 객체 각각의 distance 필드 업데이트
      // const store = await prisma.store.update({
      //   where: {
      //     id: allTourCafe[i].id,
      //   },
      //   data: {
      //     distance: distance * 100000,
      //   },
      // });
      allTourCafe[i].distance = distance * 100000; // m 단위에 맞게 곱셈하여 추가
    }
  }
  console.log(allTourCafe);

  // sort 함수로 정렬
  const sortAllTourCafe = allTourCafe.sort(
    (a: { distance: any }, b: { distance: any }) => a.distance - b.distance
  );
  return sortAllTourCafe;
};

// 유저 근처 카페 개별 업체 정보 조회
const getCafeById = async (storeId: number) => {
  const data = await prisma.store.findUnique({
    where: {
      id: storeId,
    },
  });
  return data;
};

// 유저 근처 카페 개별 업체 소식 조회
const getCafeNoticeById = async (id: number, query: string) => {
  if (query === "all") {
    const allNotice = await prisma.store_Notice.findMany({
      where: {
        storeId: id,
      },
    });
    return allNotice;
  }

  if (query !== "all") {
    switch (query) {
      case "menu":
        const menuNotice = await prisma.store_Notice.findMany({
          where: {
            storeId: id,
            category: { contains: "메뉴" }, // 신메뉴 소식만 조회
          },
        });
        return menuNotice;
      case "sale":
        const saleNotice = await prisma.store_Notice.findMany({
          where: {
            storeId: id,
            category: { contains: "이벤트" }, // 할인/이벤트 소식만 조회
          },
        });
        return saleNotice;
    }
  }
};

// 유저 근처 카페 개별 업체 메뉴 조회
const getCafeMenuById = async (storeId: number) => {
  const data = await prisma.store_Menu.findMany({
    where: {
      storeId: storeId,
    },
  });
  return data;
};

// 유저 근처 카페 개별 업체 피드 조회
const getCafeReviewById = async (storeId: number) => {
  const data = await prisma.store_Review.findMany({
    where: {
      storeId: storeId,
    },
  });
  return data;
};

// 유저 근처 카페 개별 업체 피드 작성
const createCafeReviewById = async (
  writerId: number,
  storeId: number,
  createStoreReviewDTO: CreateStoreReviewDTO,
  path: string,
  date: Date
) => {
  const writer = await prisma.customer.findUnique({
    where: {
      id: writerId,
    },
  });
  if (writer !== null) {
    const data = await prisma.store_Review.create({
      data: {
        title: createStoreReviewDTO.title,
        content: createStoreReviewDTO.content,
        image: path,
        timestamp: date,
        writerId: writerId,
        storeId: storeId,
        writerName: writer.name,
      },
    });
    return data;
  } else {
    return 0;
  }
};

// 전체 카페 소식 모아보기
const getAllCafeNotice = async (query: string) => {
  if (query === "all") {
    const allNotice = await prisma.store_Notice.findMany();
    return allNotice;
  }

  if (query !== "all") {
    switch (query) {
      case "menu":
        const menuNotice = await prisma.store_Notice.findMany({
          where: {
            category: { contains: "메뉴" }, // 신메뉴 소식만 조회
          },
        });
        return menuNotice;
      case "sale":
        const saleNotice = await prisma.store_Notice.findMany({
          where: {
            category: { contains: "이벤트" }, // 할인/이벤트 소식만 조회
          },
        });
        return saleNotice;
    }
  }
};

// 찜한 카페 소식 모아보기
const getAllLikeCafeNotice = async (query: string, customerId: number) => {
  // 찜한 카페 전체 조회
  const allStoreLike = await prisma.store_Like.findMany({
    where: {
      customerId: customerId,
    },
  });

  // 찜한 카페의 아이디가 모인 배열 생성
  let allLikeCafeId: Array<number> = [];
  for (let i = 0; i < allStoreLike.length; i++) {
    allLikeCafeId.push(allStoreLike[i].storeId);
  }

  if (query === "all") {
    const allNotice = await prisma.store_Notice.findMany({
      where: {
        storeId: { in: allLikeCafeId },
      },
    });
    return allNotice;
  }

  if (query !== "all") {
    switch (query) {
      case "menu":
        const menuNotice = await prisma.store_Notice.findMany({
          where: {
            category: { contains: "메뉴" }, // 신메뉴 소식만 조회
            storeId: { in: allLikeCafeId },
          },
        });
        return menuNotice;
      case "sale":
        const saleNotice = await prisma.store_Notice.findMany({
          where: {
            category: { contains: "이벤트" }, // 할인/이벤트 소식만 조회
            storeId: { in: allLikeCafeId },
          },
        });
        return saleNotice;
    }
  }
};

// 소복 스토어 상품 조회
const getCafeStoreProducts = async (sort: string) => {
  if (sort !== "all") {
    switch (sort) {
      case "cookie":
        const cookie = await prisma.store_Product.findMany({
          where: {
            category: "수제 쿠키",
          },
        });
        return cookie;
      case "cake":
        const cake = await prisma.store_Product.findMany({
          where: {
            category: "수제 케이크",
          },
        });
        return cake;
      case "bean":
        const bean = await prisma.store_Product.findMany({
          where: {
            category: "원두",
          },
        });
        return bean;
    }
  }

  if (sort === "all") {
    const data = await prisma.store_Product.findMany({
      where: {
        storeId: { not: null },
      },
    });
    return data;
  }
};

// 고객 마이페이지 조회
const getCustomerMyPage = async (customerId: number) => {
  // 유저 이름 조회
  const customer = await prisma.customer.findUnique({
    where: {
      id: customerId,
    },
  });

  const customerName = customer?.name;

  // 찜한 카페 전체 조회
  const allStoreLike = await prisma.store_Like.findMany({
    where: {
      customerId: customerId,
    },
  });

  let allLikeCafe: Array<any> = [];
  for (let i = 0; i < allStoreLike.length; i++) {
    let likeCafe = await prisma.store.findUnique({
      where: {
        id: allStoreLike[i].storeId,
      },
    });
    allLikeCafe.push(likeCafe);
  }

  // 내가 작성한 리뷰 전체 조회
  const allStoreReview = await prisma.store_Review.findMany({
    where: {
      writerId: customerId,
    },
  });

  return { customerName, allLikeCafe, allStoreReview };
};

// 최고관리자 카페 소식 삭제
const deleteCafeNoticeById = async (noticeId: number) => {
  const data = await prisma.store_Notice.delete({
    where: {
      id: noticeId,
    },
  });
  return data;
};

// 최고관리자 카페 메뉴 삭제
const deleteCafeMenuById = async (menuId: number) => {
  const data = await prisma.store_Menu.delete({
    where: {
      id: menuId,
    },
  });
  return data;
};

// 최고관리자 카페 피드 삭제
const deleteCafeReviewById = async (reviewId: number) => {
  const data = await prisma.store_Review.delete({
    where: {
      id: reviewId,
    },
  });
  return data;
};

// 최고관리자 소복 스토어 상품 삭제
const deleteCafeProductById = async (productId: number) => {
  const data = await prisma.store_Product.delete({
    where: {
      id: productId,
    },
  });
  return data;
};

const mainService = {
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
export default mainService;
