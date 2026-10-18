import { useCallback, useMemo } from "react"
import { useWhoAmIMutation } from "services/authSlice";
import { logout, saveSession } from "store/slice/auth.slice";
import Cookies from "js-cookie";
import { appConfig } from "config/app.config";
import { useNavigate } from "react-router-dom";
import { BackOfficeRoutesList, bookingEngineMenuList } from "config/sidebarmenu.config";
import { UserRole } from "constants/roles";
import Unauthorized from "pages/Unauthorized/Unauthorized";
import { useDispatch, useSelector } from "react-redux";

const useAuth = () => {
  const users = useSelector((state) => state.auth.user);
  const storeId = useSelector((state) => state.pos.installation.storeId);


  const isLoggedIn = appConfig.getCookie(appConfig.tokenName);
  // Check if admin is logged in: cookie exists and user has Admin role
  const isAdminLoggedIn = Boolean(
    appConfig.getCookie(appConfig.tokenName) && 
    users?.roles?.some(role => role === "Admin")
  );
  
  const dispatch = useDispatch();
  const [whoAmI] = useWhoAmIMutation();
  const Navigate = useNavigate();

  const onRefreshToken = useCallback(async (is_redirect = true) => {
    try {
      const response = await whoAmI();
      if (response.error) {
        return false;
      }
      dispatch(saveSession(response.data));

      if (is_redirect) {
        // Remove special redirect for HOUSEKEEPING (role id 7)
        Navigate("/dashboard");
      }
    } catch {
      /** empty */
    }
  }, []);

  const filterMenuByRoles = (
    menus,
    userRoles
  ) => {
    return menus.map((menu) => {
      // If the menu has a subMenu, filter the subMenu items
      if (menu.subMenu && menu.subMenu.length) {
        const filteredSubMenu = menu.subMenu.map((sub) => {
          const hasAccess =
            !sub.roles || sub.roles.some((role) => userRoles.includes(role));

          return {
            ...sub,
            Component: hasAccess ? sub.Component : Unauthorized,
            isShowSidebar: hasAccess && sub.isShowSidebar !== false,
          };
        });

        // Show parent menu if at least one submenu is accessible
        const isShowSidebar = filteredSubMenu.some((sub) => sub.isShowSidebar);

        return {
          ...menu,
          subMenu: filteredSubMenu,
          isShowSidebar: isShowSidebar,
        };
      }

      // For regular menu items
      const hasAccess =
        !menu.roles || menu.roles.some((role) => userRoles.includes(role));

      return {
        ...menu,
        Component: hasAccess ? menu.Component : Unauthorized,
        isShowSidebar: hasAccess && menu.isShowSidebar !== false,
      };
    });
  };

  const filterMenuList = useMemo(() => {
    // Get user role names
    const userRoles = ['Admin'];

    // Always allow access to User Profile for all users
    const allowedRoles = [...userRoles];

    // Only SUDO gets full access, ADMIN should still be filtered
    if (userRoles.includes(UserRole.SUDO)) {
      return bookingEngineMenuList;
    }

    // Filter menu based on user roles (including ADMIN)
    return filterMenuByRoles(bookingEngineMenuList, allowedRoles);
  }, [users]);

  const filterAdminMenuList = useMemo(() => {
    // Get user role names
    const userRoles = ['Admin'];

    // Always allow access to User Profile for all users
    const allowedRoles = [...userRoles];

    // Only SUDO gets full access, ADMIN should still be filtered
    if (userRoles.includes(UserRole.SUDO)) {
      return BackOfficeRoutesList;
    }

    // Filter menu based on user roles (including ADMIN)
    return filterMenuByRoles(BackOfficeRoutesList, allowedRoles);
  }, [users]);

  const handleLogout = useCallback(() => {
    Cookies.remove(appConfig.tokenName);
    dispatch(logout());
    // Redirect admin users to backoffice login, others to home
    const redirectPath = users?.roles?.some(role => role === "Admin") 
      ? "/backoffice" 
      : "/home";
    setTimeout(() => {
      Navigate(redirectPath);
    }, 1000);
  }, [users, Navigate, dispatch]);

  return {
    users: users ?? null,
    user: users ?? null,
    isLoggedIn: Boolean(isLoggedIn),
    isAdminLoggedIn: Boolean(isAdminLoggedIn),
    isAuthenticated: Boolean(isLoggedIn),
    handleLogout,
    onRefreshToken,
    filterMenuList,
    filterAdminMenuList,
    storeId,
  };
};

export default useAuth;
