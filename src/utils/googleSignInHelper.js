// googleSignInHelper.js
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";

// Environment variables
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const GOOGLE_SCOPES = process.env.EXPO_PUBLIC_GOOGLE_SCOPES?.split(",") || [
  "profile",
  "email",
];
const GOOGLE_FORCE_CODE_FOR_REFRESH_TOKEN =
  process.env.EXPO_PUBLIC_GOOGLE_FORCE_CODE_FOR_REFRESH_TOKEN === "true";
const GOOGLE_OFFLINE_ACCESS =
  process.env.EXPO_PUBLIC_GOOGLE_OFFLINE_ACCESS === "true";
const GOOGLE_INIT_DELAY =
  parseInt(process.env.EXPO_PUBLIC_GOOGLE_INIT_DELAY) || 500;
const GOOGLE_SIGNIN_DELAY =
  parseInt(process.env.EXPO_PUBLIC_GOOGLE_SIGNIN_DELAY) || 1000;
const GOOGLE_RETRY_DELAY =
  parseInt(process.env.EXPO_PUBLIC_GOOGLE_RETRY_DELAY) || 1000;

/**
 * Khởi tạo Google Sign-In với các cấu hình từ environment variables
 */
export const initGoogleSignIn = () => {
  try {
    // Kiểm tra xem GoogleSignin đã tồn tại và đã được cấu hình chưa
    if (!GoogleSignin) {
      console.log("GoogleSignin không khả dụng");
      return false;
    }

    // Đặt cấu hình từ environment variables
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      scopes: GOOGLE_SCOPES,
      iosClientId: GOOGLE_IOS_CLIENT_ID,
      forceCodeForRefreshToken: GOOGLE_FORCE_CODE_FOR_REFRESH_TOKEN,
      offlineAccess: GOOGLE_OFFLINE_ACCESS,
      accountName: "", // Thêm tham số này có thể giúp trong một số trường hợp
    });

    return true;
  } catch (error) {
    console.log("Google Sign-In configuration error (ignored):", error);
    return false;
  }
};

/**
 * Kiểm tra và chuẩn bị Google Play Services
 * @returns {Promise<boolean>} true nếu Google Play Services khả dụng
 */
export const checkPlayServices = async () => {
  try {
    // Thêm timeout từ environment variable
    await new Promise((resolve) => setTimeout(resolve, GOOGLE_INIT_DELAY));

    await GoogleSignin.hasPlayServices({
      showPlayServicesUpdateDialog: true,
    });
    return true;
  } catch (error) {
    console.log("Google Play Services error:", error);

    // Nếu lỗi là activity is null, chúng ta vẫn trả về true để thử tiếp
    if (error.message && error.message.includes("activity is null")) {
      return true;
    }

    return false;
  }
};

/**
 * Đăng xuất khỏi Google và xóa dữ liệu đăng nhập
 */
export const signOutGoogle = async () => {
  try {
    // Thêm timeout từ environment variable
    await new Promise((resolve) => setTimeout(resolve, GOOGLE_INIT_DELAY));

    // Thử xóa mọi dữ liệu đăng nhập hiện có
    await GoogleSignin.signOut();

    // Đặt lại cấu hình sau khi đăng xuất
    initGoogleSignIn();

    console.log("Google sign out completed successfully");
    return true;
  } catch (error) {
    console.log("Google Sign-Out error (ignored):", error);

    // Ngay cả khi đăng xuất thất bại, vẫn trả về true để tiếp tục quy trình
    return true;
  }
};

/**
 * Thực hiện đăng nhập Google với xử lý lỗi tốt hơn
 * @returns {Promise<{success: boolean, data: object|null, error: string|null}>}
 */
