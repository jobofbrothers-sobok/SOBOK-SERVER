export default {
  NULL_VALUE: "필요한 값이 없습니다.",
  OUT_OF_VALUE: "파라미터 값이 잘못되었습니다.",
  NOT_FOUND: "잘못된 경로입니다.",
  BAD_REQUEST: "잘못된 요청입니다.",

  // 회원가입 및 로그인
  SIGNUP_SUCCESS: "회원 가입 성공",
  SIGNUP_GRANT_SUCCESS: "점주 회원가입 승인 성공",
  SIGNUP_FAIL: "회원 가입 실패",
  SIGNIN_SUCCESS: "로그인 성공",
  SIGNIN_FAIL: "로그인 실패",
  LOGOUT_SUCCESS: "로그아웃 성공",
  LOGOUT_FAIL: "로그아웃 실패",
  ALREADY_NICKNAME: "이미 사용중인 닉네임입니다.",
  INVALID_PASSWORD: "잘못된 비밀번호입니다.",

  // 유저
  READ_USER_SUCCESS: "유저 조회 성공",
  READ_ALL_USERS_SUCCESS: "모든 유저 조회 성공",
  UPDATE_USER_SUCCESS: "유저 수정 성공",
  DELETE_USER_SUCCESS: "유저 탈퇴 성공",
  DELETE_USER_FAIL: "유저 탈퇴 실패",
  NO_USER: "탈퇴했거나 가입하지 않은 유저입니다.",
  GET_USERNAME_SUCCESS: "유저 이름 조회 성공",
  NOT_EXISITING_USER: "존재하지 않는 유저입니다.",
  GET_ALL_OWNER_SUCCESS: "전체 담당자 정보 조회 성공",
  GET_ALL_OWNER_FAIL: "전체 담당자 정보 조회 실패",
  GET_OWNER_SUCCESS: "개별 담당자 정보 조회 성공",
  GET_OWNER_FAIL: "개별 담당자 정보 조회 실패",
  NO_OWNER_YET: "아직 해당 분류의 개별 담당자 정보가 없습니다.",
  GET_ALL_CUSTOMER_SUCCESS: "전체 고객 정보 조회 성공",
  GET_ALL_CUSTOMER_FAIL: "전체 고객 정보 조회 실패",
  GET_CUSTOMER_SUCCESS: "개별 고객 정보 조회 성공",
  GET_CUSTOMER_FAIL: "개별 고객 정보 조회 실패",

  // 토큰
  CREATE_TOKEN_SUCCESS: "토큰 재발급 성공",
  EXPIRED_TOKEN: "토큰이 만료되었습니다.",
  EXPIRED_ALL_TOKEN: "모든 토큰이 만료되었습니다.",
  INVALID_TOKEN: "유효하지 않은 토큰입니다.",
  VALID_TOKEN: "유효한 토큰입니다.",
  EMPTY_TOKEN: "토큰 값이 없습니다.",

  // 서버 내 오류
  INTERNAL_SERVER_ERROR: "서버 내 오류",

  // 매장
  CREATE_STORE_INFO_SUCCESS: "매장 정보 생성 성공",
  UPDATE_STORE_INFO_SUCCESS: "매장 정보 수정 성공",
  CREATE_STORE_NOTICE_SUCCESS: "매장 소식 생성 성공",
  CREATE_STORE_MENU_SUCCESS: "매장 메뉴 생성 성공",
  CREATE_STORE_PRODUCT_SUCCESS: "매장 스토어 상품 생성 성공",

  // 스탬프
  CREATE_RANDNUM_SUCCESS: "고객 생성 번호 생성 성공",
  CREATE_RANDNUM_FAIL: "고객 생성 번호 생성 실패",
  GRANT_STAMP_SUCCESS: "스탬프 적립 성공",
  GET_ALL_STAMP_FAIL: "스탬프 적립 내역 전체 조회 실패",
  GET_ALL_STAMP_SUCCESS: "스탬프 적립 내역 전체 조회 성공",

  // 스탬프 배송신청
  CREATE_DELIVERY_REQUEST_SUCCESS: "고객 스탬프 배송신청 성공",
  STAMP_COUNT_NOT_ENOUGH: "스탬프가 10개 미만입니다",
  GET_ALL_DELIVERY_REQUEST_SUCCESS: "스탬프 배송신청 리스트 전체 조회 성공",
  GET_ALL_DELIVERY_REQUEST_FAIL: "스탬프 배송신청 리스트 전체 조회 실패",
  GET_DELIVERY_REQUEST_SUCCESS: "스탬프 배송신청 리스트 개별 조회 성공",
  GET_DELIVERY_REQUEST_FAIL: "스탬프 배송신청 리스트 개별 조회 실패",

  // 투어
  CREATE_TOUR_SUCCESS: "스탬프 투어 생성 성공",
  CREATE_TOUR_FAIL: "스탬프 투어 생성 실패",
  CREATE_TOURID_FOR_STORE_SUCCESS: "스탬프 투어에 매장정보 추가 성공",
  CREATE_TOURID_FOR_STORE_FAIL: "스탬프 투어에 매장정보 추가 실패",
  GET_ALL_TOUR_STORE_SUCCESS: "스탬프 투어 참여 매장 조회 성공",
  GET_ALL_TOUR_STORE_FAIL: "스탬프 투어 참여 매장 조회 실패",
  GET_ALL_TOUR_SUCCESS: "스탬프 투어 정보 리스트 조회 성공",
  GET_ALL_TOUR_FAIL: "스탬프 투어 정보 리스트 조회 실패",
};
