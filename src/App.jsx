import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { PublicRouteList } from "routes/index";
import { useAuth } from "hooks";
import NotFound from "components/ui/NotFound/NotFound";
import HeaderContent from "components/ui/Layout/HeaderContent";
import BackOfficeLayout from "components/ui/Layout/Admin/BackOfficeLayout";
import ProtectedRoute from "routes/ProtectedRoute";
import AdminProtectedRoute from "routes/AdminProtectedRoute";
import Loader from "components/elements/Loader/Loader";
import InstallationWizard from "components/POS/InstallationWizard";
import InstallationRoute from "routes/InstallationRoute";
import AuthenticatedRoute from "routes/AuthenticatedRoute";
import { AdminPublicRoutesList } from "config/sidebarmenu.config";
import AdminAuthenticatedRoute from "routes/AdminAuthenticatedRoute";

const App = () => {
  const {
    isLoggedIn,
    isAdminLoggedIn,
    filterMenuList: PrivateRouteList,
    filterAdminMenuList,
  } = useAuth();

  const filterRoutesWithMenuBar = (routes) => {
    return routes
    .filter((route) => route.showMenuBar)
    .map((route) => {
      if (route.subMenu && route.subMenu.length > 0) {
        return {
          ...route,
          subMenu: filterRoutesWithMenuBar(route.subMenu),
        };
      }
      return route;
    });
  };
  const filteredPrivateRoutes = filterRoutesWithMenuBar(PrivateRouteList);
  const filteredBackOfficeRoutes = filterRoutesWithMenuBar(filterAdminMenuList);

  const renderSubMenuRoute = (subRoute, subIndex) => {
    const { subMenu, ...rest } = subRoute;
    const path = rest.path;

    if (subMenu && subMenu.length > 0) {
      return subMenu.map((sub2Route, sub2Index) =>
        renderSubMenuRoute(sub2Route, sub2Index)
      );
    }
    return (
      <Route
        key={subIndex}
        path={path}
        element={
          <React.Suspense fallback={<Loader />}>
            <ProtectedRoute route={rest} />
          </React.Suspense>
        }
      />
    );
  };

  const renderAdminSubMenuRoute = (subRoute, subIndex) => {
    const { subMenu, ...rest } = subRoute;
    const path = rest.path;

    if (subMenu && subMenu.length > 0) {
      return subMenu.map((sub2Route, sub2Index) =>
        renderAdminSubMenuRoute(sub2Route, sub2Index)
      );
    }
    return (
      <Route
        key={subIndex}
        path={path}
        element={
          <React.Suspense fallback={<Loader />}>
            <AdminProtectedRoute route={rest} />
          </React.Suspense>
        }
      />
    );
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />

      <Route
        path="/pos/install"
        element={
          <InstallationRoute>
            <InstallationWizard />
          </InstallationRoute>
        }
      />

      <Route element={<HeaderContent />}>
        <Route element={<AuthenticatedRoute user={isLoggedIn} />}>
          {PublicRouteList.map((route, index) => (
            <Route key={index} path={route.path} {...route} />
          ))}
        </Route>
        {filteredPrivateRoutes.map((route) => {
          const { subMenu, ...rest } = route;

          return subMenu ? (
            <React.Fragment key={rest.path}>
              {/* Render main route */}
              <Route
                path={rest.path}
                element={
                  <React.Suspense fallback={<Loader />}>
                    <ProtectedRoute route={rest} />
                  </React.Suspense>
                }
              />
              {/* Render submenu routes */}
              {subMenu
                .filter((a) => a.showMenuBar === true)
                .map((subRoute, subIndex) =>
                  renderSubMenuRoute(subRoute, subIndex)
                )}
            </React.Fragment>
          ) : (
            <Route
              key={rest.path}
              path={rest.path}
              element={
                <React.Suspense fallback={<Loader />}>
                  <ProtectedRoute route={rest} />
                </React.Suspense>
              }
            />
          );
        })}
      </Route>
      
      <Route element={<BackOfficeLayout />}>
        <Route element={<AdminAuthenticatedRoute user={isAdminLoggedIn} />}>
          {AdminPublicRoutesList.map((route, index) => (
            <Route key={index} path={route.path} {...route} />
          ))}
        </Route>
        {filteredBackOfficeRoutes.map((route) => {
          const { subMenu, ...rest } = route;

          return subMenu ? (
            subMenu
              .filter((a) => a.showMenuBar === true)
              .map((subRoute, subIndex) =>
                renderAdminSubMenuRoute(subRoute, subIndex)
              )
          ) : (
            <Route
              key={rest.path}
              path={rest.path}
              element={
                <React.Suspense fallback={<Loader />}>
                  <AdminProtectedRoute route={rest} />
                </React.Suspense>
              }
            />
          );
        })}
      </Route>
      <Route path="*" Component={NotFound} />
      {/* Backoffice routes are handled by BackOfficeHeaderContent layout */}
    </Routes>
  );
};

export default App;