export const performGoogleSignIn = async () => {
  try {
    // Khởi tạo lại GoogleSignin trước khi sử dụng
    initGoogleSignIn();

    // Thêm timeout từ environment variable
    await new Promise((resolve) => setTimeout(resolve, GOOGLE_SIGNIN_DELAY));

    // Đảm bảo Google Play Services khả dụng
    const playServicesAvailable = await checkPlayServices();
    if (!playServicesAvailable) {
      return {
        success: false,
        data: null,
        error: "Dịch vụ Google Play không khả dụng",
      };
    }

    // Thử đăng xuất để đảm bảo không có xung đột
    try {
      await signOutGoogle();
    } catch (signOutError) {
      console.log("Error during sign out (ignored):", signOutError);
      // Tiếp tục ngay cả khi đăng xuất thất bại
    }

    // Thêm timeout từ environment variable
    await new Promise((resolve) => setTimeout(resolve, GOOGLE_SIGNIN_DELAY));

    // Kiểm tra nếu người dùng đã đăng nhập
    let userAlreadySignedIn = false;
    let currentUser = null;

    try {
      if (GoogleSignin && typeof GoogleSignin.isSignedIn === "function") {
        const isSignedIn = await GoogleSignin.isSignedIn();

        if (isSignedIn && typeof GoogleSignin.getCurrentUser === "function") {
          currentUser = await GoogleSignin.getCurrentUser();
          if (currentUser && currentUser.user) {
            userAlreadySignedIn = true;
          }
        }
      } else if (
        GoogleSignin &&
        typeof GoogleSignin.getCurrentUser === "function"
      ) {
        // Thử trực tiếp với getCurrentUser nếu isSignedIn không có sẵn
        try {
          currentUser = await GoogleSignin.getCurrentUser();
          if (currentUser && currentUser.user) {
            userAlreadySignedIn = true;
          }
        } catch (directGetError) {
          console.log("Direct getCurrentUser error:", directGetError);
        }
      }
    } catch (checkError) {
      console.log("Error checking if user is signed in:", checkError);
      // Không cần xử lý lỗi ở đây, tiếp tục với đăng nhập mới
    }

    // Nếu người dùng đã đăng nhập, trả về thông tin hiện có
    if (userAlreadySignedIn && currentUser) {
      return {
        success: true,
        data: currentUser,
        error: null,
      };
    }

    // Thử đăng nhập mới
    try {
      if (!GoogleSignin || typeof GoogleSignin.signIn !== "function") {
        // Khởi tạo lại một lần nữa nếu cần
        initGoogleSignIn();
        await new Promise((resolve) =>
          setTimeout(resolve, GOOGLE_SIGNIN_DELAY)
        );

        if (!GoogleSignin || typeof GoogleSignin.signIn !== "function") {
          return {
            success: false,
            data: null,
            error: "Không thể khởi tạo đăng nhập Google",
          };
        }
      }

      const signInResult = await GoogleSignin.signIn();
      return {
        success: true,
        data: signInResult,
        error: null,
      };
    } catch (signInError) {
      console.log("Sign in error:", signInError);

      if (signInError.code) {
        return {
          success: false,
          data: null,
          error: `Lỗi đăng nhập: ${signInError.code}`,
        };
      }

      return {
        success: false,
        data: null,
        error: `Lỗi đăng nhập: ${signInError.message || "Unknown error"}`,
      };
    }
  } catch (error) {
    // Xử lý các lỗi đã biết
    if (error.code) {
      switch (error.code) {
        case statusCodes.SIGN_IN_CANCELLED:
          return {
            success: false,
            data: null,
            error: "Bạn đã hủy đăng nhập Google",
          };
        case statusCodes.IN_PROGRESS:
          // Nếu đang trong quá trình đăng nhập, đợi một lát và thử lại
          try {
            await new Promise((resolve) =>
              setTimeout(resolve, GOOGLE_RETRY_DELAY)
            );
            const currentUser = await GoogleSignin.getCurrentUser();
            if (currentUser) {
              return {
                success: true,
                data: currentUser,
                error: null,
              };
            }
          } catch (secondError) {
            console.log("Second attempt error:", secondError);
          }

          return {
            success: false,
            data: null,
            error: "Đang tiến hành đăng nhập Google",
          };
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          return {
            success: false,
            data: null,
            error: "Dịch vụ Google Play không khả dụng",
          };
        case statusCodes.NETWORK_ERROR:
          return {
            success: false,
            data: null,
            error: "Lỗi mạng khi đăng nhập Google",
          };
        default:
          return {
            success: false,
            data: null,
            error: `Lỗi đăng nhập Google: ${error.message}`,
          };
      }
    }

    // Xử lý lỗi "activity is null"
    if (error.message && error.message.includes("activity is null")) {
      // Thử sử dụng getCurrentUser nếu có lỗi activity is null
      try {
        await new Promise((resolve) => setTimeout(resolve, GOOGLE_RETRY_DELAY));

        // Kiểm tra xem GoogleSignin và các phương thức có tồn tại không
        if (GoogleSignin && typeof GoogleSignin.isSignedIn === "function") {
          const isSignedIn = await GoogleSignin.isSignedIn();

          if (isSignedIn && typeof GoogleSignin.getCurrentUser === "function") {
            const currentUser = await GoogleSignin.getCurrentUser();
            if (currentUser) {
              return {
                success: true,
                data: currentUser,
                error: null,
              };
            }
          }
        }
      } catch (secondError) {
        console.log(
          "Second attempt after activity is null error:",
          secondError
        );
      }

      return {
        success: false,
        data: null,
        error: "Không thể khởi tạo đăng nhập Google. Vui lòng thử lại sau.",
      };
    }

    // Lỗi không xác định khác
    return {
      success: false,
      data: null,
      error: `Lỗi không xác định: ${error.message || "Unknown error"}`,
    };
  }
};

