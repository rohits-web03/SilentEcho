import { goapi } from "@/lib/utils";
import { ApiResponse } from "@/types/ApiResponse";
import { AxiosError } from "axios";

export async function logout() {
    try {
        const res = await goapi.post<ApiResponse<void>>(
            `${process.env.NEXT_PUBLIC_GOSERVER_BASE_URL}/api/auth/logout`,
            {}
        );
        return { status: res.data.success };
    } catch (error) {
        const axiosError = error as AxiosError<ApiResponse<unknown>>;
        console.error("Logout failed:", axiosError.response?.data);
        return { status: false };
    }
}
