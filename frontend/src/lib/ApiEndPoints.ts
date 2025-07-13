

export const SERVER_ENDPOINT: string = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const API_URL: string = SERVER_ENDPOINT + "/api";

export const EDIT_POST: string = API_URL + "/auth/post";

export const SAVE_POST: string = API_URL + "/post";

export const LIKE_POST: string = API_URL + "/post";

export const GET_LIKED_POST: string = API_URL + "/auth";

export const GET_PROFILE: string = API_URL + "/auth/profile";

export const COMMENT_END_POINT: string = API_URL + "/auth/comment/";

export const GET_COMMENT: string = API_URL + "/auth/get-comment";