/**
 * Hàm kiểm tra nếu người dùng đã đăng nhập trước đó
 * @returns {Promise<{success: boolean, data: object|null}>}
 */
export const getCurrentGoogleUser = async () => {
  try {
    // Thêm timeout từ environment variable
    await new Promise((resolve) => setTimeout(resolve, GOOGLE_SIGNIN_DELAY));

    // Khởi tạo lại GoogleSignin trước khi sử dụng để đảm bảo đã được cấu hình
    const configSuccess = initGoogleSignIn();

    // Thêm timeout sau khi khởi tạo
    await new Promise((resolve) => setTimeout(resolve, GOOGLE_INIT_DELAY));

    // Kiểm tra kỹ xem GoogleSignin có tồn tại không
    if (!GoogleSignin) {
      console.log("GoogleSignin is not defined after initialization");
      return {
        success: false,
        data: null,
      };
    }

    // Đầu tiên thử sử dụng getCurrentUser trực tiếp vì nó ít gây lỗi hơn
    if (typeof GoogleSignin.getCurrentUser === "function") {
      try {
        const currentUser = await GoogleSignin.getCurrentUser();
        if (currentUser && currentUser.user) {
          return {
            success: true,
            data: currentUser,
          };
        }
      } catch (directError) {
        console.log("Direct getCurrentUser error:", directError);
        // Không cần xử lý lỗi ở đây, tiếp tục thử phương pháp khác
      }
    }

    // Chỉ thử sử dụng isSignedIn nếu phương pháp trực tiếp thất bại
    if (typeof GoogleSignin.isSignedIn === "function") {
      try {
        const isSignedIn = await GoogleSignin.isSignedIn();
        if (isSignedIn && typeof GoogleSignin.getCurrentUser === "function") {
          const currentUser = await GoogleSignin.getCurrentUser();
          if (currentUser) {
            return {
              success: true,
              data: currentUser,
            };
          }
        }
      } catch (signInCheckError) {
        console.log("isSignedIn check error:", signInCheckError);
        // Không cần xử lý lỗi ở đây, đã thử phương pháp khác trước đó
      }
    } else {
      console.log(
        "GoogleSignin.isSignedIn is not a function after initialization"
      );
    }

    // Thử phương pháp cuối cùng: tái khởi tạo và thử lại
    try {
      // Tái khởi tạo GoogleSignin với config từ env
      GoogleSignin.configure({
        webClientId: GOOGLE_WEB_CLIENT_ID,
        scopes: GOOGLE_SCOPES,
        iosClientId: GOOGLE_IOS_CLIENT_ID,
        forceCodeForRefreshToken: GOOGLE_FORCE_CODE_FOR_REFRESH_TOKEN,
        offlineAccess: GOOGLE_OFFLINE_ACCESS,
      });

      // Đợi thêm để đảm bảo khởi tạo hoàn tất
      await new Promise((resolve) => setTimeout(resolve, GOOGLE_SIGNIN_DELAY));

      // Thử lại lần cuối
      if (typeof GoogleSignin.getCurrentUser === "function") {
        const lastAttemptUser = await GoogleSignin.getCurrentUser();
        if (lastAttemptUser && lastAttemptUser.user) {
          return {
            success: true,
            data: lastAttemptUser,
          };
        }
      }
    } catch (finalError) {
      console.log("Final attempt error:", finalError);
    }

    // Nếu tất cả các phương pháp đều thất bại
    return {
      success: false,
      data: null,
    };
  } catch (error) {
    console.log("Get current user error:", error);
    return {
      success: false,
      data: null,
    };
  }
};

// ... Phần còn lại của code giữ nguyên như cũ
export const revokeGoogleAccess = async () => {
  try {
    // Kiểm tra xem GoogleSignin có sẵn và đã được khởi tạo chưa
    initGoogleSignIn();
    await new Promise((resolve) => setTimeout(resolve, GOOGLE_INIT_DELAY));

    // Kiểm tra xem người dùng có đăng nhập không
    const isSignedIn = await GoogleSignin.isSignedIn();

    if (isSignedIn) {
      try {
        // Cố gắng thu hồi quyền truy cập trước khi đăng xuất
        if (typeof GoogleSignin.revokeAccess === "function") {
          await GoogleSignin.revokeAccess();
          console.log("Successfully revoked Google access");
        }
      } catch (revokeError) {
        console.log("Error revoking access (continuing):", revokeError);
      }
    }

    // Đăng xuất sau khi thu hồi quyền truy cập
    await signOutGoogle();

    console.log("Complete Google account revocation and logout");
    return true;
  } catch (error) {
    console.log("Error during Google access revocation:", error);
    return false;
  }
};

export default {
  initGoogleSignIn,
  checkPlayServices,
  signOutGoogle,
  performGoogleSignIn,
  getCurrentGoogleUser,
  revokeGoogleAccess,
};
