import React, { useMemo } from "react";
import { Breadcrumbs, Link, Typography, Box } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

const findFirstNavigablePath = (route) => {
  if (route.path) return route.path;
  if (route.subMenu && route.subMenu.length > 0) {
    for (const sub of route.subMenu) {
      const childPath = findFirstNavigablePath(sub);
      if (childPath) return childPath;
    }
  }
  return null;
};

const findRouteChain = (routeList, pathname, parents = []) => {
  for (const route of routeList) {
    const currentChain = [...parents, route];

    if (route.path) {
      // Exact match? return immediately.
      if (pathname === route.path) {
        return currentChain;
      }

      // Partial match: keep digging to find deeper children before returning this level.
      if (pathname.startsWith(`${route.path}/`) && route.subMenu?.length) {
        const childChain = findRouteChain(
          route.subMenu,
          pathname,
          currentChain
        );
        if (childChain) return childChain;
        return currentChain;
      }
    }

    if (route.subMenu && route.subMenu.length > 0) {
      const childChain = findRouteChain(route.subMenu, pathname, currentChain);
      if (childChain) return childChain;
    }
  }

  return null;
};

const BackOfficeBreadcrumbs = ({ routes = [] }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const breadcrumbs = useMemo(() => {
    const chain = findRouteChain(routes, location.pathname);

    if (!chain) return [];

    return chain
      .map((route) => ({
        label: route.menuTitle,
        path: findFirstNavigablePath(route),
      }))
      .filter((crumb) => Boolean(crumb.label));
  }, [location.pathname, routes]);

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <Box>
      <Breadcrumbs aria-label="breadcrumb" separator="/">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const canNavigate = Boolean(crumb.path) && !isLast;

          if (canNavigate) {
            return (
              <Link
                key={`${crumb.label}-${crumb.path}`}
                underline="hover"
                color="#9b243e"
                onClick={() => navigate(crumb.path)}
                sx={{ cursor: "pointer", fontWeight: 600 }}
              >
                {crumb.label}
              </Link>
            );
          }

          return (
            <Typography
              key={`${crumb.label}-${index}`}
              color="text.primary"
              sx={{ fontWeight: 700 }}
            >
              {crumb.label}
            </Typography>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
};

export default BackOfficeBreadcrumbs;

